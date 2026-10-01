"use client";

import { ArrowUpRight } from "lucide-react";
import type { Dataset } from "@/lib/types";

export default function Thinkers({ data, onPick }: { data: Dataset | null; onPick: (q: string) => void }) {
  const list = data?.thinkers ?? [];
  const max = list[0]?.count ?? 1;

  return (
    <section id="thinkers" className="scroll-mt-4 p-2 sm:p-3">
      <div className="grain relative isolate overflow-hidden rounded-[28px] bg-ink px-6 py-20 text-white sm:rounded-[36px] sm:px-10 lg:px-14 lg:py-28">
        <div aria-hidden className="absolute -right-40 top-0 -z-10 size-[560px] rounded-full bg-white/[0.06] blur-[120px]" />
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">Who toppers quote</p>
              <h2 className="mt-4 max-w-2xl font-display text-4xl font-bold leading-[1.05] tracking-[-0.03em] sm:text-5xl">
                The thinkers that keep showing up.
              </h2>
            </div>
            <p className="max-w-sm text-white/55">
              Ranked by how often they&rsquo;re cited across every indexed answer. Tap one to see every answer that uses
              them.
            </p>
          </div>

          <div className="mt-14 flex flex-wrap gap-2.5">
            {list.length === 0 &&
              Array.from({ length: 24 }).map((_, i) => (
                <span key={i} className="h-11 animate-pulse rounded-full bg-white/[0.06]" style={{ width: 90 + ((i * 37) % 110) }} />
              ))}
            {list.map((t, i) => {
              const w = t.count / max;
              const size = w > 0.6 ? "text-2xl px-6 py-3.5" : w > 0.25 ? "text-lg px-5 py-3" : w > 0.1 ? "text-base px-4 py-2.5" : "text-sm px-3.5 py-2";
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => onPick(t.key)}
                  className={`group inline-flex items-center gap-2 rounded-full border font-display font-bold transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-ink ${size} ${
                    i < 3 ? "border-white/30 bg-white/10" : "border-white/10 bg-white/[0.03] text-white/80"
                  }`}
                >
                  {t.name}
                  <span className="font-sans text-[11px] font-semibold text-white/40 tabular-nums transition-colors group-hover:text-ink/50">
                    {t.count.toLocaleString("en-IN")}
                  </span>
                  <ArrowUpRight className="-ml-1 size-0 opacity-0 transition-all group-hover:size-3.5 group-hover:opacity-100" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
