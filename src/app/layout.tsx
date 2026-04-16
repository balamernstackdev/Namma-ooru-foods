import type { Metadata } from "next";
import { Inter, Jost } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import StickyAssistant from "@/components/StickyAssistant";

import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://namma-urru-foods.web.app"),
  title: {
    default: "Namma Orru Foods | Premium Organic & Local Essentials",
    template: "%s | Namma Orru Foods"
  },
  description: "Experience the purity of locally-sourced, organic food delivered directly from the heart of our community to your doorstep.",
  keywords: ["organic food", "local sourcing", "fresh produce", "traditional grains", "Namma Orru"],
  authors: [{ name: "Namma Orru Foods Team" }],
  creator: "Namma Orru Foods",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://namma-urru-foods.web.app",
    title: "Namma Orru Foods | Premium Organic & Local Essentials",
    description: "Pure, local, and organic essentials delivered from our community to your kitchen.",
    siteName: "Namma Orru Foods",
    images: [{
      url: "/og-image.jpg", // Make sure this file exists in public/
      width: 1200,
      height: 630,
      alt: "Namma Orru Foods"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Namma Orru Foods | Organic Essentials",
    description: "Experience the purity of locally-sourced, organic food.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  }
};

import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jost.variable}`}>
      <body className={`antialiased font-sans`}>
        <AuthProvider>
          <ToastProvider>
            <SmoothScroll>
              <Navbar />
              <main className="min-h-fit flex-1">
                {children}
              </main>
              <Footer />
              <StickyAssistant />
            </SmoothScroll>
            <CartDrawer />
          </ToastProvider>
        </AuthProvider>


      </body>
    </html>
  );
}
