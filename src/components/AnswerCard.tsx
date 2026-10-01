"use client";

import { memo } from "react";
import { ArrowUpRight, Eye, Shapes } from "lucide-react";
import { driveViewUrl } from "@/lib/dataset";
import type { Row } from "@/lib/types";
import Highlight from "./Highlight";
import { Avatar } from "./ui";

export const headline = (r: Row) =>
  r.question || r.thinkers.find((t) => t.concept)?.concept || r.topic || r.thinkers[0]?.name || "Answer page";

function AnswerCardImpl({ row: r, words, onOpen }: { row: Row; words: string[]; onOpen: (r: Row) => void }) {
  const hasQ = Boolean(r.question);
  const extra = r.thinkers.length - 4;

  return (
    <article
      className="group relative grid cursor-pointer gap-5 rounded-[26px] border border-black/[0.06] bg-white p-5 transition-all duration-500 ease-out-expo hover:-translate-y-0.5 hover:border-black/10 hover:shadow-[0_24px_50px_-24px_rgba(0,0,0,0.25)] sm:p-6 md:grid-cols-[200px_1fr_auto] md:gap-7"
      onClick={() => onOpen(r)}
    >
      {/* Topper */}
      <div className="flex items-start gap-3 md:flex-col md:gap-3">
        <Avatar name={r.topper} className="size-11 text-sm" />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold leading-tight">
            <Highlight text={r.topper} words={words} />
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[12px] text-ink/50">
            {r.air && <span className="rounded-full bg-ink px-2 py-0.5 font-bold text-white">AIR {r.air}</span>}
            {r.coaching && <span>{r.coaching}</span>}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-w-0">
        <div className="mb-2.5 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em]">
          {r.qLabel && <span className="rounded-md bg-paper-2 px-2 py-1 normal-case tracking-normal text-ink">{r.qLabel}</span>}
          {r.paper && <span className="rounded-md border border-black/10 px-2 py-1 text-ink/60">{r.paper}</span>}
          {r.section && r.section !== "Other" && <span className="truncate px-1 py-1 text-ink/40">{r.section}</span>}
        </div>

        <h3
          className={`font-display text-[17px] font-bold leading-snug tracking-[-0.01em] sm:text-lg ${
            hasQ ? "text-ink" : "text-ink/55"
          }`}
        >
          <Highlight text={headline(r)} words={words} />
        </h3>

        {r.intro && (
          <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-ink/55">
            <Highlight text={r.intro} words={words} />
          </p>
        )}

        {(r.thinkers.length > 0 || r.diagram) && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {r.thinkers.slice(0, 4).map((t, i) => (
              <span
                key={i}
                className="inline-flex max-w-full items-center gap-1 truncate rounded-full border border-black/[0.08] bg-paper px-2.5 py-1 text-[12px] text-ink/75"
              >
                <span className="font-semibold">
                  <Highlight text={t.name} words={words} />
                </span>
                {t.concept && (
                  <span className="truncate text-ink/45">
                    · <Highlight text={t.concept} words={words} />
                  </span>
                )}
              </span>
            ))}
            {extra > 0 && <span className="rounded-full px-2 py-1 text-[12px] text-ink/40">+{extra}</span>}
            {r.diagram && (
              <span className="inline-flex max-w-[260px] items-center gap-1.5 truncate rounded-full bg-ink px-2.5 py-1 text-[12px] text-white">
                <Shapes className="size-3 shrink-0" />
                <span className="truncate">{r.diagram}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 md:flex-col md:items-end md:justify-between">
        {r.driveId ? (
          <a
            href={driveViewUrl(r.driveId)}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-ink px-4 py-2.5 text-[13px] font-semibold text-white transition-transform hover:scale-[1.03] active:scale-95"
          >
            {r.page && /^\d+$/.test(r.page) ? `Open · Pg ${r.page}` : "Open PDF"}
            <ArrowUpRight className="size-3.5" />
          </a>
        ) : (
          <span className="text-[13px] text-ink/35">No PDF</span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(r);
          }}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-medium text-ink/45 transition-colors hover:bg-ink/5 group-hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
        >
          <Eye className="size-3.5" /> Preview
        </button>
      </div>
    </article>
  );
}

export default memo(AnswerCardImpl);
