"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, useSession } from "@/lib/auth-client";
import { ensureApiToken } from "@/lib/api";
import showToast from "@/lib/toast";
import {
  AuthAlert,
  AuthShell,
  Divider,
  PasswordInput,
  RolePicker,
  SocialButtons,
  SubmitButton,
  inputClasses,
  labelClasses,
  type Role,
} from "@/app/components/auth-ui";

export default function SignInPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [role, setRole] = useState<Role>("customer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If user is already authenticated, redirect them away from auth pages
  useEffect(() => {
    if (!sessionLoading && session?.user) {
      router.replace("/");
    }
  }, [session, sessionLoading, router]);

  const fillDemoAccount = (demoEmail: string, demoPass: string, demoRole?: Role) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    if (demoRole) setRole(demoRole);
    setError(null);
    showToast.info(
      "Demo Account Selected",
      `Loaded credentials for ${demoEmail}`
    );
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const emailVal = (formData.get("email") as string) || email;
    const passwordVal = (formData.get("password") as string) || password;

    if (!emailVal || !passwordVal) {
      const msg = "Please provide both email and password.";
      setError(msg);
      showToast.warning("Missing Fields", msg);
      setLoading(false);
      return;
    }

    const { error: authError } = await signIn.email({
      email: emailVal,
      password: passwordVal,
      rememberMe: remember,
      callbackURL: "/",
    });

    if (authError) {
      // Fallback: If Better-Auth session fails, attempt direct server login via API
      try {
        const directRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "https://pizzaserver.vercel.app/api"}/auth/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailVal, password: passwordVal }),
          }
        );
        const directData = await directRes.json();
        if (directData.success && directData.token) {
          localStorage.setItem("pizzahub_jwt_token", directData.token);
          showToast.pizza(
            "Welcome Back!",
            "Authentication successful. Directing to PizzaHub..."
          );
          router.push("/");
          return;
        }
      } catch {
        // Direct fallback failed
      }

      const errMessage =
        authError.message === "Invalid email or password"
          ? "Incorrect email or password. Please try again."
          : (authError.message ?? "Something went wrong. Please check your credentials.");

      setError(errMessage);
      showToast.error("Sign In Failed", errMessage);
      setLoading(false);
      return;
    }

    // Success → sync backend JWT & redirect
    showToast.pizza(
      "Welcome Back! 🍕",
      "Signed in successfully. Warming up the oven..."
    );
    await ensureApiToken(passwordVal);
    router.push("/");
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your PizzaHub account to continue"
      footer={
        <>
          New to PizzaHub?{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-amber-400 transition hover:text-amber-300"
          >
            Create an account
          </Link>
        </>
      }
    >
      <div className="space-y-6">
        <SocialButtons role={role} onError={setError} />
        <Divider />

        {/* 1-Click Demo Credentials */}
        <div className="rounded-xl border border-zinc-800 bg-[#16161b] p-3">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-2">
            <span className="font-semibold text-amber-400">⚡ 1-Click Demo Logins:</span>
            <span className="text-zinc-500">Auto-fills test account</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount("marco@fornonapoli.com", "12345678", "vendor")}
              className="rounded-lg border border-amber-500/30 bg-amber-500/10 py-1.5 px-2 text-[11px] font-bold text-amber-300 hover:bg-amber-500/20 transition text-center cursor-pointer"
            >
              👨‍🍳 Vendor
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount("amina@customer.com", "12345678", "customer")}
              className="rounded-lg border border-orange-500/30 bg-orange-500/10 py-1.5 px-2 text-[11px] font-bold text-orange-300 hover:bg-orange-500/20 transition text-center cursor-pointer"
            >
              🍕 Customer
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-5" noValidate={false}>
          <AuthAlert message={error} />

          <RolePicker value={role} onChange={setRole} />

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
              placeholder="mario@pizzahub.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClasses}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className={labelClasses}>
                Password
              </label>
            </div>
            <PasswordInput
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={setPassword}
            />
          </div>

          {/* Remember me */}
          <label className="flex cursor-pointer select-none items-center gap-2.5 text-xs text-zinc-300">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded border-zinc-700 bg-zinc-800 accent-amber-500"
            />
            Keep me signed in for 30 days
          </label>

          <SubmitButton loading={loading}>Sign In to PizzaHub</SubmitButton>
        </form>
      </div>
    </AuthShell>
  );
}
