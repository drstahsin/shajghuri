import type { Metadata } from "next";
import { AppProvider } from "@/context/AppContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://shajghuri.com"),
  title: "Shajghuri - Online Fashion Jewelry & Ornaments in Bangladesh",
  description: "Explore exquisite handcrafted Jhumkas, Earrings, Necklaces, Pendants & Bracelets at Shajghuri. Premium quality, authentic craftsmanship, cash on delivery nationwide.",
  keywords: [
    "Shajghuri",
    "Jewelry Bangladesh",
    "Jhumka BD",
    "Necklaces",
    "Fashion Jewelry",
    "Ornaments",
    "Earrings",
    "Online Jewelry Store Bangladesh"
  ],
  openGraph: {
    title: "Shajghuri - Online Fashion Jewelry & Ornaments in Bangladesh",
    description: "Explore exquisite handcrafted Jhumkas, Earrings, Necklaces, Pendants & Bracelets at Shajghuri.",
    siteName: "Shajghuri",
    images: [
      {
        url: "/brand-logo-bw.png",
        width: 800,
        height: 800,
        alt: "Shajghuri Brand Emblem",
      },
    ],
    locale: "en_BD",
    type: "website",
  },
  icons: {
    icon: "/brand-logo-bw.png",
    apple: "/brand-logo-bw.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Boogaloo&family=Cherry+Bomb+One&family=Cherry+Swash:wght@400;700&family=Nunito+Sans:ital,opsz,wght@0,6..12,300..800;1,6..12,300..800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#FBF9F7] text-zinc-900 selection:bg-rose-100 selection:text-rose-900 min-h-screen flex flex-col font-sans">
        <AppProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <CartDrawer />
        </AppProvider>
      </body>
    </html>
  );
}
