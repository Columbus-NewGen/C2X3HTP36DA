import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X, Activity } from "lucide-react";
import { AuthenticatedImage } from "../ui";
import { resolveImageUrl } from "../../utils/floorplan.utils";
import { formatDate } from "../../utils/trainer.utils";
import { workoutsApi } from "../../services/workoutsApi";
import { exerciseApi } from "../../services/ExerciseAPI";
import type { WorkoutLogDetailModalProps } from "../../types/trainerDashboard.types";
import type { WorkoutLogExercise } from "../../types/workout.types";

export default function WorkoutLogDetailModal({
    isOpen,
    logId,
    traineeId,
    onClose,
}: WorkoutLogDetailModalProps) {
    const { data: log, isLoading } = useQuery({
        queryKey: ["workout-log-detail", logId, traineeId],
        queryFn: () =>
            logId ? workoutsApi.getLogById(traineeId, logId) : Promise.reject(),
        enabled: isOpen && !!logId,
    });

    const { data: allExercisesData } = useQuery({
        queryKey: ["all-exercises"],
        queryFn: () => exerciseApi.getAll(),
        enabled: isOpen,
    });

    const getExImg = (exerciseId: number, currentImg?: string | null) => {
        if (currentImg) return resolveImageUrl(currentImg);
        const found = allExercisesData?.exercises?.find(
            (e: { id: number; image_url?: string | null }) => e.id === exerciseId,
        );
        return resolveImageUrl(found?.image_url);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col max-h-[85vh]"
                >
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">
                                {log?.session?.session_name || "รายละเอียดเวิร์คเอาท์"}
                            </h3>
                            <p className="text-sm font-medium text-slate-400 uppercase">
                                {formatDate(log?.workout_date)}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-400" strokeWidth={1.75} />
                        </button>
                    </div>

                    {/* Exercises */}
                    <div className="flex-1 overflow-y-auto p-8">
                        {isLoading ? (
                            <div className="py-20 flex justify-center">
                                <Loader2 className="w-10 h-10 animate-spin text-lime-500" />
                            </div>
                        ) : log?.exercises?.length ? (
                            <div className="space-y-4">
                                {log.exercises.map(
                                    (ex: WorkoutLogExercise, idx: number) => {
                                        const img = getExImg(ex.exercise_id, ex.image_url);
                                        return (
                                            <div
                                                key={ex.id ?? idx}
                                                className="p-5 rounded-2xl bg-white border border-slate-100 flex items-center gap-4 transition-all duration-200 hover:border-lime-200 hover:shadow-sm"
                                            >
                                                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden">
                                                    {img ? (
                                                        <AuthenticatedImage
                                                            src={img}
                                                            alt={ex.exercise_name || "exercise"}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Activity className="w-6 h-6 text-slate-200" strokeWidth={1.75} />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-base font-bold text-slate-800 truncate mb-1">
                                                        {ex.exercise_name || "ท่าฝึก"}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-slate-400 uppercase">
                                                            {ex.sets_completed} เซต
                                                        </span>
                                                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                                                        <span className="text-xs font-bold text-lime-600 uppercase">
                                                            {ex.reps_completed} ครั้ง
                                                        </span>
                                                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                                                        <span className="text-xs font-bold text-indigo-500 uppercase">
                                                            {ex.weight_used || 0} KG
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-slate-300 uppercase mb-0.5">
                                                        EST. VOL.
                                                    </p>
                                                    <p className="text-sm font-bold text-slate-900">
                                                        {(
                                                            ex.sets_completed *
                                                            ex.reps_completed *
                                                            (ex.weight_used || 0)
                                                        ).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    },
                                )}
                            </div>
                        ) : (
                            <div className="py-20 text-center text-slate-400 font-medium">
                                ไม่พบรายการท่าในเวิร์คเอาท์นี้
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
