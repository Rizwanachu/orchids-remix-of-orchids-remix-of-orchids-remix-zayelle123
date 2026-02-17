import Header from "@/components/sections/header";
import HeroSection from "@/components/sections/hero";
import CollectionsGrid from "@/components/sections/collections-grid";
import NewArrivalsCarousel from "@/components/sections/new-arrivals-carousel";
import PromoBanners from "@/components/sections/promo-banners";
import CuratedGrid from "@/components/sections/curated-grid";
import InstagramFeed from "@/components/sections/instagram-feed";
import Testimonials from "@/components/sections/testimonials";
import TrustBar from "@/components/sections/trust-bar";
import Footer from "@/components/sections/footer";

export default function Home() {
  return (
    <>
      <Header />
      <HeroSection />
      <CollectionsGrid />
      <NewArrivalsCarousel />
      <PromoBanners />
      <CuratedGrid />
      <InstagramFeed />
      <Testimonials />
      <TrustBar />
      <Footer />
    </>
  );
}
