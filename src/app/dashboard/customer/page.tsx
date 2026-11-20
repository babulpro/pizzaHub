"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { api, ensureApiToken } from "@/lib/api";
import Footer from "@/app/components/footer";

interface OrderTimelineEvent {
  status: string;
  label: string;
  timestamp: string;
  note?: string;
}

interface CustomerOrder {
  _id: string;
  itemId: string;
  vendorId: string;
  customerId: string;
  deliveryDate: string;
  deliveryAddress: string;
  message?: string;
  totalPrice?: number;
  status: "pending" | "accepted" | "cooking" | "delivering" | "completed" | "cancelled" | "rejected";
  timeline?: OrderTimelineEvent[];
  createdAt: string;
  item?: {
    _id: string;
    itemName: string;
    category: string;
    description?: string;
    price: number;
    images: string[];
    prepTime?: string;
    isSpicy?: boolean;
    isVegetarian?: boolean;
  };
  vendor?: {
    _id: string;
    name: string;
    email: string;
    businessName?: string;
    subscriptionPlan?: string;
  };
}

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { data: session, isPending: isAuthPending } = useSession();
  const user = session?.user as
    | { id?: string; name?: string; email?: string; role?: string }
    | undefined;

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter state: all | active | completed | cancelled
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed" | "cancelled">("all");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Metrics (Declared before early returns for React Hook rules)
  const stats = useMemo(() => {
    const total = orders.length;
    const active = orders.filter((o) =>
      ["pending", "accepted", "cooking", "delivering"].includes(o.status)
    ).length;
    const completed = orders.filter((o) => o.status === "completed").length;
    const spent = orders
      .filter((o) => o.status !== "cancelled" && o.status !== "rejected")
      .reduce((sum, o) => sum + (o.item?.price || o.totalPrice || 0), 0);

    return { total, active, completed, spent };
  }, [orders]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    if (activeTab === "active") {
      return orders.filter((o) =>
        ["pending", "accepted", "cooking", "delivering"].includes(o.status)
      );
    }
    if (activeTab === "completed") {
      return orders.filter((o) => o.status === "completed");
    }
    if (activeTab === "cancelled") {
      return orders.filter((o) => o.status === "cancelled" || o.status === "rejected");
    }
    return orders;
  }, [orders, activeTab]);

  // Fetch Orders
  const fetchOrders = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await ensureApiToken();
      const res = await api.get<CustomerOrder[]>("/orders/my-orders");
      if (res.success && Array.isArray(res.data)) {
        setOrders(res.data);
      } else {
        setOrders([]);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to load orders from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthPending && user) {
      fetchOrders();
    }
  }, [user, isAuthPending]);

  // Cancel Pending Order
  const handleCancelOrder = async (orderId: string, pizzaName: string) => {
    if (!confirm(`Are you sure you want to cancel your order for "${pizzaName}"?`)) {
      return;
    }

    setCancellingId(orderId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await ensureApiToken();
      const res = await api.patch<{ message: string }>(`/orders/${orderId}/cancel`);
      if (res.success) {
        setSuccessMessage(`Order for "${pizzaName}" was cancelled successfully.`);
        fetchOrders();
      } else {
        setErrorMessage(res.message || "Failed to cancel order.");
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error cancelling order.");
    } finally {
      setCancellingId(null);
    }
  };

  // Auth Protection
  if (!isAuthPending && !user) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#0c0c0e] px-4 text-center">
        <div className="max-w-md rounded-3xl border border-zinc-800 bg-[#121216] p-8 shadow-2xl">
          <span className="text-4xl">🍕</span>
          <h2 className="mt-4 text-xl font-bold text-white">Sign In to View Orders</h2>
          <p className="mt-2 text-xs text-zinc-400">
            Please sign in to access your PizzaHub customer dashboard, track order deliveries, and review your artisan pizza history.
          </p>
          <button
            type="button"
            onClick={() => router.push("/sign-in?callbackUrl=/dashboard/customer")}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-xs font-bold text-black hover:brightness-110 transition cursor-pointer"
          >
            Sign In to Foodie Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0c0c0e] text-zinc-100">
      {/* ==================================================== */}
      {/* 1. TOP HEADER & FOODIE BIO BANNER                   */}
      {/* ==================================================== */}
      <section className="border-b border-zinc-850 bg-[#101014] py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-3xl shadow-inner">
                🍕
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-white">
                    {user?.name || "Artisan Foodie"}&apos;s Orders
                  </h1>
                  <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-400">
                    Foodie Member
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  {user?.email} • Live Delivery Tracking & Order History
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5">
              <Link
                href="/menu"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/20 transition hover:brightness-110 active:scale-95 cursor-pointer"
              >
                <span>🍕</span>
                <span>Browse Artisan Menu</span>
              </Link>

              {user?.role !== "vendor" && (
                <Link
                  href="/sign-up?role=vendor"
                  className="hidden sm:flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white transition"
                >
                  <span>👨‍🍳</span>
                  <span>Partner As Pizzeria</span>
                </Link>
              )}
            </div>
          </div>

          {/* Quick Metrics (4-stat grid) */}
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-2xl border border-zinc-800 bg-[#141419] p-4">
              <span className="text-[11px] font-medium text-zinc-400">Total Orders</span>
              <p className="mt-1 text-2xl font-extrabold text-white">{stats.total}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-[#141419] p-4">
              <span className="text-[11px] font-medium text-amber-400">Active In-Kitchen</span>
              <p className="mt-1 text-2xl font-extrabold text-amber-400">{stats.active}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-[#141419] p-4">
              <span className="text-[11px] font-medium text-emerald-400">Completed & Delivered</span>
              <p className="mt-1 text-2xl font-extrabold text-emerald-400">{stats.completed}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-[#141419] p-4">
              <span className="text-[11px] font-medium text-zinc-400">Total Spent</span>
              <p className="mt-1 text-2xl font-extrabold text-white">
                ${stats.spent.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* 2. MAIN ORDERS CONTENT                              */}
      {/* ==================================================== */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Alerts */}
        {errorMessage && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-xs font-semibold text-red-300">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-300">
            <span>{successMessage}</span>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab Controls */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "all"
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              All Orders ({orders.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("active")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "active"
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              Active ({stats.active})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("completed")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "completed"
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              Delivered ({stats.completed})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("cancelled")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "cancelled"
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              Cancelled
            </button>
          </div>

          <button
            type="button"
            onClick={fetchOrders}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>
        </div>

        {/* Orders Listing */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-3 border-amber-500 border-t-transparent" />
            <p className="mt-4 text-xs font-semibold text-zinc-400">Loading your pizza orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-800 bg-[#121216] p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-3xl text-amber-400 border border-amber-500/20">
              🍕
            </div>
            <h3 className="mt-4 text-base font-bold text-white">
              {activeTab === "all"
                ? "No Orders Placed Yet"
                : `No ${activeTab} orders found.`}
            </h3>
            <p className="mt-1 text-xs text-zinc-400 max-w-sm mx-auto">
              Ready to indulge? Explore wood-fired sourdough pizzas, fresh burrata, and truffle specialties prepared by local artisanal pizzerias!
            </p>
            <div className="mt-6">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2.5 text-xs font-bold text-black hover:brightness-110 transition shadow-md"
              >
                <span>🍕</span>
                <span>Explore Artisan Menu</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const imageSrc =
                order.item?.images && order.item.images.length > 0
                  ? order.item.images[0]
                  : "https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=800&q=80";

              const isPending = order.status === "pending";
              const isAccepted = order.status === "accepted";
              const isCompleted = order.status === "completed";
              const isCancelled = order.status === "cancelled" || order.status === "rejected";

              // Step Calculation for Order Progress
              const currentStep = isCancelled
                ? -1
                : isCompleted
                ? 4
                : order.status === "delivering"
                ? 3
                : isAccepted || order.status === "cooking"
                ? 2
                : 1;

              return (
                <div
                  key={order._id}
                  className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#121216] p-6 shadow-lg transition hover:border-zinc-700"
                >
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    {/* Item & Vendor Info */}
                    <div className="flex items-start gap-4">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-950 border border-zinc-800">
                        <Image
                          src={imageSrc}
                          alt={order.item?.itemName || "Artisan Pizza"}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-white">
                            {order.item?.itemName || "Artisan Pizza"}
                          </h3>
                          <span className="font-mono text-xs text-zinc-500">
                            #{order._id.slice(-6)}
                          </span>

                          {/* Status Badge */}
                          {isPending && (
                            <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-400">
                              🟡 Pending Confirmation
                            </span>
                          )}
                          {(isAccepted || order.status === "cooking") && (
                            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                              👨‍🍳 In Kitchen Preparation
                            </span>
                          )}
                          {order.status === "delivering" && (
                            <span className="rounded-full bg-blue-500/15 border border-blue-500/30 px-2.5 py-0.5 text-[10px] font-bold text-blue-400">
                              🛵 Out for Delivery
                            </span>
                          )}
                          {isCompleted && (
                            <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[10px] font-bold text-zinc-300">
                              ✓ Delivered
                            </span>
                          )}
                          {isCancelled && (
                            <span className="rounded-full bg-red-500/15 border border-red-500/30 px-2.5 py-0.5 text-[10px] font-bold text-red-400">
                              ✕ {order.status === "rejected" ? "Declined by Kitchen" : "Cancelled"}
                            </span>
                          )}
                        </div>

                        {/* Kitchen Bio */}
                        <p className="mt-1 text-xs text-zinc-400">
                          Pizzeria:{" "}
                          <strong className="text-zinc-200">
                            {order.vendor?.businessName || order.vendor?.name || "Artisan Partner Kitchen"}
                          </strong>
                          {order.vendor?.subscriptionPlan === "premium" && (
                            <span className="ml-1.5 text-amber-400 text-[10px] font-black">
                              ★ Gold Kitchen
                            </span>
                          )}
                        </p>

                        {/* Delivery Meta */}
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-zinc-400">
                          <span>📅 Target Date: <strong className="text-zinc-300">{order.deliveryDate}</strong></span>
                          <span>📍 <span className="text-zinc-300">{order.deliveryAddress}</span></span>
                          {order.message && (
                            <span className="text-zinc-400 italic">💬 &ldquo;{order.message}&rdquo;</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Price & Action Buttons */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 border-t md:border-t-0 border-zinc-800 pt-3 md:pt-0">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] uppercase tracking-wider text-zinc-500">Order Total</span>
                        <p className="text-lg font-black text-amber-400">
                          ${(order.item?.price || order.totalPrice || 0).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Cancel Button: only available for pending orders */}
                        {isPending && (
                          <button
                            type="button"
                            onClick={() =>
                              handleCancelOrder(
                                order._id,
                                order.item?.itemName || "Artisan Pizza"
                              )
                            }
                            disabled={cancellingId === order._id}
                            className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 transition disabled:opacity-50 cursor-pointer"
                          >
                            {cancellingId === order._id ? "Cancelling..." : "Cancel Order"}
                          </button>
                        )}

                        {/* Order Again / View Pizza details */}
                        <Link
                          href={`/menu/${order.itemId || order.item?._id}`}
                          className="rounded-xl bg-zinc-850 border border-zinc-700 px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white transition"
                        >
                          {isCompleted ? "Order Again →" : "View Pizza →"}
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Visual 4-Step Progress Tracker */}
                  {!isCancelled && (
                    <div className="mt-6 border-t border-zinc-800/80 pt-4">
                      <div className="grid grid-cols-4 gap-2 text-center">
                        {/* Step 1 */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                              currentStep >= 1
                                ? "bg-amber-500 text-black shadow-md shadow-amber-500/30"
                                : "bg-zinc-800 text-zinc-500"
                            }`}
                          >
                            ✓
                          </div>
                          <span className="mt-1.5 text-[10px] font-semibold text-zinc-300">
                            Order Placed
                          </span>
                        </div>

                        {/* Step 2 */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                              currentStep >= 2
                                ? "bg-amber-500 text-black shadow-md shadow-amber-500/30"
                                : "bg-zinc-800 text-zinc-500"
                            }`}
                          >
                            {currentStep >= 2 ? "✓" : "2"}
                          </div>
                          <span className="mt-1.5 text-[10px] font-semibold text-zinc-300">
                            In Kitchen
                          </span>
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                              currentStep >= 3
                                ? "bg-amber-500 text-black shadow-md shadow-amber-500/30"
                                : "bg-zinc-800 text-zinc-500"
                            }`}
                          >
                            {currentStep >= 3 ? "✓" : "3"}
                          </div>
                          <span className="mt-1.5 text-[10px] font-semibold text-zinc-300">
                            Out for Delivery
                          </span>
                        </div>

                        {/* Step 4 */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                              currentStep >= 4
                                ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/30"
                                : "bg-zinc-800 text-zinc-500"
                            }`}
                          >
                            {currentStep >= 4 ? "✓" : "4"}
                          </div>
                          <span className="mt-1.5 text-[10px] font-semibold text-zinc-300">
                            Delivered
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
