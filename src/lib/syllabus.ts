import type { Paper } from "./types";

type Rule = [label: string, re: RegExp];

/** Ordered rules — first match wins. Mirrors the official UPSC Sociology optional syllabus. */
const PAPER_I: Rule[] = [
  ["Sociology – The Discipline", /the discipline|common.?sense|scope of the subject|emergence of sociology|modernity and social change/i],
  ["Sociology as Science", /as science|positivis|fact.?value|scientific method/i],
  ["Research Methods", /research method|data collection|qualitative|quantitative|sampling|hypothesis|reliability|validity|variables|research methodology/i],
  ["Sociological Thinkers", /thinker|durkheim|weber|marx|parsons|merton|\bmead\b/i],
  ["Stratification & Mobility", /stratification|mobility|inequalit|poverty|deprivation|hierarch|exclusion/i],
  ["Systems of Kinship", /kinship|family|household|marriage|lineage|descent|patriarchy/i],
  ["Works & Economic Life", /\bwork|economic life|labour|industrial/i],
  ["Politics & Society", /politic|power|state|democracy|civil society|protest|agitation|social movement|collective action|revolution|pressure group|bureaucracy|nation/i],
  ["Religion & Society", /religio|secular|sects|cults|animism|monism|pluralism/i],
  ["Social Change in Modern Society", /social change|development|dependency|education|technology|agents of/i],
];

const PAPER_II: Rule[] = [
  ["Impact of Colonial Rule", /colonial|nationalism|social reform|modernization of indian tradition/i],
  ["Caste System", /caste|untouchab|jajmani|sanskriti/i],
  ["Tribal Communities", /tribal|tribe/i],
  ["Social Classes", /social class|middle class|agrarian class|industrial class/i],
  ["Kinship in India", /kinship|family|patriarchy|lineage|household|marriage/i],
  ["Religion & Society", /religio|minorit|communal|seculari/i],
  ["Perspectives on Indian Society", /perspective|indology|ghurye|structural functionalism|srinivas|marxist sociology|desai/i],
  ["Rural & Agrarian", /rural|agrarian|village|land tenure|land reform|green revolution|bonded labour/i],
  ["Visions of Social Change", /visions? of social change|gandhi|nehru|ambedkar|development planning|mixed economy|constitution/i],
  ["Industrialization & Urbanisation", /industriali|urbani|slum|informal sector/i],
  ["Social Movements", /social movement|peasant|women'?s movement|backward class|dalit movement|environmental movement|identity movement/i],
  ["Politics & Society", /politic|nation|democracy|citizenship|panchayat|elite|regionalism|decentrali/i],
  ["Population Dynamics", /population|sex ratio|fertility|mortality|migration|reproductive/i],
  ["Challenges of Transformation", /challenge|violence|environment|sustainab|illiteracy|disparit|crisis|inequalit|poverty|deprivation|displacement/i],
  ["Social Structure (General)", /social structure/i],
  ["Social Change in India (General)", /social change/i],
];

const PAPER_RE = /paper\s*[–—-]?\s*(ii|i|2|1)\b/i;

export function parsePaper(syllabus: string): Paper {
  const m = syllabus.match(PAPER_RE);
  if (!m) return "";
  const v = m[1].toLowerCase();
  return v === "ii" || v === "2" ? "Paper II" : "Paper I";
}

export function stripPaper(syllabus: string) {
  return syllabus.replace(/^\s*paper\s*[–—-]?\s*(ii|i|2|1)\b\s*[:.\-–]?\s*/i, "").trim();
}

/** Detects the paper from an explicit prefix, or infers it from the topic when the prefix is missing. */
export function detectPaper(syllabus: string): Paper {
  const explicit = parsePaper(syllabus);
  if (explicit || !syllabus) return explicit;
  const head = syllabus.split(/\s+-\s+/)[0];
  if (/india|caste|tribal|colonial|village/i.test(syllabus)) return "Paper II";
  const specific = (rules: Rule[]) => rules.some(([l, re]) => !l.endsWith("(General)") && re.test(head));
  if (specific(PAPER_I)) return "Paper I";
  if (specific(PAPER_II)) return "Paper II";
  return "";
}

export function classifySection(syllabus: string, paper: Paper): string {
  if (!paper) return "";
  const rest = stripPaper(syllabus);
  const head = rest.split(/\s+-\s+/)[0];
  const rules = paper === "Paper I" ? PAPER_I : PAPER_II;
  // Head segment first (skipping catch-all rules), then the full string.
  for (const [label, re] of rules) if (!label.endsWith("(General)") && re.test(head)) return label;
  for (const [label, re] of rules) if (re.test(rest)) return label;
  return "Other";
}

export const SECTION_ORDER: Record<"Paper I" | "Paper II", string[]> = {
  "Paper I": [...PAPER_I.map((r) => r[0]), "Other"],
  "Paper II": [...PAPER_II.map((r) => r[0]), "Other"],
};
