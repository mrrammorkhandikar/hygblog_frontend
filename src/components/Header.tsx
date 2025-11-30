'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // change background on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      {/* Overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className={`fixed top-0 z-50 w-full transition-all duration-500 ${
          scrolled
            ? 'bg-white/50 backdrop-blur-md shadow-md border-b border-teal-50'
            : 'bg-transparent backdrop-blur-none'
        }`}
        suppressHydrationWarning
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo + Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 group"
            onClick={closeMobileMenu}
          >
            <img
              src="/Images/TheToothLogo2.png"
              alt="Dr. Bushra's Dental Care"
              className="h-8 sm:h-9 w-auto transition-transform duration-300 group-hover:scale-105"
            />
            <span
              className="text-base sm:text-lg font-semibold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-teal-700 to-cyan-600"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Hygiene Shelf
            </span>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Nav links */}
          <nav
            className="hidden md:flex items-center gap-8 text-[15px] font-medium text-slate-700"
            style={{ fontFamily: '"Inter", sans-serif' }}
          >
            <Link
              href="/"
              className="relative hover:text-teal-700 transition-colors duration-300 after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-teal-600 hover:after:w-full after:transition-all"
            >
              Home
            </Link>
           
            <Link
              href="/about"
              className="relative hover:text-teal-700 transition-colors duration-300 after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-teal-600 hover:after:w-full after:transition-all"
            >
              About
            </Link>

            <Link
              href="/blogs"
              className="relative hover:text-teal-700 transition-colors duration-300 after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-teal-600 hover:after:w-full after:transition-all"
            >
              Blogs
            </Link>

            <Link
              href="/products"
              className="relative hover:text-teal-700 transition-colors duration-300 after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-teal-600 hover:after:w-full after:transition-all"
            >
              Products
            </Link>

            <Link
              href="/contact"
              className="relative hover:text-teal-700 transition-colors duration-300 after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-teal-600 hover:after:w-full after:transition-all"
            >
              Contact
            </Link>
          </nav>
        </div>

        {/* Mobile menu */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: mobileMenuOpen ? 'auto' : 0,
            opacity: mobileMenuOpen ? 1 : 0
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={`md:hidden overflow-hidden ${
            scrolled ? 'bg-white/95' : 'bg-white/90'
          } border-t border-teal-50`}
        >
          <nav className="px-4 py-4 space-y-3 flex flex-col">
            <Link
              href="/"
              className="text-slate-700 hover:text-teal-700 font-medium py-2 px-3 rounded-lg hover:bg-teal-50 transition-colors"
              style={{ fontFamily: '"Inter", sans-serif' }}
              onClick={closeMobileMenu}
            >
              Home
            </Link>
            <Link
              href="/blogs"
              className="text-slate-700 hover:text-teal-700 font-medium py-2 px-3 rounded-lg hover:bg-teal-50 transition-colors"
              style={{ fontFamily: '"Inter", sans-serif' }}
              onClick={closeMobileMenu}
            >
              Blogs
            </Link>
            <Link
              href="/products"
              className="text-slate-700 hover:text-teal-700 font-medium py-2 px-3 rounded-lg hover:bg-teal-50 transition-colors"
              style={{ fontFamily: '"Inter", sans-serif' }}
              onClick={closeMobileMenu}
            >
              Products
            </Link>
            <Link
              href="/about"
              className="text-slate-700 hover:text-teal-700 font-medium py-2 px-3 rounded-lg hover:bg-teal-50 transition-colors"
              style={{ fontFamily: '"Inter", sans-serif' }}
              onClick={closeMobileMenu}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-slate-700 hover:text-teal-700 font-medium py-2 px-3 rounded-lg hover:bg-teal-50 transition-colors"
              style={{ fontFamily: '"Inter", sans-serif' }}
              onClick={closeMobileMenu}
            >
              Contact
            </Link>
          </nav>
        </motion.div>
      </motion.header>
    </>
  );
}
