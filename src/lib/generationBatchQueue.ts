import { processUploadedInput, type ProcessUploadedResult } from "@/lib/formGeneration";
import {
  cleanupGenerationBatchSnapshots,
  upsertGenerationBatchSnapshot,
  type GenerationBatchSnapshot,
} from "@/lib/generationBatchRegistry";

export type BatchStatus = "pending" | "running" | "completed" | "completed_with_errors" | "failed";
export type JobStatus = "queued" | "running" | "success" | "failed";

export interface EnqueueUploadFile {
  originalFileName: string;
  mimeType: string;
  buffer: Buffer;
}

export interface GenerationBatchJob {
  id: string;
  batchId: string;
  status: JobStatus;
  attempts: number;
  maxRetries: number;
  createdAt: string;
  updatedAt: string;
  originalFileName: string;
  mimeType: string;
  payload: EnqueueUploadFile;
  result?: ProcessUploadedResult;
  error?: string;
}

export interface GenerationBatch {
  id: string;
  status: BatchStatus;
  createdAt: string;
  updatedAt: string;
  total: number;
  queued: number;
  running: number;
  success: number;
  failed: number;
  jobs: GenerationBatchJob[];
}

interface QueueConfig {
  maxConcurrentJobs: number;
  maxRetries: number;
  maxFilesPerBatch: number;
  minStartDelayMs: number;
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function toSafeNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

class GenerationBatchQueue {
  private readonly config: QueueConfig;
  private readonly batches = new Map<string, GenerationBatch>();
  private readonly jobs = new Map<string, GenerationBatchJob>();
  private readonly queue: string[] = [];
  private runningCount = 0;
  private startGate: Promise<void> = Promise.resolve();
  private lastJobStartAt = 0;

  constructor(config?: Partial<QueueConfig>) {
    this.config = {
      maxConcurrentJobs: config?.maxConcurrentJobs ?? toSafeNumber(process.env.GENERATE_BATCH_CONCURRENCY, 4),
      maxRetries: config?.maxRetries ?? toSafeNumber(process.env.GENERATE_BATCH_MAX_RETRIES, 2),
      maxFilesPerBatch: config?.maxFilesPerBatch ?? toSafeNumber(process.env.GENERATE_BATCH_MAX_FILES, 300),
      minStartDelayMs: config?.minStartDelayMs ?? toSafeNumber(process.env.GENERATE_BATCH_MIN_START_DELAY_MS, 300),
    };

    void cleanupGenerationBatchSnapshots();
  }

  getConfig() {
    return this.config;
  }

  enqueueBatch(files: EnqueueUploadFile[]) {
    if (files.length === 0) {
      throw new Error("No files were provided.");
    }

    if (files.length > this.config.maxFilesPerBatch) {
      throw new Error(`Maximum files per batch is ${this.config.maxFilesPerBatch}.`);
    }

    const batchId = createId("batch");
    const createdAt = nowIso();

    const jobs = files.map((file) => {
      const id = createId("job");
      const job: GenerationBatchJob = {
        id,
        batchId,
        status: "queued",
        attempts: 0,
        maxRetries: this.config.maxRetries,
        createdAt,
        updatedAt: createdAt,
        originalFileName: file.originalFileName,
        mimeType: file.mimeType,
        payload: file,
      };

      this.jobs.set(id, job);
      this.queue.push(id);
      return job;
    });

    const batch: GenerationBatch = {
      id: batchId,
      status: "pending",
      createdAt,
      updatedAt: createdAt,
      total: jobs.length,
      queued: jobs.length,
      running: 0,
      success: 0,
      failed: 0,
      jobs,
    };

    this.batches.set(batchId, batch);
    this.persistBatchSnapshot(batchId);
    this.drain();

    return this.serializeBatch(batch.id);
  }

  getBatch(batchId: string) {
    return this.serializeBatch(batchId);
  }

  private serializeBatch(batchId: string): GenerationBatchSnapshot | null {
    const batch = this.batches.get(batchId);

    if (!batch) {
      return null;
    }

    return {
      id: batch.id,
      status: batch.status,
      createdAt: batch.createdAt,
      updatedAt: batch.updatedAt,
      total: batch.total,
      queued: batch.queued,
      running: batch.running,
      success: batch.success,
      failed: batch.failed,
      jobs: batch.jobs.map((job) => ({
        id: job.id,
        status: job.status,
        attempts: job.attempts,
        maxRetries: job.maxRetries,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        originalFileName: job.originalFileName,
        mimeType: job.mimeType,
        result: job.result
          ? {
              slug: job.result.slug,
              route: job.result.route,
              pdfPath: job.result.pdfPath,
              uploadedAt: job.result.uploadedAt,
              originalFileName: job.result.originalFileName,
            }
          : undefined,
        error: job.error,
      })),
    };
  }

  private persistBatchSnapshot(batchId: string) {
    const snapshot = this.serializeBatch(batchId);

    if (!snapshot) {
      return;
    }

    void upsertGenerationBatchSnapshot(snapshot).catch((error) => {
      console.error("Unable to persist generation batch snapshot", error);
    });
  }

  private updateBatchCounters(batch: GenerationBatch) {
    let queued = 0;
    let running = 0;
    let success = 0;
    let failed = 0;

    for (const job of batch.jobs) {
      if (job.status === "queued") {
        queued += 1;
      }

      if (job.status === "running") {
        running += 1;
      }

      if (job.status === "success") {
        success += 1;
      }

      if (job.status === "failed") {
        failed += 1;
      }
    }

    batch.queued = queued;
    batch.running = running;
    batch.success = success;
    batch.failed = failed;
    batch.updatedAt = nowIso();

    if (queued > 0 || running > 0) {
      batch.status = running > 0 ? "running" : "pending";
      this.persistBatchSnapshot(batch.id);
      return;
    }

    if (success === batch.total) {
      batch.status = "completed";
      this.persistBatchSnapshot(batch.id);
      return;
    }

    if (success > 0 && failed > 0) {
      batch.status = "completed_with_errors";
      this.persistBatchSnapshot(batch.id);
      return;
    }

    batch.status = "failed";
    this.persistBatchSnapshot(batch.id);
  }

  private async waitForStartWindow() {
    if (this.config.minStartDelayMs <= 0) {
      this.lastJobStartAt = Date.now();
      return;
    }

    const previousGate = this.startGate;
    let releaseCurrentGate!: () => void;
    this.startGate = new Promise<void>((resolve) => {
      releaseCurrentGate = resolve;
    });

    await previousGate;

    const elapsedSinceLastStart = Date.now() - this.lastJobStartAt;
    const waitMs = this.config.minStartDelayMs - elapsedSinceLastStart;

    if (waitMs > 0) {
      await sleep(waitMs);
    }

    this.lastJobStartAt = Date.now();
    releaseCurrentGate();
  }

  private async runJob(jobId: string) {
    const job = this.jobs.get(jobId);

    if (!job) {
      return;
    }

    const batch = this.batches.get(job.batchId);

    if (!batch) {
      return;
    }

    job.status = "running";
    job.attempts += 1;
    job.updatedAt = nowIso();
    this.updateBatchCounters(batch);

    try {
      await this.waitForStartWindow();

      const result = await processUploadedInput({
        originalFileName: job.payload.originalFileName,
        mimeType: job.payload.mimeType,
        buffer: job.payload.buffer,
      });

      job.result = result;
      job.error = undefined;
      job.status = "success";
      job.updatedAt = nowIso();
    } catch (error) {
      job.error = error instanceof Error ? error.message : "Unknown error";
      job.updatedAt = nowIso();

      if (job.attempts <= job.maxRetries) {
        job.status = "queued";
        this.queue.push(job.id);
      } else {
        job.status = "failed";
      }
    } finally {
      this.updateBatchCounters(batch);
    }
  }

  private drain() {
    while (this.runningCount < this.config.maxConcurrentJobs && this.queue.length > 0) {
      const nextJobId = this.queue.shift();

      if (!nextJobId) {
        break;
      }

      this.runningCount += 1;

      void this.runJob(nextJobId).finally(() => {
        this.runningCount -= 1;
        this.drain();
      });
    }
  }
}

export const generationBatchQueue = new GenerationBatchQueue();
