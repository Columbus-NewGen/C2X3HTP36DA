import type { GamificationProfile } from "../../types/gamification.types";
import { Pill } from "../ui";
import { Trophy, Flame, Star, Zap, Calendar } from "lucide-react";
import { cn } from "../../utils/cn";
import { EvolutionSpoiler } from "../Gamification/EvolutionSpoiler";

interface GamificationSectionProps {
    profile: GamificationProfile;
}

export default function GamificationSection({ profile }: GamificationSectionProps) {
    return (
        <div className="p-6 sm:p-8">
            {/* Level and XP Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-lime-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-lime-200">
                            <Star size={20} fill="currentColor" />
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase ">Gym Level</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 leading-none">
                        Level <span className="text-lime-500">{profile.current_level}</span>
                    </h2>
                </div>

                <div className="flex-1 max-w-sm">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase">XP Progress</span>
                        <span className="text-sm font-bold text-lime-600">{profile.total_xp} / {profile.next_level_xp} XP</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-50 p-0.5">
                        <div
                            className="h-full bg-lime-500 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${profile.xp_progress}%` }}
                        />
                    </div>
                    <p className="text-xs font-bold text-gray-400 mt-2 text-right uppercase ">
                        อีก {profile.xp_to_next_level} XP เพื่อเลเวลถัดไป
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                    { icon: <Flame className="text-orange-500" size={18} />, label: "Streak", value: `${profile.current_streak} วัน`, color: "bg-orange-50 border-orange-100" },
                    { icon: <Trophy className="text-amber-500" size={18} />, label: "Longest", value: `${profile.longest_streak} วัน`, color: "bg-amber-50 border-amber-100" },
                    { icon: <Calendar className="text-sky-500" size={18} />, label: "Weekly", value: `${profile.weekly_completed} / ${profile.weekly_target}`, color: "bg-sky-50 border-sky-100" },
                    { icon: <Zap className="text-indigo-500" size={18} />, label: "Workouts", value: `${profile.total_workouts} ครั้ง`, color: "bg-indigo-50 border-indigo-100" }
                ].map((item, i) => (
                    <div key={i} className={cn("p-4 rounded-2xl border transition-transform hover:scale-105", item.color)}>
                        <div className="mb-2">{item.icon}</div>
                        <div className="text-xs font-bold text-gray-400 uppercase  mb-0.5">{item.label}</div>
                        <div className="text-xl font-semibold text-gray-900">{item.value}</div>
                    </div>
                ))}
            </div>

            {/* Next Evolution Spoiler */}
            <div className="mb-8">
                <EvolutionSpoiler currentStreak={profile.current_streak} />
            </div>

            {/* Badges Preview */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase  flex items-center gap-2">
                        <Trophy size={16} className="text-amber-500" /> เหรียญเกียรติยศ
                    </h3>
                    <Pill tone="amber" className="h-5 text-xs font-bold px-2 border-none">
                        {profile.badges.length} BADGES
                    </Pill>
                </div>

                {profile.badges.length === 0 ? (
                    <div className="p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                        <p className="text-xs text-gray-400 font-bold uppercase ">ยังไม่ได้รับเหรียญรางวัล</p>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-4">
                        {profile.badges.slice(0, 6).map((badge) => (
                            <div key={badge.id} className="group relative">
                                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden transition-all group-hover:shadow-md group-hover:border-lime-200">
                                    {badge.icon_url ? (
                                        <img src={badge.icon_url} alt={badge.name} className="w-10 h-10 object-contain" />
                                    ) : (
                                        <div className="text-base">🏅</div>
                                    )}
                                </div>
                                {/* Tooltip hint */}
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-max opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <div className="bg-gray-900 text-white text-xs font-bold px-1.5 py-0.5 rounded uppercase translate-y-full">
                                        {badge.name}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
