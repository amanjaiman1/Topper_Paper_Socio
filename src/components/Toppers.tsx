"use client";

import { useMemo, useState } from "react";
import { ArrowRight, EyeOff, Search } from "lucide-react";
import { resolveLink, useLinksSettled } from "@/lib/driveHealth";
import { UNATTRIBUTED } from "@/lib/dataset";
import type { Dataset } from "@/lib/types";
import { useDriveFiles } from "./driveContext";
import { Avatar } from "./ui";

const INITIAL = 12;

export default function Toppers({ data, onPick }: { data: Dataset | null; onPick: (key: string) => void }) {
  const [q, setQ] = useState("");
  const [all, setAll] = useState(false);

  const list = useMemo(() => {
    const t = (data?.toppers ?? []).filter((t) => t.key !== UNATTRIBUTED);
    const s = q.trim().toLowerCase();
    return s ? t.filter((x) => `${x.name} ${x.air} ${x.coaching}`.toLowerCase().includes(s)) : t;
  }, [data, q]);
  const shown = all || q ? list : list.slice(0, INITIAL);

  // How many of each topper's copies are publicly viewable on Drive (once checked).
  const files = useDriveFiles();
  const settled = useLinksSettled();
  const viewable = useMemo(() => {
    void settled;
    const m = new Map<string, { ok: number; known: number; total: number }>();
    for (const f of files.values()) {
      const st = resolveLink(f.ids).status;
      const e = m.get(f.topperKey) ?? { ok: 0, known: 0, total: 0 };
      e.total++;
      if (st !== "unknown") e.known++;
      if (st === "ok") e.ok++;
      m.set(f.topperKey, e);
    }
    return m;
  }, [files, settled]);

  return (
    <section id="toppers" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-24 sm:px-10 lg:px-14 lg:py-32">
      <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-ink/45">Toppers</p>
          <h2 className="mt-4 max-w-2xl font-display text-4xl font-bold leading-[1.05] tracking-[-0.03em] sm:text-5xl">
            Learn from the ranks.
          </h2>
          <p className="mt-4 max-w-md text-ink/55">Sorted by All India Rank. Open anyone to filter the archive to just their copies.</p>
        </div>
        <label className="relative w-full md:w-80">
          <span className="sr-only">Find a topper</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink/35" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Find a topper or AIR…"
            className="h-12 w-full rounded-full border border-black/10 bg-white pl-11 pr-4 text-[15px] outline-none transition-shadow placeholder:text-ink/35 focus:ring-2 focus:ring-ink/20"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {!data &&
          Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-[148px] rounded-[24px]" />)}
        {shown.map((t) => {
          const v = viewable.get(t.key);
          const partial = v && v.known === v.total && v.ok < v.total;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onPick(t.key)}
              className="group relative flex flex-col overflow-hidden rounded-[24px] border border-black/[0.06] bg-white p-5 text-left transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:border-ink hover:bg-ink hover:text-white hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]"
            >
              <div className="flex items-start justify-between">
                <Avatar
                  name={t.name}
                  className="size-12 text-[15px] transition-colors group-hover:from-white group-hover:to-neutral-300 group-hover:text-ink"
                />
                {t.air ? (
                  <span className="font-display text-3xl font-bold tracking-[-0.04em] text-ink/15 transition-colors group-hover:text-white/25">
                    #{t.air}
                  </span>
                ) : (
                  <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/25 group-hover:text-white/30">
                    Aspirant
                  </span>
                )}
              </div>
              <p className="mt-5 truncate text-[16px] font-semibold">{t.name}</p>
              <div className="mt-1 flex items-center justify-between text-[13px] text-ink/50 transition-colors group-hover:text-white/60">
                <span className="truncate">
                  {t.rows.toLocaleString("en-IN")} pages · {t.files.length} {t.files.length === 1 ? "copy" : "copies"}
                  {t.coaching ? ` · ${t.coaching}` : ""}
                </span>
                <ArrowRight className="size-4 shrink-0 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </div>
              {partial && (
                <p className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-paper px-2.5 py-1 text-[11px] font-semibold text-ink/50 transition-colors group-hover:bg-white/10 group-hover:text-white/60">
                  <EyeOff className="size-3" />
                  {v.ok === 0 ? "PDFs not publicly shared" : `${v.ok} of ${v.total} copies viewable`}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {data && list.length === 0 && <p className="py-12 text-center text-ink/50">No topper matches &ldquo;{q}&rdquo;.</p>}

      {data && !q && list.length > INITIAL && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setAll((v) => !v)}
            className="rounded-full border border-black/10 bg-white px-7 py-3.5 text-[15px] font-semibold transition-colors hover:border-ink hover:bg-ink hover:text-white"
          >
            {all ? "Show fewer" : `Show all ${list.length} toppers`}
          </button>
        </div>
      )}
    </section>
  );
}
