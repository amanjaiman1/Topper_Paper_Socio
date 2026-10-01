"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { resolveLink, useLinkProgress, useLinksSettled } from "@/lib/driveHealth";
import type { Dataset } from "@/lib/types";

function useCountUp(target: number, run: boolean) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run || !target) return;
    let raf = 0;
    const t0 = performance.now();
    const dur = 1400;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setV(Math.round(target * (1 - Math.pow(1 - p, 4))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, run]);
  return v;
}

function Stat({ value, suffix = "", label, note, run }: { value: number; suffix?: string; label: string; note: ReactNode; run: boolean }) {
  const n = useCountUp(value, run);
  return (
    <div className="group relative border-t border-ink/10 pt-6">
      <div className="absolute -top-px left-0 h-px w-0 bg-ink transition-all duration-700 ease-out-expo group-hover:w-full" />
      <p className="font-display text-5xl font-bold tracking-[-0.04em] tabular-nums sm:text-6xl">
        {value ? n.toLocaleString("en-IN") : <span className="skeleton inline-block h-12 w-32 rounded-xl align-middle" />}
        {value ? <span className="text-ink/30">{suffix}</span> : null}
      </p>
      <p className="mt-3 text-[15px] font-semibold">{label}</p>
      <div className="mt-1 text-sm text-ink/50">{note}</div>
    </div>
  );
}

export default function Stats({ data, onHealth }: { data: Dataset | null; onHealth: () => void }) {
  const settled = useLinksSettled();
  const progress = useLinkProgress();
  const health = useMemo(() => {
    void settled;
    let ok = 0;
    let blocked = 0;
    for (const f of data?.files ?? []) {
      const st = resolveLink(f.ids).status;
      if (st === "ok") ok++;
      else if (st === "blocked") blocked++;
    }
    return { ok, blocked };
  }, [data, settled]);

  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const s = data?.stats;
  return (
    <section id="stats" className="mx-auto max-w-7xl px-6 py-24 sm:px-10 lg:px-14 lg:py-32">
      <div className="mb-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-ink/45">The archive, at a glance</p>
          <h2 className="mt-4 max-w-2xl font-display text-4xl font-bold leading-[1.05] tracking-[-0.03em] sm:text-5xl">
            Thousands of answers. Zero setup.
          </h2>
        </div>
        <p className="max-w-sm text-ink/55">
          Pulled straight from the curated Google Sheet every time you open the page — then cached on your device for
          instant reloads.
        </p>
      </div>
      <div ref={ref} className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <Stat run={seen} value={s?.rows ?? 0} label="Indexed answer pages" note="De-duplicated across both sheets" />
        <Stat run={seen} value={s?.questions ?? 0} label="Questions with text" note="Searchable word-for-word" />
        <Stat run={seen} value={s?.toppers ?? 0} suffix="+" label="Toppers & aspirants" note="Ranked by AIR where known" />
        <Stat
          run={seen}
          value={s?.pdfs ?? 0}
          label="Original answer copies"
          note={
            progress.checking && progress.total > 20 ? (
              <>Checking Drive links… {progress.done}/{progress.total}</>
            ) : health.ok + health.blocked > 0 ? (
              <button type="button" onClick={onHealth} className="text-left underline-offset-4 hover:text-ink hover:underline">
                <b className="font-semibold text-ink">{health.ok}</b> publicly viewable
                {health.blocked > 0 && <> · {health.blocked} not shared</>}
              </button>
            ) : (
              "Linked straight to Google Drive"
            )
          }
        />
      </div>
    </section>
  );
}
