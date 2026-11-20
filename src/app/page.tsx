import Link from "next/link";
import PizzaHubLogo from "./components/pizzahub-logo";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-[#0c0c0e]">
      {/* Background Decorative Ambient Gradients */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-500/15 via-red-600/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-40 -z-10 h-96 w-96 rounded-full bg-orange-600/10 blur-3xl" />

      {/* Hero Section */}
      <section className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pt-16 pb-20 text-center sm:px-6 sm:pt-24 lg:px-8">
        {/* Pill Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-300 shadow-sm backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          <span>Wood-Fired & Handcrafted Daily</span>
        </div>

        {/* Main Headline */}
        <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-[1.15]">
          Authentic Artisan Pizza.
          <br />
          <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Straight From the Oven.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          Welcome to <strong className="font-semibold text-zinc-200">PizzaHub</strong> — your premier destination connecting discerning pizza lovers with the finest local wood-fired pizzerias. Order gourmet slices or partner your kitchen today.
        </p>

        {/* Call-to-Action Buttons */}
        <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
          <Link
            href="/menu"
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-orange-500/20 transition hover:opacity-95 hover:shadow-orange-500/30 active:scale-95"
          >
            <span>🍕</span> Explore Menu
          </Link>
          <Link
            href="/sign-up?role=vendor"
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700/80 bg-zinc-900/60 px-6 py-3.5 text-base font-semibold text-zinc-200 shadow-xs transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
          >
            Partner As Pizzeria
          </Link>
        </div>

        {/* Value Props / Highlights Grid */}
        <div className="mt-20 grid w-full grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="group rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 text-left transition hover:border-amber-500/40 hover:bg-zinc-900/70 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 text-2xl text-amber-400">
              🔥
            </div>
            <h3 className="mt-4 text-lg font-bold text-white">Wood-Fired Crusts</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Naturally leavened dough fermented for 48-72 hours, baked at blisteringly hot temperatures for that authentic leopard crust.
            </p>
          </div>

          <div className="group rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 text-left transition hover:border-orange-500/40 hover:bg-zinc-900/70 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/15 text-2xl text-orange-400">
              🧀
            </div>
            <h3 className="mt-4 text-lg font-bold text-white">D.O.P. Ingredients</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Crushed San Marzano tomatoes, fresh buffalo mozzarella, aromatic basil, and imported extra virgin olive oil.
            </p>
          </div>

          <div className="group rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 text-left transition hover:border-red-500/40 hover:bg-zinc-900/70 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/15 text-2xl text-red-400">
              🛵
            </div>
            <h3 className="mt-4 text-lg font-bold text-white">Live Kitchen Tracking</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Follow every step in real time — from the moment the chef shapes your dough to the courier arriving at your doorstep.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Branding Bar */}
      <footer className="mt-auto border-t border-zinc-850 bg-[#0e0e11] py-8 text-center">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <PizzaHubLogo size="sm" withTagline={false} />
          <p className="text-xs text-zinc-500">
            © 2026 PizzaHub. Handcrafted with passion. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
