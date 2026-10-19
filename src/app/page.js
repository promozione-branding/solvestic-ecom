"use client"

import AboutSection from "@/components/home/AboutSection";
import ActivatorSection from "@/components/home/ActivatorSection";
import BestSellersSection from "@/components/home/BestSellersSection";
import FAQSection from "@/components/home/FAQSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import HeroSection from "@/components/home/HeroSection";
import ProductCatalog from "@/components/home/ProductCatalog";
import SkinConcernsSection from "@/components/home/SkinConcerns";
import SolvesticMarquee from "@/components/home/SolvesticMarquee";
import VideoTestimonials from "@/components/home/VideoTestimonials";
import Certifications from "@/components/home/Certifications";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Jointcommunity from "@/components/home/Joincommunity";
import { addToGuestCart } from "@/lib/cart-storage";
import FounderReels from "@/components/home/FounderReels";
import GuessNewLaunch from "@/components/home/GuessOurLaunch";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleAddToCart = async (product) => {
    const variant = product.variants?.[0];

    if (!variant?.size) {
      toast.error("No product variant is available.");
      return;
    }

    if (!isAuthenticated || !user) {
      const result = addToGuestCart(
        product._id,
        1,
        variant
      );

      if (!result.success) {
        toast.error("Unable to add product to cart.");
      }

      return;
    }

    try {
      const response = await fetch("/api/user/cart", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
          variant: variant.size,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to add product to cart."
        );
      }

      toast.success("Product added to cart!");

      window.dispatchEvent(
        new Event("solvestic-cart-updated")
      );
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <HeroSection />
      <BestSellersSection
        onAddToCart={handleAddToCart}
      />
      <SkinConcernsSection />
      {/* <AboutSection /> */}
      <Certifications />
      {/* <VideoTestimonials /> */}
      <SolvesticMarquee />
      {/* <FeaturedProducts /> */}
      {/* <ProductCatalog onAddToCart={(product) => { handleAddToCart(product); }} /> */}
      <ActivatorSection />
      {/* <WhyChooseUs /> */}
      <FounderReels />
      {/* <FAQSection /> */}
      {/* <GuessNewLaunch /> */}
      {/* <Jointcommunity /> */}
    </>
  );
}
