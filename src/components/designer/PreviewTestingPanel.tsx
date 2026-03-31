"use client";

import React from "react";
import { LayoutTemplate, Smartphone, Sparkles } from "lucide-react";
import { FormDesignerPreview } from "@/components/designer/FormDesignerPreview";
import { DEVICE_PRESETS, type FormDesignerDocument } from "@/lib/formDesigner";

type PreviewPayload = Record<string, string | number | boolean | undefined>;

interface PreviewTestingPanelProps {
  designer: FormDesignerDocument;
  devicePresetId: string;
  payloadPreview: Record<string, unknown>;
  submittedPayload: Record<string, unknown> | null;
  validationMode: "manual" | "live";
  onDevicePresetChange: (value: string) => void;
  onPayloadChange: (payload: PreviewPayload) => void;
  onSubmitPayload: (payload: PreviewPayload) => void;
  onValidationModeChange: (value: "manual" | "live") => void;
}

export function PreviewTestingPanel({
  designer,
  devicePresetId,
  payloadPreview,
  submittedPayload,
  validationMode,
  onDevicePresetChange,
  onPayloadChange,
  onSubmitPayload,
  onValidationModeChange,
}: PreviewTestingPanelProps) {
  const devicePreset = React.useMemo(
    () => DEVICE_PRESETS.find((preset) => preset.id === devicePresetId) ?? DEVICE_PRESETS[0],
    [devicePresetId]
  );

  return (
    <aside className="relative overflow-y-auto bg-[radial-gradient(circle_at_top,#ffffff_0%,#f5f3ee_42%,#ebe6dc_100%)]">
      <div className="sticky top-[81px] p-6 xl:p-8">
        <div className="rounded-[32px] border border-white/70 bg-white/70 p-5 shadow-xl shadow-black/5 backdrop-blur-sm">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-hsbc-red">Preview + Testing</div>
              <h2 className="mt-2 text-lg font-black">Interactive mobile validation lab</h2>
            </div>
            <div className="rounded-2xl bg-red-50 p-3 text-hsbc-red">
              <Smartphone size={18} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-hsbc-black">
              <span>Device preset</span>
              <select value={devicePresetId} onChange={(event) => onDevicePresetChange(event.target.value)} className="min-h-[48px] w-full border border-hsbc-gray-300 bg-white px-4 text-sm focus:border-b-2 focus:border-b-hsbc-black focus:outline-none">
                {DEVICE_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>{preset.label}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-hsbc-black">
              <span>Validation mode</span>
              <select value={validationMode} onChange={(event) => onValidationModeChange(event.target.value as "manual" | "live")} className="min-h-[48px] w-full border border-hsbc-gray-300 bg-white px-4 text-sm focus:border-b-2 focus:border-b-hsbc-black focus:outline-none">
                <option value="live">Live validation</option>
                <option value="manual">Validate on navigation / submit</option>
              </select>
            </label>
          </div>

          <div className="mt-4 rounded-2xl border border-dashed border-hsbc-gray-200 bg-hsbc-gray-50 px-4 py-3 text-xs leading-relaxed text-hsbc-gray-500">
            The right side runs the same shared HSBC mobile components you select on the left. Use it to verify order, copy, validation, and the payload shape before export.
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <FormDesignerPreview
            key={`${validationMode}-${designer.id}-${designer.steps.length}`}
            designer={designer}
            devicePreset={devicePreset}
            validationMode={validationMode}
            onPayloadChange={onPayloadChange}
            onSubmitPayload={onSubmitPayload}
          />
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-lg shadow-black/5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-hsbc-red">Current Payload</div>
                <div className="mt-1 text-sm font-bold">Live form values</div>
              </div>
              <Sparkles size={16} className="text-hsbc-red" />
            </div>
            <pre className="max-h-[280px] overflow-auto rounded-2xl bg-[#1f1f22] p-4 text-xs leading-relaxed text-[#e4e4e7]">{JSON.stringify(payloadPreview, null, 2)}</pre>
          </div>

          <div className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-lg shadow-black/5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-hsbc-red">Last Submission</div>
                <div className="mt-1 text-sm font-bold">Captured submit payload</div>
              </div>
              <LayoutTemplate size={16} className="text-hsbc-red" />
            </div>
            <pre className="max-h-[220px] overflow-auto rounded-2xl bg-[#101114] p-4 text-xs leading-relaxed text-[#d4d4d8]">{JSON.stringify(submittedPayload ?? { status: "Waiting for first submit" }, null, 2)}</pre>
          </div>
        </div>
      </div>
    </aside>
  );
}