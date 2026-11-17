import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Truck, ShieldCheck, HeartHandshake } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-zinc-950 text-white pt-16 pb-12 border-t border-zinc-800 mt-auto">
      {/* Top Features / Trust Strip (Ariano Style) */}
      <div className="container mx-auto px-6 md:px-12 pb-16 border-b border-zinc-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-rose-400 flex-shrink-0">
            <Truck className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-zinc-100">Nationwide Delivery</h4>
            <p className="text-xs text-zinc-400 mt-0.5">Narayanganj ৳60 | College Rd Pickup ৳20 | Outside ৳120</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 flex-shrink-0">
            <ShieldCheck className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-zinc-100">100% Quality Assured</h4>
            <p className="text-xs text-zinc-400 mt-0.5">Carefully inspected artisan pieces</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <HeartHandshake className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-zinc-100">Cash on Delivery</h4>
            <p className="text-xs text-zinc-400 mt-0.5">Pay upon checking the package</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-purple-400 flex-shrink-0">
            <Phone className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-zinc-100">Dedicated Support</h4>
            <p className="text-xs text-zinc-400 mt-0.5">01567-845417 (10 AM - 10 PM)</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto px-6 md:px-12 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
        {/* Brand Column with Logo */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-zinc-700 bg-white">
              <Image
                src="/brand-logo-bw.png"
                alt="Shajghuri Emblem"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <span className="font-cherry text-3xl font-bold text-white tracking-tight block">
                Shajghuri
              </span>
              <span className="text-xs text-rose-400 font-medium tracking-widest uppercase">
                Fashion Jewelry & Ornaments
              </span>
            </div>
          </div>

          <p className="text-zinc-400 text-xs md:text-sm leading-relaxed max-w-sm font-light">
            Shajghuri brings you timeless handcrafted jewelry inspired by tradition and modern elegance. From authentic Jhumkas to stylish neckpieces, we craft pieces you will cherish forever.
          </p>

          <div className="space-y-2 text-xs text-zinc-300">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>Dhaka & Narayanganj, Bangladesh</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <a href="tel:+8801567845417" className="hover:text-white transition-colors">
                Hotline & WhatsApp: 01567-845417
              </a>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <a href="mailto:shajghuri@gmail.com" className="hover:text-white transition-colors">
                shajghuri@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Categories Column */}
        <div className="lg:col-span-2 lg:col-start-7">
          <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-zinc-200 mb-5">
            Jewelry Categories
          </h4>
          <ul className="space-y-3 text-xs text-zinc-400">
            <li><Link href="/collection?category=Jhumkas" className="hover:text-rose-400 transition-colors">Traditional Jhumkas</Link></li>
            <li><Link href="/collection?category=Bracelets" className="hover:text-rose-400 transition-colors">Bracelets & Bangles</Link></li>
            <li><Link href="/collection?category=Necklaces" className="hover:text-rose-400 transition-colors">Necklaces & Chokers</Link></li>
            <li><Link href="/collection?category=Pendants" className="hover:text-rose-400 transition-colors">Pendants & Charms</Link></li>
            <li><Link href="/collection?category=Earrings" className="hover:text-rose-400 transition-colors">Earrings & Studs</Link></li>
            <li><Link href="/collection" className="hover:text-rose-400 transition-colors">Full Archive</Link></li>
          </ul>
        </div>

        {/* Customer Care Column */}
        <div className="lg:col-span-2">
          <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-zinc-200 mb-5">
            Client Services
          </h4>
          <ul className="space-y-3 text-xs text-zinc-400">
            <li><Link href="/checkout" className="hover:text-rose-400 transition-colors">Instant Checkout</Link></li>
            <li><Link href="/about" className="hover:text-rose-400 transition-colors">Our Brand Heritage</Link></li>
            <li><Link href="/contact" className="hover:text-rose-400 transition-colors">Order Inquiries & WhatsApp</Link></li>
            <li><Link href="/admin" className="hover:text-rose-400 transition-colors">Admin Atelier</Link></li>
          </ul>
        </div>

        {/* Payment & Security Column (Ariano Style) */}
        <div className="lg:col-span-2">
          <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-zinc-200 mb-5">
            Payment Methods
          </h4>
          <p className="text-xs text-zinc-400 mb-2 leading-relaxed font-light">
            We accept secure payments across Bangladesh:
          </p>
          <div className="flex flex-wrap gap-2 text-xs mb-3">
            <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-300 font-mono text-[10px]">
              bKash
            </span>
            <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-300 font-mono text-[10px]">
              Nagad
            </span>
            <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-300 font-mono text-[10px]">
              COD
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-light">
            bKash & Nagad: <span className="font-mono text-zinc-200 font-medium select-all">01617398085</span>
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="container mx-auto px-6 md:px-12 pt-8 border-t border-zinc-800/80 flex flex-col md:flex-row justify-between items-center text-xs text-zinc-500 gap-4">
        <p>&copy; {new Date().getFullYear()} Shajghuri. All rights reserved.</p>
        <p className="text-zinc-500 text-center">
          Designed with love for Bangladeshi traditional & contemporary jewelry lovers.
        </p>
      </div>
    </footer>
  );
}
