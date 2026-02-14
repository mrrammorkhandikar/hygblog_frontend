'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, User, Facebook, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ContactForm from '@/components/ContactForm';
import HeroSection from '@/components/HeroSection';

type Props = {
  token: string;
};

type Tag = {
  id: string;
  name: string;
  slug?: string;
  tag_type: string;
  description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
};

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

type Shelf = {
  name: string;
  slug: string;
  image: string;
  description: string;
};

export default function HomePageClient({ token = '' }: Partial<Props>) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  
  // Load tags
  const loadTags = async () => {
    try {
      console.log('HomePageClient: Loading tags...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tags?tag_type=regular`);
      const data = await response.json();
      console.log('HomePageClient: Tags response:', data);
      setTags(Array.isArray(data) ? data : []);
      console.log('HomePageClient: Tags state updated');
    } catch (err) {
      console.error('HomePageClient: Failed to load tags:', err);
      setTags([]);
    }
  };
  
  // Load latest blogs
  const loadBlogs = async () => {
    try {
      console.log('Loading blogs in HomePageClient...');
      const response = await fetch('http://localhost:8080/posts?published=true&limit=10&sortBy=date&sortOrder=desc');
      const data = await response.json();
      console.log('Blogs response:', data);
      
      // Handle different response formats
      let blogData: Blog[] = [];
      if (data && typeof data === 'object') {
        if (Array.isArray(data)) {
          // Direct array response
          blogData = data as Blog[];
        } else if (data.data && Array.isArray(data.data)) {
          // Object with data array
          blogData = data.data as Blog[];
        }
      }
      
      console.log('Processed blog data:', blogData);
      setBlogs(blogData.slice(0, 3)); // Get only first 3 blogs
    } catch (err) {
      console.error('Failed to load blogs:', err);
      setBlogs([]);
    }
  };

  useEffect(() => {
    console.log('HomePageClient useEffect triggered');
    loadTags();
    loadBlogs();
  }, []);

  // Group tags by slug
  const groupedTags = tags.reduce((acc, tag) => {
    const slug = tag.slug || 'other';
    if (!acc[slug]) {
      acc[slug] = [];
    }
    acc[slug].push(tag);
    return acc;
  }, {} as Record<string, Tag[]>);
  
  console.log('HomePageClient: All tags:', tags);
  console.log('HomePageClient: Grouped tags:', groupedTags);

  // ShelfCard component with expandable functionality
  function ShelfCard({ shelf, tags, index }: { shelf: Shelf; tags: Tag[]; index: number }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleShelfClick = () => {
      setIsExpanded(!isExpanded);
    };

    const handleTagClick = (tag: Tag) => {
      window.location.href = `/blogs?tag=${tag.slug}`;
    };

    return (
      <div className="relative">
        <motion.div
          whileHover={{ translateY: -6, boxShadow: '0 18px 40px rgba(8, 89, 76, 0.08)' }}
          className="rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-100 cursor-pointer transition"
          onClick={handleShelfClick}
        >
          <img
            src={shelf.image}
            alt={shelf.name}
            className="w-full h-full object-contain rounded-xl"
            loading={index < 1 ? 'eager' : 'lazy'}
            width={400}
            height={400}
          />
          <div className="p-6">
            <h4 className="text-xl font-semibold text-[#115e59] mb-2">{shelf.name}</h4>
            <p className="text-sm text-slate-600 mb-4">{shelf.description}</p>
            <div className="text-sm text-[#0f766e] font-medium">
              {tags.length} topics available
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
              style={{ minHeight: '300px' }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h5 className="text-lg font-semibold text-[#0f766e]">{shelf.name}</h5>
                  <button
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      setIsExpanded(false);
                    }}
                    className="text-slate-400 hover:text-slate-600 text-xl"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto dropdown-scroll">
                  {tags.map((tag, tagIndex) => (
                    <motion.div
                      key={tag.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: tagIndex * 0.05 }}
                      className="cursor-pointer hover:bg-slate-50 rounded p-3 transition-colors border border-slate-100"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleTagClick(tag);
                      }}
                    >
                      <h6 className="text-sm font-medium text-[#115e59]">{tag.name}</h6>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{tag.description ?? 'Explore related articles and tips.'}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-[#f7fdff] via-[#eefdfa] to-[#f3fbff] text-slate-800 antialiased scroll-smooth">
      {/* ---------- Hero ---------- */}
      <HeroSection />

      {/* ---------- About ---------- */}
      <section className="relative bg-white -mt-8 pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Photo */}
            <div className="flex justify-center md:justify-start">
              <img
                src="/Images/dr-bushra-hr-1.jpeg"
                alt="Dr. Bushra Mirza"
                className="w-80 md:w-[28rem] rounded-3xl shadow-2xl border-4 border-[#ecfeff]"
              />
            </div>

            {/* Expanded About text */}
            <div className="prose prose-slate max-w-none">
              <h2 style={{ fontFamily: '"Playfair Display", serif' }} className="text-3xl md:text-4xl text-[#0f766e] font-bold">
                Meet Dr. Bushra Mirza — Dentist, Educator & Hygiene Expert
              </h2>

              <blockquote className="text-lg text-slate-700 mt-3 italic border-l-4 border-[#0f766e] pl-4">
                "For me, hygiene is not just a habit, it's an act of self-respect. Hygiene Shelf is my way of helping every person, especially kids, choose themselves every day."
                <br />— Dr. Bushra Mirza — Dentist, Educator & Hygiene Expert
              </blockquote>

              <p className="text-slate-700 mt-4">
                Hygiene Shelf was born from a simple yet powerful realization during my early journey in healthcare — that prevention is often neglected, misunderstood, and inaccessible to many. As a pediatric dentist and public health professional, I repeatedly witnessed how lack of basic hygiene awareness silently fuels disease, discomfort, and financial burden for families. Through evidence-based articles on oral care, kids hygiene, dental health, and family wellness, I aim to make health education accessible to everyone.
              </p>

              <div className="mt-6">
                <Button className="bg-gradient-to-r from-[#0f766e] to-[#06b6d4] text-white rounded-full px-6 py-2 shadow-lg">
                  Read Dr. Bushra's Story
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

<section className="py-20 bg-gradient-to-b from-[#f7fffd] to-white">
  <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
    <div className="text-center mb-8">
      <h3 className="text-2xl md:text-3xl font-bold text-[#0f766e]" style={{ fontFamily: '"Playfair Display", serif' }}>
        Topics
      </h3>
      <p className="text-sm text-slate-600 mt-2">Explore our health and hygiene topics</p>
    
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[
        {
          name: 'Oral Hygiene Shelf',
          slug: 'Oral Hygiene Shelf',
          image: '/Images/Oral Hygiene Shelf.jpeg',
          description: 'Dental care, oral health, and smile maintenance'
        },
        {
          name: 'Mental Hygiene Shelf',
          slug: 'Mental Hygiene Shelf',
          image: '/Images/Mental Hygiene Shelf.jpeg',
          description: 'Mental health, mindfulness, and emotional wellbeing'
        },
        {
          name: 'Holistic Health Hygiene Shelf',
          slug: 'Holistic Health Hygiene Shelf',
          image: '/Images/Holistic Health Hygiene Shelf.jpeg',
          description: 'Comprehensive wellness and hygiene practices for overall health'
        },
        {
          name: 'Kids Hygiene Shelf',
          slug: 'Kids Hygiene Shelf',
          image: '/Images/Kids Hygiene Shelf.png',
          description: 'Child health, pediatric care, and family wellness routines'
        },
        {
          name: 'Home Hygiene Shelf',
          slug: 'Home Hygiene Shelf',
          image: '/Images/Home Hygiene Shelf.png',
          description: 'Household sanitation, cleaning tips, and home environment health'
        },
        {
          name: 'Food Hygiene Shelf',
          slug: 'Food Hygiene Shelf',
          image: '/Images/Food Hygiene Shelf.png',
          description: 'Nutrition, food safety, and healthy eating habits'
        }
      ].map((shelf, index) => {
        const shelfTags = groupedTags[shelf.slug] || [];
        console.log(`HomePageClient: Shelf: ${shelf.name} (slug: ${shelf.slug})`);
        console.log(`HomePageClient: Matching tags:`, shelfTags);
        
        return (
          <ShelfCard
            key={shelf.slug}
            shelf={shelf}
            tags={shelfTags}
            index={index}
          />
        );
      })}
    </div>
  </div>
</section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-[#0f766e]" style={{ fontFamily: '"Playfair Display", serif' }}>
              Latest from the Blog
            </h3>
            <p className="text-sm text-slate-600 mt-2">Featured reads to start with</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.length > 0 ? (
              blogs.map((blog, i) => (
                <article
                  key={blog.id}
                  className="rounded-3xl overflow-hidden bg-gradient-to-br from-[#f8fafc] to-white border border-slate-100 shadow-lg cursor-pointer transform hover:-translate-y-1 hover:shadow-xl transition"
                  onClick={() => (window.location.href = `/blogs/${blog.slug}`)}
                >
                  <img
                    src={blog.image_url ?? `https://source.unsplash.com/collection/medical-${i + 1}/1200x800?nature,health`}
                    alt={blog.title}
                    className="w-full h-64 object-cover"
                    loading="lazy"
                    width={1200}
                    height={800}
                  />
                  <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-white bg-[#0f766e] px-3 py-1 rounded-full">
                        {blog.category || 'Hygiene'}
                      </span>
                      <span className="text-sm text-slate-500">
                        {new Date(blog.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <h4 className="text-2xl font-semibold text-[#0f766e] mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>
                      {blog.title}
                    </h4>
                    <p className="text-slate-600 mb-5 line-clamp-2">
                      {blog.excerpt || 'Learn more about health and wellness topics.'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-600">Read time: 4 min</div>
                      <div>
                        <Button className="bg-[#0f766e] text-white rounded-full px-4 py-2">Read</Button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              // Fallback placeholder cards
              [1, 2, 3].map((i) => (
                <article
                  key={i}
                  className="rounded-3xl overflow-hidden bg-gradient-to-br from-[#f8fafc] to-white border border-slate-100 shadow-lg cursor-pointer transform hover:-translate-y-1 hover:shadow-xl transition"
                >
                  <img
                    src={`https://source.unsplash.com/collection/medical-${i}/1200x800?nature,health`}
                    alt="Placeholder blog"
                    className="w-full h-64 object-cover"
                    loading="lazy"
                    width={1200}
                    height={800}
                  />
                  <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-white bg-[#0f766e] px-3 py-1 rounded-full">Hygiene</span>
                      <span className="text-sm text-slate-500">Coming Soon</span>
                    </div>
                    <h4 className="text-2xl font-semibold text-[#0f766e] mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>Latest Health Insights</h4>
                    <p className="text-slate-600 mb-5">Stay tuned for our upcoming articles on health and wellness.</p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-600">Read time: 4 min</div>
                      <div>
                        <Button className="bg-[#0f766e] text-white rounded-full px-4 py-2">Explore</Button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="flex justify-center mt-12">
            <button
              onClick={() => (window.location.href = '/blogs')}
              className="bg-gradient-to-r from-[#0f766e] to-[#06b6d4] text-white px-8 py-3 rounded-full shadow-lg transform hover:-translate-y-1 transition"
            >
              More Blogs →
            </button>
          </div>
        </div>
      </section>

      {/* ---------- Contact ---------- */}
      <section id="contact" className="py-20 bg-gradient-to-b from-[#f0fdfa] to-[#f8fcff]">
        <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-[#0f766e]" style={{ fontFamily: '"Playfair Display", serif' }}>Get in touch</h3>
              <p className="text-slate-700">Questions, collaborations, or speaking requests — we'd love to hear from you.</p>

              <div className="space-y-4 text-slate-700">
                <div className="flex items-center gap-3">
                  <Mail className="text-[#0f766e]" />
                  <a href="mailto:drbushra@hygieneshelf.in" className="text-slate-700">drbushra@hygieneshelf.in</a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="text-[#0f766e]" />
                  <span>+91 952 904 5550</span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={() => (window.location.href = '/newsletter')}
                  className="inline-flex items-center justify-center rounded-full px-6 py-3 bg-gradient-to-r from-[#0f766e] to-[#06b6d4] text-white hover:from-[#0d5e59] hover:to-[#0891b2] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl md:justify-start"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Subscribe Our Newsletter
                </Button>
              </div>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>

    </div>
    </>
  );
}
