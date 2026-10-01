"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, BookOpen, EyeOff, Loader2, Shapes, X } from "lucide-react";
import { drivePreviewUrl, driveViewUrl } from "@/lib/dataset";
import { queryWords } from "@/lib/filters";
import type { Row } from "@/lib/types";
import { headline } from "./AnswerCard";
import { useRowLink } from "./driveContext";
import Highlight from "./Highlight";
import { Avatar } from "./ui";

export default function AnswerDrawer({
  row,
  onClose,
  onTopper,
  query,
}: {
  row: Row | null;
  onClose: () => void;
  onTopper: (topperKey: string) => void;
  query: string;
}) {
  // Keep the last row around during the exit animation.
  const [shown, setShown] = useState<Row | null>(row);
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (row) {
      setShown(row);
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
            <p className="flex flex-wrap items-center gap-x-2 text-[13px] text-copy/50">
              {r.air && <span className="font-semibold text-copy">AIR {r.air}</span>}
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
            className="grid size-10 place-items-center rounded-full bg-ink/5 transition-colors hover:bg-ink hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 px-5 py-6 sm:px-7">
            <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em]">
              {r.qLabel && <span className="rounded-md bg-ink px-2 py-1 normal-case tracking-normal text-white">{r.qLabel}</span>}
              {r.paper && <span className="rounded-md border border-black/10 bg-white px-2 py-1 text-copy/60">{r.paper}</span>}
              {r.section && r.section !== "Other" && (
                <span className="rounded-md border border-black/10 bg-white px-2 py-1 text-copy/60">{r.section}</span>
              )}
            </div>

            <h2 className="font-display text-2xl font-bold leading-tight tracking-[-0.02em] sm:text-[28px]">
              <Highlight text={headline(r)} words={words} />
            </h2>

            {r.intro && (
              <div>
                <Label>How they opened</Label>
                <p className="mt-2 border-l-2 border-ink pl-4 text-[15px] leading-relaxed text-copy/75">
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
                      {t.concept && <span className="text-copy/50"> · {t.concept}</span>}
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
                  <p className="mt-2 text-[14px] leading-relaxed text-copy/70">{r.topic}</p>
                </div>
              )}
            </div>
          </div>

          {/* PDF preview */}
          <PdfPreview key={r.id} row={r} page={page} onTopper={onTopper} />
        </div>
      </aside>
    </div>
  );
}

function PdfPreview({ row: r, page, onTopper }: { row: Row; page: string; onTopper: (key: string) => void }) {
  const link = useRowLink(r, true);
  const [frameLoaded, setFrameLoaded] = useState(false);
  // If the availability check is slow, stop waiting and just try the preview.
  const [waited, setWaited] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setWaited(true), 3500);
    return () => clearTimeout(t);
  }, []);

  if (!link.hasPdf) return null;
  const blocked = link.status === "blocked";
  const showFrame = link.status === "ok" || (link.status === "unknown" && waited);

  return (
    <div className="px-3 pb-3 sm:px-4 sm:pb-4">
      <div className="overflow-hidden rounded-[22px] border border-black/[0.06] bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-black/[0.06] px-4 py-3">
          <p className="truncate text-[13px] text-copy/55">
            {page ? (
              <>
                Answer is on <span className="font-semibold text-copy">page {page}</span> of this copy
              </>
            ) : (
              r.file
            )}
          </p>
          {!blocked && (
            <a
              href={driveViewUrl(link.id)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[13px] font-semibold text-white transition-transform hover:scale-[1.03]"
            >
              Open in Drive <ArrowUpRight className="size-3.5" />
            </a>
          )}
        </div>

        {blocked ? (
          <div className="grid place-items-center px-6 py-16 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-ink text-white">
              <EyeOff className="size-6" />
            </span>
            <p className="mt-5 font-display text-xl font-bold tracking-[-0.01em]">This answer copy isn&rsquo;t publicly shared</p>
            <p className="mt-2 max-w-md text-[14px] leading-relaxed text-copy/55">
              Google Drive won&rsquo;t show this PDF to visitors. Its owner has restricted access or removed it, so it
              can&rsquo;t be previewed here. The question, opening and thinkers above still come from the index.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {r.topperKey && (
                <button
                  type="button"
                  onClick={() => onTopper(r.topperKey)}
                  className="rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-white transition-transform hover:scale-[1.03]"
                >
                  More from {r.topper}
                </button>
              )}
              <a
                href={driveViewUrl(link.id)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-black/15 px-5 py-2.5 text-[13px] font-semibold text-copy/70 transition-colors hover:border-ink hover:text-copy"
              >
                Try in Drive anyway <ArrowUpRight className="size-3.5" />
              </a>
            </div>
            <p className="mt-4 text-[12px] text-copy/40">&ldquo;Try anyway&rdquo; only works if your Google account has been given access.</p>
          </div>
        ) : (
          <div className="relative h-[72vh] bg-paper-2">
            {(!showFrame || !frameLoaded) && (
              <div className="absolute inset-0 grid place-items-center text-copy/40">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="size-6 animate-spin" />
                  {!showFrame && <p className="text-[13px]">Checking this copy on Google Drive…</p>}
                </div>
              </div>
            )}
            {showFrame && (
              <iframe
                key={link.id}
                src={drivePreviewUrl(link.id)}
                title={`Answer copy — ${r.topper}`}
                className="relative size-full"
                allow="autoplay"
                onLoad={() => setFrameLoaded(true)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Label({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${dark ? "text-white/50" : "text-copy/40"}`}>
      {children}
    </p>
  );
}
