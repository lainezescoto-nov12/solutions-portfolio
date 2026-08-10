// Tool layer for the Chat agent -- Claude's native tool-use API, not the
// MCP protocol (no separate server exposing these over MCP; that's a
// deliberate scope decision for this build, see agents.ts stack labels).
// Same shape as the voice agent's tools regardless: typed functions,
// registered once, the model decides when to call them.
import { searchDevices } from "@/lib/shopify/client";
import { mockTroubleshootingSteps, mockPolicyKB } from "@/lib/mock-data/catalog";

export const toolDefinitions = [
  {
    name: "search_devices",
    description:
      "Search Haven Home Tech's live product catalog for devices matching a customer's need. Use this for any product recommendation or compatibility question -- never answer from memory.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description:
            "Shopify search syntax fragment describing what to look for, e.g. product_type:Camera, or tag:no-c-wire, or a plain keyword like 'thermostat'. Combine multiple constraints with AND, e.g. \"product_type:Camera AND tag:outdoor\".",
        },
      },
      required: ["query"],
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

function scoreKeywordMatch(query: string, target: string): number {
  const queryWords = new Set(query.toLowerCase().split(/\s+/));
  const targetWords = new Set(target.toLowerCase().split(/\s+/));
  let overlap = 0;
  for (const w of queryWords) if (targetWords.has(w)) overlap++;
  return overlap;
}

export async function runTool(name: string, input: Record<string, unknown>): Promise<unknown> {
  if (name === "search_devices") {
    const query = String(input.query ?? "");
    const devices = await searchDevices(query);
    if (devices.length === 0) {
      return { found: false, note: "No devices matched that search in the live catalog." };
    }
    return { found: true, devices };
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
