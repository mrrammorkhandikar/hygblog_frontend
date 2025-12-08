'use client';

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingSocialMedia from "@/components/FloatingSocialMedia";

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  // Show floating social media on specific pages
  const showFloatingSocial = pathname === '/' ||
                            pathname === '/home' ||
                            pathname?.startsWith('/about') ||
                            pathname?.startsWith('/contact') ||
                            pathname?.startsWith('/products') ||
                            pathname?.startsWith('/blogs');

  if (isAdminPage) {
    // For admin pages, only show content without header/footer
    return (
      <body className="bg-gray-50 font-body antialiased">
        {children}
      </body>
    );
  }

  // For non-admin pages, show full layout with header/footer
  return (
    <body className="bg-gray-50 font-body antialiased">
      {/* Global layout: Header at top, content in middle, footer at bottom */}
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>

      {/* Floating Social Media Widget - only on specific pages */}
      {showFloatingSocial && <FloatingSocialMedia />}
    </body>
  );
}
