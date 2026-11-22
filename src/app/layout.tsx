import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import TopNavbar from "./components/topNavbar";
import Footer from "./components/footer";
import ToastProvider from "./components/toast-provider";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-artisan",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PizzaHub — Wood-Fired Artisan Pizzas & Swift Delivery",
  description:
    "Order gourmet handcrafted pizzas from premier artisan kitchens, or register your pizzeria to reach hungry foodies across your city.",
  keywords: [
    "PizzaHub",
    "artisan pizza",
    "wood-fired pizza",
    "pizza delivery",
    "local pizzerias",
    "gourmet pizza",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${playfairDisplay.variable} h-full scroll-smooth antialiased dark overflow-x-hidden max-w-full`}
    >
      <head>
        <meta name="color-scheme" content="light dark" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('pizzahub_theme') || 'dark';
                document.documentElement.classList.remove('light', 'dark');
                document.documentElement.classList.add(theme);
                var meta = document.querySelector('meta[name="color-scheme"]');
                if (meta) meta.setAttribute('content', theme);
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-[#0c0c0e] text-zinc-100 pt-16 transition-colors duration-200 overflow-x-hidden max-w-full">
        <ToastProvider />
        <TopNavbar />
        <main className="flex flex-1 flex-col overflow-x-hidden max-w-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
