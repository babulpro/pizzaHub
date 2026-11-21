"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import showToast from "@/lib/toast";
import PizzaHubLogo, { PizzaSliceIcon } from "./pizzahub-logo";

/* ---------------------------- Icons ---------------------------- */

export function GoogleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

export function GitHubIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12v3.14c0 .3.21.67.8.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
    </svg>
  );
}

/* ---------------------------- Alert ---------------------------- */

export function AuthAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-3 text-sm text-red-300"
    >
      <svg
        className="mt-0.5 h-4 w-4 shrink-0 text-red-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      <span>{message}</span>
    </div>
  );
}

/* --------------------------- Role Picker (Customer vs Vendor) --------------------------- */

export const ROLES = ["customer", "vendor"] as const;
export type Role = (typeof ROLES)[number];

const ROLE_OPTIONS: { value: Role; label: string; hint: string }[] = [
  {
    value: "customer",
    label: "Pizza Lover",
    hint: "I want to explore gourmet pizzas & order online",
  },
  {
    value: "vendor",
    label: "Pizzeria Partner",
    hint: "I want to list menu items & receive customer orders",
  },
];

export function RolePicker({
  value,
  onChange,
}: {
  value: Role;
  onChange: (role: Role) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
        I am joining PizzaHub as:
      </legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ROLE_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <label
              key={option.value}
              className={`group flex cursor-pointer flex-col gap-1 rounded-xl border p-3.5 text-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                isSelected
                  ? "border-amber-500 bg-amber-50/80 dark:border-amber-500/80 dark:bg-gradient-to-br dark:from-amber-500/15 dark:via-orange-500/10 dark:to-transparent text-amber-950 dark:text-white shadow-sm"
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-850"
              }`}
            >
              <input
                type="radio"
                name="role"
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <div className="flex items-center gap-2 font-semibold">
                {option.value === "customer" ? (
                  <PizzaSliceIcon className="h-4 w-4 shrink-0" />
                ) : (
                  <svg
                    className="h-4 w-4 shrink-0 text-amber-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                )}
                <span>{option.label}</span>
              </div>
              <span className="text-xs text-zinc-400 group-hover:text-zinc-300 leading-snug">
                {option.hint}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/* --------------------- Social sign-in buttons --------------------- */

export function SocialButtons({
  role,
  onError,
}: {
  role?: Role;
  onError?: (message: string) => void;
}) {
  const [loading, setLoading] = useState<"google" | "github" | null>(null);

  const handleSocial = async (provider: "google" | "github") => {
    setLoading(provider);
    onError?.("");
    showToast.info(
      `Connecting to ${provider === "google" ? "Google" : "GitHub"}...`,
      "Redirecting to secure authentication"
    );
    const { error } = await signIn.social({
      provider,
      callbackURL: "/",
      ...(role ? { additionalData: { role } } : {}),
    });
    if (error) {
      const msg = error.message ?? `Could not sign in with ${provider}.`;
      onError?.(msg);
      showToast.error("Social Sign In Failed", msg);
      setLoading(null);
    }
  };

  const base =
    "flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 px-4 py-2.5 text-sm font-semibold text-zinc-800 dark:text-zinc-200 outline-none transition hover:bg-zinc-50 dark:hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-xs";

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => handleSocial("google")}
        disabled={loading !== null}
        className={base}
      >
        {loading === "google" ? <Spinner /> : <GoogleIcon />}
        Google
      </button>
      <button
        type="button"
        onClick={() => handleSocial("github")}
        disabled={loading !== null}
        className={base}
      >
        {loading === "github" ? <Spinner /> : <GitHubIcon />}
        GitHub
      </button>
    </div>
  );
}

/* -------------------------- Form pieces -------------------------- */

export const inputClasses =
  "w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20";

export const labelClasses =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-300";

export function Divider() {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-zinc-800" />
      <span className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
        or continue with email
      </span>
      <span className="h-px flex-1 bg-zinc-800" />
    </div>
  );
}

export function SubmitButton({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 outline-none transition hover:opacity-95 hover:shadow-orange-500/30 focus-visible:ring-2 focus-visible:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.99]"
    >
      {loading && <Spinner />}
      {loading ? "Please wait…" : children}
    </button>
  );
}

/* ---------------------- Password visibility ---------------------- */

export function PasswordInput({
  name,
  placeholder = "••••••••",
  autoComplete = "current-password",
  required = true,
  value,
  onChange,
}: {
  name: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        name={name}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        minLength={8}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className={`${inputClasses} pr-11`}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center text-zinc-500 outline-none transition hover:text-zinc-300 focus-visible:text-amber-400"
      >
        {visible ? (
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
            <path d="M1 1l22 22" />
          </svg>
        ) : (
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}

/* ---------------------- Password strength ---------------------- */

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  score = Math.min(score, 4);

  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong"];
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-amber-400",
    "bg-emerald-500",
  ];

  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="flex flex-1 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < score ? colors[score] : "bg-zinc-800"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-zinc-400">{labels[score]}</span>
    </div>
  );
}

/* --------------------------- PizzaHub Auth Shell --------------------------- */

const PIZZAHUB_HIGHLIGHTS = [
  "Handcrafted artisan pizzas from premier local ovens",
  "Real-time kitchen prep & delivery status tracking",
  "Direct partnership tools for local pizzerias & chefs",
];

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#0c0c0e]">
      {/* Left: Wood-Fired Culinary Brand Panel */}
      <aside className="relative hidden w-[45%] max-w-xl flex-col justify-between overflow-hidden bg-gradient-to-br from-[#1a120b] via-[#21110a] to-[#0c0c0e] p-12 lg:flex border-r border-zinc-850">
        {/* Warm Ambient Pizza Oven Glows */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-12 h-96 w-96 rounded-full bg-red-600/15 blur-3xl" />

        {/* Brand Header */}
        <div className="relative">
          <PizzaHubLogo size="lg" withTagline={true} />
        </div>

        {/* Middle Feature Hero */}
        <div className="relative my-auto py-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
            <span>🍕</span> Artisan Pizza Marketplace
          </div>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight text-white tracking-tight">
            Slices crafted to perfection.
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
              Delivered hot & fresh.
            </span>
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-300/90">
            Join PizzaHub to connect with authentic wood-fired kitchens, follow your pizza&apos;s journey from oven to door, or grow your pizzeria business.
          </p>

          <ul className="mt-8 space-y-3.5">
            {PIZZAHUB_HIGHLIGHTS.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm text-zinc-200">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-500/20 text-amber-400">
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="relative text-xs text-zinc-500 font-medium">
          © {year ?? "2026"} PizzaHub Inc. All rights reserved.
        </p>
      </aside>

      {/* Right: Interactive Form Panel */}
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-8 block lg:hidden">
            <PizzaHubLogo size="md" withTagline={true} />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
          <p className="mt-1.5 text-sm text-zinc-400">{subtitle}</p>

          <div className="mt-8">{children}</div>

          <div className="mt-8 border-t border-zinc-800/80 pt-6 text-center text-sm text-zinc-400">
            {footer}
          </div>
        </div>
      </main>
    </div>
  );
}
