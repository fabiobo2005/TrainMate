/**
 * Excel importer — idempotent per (sourceFile, sourceHash).
 *
 * Usage:
 *   npm run import:excel -- --files "../data/Julho2025.xlsx,../data/setembro2025.xlsx"
 *
 * Notes:
 *  - Detects color sheets: Amarelo/Verde/Vermelho/Laranja/Azul
 *  - Detects week/microcycle headers ("1ª Semana", "1ºMicrociclo", etc.)
 *  - Extracts exercise rows with columns: Exercícios, Séries, Repetições, Cadência,
 *    Intervalo, Método, Observações
 *  - Parses "Sistemas e Métodos" sheet (rows like "NAME: description")
 *  - Parses cardio sheets (Aeróbio / Cardiorrespiratório) as CardioProtocol rows
 */
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import * as XLSX from "xlsx";
import { PrismaClient } from "@prisma/client";
import {
  normalizeText,
  normalizeExerciseName,
  canonicalMethodName,
  parseIntSafe,
  parseRestSeconds,
} from "../lib/normalize";

const prisma = new PrismaClient();

const COLOR_SHEETS = ["AMARELO", "VERDE", "VERMELHO", "LARANJA", "AZUL"];
const CARDIO_SHEETS = ["AERÓBIO", "AEROBIO", "CARDIO", "CARDIORRESPIRATÓRIO", "CARDIORRESPIRATORIO"];
const METHODS_SHEETS = ["SISTEMAS E MÉTODOS", "SISTEMAS E METODOS", "MÉTODOS", "METODOS"];

type Cell = string | number | null | undefined;
type Row = Cell[];

function sha256File(filePath: string): string {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function sheetToRows(ws: XLSX.WorkSheet): Row[] {
  return XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: null }) as Row[];
}

function findSheet(wb: XLSX.WorkBook, candidates: string[]): string | null {
  const upper = candidates.map((c) => c.toUpperCase());
  for (const n of wb.SheetNames) {
    if (upper.includes(n.trim().toUpperCase())) return n;
  }
  return null;
}

function findColorSheets(wb: XLSX.WorkBook): { color: string; name: string }[] {
  const result: { color: string; name: string }[] = [];
  for (const n of wb.SheetNames) {
    const upper = n.trim().toUpperCase();
    if (COLOR_SHEETS.includes(upper)) result.push({ color: upper, name: n });
  }
  return result;
}

function findCardioSheets(wb: XLSX.WorkBook): string[] {
  return wb.SheetNames.filter((n) => CARDIO_SHEETS.includes(n.trim().toUpperCase()));
}

function findMethodsSheet(wb: XLSX.WorkBook): string | null {
  return findSheet(wb, METHODS_SHEETS);
}

// Detect microcycle (1..4) from a row's text content.
function detectMicrocycle(rowText: string): number | null {
  const t = rowText.toLowerCase();
  // matches "1ª semana", "1a semana", "2ª semana" ...
  const wkMatch = t.match(/(\d)\s*[ªa]\s*semana/);
  if (wkMatch) {
    const n = parseInt(wkMatch[1], 10);
    if (n >= 1 && n <= 4) return n;
  }
  // matches "1ºmicrociclo", "1 microciclo", "2º microciclo"
  const mcMatch = t.match(/(\d)\s*[ºo]?\s*microciclo/);
  if (mcMatch) {
    const n = parseInt(mcMatch[1], 10);
    if (n >= 1 && n <= 4) return n;
  }
  return null;
}

function joinRow(r: Row): string {
  return r.map((c) => (c == null ? "" : String(c))).join(" | ");
}

// Find header row index for a section. Headers contain "Exerc" word (Exercícios/Exercicios).
function findExerciseHeader(rows: Row[], from: number, to: number): {
  headerIdx: number;
  cols: Record<string, number>;
} | null {
  for (let i = from; i < to; i++) {
    const r = rows[i] || [];
    const text = r.map((c) => normalizeText(String(c ?? "")).toLowerCase());
    const hasExercise = text.some((c) => c.startsWith("exerc"));
    if (!hasExercise) continue;
    const cols: Record<string, number> = {};
    text.forEach((c, idx) => {
      if (c.startsWith("exerc")) cols.exercise = idx;
      else if (c.startsWith("séri") || c.startsWith("seri")) cols.series = idx;
      else if (c.startsWith("repet") || c === "reps") cols.reps = idx;
      else if (c.startsWith("cad")) cols.cadence = idx;
      else if (c.startsWith("inter")) cols.rest = idx;
      else if (c.startsWith("mét") || c.startsWith("met")) cols.method = idx;
      else if (c.startsWith("obs")) cols.obs = idx;
    });
    if (cols.exercise !== undefined) return { headerIdx: i, cols };
  }
  return null;
}

function isStopRow(r: Row): boolean {
  const text = joinRow(r).toLowerCase();
  if (!text.trim()) return false;
  return (
    text.includes("percepção subjetiva") ||
    text.includes("percepcao subjetiva") ||
    text.includes("pse") && text.includes("tempo") ||
    text.includes("unidades arbitrárias") ||
    text.includes("unidades arbitrarias") ||
    text.includes("ua")
  );
}

async function getOrCreateExercise(name: string) {
  const norm = normalizeExerciseName(name);
  if (!norm) return null;
  return prisma.exerciseLibrary.upsert({
    where: { name: norm },
    create: { name: norm },
    update: {},
  });
}

async function getOrCreateMethod(rawName: string) {
  const canonical = canonicalMethodName(rawName);
  if (!canonical) return null;
  return prisma.trainingMethod.upsert({
    where: { name: canonical },
    create: { name: canonical },
    update: {},
  });
}

async function ensureBlock(blockName: string, sourceFile: string, sourceHash: string) {
  const existing = await prisma.trainingBlock.findUnique({
    where: { sourceFile_sourceHash: { sourceFile, sourceHash } },
  });
  if (existing) return { block: existing, reused: true };
  const block = await prisma.trainingBlock.create({
    data: { name: blockName, sourceFile, sourceHash },
  });
  // Ensure microcycles 1..4
  for (let i = 1; i <= 4; i++) {
    await prisma.trainingMicrocycle.create({ data: { blockId: block.id, index: i } });
  }
  return { block, reused: false };
}

async function ensureDay(blockId: string, color: string, label: string) {
  return prisma.trainingDay.upsert({
    where: { blockId_color: { blockId, color } },
    create: { blockId, color, label },
    update: {},
  });
}

async function importColorSheet(
  blockId: string,
  color: string,
  rows: Row[]
) {
  const day = await ensureDay(blockId, color, color);

  // Sections: each microcycle section starts at a row containing "Semana"/"Microciclo".
  // Find all section starts.
  type Section = { microcycle: number; start: number; end: number };
  const sectionStarts: { microcycle: number; idx: number }[] = [];
  for (let i = 0; i < rows.length; i++) {
    const text = joinRow(rows[i]);
    const mc = detectMicrocycle(text);
    if (mc) sectionStarts.push({ microcycle: mc, idx: i });
  }
  // If no sections found, treat whole sheet as microcycle 1.
  const sections: Section[] = [];
  if (sectionStarts.length === 0) {
    sections.push({ microcycle: 1, start: 0, end: rows.length });
  } else {
    for (let i = 0; i < sectionStarts.length; i++) {
      sections.push({
        microcycle: sectionStarts[i].microcycle,
        start: sectionStarts[i].idx,
        end: i + 1 < sectionStarts.length ? sectionStarts[i + 1].idx : rows.length,
      });
    }
  }

  for (const sec of sections) {
    const mc = await prisma.trainingMicrocycle.findFirst({
      where: { blockId, index: sec.microcycle },
    });
    if (!mc) continue;

    const header = findExerciseHeader(rows, sec.start, sec.end);
    if (!header) continue;

    // Clear any existing rows for this (day, microcycle) so re-import per block is consistent.
    await prisma.trainingExercise.deleteMany({
      where: { blockId, dayId: day.id, microcycleId: mc.id },
    });

    let orderIndex = 0;
    for (let i = header.headerIdx + 1; i < sec.end; i++) {
      const r = rows[i];
      if (!r) continue;
      if (isStopRow(r)) break;
      const nameCell = r[header.cols.exercise!];
      const name = normalizeText(String(nameCell ?? ""));
      if (!name) continue;
      // Skip subheaders that aren't exercises (e.g. "Total")
      if (/^total\b/i.test(name)) continue;

      const series = parseIntSafe(r[header.cols.series ?? -1] ?? 0);
      const reps = normalizeText(String(r[header.cols.reps ?? -1] ?? ""));
      const cadence = normalizeText(String(r[header.cols.cadence ?? -1] ?? ""));
      const restSeconds = parseRestSeconds(r[header.cols.rest ?? -1] ?? 0);
      const methodRaw = normalizeText(String(r[header.cols.method ?? -1] ?? ""));
      const observations = normalizeText(String(r[header.cols.obs ?? -1] ?? ""));

      const exercise = await getOrCreateExercise(name);
      const method = methodRaw ? await getOrCreateMethod(methodRaw) : null;

      await prisma.trainingExercise.create({
        data: {
          blockId,
          dayId: day.id,
          microcycleId: mc.id,
          exerciseId: exercise?.id,
          exerciseNameRaw: name,
          series,
          reps,
          cadence,
          restSeconds,
          methodId: method?.id,
          methodRaw,
          observations,
          orderIndex: orderIndex++,
        },
      });
    }
  }
}

async function importMethodsSheet(rows: Row[]) {
  for (const r of rows) {
    const text = normalizeText(r.map((c) => c ?? "").join(" "));
    if (!text || text.length < 4) continue;
    // Expect "NAME: description"
    const m = text.match(/^([^:]{2,40}):\s*(.+)$/);
    if (!m) continue;
    const raw = m[1].trim();
    const desc = m[2].trim();
    const canonical = canonicalMethodName(raw) || raw;
    await prisma.trainingMethod.upsert({
      where: { name: canonical },
      create: { name: canonical, description: desc },
      update: { description: desc },
    });
  }
}

async function importCardioSheet(blockId: string, rows: Row[]) {
  // Clear protocols for this block first
  await prisma.cardioProtocol.deleteMany({ where: { blockId } });
  let currentMc = 1;
  for (const r of rows) {
    const text = joinRow(r);
    const mc = detectMicrocycle(text);
    if (mc) { currentMc = mc; continue; }
    const clean = normalizeText(text.replace(/\|/g, " "));
    if (!clean || clean.length < 3) continue;
    // Detect equipment hint
    const upper = clean.toUpperCase();
    let equipment = "OUTRO";
    if (upper.includes("ESCAD")) equipment = "ESCADA";
    else if (upper.includes("BICI") || upper.includes("BIKE")) equipment = "BICICLETA";
    else if (upper.includes("ESTEIRA") || upper.includes("CAMINH") || upper.includes("CORR")) equipment = "ESTEIRA";
    await prisma.cardioProtocol.create({
      data: {
        blockId,
        microcycleIndex: currentMc,
        equipment,
        description: clean,
      },
    });
  }
}

async function importFile(filePath: string) {
  const absolute = path.resolve(filePath);
  if (!fs.existsSync(absolute)) {
    console.warn(`File not found: ${absolute}`);
    return;
  }
  const hash = sha256File(absolute);
  const baseName = path.basename(absolute, path.extname(absolute));
  console.log(`\n== Importing ${baseName} (${hash.slice(0, 8)}) ==`);

  const wb = XLSX.readFile(absolute, { cellDates: true });
  const { block, reused } = await ensureBlock(baseName, absolute, hash);
  if (reused) {
    console.log(`  Already imported (idempotent). blockId=${block.id}`);
    return;
  }

  const methodsSheet = findMethodsSheet(wb);
  if (methodsSheet) {
    console.log(`  Parsing methods sheet: ${methodsSheet}`);
    await importMethodsSheet(sheetToRows(wb.Sheets[methodsSheet]));
  }

  const colors = findColorSheets(wb);
  for (const c of colors) {
    console.log(`  Parsing color sheet: ${c.name} -> ${c.color}`);
    await importColorSheet(block.id, c.color, sheetToRows(wb.Sheets[c.name]));
  }

  const cardios = findCardioSheets(wb);
  for (const name of cardios) {
    console.log(`  Parsing cardio sheet: ${name}`);
    await importCardioSheet(block.id, sheetToRows(wb.Sheets[name]));
  }
  console.log(`  Done. blockId=${block.id}`);
}

function parseArgs(): string[] {
  const idx = process.argv.indexOf("--files");
  if (idx === -1 || !process.argv[idx + 1]) {
    console.error("Usage: import:excel -- --files \"path1.xlsx,path2.xlsx\"");
    process.exit(1);
  }
  return process.argv[idx + 1].split(",").map((s) => s.trim()).filter(Boolean);
}

async function main() {
  const files = parseArgs();
  for (const f of files) {
    try { await importFile(f); }
    catch (e) { console.error(`Failed for ${f}:`, e); }
  }
}

main().finally(async () => { await prisma.$disconnect(); });
