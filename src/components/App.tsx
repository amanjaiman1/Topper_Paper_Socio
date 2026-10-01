"use client";

import { useCallback, useEffect, useState } from "react";
import { useDataset } from "@/lib/useDataset";
import { EMPTY_FILTERS, filtersFromSearch, filtersToSearch, type Filters } from "@/lib/filters";
import type { Row } from "@/lib/types";
import Nav from "./Nav";
import Hero from "./Hero";
import Stats from "./Stats";
import Explorer from "./Explorer";
import Thinkers from "./Thinkers";
import Toppers from "./Toppers";
import Footer from "./Footer";
import AnswerDrawer from "./AnswerDrawer";

export default function App() {
  const ds = useDataset();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [active, setActive] = useState<Row | null>(null);

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

  const jumpToExplorer = useCallback((patch?: Partial<Filters>, focus = false) => {
    if (patch) setFilters({ ...EMPTY_FILTERS, ...patch });
    document.getElementById("explore")?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (focus) setTimeout(() => document.getElementById("search")?.focus({ preventScroll: true }), 450);
  }, []);

  // Global shortcuts: "/" or ⌘K focuses search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        jumpToExplorer(undefined, true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [jumpToExplorer]);

  return (
    <>
      <Nav onSearch={() => jumpToExplorer(undefined, true)} />
      <main>
        <Hero ds={ds} onExplore={() => jumpToExplorer(undefined, true)} onSearch={(q) => jumpToExplorer({ q, onlyQ: true })} />
        <Stats data={ds.data} />
        <Explorer ds={ds} filters={filters} update={update} reset={() => setFilters(EMPTY_FILTERS)} onOpen={setActive} />
        <Thinkers data={ds.data} onPick={(q) => jumpToExplorer({ q })} />
        <Toppers data={ds.data} onPick={(topper) => jumpToExplorer({ topper })} />
      </main>
      <Footer onExplore={() => jumpToExplorer(undefined, true)} />
      <AnswerDrawer row={active} onClose={() => setActive(null)} query={filters.q} />
    </>
  );
}
