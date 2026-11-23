"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { signUp, useSession } from "@/lib/auth-client";
import { ensureApiToken } from "@/lib/api";
import showToast from "@/lib/toast";
import {
  AuthAlert,
  AuthShell,
  Divider,
  PasswordInput,
  PasswordStrength,
  RolePicker,
  SocialButtons,
  SubmitButton,
  inputClasses,
  labelClasses,
  type Role,
} from "@/app/components/auth-ui";

export default function SignUpPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState<Role>("customer");
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If user is already authenticated, redirect them away from auth pages
  useEffect(() => {
    if (!sessionLoading && session?.user) {
      router.replace("/");
    }
  }, [session, sessionLoading, router]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      const mismatch = "Passwords do not match. Please verify both entries.";
      setConfirmError(mismatch);
      showToast.warning("Password Mismatch", mismatch);
      return;
    }
    setConfirmError(null);
    setLoading(true);

    const { error: authError } = await signUp.email({
      name: name.trim(),
      email: email.trim(),
      password,
      role,
      ...(role === "vendor" && businessName ? { businessName: businessName.trim() } : {}),
      callbackURL: "/",
    });

    if (authError) {
      // Fallback: If Better-Auth fails, attempt direct server registration via internal API proxy
      try {
        const directRes = await fetch(
          "/api/proxy/auth/register",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: name.trim(),
              email: email.trim(),
              password,
              role,
              businessName: role === "vendor" ? businessName?.trim() : undefined,
            }),
          }
        );
        const directData = await directRes.json();
        if (directData.success && directData.token) {
          localStorage.setItem("pizzahub_jwt_token", directData.token);
          localStorage.setItem("pizzahub_auth_token", directData.token);
          showToast.pizza(
            "Account Created! 🍕",
            `Welcome to PizzaHub, ${name.trim()}! Initializing your session...`
          );
          router.push("/");
          return;
        }
      } catch {
        // Direct fallback failed
      }

      const errMsg =
        authError.message ?? "Could not create your PizzaHub account. Please try again.";
      setError(errMsg);
      showToast.error("Registration Failed", errMsg);
      setLoading(false);
      return;
    }

    // Account created & session active → sync backend JWT with password & redirect
    showToast.pizza(
      "Welcome to PizzaHub! 🍕",
      `Your ${role === "vendor" ? "Pizzeria Kitchen" : "Artisan Foodie"} account is ready!`
    );
    const syncedToken = await ensureApiToken(password);
    if (syncedToken) {
      localStorage.setItem("pizzahub_jwt_token", syncedToken);
      localStorage.setItem("pizzahub_auth_token", syncedToken);
    }
    router.push("/");
  };

  return (
    <AuthShell
      title="Create your PizzaHub account"
      subtitle="Order mouthwatering pizzas or register your local pizzeria kitchen"
      footer={
        <>
          Already part of PizzaHub?{" "}
          <Link
            href="/sign-in"
            className="font-bold text-amber-600 dark:text-amber-400 transition hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <div className="space-y-6">
        <SocialButtons role={role} onError={setError} />
        <Divider />

        <form onSubmit={onSubmit} className="space-y-5">
          <AuthAlert message={error ?? confirmError} />

          {/* Customer vs Pizzeria Vendor Switcher */}
          <RolePicker value={role} onChange={setRole} />

          <div>
            <label htmlFor="name" className={labelClasses}>
              {role === "vendor" ? "Owner / Contact Name" : "Full Name"}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              minLength={2}
              autoComplete="name"
              placeholder={role === "vendor" ? "Tanvir Ahmed" : "Sofia Rahman"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClasses}
            />
          </div>

          {/* Conditional Business Name for Pizzeria Vendors with Smooth Motion */}
          <AnimatePresence>
            {role === "vendor" && (
              <motion.div
                initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <label htmlFor="businessName" className={labelClasses}>
                  Pizzeria / Restaurant Name
                </label>
                <input
                  id="businessName"
                  name="businessName"
                  type="text"
                  required
                  placeholder="e.g. Artisan Wood-Fired Co."
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className={inputClasses}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label htmlFor="email" className={labelClasses}>
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="elena@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="password" className={labelClasses}>
              Password
            </label>
            <PasswordInput
              name="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={setPassword}
            />
            <PasswordStrength password={password} />
          </div>

          <div>
            <label htmlFor="confirmPassword" className={labelClasses}>
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                if (confirmError) setConfirmError(null);
              }}
              className={`${inputClasses} ${
                confirmError ? "border-red-500 focus:border-red-500 focus:ring-red-500/30" : ""
              }`}
            />
          </div>

          <SubmitButton loading={loading}>
            {role === "vendor" ? "Register Pizzeria Kitchen" : "Create PizzaHub Account"}
          </SubmitButton>

          <p className="text-center text-xs leading-relaxed text-zinc-500">
            By creating an account, you agree to PizzaHub&apos;s{" "}
            <span className="text-zinc-600 dark:text-zinc-400 underline underline-offset-2">Terms of Service</span>{" "}
            and{" "}
            <span className="text-zinc-600 dark:text-zinc-400 underline underline-offset-2">Privacy Policy</span>.
          </p>
        </form>
      </div>
    </AuthShell>
  );
}
