"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAppContext } from "@/context/AppContext";
import type { Order } from "@/lib/db";
import { ShieldCheck, CreditCard, CheckCircle2, ChevronRight, Lock, Mail, MessageCircle, Sparkles, ExternalLink, ArrowRight, RotateCcw } from "lucide-react";
import { STORE_BKASH_NAGAD, STORE_WHATSAPP, STORE_EMAIL, formatWhatsAppOrderMessage, getDeliveryZoneLabel } from "@/lib/notifications";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart, refreshProducts } = useAppContext();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Narayanganj");
  const [deliveryZone, setDeliveryZone] = useState<"inside_narayanganj" | "college_road_pickup" | "outside_narayanganj">("inside_narayanganj");
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad">("bkash");
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    void Promise.resolve().then(() => setIsLoaded(true));
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

    if (!senderNumber.trim()) {
      setErrorMessage("Please enter the mobile number you used to pay the delivery fee.");
      return;
    }

    if (!trxId.trim()) {
      setErrorMessage(`Please enter the ${paymentMethod === "bkash" ? "bKash" : "Nagad"} transaction ID for your delivery-fee payment.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        city: city.trim() || "Narayanganj",
        deliveryZone,
        deliveryFee,
        paymentMethod,
        senderNumber: senderNumber.trim(),
        trxId: trxId.trim(),
        notes: notes.trim(),
        items: cart.map(item => ({
          id: item.id,
          quantity: item.quantity,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.order || !data.accessToken) {
        throw new Error(data.error || "We could not save your order. Please try again.");
      }

      setConfirmedOrder(data.order);
      try {
        sessionStorage.setItem(`shajghuri_order_access:${data.order.id}`, data.accessToken);
      } catch {
        // The confirmation remains visible for this page session.
      }

      clearCart();
      setIsSubmitting(false);
      await refreshProducts();
    } catch (err: unknown) {
      console.error("Order error:", err);
      setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Customer order receipt
  const activeOrder = confirmedOrder;

  if (activeOrder) {
    const whatsappMessage = formatWhatsAppOrderMessage(activeOrder);
    const whatsappUrl = `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(whatsappMessage)}`;
    const contactEmailUrl = `mailto:${STORE_EMAIL}?subject=${encodeURIComponent(`Order ${activeOrder.id}`)}`;

    const handleStartNewOrder = () => {
      try {
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
              <span>Order Received · Delivery Fee Verification Pending</span>
            </div>

            <h1 className="font-cherry text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-950 mb-2">
              Your Order Has Been Received
            </h1>
            <p className="text-zinc-600 text-xs sm:text-sm max-w-md mx-auto font-light">
              Order Reference: <span className="font-mono text-zinc-950 font-bold select-all">#{activeOrder.id}</span>
            </p>
          </motion.div>

          {/* Order next steps */}
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
                    What Happens Next
                  </h2>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Delivery Fee Pending Verification
                  </span>
                </div>
                <p className="text-xs md:text-sm text-zinc-700 leading-relaxed font-normal">
                  Our team will verify your delivery-fee payment before confirming the order. Keep your order reference for follow-up:
                </p>
                <div className="mt-2.5 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-emerald-300 shadow-2xs">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-sm text-zinc-900 select-all">{activeOrder.email}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-2.5">
                  We have your email address for order updates. You can also contact us directly if you need help.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <a
                href={contactEmailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4 stroke-[2]" />
                <span>Email Shajghuri</span>
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
                {activeOrder.items.map((item) => (
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
                  Fee payment: <span className="font-medium text-zinc-900 uppercase">{activeOrder.paymentMethod}</span><br />
                  Delivery fee to verify: ৳{activeOrder.deliveryFee} ({getDeliveryZoneLabel(activeOrder.deliveryZone)})<br />
                  Jewelry balance due in cash on delivery: ৳{activeOrder.subtotal}<br />
                  <span className="font-bold text-rose-600 text-base mt-1 inline-block">Total order value: ৳{activeOrder.total}</span>
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
              Pay the delivery fee by bKash or Nagad to submit your order. The jewelry subtotal is due in cash when it arrives.
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
                      We will use this for order updates
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
                {/* bKash delivery-fee advance */}
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
                      <CreditCard className="w-4 h-4 text-rose-600" /> bKash delivery-fee payment
                    </span>
                    <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                      ৳{deliveryFee} now
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-light">
                    Send only the delivery fee now. Pay the jewelry subtotal in cash to the courier on delivery.
                  </p>
                </label>

                {/* Nagad delivery-fee advance */}
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
                      <CreditCard className="w-4 h-4 text-amber-600" /> Nagad delivery-fee payment
                    </span>
                    <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                      ৳{deliveryFee} now
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-light">
                    Send only the delivery fee now. Pay the jewelry subtotal in cash to the courier on delivery.
                  </p>
                </label>
              </div>

              {/* Required delivery-fee advance */}
              <div className="mt-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-4">
                <div className="border-b border-zinc-200 pb-3">
                  <p className="text-xs font-bold text-zinc-900">
                    Send <span className="text-rose-600 font-bold">৳{deliveryFee} only</span> by {paymentMethod === "bkash" ? "bKash" : "Nagad"} to:
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-lg font-bold text-zinc-950 select-all tracking-wide">{STORE_BKASH_NAGAD}</span>
                    <span className="text-[10px] bg-rose-100 text-rose-700 font-semibold px-2 py-0.5 rounded">Send Money</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 mt-2">
                    Your order stays pending until we verify this payment. The jewelry subtotal of <strong>৳{cartTotal}</strong> is paid in cash to the courier on delivery.
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    For assistance, call hotline <a href="tel:+8801567845417" className="underline font-semibold text-zinc-800">01567-845417</a>.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Number you paid from <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 01XXXXXXXXX"
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-mono focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Delivery-fee transaction ID <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter the ID from your payment receipt"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-mono uppercase focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>
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
                  <span>Jewelry subtotal (cash on delivery)</span>
                  <span className="font-semibold text-zinc-900">৳{cartTotal}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>
                    Delivery fee (pay now) (
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
                  <span>Total order value</span>
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
                <span>{isSubmitting ? "Submitting Order..." : `Submit Order · Pay ৳${deliveryFee} Now`}</span>
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
