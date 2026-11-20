"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { api, ensureApiToken } from "@/lib/api";
import PizzaHubLogo from "./pizzahub-logo";

interface PolicyModalInfo {
  title: string;
  icon: string;
  content: string[];
}

const POLICY_DATA: Record<string, PolicyModalInfo> = {
  about: {
    title: "About PizzaHub",
    icon: "🍕",
    content: [
      "PizzaHub is New York's premier multi-vendor artisan pizza network, connecting foodies with passionate local pizzaiolos.",
      "Every pizzeria on our platform is verified for craftsmanship — fermenting naturally leavened sourdough for 48–72 hours and baking at 900°F in wood-fired or stone ovens.",
      "Our mission is to empower independent kitchens with modern digital ordering tools while delivering true Neapolitan and gourmet pizza perfection to your doorstep.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    icon: "🔒",
    content: [
      "Your privacy is critically important to us. PizzaHub collects only the minimum necessary information (name, delivery address, and contact details) required to fulfill your orders.",
      "Payment transactions are processed securely through Stripe with 256-bit encryption. PizzaHub never stores your raw credit card numbers or banking credentials.",
      "We never sell, rent, or trade your personal data with third-party advertisers. All location data is strictly used for delivery routing.",
    ],
  },
  terms: {
    title: "Terms of Service",
    icon: "📜",
    content: [
      "By using PizzaHub as a customer or pizzeria vendor, you agree to comply with platform guidelines, timely order preparation, and respectful communication.",
      "Vendor Quota Policy: Free starter vendors may publish up to 3 active menu items. Gold Premium Kitchen subscribers enjoy unlimited menu listings.",
      "All pizza menu descriptions, prices, and allergen disclosures are managed and certified by the respective partner kitchen.",
    ],
  },
  refunds: {
    title: "Refund & Cancellation Policy",
    icon: "🔄",
    content: [
      "Customer Satisfaction Guarantee: If an order arrives damaged, incorrect, or cold due to courier delay, you are entitled to a full refund or immediate replacement.",
      "Cancellations: Orders may be cancelled free of charge before the partner kitchen begins stretching the dough (within 5 minutes of placing the order).",
      "Refund requests can be submitted via your order tracking screen or by contacting support@pizzahub.com with your order ID.",
    ],
  },
  allergens: {
    title: "Food Safety & Allergen Notice",
    icon: "🌿",
    content: [
      "Our partner kitchens prepare items containing wheat gluten, dairy (buffalo mozzarella, Parmigiano Reggiano, gorgonzola), nuts (pistachios, pine nuts), and cured meats.",
      "If you have severe food allergies or celiac disease, please contact the specific pizzeria kitchen before placing your order.",
      "Look for the 🌱 Vegetarian and 🔥 Spicy badges on our menu cards for quick dietary guidance.",
    ],
  },
};

export default function Footer() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);

  useEffect(() => {
    if (user?.email && !newsletterEmail) {
      setNewsletterEmail(user.email);
    }
  }, [user]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setAuthRequired(false);

    if (!user) {
      setAuthRequired(true);
      return;
    }

    const emailToSubmit = (newsletterEmail || user.email || "").trim();
    if (!emailToSubmit) return;

    setLoading(true);
    try {
      await ensureApiToken();
      const res = await api.post<{ message?: string; alreadyJoined?: boolean }>("/vip/join", {
        email: emailToSubmit,
      });

      if (res.success) {
        setSubscribed(true);
        setMessage(res.message || "Welcome to the PizzaHub VIP Club!");
      } else {
        setMessage(res.message || "Could not join VIP Club. Please try again.");
      }
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Error joining VIP club.");
    } finally {
      setLoading(false);
    }
  };

  const currentPolicy = activeModal ? POLICY_DATA[activeModal] : null;

  return (
    <footer className="mt-auto border-t border-zinc-800/90 bg-[#0a0a0d] text-zinc-400">
      {/* Main Footer Links Grid */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Column 1: Brand & Mission */}
          <div className="lg:col-span-2">
            <PizzaHubLogo size="md" />
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-zinc-400">
              The premier multi-vendor marketplace connecting wood-fired artisan kitchens with true pizza connoisseurs across New York.
            </p>

            {/* Live Operational Status */}
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span>All Pizzerias Live & Baking (900°F)</span>
            </div>

            {/* Social Icons */}
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-300 transition hover:border-amber-500 hover:text-amber-400"
                aria-label="PizzaHub on X"
              >
                𝕏
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-300 transition hover:border-amber-500 hover:text-amber-400"
                aria-label="PizzaHub on Instagram"
              >
                📸
              </a>
              <a
                href="https://github.com/babulpro/PizzaHub-Server"
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-300 transition hover:border-amber-500 hover:text-amber-400"
                aria-label="PizzaHub GitHub"
              >
                💻
              </a>
            </div>
          </div>

          {/* Column 2: Explore Menu */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Explore Menu
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link href="/menu" className="transition hover:text-amber-400">
                  All 15+ Artisan Pizzas
                </Link>
              </li>
              <li>
                <Link href="/menu" className="transition hover:text-amber-400">
                  Classic Neapolitan Pizzas
                </Link>
              </li>
              <li>
                <Link href="/menu" className="transition hover:text-amber-400">
                  Gourmet & Truffle Pies
                </Link>
              </li>
              <li>
                <Link href="/menu" className="transition hover:text-amber-400">
                  Spicy Calabrese Specials
                </Link>
              </li>
              <li>
                <Link href="/deals" className="inline-flex items-center gap-1 font-semibold text-amber-400 transition hover:text-amber-300">
                  <span>🔥 Hot Deals & Promo Codes</span>
                </Link>
              </li>
              <li>
                <Link href="/menu" className="inline-flex items-center gap-1 font-semibold text-zinc-300 transition hover:text-white">
                  <span>Order Now</span>
                  <span>→</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Pizzeria Partners */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Pizzeria Partners
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link href="/sign-up?role=vendor" className="transition hover:text-amber-400">
                  Partner As Pizzeria
                </Link>
              </li>
              <li>
                <Link href="/sign-in" className="transition hover:text-amber-400">
                  Vendor Portal Login
                </Link>
              </li>
              <li>
                <Link href="/dashboard/vendor/subscription" className="transition hover:text-amber-400">
                  Free vs. Premium Kitchen
                </Link>
              </li>
              <li>
                <Link href="/dashboard/vendor/subscription" className="transition hover:text-amber-400">
                  3-Item Quota Guidelines
                </Link>
              </li>
              <li>
                <Link href="/dashboard/vendor/subscription" className="inline-flex items-center gap-1 font-semibold text-orange-400 transition hover:underline">
                  <span>★ Gold Subscription</span>
                  <span>→</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Important Links & Legal Policies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Important Links
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal("about")}
                  className="text-left transition hover:text-amber-400"
                >
                  About PizzaHub
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal("privacy")}
                  className="text-left transition hover:text-amber-400"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal("terms")}
                  className="text-left transition hover:text-amber-400"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal("refunds")}
                  className="text-left transition hover:text-amber-400"
                >
                  Refund & Cancellation Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal("allergens")}
                  className="text-left transition hover:text-amber-400"
                >
                  Food Safety & Allergens
                </button>
              </li>
              <li>
                <a
                  href="mailto:support@pizzahub.com"
                  className="inline-flex items-center gap-1 text-zinc-300 transition hover:text-amber-400"
                >
                  <span>✉️ Support & FAQ</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter / VIP Club Subscription Strip */}
        <div id="vip" className="mt-12 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-md">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300">
                  Exclusive Community
                </span>
                <span className="text-[11px] text-zinc-500">• 100% Free Forever</span>
              </div>
              <h5 className="text-base font-bold text-white mt-1">
                Join the PizzaHub VIP Club 🍕
              </h5>
              <p className="mt-1 text-xs text-zinc-400">
                Receive secret weekend drops, discount codes, and invitations to artisan pop-up tastings.
              </p>
            </div>

            {subscribed ? (
              <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-4 py-2.5 text-xs font-semibold text-emerald-400">
                <span>✓</span>
                <span>{message || "You're on the VIP Pizza List!"}</span>
              </div>
            ) : authRequired ? (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <span className="text-xs text-amber-400 font-medium">
                  🔒 You must be signed in to join the VIP Club.
                </span>
                <Link
                  href="/sign-in?callbackUrl=/#vip"
                  className="rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:opacity-95 text-center shrink-0"
                >
                  Sign In to Join →
                </Link>
                <button
                  type="button"
                  onClick={() => setAuthRequired(false)}
                  className="text-xs text-zinc-500 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex w-full max-w-sm items-center gap-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="shrink-0 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:brightness-110 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Joining..." : "Join Free"}
                </button>
              </form>
            )}
          </div>
          {message && !subscribed && (
            <p className="mt-2 text-xs text-red-400">{message}</p>
          )}
        </div>

        {/* Bottom Bar: Copyright & Security */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-850 pt-8 text-xs text-zinc-500 sm:flex-row">
          <p>© 2026 PizzaHub Inc. Handcrafted with passion. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>🔒 256-Bit SSL Encrypted</span>
            <span>•</span>
            <span>Powered by Stripe</span>
            <span>•</span>
            <span>Delivery: Manhattan • Brooklyn • Queens</span>
          </div>
        </div>
      </div>

      {/* Interactive Policy Modal (About / Privacy / Terms / Refunds / Allergens) */}
      {currentPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-[#141418] p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{currentPolicy.icon}</span>
                <h3 className="text-lg font-bold text-white">
                  {currentPolicy.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div className="mt-4 space-y-3 text-xs leading-relaxed text-zinc-300">
              {currentPolicy.content.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* Close Button */}
            <div className="mt-6 border-t border-zinc-800/80 pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl bg-zinc-800 px-5 py-2 text-xs font-semibold text-white transition hover:bg-zinc-700"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
