import { useEffect, useRef, useState } from "react";
import { Star, Zap, Trophy, ChevronRight } from "lucide-react";
import type { GamificationProfile, Badge } from "../../types/gamification.types";

interface LevelProgressHeroProps {
    profile: GamificationProfile;
}

function BadgePip({ badge }: { badge: Badge }) {
    return (
        <div className="group relative" title={badge.display_name || badge.name}>
            <div className="w-10 h-10 bg-white rounded-xl border border-neutral-100 shadow-sm flex items-center justify-center overflow-hidden group-hover:border-lime-300 group-hover:shadow-lime-100/50 transition-all duration-200">
                {badge.icon_url ? (
                    <img src={badge.icon_url} alt={badge.name} className="w-7 h-7 object-contain" />
                ) : (
                    <span className="text-base">🏅</span>
                )}
            </div>
        </div>
    );
}

function AnimatedXPBar({ pct }: { pct: number }) {
    const [width, setWidth] = useState(0);
    const mounted = useRef(false);

    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
            // Trigger animation on mount
            const t = setTimeout(() => setWidth(Math.min(pct, 100)), 80);
            return () => clearTimeout(t);
        }
    }, [pct]);

    return (
        <div className="h-2.5 w-full bg-neutral-100 rounded-full overflow-hidden">
            <div
                className="h-full bg-lime-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                style={{ width: `${width}%` }}
            >
                {/* shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite] w-full" />
            </div>
        </div>
    );
}

export default function LevelProgressHero({ profile }: LevelProgressHeroProps) {
    const level = profile.current_level;
    const totalXp = profile.total_xp;
    const nextLevelXp = profile.next_level_xp;
    const xpToNext = profile.xp_to_next_level;
    const pct = profile.xp_progress;
    const badges = profile.badges ?? [];

    return (
        <div className="relative bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-sm">
            {/* Lime accent patch — top right */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-lime-50 rounded-bl-[3rem] pointer-events-none" />
            <div className="absolute top-3 right-3 w-10 h-10 bg-lime-500/10 rounded-2xl flex items-center justify-center pointer-events-none">
                <Star className="h-5 w-5 text-lime-500" />
            </div>

            <div className="relative p-5 sm:p-6 space-y-5">
                {/* Level display */}
                <div>
                    <p className="text-xs font-bold text-neutral-400 uppercase  mb-1">ระดับของคุณ</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-neutral-900 leading-none tabular-nums">
                            {level}
                        </span>
                        <span className="text-base font-bold text-lime-500 leading-none">LVL</span>
                    </div>
                </div>

                {/* XP Progress */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <Zap className="h-3.5 w-3.5 text-lime-500" />
                            <span className="text-xs font-bold text-neutral-700 tabular-nums">
                                {(totalXp - (nextLevelXp - xpToNext)).toLocaleString()}
                            </span>
                            <span className="text-xs text-neutral-400 font-medium">
                                / {xpToNext.toLocaleString()}
                            </span>
                        </div>
                        <span className="text-xs font-bold text-lime-600 tabular-nums">{pct}%</span>
                    </div>

                    <AnimatedXPBar pct={pct} />

                    <p className="text-xs text-neutral-400 font-medium">
                        อีก <span className="text-neutral-700 font-bold">{(xpToNext - (totalXp - (nextLevelXp - xpToNext))).toLocaleString()} XP</span> เพื่อเลเวลถัดไป
                    </p>
                </div>

                {/* Badges */}
                {badges.length > 0 && (
                    <div className="pt-4 border-t border-neutral-50">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-1.5">
                                <Trophy className="h-3.5 w-3.5 text-amber-500" />
                                <span className="text-xs font-bold text-neutral-500 uppercase ">
                                    เหรียญรางวัล
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs font-bold text-neutral-400">
                                <span>{badges.length} รางวัล</span>
                                <ChevronRight className="h-3 w-3" />
                            </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {badges.slice(0, 6).map((badge) => (
                                <BadgePip key={badge.id} badge={badge} />
                            ))}
                            {badges.length > 6 && (
                                <div className="w-10 h-10 bg-neutral-50 rounded-xl border border-neutral-100 border-dashed flex items-center justify-center">
                                    <span className="text-xs font-bold text-neutral-400">+{badges.length - 6}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {badges.length === 0 && (
                    <div className="pt-4 border-t border-neutral-50">
                        <div className="flex items-center gap-1.5 mb-2">
                            <Trophy className="h-3.5 w-3.5 text-amber-400" />
                            <span className="text-xs font-bold text-neutral-400 uppercase ">เหรียญรางวัล</span>
                        </div>
                        <p className="text-xs text-neutral-400 font-medium">ออกกำลังกายเพื่อรับเหรียญแรก 🏅</p>
                    </div>
                )}
            </div>
        </div>
    );
}
