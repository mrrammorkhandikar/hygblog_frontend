'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Mail, Phone, User } from 'lucide-react';

/**
 * Hero Section Component with Framer Motion animations
 * This is a client component to handle motion animations
 */
export default function HeroSection() {
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
            sizes="(max-width: 640px) 320px, (max-width: 1024px) 420px, 520px"
            width={520}
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
  );
}