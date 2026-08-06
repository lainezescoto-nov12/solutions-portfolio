import Link from "next/link";
import { agents } from "@/lib/agents";

const columns = [
  {
    title: "Agents",
    links: agents.map((a) => ({ label: a.name, href: `/agents/${a.slug}` })),
  },
  {
    title: "About",
    links: [
      { label: "How this was built", href: "/#about" },
      { label: "Resume", href: "/experience" },
      { label: "Contact", href: "mailto:lainezescoto@gmail.com" },
    ],
  },
  {
    title: "Elsewhere",
    links: [
      {
        label: "GitHub",
        href: "https://github.com/lainezescoto-nov12/solutions-portfolio",
      },
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/jose-luis-alejandro-lainez-escoto-b95211149",
      },
    ],
  },
];

function isExternal(href: string) {
  return href.startsWith("http");
}

export function MegaFooter() {
  return (
    <footer className="mt-auto border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-4">
          <div className="sm:col-span-1">
            <p className="text-lg font-semibold text-neutral-950">
              Solutions Portfolio
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              AI agents you can click into and talk to.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-neutral-950">
                {col.title}
              </p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) =>
                  isExternal(link.href) ? (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-neutral-500 hover:text-neutral-900"
                      >
                        {link.label}
                      </a>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-neutral-500 hover:text-neutral-900"
                      >
                        {link.label}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-col gap-2 border-t border-neutral-200 pt-8 text-xs text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Jose Luis Lainez Escoto.</span>
          <span>Built with Next.js, Tailwind, and real MCP tool-calling.</span>
        </div>
      </div>
    </footer>
  );
}
