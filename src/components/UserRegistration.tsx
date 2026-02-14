'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/contexts/UserContext';
import { X, User, Mail } from 'lucide-react';

export default function UserRegistration() {
  const { user, showRegistration, setShowRegistration, updateUser } = useUser();
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isUpdating = user?.isRegistered;
  const title = isUpdating ? 'Update Your Identity' : 'Join the Community';
  const subtitle = isUpdating
    ? 'Change your username or email for the community'
    : 'Create your identity to engage';
  const buttonText = isUpdating ? 'Update Identity' : 'Join Community';

  // Pre-fill form with existing user data when updating
  useEffect(() => {
    if (isUpdating && user) {
      setFormData({
        username: user.username,
        email: user.email
      });
    } else {
      setFormData({
        username: '',
        email: ''
      });
    }
  }, [isUpdating, user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.email.trim()) {
      setError('Both username and email are required');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      updateUser(formData.username, formData.email);
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowRegistration(false);
    setFormData({ username: '', email: '' });
    setError(null);
  };

  if (!showRegistration) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#0f766e] rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#0f766e]" style={{ fontFamily: '"Playfair Display", serif' }}>
                {title}
              </h2>
              <p className="text-sm text-slate-600">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-slate-700 mb-4">
              {isUpdating
                ? 'Update your community identity. This will change how you appear on posts and comments site-wide.'
                : 'Enter your details to like posts and leave comments. This information will be saved for your future visits.'
              }
            </p>
          </div>

          {error && (
            <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="reg-username" className="block text-sm font-medium text-slate-700 mb-2">
                Username *
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  id="reg-username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Your display name"
                  className="pl-10 text-black"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="reg-email" className="block text-sm font-medium text-slate-700 mb-2">
                Email *
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  id="reg-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@example.com"
                  className="pl-10 text-black"
                  required
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700"
              >
                Skip for Now
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#0f766e] hover:bg-[#0d5e59] text-white"
              >
                {loading ? (isUpdating ? 'Updating...' : 'Registering...') : buttonText}
              </Button>
            </div>
          </form>

          <div className="text-xs text-slate-500 text-center">
            Your information is used only for engagement features and is stored locally.
          </div>
        </div>
      </div>
    </div>
  );
}
