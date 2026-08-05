import { NextResponse } from "next/server";

// Placeholder API route for the Email agent (order editing).
// TODO: accept a mock inbound email, parse intent, call Claude with MCP
// tools bound to src/lib/mock-data/orders.ts (via Firestore), stream
// state changes back to the Order History Panel UI.
export async function POST() {
  return NextResponse.json(
    { error: "Email agent backend not implemented yet." },
    { status: 501 }
  );
}
