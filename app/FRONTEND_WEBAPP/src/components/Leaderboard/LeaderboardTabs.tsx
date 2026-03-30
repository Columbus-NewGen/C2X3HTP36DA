import { Flame, ClipboardCheck, Swords } from "lucide-react";
import type { LeaderboardDimension } from "../../types/leaderboard.types";
import { cn } from "../../utils/cn";

interface LeaderboardTabsProps {
  selectedType: LeaderboardDimension;
  onTypeChange: (type: LeaderboardDimension) => void;
}

const TABS: { key: LeaderboardDimension; label: string; icon: typeof Flame }[] = [
  { key: "streak", label: "Streak", icon: Flame },
  { key: "volume", label: "Volume", icon: Swords },
  { key: "program", label: "โปรแกรม", icon: ClipboardCheck },
];

export default function LeaderboardTabs({ selectedType, onTypeChange }: LeaderboardTabsProps) {
  return (
    <div className="flex gap-1.5 p-1 bg-gray-100/80 rounded-2xl">
      {TABS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onTypeChange(key)}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold uppercase transition-all whitespace-nowrap",
            selectedType === key
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-400 hover:text-gray-600"
          )}
        >
          <Icon size={13} className="shrink-0" />
          {label}
        </button>
      ))}
    </div>
  );
}
