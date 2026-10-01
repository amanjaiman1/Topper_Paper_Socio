"use client";

import { useCallback, useEffect, useState } from "react";
import { useDataset } from "@/lib/useDataset";
import { EMPTY_FILTERS, filtersFromSearch, filtersToSearch, type Filters } from "@/lib/filters";
import type { Row } from "@/lib/types";
import AnswerDrawer from "./AnswerDrawer";
import { DriveFilesProvider } from "./driveContext";
import Explorer from "./Explorer";
import Footer from "./Footer";
import Header from "./Header";
import LinkHealth from "./LinkHealth";

export default function App() {
  const ds = useDataset();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [active, setActive] = useState<Row | null>(null);
  const [healthOpen, setHealthOpen] = useState(false);

  // Restore filters from the URL once on mount, then keep the URL in sync (shareable links).
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setFilters(filtersFromSearch(window.location.search));
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    const url = `${window.location.pathname}${filtersToSearch(filters)}${window.location.hash}`;
    window.history.replaceState(null, "", url);
  }, [filters, hydrated]);

  const update = useCallback((patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch })), []);
  const reset = useCallback(() => setFilters(EMPTY_FILTERS), []);
  const closeDrawer = useCallback(() => setActive(null), []);
  const openHealth = useCallback(() => setHealthOpen(true), []);
  const closeHealth = useCallback(() => setHealthOpen(false), []);

  /** Apply a fresh search (keeps the PDF visibility preference) and bring the results into view. */
  const searchFor = useCallback((patch: Partial<Filters>) => {
    setFilters((f) => ({ ...EMPTY_FILTERS, unshared: f.unshared, ...patch }));
    document.getElementById("explore")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // "/" or ⌘K / Ctrl+K focuses search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        document.getElementById("search")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <DriveFilesProvider data={ds.data}>
      <Header ds={ds} onThinker={(q) => searchFor({ q })} onHealth={openHealth} />
      <main>
        <Explorer ds={ds} filters={filters} update={update} reset={reset} onOpen={setActive} onHealth={openHealth} />
      </main>
      <Footer />
      <AnswerDrawer
        row={active}
        onClose={closeDrawer}
        onTopper={(topper) => {
          setActive(null);
          searchFor({ topper });
        }}
        query={filters.q}
      />
      <LinkHealth open={healthOpen} onClose={closeHealth} />
    </DriveFilesProvider>
  );
}
