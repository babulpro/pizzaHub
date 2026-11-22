"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export default function DashboardGateway() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/sign-in?callbackUrl=/dashboard");
      return;
    }

    // Step 1: Initial check & sync
    const timer1 = setTimeout(() => {
      setLoadingStep(1);
    }, 500);

    // Step 2: Applying updates & role resolution
    const timer2 = setTimeout(() => {
      setLoadingStep(2);
    }, 1100);

    // Step 3: Complete wait time so user can see updates, then redirect
    const timer3 = setTimeout(() => {
      const role = (session.user as { role?: string }).role || "customer";

      if (role === "vendor") {
        router.replace("/dashboard/vendor");
      } else if (role === "admin") {
        router.replace("/dashboard/admin");
      } else {
        router.replace("/dashboard/customer");
      }
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [session, isPending, router]);

  const messages = [
    {
      title: "Connecting to PizzaHub Dashboard...",
      subtitle: "Verifying kitchen credentials & active session",
    },
    {
      title: "Syncing Latest Updates & Permissions...",
      subtitle: "Applying newest role privileges, orders & menu status",
    },
    {
      title: "Opening Your Dashboard Console...",
      subtitle: "Redirecting to your personalized workspace",
    },
  ];

  const currentMsg = messages[loadingStep] || messages[0];

  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center bg-[#0c0c0e] px-4 text-center">
      <div className="flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl border border-zinc-800 bg-[#121216] p-8 shadow-2xl">
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-amber-500/20 border-t-amber-500" />
          <span className="absolute text-2xl">🍕</span>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white transition-all duration-300">
            {currentMsg.title}
          </h2>
          <p className="mt-1.5 text-xs text-zinc-400 transition-all duration-300">
            {currentMsg.subtitle}
          </p>
        </div>

        {/* Dynamic Progress Indicator */}
        <div className="w-full">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 transition-all duration-500 ease-out"
              style={{
                width: `${loadingStep === 0 ? 35 : loadingStep === 1 ? 75 : 100}%`,
              }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500">
            <span>Loading updates...</span>
            <span>{loadingStep === 0 ? "35%" : loadingStep === 1 ? "75%" : "100%"}</span>
          </div>
        </div>

        <p className="text-[11px] text-zinc-500 italic">
          Waiting for permissions & dashboard updates to sync...
        </p>
      </div>
    </div>
  );
}
