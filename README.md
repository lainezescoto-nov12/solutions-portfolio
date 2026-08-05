# Solutions Portfolio

Standalone marketing/portfolio site showcasing three AI agents. Recruiters
and prospective clients click into an agent and try it — not just read a
description.

## Agents

| Agent | Industry | Status |
|---|---|---|
| Voice | Ridgeline Auto Group (dealership) | **Live** — FastMCP + Cloud Run + ElevenLabs + Twilio, linked out, not rebuilt here |
| Chat | IoT device company (placeholder) | In progress — product rec + troubleshooting |
| Email | E-commerce order editing | In progress — live Order History Panel is the demo moment |

Chat and Email are meant to be **real working agents**: actual Claude
tool-calling over an MCP layer, backed by Firestore — just seeded with
mocked business data (no live ShipStation/Shopify/device fleet to point
at). Not scripted/canned demos.

## Stack

Next.js 16 (App Router, TypeScript), Tailwind CSS v4. Styling reference:
Glean's marketing site — large gradient hero, stat-grid strip, dark
credibility section, mega-footer, persistent bottom-right assistant.

## Structure

```
src/
  app/
    page.tsx                 landing page
    agents/[slug]/page.tsx   per-agent detail page (voice/chat/email)
    api/chat/route.ts        stub — chat agent backend (501 until built)
    api/email/route.ts       stub — email agent backend (501 until built)
  components/                landing page sections
  components/agent/          agent detail page sections + demo panels
  lib/agents.ts              agent metadata (copy, stats, sample prompts)
  lib/mcp/client.ts          MCP tool-calling client stub
  lib/mock-data/orders.ts    mock order history (email agent)
  lib/mock-data/catalog.ts   mock device catalog + troubleshooting KB (chat agent)
```

## Getting started

```bash
npm install
npm run dev
```

Copy `.env.local.example` to `.env.local` when wiring up the real
backends (Anthropic API key, Firestore credentials, MCP server URL).

## Open items

- Chat and Email agent backends: not implemented (`501` stubs in place).
  Needs an MCP server (FastMCP, same pattern as the voice agent) exposing
  tools over the mock data, plus Firestore as the actual store.
- Email agent's Order History Panel is currently a static preview — needs
  to stream live state as the agent applies edits.
- Assistant widget (bottom-right) is a UI shell — intended to eventually
  run on the Chat agent itself as a meta-demo.
- Voice agent page links out with a placeholder URL/number — swap in the
  real number or an embedded call widget.
- Copy/positioning per agent is a first draft, not final.
- n8n outbound-reminder wiring for the voice agent was in progress in a
  separate session — check status before assuming it's done; irrelevant
  to this repo either way since the voice agent isn't rebuilt here.
