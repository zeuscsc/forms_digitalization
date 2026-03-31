"use client";

import React from "react";
import type { FormDesignerDocument } from "@/lib/formDesigner";
import type { RecentGeneratedForm, SaveGeneratedFormResponse } from "@/lib/designerWorkspace";

interface SeedUploadState {
  activeFormSlug?: string | null;
  generatedRoute?: string | null;
  pdfPath?: string | null;
  seedFileName: string;
}

interface UseDesignerPersistenceOptions {
  designer: FormDesignerDocument;
  appendLog: (message: string) => void;
  loadRecentForms: () => Promise<void>;
}

export function useDesignerPersistence({
  designer,
  appendLog,
  loadRecentForms,
}: UseDesignerPersistenceOptions) {
  const [seedFileName, setSeedFileName] = React.useState<string | null>(null);
  const [generatedRoute, setGeneratedRoute] = React.useState<string | null>(null);
  const [activeFormSlug, setActiveFormSlug] = React.useState<string | null>(null);
  const [activePdfPath, setActivePdfPath] = React.useState<string | null>(null);
  const [hasSavedDraft, setHasSavedDraft] = React.useState<boolean>(false);
  const [lastSavedSignature, setLastSavedSignature] = React.useState<string>(() => JSON.stringify(designer));
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  const designerSignature = React.useMemo(() => JSON.stringify(designer), [designer]);
  const hasUnsavedChanges = !hasSavedDraft || designerSignature !== lastSavedSignature;
  const saveStateLabel = hasUnsavedChanges
    ? hasSavedDraft
      ? "Unsaved changes"
      : "Draft not saved"
    : "All changes saved";

  const markSeedUploaded = React.useCallback((seed: SeedUploadState) => {
    setSeedFileName(seed.seedFileName);
    setGeneratedRoute(seed.generatedRoute ?? null);
    setActiveFormSlug(seed.activeFormSlug ?? null);
    setActivePdfPath(seed.pdfPath ?? null);
    setHasSavedDraft(false);
    setLastSavedSignature("");
    setSaveError(null);
  }, []);

  const applyOpenedForm = React.useCallback((form: RecentGeneratedForm, nextDesigner: FormDesignerDocument) => {
    setSeedFileName(form.originalFileName || form.pdfFileName);
    setGeneratedRoute(form.hasGeneratedPage ? form.route : null);
    setActiveFormSlug(form.slug);
    setActivePdfPath(form.pdfPath || null);
    setHasSavedDraft(form.hasSavedDesigner);
    setLastSavedSignature(JSON.stringify(nextDesigner));
    setSaveError(null);
  }, []);

  const resetDraftState = React.useCallback((nextDesigner: FormDesignerDocument) => {
    setSeedFileName(null);
    setGeneratedRoute(null);
    setActiveFormSlug(null);
    setActivePdfPath(null);
    setHasSavedDraft(false);
    setLastSavedSignature(JSON.stringify(nextDesigner));
    setSaveError(null);
  }, []);

  const exportJson = React.useCallback(() => {
    const blob = new Blob([JSON.stringify(designer, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${designer.name.toLowerCase().replace(/\s+/g, "-") || "form-designer"}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    appendLog("Exported the current designer JSON");
  }, [appendLog, designer]);

  const saveDesigner = React.useCallback(
    async (mode: "save" | "save-as") => {
      if (isSaving) {
        return false;
      }

      setIsSaving(true);
      setSaveError(null);

      try {
        const response = await fetch("/api/generated-forms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            slug: mode === "save" ? activeFormSlug ?? undefined : undefined,
            route: mode === "save" ? generatedRoute ?? undefined : undefined,
            pdfPath: activePdfPath ?? undefined,
            originalFileName: seedFileName ?? undefined,
            displayName: designer.name,
            designer,
          }),
        });

        const result = (await response.json()) as SaveGeneratedFormResponse;

        if (!response.ok || !result.form) {
          throw new Error(result.error || "Unable to save the current draft.");
        }

        setActiveFormSlug(result.form.slug);
        setActivePdfPath(result.form.pdfPath || null);
        setGeneratedRoute(result.form.hasGeneratedPage ? result.form.route : null);
        setSeedFileName(result.form.originalFileName || seedFileName);
        setHasSavedDraft(true);
        setLastSavedSignature(designerSignature);
        appendLog(mode === "save" ? `Saved ${result.form.displayName}` : `Saved ${result.form.displayName} as a new draft`);
        await loadRecentForms();
        return true;
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : "Unable to save the current draft.");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [activeFormSlug, activePdfPath, appendLog, designer, designerSignature, generatedRoute, isSaving, loadRecentForms, seedFileName]
  );

  return {
    seedFileName,
    generatedRoute,
    activeFormSlug,
    activePdfPath,
    hasSavedDraft,
    hasUnsavedChanges,
    saveStateLabel,
    isSaving,
    saveError,
    setSaveError,
    markSeedUploaded,
    applyOpenedForm,
    resetDraftState,
    exportJson,
    saveDesigner,
  };
}