import { Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative w-full bg-gradient-to-b from-white to-[#f8fcff] border-t border-teal-50">
      <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-600">
        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <img
              src="/Images/thelogohy.jpeg"
              alt="Dr. Bushra's Dental Care"
              className="h-12 sm:h-12 w-auto transition-transform duration-300 group-hover:scale-105"
            />
          <div className="flex flex-col">
            <span
              className="text-base font-semibold text-teal-800"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Hygiene Shelf
            </span>
            <span className="text-xs text-slate-500">
              Compassion | Expertise | Care
            </span>
          </div>
        </div>

        {/* Links */}
        <nav
          className="flex flex-wrap items-center justify-center gap-6 text-slate-600 font-medium"
          style={{ fontFamily: '"Inter", sans-serif' }}
        >
          <a href="/blogs" className="hover:text-teal-700 transition-colors">Blogs</a>
          <a href="/about" className="hover:text-teal-700 transition-colors">About</a>
          <a href="/contact" className="hover:text-teal-700 transition-colors">Contact</a>
        </nav>

        {/* Social Links */}
        <div className="flex items-center gap-4">
          <a
            href="https://www.facebook.com/hygiene.shelf?mibextid=wwXIfr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 hover:text-blue-600 transition-colors"
            aria-label="Follow us on Facebook"
          >
            <Facebook size={20} />
          </a>
          <a
            href="https://www.instagram.com/hygiene.shelf?igsh=MTF5NGx5dDZyd3Zzaw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 hover:text-pink-600 transition-colors"
            aria-label="Follow us on Instagram"
          >
            <Instagram size={20} />
          </a>
          {/* Copyright */}
          <p className="text-slate-500 text-center md:text-right text-sm ml-4">
            © {new Date().getFullYear()} Hygiene Shelf · All rights reserved
          </p>
        </div>
      </div>

      {/* Subtle glow line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 via-teal-500 to-cyan-400 opacity-60" />
    </footer>
  );
}
