"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { api, ensureApiToken } from "@/lib/api";
import { PizzaSliceIcon } from "../components/pizzahub-logo";

export interface MenuItem {
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
  };
}

const CATEGORIES = [
  "All",
  "Classic Pizzas",
  "Gourmet Pizzas",
  "Spicy Specials",
];

const LOCATIONS = [
  { label: "All Locations", value: "all" },
  { label: "Manhattan, NY", value: "Manhattan" },
  { label: "Brooklyn, NY", value: "Brooklyn" },
  { label: "Queens, NY", value: "Queens" },
];

export default function MenuPage() {
  const { data: session } = useSession();
  const user = session?.user;

  // Search & Filter state
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [sortBy, setSortBy] = useState("featured"); // 'featured' | 'price_asc' | 'price_desc'
  const [filterSpicyOnly, setFilterSpicyOnly] = useState(false);
  const [filterVegOnly, setFilterVegOnly] = useState(false);

  // Quick Order Modal state
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [orderAddress, setOrderAddress] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  useEffect(() => {
    setOrderDate(new Date().toISOString().split("T")[0]);
  }, []);

  // Fetch menu from live API
  const fetchMenu = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (selectedCategory !== "All") params.append("category", selectedCategory);
      if (selectedLocation !== "all") params.append("location", selectedLocation);
      if (sortBy === "price_asc") params.append("sortBy", "price_asc");
      if (sortBy === "price_desc") params.append("sortBy", "price_desc");

      const queryStr = params.toString() ? `?${params.toString()}` : "";
      const res = await api.get<MenuItem[]>(`/menu${queryStr}`);

      if (res.success && Array.isArray(res.data)) {
        setItems(res.data);
      } else {
        setError(res.message || "Failed to load menu items");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch on filter change
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchMenu();
    }, 200);
    return () => clearTimeout(timeout);
  }, [search, selectedCategory, selectedLocation, sortBy]);

  // Client-side quick filters for spicy / veg
  const displayedItems = useMemo(() => {
    return items.filter((item) => {
      if (filterSpicyOnly && !item.isSpicy) return false;
      if (filterVegOnly && !item.isVegetarian) return false;
      return true;
    });
  }, [items, filterSpicyOnly, filterVegOnly]);

  // Handle Order Placement
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    if (!user) {
      setOrderError("Please sign in to place an order.");
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
      await ensureApiToken();
      const res = await api.post("/orders", {
        itemId: selectedItem._id,
        deliveryDate: orderDate,
        deliveryAddress: orderAddress.trim(),
        message: orderNote.trim(),
      });

      if (res.success) {
        setOrderSuccess("Order placed successfully! The kitchen has received your pizza request.");
        setTimeout(() => {
          setSelectedItem(null);
          setOrderSuccess(null);
          setOrderAddress("");
          setOrderNote("");
        }, 2500);
      } else {
        setOrderError(res.message || "Could not place order. Please try again.");
      }
    } catch (err: unknown) {
      setOrderError(err instanceof Error ? err.message : "Failed to place order.");
    } finally {
      setOrderSubmitting(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setSelectedLocation("all");
    setSortBy("featured");
    setFilterSpicyOnly(false);
    setFilterVegOnly(false);
  };

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-zinc-100 pb-20">
      {/* Top Ambient Glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-500/10 via-red-600/5 to-transparent blur-3xl" />

      {/* Hero Header */}
      <header className="border-b border-zinc-800/80 bg-[#121215]/60 pt-10 pb-12 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            {/* Tagline Badge */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
              <PizzaSliceIcon className="h-4 w-4" />
              <span>Wood-Fired Pizzerias & Gourmet Crusts</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Explore Our Artisan Pizza Menu
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              Freshly prepared with naturally fermented sourdough, San Marzano tomatoes, and baked at 900°F. Order direct from your favorite neighborhood kitchen.
            </p>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        
        {/* Search & Filter Toolbar */}
        <div className="rounded-2xl border border-zinc-800 bg-[#141418] p-4 sm:p-6 shadow-xl mb-8 space-y-4">
          
          {/* Row 1: Search & Dropdowns */}
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-12">
            
            {/* Search Input */}
            <div className="relative md:col-span-5">
              <svg
                className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search pizzas (e.g. Margherita, Truffle, Pepperoni)..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-10 pr-9 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Location Filter */}
            <div className="md:col-span-4">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 text-sm text-zinc-200 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc.value} value={loc.value} className="bg-zinc-900 text-white">
                    📍 {loc.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="md:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 text-sm text-zinc-200 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="featured" className="bg-zinc-900 text-white">⭐ Featured / Premium First</option>
                <option value="price_asc" className="bg-zinc-900 text-white">💵 Price: Low to High</option>
                <option value="price_desc" className="bg-zinc-900 text-white">💰 Price: High to Low</option>
              </select>
            </div>

          </div>

          {/* Row 2: Category Pills & Dietary Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-850 pt-4">
            
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                      isSelected
                        ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20"
                        : "bg-zinc-850 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Quick Dietary Filters */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFilterSpicyOnly((v) => !v)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  filterSpicyOnly
                    ? "border-red-500/80 bg-red-500/20 text-red-300"
                    : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                }`}
              >
                <span>🌶️</span>
                <span>Spicy Only</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterVegOnly((v) => !v)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  filterVegOnly
                    ? "border-emerald-500/80 bg-emerald-500/20 text-emerald-300"
                    : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                }`}
              >
                <span>🍃</span>
                <span>Vegetarian Only</span>
              </button>
            </div>

          </div>

        </div>

        {/* Results Counter & Active Filters Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-medium text-zinc-400">
            Showing <span className="font-bold text-white">{displayedItems.length}</span> handcrafted pizzas
          </p>
          {(search || selectedCategory !== "All" || selectedLocation !== "all" || filterSpicyOnly || filterVegOnly) && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 animate-pulse space-y-4"
              >
                <div className="h-52 w-full rounded-xl bg-zinc-800" />
                <div className="h-4 w-3/4 rounded bg-zinc-800" />
                <div className="h-3 w-1/2 rounded bg-zinc-800" />
                <div className="flex justify-between pt-2">
                  <div className="h-6 w-16 rounded bg-zinc-800" />
                  <div className="h-8 w-24 rounded bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center text-red-300">
            <p className="text-base font-semibold">{error}</p>
            <button
              type="button"
              onClick={fetchMenu}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && displayedItems.length === 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 py-16 px-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800 text-2xl mb-4">
              🍕
            </div>
            <h3 className="text-lg font-bold text-white">No pizzas match your search</h3>
            <p className="mt-1 text-sm text-zinc-400 max-w-sm mx-auto">
              We couldn&apos;t find any pizzas matching your current filters. Try searching with a different term or location.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Pizza Cards Grid */}
        {!loading && !error && displayedItems.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayedItems.map((pizza) => {
              const isPremiumVendor = pizza.isPremium === 1 || pizza.vendor?.subscriptionPlan === "premium";
              const primaryImage =
                pizza.images && pizza.images.length > 0
                  ? pizza.images[0]
                  : "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80";

              return (
                <div
                  key={pizza._id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#141418] transition-all duration-300 hover:border-amber-500/50 hover:shadow-xl hover:shadow-black/60"
                >
                  {/* Pizza Image Frame */}
                  <Link href={`/menu/${pizza._id}`} className="relative h-56 w-full overflow-hidden bg-zinc-900 block">
                    <Image
                      src={primaryImage}
                      alt={pizza.itemName}
                      width={600}
                      height={400}
                      className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#141418] via-transparent to-transparent" />

                    {/* Premium Gold Badge */}
                    {isPremiumVendor && (
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-black/80 px-2.5 py-1 text-[11px] font-bold text-amber-300 shadow-lg backdrop-blur-md">
                        <span>⭐</span>
                        <span>Premium Kitchen</span>
                      </div>
                    )}

                    {/* Category Pill */}
                    <div className="absolute top-3 right-3 rounded-md bg-zinc-950/80 px-2 py-0.5 text-[11px] font-medium text-zinc-300 backdrop-blur-xs">
                      {pizza.category}
                    </div>

                    {/* Dietary Badges */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                      {pizza.isSpicy && (
                        <span className="flex items-center gap-1 rounded-md bg-red-950/80 border border-red-500/30 px-2 py-0.5 text-[10px] font-bold text-red-300">
                          🌶️ Spicy
                        </span>
                      )}
                      {pizza.isVegetarian && (
                        <span className="flex items-center gap-1 rounded-md bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                          🍃 Veg
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Pizza Card Body */}
                  <div className="flex flex-1 flex-col p-5">
                    {/* Location & Prep Time */}
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
                      <span className="flex items-center gap-1 truncate max-w-[60%]">
                        📍 {pizza.location}
                      </span>
                      {pizza.prepTime && (
                        <span className="flex items-center gap-1 shrink-0 font-medium text-amber-400/90">
                          ⏱️ {pizza.prepTime}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <Link href={`/menu/${pizza._id}`} className="block">
                      <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                        {pizza.itemName}
                      </h3>
                    </Link>

                    {/* Description */}
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-400 flex-1">
                      {pizza.description}
                    </p>

                    {/* Vendor / Pizzeria Details */}
                    {pizza.vendor && (
                      <div className="mt-3.5 flex items-center gap-2 border-t border-zinc-850 pt-2.5 text-xs text-zinc-400">
                        <span className="text-zinc-500">By</span>
                        <span className="font-semibold text-zinc-300 truncate">
                          {pizza.vendor.businessName || pizza.vendor.name}
                        </span>
                      </div>
                    )}

                    {/* Bottom: Price & Order Action */}
                    <div className="mt-4 flex items-center justify-between pt-2 border-t border-zinc-800/80 gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-zinc-500 block">Price</span>
                        <span className="text-xl font-extrabold text-white">
                          ${pizza.price.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/menu/${pizza._id}`}
                          className="rounded-xl border border-zinc-700/80 bg-zinc-800/70 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
                        >
                          Details
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedItem(pizza);
                            setOrderError(null);
                            setOrderSuccess(null);
                          }}
                          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-orange-500/20 transition hover:opacity-95 active:scale-95"
                        >
                          <span>🍕</span>
                          <span>Order</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Quick Order Modal / Dialog */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-[#16161a] p-6 shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  {selectedItem.category}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Order {selectedItem.itemName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Order Feedback Alert */}
            {orderError && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {orderError}
              </div>
            )}
            {orderSuccess && (
              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                {orderSuccess}
              </div>
            )}

            {/* Form */}
            {!user ? (
              <div className="py-6 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-3xl">
                  🔒
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Sign In Required</h4>
                  <p className="mt-1 text-xs text-zinc-400 max-w-xs mx-auto">
                    Please sign in with your customer account to order <span className="text-amber-400 font-semibold">{selectedItem.itemName}</span> and track live kitchen prep.
                  </p>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    href={`/sign-in?callbackUrl=/menu/${selectedItem._id}`}
                    className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/20 hover:opacity-95 text-center"
                  >
                    Sign In to Continue &rarr;
                  </Link>
                  <Link
                    href={`/menu/${selectedItem._id}`}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 text-center"
                  >
                    View Full Pizza Details
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder} className="mt-4 space-y-4">
                
                {/* Price Summary */}
                <div className="flex items-center justify-between rounded-xl bg-zinc-900 p-3 text-sm">
                  <span className="text-zinc-400">Total Price</span>
                  <span className="text-lg font-extrabold text-amber-400">
                    ${selectedItem.price.toFixed(2)}
                  </span>
                </div>

                {/* Delivery Address */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Delivery Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={orderAddress}
                    onChange={(e) => setOrderAddress(e.target.value)}
                    placeholder="e.g. 124 Broadway, Apt 4B, New York, NY"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-500"
                  />
                </div>

                {/* Delivery Date */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Delivery Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-white outline-none focus:border-amber-500"
                  />
                </div>

                {/* Kitchen Note */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Kitchen Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    placeholder="e.g. Extra crispy crust, please."
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-500"
                  />
                </div>

                {/* Submit CTA */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={orderSubmitting}
                    className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:opacity-95 disabled:opacity-50"
                  >
                    {orderSubmitting ? "Placing Order..." : `Confirm Order — $${selectedItem.price.toFixed(2)}`}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
