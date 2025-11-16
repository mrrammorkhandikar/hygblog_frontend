import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import LayoutContent from "./LayoutContent";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { UserProvider } from "@/contexts/UserContext";
import UserRegistration from "@/components/UserRegistration";

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
  title: "Dr. Bushra's Dental Care",
  description: "Dr. Bushra's Dental Care",
  icons: {
    icon: '/Images/General/TheToothLogo2.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`} suppressHydrationWarning>
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
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
