import Link from "next/link";
import { MegaFooter } from "@/components/MegaFooter";

const impact = [
  { value: "$850K", label: "Revenue driven, final stretch as AI Solutions Engineer" },
  { value: "$1.6M", label: "Revenue influenced in year one, ramping with no prior demo background" },
  { value: "7", label: "Client-facing roles before AI — banking, legal, CX — all the same muscle" },
  { value: "C1 / Native", label: "English and Spanish, fluent enough to run a live demo in either" },
];

const roles = [
  {
    title: "AI Solutions Engineer",
    company: "Crescendo",
    period: "January 2026 – July 2026",
    location: "Remote / San Pedro Sula",
    lede:
      "Drove $850K in revenue during the role's final stretch, sustaining deal velocity built up over the prior year. Design, scope, and build AI assistants for chat, voice, and email channels.",
    bullets: [
      "Own technical discovery, solution scoping, and demo execution across the full enterprise and mid-market sales cycle",
      "Build and maintain custom demo environments with MCP integrations and omnichannel workflows tailored to prospect use cases",
      "Lead live technical evaluations and proof-of-concept engagements with enterprise and mid-market accounts",
      "Partner with Account Executives to drive deal velocity through technical storytelling and objection handling",
      "Develop reusable demo assets, playbooks, and enablement materials for the broader SE org",
      "Remain SME on AI capabilities, RAG, and CX automation, including Revenue Bootcamp for new-hire onboarding",
    ],
    featured: true,
  },
  {
    title: "AI Solutions Designer",
    company: "Crescendo",
    period: "February 2025 – December 2025",
    location: "Remote / San Pedro Sula",
    lede:
      "Influenced $1.6M in closed revenue in year one by designing AI solutions tailored to customer pain points and business outcomes — a rapid ramp into a customer-facing demo role with no prior background in it.",
    bullets: [
      "Designed, scoped, and built AI assistants for chat, voice, email, and SMS using Crescendo's platform, client APIs, and custom workflow logic",
      "Led product demonstrations tied to industry-specific pain points and CX objectives — connecting workflows to business outcomes, not feature lists",
      "Partnered with AEs on RFP responses, solution scoping, and demo strategy, translating prospect requirements into deployable AI workflow recommendations",
      "Built proof-of-concept environments using APIs, integrations, and custom logic to accelerate deal cycles and showcase real-world use cases",
      "Translated customer requirements into technical flows and automations, reviewing help centers, CRMs, and internal docs for implementation-ready recommendations",
      "Prototyped custom flows and edge-case handling; iterated on demo scripts and built reusable playbooks adopted across the revenue org",
    ],
    featured: true,
  },
];

const earlierRoles = [
  {
    title: "Customer Success Manager",
    company: "PartnerHero (Acquired by Crescendo)",
    period: "September 2023 – February 2025",
    summary:
      "Owned client relationships, performance oversight, and service delivery across multiple accounts — the primary point of contact for escalations and strategic discussions.",
  },
  {
    title: "Account Manager, Private Banking",
    company: "Banco Ficohsa",
    period: "September 2022 – September 2023",
    summary:
      "VIP customer service and portfolio growth, cross-selling credit products and running operational risk reporting.",
  },
  {
    title: "Legal Assistant",
    company: "DC Law (Remote — Independent Contractor)",
    period: "February 2022 – August 2022",
    summary:
      "Managed cases through Filevine, coordinated court and deposition schedules, and drafted legal documents end to end.",
  },
  {
    title: "Account Manager, Private Banking",
    company: "Bac Credomatic",
    period: "September 2017 – February 2022",
    summary:
      "First place in loan disbursements, northern region, 2018. Built process manuals and managed VIP portfolios with 5% monthly growth.",
  },
  {
    title: "Corporate Social Responsibility Executive",
    company: "Bac Credomatic",
    period: "September 2016 – February 2017",
    summary:
      "Coordinated corporate training and volunteer programs, and delivered financial education to new hires and corporate groups.",
  },
];

const skills = [
  {
    group: "Sales & Client Support",
    items: ["Pre-sales support", "Product demonstrations", "Client communication", "Account management"],
  },
  {
    group: "Technical & Workflow",
    items: ["AI assistant design", "Workflow development", "APIs and integrations", "Automation strategy"],
  },
  {
    group: "Operations & Documentation",
    items: ["Documentation and process mapping", "Problem solving"],
  },
  {
    group: "Collaboration & Communication",
    items: ["Customer experience (CX)", "Cross-functional collaboration", "Bilingual — English C1, Spanish native"],
  },
];

const certifications = [
  { name: "TEFL Certification — Teaching English as a Foreign Language", issuer: "TEFL Universal", period: "Jan – Apr 2024" },
  { name: "Power BI (Basic Level)", issuer: "UNITEC", period: "Feb – Mar 2020" },
  { name: "Investment Banking Fundamentals", issuer: "Bursátil", period: "Jul – Sep 2018" },
];

export default function ExperiencePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-neutral-950 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(60% 60% at 15% 10%, #146EF5 0%, transparent 60%), radial-gradient(55% 55% at 90% 20%, #1d4ed8 0%, transparent 60%), radial-gradient(70% 70% at 50% 100%, #0a2472 0%, transparent 55%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-6 pt-20 pb-20 sm:pt-28 sm:pb-28">
          <Link href="/" className="text-sm text-white/50 hover:text-white">
            ← Back home
          </Link>
          <p className="mt-8 text-sm font-medium uppercase tracking-widest text-white/60">
            Resume
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Jose Luis Lainez
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/70 sm:text-xl">
            Solutions Engineer — AI voice, chat, and email agents built on
            real MCP tool-calling, sold and demoed the way real deals
            actually close.
          </p>
          <p className="mt-8 max-w-2xl text-sm leading-relaxed text-white/50">
            Nine years client-facing before a single AI demo — banking
            portfolios, legal casework, customer success — then a fast ramp
            into designing and demoing the AI systems those same
            conversations pointed toward. This portfolio is the current
            version of that same instinct: show, don&apos;t tell.
          </p>
          <p className="mt-8 flex flex-wrap gap-x-2 gap-y-1 text-sm text-white/50">
            <span>San Pedro Sula, Honduras</span>
            <span className="text-white/25">·</span>
            <span>+504 3296 4465</span>
            <span className="text-white/25">·</span>
            <a href="mailto:lainezescoto@gmail.com" className="underline hover:text-white">
              lainezescoto@gmail.com
            </a>
            <span className="text-white/25">·</span>
            <a
              href="https://www.linkedin.com/in/jose-luis-alejandro-lainez-escoto-b95211149"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white"
            >
              LinkedIn
            </a>
            <span className="text-white/25">·</span>
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

      {/* Impact stats */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-px overflow-hidden border border-neutral-200 sm:grid-cols-4">
          {impact.map((s) => (
            <div
              key={s.label}
              className="flex flex-col gap-2 border-neutral-200 bg-white px-5 py-8 [&:not(:last-child)]:border-r [&:nth-child(-n+2)]:border-b sm:[&:nth-child(-n+2)]:border-b-0"
            >
              <span className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
                {s.value}
              </span>
              <span className="text-xs text-neutral-500 sm:text-sm">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured roles */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
          The AI chapter
        </h2>
        <div className="mt-8 flex flex-col gap-12">
          {roles.map((r) => (
            <div key={r.title + r.period} className="relative border-l-2 border-neutral-950 pl-6">
              <div
                aria-hidden
                className="absolute -left-[7px] top-1 h-3 w-3 rounded-full"
                style={{ backgroundColor: "#146EF5" }}
              />
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                {r.period} · {r.location}
              </p>
              <p className="mt-1 text-xl font-semibold text-neutral-950">
                {r.title}
              </p>
              <p className="text-sm font-medium text-neutral-500">{r.company}</p>
              <p className="mt-4 text-sm leading-relaxed text-neutral-700">{r.lede}</p>
              <ul className="mt-4 flex flex-col gap-2">
                {r.bullets.map((b) => (
                  <li key={b} className="flex gap-3 text-sm text-neutral-600">
                    <span aria-hidden className="mt-1.5 h-1 w-1 flex-none rounded-full bg-neutral-300" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Earlier career, condensed */}
      <section className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
            Before AI — nine years learning what a client actually needs
          </h2>
          <div className="mt-8 flex flex-col gap-6">
            {earlierRoles.map((r) => (
              <div
                key={r.title + r.period}
                className="rounded-xl border border-neutral-200 bg-white p-5 sm:flex sm:items-start sm:justify-between sm:gap-6"
              >
                <div>
                  <p className="text-sm font-semibold text-neutral-950">{r.title}</p>
                  <p className="text-sm text-neutral-500">{r.company}</p>
                  <p className="mt-2 text-sm text-neutral-600">{r.summary}</p>
                </div>
                <p className="mt-3 flex-none text-xs font-medium uppercase tracking-wide text-neutral-400 sm:mt-0 sm:whitespace-nowrap">
                  {r.period}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Education + certifications */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="grid gap-12 sm:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
              Education
            </h2>
            <div className="mt-6 flex flex-col gap-5">
              <div>
                <p className="text-sm font-semibold text-neutral-950">
                  MBA, Marketing Focus
                </p>
                <p className="text-sm text-neutral-500">UNITEC, San Pedro Sula · 2018 – 2019</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-950">
                  B.A., Business Management
                </p>
                <p className="text-sm text-neutral-500">UNITEC, San Pedro Sula · 2009 – 2013</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-950">
                  High School Diploma, Science and Arts
                </p>
                <p className="text-sm text-neutral-500">
                  Instituto Bilingüe Valle De Sula · 2003 – 2009
                </p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
              Certifications
            </h2>
            <div className="mt-6 flex flex-col gap-5">
              {certifications.map((c) => (
                <div key={c.name}>
                  <p className="text-sm font-semibold text-neutral-950">{c.name}</p>
                  <p className="text-sm text-neutral-500">
                    {c.issuer} · {c.period}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
            Skills
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {skills.map((s) => (
              <div key={s.group}>
                <p className="text-sm font-semibold text-neutral-950">{s.group}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {s.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-600"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tie back to the agents */}
      <section className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-16">
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
