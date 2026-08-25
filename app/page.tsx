import AIChatWidget from "@/components/custom/AIChatWidget";
import ScrollToTopButton from "@/components/custom/ScrollToTopButton";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import BestsellerSection from "@/components/sections/home/BestsellerSection";
import CtaSection from "@/components/sections/home/CtaSection";
import HeroSection from "@/components/sections/home/HeroSection";
import OurStandardsSection from "@/components/sections/home/OurStandardsSection";
import OurStorySection from "@/components/sections/home/OurStorySection";
import WhyChooseSection from "@/components/sections/home/WhyChooseSection";

export default function Home() {
  return (
    <div className="bg-sand text-charcoal">
      {/* Header */}
      <Header />

      {/* Hero: the hook */}
      <HeroSection />

      {/* Our standards: what every loaf promises */}
      <OurStandardsSection />

      {/* Our story: the heart behind every loaf */}
      <OurStorySection />

      {/* Bestsellers: customer favorites */}
      <BestsellerSection />

      {/* Why people return */}
      <WhyChooseSection />

      {/* CTA */}
      <CtaSection />

      {/* Footer */}
      <Footer />

      <ScrollToTopButton />

      <AIChatWidget />
    </div>
  );
}
