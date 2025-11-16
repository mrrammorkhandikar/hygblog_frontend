'use client';

import React, { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/app/admin/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useUser } from '@/contexts/UserContext';
import { Heart, MessageCircle, User, Settings } from 'lucide-react';

type Comment = {
  id: string;
  post_id: string;
  comment: string;
  username: string;
  email: string;
  liked: number;
  created_at: string;
  updated_at: string;
  unique_user_id?: string;
};

interface EngagementSectionProps {
  postId: string;
}

export default function EngagementSection({ postId }: EngagementSectionProps) {
  const { user, setShowRegistration } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [likesCount, setLikesCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'likes'>('comments');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state - only for comment content (user identity comes from context)
  const [commentText, setCommentText] = useState('');

  // Load engagement data
  const loadEngagementData = async () => {
    try {
      setLoading(true);

      // Load comments
      const commentsData = await apiGet<Comment[]>(`/comments/${postId}`, '');
      setComments(commentsData);

      // Load likes data
      const likesData = await apiGet<{ count: number }>(`/likes/count/${postId}`, '');
      setLikesCount(likesData.count);

      // Check if current user liked (using global user state)
      if (user?.uniqueUserId) {
        const likedData = await apiGet<{ liked: boolean }>(`/likes/check/${postId}/${user.uniqueUserId}`, '');
        setUserLiked(likedData.liked);
      }
    } catch (err: any) {
      console.error('Failed to load engagement data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEngagementData();
  }, [postId, user?.uniqueUserId]);

  // Handle comment submission
  const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user?.isRegistered) {
      setShowRegistration(true);
      return;
    }

    if (!commentText.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await apiPost('/comments', '', {
        post_id: postId,
        comment: commentText.trim(),
        username: user.username,
        email: user.email,
        unique_user_id: user.uniqueUserId
      });

      setSuccess('Comment added successfully!');
      setCommentText('');
      await loadEngagementData();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to add comment:', err);
      setError(err.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle like toggle
  const handleLikeToggle = async () => {
    if (!user?.isRegistered) {
      setShowRegistration(true);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (userLiked) {
        console.log('Attempting to UNLIKE - Calling PUT /likes/unlike/', postId, user.uniqueUserId);
        const result = await apiPut(`/likes/unlike/${postId}/${user.uniqueUserId}`, '');
        console.log('Unlike result:', result);
        setUserLiked(false);
        await loadEngagementData(); // Reload to get updated like status
        setSuccess('Unlike successful!');
        setTimeout(() => setSuccess(null), 2000);
      } else {
        console.log('Attempting to LIKE - Calling POST /likes with:', { post_id: postId, unique_user_id: user.uniqueUserId });
        const result = await apiPost('/likes', '', {
          post_id: postId,
          unique_user_id: user.uniqueUserId
        });
        console.log('Like result:', result);
        setUserLiked(true);
        await loadEngagementData(); // Reload to get updated like status
        setSuccess('Like successful!');
        setTimeout(() => setSuccess(null), 2000);
      }
    } catch (err: any) {
      console.error('Failed to toggle like:', err);
      setError(err.message || 'Failed to update like status');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle comment deletion
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await apiDelete(`/comments/${commentId}`, '');
      await loadEngagementData();
    } catch (err: any) {
      console.error('Failed to delete comment:', err);
      setError('Failed to delete comment');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
      {/* Header with Stats and Tabs */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#0f766e]" style={{ fontFamily: '"Playfair Display", serif' }}>
          Engage with this Post
        </h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Heart className={`w-5 h-5 ${userLiked ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
            <span className="text-slate-600 font-medium">{likesCount}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-slate-400" />
            <span className="text-slate-600 font-medium">{comments.length}</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('comments')}
          className={`flex-1 py-3 px-4 text-center font-medium transition ${
            activeTab === 'comments'
              ? 'text-[#0f766e] border-b-2 border-[#0f766e]'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <MessageCircle className="w-4 h-4 inline mr-2" />
          Comments ({comments.length})
        </button>
        <button
          onClick={() => setActiveTab('likes')}
          className={`flex-1 py-3 px-4 text-center font-medium transition ${
            activeTab === 'likes'
              ? 'text-[#0f766e] border-b-2 border-[#0f766e]'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Heart className={`w-4 h-4 inline mr-2 ${userLiked ? 'fill-red-500 text-red-500' : ''}`} />
          Likes ({likesCount})
        </button>
      </div>

      {error && (
        <div className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-lg">{error}</div>
      )}

      {success && (
        <div className="text-green-600 text-sm mb-4 p-3 bg-green-50 rounded-lg">{success}</div>
      )}

      {/* Comments Tab */}
      {activeTab === 'comments' && (
        <div className="space-y-6">
          {!user?.isRegistered ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">Join the community to leave comments!</p>
              <Button
                onClick={() => setShowRegistration(true)}
                className="bg-[#0f766e] hover:bg-[#0d5e59] text-white rounded-full px-6 py-2"
              >
                Join Now
              </Button>
            </div>
          ) : (
            <>
              {/* Add Comment Form */}
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-[#f0fdfa] rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-[#0f766e]" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{user.username}</p>
                    <p className="text-xs text-slate-500">Posting as {user.username}</p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setShowRegistration(true)}
                    size="sm"
                    variant="outline"
                    className="ml-auto"
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    Update Identity
                  </Button>
                </div>

                <div>
                  <Label htmlFor="comment" className="block text-sm font-medium text-slate-700 mb-2">
                    Share your thoughts
                  </Label>
                  <Textarea
                    id="comment"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    rows={4}
                    required
                    className="w-full"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#0f766e] hover:bg-[#0d5e59] text-white rounded-full px-6 py-2"
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#0f766e]"></div>
                    <p className="mt-2 text-slate-500">Loading comments...</p>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-[#f0fdfa] rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-[#0f766e]" />
                    </div>
                    <p className="text-slate-500">No comments yet. Be the first to comment!</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-[#f0fdfa] rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-[#0f766e]" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{comment.username}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(comment.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-slate-400 hover:text-red-500 text-sm"
                          title="Delete comment"
                        >
                          ×
                        </button>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{comment.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Likes Tab */}
      {activeTab === 'likes' && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#f0fdfa] rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className={`w-8 h-8 ${userLiked ? 'fill-red-500 text-red-500' : 'text-[#0f766e]'}`} />
            </div>
            <h4 className="text-lg font-semibold text-[#0f766e] mb-2">
              {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
            </h4>
            <p className="text-slate-600 mb-6">
              {userLiked ? 'You liked this post!' : 'Show your appreciation with a like!'}
            </p>
          </div>

          {!user?.isRegistered && (
            <div className="text-center">
              <p className="text-slate-600 mb-4">Join the community to like posts!</p>
              <Button
                onClick={() => setShowRegistration(true)}
                className="bg-[#0f766e] hover:bg-[#0d5e59] text-white rounded-full px-6 py-2"
              >
                Join Now
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Like Button (always visible) */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {user?.isRegistered ? (
              <Button
                onClick={handleLikeToggle}
                disabled={submitting}
                className={`rounded-full px-4 py-2 flex items-center space-x-2 ${
                  userLiked
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-[#0f766e] hover:bg-[#0d5e59] text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${userLiked ? 'fill-white' : ''}`} />
                <span>{userLiked ? 'Liked' : 'Like'}</span>
              </Button>
            ) : (
              <Button
                onClick={() => setShowRegistration(true)}
                className="rounded-full px-4 py-2 flex items-center space-x-2 bg-[#0f766e] hover:bg-[#0d5e59] text-white"
              >
                <Heart className="w-4 h-4" />
                <span>Join to Like</span>
              </Button>
            )}
            <span className="text-sm text-slate-500">{likesCount} likes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
