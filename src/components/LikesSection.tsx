'use client';

import React, { useEffect, useState } from 'react';
import { apiGet, apiPost, apiDelete } from '@/app/admin/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart } from 'lucide-react';

interface LikesSectionProps {
  postId: string;
}

export default function LikesSection({ postId }: LikesSectionProps) {
  const [likesCount, setLikesCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });

  // Load likes data
  const loadLikesData = async () => {
    try {
      setLoading(true);

      // Load likes count
      const countData = await apiGet<{ count: number }>(`/likes/count/${postId}`, '');
      setLikesCount(countData.count);

      // Check if current user liked (using localStorage for demo)
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail) {
        const likedData = await apiGet<{ liked: boolean }>(`/likes/check/${postId}/${userEmail}`, '');
        setUserLiked(likedData.liked);
      }
    } catch (err: any) {
      console.error('Failed to load likes data:', err);
      // Likes functionality might not be available yet
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLikesData();
  }, [postId]);

  // Handle like/unlike
  const handleLikeToggle = async () => {
    const userEmail = localStorage.getItem('userEmail');

    if (!userEmail) {
      setShowForm(true);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (userLiked) {
        // Unlike
        await apiDelete(`/likes/${postId}/${userEmail}`, '');
        setLikesCount(prev => Math.max(0, prev - 1));
        setUserLiked(false);
      } else {
        // Like
        await apiPost('/likes', '', {
          post_id: postId,
          username: localStorage.getItem('userName') || 'Anonymous',
          email: userEmail
        });
        setLikesCount(prev => prev + 1);
        setUserLiked(true);
      }
    } catch (err: any) {
      console.error('Failed to toggle like:', err);
      setError('Failed to update like status');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle form submission for new users
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.email.trim()) {
      setError('Username and email are required');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Save user info to localStorage
      localStorage.setItem('userName', formData.username.trim());
      localStorage.setItem('userEmail', formData.email.trim());

      // Add like
      await apiPost('/likes', '', {
        post_id: postId,
        username: formData.username.trim(),
        email: formData.email.trim()
      });

      setLikesCount(prev => prev + 1);
      setUserLiked(true);
      setShowForm(false);
      setFormData({ username: '', email: '' });
    } catch (err: any) {
      console.error('Failed to add like:', err);
      setError(err.message || 'Failed to add like');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#0f766e]" style={{ fontFamily: '"Playfair Display", serif' }}>
          Likes
        </h3>
        <div className="flex items-center space-x-2">
          <Heart
            className={`w-5 h-5 ${userLiked ? 'fill-red-500 text-red-500' : 'text-slate-400'} transition-colors`}
          />
          <span className="text-slate-600 font-medium">{likesCount}</span>
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm mb-4">{error}</div>
      )}

      {!showForm ? (
        <Button
          onClick={handleLikeToggle}
          disabled={submitting || loading}
          className={`w-full rounded-full ${
            userLiked
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-[#0f766e] hover:bg-[#0d5e59] text-white'
          }`}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Loading...</span>
            </div>
          ) : submitting ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>{userLiked ? 'Unliking...' : 'Liking...'}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Heart className={`w-4 h-4 ${userLiked ? 'fill-white' : ''}`} />
              <span>{userLiked ? 'Unlike' : 'Like'} This Post</span>
            </div>
          )}
        </Button>
      ) : (
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <Label htmlFor="like-username" className="block text-sm font-medium text-slate-700 mb-2">
              Username *
            </Label>
            <Input
              id="like-username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Your name"
              required
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="like-email" className="block text-sm font-medium text-slate-700 mb-2">
              Email *
            </Label>
            <Input
              id="like-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your.email@example.com"
              required
              className="w-full"
            />
          </div>
          <div className="flex space-x-2">
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#0f766e] hover:bg-[#0d5e59] text-white rounded-full"
            >
              {submitting ? 'Liking...' : 'Like Post'}
            </Button>
            <Button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-full"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
