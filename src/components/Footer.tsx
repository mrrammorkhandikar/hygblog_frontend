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
          <a
            href="https://chat.whatsapp.com/LE3Ot58Pjjx7hB7nmdMWGV"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 hover:text-green-600 transition-colors"
            aria-label="Join us on WhatsApp"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
            </svg>
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
