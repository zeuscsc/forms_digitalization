"use client";

import React from "react";
import { Settings2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import type { FormDesignerDocument } from "@/lib/formDesigner";
import { textAreaClassName } from "@/lib/designerWorkspace";

interface ThemePanelProps {
  designerName: string;
  theme: FormDesignerDocument["theme"];
  onUpdateDesignerName: (value: string) => void;
  onUpdateTheme: (key: keyof FormDesignerDocument["theme"], value: string) => void;
}

export function ThemePanel({
  designerName,
  theme,
  onUpdateDesignerName,
  onUpdateTheme,
}: ThemePanelProps) {
  return (
    <div className="rounded-[28px] border border-black/5 bg-[linear-gradient(135deg,#fff9f7_0%,#fff_55%,#f2efe8_100%)] p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-hsbc-red">Theme + Submission</div>
          <h2 className="mt-2 text-lg font-black">Define the mobile shell</h2>
        </div>
        <div className="rounded-2xl bg-white p-3 text-hsbc-red shadow-sm">
          <Settings2 size={18} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input label="App title" value={theme.appTitle} onChange={(event) => onUpdateTheme("appTitle", event.target.value)} />
        <Input label="Accent label" value={theme.accentLabel} onChange={(event) => onUpdateTheme("accentLabel", event.target.value)} />
        <Input label="Submit CTA" value={theme.submitLabel} onChange={(event) => onUpdateTheme("submitLabel", event.target.value)} />
        <Input label="Designer name" value={designerName} onChange={(event) => onUpdateDesignerName(event.target.value)} />
      </div>
      <div className="mt-4 space-y-2">
        <label className="text-sm font-medium text-hsbc-black">App subtitle</label>
        <textarea value={theme.appSubtitle} onChange={(event) => onUpdateTheme("appSubtitle", event.target.value)} className={textAreaClassName()} />
      </div>
    </div>
  );
}