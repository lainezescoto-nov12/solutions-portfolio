export type AgentStat = {
  label: string;
  value: string;
};

export type SamplePrompt = {
  label: string;
  prompt: string;
};

export type AgentStatus = "live" | "in-progress";

export type Agent = {
  slug: "voice" | "chat" | "email";
  name: string;
  industry: string;
  tagline: string;
  status: AgentStatus;
  statusLabel: string;
  summary: string;
  stats: AgentStat[];
  stack: string[];
  samplePrompts: SamplePrompt[];
  externalUrl?: string;
};

export const agents: Agent[] = [
  {
    slug: "voice",
    name: "Voice",
    industry: "Ridgeline Auto Group — Automotive",
    tagline: "A phone-answering agent that books, cancels, and follows up like a real service advisor.",
    status: "live",
    statusLabel: "Live — deployed on Cloud Run",
    summary:
      "Calls a real Twilio number and talks to an ElevenLabs voice agent (Claude Haiku 4.5, English + Spanish) backed by a 10-tool FastMCP server. It reads and writes real Google Calendar and Gmail data through Firestore, so a booking made on the call sends a real confirmation email and shows up on the calendar.",
    stats: [
      { label: "Tools wired", value: "10" },
      { label: "Languages", value: "2" },
      { label: "Confirmed bookings", value: "Live" },
    ],
    stack: ["FastMCP", "Cloud Run", "ElevenLabs", "Claude Haiku 4.5", "Twilio", "Firestore", "Google Calendar/Gmail API"],
    samplePrompts: [
      { label: "Book an appointment", prompt: "\"I need to bring my Camry in for an oil change next Tuesday afternoon.\"" },
      { label: "Cancel across sessions", prompt: "\"I booked something last week, can you cancel it?\"" },
      { label: "Ask a FAQ", prompt: "\"Do you offer loaner cars while mine's in the shop?\"" },
      { label: "Vehicle lookup", prompt: "\"Is there a recall on my 2019 Hyundai Sonata?\"" },
    ],
    externalUrl: "#",
  },
  {
    slug: "chat",
    name: "Chat",
    industry: "IoT Device Company (placeholder)",
    tagline: "Helps a customer pick the right device, then walks them through fixing it when it breaks.",
    status: "in-progress",
    statusLabel: "In progress — knowledge base + chat UI",
    summary:
      "A chat agent for a smart-device company covering two jobs: recommending the right product for a customer's setup, and troubleshooting connectivity or pairing issues step by step. Backed by a real MCP tool-calling layer over a mocked product catalog and troubleshooting knowledge base seeded in Firestore.",
    stats: [
      { label: "Use cases", value: "2" },
      { label: "Backend", value: "Firestore + MCP" },
      { label: "Data", value: "Mocked catalog" },
    ],
    stack: ["Next.js", "MCP tool-calling", "Firestore (mock data)", "Claude"],
    samplePrompts: [
      { label: "Product recommendation", prompt: "\"I want a camera for my front porch that works without running new wiring.\"" },
      { label: "Troubleshooting", prompt: "\"My hub shows online but the sensor keeps dropping offline every few hours.\"" },
      { label: "Compatibility check", prompt: "\"Will your thermostat work with a system that has no C-wire?\"" },
    ],
  },
  {
    slug: "email",
    name: "Email",
    industry: "E-commerce Order Editing",
    tagline: "Reads a customer's email, finds their order, and makes the edit — watch it happen live.",
    status: "in-progress",
    statusLabel: "In progress — order panel + agent logic",
    summary:
      "An email agent that parses an incoming request (address change, item cancellation, quantity update), looks up the customer's order history, and applies the edit through tool calls. Since there's no live ShipStation/Shopify instance to point at, a live Order History Panel mirrors the state change in the browser as the agent processes the email — that's the actual demo moment.",
    stats: [
      { label: "Use cases", value: "3" },
      { label: "Backend", value: "Firestore + MCP" },
      { label: "Demo", value: "Live state panel" },
    ],
    stack: ["Next.js", "MCP tool-calling", "Firestore (mock data)", "Claude"],
    samplePrompts: [
      { label: "Address change", prompt: "\"Can you ship my last order to my new apartment instead? 214 Birch St, Apt 4.\"" },
      { label: "Cancel an item", prompt: "\"Please remove the phone case from order #10482, keep the rest.\"" },
      { label: "Quantity update", prompt: "\"I meant to order 3 of the water bottles, not 1 — can you fix that?\"" },
    ],
  },
];

export function getAgent(slug: string): Agent | undefined {
  return agents.find((a) => a.slug === slug);
}
