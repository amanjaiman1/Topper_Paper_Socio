import type { Dataset, Row, Thinker, Topper } from "./types";
import { classifySection, detectPaper, stripPaper } from "./syllabus";

export const SHEET_ID = "16QR2YCunO5tem8yf2viqNl4R39YjDgLfPE7glouAkKo";
export const QUESTION_GIDS = ["1332884905", "1871204627"];
export const DRIVE_GID = "2085998453";

export const sheetCsvUrl = (gid: string) =>
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${gid}`;
export const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}`;
export const REPO_URL = "https://github.com/amanjaiman1/Topper_Paper_Socio";
export const driveViewUrl = (id: string) => `https://drive.google.com/file/d/${id}/view`;
export const drivePreviewUrl = (id: string) => `https://drive.google.com/file/d/${id}/preview`;

export const UNATTRIBUTED = "__unattributed";

// ─── CSV ────────────────────────────────────────────────────────────────────

/** Fast RFC-4180-ish CSV parser using slices instead of per-char concatenation. */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  const n = text.length;
  let row: string[] = [];
  let i = 0;

  while (i < n) {
    if (text.charCodeAt(i) === 34 /* " */) {
      let start = ++i;
      let val = "";
      for (;;) {
        const j = text.indexOf('"', i);
        if (j === -1) {
          val += text.slice(start);
          i = n;
          break;
        }
        if (text.charCodeAt(j + 1) === 34) {
          val += text.slice(start, j + 1);
          i = j + 2;
          start = i;
          continue;
        }
        val += text.slice(start, j);
        i = j + 1;
        break;
      }
      row.push(val);
    } else {
      let j = i;
      while (j < n) {
        const d = text.charCodeAt(j);
        if (d === 44 || d === 10 || d === 13) break;
        j++;
      }
      row.push(text.slice(i, j));
      i = j;
    }

    const c = text.charCodeAt(i);
    if (c === 44 /* , */) {
      i++;
      if (i >= n) row.push("");
      continue;
    }
    if (c === 13) i++;
    if (text.charCodeAt(i) === 10) i++;
    rows.push(row);
    row = [];
  }
  if (row.length) rows.push(row);
  return rows;
}

// ─── Topper parsing ─────────────────────────────────────────────────────────

const STOP = new Set(
  (
    "levelupias levelup level up visionias vision edenias eden damp sociology socio optional opt op " +
    "paper papers crash course programme program foundation test tests series full lenght length sectional " +
    "chapter chapters part and to copy marks mark answer answers booklet toppers topper reliableandvalid www com " +
    "pdf check checked uncheck unchecked online offline on onn off flt qn qs sent scan best second mgp tn " +
    "practice ias nice tsm soc question questions rank air"
  ).split(" "),
);

export function parseTopper(filename: string) {
  const base = filename.replace(/\.pdf$/i, "").trim();
  const airMatch = base.match(/(?:AIR|rank)[\s_-]*0*(\d+)/i);
  const air = airMatch ? airMatch[1] : "";
  const marksMatch = base.match(/(\d{2,3})[\s_-]*marks/i);
  const marks = marksMatch ? marksMatch[1] : "";

  const tokens = base
    .replace(/(?:AIR|rank)[\s_-]*\d+/gi, " ")
    .replace(/\d{2,3}[\s_-]*marks/gi, " ")
    .replace(/[_\-()[\],.&]+/g, " ")
    .split(/\s+/)
    .map((t) => t.replace(/^\d+(?=[a-z])/i, ""))
    .filter((t) => t && !/\d/.test(t) && !STOP.has(t.toLowerCase()));

  const joined = tokens.join(" ");
  const name = joined.replace(/\s/g, "").length >= 3 ? joined : "";

  const lower = filename.toLowerCase();
  let coaching = "";
  if (lower.includes("levelup") || lower.includes("level up")) coaching = "LevelupIAS";
  else if (lower.includes("vision")) coaching = "VisionIAS";
  else if (lower.includes("eden")) coaching = "EdenIAS";
  else if (lower.includes("damp")) coaching = "DAMP";
  else if (lower.includes("nice ias")) coaching = "NICE IAS";
  else if (lower.includes("mgp")) coaching = "MGP";

  return { air, marks, name, coaching };
}

const titleCase = (s: string) =>
  s
    .split(/\s+/)
    .filter(Boolean)
    .map((w) =>
      w.length === 1 || (w.length === 2 && !/[aeiou]/i.test(w) && w.toLowerCase() !== "md")
        ? w.toUpperCase()
        : w[0].toUpperCase() + w.slice(1).toLowerCase(),
    )
    .join(" ");

/** Spelling-tolerant key: "Agarwal" ≈ "Agrawal", "Chabra" ≈ "Chhabra", "Wardah" ≈ "Wardha". */
const fuzzyKey = (name: string) =>
  name
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w[0] + w.slice(1).replace(/[aeiouhy]/g, "").replace(/(.)\1+/g, "$1"))
    .join(" ");

// ─── Thinkers ───────────────────────────────────────────────────────────────

export function parseThinkers(raw: string): Thinker[] {
  if (!raw || raw === "Not mentioned") return [];
  const out: Thinker[] = [];
  const groups = raw.match(/\{[^}]*\}/g) || [raw];
  for (const g of groups) {
    const inner = g
      .replace(/[{}]/g, "")
      .replace(/,?\s*(Book|Concept|Thinker)\s*:\s*(Not mentioned|NA|None)\b/gi, "")
      .trim();
    if (!inner) continue;
    const t = inner.match(/Thinker\s*:\s*([^,]*?)(?:,|$)/i);
    const c = inner.match(/Concept\s*:\s*(.*)$/i);
    const concept = c ? c[1].trim() : "";
    const name = t ? t[1].trim() : c ? "" : inner.replace(/^Thinker\s*:\s*/i, "").trim();
    if (name) out.push(concept ? { name, concept } : { name });
    else if (concept) out.push({ name: concept });
  }
  return out;
}

const thinkerKey = (name: string) => {
  const parts = name.toLowerCase().replace(/[^a-z\s]/g, " ").trim().split(/\s+/);
  return parts[parts.length - 1] || name.toLowerCase();
};

// ─── Build ──────────────────────────────────────────────────────────────────

const clean = (v: string, empties: string[]) => {
  const t = (v || "").trim();
  return empties.includes(t) ? "" : t;
};

interface TopperGroup extends Topper {
  nameVotes: Map<string, number>;
  airVotes: Map<string, number>;
}

const topVote = (m: Map<string, number>) => {
  let best = "", n = -1;
  for (const [k, v] of m) if (v > n) { best = k; n = v; }
  return best;
};

export function buildDataset(questionCsvs: string[], driveCsv: string): Dataset {
  const driveMap = new Map<string, string>();
  const driveRows = parseCSV(driveCsv);
  for (let i = 1; i < driveRows.length; i++) {
    const r = driveRows[i];
    if (r.length >= 2 && r[0].trim() && r[1].trim()) driveMap.set(r[0].trim(), r[1].trim());
  }

  const rows: Row[] = [];
  const seen = new Set<string>();
  const fileInfo = new Map<string, ReturnType<typeof parseTopper> & { key: string }>();

  for (const text of questionCsvs) {
    const csv = parseCSV(text);
    if (csv.length < 2) continue;
    const header = csv[0].map((h) => h.trim().toLowerCase());
    const idx = (n: string) => header.indexOf(n);
    const cFile = idx("filename"), cQ = idx("question"), cI = idx("introduction"), cP = idx("page");
    const cT = idx("thinkers"), cD = idx("diagram"), cS = idx("syllabus");
    const get = (r: string[], c: number) => (c >= 0 && c < r.length ? r[c].trim() : "");

    for (let i = 1; i < csv.length; i++) {
      const r = csv[i];
      const file = get(r, cFile);
      if (!file) continue;

      const questionRaw = clean(get(r, cQ), ["NA", "N/A", "Not mentioned"]);
      const intro = clean(get(r, cI), ["Not mentioned", "NA"]);
      const pageRaw = get(r, cP);
      const page = pageRaw.match(/\d+/)?.[0] ?? pageRaw;
      const thinkersRaw = get(r, cT);
      const diagram = clean(get(r, cD), ["No diagram", "Not mentioned", "NA", "None", "No"]);
      const syllabus = clean(get(r, cS), ["NA", "Not mentioned"]);

      const dedupeKey = `${file}|${page}|${questionRaw}|${syllabus}|${thinkersRaw}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      let info = fileInfo.get(file);
      if (!info) {
        const p = parseTopper(file);
        info = { ...p, key: p.name ? fuzzyKey(p.name) : UNATTRIBUTED };
        fileInfo.set(file, info);
      }

      const qm = questionRaw.match(/^\s*([Qq]\.?\s*(?:[Nn][Oo]\.?\s*)?\d+\s*(?:\(\s*[a-hA-H]\s*\)|[.\-]?\s*[a-h]\b\)?)?)/);
      const qLabel = qm
        ? qm[1]
            .replace(/\s+/g, "")
            .replace(/^Q\.?(no\.?)?/i, "Q")
            .replace(/^(Q\d+)[.\-]?\(?([a-h])\)?$/i, (_, a, b) => `${a}(${b.toLowerCase()})`)
        : "";
      const question = qm ? questionRaw.slice(qm[0].length).replace(/^[\s.:)\-–]+/, "") : questionRaw;
      const paper = detectPaper(syllabus);

      rows.push({
        id: rows.length,
        file,
        topper: "",
        topperKey: info.key,
        air: info.air,
        airNum: Number.POSITIVE_INFINITY,
        coaching: info.coaching,
        marks: info.marks,
        question,
        qLabel,
        intro,
        page,
        thinkers: parseThinkers(thinkersRaw),
        diagram,
        syllabus,
        paper,
        section: classifySection(syllabus, paper),
        topic: syllabus ? stripPaper(syllabus) : "",
        driveId: driveMap.get(file) || "",
        search: "",
      });
    }
  }

  // ── Topper groups ─────────────────────────────────────────────────────────
  const groups = new Map<string, TopperGroup>();
  for (const [file, info] of fileInfo) {
    let g = groups.get(info.key);
    if (!g) {
      g = {
        key: info.key, name: "", air: "", airNum: Infinity, coaching: "", marks: "",
        rows: 0, questions: 0, files: [], nameVotes: new Map(), airVotes: new Map(),
      };
      groups.set(info.key, g);
    }
    g.files.push(file);
    const nm = titleCase(info.name);
    g.nameVotes.set(nm, (g.nameVotes.get(nm) || 0) + 1);
    if (info.air) g.airVotes.set(info.air, (g.airVotes.get(info.air) || 0) + 1);
    if (!g.coaching && info.coaching) g.coaching = info.coaching;
    if (!g.marks && info.marks) g.marks = info.marks;
  }
  for (const g of groups.values()) {
    g.name = g.key === UNATTRIBUTED ? "Unattributed copies" : topVote(g.nameVotes);
    if (g.key === UNATTRIBUTED) g.coaching = "";
    g.air = g.key === UNATTRIBUTED ? "" : topVote(g.airVotes);
    g.airNum = g.air ? parseInt(g.air, 10) : Infinity;
  }

  // ── Finalise rows + aggregates ────────────────────────────────────────────
  const sectionMap = new Map<string, { name: string; paper: "Paper I" | "Paper II"; count: number }>();
  const thinkerMap = new Map<string, { votes: Map<string, number>; count: number }>();
  let questions = 0, linked = 0, paper1 = 0, paper2 = 0, diagrams = 0;

  for (const r of rows) {
    const g = groups.get(r.topperKey)!;
    r.topper = g.name;
    if (!r.air) r.air = g.air;
    r.airNum = r.air ? parseInt(r.air, 10) : Infinity;
    if (!r.coaching) r.coaching = g.coaching;

    g.rows++;
    if (r.question) { g.questions++; questions++; }
    if (r.driveId) linked++;
    if (r.paper === "Paper I") paper1++;
    if (r.paper === "Paper II") paper2++;
    if (r.diagram) diagrams++;

    if (r.paper && r.section) {
      const k = `${r.paper}|${r.section}`;
      const s = sectionMap.get(k);
      if (s) s.count++;
      else sectionMap.set(k, { name: r.section, paper: r.paper, count: 1 });
    }
    for (const th of r.thinkers) {
      const k = thinkerKey(th.name);
      let e = thinkerMap.get(k);
      if (!e) thinkerMap.set(k, (e = { votes: new Map(), count: 0 }));
      e.count++;
      e.votes.set(th.name, (e.votes.get(th.name) || 0) + 1);
    }

    r.search = [
      r.qLabel, r.question, r.topper, r.air && `air ${r.air}`, r.coaching, r.intro, r.syllabus,
      r.thinkers.map((t) => `${t.name} ${t.concept || ""}`).join(" "), r.diagram,
    ]
      .filter(Boolean)
      .join(" \u0001 ")
      .toLowerCase();
  }

  const toppers: Topper[] = [...groups.values()]
    .map(({ nameVotes: _n, airVotes: _a, ...t }) => t)
    .sort((a, b) =>
      a.key === UNATTRIBUTED ? 1 : b.key === UNATTRIBUTED ? -1 : a.airNum - b.airNum || b.rows - a.rows,
    );

  const sections = [...sectionMap.values()];

  const thinkers = [...thinkerMap.entries()]
    .map(([key, e]) => {
      // Prefer the most common multi-word variant ("Emile Durkheim" over "Durkheim").
      const variants = [...e.votes.entries()].sort((a, b) => b[1] - a[1]);
      const full = variants.find(([v]) => v.trim().includes(" ") && v.length < 32);
      return { name: (full ?? variants[0])[0], key, count: e.count };
    })
    .filter((t) => t.count >= 8 && t.name.length < 32 && t.key.length > 2 && !/^page\b/i.test(t.name))
    .sort((a, b) => b.count - a.count)
    .slice(0, 60);

  return {
    rows,
    toppers,
    sections,
    thinkers,
    stats: {
      rows: rows.length,
      questions,
      toppers: toppers.filter((t) => t.key !== UNATTRIBUTED).length,
      pdfs: driveMap.size,
      linked,
      paper1,
      paper2,
      diagrams,
    },
    fetchedAt: Date.now(),
  };
}
