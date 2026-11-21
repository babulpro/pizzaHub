"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useSession } from "@/lib/auth-client";

export default function VendorSpotlight() {
  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;
  const isVendor = user?.role === "vendor";

  return (
    <section
      id="vendor-spotlight"
      className="relative py-20 px-4 sm:px-6 lg:px-8 border-y border-zinc-200 dark:border-zinc-850 bg-gradient-to-b from-amber-50/60 via-white to-zinc-50 dark:from-[#101014] dark:via-[#14141a] dark:to-[#0c0c0e] transition-colors duration-200"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/15 px-4 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-400 backdrop-blur-md shadow-xs">
            <span>👨‍🍳</span>
            <span>FOR PIZZERIA OWNERS & CHEFS</span>
          </div>
          <h2 className="font-artisan mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl md:text-5xl">
            Grow Your Pizzeria Business With PizzaHub
          </h2>
          <p className="mt-3 max-w-2xl text-base text-zinc-600 dark:text-zinc-400 sm:text-lg">
            Connect directly with thousands of passionate pizza lovers. Start free with up to 3 signature pies, or unlock unlimited scale with Premium Kitchen.
          </p>
        </motion.div>

        {/* Pricing & Tier Comparison Cards */}
        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:max-w-4xl lg:mx-auto">
          {/* Free Starter Tier */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            whileHover={{ y: -6, transition: { duration: 0.25 } }}
            className="relative flex flex-col justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-8 shadow-lg dark:shadow-xl backdrop-blur-md transition-colors hover:border-zinc-300 dark:hover:border-zinc-700"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-xs font-bold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60">
                  STARTER KITCHEN
                </span>
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Zero Upfront Cost</span>
              </div>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">$0</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">/ forever</span>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                Ideal for pop-ups, boutique bakeries, and emerging pizzaiolos getting started.
              </p>

              {/* Features List */}
              <ul className="mt-6 space-y-3 text-xs text-zinc-700 dark:text-zinc-300">
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                  <span>Publish up to <strong>3 signature pizza items</strong></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                  <span>Standard search listing in your city</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                  <span>Live order receipt and kitchen notifications</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                  <span>Dedicated Vendor Dashboard access</span>
                </li>
                <li className="flex items-center gap-2.5 text-zinc-400 dark:text-zinc-500">
                  <span>✕</span>
                  <span>No featured badges or unlimited items</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                {isVendor ? (
                  <Link
                    href="/dashboard/vendor"
                    className="block w-full text-center rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-750 py-3 text-xs font-bold text-zinc-900 dark:text-white transition shadow-xs cursor-pointer"
                  >
                    Go to Vendor Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/sign-up?role=vendor"
                    className="block w-full text-center rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-750 py-3 text-xs font-bold text-zinc-900 dark:text-white transition shadow-xs cursor-pointer"
                  >
                    Register As Pizzeria (Free)
                  </Link>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* Premium Gold Tier */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.15, ease: "easeOut" }}
            whileHover={{ y: -6, transition: { duration: 0.25 } }}
            className="relative flex flex-col justify-between rounded-2xl border-2 border-amber-500/80 bg-gradient-to-b from-amber-50/70 via-white to-amber-50/30 dark:from-zinc-900/90 dark:via-zinc-900/70 dark:to-zinc-950 p-8 shadow-xl shadow-amber-500/10 dark:shadow-2xl dark:shadow-amber-500/10 backdrop-blur-md transition-colors hover:border-amber-400"
          >
            {/* Best Value Pill */}
            <div className="absolute -top-3.5 right-6">
              <span className="rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                ⭐ Most Popular
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-amber-100 border border-amber-300 text-amber-900 dark:bg-amber-500/15 dark:border-amber-500/30 dark:text-amber-300 px-3 py-1 text-xs font-bold">
                  GOLD PREMIUM KITCHEN
                </span>
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400/90">Instant Activation</span>
              </div>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">$29.99</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">/ month</span>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                Designed for high-volume pizzerias, renowned kitchens, and chefs seeking top-tier visibility.
              </p>

              {/* Features List */}
              <ul className="mt-6 space-y-3 text-xs text-zinc-800 dark:text-zinc-200">
                <li className="flex items-center gap-2.5">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">★</span>
                  <span><strong>Unlimited pizza menu listings</strong> (no 3-item cap)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">★</span>
                  <span><strong>Gold Premium Badge</strong> highlighted on `/menu`</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">★</span>
                  <span><strong>Top search priority</strong> above standard kitchens</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">★</span>
                  <span>Instant Stripe payouts with automated billing</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">★</span>
                  <span>24/7 dedicated chef support and analytics</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-amber-500/20">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href={isVendor ? "/dashboard/vendor/subscription" : "/sign-up?role=vendor"}
                  className="block w-full text-center rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 py-3 text-xs font-bold text-white shadow-lg shadow-orange-500/25 transition hover:brightness-110 cursor-pointer"
                >
                  {isVendor ? "Manage Subscription & Upgrade →" : "Partner & Get Premium →"}
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Platform Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-8 text-center text-xs text-zinc-600 dark:text-zinc-400"
        >
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
            <span>Over 15+ Verified Kitchens Baking Daily</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
            <span>Zero Long-term Contracts — Cancel Anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
            <span>Powered by Secure Stripe Payment Gateway</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
