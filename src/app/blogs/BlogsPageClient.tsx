'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

export default function BlogsPageClient() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7fdff] via-[#eefdfa] to-[#f3fbff]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-[#0f766e] mb-8">Blogs</h1>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-slate-600 mb-6">This is the client-side blogs page component.</p>
          <Button className="bg-[#0f766e] hover:bg-[#0d5e59] text-white">
            Example Button
          </Button>
        </div>
      </div>
    </div>
  );
}