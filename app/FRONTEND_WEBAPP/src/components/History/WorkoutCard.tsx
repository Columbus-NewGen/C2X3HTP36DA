import { memo } from "react";
import type { WorkoutLog, ScheduledWorkout } from "../../types/workout.types";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Slash,
  Calendar,
  ChevronRight,
  Zap,
} from "lucide-react";
import { formatThaiDate } from "../../utils/workoutHistory.utils";
import { cn } from "../../utils/cn";
import { motion } from "framer-motion";

interface WorkoutCardProps {
  data: WorkoutLog | ScheduledWorkout;
  onSelect: (log: WorkoutLog) => void;
  type: 'log' | 'scheduled';
}

export const WorkoutCard = memo(({ data, onSelect, type }: WorkoutCardProps) => {
  const isLog = type === 'log';
  const log = isLog ? (data as WorkoutLog) : (data as ScheduledWorkout).workout_log;
  const scheduled = !isLog ? (data as ScheduledWorkout) : null;

  const status = isLog ? 'COMPLETED' : scheduled?.status || 'SCHEDULED';
  const session = isLog ? log?.session : scheduled?.session;
  const dateStr = isLog ? log?.workout_date : scheduled?.scheduled_date;
  const exerciseCount = isLog ? (log?.exercises?.length || 0) : (session?.exercises?.length || 0);

  // Status-specific styles
  const statusConfig: Record<string, { icon: any; color: string; bg: string; border: string; label: string; glow: string }> = {
    COMPLETED: {
      icon: CheckCircle2,
      color: 'text-lime-500',
      bg: 'bg-lime-50/50',
      border: 'border-lime-100',
      label: 'สำเร็จ',
      glow: 'rgba(132, 204, 22, 0.1)'
    },
    SCHEDULED: {
      icon: Calendar,
      color: 'text-blue-500',
      bg: 'bg-blue-50/50',
      border: 'border-blue-100',
      label: 'แผนงาน',
      glow: 'rgba(59, 130, 246, 0.1)'
    },
    MISSED: {
      icon: XCircle,
      color: 'text-rose-500',
      bg: 'bg-rose-50/50',
      border: 'border-rose-100',
      label: 'พลาด',
      glow: 'rgba(244, 63, 94, 0.1)'
    },
    SKIPPED: {
      icon: Slash,
      color: 'text-neutral-400',
      bg: 'bg-neutral-50/50',
      border: 'border-neutral-200',
      label: 'ข้าม',
      glow: 'rgba(0, 0, 0, 0)'
    },
  };

  const config = statusConfig[status] || { icon: Clock, color: 'text-neutral-400', bg: 'bg-neutral-50/50', border: 'border-neutral-100', label: status, glow: 'none' };
  const StatusIcon = config.icon;

  return (
    <motion.div
      whileTap={isLog ? { scale: 0.98 } : {}}
      className={cn(
        "group relative bg-white rounded-[2rem] border p-6 transition-all duration-300",
        isLog ? "hover:border-lime-300 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-lime-500/5" : "opacity-70 grayscale-[0.5] border-dashed border-neutral-200"
      )}
      onClick={() => isLog && log ? onSelect(log) : null}
    >
      <div className="flex items-center gap-6">
        {/* Minimal Status Indicator */}
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border transition-transform duration-500 group-hover:scale-110",
          config.bg, config.color, config.border
        )}>
          <StatusIcon size={24} strokeWidth={2} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="text-lg font-bold text-neutral-800 truncate leading-snug group-hover:text-lime-600 transition-colors">
              {session?.session_name || "Freestyle Session"}
            </h3>
            {isLog ? (
              <span className="shrink-0 px-2 py-0.5 rounded-lg bg-lime-500 text-white text-[10px] font-bold uppercase tracking-widest">
                DONE
              </span>
            ) : status === 'SCHEDULED' ? (
              <span className="shrink-0 px-2 py-0.5 rounded-lg bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest">
                PLAN
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-3 overflow-hidden">
            {/* Date */}
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest shrink-0">
              {formatThaiDate(dateStr || '', { day: 'numeric', month: 'short' })}
            </span>

            <div className="w-1 h-1 rounded-full bg-neutral-200 shrink-0" />

            {/* Exercise Count */}
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">{exerciseCount} EXERCISES</span>
            </div>

            {isLog && log?.duration_minutes && (
              <>
                <div className="w-1 h-1 rounded-full bg-neutral-200 shrink-0" />
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[11px] font-bold text-lime-600 uppercase tracking-wider">{log.duration_minutes} MINS</span>
                </div>
              </>
            )}

            {isLog && log?.completeness && (
              <>
                <div className="w-1 h-1 rounded-full bg-neutral-200 shrink-0" />
                <div className="flex items-center gap-1 shrink-0 bg-lime-50 px-2 py-0.5 rounded-md">
                  <Zap size={10} className="text-lime-500 shrink-0" fill="currentColor" />
                  <span className="text-[10px] font-bold text-lime-600">
                    {Math.round((log.completeness.completed_slots / log.completeness.total_prescribed) * 100)}%
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {isLog && (
          <div className="shrink-0 w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-300 group-hover:text-white group-hover:bg-lime-500 transition-all">
            <ChevronRight size={18} />
          </div>
        )}
      </div>
    </motion.div>
  );
});

WorkoutCard.displayName = "WorkoutCard";
