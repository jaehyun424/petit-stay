import { LandingNav } from './components/LandingNav';
import { HeroSection } from './components/HeroSection';
import { TrustBar } from './components/TrustBar';
import { FeatureShowcase } from './components/FeatureShowcase';
import { HowItWorks } from './components/HowItWorks';
import { TestimonialSection } from './components/TestimonialSection';
import { CTASection } from './components/CTASection';
import { LandingFooter } from './components/LandingFooter';
import '../../styles/pages/landing.css';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <LandingNav />
      <HeroSection />
      <TrustBar />
      <FeatureShowcase />
      <HowItWorks />
      <TestimonialSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
}
