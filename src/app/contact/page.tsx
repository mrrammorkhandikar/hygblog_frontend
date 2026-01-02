'use client';

import React, { useActionState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, MessageSquare, Facebook, Instagram } from 'lucide-react';
import { sendContact, type ContactState } from './actions';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { User } from 'lucide-react';

export default function ContactPage() {
  const { user } = useUser();
  const [state, formAction] = useActionState<ContactState, FormData>(sendContact, {
    ok: false,
    message: ''
  });

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
                Get in Touch
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="mt-6 text-lg text-slate-700 max-w-3xl mx-auto leading-relaxed"
              style={{ fontFamily: `"Inter", sans-serif` }}
            >
              Have questions about health topics, need personalized guidance, or want to collaborate?
              Dr. Bushra Mirza and the HygieneShelf team are here to help you on your wellness journey.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.7 }}
            >
              <a
                href="#contact-form"
                className="inline-flex items-center justify-center rounded-full px-6 py-3 border border-[#c6f6e6] text-[#0f766e] bg-white/60 hover:bg-white transition shadow-sm"
              >
                Send a Message
              </a>
              <a
                href="#contact-info"
                className="inline-flex items-center justify-center rounded-full px-6 py-3 bg-[#0f766e] hover:bg-[#0d5e59] text-white transition shadow-lg"
              >
                Contact Details
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

      {/* ---------- Contact Information Section ---------- */}
      <section id="contact-info" className="relative bg-white -mt-8 pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f766e] mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
              Contact Information
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Multiple ways to reach us — choose what works best for you
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
              className="bg-gradient-to-br from-[#f0fdfa] to-[#ecfeff] p-8 rounded-2xl shadow-lg border border-slate-100 text-center"
            >
              <div className="w-16 h-16 bg-[#0f766e] rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#0f766e] mb-4">Email Us</h3>
              <p className="text-slate-600 mb-4">
                Send us an email and we'll get back to you within 24 hours.
              </p>
              <a
                href="mailto:drbushra@hygieneshelf.in"
                className="text-[#0f766e] font-medium hover:text-[#06b6d4] transition"
              >
                drbushra@hygieneshelf.in
              </a>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="bg-gradient-to-br from-[#f0fdfa] to-[#ecfeff] p-8 rounded-2xl shadow-lg border border-slate-100 text-center"
            >
              <div className="w-16 h-16 bg-[#0f766e] rounded-full flex items-center justify-center mx-auto mb-6">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#0f766e] mb-4">Call Us</h3>
              <p className="text-slate-600 mb-4">
                Speak directly with our health experts for immediate assistance.
              </p>
              <a
                href="tel:+919529045550"
                className="text-[#0f766e] font-medium hover:text-[#06b6d4] transition"
              >
                +91 952 904 5550
              </a>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="bg-gradient-to-br from-[#f0fdfa] to-[#ecfeff] p-8 rounded-2xl shadow-lg border border-slate-100 text-center"
            >
              <div className="w-16 h-16 bg-[#0f766e] rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#0f766e] mb-4">Office Hours</h3>
              <p className="text-slate-600 mb-4">
                Our team is available during these hours to assist you.
              </p>
              <div className="text-[#0f766e] font-medium">
                <p>Mon - Fri: 9:00 AM - 6:00 PM</p>
                <p>Sat: 9:00 AM - 2:00 PM</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ---------- Contact Form Section ---------- */}
      <section id="contact-form" className="py-20 bg-gradient-to-b from-[#f7fffd] to-white">
        <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#0f766e] rounded-full flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-[#0f766e]" style={{ fontFamily: '"Playfair Display", serif' }}>
                  Send us a Message
                </h3>
              </div>

              <p className="text-slate-700 text-lg leading-relaxed">
                Whether you have questions about our content, need health advice, or want to collaborate,
                we're here to listen and help. Fill out the form below and we'll respond as soon as possible.
              </p>

              <div className="space-y-4 text-slate-700">
                <div className="flex items-start gap-3">
                  <Mail className="text-[#0f766e] mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Email Response</p>
                    <p className="text-sm text-slate-600">We'll reply to your email within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MessageSquare className="text-[#0f766e] mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Personalized Support</p>
                    <p className="text-sm text-slate-600">Each inquiry receives individual attention</p>
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white px-8 py-10 rounded-2xl shadow-xl border border-slate-100"
            >
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

              <form action={formAction} className="space-y-6">
                {user?.isRegistered && (
                  <input
                    type="hidden"
                    name="unique_user_id"
                    value={user.uniqueUserId}
                  />
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-slate-700">
                      Full Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      defaultValue={user?.isRegistered ? user.username : ''}
                      required
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
                      defaultValue={user?.isRegistered ? user.email : ''}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-transparent transition"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium text-slate-700">
                    Subject
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-transparent transition"
                    placeholder="What's this about?"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-slate-700">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-transparent transition resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-[#0f766e] hover:bg-[#0d5e59] text-white rounded-full px-8 py-3 shadow-lg"
                  >
                    Send Message
                  </Button>
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
