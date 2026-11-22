import { useId, useState } from "react";
import { FaChartBar, FaTable } from "react-icons/fa";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCount } from "../utils/format.js";

// One series per chart (no dual axis). Color is checked for contrast on the dark surface.
const SERIES_COLOR = "#a78bfa";
const GRID_COLOR = "rgba(148, 163, 184, 0.12)";
const AXIS_TICK = { fill: "#9ca3af", fontSize: 11 };

const shortDate = (value) => {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

function ChartTooltip({ active, payload, label, unit, labelFormatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-violet-500/20 bg-gray-950/95 px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400">{labelFormatter ? labelFormatter(label) : label}</p>
      <p className="mt-0.5 font-semibold text-white">
        {formatCount(payload[0].value)} {unit}
      </p>
    </div>
  );
}

// Card with a title and a "table view" toggle so the data is never chart-only
export function ChartCard({ title, subtitle, rows, columns, children, empty, emptyText = "No data for this range yet." }) {
  const [table, setTable] = useState(false);
  const titleId = useId();
  return (
    <section aria-labelledby={titleId} className="rounded-2xl border border-violet-500/10 bg-gray-900/60 p-5 backdrop-blur-xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 id={titleId} className="font-bold text-white">{title}</h2>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
        {rows?.length > 0 && (
          <button
            type="button"
            onClick={() => setTable((t) => !t)}
            className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-lg px-2 text-xs text-gray-400 hover:bg-violet-500/10 hover:text-white"
            aria-pressed={table}
          >
            {table ? <FaChartBar aria-hidden="true" /> : <FaTable aria-hidden="true" />} {table ? "Chart" : "Table"}
          </button>
        )}
      </div>
      {empty ? (
        <p className="flex h-48 items-center justify-center text-sm text-gray-500">{emptyText}</p>
      ) : table ? (
        <div className="max-h-72 overflow-auto scrollbar-thin">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-gray-900 text-xs uppercase text-gray-400">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} scope="col" className="px-2 py-2 font-medium">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t border-violet-500/10 text-gray-200">
                  {columns.map((c) => (
                    <td key={c.key} className="px-2 py-1.5">{c.format ? c.format(row[c.key]) : row[c.key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        children
      )}
    </section>
  );
}

// Daily series (rows like { date: "2026-11-01", plays: 4 })
export function DailyAreaChart({ data, dataKey, unit }) {
  const gradientId = useId().replace(/:/g, "");
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={SERIES_COLOR} stopOpacity={0.35} />
              <stop offset="100%" stopColor={SERIES_COLOR} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID_COLOR} vertical={false} />
          <XAxis dataKey="date" tickFormatter={shortDate} tick={AXIS_TICK} axisLine={false} tickLine={false} minTickGap={24} />
          <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={formatCount} width={48} />
          <Tooltip content={<ChartTooltip unit={unit} labelFormatter={shortDate} />} cursor={{ stroke: "rgba(167,139,250,0.4)", strokeWidth: 1 }} />
          <Area type="monotone" dataKey={dataKey} stroke={SERIES_COLOR} strokeWidth={2} fill={`url(#${gradientId})`} activeDot={{ r: 5, stroke: "#111827", strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Horizontal bars for a ranked list (rows like { name, value })
export function RankedBarChart({ data, unit, height }) {
  const chartHeight = height || Math.max(160, data.length * 36);
  return (
    <div className="w-full" style={{ height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }} barCategoryGap={6}>
          <CartesianGrid stroke={GRID_COLOR} horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={formatCount} />
          <YAxis type="category" dataKey="name" tick={{ ...AXIS_TICK, fill: "#d1d5db" }} axisLine={false} tickLine={false} width={110} />
          <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ fill: "rgba(167,139,250,0.08)" }} />
          <Bar dataKey="value" fill={SERIES_COLOR} radius={[0, 4, 4, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
