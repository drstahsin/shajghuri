"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAppContext } from "@/context/AppContext";
import { ArrowLeft, ShieldCheck, Truck, CreditCard, CheckCircle2, ChevronRight, Lock, Mail, MessageCircle, Sparkles, ExternalLink, ArrowRight, RotateCcw } from "lucide-react";
import { STORE_PHONE, STORE_WHATSAPP, STORE_EMAIL, formatWhatsAppOrderMessage, getDeliveryZoneLabel } from "@/lib/notifications";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart, refreshProducts, decrementStock } = useAppContext();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Narayanganj");
  const [deliveryZone, setDeliveryZone] = useState<"inside_narayanganj" | "college_road_pickup" | "outside_narayanganj">("inside_narayanganj");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bkash" | "nagad">("cod");
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const last = localStorage.getItem("shajghuri_last_order");
      if (last) {
        const parsed = JSON.parse(last);
        if (parsed && parsed.id) {
          setConfirmedOrder(parsed);
        }
      }
    } catch (e) {
      console.warn("Storage restore error:", e);
    }
    setIsLoaded(true);
  }, []);

  const deliveryFee = deliveryZone === "college_road_pickup" ? 20 : deliveryZone === "inside_narayanganj" ? 60 : 120;
  const grandTotal = cartTotal + deliveryFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (cart.length === 0) {
      setErrorMessage("Your shopping bag is empty.");
      return;
    }

    if (!customerName.trim() || !phone.trim() || !address.trim() || !email.trim()) {
      setErrorMessage("Please complete all required fields: Full Name, Phone Number, Delivery Address, and Email Address.");
      return;
    }

    if ((paymentMethod === "bkash" || paymentMethod === "nagad") && !trxId.trim()) {
      setErrorMessage(`Please enter the ${paymentMethod === "bkash" ? "bKash" : "Nagad"} Transaction ID (TrxID) after payment.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const orderId = `SG-${Math.floor(100000 + Math.random() * 900000)}`;
      const orderPayload = {
        id: orderId,
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        city: city.trim() || "Narayanganj",
        deliveryZone,
        deliveryFee,
        paymentMethod,
        trxId: trxId.trim() ? `${paymentMethod.toUpperCase()}: ${trxId.trim()} (${senderNumber || 'N/A'})` : '',
        notes: notes.trim(),
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        subtotal: cartTotal,
        total: grandTotal,
      };

      // Always save to client-side database backup immediately
      try {
        const existingRaw = localStorage.getItem("shajghuri_orders_backup");
        const existing = existingRaw ? JSON.parse(existingRaw) : [];
        existing.unshift(orderPayload);
        localStorage.setItem("shajghuri_orders_backup", JSON.stringify(existing));
        localStorage.setItem("shajghuri_last_order", JSON.stringify(orderPayload));
      } catch (backupErr) {
        console.warn("Local storage backup warning:", backupErr);
      }

      // Submit to backend API / Server Database
      let serverOrder = orderPayload;
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
        });

        const data = await res.json();
        if (res.ok && data.success && data.order) {
          serverOrder = data.order;
          localStorage.setItem("shajghuri_last_order", JSON.stringify(data.order));
        } else if (!res.ok && data.error) {
          throw new Error(data.error);
        }
      } catch (apiErr: any) {
        // If it's a specific validation error from API, show it
        if (apiErr?.message && !apiErr.message.includes("fetch")) {
          throw apiErr;
        }
        console.warn("Backend API notice (order saved to local database):", apiErr);
      }

      // 1. Save and display the confirmed order IMMEDIATELY so the confirmation interface appears
      setConfirmedOrder(serverOrder);
      try {
        localStorage.setItem("shajghuri_last_order", JSON.stringify(serverOrder));
      } catch (storageErr) {
        console.warn("Storage write error:", storageErr);
      }

      // 2. Decrement product stock in local state immediately so quantity appears 1 lower everywhere
      decrementStock(orderPayload.items);

      // 3. Empty cart
      clearCart();
      setIsSubmitting(false);

      try {
        await refreshProducts();
      } catch {}
    } catch (err: any) {
      console.error("Order error:", err);
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Dedicated "Your Order is Confirmed! Check Your Email" Interface
  const activeOrder = confirmedOrder || (typeof window !== "undefined" ? (() => {
    try {
      const raw = localStorage.getItem("shajghuri_last_order");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })() : null);

  if (activeOrder) {
    const whatsappMessage = formatWhatsAppOrderMessage(activeOrder);
    const whatsappUrl = `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(whatsappMessage)}`;
    const gmailUrl = "https://mail.google.com";

    const handleStartNewOrder = () => {
      try {
        localStorage.removeItem("shajghuri_last_order");
      } catch {}
      setConfirmedOrder(null);
      router.push("/collection");
    };

    return (
      <div className="pt-8 pb-24 bg-[#FDFBF9] min-h-screen">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-8"
          >
            {/* Success Icon */}
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-md">
              <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
            </div>

            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3.5 py-1 rounded-full mb-3 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Order Recorded in Database & Stock Reduced by 1</span>
            </div>

            <h1 className="font-cherry text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-950 mb-2">
              Your Order is Confirmed!
            </h1>
            <p className="text-zinc-600 text-xs sm:text-sm max-w-md mx-auto font-light">
              Order Reference: <span className="font-mono text-zinc-950 font-bold select-all">#{activeOrder.id}</span>
            </p>
          </motion.div>

          {/* Primary "Check Your Email" Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gradient-to-br from-emerald-50 via-white to-amber-50/50 p-6 md:p-8 rounded-2xl border-2 border-emerald-400 shadow-lg mb-8 space-y-5"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Mail className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className="text-2xl font-cherry font-bold text-zinc-950">
                    Check Your Email
                  </h2>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Receipt Sent
                  </span>
                </div>
                <p className="text-xs md:text-sm text-zinc-700 leading-relaxed font-normal">
                  Your order has been confirmed successfully! A full itemized invoice & confirmation receipt has been dispatched to:
                </p>
                <div className="mt-2.5 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-emerald-300 shadow-2xs">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-sm text-zinc-900 select-all">{activeOrder.email}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-2.5">
                  👉 <em>Please check your email inbox (and Spam or Promotions folder if not visible immediately).</em>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <a
                href={gmailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4 stroke-[2]" />
                <span>Open Gmail / Check Email</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 stroke-[2.5]" />
                <span>Send Receipt on WhatsApp</span>
              </a>
            </div>
          </motion.div>

          {/* Purchased Items & Delivery Summary */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-zinc-200 shadow-sm mb-8 space-y-6">
            <div>
              <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-900 mb-4 pb-2 border-b border-zinc-100 flex items-center justify-between">
                <span>Ordered Items</span>
                <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  ✓ Stock automatically reduced
                </span>
              </h3>
              <div className="divide-y divide-zinc-100">
                {activeOrder.items.map((item: any) => (
                  <div key={item.id} className="py-3.5 first:pt-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-14 h-16 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 flex-shrink-0">
                        <Image
                          src={encodeURI(item.image || "/brand-logo-bw.png")}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs md:text-sm text-zinc-900">{item.name}</h4>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Quantity: <span className="font-bold text-zinc-900">{item.quantity}</span> × ৳{item.price}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-zinc-950">৳{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-100 text-xs text-zinc-600">
              <div>
                <span className="font-bold text-zinc-900 block mb-1">Delivering To:</span>
                <p className="leading-relaxed">
                  <span className="font-semibold text-zinc-900">{activeOrder.customerName}</span><br />
                  {activeOrder.address}, {activeOrder.city}<br />
                  Phone: {activeOrder.phone}
                </p>
              </div>
              <div>
                <span className="font-bold text-zinc-900 block mb-1">Payment & Total:</span>
                <p>
                  Method: <span className="font-medium text-zinc-900 uppercase">{activeOrder.paymentMethod}</span><br />
                  Delivery: ৳{activeOrder.deliveryFee} ({getDeliveryZoneLabel(activeOrder.deliveryZone)})<br />
                  <span className="font-bold text-rose-600 text-base mt-1 inline-block">Grand Total: ৳{activeOrder.total}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Action Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/order-success/${activeOrder.id}`}
              className="w-full sm:w-auto px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <span>View Full Order Details Page</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={handleStartNewOrder}
              className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-300 rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Place Another Order / Continue Shopping</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="pt-24 pb-32 container mx-auto px-4 text-center max-w-xl min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-zinc-500 font-light text-xs">Loading checkout...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="pt-24 pb-32 container mx-auto px-4 text-center max-w-xl min-h-[50vh] flex flex-col items-center justify-center">
        <h1 className="font-cherry text-3xl md:text-4xl font-bold mb-3 text-zinc-950">Your Bag is Empty</h1>
        <p className="text-zinc-500 font-light text-xs md:text-sm mb-8">
          Explore our authentic Jhumkas, necklaces, and jewelry before proceeding to checkout.
        </p>
        <Link
          href="/collection"
          className="px-8 py-3 bg-zinc-950 text-white text-xs font-semibold rounded-full hover:bg-rose-600 transition-colors shadow-xs"
        >
          Browse All Jewelry
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-6 pb-24 bg-[#FDFBF9] min-h-screen">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
          <Link href="/" className="hover:text-black">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <Link href="/collection" className="hover:text-black">Jewelry</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-900 font-medium">Checkout</span>
        </nav>

        <div className="mb-8">
          <h1 className="font-cherry text-3xl md:text-4xl font-bold text-zinc-950">
            Secure Checkout
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-1">
            Fill in your delivery address to confirm your jewelry order with Cash on Delivery or bKash / Nagad.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs md:text-sm rounded-xl font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Fields */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Client Information Box */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-zinc-200/90 shadow-2xs space-y-5">
              <h2 className="text-xs uppercase font-bold tracking-wider text-zinc-900 flex items-center gap-2 pb-3 border-b border-zinc-100">
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-[10px]">1</span>
                <span>Customer Contact Information</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    Full Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Farhana Rahman"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    Mobile Number <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 01712345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all font-mono"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5 flex items-center justify-between">
                    <span>
                      Email Address <span className="text-rose-600">*</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 font-normal">
                      Order confirmation & item receipt will be sent here
                    </span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. farhana@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 2. Delivery Address Box */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-zinc-200/90 shadow-2xs space-y-5">
              <h2 className="text-xs uppercase font-bold tracking-wider text-zinc-900 flex items-center gap-2 pb-3 border-b border-zinc-100">
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-[10px]">2</span>
                <span>Delivery Address in Bangladesh</span>
              </h2>

              {/* Delivery Zone Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Inside Narayanganj */}
                <label
                  onClick={() => {
                    setDeliveryZone("inside_narayanganj");
                    if (city === "Outside Narayanganj" || !city) setCity("Narayanganj");
                  }}
                  className={`p-4 rounded-xl cursor-pointer border transition-all flex flex-col justify-between ${
                    deliveryZone === "inside_narayanganj"
                      ? "border-zinc-950 bg-rose-50/40 ring-1 ring-zinc-950"
                      : "border-zinc-200 bg-white hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-zinc-900">Inside Narayanganj</span>
                    <span className="font-bold text-sm text-zinc-950">৳60</span>
                  </div>
                  <span className="text-[11px] text-zinc-500">Home delivery (24–48 hours)</span>
                </label>

                {/* College Road Pickup */}
                <label
                  onClick={() => {
                    setDeliveryZone("college_road_pickup");
                    setCity("Narayanganj");
                    if (!address.trim()) setAddress("College Road Pickup Hub, Narayanganj");
                  }}
                  className={`p-4 rounded-xl cursor-pointer border transition-all flex flex-col justify-between ${
                    deliveryZone === "college_road_pickup"
                      ? "border-zinc-950 bg-emerald-50/50 ring-1 ring-zinc-950"
                      : "border-zinc-200 bg-white hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-zinc-900">College Road Pickup</span>
                    <span className="font-bold text-sm text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">৳20</span>
                  </div>
                  <span className="text-[11px] text-zinc-500">Self-pickup from College Rd Hub</span>
                </label>

                {/* Outside Narayanganj */}
                <label
                  onClick={() => {
                    setDeliveryZone("outside_narayanganj");
                    if (city === "Narayanganj") setCity("");
                    if (address === "College Road Pickup Hub, Narayanganj") setAddress("");
                  }}
                  className={`p-4 rounded-xl cursor-pointer border transition-all flex flex-col justify-between ${
                    deliveryZone === "outside_narayanganj"
                      ? "border-zinc-950 bg-rose-50/40 ring-1 ring-zinc-950"
                      : "border-zinc-200 bg-white hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-zinc-900">Outside Narayanganj</span>
                    <span className="font-bold text-sm text-zinc-950">৳120</span>
                  </div>
                  <span className="text-[11px] text-zinc-500">Nationwide courier (Dhaka & all BD)</span>
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    {deliveryZone === "college_road_pickup" ? "Pickup Point / Contact Address" : "Full Delivery Address"}{" "}
                    <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      deliveryZone === "college_road_pickup"
                        ? "College Road Pickup Hub, Narayanganj"
                        : "House / Flat No., Road No., Area or Landmark"
                    }
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                      District / City
                    </label>
                    <input
                      type="text"
                      placeholder={
                        deliveryZone === "inside_narayanganj" || deliveryZone === "college_road_pickup"
                          ? "Narayanganj"
                          : "e.g. Dhaka, Chattogram, Sylhet, Gazipur"
                      }
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                      Delivery Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Call before delivery"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Payment Method Box */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-zinc-200/90 shadow-2xs space-y-5">
              <h2 className="text-xs uppercase font-bold tracking-wider text-zinc-900 flex items-center gap-2 pb-3 border-b border-zinc-100">
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-[10px]">3</span>
                <span>Select Payment Protocol</span>
              </h2>

              <div className="space-y-3">
                {/* Cash on Delivery */}
                <label
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-4 rounded-xl block cursor-pointer border transition-all ${
                    paymentMethod === "cod"
                      ? "border-zinc-950 bg-rose-50/40 ring-1 ring-zinc-950"
                      : "border-zinc-200 bg-white hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-zinc-900 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-emerald-600" /> Cash on Delivery (COD)
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      Pay on Delivery
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-light">
                    Pay our delivery courier agent in cash after inspecting your packaged ornaments.
                  </p>
                </label>

                {/* bKash */}
                <label
                  onClick={() => setPaymentMethod("bkash")}
                  className={`p-4 rounded-xl block cursor-pointer border transition-all ${
                    paymentMethod === "bkash"
                      ? "border-zinc-950 bg-rose-50/40 ring-1 ring-zinc-950"
                      : "border-zinc-200 bg-white hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-zinc-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-rose-600" /> bKash Personal / Send Money
                    </span>
                    <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                      Instant Confirmation
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-light">
                    Send payment via bKash to our official number for fast priority dispatch.
                  </p>
                </label>

                {/* Nagad */}
                <label
                  onClick={() => setPaymentMethod("nagad")}
                  className={`p-4 rounded-xl block cursor-pointer border transition-all ${
                    paymentMethod === "nagad"
                      ? "border-zinc-950 bg-rose-50/40 ring-1 ring-zinc-950"
                      : "border-zinc-200 bg-white hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-zinc-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-amber-600" /> Nagad Payment
                    </span>
                    <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                      Send Money
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-light">
                    Send payment through Nagad to confirm your jewelry acquisition.
                  </p>
                </label>
              </div>

              {/* bKash / Nagad Details Form */}
              {(paymentMethod === "bkash" || paymentMethod === "nagad") && (
                <div className="mt-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-4">
                  <div className="border-b border-zinc-200 pb-3">
                    <p className="text-xs font-bold text-zinc-900">
                      Send <span className="text-rose-600 font-bold">৳{grandTotal}</span> to our official number:
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-lg font-bold text-zinc-950 select-all tracking-wide">
                        01617398085
                      </span>
                      <span className="text-[10px] bg-rose-100 text-rose-700 font-semibold px-2 py-0.5 rounded">
                        bKash & Nagad Personal
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Use &quot;Send Money&quot; to <strong className="text-zinc-800">01617398085</strong>. For quick assistance, call hotline <a href="tel:+8801567845417" className="underline font-semibold text-zinc-800">01567-845417</a>.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">
                        Your {paymentMethod === "bkash" ? "bKash" : "Nagad"} Number
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 018XXXXXXXX"
                        value={senderNumber}
                        onChange={(e) => setSenderNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-mono focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">
                        Transaction ID (TrxID) <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 9J4K2L1M"
                        value={trxId}
                        onChange={(e) => setTrxId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-mono uppercase focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Order Summary Sidebar */}
          <div className="lg:col-span-5">
            <div className="sticky top-32 bg-white p-6 md:p-8 rounded-2xl border border-zinc-200/90 shadow-sm space-y-6">
              <h2 className="text-xs uppercase font-bold tracking-wider text-zinc-900 pb-3 border-b border-zinc-100 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-zinc-500 font-normal">({cart.length} items)</span>
              </h2>

              {/* Items List */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto divide-y divide-zinc-100 pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                    <div className="relative w-14 h-16 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 flex-shrink-0">
                      <Image src={encodeURI(item.image || "/brand-logo-bw.png")} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-xs text-zinc-900 truncate leading-snug">{item.name}</h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        Qty: {item.quantity} × ৳{item.price}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-zinc-950">
                      ৳{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculations */}
              <div className="pt-4 border-t border-zinc-100 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-900">৳{cartTotal}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>
                    Delivery (
                    {deliveryZone === "college_road_pickup"
                      ? "College Rd Pickup"
                      : deliveryZone === "inside_narayanganj"
                      ? "Inside Narayanganj"
                      : "Outside Narayanganj"}
                    )
                  </span>
                  <span className="font-semibold text-zinc-900">৳{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-zinc-950 pt-3 border-t border-zinc-200 text-base font-bold">
                  <span>Total Payable</span>
                  <span className="text-xl text-rose-600 font-bold">৳{grandTotal}</span>
                </div>
              </div>

              {/* Inline Error Notice */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-start gap-2">
                  <span className="text-rose-600 font-bold">⚠️</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                  isSubmitting
                    ? "bg-zinc-300 text-zinc-500 cursor-not-allowed"
                    : "bg-zinc-950 text-white hover:bg-rose-600 hover:shadow-lg"
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Confirming Order..." : `Confirm Order (৳${grandTotal})`}</span>
              </button>

              {/* Trust Notes */}
              <div className="pt-4 border-t border-zinc-100 space-y-2 text-[11px] text-zinc-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>100% Handcrafted Artisan Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Delivery in Signature Packaging Box</span>
                </div>
              </div>

            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
