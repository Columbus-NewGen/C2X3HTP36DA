import type { LeaderboardPeriod } from "../../types/leaderboard.types";
import { cn } from "../../utils/cn";

interface PeriodFilterProps {
  selectedPeriod: LeaderboardPeriod;
  onPeriodChange: (period: LeaderboardPeriod) => void;
}

const PERIODS: { key: LeaderboardPeriod; label: string }[] = [
  { key: "week", label: "สัปดาห์" },
  { key: "month", label: "เดือน" },
  { key: "alltime", label: "ทั้งหมด" },
];

export default function PeriodFilter({
  selectedPeriod,
  onPeriodChange,
}: PeriodFilterProps) {
  return (
    <div className="flex gap-1 p-1 bg-gray-100/80 rounded-xl">
      {PERIODS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onPeriodChange(key)}
          className={cn(
            "flex-1 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap text-center",
            selectedPeriod === key
              ? "bg-lime-500 text-white shadow-sm shadow-lime-200"
              : "text-gray-400 hover:text-gray-600",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
