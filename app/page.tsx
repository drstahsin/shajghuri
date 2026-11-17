"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import { ProductCard } from "@/components/ProductCard";
import {
  Sparkles,
  Truck,
  ShieldCheck,
  HeartHandshake,
  Phone,
  ArrowRight,
  ShoppingBag,
  Star,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  const { products } = useAppContext();
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Bracelets", "Necklaces", "Pendants", "Earrings", "Jhumkas"];

  const filteredProducts = activeCategory === "All"
    ? products.slice(0, 8)
    : products.filter((p) => p.category === activeCategory).slice(0, 8);

  const categoryHighlights = [
    { name: "Bracelets", image: "/product-images/AIUL6483.PNG", count: "12+ Designs", href: "/collection?category=Bracelets" },
    { name: "Necklaces", image: "/product-images/received_1301556105419293.jpeg", count: "30+ Designs", href: "/collection?category=Necklaces" },
    { name: "Pendants", image: "/product-images/NYOG6370.JPG", count: "10+ Designs", href: "/collection?category=Pendants" },
    { name: "Earrings", image: "/product-images/Messenger_creation_82848A60-13AC-431D-B0D5-89CB27D3AB3B.jpeg", count: "25+ Designs", href: "/collection?category=Earrings" },
    { name: "Jhumkas", image: "/product-images/IMG_9111.JPG.jpeg", count: "16+ Designs", href: "/collection?category=Jhumkas" },
  ];

  return (
    <div className="space-y-16 md:space-y-24 pb-24">
      {/* 1. HERO BANNER SECTION (Ariano Style with Brand Logo) */}
      <section className="relative bg-gradient-to-b from-rose-50/70 via-white to-zinc-50/50 pt-8 pb-16 md:py-20 border-b border-zinc-200/60 overflow-hidden">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Brand Typography & Call to Actions */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Top Tagline with Brand Badge */}
              <div className="inline-flex items-center gap-2.5 bg-white border border-rose-200/80 px-3.5 py-1.5 rounded-full shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-xs font-semibold text-rose-700 tracking-wide uppercase">
                  Authentic Bangladeshi Ornaments
                </span>
              </div>

              {/* Main Headline in Cherry Boogabear Font */}
              <h1 className="font-cherry text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-950 leading-[1.1]">
                Timeless Elegance in <br className="hidden sm:inline" />
                <span className="text-rose-600">Every Detail</span>
              </h1>

              <p className="text-sm md:text-base text-zinc-600 max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
                Welcome to Shajghuri. Adorn yourself with handcrafted traditional Jhumkas, delicate 18k plated bracelets, statement necklaces, and artisanal jewelry made with love.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/collection"
                  className="px-8 py-3.5 bg-zinc-950 hover:bg-rose-600 text-white text-xs md:text-sm font-semibold rounded-full transition-all shadow-md hover:shadow-lg flex items-center gap-2.5 group"
                >
                  <ShoppingBag className="w-4 h-4 stroke-[2]" />
                  <span>Shop Collection</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/collection"
                  className="px-6 py-3.5 bg-white hover:bg-zinc-50 text-zinc-800 text-xs md:text-sm font-semibold rounded-full border border-zinc-300 transition-colors shadow-2xs"
                >
                  Explore All Products
                </Link>
              </div>

              {/* Mini Highlights */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-zinc-500 font-medium">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Cash on Delivery Nationwide
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Fast Delivery in 2-3 Days
                </span>
              </div>
            </div>

            {/* Right Column: Prominent Brand Logo Showcase */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md aspect-square rounded-3xl bg-white p-6 shadow-xl border border-zinc-200/90 flex flex-col items-center justify-center group">
                
                {/* Glowing Background Ring */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-rose-100/60 via-amber-50/40 to-transparent pointer-events-none" />

                {/* The Brand Black & White Logo (Prominently displayed) */}
                <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full overflow-hidden border-4 border-zinc-900 shadow-lg bg-white group-hover:scale-105 transition-transform duration-500">
                  <Image
                    src="/brand-logo-bw.png"
                    alt="Shajghuri Official Brand Logo"
                    fill
                    priority
                    className="object-cover"
                  />
                </div>

                {/* Badge Below Logo */}
                <div className="mt-6 text-center z-10">
                  <h2 className="font-cherry text-2xl font-bold text-zinc-950">
                    Shajghuri - সাজগুরি
                  </h2>
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-[0.2em] mt-1">
                    Artisan Jewelry Atelier
                  </p>
                </div>

                {/* Floating Price Callout */}
                <div className="absolute -bottom-4 bg-zinc-950 text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-lg border border-zinc-800 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Curated Jewelry from ৳190</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. CIRCULAR CATEGORY HIGHLIGHTS (Ariano Signature Look) */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs uppercase font-semibold text-rose-600 tracking-widest block mb-1">
            Explore Categories
          </span>
          <h2 className="font-cherry text-3xl md:text-4xl font-bold text-zinc-950">
            Shop by Jewelry Type
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
          {categoryHighlights.map((cat, idx) => (
            <Link
              key={idx}
              href={cat.href}
              className="group bg-white p-4 rounded-2xl border border-zinc-200/80 hover:border-rose-400 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center"
            >
              {/* Round Thumbnail */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-zinc-100 group-hover:border-rose-300 group-hover:scale-105 transition-all duration-300 bg-zinc-50 mb-3">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="font-sans font-bold text-sm md:text-base text-zinc-900 group-hover:text-rose-600 transition-colors">
                {cat.name}
              </h3>
              <span className="text-xs text-zinc-400 font-medium mt-0.5">
                {cat.count}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. ARIANO TRUST & VALUE BAR */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="bg-white rounded-2xl border border-zinc-200/90 p-6 md:p-8 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
              <Truck className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-zinc-900">Fast Delivery</h4>
              <p className="text-xs text-zinc-500 mt-0.5">Narayanganj ৳60 | College Rd Pickup ৳20 | Outside ৳120</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
              <ShieldCheck className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-zinc-900">Handcrafted Quality</h4>
              <p className="text-xs text-zinc-500 mt-0.5">Premium materials & finish</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <HeartHandshake className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-zinc-900">Cash on Delivery</h4>
              <p className="text-xs text-zinc-500 mt-0.5">Pay upon checking the package</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
              <Phone className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-zinc-900">WhatsApp Hotline</h4>
              <p className="text-xs text-zinc-500 mt-0.5">01567-845417</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TRENDING PRODUCTS GRID WITH CATEGORY TABS (Ariano Style) */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-zinc-200 pb-6">
          <div>
            <span className="text-xs uppercase font-semibold text-rose-600 tracking-widest block mb-1">
              Handpicked Catalog
            </span>
            <h2 className="font-cherry text-3xl md:text-4xl font-bold text-zinc-950">
              Trending Jewelry Collection
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-semibold px-4 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-zinc-950 text-white shadow-xs"
                    : "bg-white text-zinc-700 border border-zinc-200 hover:border-zinc-400"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-12 text-center">
          <Link
            href="/collection"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-zinc-950 hover:bg-rose-600 text-white text-xs md:text-sm font-semibold rounded-full transition-all shadow-md hover:shadow-lg"
          >
            <span>Browse Full Archive ({products.length} Items)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 5. BRAND SPOTLIGHT SECTION (Showing the user's Brand Logo) */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 text-white rounded-3xl p-8 md:p-14 overflow-hidden relative shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left: Brand Story */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Our Heritage & Atelier</span>
              </div>

              <h2 className="font-cherry text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                Authentic Craftsmanship, <br />
                Celebrated in Every Ornament
              </h2>

              <p className="text-zinc-300 text-sm md:text-base leading-relaxed font-light">
                Shajghuri (শাজগুরি) was founded with a singular dream: to bring timeless South Asian ornaments to life with unmatched attention to detail, premium alloys, and authentic artisan craftsmanship.
              </p>

              <div className="grid grid-cols-2 gap-6 pt-2 border-t border-zinc-800 text-zinc-300">
                <div>
                  <h4 className="font-cherry text-2xl font-bold text-white">50+</h4>
                  <p className="text-xs text-zinc-400 mt-1">Unique Handcrafted Designs</p>
                </div>
                <div>
                  <h4 className="font-cherry text-2xl font-bold text-white">100%</h4>
                  <p className="text-xs text-zinc-400 mt-1">Inspected Before Packaging</p>
                </div>
              </div>
            </div>

            {/* Right: The Brand Logo Badge */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-rose-400/80 shadow-2xl bg-white p-2">
                <Image
                  src="/brand-logo-bw.png"
                  alt="Shajghuri Brand Emblem"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. PROMOTIONAL DUAL BANNERS (Ariano Campaign Style) */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Banner 1: Amora Heart & Pendants */}
          <div className="relative rounded-2xl overflow-hidden bg-rose-50 border border-rose-200/60 p-8 flex flex-col justify-between min-h-[220px]">
            <div className="relative z-10 max-w-xs space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-rose-600 bg-white px-2.5 py-1 rounded-full shadow-2xs">
                Featured Collection
              </span>
              <h3 className="font-cherry text-2xl md:text-3xl font-bold text-zinc-950">
                Amora Heart & Opal Pendants
              </h3>
              <p className="text-xs text-zinc-600 font-light">
                A timeless touch of love starting from ৳360 only.
              </p>
            </div>
            <div className="relative z-10 pt-4">
              <Link
                href="/collection?category=Pendants"
                className="inline-flex items-center gap-2 text-xs font-bold text-zinc-950 hover:text-rose-600 group"
              >
                <span>Shop Pendants</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="absolute right-4 bottom-2 w-32 h-32 opacity-40 md:opacity-60 pointer-events-none rounded-xl overflow-hidden">
              <Image src="/product-images/received_1527071975857646.jpeg" alt="Amora Pendant" fill className="object-cover" />
            </div>
          </div>

          {/* Banner 2: 18k Bracelets & Charms */}
          <div className="relative rounded-2xl overflow-hidden bg-amber-50/70 border border-amber-200/60 p-8 flex flex-col justify-between min-h-[220px]">
            <div className="relative z-10 max-w-xs space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 bg-white px-2.5 py-1 rounded-full shadow-2xs">
                Modern Daily Wear
              </span>
              <h3 className="font-cherry text-2xl md:text-3xl font-bold text-zinc-950">
                18k Gold Plated Heart Bracelets
              </h3>
              <p className="text-xs text-zinc-600 font-light">
                Delicate, anti-tarnish stainless steel pieces from ৳480.
              </p>
            </div>
            <div className="relative z-10 pt-4">
              <Link
                href="/collection?category=Bracelets"
                className="inline-flex items-center gap-2 text-xs font-bold text-zinc-950 hover:text-amber-700 group"
              >
                <span>Shop Bracelets</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="absolute right-4 bottom-2 w-32 h-32 opacity-40 md:opacity-60 pointer-events-none rounded-xl overflow-hidden">
              <Image src="/product-images/received_2566050870475385.jpeg" alt="Bracelet" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* 7. CUSTOMER TESTIMONIALS (Ariano Style Social Proof) */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs uppercase font-semibold text-rose-600 tracking-widest block mb-1">
            Real Reviews
          </span>
          <h2 className="font-cherry text-3xl md:text-4xl font-bold text-zinc-950">
            What Our Patrons Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 stroke-none" />
                ))}
              </div>
              <p className="text-xs text-zinc-700 leading-relaxed font-light">
                &ldquo;The jhumka finishing is extraordinary! Even more beautiful in person than in the photo. Delivered in Dhaka within 24 hours with lovely safe packaging.&rdquo;
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-100 mt-4 flex items-center justify-between">
              <span className="font-semibold text-xs text-zinc-900">Nabila K.</span>
              <span className="text-[10px] text-zinc-400">Gulshan, Dhaka</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 stroke-none" />
                ))}
              </div>
              <p className="text-xs text-zinc-700 leading-relaxed font-light">
                &ldquo;Ordered the 18k heart bracelet and peacock earrings. Cash on delivery was so smooth, and the material does not tarnish. Highly recommended!&rdquo;
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-100 mt-4 flex items-center justify-between">
              <span className="font-semibold text-xs text-zinc-900">Sabrina H.</span>
              <span className="text-[10px] text-zinc-400">Narayanganj</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 stroke-none" />
                ))}
              </div>
              <p className="text-xs text-zinc-700 leading-relaxed font-light">
                &ldquo;Shajghuri is my new go-to for jewelry. The website is so easy to order from and the prices are very affordable for such great quality.&rdquo;
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-100 mt-4 flex items-center justify-between">
              <span className="font-semibold text-xs text-zinc-900">Tasnim R.</span>
              <span className="text-[10px] text-zinc-400">Chittagong</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
