"use client";

import { useMemo } from "react";
import { ArrowUpRight, HeartPulse, Sheet } from "lucide-react";
import { REPO_URL, sheetUrl } from "@/lib/dataset";
import { resolveLink, useLinksSettled } from "@/lib/driveHealth";
import type { DatasetState } from "@/lib/useDataset";
import Logo from "./Logo";
import SyncStatus from "./SyncStatus";

const n = (v: number) => v.toLocaleString("en-IN");

export default function Header({
  ds,
  onThinker,
  onHealth,
}: {
  ds: DatasetState;
  onThinker: (q: string) => void;
  onHealth: () => void;
}) {
  const data = ds.data;
  const settled = useLinksSettled();
  const viewable = useMemo(() => {
    void settled;
    return (data?.files ?? []).filter((f) => resolveLink(f.ids).status === "ok").length;
  }, [data, settled]);

  return (
    <header className="p-2 sm:p-3">
      <div className="grain relative isolate overflow-hidden rounded-[24px] bg-ink text-white sm:rounded-[32px]">
        {/* lorolabs-style crimson glow */}
        <div aria-hidden className="absolute -right-24 -top-40 -z-10 size-[520px] rounded-full bg-accent/35 blur-[120px]" />
        <div aria-hidden className="absolute -bottom-48 left-1/4 -z-10 size-[420px] rounded-full bg-accent/15 blur-[120px]" />

        <div className="mx-auto max-w-6xl px-5 pb-8 pt-5 sm:px-8 sm:pb-10 sm:pt-6">
          {/* Top bar */}
          <div className="flex items-center gap-3">
            <Logo className="size-10" />
            <span className="whitespace-nowrap font-display text-[17px] font-bold tracking-[-0.01em]">Socio Top Paper</span>
            <div className="ml-auto flex items-center gap-1.5">
              <IconLink onClick={onHealth} label="Drive link health" icon={<HeartPulse className="size-[18px]" />} />
              <IconLink href={sheetUrl} label="Source Google Sheet" icon={<Sheet className="size-[18px]" />} />
              <IconLink href={REPO_URL} label="GitHub" icon={<ArrowUpRight className="size-[18px]" />} />
            </div>
          </div>

          {/* Title */}
          <h1 className="mt-8 font-display text-[clamp(1.85rem,4vw,3rem)] font-bold leading-[1.06] tracking-[-0.03em] sm:mt-11">
            Sociology topper answer copies
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/65 sm:text-[16px]">
            Search UPSC Sociology Optional answers by question, thinker, syllabus topic or topper, then open the exact page
            of the original copy.
          </p>

          {/* Facts + sync */}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-[13px] text-white/55">
            {data ? (
              <>
                <Fact value={n(data.stats.rows)} label="pages" />
                <Fact value={n(data.stats.questions)} label="questions" />
                <Fact value={n(data.stats.toppers)} label="toppers" />
                <button type="button" onClick={onHealth} className="transition-colors hover:text-white">
                  <Fact value={viewable ? `${viewable}/${data.files.length}` : n(data.files.length)} label="PDFs viewable" />
                </button>
              </>
            ) : (
              <span className="skeleton h-4 w-64 rounded-full opacity-20" />
            )}
            <SyncStatus ds={ds} tone="dark" />
          </div>

          {/* Popular thinkers */}
          {data && data.thinkers.length > 0 && (
            <div className="no-scrollbar -mx-5 mt-6 flex items-center gap-2 overflow-x-auto px-5 sm:-mx-8 sm:px-8 [mask-image:linear-gradient(to_right,black_90%,transparent)]">
              <span className="shrink-0 text-[12px] text-white/40">Popular</span>
              {data.thinkers.slice(0, 12).map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => onThinker(t.key)}
                  className="shrink-0 rounded-full border border-white/12 bg-white/[0.05] px-3.5 py-1.5 text-[13px] text-white/75 transition-colors hover:border-white hover:bg-white hover:text-ink"
                >
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function Fact({ value, label }: { value: string; label: string }) {
  return (
    <span>
      <b className="font-semibold tabular-nums text-white">{value}</b> {label}
    </span>
  );
}

function IconLink({
  href,
  onClick,
  label,
  icon,
}: {
  href?: string;
  onClick?: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  const cls =
    "grid size-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50";
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" aria-label={label} title={label} className={cls}>
      {icon}
    </a>
  ) : (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={cls}>
      {icon}
    </button>
  );
}
