import { memo } from "react";
import { CheckCircle2, Circle, MinusCircle, SkipForward } from "lucide-react";
import type { ScheduledWorkout } from "../../types/workout.types";
import { WorkoutExerciseItem } from "./WorkoutExerciseItem";
import { cn, formatThaiDate } from "../../utils/workout.utils";
import { Modal } from "../ui/Modal";

interface WorkoutDetailSheetProps {
    open: boolean;
    workout: ScheduledWorkout | null;
    onClose: () => void;
}

// ── Status badge helper ──
function StatusBadge({ status }: { status: ScheduledWorkout["status"] }) {
    const map = {
        SCHEDULED: {
            label: "รอดำเนินการ",
            icon: <Circle className="h-3.5 w-3.5" />,
            cls: "bg-amber-50 text-amber-700 border-amber-200",
        },
        COMPLETED: {
            label: "เสร็จแล้ว",
            icon: <CheckCircle2 className="h-3.5 w-3.5" />,
            cls: "bg-lime-50 text-lime-700 border-lime-200",
        },
        MISSED: {
            label: "พลาด",
            icon: <MinusCircle className="h-3.5 w-3.5" />,
            cls: "bg-red-50 text-red-600 border-red-200",
        },
        SKIPPED: {
            label: "ข้ามไป",
            icon: <SkipForward className="h-3.5 w-3.5" />,
            cls: "bg-gray-100 text-gray-500 border-gray-200",
        },
    };
    const { label, icon, cls } = map[status] ?? map.SCHEDULED;
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold shadow-sm",
                cls,
            )}
        >
            {icon}
            {label}
        </span>
    );
}

function WorkoutDetailSheetInner({
    open,
    workout,
    onClose,
}: WorkoutDetailSheetProps) {
    if (!workout) return null;

    const exercises = [...workout.session.exercises].sort(
        (a, b) => a.order_sequence - b.order_sequence,
    );

    return (
        <Modal
            isOpen={open}
            onClose={onClose}
            title={workout.session.session_name}
            className="max-w-md"
            footer={
                <p className="text-center text-xs font-medium text-gray-400">
                    ดูรายละเอียดเท่านั้น · ไปที่แท็บ &ldquo;วันนี้&rdquo; เพื่อเริ่ม Workout
                </p>
            }
        >
            <div className="space-y-6">
                {/* Header Stats */}
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            {formatThaiDate(workout.scheduled_date)}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                            <span className="text-sm font-bold text-lime-600 bg-lime-50 px-2 py-0.5 rounded-lg border border-lime-100 uppercase">
                                {workout.session.workout_split}
                            </span>
                            <span className="text-sm font-semibold text-gray-500">
                                {exercises.length} ท่า
                            </span>
                        </div>
                    </div>
                    <StatusBadge status={workout.status} />
                </div>

                {/* Notes if any */}
                {workout.notes && (
                    <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
                        <p className="text-sm text-amber-800 leading-relaxed italic">
                            &ldquo;{workout.notes}&rdquo;
                        </p>
                    </div>
                )}

                {/* Exercises section */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                        รายการท่าฝึก
                    </h3>
                    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
                        <div className="divide-y divide-gray-50 px-4">
                            {exercises.map((ex) => (
                                <WorkoutExerciseItem key={ex.id} exercise={ex} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

export const WorkoutDetailSheet = memo(WorkoutDetailSheetInner);
