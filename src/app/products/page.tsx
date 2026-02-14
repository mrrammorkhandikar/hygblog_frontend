'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Star, X, ChevronLeft, ChevronRight, ShoppingCart, Loader2 } from 'lucide-react';
import { apiGet } from '../admin/api';

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

type Product = {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  price_numeric: number | null;
  price_text: string | null;
  images: any[] | null;
  preview_pdf: string | null;
  buy_link: string | null;
  features: any[] | null;
  metadata: any | null;
  rating: any[] | null;
  created_at: string;
  updated_at: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [productImageIndices, setProductImageIndices] = useState<{[productId: string]: number}>({});
  const [productRatings, setProductRatings] = useState<{[productId: string]: { average: number; total: number; userRating: number | null }}>({});
  const autoplayRef = useRef<number | null>(null);

  // Generate a unique user ID (in a real app, this would come from authentication)
  const getUserId = () => {
    let userId = localStorage.getItem('user_id');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('user_id', userId);
    }
    return userId;
  };

  // Submit a rating for a product
  const submitRating = async (productId: string, rating: number) => {
    try {
      const userId = getUserId();
      console.log('Submitting rating:', { productId, userId, rating });

      const response = await fetch('/api/products/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          user_id: userId,
          username: 'Anonymous User', // In a real app, get from auth
          email: '', // In a real app, get from auth
          rating: rating
        })
      });

      console.log('Rating response status:', response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = `Rating failed (${response.status})`;
        try {
          const errorData = await response.json();
          console.error('Server error response:', errorData);
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
          // Try to get text response
          try {
            const textResponse = await response.text();
            console.error('Raw error response:', textResponse);
          } catch (textError) {
            console.error('Could not get text response either:', textError);
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Rating submitted successfully:', result);

      // Update local state
      setProductRatings(prev => ({
        ...prev,
        [productId]: {
          average: result.average_rating,
          total: result.total_ratings,
          userRating: rating
        }
      }));

    } catch (error) {
      console.error('Error submitting rating:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit rating. Please try again.';
      // Could show a toast notification here instead of just console logging
      alert(`Rating Error: ${errorMessage}`);
    }
  };

  // Fetch ratings for all products
  const fetchRatingsForProducts = async () => {
    if (products.length === 0) return;

    const userId = getUserId();

    for (const product of products) {
      try {
        const response = await fetch(`/api/products/rating/${product.id}/${userId}`);
        if (response.ok) {
          const ratingData = await response.json();
          setProductRatings(prev => ({
            ...prev,
            [product.id]: {
              average: ratingData.average_rating,
              total: ratingData.total_ratings,
              userRating: ratingData.user_rating
            }
          }));
        }
      } catch (error) {
        console.error(`Error fetching rating for product ${product.id}:`, error);
      }
    }
  };

  // Fetch ratings when products are loaded
  useEffect(() => {
    if (products.length > 0) {
      fetchRatingsForProducts();
    }
  }, [products]);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching products from /products/published...');
        const data = await apiGet<Product[]>('/products/published');
        console.log('Products data received:', data);
        setProducts(data || []);
        if (data && data.length > 0) {
          setCurrentProduct(data[0]);
        }
      } catch (err: any) {
        console.error('Failed to load products:', err);
        console.error('Error details:', err);

        // More specific error handling
        let errorMessage = 'Failed to load products. Please try again later.';

        if (err.message && err.message.includes('<!DOCTYPE')) {
          errorMessage = 'Backend server appears to be unavailable. Please check if the server is running.';
        } else if (err.message) {
          errorMessage = `Failed to load products: ${err.message}`;
        } else if (err.status) {
          errorMessage = `Server error (${err.status}): Failed to load products.`;
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Transform product data to match UI expectations
  const book = currentProduct ? {
    title: currentProduct.title,
    author: currentProduct.author || "Dr. Bushra Mirza",
    description: currentProduct.description || "",
    price: currentProduct.price_text || (currentProduct.price_numeric ? `₹${currentProduct.price_numeric}` : "₹299"),
    images: currentProduct.images ? currentProduct.images
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(img => img.path.startsWith('http') ? img.path : `/Books/${img.path}`) : [],
    previewPdf: currentProduct.preview_pdf ? (currentProduct.preview_pdf.startsWith('http') ? currentProduct.preview_pdf : `/Books/${currentProduct.preview_pdf}`) : "",
    buyLink: currentProduct.buy_link || "https://topmate.io/dr_bushra_mirza/1812065",
    features: currentProduct.features || []
  } : null;

  // Keyboard navigation & ESC to close modals
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (book && currentProduct) {
        const currentIdx = productImageIndices[currentProduct.id] || 0;
        if (e.key === 'ArrowRight') {
          setProductImageIndices(prev => ({
            ...prev,
            [currentProduct.id]: (currentIdx + 1) % book.images.length
          }));
        }
        if (e.key === 'ArrowLeft') {
          setProductImageIndices(prev => ({
            ...prev,
            [currentProduct.id]: (currentIdx - 1 + book.images.length) % book.images.length
          }));
        }
      }
      if (e.key === 'Escape') {
        setPreviewModalOpen(false);
        setPdfModalOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [book, currentProduct, productImageIndices]);

  // Image starts at index 0 (first image) - no autoplay

  const next = () => {
    if (book && currentProduct) {
      const currentIdx = productImageIndices[currentProduct.id] || 0;
      setProductImageIndices(prev => ({
        ...prev,
        [currentProduct.id]: (currentIdx + 1) % book.images.length
      }));
    }
  };
  const prev = () => {
    if (book && currentProduct) {
      const currentIdx = productImageIndices[currentProduct.id] || 0;
      setProductImageIndices(prev => ({
        ...prev,
        [currentProduct.id]: (currentIdx - 1 + book.images.length) % book.images.length
      }));
    }
  };

  // motion variants
  const container = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.06 } }
  };

  const floatBadge = {
    animate: { y: [0, -8, 0], rotate: [0, 2, 0] },
    transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8ffff] via-[#f0fdfa] to-[#f6fbff] text-slate-900 antialiased flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#0f766e]" />
          <p className="text-slate-600">Loading products...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8ffff] via-[#f0fdfa] to-[#f6fbff] text-slate-900 antialiased flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-lg">Failed to load products</div>
          <p className="text-slate-600">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[#0f766e] hover:bg-[#0d5e59] text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // No products available
  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8ffff] via-[#f0fdfa] to-[#f6fbff] text-slate-900 antialiased flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-slate-600 text-lg">No products available</div>
          <p className="text-slate-500">Check back later for new products from Dr. Bushra Mirza</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-[#f8ffff] via-[#f0fdfa] to-[#f6fbff] text-slate-900 antialiased">
        {/* Hero */}
        <section className="min-h-[80vh] md:min-h-screen flex items-center relative overflow-hidden">
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

          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 w-full z-10 py-20">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <h1
                className="text-5xl md:text-6xl font-extrabold text-[#0f766e] mb-4 leading-tight"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                Our Products
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Discover comprehensive health and hygiene guides from Dr. Bushra Mirza
              </p>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-16"
            >
              {products.map((product, idx) => {
                const productBook = {
                  title: product.title,
                  author: product.author || "Dr. Bushra Mirza",
                  description: product.description || "",
                  price: product.price_text || (product.price_numeric ? `₹${product.price_numeric}` : "₹299"),
                  images: product.images ? product.images
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map(img => `${img.path}`) : [],
                  previewPdf: product.preview_pdf ? `${product.preview_pdf}` : "",
                  buyLink: product.buy_link || "https://topmate.io/dr_bushra_mirza/1812065",
                  features: product.features || []
                };

                const currentImageIndex = productImageIndices[product.id] || 0;

                return (
                  <motion.div
                    key={product.id}
                    className="min-h-screen flex items-center"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: idx * 0.2 }}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
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
                            className="w-64 h-80 sm:w-72 sm:h-88 md:w-[22rem] md:h-[30rem] rounded-3xl overflow-hidden shadow-2xl"
                            style={{
                              background: 'linear-gradient(160deg,#ffffff, #f6feff)',
                              boxShadow: '0 30px 60px -20px rgba(6, 95, 86, 0.12)'
                            }}
                          >
                            <motion.img
                              key={currentImageIndex}
                              src={productBook.images[currentImageIndex]}
                              alt={`${productBook.title} preview ${currentImageIndex + 1}`}
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
                          <div className="mt-4 flex gap-2 justify-center overflow-x-auto pb-2">
                            {productBook.images.slice(0, 6).map((src, i) => (
                              <button
                                aria-label={`Thumbnail ${i + 1}`}
                                key={i}
                                onClick={() => {
                                  setProductImageIndices(prev => ({
                                    ...prev,
                                    [product.id]: i
                                  }));
                                }}
                                className={`flex-shrink-0 w-12 h-16 sm:w-14 sm:h-18 md:w-16 md:h-20 rounded-lg overflow-hidden shadow-sm transform transition-all duration-200 ${
                                  i === currentImageIndex ? 'ring-2 ring-[#0f766e] scale-105' : 'opacity-80 hover:scale-105'
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
                            {productBook.title}
                          </h1>
                          <p className="text-lg text-slate-600 mb-3">by {productBook.author}</p>
                          <p className="text-base md:text-lg text-slate-700 leading-relaxed max-w-lg">
                            {productBook.description}
                          </p>
                        </div>

                        <motion.div
                          variants={container}
                          initial="hidden"
                          animate="show"
                          className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto lg:mx-0"
                        >
                          {productBook.features.slice(0, 4).map((f, idx) => (
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

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4 w-full max-w-sm mx-auto lg:max-w-none lg:mx-0">
                          <Button
                            onClick={() => {
                              console.log('Preview clicked for product:', product);
                              console.log('Product images:', product.images);
                              setCurrentProduct(product);
                              setProductImageIndices(prev => ({
                                ...prev,
                                [product.id]: 0
                              }));
                              setPreviewModalOpen(true);
                            }}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0f766e] hover:bg-[#0d5e59] text-white px-6 py-4 sm:py-3 rounded-full shadow-lg transform transition-transform hover:-translate-y-0.5 min-h-[48px] sm:min-h-0 text-base sm:text-sm font-medium sm:font-normal"
                          >
                            <BookOpen className="w-5 h-5 flex-shrink-0" />
                            Preview Pages
                          </Button>

                          <a
                            href={productBook.buyLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Buy this book"
                            className="w-full sm:w-auto inline-flex"
                          >
                            <Button
                              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0f766e] hover:bg-[#0d5e59] text-white px-6 py-4 sm:py-3 rounded-full shadow-lg transform transition-transform hover:-translate-y-0.5 min-h-[48px] sm:min-h-0 text-base sm:text-sm font-medium sm:font-normal"
                            >
                              <ShoppingCart className="w-5 h-5 flex-shrink-0" />
                              Buy Now
                            </Button>
                          </a>
                        </div>

                        {/* Rating Section 
                        <div className="flex items-center justify-center lg:justify-start gap-3 pt-2">
                         
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => submitRating(product.id, star)}
                                className="focus:outline-none"
                                title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                              >
                                <Star
                                  className={`w-5 h-5 transition-colors ${
                                    star <= (productRatings[product.id]?.userRating || 0)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : star <= (productRatings[product.id]?.average || 0)
                                      ? 'fill-yellow-200 text-yellow-200'
                                      : 'text-gray-300 hover:text-yellow-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>

                          
                          <div className="text-sm text-slate-600">
                            {productRatings[product.id] ? (
                              <>
                                <span className="font-medium text-yellow-600">
                                  {productRatings[product.id].average.toFixed(1)}
                                </span>
                                <span className="ml-1">
                                  ({productRatings[product.id].total} rating{productRatings[product.id].total !== 1 ? 's' : ''})
                                </span>
                                {productRatings[product.id].userRating && (
                                  <span className="ml-2 text-green-600 text-xs">
                                    (You rated {productRatings[product.id].userRating})
                                  </span>
                                )}
                              </>
                            ) : (
                              <span>No ratings yet</span>
                            )}
                          </div>
                        </div>
                        */}
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
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
                More Products Coming Soon
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
              className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden mx-4 sm:mx-auto"
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
                        src={book.images[productImageIndices[currentProduct?.id || ''] || 0]}
                        alt={`Page ${(productImageIndices[currentProduct?.id || ''] || 0) + 1}`}
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

                    <p className="text-sm text-slate-600 mt-4">Page {(productImageIndices[currentProduct?.id || ''] || 0) + 1} of {book.images.length}</p>
                  </div>

                  {/* Right thumbnails */}
                  <div className="w-full md:w-56 flex md:flex-col gap-3 overflow-auto">
                    {book.images.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (currentProduct) {
                            setProductImageIndices(prev => ({
                              ...prev,
                              [currentProduct.id]: i
                            }));
                          }
                        }}
                        className={`flex-shrink-0 w-20 h-24 md:w-full md:h-20 rounded-lg overflow-hidden shadow-sm transform transition-all ${
                          i === (productImageIndices[currentProduct?.id || ''] || 0) ? 'scale-105 ring-2 ring-[#0f766e]' : 'hover:scale-105'
                        }`}
                        aria-current={i === (productImageIndices[currentProduct?.id || ''] || 0) ? 'true' : 'false'}
                      >
                        <img src={src} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* footer */}
              <div className="p-6 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-600 text-center sm:text-left">Want the full PDF? Open it or click Buy to purchase the physical book.</div>
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden mx-4 sm:mx-auto"
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
                {book.previewPdf ? (
                  <iframe
                    title="Book PDF preview"
                    src={book.previewPdf}
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <BookOpen className="w-16 h-16 text-slate-400 mx-auto" />
                      <p className="text-slate-500">PDF preview not available</p>
                      <p className="text-sm text-slate-400">Please check back later or contact support</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}