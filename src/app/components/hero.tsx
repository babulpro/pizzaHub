"use client";

import Image from "next/image";
import Link from "next/link";
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
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-500/15 via-red-600/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -right-40 -z-10 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          
          {/* Left Column: Headline & Action Buttons (7 Cols on LG) */}
          <div className="flex flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-left">
            
            {/* Live Status Pill */}
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-300 shadow-sm backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Wood-Fired & Freshly Baked Daily</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl sm:leading-[1.12]">
              Craving Perfection?
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Savor Handcrafted Artisan Pizza.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-300/90 sm:text-lg">
              From naturally fermented 72-hour sourdough to crushed San Marzano D.O.P. tomatoes and melted buffalo mozzarella. Order direct from premier local pizzerias or register your kitchen on PizzaHub.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex w-full flex-col gap-3.5 sm:w-auto sm:flex-row">
              <Link
                href="/menu"
                className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-7 py-3.5 text-base font-bold text-white shadow-xl shadow-orange-500/25 transition-all hover:opacity-95 hover:shadow-orange-500/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
              >
                <PizzaSliceIcon className="h-5 w-5 transition-transform group-hover:rotate-12" />
                <span>Explore Menu</span>
              </Link>

              <Link
                href={secondaryAction.href}
                className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700/80 bg-zinc-900/60 px-6 py-3.5 text-base font-semibold text-zinc-200 shadow-xs backdrop-blur-sm transition-all hover:border-amber-500/50 hover:bg-zinc-800 hover:text-white hover:-translate-y-0.5"
              >
                <span>{secondaryAction.icon}</span>
                <span>{secondaryAction.label}</span>
              </Link>
            </div>

            {/* Quick Trust Badges */}
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-zinc-800/80 pt-6 text-left w-full sm:max-w-md">
              <div>
                <p className="text-xl font-extrabold text-white">4.9/5</p>
                <p className="text-xs text-zinc-400">10k+ Happy Foodies</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-amber-400">25-35m</p>
                <p className="text-xs text-zinc-400">Oven-to-Door Delivery</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-orange-400">100%</p>
                <p className="text-xs text-zinc-400">Artisan Wood-Fired</p>
              </div>
            </div>

          </div>

          {/* Right Column: High-Impact Pizza Visual Showcase (5 Cols on LG) */}
          <div className="relative flex justify-center lg:col-span-5">
            
            {/* Ambient Backdrop Glow */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-red-600/10 blur-2xl" />

            {/* Visual Card Container */}
            <div className="relative overflow-hidden rounded-3xl border border-zinc-750/70 bg-gradient-to-b from-zinc-850/80 to-zinc-900/90 p-4 shadow-2xl backdrop-blur-xl">
              
              {/* Pizza Image Frame */}
              <div className="relative aspect-square w-full max-w-[420px] overflow-hidden rounded-2xl">
                <Image
                  src="/hero-pizza.png"
                  alt="Delicious Artisan Margherita Wood-Fired Pizza"
                  width={600}
                  height={600}
                  priority
                  className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-105"
                />
                
                {/* Gradient Inner Shadow */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>

              {/* Floating Badge 1: Top Right */}
              <div className="absolute top-7 right-7 flex items-center gap-2 rounded-xl border border-amber-500/40 bg-[#141417]/90 px-3.5 py-2 text-xs font-bold text-amber-300 shadow-xl backdrop-blur-md">
                <span className="text-base">🔥</span>
                <span>Fresh Out of Oven</span>
              </div>

              {/* Floating Badge 2: Bottom Left */}
              <div className="absolute bottom-7 left-7 flex items-center gap-2.5 rounded-xl border border-zinc-700/80 bg-[#141417]/90 px-3.5 py-2 text-xs font-medium text-white shadow-xl backdrop-blur-md">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>San Marzano D.O.P. & Buffalo Mozzarella</span>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
