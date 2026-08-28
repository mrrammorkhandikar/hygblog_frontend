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
    return <>{children}</>;
  }

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
      {showFloatingSocial && <FloatingSocialMedia />}
    </>
  );
}
