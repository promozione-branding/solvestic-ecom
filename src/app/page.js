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

export default function Home() {
  const handleAddToCart = (product) => {
    // console.log(product, product.variants[0])
    const result = addToGuestCart(product._id, 1, product.variants[0]);

    if (result.success) {
      console.log("Cart updated:", result.items);
    } else {
      console.error("Could not update the cart.");
    }
  };

  return (
    <>
      <HeroSection />
      <BestSellersSection onAddToCart={(product) => { handleAddToCart(product); }} />
      <SkinConcernsSection />
      <AboutSection />
      <Certifications />
      <VideoTestimonials />
      <SolvesticMarquee />
      <FeaturedProducts />
      <ProductCatalog onAddToCart={(product) => { handleAddToCart(product); }} />
      <ActivatorSection />
      {/* <WhyChooseUs /> */}
      <FounderReels />
      <FAQSection />
      <GuessNewLaunch />
      <Jointcommunity />
    </>
  );
}
