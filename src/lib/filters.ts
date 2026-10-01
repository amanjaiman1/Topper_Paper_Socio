import type { Row } from "./types";

export type SortKey = "default" | "air" | "topper" | "page";

export interface Filters {
  q: string;
  paper: "" | "Paper I" | "Paper II";
  section: string;
  topper: string;
  onlyQ: boolean;
  onlyD: boolean;
  /** Also show pages whose answer-copy PDF isn't publicly viewable on Drive. */
  unshared: boolean;
  sort: SortKey;
}

export const EMPTY_FILTERS: Filters = {
  q: "",
  paper: "",
  section: "",
  topper: "",
  onlyQ: false,
  onlyD: false,
  unshared: false,
  sort: "default",
};

export const queryWords = (q: string) =>
  q
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);

/**
 * @param blockedFiles file names whose PDF is known to be unavailable — hidden unless `f.unshared`.
 * @returns matching rows plus how many matches were hidden because their PDF is unavailable.
 */
export function applyFilters(rows: Row[], f: Filters, blockedFiles?: Set<string>): { rows: Row[]; hidden: number } {
  const words = queryWords(f.q);
  const hideBlocked = !f.unshared && !!blockedFiles?.size;
  const out: Row[] = [];
  let hidden = 0;
  outer: for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (f.onlyQ && !r.question) continue;
    if (f.onlyD && !r.diagram) continue;
    if (f.paper && r.paper !== f.paper) continue;
    if (f.section && r.section !== f.section) continue;
    if (f.topper && r.topperKey !== f.topper) continue;
    for (let j = 0; j < words.length; j++) if (r.search.indexOf(words[j]) === -1) continue outer;
    if (hideBlocked && blockedFiles!.has(r.file)) {
      hidden++;
      continue;
    }
    out.push(r);
  }

  if (f.sort === "air") out.sort((a, b) => a.airNum - b.airNum || a.id - b.id);
  else if (f.sort === "topper") out.sort((a, b) => a.topper.localeCompare(b.topper) || a.id - b.id);
  else if (f.sort === "page")
    out.sort((a, b) => (parseInt(a.page) || 0) - (parseInt(b.page) || 0) || a.id - b.id);
  else if (words.length && !f.onlyQ) {
    // Surface rows that actually have question text first when searching.
    out.sort((a, b) => Number(!!b.question) - Number(!!a.question) || a.id - b.id);
  }
  return { rows: out, hidden };
}

export const activeFilterCount = (f: Filters) =>
  [f.q, f.paper, f.section, f.topper, f.onlyQ, f.onlyD, f.unshared, f.sort !== "default"].filter(Boolean).length;

// ─── URL sync (shareable links) ──────────────────────────────────────────────

export function filtersToSearch(f: Filters): string {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.paper) p.set("paper", f.paper === "Paper I" ? "1" : "2");
  if (f.section) p.set("section", f.section);
  if (f.topper) p.set("topper", f.topper);
  if (f.onlyQ) p.set("questions", "1");
  if (f.onlyD) p.set("diagrams", "1");
  if (f.unshared) p.set("unshared", "1");
  if (f.sort !== "default") p.set("sort", f.sort);
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function filtersFromSearch(search: string): Filters {
  const p = new URLSearchParams(search);
  const sort = p.get("sort") as SortKey | null;
  return {
    q: p.get("q") ?? "",
    paper: p.get("paper") === "1" ? "Paper I" : p.get("paper") === "2" ? "Paper II" : "",
    section: p.get("section") ?? "",
    topper: p.get("topper") ?? "",
    onlyQ: p.get("questions") === "1",
    onlyD: p.get("diagrams") === "1",
    unshared: p.get("unshared") === "1",
    sort: sort && ["air", "topper", "page"].includes(sort) ? sort : "default",
  };
}
