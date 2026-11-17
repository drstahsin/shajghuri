"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag, Menu, X, Phone, ShieldCheck } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const router = useRouter();
  const { cartCount, cartTotal, setIsCartOpen } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/collection?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const navCategories = [
    { name: "Home", href: "/" },
    { name: "All Jewelry", href: "/collection" },
    { name: "Bracelets", href: "/collection?category=Bracelets" },
    { name: "Necklaces", href: "/collection?category=Necklaces" },
    { name: "Pendants", href: "/collection?category=Pendants" },
    { name: "Earrings", href: "/collection?category=Earrings" },
    { name: "Jhumkas", href: "/collection?category=Jhumkas" },
    { name: "About Atelier", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-40 bg-white border-b border-zinc-200/80 shadow-xs">
        {/* Main Header Bar */}
        <div className="container mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between gap-4 md:gap-8">
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-zinc-700 hover:text-black md:hidden"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 stroke-[1.8]" />
          </button>

          {/* Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border border-zinc-300 shadow-xs group-hover:scale-105 transition-transform duration-300 bg-white">
              <Image
                src="/brand-logo-bw.png"
                alt="Shajghuri Brand Logo"
                fill
                priority
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-cherry text-2xl md:text-3xl font-bold tracking-tight text-zinc-950 group-hover:text-rose-600 transition-colors leading-none">
                Shajghuri
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium mt-0.5">
                Fashion Jewelry
              </span>
            </div>
          </Link>

          {/* Search Bar (Ariano style) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-lg items-center relative"
          >
            <input
              type="text"
              placeholder="Search for Bracelets, Necklaces, Pendants, Earrings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 hover:bg-zinc-100/70 focus:bg-white text-zinc-900 placeholder:text-zinc-400 text-xs md:text-sm pl-4 pr-12 py-2.5 rounded-full border border-zinc-200 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-zinc-900 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-xs"
              title="Search"
            >
              <Search className="w-4 h-4 stroke-[2]" />
            </button>
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
            {/* Phone Hotline */}
            <a
              href="tel:+8801567845417"
              className="hidden lg:flex items-center gap-2.5 text-xs text-zinc-600 hover:text-black transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                <Phone className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[9px] uppercase tracking-wider text-zinc-400">Order Hotline</span>
                <span className="font-semibold text-zinc-900">01567-845417</span>
              </div>
            </a>

            {/* Admin Access Link */}
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-950 px-2.5 py-1.5 rounded-md hover:bg-zinc-100 transition-colors"
              title="Studio Admin Dashboard"
            >
              <ShieldCheck className="w-4 h-4 text-zinc-500" />
              <span className="hidden sm:inline font-medium">Admin</span>
            </Link>

            {/* Shopping Cart Button (Ariano Pill) */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2.5 bg-zinc-950 hover:bg-rose-600 text-white px-3.5 sm:px-4 py-2 rounded-full transition-all shadow-xs group cursor-pointer"
              aria-label="Open Cart Drawer"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 stroke-[2]" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-zinc-950">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold tracking-wide">
                ৳{cartTotal}
              </span>
            </button>
          </div>
        </div>

        {/* Sub Navigation Bar - Category Strip like Ariano */}
        <div className="hidden md:block bg-zinc-50/80 border-t border-zinc-200/60">
          <div className="container mx-auto px-4 md:px-8">
            <ul className="flex items-center gap-1 lg:gap-3 py-1.5 overflow-x-auto text-xs font-medium text-zinc-700">
              {navCategories.map((cat, i) => (
                <li key={i}>
                  <Link
                    href={cat.href}
                    className="px-3 py-1.5 rounded-md hover:text-rose-600 hover:bg-white transition-all whitespace-nowrap block"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 left-0 bottom-0 z-50 w-4/5 max-w-sm bg-white shadow-2xl flex flex-col md:hidden"
            >
              <div className="p-5 flex items-center justify-between border-b border-zinc-100 bg-zinc-50">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-zinc-300">
                    <Image src="/brand-logo-bw.png" alt="Shajghuri" fill className="object-cover" />
                  </div>
                  <span className="font-cherry text-2xl font-bold text-zinc-950">Shajghuri</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-full hover:bg-zinc-200 text-zinc-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search */}
              <div className="p-4 border-b border-zinc-100">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    placeholder="Search jewelry..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-100 text-xs py-2.5 pl-3.5 pr-10 rounded-full focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
                    <Search className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Mobile Category Links */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {navCategories.map((cat, i) => (
                  <Link
                    key={i}
                    href={cat.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-800 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>

              {/* Mobile Footer */}
              <div className="p-4 bg-zinc-50 border-t border-zinc-100 space-y-3">
                <a
                  href="tel:+8801567845417"
                  className="flex items-center gap-2 text-xs text-zinc-700 font-medium"
                >
                  <Phone className="w-4 h-4 text-rose-600" />
                  <span>Hotline: 01567-845417</span>
                </a>
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-xs text-zinc-700 font-medium"
                >
                  <ShieldCheck className="w-4 h-4 text-zinc-500" />
                  <span>Admin Panel</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
