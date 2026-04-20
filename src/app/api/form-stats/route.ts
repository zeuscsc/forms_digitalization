import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const FORMS_DIR = path.join(process.cwd(), "saved_digitalized_form");
const REGISTRY_FILE = path.join(FORMS_DIR, "generated-forms.json");

type AnyNode = Record<string, unknown> | unknown[] | null;

function collectComponents(node: AnyNode, counts: Record<string, number>) {
  if (Array.isArray(node)) {
    for (const item of node) collectComponents(item as AnyNode, counts);
  } else if (node !== null && typeof node === "object") {
    const obj = node as Record<string, unknown>;
    if (typeof obj["component"] === "string" && obj["component"].trim()) {
      const c = obj["component"].trim();
      counts[c] = (counts[c] ?? 0) + 1;
    }
    for (const v of Object.values(obj)) collectComponents(v as AnyNode, counts);
  }
}

async function findFormFiles(): Promise<string[]> {
  try {
    const raw = await fs.readFile(REGISTRY_FILE, "utf-8");
    const registry = JSON.parse(raw) as unknown;
    if (Array.isArray(registry)) {
      const slugs = registry
        .filter((e): e is Record<string, unknown> => !!e && typeof e === "object")
        .map((e) => e["slug"])
        .filter((s): s is string => typeof s === "string" && !!s.trim());

      const candidates = await Promise.all(
        slugs.map(async (slug) => {
          const p = path.join(FORMS_DIR, `${slug}.json`);
          try {
            await fs.access(p);
            return p;
          } catch {
            return null;
          }
        })
      );
      const found = candidates.filter((p): p is string => p !== null);
      if (found.length > 0) return found;
    }
  } catch {
    // fallback below
  }

  const entries = await fs.readdir(FORMS_DIR);
  return entries
    .filter((f) => f.startsWith("generated-") && f.endsWith(".json") && f !== "generated-forms.json")
    .map((f) => path.join(FORMS_DIR, f));
}

export async function GET() {
  try {
    const files = await findFormFiles();

    const total: Record<string, number> = {};
    const coverage: Record<string, number> = {};
    const perForm: Record<string, Record<string, number>> = {};
    const formNames: string[] = [];

    for (const filePath of files) {
      const name = path.basename(filePath);
      try {
        const raw = await fs.readFile(filePath, "utf-8");
        const data = JSON.parse(raw) as AnyNode;
        const counts: Record<string, number> = {};
        collectComponents(data, counts);
        perForm[name] = counts;
        formNames.push(name);
        for (const [comp, cnt] of Object.entries(counts)) {
          total[comp] = (total[comp] ?? 0) + cnt;
          coverage[comp] = (coverage[comp] ?? 0) + 1;
        }
      } catch {
        // skip unreadable files
      }
    }

    const totalInstances = Object.values(total).reduce((a, b) => a + b, 0);

    return NextResponse.json({
      analyzedForms: formNames.length,
      formNames,
      totalInstances,
      componentUsage: total,
      componentFormCoverage: coverage,
      perForm,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
