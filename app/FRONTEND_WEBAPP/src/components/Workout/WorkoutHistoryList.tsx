import { memo } from "react";
import { motion } from "framer-motion";
import { Clock, Weight, ChevronRight, Activity } from "lucide-react";
import type { WorkoutLog } from "../../types/workout.types";
import { formatShortDate } from "../../utils/workout.utils";

interface WorkoutLogListProps {
  groups: { label: string; logs: WorkoutLog[] }[];
  onSelect?: (log: WorkoutLog) => void;
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }
  }
};

// ── Single Log Card ───────────────────────────────────────────────────────────
const LogCard = memo(
  ({ log, onClick }: { log: WorkoutLog; onClick?: () => void }) => {
    const exCount = log.exercises?.length ?? 0;
    const sessionName = log.session?.session_name;
    const hasNotes = !!log.notes;

    return (
      <motion.button
        variants={itemVariants}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={onClick}
        className="group relative w-full text-left rounded-[2rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-lime-500/5 hover:border-lime-200 transition-all duration-300 overflow-hidden mb-4"
      >
        <div className="flex">
          {/* Status color side bar */}
          <div className="w-1.5 bg-gradient-to-b from-lime-400 to-lime-500 shrink-0" />

          <div className="flex-1 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime-50 text-lime-600">
                  <Activity className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold uppercase  text-gray-400">
                  {formatShortDate(log.workout_date)}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-lime-500 group-hover:translate-x-1 transition-all" />
            </div>

            <h4 className="text-xl font-semibold text-gray-900 leading-tight mb-4">
              {sessionName ?? `Log #${log.id}`}
            </h4>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[...Array(Math.min(exCount, 3))].map((_, i) => (
                  <div key={i} className="h-6 w-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                    <Weight className="h-3 w-3 text-gray-400" />
                  </div>
                ))}
                {exCount > 3 && (
                  <div className="h-6 w-6 rounded-full border-2 border-white bg-gray-900 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-white">+{exCount - 3}</span>
                  </div>
                )}
              </div>

              <div className="h-4 w-px bg-gray-100 mx-1" />

              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-gray-300" />
                <span className="text-xs font-bold text-gray-500">{log.duration_minutes}m</span>
              </div>

              {hasNotes && (
                <div className="flex items-center gap-1.5 ml-auto">
                  <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase text-amber-500">Note</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.button>
    );
  },
);

LogCard.displayName = "LogCard";

// ── Grouped Timeline List ──────────────────────────────────────────────────────
function WorkoutHistoryListInner({ groups, onSelect }: WorkoutLogListProps) {
  return (
    <div className="relative">
      {/* Timeline vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-gray-200 via-gray-100 to-transparent" />

      <div className="space-y-12">
        {groups.map(({ label, logs }) => (
          <div key={label} className="relative">
            {/* Timeline node */}
            <div className="absolute left-4 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-[#F8F9FA] z-10">
              <div className="h-3 w-3 rounded-full bg-white border-2 border-lime-500 shadow-[0_0_8px_rgba(132,204,22,0.4)]" />
            </div>

            <div className="pl-12">
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-900  uppercase">{label}</h3>
                <div className="h-0.5 w-8 bg-lime-500 mt-1 rounded-full" />
              </div>

              <div className="space-y-1">
                {logs.map((log) => (
                  <LogCard
                    key={log.id}
                    log={log}
                    onClick={onSelect ? () => onSelect(log) : undefined}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const WorkoutLogList = memo(WorkoutHistoryListInner);
export const WorkoutHistoryList = WorkoutLogList;
