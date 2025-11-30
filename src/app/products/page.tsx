'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Star, X, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';

/**
 * Modernized product page for "My Toothbrush"
 * - PDF preview embedded in modal (uses book.previewPdf)
 * - Thumbnails + main carousel with keyboard navigation
 * - Smooth framer-motion animations and subtle micro-interactions
 * - Buy button links to provided Topmate URL
 *
 * Drop this file in place of the original page. Make sure assets remain at:
 * public/Books/Mytoothbrush/WhatsApp Image 2025-11-25 at 18.32.57.pdf
 * and the JPEGs referenced in book.images
 */

export default function ProductsPage() {
  const book = {
    title: "My Toothbrush",
    author: "Dr. Bushra Mirza",
    description:
      "A delightful coloring book designed to teach children aged 3-6 about oral hygiene in a fun and interactive way. Through engaging coloring activities featuring friendly toothbrush characters, kids learn the importance of brushing their teeth, proper techniques, and developing healthy habits that last a lifetime.",
    price: "₹299",
    images: [
      "/Books/Mytoothbrush/WhatsApp Image 2025-11-25 at 18.32.57.jpeg",
      "/Books/Mytoothbrush/WhatsApp Image 2025-11-25 at 18.32.58 (1).jpeg",
      "/Books/Mytoothbrush/WhatsApp Image 2025-11-25 at 18.32.58.jpeg",
      "/Books/Mytoothbrush/WhatsApp Image 2025-11-25 at 18.32.59 (1).jpeg",
      "/Books/Mytoothbrush/WhatsApp Image 2025-11-25 at 18.32.59 (2).jpeg",
      "/Books/Mytoothbrush/WhatsApp Image 2025-11-25 at 18.32.59.jpeg"
    ],
    previewPdf: "/Books/Mytoothbrush/WhatsApp Image 2025-11-25 at 18.32.57.pdf",
    buyLink: "https://topmate.io/dr_bushra_mirza/1812065",
    features: [
      "Created by a dentist",
      "Designed for the ages 3–6",
      "Educational colouring activities",
      "Improves early hygiene habits",
      "Fun learning experience"
    ]
  };

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoplayRef = useRef<number | null>(null);

  // Keyboard navigation & ESC to close modals
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') setCurrentIndex((i) => (i + 1) % book.images.length);
      if (e.key === 'ArrowLeft') setCurrentIndex((i) => (i - 1 + book.images.length) % book.images.length);
      if (e.key === 'Escape') {
        setPreviewModalOpen(false);
        setPdfModalOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [book.images.length]);

  // Image starts at index 0 (first image) - no autoplay

  const next = () => setCurrentIndex((i) => (i + 1) % book.images.length);
  const prev = () => setCurrentIndex((i) => (i - 1 + book.images.length) % book.images.length);

  // motion variants
  const container = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.06 } }
  };

  const floatBadge = {
    animate: { y: [0, -8, 0], rotate: [0, 2, 0] },
    transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-[#f8ffff] via-[#f0fdfa] to-[#f6fbff] text-slate-900 antialiased">
        {/* Hero */}
        <section className="min-h-screen flex items-center relative overflow-hidden">
          {/* subtle animated blobs */}
          <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-20">
            <motion.div
              initial={{ scale: 0.9, opacity: 0.2 }}
              animate={{ scale: 1.05, rotate: 6, opacity: 0.25 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute -left-16 -top-8 w-72 h-72 bg-gradient-to-br from-[#61c5d1] to-[#8ee5d9] rounded-full blur-3xl"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0.15 }}
              animate={{ scale: 1.02, rotate: -8, opacity: 0.2 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -right-12 bottom-8 w-56 h-56 bg-gradient-to-tr from-[#a7f3d0] to-[#6ee7b7] rounded-full blur-2xl"
            />
          </div>

          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 w-full z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
              {/* Left - Book mockup + carousel */}
              <motion.div
                className="flex justify-center lg:justify-start"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="relative">
                  {/* 3D-ish mockup */}
                  <motion.div
                    whileHover={{ scale: 1.04, rotateY: 6 }}
                    transition={{ duration: 0.35 }}
                    className="w-80 h-96 md:w-[22rem] md:h-[30rem] rounded-3xl overflow-hidden shadow-2xl"
                    style={{
                      background: 'linear-gradient(160deg,#ffffff, #f6feff)',
                      boxShadow: '0 30px 60px -20px rgba(6, 95, 86, 0.12)'
                    }}
                  >
                    <motion.img
                      key={currentIndex}
                      src={book.images[currentIndex]}
                      alt={`${book.title} preview ${currentIndex + 1}`}
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.45 }}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </motion.div>

                  {/* floating badge */}
                  <motion.div
                    variants={floatBadge}
                    animate="animate"
                    className="absolute -top-4 -right-6 w-12 h-12 bg-[#06b6d4] rounded-full flex items-center justify-center shadow-lg"
                    title="kid-friendly"
                  >
                    <span className="text-white text-xl">✨</span>
                  </motion.div>

                  {/* small thumbnail strip - mobile visible under mockup */}
                  <div className="mt-4 hidden md:flex gap-2 justify-start">
                    {book.images.slice(0, 4).map((src, i) => (
                      <button
                        aria-label={`Thumbnail ${i + 1}`}
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`w-16 h-20 rounded-lg overflow-hidden shadow-sm transform transition-all duration-200 ${
                          i === currentIndex ? 'ring-2 ring-[#0f766e] scale-105' : 'opacity-80 hover:scale-105'
                        }`}
                      >
                        <img src={src} className="w-full h-full object-cover" alt={`thumb-${i}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Right - details & CTA */}
              <motion.div
                className="text-center lg:text-left space-y-6"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.15 }}
              >
                <div>
                  <h1
                    className="text-5xl md:text-6xl font-extrabold text-[#0f766e] mb-4 leading-tight"
                    style={{ fontFamily: '"Playfair Display", serif' }}
                  >
                    {book.title}
                  </h1>
                  <p className="text-lg text-slate-600 mb-3">by {book.author}</p>
                  <p className="text-base md:text-lg text-slate-700 leading-relaxed max-w-lg">
                    {book.description}
                  </p>
                </div>

                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto lg:mx-0"
                >
                  {book.features.slice(0, 4).map((f, idx) => (
                    <motion.div
                      key={idx}
                      className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 shadow-sm border border-teal-50 flex items-center gap-3"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="w-9 h-9 rounded-full bg-[#ecfeff] flex items-center justify-center text-[#0f766e] font-semibold">
                        {idx + 1}
                      </div>
                      <div className="text-sm font-medium text-[#0f766e]">{f}</div>
                    </motion.div>
                  ))}
                </motion.div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                  <Button
                    onClick={() => setPreviewModalOpen(true)}
                    className="flex items-center gap-2 bg-[#0f766e] hover:bg-[#0d5e59] text-white px-6 py-3 rounded-full shadow-lg transform transition-transform hover:-translate-y-0.5"
                  >
                    <BookOpen className="w-5 h-5" />
                    Preview Pages
                  </Button>

                  <a
                    href={book.buyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Buy this book"
                    className="inline-flex"
                  >
                    <Button
                      className="flex items-center gap-2 bg-[#0f766e] hover:bg-[#0d5e59] text-white px-6 py-3 rounded-full shadow-lg transform transition-transform hover:-translate-y-0.5"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Buy Now 
                    </Button>
                  </a>
                </div>

                <div className="flex items-center justify-center lg:justify-start gap-3 pt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-slate-600 ml-2">4.8 (120+ reviews)</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* More books tease */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[#0f766e]" style={{ fontFamily: '"Playfair Display", serif' }}>
                More Books Coming Soon
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto mt-4">
                Stay tuned for more comprehensive health and hygiene guides from Dr. Bushra Mirza
              </p>
            </motion.div>
          </div>
        </section>

        {/* small footer */}
        <footer className="py-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Dr. Bushra Mirza — All rights reserved.
        </footer>

        {/* global styles */}
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&family=Playfair+Display:wght@400;600;700;900&display=swap');
          body { font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }
          .ring-2 { box-shadow: 0 0 0 3px rgba(15,118,110,0.12); }
        `}</style>
      </div>

      {/* Preview modal for images */}
      <AnimatePresence>
        {previewModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewModalOpen(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.28 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h3 className="text-xl font-bold text-[#0f766e]" style={{ fontFamily: '"Playfair Display", serif' }}>
                    {book.title} - Preview
                  </h3>
                  <p className="text-sm text-slate-500">Tap thumbnails or use ← → keys to navigate. Press Esc to close.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setPdfModalOpen(true);
                    }}
                    className="px-4 py-2"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Open PDF
                  </Button>
                  <button
                    onClick={() => setPreviewModalOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-50 transition-colors"
                    aria-label="Close preview"
                  >
                    <X className="w-6 h-6 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* body */}
              <div className="p-6 bg-gray-50">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left main viewer */}
                  <div className="flex-1 flex flex-col items-center">
                    <div className="relative w-full max-w-md aspect-[3/4] bg-white rounded-xl shadow-md overflow-hidden">
                      <img
                        src={book.images[currentIndex]}
                        alt={`Page ${currentIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <button
                          onClick={prev}
                          aria-label="Previous page"
                          className="p-2 bg-white rounded-full shadow transition-all hover:scale-105"
                        >
                          <ChevronLeft className="w-5 h-5 text-[#0f766e]" />
                        </button>
                      </div>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <button
                          onClick={next}
                          aria-label="Next page"
                          className="p-2 bg-white rounded-full shadow transition-all hover:scale-105"
                        >
                          <ChevronRight className="w-5 h-5 text-[#0f766e]" />
                        </button>
                      </div>

                      {/* watermark */}
                      <div className="absolute inset-0 flex items-end justify-center pointer-events-none pb-3">
                        <div className="bg-black/10 text-white px-3 py-1 rounded-full text-xs">PREVIEW</div>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 mt-4">Page {currentIndex + 1} of {book.images.length}</p>
                  </div>

                  {/* Right thumbnails */}
                  <div className="w-full md:w-56 flex md:flex-col gap-3 overflow-auto">
                    {book.images.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`flex-shrink-0 w-20 h-24 md:w-full md:h-20 rounded-lg overflow-hidden shadow-sm transform transition-all ${
                          i === currentIndex ? 'scale-105 ring-2 ring-[#0f766e]' : 'hover:scale-105'
                        }`}
                        aria-current={i === currentIndex ? 'true' : 'false'}
                      >
                        <img src={src} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* footer */}
              <div className="p-6 bg-white border-t border-gray-100 flex items-center justify-between">
                <div className="text-sm text-slate-600">Want the full PDF? Open it or click Buy to purchase the physical book.</div>
                <div className="flex items-center gap-3">
                  <a href={book.buyLink} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-[#0f766e] hover:bg-[#0d5e59] text-white px-4 py-2">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Buy Now
                    </Button>
                  </a>
                  <Button onClick={() => setPreviewModalOpen(false)} className="px-4 py-2">Close</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF modal - uses an embedded iframe for preview */}
      <AnimatePresence>
        {pdfModalOpen && (
          <motion.div
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPdfModalOpen(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <BookOpen className="w-5 h-5 text-[#0f766e]" />
                  <h4 className="font-semibold text-[#0f766e]">{book.title} (PDF Preview)</h4>
                </div>
                <div className="flex items-center gap-3">
                  <a href={book.previewPdf} download className="text-sm text-slate-600 hover:underline">Download PDF</a>
                  <button onClick={() => setPdfModalOpen(false)} className="p-2 rounded-full hover:bg-gray-50">
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="w-full h-[75vh] bg-gray-50">
                {/* embed PDF; uses the same path as book.previewPdf. Make sure the file is in public/Books/... */}
                <iframe
                  title="Book PDF preview"
                  src={book.previewPdf}
                  className="w-full h-full border-0"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
