import React, { useEffect } from 'react';
import { Hero } from './components/Hero';
import { VideoBenefitSection } from './components/VideoBenefitSection';
import { FeatureSection } from './components/FeatureSection';
import { PlanSection } from './components/PlanSection';
import { BenefitsClubSection } from './components/BenefitsClubSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { AboutSection } from './components/AboutSection';
import { SecuritySection } from './components/SecuritySection';
import { SupportSection } from './components/SupportSection';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { StickyCTA } from './components/StickyCTA';
import { GuaranteeSection } from './components/GuaranteeSection';
import { WhatsAppButton } from './components/WhatsAppButton';

const App: React.FC = () => {
  
  useEffect(() => {
    // Smooth scroll correction for hash links if needed
    const handleHashChange = () => {
      const { hash } = window.location;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-brand-500 selection:text-white overflow-x-hidden font-sans">
      <main>
        <Hero />
        <VideoBenefitSection />
        <FeatureSection />
        <PlanSection />
        <BenefitsClubSection />
        <TestimonialsSection />
        <AboutSection />
        <SecuritySection />
        <SupportSection />
        <GuaranteeSection />
        <FAQ />
      </main>
      <Footer />
      <WhatsAppButton />
      <StickyCTA />
    </div>
  );
};

export default App;