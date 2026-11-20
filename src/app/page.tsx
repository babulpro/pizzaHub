import Hero from "./components/hero";
import FeaturedPizzas from "./components/featured-pizzas";
import HowItWorks from "./components/how-it-works";
import VendorSpotlight from "./components/vendor-spotlight";
import Testimonials from "./components/testimonials";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-[#0c0c0e]">
      {/* 1. Hero Section: Catchy Tagline, Live Stats & Role-Aware CTA */}
      <Hero />

      {/* 2. Featured & Trending Menu Showcase: 4 Live Signature Pizzas with Direct Order Links */}
      <FeaturedPizzas />

      {/* 3. How PizzaHub Works: 3-Step Journey from 900°F Oven to Doorstep */}
      <HowItWorks />

      {/* 4. Partner As Pizzeria & Subscription Spotlight: Free Starter vs Gold Premium */}
      <VendorSpotlight />

      {/* 5. Foodie Community Reviews: Real 5-Star Testimonials & Social Proof */}
      <Testimonials />
    </div>
  );
}
