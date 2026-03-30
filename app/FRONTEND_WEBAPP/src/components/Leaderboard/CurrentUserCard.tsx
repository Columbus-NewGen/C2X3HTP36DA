import { useMemo } from "react";
import type { LeaderboardEntry } from "../../types/leaderboard.types";
import { resolveImageUrl } from "../../utils/floorplan.utils";
import { Trophy, TrendingUp, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface CurrentUserCardProps {
  currentEntry: LeaderboardEntry | null;
  allEntries: LeaderboardEntry[];
}

export default function CurrentUserCard({
  currentEntry,
  allEntries,
}: CurrentUserCardProps) {
  const nextRankTarget = useMemo(() => {
    if (!currentEntry || currentEntry.rank === 1) return null;

    const entryAbove = [...allEntries]
      .sort((a, b) => b.rank - a.rank)
      .find((u) => u.rank < currentEntry.rank);

    if (!entryAbove) return null;

    const difference = entryAbove.value - currentEntry.value;
    return {
      rank: entryAbove.rank,
      value: entryAbove.value,
      difference: Math.max(0, difference),
      label: entryAbove.value_label,
    };
  }, [currentEntry, allEntries]);

  if (!currentEntry) {
    return (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-5 rounded-[2.5rem] bg-zinc-950 border border-white/10 shadow-2xl flex items-center justify-between gap-6 backdrop-blur-xl"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
            <Trophy className="text-zinc-700" size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">คุณยังไม่มีอันดับ</h3>
            <p className="text-xs text-zinc-500 font-medium">ออกกำลังกายเพื่อแสดงชื่อบนบอร์ด!</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-lime-500 flex items-center justify-center text-zinc-950 shadow-[0_5px_15px_rgba(163,230,53,0.4)]">
          <ChevronRight size={20} strokeWidth={3} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="relative p-5 rounded-[3rem] bg-zinc-950 border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)] text-white overflow-hidden group backdrop-blur-3xl"
    >
      {/* Immersive Glows */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-lime-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-lime-500/20 transition-colors" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative flex items-center justify-between gap-6">
        {/* Left: User Pulse */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-lime-500/50 bg-zinc-800 shadow-[0_10px_20px_rgba(0,0,0,0.4)] group-hover:border-lime-400 transition-colors">
              {currentEntry.avatar_url ? (
                <img
                  src={resolveImageUrl(currentEntry.avatar_url) || undefined}
                  alt={currentEntry.user_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-zinc-600 text-xl">
                  {currentEntry.user_name.charAt(0)}
                </div>
              )}
            </div>
            {/* Rank Bubble */}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center text-xs font-bold text-zinc-950 border-2 border-zinc-950 shadow-lg">
              {currentEntry.rank}
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Your Current Ranking</span>
              <div className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse shadow-[0_0_8px_rgba(163,230,53,1)]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tighter leading-none">#{currentEntry.rank}</span>
              <span className="text-sm font-bold text-lime-400">{currentEntry.value.toLocaleString()} {currentEntry.value_label}</span>
            </div>
          </div>
        </div>

        {/* Right: Progression Metrics */}
        {nextRankTarget && (
          <div className="hidden sm:flex items-center gap-6 pl-6 border-l border-white/10">
            <div className="text-right">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Target Ranking #{nextRankTarget.rank}</p>
              <div className="flex items-center justify-end gap-2">
                <div className="flex flex-col items-end">
                  <p className="text-lg font-bold tracking-tight leading-none text-white">+{nextRankTarget.difference.toLocaleString()}</p>
                  <p className="text-[9px] font-bold text-zinc-400">{nextRankTarget.label}</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-lime-500/10 flex items-center justify-center border border-lime-500/20">
                  <TrendingUp size={16} className="text-lime-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Mini Progression */}
        {nextRankTarget && (
          <div className="sm:hidden flex flex-col items-end">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/5">
              <span className="text-[11px] font-bold text-lime-400">+{nextRankTarget.difference.toLocaleString()}</span>
              <TrendingUp size={10} className="text-lime-400" />
            </div>
            <p className="text-[9px] font-bold text-zinc-500 uppercase mt-1">To #{nextRankTarget.rank}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
