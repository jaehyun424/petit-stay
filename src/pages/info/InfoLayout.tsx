import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LandingNav } from '../landing/components/LandingNav';
import { LandingFooter } from '../landing/components/LandingFooter';
import '../../styles/pages/info.css';

interface InfoLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function InfoLayout({ title, subtitle, children }: InfoLayoutProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="info-page">
      <LandingNav />
      <div className="info-hero">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="info-content">
        {children}
      </div>
      <LandingFooter />
    </div>
  );
}
