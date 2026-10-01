"use client";

/**
 * Drive link health — tells us, from the browser, whether a Drive file is publicly viewable.
 *
 * Many IDs in the sheet point at files whose owner restricted sharing (or removed them), and Drive
 * answers those with "Sorry, the file you have requested does not exist". We can't read Drive
 * responses cross-origin, but the thumbnail endpoint can be loaded as an <img>: it renders for
 * viewable files and fails for unavailable ones. Results are cached in localStorage.
 */
import { useSyncExternalStore } from "react";
import { driveThumbUrl } from "./dataset";

export type LinkStatus = "ok" | "blocked" | "unknown";

const LS_KEY = "stp-drive-health-v1";
const TTL_OK = 3 * 24 * 3600_000;
const TTL_BLOCKED = 12 * 3600_000;
const CONCURRENCY = 6;
const TIMEOUT_MS = 15_000;

const status = new Map<string, "ok" | "blocked">();
const checkedAt = new Map<string, number>();
const queue: string[] = [];
const queued = new Set<string>();
const inflight = new Set<string>();
const listeners = new Set<() => void>();

let loaded = false;
/** Bumps whenever a batch of checks finishes — lets lists re-filter once instead of on every result. */
let settled = 0;
let runTotal = 0;
let runDone = 0;
let runOk = 0;
let runBlocked: string[] = [];

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY) || "{}") as Record<string, ["ok" | "blocked", number]>;
    for (const [id, [s, t]] of Object.entries(raw)) {
      if (s === "ok" || s === "blocked") {
        status.set(id, s);
        checkedAt.set(id, t);
      }
    }
  } catch {
    /* corrupt or unavailable storage */
  }
}

let saveTimer: ReturnType<typeof setTimeout> | undefined;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const out: Record<string, [string, number]> = {};
    for (const [id, s] of status) out[id] = [s, checkedAt.get(id) ?? 0];
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(out));
    } catch {
      /* quota / private mode */
    }
  }, 400);
}

const emit = () => {
  for (const l of listeners) l();
};

const isFresh = (id: string) => {
  const s = status.get(id);
  if (!s) return false;
  return Date.now() - (checkedAt.get(id) ?? 0) < (s === "ok" ? TTL_OK : TTL_BLOCKED);
};

function probe(id: string): Promise<"ok" | "blocked" | null> {
  return new Promise((resolve) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) return resolve(null);
    const img = new Image();
    const timer = setTimeout(() => {
      img.onload = img.onerror = null;
      img.src = "";
      resolve(null);
    }, TIMEOUT_MS);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img.naturalWidth > 0 ? "ok" : "blocked");
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(navigator.onLine === false ? null : "blocked");
    };
    img.referrerPolicy = "no-referrer";
    img.decoding = "async";
    img.src = driveThumbUrl(id);
  });
}

function finishRun() {
  // Safety valve: if a sizeable batch came back 100% unavailable, Google (or the network) is more
  // likely blocking the checks than every file being private — don't trust or persist that.
  if (runOk === 0 && runBlocked.length >= 15) {
    for (const id of runBlocked) {
      status.delete(id);
      checkedAt.delete(id);
    }
    save();
  }
  runTotal = runDone = runOk = 0;
  runBlocked = [];
  settled++;
}

function pump() {
  while (inflight.size < CONCURRENCY && queue.length) {
    const id = queue.shift()!;
    queued.delete(id);
    inflight.add(id);
    void probe(id).then((s) => {
      inflight.delete(id);
      runDone++;
      if (s) {
        status.set(id, s);
        checkedAt.set(id, Date.now());
        if (s === "ok") runOk++;
        else runBlocked.push(id);
        save();
      }
      if (!queue.length && !inflight.size) finishRun();
      emit();
      pump();
    });
  }
}

/** Queue Drive IDs for checking. `priority` jumps the queue (used for cards on screen / the open drawer). */
export function checkLinks(ids: string[], { priority = false, force = false } = {}) {
  load();
  const add: string[] = [];
  for (const id of ids) {
    if (!id || inflight.has(id)) continue;
    if (!force && isFresh(id)) continue;
    if (queued.has(id)) {
      if (priority) {
        queue.splice(queue.indexOf(id), 1);
        add.push(id);
      }
      continue;
    }
    queued.add(id);
    runTotal++;
    add.push(id);
  }
  if (!add.length) return;
  if (priority) queue.unshift(...add);
  else queue.push(...add);
  emit();
  pump();
}

export function getLinkStatus(id: string): LinkStatus {
  load();
  return status.get(id) ?? "unknown";
}

/** Best ID for a file: the first viewable candidate, else the first unchecked one, else the first. */
export function resolveLink(ids: readonly string[]): { id: string; status: LinkStatus } {
  let unknown: string | undefined;
  for (const id of ids) {
    const s = getLinkStatus(id);
    if (s === "ok") return { id, status: "ok" };
    if (s === "unknown" && !unknown) unknown = id;
  }
  if (unknown) return { id: unknown, status: "unknown" };
  return { id: ids[0] ?? "", status: ids.length ? "blocked" : "unknown" };
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Live status for a file's candidate IDs. Re-renders only when the resolved id/status changes. */
export function useLink(ids: readonly string[] | undefined): { id: string; status: LinkStatus } {
  const key = useSyncExternalStore(
    subscribe,
    () => {
      if (!ids?.length) return "|unknown";
      const r = resolveLink(ids);
      return `${r.id}|${r.status}`;
    },
    () => `${ids?.[0] ?? ""}|unknown`,
  );
  const i = key.lastIndexOf("|");
  return { id: key.slice(0, i), status: key.slice(i + 1) as LinkStatus };
}

/** Bumps once per finished batch (and on first cache load) — use as a memo dependency for filtering. */
export function useLinksSettled(): number {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return settled;
    },
    () => 0,
  );
}

/** Progress of the current batch of checks, e.g. { done: 120, total: 415 }. */
export function useLinkProgress(): { done: number; total: number; checking: boolean } {
  const key = useSyncExternalStore(subscribe, () => `${runDone}/${runTotal}`, () => "0/0");
  const [done, total] = key.split("/").map(Number);
  return { done, total, checking: total > 0 && done < total };
}

/** Re-check everything currently marked unavailable (e.g. after the owner fixes sharing). */
export function recheckBlocked() {
  load();
  checkLinks([...status.entries()].filter(([, s]) => s === "blocked").map(([id]) => id), { force: true });
}

