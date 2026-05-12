export function normalizeText(s: string): string {
  return (s ?? "").toString().replace(/\s+/g, " ").trim();
}

export function normalizeExerciseName(s: string): string {
  const t = normalizeText(s);
  if (!t) return t;
  // Title-case-ish: keep words but trim and collapse spaces
  return t;
}

// Maps for training methods. Keys are normalized (lowercased, no extra spaces).
const METHOD_ALIASES: Record<string, string> = {
  "piram. cresc.": "Pirâmide crescente",
  "pirâm. cresc.": "Pirâmide crescente",
  "piramide crescente": "Pirâmide crescente",
  "pirâmide crescente": "Pirâmide crescente",
  "piram. decresc.": "Pirâmide decrescente",
  "pirâmide decrescente": "Pirâmide decrescente",
  "drop-set": "Drop-set",
  "dropset": "Drop-set",
  "drop set": "Drop-set",
  "series m.": "Séries múltiplas",
  "séries m.": "Séries múltiplas",
  "series multiplas": "Séries múltiplas",
  "séries múltiplas": "Séries múltiplas",
  "bi-set": "BI-SET",
  "bi set": "BI-SET",
  "biset": "BI-SET",
  "tri-set": "TRI-SET",
  "tri set": "TRI-SET",
  "triset": "TRI-SET",
  "super-set": "Super-set",
  "super set": "Super-set",
  "superset": "Super-set",
  "rest-pause": "Rest-pause",
  "rest pause": "Rest-pause",
  "fst-7": "FST-7",
  "fst 7": "FST-7",
};

export function canonicalMethodName(raw: string): string | null {
  const t = normalizeText(raw).toLowerCase();
  if (!t) return null;
  if (METHOD_ALIASES[t]) return METHOD_ALIASES[t];
  // try without trailing dots
  const t2 = t.replace(/\.+$/g, "").trim();
  if (METHOD_ALIASES[t2]) return METHOD_ALIASES[t2];
  return null;
}

export function parseIntSafe(v: any, def = 0): number {
  if (v === null || v === undefined || v === "") return def;
  const n = parseInt(String(v).replace(/[^0-9-]/g, ""), 10);
  return Number.isFinite(n) ? n : def;
}

export function parseFloatSafe(v: any, def = 0): number {
  if (v === null || v === undefined || v === "") return def;
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : def;
}

// Parses "60s", "1min", "1'30''", "90" -> seconds
export function parseRestSeconds(v: any): number {
  if (v === null || v === undefined) return 0;
  const s = String(v).trim().toLowerCase();
  if (!s) return 0;
  if (/^\d+$/.test(s)) return parseInt(s, 10); // assume seconds
  const minMatch = s.match(/(\d+)\s*min/);
  if (minMatch) return parseInt(minMatch[1], 10) * 60;
  const secMatch = s.match(/(\d+)\s*s/);
  if (secMatch) return parseInt(secMatch[1], 10);
  const quoteMatch = s.match(/(\d+)\s*'\s*(\d+)?/);
  if (quoteMatch) {
    const min = parseInt(quoteMatch[1], 10);
    const sec = quoteMatch[2] ? parseInt(quoteMatch[2], 10) : 0;
    return min * 60 + sec;
  }
  return parseIntSafe(s);
}
