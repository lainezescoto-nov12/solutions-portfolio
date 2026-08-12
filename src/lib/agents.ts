export type AgentStat = {
  label: string;
  value: string;
  href?: string;
  linkLabel?: string;
};

// A follow-up line is either just the text to copy/paste, or that text
// plus a short non-copyable note underneath it (e.g. a UI hint) -- kept
// separate so the copy button only ever copies the actual scripted line,
// never the instructional aside.
export type FollowUp = string | { text: string; note?: string };

export type SamplePrompt = {
  label: string;
  prompt: string;
  // Optional answer key for multi-turn flows (e.g. troubleshooting, which
  // now paces one step at a time) -- what to say back at each step so
  // someone testing it isn't stuck guessing after the first exchange.
  followUps?: FollowUp[];
  // Optional sample file (e.g. a damaged-item photo for the WISMO flow) --
  // a public/ path a visitor can download, then drag onto the chat or
  // attach via the paperclip, so a flow that expects a photo is actually
  // testable without them needing a real damaged product on hand.
  attachmentUrl?: string;
  attachmentLabel?: string;
  // Secondary use cases start collapsed behind a dropdown arrow so the
  // panel leads with the headline flows instead of a long flat list.
  defaultCollapsed?: boolean;
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
  samplePromptsIntro?: string;
  externalUrl?: string;
  liveCapabilities?: string[];
};

export const agents: Agent[] = [
  {
    slug: "voice",
    name: "Voice",
    industry: "Ridgeline Auto Group — Automotive",
    tagline: "An AI voice agent that books, cancels, and reschedules appointments — and handles customer support like a real service advisor.",
    status: "live",
    statusLabel: "Live — deployed on Cloud Run",
    summary:
      "A customer calls asking to book a service appointment. The agent checks real availability, books the slot, and sends a confirmation — the customer sees it land on their Gmail calendar within seconds, no hold music, no hand-off to a human. Ask it to reschedule later and it finds that same booking and moves it, just as easily.",
    stats: [
      { label: "Tools wired", value: "10" },
      { label: "Languages", value: "English + Spanish" },
      { label: "Confirmed bookings", value: "Live" },
    ],
    stack: ["FastMCP", "Cloud Run", "ElevenLabs", "Claude Haiku 4.5", "Twilio", "Firestore", "Google Calendar/Gmail API"],
    liveCapabilities: ["Booking confirmations and cancellations", "Customer support"],
    samplePrompts: [
      { label: "FAQ + booking", prompt: "\"What are your service department hours? I'd like to book a test drive for a Toyota Tundra — do you have anything open tomorrow?\"" },
      { label: "Reschedule an existing booking", prompt: "\"Hi, I need to move my appointment to a different time.\"" },
      { label: "Cancel an appointment", prompt: "\"I need to cancel my appointment for Friday.\"" },
      {
        label: "Reschedule, cold call",
        prompt: "\"Hi, I think I have a test drive booked but I don't have the confirmation handy — can you move it to Friday?\"",
        defaultCollapsed: true,
      },
      {
        label: "Parts availability",
        prompt: "\"Do you have brake pads in stock for a 2019 Toyota Camry?\"",
        defaultCollapsed: true,
      },
      {
        label: "Vehicle lookup",
        prompt: "\"Is there a recall on my Hyundai Tucson? The VIN is K M 8 J 3 C A 4 6 L U 0 0 0 0 0 1.\"",
        defaultCollapsed: true,
      },
    ],
    externalUrl: "tel:+19843889822",
  },
  {
    slug: "chat",
    name: "Chat",
    industry: "Haven Home Tech — Smart Home / IoT",
    tagline: "A chat AI agent that provides product recommendations and troubleshooting guidance, and switches into a hands-free voice mode you can talk over like a real conversation.",
    status: "in-progress",
    statusLabel: "In progress",
    summary:
      "A chat agent for a smart-home device company, built to handle where's-my-order questions, product recommendations, and troubleshooting. Chat with it, or click the waveform to just talk — either way, it's answering from a real Shopify store's live data and a curated knowledge base in Notion, not a script.",
    stats: [
      { label: "Use cases", value: "3" },
      {
        label: "Catalog",
        value: "Live Shopify store",
        href: "https://haven-home-tech.myshopify.com",
        linkLabel: "Haven Home Tech",
      },
      { label: "Tool-calling", value: "Claude" },
    ],
    stack: [
      "Next.js",
      "Claude tool-calling",
      "Shopify Admin API",
      "Notion (KB)",
      "Claude Haiku 4.5",
      "Web Speech API",
      "ElevenLabs TTS",
    ],
    samplePromptsIntro:
      "Haven Home Tech sells smart-home devices — cameras, sensors, hubs, thermostats, and locks. You don't need to know the exact product names to try these:",
    samplePrompts: [
      {
        label: "WISMO / damaged item",
        prompt: "\"Hi, where's my order?\"",
        followUps: [
          "It's order #1001",
          "Let me check my front door real quick.",
          {
            text: "Bad news, my deadbolt is damaged!",
            note: "Once it offers voice mode, attach the sample photo with the paperclip icon.",
          },
          "Yeah, a replacement works.",
          {
            text: "Can you please send the confirmation email to [drop your email here]",
            note: "Check your spam folder if it doesn't show up in a minute.",
          },
        ],
        attachmentUrl: "/downloads/damaged-deadbolt.png",
        attachmentLabel: "Download a sample damaged-item photo",
      },
      {
        label: "Product recommendation",
        prompt: "\"I want a camera for my front porch.\"",
        followUps: [
          "Battery-powered, please",
          "No, I don't have a Home Hub Core",
        ],
      },
      {
        label: "Troubleshooting",
        prompt: "\"My hub shows online but the sensor keeps dropping offline every few hours.\"",
        followUps: [
          "It's showing two battery lines",
          "Yes, about 15 feet away with one wall between them",
          "Okay, I did that, it's blinking blue now",
          "I checked, there are a lot of other networks nearby",
        ],
      },
      {
        label: "Browse a category",
        prompt: "\"What types of cameras do you have?\"",
        followUps: [
          "Let's do a setup for indoors, please",
          "Battery-powered, please",
          "Let's still go with the Indoor Pan Cam, that's fine",
        ],
        defaultCollapsed: true,
      },
      {
        label: "Compatibility check",
        prompt: "\"I've got an old Honeywell thermostat and my HVAC system doesn't have a C-wire, would your thermostat still work for me?\"",
        defaultCollapsed: true,
      },
      {
        label: "Returns & warranty",
        prompt: "\"What's your return policy, and how long is the warranty?\"",
        defaultCollapsed: true,
      },
    ],
  },
  {
    slug: "email",
    name: "Email",
    industry: "E-commerce Order Editing",
    tagline: "A proactive AI agent that edits a customer's order before it ships and turns into a bad experience — watch it live.",
    status: "in-progress",
    statusLabel: "In progress — order panel + agent logic",
    summary:
      "Before a shipping mistake turns into a customer complaint, this agent catches it. It reads an incoming email requesting a change — a new address, a cancelled item, a fixed quantity — finds the order, and applies the edit automatically. A live Order History Panel mirrors the change in the browser as it happens, so you watch it happen instead of trusting a screenshot.",
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
