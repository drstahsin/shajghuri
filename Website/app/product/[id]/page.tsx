"use client";

import { useParams } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ShoppingBag, Check, Star, Truck, ShieldCheck, HeartHandshake, Phone, MessageCircle, ChevronRight as ChevronNext } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";

export default function ProductDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { products, addToCart } = useAppContext();
  const [isAdded, setIsAdded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const product = products.find((p) => p.id === id);
  const relatedProducts = products
    .filter((p) => p.category === product?.category && p.id !== id)
    .slice(0, 4);

  if (!product) {
    return (
      <div className="py-40 container mx-auto px-6 text-center">
        <h2 className="font-cherry text-3xl text-zinc-900 mb-4">Ornament Not Found</h2>
        <p className="text-sm text-zinc-500 mb-8">This jewelry item may have been archived or removed.</p>
        <Link href="/collection" className="px-6 py-3 bg-zinc-950 text-white rounded-full text-xs font-semibold hover:bg-rose-600 transition-colors">
          Browse All Jewelry
        </Link>
      </div>
    );
  }

  // Multi-image list: fallback to [product.image] if images array is empty or undefined
  const galleryImages = (product.images && product.images.length > 0)
    ? product.images.filter(Boolean)
    : [product.image];

  const currentImage = galleryImages[selectedImageIndex] || product.image;

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleAddToCart = () => {
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Shajghuri! I would like to order: "${product.name}" (Price: ৳${product.price}, Category: ${product.category}). Is it available?`
  );

  return (
    <div className="pt-6 pb-24 bg-[#FDFBF9] min-h-screen">
      <div className="container mx-auto px-4 md:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-8">
          <Link href="/" className="hover:text-black">Home</Link>
          <ChevronNext className="w-3.5 h-3.5 text-zinc-400" />
          <Link href="/collection" className="hover:text-black">Jewelry</Link>
          <ChevronNext className="w-3.5 h-3.5 text-zinc-400" />
          <Link href={`/collection?category=${encodeURIComponent(product.category)}`} className="hover:text-rose-600">
            {product.category}
          </Link>
          <ChevronNext className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-900 font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Details Section (Ariano Style) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start bg-white p-6 md:p-10 rounded-3xl border border-zinc-200/90 shadow-sm">
          
          {/* Left Column: Interactive Product Gallery */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Main Featured Image with Frame & Arrows */}
            <div className="relative aspect-square w-full rounded-2xl bg-zinc-50 border border-zinc-200/80 overflow-hidden group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImage}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={encodeURI(currentImage || "/brand-logo-bw.png")}
                    alt={`${product.name} angle ${selectedImageIndex + 1}`}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Angle Counter Badge */}
              {galleryImages.length > 1 && (
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full text-[10px] font-mono text-zinc-800 border border-zinc-200 shadow-2xs font-bold">
                  {String(selectedImageIndex + 1).padStart(2, "0")} / {String(galleryImages.length).padStart(2, "0")}
                </div>
              )}

              {/* Navigation Arrows */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 text-zinc-900 border border-zinc-200 shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-white cursor-pointer"
                    aria-label="Previous view"
                  >
                    <ChevronLeft className="w-5 h-5 stroke-[2]" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 text-zinc-900 border border-zinc-200 shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-white cursor-pointer"
                    aria-label="Next view"
                  >
                    <ChevronRight className="w-5 h-5 stroke-[2]" />
                  </button>
                </>
              )}
            </div>

            {/* Interactive Thumbnail Gallery */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                      selectedImageIndex === idx
                        ? "border-rose-600 ring-2 ring-rose-200 scale-102"
                        : "border-zinc-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={encodeURI(img || "/brand-logo-bw.png")}
                      alt={`${product.name} angle thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="lg:col-span-6 flex flex-col justify-start space-y-6">
            <div>
              {/* Category & Badge */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 uppercase tracking-wider">
                  {product.category}
                </span>
                <span className="text-xs text-zinc-400">·</span>
                <span className="text-xs text-zinc-500 font-medium">SKU: SG-0{product.id}</span>
              </div>

              {/* Title in Cherry Boogabear Font */}
              <h1 className="font-cherry text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-950 tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Ratings */}
              <div className="flex items-center gap-2 mt-3 text-amber-400">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 stroke-none" />
                  ))}
                </div>
                <span className="text-xs font-bold text-zinc-800">5.0</span>
                <span className="text-xs text-zinc-400">(Verified Artisan Piece)</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-zinc-950">
                ৳{product.price}
              </span>
              <span className="text-base text-zinc-400 line-through">
                ৳{Math.round(product.price * 1.25)}
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                In Stock & Ready to Ship
              </span>
            </div>

            {/* Description */}
            <div className="text-sm text-zinc-600 font-light leading-relaxed space-y-2">
              <p>{product.description}</p>
              <ul className="pt-2 space-y-1.5 text-xs text-zinc-700">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Handcrafted artisan piece with precision setting</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Premium anti-tarnish protective coating</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Delivered in signature Shajghuri gift box</li>
              </ul>
            </div>

            {/* Stock Availability */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-zinc-900 block mb-1">
                Stock Status:
              </span>
              {product.stock > 0 ? (
                <p className="text-xs font-medium text-emerald-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Available: {product.stock} pieces remaining in studio
                </p>
              ) : (
                <p className="text-xs font-medium text-rose-600">Currently Sold Out</p>
              )}
            </div>

            {/* Action Buttons (Add to Cart & WhatsApp) */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 py-4 px-6 rounded-full font-semibold text-xs md:text-sm flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer ${
                  product.stock === 0
                    ? "bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none"
                    : isAdded
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-950 text-white hover:bg-rose-600"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Added to Bag!</span>
                  </>
                ) : product.stock === 0 ? (
                  <span>Out of Stock</span>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 stroke-[2]" />
                    <span>Add to Shopping Bag</span>
                  </>
                )}
              </button>

              <a
                href={`https://wa.me/8801567845417?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-4 px-6 rounded-full font-semibold text-xs md:text-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4 stroke-[2]" />
                <span>Order on WhatsApp</span>
              </a>
            </div>

            {/* Delivery Info Box (Ariano style) */}
            <div className="pt-4 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-600">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>Narayanganj: ৳60 | College Rd Pickup: ৳20</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>Outside Narayanganj: ৳120 (Nationwide)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <HeartHandshake className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Cash on Delivery Available</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>Safe Delivery Guarantee</span>
              </div>
            </div>

          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8 border-b border-zinc-200 pb-4">
              <h3 className="font-cherry text-2xl md:text-3xl font-bold text-zinc-950">
                You May Also Like
              </h3>
              <Link href={`/collection?category=${encodeURIComponent(product.category)}`} className="text-xs font-semibold text-rose-600 hover:underline">
                View More in {product.category}
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
