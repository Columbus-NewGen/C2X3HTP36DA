import { motion } from "framer-motion";
import { CheckCircle2, XCircle, SkipForward, Info } from "lucide-react";

interface PerformanceStatsSectionProps {
    stats?: {
        total_workouts_scheduled: number;
        workouts_completed: number;
        workouts_missed: number;
        workouts_skipped: number;
        completion_rate: number;
        current_streak: number;
    };
    isLoading: boolean;
}

export default function PerformanceStatsSection({
    stats,
    isLoading,
}: PerformanceStatsSectionProps) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-3xl p-6 border border-neutral-200 animate-pulse h-48" />
        );
    }

    if (!stats) return null;
    const total =
        stats.workouts_completed +
        stats.workouts_missed +
        stats.workouts_skipped;

    const rate = total > 0
        ? Math.round((stats.workouts_completed / total) * 100)
        : 0;

    const getRateColor = (r: number) => {
        if (r >= 80) return "text-lime-500";
        if (r >= 50) return "text-amber-500";
        return "text-rose-500";
    };

    return (
        <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-sm overflow-hidden relative group">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-neutral-900 leading-none">คะแนนวินัย</h3>
                    <p className="text-xs font-bold text-neutral-400 uppercase  mt-1.5">Discipline Score</p>
                </div>
                <div className={`text-3xl font-bold tabular-nums ${getRateColor(rate)}`}>
                    {rate}%
                </div>
            </div>

            {/* Progress Bar Overall */}
            <div className="h-2 w-full bg-neutral-100 rounded-full mb-8 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${rate}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${rate >= 80 ? 'bg-lime-500' : rate >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                />
            </div>

            {/* Breakdown Grid */}
            <div className="grid grid-cols-3 gap-2">
                <div className="bg-neutral-50 rounded-2xl p-3 border border-transparent hover:border-lime-100 transition-colors">
                    <div className="flex items-center gap-1.5 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-lime-500" />
                        <span className="text-xs font-bold text-neutral-500 uppercase">สำเร็จ</span>
                    </div>
                    <div className="text-lg font-bold text-neutral-900 leading-none">
                        {stats.workouts_completed}
                    </div>
                    <p className="text-xs text-neutral-400 font-medium mt-1 leading-tight">ทำตรงตามแผนที่วางไว้</p>
                </div>

                <div className="bg-neutral-50 rounded-2xl p-3 border border-transparent hover:border-rose-100 transition-colors">
                    <div className="flex items-center gap-1.5 mb-1">
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                        <span className="text-xs font-bold text-neutral-500 uppercase">พลาด</span>
                    </div>
                    <div className="text-lg font-bold text-neutral-900 leading-none">
                        {stats.workouts_missed}
                    </div>
                    <p className="text-xs text-neutral-400 font-medium mt-1 leading-tight">ไม่ได้ทำและไม่ได้เลื่อน</p>
                </div>

                <div className="bg-neutral-50 rounded-2xl p-3 border border-transparent hover:border-neutral-200 transition-colors">
                    <div className="flex items-center gap-1.5 mb-1">
                        <SkipForward className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="text-xs font-bold text-neutral-500 uppercase">ข้าม</span>
                    </div>
                    <div className="text-lg font-bold text-neutral-900 leading-none">
                        {stats.workouts_skipped}
                    </div>
                    <p className="text-xs text-neutral-400 font-medium mt-1 leading-tight">เลือกข้ามวันฝึกนั้นไป</p>
                </div>
            </div>

            {/* Summary Tooltip Info */}
            <div className="mt-4 pt-4 border-t border-dashed border-neutral-100 flex items-start gap-2">
                <Info className="w-3 h-3 text-neutral-300 shrink-0 mt-0.5" />
                <p className="text-xs text-neutral-400 font-medium leading-relaxed">
                    คะแนนวินัยคำนวณจากสัดส่วนการออกกำลังกายที่ทำสำเร็จ เทียบกับแผนทั้งหมดที่คุณวางไว้
                </p>
            </div>
        </div>
    );
}
