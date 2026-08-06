import Link from "next/link";
import { MegaFooter } from "@/components/MegaFooter";

// Web-resume / experience page. Content below is a placeholder structure —
// swap in real role history, dates, and bullet points. Kept as a page
// (not a PDF) so "Resume" and "Experience" in the footer can point here
// until a hosted PDF exists.
export default function ExperiencePage() {
  return (
    <>
      <section className="border-b border-neutral-200 bg-neutral-950 text-white">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <Link href="/" className="text-sm text-white/50 hover:text-white">
            ← Back home
          </Link>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            Jose Luis Lainez Escoto
          </h1>
          <p className="mt-3 text-lg text-white/70">
            Solutions Engineer — AI voice, chat, and email agents built on
            real MCP tool-calling.
          </p>
          <p className="mt-6 text-sm text-white/50">
            lainezescoto@gmail.com ·{" "}
            <a
              href="https://www.linkedin.com/in/jose-luis-alejandro-lainez-escoto-b95211149"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white"
            >
              LinkedIn
            </a>{" "}
            ·{" "}
            <a
              href="https://github.com/lainezescoto-nov12/solutions-portfolio"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white"
            >
              GitHub
            </a>
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
          Experience
        </h2>
        <div className="mt-6 border-l border-neutral-200 pl-6">
          <p className="text-lg font-semibold text-neutral-950">
            Solutions Engineer — Crescendo AI
          </p>
          <p className="mt-2 text-sm text-neutral-600">
            TODO: replace with real bullet points from your resume — scope
            of customer-facing solutions engineering work, tools shipped,
            impact.
          </p>
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
            This portfolio
          </h2>
          <p className="mt-6 text-neutral-700">
            The three agents on this site — voice, chat, and email — are the
            hands-on proof of that experience: real MCP tool-calling against
            real backends (Cloud Run, Firestore, Google Calendar/Gmail),
            not slide-deck descriptions.
          </p>
          <Link
            href="/#agents"
            className="mt-6 inline-block text-sm font-semibold text-neutral-950 hover:underline"
          >
            Try the agents →
          </Link>
        </div>
      </section>

      <MegaFooter />
    </>
  );
}
