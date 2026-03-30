import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Zap,
    Trophy,
    TrendingUp,
    CheckCircle2,
    Flame,
    Sparkles,
    Calendar,
    Plus,
    ChevronRight,
    ChevronLeft,
    History,
    Weight,
    BarChart3,
    ListCheck,
    AlertCircle,
} from "lucide-react";
import { useToasts, ToastContainer } from "../ui";
import { cn } from "../../utils/cn";
import {
    formatDate,
    MUSCLE_MAP,
    API_TO_COMMON,
    INTENSITY_COLORS,
} from "../../utils/trainer.utils";
import { workoutsApi } from "../../services/workoutsApi";
import { trainerApi } from "../../services/TrainerAPI";
import type { TraineeProgress } from "../../types/trainer.types";
import type {
    TraineeModalProps,
    PickerAction,
    ConfirmDeleteInfo,
    ExerciseOption,
} from "../../types/trainerDashboard.types";
import Avatar from "./Avatar";
import ExerciseRow from "./ExerciseRow";
import ExercisePickerModal from "./ExercisePickerModal";
import WorkoutLogDetailModal from "./WorkoutLogDetailModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import Model from "react-body-highlighter";

const ModelAny = Model as React.ComponentType<Record<string, unknown>>;

export default function TraineeModal({
    isOpen,
    trainee,
    onClose,
}: TraineeModalProps) {
    const [selectedWorkoutId, setSelectedWorkoutId] = useState<number | null>(null);
    const [selectedLogId, setSelectedLogId] = useState<number | null>(null);
    const [hoveredMuscle, setHoveredMuscle] = useState<{
        muscle_name: string;
        intensity_score: number;
    } | null>(null);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerAction, setPickerAction] = useState<PickerAction>({ type: "add" });
    const [confirmDelete, setConfirmDelete] = useState<ConfirmDeleteInfo | null>(null);
    const { toasts, addToast, removeToast } = useToasts();
    const queryClient = useQueryClient();
    const scrollRef = useRef<HTMLDivElement>(null);

    /* ── Data queries ─────────────────────────────────────────── */
    const { data: progress } = useQuery<TraineeProgress>({
        queryKey: ["trainee-progress", trainee?.id],
        queryFn: () =>
            trainee ? trainerApi.getTraineeProgress(trainee.id) : Promise.reject(),
        enabled: isOpen && !!trainee,
    });

    const { data: upcoming, isLoading: isUpcomingLoading } = useQuery({
        queryKey: ["trainee-upcoming", trainee?.id],
        queryFn: () => {
            const start = new Date().toISOString().split("T")[0];
            const end = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0];
            return trainee
                ? workoutsApi.getScheduled(trainee.id, start, end, "ACTIVE")
                : Promise.reject();
        },
        enabled: isOpen && !!trainee,
    });

    /* ── Mutations ────────────────────────────────────────────── */
    const updateEx = useMutation({
        mutationFn: (vars: { workoutId: number; exerciseId: number; data: { sets: number; reps: number; weight: number; exercise_id?: number } }) =>
            workoutsApi.updateScheduledExercise(
                trainee!.id,
                vars.workoutId,
                vars.exerciseId,
                vars.data,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["trainee-upcoming"] });
            addToast("success", "อัปเดตท่าออกกำลังกายสำเร็จ");
        },
        onError: () => addToast("error", "ไม่สามารถอัปเดตได้ กรุณาลองใหม่"),
    });

    const deleteEx = useMutation({
        mutationFn: (vars: { workoutId: number; exerciseId: number }) =>
            workoutsApi.deleteScheduledExercise(
                trainee!.id,
                vars.workoutId,
                vars.exerciseId,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["trainee-upcoming"] });
            addToast("success", "ลบท่าออกกำลังกายเรียบร้อย");
            setConfirmDelete(null);
        },
        onError: () =>
            addToast("error", "ไม่สามารถลบท่าออกกำลังกายได้ กรุณาลองใหม่"),
    });

    const addEx = useMutation({
        mutationFn: (vars: { workoutId: number; data: { exercise_id: number; sets: number; reps: number; weight: number } }) =>
            workoutsApi.addScheduledExercise(trainee!.id, vars.workoutId, vars.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["trainee-upcoming"] });
            addToast("success", "เพิ่มท่าออกกำลังกายสำเร็จ");
            setPickerOpen(false);
        },
        onError: () => addToast("error", "ไม่สามารถเพิ่มท่าออกกำลังกายได้"),
    });

    /* ── Handlers ─────────────────────────────────────────────── */
    const handleExerciseSelect = (exercise: ExerciseOption) => {
        const workoutId = selectedWorkoutId || (upcoming as { id: number }[])?.[0]?.id;
        if (!workoutId || !trainee) return;
        if (pickerAction.type === "replace" && pickerAction.exerciseId) {
            updateEx.mutate({
                workoutId,
                exerciseId: pickerAction.exerciseId,
                data: { exercise_id: exercise.id, sets: 0, reps: 0, weight: 0 },
            });
            setPickerOpen(false);
        } else {
            addEx.mutate({
                workoutId,
                data: { exercise_id: exercise.id, sets: 3, reps: 10, weight: 10 },
            });
        }
    };

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo =
                direction === "left"
                    ? scrollLeft - clientWidth * 0.5
                    : scrollLeft + clientWidth * 0.5;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
        }
    };

    /* ── Body highlighter data ────────────────────────────────── */
    const highlighterData = useMemo(() => {
        if (!progress?.muscle_progress?.length) return [];
        const maxScore = Math.max(
            ...progress.muscle_progress.map((m) => m.intensity_score),
            0.01,
        );
        return progress.muscle_progress
            .map((m) => {
                const normalizedName = API_TO_COMMON[m.muscle_name] || m.muscle_name;
                const mappedName = MUSCLE_MAP[normalizedName];
                if (!mappedName) return null;
                const intensity = Math.ceil((m.intensity_score / maxScore) * 4);
                return {
                    name: normalizedName,
                    muscles: [mappedName],
                    frequency: intensity,
                    actualScore: m.intensity_score,
                };
            })
            .filter(Boolean) as { name: string; muscles: string[]; frequency: number; actualScore: number }[];
    }, [progress?.muscle_progress]);

    const handleModelClick = (s: { muscle: string }) => {
        const item = progress?.muscle_progress.find((m) => {
            const norm = API_TO_COMMON[m.muscle_name] || m.muscle_name;
            return MUSCLE_MAP[norm] === s.muscle;
        });
        if (item) setHoveredMuscle(item);
    };

    useEffect(() => {
        if (isOpen) {
            setSelectedWorkoutId(null);
            setSelectedLogId(null);
        }
    }, [isOpen]);

    /* ── Derived stat cards ───────────────────────────────────── */
    const statCards = useMemo(() => {
        const wStats = progress?.workout_stats;
        const completed = wStats?.workouts_completed || 0;
        const missed = wStats?.workouts_missed || 0;
        const skipped = wStats?.workouts_skipped || 0;
        const totalAttempted = completed + missed + skipped;
        const calcRate =
            totalAttempted > 0
                ? Math.round((completed / totalAttempted) * 100)
                : 0;
        return [
            {
                label: "เวิร์คเอาท์สำเร็จ",
                value: completed,
                icon: <ListCheck className="w-5 h-5" strokeWidth={1.75} />,
                color: "text-emerald-500",
                bg: "bg-emerald-50/50",
                sub: "ครั้ง",
            },
            {
                label: "Streak ต่อเนื่อง",
                value: wStats?.current_streak || 0,
                icon: <Zap className="w-5 h-5" strokeWidth={1.75} />,
                color: "text-orange-500",
                bg: "bg-orange-50/50",
                sub: "วัน",
            },
            {
                label: "พลาดตารางฝึก",
                value: missed,
                icon: <AlertCircle className="w-5 h-5" strokeWidth={1.75} />,
                color: "text-rose-500",
                bg: "bg-rose-50/50",
                sub: "ครั้ง",
            },
            {
                label: "อัตราความสำเร็จ",
                value: `${calcRate}%`,
                icon: <TrendingUp className="w-5 h-5" strokeWidth={1.75} />,
                color:
                    calcRate >= 80
                        ? "text-lime-500"
                        : calcRate >= 50
                            ? "text-amber-500"
                            : "text-rose-500",
                bg: "bg-indigo-50/50",
                sub: "",
            },
        ];
    }, [progress?.workout_stats]);

    /* ── Render ───────────────────────────────────────────────── */
    return (
        <AnimatePresence>
            {isOpen && trainee && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed inset-x-0 bottom-0 sm:inset-4 z-[101] mx-auto max-w-4xl overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl flex flex-col h-[95vh] sm:h-auto border border-slate-100"
                    >
                        {/* Modal Header */}
                        <div className="flex items-center gap-6 px-10 py-8 border-b border-slate-100 bg-slate-50/50">
                            <Avatar src={trainee.image_url} name={trainee.name} size="xl" />
                            <div className="flex-1 min-w-0">
                                <h2 className="text-3xl font-bold text-slate-900 leading-none mb-3">
                                    {trainee.name}
                                </h2>
                                <div className="flex items-center gap-2.5 text-base font-bold text-slate-500">
                                    <Flame className="w-5 h-5 text-lime-500" strokeWidth={2} />
                                    {trainee.current_program || "ยังไม่ได้กำหนดโปรแกรม"}
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all duration-200 shadow-sm"
                            >
                                <X className="w-6 h-6" strokeWidth={1.75} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-12">
                            {/* Quick Summary Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {statCards.map((s) => (
                                    <div
                                        key={s.label}
                                        className={cn(
                                            "p-5 rounded-3xl border border-transparent shadow-sm hover:shadow-md transition-all duration-200",
                                            s.bg,
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "flex items-center gap-2 text-xs font-bold uppercase mb-2",
                                                s.color,
                                            )}
                                        >
                                            {s.icon} {s.label}
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-bold text-slate-900 leading-none">
                                                {s.value}
                                            </span>
                                            <span className="text-xs font-semibold text-slate-400 uppercase">
                                                {s.sub}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Workout Management */}
                            <WorkoutScheduleSection
                                upcoming={upcoming as ScheduledWorkout[] | undefined}
                                isLoading={isUpcomingLoading}
                                selectedWorkoutId={selectedWorkoutId}
                                onSelectWorkout={setSelectedWorkoutId}
                                scrollRef={scrollRef}
                                onScroll={scroll}
                                onAddExercise={() => {
                                    setPickerAction({ type: "add" });
                                    setPickerOpen(true);
                                }}
                                onUpdateExercise={(workoutId, exerciseId, data) =>
                                    updateEx.mutate({ workoutId, exerciseId, data })
                                }
                                onDeleteExercise={(workoutId, exerciseId, name) =>
                                    setConfirmDelete({ workoutId, exerciseId, name })
                                }
                                onReplaceExercise={(exerciseId) => {
                                    setPickerAction({ type: "replace", exerciseId });
                                    setPickerOpen(true);
                                }}
                            />

                            {/* Progress Analysis & Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Muscle Intensity */}
                                <MuscleProgressSection
                                    progress={progress}
                                    highlighterData={highlighterData}
                                    hoveredMuscle={hoveredMuscle}
                                    onModelClick={handleModelClick}
                                    onClearHover={() => setHoveredMuscle(null)}
                                />
                                {/* Personal Records */}
                                <PersonalRecordsSection progress={progress} />
                            </div>

                            {/* Recent Workout Logs */}
                            <RecentWorkoutsSection
                                progress={progress}
                                onSelectLog={setSelectedLogId}
                            />

                            <WorkoutLogDetailModal
                                isOpen={!!selectedLogId}
                                logId={selectedLogId}
                                traineeId={trainee.id}
                                onClose={() => setSelectedLogId(null)}
                            />
                        </div>
                    </motion.div>

                    <ConfirmDeleteModal
                        info={confirmDelete}
                        isPending={deleteEx.isPending}
                        onConfirm={() =>
                            confirmDelete &&
                            deleteEx.mutate({
                                workoutId: confirmDelete.workoutId,
                                exerciseId: confirmDelete.exerciseId,
                            })
                        }
                        onCancel={() => setConfirmDelete(null)}
                    />

                    <ExercisePickerModal
                        isOpen={pickerOpen}
                        onClose={() => setPickerOpen(false)}
                        onSelect={handleExerciseSelect}
                    />

                    <ToastContainer toasts={toasts} onClose={removeToast} />
                </>
            )}
        </AnimatePresence>
    );
}

/* ════════════════════════════════════════════════════════════════
 * Sub-sections — kept in same file to avoid prop-drilling hell,
 * but clearly separated for readability.
 * ════════════════════════════════════════════════════════════════ */

interface ScheduledWorkout {
    id: number;
    scheduled_date: string;
    status: string;
    session: {
        session_name: string;
        exercises: {
            id: number;
            exercise_name: string;
            image_url?: string | null;
            sets: number;
            reps: number;
            weight: number;
        }[];
    };
}

interface WorkoutScheduleProps {
    upcoming: ScheduledWorkout[] | undefined;
    isLoading: boolean;
    selectedWorkoutId: number | null;
    onSelectWorkout: (id: number) => void;
    scrollRef: React.RefObject<HTMLDivElement | null>;
    onScroll: (dir: "left" | "right") => void;
    onAddExercise: () => void;
    onUpdateExercise: (workoutId: number, exerciseId: number, data: { sets: number; reps: number; weight: number }) => void;
    onDeleteExercise: (workoutId: number, exerciseId: number, name: string) => void;
    onReplaceExercise: (exerciseId: number) => void;
}

function WorkoutScheduleSection({
    upcoming,
    isLoading,
    selectedWorkoutId,
    onSelectWorkout,
    scrollRef,
    onScroll,
    onAddExercise,
    onUpdateExercise,
    onDeleteExercise,
    onReplaceExercise,
}: WorkoutScheduleProps) {
    const activeWorkout = upcoming?.find(
        (w) => w.id === (selectedWorkoutId ?? upcoming[0]?.id),
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
                    <Calendar className="w-5 h-5 text-lime-500" strokeWidth={1.75} />
                    ตารางฝึกล่วงหน้า
                </h3>
                <span className="text-xs font-bold text-slate-400 uppercase bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/50">
                    60 วันข้างหน้า
                </span>
            </div>

            {isLoading ? (
                <div className="py-12 flex justify-center">
                    <div className="w-10 h-10 border-4 border-lime-200 border-t-lime-500 rounded-full animate-spin" />
                </div>
            ) : upcoming?.length ? (
                <div className="space-y-6">
                    {/* Horizontal date scroller */}
                    <div className="relative group/timeline">
                        <button
                            onClick={() => onScroll("left")}
                            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 opacity-0 group-hover/timeline:opacity-100 transition-opacity"
                        >
                            <ChevronLeft className="w-5 h-5" strokeWidth={1.75} />
                        </button>
                        <button
                            onClick={() => onScroll("right")}
                            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 opacity-0 group-hover/timeline:opacity-100 transition-opacity"
                        >
                            <ChevronRight className="w-5 h-5" strokeWidth={1.75} />
                        </button>
                        <div
                            ref={scrollRef}
                            className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide snap-x snap-mandatory scroll-smooth"
                        >
                            {upcoming.map((w) => {
                                const isSel =
                                    selectedWorkoutId === w.id ||
                                    (!selectedWorkoutId && upcoming[0].id === w.id);
                                const d = new Date(w.scheduled_date);
                                const dayName = d.toLocaleDateString("th-TH", { weekday: "short" });
                                const isDone = w.status === "COMPLETED";
                                return (
                                    <button
                                        key={w.id}
                                        onClick={() => onSelectWorkout(w.id)}
                                        className={cn(
                                            "relative flex flex-col items-center min-w-[100px] snap-start p-5 rounded-3xl border transition-all duration-300",
                                            isDone && isSel
                                                ? "bg-emerald-600 border-emerald-600 shadow-xl -translate-y-1"
                                                : isDone
                                                    ? "bg-emerald-50 border-emerald-200 hover:border-emerald-300"
                                                    : isSel
                                                        ? "bg-slate-900 border-slate-900 shadow-xl -translate-y-1"
                                                        : "bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50",
                                        )}
                                    >
                                        {isDone && (
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                                                <CheckCircle2 className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                        <span
                                            className={cn(
                                                "text-xs font-bold uppercase mb-1",
                                                isDone && isSel
                                                    ? "text-emerald-200"
                                                    : isDone
                                                        ? "text-emerald-500"
                                                        : isSel
                                                            ? "text-slate-500"
                                                            : "text-slate-400",
                                            )}
                                        >
                                            {dayName}{" "}
                                            {d.toLocaleDateString("th-TH", { month: "short" })}
                                        </span>
                                        <span
                                            className={cn(
                                                "text-3xl font-bold leading-none mb-2",
                                                isDone && isSel
                                                    ? "text-white"
                                                    : isDone
                                                        ? "text-emerald-700"
                                                        : isSel
                                                            ? "text-white"
                                                            : "text-slate-900",
                                            )}
                                        >
                                            {d.getDate()}
                                        </span>
                                        <span
                                            className={cn(
                                                "text-xs font-bold truncate max-w-full px-2",
                                                isDone && isSel
                                                    ? "text-emerald-200"
                                                    : isDone
                                                        ? "text-emerald-500"
                                                        : isSel
                                                            ? "text-lime-400"
                                                            : "text-slate-500",
                                            )}
                                        >
                                            {w.session.session_name.split(" ")[0]}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Active Workout Detail */}
                    {activeWorkout && (
                        <motion.div
                            key={activeWorkout.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "rounded-3xl border bg-white shadow-sm overflow-hidden",
                                activeWorkout.status === "COMPLETED"
                                    ? "border-emerald-200"
                                    : "border-slate-100",
                            )}
                        >
                            <div
                                className={cn(
                                    "px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between border-b gap-4",
                                    activeWorkout.status === "COMPLETED"
                                        ? "bg-emerald-50/50 border-emerald-100"
                                        : "bg-slate-50/50 border-slate-100",
                                )}
                            >
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="text-lg font-bold text-slate-900">
                                            {activeWorkout.session.session_name}
                                        </p>
                                        {activeWorkout.status === "COMPLETED" && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> เสร็จสิ้น
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm font-semibold text-slate-400 uppercase flex items-center gap-2">
                                        <Calendar className="w-4 h-4" strokeWidth={1.75} />
                                        {formatDate(activeWorkout.scheduled_date)}
                                    </p>
                                </div>
                                {activeWorkout.status !== "COMPLETED" && (
                                    <button
                                        onClick={onAddExercise}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-2xl hover:bg-black transition-all duration-200 shadow-xl shadow-slate-200 w-full sm:w-auto"
                                    >
                                        <Plus className="w-5 h-5" strokeWidth={1.75} /> เพิ่มท่าออกกำลังกาย
                                    </button>
                                )}
                            </div>
                            <div className="divide-y divide-slate-50 p-4">
                                {activeWorkout.session.exercises.map((e) => (
                                    <ExerciseRow
                                        key={e.id}
                                        exercise={e}
                                        readOnly={activeWorkout.status === "COMPLETED"}
                                        onUpdate={(d) =>
                                            onUpdateExercise(activeWorkout.id, e.id, d)
                                        }
                                        onDelete={() =>
                                            onDeleteExercise(
                                                activeWorkout.id,
                                                e.id,
                                                e.exercise_name,
                                            )
                                        }
                                        onReplace={() => onReplaceExercise(e.id)}
                                    />
                                ))}
                                {!activeWorkout.session.exercises.length && (
                                    <div className="py-16 text-center text-slate-400 font-medium">
                                        ยังไม่มีท่าออกกำลังกายสำหรับวันนี้
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>
            ) : (
                <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 font-bold uppercase text-sm tracking-widest">
                    ยังไม่มีตารางฝึกที่กำหนดไว้
                </div>
            )}
        </div>
    );
}

/* ── Muscle Progress ────────────────────────────────────────── */

interface MuscleProgressProps {
    progress: TraineeProgress | undefined;
    highlighterData: { name: string; muscles: string[]; frequency: number; actualScore: number }[];
    hoveredMuscle: { muscle_name: string; intensity_score: number } | null;
    onModelClick: (s: { muscle: string }) => void;
    onClearHover: () => void;
}

function MuscleProgressSection({
    progress,
    highlighterData,
    hoveredMuscle,
    onModelClick,
    onClearHover,
}: MuscleProgressProps) {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center justify-between">
                <span>
                    <BarChart3 className="w-5 h-5 text-lime-500 inline mr-2" strokeWidth={1.75} />
                    ความก้าวหน้าของกล้ามเนื้อ
                </span>
                <Sparkles className="w-5 h-5 text-amber-500" strokeWidth={1.75} />
            </h3>

            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 lg:p-8">
                {/* Body Model */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    {(["anterior", "posterior"] as const).map((type) => (
                        <div key={type} className="flex flex-col items-center">
                            <span className="text-xs font-bold text-slate-300 uppercase mb-4">
                                {type === "anterior" ? "Anterior" : "Posterior"}
                            </span>
                            <div className="w-full max-w-[140px]">
                                <ModelAny
                                    data={highlighterData}
                                    type={type}
                                    highlightedColors={[...INTENSITY_COLORS]}
                                    bodyColor="#f1f5f9"
                                    onClick={onModelClick}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Legend & Selected Info */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase mr-1">
                            Intensity
                        </span>
                        {INTENSITY_COLORS.map((color, idx) => (
                            <div
                                key={idx}
                                className="w-2.5 h-2.5 rounded-full shadow-sm"
                                style={{ background: color }}
                            />
                        ))}
                    </div>
                    {hoveredMuscle ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between gap-4 shadow-xl"
                        >
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-400 uppercase leading-none mb-1">
                                    Muscle Group
                                </p>
                                <p className="text-sm font-bold truncate">
                                    {hoveredMuscle.muscle_name}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-xs font-bold text-lime-400 uppercase leading-none mb-1">
                                        Score
                                    </p>
                                    <p className="text-sm font-bold">
                                        {(hoveredMuscle.intensity_score * 100).toFixed(0)}%
                                    </p>
                                </div>
                                <button
                                    onClick={onClearHover}
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X size={14} strokeWidth={1.75} />
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <p className="text-xs font-bold text-slate-400 text-center uppercase">
                            แตะที่กล้ามเนื้อเพื่อดูรายละเอียด
                        </p>
                    )}
                </div>
            </div>

            {/* Muscle bars */}
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 grid gap-4 max-h-[300px] overflow-y-auto scrollbar-hide">
                {(progress?.muscle_progress || []).map((m) => (
                    <div
                        key={m.muscle_name}
                        className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100/50 hover:border-lime-200 transition-colors duration-200"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-slate-800">
                                {m.muscle_name}
                            </span>
                            <span className="text-xs font-bold text-lime-600 bg-lime-50 px-2 py-0.5 rounded-lg">
                                {(m.intensity_score * 100).toFixed(0)}%
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${m.intensity_score * 100}%` }}
                                    transition={{ duration: 1 }}
                                    className="h-full bg-slate-900 rounded-full"
                                />
                            </div>
                            <span className="text-xs font-bold text-slate-400 whitespace-nowrap">
                                {m.average_weight.toFixed(1)} kg เฉลี่ย
                            </span>
                        </div>
                    </div>
                ))}
                {!progress?.muscle_progress?.length && (
                    <div className="py-12 text-center text-slate-300 text-sm">
                        ยังไม่มีข้อมูลกล้ามเนื้อ
                    </div>
                )}
            </div>
        </div>
    );
}

/* ── Personal Records ───────────────────────────────────────── */

function PersonalRecordsSection({ progress }: { progress: TraineeProgress | undefined }) {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" strokeWidth={1.75} /> สถิติส่วนตัว
                (Personal Records)
            </h3>
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-4 flex flex-col gap-3 h-full max-h-[400px] overflow-y-auto scrollbar-hide">
                {(progress?.exercise_prs || []).map((pr) => (
                    <div
                        key={pr.exercise_name}
                        className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100/50"
                    >
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                            <Weight className="w-5 h-5" strokeWidth={1.75} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">
                                {pr.exercise_name}
                            </p>
                            <p className="text-xs font-medium text-slate-400">
                                ทำได้เมื่อ {formatDate(pr.achieved_at)}
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="text-lg font-bold text-slate-900">
                                {pr.max_weight}
                                <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                                    kg
                                </span>
                            </span>
                        </div>
                    </div>
                ))}
                {!progress?.exercise_prs?.length && (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-10">
                        <BarChart3 className="w-8 h-8 mb-2 opacity-20" strokeWidth={1.75} />
                        <p className="text-xs font-bold uppercase">
                            ยังไม่มีสถิติส่วนตัว
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ── Recent Workouts ────────────────────────────────────────── */

function RecentWorkoutsSection({
    progress,
    onSelectLog,
}: {
    progress: TraineeProgress | undefined;
    onSelectLog: (id: number) => void;
}) {
    return (
        <div className="space-y-6 pb-12">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-500" strokeWidth={1.75} />
                ประวัติเวิร์คเอาท์
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {(progress?.recent_workouts || []).map((rw) => (
                    <motion.button
                        key={rw.workout_log_id}
                        whileHover={{
                            y: -4,
                            boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                        }}
                        onClick={() => onSelectLog(rw.workout_log_id)}
                        className="text-left p-6 rounded-3xl bg-indigo-50/20 border border-indigo-100/30 flex items-center justify-between group hover:bg-white transition-all duration-300 relative overflow-hidden shadow-sm w-full"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl -mr-10 -mt-10" />
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-white text-indigo-500 flex items-center justify-center shadow-sm border border-indigo-50/50 group-hover:scale-110 transition-transform duration-500">
                                <Calendar className="w-6 h-6" strokeWidth={1.75} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-base font-bold text-slate-900 truncate leading-tight mb-1">
                                    {rw.program_session_name}
                                </p>
                                <div className="flex items-center gap-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase">
                                        {formatDate(rw.workout_date)}
                                    </p>
                                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                                    <p className="text-xs font-bold text-indigo-500 uppercase">
                                        {rw.exercise_count} ท่า
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right relative z-10 flex flex-col items-end">
                            <div className="text-sm font-bold text-slate-900 flex items-center justify-end gap-1 mb-0.5">
                                {rw.duration}{" "}
                                <span className="text-xs text-slate-400 font-bold uppercase">
                                    นาที
                                </span>
                            </div>
                            <div className="text-sm font-bold text-indigo-600 flex items-center justify-end gap-1">
                                {rw.total_volume.toLocaleString()}{" "}
                                <span className="text-xs text-indigo-300 font-bold uppercase">
                                    VOL.
                                </span>
                            </div>
                            <div className="mt-2 text-xs font-bold text-lime-500 uppercase">
                                ดูรายละเอียด →
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
