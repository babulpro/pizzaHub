import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopNavbar from "./components/topNavbar";
import Footer from "./components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased dark`}
    >
      <body className="flex min-h-full flex-col bg-[#0c0c0e] text-zinc-100 pt-16">
        <TopNavbar />
        <main className="flex flex-1 flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
