"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";

export default function VendorSpotlight() {
  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;
  const isVendor = user?.role === "vendor";

  return (
    <section
      id="vendor-spotlight"
      className="relative py-20 px-4 sm:px-6 lg:px-8 border-y border-zinc-850 bg-gradient-to-b from-[#101014] via-[#14141a] to-[#0c0c0e]"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-400 backdrop-blur-md">
            <span>👨‍🍳</span>
            <span>FOR PIZZERIA OWNERS & CHEFS</span>
          </div>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
            Grow Your Pizzeria Business With PizzaHub
          </h2>
          <p className="mt-3 max-w-2xl text-base text-zinc-400 sm:text-lg">
            Connect directly with thousands of passionate pizza lovers. Start free with up to 3 signature pies, or unlock unlimited scale with Premium Kitchen.
          </p>
        </div>

        {/* Pricing & Tier Comparison Cards */}
        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:max-w-4xl lg:mx-auto">
          {/* Free Starter Tier */}
          <div className="relative flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-xl backdrop-blur-md transition-all hover:border-zinc-700">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-zinc-800 px-3 py-1 text-xs font-bold text-zinc-300">
                  STARTER KITCHEN
                </span>
                <span className="text-xs text-zinc-400">Zero Upfront Cost</span>
              </div>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-xs text-zinc-400">/ forever</span>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                Ideal for pop-ups, boutique bakeries, and emerging pizzaiolos getting started.
              </p>

              {/* Features List */}
              <ul className="mt-6 space-y-3 text-xs text-zinc-300">
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Publish up to <strong>3 signature pizza items</strong></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Standard search listing in your city</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Live order receipt and kitchen notifications</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Dedicated Vendor Dashboard access</span>
                </li>
                <li className="flex items-center gap-2.5 text-zinc-500">
                  <span>✕</span>
                  <span>No featured badges or unlimited items</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-800">
              {isVendor ? (
                <Link
                  href="/dashboard/vendor"
                  className="block w-full text-center rounded-xl border border-zinc-700 bg-zinc-800/80 py-3 text-xs font-bold text-white transition hover:bg-zinc-750"
                >
                  Go to Vendor Dashboard
                </Link>
              ) : (
                <Link
                  href="/sign-up?role=vendor"
                  className="block w-full text-center rounded-xl border border-zinc-700 bg-zinc-800/80 py-3 text-xs font-bold text-white transition hover:bg-zinc-750"
                >
                  Register As Pizzeria (Free)
                </Link>
              )}
            </div>
          </div>

          {/* Premium Gold Tier */}
          <div className="relative flex flex-col justify-between rounded-2xl border-2 border-amber-500/80 bg-gradient-to-b from-zinc-900/90 via-zinc-900/70 to-zinc-950 p-8 shadow-2xl shadow-amber-500/10 backdrop-blur-md transition-all hover:border-amber-400">
            {/* Best Value Pill */}
            <div className="absolute -top-3.5 right-6">
              <span className="rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                ⭐ Most Popular
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-300">
                  GOLD PREMIUM KITCHEN
                </span>
                <span className="text-xs font-medium text-amber-400/90">Instant Activation</span>
              </div>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-white">$29.99</span>
                <span className="text-xs text-zinc-400">/ month</span>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                Designed for high-volume pizzerias, renowned kitchens, and chefs seeking top-tier visibility.
              </p>

              {/* Features List */}
              <ul className="mt-6 space-y-3 text-xs text-zinc-200">
                <li className="flex items-center gap-2.5">
                  <span className="text-amber-400 font-bold">★</span>
                  <span><strong>Unlimited pizza menu listings</strong> (no 3-item cap)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-amber-400 font-bold">★</span>
                  <span><strong>Gold Premium Badge</strong> highlighted on `/menu`</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-amber-400 font-bold">★</span>
                  <span><strong>Top search priority</strong> above standard kitchens</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-amber-400 font-bold">★</span>
                  <span>Instant Stripe payouts with automated billing</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-amber-400 font-bold">★</span>
                  <span>24/7 dedicated chef support and analytics</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-amber-500/20">
              <Link
                href={isVendor ? "/dashboard/vendor" : "/sign-up?role=vendor"}
                className="block w-full text-center rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 py-3 text-xs font-bold text-white shadow-lg shadow-orange-500/25 transition hover:brightness-110 active:scale-95"
              >
                {isVendor ? "Manage Subscription in Dashboard →" : "Partner & Get Premium →"}
              </Link>
            </div>
          </div>
        </div>

        {/* Platform Metrics */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-8 text-center text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>Over 15+ Verified Kitchens Baking Daily</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>Zero Long-term Contracts — Cancel Anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>Powered by Secure Stripe Payment Gateway</span>
          </div>
        </div>
      </div>
    </section>
  );
}
