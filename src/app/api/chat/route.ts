import { NextResponse } from "next/server";

// Placeholder API route for the Chat agent (IoT product rec + troubleshooting).
// TODO: accept a message, call Claude with MCP tools bound to
// src/lib/mock-data/catalog.ts (via Firestore), return the response.
export async function POST() {
  return NextResponse.json(
    { error: "Chat agent backend not implemented yet." },
    { status: 501 }
  );
}
