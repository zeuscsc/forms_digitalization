import { promises as fs } from "fs";
import path from "path";
import type { FormDesignerDocument } from "@/lib/formDesigner";

export interface GeneratedFormRecord {
  slug: string;
  route: string;
  pdfPath: string;
  pdfFileName: string;
  originalFileName: string;
  displayName: string;
  uploadedAt: string;
  lastSavedAt?: string;
  lastUpdatedAt: string;
  hasGeneratedPage: boolean;
  hasSchema: boolean;
  hasSavedDesigner: boolean;
}

interface StoredGeneratedFormRecord {
  slug: string;
  route: string;
  pdfPath: string;
  originalFileName: string;
  displayName: string;
  uploadedAt: string;
  designerPath?: string;
  lastSavedAt?: string;
}

export const UPLOADED_FORMS_DIR_NAME = "uploaded_form";
export const LEGACY_UPLOADED_FORMS_DIR_NAME = "raw_forms";
export const SAVED_DIGITALIZED_FORMS_DIR_NAME = "saved_digitalized_form";
const REGISTRY_FILE_NAME = "generated-forms.json";

const UPLOADED_FORMS_DIR = path.join(process.cwd(), UPLOADED_FORMS_DIR_NAME);
const LEGACY_UPLOADED_FORMS_DIR = path.join(process.cwd(), LEGACY_UPLOADED_FORMS_DIR_NAME);
const GENERATED_PAGES_DIR = path.join(process.cwd(), "src", "app", "generated");
const GENERATED_SCHEMAS_DIR = path.join(process.cwd(), "src", "lib", "schemas", "generated");
const SAVED_DIGITALIZED_FORMS_DIR = path.join(process.cwd(), SAVED_DIGITALIZED_FORMS_DIR_NAME);
const LEGACY_SAVED_DIGITALIZED_FORMS_DIR = path.join(process.cwd(), "reports", "saved-designers");
const REGISTRY_PATH = path.join(SAVED_DIGITALIZED_FORMS_DIR, REGISTRY_FILE_NAME);
const LEGACY_REGISTRY_PATH = path.join(process.cwd(), "reports", REGISTRY_FILE_NAME);

function sanitizeFileName(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ").trim();
}

function parseTimestamp(value: string) {
  const match = value.match(/(\d{10,})/);

  if (!match) {
    return null;
  }

  const timestamp = Number(match[1]);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function normalizeDisplayName(originalFileName: string, pdfFileName: string) {
  const source = originalFileName || pdfFileName;
  const normalized = sanitizeFileName(source);

  return normalized || "Untitled uploaded form";
}

function getSavedDesignerRelativePath(slug: string) {
  return path.posix.join(SAVED_DIGITALIZED_FORMS_DIR_NAME, `${slug}.json`);
}

function getSavedDesignerAbsolutePath(slug: string) {
  return path.join(SAVED_DIGITALIZED_FORMS_DIR, `${slug}.json`);
}

function getLegacySavedDesignerAbsolutePath(slug: string) {
  return path.join(LEGACY_SAVED_DIGITALIZED_FORMS_DIR, `${slug}.json`);
}

async function pathExists(targetPath: string) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readRegistry() {
  for (const candidatePath of [REGISTRY_PATH, LEGACY_REGISTRY_PATH]) {
    try {
      const raw = await fs.readFile(candidatePath, "utf8");
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as StoredGeneratedFormRecord[]) : [];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        continue;
      }

      console.error("Unable to read generated forms registry", error);
      return [];
    }
  }

  return [];
}

async function writeRegistry(entries: StoredGeneratedFormRecord[]) {
  await fs.mkdir(path.dirname(REGISTRY_PATH), { recursive: true });
  await fs.writeFile(REGISTRY_PATH, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
}

async function listDirectoryNames(targetPath: string) {
  try {
    const entries = await fs.readdir(targetPath, { withFileTypes: true });
    return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function listFileNames(targetPath: string) {
  try {
    const entries = await fs.readdir(targetPath, { withFileTypes: true });
    return entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

export async function registerGeneratedForm(entry: Omit<StoredGeneratedFormRecord, "displayName"> & { displayName?: string }) {
  const registry = await readRegistry();
  const pdfFileName = path.posix.basename(entry.pdfPath);
  const record: StoredGeneratedFormRecord = {
    ...entry,
    displayName: entry.displayName ?? normalizeDisplayName(entry.originalFileName, pdfFileName),
  };

  const nextRegistry = [record, ...registry.filter((current) => current.slug !== record.slug)];
  await writeRegistry(nextRegistry);
}

export async function readSavedGeneratedFormDesigner(slug: string): Promise<FormDesignerDocument | null> {
  for (const candidatePath of [getSavedDesignerAbsolutePath(slug), getLegacySavedDesignerAbsolutePath(slug)]) {
    try {
      const source = await fs.readFile(candidatePath, "utf8");
      const parsed = JSON.parse(source) as FormDesignerDocument;

      if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.steps)) {
        return null;
      }

      return parsed;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        continue;
      }

      console.error("Unable to read saved designer snapshot", error);
      return null;
    }
  }

  return null;
}

interface SaveGeneratedFormDesignerInput {
  slug?: string;
  route?: string;
  pdfPath?: string;
  originalFileName?: string;
  displayName?: string;
  designer: FormDesignerDocument;
}

export async function saveGeneratedFormDesigner(input: SaveGeneratedFormDesignerInput) {
  const registry = await readRegistry();
  const slug = input.slug?.trim() || `saved-${Date.now()}`;
  const existing = registry.find((entry) => entry.slug === slug) ?? null;
  const savedAt = new Date().toISOString();
  const designerPath = getSavedDesignerRelativePath(slug);

  await fs.mkdir(SAVED_DIGITALIZED_FORMS_DIR, { recursive: true });
  await fs.writeFile(getSavedDesignerAbsolutePath(slug), `${JSON.stringify(input.designer, null, 2)}\n`, "utf8");

  const record: StoredGeneratedFormRecord = {
    slug,
    route: input.route ?? existing?.route ?? "/",
    pdfPath: input.pdfPath ?? existing?.pdfPath ?? "",
    originalFileName: input.originalFileName ?? existing?.originalFileName ?? `${slug}.json`,
    displayName:
      input.displayName?.trim() ||
      existing?.displayName ||
      normalizeDisplayName(input.originalFileName ?? "", path.posix.basename(designerPath)),
    uploadedAt: existing?.uploadedAt ?? savedAt,
    designerPath,
    lastSavedAt: savedAt,
  };

  const nextRegistry = [record, ...registry.filter((entry) => entry.slug !== slug)];
  await writeRegistry(nextRegistry);

  return record;
}

export async function listGeneratedForms(): Promise<GeneratedFormRecord[]> {
  const [
    registry,
    uploadedFormFiles,
    legacyUploadedFormFiles,
    generatedPageDirectories,
    generatedSchemaFiles,
    savedDesignerFiles,
    legacySavedDesignerFiles,
  ] = await Promise.all([
    readRegistry(),
    listFileNames(UPLOADED_FORMS_DIR),
    listFileNames(LEGACY_UPLOADED_FORMS_DIR),
    listDirectoryNames(GENERATED_PAGES_DIR),
    listFileNames(GENERATED_SCHEMAS_DIR),
    listFileNames(SAVED_DIGITALIZED_FORMS_DIR),
    listFileNames(LEGACY_SAVED_DIGITALIZED_FORMS_DIR),
  ]);

  const rawUploads = new Map<string, string>();

  for (const fileName of legacyUploadedFormFiles) {
    const match = fileName.match(/^uploaded-(\d+)\.pdf$/);

    if (!match) {
      continue;
    }

    rawUploads.set(match[1], path.posix.join(LEGACY_UPLOADED_FORMS_DIR_NAME, fileName));
  }

  for (const fileName of uploadedFormFiles) {
    const match = fileName.match(/^uploaded-(\d+)\.pdf$/);

    if (!match) {
      continue;
    }

    rawUploads.set(match[1], path.posix.join(UPLOADED_FORMS_DIR_NAME, fileName));
  }

  const pageSlugs = new Set(
    generatedPageDirectories.filter((dir) => dir.startsWith("generated-"))
  );
  const schemaSlugs = new Set(
    generatedSchemaFiles
      .filter((fileName) => fileName.startsWith("generated-") && fileName.endsWith(".ts"))
      .map((fileName) => fileName.replace(/\.ts$/, ""))
  );
  const savedDesignerSlugs = new Set(
    [...legacySavedDesignerFiles, ...savedDesignerFiles]
      .filter((fileName) => fileName.startsWith("generated-") && fileName.endsWith(".json") && fileName !== REGISTRY_FILE_NAME)
      .map((fileName) => fileName.replace(/\.json$/, ""))
  );

  const allSlugs = new Set<string>([
    ...registry.map((entry) => entry.slug),
    ...pageSlugs,
    ...schemaSlugs,
    ...savedDesignerSlugs,
    ...Array.from(rawUploads.keys()).map((timestamp) => `generated-${timestamp}`),
  ]);

  const mergedRecords: Array<GeneratedFormRecord | null> = await Promise.all(
    Array.from(allSlugs).map(async (slug) => {
      const stored = registry.find((entry) => entry.slug === slug) ?? null;
      const timestamp = parseTimestamp(slug);
      const fallbackPdfPath = timestamp ? rawUploads.get(String(timestamp)) ?? "" : "";
      const pdfPath = stored?.pdfPath ?? fallbackPdfPath;
      const hasSavedDesigner = savedDesignerSlugs.has(slug);

      if (!stored && !pdfPath && !pageSlugs.has(slug) && !schemaSlugs.has(slug) && !hasSavedDesigner) {
        return null;
      }

      const pdfFileName = pdfPath ? path.posix.basename(pdfPath) : `${slug}.pdf`;
      const uploadedAt = stored?.uploadedAt ?? (timestamp ? new Date(timestamp).toISOString() : new Date(0).toISOString());
      const lastSavedAt = stored?.lastSavedAt;
      const lastUpdatedAt = lastSavedAt ?? uploadedAt;
      const displayName = stored?.displayName ?? normalizeDisplayName(stored?.originalFileName ?? "", pdfFileName);
      const route = stored?.route ?? (pageSlugs.has(slug) ? `/generated/${slug}` : "/");
      const pageFileExists = pageSlugs.has(slug)
        ? await pathExists(path.join(GENERATED_PAGES_DIR, slug, "page.tsx"))
        : false;

      return {
        slug,
        route,
        pdfPath,
        pdfFileName,
        originalFileName: stored?.originalFileName ?? pdfFileName,
        displayName,
        uploadedAt,
        lastSavedAt,
        lastUpdatedAt,
        hasGeneratedPage: pageFileExists,
        hasSchema: schemaSlugs.has(slug),
        hasSavedDesigner,
      } satisfies GeneratedFormRecord;
    })
  );

  return mergedRecords
    .filter((record): record is GeneratedFormRecord => Boolean(record))
    .sort((left, right) => Date.parse(right.lastUpdatedAt) - Date.parse(left.lastUpdatedAt));
}