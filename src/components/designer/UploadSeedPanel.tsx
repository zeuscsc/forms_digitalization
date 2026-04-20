"use client";

import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FileUpload, type BatchUploadSummary, type FileUploadResult } from "@/components/ui/FileUpload";
import { formatUploadedAt, getRecentFormState, type RecentGeneratedForm } from "@/lib/designerWorkspace";

interface UploadSeedPanelProps {
  generatedRoute: string | null;
  isRecentFormsLoading: boolean;
  openingRecentSlug: string | null;
  recentForms: RecentGeneratedForm[];
  recentFormsError: string | null;
  seedFileName: string | null;
  onOpenRecentForm: (form: RecentGeneratedForm) => void | Promise<void>;
  onRefreshRecentForms: () => void | Promise<void>;
  onUploadSuccess: (file: File, result?: FileUploadResult) => void;
  onBatchComplete?: (summary: BatchUploadSummary) => void;
}

export function UploadSeedPanel({
  generatedRoute,
  isRecentFormsLoading,
  openingRecentSlug,
  recentForms,
  recentFormsError,
  seedFileName,
  onOpenRecentForm,
  onRefreshRecentForms,
  onUploadSuccess,
  onBatchComplete,
}: UploadSeedPanelProps) {
  return (
    <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-hsbc-red">Upload + Seed</div>
          <h2 className="mt-2 text-lg font-black">Bring in the source file</h2>
        </div>
        <div className="rounded-2xl bg-red-50 p-3 text-hsbc-red">
          <UploadCloud size={18} />
        </div>
      </div>

      <FileUpload endpoint="/api/generate-form" onBatchComplete={onBatchComplete} onUploadSuccess={onUploadSuccess} />

      <div className="mt-4 rounded-2xl border border-dashed border-hsbc-gray-200 bg-hsbc-gray-50 px-4 py-3 text-xs leading-relaxed text-hsbc-gray-500">
        {generatedRoute
          ? `Schema generated. The uploaded file now drives the workspace name and context while you refine the mobile flow manually.`
          : seedFileName
            ? `Current seed: ${seedFileName}. The uploaded file now drives the workspace name and context while you refine the mobile flow manually.`
            : "Upload a PDF to generate a dynamic form via LiteLLM, then refine the structure and mobile flow with the shared UI components on the left."}
      </div>

      <div className="mt-5 rounded-2xl border border-black/5 bg-[#fcfaf7] p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-hsbc-red">Recent Uploads</div>
            <p className="mt-1 text-xs leading-relaxed text-hsbc-gray-500">
              Reopen a generated upload or the latest saved studio draft for any form you have worked on.
            </p>
          </div>
          <Button
            type="button"
            variant="tertiary"
            onClick={() => void onRefreshRecentForms()}
            className="min-h-[36px] px-3 py-2 text-xs font-bold md:w-auto"
          >
            Refresh
          </Button>
        </div>

        {isRecentFormsLoading ? (
          <div className="rounded-2xl border border-dashed border-hsbc-gray-200 bg-white px-4 py-3 text-xs text-hsbc-gray-500">
            Loading previously uploaded forms...
          </div>
        ) : null}

        {!isRecentFormsLoading && recentFormsError ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs leading-relaxed text-hsbc-red">
            {recentFormsError}
          </div>
        ) : null}

        {!isRecentFormsLoading && !recentFormsError && recentForms.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-hsbc-gray-200 bg-white px-4 py-3 text-xs leading-relaxed text-hsbc-gray-500">
            No saved uploads or drafts found yet.
          </div>
        ) : null}

        {!isRecentFormsLoading && !recentFormsError && recentForms.length > 0 ? (
          <div className="space-y-2">
            {recentForms.slice(0, 6).map((form) => {
              const state = getRecentFormState(form);

              return (
                <div key={form.slug} className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white px-3 py-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${state.badgeClassName}`} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold text-hsbc-black">{form.displayName}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-hsbc-gray-400">
                      <span>{state.label}</span>
                      <span>&bull;</span>
                      <span>{formatUploadedAt(form.lastUpdatedAt)}</span>
                    </div>
                    <div className="mt-1 truncate text-[11px] text-hsbc-gray-500">
                      {form.originalFileName || form.pdfFileName}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant={state.canLoad ? "outline" : "tertiary"}
                    onClick={() => void onOpenRecentForm(form)}
                    disabled={!state.canLoad || openingRecentSlug === form.slug}
                    loading={openingRecentSlug === form.slug}
                    className="min-h-[38px] px-3 py-2 text-xs font-bold md:w-auto"
                  >
                    {state.canLoad ? "Load" : "Unavailable"}
                  </Button>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}