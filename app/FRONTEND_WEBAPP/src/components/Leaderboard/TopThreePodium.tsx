import { useMemo } from "react";
import type { LeaderboardEntry } from "../../types/leaderboard.types";
import { cn } from "../../utils/cn";
import { resolveImageUrl } from "../../utils/floorplan.utils";
import { Crown, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface TopThreePodiumProps {
  entries: LeaderboardEntry[];
}

export default function TopThreePodium({ entries }: TopThreePodiumProps) {
  const [first, second, third] = useMemo(() => {
    const top = entries.slice(0, 3);
    return [
      top.find((e) => e.rank === 1),
      top.find((e) => e.rank === 2),
      top.find((e) => e.rank === 3),
    ];
  }, [entries]);

  if (!first && !second && !third) return null;

  const PodiumSlot = ({
    entry,
    rank,
  }: {
    entry?: LeaderboardEntry;
    rank: number;
  }) => {
    if (!entry) return <div className="flex-1" />;

    const colors = {
      1: {
        bg: "bg-gradient-to-br from-lime-400 via-lime-500 to-emerald-600",
        shadow: "shadow-[0_20px_60px_rgba(163,230,53,0.4)]",
        border: "border-lime-300/60",
        text: "text-lime-400",
        glow: "bg-lime-500/30",
        height: "h-36 sm:h-52",
      },
      2: {
        bg: "bg-gradient-to-br from-zinc-300 via-zinc-400 to-zinc-600",
        shadow: "shadow-[0_15px_40px_rgba(161,161,170,0.3)]",
        border: "border-zinc-200/40",
        text: "text-zinc-300",
        glow: "bg-zinc-400/20",
        height: "h-28 sm:h-40",
      },
      3: {
        bg: "bg-gradient-to-br from-orange-400 via-orange-600 to-orange-800",
        shadow: "shadow-[0_15px_40px_rgba(194,65,12,0.3)]",
        border: "border-orange-500/40",
        text: "text-orange-500",
        glow: "bg-orange-500/20",
        height: "h-20 sm:h-32",
      },
    }[rank] as any;

    return (
      <div className={cn(
        "flex flex-col items-center flex-1 min-w-0 relative",
        rank === 1 ? "z-20" : "z-10"
      )}>
        {/* Avatar Section */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4 + rank, repeat: Infinity, ease: "easeInOut" }}
          className="relative mb-4 sm:mb-6 group flex flex-col items-center w-full"
        >
          {rank === 1 && (
            <motion.div
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute -top-10 sm:-top-12 z-30"
            >
              <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-lime-400 drop-shadow-[0_0_15px_rgba(163,230,53,1)]" />
            </motion.div>
          )}

          <div className={cn(
            "relative rounded-[1.8rem] sm:rounded-[2.2rem] p-1 sm:p-1.5 overflow-hidden transition-all duration-700 group-hover:scale-110 group-hover:rotate-2",
            rank === 1 ? "w-24 h-24 sm:w-36 sm:h-36" : "w-18 h-18 sm:w-28 sm:h-28"
          )}>
            <div className={cn("absolute inset-0 opacity-60", colors.bg)} />
            <div className="absolute inset-1 rounded-[1.6rem] sm:rounded-[2rem] bg-zinc-950 z-0" />

            <div className="relative z-10 w-full h-full rounded-[1.4rem] sm:rounded-[1.8rem] overflow-hidden bg-zinc-900 shadow-inner">
              <div className={cn("absolute inset-0 blur-xl opacity-20", colors.glow)} />
              {entry.avatar_url ? (
                <img
                  src={resolveImageUrl(entry.avatar_url) || undefined}
                  alt={entry.user_name}
                  className="w-full h-full object-cover relative z-10"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-zinc-700 text-xl sm:text-3xl">
                  {entry.user_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Rank Badge */}
            <div className={cn(
              "absolute -bottom-1 -right-1 w-7 h-7 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center text-[10px] sm:text-sm font-bold text-zinc-950 z-20 shadow-2xl border-2 sm:border-4 border-zinc-950",
              colors.bg
            )}>
              {rank}
            </div>
          </div>

          <div className="mt-2 sm:mt-4 text-center px-1 sm:px-2 w-full">
            <p className="text-[10px] sm:text-sm font-bold text-white mb-0.5 sm:mb-1 tracking-tight truncate">
              {entry.user_name}
            </p>
            <div className="flex items-center justify-center gap-1 sm:gap-1.5 py-0.5 sm:py-1 px-1.5 sm:px-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className={cn("text-xs sm:text-2xl font-bold leading-none tracking-tighter", colors.text)}>
                {entry.value.toLocaleString()}
              </span>
              <Sparkles size={10} className={cn("sm:w-3 sm:h-3 opacity-70", colors.text)} />
            </div>
          </div>
        </motion.div>

        {/* Podium Block */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: rank * 0.2 + 0.5, duration: 1.2, type: 'spring', bounce: 0.25 }}
          style={{ originY: 1 }}
          className={cn(
            "w-full rounded-t-[1.8rem] sm:rounded-t-[3rem] border-t-2 border-x relative group-hover:brightness-125 transition-all duration-700 overflow-hidden",
            colors.bg,
            colors.border,
            colors.shadow,
            colors.height
          )}
        >
          {/* Glass Overlay */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] rounded-t-[1.8rem] sm:rounded-t-[3rem]" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50" />

          <div className="absolute inset-0 flex items-center justify-center opacity-10 select-none">
            <span className="text-4xl sm:text-8xl font-bold text-white italic tracking-tighter">{rank}</span>
          </div>

          {/* Dynamic Light Sweep */}
          <motion.div
            animate={{ x: ['-200%', '300%'] }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-20 z-10"
          />

          {/* Internal Glow */}
          <div className={cn("absolute -top-1/2 left-1/2 -translate-x-1/2 w-20 sm:w-32 h-20 sm:h-32 blur-[20px] sm:blur-[40px] opacity-40 rounded-full", colors.glow)} />
        </motion.div>
      </div>
    );
  };

  return (
    <div className="relative bg-[#0d0d0e] rounded-[2rem] sm:rounded-[4rem] p-4 sm:p-16 mb-16 overflow-hidden border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
      {/* Immersive Background Decor */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_rgba(163,230,53,0.1)_0%,_transparent_70%)]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-lime-500/10 blur-[100px]" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 blur-[120px]" />
      </div>

      <div className="relative flex items-end justify-center gap-1 sm:gap-10 pt-10 sm:pt-16">
        <PodiumSlot entry={second} rank={2} />
        <PodiumSlot entry={first} rank={1} />
        <PodiumSlot entry={third} rank={3} />
      </div>
    </div>
  );
}
