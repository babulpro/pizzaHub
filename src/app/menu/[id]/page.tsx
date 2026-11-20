"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import Footer from "@/app/components/footer";

interface MenuItemDetails {
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

function PizzaDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: session } = useSession();
  const user = session?.user;

  const [item, setItem] = useState<MenuItemDetails | null>(null);
  const [loading, setLoading] = useState(true);
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
  }, [id]);

  // Fetch single pizza details
  useEffect(() => {
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
            setError(res.message || "Pizza item not found.");
          }
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Error connecting to server.");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Fetch more pizzas from the same category
  useEffect(() => {
    if (!item?.category) return;
    let isMounted = true;
    setCategoryLoading(true);

    api
      .get<MenuItemDetails[]>(`/menu?category=${encodeURIComponent(item.category)}`)
      .then((res) => {
        if (!isMounted) return;
        if (res.success && Array.isArray(res.data)) {
          const sameCategoryOthers = res.data.filter((p) => p._id !== item._id);
          if (sameCategoryOthers.length > 0) {
            setCategoryPizzas(sameCategoryOthers.slice(0, 4));
          } else {
            // If no other pizzas in this exact category, offer other signature pies
            api.get<MenuItemDetails[]>("/menu").then((allRes) => {
              if (isMounted && allRes.success && Array.isArray(allRes.data)) {
                setCategoryPizzas(allRes.data.filter((p) => p._id !== item._id).slice(0, 4));
              }
            });
          }
        }
      })
      .catch((err) => {
        console.warn("Could not load same-category pizzas:", err);
      })
      .finally(() => {
        if (isMounted) setCategoryLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [item?._id, item?.category]);

  // Handle Order Submission
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    if (!user) {
      setOrderError("Please sign in to place an order.");
      router.push(`/sign-in?callbackUrl=/menu/${id}`);
      return;
    }

    if (!orderAddress.trim()) {
      setOrderError("Please enter your delivery address.");
      return;
    }

    setOrderSubmitting(true);
    setOrderError(null);
    setOrderSuccess(null);

    try {
      const res = await api.post("/orders", {
        itemId: item._id,
        deliveryDate: orderDate,
        deliveryAddress: orderAddress.trim(),
        message: orderNote.trim(),
      });

      if (res.success) {
        setOrderSuccess(
          "🎉 Order placed successfully! The kitchen has received your pizza order and is firing up the oven."
        );
      } else {
        setOrderError(res.message || "Failed to place order. Please try again.");
      }
    } catch (err: unknown) {
      setOrderError(err instanceof Error ? err.message : "Network error placing order.");
    } finally {
      setOrderSubmitting(false);
    }
  };

  const imageSrc =
    item?.images && item.images.length > 0
      ? item.images[0]
      : "https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=1000&q=80";

  return (
    <div className="flex min-h-screen flex-col bg-[#0c0c0e] text-zinc-100">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-zinc-850 bg-[#0f0f13] py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-2 text-xs text-zinc-400">
          <Link href="/" className="transition hover:text-amber-400">
            Home
          </Link>
          <span>/</span>
          <Link href="/menu" className="transition hover:text-amber-400">
            Menu
          </Link>
          <span>/</span>
          <span className="text-zinc-200 font-semibold truncate max-w-xs">
            {item?.itemName || "Pizza Details"}
          </span>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-amber-500 border-t-transparent" />
            <p className="mt-4 text-sm font-semibold text-zinc-400">
              Fetching artisan pizza details from wood-fired kitchen...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="mx-auto max-w-md rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
            <span className="text-4xl">🍕</span>
            <h2 className="mt-4 text-lg font-bold text-white">Pizza Not Found</h2>
            <p className="mt-2 text-xs text-red-300">{error}</p>
            <Link
              href="/menu"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-zinc-950 transition hover:bg-amber-400"
            >
              ← Back to Full Menu
            </Link>
          </div>
        )}

        {/* Content Details & Order Form */}
        {!loading && item && (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* Left Column: Image & Artisan Highlights (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Main Image Frame */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl">
                <Image
                  src={imageSrc}
                  alt={item.itemName}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Category & Status Overlay */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="rounded-full bg-black/75 px-3 py-1 text-xs font-bold text-white backdrop-blur-md border border-white/10">
                    {item.category}
                  </span>
                  {Boolean(item.isPremium) && (
                    <span className="rounded-full bg-amber-500/90 px-3 py-1 text-xs font-black text-black shadow-md">
                      ⭐ Gold Kitchen
                    </span>
                  )}
                </div>

                {/* Dietary Tags */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  {item.isSpicy && (
                    <span className="flex items-center gap-1 rounded-full bg-red-600/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-md shadow-sm">
                      🔥 Spicy
                    </span>
                  )}
                  {item.isVegetarian && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-600/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-md shadow-sm">
                      🌿 Vegetarian
                    </span>
                  )}
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-zinc-300">
                  <span className="flex items-center gap-1.5 font-medium">
                    📍 {item.location}
                  </span>
                  {item.prepTime && (
                    <span className="flex items-center gap-1.5 font-bold text-amber-400">
                      ⏱️ {item.prepTime} average prep
                    </span>
                  )}
                </div>
              </div>

              {/* Artisan Dough & Oven Specs Card */}
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-md">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>🔥</span>
                  <span>Artisan Craftsmanship Specifications</span>
                </h3>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                    <span className="block text-[10px] uppercase font-semibold text-zinc-500">Fermentation</span>
                    <span className="text-xs font-bold text-amber-400 mt-1 block">72-Hour Leavened</span>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                    <span className="block text-[10px] uppercase font-semibold text-zinc-500">Oven Type</span>
                    <span className="text-xs font-bold text-orange-400 mt-1 block">900°F Wood-Fired</span>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                    <span className="block text-[10px] uppercase font-semibold text-zinc-500">Mozzarella</span>
                    <span className="text-xs font-bold text-emerald-400 mt-1 block">100% Buffalo DOP</span>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                    <span className="block text-[10px] uppercase font-semibold text-zinc-500">Delivery</span>
                    <span className="text-xs font-bold text-rose-400 mt-1 block">Thermal Packed</span>
                  </div>
                </div>
              </div>

              {/* Pizzeria Partner Information */}
              {item.vendor && (
                <div className="flex items-center justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 text-2xl text-amber-400 border border-amber-500/30">
                      👨‍🍳
                    </div>
                    <div>
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 block">
                        Prepared by Artisan Partner
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        {item.vendor.businessName || item.vendor.name}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Verified PizzaHub Kitchen • {item.location}
                      </p>
                    </div>
                  </div>
                  {item.vendor.subscriptionPlan === "premium" && (
                    <span className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
                      ⭐ Gold Partner
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Title, Description & Order Form (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-zinc-800 bg-[#121216] p-6 sm:p-8 shadow-2xl">
              <div>
                {/* Title & Price Header */}
                <div className="border-b border-zinc-800/80 pb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                    {item.category}
                  </span>
                  <h1 className="mt-2 text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {item.itemName}
                  </h1>

                  <div className="mt-4 flex items-baseline gap-3">
                    <span className="text-3xl font-black text-white">
                      ${item.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-zinc-500">
                      Freshly baked to order • Free local delivery over $35
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="py-6 border-b border-zinc-800/80">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    About This Pizza
                  </h4>
                  <p className="mt-2.5 text-sm leading-relaxed text-zinc-300">
                    {item.description}
                  </p>
                </div>

                {/* Order Section */}
                {!user ? (
                  <div className="py-8 text-center space-y-4 border-t border-zinc-800/80 mt-4">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-3xl text-amber-400 border border-amber-500/30">
                      🍕
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">Sign In to Order</h4>
                      <p className="mt-1 text-xs text-zinc-400 max-w-xs mx-auto">
                        Please sign in to place your order and get live kitchen updates.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2.5 pt-2 max-w-xs mx-auto">
                      <Link
                        href={`/sign-in?callbackUrl=/menu/${id}`}
                        className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-orange-500/25 transition hover:brightness-110 text-center"
                      >
                        Sign In to Continue
                      </Link>
                      <Link
                        href={`/sign-up?callbackUrl=/menu/${id}`}
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-850 py-2.5 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white text-center"
                      >
                        Create an Account
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handlePlaceOrder} className="py-6 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                      <span>Delivery Details</span>
                      <span className="text-[11px] font-normal text-amber-400">900°F Fresh Delivery</span>
                    </h4>

                    {/* Delivery Address */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Delivery Address *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 742 Evergreen Terrace, Apt 4B, New York"
                        value={orderAddress}
                        onChange={(e) => setOrderAddress(e.target.value)}
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    {/* Delivery Date */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Delivery Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={orderDate}
                        onChange={(e) => setOrderDate(e.target.value)}
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    {/* Special Note */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Kitchen Note / Preferences (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Extra hot honey, well done crust, leave at door"
                        value={orderNote}
                        onChange={(e) => setOrderNote(e.target.value)}
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    {/* Order Error Alert */}
                    {orderError && (
                      <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
                        {orderError}
                      </div>
                    )}

                    {/* Order Success Alert */}
                    {orderSuccess && (
                      <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs text-emerald-300">
                        <p className="font-semibold">{orderSuccess}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <Link
                            href="/menu"
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
                          >
                            Order More Pizzas
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Submit / Action Button */}
                    {!orderSuccess && (
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={orderSubmitting}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-500/25 transition-all hover:brightness-110 active:scale-98 disabled:opacity-50"
                        >
                          {orderSubmitting ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              <span>Transmitting Order to Kitchen...</span>
                            </>
                          ) : (
                            <>
                              <span>🍕</span>
                              <span>Place Order Now • ${item.price.toFixed(2)}</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </form>
                )}
              </div>

              {/* Back to Menu Link */}
              <div className="mt-4 pt-4 border-t border-zinc-850 flex items-center justify-between text-xs text-zinc-500">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-1.5 transition hover:text-amber-400"
                >
                  <span>←</span>
                  <span>Back to Full Menu</span>
                </Link>
                <span>🔒 Secure Stripe Checkout</span>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* MORE PIZZAS IN THE SAME CATEGORY                    */}
        {/* ==================================================== */}
        {item && categoryPizzas.length > 0 && (
          <section className="mt-16 border-t border-zinc-800/90 pt-12">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-400">
                  <span>🍕</span>
                  <span>SAME CATEGORY SELECTION</span>
                </div>
                <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                  More From {item.category}
                </h2>
                <p className="mt-1 text-xs text-zinc-400">
                  Explore other hand-crafted wood-fired pizzas in this category.
                </p>
              </div>

              <Link
                href="/menu"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition shrink-0"
              >
                <span>View Full Menu</span>
                <span>→</span>
              </Link>
            </div>

            {/* Grid of related same-category pizzas */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {categoryPizzas.map((related) => {
                const relImageSrc =
                  related.images && related.images.length > 0
                    ? related.images[0]
                    : "https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=800&q=80";

                return (
                  <div
                    key={related._id}
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10"
                  >
                    <div>
                      {/* Image Frame */}
                      <Link
                        href={`/menu/${related._id}`}
                        className="relative h-44 w-full overflow-hidden bg-zinc-950 block"
                      >
                        <Image
                          src={relImageSrc}
                          alt={related.itemName}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent" />

                        {/* Category Badge */}
                        <div className="absolute top-3 left-3">
                          <span className="rounded-full bg-black/75 px-2.5 py-1 text-[10px] font-semibold text-zinc-200 backdrop-blur-md border border-white/10">
                            {related.category}
                          </span>
                        </div>

                        {/* Spicy & Vegetarian Tags */}
                        <div className="absolute top-3 right-3 flex items-center gap-1">
                          {related.isSpicy && (
                            <span
                              title="Spicy Recipe"
                              className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600/90 text-[10px] text-white shadow-sm"
                            >
                              🔥
                            </span>
                          )}
                          {related.isVegetarian && (
                            <span
                              title="Vegetarian"
                              className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600/90 text-[10px] text-white shadow-sm"
                            >
                              🌿
                            </span>
                          )}
                        </div>

                        {/* Gold Badge */}
                        {Boolean(related.isPremium) && (
                          <div className="absolute bottom-2.5 left-3">
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 border border-amber-400/50 px-2 py-0.5 text-[9px] font-bold text-amber-300 backdrop-blur-md">
                              ⭐ Gold Kitchen
                            </span>
                          </div>
                        )}
                      </Link>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5">
                          <span className="truncate max-w-[70%]">📍 {related.location}</span>
                          {related.prepTime && (
                            <span className="text-amber-400/90 shrink-0 text-[10px] font-medium">
                              ⏱️ {related.prepTime}
                            </span>
                          )}
                        </div>

                        <Link href={`/menu/${related._id}`}>
                          <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                            {related.itemName}
                          </h3>
                        </Link>

                        <p className="mt-1 text-xs leading-relaxed text-zinc-400 line-clamp-2">
                          {related.description}
                        </p>

                        {related.vendor?.businessName && (
                          <p className="mt-2 text-[10px] text-zinc-500 truncate">
                            By <span className="text-zinc-300 font-medium">{related.vendor.businessName}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bottom Price & Order Link */}
                    <div className="p-4 pt-0">
                      <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3">
                        <div>
                          <span className="text-[9px] uppercase font-semibold text-zinc-500 block">Price</span>
                          <span className="text-base font-black text-white">
                            ${related.price.toFixed(2)}
                          </span>
                        </div>

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

      <Footer />
    </div>
  );
}

export default function PizzaDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0c0c0e]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-amber-500 border-t-transparent" />
            <p className="text-xs font-semibold text-zinc-400">Loading artisan pizza...</p>
          </div>
        </div>
      }
    >
      <PizzaDetailsContent />
    </Suspense>
  );
}
