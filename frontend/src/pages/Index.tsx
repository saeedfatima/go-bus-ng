import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import FeaturedCompanies from '@/components/home/FeaturedCompanies';
import PopularRoutes from '@/components/home/PopularRoutes';
import Features from '@/components/home/Features';
import CTASection from '@/components/home/CTASection';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturedCompanies />
        <PopularRoutes />
        <Features />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
