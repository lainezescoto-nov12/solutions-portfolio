// One-off smoke test for the Chat agent's tool-calling -- not part of the
// app itself, just a way to confirm every tool actually fires against the
// live deployment before sharing the link. Run with:
//   BASE_URL=https://your-deployed-url.vercel.app node scripts/test-chat-tools.mjs
// BASE_URL defaults to the current production alias if not set.

const BASE_URL = process.env.BASE_URL || "https://solutions-portfolio-ruddy.vercel.app";

// Each case sends a full message history (the API is stateless per
// request, so a multi-turn scenario like the WISMO flow is simulated by
// handing it prior turns directly) and checks which tools fired.
const cases = [
  {
    name: "search_devices",
    messages: [{ role: "user", content: "I want a camera for my front porch, no wiring." }],
    expectTools: ["search_devices"],
  },
  {
    name: "get_troubleshooting_steps",
    messages: [{ role: "user", content: "My hub shows online but the sensor keeps dropping offline every few hours." }],
    expectTools: ["get_troubleshooting_steps"],
  },
  {
    name: "get_policy_answer",
    messages: [{ role: "user", content: "What's your return policy, and how long is the warranty?" }],
    expectTools: ["get_policy_answer"],
  },
  {
    name: "check_order_status",
    messages: [{ role: "user", content: "Can you check the status of order #1001?" }],
    expectTools: ["check_order_status"],
  },
  {
    name: "open_replacement_case (+ email)",
    messages: [
      { role: "user", content: "Hi, where's my order?" },
      { role: "assistant", content: "Sure, what's your order number or the email you used?" },
      { role: "user", content: "It's order #1001" },
      { role: "assistant", content: "Your order #1001 has been delivered." },
      { role: "user", content: "Bad news, my deadbolt is damaged!" },
      {
        role: "assistant",
        content:
          "I am so sorry, this is not the experience we wanted for you. It might be easier to switch to voice mode so you can take a picture of the damaged item. Would you like a replacement or a refund?",
      },
      { role: "user", content: "A replacement please, the keypad is cracked and wires are exposed." },
    ],
    expectTools: ["open_replacement_case"],
  },
  {
    name: "resend_case_confirmation_email",
    messages: [
      { role: "user", content: "Hi, where's my order?" },
      { role: "assistant", content: "Sure, what's your order number or the email you used?" },
      { role: "user", content: "It's order #1001" },
      { role: "assistant", content: "Your order #1001 has been delivered." },
      { role: "user", content: "Bad news, my deadbolt is damaged!" },
      {
        role: "assistant",
        content:
          "I am so sorry, this is not the experience we wanted for you. It might be easier to switch to voice mode so you can take a picture of the damaged item. Would you like a replacement or a refund?",
      },
      { role: "user", content: "A replacement please, the keypad is cracked and wires are exposed." },
      {
        role: "assistant",
        content:
          "Got it, I've logged a replacement case for you, case RC-TEST01. A confirmation email has been sent to the email on file, or would you like it sent to a different email instead? If so, please type it in the chat.",
      },
      { role: "user", content: "Can you please send the confirmation email to lainezescoto@gmail.com" },
    ],
    expectTools: ["resend_case_confirmation_email"],
  },
];

async function runCase(testCase) {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: testCase.messages }),
  });

  const status = res.status;
  let data;
  try {
    data = await res.json();
  } catch {
    return { name: testCase.name, ok: false, detail: `Non-JSON response (status ${status})` };
  }

  if (!res.ok) {
    return { name: testCase.name, ok: false, detail: `HTTP ${status}: ${data?.error ?? "unknown error"}` };
  }

  const firedTools = (data.toolCalls ?? []).map((c) => c.name);
  const missing = testCase.expectTools.filter((t) => !firedTools.includes(t));
  const toolErrors = (data.toolCalls ?? []).filter(
    (c) => c.output && typeof c.output === "object" && "error" in c.output
  );

  if (missing.length > 0) {
    return {
      name: testCase.name,
      ok: false,
      detail: `Expected [${testCase.expectTools.join(", ")}], got [${firedTools.join(", ") || "none"}]`,
    };
  }
  if (toolErrors.length > 0) {
    return {
      name: testCase.name,
      ok: false,
      detail: `Tool(s) fired but returned an error: ${JSON.stringify(toolErrors.map((c) => ({ name: c.name, error: c.output.error })))}`,
    };
  }
  return { name: testCase.name, ok: true, detail: `Fired: [${firedTools.join(", ")}] -- reply: "${data.reply.slice(0, 80)}${data.reply.length > 80 ? "..." : ""}"` };
}

console.log(`Testing Chat agent tools against ${BASE_URL}\n`);

let allPassed = true;
for (const testCase of cases) {
  const result = await runCase(testCase);
  allPassed = allPassed && result.ok;
  console.log(`${result.ok ? "✅" : "❌"} ${result.name}`);
  console.log(`   ${result.detail}\n`);
}

console.log(allPassed ? "All tool checks passed." : "Some checks failed -- see above.");
process.exit(allPassed ? 0 : 1);
