"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import showToast from "@/lib/toast";
import { PizzaSliceIcon } from "../components/pizzahub-logo";

interface PromoCode {
  code: string;
  discount: string;
  title: string;
  description: string;
  minSpend: string;
  expires: string;
  tag: string;
  gradient: string;
  border: string;
}

const PROMO_CODES: PromoCode[] = [
  {
    code: "HOTCRUST20",
    discount: "20% OFF",
    title: "First Bite Welcome Offer",
    description: "Get 20% off your entire order from any verified wood-fired pizzeria kitchen.",
    minSpend: "Min. spend $25",
    expires: "Valid for next 7 days",
    tag: "MOST POPULAR",
    gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
    border: "border-amber-500/40 hover:border-amber-400",
  },
  {
    code: "BOGOPIZZA",
    discount: "50% OFF 2ND",
    title: "Buy One, Get Second Half Off",
    description: "Order any Gourmet Signature Pizza and enjoy 50% off a Classic Margherita or Marinara.",
    minSpend: "Applies to 2+ pizzas",
    expires: "Ends Sunday midnight",
    tag: "WEEKEND SPECIAL",
    gradient: "from-red-500/20 via-orange-500/10 to-transparent",
    border: "border-red-500/40 hover:border-red-400",
  },
  {
    code: "FREEDROP",
    discount: "FREE DELIVERY",
    title: "Zero Courier Fees",
    description: "Complimentary thermal-bag courier delivery straight from the 900°F oven to your door.",
    minSpend: "Min. spend $30",
    expires: "Limited time daily",
    tag: "FREE COURIER",
    gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
    border: "border-emerald-500/40 hover:border-emerald-400",
  },
  {
    code: "CHEFSPECIAL",
    discount: "FREE APPETIZER",
    title: "Free Garlic Herb Focaccia",
    description: "Receive a freshly baked garlic sourdough focaccia with rosemary and Sicilian sea salt.",
    minSpend: "With any 2 Pizzas",
    expires: "While dough lasts",
    tag: "CHEF GIFT",
    gradient: "from-purple-500/20 via-pink-500/10 to-transparent",
    border: "border-purple-500/40 hover:border-purple-400",
  },
];

const COMBO_BUNDLES = [
  {
    title: "The Neapolitan Duet",
    badge: "SAVE $9.00",
    price: "$28.99",
    originalPrice: "$38.00",
    serves: "2 People",
    image: "https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=800&q=80",
    items: [
      "2x Wood-Fired San Marzano Margherita D.O.P.",
      "2x Chilled Italian San Pellegrino Sodas",
      "House Chili-Infused Calabrian Olive Oil",
    ],
  },
  {
    title: "Artisan Pizzaiolo Feast",
    badge: "SAVE $18.00",
    price: "$49.99",
    originalPrice: "$68.00",
    serves: "4–5 Foodies",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
    items: [
      "1x Black Truffle & Bresaola Carpaccio Pizza",
      "1x Diavola Calabrese Piccante (Spicy Salami)",
      "1x Classic 72-Hour Fermented Margherita",
      "Warm Rosemary Garlic Focaccia Bread",
    ],
  },
  {
    title: "Gourmet Truffle & Burrata Indulgence",
    badge: "SAVE $8.00",
    price: "$29.99",
    originalPrice: "$38.00",
    serves: "2 Connoisseurs",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
    items: [
      "1x Premium Black Truffle Forestier Pizza",
      "1x Imported Buffalo Mozzarella & Cherry Tomato Salad",
      "Artisan Garlic Dip & Balsamic Glaze",
    ],
  },
];

export default function DealsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 38,
    seconds: 42,
  });

  // Live countdown timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(code);
    showToast.fire(
      `Promo Code ${code} Copied! 📋`,
      "Discount voucher saved to your clipboard. Paste at checkout!"
    );
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0c0c0e] text-zinc-900 dark:text-zinc-100 transition-colors">
      
      {/* 1. Deals Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-24 border-b border-zinc-200 dark:border-zinc-850 bg-white/70 dark:bg-transparent backdrop-blur-md">
        {/* Ambient Backdrops */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-500/20 via-orange-600/15 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 right-0 -z-10 h-80 w-80 rounded-full bg-red-500/10 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/15 px-3.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-300 shadow-sm backdrop-blur-md">
            <span>🔥</span>
            <span>EXCLUSIVE PIZZAHUB OFFERS & DISCOUNTS</span>
          </div>

          {/* Heading */}
          <h1 className="font-artisan mt-4 sm:mt-6 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl lg:text-6xl">
            Sizzle & Save With
            <br />
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 bg-clip-text text-transparent">
              Artisan Pizza Hot Deals
            </span>
          </h1>

          <p className="mt-3 sm:mt-4 max-w-2xl mx-auto text-sm sm:text-base text-zinc-600 dark:text-zinc-300">
            Enjoy hand-tossed Neapolitan dough, San Marzano D.O.P. sauces, and fresh buffalo mozzarella at unbeatable limited-time prices.
          </p>

          {/* Flash Sale Countdown Timer */}
          <div className="mt-6 sm:mt-8 inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4 rounded-2xl border border-amber-500/30 bg-white dark:bg-zinc-900/80 p-3.5 sm:p-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500"></span>
              </span>
              <span>Flash Drop Ends In:</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center rounded-xl bg-zinc-100 dark:bg-zinc-950 px-3 py-1.5 border border-zinc-200 dark:border-zinc-800">
                <span className="text-xl font-extrabold text-zinc-900 dark:text-white">
                  {String(timeLeft.hours).padStart(2, "0")}
                </span>
                <span className="text-[9px] uppercase font-bold text-zinc-500">Hours</span>
              </div>
              <span className="text-lg font-bold text-zinc-400 dark:text-zinc-600">:</span>
              <div className="flex flex-col items-center rounded-xl bg-zinc-100 dark:bg-zinc-950 px-3 py-1.5 border border-zinc-200 dark:border-zinc-800">
                <span className="text-xl font-extrabold text-zinc-900 dark:text-white">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </span>
                <span className="text-[9px] uppercase font-bold text-zinc-500">Mins</span>
              </div>
              <span className="text-lg font-bold text-zinc-400 dark:text-zinc-600">:</span>
              <div className="flex flex-col items-center rounded-xl bg-zinc-100 dark:bg-zinc-950 px-3 py-1.5 border border-zinc-200 dark:border-zinc-800">
                <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
                <span className="text-[9px] uppercase font-bold text-zinc-500">Secs</span>
              </div>
            </div>

            <Link
              href="/menu"
              className="rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-orange-500/20 hover:opacity-95"
            >
              Order Now →
            </Link>
          </div>

        </div>
      </section>

      {/* 2. Promo Vouchers Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between pb-6 sm:pb-8 border-b border-zinc-200 dark:border-zinc-850 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Active Voucher Codes
            </span>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white sm:text-3xl mt-1">
              Copy & Apply at Checkout
            </h2>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm text-center sm:text-right">
            Simply click on any coupon code to copy it, then paste it into your Kitchen Note when placing an order!
          </p>
        </div>

        {/* Promo Grid */}
        <div className="mt-8 sm:mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PROMO_CODES.map((promo) => {
            const isCopied = copiedCode === promo.code;
            return (
              <div
                key={promo.code}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border ${promo.border} bg-white dark:bg-zinc-900/60 p-5 sm:p-6 shadow-lg dark:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                <div>
                  {/* Tag Pill */}
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-amber-400 border border-white/10 uppercase">
                      {promo.tag}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-medium">
                      {promo.expires}
                    </span>
                  </div>

                  {/* Discount Big Banner */}
                  <div className="mt-4">
                    <span className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white block">
                      {promo.discount}
                    </span>
                    <h3 className="mt-1 text-sm font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                      {promo.title}
                    </h3>
                  </div>

                  <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {promo.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 mb-2">
                    <span>{promo.minSpend}</span>
                    <span className="text-zinc-400 dark:text-zinc-500">1x per user</span>
                  </div>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={() => handleCopy(promo.code)}
                    className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                      isCopied
                        ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/25"
                        : "border border-dashed border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"
                    }`}
                  >
                    <span className="font-mono tracking-wider">{promo.code}</span>
                    <span>{isCopied ? "✓ Copied!" : "📋 Copy Code"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Chef Combo Bundles (Big Value) */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-zinc-200 dark:border-zinc-850 bg-gradient-to-b from-zinc-100 via-white to-zinc-50 dark:from-[#101014] dark:via-[#131318] dark:to-[#0c0c0e]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Kitchen-Curated Sets
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
              Artisan Pizza & Beverage Bundles
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Complete oven-fresh feasts assembled by our master pizzaiolos. Perfect for romantic date nights, family dinners, or game day gatherings.
            </p>
          </div>

          <div className="mt-10 sm:mt-12 grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
            {COMBO_BUNDLES.map((combo) => (
              <div
                key={combo.title}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-lg dark:shadow-xl transition-all hover:border-amber-500/50 hover:shadow-2xl"
              >
                {/* Visual Image */}
                <div className="relative h-48 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-950">
                  <Image
                    src={combo.image}
                    alt={combo.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="rounded-full bg-gradient-to-r from-red-600 to-orange-500 px-3 py-1 text-[11px] font-black text-white shadow-md">
                      {combo.badge}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 text-xs font-medium text-white drop-shadow-sm">
                    👥 {combo.serves}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {combo.title}
                  </h3>

                  {/* Included Items */}
                  <ul className="mt-4 space-y-2 flex-1 text-xs text-zinc-700 dark:text-zinc-300">
                    {combo.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">✓</span>
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Price & CTA */}
                  <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-zinc-900 dark:text-white">{combo.price}</span>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500 line-through">
                          {combo.originalPrice}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                        Full Bundle Discount Applied
                      </span>
                    </div>

                    <Link
                      href="/menu"
                      className="rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-500/20 hover:opacity-95"
                    >
                      Order on Menu →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Happy Hour Banner */}
          <div className="mt-12 sm:mt-14 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/15 to-red-500/10 p-5 sm:p-8 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-3xl shrink-0">
                  🍕
                </div>
                <div>
                  <span className="inline-block rounded-md bg-amber-400/20 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase">
                    Daily Pizzeria Happy Hour
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white mt-1">
                    4:00 PM – 7:00 PM: 15% Off All Gold Kitchen Pizzas
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                    Order directly between 4 PM and 7 PM from any verified Gold Premium Pizzeria to receive an automatic 15% discount at oven checkout.
                  </p>
                </div>
              </div>

              <Link
                href="/menu"
                className="shrink-0 flex items-center justify-center gap-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black px-5 py-3 text-xs font-extrabold shadow-lg hover:opacity-90 transition w-full sm:w-auto"
              >
                <PizzaSliceIcon className="h-4 w-4 text-amber-500" />
                <span>Explore Happy Hour Pizzas</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How Deals Work (3 Simple Steps) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-black text-white sm:text-3xl">
            How to Redeem Your Deal
          </h2>
          <p className="mt-2 text-xs text-zinc-400 max-w-md mx-auto">
            Enjoying artisan wood-fired pizza at discounted rates takes less than 60 seconds.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 text-2xl text-amber-400">
              1
            </div>
            <h3 className="mt-4 text-sm font-bold text-white">Copy Any Code</h3>
            <p className="mt-1.5 text-xs text-zinc-400">
              Click &quot;Copy Code&quot; on any voucher above (e.g. HOTCRUST20).
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/15 text-2xl text-orange-400">
              2
            </div>
            <h3 className="mt-4 text-sm font-bold text-white">Pick Your Slices</h3>
            <p className="mt-1.5 text-xs text-zinc-400">
              Select your favorite wood-fired pizzas from our artisan partner menu.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-2xl text-emerald-400">
              3
            </div>
            <h3 className="mt-4 text-sm font-bold text-white">Savor the Savings</h3>
            <p className="mt-1.5 text-xs text-zinc-400">
              Mention the code in your Kitchen Note or checkout and enjoy your piping-hot delivery!
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}