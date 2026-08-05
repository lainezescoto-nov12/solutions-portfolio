import { Hero } from "@/components/Hero";
import { StatGrid } from "@/components/StatGrid";
import { AgentGrid } from "@/components/AgentGrid";
import { DarkSection } from "@/components/DarkSection";
import { MegaFooter } from "@/components/MegaFooter";

export default function Home() {
  return (
    <>
      <Hero />
      <StatGrid />
      <AgentGrid />
      <DarkSection />
      <MegaFooter />
    </>
  );
}
