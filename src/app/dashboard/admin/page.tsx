"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { api, ensureApiToken } from "@/lib/api";
import Footer from "@/app/components/footer";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "vendor" | "admin";
  businessName?: string;
  subscriptionPlan?: "free" | "premium";
  isBlocked?: boolean;
  createdAt: string;
}

interface AdminMenuItem {
  _id: string;
  itemName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  status: "approved" | "pending" | "rejected" | "inactive";
  vendorId: string;
  createdAt?: string;
  vendor?: {
    _id: string;
    name: string;
    email: string;
    businessName?: string;
    subscriptionPlan?: string;
  };
}

interface AdminOrder {
  _id: string;
  itemId: string;
  vendorId: string;
  customerId: string;
  deliveryDate: string;
  deliveryAddress: string;
  totalPrice?: number;
  status: "pending" | "accepted" | "cooking" | "delivering" | "completed" | "cancelled" | "rejected";
  createdAt: string;
  item?: {
    itemName: string;
    price: number;
    images: string[];
    category: string;
  };
  customer?: {
    name: string;
    email: string;
  };
  vendor?: {
    name: string;
    businessName?: string;
  };
}

interface AdminTransaction {
  _id: string;
  vendorId: string;
  plan: string;
  amount: number;
  currency: string;
  stripeSessionId?: string;
  status: string;
  createdAt: string;
  vendor?: {
    name: string;
    email: string;
    businessName?: string;
  };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: session, isPending: isAuthPending } = useSession();
  const user = session?.user as
    | { id?: string; name?: string; email?: string; role?: string }
    | undefined;

  // View state: users | menu | orders | transactions
  const [activeTab, setActiveTab] = useState<"users" | "menu" | "orders" | "transactions">("users");

  // Data collections
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [menuItems, setMenuItems] = useState<AdminMenuItem[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [menuStatusFilter, setMenuStatusFilter] = useState("all");
  const [menuSearch, setMenuSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  // Summary Metrics (Declared before early returns for React Hook rules)
  const stats = useMemo(() => {
    const totalUsersCount = users.length;
    const vendorCount = users.filter((u) => u.role === "vendor").length;
    const customerCount = users.filter((u) => u.role === "customer").length;

    const totalPizzas = menuItems.length;
    const approvedPizzas = menuItems.filter((i) => i.status === "approved").length;
    const pendingPizzas = menuItems.filter((i) => i.status === "pending").length;

    const totalOrdersCount = orders.length;

    return {
      totalUsersCount,
      vendorCount,
      customerCount,
      totalPizzas,
      approvedPizzas,
      pendingPizzas,
      totalOrdersCount,
      totalRevenue,
    };
  }, [users, menuItems, orders, totalRevenue]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (userRoleFilter !== "all" && u.role !== userRoleFilter) return false;
      if (userSearch.trim()) {
        const q = userSearch.toLowerCase();
        const matchesName = u.name?.toLowerCase().includes(q);
        const matchesEmail = u.email?.toLowerCase().includes(q);
        const matchesBusiness = u.businessName?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesBusiness) return false;
      }
      return true;
    });
  }, [users, userRoleFilter, userSearch]);

  // Filtered Menu Items
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((m) => {
      if (menuStatusFilter !== "all" && m.status !== menuStatusFilter) return false;
      if (menuSearch.trim()) {
        const q = menuSearch.toLowerCase();
        const matchesName = m.itemName?.toLowerCase().includes(q);
        const matchesVendor = m.vendor?.businessName?.toLowerCase().includes(q) || m.vendor?.name?.toLowerCase().includes(q);
        if (!matchesName && !matchesVendor) return false;
      }
      return true;
    });
  }, [menuItems, menuStatusFilter, menuSearch]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    if (orderStatusFilter === "all") return orders;
    return orders.filter((o) => o.status === orderStatusFilter);
  }, [orders, orderStatusFilter]);

  // Fetch all Admin Data
  const fetchAdminData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await ensureApiToken();

      // Parallel fetch across admin endpoints
      const [usersRes, menuRes, ordersRes, txnRes] = await Promise.allSettled([
        api.get<AdminUser[]>("/users"),
        api.get<AdminMenuItem[]>("/menu/admin/all"),
        api.get<AdminOrder[]>("/orders/admin/all"),
        api.get<AdminTransaction[]>("/transactions"),
      ]);

      if (usersRes.status === "fulfilled" && usersRes.value.success && Array.isArray(usersRes.value.data)) {
        setUsers(usersRes.value.data);
      }
      if (menuRes.status === "fulfilled" && menuRes.value.success && Array.isArray(menuRes.value.data)) {
        setMenuItems(menuRes.value.data);
      }
      if (ordersRes.status === "fulfilled" && ordersRes.value.success && Array.isArray(ordersRes.value.data)) {
        setOrders(ordersRes.value.data);
      }
      if (txnRes.status === "fulfilled" && txnRes.value.success) {
        if (Array.isArray(txnRes.value.data)) {
          setTransactions(txnRes.value.data);
        }
        if (typeof txnRes.value.totalRevenue === "number") {
          setTotalRevenue(txnRes.value.totalRevenue);
        }
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error loading administrative data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthPending && user?.role === "admin") {
      fetchAdminData();
    }
  }, [user, isAuthPending]);

  // Handle User Block / Unblock Toggle
  const handleToggleBlock = async (targetUser: AdminUser) => {
    const action = targetUser.isBlocked ? "unblock" : "block";
    if (!confirm(`Are you sure you want to ${action} user "${targetUser.name || targetUser.email}"?`)) {
      return;
    }

    setActionLoadingId(targetUser._id);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await ensureApiToken();
      const res = await api.patch<{ message: string; isBlocked?: boolean }>(
        `/users/${targetUser._id}/block`
      );

      if (res.success) {
        setSuccessMessage(`User "${targetUser.name || targetUser.email}" is now ${action}ed.`);
        // Local update
        setUsers((prev) =>
          prev.map((u) =>
            u._id === targetUser._id ? { ...u, isBlocked: !targetUser.isBlocked } : u
          )
        );
      } else {
        setErrorMessage(res.message || `Failed to ${action} user.`);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : `Error toggling user block status.`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Pizza Status Change (Approve / Reject)
  const handleUpdateMenuStatus = async (
    item: AdminMenuItem,
    newStatus: "approved" | "rejected"
  ) => {
    setActionLoadingId(item._id);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await ensureApiToken();
      const res = await api.patch<{ message: string }>(`/menu/admin/${item._id}/status`, {
        status: newStatus,
      });

      if (res.success) {
        setSuccessMessage(`"${item.itemName}" was marked as "${newStatus}".`);
        setMenuItems((prev) =>
          prev.map((m) => (m._id === item._id ? { ...m, status: newStatus } : m))
        );
      } else {
        setErrorMessage(res.message || "Failed to update item status.");
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error updating item status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Delete Menu Item
  const handleDeleteMenuItem = async (item: AdminMenuItem) => {
    if (!confirm(`Are you sure you want to permanently delete "${item.itemName}"? This cannot be undone.`)) {
      return;
    }

    setActionLoadingId(item._id);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await ensureApiToken();
      const res = await api.delete<{ message: string }>(`/menu/admin/${item._id}`);
      if (res.success) {
        setSuccessMessage(`"${item.itemName}" was permanently deleted.`);
        setMenuItems((prev) => prev.filter((m) => m._id !== item._id));
      } else {
        setErrorMessage(res.message || "Failed to delete item.");
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error deleting menu item.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Auth Protection: Must be authenticated
  if (!isAuthPending && !user) {
    return (
      <div className="flex min-h-[75vh] flex-col items-center justify-center bg-[#0c0c0e] px-4 text-center">
        <div className="max-w-md rounded-3xl border border-zinc-800 bg-[#121216] p-8 shadow-2xl">
          <span className="text-4xl">⚡</span>
          <h2 className="mt-4 text-xl font-bold text-white">Admin Credentials Required</h2>
          <p className="mt-2 text-xs text-zinc-400">
            Please sign in with an Administrator account to access the PizzaHub system management console.
          </p>
          <button
            type="button"
            onClick={() => router.push("/sign-in?callbackUrl=/dashboard/admin")}
            className="mt-6 w-full rounded-xl bg-amber-500 py-3 text-xs font-bold text-black hover:bg-amber-400 transition cursor-pointer"
          >
            Sign In as Administrator
          </button>
        </div>
      </div>
    );
  }

  // Role Gate: Must have role === 'admin'
  if (!isAuthPending && user?.role !== "admin") {
    return (
      <div className="flex min-h-[75vh] flex-col items-center justify-center bg-[#0c0c0e] px-4 text-center">
        <div className="max-w-md rounded-3xl border border-red-500/30 bg-red-500/10 p-8 shadow-2xl">
          <span className="text-4xl">🛡️</span>
          <h2 className="mt-4 text-xl font-bold text-white">Access Denied</h2>
          <p className="mt-2 text-xs text-red-200/80">
            Your current account ({user?.email}) has role &ldquo;{user?.role}&rdquo;. Access to the Admin Console is restricted to platform administrators.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              href="/dashboard"
              className="w-full rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-black hover:bg-amber-400 transition"
            >
              Go to Your Role Dashboard
            </Link>
            <Link
              href="/menu"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white"
            >
              Browse Public Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0c0c0e] text-zinc-100">
      {/* ==================================================== */}
      {/* 1. ADMIN HEADER & SYSTEM BANNER                     */}
      {/* ==================================================== */}
      <section className="border-b border-zinc-850 bg-[#101014] py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-red-600/20 border border-amber-500/40 text-3xl shadow-inner">
                ⚡
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-white">PizzaHub Admin Console</h1>
                  <span className="rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-2.5 py-0.5 text-[10px] font-black uppercase text-white shadow-sm">
                    Super Admin
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  {user?.email} • Platform Governance, Moderation & Financial Tracking
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={fetchAdminData}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white transition cursor-pointer"
              >
                <span>🔄</span>
                <span>Refresh System Data</span>
              </button>

              <Link
                href="/menu"
                className="rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-black hover:bg-amber-400 transition"
              >
                Live Menu →
              </Link>
            </div>
          </div>

          {/* 4 Metrics Cards */}
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-2xl border border-zinc-800 bg-[#141419] p-4">
              <span className="text-[11px] font-medium text-zinc-400">Platform Users</span>
              <p className="mt-1 text-2xl font-extrabold text-white">{stats.totalUsersCount}</p>
              <span className="mt-1 block text-[10px] text-zinc-500">
                {stats.vendorCount} Vendors • {stats.customerCount} Foodies
              </span>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-[#141419] p-4">
              <span className="text-[11px] font-medium text-amber-400">Published Pizzas</span>
              <p className="mt-1 text-2xl font-extrabold text-amber-400">{stats.totalPizzas}</p>
              <span className="mt-1 block text-[10px] text-zinc-500">
                {stats.approvedPizzas} Live • {stats.pendingPizzas} Pending Review
              </span>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-[#141419] p-4">
              <span className="text-[11px] font-medium text-emerald-400">Platform Orders</span>
              <p className="mt-1 text-2xl font-extrabold text-emerald-400">
                {stats.totalOrdersCount}
              </p>
              <span className="mt-1 block text-[10px] text-zinc-500">
                Across all partner kitchens
              </span>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-[#141419] p-4">
              <span className="text-[11px] font-medium text-orange-400">Stripe Subscription Revenue</span>
              <p className="mt-1 text-2xl font-extrabold text-white">
                ${stats.totalRevenue.toFixed(2)}
              </p>
              <span className="mt-1 block text-[10px] text-zinc-500">
                {transactions.length} verified transactions
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* 2. ADMIN SUITE NAVIGATION TABS                       */}
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
        <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-4">
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              activeTab === "users"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                : "bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            <span>👥</span>
            <span>User Management ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("menu")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              activeTab === "menu"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                : "bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            <span>🍕</span>
            <span>Menu Moderation ({menuItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              activeTab === "orders"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                : "bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            <span>📋</span>
            <span>Platform Orders ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("transactions")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              activeTab === "transactions"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                : "bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            <span>💳</span>
            <span>Stripe Revenue (${totalRevenue.toFixed(0)})</span>
          </button>
        </div>

        {/* ==================================================== */}
        {/* TAB 1: USER MANAGEMENT                               */}
        {/* ==================================================== */}
        {activeTab === "users" && (
          <div>
            {/* Filter Bar */}
            <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search user by name, email or pizzeria..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full sm:w-80 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-zinc-500">Filter Role:</span>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-200 focus:border-amber-500 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="customer">Customers</option>
                  <option value="vendor">Pizzeria Vendors</option>
                  <option value="admin">Administrators</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#121216]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="border-b border-zinc-800 bg-zinc-900/60 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Pizzeria / Kitchen</th>
                      <th className="py-3 px-4">Subscription</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-zinc-500">
                          No users found matching your search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isSelf = u._id === user?.id || u.email === user?.email;
                        return (
                          <tr key={u._id} className="hover:bg-zinc-900/30 transition">
                            <td className="py-3 px-4">
                              <div className="font-bold text-white">{u.name || "Anonymous User"}</div>
                              <div className="text-[11px] text-zinc-400">{u.email}</div>
                            </td>

                            <td className="py-3 px-4">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${
                                  u.role === "admin"
                                    ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                    : u.role === "vendor"
                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                    : "bg-zinc-800 text-zinc-300"
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-zinc-300">
                              {u.businessName || (u.role === "vendor" ? "Independent Pizzeria" : "—")}
                            </td>

                            <td className="py-3 px-4">
                              {u.subscriptionPlan === "premium" ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 text-[10px] font-black text-amber-400">
                                  ★ Gold Premium
                                </span>
                              ) : u.role === "vendor" ? (
                                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
                                  Starter (3 limit)
                                </span>
                              ) : (
                                <span className="text-zinc-600">—</span>
                              )}
                            </td>

                            <td className="py-3 px-4">
                              {u.isBlocked ? (
                                <span className="rounded-full bg-red-500/15 border border-red-500/30 px-2 py-0.5 text-[10px] font-bold text-red-400">
                                  ✕ Blocked
                                </span>
                              ) : (
                                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                                  ✓ Active
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-4 text-right">
                              {isSelf ? (
                                <span className="text-[11px] text-zinc-500 italic">Current Admin</span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleToggleBlock(u)}
                                  disabled={actionLoadingId === u._id}
                                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 cursor-pointer ${
                                    u.isBlocked
                                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
                                      : "bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30"
                                  }`}
                                >
                                  {actionLoadingId === u._id
                                    ? "Updating..."
                                    : u.isBlocked
                                    ? "Unblock User"
                                    : "Block User"}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: MENU MODERATION                              */}
        {/* ==================================================== */}
        {activeTab === "menu" && (
          <div>
            {/* Filter Bar */}
            <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <input
                type="text"
                placeholder="Search pizza by title or pizzeria..."
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                className="w-full sm:w-80 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
              />

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-zinc-500">Filter Status:</span>
                <select
                  value={menuStatusFilter}
                  onChange={(e) => setMenuStatusFilter(e.target.value)}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-200 focus:border-amber-500 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="approved">Approved & Live</option>
                  <option value="pending">Pending Approval</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Pizzas Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMenuItems.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-zinc-500">
                  No menu items found.
                </div>
              ) : (
                filteredMenuItems.map((pizza) => {
                  const imageSrc =
                    pizza.images && pizza.images.length > 0
                      ? pizza.images[0]
                      : "https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=600&q=80";

                  const isApproved = pizza.status === "approved";
                  const isPending = pizza.status === "pending";

                  return (
                    <div
                      key={pizza._id}
                      className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#121216] p-4 flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative h-40 w-full overflow-hidden rounded-xl bg-zinc-950">
                          <Image
                            src={imageSrc}
                            alt={pizza.itemName}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover"
                          />
                          <div className="absolute top-2 left-2">
                            <span className="rounded-md bg-black/80 px-2 py-0.5 text-[10px] font-semibold text-zinc-200 backdrop-blur-md">
                              {pizza.category}
                            </span>
                          </div>

                          <div className="absolute top-2 right-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                                isApproved
                                  ? "bg-emerald-500/90 text-black"
                                  : isPending
                                  ? "bg-amber-500/90 text-black"
                                  : "bg-red-500/90 text-white"
                              }`}
                            >
                              {pizza.status}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <h4 className="text-sm font-bold text-white line-clamp-1">{pizza.itemName}</h4>
                          <p className="mt-1 text-xs text-zinc-400 line-clamp-2">{pizza.description}</p>
                          <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
                            <span>By {pizza.vendor?.businessName || pizza.vendor?.name || "Kitchen"}</span>
                            <span className="font-bold text-amber-400">${pizza.price.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Moderation Actions */}
                      <div className="mt-4 pt-3 border-t border-zinc-850 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {!isApproved && (
                            <button
                              type="button"
                              onClick={() => handleUpdateMenuStatus(pizza, "approved")}
                              disabled={actionLoadingId === pizza._id}
                              className="rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition disabled:opacity-50 cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          {isApproved && (
                            <button
                              type="button"
                              onClick={() => handleUpdateMenuStatus(pizza, "rejected")}
                              disabled={actionLoadingId === pizza._id}
                              className="rounded-lg bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition disabled:opacity-50 cursor-pointer"
                            >
                              Unapprove
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteMenuItem(pizza)}
                          disabled={actionLoadingId === pizza._id}
                          className="rounded-lg bg-red-500/10 border border-red-500/20 px-2.5 py-1 text-xs font-bold text-red-400 hover:bg-red-500/20 transition disabled:opacity-50 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: PLATFORM ORDERS MONITOR                       */}
        {/* ==================================================== */}
        {activeTab === "orders" && (
          <div>
            {/* Filter Bar */}
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs text-zinc-400">
                Viewing {filteredOrders.length} platform orders
              </span>

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Order Status:</span>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-200 focus:border-amber-500 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted / In Kitchen</option>
                  <option value="completed">Completed / Delivered</option>
                  <option value="cancelled">Cancelled / Rejected</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#121216]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="border-b border-zinc-800 bg-zinc-900/60 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Pizza Item</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Pizzeria Kitchen</th>
                      <th className="py-3 px-4">Target Date</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-zinc-500">
                          No platform orders found.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((o) => (
                        <tr key={o._id} className="hover:bg-zinc-900/30 transition">
                          <td className="py-3 px-4 font-mono text-zinc-400">#{o._id.slice(-6)}</td>
                          <td className="py-3 px-4 font-bold text-white">
                            {o.item?.itemName || "Artisan Pizza"}
                          </td>
                          <td className="py-3 px-4">
                            <div>{o.customer?.name || "Customer"}</div>
                            <div className="text-[10px] text-zinc-500">{o.customer?.email}</div>
                          </td>
                          <td className="py-3 px-4 text-zinc-300">
                            {o.vendor?.businessName || o.vendor?.name || "Partner Pizzeria"}
                          </td>
                          <td className="py-3 px-4 text-zinc-400">{o.deliveryDate}</td>
                          <td className="py-3 px-4 font-bold text-amber-400">
                            ${(o.item?.price || o.totalPrice || 0).toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                                o.status === "completed"
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : o.status === "accepted"
                                  ? "bg-blue-500/20 text-blue-300"
                                  : o.status === "pending"
                                  ? "bg-amber-500/20 text-amber-300"
                                  : "bg-red-500/20 text-red-300"
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: STRIPE REVENUE & TRANSACTIONS                 */}
        {/* ==================================================== */}
        {activeTab === "transactions" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs text-zinc-400">
                Verified platform transactions powered by Stripe Billing
              </span>
              <span className="text-xs font-bold text-emerald-400">
                Total Verified: ${totalRevenue.toFixed(2)} USD
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#121216]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="border-b border-zinc-800 bg-zinc-900/60 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    <tr>
                      <th className="py-3 px-4">Transaction ID</th>
                      <th className="py-3 px-4">Pizzeria / Vendor</th>
                      <th className="py-3 px-4">Plan</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-zinc-500">
                          No transactions recorded yet.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((txn) => (
                        <tr key={txn._id} className="hover:bg-zinc-900/30 transition">
                          <td className="py-3 px-4 font-mono text-zinc-400">
                            #{txn._id.slice(-8)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-white">
                              {txn.vendor?.businessName || txn.vendor?.name || "Partner Pizzeria"}
                            </div>
                            <div className="text-[10px] text-zinc-500">{txn.vendor?.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="rounded-full bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 text-[10px] font-black text-amber-400 capitalize">
                              ★ {txn.plan}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-black text-emerald-400">
                            +${txn.amount.toFixed(2)} {txn.currency}
                          </td>
                          <td className="py-3 px-4 text-zinc-400">
                            {new Date(txn.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[10px] font-bold capitalize">
                              ✓ {txn.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
