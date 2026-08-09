import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StatsSection from "@/components/StatsSection";
import LicenseInfoSection from "@/components/LicenseInfoSection";
import FeaturesSection from "@/components/FeaturesSection";
import DownloadSection from "@/components/DownloadSection";
import ChangelogSection from "@/components/ChangelogSection";
import VouchesSection from "@/components/VouchesSection";
import FaqSection from "@/components/FaqSection";
import DiscordSection from "@/components/DiscordSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="relative">
        <Hero />
        <StatsSection />
        <LicenseInfoSection />
        <FeaturesSection />
        <DownloadSection />
        <ChangelogSection />
        <VouchesSection />
        <FaqSection />
        <DiscordSection />
      </main>
      <Footer />
    </>
  );
}
