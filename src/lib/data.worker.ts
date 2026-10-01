/// <reference lib="webworker" />
import { buildDataset, DRIVE_GID, QUESTION_GIDS, sheetCsvUrl } from "./dataset";
import type { Dataset, WorkerOut } from "./types";

const DB_NAME = "socio-top-paper";
const STORE = "dataset";
const KEY = "v5";

const post = (msg: WorkerOut) => (self as unknown as Worker).postMessage(msg);

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function readCache(): Promise<Dataset | null> {
  try {
    const db = await openDB();
    return await new Promise((resolve) => {
      const req = db.transaction(STORE, "readonly").objectStore(STORE).get(KEY);
      req.onsuccess = () => resolve((req.result as Dataset) ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function writeCache(data: Dataset) {
  try {
    const db = await openDB();
    db.transaction(STORE, "readwrite").objectStore(STORE).put(data, KEY);
  } catch {
    /* storage may be unavailable (private mode) — ignore */
  }
}

async function fetchText(url: string, onBytes: (n: number) => void): Promise<string> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Google Sheets responded with ${res.status}`);
  if (!res.body) return res.text();
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let out = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    onBytes(value.byteLength);
    out += decoder.decode(value, { stream: true });
  }
  return out + decoder.decode();
}

async function load(force: boolean) {
  const cached = force ? null : await readCache();
  if (cached) post({ type: "data", source: "cache", data: cached });

  try {
    const gids = [...QUESTION_GIDS, DRIVE_GID];
    let loaded = 0;
    let done = 0;
    const steps = gids.length + 1;
    const tick = (label: string) => post({ type: "progress", label, loaded, step: done, steps });
    tick("Connecting to the sheet");

    const texts = await Promise.all(
      gids.map((gid) =>
        fetchText(sheetCsvUrl(gid), (n) => {
          loaded += n;
          tick("Downloading answer index");
        }).then((t) => {
          done++;
          tick("Downloading answer index");
          return t;
        }),
      ),
    );

    tick("Indexing questions, thinkers & toppers");
    const data = buildDataset(texts.slice(0, QUESTION_GIDS.length), texts[texts.length - 1]);
    post({ type: "data", source: "network", data });
    void writeCache(data);
  } catch (err) {
    post({
      type: "error",
      message: err instanceof Error ? err.message : String(err),
      hasCache: Boolean(cached),
    });
  }
}

self.onmessage = (e: MessageEvent<{ type: "load"; force?: boolean }>) => {
  if (e.data?.type === "load") void load(Boolean(e.data.force));
};
