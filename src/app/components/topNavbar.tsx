"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { signOut, useSession } from "@/lib/auth-client";
import { setStoredToken } from "@/lib/api";
import showToast from "@/lib/toast";
import PizzaHubLogo from "./pizzahub-logo";
import ThemeToggle from "./theme-toggle";

export default function TopNavbar() {
  const { data: session, isPending } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const user = session?.user;
  const userRole = (user as { role?: string })?.role || "customer";
  const isPremium = (user as { subscriptionPlan?: string })?.subscriptionPlan === "premium";

  // Dynamic Navigation Links based on role
  const navLinks = [
    { label: "Browse Menu", href: "/menu" },
    { label: "🔥 Hot Deals", href: "/deals" },
    ...(userRole === "vendor"
      ? [
          { label: "Kitchen Dashboard", href: "/dashboard/vendor" },
          { label: "★ Subscription", href: "/dashboard/vendor/subscription" },
        ]
      : userRole === "admin"
      ? [
          { label: "⚡ Admin Console", href: "/dashboard/admin" },
        ]
      : [
          { label: "Track Orders", href: "/dashboard/customer" },
          { label: "For Pizzerias", href: "/sign-up?role=vendor" },
        ]),
  ];

  // Close the user dropdown when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "vendor":
        return {
          label: isPremium ? "★ Gold Pizzeria" : "👨‍🍳 Pizzeria Partner",
          className: isPremium
            ? "bg-amber-400/20 text-amber-300 border-amber-400/40"
            : "bg-amber-500/20 text-amber-300 border-amber-500/30",
        };
      case "admin":
        return {
          label: "⚡ Super Admin",
          className: "bg-red-500/20 text-red-300 border-red-500/30",
        };
      default:
        return {
          label: "🍕 Artisan Foodie",
          className: "bg-orange-500/20 text-orange-300 border-orange-500/30",
        };
    }
  };

  const roleInfo = getRoleBadge(userRole);

  const getDashboardLink = () => {
    if (userRole === "admin") return "/dashboard/admin";
    if (userRole === "vendor") return "/dashboard/vendor";
    return "/dashboard/customer";
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-[#121215]/90 backdrop-blur-md transition-all">
      <header className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Wonderful PizzaHub Logo */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-3 cursor-pointer"
        >
          <PizzaHubLogo size="md" withTagline={false} />
        </motion.div>

        {/* Center: Desktop Navigation Links */}
        <ul className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="text-sm font-medium text-zinc-600 dark:text-zinc-300 transition-colors hover:text-amber-500 dark:hover:text-amber-400"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right: Actions, Theme Toggle & User Auth */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {isPending ? (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
            </div>
          ) : user ? (
            /* Signed in User Menu */
            <div className="relative" ref={menuRef}>
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2.5 rounded-full border border-zinc-300 dark:border-zinc-700/80 bg-zinc-100 dark:bg-zinc-850 p-1 pr-3 text-left transition hover:border-amber-500/50 cursor-pointer"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-red-600 text-xs font-bold text-white shadow-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="hidden flex-col sm:flex">
                  <span className="max-w-[100px] truncate text-xs font-bold text-zinc-900 dark:text-white">
                    {user.name || "My Account"}
                  </span>
                </div>
                <svg
                  className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${
                    menuOpen ? "rotate-180 text-amber-500" : ""
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </motion.button>

              {/* User Dropdown with AnimatePresence */}
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -6 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-[#18181b] p-1.5 shadow-2xl shadow-black/30 dark:shadow-black/80 backdrop-blur-xl"
                  >
                    {/* User Profile Snippet */}
                    <div className="border-b border-zinc-150 dark:border-zinc-800 px-3 py-2.5">
                      <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                        {user.email}
                      </p>
                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${roleInfo.className}`}
                        >
                          {roleInfo.label}
                        </span>
                      </div>
                    </div>

                    {/* Navigation Options */}
                    <div className="py-1">
                      <Link
                        href={getDashboardLink()}
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 transition hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer"
                      >
                        <svg className="h-4 w-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="7" height="9" />
                          <rect x="14" y="3" width="7" height="5" />
                          <rect x="14" y="12" width="7" height="9" />
                          <rect x="3" y="16" width="7" height="5" />
                        </svg>
                        Dashboard
                      </Link>

                      {userRole === "customer" && (
                        <Link
                          href="/dashboard/customer"
                          role="menuitem"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 transition hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer"
                        >
                          <svg className="h-4 w-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                          </svg>
                          My Orders
                        </Link>
                      )}

                      {userRole === "vendor" && (
                        <Link
                          href="/dashboard/vendor/subscription"
                          role="menuitem"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-amber-600 dark:text-amber-400 transition hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer"
                        >
                          <span>★</span>
                          <span>Subscription & Quota</span>
                        </Link>
                      )}

                      {userRole === "admin" && (
                        <Link
                          href="/dashboard/admin"
                          role="menuitem"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 dark:text-red-300 transition hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer"
                        >
                          <span>⚡</span>
                          <span>Platform Administration</span>
                        </Link>
                      )}
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-zinc-150 dark:border-zinc-800 pt-1">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={async () => {
                          setMenuOpen(false);
                          setStoredToken(null);
                          await signOut();
                          showToast.pizza(
                            "Logged Out",
                            "See you next pizza slice! Come back hungry! 👋"
                          );
                        }}
                        className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 transition hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300"
                      >
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Signed out: Auth CTAs */
            <div className="flex items-center gap-3">
              <Link
                href="/sign-in"
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition hover:text-zinc-900 dark:hover:text-white"
              >
                Sign In
              </Link>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link
                  href="/sign-up"
                  className="rounded-lg bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition hover:opacity-90 block"
                >
                  Join PizzaHub
                </Link>
              </motion.div>
            </div>
          )}

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            aria-label="Toggle mobile navigation"
            onClick={() => setMobileNavOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 transition hover:text-zinc-900 dark:hover:text-white md:hidden cursor-pointer"
          >
            {mobileNavOpen ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown with AnimatePresence */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-[#121215]/95 px-6 py-4 md:hidden backdrop-blur-md"
          >
            <ul className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileNavOpen(false)}
                    className="block py-2 text-base font-medium text-zinc-800 dark:text-zinc-200 transition hover:text-amber-500"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
