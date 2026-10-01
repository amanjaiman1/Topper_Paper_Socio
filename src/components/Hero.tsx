"use client";

import { useMemo } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import type { DatasetState } from "@/lib/useDataset";
import type { Row } from "@/lib/types";
import SyncStatus from "./SyncStatus";

const QUICK = ["Durkheim", "Sanskritisation", "Caste", "Patriarchy", "Secularisation", "Weber"];

const FALLBACK: Pick<Row, "qLabel" | "question" | "topper" | "air" | "section">[] = [
  { qLabel: "Q1(a)", question: "How has the scope of Sociology broadened in global times? Illustrate with examples.", topper: "Siddharth Singh", air: "143", section: "Sociology – The Discipline" },
  { qLabel: "Q2(b)", question: "Is caste a closed system? Discuss with reference to Indian villages.", topper: "Aayushi Bansal", air: "7", section: "Caste System" },
  { qLabel: "Q5(c)", question: "Explain Weber's concept of ideal type and its methodological relevance.", topper: "Animesh Pradhan", air: "2", section: "Sociological Thinkers" },
];

export default function Hero({
  ds,
  onExplore,
  onSearch,
}: {
  ds: DatasetState;
  onExplore: () => void;
  onSearch: (q: string) => void;
}) {
  const samples = useMemo(() => {
    if (!ds.data) return FALLBACK;
    const picks = ds.data.rows.filter(
      (r) => r.question && r.qLabel && r.air && r.question.length > 50 && r.question.length < 120,
    );
    if (picks.length < 3) return FALLBACK;
    const step = Math.floor(picks.length / 3);
    return [picks[Math.floor(step * 0.4)], picks[Math.floor(step * 1.5)], picks[Math.floor(step * 2.6)]];
  }, [ds.data]);

  const thinkers = ds.data?.thinkers.slice(0, 24).map((t) => t.name) ?? [
    "Émile Durkheim", "Max Weber", "Karl Marx", "M.N. Srinivas", "Talcott Parsons", "André Béteille",
    "Robert K. Merton", "G.S. Ghurye", "A.R. Desai", "Yogendra Singh", "Louis Dumont", "B.R. Ambedkar",
  ];

  return (
    <section id="top" className="p-2 sm:p-3">
      <div className="grain relative isolate overflow-hidden rounded-[28px] bg-ink text-white sm:rounded-[36px]">
        {/* Ambient light */}
        <div aria-hidden className="grid-lines absolute inset-0 -z-10" />
        <div aria-hidden className="absolute -left-40 -top-40 -z-10 size-[620px] rounded-full bg-white/[0.07] blur-[120px]" />
        <div aria-hidden className="absolute -bottom-56 right-[-10%] -z-10 size-[720px] rounded-full bg-neutral-400/[0.10] blur-[140px]" />
        <div aria-hidden className="absolute right-[18%] top-[22%] -z-10 size-72 rounded-full bg-white/[0.06] blur-3xl" />

        <div className="mx-auto grid max-w-7xl gap-14 px-6 pb-10 pt-32 sm:px-10 md:pt-40 lg:grid-cols-[1.15fr_1fr] lg:gap-8 lg:px-14 lg:pb-14">
          {/* Copy */}
          <div className="flex flex-col justify-center">
            <div className="animate-rise mb-7 w-fit">
              <SyncStatus ds={ds} tone="dark" />
            </div>

            <h1 className="animate-rise font-display text-[clamp(2.6rem,5.2vw,4.9rem)] font-bold leading-[0.98] tracking-[-0.035em] [animation-delay:80ms]">
              Every topper&rsquo;s
              <br />
              answer, one
              <br />
              <span className="bg-gradient-to-r from-white via-neutral-300 to-neutral-500 bg-clip-text text-transparent">
                search away.
              </span>
            </h1>

            <p className="animate-rise mt-7 max-w-xl text-lg leading-relaxed text-white/65 [animation-delay:160ms] sm:text-xl">
              UPSC Sociology Optional answer copies — indexed by question, thinker, syllabus topic and rank. Find how the
              best wrote it, then open the exact page.
            </p>

            <p className="animate-rise mt-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40 [animation-delay:220ms]">
              No install · No scripts · Live from the sheet
            </p>

            <div className="animate-rise mt-9 flex flex-wrap items-center gap-3 [animation-delay:280ms]">
              <button
                type="button"
                onClick={onExplore}
                className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-[15px] font-semibold text-ink shadow-[0_10px_30px_-10px_rgba(255,255,255,0.5)] transition-all hover:gap-3 hover:shadow-[0_16px_40px_-10px_rgba(255,255,255,0.6)]"
              >
                Start exploring
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <a
                href="#toppers"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-4 text-[15px] font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/5"
              >
                Browse toppers
              </a>
            </div>

            <div className="animate-rise mt-10 flex flex-wrap items-center gap-2 [animation-delay:340ms]">
              <span className="mr-1 text-xs text-white/40">Try</span>
              {QUICK.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => onSearch(q)}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[13px] text-white/70 transition-all hover:border-white/30 hover:bg-white/10 hover:text-white"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Visual: floating answer sheets */}
          <div className="relative hidden min-h-[520px] lg:block" aria-hidden>
            <SheetCard s={samples[0]} className="left-[2%] top-[4%] [--r:-7deg] [animation-delay:0s]" dim />
            <SheetCard s={samples[1]} className="right-[0%] top-[18%] [--r:6deg] [animation-delay:-2.4s]" dim />
            <SheetCard s={samples[2]} className="left-[14%] top-[40%] z-10 [--r:-1.5deg] [animation-delay:-4.6s]" />

            <div className="animate-float absolute bottom-[6%] right-[6%] z-20 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-xl [animation-delay:-1s]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">Most cited</p>
              <p className="mt-1 font-display text-lg font-bold">{thinkers[0]}</p>
            </div>
          </div>
        </div>

        {/* Thinker marquee */}
        <div className="relative border-t border-white/10 py-5 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <div className="animate-marquee flex w-max gap-10 whitespace-nowrap">
            {[...thinkers, ...thinkers].map((t, i) => (
              <span key={i} className="flex items-center gap-10 font-display text-lg text-white/35">
                {t}
                <span className="size-1.5 rounded-full bg-white/25" />
              </span>
            ))}
          </div>
        </div>

        <a
          href="#stats"
          aria-label="Scroll down"
          className="absolute bottom-24 left-1/2 hidden size-10 -translate-x-1/2 place-items-center rounded-full border border-white/15 text-white/50 transition-colors hover:text-white md:grid lg:hidden"
        >
          <ArrowDown className="size-4" />
        </a>
      </div>
    </section>
  );
}

function SheetCard({
  s,
  className = "",
  dim = false,
}: {
  s: Pick<Row, "qLabel" | "question" | "topper" | "air" | "section">;
  className?: string;
  dim?: boolean;
}) {
  return (
    <div
      className={`animate-float absolute w-[340px] rounded-[22px] bg-paper p-5 text-ink shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] ${
        dim ? "opacity-[0.55] blur-[0.5px]" : ""
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold tracking-wide text-white">
          AIR {s.air}
        </span>
        <span className="font-mono text-[11px] text-ink/40">{s.qLabel}</span>
      </div>
      <p className="mt-4 font-display text-[15px] font-bold leading-snug">{s.question}</p>
      <div className="ruled mt-4 h-24 rounded-md" />
      <div className="mt-3 flex items-center justify-between text-[11px] text-ink/50">
        <span className="font-semibold text-ink/70">{s.topper}</span>
        <span className="max-w-[55%] truncate">{s.section}</span>
      </div>
    </div>
  );
}
