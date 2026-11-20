"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, useSession } from "@/lib/auth-client";
import { ensureApiToken } from "@/lib/api";
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

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const { error: authError } = await signIn.email({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      rememberMe: remember,
      callbackURL: "/",
    });

    if (authError) {
      setError(
        authError.message === "Invalid email or password"
          ? "Incorrect email or password. Please try again."
          : (authError.message ?? "Something went wrong. Please check your credentials.")
      );
      setLoading(false);
      return;
    }

    // Success → sync backend JWT & redirect
    await ensureApiToken();
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
            <PasswordInput name="password" autoComplete="current-password" />
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
