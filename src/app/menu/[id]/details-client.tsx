"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { api, ensureApiToken } from "@/lib/api";

export interface MenuItemDetails {
  _id: string;
  vendorId: string;
  itemName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  prepTime?: string;
  isSpicy?: boolean;
  isVegetarian?: boolean;
  status: string;
  isPremium?: number;
  vendor?: {
    _id: string;
    name: string;
    email: string;
    businessName?: string;
    subscriptionPlan?: string;
    image?: string;
  };
}

interface DetailsClientProps {
  id: string;
  initialItem: MenuItemDetails | null;
}

export default function PizzaDetailsClient({
  id,
  initialItem,
}: DetailsClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const [item, setItem] = useState<MenuItemDetails | null>(initialItem);
  const [loading, setLoading] = useState(!initialItem);
  const [error, setError] = useState<string | null>(null);

  // Related Same-Category Pizzas
  const [categoryPizzas, setCategoryPizzas] = useState<MenuItemDetails[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);

  // Order Form State
  const [orderAddress, setOrderAddress] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Initialize date safely on client side
  useEffect(() => {
    setOrderDate(new Date().toISOString().split("T")[0]);
  }, []);

  // Reset form status when route ID changes
  useEffect(() => {
    setOrderSuccess(null);
    setOrderError(null);
    setOrderNote("");
    if (initialItem && initialItem._id === id) {
      setItem(initialItem);
      setLoading(false);
    }
  }, [id, initialItem]);

  // Fetch single pizza details if not preloaded from server
  useEffect(() => {
    if (initialItem && initialItem._id === id) {
      setItem(initialItem);
      setLoading(false);
      return;
    }

    if (!id) return;
    let isMounted = true;
    setLoading(true);
    setError(null);

    api
      .get<MenuItemDetails>(`/menu/${id}`)
      .then((res) => {
        if (isMounted) {
          if (res.success && res.data) {
            setItem(res.data);
          } else {
            setError(res.message || "Failed to load pizza details.");
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Error connecting to server."
          );
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, initialItem]);

  // Fetch related pizzas once category is known
  useEffect(() => {
    if (!item?.category) return;
    let isMounted = true;
    setCategoryLoading(true);

    api
      .get<MenuItemDetails[]>(`/menu?category=${encodeURIComponent(item.category)}`)
      .then((res) => {
        if (isMounted && res.success && Array.isArray(res.data)) {
          // Exclude the current pizza from the related list
          setCategoryPizzas(res.data.filter((p) => p._id !== item._id));
        }
      })
      .catch(() => {
        if (isMounted) setCategoryPizzas([]);
      })
      .finally(() => {
        if (isMounted) setCategoryLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [item?.category, item?._id]);

  // Handle Order Placement
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    if (!user) {
      setOrderError("Please sign in to place an order.");
      return;
    }

    if (!orderAddress.trim()) {
      setOrderError("Please provide a valid delivery address.");
      return;
    }

    setOrderSubmitting(true);
    setOrderError(null);
    setOrderSuccess(null);

    try {
      await ensureApiToken();
      const res = await api.post("/orders", {
        itemId: item._id,
        deliveryDate: orderDate,
        deliveryAddress: orderAddress.trim(),
        message: orderNote.trim(),
      });

      if (res.success) {
        setOrderSuccess(
          "🍕 Your order has been placed successfully! The artisan kitchen has started preparing your order."
        );
        setTimeout(() => {
          router.push("/dashboard/customer/orders");
        }, 2200);
      } else {
        setOrderError(res.message || "Could not place order. Please try again.");
      }
    } catch (err: unknown) {
      setOrderError(
        err instanceof Error ? err.message : "Failed to place order."
      );
    } finally {
      setOrderSubmitting(false);
    }
  };

  const primaryImage =
    item?.images && item.images.length > 0
      ? item.images[0]
      : "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80";

  const isPremiumVendor =
    item?.isPremium === 1 || item?.vendor?.subscriptionPlan === "premium";

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-zinc-100 pb-24">
      {/* Ambient Glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-500/10 via-red-600/5 to-transparent blur-3xl" />

      {/* Breadcrumb Navigation */}
      <nav className="border-b border-zinc-800/80 bg-[#121215]/60 py-3.5 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Link href="/" className="hover:text-amber-400 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/menu" className="hover:text-amber-400 transition-colors">
              Menu
            </Link>
            <span>/</span>
            <span className="text-zinc-200 font-medium truncate max-w-xs">
              {item?.itemName || "Pizza Details"}
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* Loading Spinner */}
        {loading && (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-3 border-amber-500 border-t-transparent" />
              <p className="text-xs font-semibold text-zinc-400">
                Fetching artisan recipe...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="mx-auto max-w-md rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center text-red-300 my-16">
            <div className="text-4xl mb-3">🍕</div>
            <h3 className="text-lg font-bold text-white">Pizza Not Found</h3>
            <p className="mt-2 text-xs text-red-300 leading-relaxed">{error}</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/menu"
                className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400 transition"
              >
                Back to Menu
              </Link>
            </div>
          </div>
        )}

        {/* Pizza Details View */}
        {!loading && !error && item && (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
            {/* Left Column: Image Gallery & Badges (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-[#141418] shadow-2xl">
                <div className="relative h-[420px] sm:h-[500px] w-full bg-zinc-950">
                  <Image
                    src={primaryImage}
                    alt={item.itemName}
                    fill
                    priority
                    className="object-cover object-center"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#141418] via-transparent to-transparent opacity-80" />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                    {isPremiumVendor && (
                      <span className="flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-black/85 px-3 py-1 text-xs font-bold text-amber-300 shadow-lg backdrop-blur-md">
                        ⭐ Premium Verified Kitchen
                      </span>
                    )}
                    <span className="rounded-lg bg-zinc-950/80 border border-zinc-700/60 px-3 py-1 text-xs font-semibold text-zinc-200 backdrop-blur-md">
                      {item.category}
                    </span>
                  </div>

                  {/* Bottom Dietary Markers */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    {item.isSpicy && (
                      <span className="flex items-center gap-1 rounded-lg bg-red-950/90 border border-red-500/40 px-2.5 py-1 text-xs font-bold text-red-300 backdrop-blur-md">
                        🌶️ Spicy Blend
                      </span>
                    )}
                    {item.isVegetarian && (
                      <span className="flex items-center gap-1 rounded-lg bg-emerald-950/90 border border-emerald-500/40 px-2.5 py-1 text-xs font-bold text-emerald-300 backdrop-blur-md">
                        🍃 100% Vegetarian
                      </span>
                    )}
                  </div>
                </div>

                {/* Additional Gallery Thumbnails */}
                {item.images && item.images.length > 1 && (
                  <div className="flex items-center gap-3 p-4 border-t border-zinc-800/80 bg-zinc-900/30 overflow-x-auto">
                    {item.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-zinc-700/60 bg-zinc-950"
                      >
                        <Image
                          src={img}
                          alt={`${item.itemName} preview ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Vendor Profile Card */}
              {item.vendor && (
                <div className="rounded-2xl border border-zinc-800 bg-[#141418] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 text-xl font-bold text-white shadow-md">
                      {item.vendor.image ? (
                        <Image
                          src={item.vendor.image}
                          alt={item.vendor.name}
                          fill
                          className="rounded-2xl object-cover"
                        />
                      ) : (
                        item.vendor.name?.charAt(0).toUpperCase() || "P"
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">
                          {item.vendor.businessName || item.vendor.name}
                        </h4>
                        {isPremiumVendor && (
                          <span className="rounded bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
                            PRO
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        📍 {item.location} • Licensed Artisan Partner
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Contact: {item.vendor.email}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/menu?location=${encodeURIComponent(item.location)}`}
                    className="inline-flex items-center justify-center rounded-xl border border-zinc-700/60 bg-zinc-850 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 transition self-start sm:self-auto"
                  >
                    More from this Kitchen →
                  </Link>
                </div>
              )}
            </div>

            {/* Right Column: Order Form & Details (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-3xl border border-zinc-800 bg-[#141418] p-6 sm:p-8 shadow-2xl">
                {/* Title & Price Header */}
                <div className="border-b border-zinc-800/80 pb-6">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      {item.category}
                    </span>
                    {item.prepTime && (
                      <span className="flex items-center gap-1 rounded-full bg-zinc-900 border border-zinc-700/60 px-3 py-1 text-xs font-medium text-zinc-300">
                        ⏱️ Prep: {item.prepTime}
                      </span>
                    )}
                  </div>

                  <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-white">
                    {item.itemName}
                  </h1>

                  <div className="mt-4 flex items-baseline gap-3">
                    <span className="text-3xl font-extrabold text-white">
                      ${item.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-zinc-500 font-medium">
                      USD per pie (taxes calculated at checkout)
                    </span>
                  </div>

                  <p className="mt-4 text-xs sm:text-sm leading-relaxed text-zinc-300">
                    {item.description}
                  </p>
                </div>

                {/* Status Messages */}
                {orderSuccess && (
                  <div className="mt-5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-300 leading-relaxed animate-in fade-in">
                    {orderSuccess}
                  </div>
                )}
                {orderError && (
                  <div className="mt-5 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-xs font-semibold text-red-300 leading-relaxed animate-in fade-in">
                    {orderError}
                  </div>
                )}

                {/* Order Form */}
                {!user ? (
                  <div className="py-8 text-center space-y-4">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-3xl">
                      🔒
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">
                        Sign In to Order
                      </h4>
                      <p className="mt-1 text-xs text-zinc-400 max-w-xs mx-auto">
                        Join or sign in with your account to order this pizza,
                        track real-time kitchen status, and access exclusive
                        deals.
                      </p>
                    </div>
                    <div className="pt-2">
                      <Link
                        href={`/sign-in?callbackUrl=/menu/${item._id}`}
                        className="inline-block w-full rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 py-3 text-xs font-bold text-white shadow-lg shadow-orange-500/20 hover:opacity-95 transition"
                      >
                        Sign In to Order Now →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handlePlaceOrder} className="mt-6 space-y-4">
                    {/* Delivery Address */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                        Delivery Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={orderAddress}
                        onChange={(e) => setOrderAddress(e.target.value)}
                        placeholder="e.g. 742 Evergreen Terrace, Apt 2B"
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>

                    {/* Delivery Date */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                        Delivery Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={orderDate}
                        onChange={(e) => setOrderDate(e.target.value)}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 text-xs text-white outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>

                    {/* Special Instructions */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                        Kitchen Note / Dietary Requests
                      </label>
                      <textarea
                        rows={2}
                        value={orderNote}
                        onChange={(e) => setOrderNote(e.target.value)}
                        placeholder="e.g. Well-done crust, slice into 8 pieces, extra napkins."
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 resize-none"
                      />
                    </div>

                    {/* Order Guarantee Note */}
                    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-3 text-[11px] text-zinc-400 space-y-1">
                      <p className="flex items-center gap-1.5 font-medium text-zinc-300">
                        <span>🔥</span> Direct from 900°F Artisan Oven
                      </p>
                      <p>
                        Your pizza is freshly baked on demand by verified partner{" "}
                        <span className="font-semibold text-zinc-200">
                          {item.vendor?.businessName || item.vendor?.name}
                        </span>
                        .
                      </p>
                    </div>

                    {/* Submit CTA */}
                    <button
                      type="submit"
                      disabled={orderSubmitting}
                      className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-xl shadow-orange-500/20 transition hover:opacity-95 active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {orderSubmitting
                        ? "Transmitting to Kitchen..."
                        : `Place Order — $${item.price.toFixed(2)}`}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Related Category Pizzas Section */}
        {!loading && categoryPizzas.length > 0 && (
          <section className="mt-20 border-t border-zinc-850 pt-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  More in {item?.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  You Might Also Crave
                </h3>
              </div>
              <Link
                href={`/menu?category=${encodeURIComponent(item?.category || "All")}`}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition"
              >
                Browse All {item?.category} →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categoryPizzas.slice(0, 3).map((related) => {
                const relatedImg =
                  related.images && related.images.length > 0
                    ? related.images[0]
                    : "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80";

                return (
                  <div
                    key={related._id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-[#141418] hover:border-amber-500/40 transition-all duration-300"
                  >
                    <Link
                      href={`/menu/${related._id}`}
                      className="relative h-44 w-full overflow-hidden bg-zinc-900 block"
                    >
                      <Image
                        src={relatedImg}
                        alt={related.itemName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    <div className="p-4 flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                          <span>📍 {related.location}</span>
                          {related.prepTime && <span>⏱️ {related.prepTime}</span>}
                        </div>
                        <Link href={`/menu/${related._id}`}>
                          <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                            {related.itemName}
                          </h4>
                        </Link>
                        <p className="mt-1 line-clamp-2 text-xs text-zinc-400">
                          {related.description}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between pt-2 border-t border-zinc-850">
                        <span className="text-base font-extrabold text-white">
                          ${related.price.toFixed(2)}
                        </span>
                        <Link
                          href={`/menu/${related._id}`}
                          className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3.5 py-1.5 text-xs font-bold text-black hover:brightness-110 transition shadow-sm"
                        >
                          Order / View →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
