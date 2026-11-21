"use client";

import Link from "next/link";

interface PizzaHubLogoProps {
  size?: "sm" | "md" | "lg";
  withTagline?: boolean;
  href?: string;
  className?: string;
}

export function PizzaSliceIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="crustGrad" x1="4" y1="4" x2="36" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F59E0B" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="cheeseGrad" x1="20" y1="12" x2="20" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE047" />
          <stop offset="0.6" stopColor="#F59E0B" />
          <stop offset="1" stopColor="#EA580C" />
        </linearGradient>
        <filter id="glow" x="0" y="0" width="40" height="40" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer ambient glow */}
      <circle cx="20" cy="20" r="18" fill="url(#crustGrad)" opacity="0.15" filter="url(#glow)" />

      {/* Pizza Crust Arch */}
      <path
        d="M6 13C10.5 7.5 29.5 7.5 34 13C34.6 13.8 34.2 15 33.2 15.2C29 16 11 16 6.8 15.2C5.8 15 5.4 13.8 6 13Z"
        fill="url(#crustGrad)"
        stroke="#B45309"
        strokeWidth="1.2"
      />

      {/* Pizza Slice Body */}
      <path
        d="M7 16L19.2 35.8C19.6 36.4 20.4 36.4 20.8 35.8L33 16C29 17.2 11 17.2 7 16Z"
        fill="url(#cheeseGrad)"
        stroke="#EA580C"
        strokeWidth="0.8"
      />

      {/* Pepperoni Slices */}
      <circle cx="16" cy="20" r="2.8" fill="#DC2626" stroke="#991B1B" strokeWidth="0.8" />
      <circle cx="24" cy="22" r="2.4" fill="#DC2626" stroke="#991B1B" strokeWidth="0.8" />
      <circle cx="20" cy="28" r="2.2" fill="#DC2626" stroke="#991B1B" strokeWidth="0.8" />

      {/* Melted Cheese Swirls */}
      <path
        d="M13 17.5C14.5 19 16 17 17.5 18.5"
        stroke="#FEF08A"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M22 17.5C23.5 19 25.5 17.5 27 19"
        stroke="#FEF08A"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Fresh Basil Leaf Accent */}
      <path
        d="M19.5 19C19 21 21 21.5 20.5 23C20 22 18.5 20.5 19.5 19Z"
        fill="#16A34A"
      />
    </svg>
  );
}

export default function PizzaHubLogo({
  size = "md",
  withTagline = false,
  href = "/",
  className = "",
}: PizzaHubLogoProps) {
  const sizeMap = {
    sm: {
      icon: "h-7 w-7",
      text: "text-lg",
      badge: "text-xs px-1.5 py-0.5",
      container: "gap-2",
    },
    md: {
      icon: "h-8 w-8",
      text: "text-xl",
      badge: "text-xs px-2 py-0.5",
      container: "gap-2.5",
    },
    lg: {
      icon: "h-11 w-11",
      text: "text-2xl sm:text-3xl",
      badge: "text-xs sm:text-sm px-2.5 py-1",
      container: "gap-3",
    },
  };

  const currentSize = sizeMap[size];

  const content = (
    <div className={`group flex items-center ${currentSize.container} select-none ${className}`}>
      {/* Animated Glowing Pizza Icon */}
      <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500/30 to-red-600/30 blur-xs transition-opacity group-hover:opacity-100" />
        <PizzaSliceIcon className={`${currentSize.icon} relative shrink-0 drop-shadow-md`} />
      </div>

      {/* Wordmark */}
      <div className="flex flex-col">
        <div className="flex items-center tracking-tight">
          <span className={`font-black text-zinc-900 dark:text-white ${currentSize.text} drop-shadow-xs tracking-tight`}>
            Pizza
          </span>
          <span
            className={`ml-1 rounded-md bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 font-extrabold text-white shadow-sm shadow-orange-500/20 ${currentSize.badge}`}
          >
            Hub
          </span>
        </div>
        {withTagline && (
          <span className="text-[10px] font-semibold tracking-wider uppercase text-amber-400/90">
            Wood-Fired & Artisan
          </span>
        )}
      </div>
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="inline-flex outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg">
      {content}
    </Link>
  );
}
