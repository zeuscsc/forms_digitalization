"use client";

import { CheckCircle2, ListTree } from "lucide-react";
import type { ActivityLogEntry } from "@/lib/designerWorkspace";

interface ActivityLogPanelProps {
  entries: ActivityLogEntry[];
}

export function ActivityLogPanel({ entries }: ActivityLogPanelProps) {
  return (
    <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-hsbc-red">Activity</div>
          <h2 className="mt-2 text-lg font-black">Recent changes</h2>
        </div>
        <div className="rounded-2xl bg-red-50 p-3 text-hsbc-red">
          <ListTree size={18} />
        </div>
      </div>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-start gap-3 rounded-2xl border border-hsbc-gray-100 bg-hsbc-gray-50 px-4 py-3">
            <CheckCircle2 size={16} className="mt-0.5 text-hsbc-red" />
            <div className="flex-1">
              <div className="text-sm font-medium text-hsbc-black">{entry.message}</div>
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-hsbc-gray-400">{entry.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}