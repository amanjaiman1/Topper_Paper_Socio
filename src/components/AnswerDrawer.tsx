"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, BookOpen, Loader2, Shapes, X } from "lucide-react";
import { drivePreviewUrl, driveViewUrl } from "@/lib/dataset";
import { queryWords } from "@/lib/filters";
import type { Row } from "@/lib/types";
import { headline } from "./AnswerCard";
import Highlight from "./Highlight";
import { Avatar } from "./ui";

export default function AnswerDrawer({ row, onClose, query }: { row: Row | null; onClose: () => void; query: string }) {
  // Keep the last row around during the exit animation.
  const [shown, setShown] = useState<Row | null>(row);
  const [open, setOpen] = useState(false);
  const [frameLoaded, setFrameLoaded] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (row) {
      setShown(row);
      setFrameLoaded(false);
      requestAnimationFrame(() => setOpen(true));
    } else {
      setOpen(false);
      const t = setTimeout(() => setShown(null), 450);
      return () => clearTimeout(t);
    }
  }, [row]);

  useEffect(() => {
    if (!row) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    setTimeout(() => closeRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [row, onClose]);

  if (!shown) return null;
  const r = shown;
  const words = queryWords(query);
  const page = r.page && /^\d+$/.test(r.page) ? r.page : "";

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={`Answer by ${r.topper}`}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-ink/50 backdrop-blur-sm transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        className={`absolute inset-y-2 right-2 flex w-[calc(100%-1rem)] max-w-3xl flex-col overflow-hidden rounded-[28px] bg-paper shadow-2xl transition-transform duration-500 ease-out-expo sm:inset-y-3 sm:right-3 ${
          open ? "translate-x-0" : "translate-x-[105%]"
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-black/[0.06] bg-white px-5 py-4 sm:px-7">
          <Avatar name={r.topper} className="size-11 text-sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{r.topper}</p>
            <p className="flex flex-wrap items-center gap-x-2 text-[13px] text-ink/50">
              {r.air && <span className="font-semibold text-ink">AIR {r.air}</span>}
              {r.coaching && <span>{r.coaching}</span>}
              {r.marks && <span>{r.marks} marks</span>}
              {page && <span>Page {page}</span>}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="grid size-10 place-items-center rounded-full bg-ink/5 transition-colors hover:bg-ink hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 px-5 py-6 sm:px-7">
            <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em]">
              {r.qLabel && <span className="rounded-md bg-ink px-2 py-1 normal-case tracking-normal text-white">{r.qLabel}</span>}
              {r.paper && <span className="rounded-md border border-black/10 bg-white px-2 py-1 text-ink/60">{r.paper}</span>}
              {r.section && r.section !== "Other" && (
                <span className="rounded-md border border-black/10 bg-white px-2 py-1 text-ink/60">{r.section}</span>
              )}
            </div>

            <h2 className="font-display text-2xl font-bold leading-tight tracking-[-0.02em] sm:text-[28px]">
              <Highlight text={headline(r)} words={words} />
            </h2>

            {r.intro && (
              <div>
                <Label>How they opened</Label>
                <p className="mt-2 border-l-2 border-ink pl-4 text-[15px] leading-relaxed text-ink/75">
                  <Highlight text={r.intro} words={words} />
                </p>
              </div>
            )}

            {r.thinkers.length > 0 && (
              <div>
                <Label>Thinkers &amp; concepts</Label>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {r.thinkers.map((t, i) => (
                    <span key={i} className="rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-[13px]">
                      <span className="font-semibold">{t.name}</span>
                      {t.concept && <span className="text-ink/50"> · {t.concept}</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {r.diagram && (
                <div className="rounded-2xl bg-ink p-4 text-white">
                  <Label dark>
                    <Shapes className="mr-1 inline size-3" /> Diagram used
                  </Label>
                  <p className="mt-2 text-[14px] leading-relaxed text-white/80">{r.diagram}</p>
                </div>
              )}
              {r.topic && (
                <div className={`rounded-2xl border border-black/[0.06] bg-white p-4 ${r.diagram ? "" : "sm:col-span-2"}`}>
                  <Label>
                    <BookOpen className="mr-1 inline size-3" /> Syllabus
                  </Label>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink/70">{r.topic}</p>
                </div>
              )}
            </div>
          </div>

          {/* PDF preview */}
          {r.driveId && (
            <div className="px-3 pb-3 sm:px-4 sm:pb-4">
              <div className="overflow-hidden rounded-[22px] border border-black/[0.06] bg-white">
                <div className="flex items-center justify-between gap-3 border-b border-black/[0.06] px-4 py-3">
                  <p className="truncate text-[13px] text-ink/55">
                    {page ? (
                      <>
                        Answer is on <span className="font-semibold text-ink">page {page}</span> of this copy
                      </>
                    ) : (
                      r.file
                    )}
                  </p>
                  <a
                    href={driveViewUrl(r.driveId)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[13px] font-semibold text-white transition-transform hover:scale-[1.03]"
                  >
                    Open in Drive <ArrowUpRight className="size-3.5" />
                  </a>
                </div>
                <div className="relative h-[72vh] bg-paper-2">
                  {!frameLoaded && (
                    <div className="absolute inset-0 grid place-items-center text-ink/40">
                      <Loader2 className="size-6 animate-spin" />
                    </div>
                  )}
                  <iframe
                    key={r.driveId}
                    src={drivePreviewUrl(r.driveId)}
                    title={`Answer copy — ${r.topper}`}
                    className="relative size-full"
                    allow="autoplay"
                    loading="lazy"
                    onLoad={() => setFrameLoaded(true)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function Label({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${dark ? "text-white/50" : "text-ink/40"}`}>
      {children}
    </p>
  );
}
