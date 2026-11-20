"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";

interface PizzaItem {
  _id: string;
  itemName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  prepTime?: string;
  isSpicy?: boolean;
  isVegetarian?: boolean;
  isPremium?: number;
  vendor?: {
    name?: string;
    businessName?: string;
  };
}

export default function FeaturedPizzas({
  initialPizzas = [],
}: {
  initialPizzas?: PizzaItem[];
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  // Real live pizzas fetched from the server or revalidated
  const [pizzas, setPizzas] = useState<PizzaItem[]>(initialPizzas);
  const [loading, setLoading] = useState(initialPizzas.length === 0);
  const [authPromptItem, setAuthPromptItem] = useState<PizzaItem | null>(null);

  const handleOrderClick = (pizza: PizzaItem) => {
    if (!user) {
      setAuthPromptItem(pizza);
    } else {
      router.push(`/menu/${pizza._id}`);
    }
  };

  useEffect(() => {
    // If we already have pizzas from server-side rendering, skip initial client fetch
    if (initialPizzas && initialPizzas.length > 0) {
      setPizzas(initialPizzas);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    api
      .get<PizzaItem[]>("/menu?sortBy=featured")
      .then((res) => {
        if (isMounted) {
          if (res.success && Array.isArray(res.data)) {
            setPizzas(res.data.slice(0, 4));
          } else {
            setPizzas([]);
          }
        }
      })
      .catch(() => {
        if (isMounted) setPizzas([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialPizzas]);

  return (
    <section id="featured-menu" className="relative py-20 px-4 sm:px-6 lg:px-8 border-t border-zinc-900 bg-gradient-to-b from-[#0c0c0e] via-[#101014] to-[#0c0c0e]">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-400 backdrop-blur-md">
            <span>🍕</span>
            <span>HANDCRAFTED SIGNATURE PIES</span>
          </div>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
            Artisan Pizzas Fresh Out of The Oven
          </h2>
          <p className="mt-3 max-w-2xl text-base text-zinc-400 sm:text-lg">
            Fermented for 72 hours, blistered at 900°F in authentic wood-fired ovens, and topped with D.O.P. Italian ingredients.
          </p>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4"
              >
                <div className="h-44 w-full rounded-xl bg-zinc-800/60" />
                <div className="mt-4 h-4 w-3/4 rounded bg-zinc-800/80" />
                <div className="mt-2 h-3 w-1/2 rounded bg-zinc-850" />
                <div className="mt-6 flex items-center justify-between border-t border-zinc-800/60 pt-3">
                  <div className="h-5 w-16 rounded bg-zinc-800" />
                  <div className="h-8 w-20 rounded-xl bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State when no pizzas in database */}
        {!loading && pizzas.length === 0 && (
          <div className="mt-14 rounded-3xl border border-dashed border-zinc-800 p-12 text-center bg-zinc-950/40 max-w-lg mx-auto">
            <span className="text-4xl">🍕</span>
            <h3 className="mt-4 text-base font-bold text-white">No Live Pizzas in the Oven Yet</h3>
            <p className="mt-1 text-xs text-zinc-400">
              Artisan pizzerias are currently preparing today&apos;s fresh dough. Visit our menu or sign in as a vendor to publish your pizza!
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link
                href="/menu"
                className="rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-black hover:bg-amber-400"
              >
                Explore Menu
              </Link>
            </div>
          </div>
        )}

        {/* Real Live Pizzas Grid (No Demo Data) */}
        {!loading && pizzas.length > 0 && (
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pizzas.map((pizza) => {
              const imageSrc =
                Array.isArray(pizza.images) && pizza.images.length > 0 && pizza.images[0]
                  ? pizza.images[0]
                  : typeof pizza.images === "string" && pizza.images
                  ? pizza.images
                  : "https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=1000&q=80";

              return (
                <div
                  key={pizza._id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10"
                >
                  {/* Pizza Image Frame */}
                  <Link href={`/menu/${pizza._id}`} className="relative h-48 w-full overflow-hidden bg-zinc-950 block">
                    <Image
                      src={imageSrc}
                      alt={pizza.itemName}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent" />

                    {/* Category Pill */}
                    <div className="absolute top-3 left-3">
                      <span className="rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-zinc-200 backdrop-blur-md border border-white/10">
                        {pizza.category}
                      </span>
                    </div>

                    {/* Dietary / Spicy Tags */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {pizza.isSpicy && (
                        <span
                          title="Spicy Recipe"
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600/90 text-[11px] shadow-sm text-white"
                        >
                          🔥
                        </span>
                      )}
                      {pizza.isVegetarian && (
                        <span
                          title="Vegetarian"
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600/90 text-[11px] shadow-sm text-white"
                        >
                          🌿
                        </span>
                      )}
                    </div>

                    {/* Premium Badge */}
                    {Boolean(pizza.isPremium) && (
                      <div className="absolute bottom-3 left-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 border border-amber-400/50 px-2 py-0.5 text-[10px] font-bold text-amber-300 backdrop-blur-md">
                          ⭐ Gold Kitchen
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Card Details */}
                  <div className="flex flex-1 flex-col p-5">
                    {/* Location & Prep */}
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                      <span className="truncate max-w-[65%]">📍 {pizza.location}</span>
                      {pizza.prepTime && (
                        <span className="font-medium text-amber-400/90 shrink-0">
                          ⏱️ {pizza.prepTime}
                        </span>
                      )}
                    </div>

                    {/* Pizza Name */}
                    <Link href={`/menu/${pizza._id}`} className="block">
                      <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                        {pizza.itemName}
                      </h3>
                    </Link>

                    {/* Description */}
                    <p className="mt-1.5 text-xs leading-relaxed text-zinc-400 line-clamp-2 flex-1">
                      {pizza.description}
                    </p>

                    {/* Pizzeria Name */}
                    {pizza.vendor?.businessName && (
                      <div className="mt-3 flex items-center gap-1.5 border-t border-zinc-800/80 pt-2 text-[11px] text-zinc-400">
                        <span className="text-zinc-500">By</span>
                        <span className="font-semibold text-zinc-300 truncate">
                          {pizza.vendor.businessName}
                        </span>
                      </div>
                    )}

                    {/* Price & Action */}
                    <div className="mt-4 flex items-center justify-between border-t border-zinc-800/80 pt-3">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-zinc-500 block">
                          Price
                        </span>
                        <span className="text-lg font-black text-white">
                          ${pizza.price.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/menu/${pizza._id}`}
                          className="rounded-xl border border-zinc-750 bg-zinc-800/80 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
                        >
                          Details
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleOrderClick(pizza)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-amber-500/20 transition-all hover:brightness-110 active:scale-95 cursor-pointer"
                        >
                          <span>Order</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View Full Menu CTA */}
        <div className="mt-12 flex flex-col items-center justify-center gap-3 text-center sm:flex-row">
          <Link
            href="/menu"
            className="group inline-flex items-center gap-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:border-amber-500 hover:bg-zinc-850 hover:text-amber-400"
          >
            <span>Browse Full Menu & All 15+ Artisan Pizzas</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <span className="text-xs text-zinc-500">
            {loading ? "Syncing live kitchen menu..." : "Free delivery available on orders over $35"}
          </span>
        </div>
      </div>

      {/* Sign In Required Alert Modal (Matching Menu Page Experience) */}
      {authPromptItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-[#16161a] p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  {authPromptItem.category}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Order {authPromptItem.itemName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAuthPromptItem(null)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-6 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-3xl text-amber-400 border border-amber-500/30">
                🍕
              </div>
              <p className="text-sm text-zinc-300">
                Please sign in to place your order and get live kitchen updates.
              </p>
              <div className="flex flex-col gap-2.5 pt-2">
                <Link
                  href={`/sign-in?callbackUrl=/menu/${authPromptItem._id}`}
                  className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:brightness-110 text-center"
                >
                  Sign In to Continue
                </Link>
                <Link
                  href={`/sign-up?callbackUrl=/menu/${authPromptItem._id}`}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-850 py-2.5 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white text-center"
                >
                  Create a New Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
