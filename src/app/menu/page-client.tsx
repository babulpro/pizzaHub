"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useSession } from "@/lib/auth-client";
import { api, ensureApiToken } from "@/lib/api";
import showToast from "@/lib/toast";
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

export const CATEGORIES = [
  "All",
  "Classic Pizzas",
  "Gourmet Pizzas",
  "Spicy Specials",
];

export const LOCATIONS = [
  { label: "All Locations (Dhaka)", value: "all" },
  { label: "Gulshan, Dhaka", value: "Gulshan" },
  { label: "Banani, Dhaka", value: "Banani" },
  { label: "Dhanmondi, Dhaka", value: "Dhanmondi" },
  { label: "Uttara, Dhaka", value: "Uttara" },
  { label: "Mohakhali, Dhaka", value: "Mohakhali" },
  { label: "Mirpur, Dhaka", value: "Mirpur" },
  { label: "Mohammadpur, Dhaka", value: "Mohammadpur" },
  { label: "Baily Road, Dhaka", value: "Baily Road" },
];

export interface MenuClientProps {
  initialItems: MenuItem[];
  initialParams?: {
    search?: string;
    category?: string;
    location?: string;
    sortBy?: string;
  };
}

export default function MenuClient({
  initialItems = [],
  initialParams,
}: MenuClientProps) {
  const { data: session } = useSession();
  const user = session?.user;

  // Search & Filter state initialized from server props
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState(initialParams?.search || "");
  const [selectedCategory, setSelectedCategory] = useState(initialParams?.category || "All");
  const [selectedLocation, setSelectedLocation] = useState(initialParams?.location || "all");
  const [sortBy, setSortBy] = useState(initialParams?.sortBy || "featured");
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

  // Update items if server props change
  useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      setItems(initialItems);
    }
  }, [initialItems]);

  // Fetch menu when user changes interactive filters
  const fetchMenu = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (selectedCategory !== "All") params.append("category", selectedCategory);
      if (selectedLocation !== "all") params.append("location", selectedLocation);
      if (sortBy) params.append("sortBy", sortBy);

      const queryStr = params.toString() ? `?${params.toString()}` : "";
      const res = await api.get<MenuItem[]>(`/menu${queryStr}`);

      if (res.success && Array.isArray(res.data)) {
        setItems(res.data);
      } else {
        setError(res.message || "Failed to load pizzas from server.");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error connecting to the menu server."
      );
    } finally {
      setLoading(false);
    }
  };

  // Debounced search & filter effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMenu();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedLocation, sortBy]);

  // Client-side additional toggle filtering (Spicy / Vegetarian)
  const displayedItems = useMemo(() => {
    return items.filter((item) => {
      if (filterSpicyOnly && !item.isSpicy) return false;
      if (filterVegOnly && !item.isVegetarian) return false;
      return true;
    });
  }, [items, filterSpicyOnly, filterVegOnly]);

  // Quick Order Handler
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    if (!user) {
      showToast.warning("Sign In Required 🔒", "Please sign in to complete your pizza order.");
      return;
    }

    if (!orderAddress.trim()) {
      const msg = "Please enter your delivery address.";
      setOrderError(msg);
      showToast.warning("Address Required 📍", msg);
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
        const successMsg = `Order placed successfully! The kitchen has received your pizza request for ${selectedItem.itemName}.`;
        setOrderSuccess(successMsg);
        showToast.pizza(
          "Order Confirmed! 🍕",
          `Your ${selectedItem.itemName} is now baking in the wood-fired oven!`
        );
        setTimeout(() => {
          setSelectedItem(null);
          setOrderSuccess(null);
          setOrderAddress("");
          setOrderNote("");
        }, 2500);
      } else {
        const errMsg = res.message || "Could not place order. Please try again.";
        setOrderError(errMsg);
        showToast.error("Order Failed", errMsg);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to place order.";
      setOrderError(errMsg);
      showToast.error("Order Error", errMsg);
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
    showToast.info("Filters Reset 🍕", "Showing all handcrafted artisan pizzas.");
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-50 dark:bg-[#0c0c0e] text-zinc-900 dark:text-zinc-100 pb-20 transition-colors">
      {/* Top Ambient Glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[400px] w-full max-w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-500/10 via-red-600/5 to-transparent blur-3xl" />

      {/* Hero Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-[#121215]/60 pt-8 pb-10 sm:pt-10 sm:pb-12 backdrop-blur-md transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="flex flex-col items-center text-center"
          >
            {/* Tagline Badge */}
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
              <PizzaSliceIcon className="h-4 w-4 shrink-0" />
              <span className="truncate">Wood-Fired Pizzerias & Gourmet Crusts</span>
            </div>

            <h1 className="font-artisan text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl md:text-5xl">
              Explore Our Artisan Pizza Menu
            </h1>
            <p className="mt-2.5 max-w-2xl text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-sm md:text-base">
              Freshly prepared with naturally fermented sourdough, San Marzano tomatoes, and baked at 900°F. Order direct from your favorite neighborhood kitchen.
            </p>
          </motion.div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 pt-6 sm:pt-8 sm:px-6 lg:px-8">
        
        {/* Search & Filter Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141418] p-3.5 sm:p-6 shadow-xl mb-6 sm:mb-8 space-y-4"
        >
          {/* Row 1: Search & Dropdowns */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            
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
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 pl-10 pr-9 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
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
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 px-3.5 py-2.5 text-sm text-zinc-800 dark:text-zinc-200 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc.value} value={loc.value} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
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
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 px-3.5 py-2.5 text-sm text-zinc-800 dark:text-zinc-200 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="featured" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">⭐ Featured / Premium First</option>
                <option value="price_asc" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">💵 Price: Low to High</option>
                <option value="price_desc" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">💰 Price: High to Low</option>
              </select>
            </div>

          </div>

          {/* Row 2: Category Pills (Horizontal Swipe on Mobile) & Dietary Toggles */}
          <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between border-t border-zinc-200 dark:border-zinc-850 pt-3.5">
            
            {/* Category Pills - Scrollable Carousel on Mobile */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full py-0.5">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <motion.button
                    key={cat}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-semibold shrink-0 transition cursor-pointer ${
                      isSelected
                        ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 font-bold"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    {cat}
                  </motion.button>
                );
              })}
            </div>

            {/* Quick Dietary Filters */}
            <div className="flex items-center gap-2.5 shrink-0">
              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setFilterSpicyOnly((v) => !v)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  filterSpicyOnly
                    ? "border-red-500/80 bg-red-500/20 text-red-700 dark:text-red-300"
                    : "border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-700"
                }`}
              >
                <span>🌶️</span>
                <span>Spicy Only</span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setFilterVegOnly((v) => !v)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  filterVegOnly
                    ? "border-emerald-500/80 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                    : "border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-700"
                }`}
              >
                <span>🍃</span>
                <span>Vegetarian Only</span>
              </motion.button>
            </div>

          </div>

        </motion.div>

        {/* Results Counter & Active Filters Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Showing <span className="font-bold text-zinc-900 dark:text-white">{displayedItems.length}</span> handcrafted pizzas
          </p>
          {(search || selectedCategory !== "All" || selectedLocation !== "all" || filterSpicyOnly || filterVegOnly) && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
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
                className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 animate-pulse space-y-4 shadow-sm"
              >
                <div className="h-52 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-3 w-1/2 rounded bg-zinc-100 dark:bg-zinc-800" />
                <div className="flex justify-between pt-2">
                  <div className="h-6 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-8 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-50 dark:bg-red-500/10 p-8 text-center text-red-700 dark:text-red-300">
            <p className="text-base font-semibold">{error}</p>
            <button
              type="button"
              onClick={fetchMenu}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && displayedItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 py-16 px-4 text-center shadow-sm"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-2xl mb-4">
              🍕
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No pizzas match your search</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">
              We couldn&apos;t find any pizzas matching your current filters. Try searching with a different term or location.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition cursor-pointer"
            >
              Reset All Filters
            </button>
          </motion.div>
        )}

        {/* Pizza Cards Grid with Layout Animations */}
        {!loading && !error && displayedItems.length > 0 && (
          <motion.div
            layout
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {displayedItems.map((pizza) => {
                const isPremiumVendor = pizza.isPremium === 1 || pizza.vendor?.subscriptionPlan === "premium";
                const primaryImage =
                  pizza.images && pizza.images.length > 0
                    ? pizza.images[0]
                    : "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80";

                return (
                  <motion.div
                    layout
                    key={pizza._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35 }}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#141418] shadow-md dark:shadow-none transition-colors duration-300 hover:border-amber-500/50 hover:shadow-xl"
                  >
                    {/* Pizza Image Frame */}
                    <Link href={`/menu/${pizza._id}`} className="relative h-56 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 block">
                      <Image
                        src={primaryImage}
                        alt={pizza.itemName}
                        width={600}
                        height={400}
                        unoptimized={primaryImage.startsWith("http")}
                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-108"
                      />

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

                      {/* Premium Gold Badge */}
                      {isPremiumVendor && (
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-black/80 px-2.5 py-1 text-[11px] font-bold text-amber-300 shadow-lg backdrop-blur-md">
                          <span>⭐</span>
                          <span>Premium Kitchen</span>
                        </div>
                      )}

                      {/* Category Pill */}
                      <div className="absolute top-3 right-3 rounded-full bg-black/75 border border-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-xs">
                        {pizza.category}
                      </div>

                      {/* Dietary Badges */}
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                        {pizza.isSpicy && (
                          <span className="flex items-center gap-1 rounded-md bg-red-600/90 border border-red-500/40 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                            🌶️ Spicy
                          </span>
                        )}
                        {pizza.isVegetarian && (
                          <span className="flex items-center gap-1 rounded-md bg-emerald-600/90 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                            🍃 Veg
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Pizza Card Body */}
                    <div className="flex flex-1 flex-col p-5">
                      {/* Location & Prep Time */}
                      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">
                        <span className="flex items-center gap-1 truncate max-w-[60%]">
                          📍 {pizza.location}
                        </span>
                        {pizza.prepTime && (
                          <span className="flex items-center gap-1 shrink-0 font-medium text-amber-600 dark:text-amber-400/90">
                            ⏱️ {pizza.prepTime}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <Link href={`/menu/${pizza._id}`} className="block">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {pizza.itemName}
                        </h3>
                      </Link>

                      {/* Description */}
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 flex-1">
                        {pizza.description}
                      </p>

                      {/* Vendor / Pizzeria Details */}
                      {pizza.vendor && (
                        <div className="mt-3.5 flex items-center gap-2 border-t border-zinc-150 dark:border-zinc-800 pt-2.5 text-xs text-zinc-500 dark:text-zinc-400">
                          <span className="text-zinc-400 dark:text-zinc-500">By</span>
                          <span className="font-semibold text-zinc-800 dark:text-zinc-300 truncate">
                            {pizza.vendor.businessName || pizza.vendor.name}
                          </span>
                        </div>
                      )}

                      {/* Bottom: Price & Order Action */}
                      <div className="mt-4 flex items-center justify-between pt-2 border-t border-zinc-150 dark:border-zinc-800/80 gap-2">
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-zinc-400 dark:text-zinc-500 block">Price</span>
                          <span className="text-xl font-extrabold text-zinc-900 dark:text-white">
                            ${pizza.price.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/menu/${pizza._id}`}
                            className="rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/70 dark:hover:bg-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition"
                          >
                            Details
                          </Link>
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedItem(pizza);
                              setOrderError(null);
                              setOrderSuccess(null);
                            }}
                            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-orange-500/20 transition hover:opacity-95 cursor-pointer"
                          >
                            <span>🍕</span>
                            <span>Order</span>
                          </motion.button>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

      </main>

      {/* Quick Order Modal / Dialog with AnimatePresence */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
              className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#16161a] p-4.5 sm:p-6 shadow-2xl"
            >
              
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    {selectedItem.category}
                  </span>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-0.5">
                    Order {selectedItem.itemName}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Order Feedback Alert */}
              {orderError && (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-50 dark:bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300">
                  {orderError}
                </div>
              )}
              {orderSuccess && (
                <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300">
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
                    <h4 className="text-base font-bold text-zinc-900 dark:text-white">Sign In Required</h4>
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 max-w-xs mx-auto">
                      Please sign in with your customer account to order <span className="text-amber-600 dark:text-amber-400 font-semibold">{selectedItem.itemName}</span> and track live kitchen prep.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 pt-2">
                    <Link
                      href={`/sign-in?callbackUrl=/menu/${selectedItem._id}`}
                      className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/20 hover:opacity-95 text-center cursor-pointer"
                    >
                      Sign In to Continue &rarr;
                    </Link>
                    <Link
                      href={`/menu/${selectedItem._id}`}
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-center cursor-pointer"
                    >
                      View Full Pizza Details
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePlaceOrder} className="mt-4 space-y-4">
                  
                  {/* Price Summary */}
                  <div className="flex items-center justify-between rounded-xl bg-zinc-100 dark:bg-zinc-900 p-3 text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">Total Price</span>
                    <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
                      ${selectedItem.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Delivery Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={orderAddress}
                      onChange={(e) => setOrderAddress(e.target.value)}
                      placeholder="e.g. House 42, Road 11, Block D, Banani, Dhaka"
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Delivery Date */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Delivery Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={orderDate}
                      onChange={(e) => setOrderDate(e.target.value)}
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Kitchen Note */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Kitchen Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      placeholder="e.g. Extra crispy crust, please."
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Submit CTA */}
                  <div className="pt-2">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={orderSubmitting}
                      className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:opacity-95 disabled:opacity-50 cursor-pointer"
                    >
                      {orderSubmitting ? "Placing Order..." : `Confirm Order — $${selectedItem.price.toFixed(2)}`}
                    </motion.button>
                  </div>
                </form>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
