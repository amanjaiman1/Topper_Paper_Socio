"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { checkLinks, resolveLink, useLink, useLinksSettled } from "@/lib/driveHealth";
import type { Dataset, DriveFile, Row } from "@/lib/types";

const FilesContext = createContext<Map<string, DriveFile>>(new Map());

export function DriveFilesProvider({ data, children }: { data: Dataset | null; children: React.ReactNode }) {
  const map = useMemo(() => new Map((data?.files ?? []).map((f) => [f.name, f])), [data]);

  // Check every referenced copy in the background, most-referenced first (cached for days).
  useEffect(() => {
    if (data) checkLinks(data.files.flatMap((f) => f.ids));
  }, [data]);

  return <FilesContext.Provider value={map}>{children}</FilesContext.Provider>;
}

export const useDriveFiles = () => useContext(FilesContext);

/** Resolved Drive link for a row. Pass `priority` for things on screen so they get checked first. */
export function useRowLink(row: Row | null, priority = false) {
  const files = useDriveFiles();
  const ids = useMemo(() => {
    if (!row) return [];
    return files.get(row.file)?.ids ?? (row.driveId ? [row.driveId] : []);
  }, [files, row]);
  const link = useLink(ids);
  const key = ids.join(",");
  useEffect(() => {
    if (priority && key) checkLinks(key.split(","), { priority: true });
  }, [priority, key]);
  return { ...link, hasPdf: ids.length > 0 };
}

/** File names whose every candidate link is known to be unavailable. Recomputed once per finished batch. */
export function useBlockedFiles(): Set<string> {
  const files = useDriveFiles();
  const settled = useLinksSettled();
  return useMemo(() => {
    void settled;
    const out = new Set<string>();
    for (const f of files.values()) if (resolveLink(f.ids).status === "blocked") out.add(f.name);
    return out;
  }, [files, settled]);
}
