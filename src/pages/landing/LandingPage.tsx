import { LandingNav } from './components/LandingNav';
import { HeroSection } from './components/HeroSection';
import { TrustSection } from './components/TrustSection';
import { HowItWorks } from './components/HowItWorks';
import { SitterPreview } from './components/SitterPreview';
import { TestimonialSection } from './components/TestimonialSection';
import { PartnerCTA } from './components/PartnerCTA';
import { LandingFooter } from './components/LandingFooter';
import '../../styles/pages/landing.css';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <LandingNav />
      <HeroSection />
      <TrustSection />
      <HowItWorks />
      <SitterPreview />
      <TestimonialSection />
      <PartnerCTA />
      <LandingFooter />
    </div>
  );
}
