"use client";

import Image from "next/image";
import { motion } from "motion/react";

const TESTIMONIALS = [
  {
    quote:
      "The leopard spotting on the San Marzano Margherita crust is textbook Neapolitan perfection. It arrived blisteringly hot in just 22 minutes!",
    author: "Sofia Rossi",
    role: "Verified Food Critic",
    location: "Gulshan-2, Dhaka",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    rating: 5,
    favoritePizza: "San Marzano Margherita DOP",
  },
  {
    quote:
      "The Black Truffle & Bresaola pie from Forno Napoli is Michelin-worthy. PizzaHub makes ordering directly from true wood-fired artisans effortless.",
    author: "Marcus Vance",
    role: "Gourmet Pizza Enthusiast",
    location: "Dhanmondi, Dhaka",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    rating: 5,
    favoritePizza: "Black Truffle & Bresaola Carpaccio",
  },
  {
    quote:
      "As an artisan pizzaiolo, PizzaHub's vendor dashboard made expanding our kitchen seamless. The Gold Premium placement substantially boosted our kitchen reach and brought in enthusiastic new regulars.",
    author: "Marco Bellini",
    role: "Head Chef & Pizzeria Owner",
    location: "Banani, Dhaka",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    rating: 5,
    favoritePizza: "Diavola Calabrese Piccante",
  },
];

export default function Testimonials() {
  return (
    <section id="reviews" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0c0c0e] transition-colors duration-200">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/15 px-4 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-400 backdrop-blur-md shadow-xs">
            <span>⭐</span>
            <span>VERIFIED FOODIE COMMUNITY</span>
          </div>
          <h2 className="font-artisan mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl md:text-5xl">
            Loved By Pizza Connoisseurs
          </h2>
          <p className="mt-3 max-w-2xl text-base text-zinc-600 dark:text-zinc-400 sm:text-lg">
            Hear from Dhaka foodies, critics, and artisan pizzaiolos who trust PizzaHub every single week.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: idx * 0.15, ease: "easeOut" }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="flex flex-col justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/40 p-6 shadow-md transition-colors duration-300 hover:border-amber-500/40 hover:shadow-xl dark:hover:bg-zinc-900/70"
            >
              <div>
                {/* 5 Stars with subtle stagger */}
                <div className="flex items-center gap-1 text-amber-500 text-sm">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>

                {/* Quote */}
                <p className="mt-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Favorite Tag */}
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-zinc-200/80 dark:bg-zinc-800/80 px-2.5 py-1 text-[11px] text-zinc-600 dark:text-zinc-400">
                  <span className="text-amber-500">🍕</span>
                  <span className="truncate max-w-[200px] font-medium text-zinc-800 dark:text-zinc-300">
                    {t.favoritePizza}
                  </span>
                </div>
              </div>

              {/* Reviewer Bio */}
              <div className="mt-6 flex items-center gap-3 border-t border-zinc-200 dark:border-zinc-800/80 pt-4">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-zinc-300 dark:border-zinc-700">
                  <Image
                    src={t.avatar}
                    alt={t.author}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col text-left truncate">
                  <span className="text-sm font-bold text-zinc-900 dark:text-white truncate">{t.author}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {t.role} • {t.location}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
