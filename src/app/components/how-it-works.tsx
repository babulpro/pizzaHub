import Link from "next/link";

const STEPS = [
  {
    step: "01",
    badge: "SELECT KITCHEN",
    title: "Discover Local Artisan Pizzerias",
    description:
      "Browse hand-curated wood-fired kitchens in Manhattan, Brooklyn, and Queens. Check verified ratings, kitchen prep times, and chef specialties.",
    icon: "🗺️",
    gradient: "from-amber-500/20 to-orange-500/10",
    border: "group-hover:border-amber-500/50",
    iconBg: "bg-amber-500/15 text-amber-400",
  },
  {
    step: "02",
    badge: "BAKED AT 900°F",
    title: "Artisan Pizzaiolos Handcraft Your Pie",
    description:
      "Natural 72-hour sourdough fermentation, hand-stretched to order, topped with authentic San Marzano tomatoes, buffalo mozzarella, and baked in 90 seconds.",
    icon: "🔥",
    gradient: "from-orange-500/20 to-red-500/10",
    border: "group-hover:border-orange-500/50",
    iconBg: "bg-orange-500/15 text-orange-400",
  },
  {
    step: "03",
    badge: "REAL-TIME TRACKING",
    title: "Hot Thermal-Pack Delivery to Your Door",
    description:
      "Packed immediately in thermal-insulated delivery bags to keep the crust crispy and cheese melting. Track order status directly on your dashboard.",
    icon: "🛵",
    gradient: "from-red-500/20 to-rose-500/10",
    border: "group-hover:border-red-500/50",
    iconBg: "bg-red-500/15 text-red-400",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#0c0c0e]">
      {/* Background glow subtle effect */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
        <div className="h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold text-orange-400 backdrop-blur-md">
            <span>⚡</span>
            <span>SEAMLESS 3-STEP JOURNEY</span>
          </div>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
            How PizzaHub Works
          </h2>
          <p className="mt-3 max-w-2xl text-base text-zinc-400 sm:text-lg">
            From our artisan partners&apos; roaring ovens straight to your dining table with zero compromise on crust crispiness.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {STEPS.map((item) => (
            <div
              key={item.step}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-8 transition-all duration-300 hover:-translate-y-1 hover:bg-zinc-900/70 ${item.border} shadow-lg`}
            >
              {/* Corner Watermark Step Number */}
              <div className="absolute top-4 right-4 text-4xl font-black tracking-tighter text-zinc-800/40 select-none group-hover:text-zinc-700/60 transition-colors">
                {item.step}
              </div>

              <div>
                {/* Icon & Badge */}
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl shadow-inner ${item.iconBg}`}>
                    {item.icon}
                  </div>
                  <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                    {item.badge}
                  </span>
                </div>

                {/* Title */}
                <h3 className="mt-6 text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {item.description}
                </p>
              </div>

              {/* Progress Indicator Line */}
              <div className="mt-6 pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500">
                <span>Step {item.step} of 03</span>
                <span className="font-semibold text-amber-500/80">Guaranteed Fresh</span>
              </div>
            </div>
          ))}
        </div>

        {/* Value Strip */}
        <div className="mt-12 rounded-2xl border border-zinc-800/90 bg-zinc-900/50 p-6 backdrop-blur-md">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 text-center divide-y sm:divide-y-0 sm:divide-x divide-zinc-800">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-amber-400">20–25 Min</span>
              <span className="mt-1 text-xs text-zinc-400">Average Preparation Time</span>
            </div>
            <div className="flex flex-col items-center pt-4 sm:pt-0">
              <span className="text-2xl font-black text-orange-400">900°F</span>
              <span className="mt-1 text-xs text-zinc-400">Authentic Wood-Fired Ovens</span>
            </div>
            <div className="flex flex-col items-center pt-4 sm:pt-0">
              <span className="text-2xl font-black text-emerald-400">100% D.O.P.</span>
              <span className="mt-1 text-xs text-zinc-400">Certified Italian Ingredients</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
