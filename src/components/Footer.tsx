import { ArrowRight, ArrowUpRight } from "lucide-react";
import { REPO_URL, sheetUrl } from "@/lib/dataset";
import Logo from "./Logo";

const STEPS = [
  ["01", "Live data", "Your browser reads the curated Google Sheet directly — no server, no build step, no Node.js."],
  ["02", "Indexed on-device", "A background worker parses ~9 MB of CSV, de-duplicates it and caches it locally for instant reloads."],
  ["03", "Straight to source", "Every result links to the original answer copy on Google Drive, with the exact page number."],
];

export default function Footer({ onExplore }: { onExplore: () => void }) {
  return (
    <footer id="about" className="scroll-mt-4 p-2 sm:p-3">
      <div className="grid gap-3 lg:grid-cols-3">
        {STEPS.map(([n, title, body]) => (
          <div key={n} className="rounded-[28px] border border-black/[0.06] bg-white p-7 sm:p-8">
            <p className="font-display text-sm font-bold text-ink/30">{n}</p>
            <p className="mt-8 font-display text-2xl font-bold tracking-[-0.02em]">{title}</p>
            <p className="mt-3 leading-relaxed text-ink/55">{body}</p>
          </div>
        ))}
      </div>

      <div className="grain relative isolate mt-3 overflow-hidden rounded-[28px] bg-ink px-6 pb-10 pt-20 text-white sm:rounded-[36px] sm:px-10 lg:px-14">
        <div aria-hidden className="grid-lines absolute inset-0 -z-10" />
        <div aria-hidden className="absolute -bottom-40 left-1/2 -z-10 size-[600px] -translate-x-1/2 rounded-full bg-white/[0.08] blur-[120px]" />

        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">Built for aspirants</p>
          <h2 className="mt-5 max-w-4xl font-display text-[clamp(2.4rem,6vw,5rem)] font-bold leading-[1] tracking-[-0.035em]">
            Stop running scripts.
            <br />
            <span className="text-white/40">Start reading answers.</span>
          </h2>
          <button
            type="button"
            onClick={onExplore}
            className="group mt-10 inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-[15px] font-semibold text-ink transition-all hover:gap-3"
          >
            Open the archive <ArrowRight className="size-4" />
          </button>

          <div className="mt-24 flex flex-col gap-6 border-t border-white/10 pt-8 text-sm text-white/50 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Logo className="size-9" />
              <span className="font-display font-bold text-white">Socio Top Paper</span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <a href={sheetUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-white">
                Source sheet <ArrowUpRight className="size-3.5" />
              </a>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-white"
              >
                GitHub <ArrowUpRight className="size-3.5" />
              </a>
            </div>
            <p className="max-w-xs text-xs text-white/35">
              Answer copies belong to their respective authors and institutes. Shared for educational reference.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
