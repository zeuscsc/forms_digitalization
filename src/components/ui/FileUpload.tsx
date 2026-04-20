"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, X, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { Button } from "./Button";

export interface FileUploadResult {
  success: boolean;
  message: string;
  route?: string;
  slug?: string;
  pdfPath?: string;
  uploadedAt?: string;
  originalFileName?: string;
  designer?: any;
}

interface BatchJobResult {
  id: string;
  status: "queued" | "running" | "success" | "failed";
  attempts: number;
  maxRetries: number;
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

interface BatchProgress {
  id: string;
  status: "pending" | "running" | "completed" | "completed_with_errors" | "failed";
  total: number;
  queued: number;
  running: number;
  success: number;
  failed: number;
  jobs: BatchJobResult[];
}

export interface BatchUploadSummary {
  batchId: string;
  total: number;
  success: number;
  failed: number;
  status: BatchProgress["status"];
  jobs: BatchJobResult[];
}

interface FileUploadProps {
  onUploadSuccess?: (file: File, result?: FileUploadResult) => void;
  onBatchComplete?: (summary: BatchUploadSummary) => void;
  endpoint?: string;
  acceptedFileTypes?: string[];
  maxSizeMB?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onBatchComplete,
  endpoint,
  acceptedFileTypes = [".pdf"],
  maxSizeMB = 10,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchPollRef = useRef<number | null>(null);

  const stopBatchPolling = () => {
    if (batchPollRef.current !== null) {
      window.clearInterval(batchPollRef.current);
      batchPollRef.current = null;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (file: File): string | null => {
    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!acceptedFileTypes.includes(extension)) {
      return `Invalid file type: ${file.name}. Please upload ${acceptedFileTypes.join(", ")}`;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size exceeds ${maxSizeMB}MB: ${file.name}`;
    }

    return null;
  };

  const validateFiles = (candidateFiles: File[]) => {
    const errors: string[] = [];
    const validFiles: File[] = [];

    for (const file of candidateFiles) {
      const validationError = validateFile(file);

      if (validationError) {
        errors.push(validationError);
        continue;
      }

      validFiles.push(file);
    }

    if (errors.length > 0) {
      setError(errors[0]);
    }

    return validFiles;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(droppedFiles);

    if (validFiles.length > 0) {
      setFiles(validFiles);
      setBatchProgress(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = validateFiles(selectedFiles);

    if (validFiles.length > 0) {
      setFiles(validFiles);
      setBatchProgress(null);
    }
  };

  const handleRemoveFiles = () => {
    stopBatchPolling();
    setFiles([]);
    setBatchProgress(null);
    setError(null);
    setSuccessMessage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resolveBatchEndpoint = () => {
    if (!endpoint) {
      return null;
    }

    return endpoint.endsWith("/") ? `${endpoint}batch` : `${endpoint}/batch`;
  };

  const finalizeBatchProgress = (batch: BatchProgress) => {
    setBatchProgress(batch);
    setIsUploading(false);
    stopBatchPolling();

    const summary: BatchUploadSummary = {
      batchId: batch.id,
      total: batch.total,
      success: batch.success,
      failed: batch.failed,
      status: batch.status,
      jobs: batch.jobs,
    };

    onBatchComplete?.(summary);

    if (batch.status === "completed") {
      setSuccessMessage(`Batch completed: ${batch.success}/${batch.total} succeeded.`);
      return;
    }

    if (batch.status === "completed_with_errors") {
      setSuccessMessage(`Batch completed with errors: ${batch.success}/${batch.total} succeeded.`);
      return;
    }

    setError("Batch failed. Please review errors and retry.");
  };

  const startBatchPolling = (batchId: string) => {
    stopBatchPolling();

    const poll = async () => {
      try {
        const response = await fetch(`/api/generate-form/batch/${batchId}`, {
          method: "GET",
          cache: "no-store",
        });

        const payload = (await response.json()) as {
          batch?: BatchProgress;
          error?: string;
        };

        if (!response.ok || !payload.batch) {
          throw new Error(payload.error || "Unable to read batch progress.");
        }

        setBatchProgress(payload.batch);

        if (
          payload.batch.status === "completed" ||
          payload.batch.status === "completed_with_errors" ||
          payload.batch.status === "failed"
        ) {
          finalizeBatchProgress(payload.batch);
        }
      } catch (pollError) {
        setIsUploading(false);
        stopBatchPolling();
        setError(pollError instanceof Error ? pollError.message : "Unable to read batch progress.");
      }
    };

    void poll();
    batchPollRef.current = window.setInterval(() => {
      void poll();
    }, 1500);
  };

  const uploadSingleFile = async (file: File, useImageFallback: boolean = false) => {
    if (!endpoint) {
      onUploadSuccess?.(file);
      setSuccessMessage("Seed file attached to the workspace.");
      return;
    }

    let fileToUpload = file;

    if (useImageFallback && file.type === "application/pdf") {
      setSuccessMessage("Converting PDF to image for fallback...");
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (context) {
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvas: canvas, viewport }).promise;
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));

        if (blob) {
          fileToUpload = new File([blob], file.name.replace(".pdf", ".jpg"), { type: "image/jpeg" });
        }
      }
    }

    const formData = new FormData();
    formData.append("file", fileToUpload);

    setSuccessMessage(useImageFallback ? "Uploading converted image..." : null);
    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    const result = (await response.json()) as FileUploadResult & { error?: string };

    if (!response.ok) {
      if (!useImageFallback && file.type === "application/pdf") {
        await uploadSingleFile(file, true);
        return;
      }

      throw new Error(result.error || "Unable to generate the page from the uploaded PDF.");
    }

    setSuccessMessage(result.message || "Generated page is ready.");
    onUploadSuccess?.(file, result);
  };

  const uploadBatch = async (selectedFiles: File[]) => {
    const batchEndpoint = resolveBatchEndpoint();

    if (!batchEndpoint) {
      throw new Error("Batch upload requires an endpoint.");
    }

    const formData = new FormData();

    for (const selectedFile of selectedFiles) {
      formData.append("files", selectedFile);
    }

    const response = await fetch(batchEndpoint, {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json()) as {
      success?: boolean;
      message?: string;
      error?: string;
      batch?: BatchProgress;
    };

    if (!response.ok || !payload.batch) {
      throw new Error(payload.error || "Unable to enqueue batch upload.");
    }

    setSuccessMessage(payload.message || "Batch accepted and queued.");
    setBatchProgress(payload.batch);
    startBatchPolling(payload.batch.id);
  };

  const handleStartUpload = async () => {
    if (files.length === 0) {
      return;
    }

    setIsUploading(true);
    setBatchProgress(null);
    setError(null);
    setSuccessMessage(null);

    try {
      if (files.length === 1) {
        await uploadSingleFile(files[0]);
      } else {
        await uploadBatch(files);
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed. Please try again.");
    } finally {
      if (files.length === 1) {
        setIsUploading(false);
      }
    }
  };

  React.useEffect(() => {
    return () => {
      stopBatchPolling();
    };
  }, []);

  return (
    <div className="w-full">
      {files.length === 0 ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all duration-300 group cursor-pointer ${
            isDragging
              ? "border-hsbc-red bg-red-50/30 scale-[1.01] shadow-xl shadow-red-500/5"
              : "border-gray-200 bg-white hover:border-hsbc-red hover:shadow-lg hover:shadow-gray-200/50"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept={acceptedFileTypes.join(",")}
            multiple
            className="hidden"
          />
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${
            isDragging ? "bg-hsbc-red text-white" : "bg-gray-50 text-gray-400 group-hover:bg-red-50 group-hover:text-hsbc-red"
          }`}>
            <Upload size={32} strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Upload PDF forms
          </h3>
          <p className="text-xs text-gray-400 text-center mb-6 max-w-[200px] leading-relaxed font-medium">
            Drag and drop one or many PDFs here, or <span className="text-hsbc-red font-bold">browse</span>
          </p>
          <div className="flex gap-2">
            {acceptedFileTypes.map((ext) => (
              <span
                key={ext}
                className="px-2 py-1 bg-gray-50 text-gray-400 text-[9px] tracking-widest rounded-full font-bold uppercase border border-gray-100"
              >
                {ext.replace(".", "")}
              </span>
            ))}
          </div>
          {error && (
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <p className="text-[10px] text-hsbc-red font-bold bg-red-50 inline-block px-3 py-1 rounded-full">{error}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xl shadow-gray-200/50 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-hsbc-red shadow-inner flex-shrink-0">
              <FileText size={24} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-gray-900 truncate mb-0.5">
                {files.length === 1 ? files[0].name : `${files.length} files selected`}
              </h4>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                {`${(files.reduce((total, file) => total + file.size, 0) / (1024 * 1024)).toFixed(2)} MB • ${files.length} PDF`}
              </p>
            </div>
            {!isUploading && (
              <button
                onClick={handleRemoveFiles}
                className="p-2 hover:bg-red-50 hover:text-hsbc-red rounded-full transition-all duration-300 text-gray-300"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {files.length > 1 ? (
            <div className="mb-5 max-h-36 overflow-y-auto rounded-2xl border border-gray-100 bg-gray-50 px-3 py-2">
              {files.slice(0, 8).map((entry) => (
                <div key={`${entry.name}-${entry.size}`} className="truncate py-1 text-[11px] text-gray-500">
                  {entry.name}
                </div>
              ))}
              {files.length > 8 ? (
                <div className="pt-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  +{files.length - 8} more
                </div>
              ) : null}
            </div>
          ) : null}

          {isUploading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
                <span className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="animate-spin text-hsbc-red" size={14} />
                  {files.length > 1 ? "Queueing and processing batch..." : "Uploading and generating..."}
                </span>
                <span className="text-hsbc-red tabular-nums">AI</span>
              </div>
              <div className="h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                <div className="h-full bg-hsbc-red w-full animate-pulse rounded-full shadow-lg shadow-red-500/20"></div>
              </div>
              {batchProgress ? (
                <div className="grid grid-cols-4 gap-2 text-[10px] uppercase tracking-wider text-gray-500">
                  <div className="rounded-lg bg-gray-50 px-2 py-1 text-center">Q {batchProgress.queued}</div>
                  <div className="rounded-lg bg-gray-50 px-2 py-1 text-center">R {batchProgress.running}</div>
                  <div className="rounded-lg bg-green-50 px-2 py-1 text-center text-green-700">S {batchProgress.success}</div>
                  <div className="rounded-lg bg-red-50 px-2 py-1 text-center text-hsbc-red">F {batchProgress.failed}</div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-[11px] text-green-600 font-black justify-center bg-green-50/50 py-2.5 rounded-xl border border-green-100 uppercase tracking-widest">
                <CheckCircle2 size={14} />
                Ready to digitize
              </div>
              {successMessage ? (
                <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-xs font-medium leading-relaxed text-green-700">
                  {successMessage}
                </div>
              ) : null}
              {error ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium leading-relaxed text-hsbc-red">
                  {error}
                </div>
              ) : null}
              <Button
                onClick={handleStartUpload}
                loading={isUploading}
                className="w-full py-4 text-sm font-bold rounded-2xl shadow-lg shadow-hsbc-red/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {files.length > 1 ? `Start AI Batch Digitization (${files.length})` : "Start AI Digitization"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
