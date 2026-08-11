// Tool layer for the Chat agent -- Claude's native tool-use API, not the
// MCP protocol (no separate server exposing these over MCP; that's a
// deliberate scope decision for this build, see agents.ts stack labels).
// Same shape as the voice agent's tools regardless: typed functions,
// registered once, the model decides when to call them.
import { fetchAllDevices } from "@/lib/shopify/client";
import { mockTroubleshootingSteps, mockPolicyKB } from "@/lib/mock-data/catalog";

export const toolDefinitions = [
  {
    name: "search_devices",
    description:
      "Search Haven Home Tech's live product catalog for devices matching a customer's need. Use this for any product recommendation or compatibility question -- never answer from memory.",
    input_schema: {
      type: "object" as const,
      properties: {
        need: {
          type: "string",
          description:
            "A plain-language description of what the customer wants, e.g. 'camera for front porch, no wiring' or 'thermostat that works without a C-wire'. Do not write search syntax or filters -- just describe the need in plain words, matching is handled automatically.",
        },
      },
      required: ["need"],
    },
  },
  {
    name: "get_troubleshooting_steps",
    description:
      "Look up step-by-step troubleshooting guidance for a connectivity, pairing, or setup issue. Use this whenever a customer describes a problem with a device -- never invent troubleshooting steps.",
    input_schema: {
      type: "object" as const,
      properties: {
        issue: {
          type: "string",
          description:
            "A short description of the problem, e.g. 'sensor keeps dropping offline' or 'camera won't connect to wifi'.",
        },
      },
      required: ["issue"],
    },
  },
  {
    name: "get_policy_answer",
    description:
      "Look up an answer to a question about returns, exchanges, warranty, or shipping policy. Use this for any policy question -- never answer from memory or invent policy terms.",
    input_schema: {
      type: "object" as const,
      properties: {
        question: {
          type: "string",
          description:
            "The customer's policy question, e.g. 'what is your return policy' or 'how do I file a warranty claim'.",
        },
      },
      required: ["question"],
    },
  },
] as const;

// Normalizes hyphens to spaces before splitting so a tag like
// "no-wiring-required" tokenizes the same way a customer's plain-language
// "no wiring required" does -- this is the fix for the bug where Shopify's
// own query syntax (tag:no-wiring-required) failed to match reliably.
// Also does crude singularization (strip a trailing "s") so "cameras"
// matches a catalog entry tagged/typed "camera".
function normalizeWords(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/-/g, " ")
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => (w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w));
}

function scoreKeywordMatch(query: string, target: string): number {
  const queryWords = new Set(normalizeWords(query));
  const targetWords = new Set(normalizeWords(target));
  let overlap = 0;
  for (const w of queryWords) if (w && targetWords.has(w)) overlap++;
  return overlap;
}

export async function runTool(name: string, input: Record<string, unknown>): Promise<unknown> {
  if (name === "search_devices") {
    const need = String(input.need ?? "");
    const devices = await fetchAllDevices();

    const scored = devices.map((d) => {
      // productType counted 3x (the strongest category signal -- "camera"
      // should dominate ranking over incidental overlap on generic words
      // like "hub" or "powered" that appear across many products' tags),
      // tags 2x (curated use-case signal), description once (weakest,
      // free text).
      const blob = [
        d.title,
        d.productType,
        d.productType,
        d.productType,
        d.tags.join(" "),
        d.tags.join(" "),
        d.description,
      ].join(" ");
      return { device: d, score: scoreKeywordMatch(need, blob) };
    });

    const topScore = Math.max(0, ...scored.map((s) => s.score));
    // Only return devices actually competitive with the best match --
    // previously this returned the top 5 regardless of score, which meant
    // a specific query (e.g. a battery-powered front-porch camera) still
    // surfaced the thermostat, lock, and sensor because generic words
    // ("hub", "powered", "no") show up in most products' tags. A real
    // match should win clearly, not just edge out the rest.
    const matches = scored
      .filter((s) => topScore > 0 && s.score >= topScore - 1)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((s) => s.device);

    if (matches.length === 0) {
      return { found: false, note: "No devices matched that search in the live catalog." };
    }
    return { found: true, devices: matches };
  }

  if (name === "get_troubleshooting_steps") {
    const issue = String(input.issue ?? "");
    const scored = mockTroubleshootingSteps
      .map((entry) => ({ entry, score: scoreKeywordMatch(issue, entry.issue) }))
      .sort((a, b) => b.score - a.score);

    if (scored[0].score === 0) {
      return {
        found: false,
        note: "No matching troubleshooting entry -- recommend contacting support directly.",
      };
    }
    return { found: true, issue: scored[0].entry.issue, steps: scored[0].entry.steps };
  }

  if (name === "get_policy_answer") {
    const question = String(input.question ?? "");
    const scored = mockPolicyKB
      .map((entry) => ({ entry, score: scoreKeywordMatch(question, entry.question) }))
      .sort((a, b) => b.score - a.score);

    if (scored[0].score === 0) {
      return {
        found: false,
        note: "No matching policy entry -- recommend contacting support directly.",
      };
    }
    return { found: true, matchedQuestion: scored[0].entry.question, answer: scored[0].entry.answer };
  }

  throw new Error(`Unknown tool: ${name}`);
}
