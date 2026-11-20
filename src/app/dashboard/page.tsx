"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export default function DashboardGateway() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/sign-in?callbackUrl=/dashboard");
      return;
    }

    const role = (session.user as { role?: string }).role || "customer";

    if (role === "vendor") {
      router.replace("/dashboard/vendor");
    } else if (role === "admin") {
      router.replace("/dashboard/admin");
    } else {
      router.replace("/dashboard/customer");
    }
  }, [session, isPending, router]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#0c0c0e] px-4 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-3 border-amber-500 border-t-transparent" />
        <div>
          <h2 className="text-lg font-bold text-white">Opening Your PizzaHub Dashboard...</h2>
          <p className="mt-1 text-xs text-zinc-400">Verifying kitchen credentials & role permissions</p>
        </div>
      </div>
    </div>
  );
}
