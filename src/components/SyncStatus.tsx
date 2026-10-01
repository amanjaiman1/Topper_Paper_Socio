"use client";

import { useEffect, useState } from "react";
import { RotateCw } from "lucide-react";
import type { DatasetState } from "@/lib/useDataset";

const ago = (t: number) => {
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
};

export default function SyncStatus({ ds, tone = "light" }: { ds: DatasetState; tone?: "light" | "dark" }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const dark = tone === "dark";
  let label: string;
  let dot = "bg-emerald-400";
  if (ds.syncing && ds.progress) {
    const mb = (ds.progress.loaded / 1e6).toFixed(1);
    label = ds.progress.loaded > 0 ? `${ds.progress.label} · ${mb} MB` : ds.progress.label;
    dot = "bg-amber-400 animate-pulse";
  } else if (ds.syncing) {
    label = ds.data ? "Showing saved copy · syncing…" : "Connecting…";
    dot = "bg-amber-400 animate-pulse";
  } else if (ds.error) {
    label = ds.data ? "Offline · showing saved copy" : "Couldn't reach Google Sheets";
    dot = "bg-red-400";
  } else {
    label = ds.data ? `Live · synced ${ago(ds.data.fetchedAt)}` : "Ready";
  }

  return (
    <div
      className={`inline-flex items-center gap-2.5 rounded-full border py-1.5 pl-3 pr-1.5 text-[12px] font-medium ${
        dark ? "border-white/15 bg-white/[0.06] text-white/75" : "border-black/10 bg-white text-ink/70"
      }`}
      role="status"
      aria-live="polite"
    >
      <span className={`size-2 rounded-full ${dot}`} />
      <span>{label}</span>
      <button
        type="button"
        onClick={ds.refresh}
        disabled={ds.syncing}
        aria-label="Re-sync from Google Sheets"
        title="Re-sync from Google Sheets"
        className={`grid size-6 place-items-center rounded-full transition-colors disabled:opacity-40 ${
          dark ? "hover:bg-white/10" : "hover:bg-black/5"
        }`}
      >
        <RotateCw className={`size-3.5 ${ds.syncing ? "animate-spin" : ""}`} />
      </button>
    </div>
  );
}
