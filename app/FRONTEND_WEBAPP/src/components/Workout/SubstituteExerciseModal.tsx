import { memo, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Info, Loader2, ChevronRight, RefreshCw, X, Search, Weight } from "lucide-react";
import { exerciseApi } from "../../services/ExerciseAPI";
import type { Exercise } from "../../types/exercise.types";
import { useFloorplanData } from "../../hooks";
import { resolveImageUrl } from "../../utils/floorplan.utils";

interface SubstituteExerciseModalProps {
    isOpen: boolean;
    onClose: () => void;
    originalExerciseId: number;
    originalExerciseName: string;
    onSelect: (exercise: Exercise) => void;
}

export const SubstituteExerciseModal = memo(({
    isOpen,
    onClose,
    originalExerciseId,
    originalExerciseName,
    onSelect
}: SubstituteExerciseModalProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const { floorplan } = useFloorplanData();

    // Helper to check if a machine exists for an exercise using fuzzy name matching
    const isAvailableOnMap = (exerciseName: string) => {
        if (!floorplan || !floorplan.equipment_instances) return false;
        const targetName = exerciseName.toLowerCase().trim();
        const targetWords = targetName.split(/\s+/).filter(w => w.length > 2);

        return floorplan.equipment_instances.some(m => {
            const mLabel = (m.label || "").toLowerCase();
            const mEqName = (m.equipment?.equipment_name || "").toLowerCase();

            // Check exact containment first
            if (mLabel.includes(targetName) || mEqName.includes(targetName) || targetName.includes(mLabel)) return true;

            // Check word-based fuzzy match
            if (targetWords.length > 0) {
                return targetWords.some(word => mLabel.includes(word) || mEqName.includes(word));
            }
            return false;
        });
    };

    // 1. Fetch Substitutes (Recommendations)
    const { data: substitutesData, isLoading: isLoadingSubs } = useQuery({
        queryKey: ["exercise-substitutes", originalExerciseId],
        queryFn: () => exerciseApi.getSubstitutes(originalExerciseId, { limit: 10 }),
        enabled: isOpen && !!originalExerciseId,
    });

    // 2. Fetch All (Search fallback)
    const { data: allExercisesData, isLoading: isLoadingAll } = useQuery({
        queryKey: ["all-exercises"],
        queryFn: () => exerciseApi.getAll(),
        enabled: isOpen && searchQuery.length > 2,
    });

    const recommendations = useMemo(() => substitutesData?.substitutes ?? [], [substitutesData]);

    const searchResults = useMemo(() => {
        if (searchQuery.length < 2) return [];
        return (allExercisesData?.exercises ?? []).filter(ex =>
            ex.exercise_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            ex.id !== originalExerciseId
        );
    }, [allExercisesData, searchQuery, originalExerciseId]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold text-lime-600 uppercase mb-1">
                                    FIND ALTERNATIVE
                                </p>
                                <h2 className="text-xl font-bold text-gray-900 leading-tight">
                                    เลือกท่าทดแทน
                                </h2>
                                <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5 mt-1">
                                    ใช้แทน: <span className="text-gray-900 font-bold underline decoration-lime-500/30 underline-offset-2">{originalExerciseName}</span>
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="relative group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-lime-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="ค้นหาท่าอื่นๆ (พิมพ์มากกว่า 2 ตัวอักษร)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-12 pl-10 pr-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:border-lime-200 focus:ring-4 focus:ring-lime-500/5 transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {searchQuery.length < 2 ? (
                            <>
                                {/* Recommendations */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-1.5">
                                            <RefreshCw size={10} className="text-lime-500" />
                                            ท่าที่แนะนำ (Smarter Matches)
                                        </h3>
                                    </div>

                                    {isLoadingSubs ? (
                                        <div className="py-12 flex justify-center">
                                            <Loader2 size={24} className="animate-spin text-gray-200" />
                                        </div>
                                    ) : recommendations.length ? (
                                        <div className="grid grid-cols-1 gap-2">
                                            {recommendations.map((sub) => {
                                                const hasMap = isAvailableOnMap(sub.exercise.exercise_name);
                                                return (
                                                    <button
                                                        key={sub.exercise.id}
                                                        onClick={() => onSelect(sub.exercise)}
                                                        className="group flex items-center gap-3 p-3 rounded-2xl bg-white border border-gray-100 hover:border-lime-200 hover:bg-lime-50/40 transition-all text-left active:scale-[0.98]"
                                                    >
                                                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-white transition-colors overflow-hidden border border-gray-100">
                                                            {sub.exercise.image_url ? (
                                                                <img
                                                                    src={resolveImageUrl(sub.exercise.image_url) || undefined}
                                                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                                    alt=""
                                                                />
                                                            ) : (
                                                                <Weight size={20} className="text-gray-300 group-hover:text-lime-500 transition-colors" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1.5">
                                                                <p className="text-sm font-bold text-gray-900 truncate">
                                                                    {sub.exercise.exercise_name}
                                                                </p>
                                                                {hasMap && (
                                                                    <MapPin size={10} className="text-lime-500 shrink-0" fill="currentColor" />
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-lime-500 rounded-full"
                                                                        style={{ width: `${sub.similarity_score}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-xs font-semibold text-lime-600">
                                                                    {sub.similarity_score}% match
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                                            {hasMap ? (
                                                                <span className="text-[9px] font-bold text-lime-600 bg-lime-50 px-1.5 py-0.5 rounded uppercase">Available</span>
                                                            ) : (
                                                                <span className="text-[9px] font-bold text-gray-300 uppercase italic">Off-map</span>
                                                            )}
                                                            <ChevronRight size={14} className="text-gray-200 group-hover:text-lime-500 transition-colors" />
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-[2rem]">
                                            <Info size={32} className="mx-auto text-gray-200 mb-2" />
                                            <p className="text-xs text-gray-400 font-medium">ไม่มีท่าทดแทนที่ใกล้เคียงอัตโนมัติ</p>
                                            <p className="text-xs text-gray-300 mt-1 uppercase font-bold">ลองใช้ช่องค้นหาด้านบนดูนะ</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            /* Search Results */
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase  px-2">
                                    ผลลัพธ์การค้นหาสำหรับ "{searchQuery}"
                                </h3>

                                {isLoadingAll ? (
                                    <div className="py-12 flex justify-center">
                                        <Loader2 size={24} className="animate-spin text-gray-200" />
                                    </div>
                                ) : searchResults.length ? (
                                    <div className="grid grid-cols-1 gap-2">
                                        {searchResults.map((ex) => (
                                            <button
                                                key={ex.id}
                                                onClick={() => onSelect(ex)}
                                                className="group flex items-center gap-3 p-3 rounded-2xl bg-white border border-gray-100 hover:border-lime-200 hover:bg-lime-50/30 transition-all text-left active:scale-[0.98]"
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-white transition-colors overflow-hidden border border-gray-100">
                                                    {ex.image_url ? (
                                                        <img
                                                            src={resolveImageUrl(ex.image_url) || undefined}
                                                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                            alt=""
                                                        />
                                                    ) : (
                                                        <Weight size={20} className="text-gray-300" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 truncate">
                                                        {ex.exercise_name}
                                                    </p>
                                                    <p className="text-xs font-bold text-gray-400 mt-0.5 uppercase ">
                                                        {ex.movement_pattern} · {ex.difficulty_level}
                                                    </p>
                                                </div>
                                                <ChevronRight size={16} className="text-gray-300 group-hover:text-lime-500 transition-colors" />
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center">
                                        <p className="text-sm font-bold text-gray-400">ไม่พบท่าที่ค้นหา</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-gray-50 bg-gray-50/30">
                        <div className="flex items-start gap-2 text-xs text-gray-400 font-medium italic p-2 leading-relaxed">
                            <Info size={12} className="shrink-0 mt-0.5" />
                            <p>การเปลี่ยนท่าทดแทนจะใช้สำหรับ **Workout นี้เป็นครั้งคราวเท่านั้น** ไม่ส่งผลต่อตารางหลักในระยะยาว เพื่อความสะดวกเมื่อเครื่องเล่นไม่ว่าง</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
});

SubstituteExerciseModal.displayName = "SubstituteExerciseModal";
