import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import LayoutContent from "./LayoutContent";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { UserProvider } from "@/contexts/UserContext";
import UserRegistration from "@/components/UserRegistration";
import SchemaMarkup from "@/components/SchemaMarkup";

// Re-defining the fonts and variables used by your Tailwind config
const headingFont = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Hygiene Shelf - Health & Hygiene Insights from Dr. Bushra Mirza",
    template: "%s | Hygiene Shelf"
  },
  description: "Expert health and hygiene advice from Dr. Bushra Mirza. Discover essential tips for oral care, kids hygiene, mental wellness, and family health practices. Evidence-based guidance for a healthier lifestyle.",
  keywords: ["health", "hygiene", "wellness", "oral care", "kids hygiene", "dental hygiene", "mental health", "family health", "Dr. Bushra Mirza", "health tips", "hygiene practices", "tooth hygiene", "home hygiene", "food hygiene", "personal hygiene", "healthcare advice", "dental care", "pediatric hygiene", "oral health"],
  authors: [{ name: "Dr. Bushra Mirza" }],
  creator: "Dr. Bushra Mirza",
  publisher: "Hygiene Shelf",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://hygieneshelf.in'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Hygiene Shelf - Expert Health & Hygiene Guidance from Dr. Bushra Mirza",
    description: "Expert health and hygiene advice from Dr. Bushra Mirza. Discover essential tips for oral care, kids hygiene, mental wellness, and family health practices.",
    url: "https://hygieneshelf.in",
    siteName: "Hygiene Shelf",
    images: [
      {
        url: "/Images/thelogohytitle.png",
        width: 1200,
        height: 630,
        alt: "Hygiene Shelf - Expert Health & Hygiene Guidance",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hygiene Shelf - Expert Health & Hygiene Guidance from Dr. Bushra Mirza",
    description: "Expert health and hygiene advice from Dr. Bushra Mirza. Essential tips for oral care, kids hygiene, and family health.",
    images: ["/Images/thelogohytitle.png"],
    creator: "@drbushramirza",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || '',
    yandex: '',
    yahoo: '',
  },
  icons: {
    icon: '/Images/thelogohytitle.png',
    shortcut: '/Images/thelogohytitle.png',
    apple: '/Images/thelogohytitle.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" href="/Images/thelogohytitle.png" as="image" />
        <meta name="theme-color" content="#0f766e" />
        <meta name="msapplication-TileColor" content="#0f766e" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Performance and SEO optimizations */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//source.unsplash.com" />
        
        
        {/* Resource hints for important pages */}
        <link rel="prefetch" href="/blogs" />
        <link rel="prefetch" href="/about" />
      </head>
      <body className="bg-gray-50 font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider>
            <LayoutContent>{children}</LayoutContent>
            <UserRegistration />
            <SchemaMarkup />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
