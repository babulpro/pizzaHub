import Hero from "./components/hero";
import PizzaHubLogo from "./components/pizzahub-logo";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-[#0c0c0e]">
      {/* Wonderful Hero Component with Live Pizza Visual */}
      <Hero />

      {/* Feature Highlights Grid */}
      <section className="relative mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-3">
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
