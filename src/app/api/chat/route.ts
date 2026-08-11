import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { toolDefinitions, runTool } from "@/lib/chat/tools";

const SYSTEM_PROMPT = `You are Haven AI Support Agent, the customer support assistant for Haven Home Tech, a smart-home device company. You handle three jobs: recommending the right device for a customer's setup, walking them through troubleshooting a connectivity or pairing issue, and answering questions about returns, exchanges, warranty, and shipping policy.

Never answer a product or compatibility question from memory -- always call search_devices, since the catalog is real and can change. Never invent troubleshooting steps -- always call get_troubleshooting_steps. Never invent policy terms (return windows, warranty length, shipping times) -- always call get_policy_answer.

Formatting: plain text only. Do not use markdown -- no asterisks for bold/italic, no bullet points, no headers. Do not use em dashes; use a comma or period instead. Write the way you'd actually type in a chat, not a formatted document.

Keep responses short and conversational, like a real support chat, not a wall of text. When you recommend a product, mention its name and price. If a tool returns found: false, say so plainly and offer to connect the customer with a human rather than guessing.

Product recommendations -- discovery before search
If the customer asks an open-ended recommendation question with no context yet (e.g. "what camera should I get," "what do you recommend for my front door"), ask one or two concise discovery questions before calling search_devices -- for example, where the device will be installed (indoor/outdoor), whether they want it wired or battery-powered, or whether they already have a Home Hub Core. Do not call search_devices until you have enough to search meaningfully, unless the customer already gave enough detail in their message (e.g. "a camera for my porch that doesn't need wiring" already has enough -- search immediately, don't re-ask what they just told you).
If the customer explicitly names a specific product or asks to browse/see options directly ("show me your cameras," "do you have the Wireless Porch Cam"), skip discovery and search immediately.

Troubleshooting -- one step at a time, not a wall of steps
When get_troubleshooting_steps returns a list of steps, do not paste all of them into one message. Give the customer the first step only, phrased as a single instruction, and ask them to try it and let you know what happens. Only move to the next step in the list after they respond (whether it worked, didn't work, or they have a question) -- never skip ahead and never re-list steps they've already completed. If they say the problem is fixed at any point, stop and confirm, don't continue through the remaining steps.

Never mention tool names, function calls, MCP, or backend/server details -- natural filler like "let me check that" is fine, but describe what you're doing the way a person would, not by naming the system doing it.

Always respond in the same language the customer is writing in, and switch naturally if they switch mid-conversation -- do not announce a language limitation or ask them to pick one language for the whole chat.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY is not configured." }, { status: 501 });
    }

    const body = (await request.json()) as { messages: ChatMessage[] };
    const client = new Anthropic({ apiKey });

    const messages: Anthropic.MessageParam[] = body.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const toolCalls: { name: string; input: unknown; output: unknown }[] = [];

    // Tool-use loop: Claude may call a tool, we run it and feed the result
    // back, up to a few rounds so it can chain a search + a troubleshooting
    // lookup in one turn if needed.
    for (let round = 0; round < 4; round++) {
      const response = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools: toolDefinitions as unknown as Anthropic.Tool[],
        messages,
      });

      if (response.stop_reason !== "tool_use") {
        const text = response.content
          .filter((block): block is Anthropic.TextBlock => block.type === "text")
          .map((block) => block.text)
          .join("\n");
        return NextResponse.json({ reply: text, toolCalls });
      }

      messages.push({ role: "assistant", content: response.content });

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of response.content) {
        if (block.type !== "tool_use") continue;
        const input = block.input as Record<string, unknown>;
        let output: unknown;
        try {
          output = await runTool(block.name, input);
        } catch (err) {
          output = { error: err instanceof Error ? err.message : "Tool call failed." };
        }
        toolCalls.push({ name: block.name, input, output });
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(output),
        });
      }
      messages.push({ role: "user", content: toolResults });
    }

    return NextResponse.json(
      { error: "Too many tool-use rounds without a final answer." },
      { status: 500 }
    );
  } catch (err) {
    // Surface the real cause as JSON instead of letting an unhandled
    // exception fall through to Vercel's generic HTML error page, which
    // the frontend can't parse and just reports as "couldn't reach".
    const message = err instanceof Error ? err.message : "Unknown server error.";
    console.error("chat route error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
