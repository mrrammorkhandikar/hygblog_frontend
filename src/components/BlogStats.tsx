'use client';

import React, { useEffect, useState } from 'react';
import { apiGet } from '@/app/admin/api';
import { Heart, MessageCircle } from 'lucide-react';

interface BlogStatsProps {
  postId: string;
  showLabels?: boolean;
  className?: string;
}

export default function BlogStats({ postId, showLabels = false, className = '' }: BlogStatsProps) {
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);

        // Load likes count
        const likesData = await apiGet<{ count: number }>(`/likes/count/${postId}`, '');
        setLikesCount(likesData.count);

        // Load comments count
        const commentsData = await apiGet<{ count: number }>(`/comments/count/${postId}`, '');
        setCommentsCount(commentsData.count);
      } catch (err: any) {
        console.error('Failed to load blog stats:', err);
        // Stats might not be available yet, show 0
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [postId]);

  if (loading) {
    return (
      <div className={`flex items-center space-x-4 text-sm text-slate-500 ${className}`}>
        <div className="flex items-center space-x-1">
          <Heart className="w-4 h-4" />
          <span>...</span>
        </div>
        <div className="flex items-center space-x-1">
          <MessageCircle className="w-4 h-4" />
          <span>...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-4 text-sm text-slate-500 ${className}`}>
      <div className="flex items-center space-x-1">
        <Heart className="w-4 h-4" />
        <span>{likesCount}</span>
        {showLabels && <span className="ml-1">likes</span>}
      </div>
      <div className="flex items-center space-x-1">
        <MessageCircle className="w-4 h-4" />
        <span>{commentsCount}</span>
        {showLabels && <span className="ml-1">comments</span>}
      </div>
    </div>
  );
}
