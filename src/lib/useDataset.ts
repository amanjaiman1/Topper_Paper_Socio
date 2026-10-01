"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Dataset, WorkerOut } from "./types";

export interface DatasetState {
  data: Dataset | null;
  source: "cache" | "network" | null;
  progress: { label: string; loaded: number; step: number; steps: number } | null;
  error: string | null;
  syncing: boolean;
  refresh: () => void;
}

export function useDataset(): DatasetState {
  const workerRef = useRef<Worker | null>(null);
  const [data, setData] = useState<Dataset | null>(null);
  const [source, setSource] = useState<DatasetState["source"]>(null);
  const [progress, setProgress] = useState<DatasetState["progress"]>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(true);

  useEffect(() => {
    const worker = new Worker(new URL("./data.worker.ts", import.meta.url), { type: "module" });
    workerRef.current = worker;
    worker.onmessage = (e: MessageEvent<WorkerOut>) => {
      const msg = e.data;
      if (msg.type === "progress") setProgress(msg);
      else if (msg.type === "data") {
        setData(msg.data);
        setSource(msg.source);
        setError(null);
        if (msg.source === "network") {
          setSyncing(false);
          setProgress(null);
        }
      } else if (msg.type === "error") {
        setError(msg.message);
        setSyncing(false);
        setProgress(null);
      }
    };
    worker.postMessage({ type: "load" });
    return () => worker.terminate();
  }, []);

  const refresh = useCallback(() => {
    setSyncing(true);
    setError(null);
    workerRef.current?.postMessage({ type: "load", force: true });
  }, []);

  return { data, source, progress, error, syncing, refresh };
}
