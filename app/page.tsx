import Hero from '@/components/home/Hero';
import MoodSelector from '@/components/home/MoodSelector';
import TrendingSection from '@/components/home/TrendingSection';
import FeaturedCafes from '@/components/home/FeaturedCafes';
import AIBanner from '@/components/home/AIBanner';
import Footer from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <MoodSelector />
      <TrendingSection />
      <FeaturedCafes />
      <AIBanner />
      <Footer />
    </div>
  );
}
