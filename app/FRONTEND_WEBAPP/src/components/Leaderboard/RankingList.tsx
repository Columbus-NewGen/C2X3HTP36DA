import type { LeaderboardEntry } from "../../types/leaderboard.types";
import RankingItem from "./RankingItem";
import { Trophy } from "lucide-react";

interface RankingListProps {
  entries: LeaderboardEntry[];
  currentUserId: number;
}

export default function RankingList({ entries, currentUserId }: RankingListProps) {
  const rankedEntries = entries.filter((u) => u.rank >= 4);

  if (rankedEntries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="py-16 flex flex-col items-center justify-center text-center px-6">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
            <Trophy className="text-gray-200" size={28} />
          </div>
          <h3 className="text-sm font-bold text-gray-500 mb-1">ยังไม่มีข้อมูลอันดับ</h3>
          <p className="text-xs text-gray-300 font-bold uppercase ">เริ่มออกกำลังกายเพื่อติดอันดับ!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-zinc-50">
      {rankedEntries.map((entry) => (
        <RankingItem
          key={entry.user_id}
          entry={entry}
          isCurrentUser={entry.user_id === currentUserId}
        />
      ))}
    </div>
  );
}
