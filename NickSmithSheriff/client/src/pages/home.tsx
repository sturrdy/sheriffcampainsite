import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import AboutSection from "@/components/about-section";
import IssuesSection from "@/components/issues-section";
import EndorsementsSection from "@/components/endorsements-section";
import GetInvolvedSection from "@/components/get-involved-section";
import VoterInfoSection from "@/components/voter-info-section";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection />
        <AboutSection />
        <IssuesSection />
        <EndorsementsSection />
        <GetInvolvedSection />
        <VoterInfoSection />
      </main>
      <Footer />
    </div>
  );
}
