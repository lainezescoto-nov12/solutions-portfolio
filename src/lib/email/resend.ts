// Sends the WISMO/damaged-item confirmation email via Resend's plain REST
// API (no SDK dependency -- same "raw fetch" pattern as the Shopify and
// ElevenLabs clients in this repo).
//
// Deliberately best-effort: this never touches the Shopify order (see
// open_replacement_case in src/lib/chat/tools.ts for why), so a failed
// send here should not fail the tool call or block the conversation --
// the case is still logged either way. The most common failure mode on a
// fresh Resend account is sending to an address other than the account
// owner's before a custom domain is verified; that's expected in this
// demo and handled by returning false rather than throwing.
export async function sendReplacementCaseEmail(params: {
  to: string;
  caseId: string;
  orderIdentifier: string;
  issueDescription: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not configured -- skipping confirmation email.");
    return false;
  }

  const fromAddress = process.env.RESEND_FROM_ADDRESS || "Haven Home Tech <onboarding@resend.dev>";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [params.to],
        subject: `We've got your case, ${params.orderIdentifier} (${params.caseId})`,
        text: `Hi,

We've logged a case for the issue you reported with order ${params.orderIdentifier}:

"${params.issueDescription}"

Case ID: ${params.caseId}

A member of our team will review this and follow up with next steps -- nothing has been charged or refunded automatically, this confirms your case was received.

Haven Home Tech Support`,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error(`Resend send failed (${response.status}):`, body);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Resend send threw:", err);
    return false;
  }
}
