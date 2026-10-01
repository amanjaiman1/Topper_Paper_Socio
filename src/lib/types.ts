export type Paper = "Paper I" | "Paper II" | "";

export interface Thinker {
  name: string;
  concept?: string;
}

export interface Row {
  id: number;
  file: string;
  topper: string;
  topperKey: string;
  air: string;
  airNum: number;
  coaching: string;
  marks: string;
  question: string;
  qLabel: string;
  intro: string;
  page: string;
  thinkers: Thinker[];
  diagram: string;
  syllabus: string;
  paper: Paper;
  section: string;
  topic: string;
  driveId: string;
  /** Lower-cased haystack used for search. */
  search: string;
}

export interface Topper {
  key: string;
  name: string;
  air: string;
  airNum: number;
  coaching: string;
  marks: string;
  rows: number;
  questions: number;
  files: string[];
}

export interface DriveFile {
  name: string;
  /** Candidate Drive IDs in sheet order (duplicates in the Links tab are kept). */
  ids: string[];
  topper: string;
  topperKey: string;
  rows: number;
}

export interface Dataset {
  rows: Row[];
  /** Every answer-copy PDF referenced by at least one row, most-referenced first. */
  files: DriveFile[];
  toppers: Topper[];
  sections: { name: string; paper: "Paper I" | "Paper II"; count: number }[];
  /** `key` is the lower-cased surname used for searching all spelling variants. */
  thinkers: { name: string; key: string; count: number }[];
  stats: {
    rows: number;
    questions: number;
    toppers: number;
    pdfs: number;
    linked: number;
    paper1: number;
    paper2: number;
    diagrams: number;
  };
  fetchedAt: number;
}

export type WorkerOut =
  | { type: "progress"; label: string; loaded: number; step: number; steps: number }
  | { type: "data"; source: "cache" | "network"; data: Dataset }
  | { type: "error"; message: string; hasCache: boolean };
