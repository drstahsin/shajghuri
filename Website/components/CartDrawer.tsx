"use client";

import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cart, updateQuantity, removeFromCart, cartTotal, cartCount } = useAppContext();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-100 bg-zinc-50/50">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-zinc-900" />
                <h2 className="font-cherry text-2xl font-bold text-zinc-950">
                  Shopping Bag
                </h2>
                <span className="text-xs bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">
                  {cartCount}
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full hover:bg-zinc-200 text-zinc-500 hover:text-black transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5 stroke-[2]" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-zinc-100">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-400 space-y-4 py-16">
                  <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                    <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <p className="font-cherry text-2xl text-zinc-800">Your bag is empty</p>
                  <p className="text-xs text-zinc-500 max-w-xs text-center font-light">
                    Explore our authentic Jhumkas, necklaces, and ornaments to fill your bag.
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-6 py-2.5 bg-zinc-950 text-white rounded-full text-xs font-semibold hover:bg-rose-600 transition-colors shadow-xs"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="pt-4 first:pt-0 flex gap-4">
                    <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 flex-shrink-0">
                      <Image
                        src={encodeURI(item.image || "/brand-logo-bw.png")}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between py-0.5">
                      <div>
                        <h4 className="font-sans font-semibold text-sm text-zinc-900 line-clamp-1 leading-snug">
                          {item.name}
                        </h4>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mt-0.5">
                          {item.category}
                        </span>
                        <p className="text-xs font-bold text-zinc-950 mt-1">
                          ৳{item.price}
                        </p>
                      </div>

                      {/* Quantity Controls & Remove */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-50">
                        <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden bg-zinc-50">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2.5 py-1 text-zinc-600 hover:bg-zinc-200 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3 stroke-[2]" />
                          </button>
                          <span className="text-xs font-bold w-6 text-center text-zinc-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2.5 py-1 text-zinc-600 hover:bg-zinc-200 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3 stroke-[2]" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4 stroke-[1.8]" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Subtotal & Checkout Button */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-zinc-200 bg-zinc-50 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-600">Subtotal:</span>
                  <span className="text-2xl font-bold text-zinc-950">৳{cartTotal}</span>
                </div>
                <p className="text-[11px] text-zinc-500 font-light">
                  Delivery (Narayanganj ৳60 / College Rd Pickup ৳20 / Outside ৳120) calculated at checkout.
                </p>
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full bg-zinc-950 hover:bg-rose-600 text-white py-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 block text-center shadow-md hover:shadow-lg cursor-pointer"
                >
                  Proceed to Checkout (৳{cartTotal})
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
