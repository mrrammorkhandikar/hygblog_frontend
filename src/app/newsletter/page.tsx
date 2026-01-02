'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewsletterPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Basic validation
    if (!email) {
      setError('Please enter your email address');
      setIsSubmitting(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In a real implementation, you would call your backend API here
      // const response = await fetch('/api/newsletter/subscribe', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ email, name }),
      // });

      // if (!response.ok) {
      //   throw new Error('Subscription failed');
      // }

      setIsSubscribed(true);
    } catch (err) {
      setError('Subscription failed. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Framer motion variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.9 } },
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
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20 py-20 md:py-28">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight"
              style={{ fontFamily: `"Playfair Display", serif` }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#06b6d4] via-[#0ea5a3] to-[#0f766e]">
                Stay Updated with HygieneShelf
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="mt-6 text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed"
              style={{ fontFamily: `"Inter", sans-serif` }}
            >
              Subscribe to our newsletter and receive the latest health tips, hygiene insights,
              and wellness advice directly in your inbox from Dr. Bushra Mirza.
            </motion.p>
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

      {/* ---------- Subscription Form Section ---------- */}
      <section className="relative bg-white -mt-8 pt-16 pb-20">
        <div className="max-w-2xl mx-auto px-6 md:px-12 lg:px-20">
          {isSubscribed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 bg-[#0f766e] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-[#0f766e] mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
                Thank You for Subscribing!
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                You've successfully subscribed to HygieneShelf newsletter.
                Get ready to receive valuable health insights and wellness tips from Dr. Bushra Mirza.
              </p>
              <Button
                onClick={() => (window.location.href = '/')}
                className="bg-[#0f766e] hover:bg-[#0d5e59] text-white rounded-full px-8 py-3"
              >
                Back to Home
              </Button>
            </motion.div>
          ) : (
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="bg-gradient-to-br from-[#f0fdfa] to-[#ecfeff] p-8 md:p-12 rounded-2xl shadow-lg border border-slate-100"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#0f766e] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-[#0f766e] mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>
                  Subscribe to Our Newsletter
                </h2>
                <p className="text-slate-600">
                  Join our community and never miss important health updates
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-slate-700">
                    Your Name (optional)
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-transparent transition"
                    placeholder="Your full name"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-transparent transition"
                    placeholder="your.email@example.com"
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#0f766e] hover:bg-[#0d5e59] text-white rounded-full px-8 py-3 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-pulse">Subscribing...</span>
                      </>
                    ) : (
                      'Subscribe Now'
                    )}
                  </Button>
                </div>
              </form>

              <div className="mt-8 text-center text-sm text-slate-600">
                <p>By subscribing, you agree to receive email communications from HygieneShelf.</p>
                <p className="mt-2">We respect your privacy and will never share your information.</p>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ---------- Benefits Section ---------- */}
      <section className="py-20 bg-gradient-to-b from-[#f7fffd] to-white">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f766e] mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
              Why Subscribe?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Discover the benefits of joining our newsletter community
            </p>
          </motion.div>

          <motion.div
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.12 } }
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <motion.div
              variants={fadeInUp}
              className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100"
            >
              <div className="w-12 h-12 bg-[#f0fdfa] rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-[#0f766e]" />
              </div>
              <h3 className="text-xl font-semibold text-[#0f766e] mb-3">Expert Health Insights</h3>
              <p className="text-slate-600">
                Receive evidence-based health advice and practical wellness tips from Dr. Bushra Mirza,
                a trusted healthcare professional with years of clinical experience.
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100"
            >
              <div className="w-12 h-12 bg-[#f0fdfa] rounded-full flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-[#0f766e]" />
              </div>
              <h3 className="text-xl font-semibold text-[#0f766e] mb-3">Regular Updates</h3>
              <p className="text-slate-600">
                Get weekly or monthly newsletters (your choice) with the latest articles,
                health trends, and exclusive content you won't find anywhere else.
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100"
            >
              <div className="w-12 h-12 bg-[#f0fdfa] rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-[#0f766e]" />
              </div>
              <h3 className="text-xl font-semibold text-[#0f766e] mb-3">Exclusive Content</h3>
              <p className="text-slate-600">
                Access subscriber-only content including in-depth guides, special offers,
                and early access to new resources and tools.
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100"
            >
              <div className="w-12 h-12 bg-[#f0fdfa] rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-[#0f766e]" />
              </div>
              <h3 className="text-xl font-semibold text-[#0f766e] mb-3">Community Access</h3>
              <p className="text-slate-600">
                Be part of a growing community focused on health and wellness.
                Get invitations to special events, webinars, and Q&A sessions.
              </p>
            </motion.div>
          </motion.div>
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
