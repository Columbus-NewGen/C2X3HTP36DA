import { Flame, CalendarCheck, Weight, TrendingUp } from "lucide-react";
import type { GamificationProfile } from "../../types/gamification.types";

interface MomentumStripProps {
    profile: GamificationProfile;
    totalWorkouts?: number;
}

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    sub?: string;
    accentClass: string;
    iconBg: string;
}

function StatCard({ icon, label, value, sub, accentClass, iconBg }: StatCardProps) {
    return (
        <div className={`bg-white border border-neutral-100 rounded-2xl p-4 shadow-sm flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg}`}>
                {icon}
            </div>
            <div>
                <p className="text-xs font-bold text-neutral-400 uppercase mb-0.5">{label}</p>
                <p className={`text-base font-bold leading-none tabular-nums ${accentClass}`}>{value}</p>
                {sub && <p className="text-xs text-neutral-400 font-medium mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

export default function MomentumStrip({ profile, totalWorkouts }: MomentumStripProps) {
    const streak = profile.current_streak;
    const longest = profile.longest_streak;
    const weekly = profile.weekly_completed;
    const target = profile.weekly_target;
    const weeklyPct = target > 0 ? Math.round((weekly / target) * 100) : 0;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
                icon={<Flame className="h-4 w-4 text-orange-500" />}
                iconBg="bg-orange-50"
                label="สตรีคปัจจุบัน"
                value={streak}
                sub={`${streak} วัน`}
                accentClass="text-orange-500"
            />
            <StatCard
                icon={<TrendingUp className="h-4 w-4 text-purple-500" />}
                iconBg="bg-purple-50"
                label="สตรีคสูงสุด"
                value={longest}
                sub={`${longest} วัน`}
                accentClass="text-purple-500"
            />
            <StatCard
                icon={<CalendarCheck className="h-4 w-4 text-sky-500" />}
                iconBg="bg-sky-50"
                label="สัปดาห์นี้"
                value={`${weekly}/${target}`}
                sub={`${weeklyPct}% ของเป้าหมาย`}
                accentClass="text-sky-500"
            />
            <StatCard
                icon={<Weight className="h-4 w-4 text-lime-600" />}
                iconBg="bg-lime-50"
                label="เซสชั่นทั้งหมด"
                value={totalWorkouts ?? "—"}
                sub="การออกกำลังกาย"
                accentClass="text-lime-600"
            />
        </div>
    );
}
