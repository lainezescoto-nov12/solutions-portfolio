// Stub for the shared MCP tool-calling client used by the Chat and Email
// agents. Both agents are meant to call real MCP tools (backed by
// Firestore, holding mocked business data) rather than hard-coded logic —
// mirrors the pattern used by the live Ridgeline voice agent's FastMCP
// server.
//
// TODO:
// - Point this at a FastMCP (or equivalent) server exposing tools like
//   `get_order`, `update_order_address`, `cancel_order_item`,
//   `update_order_quantity` (email agent) and `search_devices`,
//   `get_troubleshooting_steps` (chat agent).
// - Decide: one shared MCP server with all tools, or one per agent.
// - Wire Firestore as the tool backend, seeded from
//   src/lib/mock-data/*.ts.

export type ToolCall = {
  name: string;
  input: Record<string, unknown>;
};

export type ToolResult = {
  name: string;
  output: unknown;
  isError?: boolean;
};

export async function callTool(_call: ToolCall): Promise<ToolResult> {
  throw new Error(
    "MCP client not wired up yet — see src/lib/mcp/client.ts for the integration TODO."
  );
}
