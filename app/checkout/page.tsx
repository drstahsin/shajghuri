"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAppContext } from "@/context/AppContext";
import { ArrowLeft, ShieldCheck, Truck, CreditCard, CheckCircle2, ChevronRight, Lock } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart, refreshProducts } = useAppContext();

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

  const deliveryFee = deliveryZone === "college_road_pickup" ? 20 : deliveryZone === "inside_narayanganj" ? 60 : 120;
  const grandTotal = cartTotal + deliveryFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (cart.length === 0) {
      setErrorMessage("Your shopping bag is empty.");
      return;
    }

    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      setErrorMessage("Please complete all required fields (Full Name, Phone Number, Delivery Address).");
      return;
    }

    if ((paymentMethod === "bkash" || paymentMethod === "nagad") && !trxId.trim()) {
      setErrorMessage(`Please enter the ${paymentMethod === "bkash" ? "bKash" : "Nagad"} Transaction ID (TrxID) after payment.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        city: city.trim(),
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

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to place order.");
      }

      // Empty cart and refresh local products stock
      clearCart();
      await refreshProducts();

      // Navigate to order confirmation
      router.push(`/order-success/${data.order.id}`);
    } catch (err: any) {
      console.error("Order error:", err);
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

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
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="For order tracking & receipt"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
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
                <span>{isSubmitting ? "Processing Order..." : `Confirm Order (৳${grandTotal})`}</span>
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
