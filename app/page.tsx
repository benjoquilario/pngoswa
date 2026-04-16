import {
  AboutSection,
  FoundationSection,
  HeroSection,
  HomeFooter,
  HomeNavbar,
  JoinCtaSection,
  MembershipOverviewSection,
  ObjectivesSection,
  ProgramsSection,
} from "@/components/home";

export default function Home() {
  return (
    <>
      <HomeNavbar />

      <main className="flex-1" id="top">
        <HeroSection />
        <AboutSection />
        <FoundationSection />
        <ObjectivesSection />
        <ProgramsSection />
        <MembershipOverviewSection />
        <JoinCtaSection />
      </main>

      <HomeFooter />
    </>
  );
}
