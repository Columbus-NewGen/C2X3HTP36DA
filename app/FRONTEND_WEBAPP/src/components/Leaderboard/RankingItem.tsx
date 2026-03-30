import type { LeaderboardEntry } from "../../types/leaderboard.types";
import { cn } from "../../utils/cn";
import { resolveImageUrl } from "../../utils/floorplan.utils";
import { motion } from "framer-motion";

interface RankingItemProps {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
}

export default function RankingItem({
  entry,
  isCurrentUser,
}: RankingItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className={cn(
        "group flex items-center gap-3 sm:gap-6 px-4 sm:px-8 py-5 transition-all duration-300 border-b last:border-b-0",
        isCurrentUser
          ? "bg-lime-50/40 border-l-4 border-l-lime-500"
          : "border-b-zinc-50 hover:bg-zinc-50/80",
      )}
    >
      {/* Rank Badge */}
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-transform group-hover:scale-110",
          isCurrentUser
            ? "bg-lime-500 text-white shadow-[0_5px_15px_rgba(163,230,53,0.4)]"
            : "bg-zinc-100 text-zinc-400",
        )}
      >
        {entry.rank}
      </div>

      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-zinc-100 border-2 border-zinc-100/50 group-hover:border-lime-500/30 transition-all shadow-sm">
          {entry.avatar_url ? (
            <img
              src={resolveImageUrl(entry.avatar_url) || ""}
              alt={entry.user_name}
              className="w-full h-full object-cover transition-transform group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-bold text-zinc-300 text-lg bg-zinc-50">
              {entry.user_name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        {isCurrentUser && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-lime-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h4
            className={cn(
              "text-base sm:text-lg font-bold truncate tracking-tight",
              isCurrentUser ? "text-lime-700" : "text-zinc-900",
            )}
          >
            {entry.user_name}
          </h4>
          {isCurrentUser && (
            <span className="text-[10px] font-bold uppercase text-lime-600 bg-lime-100/50 px-2 py-0.5 rounded-lg border border-lime-200">
              YOU
            </span>
          )}
        </div>
        <p className="text-xs text-zinc-400 font-semibold truncate opacity-60 group-hover:opacity-100 transition-opacity">
          @{entry.user_name.toLowerCase().replace(/\s+/g, '')}
        </p>
      </div>

      {/* Value */}
      <div className="text-right shrink-0">
        <div
          className={cn(
            "text-lg sm:text-xl font-bold tracking-tight",
            isCurrentUser ? "text-lime-600" : "text-zinc-900",
          )}
        >
          {entry.value.toLocaleString()}
        </div>
        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
          {entry.value_label}
        </div>
      </div>
    </motion.div>
  );
}
