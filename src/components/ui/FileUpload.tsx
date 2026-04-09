"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, X, CheckCircle2, Loader2 } from "lucide-react";
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

interface FileUploadProps {
  onUploadSuccess?: (file: File, result?: FileUploadResult) => void;
  endpoint?: string;
  acceptedFileTypes?: string[];
  maxSizeMB?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  endpoint,
  acceptedFileTypes = [".pdf"],
  maxSizeMB = 10,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (file: File): boolean => {
    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!acceptedFileTypes.includes(extension)) {
      setError(`Invalid file type. Please upload ${acceptedFileTypes.join(", ")}`);
      return false;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB`);
      return false;
    }
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    setSuccessMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleStartUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (!endpoint) {
        onUploadSuccess?.(file);
        setSuccessMessage("Seed file attached to the workspace.");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as FileUploadResult & { error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Unable to generate the page from the uploaded PDF.");
      }

      setSuccessMessage(result.message || "Generated page is ready.");
      onUploadSuccess?.(file, result);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      {!file ? (
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
            className="hidden"
          />
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${
            isDragging ? "bg-hsbc-red text-white" : "bg-gray-50 text-gray-400 group-hover:bg-red-50 group-hover:text-hsbc-red"
          }`}>
            <Upload size={32} strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Upload PDF form
          </h3>
          <p className="text-xs text-gray-400 text-center mb-6 max-w-[200px] leading-relaxed font-medium">
            Drag and drop your PDF here, or <span className="text-hsbc-red font-bold">browse</span>
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
                {file.name}
              </h4>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF
              </p>
            </div>
            {!isUploading && (
              <button
                onClick={handleRemoveFile}
                className="p-2 hover:bg-red-50 hover:text-hsbc-red rounded-full transition-all duration-300 text-gray-300"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {isUploading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
                <span className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="animate-spin text-hsbc-red" size={14} />
                  Uploading and generating...
                </span>
                <span className="text-hsbc-red tabular-nums">AI</span>
              </div>
              <div className="h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                <div className="h-full bg-hsbc-red w-full animate-pulse rounded-full shadow-lg shadow-red-500/20"></div>
              </div>
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
                Start AI Digitization
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
