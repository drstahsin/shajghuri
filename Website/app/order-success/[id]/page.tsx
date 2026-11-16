"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, MessageCircle, ShoppingBag, Truck, MapPin, Phone } from "lucide-react";
import { Order } from "@/app/api/orders/route";

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((orders: Order[]) => {
        const found = orders.find((o) => o.id === orderId);
        if (found) setOrder(found);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load order:", err);
        setLoading(false);
      });
  }, [orderId]);

  const whatsappMessage = order
    ? encodeURIComponent(
        `Hello Shajghuri! I placed order #${order.id} for ৳${order.total}. Could you please confirm the delivery schedule?`
      )
    : "";

  return (
    <div className="pt-10 pb-24 bg-[#FDFBF9] min-h-screen">
      <div className="container mx-auto px-4 md:px-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10"
        >
          {/* Brand Logo & Success Icon */}
          <div className="relative w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-2 border-zinc-300 shadow-md bg-white">
            <Image src="/brand-logo-bw.png" alt="Shajghuri" fill className="object-cover" />
          </div>

          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full mb-3 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>Order Placed Successfully</span>
          </div>

          <h1 className="font-cherry text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-950 mb-3">
            Thank You for Your Order!
          </h1>
          <p className="text-zinc-600 text-xs md:text-sm max-w-md mx-auto font-light">
            We have received your order reference <span className="font-mono text-zinc-950 font-bold select-all">#{orderId}</span>. 
            Our atelier is now packaging your jewelry with care.
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-16 text-zinc-400 text-xs uppercase tracking-wider">
            Loading order details...
          </div>
        ) : order ? (
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-zinc-200 shadow-sm mb-8 space-y-6">
            {/* Order Items */}
            <div>
              <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-900 mb-4 pb-2 border-b border-zinc-100 flex items-center justify-between">
                <span>Items in Order</span>
                <span className="text-zinc-500 font-normal">({order.items.length} items)</span>
              </h3>
              <div className="divide-y divide-zinc-100">
                {order.items.map((item) => (
                  <div key={item.id} className="py-3 first:pt-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 flex-shrink-0">
                        <Image
                          src={encodeURI(item.image || "/brand-logo-bw.png")}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-zinc-900 leading-snug">{item.name}</h4>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          Quantity: {item.quantity} × ৳{item.price}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-zinc-950">৳{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery & Payment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-100 text-xs">
              <div className="space-y-1">
                <h4 className="font-bold text-zinc-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  <span>Delivery Destination</span>
                </h4>
                <p className="text-zinc-700 leading-relaxed font-light">
                  <span className="font-medium text-zinc-900 block">{order.customerName}</span>
                  {order.address}<br />
                  {order.city} ({order.deliveryZone === "college_road_pickup" ? "College Road Pickup ৳20" : order.deliveryZone === "inside_narayanganj" ? "Inside Narayanganj ৳60" : "Outside Narayanganj ৳120"})<br />
                  <span className="text-zinc-500 block mt-1">Phone: {order.phone}</span>
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-zinc-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Payment Protocol</span>
                </h4>
                <p className="text-zinc-700 font-medium">
                  {order.paymentMethod === "cod" ? "Cash on Delivery (Pay upon arrival)" : order.paymentMethod.toUpperCase()}
                </p>
                {order.trxId && (
                  <p className="font-mono text-[11px] text-rose-700 font-bold mt-1">
                    TrxID: {order.trxId}
                  </p>
                )}
                <div className="mt-4 pt-3 border-t border-zinc-100 flex justify-between items-baseline">
                  <span className="font-bold text-zinc-900 text-sm">Grand Total:</span>
                  <span className="text-xl font-bold text-rose-600">৳{order.total}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm mb-8 text-center text-xs text-zinc-500">
            Order received. If details do not load immediately, please contact us on WhatsApp or call <a href="tel:+8801567845417" className="underline font-semibold text-zinc-900">01567-845417</a> with reference <strong className="text-zinc-900">#{orderId}</strong>.
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={`https://wa.me/8801567845417?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-emerald-600 text-white text-xs font-semibold rounded-full hover:bg-emerald-700 transition-colors shadow-md"
          >
            <MessageCircle className="w-4 h-4 stroke-[2]" />
            <span>Confirm Order on WhatsApp</span>
          </a>

          <Link
            href="/collection"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-zinc-950 text-white text-xs font-semibold rounded-full hover:bg-rose-600 transition-colors shadow-md"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
