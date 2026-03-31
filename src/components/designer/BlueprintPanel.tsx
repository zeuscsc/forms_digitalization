"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { DesignerSelection, FormDesignerDocument } from "@/lib/formDesigner";

interface BlueprintPanelProps {
  designer: FormDesignerDocument;
  selection: DesignerSelection | null;
  onAddSectionToStep: (stepId: string) => void;
  onAddStep: () => void;
  onMoveField: (stepId: string, sectionId: string, fieldId: string, direction: -1 | 1) => void;
  onMoveSection: (stepId: string, sectionId: string, direction: -1 | 1) => void;
  onMoveStep: (stepId: string, direction: -1 | 1) => void;
  onRemoveField: (stepId: string, sectionId: string, fieldId: string) => void;
  onRemoveSection: (stepId: string, sectionId: string) => void;
  onRemoveStep: (stepId: string) => void;
  onSelect: (selection: DesignerSelection) => void;
}

export function BlueprintPanel({
  designer,
  selection,
  onAddSectionToStep,
  onAddStep,
  onMoveField,
  onMoveSection,
  onMoveStep,
  onRemoveField,
  onRemoveSection,
  onRemoveStep,
  onSelect,
}: BlueprintPanelProps) {
  return (
    <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-hsbc-red">Blueprint</div>
          <h2 className="mt-2 text-lg font-black">Steps, sections, and order</h2>
        </div>
        <Button variant="secondary" onClick={onAddStep} className="min-h-[40px] px-4 py-2 text-sm md:w-auto">
          <Plus size={16} className="mr-2" />
          Step
        </Button>
      </div>

      <div className="space-y-4">
        {designer.steps.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-hsbc-gray-200 bg-hsbc-gray-50 p-5 text-sm leading-relaxed text-hsbc-gray-500">
            Start from blank. Add the first step to create the flow structure, then add sections and components.
          </div>
        ) : null}

        {designer.steps.map((step, stepIndex) => (
          <div key={step.id} className="rounded-[24px] border border-hsbc-gray-200 bg-hsbc-gray-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <button
                type="button"
                onClick={() => onSelect({ type: "step", stepId: step.id })}
                className={`flex-1 rounded-2xl px-3 py-3 text-left transition ${selection?.stepId === step.id && selection?.type === "step" ? "bg-white shadow-sm" : "hover:bg-white/60"}`}
              >
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-hsbc-red">Step {stepIndex + 1}</div>
                <div className="mt-1 text-sm font-bold text-hsbc-black">{step.title}</div>
                <div className="mt-1 text-xs text-hsbc-gray-400">{step.description || "No description"}</div>
              </button>

              <div className="flex flex-col gap-2">
                <button type="button" onClick={() => onMoveStep(step.id, -1)} className="rounded-xl border border-hsbc-gray-200 bg-white p-2 text-hsbc-gray-500"><ArrowUp size={14} /></button>
                <button type="button" onClick={() => onMoveStep(step.id, 1)} className="rounded-xl border border-hsbc-gray-200 bg-white p-2 text-hsbc-gray-500"><ArrowDown size={14} /></button>
                <button type="button" onClick={() => onRemoveStep(step.id)} className="rounded-xl border border-hsbc-gray-200 bg-white p-2 text-hsbc-red disabled:text-hsbc-gray-300" disabled={designer.steps.length === 1}><Trash2 size={14} /></button>
              </div>
            </div>

            <div className="mt-4 space-y-3 pl-2">
              {step.sections.map((section, sectionIndex) => (
                <div key={section.id} className="rounded-2xl border border-black/5 bg-white p-3">
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => onSelect({ type: "section", stepId: step.id, sectionId: section.id })}
                      className={`flex-1 rounded-xl px-2 py-2 text-left ${selection?.sectionId === section.id && selection?.type === "section" ? "bg-red-50" : "hover:bg-hsbc-gray-50"}`}
                    >
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-hsbc-gray-400">Section {sectionIndex + 1}</div>
                      <div className="mt-1 text-sm font-bold">{section.title}</div>
                      <div className="mt-1 text-xs text-hsbc-gray-400">{section.fields.length} components</div>
                    </button>

                    <div className="flex flex-col gap-2">
                      <button type="button" onClick={() => onMoveSection(step.id, section.id, -1)} className="rounded-lg border border-hsbc-gray-200 bg-hsbc-gray-50 p-1.5 text-hsbc-gray-500"><ArrowUp size={12} /></button>
                      <button type="button" onClick={() => onMoveSection(step.id, section.id, 1)} className="rounded-lg border border-hsbc-gray-200 bg-hsbc-gray-50 p-1.5 text-hsbc-gray-500"><ArrowDown size={12} /></button>
                      <button type="button" onClick={() => onRemoveSection(step.id, section.id)} className="rounded-lg border border-hsbc-gray-200 bg-hsbc-gray-50 p-1.5 text-hsbc-red" disabled={step.sections.length === 1}><Trash2 size={12} /></button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2 border-l border-dashed border-hsbc-gray-200 pl-3">
                    {section.fields.map((field) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onSelect({ type: "field", stepId: step.id, sectionId: section.id, fieldId: field.id })}
                          className={`flex-1 rounded-xl px-3 py-2 text-left ${selection?.fieldId === field.id ? "bg-red-50 text-hsbc-black" : "bg-hsbc-gray-50 hover:bg-hsbc-gray-100"}`}
                        >
                          <div className="text-xs font-bold">{field.label}</div>
                          <div className="text-[11px] uppercase tracking-[0.16em] text-hsbc-gray-400">{field.component}</div>
                        </button>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => onMoveField(step.id, section.id, field.id, -1)} className="rounded-lg border border-hsbc-gray-200 bg-white p-1.5 text-hsbc-gray-500"><ArrowUp size={12} /></button>
                          <button type="button" onClick={() => onMoveField(step.id, section.id, field.id, 1)} className="rounded-lg border border-hsbc-gray-200 bg-white p-1.5 text-hsbc-gray-500"><ArrowDown size={12} /></button>
                          <button type="button" onClick={() => onRemoveField(step.id, section.id, field.id)} className="rounded-lg border border-hsbc-gray-200 bg-white p-1.5 text-hsbc-red"><Trash2 size={12} /></button>
                        </div>
                      </div>
                    ))}
                    {section.fields.length === 0 ? <div className="rounded-xl bg-hsbc-gray-50 px-3 py-2 text-xs text-hsbc-gray-400">No components yet. Add one from the component library.</div> : null}
                  </div>
                </div>
              ))}

              <button type="button" onClick={() => onAddSectionToStep(step.id)} className="w-full rounded-2xl border border-dashed border-hsbc-gray-200 bg-white px-4 py-3 text-sm font-bold text-hsbc-gray-500 hover:border-hsbc-red hover:text-hsbc-red">
                <Plus size={16} className="mr-2 inline" />
                Add section to {step.title}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}