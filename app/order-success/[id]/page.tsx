"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, MessageCircle, Truck, MapPin, Phone, Mail, Sparkles } from "lucide-react";
import { Order } from "@/lib/db";
import { formatWhatsAppOrderMessage, STORE_PHONE, STORE_WHATSAPP, STORE_EMAIL, getDeliveryZoneLabel } from "@/lib/notifications";

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Try fetching from server database
    fetch("/api/orders")
      .then((res) => res.json())
      .then((orders: Order[]) => {
        if (Array.isArray(orders)) {
          const found = orders.find((o) => o.id === orderId);
          if (found) {
            setOrder(found);
            setLoading(false);
            return;
          }
        }
        fallbackToLocalStorage();
      })
      .catch((err) => {
        console.warn("API load error, checking local database backup:", err);
        fallbackToLocalStorage();
      });

    function fallbackToLocalStorage() {
      try {
        const lastOrderRaw = localStorage.getItem("shajghuri_last_order");
        if (lastOrderRaw) {
          const parsed = JSON.parse(lastOrderRaw);
          if (parsed && (parsed.id === orderId || !orderId)) {
            setOrder(parsed);
            setLoading(false);
            return;
          }
        }

        const backupRaw = localStorage.getItem("shajghuri_orders_backup");
        if (backupRaw) {
          const backupList = JSON.parse(backupRaw);
          if (Array.isArray(backupList)) {
            const found = backupList.find((o) => o.id === orderId);
            if (found) {
              setOrder(found);
              setLoading(false);
              return;
            }
          }
        }
      } catch (e) {
        console.warn("Storage fallback error:", e);
      }
      setLoading(false);
    }
  }, [orderId]);

  const whatsappMessage = order
    ? formatWhatsAppOrderMessage(order)
    : `Hello Shajghuri! I placed order #${orderId}. Please confirm my jewelry delivery schedule.`;

  const whatsappUrl = `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(whatsappMessage)}`;
  const emailSubject = encodeURIComponent(`[Order #${orderId}] ৳${order?.total || ''} - ${order?.customerName || 'Customer Order'}`);
  const emailUrl = `mailto:${STORE_EMAIL}?subject=${emailSubject}&body=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="pt-10 pb-24 bg-[#FDFBF9] min-h-screen">
      <div className="container mx-auto px-4 md:px-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-8"
        >
          {/* Brand Logo & Success Icon */}
          <div className="relative w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-2 border-zinc-300 shadow-md bg-white">
            <Image src="/brand-logo-bw.png" alt="Shajghuri" fill className="object-cover" />
          </div>

          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3.5 py-1 rounded-full mb-3 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>Order Confirmed & Stock Automatically Updated</span>
          </div>

          <h1 className="font-cherry text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-950 mb-2">
            Your Order is Confirmed!
          </h1>
          <p className="text-zinc-600 text-xs md:text-sm max-w-md mx-auto font-light">
            Order Reference: <span className="font-mono text-zinc-950 font-bold select-all">#{orderId}</span>
          </p>
        </motion.div>

        {/* Primary "Check Your Email" Banner */}
        <div className="bg-gradient-to-br from-emerald-50 via-white to-amber-50/50 p-6 md:p-8 rounded-2xl border-2 border-emerald-300 shadow-md mb-8 space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Mail className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="text-lg md:text-xl font-cherry font-bold text-zinc-950">
                  Check Your Email
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Confirmation Sent
                </span>
              </div>
              <p className="text-xs md:text-sm text-zinc-700 font-light leading-relaxed">
                An official order confirmation & item receipt has been dispatched to:
              </p>
              {order?.email && (
                <div className="mt-2 inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-lg border border-emerald-200 shadow-2xs">
                  <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-semibold text-xs text-zinc-900 select-all">{order.email}</span>
                </div>
              )}
              <p className="text-[11px] text-zinc-500 mt-2 italic">
                * Please check your inbox and Spam/Promotions folder if you don't see it immediately.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <a
              href="https://mail.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Mail className="w-4 h-4 stroke-[2]" />
              <span>Open Gmail / Check Inbox</span>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 stroke-[2.5]" />
              <span>Send Receipt on WhatsApp</span>
            </a>
          </div>

          <div className="pt-2 border-t border-zinc-200/60 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Direct Call Hotline:</span>
            <a href={`tel:+88${STORE_PHONE}`} className="font-semibold text-zinc-900 hover:underline">
              +880 1567-845417
            </a>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-zinc-400 text-xs uppercase tracking-wider">
            Loading order details from database...
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
                  {order.city} ({getDeliveryZoneLabel(order.deliveryZone)})<br />
                  <span className="text-zinc-500 block mt-1">Phone: {order.phone}</span>
                  {order.email && <span className="text-zinc-500 block">Email: {order.email}</span>}
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-zinc-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Payment Protocol</span>
                </h4>
                <p className="text-zinc-700 font-medium">
                  {order.paymentMethod === "cod" ? "Cash on Delivery (Pay upon arrival)" : `${order.paymentMethod.toUpperCase()} (Personal / Send Money)`}
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
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-zinc-200 shadow-sm mb-8 text-center text-xs text-zinc-500">
            Order confirmed with reference <strong className="text-zinc-900">#{orderId}</strong>. You can reach out directly via WhatsApp or call <a href={`tel:+88${STORE_PHONE}`} className="underline font-semibold text-zinc-900">+{STORE_PHONE}</a>.
          </div>
        )}

        {/* Continue Shopping Button */}
        <div className="text-center">
          <Link
            href="/collection"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-zinc-950 text-white text-xs font-semibold rounded-full hover:bg-rose-600 transition-colors shadow-md"
          >
            <span>Continue Shopping All Ornaments</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
