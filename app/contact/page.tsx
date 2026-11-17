"use client";

import { Phone, Mail, MapPin, MessageCircle, Send, CheckCircle2, CreditCard } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          contact: form.get("contact"),
          subject: form.get("subject"),
          message: form.get("message"),
          website: form.get("website"),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Your message could not be sent.");
      setSubmitted(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Your message could not be sent.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-10 pb-24 bg-[#FDFBF9] min-h-screen">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl">
        <div className="text-center mb-12">
          <div className="relative w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden border-2 border-zinc-300 shadow-sm bg-white">
            <Image src="/brand-logo-bw.png" alt="Shajghuri" fill className="object-cover" />
          </div>
          <span className="text-xs uppercase font-semibold text-rose-600 tracking-widest block mb-1">
            Customer Support & Studio
          </span>
          <h1 className="font-cherry text-4xl sm:text-5xl font-bold text-zinc-950">
            Contact Shajghuri Atelier
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 max-w-md mx-auto mt-2 font-light">
            Have a question about a product, bulk orders, custom jhumka sets, or delivery schedule? We are here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Contact Info */}
          <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-2xl border border-zinc-200/90 shadow-2xs space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 pb-3 border-b border-zinc-100">
              Direct Contact Details
            </h2>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900">Phone Hotline</h4>
                  <a href="tel:+8801567845417" className="text-zinc-700 hover:text-black font-semibold mt-0.5 block">01567-845417</a>
                  <p className="text-[10px] text-zinc-400">Available 10:00 AM – 10:00 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900">WhatsApp Instant Chat</h4>
                  <a
                    href="https://wa.me/8801567845417"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 font-semibold hover:underline mt-0.5 block"
                  >
                    Chat on WhatsApp (+880 1567-845417) →
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900">Email Inquiries</h4>
                  <a href="mailto:shajghuri@gmail.com" className="text-zinc-700 hover:text-black font-semibold mt-0.5 block">
                    shajghuri@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900">bKash & Nagad Payment</h4>
                  <p className="font-mono text-zinc-900 font-bold mt-0.5 select-all">01617398085</p>
                  <p className="text-[10px] text-zinc-400">Personal / Send Money</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900">Main Studio Location</h4>
                  <p className="text-zinc-600 mt-0.5 leading-relaxed">
                    Tanbazer & Gulshan, Dhaka & Narayanganj, Bangladesh.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Message Form */}
          <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl border border-zinc-200/90 shadow-2xs">
            {submitted ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h3 className="font-cherry text-2xl font-bold text-zinc-950">Message Sent!</h3>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  Thank you for reaching out. Our customer care team will respond via phone or email shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 pb-3 border-b border-zinc-100">
                  Send an Inquiry
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      maxLength={100}
                      placeholder="e.g. Farhana"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:border-rose-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Phone or Email</label>
                    <input
                      type="text"
                      name="contact"
                      required
                      maxLength={254}
                      placeholder="e.g. 017XXXXXXXX"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:border-rose-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    required
                    maxLength={120}
                    placeholder="e.g. Custom Jhumka order inquiry"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:border-rose-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Message</label>
                  <textarea
                    rows={4}
                    name="message"
                    required
                    maxLength={3000}
                    placeholder="Tell us what you are looking for..."
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:border-rose-500 focus:bg-white"
                  />
                </div>

                {errorMessage && <p role="alert" className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{errorMessage}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-zinc-950 text-white rounded-full text-xs font-semibold hover:bg-rose-600 transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? "Sending..." : "Submit Message"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
