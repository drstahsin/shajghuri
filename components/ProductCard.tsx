"use client";

import Image from "next/image";
import Link from "next/link";
import { Product, useAppContext } from "@/context/AppContext";
import { ShoppingBag, Check, Star } from "lucide-react";
import { useState } from "react";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useAppContext();
  const [isAdded, setIsAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  return (
    <div className="group bg-white rounded-2xl border border-zinc-200/90 overflow-hidden hover:shadow-lg hover:border-zinc-300 transition-all duration-300 flex flex-col justify-between">
      {/* Top Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-50">
        <Link href={`/product/${product.id}`} className="block relative w-full h-full">
          <Image
            src={encodeURI(product.image || "/brand-logo-bw.png")}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </Link>

        {/* Stock / Category Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.stock <= 4 && product.stock > 0 ? (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              Only {product.stock} Left
            </span>
          ) : product.stock === 0 ? (
            <span className="bg-zinc-800 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          ) : (
            <span className="bg-white/90 backdrop-blur-xs text-zinc-700 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider border border-zinc-200/60 shadow-2xs">
              {product.category}
            </span>
          )}
        </div>

        {/* Quick Add Button Hover Overlay (Ariano Style) */}
        <button
          onClick={handleQuickAdd}
          disabled={product.stock === 0}
          className={`absolute bottom-3 right-3 p-3 rounded-full shadow-md transition-all duration-300 flex items-center justify-center cursor-pointer ${
            isAdded
              ? "bg-emerald-600 text-white scale-110"
              : product.stock === 0
              ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
              : "bg-white text-zinc-900 hover:bg-rose-600 hover:text-white"
          }`}
          title={isAdded ? "Added to Bag" : "Add to Cart"}
          aria-label="Add to cart"
        >
          {isAdded ? (
            <Check className="w-4 h-4 stroke-[2.5]" />
          ) : (
            <ShoppingBag className="w-4 h-4 stroke-[2]" />
          )}
        </button>
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3 bg-white">
        <div>
          {/* Rating Stars (Ariano style) */}
          <div className="flex items-center gap-1 mb-1.5 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-amber-400 stroke-none" />
            ))}
            <span className="text-[10px] text-zinc-400 font-medium ml-1">5.0</span>
          </div>

          {/* Product Title */}
          <Link
            href={`/product/${product.id}`}
            className="font-sans font-semibold text-sm md:text-base text-zinc-900 group-hover:text-rose-600 transition-colors line-clamp-1 leading-snug"
          >
            {product.name}
          </Link>
          <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5 font-light">
            {product.description}
          </p>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base md:text-lg font-bold text-zinc-950">
              ৳{product.price}
            </span>
            <span className="text-xs text-zinc-400 line-through">
              ৳{Math.round(product.price * 1.25)}
            </span>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={product.stock === 0}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              isAdded
                ? "bg-emerald-50 text-emerald-700"
                : product.stock === 0
                ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                : "bg-zinc-100 text-zinc-800 hover:bg-rose-50 hover:text-rose-600"
            }`}
          >
            {isAdded ? "Added!" : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
