"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ZodError } from "zod";
import { ActivityLogPanel } from "@/components/designer/ActivityLogPanel";
import { BlueprintPanel } from "@/components/designer/BlueprintPanel";
import { ComponentLibraryPanel } from "@/components/designer/ComponentLibraryPanel";
import { DesignerHeader } from "@/components/designer/DesignerHeader";
import { InspectorPanel } from "@/components/designer/InspectorPanel";
import { PreviewTestingPanel } from "@/components/designer/PreviewTestingPanel";
import { ThemePanel } from "@/components/designer/ThemePanel";
import { UploadSeedPanel } from "@/components/designer/UploadSeedPanel";
import { type BatchUploadSummary, type FileUploadResult } from "@/components/ui/FileUpload";
import { useDesignerPersistence } from "@/hooks/useDesignerPersistence";
import { useDesignerWorkspace } from "@/hooks/useDesignerWorkspace";
import { useRecentFormsRegistry } from "@/hooks/useRecentFormsRegistry";
import { DEVICE_PRESETS, createBlankDesigner, parseDesignerDocument } from "@/lib/formDesigner";
import { getFirstSelection, sanitizeFileName, type RecentGeneratedForm } from "@/lib/designerWorkspace";

export default function Home() {
  const router = useRouter();
  const workspace = useDesignerWorkspace();
  const recentForms = useRecentFormsRegistry();
  const persistence = useDesignerPersistence({
    designer: workspace.designer,
    appendLog: workspace.appendLog,
    loadRecentForms: recentForms.loadRecentForms,
  });

  const [devicePresetId, setDevicePresetId] = React.useState<string>(DEVICE_PRESETS[0].id);
  const [validationMode, setValidationMode] = React.useState<"manual" | "live">("live");
  const [payloadPreview, setPayloadPreview] = React.useState<Record<string, unknown>>({});
  const [submittedPayload, setSubmittedPayload] = React.useState<Record<string, unknown> | null>(null);

  const handleSeedUpload = React.useCallback(
    (file: File, result?: FileUploadResult) => {
      const readableName = sanitizeFileName(file.name);

      persistence.markSeedUploaded({
        seedFileName: file.name,
        generatedRoute: result?.route ?? null,
        activeFormSlug: result?.slug ?? null,
        pdfPath: result?.pdfPath ?? null,
      });

      workspace.commitDesigner((draft) => {
        draft.name = readableName || draft.name;
        draft.summary = `Seeded from ${file.name}. Continue refining structure, components, and validation rules.`;
        draft.theme.appTitle = readableName || draft.theme.appTitle;
        draft.theme.appSubtitle = "PDF uploaded. Use the editor to finalize structure, content, and behavior.";
      });

      workspace.appendLog(`Uploaded ${file.name} as the current design seed`);
      void recentForms.loadRecentForms();

      if (result?.designer) {
        try {
          const parsed = parseDesignerDocument(result.designer);
          workspace.replaceDesigner(parsed, getFirstSelection(parsed));
          persistence.resetDraftState(parsed);
          setSubmittedPayload(null);
          setPayloadPreview({});
          workspace.appendLog(`Loaded generated schema for ${result.slug ?? result.route} into the studio editor`);
        } catch (e) {
          console.error("Failed to parse generated designer document", e);
          workspace.appendLog(`Generated schema for ${result.slug ?? result.route} was invalid`);
        }
      } else if (result?.route) {
        workspace.appendLog(`Generated form schema for ${result.slug ?? result.route} with LiteLLM`);
        router.push(result.route);
      }
    },
    [persistence, recentForms, router, workspace]
  );

  const handleOpenRecentForm = React.useCallback(
    async (form: RecentGeneratedForm) => {
      const result = await recentForms.openRecentForm(form);

      if (!result) {
        return;
      }

      workspace.replaceDesigner(result.designer, getFirstSelection(result.designer));
      persistence.applyOpenedForm(form, result.designer);
      setSubmittedPayload(null);
      setPayloadPreview({});
      workspace.appendLog(`Loaded ${form.displayName} into the studio editor`);
    },
    [persistence, recentForms, workspace]
  );

  const handleBatchUploadComplete = React.useCallback(
    (summary: BatchUploadSummary) => {
      const statusLabel =
        summary.status === "completed"
          ? "completed"
          : summary.status === "completed_with_errors"
            ? "completed with errors"
            : "failed";

      workspace.appendLog(
        `Batch ${summary.batchId} ${statusLabel}: ${summary.success}/${summary.total} succeeded${summary.failed > 0 ? `, ${summary.failed} failed` : ""}`
      );
      void recentForms.loadRecentForms();
    },
    [recentForms, workspace]
  );

  const handleReset = React.useCallback(() => {
    const nextDesigner = createBlankDesigner();

    workspace.replaceDesigner(nextDesigner, getFirstSelection(nextDesigner));
    workspace.resetActivityLog();
    persistence.resetDraftState(nextDesigner);
    setSubmittedPayload(null);
    setPayloadPreview({});
    workspace.appendLog("Workspace reset to a blank form");
  }, [persistence, workspace]);

  const handleImportJson = React.useCallback(
    async (file: File) => {
      try {
        const source = await file.text();
        const parsed = parseDesignerDocument(JSON.parse(source));

        workspace.replaceDesigner(parsed, getFirstSelection(parsed));
        workspace.resetActivityLog();
        persistence.resetDraftState(parsed);
        setSubmittedPayload(null);
        setPayloadPreview({});
        workspace.appendLog(`Imported ${file.name} into the studio editor`);
      } catch (error) {
        if (error instanceof SyntaxError) {
          persistence.setSaveError("The selected file does not contain valid JSON.");
        } else if (error instanceof ZodError) {
          persistence.setSaveError(error.issues[0]?.message ?? "The selected JSON file is not a valid designer document.");
        } else {
          persistence.setSaveError(error instanceof Error ? error.message : "Unable to import the selected JSON file.");
        }

        workspace.appendLog(`Failed to import ${file.name}`);
      }
    },
    [persistence, workspace]
  );

  return (
    <div className="min-h-screen bg-[#f6f3ee] text-hsbc-black">
      <DesignerHeader
        activeFormSlug={persistence.activeFormSlug}
        designerName={workspace.designer.name}
        designerSummary={workspace.designer.summary}
        hasUnsavedChanges={persistence.hasUnsavedChanges}
        isSaving={persistence.isSaving}
        saveError={persistence.saveError}
        saveStateLabel={persistence.saveStateLabel}
        onExport={persistence.exportJson}
        onImport={handleImportJson}
        onReset={handleReset}
        onSave={() => void persistence.saveDesigner("save")}
        onSaveAs={() => void persistence.saveDesigner("save-as")}
      />

      <div className="mx-auto grid min-h-[calc(100vh-81px)] max-w-[1800px] lg:grid-cols-[minmax(760px,1.45fr)_minmax(380px,0.95fr)]">
        <section className="overflow-y-auto border-r border-black/5 bg-[#fcfaf7]">
          <div className="space-y-6 p-6 xl:p-8">
            <div className="grid gap-4 xl:grid-cols-[minmax(260px,0.9fr)_minmax(360px,1.1fr)]">
              <UploadSeedPanel
                generatedRoute={persistence.generatedRoute}
                isRecentFormsLoading={recentForms.isRecentFormsLoading}
                openingRecentSlug={recentForms.openingRecentSlug}
                recentForms={recentForms.recentForms}
                recentFormsError={recentForms.recentFormsError}
                seedFileName={persistence.seedFileName}
                onBatchComplete={handleBatchUploadComplete}
                onOpenRecentForm={handleOpenRecentForm}
                onRefreshRecentForms={() => recentForms.loadRecentForms()}
                onUploadSuccess={handleSeedUpload}
              />

              <ThemePanel
                designerName={workspace.designer.name}
                theme={workspace.designer.theme}
                onUpdateDesignerName={workspace.updateDesignerName}
                onUpdateTheme={workspace.updateTheme}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(320px,0.9fr)_minmax(420px,1.1fr)]">
              <div className="space-y-6">
                <BlueprintPanel
                  designer={workspace.designer}
                  selection={workspace.selection}
                  onAddSectionToStep={workspace.addSectionToStep}
                  onAddStep={workspace.addStep}
                  onMoveField={workspace.moveField}
                  onMoveSection={workspace.moveSection}
                  onMoveStep={workspace.moveStep}
                  onRemoveField={workspace.removeField}
                  onRemoveSection={workspace.removeSection}
                  onRemoveStep={workspace.removeStep}
                  onSelect={workspace.setSelection}
                />

                <ComponentLibraryPanel
                  canInsertFields={Boolean(workspace.activeSectionSelection)}
                  onAddField={workspace.addField}
                />
              </div>

              <div className="space-y-6">
                <InspectorPanel
                  selection={workspace.selection}
                  snapshot={workspace.snapshot}
                  onAddRadioOption={workspace.addRadioOption}
                  onRemoveRadioOption={workspace.removeRadioOption}
                  onUpdateField={workspace.updateField}
                  onUpdateRadioOption={workspace.updateRadioOption}
                  onUpdateSection={workspace.updateSection}
                  onUpdateStep={workspace.updateStep}
                />

                <ActivityLogPanel entries={workspace.activityLog} />
              </div>
            </div>
          </div>
        </section>

        <PreviewTestingPanel
          designer={workspace.designer}
          devicePresetId={devicePresetId}
          payloadPreview={payloadPreview}
          submittedPayload={submittedPayload}
          validationMode={validationMode}
          onDevicePresetChange={setDevicePresetId}
          onPayloadChange={setPayloadPreview}
          onSubmitPayload={(payload) => {
            setSubmittedPayload(payload);
            workspace.appendLog("Submitted a test payload from the live mobile preview");
          }}
          onValidationModeChange={setValidationMode}
        />
      </div>
    </div>
  );
}