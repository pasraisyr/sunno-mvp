import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { AboutAndBenefits } from "@/components/landing/AboutAndBenefits";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PioneerOffer } from "@/components/landing/PioneerOffer";
import { TokenAndNetwork } from "@/components/landing/TokenAndNetwork";
import { FaqAndCta } from "@/components/landing/FaqAndCta";

export interface LandingPageProps {
  user?: { id: string; email?: string } | null;
  profile?: {
    id: string;
    fullName: string;
    role: "USER" | "AGEN_PROMOTER" | "MERCHANT" | "ADMIN" | string;
  } | null;
}

export function LandingPage({ user, profile }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar user={user} profile={profile} />
      <main>
        <HeroSection />
        <AboutAndBenefits />
        <HowItWorks />
        <PioneerOffer />
        <TokenAndNetwork />
        <FaqAndCta />
      </main>
    </div>
  );
}
