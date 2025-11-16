'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Award, Heart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
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
                Meet Dr. Bushra Mirza
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="mt-6 text-lg text-slate-700 max-w-3xl mx-auto leading-relaxed"
              style={{ fontFamily: `"Inter", sans-serif` }}
            >
              A dedicated physician and hygiene advocate committed to empowering families with
              practical, evidence-based health guidance. Through HygineShelf, Dr. Bushra shares
              her expertise to help build healthier, happier lives.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.7 }}
            >
              <Button
                onClick={() => (window.location.href = '/blogs')}
                className="bg-[#0f766e] hover:bg-[#0d5e59] text-white rounded-full px-6 py-3 shadow-lg"
              >
                Explore Her Insights
              </Button>

              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-full px-6 py-3 border border-[#c6f6e6] text-[#0f766e] bg-white/60 hover:bg-white transition shadow-sm"
              >
                Get in Touch
              </a>
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

      {/* ---------- About Section ---------- */}
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
                src="/Images/DrBushraMirza.png"
                alt="Dr. Bushra Mirza"
                className="w-72 md:w-96 rounded-3xl shadow-2xl border-4 border-[#ecfeff]"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>

            {/* About text */}
            <motion.div variants={fadeInUp} className="prose prose-slate max-w-none">
              <h2 style={{ fontFamily: '"Playfair Display", serif' }} className="text-3xl md:text-4xl text-[#0f766e] font-bold mb-6">
                Physician, Educator, and Hygiene Advocate
              </h2>

              <p className="text-lg text-slate-700 mt-3">
                Dr. Bushra Mirza brings together years of clinical experience with a passion for
                public health education. Her medical background, combined with her dedication to
                community wellness, drives her mission to make health information accessible and actionable.
              </p>

              <p className="text-slate-700 mt-4">
                Through HygineShelf, she bridges the gap between medical expertise and everyday life,
                offering practical advice on hygiene, infection prevention, nutrition, and mental wellbeing.
                Her approach focuses on sustainable habits that families can easily incorporate into their routines.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#f0fdfa] border border-[#e6fffa] p-4 rounded-lg shadow-sm">
                  <h4 className="text-[#0f766e] font-semibold">Medical Expertise</h4>
                  <p className="text-sm text-slate-600 mt-1">Clinical practice in healthcare</p>
                </div>
                <div className="bg-[#eff6ff] border border-[#e6f2ff] p-4 rounded-lg shadow-sm">
                  <h4 className="text-[#0f766e] font-semibold">Public Health Focus</h4>
                  <p className="text-sm text-slate-600 mt-1">Community education & outreach</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ---------- Values Section ---------- */}
      <section className="py-20 bg-gradient-to-b from-[#f7fffd] to-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-3xl md:text-4xl font-bold text-[#0f766e] mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
              Core Values
            </h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              The principles that guide Dr. Bushra's work and the foundation of HygineShelf
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div
              variants={fadeInUp}
              className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center"
            >
              <div className="w-16 h-16 bg-[#f0fdfa] rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-[#0f766e]" />
              </div>
              <h4 className="text-xl font-semibold text-[#0f766e] mb-4">Evidence-Based</h4>
              <p className="text-slate-600">
                All advice is grounded in scientific research and clinical experience,
                ensuring reliable and trustworthy guidance.
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center"
            >
              <div className="w-16 h-16 bg-[#f0fdfa] rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-[#0f766e]" />
              </div>
              <h4 className="text-xl font-semibold text-[#0f766e] mb-4">Compassionate</h4>
              <p className="text-slate-600">
                Understanding that health challenges affect real people,
                with empathy and support at the heart of every interaction.
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center"
            >
              <div className="w-16 h-16 bg-[#f0fdfa] rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-[#0f766e]" />
              </div>
              <h4 className="text-xl font-semibold text-[#0f766e] mb-4">Accessible</h4>
              <p className="text-slate-600">
                Making complex health information simple, practical, and available
                to everyone, regardless of background or expertise.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ---------- Contact Section ---------- */}
      <section id="contact" className="py-20 bg-gradient-to-b from-[#f0fdfa] to-[#f8fcff]">
        <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h3 className="text-3xl font-bold text-[#0f766e]" style={{ fontFamily: '"Playfair Display", serif' }}>
                Connect with Dr. Bushra
              </h3>
              <p className="text-slate-700">
                Have questions about health topics, want to collaborate, or need personalized guidance?
                Dr. Bushra would love to hear from you.
              </p>

              <div className="space-y-4 text-slate-700">
                <div className="flex items-center gap-3">
                  <Mail className="text-[#0f766e]" />
                  <a href="mailto:drbushra@hygineshelf.in" className="text-slate-700 hover:text-[#0f766e] transition">
                    drbushra@hygineshelf.in
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="text-[#0f766e]" />
                  <span>+91 98765 43210</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-white px-6 py-8 rounded-2xl shadow-lg"
            >
              <h4 className="text-xl font-semibold text-[#0f766e] mb-6">Send a Message</h4>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your name"
                    className="px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-transparent"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-transparent"
                  />
                </div>
                <textarea
                  rows={5}
                  placeholder="How can we help?"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-transparent resize-none"
                />
                <div className="flex justify-end">
                  <Button className="bg-[#0f766e] hover:bg-[#0d5e59] text-white rounded-full px-6 py-2">
                    Send Message
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ---------- Extra Styles ---------- */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&family=Playfair+Display:wght@400;600;700;900&display=swap');

        body { font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }

        img { image-rendering: auto; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

        a, button { -webkit-tap-highlight-color: rgba(0,0,0,0); }

        textarea { font-family: inherit; }

        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
