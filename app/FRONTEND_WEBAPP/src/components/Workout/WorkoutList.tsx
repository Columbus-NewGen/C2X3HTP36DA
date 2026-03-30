import { memo } from "react";
import { CheckCircle2, Circle, ChevronRight, MinusCircle, SkipForward } from "lucide-react";
import type {
  ScheduledWorkout,
} from "../../types/workout.types";
import { formatShortDate, cn } from "../../utils/workout.utils";
import { resolveImageUrl } from "../../utils/floorplan.utils";
import { Activity } from "lucide-react";

interface WorkoutListProps {
  workouts: ScheduledWorkout[];
  onSelect: (workout: ScheduledWorkout) => void;
  showExercisePreview?: boolean;
  showStatus?: boolean;
}

interface WorkoutListItemProps {
  workout: ScheduledWorkout;
  onClick: () => void;
  showExercisePreview?: boolean;
  showStatus?: boolean;
}

// ── Status badge ──
const STATUS_CONFIG = {
  SCHEDULED: {
    label: "รอทำ",
    icon: <Circle className="h-3 w-3" />,
    cls: "bg-amber-50 text-amber-600 border-amber-200",
  },
  COMPLETED: {
    label: "เสร็จแล้ว",
    icon: <CheckCircle2 className="h-3 w-3" />,
    cls: "bg-lime-50 text-lime-700 border-lime-200",
  },
  MISSED: {
    label: "พลาด",
    icon: <MinusCircle className="h-3 w-3" />,
    cls: "bg-red-50 text-red-600 border-red-200",
  },
  SKIPPED: {
    label: "ข้ามไป",
    icon: <SkipForward className="h-3 w-3" />,
    cls: "bg-gray-100 text-gray-500 border-gray-200",
  },
} as const;

function StatusBadge({ status }: { status: ScheduledWorkout["status"] }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.SCHEDULED;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold shrink-0",
        cfg.cls,
      )}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

const WorkoutListItem = memo(
  ({ workout, onClick, showExercisePreview, showStatus }: WorkoutListItemProps) => {
    const exCount = workout.session.exercises?.length ?? 0;
    const exercises = [...(workout.session.exercises ?? [])].sort(
      (a, b) => a.order_sequence - b.order_sequence,
    );
    const previews = showExercisePreview ? exercises.slice(0, 3) : [];

    const status = workout.status;
    const isCompleted = status === "COMPLETED";


    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "group relative w-full text-left p-5 rounded-3xl transition-all duration-300 mb-4",
          "bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 hover:-translate-y-1 active:scale-[0.98]",
          isCompleted && "bg-gray-50/50"
        )}
      >
        {/* Top Section: Date + Status */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", isCompleted ? "bg-lime-500" : "bg-amber-400")} />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {formatShortDate(workout.scheduled_date)}
            </span>
          </div>
          {showStatus && <StatusBadge status={status} />}
        </div>

        {/* Content Section */}
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h3 className={cn(
              "text-lg font-bold leading-tight truncate",
              isCompleted ? "text-gray-500" : "text-gray-900"
            )}>
              {workout.session.session_name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-lime-600 uppercase tracking-wider">
                {workout.session.workout_split || "Workout"}
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-200" />
              <span className="text-xs font-medium text-gray-400">{exCount} Exercises</span>
            </div>
          </div>

          <div className="shrink-0 w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-lime-500 group-hover:text-white transition-all duration-300">
            <ChevronRight size={20} />
          </div>
        </div>

        {/* Exercise Previews */}
        {previews.length > 0 && (
          <div className="mt-5 pt-4 border-t border-gray-50">
            <div className="space-y-2.5">
              {previews.map((ex) => (
                <div key={ex.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                    {ex.image_url ? (
                      <img
                        src={resolveImageUrl(ex.image_url) || undefined}
                        className="w-full h-full object-cover"
                        alt={ex.exercise_name}
                      />
                    ) : (
                      <Activity size={14} className="text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-gray-700 truncate">
                        {ex.exercise_name}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-lg bg-gray-50 border border-gray-100">
                        <span className="text-xs font-bold text-gray-900">
                          {ex.sets}×{ex.reps}
                        </span>
                        {ex.weight != null && (
                          <span className="text-xs font-bold text-lime-600">
                            {ex.weight}kg
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {exCount > 3 && (
                <div className="pl-12 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  + {exCount - 3} More Exercises
                </div>
              )}
            </div>
          </div>
        )}
      </button>
    );
  },
);

WorkoutListItem.displayName = "WorkoutListItem";

function WorkoutListInner({
  workouts,
  onSelect,
  showExercisePreview,
  showStatus,
}: WorkoutListProps) {
  return (
    <div className="space-y-3">
      {workouts.map((w) => (
        <WorkoutListItem
          key={w.id}
          workout={w}
          onClick={() => onSelect(w)}
          showExercisePreview={showExercisePreview}
          showStatus={showStatus}
        />
      ))}
    </div>
  );
}

export const WorkoutList = memo(WorkoutListInner);
