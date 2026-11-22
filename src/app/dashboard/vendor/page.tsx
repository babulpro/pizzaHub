"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { api, ensureApiToken } from "@/lib/api";
import showToast from "@/lib/toast";

interface VendorMenuItem {
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
  status: "approved" | "pending" | "rejected" | "inactive";
  createdAt?: string;
}

interface QuotaDetails {
  plan: "free" | "premium";
  activeCount: number;
  limit: number;
  remaining: number;
  canAddMore: boolean;
  isPremium: boolean;
}

interface KitchenOrder {
  _id: string;
  customerId: string;
  itemId: string;
  vendorId: string;
  deliveryDate: string;
  deliveryAddress: string;
  message?: string;
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
}

const CATEGORIES = [
  "Classic Pizzas",
  "Gourmet Pizzas",
  "Spicy Specials",
];

const ARTISAN_PRESETS = [
  {
    name: "Classic Margherita",
    category: "Classic Pizzas",
    isVeg: true,
    isSpicy: false,
    url: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Burrata & Pesto",
    category: "Gourmet Pizzas",
    isVeg: true,
    isSpicy: false,
    url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Calabria Pepperoni",
    category: "Spicy Specials",
    isVeg: false,
    isSpicy: true,
    url: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Truffle & Bresaola",
    category: "Gourmet Pizzas",
    isVeg: false,
    isSpicy: false,
    url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Fiery Diavola",
    category: "Spicy Specials",
    isVeg: false,
    isSpicy: true,
    url: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Quattro Formaggi",
    category: "Classic Pizzas",
    isVeg: true,
    isSpicy: false,
    url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
  },
];

export default function VendorDashboardPage() {
  const router = useRouter();
  const { data: session, isPending: isAuthPending } = useSession();
  const user = session?.user as { id?: string; name?: string; email?: string; role?: string; businessName?: string } | undefined;

  // View States
  const [activeTab, setActiveTab] = useState<"menu" | "orders">("menu");
  const [items, setItems] = useState<VendorMenuItem[]>([]);
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [quota, setQuota] = useState<QuotaDetails>({
    plan: "free",
    activeCount: 0,
    limit: 3,
    remaining: 3,
    canAddMore: true,
    isPremium: false,
  });

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Vendor Shop Profile State (Shop Name Update)
  const [vendorShopName, setVendorShopName] = useState(user?.businessName || "");
  const [isEditShopModalOpen, setIsEditShopModalOpen] = useState(false);
  const [editShopName, setEditShopName] = useState(user?.businessName || "");
  const [editChefName, setEditChefName] = useState(user?.name || "");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [savingShop, setSavingShop] = useState(false);
  const [shopError, setShopError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.businessName) {
      setVendorShopName(user.businessName);
      setEditShopName(user.businessName);
    }
    if (user?.name) {
      setEditChefName(user.name);
    }
  }, [user?.businessName, user?.name]);

  // Orders Filter
  const [orderFilter, setOrderFilter] = useState<string>("all");

  // Filtered Orders & Metrics (Hook calls placed unconditionally at top)
  const filteredOrders = useMemo(() => {
    if (orderFilter === "all") return orders;
    return orders.filter((o) => o.status === orderFilter);
  }, [orders, orderFilter]);

  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status === "accepted" || o.status === "completed")
      .reduce((sum, o) => sum + (o.item?.price || 0), 0);
  }, [orders]);

  // Add Item Modal State & Cloudinary / Direct URL options
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [imageUploadMode, setImageUploadMode] = useState<"upload" | "url">("upload");
  const [directImageUrl, setDirectImageUrl] = useState("");
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Classic Pizzas");
  const [formDesc, setFormDesc] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formLocation, setFormLocation] = useState("Gulshan, Dhaka");
  const [formPrepTime, setFormPrepTime] = useState("20-25 min");
  const [formSpicy, setFormSpicy] = useState(false);
  const [formVeg, setFormVeg] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submittingItem, setSubmittingItem] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Stripe Upgrade Loading
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Fetch Vendor Data
  const fetchData = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      // Ensure backend JWT token is synced with active session
      await ensureApiToken();

      // Fetch user profile to get latest shop/business name & phone & address
      try {
        const profileRes = await api.get<{
          businessName?: string;
          name?: string;
          phone?: string;
          address?: string;
        }>("/users/profile");
        const profileData = (profileRes.data || profileRes) as {
          businessName?: string;
          name?: string;
          phone?: string;
          address?: string;
        } | undefined;
        if (profileData) {
          if (profileData.businessName) {
            setVendorShopName(profileData.businessName);
            setEditShopName(profileData.businessName);
          }
          if (profileData.name) setEditChefName(profileData.name);
          if (profileData.phone) setEditPhone(profileData.phone);
          if (profileData.address) setEditAddress(profileData.address);
        }
      } catch {
        // non-blocking
      }

      // 1. Fetch vendor's menu items & quota
      const itemsRes = await api.get<VendorMenuItem[]>("/menu/vendor/my-items");
      if (itemsRes.success) {
        const fetchedItems = Array.isArray(itemsRes.data) ? itemsRes.data : [];
        setItems(fetchedItems);

        // Count approved/pending items as active
        const activeItems = fetchedItems.filter(
          (i: VendorMenuItem) => i.status === "approved" || i.status === "pending"
        );

        const quotaObj = (itemsRes.quota || itemsRes) as Partial<QuotaDetails> | undefined;
        const isPrem = Boolean(quotaObj?.isPremium || quotaObj?.plan === "premium");
        const activeCount =
          typeof quotaObj?.activeCount === "number"
            ? quotaObj.activeCount
            : activeItems.length;

        const limit = isPrem ? 9999 : 3;
        const remaining = isPrem ? 9999 : Math.max(0, 3 - activeCount);
        const canAddMore = isPrem || activeCount < 3;

        setQuota({
          plan: isPrem ? "premium" : "free",
          activeCount,
          limit,
          remaining,
          canAddMore,
          isPremium: isPrem,
        });
      }

      // 2. Fetch incoming orders for this kitchen
      const ordersRes = await api.get<KitchenOrder[]>("/orders/vendor/my-orders");
      if (ordersRes.success && Array.isArray(ordersRes.data)) {
        setOrders(ordersRes.data);
      }

      // Wait for a time to show loading and view latest kitchen menu & order updates
      await new Promise((resolve) => setTimeout(resolve, 600));
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthPending && user) {
      fetchData();
    }
  }, [user, isAuthPending]);

  // Auth Protection Guard
  if (isAuthPending) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#0c0c0e]">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#0c0c0e] px-4 text-center">
        <div className="max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-2xl">
          <span className="text-4xl">🔒</span>
          <h2 className="mt-4 text-xl font-bold text-white">Vendor Sign In Required</h2>
          <p className="mt-2 text-xs text-zinc-400">
            Please sign in with your Pizzeria Vendor account to access your kitchen dashboard.
          </p>
          <Link
            href="/sign-in?callbackUrl=/dashboard/vendor"
            className="mt-6 inline-block w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-xs font-bold text-white"
          >
            Sign In to Vendor Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== "vendor" && user.role !== "admin") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#0c0c0e] px-4 text-center">
        <div className="max-w-md rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8 shadow-2xl">
          <span className="text-4xl">👨‍🍳</span>
          <h2 className="mt-4 text-xl font-bold text-white">Partner As A Pizzeria</h2>
          <p className="mt-2 text-xs text-amber-200/80">
            Your current account is registered as a Customer. To sell pizzas and manage an artisan kitchen, partner with PizzaHub as a Pizzeria Vendor!
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              href="/sign-up?role=vendor"
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 py-3 text-xs font-bold text-white shadow-lg"
            >
              Register Pizzeria Account
            </Link>
            <Link
              href="/menu"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-850 py-2.5 text-xs font-semibold text-zinc-300"
            >
              Explore Pizza Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle Image Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Open Add Pizza modal or redirect to subscription page if free limit reached
  const handleAddPizzaClick = () => {
    if (!quota.isPremium && quota.activeCount >= 3) {
      router.push("/dashboard/vendor/subscription");
      return;
    }
    setIsAddModalOpen(true);
  };

    // Handle Save Shop Profile (Business Name & Location Update)
  const handleSaveShopProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setShopError(null);

    if (!editShopName.trim()) {
      setShopError("Pizzeria / shop name is required.");
      return;
    }

    setSavingShop(true);
    try {
      await ensureApiToken();
      const res = await api.patch<{
        success: boolean;
        message?: string;
        data?: { businessName?: string; name?: string };
      }>("/users/profile", {
        businessName: editShopName.trim(),
        name: editChefName.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim(),
      });

      if (res.success) {
        setVendorShopName(editShopName.trim());
        showToast.pizza(
          "Shop Name Updated! 🍕",
          `Your pizzeria name is now "${editShopName.trim()}".`
        );
        setIsEditShopModalOpen(false);
      } else {
        const msg = res.message || "Failed to update shop profile.";
        setShopError(msg);
        showToast.error("Update Failed", msg);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Error saving shop profile.";
      setShopError(errMsg);
      showToast.error("Error", errMsg);
    } finally {
      setSavingShop(false);
    }
  };

  // Handle Add Item Submission (Cloudinary Upload OR Direct URL/Presets -> POST /api/menu)
  const handleCreatePizza = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!quota.isPremium && quota.activeCount >= 3) {
      setModalError("Free tier limit (3 pizzas) reached. Redirecting to subscription page...");
      setTimeout(() => {
        setIsAddModalOpen(false);
        router.push("/dashboard/vendor/subscription");
      }, 700);
      return;
    }

    if (!formName.trim() || !formDesc.trim() || !formPrice) {
      setModalError("Please complete all required fields.");
      return;
    }

    const effectiveImageUrl = (directImageUrl.trim() || imagePreview || "").trim();

    if (!selectedFile && !effectiveImageUrl) {
      setModalError("Please select an image file to upload, enter an image URL, or pick an artisan preset.");
      return;
    }

    setSubmittingItem(true);

    try {
      await ensureApiToken();
      let uploadedImageUrl = effectiveImageUrl;

      // 1. Upload to Cloudinary if a local file was selected
      if (selectedFile) {
        try {
          const formData = new FormData();
          formData.append("file", selectedFile);

          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          const uploadData = await uploadRes.json();
          if (!uploadRes.ok || !uploadData.success) {
            const isDns =
              uploadData.isDnsError ||
              (uploadData.message && uploadData.message.includes("ENOTFOUND"));
            if (isDns) {
              throw new Error(
                "Cloudinary connection failed (getaddrinfo ENOTFOUND api.cloudinary.com). Your network or DNS could not resolve api.cloudinary.com. Switch to 'Direct URL / Presets' above or pick one of the quick artisan presets below to publish immediately."
              );
            }
            throw new Error(uploadData.message || "Failed to upload image to Cloudinary.");
          }
          uploadedImageUrl = uploadData.url;
        } catch (uploadErr: unknown) {
          const errMessage =
            uploadErr instanceof Error ? uploadErr.message : "Image upload failed.";
          setModalError(errMessage);
          // Suggest fallback preset automatically so vendor is not blocked
          if (!imagePreview) {
            setImagePreview(ARTISAN_PRESETS[0].url);
            setDirectImageUrl(ARTISAN_PRESETS[0].url);
          }
          setImageUploadMode("url");
          setSubmittingItem(false);
          return;
        }
      }

      // 2. Submit new menu item to backend
      const res = await api.post<VendorMenuItem>("/menu", {
        itemName: formName.trim(),
        category: formCategory,
        description: formDesc.trim(),
        price: parseFloat(formPrice),
        location: formLocation,
        prepTime: formPrepTime,
        isSpicy: formSpicy,
        isVegetarian: formVeg,
        images: [uploadedImageUrl || ARTISAN_PRESETS[0].url],
      });

      if (res.success) {
        const successMsg = `🍕 "${formName}" created successfully and submitted to your kitchen menu!`;
        setSuccessMessage(successMsg);
        showToast.pizza(
          "Pizza Added to Menu! 🍕",
          `"${formName}" is now active in your kitchen menu.`
        );
        setIsAddModalOpen(false);
        // Reset form
        setFormName("");
        setFormDesc("");
        setFormPrice("");
        setSelectedFile(null);
        setImagePreview(null);
        setDirectImageUrl("");
        fetchData();
      } else {
        const errMsg = res.message || "Failed to publish pizza item.";
        setModalError(errMsg);
        showToast.error("Publish Failed", errMsg);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Error creating menu item.";
      setModalError(errMsg);
      showToast.error("Error", errMsg);
    } finally {
      setSubmittingItem(false);
    }
  };

  // Toggle Item Active/Inactive
  const handleToggleItem = async (itemId: string) => {
    try {
      const res = await api.patch<{ message: string }>(`/menu/${itemId}/toggle`);
      if (res.success) {
        showToast.info("Item Visibility Updated", res.message || "Menu status toggled.");
        fetchData();
      } else {
        const errMsg = res.message || "Failed to toggle item status.";
        setErrorMessage(errMsg);
        showToast.error("Update Failed", errMsg);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Error updating item status.";
      setErrorMessage(errMsg);
      showToast.error("Error", errMsg);
    }
  };

  // Delete Item
  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${itemName}"?`)) return;
    try {
      const res = await api.delete<{ message: string }>(`/menu/${itemId}`);
      if (res.success) {
        const msg = `"${itemName}" was removed from your kitchen menu.`;
        setSuccessMessage(msg);
        showToast.warning("Pizza Removed 🗑️", msg);
        fetchData();
      } else {
        const errMsg = res.message || "Failed to delete item.";
        setErrorMessage(errMsg);
        showToast.error("Delete Failed", errMsg);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Error deleting item.";
      setErrorMessage(errMsg);
      showToast.error("Error", errMsg);
    }
  };

  // Advance Order Status (accepted | rejected)
  const handleUpdateOrderStatus = async (orderId: string, newStatus: "accepted" | "rejected") => {
    try {
      const res = await api.patch<{ message: string }>(`/orders/${orderId}/status`, {
        status: newStatus,
      });

      if (res.success) {
        const msg = `Order updated to "${newStatus}".`;
        setSuccessMessage(msg);
        showToast.success(
          `Order ${newStatus === "accepted" ? "Accepted" : "Declined"} 👨‍🍳`,
          msg
        );
        fetchData();
      } else {
        const errMsg = res.message || "Failed to update order status.";
        setErrorMessage(errMsg);
        showToast.error("Status Update Failed", errMsg);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Error updating order.";
      setErrorMessage(errMsg);
      showToast.error("Error", errMsg);
    }
  };

  // Upgrade to Premium Kitchen via Stripe Checkout
  const handleUpgradeToPremium = async () => {
    setIsUpgrading(true);
    setErrorMessage(null);
    showToast.pizza(
      "Opening Stripe Checkout... 💳",
      "Redirecting to secure subscription portal."
    );
    try {
      await ensureApiToken();
      const res = await api.post<{ url: string }>("/stripe/create-checkout-session");
      const checkoutUrl = (res.data as { url?: string })?.url || (typeof res.url === "string" ? res.url : "");
      if (res.success && checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        const errMsg = res.message || "Failed to initiate Stripe Checkout session.";
        setErrorMessage(errMsg);
        showToast.error("Checkout Failed", errMsg);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Error connecting to Stripe.";
      setErrorMessage(errMsg);
      showToast.error("Stripe Error", errMsg);
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0c0c0e] text-zinc-100">
      {/* Top Banner & Kitchen Bio */}
      <section className="border-b border-zinc-850 bg-[#101014] py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-3xl text-amber-400 shadow-inner">
                👨‍🍳
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black text-white">
                    {vendorShopName || user.businessName || `${user.name}'s Artisan Pizzeria`}
                  </h1>
                  {quota.isPremium ? (
                    <span className="rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-2.5 py-0.5 text-[10px] font-black uppercase text-black shadow-sm">
                      ★ Gold Partner
                    </span>
                  ) : (
                    <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[10px] font-bold text-zinc-300">
                      Starter Plan
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setEditShopName(vendorShopName || user.businessName || "");
                      setEditChefName(user.name || "");
                      setShopError(null);
                      setIsEditShopModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition cursor-pointer"
                    title="Update Pizzeria / Shop Name"
                  >
                    <span>✏️</span>
                    <span>Edit Shop Name</span>
                  </button>
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  {user.email} • {editAddress ? `${editAddress} • ` : ""}Kitchen Hub & Menu Administration
                </p>
              </div>
            </div>

            {/* Quick Stats Strip */}
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-center">
                <span className="block text-[10px] uppercase font-semibold text-zinc-500">Active Pizzas</span>
                <span className="text-lg font-black text-amber-400">{quota.activeCount}</span>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-center">
                <span className="block text-[10px] uppercase font-semibold text-zinc-500">Total Orders</span>
                <span className="text-lg font-black text-white">{orders.length}</span>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-center">
                <span className="block text-[10px] uppercase font-semibold text-zinc-500">Kitchen Revenue</span>
                <span className="text-lg font-black text-emerald-400">${totalRevenue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard Body */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Alerts Feedback */}
        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-xs text-red-300 flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-zinc-400 hover:text-white">✕</button>
          </div>
        )}
        {successMessage && (
          <div className="mb-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs text-emerald-300 flex items-center justify-between">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage(null)} className="text-zinc-400 hover:text-white">✕</button>
          </div>
        )}

        {/* 2. Quota & Subscription Spotlight Card */}
        <div className="mb-8 rounded-3xl border border-zinc-800 bg-gradient-to-r from-zinc-900/90 via-zinc-900/60 to-zinc-950 p-6 shadow-xl backdrop-blur-md">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Subscription & Publishing Quota
                </span>
                {quota.isPremium && (
                  <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                    Active Unlimited
                  </span>
                )}
              </div>

              <h2 className="mt-2 text-xl font-bold text-white">
                {quota.isPremium
                  ? "🌟 Gold Premium Kitchen Active — Unlimited Pizza Listings"
                  : `Free Starter Tier: ${quota.activeCount} of 3 Signature Items Published`}
              </h2>

              <p className="mt-1 text-xs text-zinc-400 max-w-2xl leading-relaxed">
                {quota.isPremium
                  ? "Your pizzeria enjoys unlimited menu listings, priority search placement on PizzaHub, and direct verified Stripe payouts."
                  : "Free vendor kitchens can publish up to 3 active pizzas. Upgrade to Gold Premium to publish unlimited menu items and get featured placement with a Gold badge!"}
              </p>

              {/* Progress bar for Free plan */}
              {!quota.isPremium && (
                <div className="mt-4 flex items-center gap-3 max-w-md">
                  <div className="h-2.5 flex-1 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        quota.activeCount >= 3 ? "bg-red-500" : "bg-gradient-to-r from-amber-500 to-orange-500"
                      }`}
                      style={{ width: `${Math.min((quota.activeCount / 3) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-zinc-300">
                    {quota.activeCount} / 3 Items
                  </span>
                </div>
              )}
            </div>

            {/* Upgrade CTA */}
            {!quota.isPremium && (
              <div className="shrink-0 flex items-center gap-2.5 flex-wrap">
                <Link
                  href="/dashboard/vendor/subscription"
                  className="flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition"
                >
                  <span>📋</span>
                  <span>Subscription Plans</span>
                </Link>
                <button
                  type="button"
                  onClick={handleUpgradeToPremium}
                  disabled={isUpgrading}
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-6 py-3.5 text-xs font-black text-white shadow-xl shadow-orange-500/25 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isUpgrading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Opening Stripe Checkout...</span>
                    </>
                  ) : (
                    <>
                      <span>★</span>
                      <span>Upgrade to Premium ($29.00/mo)</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Controls: My Pizzas vs Kitchen Orders */}
        <div className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("menu")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === "menu"
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              <span>🍕</span>
              <span>My Pizzas ({items.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === "orders"
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              <span>📋</span>
              <span>Incoming Orders ({orders.length})</span>
            </button>
          </div>

          {/* "+ Add New Pizza" Button or Upgrade to Premium if 3 items reached */}
          {activeTab === "menu" && (
            <div>
              {!quota.isPremium && quota.activeCount >= 3 ? (
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/vendor/subscription")}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/25 transition hover:brightness-110 active:scale-95 cursor-pointer"
                >
                  <span>★</span>
                  <span>+ Add New Pizza (Free Limit Reached — Go to Subscription)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAddPizzaClick}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-500/20 transition hover:brightness-110 active:scale-95 cursor-pointer"
                >
                  <span>+</span>
                  <span>
                    Add New Pizza (
                    {quota.isPremium
                      ? "Unlimited"
                      : `${Math.max(0, 3 - quota.activeCount)} Free Remaining`}
                    )
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* ==================================================== */}
        {/* TAB 1: MENU ITEMS MANAGEMENT                         */}
        {/* ==================================================== */}
        {activeTab === "menu" && (
          <div>
            {loading ? (
              <div className="py-20 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-3 border-amber-500 border-t-transparent" />
                <p className="mt-4 text-xs font-semibold text-zinc-400">Loading your kitchen menu...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-zinc-800 p-12 text-center bg-zinc-950/40">
                <span className="text-4xl">🍕</span>
                <h3 className="mt-4 text-base font-bold text-white">No Pizzas Published Yet</h3>
                <p className="mt-1 text-xs text-zinc-400 max-w-sm mx-auto">
                  Add your first wood-fired artisan pizza to your kitchen menu so customers in your area can order!
                </p>
                <button
                  type="button"
                  onClick={handleAddPizzaClick}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-black hover:bg-amber-400 cursor-pointer"
                >
                  + Add Your First Pizza
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((pizza) => {
                  const imageSrc =
                    pizza.images && pizza.images.length > 0
                      ? pizza.images[0]
                      : "https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=1000&q=80";

                  const isLive = pizza.status === "approved";

                  return (
                    <div
                      key={pizza._id}
                      className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800 bg-[#121216] transition-all hover:border-zinc-700"
                    >
                      {/* Image Frame */}
                      <div className="relative h-44 w-full overflow-hidden bg-zinc-950">
                        <Image
                          src={imageSrc}
                          alt={pizza.itemName}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                        {/* Category */}
                        <div className="absolute top-3 left-3">
                          <span className="rounded-md bg-black/75 px-2.5 py-1 text-[11px] font-semibold text-zinc-200 backdrop-blur-md">
                            {pizza.category}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          {isLive ? (
                            <span className="rounded-full bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold text-black shadow-sm">
                              ● Live on Menu
                            </span>
                          ) : (
                            <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-[10px] font-bold text-zinc-400">
                              Inactive
                            </span>
                          )}
                        </div>

                        {/* Bottom Tag & Prep */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-zinc-300">
                          <span>📍 {pizza.location}</span>
                          {pizza.prepTime && <span className="font-semibold text-amber-400">⏱️ {pizza.prepTime}</span>}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-base font-bold text-white line-clamp-1">{pizza.itemName}</h4>
                          <span className="text-base font-extrabold text-amber-400">${pizza.price.toFixed(2)}</span>
                        </div>

                        <p className="mt-2 text-xs text-zinc-400 line-clamp-2 leading-relaxed flex-1">
                          {pizza.description}
                        </p>

                        {/* Actions Strip */}
                        <div className="mt-5 flex items-center justify-between border-t border-zinc-800/80 pt-4 text-xs">
                          {/* Toggle Active Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleItem(pizza._id)}
                            className={`rounded-lg px-3 py-1.5 font-bold transition ${
                              isLive
                                ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                                : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                            }`}
                          >
                            {isLive ? "Turn Off" : "Make Live"}
                          </button>

                          <div className="flex items-center gap-2">
                            <Link
                              href={`/menu/${pizza._id}`}
                              className="rounded-lg bg-zinc-800/80 px-2.5 py-1.5 font-medium text-zinc-300 hover:text-white"
                            >
                              View
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleDeleteItem(pizza._id, pizza.itemName)}
                              className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/10"
                              title="Delete Item"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: INCOMING KITCHEN ORDERS                       */}
        {/* ==================================================== */}
        {activeTab === "orders" && (
          <div>
            {/* Filter Tabs */}
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {["all", "pending", "accepted", "cancelled"].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setOrderFilter(f)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold capitalize transition ${
                    orderFilter === f
                      ? "bg-amber-500 text-black shadow-sm"
                      : "bg-zinc-900 text-zinc-400 hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="py-20 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-3 border-amber-500 border-t-transparent" />
                <p className="mt-4 text-xs font-semibold text-zinc-400">Loading incoming orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-zinc-800 p-12 text-center bg-zinc-950/40">
                <span className="text-4xl">📋</span>
                <h3 className="mt-4 text-base font-bold text-white">No Orders Found</h3>
                <p className="mt-1 text-xs text-zinc-400">
                  {orderFilter === "all"
                    ? "New incoming customer orders will appear here in real time."
                    : `No orders matching status "${orderFilter}".`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const isPending = order.status === "pending";
                  const isAccepted = order.status === "accepted";

                  return (
                    <div
                      key={order._id}
                      className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-[#121216] p-6 shadow-md md:flex-row md:items-center gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-2xl text-amber-400 border border-amber-500/30">
                          🍕
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-zinc-500">#{order._id.slice(-6)}</span>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${
                                order.status === "accepted"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : order.status === "pending"
                                  ? "bg-amber-500/20 text-amber-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>

                          <h4 className="mt-1 text-base font-bold text-white">
                            {order.item?.itemName || "Artisan Pizza Order"}
                          </h4>

                          <p className="text-xs text-zinc-400 mt-1">
                            <strong>Delivery Address:</strong> {order.deliveryAddress}
                          </p>
                          <p className="text-xs text-zinc-400">
                            <strong>Date:</strong> {order.deliveryDate} • <strong>Customer:</strong> {order.customer?.name || "Customer"}
                          </p>
                          {order.message && (
                            <p className="mt-1.5 text-xs text-amber-300/90 bg-amber-500/10 rounded-md px-2 py-1 inline-block">
                              📝 &ldquo;{order.message}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Price & Status Controls */}
                      <div className="flex flex-col items-end gap-3 shrink-0">
                        <span className="text-xl font-black text-white">
                          ${order.item?.price ? order.item.price.toFixed(2) : "--"}
                        </span>

                        {isPending && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(order._id, "accepted")}
                              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 active:scale-95"
                            >
                              ✓ Accept Order
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(order._id, "rejected")}
                              className="rounded-xl bg-zinc-800 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-zinc-700"
                            >
                              Decline
                            </button>
                          </div>
                        )}

                        {isAccepted && (
                          <span className="rounded-lg bg-emerald-950/80 border border-emerald-500/40 px-3 py-1.5 text-xs font-bold text-emerald-300">
                            ✓ In Kitchen Preparation
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>

      {/* ==================================================== */}
      {/* ADD NEW PIZZA MODAL (WITH CLOUDINARY UPLOAD)         */}
      {/* ==================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative my-8 w-full max-w-xl overflow-hidden rounded-3xl border border-zinc-800 bg-[#16161b] p-6 sm:p-8 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Artisan Kitchen Addition
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  Publish New Pizza Item
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Error in modal */}
            {modalError && (
              <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
                {modalError}
              </div>
            )}

            {/* Free Plan Quota Gate */}
            {!quota.isPremium && quota.activeCount >= 3 ? (
              <div className="mt-6 py-6 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-3xl text-amber-400 border border-amber-500/30">
                  ★
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Free Plan Limit Reached (3 / 3)</h4>
                  <p className="mt-1.5 text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                    You have published 3 of 3 allowed pizzas on the Free Starter tier. To upload additional pizzas, upgrade your kitchen to Gold Premium!
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      router.push("/dashboard/vendor/subscription");
                    }}
                    className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-orange-500/25 transition hover:brightness-110 active:scale-95 cursor-pointer"
                  >
                    Go to Subscription Page →
                  </button>
                  <button
                    type="button"
                    onClick={handleUpgradeToPremium}
                    disabled={isUpgrading}
                    className="w-full sm:w-auto rounded-xl border border-zinc-700 bg-zinc-800 px-6 py-3 text-xs font-bold text-zinc-200 hover:text-white transition cursor-pointer"
                  >
                    {isUpgrading ? "Opening Stripe..." : "Stripe Checkout ($29.00/mo)"}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreatePizza} className="mt-6 space-y-4">
              {/* Photo Input (Cloudinary Upload OR Direct URL / Presets) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Pizza Photo *
                  </label>
                  <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-0.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setImageUploadMode("upload")}
                      className={`rounded-md px-2.5 py-1 font-semibold transition cursor-pointer ${
                        imageUploadMode === "upload"
                          ? "bg-amber-500 text-zinc-950 shadow-xs"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      📁 Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadMode("url")}
                      className={`rounded-md px-2.5 py-1 font-semibold transition cursor-pointer ${
                        imageUploadMode === "url"
                          ? "bg-amber-500 text-zinc-950 shadow-xs"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      🔗 Direct URL / Presets
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-amber-500/50 shadow-md">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900 text-xs text-zinc-500">
                      No Photo
                    </div>
                  )}

                  {imageUploadMode === "upload" ? (
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-xs text-zinc-400 file:mr-4 file:rounded-xl file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-zinc-200 hover:file:bg-zinc-750 cursor-pointer"
                      />
                      <p className="mt-1 text-[10px] text-zinc-500">
                        Uploads directly to Cloudinary CDN. (If your network has DNS issues reaching api.cloudinary.com, click Direct URL / Presets above).
                      </p>
                    </div>
                  ) : (
                    <div className="flex-1 space-y-1.5">
                      <input
                        type="url"
                        placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
                        value={directImageUrl}
                        onChange={(e) => {
                          setDirectImageUrl(e.target.value);
                          if (e.target.value.trim()) {
                            setImagePreview(e.target.value.trim());
                            setSelectedFile(null);
                          }
                        }}
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                      <span className="text-[10px] text-zinc-500 block">
                        Quick 1-Click Artisan Presets:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {ARTISAN_PRESETS.map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setImagePreview(p.url);
                              setDirectImageUrl(p.url);
                              setSelectedFile(null);
                              if (!formName) setFormName(p.name);
                              setFormCategory(p.category);
                              setFormVeg(p.isVeg);
                              setFormSpicy(p.isSpicy);
                            }}
                            className="rounded-md border border-zinc-800 bg-zinc-850 px-2 py-0.5 text-[10px] text-zinc-300 hover:border-amber-500/50 hover:text-amber-400 transition cursor-pointer"
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pizza Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Pizza Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. San Marzano Margherita DOP"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="18.50"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Prep Time & Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Prep Time
                  </label>
                  <input
                    type="text"
                    placeholder="20-25 min"
                    value={formPrepTime}
                    onChange={(e) => setFormPrepTime(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Kitchen Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gulshan-2, Dhaka or Dhanmondi, Dhaka"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Artisan Description & Ingredients *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your crust fermentation, D.O.P. toppings, and wood-fired baking style..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>

              {/* Dietary Checkboxes */}
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formSpicy}
                    onChange={(e) => setFormSpicy(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-0"
                  />
                  <span>🔥 Spicy Recipe</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formVeg}
                    onChange={(e) => setFormVeg(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-0"
                  />
                  <span>🌿 Vegetarian</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl bg-zinc-800 px-5 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingItem}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg transition hover:brightness-110 active:scale-95 disabled:opacity-50"
                >
                  {submittingItem ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Uploading to Cloudinary & Saving...</span>
                    </>
                  ) : (
                    <span>Publish Pizza to Menu 🍕</span>
                  )}
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}
      {/* ==================================================== */}
      {/* UPDATE SHOP NAME & PIZZERIA PROFILE MODAL           */}
      {/* ==================================================== */}
      {isEditShopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-zinc-800 bg-[#16161b] p-6 sm:p-7 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Pizzeria Storefront
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  Update Pizzeria & Shop Name
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditShopModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {shopError && (
              <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
                {shopError}
              </div>
            )}

            <form onSubmit={handleSaveShopProfile} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Pizzeria / Shop Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Forno Napoli Wood-Fired"
                  value={editShopName}
                  onChange={(e) => setEditShopName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-zinc-500">
                  This shop name is displayed on the menu and pizza cards across Dhaka.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Head Chef / Owner Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Marco Bellini"
                  value={editChefName}
                  onChange={(e) => setEditChefName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Kitchen Contact Phone
                </label>
                <input
                  type="text"
                  placeholder="e.g. +880 1711-223344"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Dhaka Kitchen Location / Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Road 11, Block D, Banani, Dhaka"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEditShopModalOpen(false)}
                  className="rounded-xl border border-zinc-700 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingShop}
                  className="rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:brightness-110 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {savingShop ? "Saving..." : "Save Shop Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
