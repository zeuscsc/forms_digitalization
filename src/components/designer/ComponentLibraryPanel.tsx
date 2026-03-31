"use client";

import { LayoutTemplate, Plus } from "lucide-react";
import { COMPONENT_LIBRARY, type DesignerFieldComponent } from "@/lib/formDesigner";

interface ComponentLibraryPanelProps {
  canInsertFields: boolean;
  onAddField: (component: DesignerFieldComponent) => void;
}

export function ComponentLibraryPanel({ canInsertFields, onAddField }: ComponentLibraryPanelProps) {
  return (
    <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-hsbc-red">Component Library</div>
          <h2 className="mt-2 text-lg font-black">Available mobile blocks</h2>
        </div>
        <div className="rounded-2xl bg-red-50 p-3 text-hsbc-red">
          <LayoutTemplate size={18} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {COMPONENT_LIBRARY.map((component) => (
          <button
            key={component.type}
            type="button"
            onClick={() => onAddField(component.type)}
            disabled={!canInsertFields}
            className="rounded-2xl border border-hsbc-gray-200 bg-hsbc-gray-50 p-4 text-left transition hover:border-hsbc-red hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-hsbc-black">{component.label}</div>
                <div className="mt-1 text-xs leading-relaxed text-hsbc-gray-400">{component.description}</div>
              </div>
              <Plus size={16} className="text-hsbc-red" />
            </div>
          </button>
        ))}
      </div>

      {!canInsertFields ? (
        <div className="mt-4 rounded-2xl border border-dashed border-hsbc-gray-200 bg-hsbc-gray-50 px-4 py-3 text-xs leading-relaxed text-hsbc-gray-500">
          Add a step and a section before inserting components from the library.
        </div>
      ) : null}
    </div>
  );
}