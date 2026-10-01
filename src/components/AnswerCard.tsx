"use client";

import { memo } from "react";
import { ArrowUpRight, Eye, EyeOff, Shapes } from "lucide-react";
import { driveViewUrl } from "@/lib/dataset";
import type { Row } from "@/lib/types";
import { useRowLink } from "./driveContext";
import Highlight from "./Highlight";

export const headline = (r: Row) =>
  r.question || r.thinkers.find((t) => t.concept)?.concept || r.topic || r.thinkers[0]?.name || "Answer page";

function AnswerCardImpl({ row: r, words, onOpen }: { row: Row; words: string[]; onOpen: (r: Row) => void }) {
  const hasQ = Boolean(r.question);
  const extra = r.thinkers.length - 4;
  const link = useRowLink(r, true);
  const pageLabel = r.page && /^\d+$/.test(r.page) ? `Open · Pg ${r.page}` : "Open PDF";
  const open = () => onOpen(r);

  return (
    <article
      onClick={open}
      className="group flex min-w-0 cursor-pointer flex-col gap-4 rounded-[22px] border border-black/[0.07] bg-white p-5 transition-all duration-300 ease-out-expo hover:border-black/15 hover:shadow-[0_18px_40px_-26px_rgba(0,0,0,0.3)] sm:flex-row sm:items-start sm:gap-6 sm:p-6"
    >
      <div className="min-w-0 flex-1">
        {/* Meta line */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[13px] text-copy/50">
          {r.air && <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-bold text-white">AIR {r.air}</span>}
          <span className="font-semibold text-copy">
            <Highlight text={r.topper} words={words} />
          </span>
          {r.coaching && <span>{r.coaching}</span>}
          {(r.qLabel || r.paper || (r.section && r.section !== "Other")) && <span className="text-copy/25">/</span>}
          {r.qLabel && <span className="font-semibold text-copy/80">{r.qLabel}</span>}
          {r.paper && <span>{r.paper}</span>}
          {r.section && r.section !== "Other" && <span className="min-w-0 max-w-full truncate">· {r.section}</span>}
        </div>

        <h3
          className={`mt-2.5 font-display text-[17px] font-bold leading-snug tracking-[-0.01em] ${
            hasQ ? "text-copy" : "text-copy/55"
          }`}
        >
          <Highlight text={headline(r)} words={words} />
        </h3>

        {r.intro && (
          <p className="mt-1.5 line-clamp-2 text-[14px] leading-relaxed text-copy/60">
            <Highlight text={r.intro} words={words} />
          </p>
        )}

        {(r.thinkers.length > 0 || r.diagram) && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {r.thinkers.slice(0, 4).map((t, i) => (
              <span
                key={i}
                className="inline-flex max-w-full items-center gap-1 truncate rounded-full bg-paper px-2.5 py-1 text-[12px] text-copy/75"
              >
                <span className="font-semibold">
                  <Highlight text={t.name} words={words} />
                </span>
                {t.concept && (
                  <span className="truncate text-copy/45">
                    · <Highlight text={t.concept} words={words} />
                  </span>
                )}
              </span>
            ))}
            {extra > 0 && <span className="px-1.5 py-1 text-[12px] text-copy/40">+{extra}</span>}
            {r.diagram && (
              <span className="inline-flex max-w-[260px] items-center gap-1.5 truncate rounded-full border border-black/10 px-2.5 py-1 text-[12px] text-copy/70">
                <Shapes className="size-3 shrink-0" />
                <span className="truncate">{r.diagram}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
        {!link.hasPdf ? (
          <span className="text-[13px] text-copy/35">No PDF</span>
        ) : link.status === "blocked" ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              open();
            }}
            title="The owner hasn't shared this PDF publicly on Google Drive"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-dashed border-black/20 px-4 py-2.5 text-[13px] font-semibold text-copy/45 transition-colors hover:border-black/40 hover:text-copy/70"
          >
            <EyeOff className="size-3.5" /> PDF not shared
          </button>
        ) : (
          <a
            href={driveViewUrl(link.id)}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-ink px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-accent"
          >
            {pageLabel}
            <ArrowUpRight className="size-3.5" />
          </a>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            open();
          }}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-medium text-copy/45 transition-colors hover:bg-black/5 hover:text-copy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <Eye className="size-3.5" /> Preview
        </button>
      </div>
    </article>
  );
}

export default memo(AnswerCardImpl);
