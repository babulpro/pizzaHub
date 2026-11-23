"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useSession } from "@/lib/auth-client";
import { api, ensureApiToken } from "@/lib/api";
import showToast from "@/lib/toast";
import type { ReviewItem, ReviewStats } from "@/lib/review-service";

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
  initialReviews?: ReviewItem[];
  initialStats?: ReviewStats;
}

export default function PizzaDetailsClient({
  id,
  initialItem,
  initialReviews,
  initialStats,
}: DetailsClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const [item, setItem] = useState<MenuItemDetails | null>(initialItem);
  const [loading, setLoading] = useState(!initialItem);
  const [error, setError] = useState<string | null>(null);

  // Gallery Active Image
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Order Quantity
  const [quantity, setQuantity] = useState<number>(1);

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

  // Customer Reviews State
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews || []);
  const [stats, setStats] = useState<ReviewStats>(
    initialStats || {
      averageRating: 0,
      totalReviews: 0,
      ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    }
  );
  const [loadingReviews, setLoadingReviews] = useState<boolean>(!initialReviews);
  const [canReview, setCanReview] = useState<boolean>(false);
  const [hasOrdered, setHasOrdered] = useState<boolean>(false);
  const [existingReview, setExistingReview] = useState<ReviewItem | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState<boolean>(false);
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);

  // Review Form Input
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [commentInput, setCommentInput] = useState<string>("");
  const [reviewSubmitting, setReviewSubmitting] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      const res = await api.get<ReviewItem[]>(`/reviews?itemId=${id}`);
      if (res.success && Array.isArray(res.data)) {
        setReviews(res.data);
        if (res.stats) setStats(res.stats as ReviewStats);
      }
    } catch {
      // ignore
    } finally {
      setLoadingReviews(false);
    }
  };

  const checkEligibility = async () => {
    if (!user) {
      setCanReview(false);
      setHasOrdered(false);
      setExistingReview(null);
      return;
    }

    setCheckingEligibility(true);
    try {
      await ensureApiToken();
      const res = await api.get<{
        canReview?: boolean;
        hasOrdered?: boolean;
        existingReview?: ReviewItem | null;
      }>(`/reviews/eligibility?itemId=${id}`);

      if (res.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const resAny = res as any;
        setCanReview(Boolean(resAny.canReview));
        setHasOrdered(Boolean(resAny.hasOrdered));
        const exist = (resAny.existingReview as ReviewItem) || null;
        setExistingReview(exist);
        if (exist) {
          setRatingInput(exist.rating);
          setCommentInput(exist.comment);
        }
      }
    } catch {
      setCanReview(false);
      setHasOrdered(false);
    } finally {
      setCheckingEligibility(false);
    }
  };

  useEffect(() => {
    if (initialReviews) {
      setReviews(initialReviews);
      setLoadingReviews(false);
    } else {
      fetchReviews();
    }
    if (initialStats) {
      setStats(initialStats);
    }
  }, [id, initialReviews, initialStats]);

  useEffect(() => {
    checkEligibility();
  }, [id, user]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast.warning("Sign In Required 🔒", "Please sign in to submit a review.");
      return;
    }
    if (!canReview) {
      showToast.error(
        "Review Locked",
        "You can give a review only after the order of any pizza on PizzaHub."
      );
      return;
    }
    if (commentInput.trim().length < 3) {
      setReviewError("Review comment must be at least 3 characters.");
      return;
    }

    setReviewSubmitting(true);
    setReviewError(null);
    try {
      await ensureApiToken();
      const res = await api.post<{
        message?: string;
        data?: ReviewItem;
      }>("/reviews", {
        itemId: id,
        rating: ratingInput,
        comment: commentInput.trim(),
      });

      if (res.success) {
        showToast.pizza(
          "Review Published! ⭐",
          res.message || "Thank you for sharing your tasting experience!"
        );
        setShowReviewForm(false);
        await Promise.all([fetchReviews(), checkEligibility()]);
      } else {
        const msg = res.message || "Could not save review.";
        setReviewError(msg);
        showToast.error("Review Error", msg);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit review.";
      setReviewError(msg);
      showToast.error("Review Error", msg);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    setDeletingId(reviewId);
    try {
      await ensureApiToken();
      const res = await api.delete(`/reviews/${reviewId}`);
      if (res.success) {
        showToast.success("Review Deleted", "Your review has been removed.");
        if (existingReview?._id === reviewId) {
          setExistingReview(null);
          setCommentInput("");
          setRatingInput(5);
        }
        await Promise.all([fetchReviews(), checkEligibility()]);
      } else {
        showToast.error("Delete Failed", res.message || "Unable to delete review.");
      }
    } catch (err: unknown) {
      showToast.error(
        "Delete Failed",
        err instanceof Error ? err.message : "Error deleting review."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Initialize date safely on client side
  useEffect(() => {
    setOrderDate(new Date().toISOString().split("T")[0]);
  }, []);

  // Reset form status and active image when route ID changes
  useEffect(() => {
    setOrderSuccess(null);
    setOrderError(null);
    setOrderNote("");
    setQuantity(1);
    setSelectedImage(null);
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
        if (!isMounted) return;
        if (res.success && Array.isArray(res.data)) {
          const filtered = res.data.filter((p) => p._id !== item._id);
          if (filtered.length > 0) {
            setCategoryPizzas(filtered.slice(0, 4));
          } else {
            // Fallback: load general menu items if no others in this category
            api.get<MenuItemDetails[]>("/menu").then((fallbackRes) => {
              if (isMounted && fallbackRes.success && Array.isArray(fallbackRes.data)) {
                setCategoryPizzas(
                  fallbackRes.data.filter((p) => p._id !== item._id).slice(0, 4)
                );
              }
            });
          }
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
      const msg = "Please sign in to place an order.";
      setOrderError(msg);
      showToast.warning("Sign In Required 🔒", msg);
      router.push(`/sign-in?callbackUrl=/menu/${item._id}`);
      return;
    }

    if (!orderAddress.trim()) {
      const msg = "Please provide a valid delivery address.";
      setOrderError(msg);
      showToast.warning("Delivery Address Required 📍", msg);
      return;
    }

    setOrderSubmitting(true);
    setOrderError(null);
    setOrderSuccess(null);

    try {
      await ensureApiToken();
      const res = await api.post("/orders", {
        itemId: item._id,
        quantity: quantity,
        deliveryDate: orderDate,
        deliveryAddress: orderAddress.trim(),
        message: orderNote.trim(),
      });

      if (res.success) {
        const orderTotal = (Number(item.price || 0) * quantity).toFixed(2);
        const msg = `🍕 Order placed successfully for ${quantity}x "${item.itemName}" ($${orderTotal})! The artisan kitchen has received your order.`;
        setOrderSuccess(msg);
        showToast.pizza(
          "Order Transmitted to Kitchen! 🍕",
          `Baking ${quantity}x ${item.itemName} at 900°F.`
        );
        setTimeout(() => {
          router.push("/dashboard/customer/orders");
        }, 2200);
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

  const defaultImage =
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80";

  const activeImage =
    selectedImage ||
    (item?.images && item.images.length > 0 ? item.images[0] : defaultImage);

  const isPremiumVendor =
    item?.isPremium === 1 || item?.vendor?.subscriptionPlan === "premium";

  const itemPrice = typeof item?.price === "number" ? item.price : 20;
  const totalPrice = (itemPrice * quantity).toFixed(2);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-50 dark:bg-[#0c0c0e] text-zinc-900 dark:text-zinc-100 pb-24 transition-colors">
      {/* Ambient Warm Oven Glow */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.6, 0.8, 0.6],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-full max-w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-500/15 via-orange-500/5 to-transparent blur-3xl dark:from-amber-500/10 dark:via-red-600/5"
      />

      {/* Breadcrumb Navigation */}
      <nav className="border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-[#121215]/60 py-3.5 backdrop-blur-md transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <Link href="/" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/menu" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
              Menu
            </Link>
            <span>/</span>
            <span className="text-zinc-900 dark:text-zinc-200 font-semibold truncate max-w-xs">
              {item?.itemName || "Pizza Details"}
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* Loading Spinner */}
        {loading && (
          <div className="flex min-h-[450px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-3 border-amber-500 border-t-transparent" />
              <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Fetching artisan recipe from wood-fired oven...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="mx-auto max-w-md rounded-3xl border border-red-500/30 bg-red-50 dark:bg-red-500/10 p-8 text-center text-red-700 dark:text-red-300 my-16 shadow-lg">
            <div className="text-4xl mb-3">🍕</div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Pizza Not Found</h3>
            <p className="mt-2 text-xs leading-relaxed text-red-600 dark:text-red-300">{error}</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/menu"
                className="rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition shadow"
              >
                ← Back to Full Menu
              </Link>
            </div>
          </div>
        )}

        {/* Pizza Details View */}
        {!loading && !error && item && (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
            {/* Left Column: Image Gallery, Specs, Vendor (7 cols) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="lg:col-span-7 space-y-6"
            >
              {/* Main Image Card with Crossfade Animation */}
              <div className="relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141418] shadow-xl dark:shadow-2xl">
                <div className="relative h-[380px] sm:h-[480px] w-full bg-zinc-100 dark:bg-zinc-950 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeImage}
                      initial={{ opacity: 0.6, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0.6 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={activeImage}
                        alt={item.itemName}
                        fill
                        priority
                        unoptimized={activeImage.startsWith("http")}
                        className="object-cover object-center"
                      />
                    </motion.div>
                  </AnimatePresence>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-80" />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                    {isPremiumVendor && (
                      <span className="flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-black/85 px-3 py-1 text-xs font-bold text-amber-300 shadow-lg backdrop-blur-md">
                        ⭐ Premium Verified Kitchen
                      </span>
                    )}
                    <span className="rounded-full bg-black/75 border border-white/10 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                      {item.category}
                    </span>
                  </div>

                  {/* Top Right Dietary Markers */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    {item.isSpicy && (
                      <span className="flex items-center gap-1 rounded-full bg-red-600/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-md shadow-md">
                        🌶️ Spicy
                      </span>
                    )}
                    {item.isVegetarian && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-600/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-md shadow-md">
                        🍃 Vegetarian
                      </span>
                    )}
                  </div>

                  {/* Bottom Image Overlay Info */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-zinc-200">
                    <span className="flex items-center gap-1.5 font-medium">
                      📍 {item.location}
                    </span>
                    {item.prepTime && (
                      <span className="flex items-center gap-1.5 font-bold text-amber-300">
                        ⏱️ {item.prepTime} average prep
                      </span>
                    )}
                  </div>
                </div>

                {/* Additional Gallery Thumbnails */}
                {item.images && item.images.length > 1 && (
                  <div className="flex items-center gap-3 p-4 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/30 overflow-x-auto">
                    {item.images.map((img, idx) => {
                      const isSelected = activeImage === img;
                      return (
                        <motion.button
                          key={idx}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedImage(img)}
                          className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                            isSelected
                              ? "border-amber-500 scale-105 shadow-md ring-2 ring-amber-500/30"
                              : "border-zinc-300 dark:border-zinc-700/60 opacity-70 hover:opacity-100"
                          }`}
                        >
                          <Image
                            src={img}
                            alt={`${item.itemName} thumbnail ${idx + 1}`}
                            fill
                            unoptimized={img.startsWith("http")}
                            className="object-cover"
                          />
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Artisan Craftsmanship Specifications */}
              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 p-6 backdrop-blur-md shadow-lg dark:shadow-none">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <span>🔥</span>
                  <span>Artisan Craftsmanship Specifications</span>
                </h3>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 p-3.5 transition-colors"
                  >
                    <span className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400">
                      Fermentation
                    </span>
                    <span className="text-xs font-black text-amber-600 dark:text-amber-400 mt-1 block">
                      72-Hour Cold Proof
                    </span>
                  </motion.div>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 p-3.5 transition-colors"
                  >
                    <span className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400">
                      Oven Heat
                    </span>
                    <span className="text-xs font-black text-orange-600 dark:text-orange-400 mt-1 block">
                      900°F Wood-Fired
                    </span>
                  </motion.div>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 p-3.5 transition-colors"
                  >
                    <span className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400">
                      Mozzarella
                    </span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                      100% Buffalo DOP
                    </span>
                  </motion.div>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 p-3.5 transition-colors"
                  >
                    <span className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400">
                      Delivery
                    </span>
                    <span className="text-xs font-black text-rose-600 dark:text-rose-400 mt-1 block">
                      Thermal Insulated
                    </span>
                  </motion.div>
                </div>
              </div>

              {/* Vendor Profile Card */}
              {item.vendor && (
                <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141418] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg dark:shadow-none">
                  <div className="flex items-center gap-4">
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 text-xl font-bold text-white shadow-md overflow-hidden">
                      {item.vendor.image ? (
                        <Image
                          src={item.vendor.image}
                          alt={item.vendor.name || "Vendor Avatar"}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        item.vendor.name?.charAt(0).toUpperCase() || "P"
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                          {item.vendor.businessName || item.vendor.name}
                        </h4>
                        {isPremiumVendor && (
                          <span className="rounded-md bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                            PRO KITCHEN
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                        📍 {item.location} • Verified Artisan Partner
                      </p>
                      {item.vendor.email && (
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-500 mt-0.5">
                          Contact: {item.vendor.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link
                      href={`/menu?location=${encodeURIComponent(item.location)}`}
                      className="inline-flex items-center justify-center rounded-xl border border-zinc-300 dark:border-zinc-700/60 bg-zinc-100 dark:bg-zinc-850 px-4 py-2.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition self-start sm:self-auto cursor-pointer"
                    >
                      More from this Kitchen →
                    </Link>
                  </motion.div>
                </div>
              )}
            </motion.div>

            {/* Right Column: Order Form & Details (5 cols) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="lg:col-span-5 space-y-6"
            >
              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141418] p-6 sm:p-8 shadow-xl dark:shadow-2xl">
                {/* Title & Price Header */}
                <div className="border-b border-zinc-200 dark:border-zinc-800/80 pb-6">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      {item.category}
                    </span>
                    {item.prepTime && (
                      <span className="flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700/60 px-3 py-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        ⏱️ Prep: {item.prepTime}
                      </span>
                    )}
                  </div>

                  <h1 className="font-artisan mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                    {item.itemName}
                  </h1>

                  {/* Customer Review Summary Link */}
                  <a
                    href="#customer-reviews"
                    className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline transition"
                  >
                    <span className="flex items-center text-amber-400 text-sm">
                      {"★".repeat(Math.min(5, Math.max(1, Math.round(stats.averageRating || 5))))}
                      {"☆".repeat(5 - Math.min(5, Math.max(1, Math.round(stats.averageRating || 5))))}
                    </span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">
                      {stats.totalReviews > 0
                        ? `${stats.averageRating.toFixed(1)} (${stats.totalReviews} ${
                            stats.totalReviews === 1 ? "review" : "reviews"
                          })`
                        : "★ New (No reviews yet)"}
                    </span>
                    <span className="text-zinc-500">• View Reviews ↓</span>
                  </a>

                  <div className="mt-4 flex items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white">
                      ${itemPrice.toFixed(2)}
                    </span>
                    <span className="text-xs text-zinc-500 font-medium">
                      USD per pie (freshly baked on demand)
                    </span>
                  </div>

                  <p className="mt-4 text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {item.description}
                  </p>
                </div>

                {/* Status Messages */}
                {orderSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-5 rounded-2xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-300 leading-relaxed"
                  >
                    {orderSuccess}
                  </motion.div>
                )}
                {orderError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-5 rounded-2xl border border-red-500/40 bg-red-50 dark:bg-red-500/10 p-4 text-xs font-semibold text-red-800 dark:text-red-300 leading-relaxed"
                  >
                    {orderError}
                  </motion.div>
                )}

                {/* Order Form */}
                {!user ? (
                  <div className="py-8 text-center space-y-4">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-3xl text-amber-500">
                      🔒
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                        Sign In to Order
                      </h4>
                      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 max-w-xs mx-auto">
                        Sign in to place your artisan order, track real-time kitchen status, and earn pizza reward points.
                      </p>
                    </div>
                    <div className="pt-2 flex flex-col gap-2.5 max-w-xs mx-auto">
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Link
                          href={`/sign-in?callbackUrl=/menu/${item._id}`}
                          className="inline-block w-full rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 py-3 text-xs font-bold text-white shadow-lg shadow-orange-500/20 hover:opacity-95 transition text-center cursor-pointer"
                        >
                          Sign In to Order Now →
                        </Link>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Link
                          href={`/sign-up?callbackUrl=/menu/${item._id}`}
                          className="inline-block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-850 py-2.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition text-center cursor-pointer"
                        >
                          Create Free Account
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handlePlaceOrder} className="mt-6 space-y-4">
                    {/* Quantity Selector with Bounce Motion */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Quantity
                      </label>
                      <div className="flex items-center gap-3">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-850 text-base font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition cursor-pointer"
                        >
                          -
                        </motion.button>
                        <motion.span
                          key={quantity}
                          initial={{ scale: 0.7, y: -2 }}
                          animate={{ scale: 1, y: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          className="min-w-[40px] text-center text-sm font-bold text-zinc-900 dark:text-white"
                        >
                          {quantity}
                        </motion.span>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-850 text-base font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition cursor-pointer"
                        >
                          +
                        </motion.button>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-auto font-medium">
                          Subtotal: <span className="font-bold text-zinc-900 dark:text-white">${totalPrice}</span>
                        </span>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Delivery Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={orderAddress}
                        onChange={(e) => setOrderAddress(e.target.value)}
                        placeholder="e.g. 742 Evergreen Terrace, Apt 2B"
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>

                    {/* Delivery Date */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Delivery Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={orderDate}
                        onChange={(e) => setOrderDate(e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>

                    {/* Special Instructions */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Kitchen Note / Dietary Requests
                      </label>
                      <textarea
                        rows={2}
                        value={orderNote}
                        onChange={(e) => setOrderNote(e.target.value)}
                        placeholder="e.g. Well-done crust, slice into 8 pieces, extra chili flakes."
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 resize-none"
                      />
                    </div>

                    {/* Order Guarantee Note */}
                    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/50 p-3.5 text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1">
                      <p className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200">
                        <span>🔥</span> Direct from 900°F Artisan Oven
                      </p>
                      <p>
                        Your pizza is baked fresh to order by verified kitchen{" "}
                        <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                          {item.vendor?.businessName || item.vendor?.name || "PizzaHub Kitchen"}
                        </span>
                        .
                      </p>
                    </div>

                    {/* Submit CTA */}
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={orderSubmitting}
                      className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-xl shadow-orange-500/20 transition hover:opacity-95 disabled:opacity-50 cursor-pointer"
                    >
                      {orderSubmitting
                        ? "Transmitting to Kitchen..."
                        : `Place Order • $${totalPrice}`}
                    </motion.button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Customer Reviews & Ratings Section */}
        {!loading && item && (
          <section id="customer-reviews" className="mt-16 sm:mt-24 border-t border-zinc-200 dark:border-zinc-850 pt-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  <span>⭐</span>
                  <span>VERIFIED FOODIE FEEDBACK</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white mt-2 font-artisan">
                  Customer Reviews & Ratings
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  Real feedback from customers who have ordered artisan wood-fired pizzas on PizzaHub.
                </p>
              </div>

              {/* Action Button: Write / Edit Review or Scroll to Order */}
              {user && canReview && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => setShowReviewForm((prev) => !prev)}
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-xs font-bold text-black shadow-md shadow-orange-500/20 hover:brightness-110 transition cursor-pointer self-start sm:self-center"
                >
                  {showReviewForm
                    ? "✕ Close Review Form"
                    : existingReview
                    ? "✏️ Edit Your Review"
                    : "⭐ Write a Review"}
                </motion.button>
              )}
            </div>

            {/* Rating Summary + Eligibility Gate Header */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              {/* Score & Distribution Card (7 cols) */}
              <div className="md:col-span-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Big Score Box */}
                  <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 min-w-[140px] text-center">
                    <span className="text-4xl font-black text-zinc-900 dark:text-white">
                      {stats.totalReviews > 0 ? stats.averageRating.toFixed(1) : "—"}
                    </span>
                    <div className="flex items-center text-amber-400 text-base mt-1">
                      {"★".repeat(Math.min(5, Math.max(1, Math.round(stats.averageRating || 5))))}
                      {"☆".repeat(5 - Math.min(5, Math.max(1, Math.round(stats.averageRating || 5))))}
                    </div>
                    <span className="text-[11px] text-zinc-500 mt-1 font-medium">
                      {stats.totalReviews > 0
                        ? `${stats.totalReviews} ${stats.totalReviews === 1 ? "review" : "reviews"}`
                        : "No reviews yet"}
                    </span>
                  </div>

                  {/* Rating Breakdown Bars */}
                  <div className="flex-1 w-full space-y-1.5 text-xs">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = stats.ratingCounts[star as keyof typeof stats.ratingCounts] || 0;
                      const percent =
                        stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="w-7 text-right font-bold text-zinc-700 dark:text-zinc-300">
                            {star}★
                          </span>
                          <div className="flex-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="w-8 text-[11px] text-zinc-400 text-right">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Eligibility & Review Status Callout (5 cols) */}
              <div className="md:col-span-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] p-6 shadow-sm flex flex-col justify-between">
                {!user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      <span>🔒</span>
                      <span>Verified Customer Reviews</span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      To maintain 100% authentic feedback, customer reviews are open only to foodies who have placed an order on PizzaHub.
                    </p>
                    <div className="pt-2">
                      <Link
                        href={`/sign-in?callbackUrl=/menu/${id}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-3.5 py-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                      >
                        Sign In to Review →
                      </Link>
                    </div>
                  </div>
                ) : checkingEligibility ? (
                  <div className="flex items-center gap-2 text-xs text-zinc-400 py-4">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                    <span>Verifying order history...</span>
                  </div>
                ) : !canReview ? (
                  <div className="space-y-2.5">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-500">
                      <span>🔒</span>
                      <span>FIRST ORDER REQUIRED</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                      Order a Pizza to Unlock Reviews
                    </h4>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      You can give a review only after placing your first order of any pizza on PizzaHub. Place an order to share your authentic rating!
                    </p>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const orderEl = document.querySelector("form");
                          if (orderEl) {
                            orderEl.scrollIntoView({ behavior: "smooth" });
                          }
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline transition cursor-pointer"
                      >
                        Order This Pizza Above ↑
                      </button>
                    </div>
                  </div>
                ) : existingReview ? (
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                      <span>✓</span>
                      <span>YOU REVIEWED THIS PIZZA</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                      Your Rating: {existingReview.rating}★
                    </h4>
                    <p className="text-[11px] text-zinc-400 italic line-clamp-2">
                      &ldquo;{existingReview.comment}&rdquo;
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm((prev) => !prev)}
                      className="text-xs font-bold text-amber-500 hover:underline cursor-pointer"
                    >
                      {showReviewForm ? "Close Form" : "Edit Your Review →"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                      <span>✓</span>
                      <span>VERIFIED PIZZAHUB CUSTOMER</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                      You are eligible to review!
                    </h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Thank you for ordering with us. Your taste feedback helps fellow pizza lovers across Dhaka.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(true)}
                      className="text-xs font-bold text-amber-500 hover:underline cursor-pointer"
                    >
                      Write Your Review Now →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Review Form (Toggled) */}
            <AnimatePresence>
              {showReviewForm && canReview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden mt-6"
                >
                  <form
                    onSubmit={handleReviewSubmit}
                    className="rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-[#16161c] p-6 shadow-lg space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        <span>⭐</span>
                        <span>{existingReview ? "Edit Your Review" : "Rate This Artisan Pizza"}</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="text-xs text-zinc-400 hover:text-white transition cursor-pointer"
                      >
                        ✕ Cancel
                      </button>
                    </div>

                    {/* Star Rating Picker */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Your Rating *
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRatingInput(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(null)}
                              className="text-2xl transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                            >
                              <span
                                className={
                                  star <= (hoverRating ?? ratingInput)
                                    ? "text-amber-400"
                                    : "text-zinc-300 dark:text-zinc-700"
                                }
                              >
                                ★
                              </span>
                            </button>
                          ))}
                        </div>
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-2">
                          {hoverRating
                            ? `${hoverRating} / 5`
                            : ratingInput === 5
                            ? "5 / 5 — Exceptional! ⭐"
                            : ratingInput === 4
                            ? "4 / 5 — Delicious 🍕"
                            : ratingInput === 3
                            ? "3 / 5 — Good 🙂"
                            : ratingInput === 2
                            ? "2 / 5 — Fair 😐"
                            : "1 / 5 — Poor 😞"}
                        </span>
                      </div>
                    </div>

                    {/* Comment Textarea */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Your Tasting Experience *
                      </label>
                      <textarea
                        required
                        minLength={3}
                        maxLength={1000}
                        rows={3}
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="How was the 72-hour sourdough crust leavening, San Marzano sauce flavor, and cheese texture? Share your tasting review..."
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition"
                      />
                      <div className="mt-1 flex justify-between text-[11px] text-zinc-500">
                        <span>Minimum 3 characters</span>
                        <span>{commentInput.length} / 1000</span>
                      </div>
                    </div>

                    {reviewError && (
                      <p className="text-xs font-bold text-red-500 dark:text-red-400">
                        {reviewError}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-1">
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={reviewSubmitting}
                        className="rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-500/20 hover:opacity-95 transition disabled:opacity-50 cursor-pointer"
                      >
                        {reviewSubmitting
                          ? "Saving..."
                          : existingReview
                          ? "Update Review"
                          : "Publish Review ⭐"}
                      </motion.button>
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reviews List */}
            <div className="mt-8">
              {loadingReviews ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 p-8 text-center space-y-2">
                  <span className="text-3xl">🍕</span>
                  <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                    No customer reviews yet
                  </h4>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    Be the first verified customer to taste this pizza and share your culinary feedback!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.map((rev) => {
                    const isAuthor =
                      user &&
                      (user.id === rev.customerId ||
                        (user as { _id?: string })._id === rev.customerId ||
                        user.email === rev.customerEmail);
                    const isAdmin = (user as { role?: string })?.role === "admin";

                    return (
                      <div
                        key={rev._id}
                        className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121216] p-5 shadow-xs transition hover:border-zinc-300 dark:hover:border-zinc-700 flex flex-col justify-between"
                      >
                        <div>
                          {/* Reviewer Header */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-xs font-bold text-white shadow-xs">
                                {rev.customerName
                                  ? rev.customerName.charAt(0).toUpperCase()
                                  : "F"}
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">
                                  {rev.customerName}
                                </h5>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                    <span>✓</span>
                                    <span>Verified Order</span>
                                  </span>
                                  <span className="text-[10px] text-zinc-400">•</span>
                                  <span className="text-[10px] text-zinc-500">
                                    {new Date(rev.createdAt).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Stars */}
                            <div className="flex items-center text-amber-400 text-xs">
                              {"★".repeat(Math.min(5, Math.max(1, Math.round(rev.rating))))}
                              {"☆".repeat(5 - Math.min(5, Math.max(1, Math.round(rev.rating))))}
                            </div>
                          </div>

                          {/* Comment Body */}
                          <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            {rev.comment}
                          </p>
                        </div>

                        {/* Author/Admin Delete Action */}
                        {(isAuthor || isAdmin) && (
                          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleDeleteReview(rev._id)}
                              disabled={deletingId === rev._id}
                              className="text-[11px] font-semibold text-red-500 hover:text-red-400 transition cursor-pointer disabled:opacity-50"
                            >
                              {deletingId === rev._id ? "Deleting..." : "🗑️ Delete Review"}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Related Category Pizzas Section */}
        {!loading && categoryPizzas.length > 0 && (
          <section className="mt-20 border-t border-zinc-200 dark:border-zinc-850 pt-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  More in {item?.category || "Artisan Selection"}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mt-1">
                  You Might Also Crave
                </h3>
              </div>
              <Link
                href={`/menu?category=${encodeURIComponent(item?.category || "All")}`}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline transition"
              >
                Browse All {item?.category} →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {categoryPizzas.map((related, idx) => {
                const relatedImg =
                  related.images && related.images.length > 0
                    ? related.images[0]
                    : defaultImage;
                const relPrice = typeof related.price === "number" ? related.price : 20;

                return (
                  <motion.div
                    key={related._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141418] hover:border-amber-500/50 transition-colors duration-300 shadow-md dark:shadow-none"
                  >
                    <Link
                      href={`/menu/${related._id}`}
                      className="relative h-44 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 block"
                    >
                      <Image
                        src={relatedImg}
                        alt={related.itemName}
                        fill
                        unoptimized={relatedImg.startsWith("http")}
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    <div className="p-4 flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 mb-1">
                          <span>📍 {related.location}</span>
                          {related.prepTime && <span>⏱️ {related.prepTime}</span>}
                        </div>
                        <Link href={`/menu/${related._id}`}>
                          <h4 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                            {related.itemName}
                          </h4>
                        </Link>
                        <p className="mt-1 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">
                          {related.description}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between pt-2 border-t border-zinc-150 dark:border-zinc-850">
                        <span className="text-base font-extrabold text-zinc-900 dark:text-white">
                          ${relPrice.toFixed(2)}
                        </span>
                        <Link
                          href={`/menu/${related._id}`}
                          className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3.5 py-1.5 text-xs font-bold text-black hover:brightness-110 transition shadow-sm"
                        >
                          Order / View →
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
