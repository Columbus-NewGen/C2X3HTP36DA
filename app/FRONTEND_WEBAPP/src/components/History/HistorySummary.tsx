import { memo, useMemo } from "react";
import type { WorkoutLog } from "../../types/workout.types";
import { calculateSessionVolume } from "../../utils/workoutHistory.utils";
import { Award } from "lucide-react";
import { motion } from "framer-motion";

interface HistorySummaryProps {
  logs: WorkoutLog[];
  pastDays: number;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export const HistorySummary = memo(
  ({ logs, pastDays }: HistorySummaryProps) => {
    const stats = useMemo(() => {
      const totalMinutes = logs.reduce(
        (acc, log) => acc + (log.duration_minutes || 0),
        0,
      );
      const totalVolume = logs.reduce(
        (acc, log) => acc + calculateSessionVolume(log.exercises || []),
        0,
      );
      const avgPerWeek = (logs.length / (pastDays / 7)).toFixed(1);
      const bestSessionMinutes = Math.max(
        0,
        ...logs.map((l) => l.duration_minutes || 0),
      );

      return {
        totalHours: (totalMinutes / 60).toFixed(1),
        totalVolume: (totalVolume / 1000).toFixed(1), // In Tons
        avgPerWeek,
        bestSessionMinutes,
      };
    }, [logs, pastDays]);

    return (
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3"
      >
        {/* Main Stats Card */}
        <motion.div
          variants={item}
          className="col-span-2 bg-white rounded-3xl p-5 border border-neutral-100/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-500/10 flex items-center justify-center">
              <Award className="text-lime-600 w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900 leading-tight">
                {logs.length}
              </div>
              <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-tight">
                เซสชันที่สำเร็จ
              </div>
            </div>
          </div>

          <div className="flex gap-6 pr-2">
            <div>
              <div className="text-lg font-bold text-neutral-900 leading-tight">
                {stats.totalHours}
              </div>
              <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-tight">
                ชั่วโมงรวม
              </div>
            </div>
            <div>
              <div className="text-lg font-bold text-neutral-900 leading-tight">
                {stats.avgPerWeek}
              </div>
              <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-tight">
                ครั้ง / สัปดาห์
              </div>
            </div>
          </div>
        </motion.div>

        {/* Volume Card */}
        <motion.div
          variants={item}
          className="bg-white rounded-2xl p-4 border border-neutral-100/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
        >
          <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1 px-0.5">
            ปริมาณรวม (ตัน)
          </div>
          <div className="flex items-baseline gap-1 px-0.5">
            <span className="text-xl font-bold text-neutral-800">{stats.totalVolume}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mb-1" />
          </div>
        </motion.div>

        {/* Best Card */}
        <motion.div
          variants={item}
          className="bg-white rounded-2xl p-4 border border-neutral-100/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
        >
          <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1 px-0.5">
            นานสุด (นาที)
          </div>
          <div className="flex items-baseline gap-1 px-0.5">
            <span className="text-xl font-bold text-neutral-800">{stats.bestSessionMinutes}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mb-1" />
          </div>
        </motion.div>
      </motion.div>
    );
  },
);


