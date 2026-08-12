import nodemailer from "nodemailer";

// Sends the WISMO/damaged-item confirmation email through a real Gmail
// account via SMTP (an App Password, not OAuth -- simpler to set up than
// the voice agent's Google Calendar/Gmail OAuth flow, and sufficient here
// since this only ever sends, never reads). Chosen over a transactional
// provider like Resend specifically because Gmail SMTP sends from a real,
// already-authenticated mailbox -- no sandbox domain restricting delivery
// to the account owner only, so it can actually reach an arbitrary
// recipient (e.g. a recruiter testing the demo), not just the account
// owner's own inbox.
//
// Deliberately best-effort: this never touches the Shopify order (see
// open_replacement_case in src/lib/chat/tools.ts for why), so a failed
// send here should not fail the tool call or block the conversation -- the
// case is still logged either way.
let cachedTransporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  cachedTransporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  return cachedTransporter;
}

export async function sendReplacementCaseEmail(params: {
  to: string;
  caseId: string;
  orderIdentifier: string;
  issueDescription: string;
}): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.error("GMAIL_USER / GMAIL_APP_PASSWORD are not configured -- skipping confirmation email.");
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"Haven Home Tech Support" <${process.env.GMAIL_USER}>`,
      to: params.to,
      subject: `We've got your case, ${params.orderIdentifier} (${params.caseId})`,
      text: `Hi,

We've logged a case for the issue you reported with order ${params.orderIdentifier}:

"${params.issueDescription}"

Case ID: ${params.caseId}

A member of our team will review this and follow up with next steps -- nothing has been charged or refunded automatically, this confirms your case was received.

Haven Home Tech Support`,
    });
    return true;
  } catch (err) {
    console.error("Gmail send failed:", err);
    return false;
  }
}
