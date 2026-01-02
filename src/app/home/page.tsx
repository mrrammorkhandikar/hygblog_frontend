'use client';

import React, { useEffect, useState, useActionState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, User, Facebook, Instagram } from 'lucide-react';
import { apiGet } from '@/app/admin/api';
import { sendContact, type ContactState } from '@/app/contact/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card'; // Card components imported but not used, keeping for completeness
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/contexts/UserContext';

/**
 * Premium Home Page for HygieneShelf.in
 * - Uses Framer Motion for animations
 * - Tailwind for styling (ensure tailwind is configured)
 * - Loads tags with tag_type=regular from /tags endpoint using apiGet
 * - Groups tags by slug and displays each group in a separate row
 *
 * Props:
 * - token: string (for authenticated API calls)
 */
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

export default function HomePage({ token = '' }: Partial<Props>) {
  const { user } = useUser();
  const [tags, setTags] = useState<Tag[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false); // isMobile state removed as it was not fully necessary for the fix
  const [expandedShelf, setExpandedShelf] = useState<string | null>(null);

  // Contact form state
  const [state, formAction] = useActionState<ContactState, FormData>(sendContact, {
    ok: false,
    message: ''
  });

  // loadTags (regular tags only)
  const loadTags = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiGet<Tag[]>('/tags?tag_type=regular', token);
      setTags(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load tags:', err);
      // Don't show error for tags - let the page work without them
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  // loadBlogs (latest featured and published blogs)
  const loadBlogs = async () => {
    try {
      const response = await apiGet<{ data: Blog[] }>('/posts?published=true&featured=true&limit=3&sortBy=date&sortOrder=desc', token);
      setBlogs(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      console.error('Failed to load blogs:', err);
      // Don't show error for blogs, just log it and show fallback
      setBlogs([]);
    }
  };

  // Group tags by slug
  const groupedTags = tags.reduce((acc, tag) => {
    const slug = tag.slug || 'other';
    if (!acc[slug]) {
      acc[slug] = [];
    }
    acc[slug].push(tag);
    return acc;
  }, {} as Record<string, Tag[]>);

  useEffect(() => {
    setIsClient(true);
    // The mobile check logic and its resize listener were removed as they aren't strictly necessary for the image/general speed fix.

    loadTags();
    loadBlogs();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  // Framer motion variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.9 } },
  };

  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
  };

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
          variants={fadeInUp}
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
                    onClick={(e) => {
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
                      onClick={(e) => {
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
    <div className="min-h-screen bg-gradient-to-b from-[#f7fdff] via-[#eefdfa] to-[#f3fbff] text-slate-800 antialiased scroll-smooth">
      {/* ---------- Hero ---------- */}
      <header className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            background:
              'radial-gradient(closest-side, rgba(14,165,233,0.06), transparent 40%), radial-gradient(closest-side, rgba(15,118,110,0.04), transparent 30%)',
          }}
        />
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-20 md:py-28 flex flex-col-reverse md:flex-row items-center gap-12">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="w-full md:w-1/2 z-10"
          >
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight"
              style={{ fontFamily: `"Playfair Display", serif` }}
            >
              <span
                className="bg-clip-text text-transparent bg-gradient-to-r from-[#06b6d4] via-[#0ea5a3] to-[#0f766e] animate-shimmer"
                // gradient shimmer via class below
              >
                Empowering Healthy Living
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 1 }}
              className="mt-6 text-lg text-slate-700 max-w-xl leading-relaxed"
              style={{ fontFamily: `"Inter", sans-serif` }}
            >
              HygieneShelf is a compassionate space for hygiene awareness, practical
              wellness tips, and evidence-based health guidance from{' '}
              <strong className="text-[#0f766e]">Dr. Bushra Mirza</strong>. Learn how
              small, everyday habits can build resilient, healthy lives — in body and mind.
            </motion.p>

            <motion.div
              className="mt-4 flex flex-wrap gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85, duration: 0.7 }}
            >
              <Button
                onClick={() => (window.location.href = '/blogs')}
                className="bg-[#0f766e] hover:bg-[#0d5e59] text-white inline-flex items-center justify-center rounded-full px-[31px] py-[19px] text-[15px] border border-[#c6f6e6] transition shadow-sm"
              >
                Explore Blogs
              </Button>

              <Button
                onClick={() =>
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="inline-flex items-center justify-center rounded-full px-[31px] py-[19px] text-[15px] border border-[#c6f6e6] text-[#0f766e] bg-white/60 hover:bg-white transition shadow-sm"
              >
                Contact Dr. Bushra
              </Button>
            </motion.div>



            {/* subtle trust badges / small text */}
            <motion.div
              className="mt-6 flex flex-wrap items-center gap-6 text-sm text-slate-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.7 }}
            >
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0ea5a3]" />
                <span>Evidence-based tips</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#60a5fa]" />
                <span>Practical routines</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#93c5fd]" />
                <span>Trusted guidance</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Hero Image (floating + parallax-like) - OPTIMIZED */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.1 }}
            className="w-full md:w-1/2 flex justify-center md:justify-end"
          >
            <motion.img
              src="/Images/GodOfHygine.png"
             // srcSet="/Images/GodOfHygine-320w.png 320w, /Images/GodOfHygine-640w.png 640w, /Images/GodOfHygine.png 1000w"
              sizes="(max-width: 640px) 320px, (max-width: 1024px) 420px, 520px"
              width={520} // Set a fixed width/height for aspect ratio to prevent CLS
              height={520}
              alt="God of Hygiene"
              className="w-[320px] md:w-[420px] lg:w-[520px] drop-shadow-2xl select-none"
              animate={{ y: [0, -18, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ willChange: 'transform' }}
              loading="lazy" 
            />
          </motion.div>
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

      {/* ---------- About ---------- */}
      <section className="relative bg-white -mt-8 pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
          >
            {/* Photo */}
            <motion.div variants={fadeInUp} className="flex justify-center md:justify-start">
              <motion.img
              src="/Images/dr-bushra-hr-1.jpeg"
              alt="Dr. Bushra Mirza"
              className="w-80 md:w-[28rem] rounded-3xl shadow-2xl border-4 border-[#ecfeff]"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>

            {/* Expanded About text */}
            <motion.div variants={fadeInUp} className="prose prose-slate max-w-none">
              <h2 style={{ fontFamily: '"Playfair Display", serif' }} className="text-3xl md:text-4xl text-[#0f766e] font-bold">
                Meet Dr. Bushra Mirza — Dentist, educator, and hygiene advocate
              </h2>

              <blockquote className="text-lg text-slate-700 mt-3 italic border-l-4 border-[#0f766e] pl-4">
                "For me, hygiene is not just a habit, it's an act of self-respect. Hygiene Shelf is my way of helping every person choose themselves every day."
                <br />— Dr. Bushra Mirza, Founder
              </blockquote>

              <p className="text-slate-700 mt-4">
                Hygiene Shelf was born from a simple yet powerful realization during my early journey in healthcare — that prevention is often neglected, misunderstood, and inaccessible to many. As a dentist and public health professional, I repeatedly witnessed how lack of basic hygiene awareness silently fuels disease, discomfort, and financial burden for families. 
                {/*<br /> <br /> From classrooms to clinics, from rural camps to urban practices, one truth became clear: people don't always lack resources, they often lack the right information at the right time. That gap between knowledge and action became my inspiration. Hygiene Shelf emerged as a digital space dedicated to simplifying hygiene, skincare, oral care, and wellness — turning expert knowledge into everyday habits for real people. */}
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 "
              style={{ display: 'none' }}>
                <div className="bg-[#f0fdfa] border border-[#e6fffa] p-4 rounded-lg shadow-sm">
                  <h4 className="text-[#0f766e] font-semibold">Experience</h4>
                  <p className="text-sm text-slate-600 mt-1">Clinical practice & public health outreach</p>
                </div>
                <div className="bg-[#eff6ff] border border-[#e6f2ff] p-4 rounded-lg shadow-sm">
                  <h4 className="text-[#0f766e] font-semibold">Approach</h4>
                  <p className="text-sm text-slate-600 mt-1">Practical, human-centered, evidence-backed</p>
                </div>
              </div>


              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
              style={{ display: 'none' }}>
                  <div className="bg-[#f0fdfa] border border-[#e6fffa] p-4 rounded-lg shadow-sm">
                  <h4 className="text-[#0f766e] font-semibold">Medical Expertise</h4>
                  <p className="text-sm text-slate-600 mt-1">Clinical practice in healthcare</p>
                  </div>

                  <div className="bg-[#eff6ff] border border-[#e6f2ff] p-4 rounded-lg shadow-sm">
                  <h4 className="text-[#0f766e] font-semibold">Public Health Focus</h4>
                  <p className="text-sm text-slate-600 mt-1">Community education & outreach</p>
                  </div>

                  <div className="bg-[#fef7ff] border border-[#fdf4ff] p-4 rounded-lg shadow-sm">
                  <h4 className="text-[#0f766e] font-semibold">Data Management</h4>
                  <p className="text-sm text-slate-600 mt-1">Healthcare data analysis & management</p>
                  </div>

              </div>

              <div className="mt-6">
                <Button onClick={() => (window.location.href = '/about')} className="bg-gradient-to-r from-[#0f766e] to-[#06b6d4] text-white rounded-full px-6 py-2 shadow-lg">
                  Read Dr. Bushra's Story
                </Button>
              </div>
            </motion.div>
          </motion.div>
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

    {loading && <p className="text-center text-slate-500">Loading topics…</p>}
    {error && <p className="text-center text-red-500">{error}</p>}

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
      ].map((shelf, index) => (
        <ShelfCard
          key={shelf.slug}
          shelf={shelf}
          tags={groupedTags[shelf.slug] || []}
          index={index}
        />
      ))}
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
                <motion.article
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.12 }}
                  whileHover={{ scale: 1.02 }}
                  className="rounded-3xl overflow-hidden bg-gradient-to-br from-[#f8fafc] to-white border border-slate-100 shadow-lg cursor-pointer"
                  onClick={() => (window.location.href = `/blogs/${blog.slug}`)}
                >
                  <img
                    src={blog.image_url ?? 'https://source.unsplash.com/collection/medical/1200x800?nature,health'}
                    alt={blog.title}
                    className="w-full h-64 object-cover"
                    loading="lazy"
                    width={1200} // Added width/height for CLS
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
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-600">Read time: 4 min</div>
                      <div>
                        <Button className="bg-[#0f766e] text-white rounded-full px-4 py-2">Read</Button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))
            ) : (
              // Fallback placeholder cards if no blogs are loaded
              [1, 2, 3].map((i) => (
                <motion.article
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.12 }}
                  whileHover={{ scale: 1.02 }}
                  className="rounded-3xl overflow-hidden bg-gradient-to-br from-[#f8fafc] to-white border border-slate-100 shadow-lg cursor-pointer"
                  onClick={() => (window.location.href = `/blogs`)}
                >
                  <img
                    src={`https://source.unsplash.com/collection/medical-${i}/1200x800?nature,health`}
                    alt="Placeholder blog"
                    className="w-full h-64 object-cover"
                    loading="lazy"
                    width={1200} // Added width/height for CLS
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
                </motion.article>
              ))
            )}
          </div>

          <div className="flex justify-center mt-12">
            <motion.button
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
              onClick={() => (window.location.href = '/blogs')}
              className="bg-gradient-to-r from-[#0f766e] to-[#06b6d4] text-white px-8 py-3 rounded-full shadow-lg"
            >
              More Blogs →
            </motion.button>
          </div>
        </div>
      </section>

      {/* ---------- Contact ---------- */}
      <section id="contact" className="py-20 bg-gradient-to-b from-[#f0fdfa] to-[#f8fcff]">
        <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} className="space-y-6">
              <h3 className="text-3xl font-bold text-[#0f766e]" style={{ fontFamily: '"Playfair Display", serif' }}>Get in touch</h3>
              <p className="text-slate-700">Questions, collaborations, or speaking requests — we’d love to hear from you.</p>

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
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} className="bg-white px-6 py-8 rounded-2xl shadow-lg">
              {user?.isRegistered && (
                <div className="mb-6 p-4 bg-[#f0fdfa] rounded-lg border border-[#c6f6e6]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0f766e] rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#0f766e]">Welcome back, {user.username}!</p>
                      <p className="text-xs text-slate-600">Your contact details have been pre-filled</p>
                    </div>
                  </div>
                </div>
              )}

              <form action={formAction} className="space-y-4">
                {user?.isRegistered && (
                  <input
                    type="hidden"
                    name="unique_user_id"
                    value={user.uniqueUserId}
                  />
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="home-name" className="text-sm font-medium text-slate-700">Full Name *</Label>
                    <Input
                      id="home-name"
                      name="name"
                      defaultValue={user?.isRegistered ? user.username : ''}
                      placeholder="Your name"
                      className="px-3 py-3"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="home-email" className="text-sm font-medium text-slate-700">Email Address *</Label>
                    <Input
                      id="home-email"
                      name="email"
                      type="email"
                      defaultValue={user?.isRegistered ? user.email : ''}
                      placeholder="your.email@example.com"
                      className="px-3 py-3"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="home-message" className="text-sm font-medium text-slate-700">Message *</Label>
                  <textarea
                    id="home-message"
                    name="message"
                    rows={5}
                    placeholder="How can we help?"
                    className="w-full rounded-lg border border-slate-200 p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-transparent transition"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" className="bg-[#0f766e] hover:bg-[#0d5e59] text-white rounded-full px-6 py-2">Send Message</Button>
                </div>

                {state.message && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg ${
                      state.ok
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}
                  >
                    {state.message}
                  </motion.div>
                )}
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ---------- Extra Styles (fonts, animations) ---------- */}
      <style jsx global>{`
        /* Fonts: Inter + Playfair Display from Google */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&family=Playfair+Display:wght@400;600;700;900&display=swap');

        body { font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }

        /* Shimmer gradient animation used for hero title */
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-shimmer {
          background-size: 200% auto;
          animation: shimmer 4s linear infinite;
        }

        /* Slightly stronger image smoothing */
        img { image-rendering: auto; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

        /* Line clamp utility (if not using plugin) */
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

        /* Reduce mobile touch highlight */
        a, button { -webkit-tap-highlight-color: rgba(0,0,0,0); }

        /* Make sure textarea inherits fonts */
        textarea { font-family: inherit; }

        /* Smooth scroll for anchor links */
        html { scroll-behavior: smooth; }

        /* Modern Custom Scrollbar for Dropdown */
        .dropdown-scroll {
          scrollbar-width: thin;
          scrollbar-color: #0f766e #f1f5f9;
        }

        .dropdown-scroll::-webkit-scrollbar {
          width: 4px;
        }

        .dropdown-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .dropdown-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #0f766e 0%, #06b6d4 100%);
          border-radius: 10px;
          border: none;
          transition: background 0.2s ease;
        }

        .dropdown-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #0d5e59 0%, #0891b2 100%);
          transform: scaleX(1.2);
        }

        .dropdown-scroll::-webkit-scrollbar-thumb:active {
          background: linear-gradient(180deg, #0b4d47 0%, #0e7490 100%);
        }

        .dropdown-scroll::-webkit-scrollbar-corner {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
