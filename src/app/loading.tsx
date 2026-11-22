import { PizzaSliceIcon } from "./components/pizzahub-logo";

export default function GlobalLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[75vh] w-full flex-col items-center justify-center bg-[#0c0c0e] px-4 py-16 text-center select-none"
    >
      <div className="relative flex flex-col items-center">
        {/* Ambient Warm Oven Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-8 h-48 w-48 rounded-full bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-red-600/10 blur-3xl animate-pulse"
        />

        {/* Central Animated Spinner & Pizza Icon */}
        <div className="relative flex h-24 w-24 items-center justify-center">
          {/* Outer Rotating Gradient Ring */}
          <div className="absolute inset-0 animate-spin rounded-full border-3 border-transparent border-t-amber-500 border-r-orange-500 [animation-duration:1.2s]" />

          {/* Inner Counter-Rotating Ring */}
          <div className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-b-red-500 border-l-amber-400 [animation-direction:reverse] [animation-duration:1.8s]" />

          {/* Center Glow Backdrop */}
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#18181f] to-[#121216] border border-amber-500/30 shadow-xl shadow-amber-500/10">
            <PizzaSliceIcon className="h-8 w-8 animate-bounce [animation-duration:1.5s]" />
          </div>
        </div>

        {/* Brand Headline & Subtitle */}
        <div className="mt-6 max-w-sm">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-400">
            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-amber-400" />
            Wood-Fired Kitchen
          </div>

          <h2 className="mt-3 text-xl font-black tracking-tight text-white sm:text-2xl font-artisan">
            Firing Up The Ovens...
          </h2>
          <p className="mt-1.5 text-xs text-zinc-400">
            Handcrafting your PizzaHub experience with fresh ingredients & artisan flavors.
          </p>
        </div>

        {/* Shimmering Progress Dots */}
        <div className="mt-6 flex items-center gap-2">
          <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400 [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-orange-500 [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-red-500" />
        </div>

        <span className="sr-only">Loading page content, please wait...</span>
      </div>
    </div>
  );
}
