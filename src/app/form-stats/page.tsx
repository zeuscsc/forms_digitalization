"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

interface StatsPayload {
  analyzedForms: number;
  formNames: string[];
  totalInstances: number;
  componentUsage: Record<string, number>;
  componentFormCoverage: Record<string, number>;
  perForm: Record<string, Record<string, number>>;
}

const PALETTE = [
  "#DB0011",
  "#333333",
  "#4e79a7",
  "#f28e2b",
  "#59a14f",
  "#76b7b2",
  "#edc948",
  "#b07aa1",
  "#ff9da7",
  "#9c755f",
];

function shortFormName(full: string) {
  // e.g. generated-1776670998086-lic0sa.json → lic0sa
  const m = full.match(/generated-\d+-([\w]+)\.json$/);
  if (m) return m[1];
  const m2 = full.match(/generated-(\d+)\.json$/);
  if (m2) return m2[1].slice(-6);
  return full.replace(".json", "");
}

export default function FormStatsPage() {
  const [data, setData] = useState<StatsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/form-stats")
      .then((r) => r.json())
      .then((json) => {
        if (json.error) throw new Error(json.error as string);
        setData(json as StatsPayload);
      })
      .catch((e: unknown) => setError(String(e)));
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hsbc-gray-100">
        <p className="text-hsbc-red font-bold">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hsbc-gray-100">
        <p className="text-hsbc-gray-400">Loading…</p>
      </div>
    );
  }

  const components = Object.keys(data.componentUsage).sort(
    (a, b) => data.componentUsage[b] - data.componentUsage[a]
  );
  const totalInstances = data.totalInstances;

  // ── data for bar chart (overall) ──
  const overallBarData = components.map((c) => ({
    name: c,
    count: data.componentUsage[c],
    forms: data.componentFormCoverage[c] ?? 0,
  }));

  // ── data for pie chart ──
  const pieData = components.map((c, i) => ({
    name: c,
    value: data.componentUsage[c],
    fill: PALETTE[i % PALETTE.length],
  }));

  // ── data for stacked bar chart (per-form) ──
  const formKeys = data.formNames.map(shortFormName);
  const perFormBarData = components.map((c) => {
    const row: Record<string, string | number> = { component: c };
    data.formNames.forEach((fn) => {
      row[shortFormName(fn)] = data.perForm[fn]?.[c] ?? 0;
    });
    return row;
  });

  return (
    <div className="min-h-screen bg-hsbc-gray-100 px-4 py-8">
      {/* Header */}
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="h-6 w-1.5 rounded-full bg-hsbc-red" />
            <h1 className="text-2xl font-black tracking-tight text-hsbc-black">
              Form Component Usage
            </h1>
          </div>
          <p className="mt-1 pl-5 text-sm text-hsbc-gray-400">
            Analysed {data.analyzedForms} form{data.analyzedForms !== 1 ? "s" : ""} · {totalInstances} total component instances
          </p>
        </div>

        {/* KPI cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {overallBarData.slice(0, 4).map((item, i) => (
            <div key={item.name} className="rounded-2xl bg-white px-5 py-4 shadow-sm">
              <div className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: PALETTE[i % PALETTE.length] }}>
                {item.name}
              </div>
              <div className="mt-1 text-3xl font-black text-hsbc-black">{item.count}</div>
              <div className="mt-0.5 text-xs text-hsbc-gray-400">
                {((item.count / totalInstances) * 100).toFixed(1)}% · {item.forms} form{item.forms !== 1 ? "s" : ""}
              </div>
            </div>
          ))}
        </div>

        {/* Row 1: bar + pie */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Bar chart */}
          <div className="col-span-3 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-black uppercase tracking-[0.16em] text-hsbc-black">
              Overall Usage — Count
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={overallBarData} margin={{ top: 0, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAEAEA" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#767676" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#767676" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 16px #0001", fontSize: 13 }}
                  formatter={(v: unknown) => [`${v} instances`, "Count"]}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {overallBarData.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="col-span-2 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-black uppercase tracking-[0.16em] text-hsbc-black">
              Share by Component
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={56}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 16px #0001", fontSize: 13 }}
                  formatter={(v: unknown, name: unknown) => [`${v} (${(((v as number) / totalInstances) * 100).toFixed(1)}%)`, name]}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 2: form coverage bar */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-black uppercase tracking-[0.16em] text-hsbc-black">
            Form Coverage — Appears in How Many Forms
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={overallBarData} margin={{ top: 0, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAEAEA" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#767676" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 12, fill: "#767676" }}
                axisLine={false}
                tickLine={false}
                domain={[0, data.analyzedForms]}
                tickCount={data.analyzedForms + 1}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 16px #0001", fontSize: 13 }}
                formatter={(v: unknown) => [`${v} / ${data.analyzedForms} forms`, "Coverage"]}
              />
              <Bar dataKey="forms" radius={[6, 6, 0, 0]}>
                {overallBarData.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} opacity={0.7} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Row 3: per-form stacked bar */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-black uppercase tracking-[0.16em] text-hsbc-black">
            Per-Form Breakdown
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={perFormBarData} margin={{ top: 0, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAEAEA" vertical={false} />
              <XAxis dataKey="component" tick={{ fontSize: 12, fill: "#767676" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#767676" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 16px #0001", fontSize: 13 }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              {formKeys.map((fk, i) => (
                <Bar key={fk} dataKey={fk} stackId="a" fill={PALETTE[i % PALETTE.length]} radius={i === formKeys.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Footer link */}
        <div className="mt-8 text-center">
          <a href="/" className="text-xs text-hsbc-gray-400 underline underline-offset-2 hover:text-hsbc-black">
            ← Back to Form Designer
          </a>
        </div>
      </div>
    </div>
  );
}
