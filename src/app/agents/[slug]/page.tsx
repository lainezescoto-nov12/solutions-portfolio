import { notFound } from "next/navigation";
import { agents, getAgent } from "@/lib/agents";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentStats } from "@/components/agent/AgentStats";
import { SamplePrompts } from "@/components/agent/SamplePrompts";
import { VoiceDemoPanel } from "@/components/agent/VoiceDemoPanel";
import { ChatDemoPanel } from "@/components/agent/ChatDemoPanel";
import { EmailDemoPanel } from "@/components/agent/EmailDemoPanel";
import { ComingSoonOverlay } from "@/components/agent/ComingSoonOverlay";
import { MegaFooter } from "@/components/MegaFooter";

export function generateStaticParams() {
  return agents.map((a) => ({ slug: a.slug }));
}

export default async function AgentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agent = getAgent(slug);
  if (!agent) notFound();

  return (
    <>
      <AgentHeader agent={agent} />
      <AgentStats agent={agent} />
      <section className="mx-auto grid max-w-5xl gap-8 px-6 py-16 sm:grid-cols-2">
        <div>
          {agent.slug === "voice" && <VoiceDemoPanel agent={agent} />}
          {agent.slug === "chat" && (
            <ComingSoonOverlay>
              <ChatDemoPanel />
            </ComingSoonOverlay>
          )}
          {agent.slug === "email" && (
            <ComingSoonOverlay>
              <EmailDemoPanel />
            </ComingSoonOverlay>
          )}
        </div>
        <SamplePrompts prompts={agent.samplePrompts} />
      </section>
      <MegaFooter />
    </>
  );
}
