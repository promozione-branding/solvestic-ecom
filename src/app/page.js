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
import WhyChooseUs from "@/components/home/WhyChooseUs";

export default function Home() {
  return (
    <>
      <HeroSection />
      <BestSellersSection
        onAddToCart={(product) => {
          console.log("Add product to cart:", product);
        }}
      />
      <VideoTestimonials />
      <AboutSection />
      <SolvesticMarquee />
      <SkinConcernsSection />
      <FeaturedProducts />
      <ProductCatalog />
      <ActivatorSection />
      <WhyChooseUs />
      <FAQSection />
    </>
  );
}
