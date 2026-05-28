import type { Metadata } from "next";
import { Inter, Jost, Manrope } from "next/font/google";
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
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://namma-urru-foods.web.app"),
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
    url: "https://namma-urru-foods.web.app",
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
    <html lang="en" className={`${inter.variable} ${jost.variable} ${manrope.variable}`}>
      <body className={`antialiased font-sans transition-colors duration-500`}>
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
          <FloatingCartBar />
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
