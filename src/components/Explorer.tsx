"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Check, EyeOff, Link2, Loader2, RotateCcw, Search, X } from "lucide-react";
import { useLinkProgress } from "@/lib/driveHealth";
import { activeFilterCount, applyFilters, queryWords, type Filters, type SortKey } from "@/lib/filters";
import { SECTION_ORDER } from "@/lib/syllabus";
import type { DatasetState } from "@/lib/useDataset";
import type { Row } from "@/lib/types";
import AnswerCard from "./AnswerCard";
import { useBlockedFiles } from "./driveContext";
import { Segmented, Select, Toggle } from "./ui";

const PAGE = 40;
/** Auto-load (infinite scroll) up to this many cards, then require a click so the page below stays reachable. */
const AUTO_LIMIT = 160;

export default function Explorer({
  ds,
  filters,
  update,
  reset,
  onOpen,
  onHealth,
}: {
  ds: DatasetState;
  filters: Filters;
  update: (p: Partial<Filters>) => void;
  reset: () => void;
  onOpen: (r: Row) => void;
  onHealth: () => void;
}) {
  const data = ds.data;
  const deferred = useDeferredValue(filters);
  const blocked = useBlockedFiles();
  const progress = useLinkProgress();
  const { rows: results, hidden } = useMemo(
    () => (data ? applyFilters(data.rows, deferred, blocked) : { rows: [] as Row[], hidden: 0 }),
    [data, deferred, blocked],
  );
  const words = useMemo(() => queryWords(deferred.q), [deferred.q]);
  const stale = deferred !== filters;

  // Batched rendering — grows as the sentinel scrolls into view.
  const [limit, setLimit] = useState(PAGE);
  useEffect(() => setLimit(PAGE), [results]);
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setLimit((l) => (l < AUTO_LIMIT ? Math.min(l + PAGE, results.length) : l)),
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [results.length]);

  const sectionsByPaper = useMemo(() => {
    const out: Record<"Paper I" | "Paper II", { name: string; count: number }[]> = { "Paper I": [], "Paper II": [] };
    for (const s of data?.sections ?? []) out[s.paper].push(s);
    for (const p of ["Paper I", "Paper II"] as const)
      out[p].sort((a, b) => SECTION_ORDER[p].indexOf(a.name) - SECTION_ORDER[p].indexOf(b.name));
    return out;
  }, [data]);

  const nActive = activeFilterCount(filters);
  const [copied, setCopied] = useState(false);
  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <section id="explore" aria-label="Search answers" className="scroll-mt-2 px-2 sm:px-3">
      <div className="pb-10 pt-1">
        <div className="mx-auto max-w-6xl sm:px-5">
          {/* Toolbar */}
          <div className="sticky top-2 z-30 -mt-1 mb-5 rounded-[24px] border border-black/[0.07] bg-white/90 p-2.5 shadow-[0_18px_44px_-28px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:top-3 sm:p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-copy/35" />
              <input
                id="search"
                type="search"
                value={filters.q}
                onChange={(e) => update({ q: e.target.value })}
                placeholder="Search questions, thinkers, topics, toppers…"
                autoComplete="off"
                spellCheck={false}
                className="h-14 w-full rounded-[18px] bg-paper pl-14 pr-12 sm:pr-24 text-[16px] font-medium text-copy outline-none ring-accent/35 transition-shadow placeholder:text-copy/40 focus:bg-white focus:ring-2 [&::-webkit-search-cancel-button]:hidden"
              />
              <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
                {filters.q ? (
                  <button
                    type="button"
                    onClick={() => update({ q: "" })}
                    aria-label="Clear search"
                    className="grid size-8 place-items-center rounded-full bg-ink/5 text-copy/60 transition-colors hover:bg-ink hover:text-white"
                  >
                    <X className="size-4" />
                  </button>
                ) : (
                  <kbd className="hidden rounded-md border border-black/10 bg-white px-2 py-0.5 font-sans text-[12px] text-copy/40 sm:block">
                    /
                  </kbd>
                )}
              </div>
            </div>

            <div className="no-scrollbar mt-2.5 flex items-center gap-2 overflow-x-auto pb-0.5 lg:flex-wrap lg:overflow-visible">
              <Segmented
                label="Paper"
                value={filters.paper}
                onChange={(paper) => update({ paper, section: "" })}
                options={[
                  { value: "", label: "All" },
                  { value: "Paper I", label: "Paper I" },
                  { value: "Paper II", label: "Paper II" },
                ]}
              />
              <Select
                label="Syllabus section"
                className="w-[200px] shrink-0"
                value={filters.section}
                onChange={(e) => update({ section: e.target.value })}
              >
                <option value="">All sections</option>
                {(["Paper I", "Paper II"] as const)
                  .filter((p) => !filters.paper || filters.paper === p)
                  .map((p) => (
                    <optgroup key={p} label={p}>
                      {sectionsByPaper[p].map((s) => (
                        <option key={p + s.name} value={s.name}>
                          {s.name} ({s.count})
                        </option>
                      ))}
                    </optgroup>
                  ))}
              </Select>
              <Select
                label="Topper"
                className="w-[190px] shrink-0"
                value={filters.topper}
                onChange={(e) => update({ topper: e.target.value })}
              >
                <option value="">All toppers</option>
                {data?.toppers.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.air ? `AIR ${t.air} · ` : ""}
                    {t.name}
                  </option>
                ))}
              </Select>
              <Toggle on={filters.onlyQ} onChange={(onlyQ) => update({ onlyQ })}>
                Questions only
              </Toggle>
              <Toggle on={filters.onlyD} onChange={(onlyD) => update({ onlyD })}>
                Has diagram
              </Toggle>
            </div>
          </div>

          {/* Count */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-1">
            <p className={`text-[14px] text-copy/55 transition-opacity ${stale ? "opacity-50" : ""}`} aria-live="polite">
              {data ? (
                <>
                  <span className="font-semibold text-copy">{results.length.toLocaleString("en-IN")}</span> of{" "}
                  {data.rows.length.toLocaleString("en-IN")} answer pages
                </>
              ) : (
                "Loading the archive…"
              )}
            </p>
            <div className="flex items-center gap-3">
              <Select
                label="Sort"
                size="sm"
                className="w-[132px] shrink-0"
                value={filters.sort === "default" ? "" : filters.sort}
                onChange={(e) => update({ sort: (e.target.value || "default") as SortKey })}
              >
                <option value="">Relevance</option>
                <option value="air">Best rank</option>
                <option value="topper">Topper A–Z</option>
                <option value="page">Page no.</option>
              </Select>
            {nActive > 0 && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={share}
                  className="hidden items-center gap-1.5 text-[13px] font-medium text-copy/55 transition-colors hover:text-copy sm:inline-flex"
                >
                  {copied ? <Check className="size-3.5" /> : <Link2 className="size-3.5" />}
                  {copied ? "Link copied" : "Copy link"}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-[13px] font-semibold text-white transition-transform hover:scale-[1.03]"
                >
                  <RotateCcw className="size-3.5" /> Reset {nActive > 1 ? `(${nActive})` : ""}
                </button>
              </div>
            )}
            </div>
          </div>

          {/* Drive link health */}
          {data && progress.checking && progress.total > 20 ? (
            <Banner>
              <Loader2 className="size-4 shrink-0 animate-spin" />
              <span>
                Checking which answer copies are publicly viewable on Google Drive…{" "}
                <span className="tabular-nums text-copy/40">
                  {progress.done}/{progress.total}
                </span>
              </span>
            </Banner>
          ) : data && hidden > 0 && !filters.unshared ? (
            <Banner>
              <EyeOff className="size-4 shrink-0" />
              <span className="min-w-0 flex-1 basis-[220px]">
                Hiding <b className="font-semibold text-copy">{hidden.toLocaleString("en-IN")}</b> matching pages whose PDF
                isn&rsquo;t publicly shared on Google Drive.
              </span>
              <span className="flex shrink-0 gap-3">
                <button type="button" onClick={() => update({ unshared: true })} className="font-semibold text-copy underline-offset-4 hover:underline">
                  Show them
                </button>
                <button type="button" onClick={onHealth} className="font-semibold text-copy/60 underline-offset-4 hover:text-copy hover:underline">
                  Which copies?
                </button>
              </span>
            </Banner>
          ) : data && filters.unshared && blocked.size > 0 ? (
            <Banner>
              <EyeOff className="size-4 shrink-0" />
              <span className="min-w-0 flex-1 basis-[220px]">Including pages whose PDF isn&rsquo;t publicly shared — their links won&rsquo;t open.</span>
              <button type="button" onClick={() => update({ unshared: false })} className="shrink-0 font-semibold text-copy underline-offset-4 hover:underline">
                Hide them
              </button>
            </Banner>
          ) : null}

          {/* Results */}
          {!data && !ds.error && <Skeletons />}
          {!data && ds.error && (
            <div className="grid place-items-center rounded-[26px] border border-black/[0.06] bg-white px-6 py-20 text-center">
              <AlertCircle className="size-8 text-copy/40" />
              <p className="mt-4 font-display text-xl font-bold">Couldn&rsquo;t reach Google Sheets</p>
              <p className="mt-2 max-w-md text-copy/55">{ds.error}. Check your connection and try again.</p>
              <button
                type="button"
                onClick={ds.refresh}
                className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white"
              >
                Try again
              </button>
            </div>
          )}
          {data && results.length === 0 && hidden > 0 && (
            <div className="grid place-items-center rounded-[26px] border border-dashed border-black/15 px-6 py-20 text-center">
              <p className="font-display text-2xl font-bold">No viewable copies for this search.</p>
              <p className="mt-2 max-w-md text-copy/55">
                {hidden.toLocaleString("en-IN")} matching {hidden === 1 ? "page points" : "pages point"} to PDFs that
                aren&rsquo;t publicly shared on Google Drive.
              </p>
              <button
                type="button"
                onClick={() => update({ unshared: true })}
                className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white"
              >
                Show them anyway
              </button>
            </div>
          )}
          {data && results.length === 0 && hidden === 0 && (
            <div className="grid place-items-center rounded-[26px] border border-dashed border-black/15 px-6 py-20 text-center">
              <p className="font-display text-2xl font-bold">Nothing matches — yet.</p>
              <p className="mt-2 max-w-md text-copy/55">Try fewer words, a thinker&rsquo;s surname, or clear a filter.</p>
              <button
                type="button"
                onClick={reset}
                className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white"
              >
                Clear all filters
              </button>
            </div>
          )}
          {data && results.length > 0 && (
            <div className={`grid grid-cols-[minmax(0,1fr)] gap-3 transition-opacity ${stale ? "opacity-60" : ""}`}>
              {results.slice(0, limit).map((r) => (
                <AnswerCard key={r.id} row={r} words={words} onOpen={onOpen} />
              ))}
            </div>
          )}
          <div ref={sentinel} aria-hidden className="h-px" />
          {data && limit < results.length && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setLimit((l) => l + PAGE * 2)}
                className="rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold transition-colors hover:border-ink"
              >
                Show more ({(results.length - limit).toLocaleString("en-IN")} left)
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Banner({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-black/[0.06] bg-white px-4 py-3 text-[13px] text-copy/60">
      {children}
    </div>
  );
}

function Skeletons() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="grid gap-6 rounded-[26px] border border-black/[0.06] bg-white p-6 md:grid-cols-[200px_1fr_auto]"
        >
          <div className="flex items-center gap-3 md:flex-col md:items-start">
            <div className="skeleton size-11 rounded-full" />
            <div className="skeleton h-4 w-28 rounded-full" />
          </div>
          <div className="space-y-3">
            <div className="skeleton h-4 w-24 rounded-full" />
            <div className="skeleton h-5 w-11/12 rounded-full" />
            <div className="skeleton h-4 w-2/3 rounded-full" />
          </div>
          <div className="skeleton h-10 w-32 rounded-full" />
        </div>
      ))}
    </div>
  );
}
