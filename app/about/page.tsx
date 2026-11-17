"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Truck, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="pt-10 pb-24 bg-[#FDFBF9] min-h-screen">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl">
        {/* Brand Banner & Emblem */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="relative w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-zinc-900 shadow-xl bg-white p-1">
            <Image src="/brand-logo-bw.png" alt="Shajghuri Brand Emblem" fill className="object-cover" />
          </div>

          <span className="text-xs uppercase font-semibold text-rose-600 tracking-widest block mb-2">
            Our Atelier & Heritage
          </span>

          <h1 className="font-cherry text-4xl sm:text-5xl md:text-6xl font-bold text-zinc-950 mb-4 leading-tight">
            The Story of Shajghuri (শাজগুরি)
          </h1>

          <p className="text-sm md:text-base text-zinc-600 max-w-2xl mx-auto font-light leading-relaxed">
            Crafting ornaments of joy, tradition, and timeless grace for women across Bangladesh.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="bg-white rounded-3xl border border-zinc-200/90 p-8 md:p-12 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-10 items-center mb-16">
          <div className="md:col-span-6 relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200">
            <Image
              src="/product-images/received_1795952614632584.jpeg"
              alt="Artisan Jewelry Collection"
              fill
              className="object-cover"
            />
          </div>

          <div className="md:col-span-6 space-y-5">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
              Artisan Tradition
            </span>
            <h2 className="font-cherry text-3xl font-bold text-zinc-950 leading-snug">
              Every Piece Tells a Story of Elegance
            </h2>
            <p className="text-xs md:text-sm text-zinc-600 font-light leading-relaxed">
              At Shajghuri, we believe ornaments are more than accessories—they are expressions of identity, festive joy, and emotional memory. Our artisans work with premium metals, genuine oxidized finishes, and intricate stones to bring you pieces that stand the test of time.
            </p>
            <p className="text-xs md:text-sm text-zinc-600 font-light leading-relaxed">
              From traditional weddings in Dhaka to casual gatherings across the country, Shajghuri adorns your beauty with unmatched elegance and affordable luxury.
            </p>

            <div className="pt-2">
              <Link
                href="/collection"
                className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-950 text-white rounded-full text-xs font-semibold hover:bg-rose-600 transition-colors shadow-xs"
              >
                <span>Browse The Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Values Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-2">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900">Artisan Handcrafted</h3>
            <p className="text-xs text-zinc-500 font-light">Intricate craftsmanship with attention to every tiny bell, stone, and motif.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-2">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900">Quality Tested</h3>
            <p className="text-xs text-zinc-500 font-light">Anti-tarnish coatings and hypoallergenic materials safe for daily wear.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <Truck className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900">Fast Nationwide Shipping</h3>
            <p className="text-xs text-zinc-500 font-light">Inside Narayanganj (৳60), College Road Pickup (৳20), outside Narayanganj (৳120).</p>
          </div>
        </div>

      </div>
    </div>
  );
}
