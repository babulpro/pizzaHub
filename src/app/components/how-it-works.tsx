"use client";

import Link from "next/link";
import { motion } from "motion/react";

const STEPS = [
  {
    step: "01",
    badge: "SELECT KITCHEN",
    title: "Discover Local Artisan Pizzerias",
    description:
      "Browse hand-curated wood-fired kitchens in Gulshan, Banani, Dhanmondi, and Uttara. Check verified ratings, kitchen prep times, and chef specialties.",
    icon: "🗺️",
    gradient: "from-amber-500/20 to-orange-500/10",
    border: "group-hover:border-amber-500/50",
    iconBg: "bg-amber-500/15 text-amber-500",
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
    iconBg: "bg-orange-500/15 text-orange-500",
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
    iconBg: "bg-red-500/15 text-red-500",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-[#0c0c0e] transition-colors duration-200">
      {/* Background glow subtle effect */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
        <div className="h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/15 px-4 py-1.5 text-xs font-semibold text-orange-700 dark:text-orange-400 backdrop-blur-md shadow-xs">
            <span>⚡</span>
            <span>SEAMLESS 3-STEP JOURNEY</span>
          </div>
          <h2 className="font-artisan mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl md:text-5xl">
            How PizzaHub Works
          </h2>
          <p className="mt-3 max-w-2xl text-base text-zinc-600 dark:text-zinc-400 sm:text-lg">
            From our artisan partners&apos; roaring ovens straight to your dining table with zero compromise on crust crispiness.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {STEPS.map((item, idx) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.55, delay: idx * 0.15, ease: "easeOut" }}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 p-8 transition-colors duration-300 hover:border-amber-500/50 shadow-md dark:shadow-lg"
            >
              {/* Corner Watermark Step Number */}
              <div className="absolute top-4 right-4 text-4xl font-black tracking-tighter text-zinc-200 dark:text-zinc-800/40 select-none group-hover:text-amber-500/30 transition-colors">
                {item.step}
              </div>

              <div>
                {/* Icon & Badge */}
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.4 }}
                    className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl shadow-inner ${item.iconBg}`}
                  >
                    {item.icon}
                  </motion.div>
                  <span className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">
                    {item.badge}
                  </span>
                </div>

                {/* Title */}
                <h3 className="mt-6 text-xl font-bold text-zinc-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {item.description}
                </p>
              </div>

              {/* Progress Indicator Line */}
              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500">
                <span>Step {item.step} of 03</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">Guaranteed Fresh</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA Strip */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md dark:shadow-xl"
        >
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-2xl border border-amber-500/30">
              🛵
            </div>
            <div>
              <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                Ready for fresh wood-fired pizza tonight?
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                Average prep and thermal-bag arrival time is just 28 minutes across your city.
              </p>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link
              href="/menu"
              className="rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-orange-500/25 transition hover:brightness-110 cursor-pointer block"
            >
              Order Hot Pizza Now →
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
