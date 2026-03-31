"use client";

import React from "react";
import { Plus, Trash2, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { textAreaClassName, type SelectionSnapshot } from "@/lib/designerWorkspace";
import type { DesignerFieldOption, DesignerSelection } from "@/lib/formDesigner";

interface InspectorPanelProps {
  selection: DesignerSelection | null;
  snapshot: SelectionSnapshot;
  onAddRadioOption: () => void;
  onRemoveRadioOption: (optionId: string) => void;
  onUpdateField: (key: string, value: string | number | boolean | undefined) => void;
  onUpdateRadioOption: (optionId: string, key: keyof DesignerFieldOption, value: string) => void;
  onUpdateSection: (key: "title" | "subtitle", value: string) => void;
  onUpdateStep: (key: "title" | "description", value: string) => void;
}

export function InspectorPanel({
  selection,
  snapshot,
  onAddRadioOption,
  onRemoveRadioOption,
  onUpdateField,
  onUpdateRadioOption,
  onUpdateSection,
  onUpdateStep,
}: InspectorPanelProps) {
  return (
    <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-hsbc-red">Inspector</div>
          <h2 className="mt-2 text-lg font-black">Edit the selected node</h2>
        </div>
        <div className="rounded-2xl bg-red-50 p-3 text-hsbc-red">
          <WandSparkles size={18} />
        </div>
      </div>

      {!selection ? (
        <div className="rounded-2xl border border-dashed border-hsbc-gray-200 bg-hsbc-gray-50 px-4 py-5 text-sm leading-relaxed text-hsbc-gray-500">
          Nothing is selected yet. Add the first step, or select a step, section, or field to edit its properties here.
        </div>
      ) : null}

      {selection?.type === "step" && snapshot.step ? (
        <div className="space-y-4">
          <Input label="Step title" value={snapshot.step.title} onChange={(event) => onUpdateStep("title", event.target.value)} />
          <div className="space-y-2">
            <label className="text-sm font-medium text-hsbc-black">Step description</label>
            <textarea value={snapshot.step.description || ""} onChange={(event) => onUpdateStep("description", event.target.value)} className={textAreaClassName()} />
          </div>
        </div>
      ) : null}

      {selection?.type === "section" && snapshot.section ? (
        <div className="space-y-4">
          <Input label="Section title" value={snapshot.section.title} onChange={(event) => onUpdateSection("title", event.target.value)} />
          <div className="space-y-2">
            <label className="text-sm font-medium text-hsbc-black">Section subtitle</label>
            <textarea value={snapshot.section.subtitle || ""} onChange={(event) => onUpdateSection("subtitle", event.target.value)} className={textAreaClassName()} />
          </div>
        </div>
      ) : null}

      {selection?.type === "field" && snapshot.field ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-dashed border-hsbc-gray-200 bg-hsbc-gray-50 px-4 py-3 text-xs text-hsbc-gray-500">
            Component: <span className="font-bold uppercase tracking-[0.16em] text-hsbc-black">{snapshot.field.component}</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Field label" value={snapshot.field.label} onChange={(event) => onUpdateField("label", event.target.value)} />
            <Input label="Field key" value={snapshot.field.key} onChange={(event) => onUpdateField("key", event.target.value)} />
          </div>
          <Input label="Helper text" value={snapshot.field.helperText || ""} onChange={(event) => onUpdateField("helperText", event.target.value)} />

          {snapshot.field.component !== "checkbox" && snapshot.field.component !== "declaration" && "placeholder" in snapshot.field ? (
            <Input label="Placeholder" value={snapshot.field.placeholder || ""} onChange={(event) => onUpdateField("placeholder", event.target.value)} />
          ) : null}

          <label className="flex items-center gap-3 rounded-2xl border border-hsbc-gray-200 bg-hsbc-gray-50 px-4 py-3 text-sm font-medium">
            <input type="checkbox" checked={Boolean(snapshot.field.required)} onChange={(event) => onUpdateField("required", event.target.checked)} className="h-4 w-4" />
            Required
          </label>

          {snapshot.field.component === "checkbox" || snapshot.field.component === "declaration" ? (
            <Input label="Checkbox label" value={snapshot.field.checkboxLabel} onChange={(event) => onUpdateField("checkboxLabel", event.target.value)} />
          ) : null}

          {snapshot.field.component === "declaration" ? (
            <>
              <Input label="Document title" value={snapshot.field.documentTitle || ""} onChange={(event) => onUpdateField("documentTitle", event.target.value)} />
              <label className="flex items-center gap-3 rounded-2xl border border-hsbc-gray-200 bg-hsbc-gray-50 px-4 py-3 text-sm font-medium">
                <input type="checkbox" checked={Boolean(snapshot.field.requireScroll)} onChange={(event) => onUpdateField("requireScroll", event.target.checked)} className="h-4 w-4" />
                Require scroll to unlock acceptance
              </label>
            </>
          ) : null}

          {snapshot.field.component === "text" ||
          snapshot.field.component === "email" ||
          snapshot.field.component === "tel" ||
          snapshot.field.component === "date" ? (
            <Input label="Default value" value={snapshot.field.defaultValue || ""} onChange={(event) => onUpdateField("defaultValue", event.target.value)} />
          ) : null}

          {snapshot.field.component === "quantity" ? (
            <div className="grid gap-4 md:grid-cols-3">
              <Input label="Min" type="number" value={String(snapshot.field.min ?? 0)} onChange={(event) => onUpdateField("min", Number(event.target.value))} />
              <Input label="Max" type="number" value={String(snapshot.field.max ?? 10)} onChange={(event) => onUpdateField("max", Number(event.target.value))} />
              <Input label="Default" type="number" value={String(snapshot.field.defaultValue ?? 0)} onChange={(event) => onUpdateField("defaultValue", Number(event.target.value))} />
            </div>
          ) : null}

          {snapshot.field.component === "radio" ? (
            <div className="space-y-3 rounded-[24px] border border-hsbc-gray-200 bg-hsbc-gray-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-bold">Options</div>
                  <div className="text-xs text-hsbc-gray-400">Edit labels and payload values used by the mobile preview.</div>
                </div>
                <Button variant="outline" onClick={onAddRadioOption} className="min-h-[38px] px-4 py-2 text-sm md:w-auto">
                  <Plus size={14} className="mr-2" />
                  Option
                </Button>
              </div>
              <div className="space-y-3">
                {snapshot.field.options.map((option) => (
                  <div key={option.id} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_40px]">
                    <Input label="Label" value={option.label} onChange={(event) => onUpdateRadioOption(option.id, "label", event.target.value)} />
                    <Input label="Value" value={option.value} onChange={(event) => onUpdateRadioOption(option.id, "value", event.target.value)} />
                    <button type="button" onClick={() => onRemoveRadioOption(option.id)} className="mt-7 h-12 rounded-xl border border-hsbc-gray-200 bg-white text-hsbc-red">
                      <Trash2 size={14} className="mx-auto" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}