import { memo, useEffect } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Weight,
  Gauge,
  StickyNote,
  X,
} from "lucide-react";
import type { WorkoutLog, WorkoutLogExercise } from "../../types/workout.types";
import { formatThaiDate } from "../../utils/workout.utils";
import { motion, AnimatePresence } from "framer-motion";

// ── Exercise Row ──────────────────────────────────────────────────────────────
function LogExerciseRow({
  exercise,
  index,
}: {
  exercise: WorkoutLogExercise;
  index: number;
}) {
  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-lime-100 text-xs font-bold text-lime-700">
          {index + 1}
        </span>
        <span className="flex-1 min-w-0 text-sm font-semibold text-gray-900 truncate">
          {exercise.exercise_name || `Exercise #${exercise.exercise_id}`}
        </span>
      </div>
      <div className="mt-2 ml-10 flex flex-wrap items-center gap-2">
        <span className="rounded-lg bg-lime-50 border border-lime-100 px-2.5 py-1 text-xs font-bold text-lime-700">
          {exercise.sets_completed} × {exercise.reps_completed}
        </span>
        {exercise.weight_used != null && (
          <span className="rounded-lg bg-gray-50 border border-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
            {exercise.weight_used} kg
          </span>
        )}
        {exercise.rpe_rating != null && (
          <span className="rounded-lg bg-amber-50 border border-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
            RPE {exercise.rpe_rating}
          </span>
        )}
      </div>
      {exercise.notes && (
        <p className="mt-1.5 ml-10 text-xs text-gray-400 italic">
          {exercise.notes}
        </p>
      )}
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface WorkoutLogDetailSheetProps {
  open: boolean;
  log: WorkoutLog | null;
  onClose: () => void;
}

function WorkoutLogDetailSheetInner({
  open,
  log,
  onClose,
}: WorkoutLogDetailSheetProps) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onEsc);
    };
  }, [open, onClose]);

  const exercises = log?.exercises ?? [];
  const sessionName = log?.session?.session_name ?? `Log #${log?.id}`;
  const totalSets = exercises.reduce((s, ex) => s + ex.sets_completed, 0);

  return (
    <AnimatePresence>
      {open && log && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
              mass: 0.8,
            }}
            className="relative w-full max-w-2xl bg-white rounded-t-[2.5rem] shadow-2xl flex flex-col max-h-[92dvh] overflow-hidden"
          >
            {/* Drag Handle & Close */}
            <div className="flex-shrink-0 pt-4 pb-2 flex flex-col items-center">
              <div className="w-12 h-1 rounded-full bg-neutral-200 mb-2" />
              <button
                onClick={onClose}
                className="absolute right-6 top-6 p-2 rounded-full bg-neutral-50 text-neutral-400 hover:text-neutral-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Header */}
            <header className="px-6 pb-6 flex-shrink-0">
              <div className="flex items-start justify-between gap-3 pr-10">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-neutral-400 uppercase  mb-1">
                    {formatThaiDate(log.workout_date)}
                  </p>
                  <h2 className="text-2xl font-bold text-neutral-900 leading-none truncate">
                    {sessionName}
                  </h2>
                </div>
              </div>

              {/* Meta stats */}
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-50 border border-neutral-100 text-xs font-bold text-neutral-500 uppercase ">
                  <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                  {formatThaiDate(log.workout_date)}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-50 border border-neutral-100 text-xs font-bold text-neutral-500 uppercase ">
                  <Clock className="h-3.5 w-3.5 text-neutral-400" />
                  {log.duration_minutes} นาที
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime-50 border border-lime-100 text-xs font-bold text-lime-600 uppercase ">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  เสร็จแล้ว
                </span>
              </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-12 scrollbar-hide">
              {/* Notes */}
              {log.notes && (
                <div className="mb-8 rounded-2xl bg-amber-50/50 border border-amber-100 p-5 flex items-start gap-3">
                  <StickyNote className="h-4 w-4 text-amber-500 mt-1 shrink-0" />
                  <p className="text-sm font-medium text-amber-900 leading-relaxed italic">
                    "{log.notes}"
                  </p>
                </div>
              )}

              {/* RPE summary */}
              {exercises.some((ex) => ex.rpe_rating != null) && (
                <div className="mb-8 rounded-2xl bg-neutral-900 p-5 flex items-center justify-between shadow-xl shadow-neutral-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center">
                      <Gauge className="h-6 w-6 text-lime-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-400 uppercase  mb-0.5">
                        Average RPE
                      </p>
                      <p className="text-xl font-bold text-white tabular-nums">
                        {(
                          exercises
                            .filter((ex) => ex.rpe_rating != null)
                            .reduce((s, ex) => s + (ex.rpe_rating ?? 0), 0) /
                          exercises.filter((ex) => ex.rpe_rating != null).length
                        ).toFixed(1)}
                        <span className="text-xs text-neutral-500 ml-1">
                          / 10.0
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-neutral-400 uppercase  mb-0.5">
                      Total Effort
                    </p>
                    <p className="text-xs font-bold text-neutral-100">
                      {totalSets} เซ็ตที่เน้น
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-4 bg-lime-500 rounded-full" />
                <h3 className="text-xs font-bold text-neutral-400 uppercase ">
                  รายการท่าที่ฝึก ({exercises.length})
                </h3>
              </div>

              <div className="rounded-3xl bg-neutral-50/50 border border-neutral-100 px-5 shadow-inner">
                {exercises.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-neutral-300">
                    <Weight size={32} className="mb-2 opacity-50" />
                    <p className="text-sm font-medium">ไม่มีรายการท่า</p>
                  </div>
                ) : (
                  exercises.map((ex, i) => (
                    <LogExerciseRow key={ex.id ?? i} exercise={ex} index={i} />
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export const WorkoutLogDetailSheet = memo(WorkoutLogDetailSheetInner);
