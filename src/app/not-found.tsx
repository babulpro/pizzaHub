import Link from "next/link";
import { PizzaSliceIcon } from "./components/pizzahub-logo";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] w-full flex-col items-center justify-center bg-[#0c0c0e] px-4 py-16 text-center select-none">
      {/* Background Ambient Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-72 w-72 rounded-full bg-gradient-to-tr from-amber-500/15 via-orange-500/15 to-red-600/10 blur-3xl animate-pulse"
      />

      <div className="relative flex max-w-lg flex-col items-center">
        {/* Animated 404 Visual Icon */}
        <div className="relative flex items-center justify-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#1c1c24] via-[#141418] to-[#0c0c0e] shadow-2xl shadow-orange-500/15 transition-transform duration-300 hover:scale-105">
            <PizzaSliceIcon className="h-16 w-16 drop-shadow-[0_10px_20px_rgba(245,158,11,0.35)] animate-pulse" />
          </div>

          {/* Floating 404 Badge */}
          <span className="absolute -top-3 -right-3 rounded-full bg-gradient-to-r from-red-600 to-orange-500 px-3 py-1 text-xs font-black tracking-wider text-white shadow-lg shadow-red-500/30">
            404
          </span>
        </div>

        {/* Headline & Body Text */}
        <div className="mt-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-400">
            <span>🍕</span>
            <span>Slice Not Found</span>
          </span>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl font-artisan">
            Looks Like This Slice Was Eaten!
          </h1>

          <p className="mt-3 text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            We searched every wood-fired oven and checked the prep counter, but the page you are looking for has vanished or never existed.
          </p>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <Link
            href="/menu"
            className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-6 py-3 text-xs font-black text-white shadow-lg shadow-amber-500/20 transition-all hover:scale-102 hover:shadow-orange-500/30 active:scale-98"
          >
            <span>🍕</span>
            <span>Browse Pizza Menu</span>
          </Link>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl border border-zinc-800 bg-[#141419] px-6 py-3 text-xs font-bold text-zinc-200 transition-all hover:border-zinc-700 hover:bg-zinc-850 hover:text-white"
          >
            <span>🏠</span>
            <span>Return Home</span>
          </Link>
        </div>

        {/* Suggested Helpful Quick Links */}
        <div className="mt-12 w-full rounded-2xl border border-zinc-800/80 bg-[#121216]/60 p-4 sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-3">
            Popular Destinations on PizzaHub
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/deals"
              className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-amber-400 hover:border-amber-500/40 hover:bg-amber-500/10 transition"
            >
              🔥 Hot Deals & Promos
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white transition"
            >
              📋 My Dashboard
            </Link>
            <Link
              href="/subscription"
              className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white transition"
            >
              ⭐ VIP Kitchen Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
