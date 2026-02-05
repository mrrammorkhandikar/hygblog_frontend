'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { apiGet } from '@/app/admin/api';
import { Button } from '@/components/ui/button';
import CategoriesBox from '@/components/CategoriesBox';
import GoogleAdsBox from '@/components/GoogleAdsBox';
import BlogStats from '@/components/BlogStats';

type Blog = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  category?: string;
  tags?: string[];
  image_url?: string;
  date: string;
  published: boolean;
  featured: boolean;
  author?: string;
  created_at: string;
  updated_at: string;
};

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleBlogs, setVisibleBlogs] = useState(6);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [showLoadMore, setShowLoadMore] = useState(true);

  // Load blogs from API
  const loadBlogs = async (category?: string) => {
    try {
      setLoading(true);
      setError(null);
      let url = '/posts?published=true&sortBy=date&sortOrder=desc';
      if (category) {
        url += `&category=${encodeURIComponent(category)}`;
      }
      const response = await apiGet<{ data: Blog[] }>(url, '');
      setBlogs(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      console.error('Failed to load blogs:', err);
      setError('Failed to load blogs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check URL parameters for category
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    setSelectedCategory(categoryParam);
    loadBlogs(categoryParam || undefined);
  }, []);

  // Filter blogs based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredBlogs(blogs);
      setVisibleBlogs(6);
    } else {
      const filtered = blogs.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBlogs(filtered);
      setVisibleBlogs(Math.min(6, filtered.length));
    }
  }, [searchTerm, blogs]);

  // Check if we need to show scroll button
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;
      setShowScrollButton(scrollPosition < pageHeight - 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load more blogs function
  const loadMoreBlogs = () => {
    const newVisibleCount = visibleBlogs + 6;
    if (newVisibleCount >= filteredBlogs.length) {
      setShowLoadMore(false);
    }
    setVisibleBlogs(newVisibleCount);
  };

  // Scroll to bottom function
  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  // Framer motion variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.9 } },
  };

  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7fdff] via-[#eefdfa] to-[#f3fbff] text-slate-800 antialiased">
      {/* ---------- Hero Section ---------- */}
      <header className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            background:
              'radial-gradient(closest-side, rgba(14,165,233,0.06), transparent 40%), radial-gradient(closest-side, rgba(15,118,110,0.04), transparent 30%)',
          }}
        />
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-20 md:py-28">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight"
              style={{ fontFamily: `"Playfair Display", serif` }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#06b6d4] via-[#0ea5a3] to-[#0f766e]">
                Health & Hygiene Insights
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="mt-6 text-lg text-slate-700 max-w-3xl mx-auto leading-relaxed"
              style={{ fontFamily: `"Inter", sans-serif` }}
            >
              Discover evidence-based articles, practical tips, and expert guidance from Dr. Bushra Mirza.
              From daily hygiene routines to wellness strategies, find the knowledge you need for a healthier life.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.7 }}
            >
              <Button
                              onClick={() => (window.location.href = '/blogs')}
                              className="bg-[#0f766e] hover:bg-[#0d5e59] text-white inline-flex items-center justify-center rounded-full px-[31px] py-[19px] text-[15px] border border-[#c6f6e6] transition shadow-sm"
                            >
                              Browse Articles
                            </Button>
              
                            <Button
                              onClick={() =>
                                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
                              }
                              className="inline-flex items-center justify-center rounded-full px-[31px] py-[19px] text-[15px] border border-[#c6f6e6] text-[#0f766e] bg-white/60 hover:bg-white transition shadow-sm"
                            >
                              About Dr. Bushra
                            </Button>
            </motion.div>
          </div>
        </div>

        {/* Decorative gradient divider */}
        <div className="h-20 -mt-6 pointer-events-none">
          <svg viewBox="0 0 1440 120" className="w-full block" preserveAspectRatio="none">
            <defs>
              <linearGradient id="g1" x1="0" x2="1">
                <stop offset="0%" stopColor="#ecfeff" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
            </defs>
            <path
              d="M0,40 C240,100 480,0 720,40 C960,80 1200,20 1440,60 L1440 120 L0 120 Z"
              fill="url(#g1)"
              opacity="0.95"
            />
          </svg>
        </div>
      </header>

      {/* ---------- Blogs Section ---------- */}
      <section id="blogs" className="relative bg-white -mt-8 pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f766e] mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
              Latest Articles
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Expert health and hygiene guidance on oral care, kids hygiene, mental wellness, and family health practices
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <div className="max-w-md ml-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search blogs by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-3 rounded-full border border-slate-200 focus:border-[#0f766e] focus:ring-2 focus:ring-[#06b6d4] focus:outline-none shadow-sm transition"
                  style={{ fontFamily: '"Inter", sans-serif' }}
                />
                <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - will appear first on mobile */}
            <div className="w-full lg:w-80 flex-shrink-0 lg:order-2">
              <CategoriesBox
                onCategoryClick={(categoryName) => {
                  setSelectedCategory(categoryName);
                  loadBlogs(categoryName);
                  // Update URL without page reload
                  const newUrl = categoryName ? `/blogs?category=${encodeURIComponent(categoryName)}` : '/blogs';
                  window.history.pushState({}, '', newUrl);
                }}
              />
            </div>

            {/* Main Content - will appear second on mobile */}
            <div className="flex-1 lg:order-1">
              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f766e]"></div>
                  <p className="mt-4 text-slate-500">Loading articles...</p>
                </div>
              )}

              {error && (
                <div className="text-center py-12">
                  <p className="text-red-500 mb-4">{error}</p>
                  <Button onClick={() => loadBlogs(selectedCategory || undefined)} className="bg-[#0f766e] hover:bg-[#0d5e59] text-white rounded-full px-6 py-2">
                    Try Again
                  </Button>
                </div>
              )}

              {!loading && !error && (
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                  {filteredBlogs.length > 0 ? (
                    filteredBlogs.slice(0, visibleBlogs).map((blog, i) => (
                      <motion.article
                        key={blog.id}
                        variants={fadeInUp}
                        whileHover={{ translateY: -6, boxShadow: '0 18px 40px rgba(8, 89, 76, 0.08)' }}
                        className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 cursor-pointer transition group"
                        onClick={() => (window.location.href = `/blogs/${blog.slug}`)}
                      >
                        <img
                          src={blog.image_url ?? 'https://source.unsplash.com/collection/medical/800x600?nature,health'}
                          alt={blog.title}
                          className="w-full h-40 sm:h-48 object-cover"
                          loading="lazy"
                        />
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-white bg-[#0f766e] px-3 py-1 rounded-full">
                              {blog.category || 'Health'}
                            </span>
                            <div className="flex items-center text-sm text-slate-500">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(blog.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                          <h3 className="text-xl font-semibold text-[#0f766e] mb-3 group-hover:text-[#06b6d4] transition" style={{ fontFamily: '"Playfair Display", serif' }}>
                            {blog.title}
                          </h3>
                          <p className="text-slate-600 mb-4 line-clamp-3">
                            {blog.excerpt || 'Explore this insightful article on health and wellness.'}
                          </p>
                          <div className="flex items-center justify-between">
                            <BlogStats postId={blog.id} />
                            <div className="flex items-center text-[#0f766e] font-medium group-hover:text-[#06b6d4] transition">
                              <span>Read more</span>
                              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
                            </div>
                          </div>
                        </div>
                      </motion.article>
                    ))
                  ) : selectedCategory ? (
                    // No blogs in selected category
                    <div className="col-span-full text-center py-16">
                      <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 bg-[#f0fdfa] rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-[#0f766e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-[#0f766e] mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>
                          No Blogs in This Category
                        </h3>
                        <p className="text-slate-600 mb-4">
                          We will be here soon with amazing content for this category!
                        </p>
                        <Button
                          onClick={() => {
                            setSelectedCategory(null);
                            loadBlogs();
                            window.history.pushState({}, '', '/blogs');
                          }}
                          className="bg-[#0f766e] hover:bg-[#0d5e59] text-white rounded-full px-6 py-2"
                        >
                          View All Blogs
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // No blogs at all (shouldn't happen in normal case)
                    <div className="col-span-full text-center py-16">
                      <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 bg-[#f0fdfa] rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-[#0f766e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-[#0f766e] mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>
                          No Blogs Available
                        </h3>
                        <p className="text-slate-600">
                          Check back soon for new content!
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {!loading && !error && visibleBlogs < filteredBlogs.length && showLoadMore && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="flex justify-center mt-12"
                >
                  <Button
                    onClick={loadMoreBlogs}
                    className="bg-gradient-to-r from-[#0f766e] to-[#06b6d4] text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition"
                  >
                    Load More Articles
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Floating Down Arrow Button */}
            {showScrollButton && filteredBlogs.length > visibleBlogs && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed bottom-8 right-8 z-50"
              >
                <Button
                  onClick={scrollToBottom}
                  className="bg-[#0f766e] hover:bg-[#0d5e59] text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition flex items-center justify-center"
                  aria-label="Scroll to load more articles"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </Button>
              </motion.div>
            )}
          </div>

          {/* Ads Section - appears only on mobile at the bottom */}
          <div className="lg:hidden mt-12">
            <GoogleAdsBox />
          </div>
        </div>
      </section>

      {/* ---------- Extra Styles ---------- */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&family=Playfair+Display:wght@400;600;700;900&display=swap');

        body { font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }

        img { image-rendering: auto; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

        a, button { -webkit-tap-highlight-color: rgba(0,0,0,0); }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}