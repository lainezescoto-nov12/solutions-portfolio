import { NextResponse } from "next/server";

// One-shot text-to-speech via ElevenLabs -- not a conversational agent,
// just a "give me audio for this text" call. Swapped in to replace the
// browser's default speechSynthesis voice, which is free but sounds
// robotic. Uses the same ElevenLabs account as the Ridgeline voice
// agent, but a separate stock voice (this is a different brand/persona,
// not Ridgeline's dealership voice).
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // "Rachel", a standard premade ElevenLabs voice

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ELEVENLABS_API_KEY is not configured." }, { status: 501 });
    }

    const { text } = (await request.json()) as { text: string };
    if (!text || !text.trim()) {
      return NextResponse.json({ error: "No text provided." }, { status: 400 });
    }

    const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `ElevenLabs TTS error (${response.status}): ${errText}` },
        { status: 502 }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown server error.";
    console.error("tts route error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
