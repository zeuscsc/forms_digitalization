import { promises as fs } from "fs";
import path from "path";
import { SAVED_DIGITALIZED_FORMS_DIR_NAME } from "@/lib/generatedFormsRegistry";

type BatchStatus = "pending" | "running" | "completed" | "completed_with_errors" | "failed";

export interface GenerationBatchJobSnapshot {
  id: string;
  status: "queued" | "running" | "success" | "failed";
  attempts: number;
  maxRetries: number;
  createdAt: string;
  updatedAt: string;
  originalFileName: string;
  mimeType: string;
  result?: {
    slug: string;
    route: string;
    pdfPath: string;
    uploadedAt: string;
    originalFileName: string;
  };
  error?: string;
}

export interface GenerationBatchSnapshot {
  id: string;
  status: BatchStatus;
  createdAt: string;
  updatedAt: string;
  total: number;
  queued: number;
  running: number;
  success: number;
  failed: number;
  jobs: GenerationBatchJobSnapshot[];
}

const BATCH_SNAPSHOT_DIR = path.join(process.cwd(), SAVED_DIGITALIZED_FORMS_DIR_NAME, "batches");
const DEFAULT_TTL_HOURS = 48;
const DEFAULT_CLEANUP_INTERVAL_MS = 15 * 60 * 1000;

let lastCleanupAt = 0;

function sanitizeBatchId(batchId: string) {
  return batchId.replace(/[^a-zA-Z0-9_-]/g, "");
}

function toSafeNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getSnapshotFilePath(batchId: string) {
  const safeBatchId = sanitizeBatchId(batchId);
  return path.join(BATCH_SNAPSHOT_DIR, `${safeBatchId}.json`);
}

function isTerminalStatus(status: BatchStatus) {
  return status === "completed" || status === "completed_with_errors" || status === "failed";
}

function getTtlMs() {
  const ttlHours = toSafeNumber(process.env.GENERATE_BATCH_SNAPSHOT_TTL_HOURS, DEFAULT_TTL_HOURS);
  return ttlHours * 60 * 60 * 1000;
}

function shouldRunCleanupNow() {
  const intervalMs = toSafeNumber(
    process.env.GENERATE_BATCH_SNAPSHOT_CLEANUP_INTERVAL_MS,
    DEFAULT_CLEANUP_INTERVAL_MS
  );
  return Date.now() - lastCleanupAt >= intervalMs;
}

function parseSnapshot(raw: string) {
  const parsed = JSON.parse(raw);

  if (!parsed || typeof parsed !== "object" || typeof parsed.id !== "string" || !Array.isArray(parsed.jobs)) {
    return null;
  }

  return parsed as GenerationBatchSnapshot;
}

export async function readGenerationBatchSnapshot(batchId: string): Promise<GenerationBatchSnapshot | null> {
  try {
    const raw = await fs.readFile(getSnapshotFilePath(batchId), "utf8");
    return parseSnapshot(raw);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    console.error("Unable to read generation batch snapshot", error);
    return null;
  }
}

export async function listGenerationBatchSnapshots(): Promise<GenerationBatchSnapshot[]> {
  try {
    const entries = await fs.readdir(BATCH_SNAPSHOT_DIR, { withFileTypes: true });
    const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".json"));
    const snapshots = await Promise.all(
      files.map(async (file) => {
        try {
          const raw = await fs.readFile(path.join(BATCH_SNAPSHOT_DIR, file.name), "utf8");
          return parseSnapshot(raw);
        } catch {
          return null;
        }
      })
    );

    return snapshots.filter((snapshot): snapshot is GenerationBatchSnapshot => Boolean(snapshot));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    console.error("Unable to list generation batch snapshots", error);
    return [];
  }
}

export async function upsertGenerationBatchSnapshot(snapshot: GenerationBatchSnapshot) {
  await fs.mkdir(BATCH_SNAPSHOT_DIR, { recursive: true });
  await fs.writeFile(getSnapshotFilePath(snapshot.id), `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

  if (shouldRunCleanupNow()) {
    void cleanupGenerationBatchSnapshots();
  }
}

export async function cleanupGenerationBatchSnapshots(nowMs: number = Date.now()) {
  lastCleanupAt = nowMs;

  const snapshots = await listGenerationBatchSnapshots();
  const ttlMs = getTtlMs();

  await Promise.all(
    snapshots.map(async (snapshot) => {
      if (!isTerminalStatus(snapshot.status)) {
        return;
      }

      const updatedAtMs = Date.parse(snapshot.updatedAt);

      if (!Number.isFinite(updatedAtMs)) {
        return;
      }

      if (nowMs - updatedAtMs < ttlMs) {
        return;
      }

      try {
        await fs.unlink(getSnapshotFilePath(snapshot.id));
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          console.error("Unable to delete stale generation batch snapshot", error);
        }
      }
    })
  );
}
