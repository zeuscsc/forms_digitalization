"use client";

import React from "react";
import Image from "next/image";
import { Copy, Download, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DesignerHeaderProps {
  activeFormSlug: string | null;
  designerName: string;
  designerSummary: string;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  saveError: string | null;
  saveStateLabel: string;
  onExport: () => void;
  onImport: (file: File) => void | Promise<void>;
  onReset: () => void;
  onSave: () => void;
  onSaveAs: () => void;
}

export function DesignerHeader({
  activeFormSlug,
  designerName,
  designerSummary,
  hasUnsavedChanges,
  isSaving,
  saveError,
  saveStateLabel,
  onExport,
  onImport,
  onReset,
  onSave,
  onSaveAs,
}: DesignerHeaderProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportClick = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      void onImport(file);
      event.target.value = "";
    },
    [onImport]
  );

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-6 px-6 py-4 xl:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-black/5 bg-white shadow-sm">
            <Image src="/hsbc-logo.webp" alt="HSBC Logo" width={34} height={34} className="object-contain" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-black uppercase tracking-[0.22em] text-hsbc-red">Mobile Form Studio</div>
            <h1 className="truncate text-xl font-black tracking-tight">{designerName}</h1>
            <p className="truncate text-sm text-hsbc-gray-400">{designerSummary}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input ref={fileInputRef} type="file" accept="application/json,.json" className="hidden" onChange={handleFileChange} />
          <div className="hidden text-right md:block">
            <div className={`text-[11px] font-black uppercase tracking-[0.18em] ${hasUnsavedChanges ? "text-hsbc-red" : "text-green-600"}`}>
              {saveStateLabel}
            </div>
            <p className="text-xs text-hsbc-gray-400">
              {activeFormSlug ? `Draft ID: ${activeFormSlug}` : "This workspace has not been saved yet."}
            </p>
          </div>
          <Button variant="primary" onClick={onSave} disabled={isSaving || !hasUnsavedChanges} className="md:w-auto">
            <Save size={16} className="mr-2" />
            Save
          </Button>
          <Button variant="outline" onClick={onSaveAs} disabled={isSaving} className="md:w-auto">
            <Copy size={16} className="mr-2" />
            Save As
          </Button>
          <Button variant="outline" onClick={handleImportClick} disabled={isSaving} className="md:w-auto">
            <Upload size={16} className="mr-2" />
            Import JSON
          </Button>
          <Button variant="outline" onClick={onExport} className="md:w-auto">
            <Download size={16} className="mr-2" />
            Export JSON
          </Button>
          <Button variant="secondary" onClick={onReset} className="md:w-auto">
            Reset Workspace
          </Button>
        </div>
      </div>

      {saveError ? <div className="mx-auto max-w-[1800px] px-6 pb-4 text-sm font-medium text-hsbc-red xl:px-8">{saveError}</div> : null}
    </header>
  );
}