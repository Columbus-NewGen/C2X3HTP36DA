// KPI Card Component - Responsive Fixed v2
import type { KPI } from "../../types/dashboard.types";
import { cn, parseFraction } from "../../utils/dashboard.utils";
import { KpiIcon, Sparkline, TrendChip } from "./SharedUI";
import { useNavigate } from "react-router-dom";

const META_BY_KEY: Record<
  string,
  { tone: string; iconTone: string; barColor: string; spark: number[] }
> = {
  currentActive: {
    tone: "text-blue-600",
    iconTone: "bg-blue-50 text-blue-600",
    barColor: "bg-blue-500",
    spark: [14, 16, 13, 18, 21, 19, 23, 27],
  },
  totalMembers: {
    tone: "text-emerald-600",
    iconTone: "bg-emerald-50 text-emerald-600",
    barColor: "bg-emerald-500",
    spark: [6, 6, 7, 7, 7, 7, 7, 7],
  },
  totalMachines: {
    tone: "text-orange-600",
    iconTone: "bg-orange-50 text-orange-600",
    barColor: "bg-orange-500",
    spark: [45, 44, 43, 42, 43, 42, 41, 41],
  },
  hours: {
    tone: "text-purple-600",
    iconTone: "bg-purple-50 text-purple-600",
    barColor: "bg-purple-500",
    spark: [6, 6, 6, 6, 6, 6, 6, 6],
  },
};

const DEFAULT_META = {
  tone: "text-gray-600",
  iconTone: "bg-gray-50 text-gray-600",
  barColor: "bg-gray-400",
  spark: [1, 2, 2, 3, 2, 3, 3, 4],
};

export function KPICard({ k }: { k: KPI }) {
  const nav = useNavigate();
  const meta = META_BY_KEY[k.key] ?? DEFAULT_META;

  const frac = parseFraction(k.value);
  const progressPct = frac ? Math.round(frac.pct * 100) : null;

  const valueStr = String(k.value);

  return (
    <div
      onClick={() => k.route && nav(k.route)}
      className={cn(
        "group flex flex-col justify-between h-full",
        "rounded-2xl border border-gray-100 bg-white p-3",
        "shadow-sm transition-all duration-200",
        k.route
          ? "cursor-pointer active:scale-[0.98] hover:shadow-md"
          : "cursor-default",
      )}
    >
      {/* Top row: icon */}
      <div className="flex items-start justify-between gap-1">
        <p className="text-[11px] font-semibold text-gray-400 leading-tight line-clamp-2">
          {k.label}
        </p>
        <div
          className={cn(
            "grid h-7 w-7 shrink-0 place-items-center rounded-lg ml-1",
            meta.iconTone,
          )}
        >
          <KpiIcon name={k.icon} />
        </div>
      </div>

      {/* Value */}
      <div className="mt-1.5">
        <div className="flex items-baseline gap-1 flex-wrap">
          <h3
            className={cn(
              "font-bold text-gray-900 leading-none",
              // ปรับ font size ตามความยาว ป้องกัน wrap
              valueStr.length <= 4
                ? "text-2xl"
                : valueStr.length <= 7
                  ? "text-xl"
                  : valueStr.length <= 11
                    ? "text-base"
                    : "text-sm",
            )}
          >
            {k.value}
          </h3>
          {progressPct !== null && (
            <span className={cn("text-xs font-semibold", meta.tone)}>
              {progressPct}%
            </span>
          )}
        </div>

        {k.sub && (
          <p className="mt-0.5 text-[10px] text-gray-400 leading-tight">
            {k.sub}
          </p>
        )}

        <TrendChip trend={k.trend} value={k.trendValue} />
      </div>

      {/* Sparkline */}
      <div className="mt-2 flex items-center justify-between">
        <div
          className={cn(
            "opacity-70 group-hover:opacity-100 transition-opacity",
            meta.tone,
          )}
        >
          <Sparkline data={meta.spark} />
        </div>
        <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-300">
          7-day
        </span>
      </div>
    </div>
  );
}
