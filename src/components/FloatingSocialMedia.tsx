import { Facebook, Instagram } from 'lucide-react';

export default function FloatingSocialMedia() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* Facebook */}
      <a
        href="https://www.facebook.com/hygiene.shelf?mibextid=wwXIfr"
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 bg-[#0f766e] hover:bg-[#0d5e59] text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Follow us on Facebook"
      >
        <Facebook size={20} />
      </a>

      {/* Instagram */}
      <a
        href="https://www.instagram.com/hygiene.shelf?igsh=MTF5NGx5dDZyd3Zzaw%3D%3D"
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 bg-[#06b6d4] hover:bg-[#0891b2] text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Follow us on Instagram"
      >
        <Instagram size={20} />
      </a>
    </div>
  );
}
