'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';

export default function NewsletterPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [uniqueUserId, setUniqueUserId] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [existingSubscription, setExistingSubscription] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Check if user is already subscribed when page loads
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        // Get user ID from localStorage if available (from "Get in Touch" form)
        const userId = localStorage.getItem('userId') || localStorage.getItem('unique_user_id');
        
        if (userId) {
          setUniqueUserId(userId); // Set the unique user ID for form submission
          
          // Auto-fill form with user details from localStorage
          const storedUser = localStorage.getItem('blogUser');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              if (parsedUser.email) setEmail(parsedUser.email);
              if (parsedUser.username) setName(parsedUser.username);
            } catch (error) {
              console.error('Error parsing stored user:', error);
            }
          }
          
          // Check subscription status using the unique_user_id
          const API_BASE = process.env.NEXT_PUBLIC_ADMIN_API || 'http://localhost:8080';
          const response = await fetch(`${API_BASE}/newsletter/check?unique_user_id=${userId}`);

          if (response.ok) {
            const result = await response.json();
            if (result.isSubscribed) {
              // User is already subscribed - show welcome message with their details
              setExistingSubscription(result.subscriber);
              setIsSubscribed(true); // Show welcome message
              setIsEditing(false); // Don't show edit form yet
            }
          }
        }
      } catch (err) {
        console.error('Failed to check subscription status:', err);
      } finally {
        setIsCheckingSubscription(false);
      }
    };

    checkSubscriptionStatus();
  }, []);

  // Check if email already exists when email changes
  useEffect(() => {
    const checkEmailExists = async () => {
      // Only check if email is valid and not empty
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setEmailExists(false);
        return;
      }

      try {
        setIsCheckingEmail(true);
        const API_BASE = process.env.NEXT_PUBLIC_ADMIN_API || 'http://localhost:8080';
        const response = await fetch(`${API_BASE}/newsletter/check?email=${encodeURIComponent(email)}`);

        if (response.ok) {
          const result = await response.json();
          setEmailExists(result.isSubscribed);
        }
      } catch (err) {
        console.error('Failed to check email existence:', err);
        setEmailExists(false);
      } finally {
        setIsCheckingEmail(false);
      }
    };

    // Debounce the email check to avoid too many API calls
    const debounceTimer = setTimeout(checkEmailExists, 500);

    return () => clearTimeout(debounceTimer);
  }, [email]);

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

    // Check if email already exists
    if (emailExists) {
      setError('This email is already subscribed to our newsletter!');
      setIsSubmitting(false);
      return;
    }

    try {
      // Call backend API
      const API_BASE = process.env.NEXT_PUBLIC_ADMIN_API || 'http://localhost:8080';

      // Include unique_user_id if available (either from localStorage or already set)
      const requestBody: any = { email, name };
      const userId = localStorage.getItem('userId') || localStorage.getItem('unique_user_id') || uniqueUserId;
      if (userId && userId !== '') {
        requestBody.unique_user_id = userId;
      }

      const response = await fetch(`${API_BASE}/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Subscription failed');
      }

      const result = await response.json();

      // Show success message for both new subscriptions and updates
      if (result.message.includes('Already subscribed') || result.message.includes('Successfully subscribed') || result.message.includes('Subscription updated')) {
        setIsSubscribed(true);

        // If this was an edit, reload the subscription data
        if (isEditing) {
          const userId = localStorage.getItem('userId');
          if (userId) {
            const checkResponse = await fetch(`${API_BASE}/newsletter/check?unique_user_id=${userId}`);
            if (checkResponse.ok) {
              const checkResult = await checkResponse.json();
              if (checkResult.isSubscribed) {
                setExistingSubscription(checkResult.subscriber);
              }
            }
          }
        }
      } else {
        // Handle unexpected responses
        setError('Subscription successful, but received unexpected response');
        console.log('Unexpected response:', result);
      }
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
            existingSubscription ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-[#0f766e] rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-[#0f766e] mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
                  Welcome Back!
                </h2>
                <p className="text-lg text-slate-600 mb-2">
                  You're already subscribed to our newsletter with:
                </p>
                <div className="bg-white p-4 rounded-lg inline-block mb-6 shadow-sm">
                  <p className="font-semibold text-[#0f766e]">{existingSubscription.email}</p>
                  {existingSubscription.name && (
                    <p className="text-slate-600">{existingSubscription.name}</p>
                  )}
                </div>
                <p className="text-lg text-slate-600 mb-8">
                  You're all set to receive valuable health insights and wellness tips from Dr. Bushra Mirza.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => {
                      setIsEditing(true);
                      setIsSubscribed(false);
                      setEmail(existingSubscription.email || '');
                      setName(existingSubscription.name || '');
                    }}
                    className="bg-[#0f766e] hover:bg-[#0d5e59] text-white rounded-full px-8 py-3"
                  >
                    Update My Details
                  </Button>
                  <Button
                    onClick={() => (window.location.href = '/')}
                    className="bg-white hover:bg-slate-50 text-[#0f766e] border border-[#0f766e] rounded-full px-8 py-3"
                  >
                    Back to Home
                  </Button>
                </div>
              </motion.div>
            ) : (
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
            )
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
                  {isEditing ? 'Update Your Subscription' : 'Subscribe to Our Newsletter'}
                </h2>
                <p className="text-slate-600">
                  {isEditing ? 'Update your newsletter preferences' : 'Join our community and never miss important health updates'}
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

                {emailExists && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5" />
                    <span>This email is already subscribed to our newsletter!</span>
                  </motion.div>
                )}

                {isCheckingEmail && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 flex items-center gap-3"
                  >
                    <span className="animate-pulse">Checking email...</span>
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
                        <span className="animate-pulse">{isEditing ? 'Updating...' : 'Subscribing...'}</span>
                      </>
                    ) : (
                      isEditing ? 'Update Subscription' : 'Subscribe Now'
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