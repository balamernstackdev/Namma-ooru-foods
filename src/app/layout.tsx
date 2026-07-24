import type { Metadata, Viewport } from "next";
import { Inter, Jost, Manrope, Mulish } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import FloatingCartBar from "@/components/FloatingCartBar";
import StickyAssistant from "@/components/StickyAssistant";

import { Providers } from "@/components/Providers";
import ClientLayout from "@/components/ClientLayout";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
});
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});
const mulish = Mulish({
  subsets: ["latin"],
  variable: "--font-mulish",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://nammaoorufoods.com"),
  title: {
    default: "namma ooru Foods | Premium Organic & Local Essentials",
    template: "%s | namma ooru Foods"
  },
  description: "Experience the purity of locally-sourced, organic food delivered directly from the heart of our community to your doorstep.",
  keywords: ["organic food", "local sourcing", "fresh produce", "traditional grains", "namma ooru"],
  authors: [{ name: "namma ooru Foods Team" }],
  creator: "namma ooru Foods",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://nammaoorufoods.com",
    title: "namma ooru Foods | Premium Organic & Local Essentials",
    description: "Pure, local, and organic essentials delivered from our community to your kitchen.",
    siteName: "namma ooru Foods",
    images: [{
      url: "/og-image.jpg",
      width: 1200,
      height: 630,
      alt: "namma ooru Foods"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "namma ooru Foods | Organic Essentials",
    description: "Experience the purity of locally-sourced, organic food.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jost.variable} ${manrope.variable} ${mulish.variable}`}>
      <body className={`antialiased font-sans transition-colors duration-500`}>
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
          <CartDrawer />
        </Providers>
        <Toaster
          position="bottom-center"
          richColors
          expand={false}
          closeButton={false}
          toastOptions={{
            className: "!rounded-2xl !border !border-slate-100 !shadow-2xl",
          }}
        />
      </body>
    </html>
  );
}
