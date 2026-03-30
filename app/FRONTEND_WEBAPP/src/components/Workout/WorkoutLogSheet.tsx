import {
    memo,
    useCallback,
    useEffect,
    useState,
} from "react";
import { Loader2, Save, Timer, MessageSquare, Plus, Minus } from "lucide-react";
import type {
    ScheduledWorkout,
} from "../../types/workout.types";
import type { ChecklistMap } from "../../hooks/workout/useExerciseChecklist";
import { workoutsApi } from "../../services/workoutsApi";
import { useAuth } from "../../hooks/useAuth";
import { cn, formatThaiDate, estimateMinutes, toYYYYMMDD } from "../../utils/workout.utils";
import { useToasts } from "../ui";
import { Modal } from "../ui/Modal";

interface WorkoutLogSheetProps {
    open: boolean;
    workout: ScheduledWorkout | null;
    /** The checklist Map with exerciseLogId for each completed slot */
    checklist: ChecklistMap;
    /** The workout_log id created by the exercise toggle flow */
    logId: number | undefined;
    onClose: () => void;
    onSaved?: () => void;
}

interface ExerciseFormRow {
    /** scheduled_workout_exercise_id (slotId) */
    slotId: number;
    /** The exercise log ID from the toggle flow (for PUT update) */
    exerciseLogId: number | undefined;
    exercise_id: number;
    exercise_name: string;
    sets_completed: number;
    reps_completed: number;
    weight_used: number;
    rpe_rating: number;
    notes: string;
}

function buildFormRows(
    workout: ScheduledWorkout,
    checklist: ChecklistMap,
): ExerciseFormRow[] {
    return [...workout.session.exercises]
        .sort((a, b) => a.order_sequence - b.order_sequence)
        .map((ex) => {
            const slot = checklist.get(ex.id);
            return {
                slotId: ex.id,
                exerciseLogId: slot?.exerciseLogId,
                exercise_id: slot?.exercise_id ?? ex.exercise_id,
                exercise_name: slot?.exercise_name ?? ex.exercise_name,
                sets_completed: ex.sets,
                reps_completed: ex.reps,
                weight_used: ex.weight ?? 0,
                rpe_rating: 0,
                notes: "",
            };
        });
}

/**
 * Compact Stepper for better visibility and space usage.
 */
function StepperInput({
    value,
    onChange,
    label,
    min = 0,
    max = 999,
    step = 1,
    unit = "",
}: {
    value: number;
    onChange: (v: number) => void;
    label: string;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
}) {
    const handleAdjust = (delta: number) => {
        const next = Math.min(max, Math.max(min, value + delta));
        onChange(next);
    };

    return (
        <div className="flex flex-col gap-1 flex-1">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tight text-center">
                {label}
            </span>
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-lime-500/20 focus-within:border-lime-500 transition-all">
                <button
                    type="button"
                    onClick={() => handleAdjust(-step)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-white transition-colors active:scale-90"
                >
                    <Minus size={12} strokeWidth={4} />
                </button>

                <input
                    type="number"
                    inputMode="decimal"
                    value={value || ""}
                    onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        onChange(Number.isNaN(v) ? 0 : Math.min(max, Math.max(min, v)));
                    }}
                    className="w-full min-w-0 bg-transparent text-center text-sm font-bold text-gray-900 outline-none tabular-nums"
                />

                <button
                    type="button"
                    onClick={() => handleAdjust(step)}
                    className="p-1.5 text-gray-500 hover:text-lime-600 hover:bg-white transition-colors active:scale-90"
                >
                    <Plus size={12} strokeWidth={4} />
                </button>
            </div>
            {unit && (
                <span className="text-[10px] font-bold text-gray-400 text-center uppercase">
                    {unit}
                </span>
            )}
        </div>
    );
}

function WorkoutLogSheetInner({
    open,
    workout,
    checklist,
    logId,
    onClose,
    onSaved,
}: WorkoutLogSheetProps) {
    const { user } = useAuth();
    const { addToast } = useToasts();

    const [exercises, setExercises] = useState<ExerciseFormRow[]>([]);
    const [duration, setDuration] = useState(30);
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (workout) {
            setExercises(buildFormRows(workout, checklist));
            setDuration(
                Math.round(estimateMinutes(workout.session.exercises.length)),
            );
            setNotes("");
            setError(null);
        }
    }, [workout, checklist]);

    const updateExercise = useCallback(
        (index: number, field: keyof ExerciseFormRow, value: number | string) => {
            setExercises((prev) =>
                prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex)),
            );
        },
        [],
    );

    const handleSave = useCallback(async () => {
        if (!user?.id || !workout) return;
        setSaving(true);
        setError(null);

        const completedExercises = exercises.filter(ex => {
            const item = checklist.get(ex.slotId);
            return item?.completed;
        });

        if (completedExercises.length === 0) {
            setError("กรุณาเลือกท่าฝึกอย่างน้อย 1 ท่า");
            setSaving(false);
            return;
        }

        try {
            if (logId) {
                const updatePromises = completedExercises.map((ex) => {
                    if (ex.exerciseLogId) {
                        return workoutsApi.updateExerciseInLog(user.id, logId, ex.exerciseLogId, {
                            exercise_id: ex.exercise_id,
                            sets_completed: ex.sets_completed,
                            reps_completed: ex.reps_completed,
                            weight_used: ex.weight_used || undefined,
                            rpe_rating: ex.rpe_rating || undefined,
                            notes: ex.notes || undefined,
                        });
                    } else {
                        return workoutsApi.addExerciseToLog(user.id, logId, {
                            exercise_id: ex.exercise_id,
                            scheduled_workout_exercise_id: ex.slotId,
                            sets_completed: ex.sets_completed,
                            reps_completed: ex.reps_completed,
                            weight_used: ex.weight_used || undefined,
                            rpe_rating: ex.rpe_rating || undefined,
                            notes: ex.notes || undefined,
                        });
                    }
                });
                await Promise.all(updatePromises);
            } else {
                await workoutsApi.logWorkout(user.id, {
                    scheduled_workout_id: workout.id,
                    session_id: workout.session.id || undefined,
                    workout_date: toYYYYMMDD(new Date()),
                    duration_minutes: duration,
                    notes: notes || undefined,
                    exercises: completedExercises.map((ex) => ({
                        exercise_id: ex.exercise_id,
                        scheduled_workout_exercise_id: ex.slotId,
                        sets_completed: ex.sets_completed,
                        reps_completed: ex.reps_completed,
                        weight_used: ex.weight_used || undefined,
                        rpe_rating: ex.rpe_rating || undefined,
                        notes: ex.notes || undefined,
                    })),
                });
            }

            await workoutsApi.updateScheduledStatus(user.id, workout.id, {
                status: "COMPLETED",
                notes: notes || undefined,
            });

            addToast("success", "บันทึกผลการออกกำลังกายเสร็จสมบูรณ์!");
            onSaved?.();
            onClose();
        } catch (err) {
            console.error("[WorkoutLogSheet] save failed", err);
            setError("ไม่สามารถบันทึกได้ ลองอีกครั้ง");
        } finally {
            setSaving(false);
        }
    }, [user?.id, workout, exercises, duration, notes, logId, checklist, onClose, onSaved, addToast]);

    if (!workout) return null;

    return (
        <Modal
            isOpen={open}
            onClose={onClose}
            title="บันทึกผล Workout"
            className="max-w-xl"
            footer={
                <div className="flex flex-col gap-2">
                    <button
                        disabled={saving}
                        onClick={handleSave}
                        className={cn(
                            "w-full rounded-2xl py-3.5 font-bold uppercase tracking-widest text-white flex items-center justify-center gap-3 transition-all",
                            "bg-gray-900 hover:bg-black active:scale-[0.98]",
                            "disabled:opacity-50"
                        )}
                    >
                        {saving ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <Save className="h-4 w-4 text-lime-400" />
                                บันทึกผลลัพธ์
                            </>
                        )}
                    </button>
                    <button
                        disabled={saving}
                        onClick={onClose}
                        className="w-full py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900"
                    >
                        ยกเลิก
                    </button>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Compact Header */}
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-bold text-lime-600 uppercase tracking-widest leading-none mb-1">
                            {formatThaiDate(new Date())}
                        </p>
                        <h2 className="text-xl font-bold text-gray-900 leading-none">
                            {workout.session.session_name}
                        </h2>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl">
                        <div className="flex items-center gap-1.5">
                            <Timer size={12} className="text-gray-400" />
                            <input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
                                className="w-8 text-xs font-bold bg-transparent outline-none text-gray-700"
                            />
                            <span className="text-[10px] font-bold text-gray-400">MIN</span>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-2 flex items-center gap-3">
                        <p className="text-xs font-bold text-red-700">{error}</p>
                    </div>
                )}

                {/* Compact Note */}
                <div className="group relative">
                    <MessageSquare size={10} className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Session notes..."
                        className="w-full rounded-xl border border-gray-100 bg-gray-50/50 pl-7 pr-4 py-2.5 text-xs font-bold text-gray-700 focus:bg-white focus:border-lime-500 outline-none transition-all"
                    />
                </div>

                {/* Compact Exercises Tracking */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">Tracker</span>
                        <div className="flex-1 h-px bg-gray-100" />
                    </div>

                    <div className="space-y-2">
                        {exercises.map((ex, i) => {
                            const isDone = checklist.get(ex.slotId)?.completed;
                            return (
                                <div
                                    key={`${ex.slotId}-${i}`}
                                    className={cn(
                                        "rounded-2xl border transition-all duration-300 p-3",
                                        isDone
                                            ? "border-gray-100 bg-white"
                                            : "border-gray-50 bg-gray-50/30 opacity-70"
                                    )}
                                >
                                    <div className="flex items-center justify-between gap-4 mb-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className={cn(
                                                "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0",
                                                isDone ? "bg-gray-900 text-lime-400" : "bg-gray-200 text-gray-500"
                                            )}>
                                                {i + 1}
                                            </div>
                                            <p className="text-sm font-bold text-gray-900 truncate">
                                                {ex.exercise_name}
                                            </p>
                                        </div>
                                        {!isDone && (
                                            <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md uppercase">
                                                Skipped
                                            </span>
                                        )}
                                    </div>

                                    {/* Compact Steppers */}
                                    <div className="flex flex-row gap-2">
                                        <StepperInput
                                            label="Sets"
                                            value={ex.sets_completed}
                                            onChange={(v) => updateExercise(i, "sets_completed", v)}
                                            min={1}
                                        />
                                        <StepperInput
                                            label="Reps"
                                            value={ex.reps_completed}
                                            onChange={(v) => updateExercise(i, "reps_completed", v)}
                                            min={1}
                                        />
                                        <StepperInput
                                            label="Weight"
                                            value={ex.weight_used}
                                            onChange={(v) => updateExercise(i, "weight_used", v)}
                                            step={2.5}
                                            unit="kg"
                                        />
                                        <StepperInput
                                            label="RPE"
                                            value={ex.rpe_rating}
                                            onChange={(v) => updateExercise(i, "rpe_rating", v)}
                                            max={10}
                                            unit="RPE"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </Modal>
    );
}

export const WorkoutLogSheet = memo(WorkoutLogSheetInner);
