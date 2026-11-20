"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "@/lib/auth-client";
import PizzaHubLogo from "./pizzahub-logo";

export default function TopNavbar() {
  const { data: session, isPending } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const user = session?.user;
  const userRole = (user as { role?: string })?.role || "customer";

  const navLinks = [
    { label: "Browse Menu", href: "/menu" },
    { label: "Hot Deals", href: "/#deals" },
    {
      label: userRole === "vendor" ? "Kitchen Dashboard" : "For Pizzerias",
      href: userRole === "vendor" ? "/dashboard/vendor" : "/sign-up?role=vendor",
    },
    { label: "Track Order", href: "/dashboard/customer/orders" },
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
          label: "Pizzeria Partner",
          className: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        };
      case "admin":
        return {
          label: "Administrator",
          className: "bg-purple-500/20 text-purple-300 border-purple-500/30",
        };
      default:
        return {
          label: "Pizza Lover",
          className: "bg-orange-500/20 text-orange-300 border-orange-500/30",
        };
    }
  };

  const roleInfo = getRoleBadge(userRole);

  const getDashboardLink = () => {
    if (userRole === "admin") return "/dashboard/admin";
    if (userRole === "vendor") return "/dashboard/vendor";
    return "/dashboard/customer/orders";
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 w-full border-b border-zinc-800/80 bg-[#121215]/90 backdrop-blur-md transition-all">
      <header className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Wonderful PizzaHub Logo */}
        <div className="flex items-center gap-3">
          <PizzaHubLogo size="md" withTagline={false} />
        </div>

        {/* Center: Desktop Navigation Links */}
        <ul className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="text-sm font-medium text-zinc-300 transition-colors hover:text-amber-400"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right: Actions / Auth Menu */}
        <div className="flex items-center gap-4">
          {isPending ? (
            /* Loading Skeleton */
            <div className="h-9 w-9 animate-pulse rounded-full bg-zinc-800" />
          ) : user ? (
            /* Signed in: User Dropdown */
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
                className="flex cursor-pointer items-center gap-2.5 rounded-full border border-zinc-700/80 bg-zinc-800/60 p-1.5 pr-3 outline-none transition hover:border-zinc-600 hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                {/* User Avatar */}
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-red-600 text-xs font-bold text-white shadow-xs">
                  {(user.name ?? user.email ?? "P").charAt(0).toUpperCase()}
                </div>

                <span className="hidden text-xs font-medium text-zinc-200 sm:inline max-w-[110px] truncate">
                  {user.name || user.email?.split("@")[0]}
                </span>

                <svg
                  className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
                    menuOpen ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 8l4 4 4-4" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-3 w-56 overflow-hidden rounded-xl border border-zinc-700/80 bg-[#18181b] p-1.5 shadow-2xl shadow-black/80 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
                >
                  {/* User Profile Snippet */}
                  <div className="border-b border-zinc-800 px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-white">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-zinc-400">
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
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800/80"
                    >
                      <svg className="h-4 w-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="9" />
                        <rect x="14" y="3" width="7" height="5" />
                        <rect x="14" y="12" width="7" height="9" />
                        <rect x="3" y="16" width="7" height="5" />
                      </svg>
                      Dashboard
                    </Link>

                    <Link
                      href="/dashboard/customer/orders"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800/80"
                    >
                      <svg className="h-4 w-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                      My Orders
                    </Link>
                  </div>

                  {/* Sign Out */}
                  <div className="border-t border-zinc-800 pt-1">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        signOut();
                      }}
                      className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
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
                </div>
              )}
            </div>
          ) : (
            /* Signed out: Auth CTAs */
            <div className="flex items-center gap-3">
              <Link
                href="/sign-in"
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-zinc-300 transition hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition hover:opacity-90 active:scale-95"
              >
                Join PizzaHub
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            aria-label="Toggle mobile navigation"
            onClick={() => setMobileNavOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 transition hover:text-white md:hidden"
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

      {/* Mobile Menu Dropdown */}
      {mobileNavOpen && (
        <div className="border-b border-zinc-800 bg-[#121215] px-6 py-4 md:hidden">
          <ul className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setMobileNavOpen(false)}
                  className="block py-2 text-base font-medium text-zinc-200 transition hover:text-amber-400"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
