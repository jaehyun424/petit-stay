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

      {/* Parallax image band between sections */}
      <div className="landing-image-band" aria-hidden="true">
        <img
          src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1920&q=80"
          alt=""
          loading="lazy"
        />
      </div>

      <HowItWorks />
      <TestimonialSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
}
