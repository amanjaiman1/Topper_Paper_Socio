"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Check, ChevronRight, Copy, Loader2, RotateCw, X } from "lucide-react";
import { driveViewUrl } from "@/lib/dataset";
import { recheckBlocked, resolveLink, useLinkProgress, useLinksSettled } from "@/lib/driveHealth";
import { useDriveFiles } from "./driveContext";

/** Lists answer copies whose Drive link isn't publicly viewable, so the owner can fix sharing. */
export default function LinkHealth({ open, onClose }: { open: boolean; onClose: () => void }) {
  const files = useDriveFiles();
  const settled = useLinksSettled();
  const progress = useLinkProgress();
  const [copied, setCopied] = useState(false);

  const summary = useMemo(() => {
    void settled;
    let ok = 0;
    let unknown = 0;
    const blocked: { name: string; topper: string; rows: number; id: string }[] = [];
    for (const f of files.values()) {
      const r = resolveLink(f.ids);
      if (r.status === "ok") ok++;
      else if (r.status === "unknown") unknown++;
      else blocked.push({ name: f.name, topper: f.topper, rows: f.rows, id: r.id });
    }
    blocked.sort((a, b) => a.topper.localeCompare(b.topper) || a.name.localeCompare(b.name));
    return { ok, unknown, blocked, total: files.size, pages: blocked.reduce((n, b) => n + b.rows, 0) };
  }, [files, settled]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const copy = async () => {
    const tsv = [
      "File name\tTopper\tIndexed pages\tDrive link",
      ...summary.blocked.map((b) => `${b.name}\t${b.topper}\t${b.rows}\t${driveViewUrl(b.id)}`),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(tsv);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-3" role="dialog" aria-modal="true" aria-label="Drive link health">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] bg-paper shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-black/[0.06] bg-white px-6 py-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-copy/40">Drive link health</p>
            <h2 className="mt-1.5 font-display text-2xl font-bold tracking-[-0.02em]">
              {summary.ok} of {summary.total} copies are viewable
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-ink/5 transition-colors hover:bg-ink hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-3 gap-2 text-center">
            <Count n={summary.ok} label="Viewable" dark />
            <Count n={summary.blocked.length} label="Not shared" />
            <Count n={summary.unknown} label="Not checked yet" />
          </div>

          <p className="mt-5 text-[14px] leading-relaxed text-copy/60">
            For logged-out visitors, Google Drive treats these files as missing (&ldquo;Sorry, the file you have requested
            does not exist&rdquo;). That usually means the owner restricted sharing or removed them. They cover{" "}
            <b className="text-copy">{summary.pages.toLocaleString("en-IN")}</b> indexed pages. To fix one, open it while
            signed in as the owner and set{" "}
            <b className="text-copy">
              Share <ChevronRight className="inline size-3.5 align-[-2px]" /> General access{" "}
              <ChevronRight className="inline size-3.5 align-[-2px]" /> Anyone with the link
            </b>
            . This site picks up the change automatically.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copy}
              disabled={!summary.blocked.length}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-[13px] font-semibold text-white transition-transform hover:scale-[1.03] disabled:opacity-40"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy list (paste into a sheet)"}
            </button>
            <button
              type="button"
              onClick={recheckBlocked}
              disabled={progress.checking || !summary.blocked.length}
              className="inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-white px-4 py-2.5 text-[13px] font-semibold text-copy/70 transition-colors hover:border-ink hover:text-copy disabled:opacity-40"
            >
              {progress.checking ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCw className="size-3.5" />}
              {progress.checking ? `Checking ${progress.done}/${progress.total}` : "Re-check now"}
            </button>
          </div>

          <ul className="mt-5 divide-y divide-black/[0.06] overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
            {summary.blocked.map((b) => (
              <li key={b.name} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium">{b.name}</p>
                  <p className="text-[12px] text-copy/45">
                    {b.topper} · {b.rows} indexed {b.rows === 1 ? "page" : "pages"}
                  </p>
                </div>
                <a
                  href={driveViewUrl(b.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-semibold text-copy/55 transition-colors hover:bg-ink/5 hover:text-copy"
                >
                  Drive <ArrowUpRight className="size-3" />
                </a>
              </li>
            ))}
            {!summary.blocked.length && (
              <li className="px-4 py-8 text-center text-[14px] text-copy/50">
                {summary.unknown ? "Still checking…" : "Every copy is publicly viewable."}
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Count({ n, label, dark = false }: { n: number; label: string; dark?: boolean }) {
  return (
    <div className={`rounded-2xl px-3 py-4 ${dark ? "bg-ink text-white" : "border border-black/[0.06] bg-white"}`}>
      <p className="font-display text-3xl font-bold tabular-nums tracking-[-0.03em]">{n}</p>
      <p className={`mt-1 text-[12px] ${dark ? "text-white/60" : "text-copy/50"}`}>{label}</p>
    </div>
  );
}
