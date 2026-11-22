import { formatCount } from "../utils/format.js";

export default function StatCard({ icon: Icon, label, value, hint, tone = "violet" }) {
  const tones = {
    violet: "from-violet-500/25 to-violet-500/5 text-violet-200",
    fuchsia: "from-fuchsia-500/25 to-fuchsia-500/5 text-fuchsia-200",
    emerald: "from-emerald-500/25 to-emerald-500/5 text-emerald-200",
    amber: "from-amber-500/25 to-amber-500/5 text-amber-200",
  };
  return (
    <div className="rounded-2xl border border-violet-500/10 bg-gray-900/60 p-5 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        {Icon && (
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br ${tones[tone]}`}>
            <Icon aria-hidden="true" />
          </span>
        )}
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
      </div>
      <p className="mt-3 text-3xl font-black text-white">{typeof value === "number" ? formatCount(value) : value}</p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
