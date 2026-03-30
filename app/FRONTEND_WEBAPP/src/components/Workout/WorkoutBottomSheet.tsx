import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Loader2, Play } from "lucide-react";
import type {
  ScheduledWorkout,
  ScheduledWorkoutStatus,
} from "../../types/workout.types";
import { WorkoutExerciseItem } from "./WorkoutExerciseItem";
import { cn, formatThaiDate } from "../../utils/workout.utils";

const SNAP_HEIGHT = 0.8;
const DRAG_THRESHOLD = 80;

interface WorkoutBottomSheetProps {
  open: boolean;
  workout: ScheduledWorkout | null;
  loading: boolean;
  onClose: () => void;
  onUpdateStatus: (id: number, status: ScheduledWorkoutStatus) => void;
}

function WorkoutBottomSheetInner({
  open,
  workout,
  loading,
  onClose,
  onUpdateStatus,
}: WorkoutBottomSheetProps) {
  const [dragY, setDragY] = useState(0);
  const startYRef = useRef(0);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    startYRef.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const dy = e.clientY - startYRef.current;
    if (dy > 0) setDragY(dy);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (dragY > DRAG_THRESHOLD) onClose();
    setDragY(0);
  }, [dragY, onClose]);

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

  if (!open || !workout) return null;

  const exercises = [...workout.session.exercises].sort(
    (a, b) => a.order_sequence - b.order_sequence
  );

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-title"
    >
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-md transition-opacity duration-200"
        style={{ opacity: Math.max(0, 1 - dragY / 400) }}
        onClick={onClose}
        aria-hidden
      />

      <div
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl flex flex-col shadow-2xl"
        style={{
          height: `calc(${SNAP_HEIGHT * 100}vh + ${dragY}px)`,
          maxHeight: "90vh",
          transition:
            dragY === 0
              ? "transform 0.45s cubic-bezier(0.32, 0.72, 0, 1), height 0s"
              : "none",
        }}
      >
        <div
          className="flex-shrink-0 pt-4 pb-2 flex flex-col items-center cursor-grab active:cursor-grabbing touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="w-12 h-1 rounded-full bg-gray-300" />
        </div>

        <header className="px-5 pb-4 flex-shrink-0">
          <p className="text-xs font-semibold text-gray-500 uppercase ">
            {formatThaiDate(workout.scheduled_date)}
          </p>
          <h2 id="sheet-title" className="text-xl font-bold text-gray-900 mt-1">
            {workout.session.session_name}
          </h2>
        </header>

        <div className="flex-1 overflow-y-auto px-5 pb-6">
          {workout.notes && (
            <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 p-4">
              <p className="text-sm text-amber-800">{workout.notes}</p>
            </div>
          )}

          <section>
            <h3 className="text-xs font-bold text-gray-500 uppercase  mb-3">
              รายการท่าฝึก
            </h3>
            <div className="rounded-2xl bg-gray-50/80 border border-gray-100 px-4 shadow-sm">
              {exercises.map((ex) => (
                <WorkoutExerciseItem key={ex.id} exercise={ex} />
              ))}
            </div>
          </section>
        </div>

        <footer className="px-5 py-4 border-t border-gray-100 space-y-2 flex-shrink-0 safe-area-pb">
          {workout.status !== "COMPLETED" && (
            <button
              disabled={loading}
              onClick={() => onUpdateStatus(workout.id, "COMPLETED")}
              className={cn(
                "w-full rounded-2xl py-4 font-semibold text-white flex items-center justify-center gap-2",
                "bg-lime-500 hover:bg-lime-600 active:bg-lime-700",
                "shadow-md shadow-lime-500/25 btn-press",
                "disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100",
                "transition-colors duration-200"
              )}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Play className="h-5 w-5" fill="currentColor" />
                  เริ่ม Workout
                </>
              )}
            </button>
          )}
          {workout.status === "SCHEDULED" && (
            <button
              disabled={loading}
              onClick={() => onUpdateStatus(workout.id, "SKIPPED")}
              className="w-full py-3 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              ข้าม
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

export const WorkoutBottomSheet = memo(WorkoutBottomSheetInner);
