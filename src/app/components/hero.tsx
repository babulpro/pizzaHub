"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useSession } from "@/lib/auth-client";
import { PizzaSliceIcon } from "./pizzahub-logo";

export default function Hero() {
  const { data: session } = useSession();
  const user = session?.user;
  const userRole = (user as { role?: string })?.role;

  // Contextual action based on whether the user is already signed in
  const secondaryAction = user
    ? userRole === "vendor"
      ? { href: "/dashboard/vendor", label: "Manage My Pizzeria", icon: "👨‍🍳" }
      : userRole === "admin"
      ? { href: "/dashboard/admin", label: "Admin Console", icon: "⚡" }
      : { href: "/dashboard/customer/orders", label: "Track My Orders", icon: "📦" }
    : { href: "/sign-up?role=vendor", label: "Partner As Pizzeria", icon: "👨‍🍳" };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
      {/* Ambient Glows */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.7, 0.9, 0.7],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-500/15 via-red-600/10 to-transparent blur-3xl"
      />
      <div className="pointer-events-none absolute top-1/2 -right-40 -z-10 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          
          {/* Left Column: Headline & Action Buttons (7 Cols on LG) */}
          <div className="flex flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-left">
            
            {/* Live Status Pill */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-4 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 shadow-xs backdrop-blur-md"
            >
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Wood-Fired & Freshly Baked Daily</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="font-artisan text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl lg:text-6xl sm:leading-[1.12]"
            >
              Craving Perfection?
              <br />
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 bg-clip-text text-transparent">
                Savor Handcrafted Artisan Pizza.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300/90 sm:text-lg"
            >
              From naturally fermented 72-hour sourdough to crushed San Marzano D.O.P. tomatoes and melted buffalo mozzarella. Order direct from premier local pizzerias or register your kitchen on PizzaHub.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex w-full flex-col gap-3.5 sm:w-auto sm:flex-row"
            >
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link
                  href="/menu"
                  className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-7 py-3.5 text-base font-bold text-white shadow-xl shadow-orange-500/25 transition-all hover:opacity-95 hover:shadow-orange-500/35 cursor-pointer"
                >
                  <PizzaSliceIcon className="h-5 w-5 transition-transform group-hover:rotate-12" />
                  <span>Explore Menu</span>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href={secondaryAction.href}
                  className="flex items-center justify-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700/80 bg-white dark:bg-zinc-900/60 px-6 py-3.5 text-base font-semibold text-zinc-800 dark:text-zinc-200 shadow-sm backdrop-blur-sm transition-all hover:border-amber-500/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                >
                  <span>{secondaryAction.icon}</span>
                  <span>{secondaryAction.label}</span>
                </Link>
              </motion.div>
            </motion.div>

            {/* Quick Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10 grid grid-cols-3 gap-4 border-t border-zinc-200 dark:border-zinc-800/80 pt-6 text-left w-full sm:max-w-md"
            >
              <div>
                <p className="text-xl font-extrabold text-zinc-900 dark:text-white">Top Rated</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Verified Local Foodies</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400">Fast</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Oven-Fresh Delivery</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-orange-600 dark:text-orange-400">Artisan</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Stone & Wood Ovens</p>
              </div>
            </motion.div>

          </div>

          {/* Right Column: High-Impact Pizza Visual Showcase (5 Cols on LG) */}
          <div className="relative flex justify-center lg:col-span-5">
            
            {/* Ambient Backdrop Glow */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-red-600/10 blur-2xl" />

            {/* Visual Card Container with Continuous Floating Motion */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [0, -10, 0],
              }}
              transition={{
                opacity: { duration: 0.7, ease: "easeOut" },
                scale: { duration: 0.7, ease: "easeOut" },
                y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
              }}
              className="relative overflow-hidden rounded-3xl border border-zinc-200/90 dark:border-zinc-750/70 bg-gradient-to-b from-white/95 to-zinc-50/95 dark:from-zinc-850/80 dark:to-zinc-900/90 p-4 shadow-2xl backdrop-blur-xl transition-all"
            >
              
              {/* Pizza Image Frame */}
              <div className="relative aspect-square w-full max-w-[420px] overflow-hidden rounded-2xl shadow-inner">
                <Image
                  src="/hero-pizza.png"
                  alt="Delicious Artisan Margherita Wood-Fired Pizza"
                  width={600}
                  height={600}
                  priority
                  className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-105"
                />
                
                {/* Gradient Inner Shadow */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>

              {/* Floating Badge 1: Top Right */}
              <motion.div
                animate={{
                  y: [0, -6, 0],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.4,
                }}
                className="absolute top-4 right-4 sm:top-7 sm:right-7 flex items-center gap-1.5 sm:gap-2 rounded-xl border border-amber-400/50 bg-white/95 text-amber-900 dark:border-amber-500/40 dark:bg-[#141417]/90 dark:text-amber-300 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs font-bold shadow-xl backdrop-blur-md"
              >
                <span className="text-sm sm:text-base">🔥</span>
                <span>Fresh Out of Oven</span>
              </motion.div>

              {/* Floating Badge 2: Bottom Left */}
              <motion.div
                animate={{
                  y: [0, 6, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.7,
                }}
                className="absolute bottom-4 left-4 right-4 sm:right-auto sm:bottom-7 sm:left-7 flex items-center gap-2 rounded-xl border border-zinc-200/90 bg-white/95 text-zinc-900 dark:border-zinc-700/80 dark:bg-[#141417]/90 dark:text-white px-3 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs font-semibold shadow-xl backdrop-blur-md"
              >
                <span className="flex h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                <span className="truncate">San Marzano D.O.P. & Buffalo Mozzarella</span>
              </motion.div>

            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
}
