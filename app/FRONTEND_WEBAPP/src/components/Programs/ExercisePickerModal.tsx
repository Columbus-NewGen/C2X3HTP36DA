import { useState, useMemo } from "react";
import { Search, X, ArrowUpDown, ChevronRight, Check, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Exercise, MovementPattern } from "../../types/exercise.types";
import { resolveImageUrl } from "../../utils/floorplan.utils";
import { cn } from "../../utils/cn";

interface ExercisePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    exercises: Exercise[];
    selectedId?: number;
    onSelect: (exercise: Exercise) => void;
}

export function ExercisePickerModal({
    isOpen,
    onClose,
    exercises,
    selectedId,
    onSelect,
}: ExercisePickerModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [patternFilter, setPatternFilter] = useState<MovementPattern | "ALL">(
        "ALL"
    );
    const [sortOrder, setSortOrder] = useState<"name" | "difficulty">("name");

    const filteredExercises = useMemo(() => {
        let result = exercises.filter((ex) => {
            const matchesSearch = ex.exercise_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
            const matchesPattern =
                patternFilter === "ALL" || ex.movement_pattern === patternFilter;
            return matchesSearch && matchesPattern;
        });

        result.sort((a, b) => {
            if (sortOrder === "name") {
                return a.exercise_name.localeCompare(b.exercise_name);
            } else {
                const diffMap = { beginner: 1, intermediate: 2, advanced: 3 };
                return (
                    (diffMap[a.difficulty_level] || 0) -
                    (diffMap[b.difficulty_level] || 0)
                );
            }
        });

        return result;
    }, [exercises, searchQuery, patternFilter, sortOrder]);

    const patterns = useMemo(() => {
        const p = new Set<string>();
        exercises.forEach((ex) => p.add(ex.movement_pattern));
        return Array.from(p).sort();
    }, [exercises]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">เลือกท่าออกกำลังกาย</h2>
                            <p className="text-xs text-gray-400 font-medium mt-1 uppercase">
                                Select an exercise for your program
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Search and Filters */}
                    <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex flex-col gap-3">
                        <div className="flex gap-2">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-lime-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="ค้นหาชื่อท่า..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-11 pl-10 pr-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:border-lime-500 focus:ring-4 focus:ring-lime-500/5 transition-all outline-none"
                                />
                            </div>
                            <button
                                onClick={() =>
                                    setSortOrder(sortOrder === "name" ? "difficulty" : "name")
                                }
                                className="h-11 px-4 bg-white border border-gray-200 rounded-2xl flex items-center gap-2 hover:border-gray-300 transition-all text-xs font-bold text-gray-600"
                            >
                                <ArrowUpDown size={14} />
                                {sortOrder === "name" ? "A-Z" : "Difficulty"}
                            </button>
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            <button
                                onClick={() => setPatternFilter("ALL")}
                                className={cn(
                                    "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                                    patternFilter === "ALL"
                                        ? "bg-gray-900 text-white"
                                        : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"
                                )}
                            >
                                ทั้งหมด
                            </button>
                            {patterns.map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPatternFilter(p)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all uppercase",
                                        patternFilter === p
                                            ? "bg-lime-500 text-white"
                                            : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"
                                    )}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0 custom-scrollbar">
                        {filteredExercises.length > 0 ? (
                            filteredExercises.map((ex) => {
                                const isSelected = selectedId === ex.id;
                                const imageUrl = resolveImageUrl(ex.image_url);
                                return (
                                    <button
                                        key={ex.id}
                                        onClick={() => {
                                            onSelect(ex);
                                            onClose();
                                        }}
                                        className={cn(
                                            "w-full group flex items-center gap-4 p-3 rounded-2xl border transition-all text-left",
                                            isSelected
                                                ? "bg-lime-50 border-lime-200 ring-2 ring-lime-500/10"
                                                : "bg-white border-gray-100 hover:border-lime-200 hover:bg-gray-50/50"
                                        )}
                                    >
                                        <div className="relative w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={ex.exercise_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-200">
                                                    <Activity size={24} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-bold text-gray-900 truncate">
                                                    {ex.exercise_name}
                                                </p>
                                                {isSelected && (
                                                    <div className="h-4 w-4 rounded-full bg-lime-500 flex items-center justify-center">
                                                        <Check size={10} className="text-white" strokeWidth={3} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs font-bold text-lime-600 bg-lime-50 px-1.5 py-0.5 rounded uppercase leading-none">
                                                    {ex.movement_pattern}
                                                </span>
                                                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded uppercase leading-none">
                                                    {ex.difficulty_level}
                                                </span>
                                            </div>
                                        </div>

                                        <ChevronRight
                                            size={16}
                                            className={cn(
                                                "text-gray-200 group-hover:text-lime-500 transition-colors",
                                                isSelected && "text-lime-500"
                                            )}
                                        />
                                    </button>
                                );
                            })
                        ) : (
                            <div className="py-20 text-center">
                                <Search size={40} className="mx-auto text-gray-100 mb-3" />
                                <p className="text-sm font-bold text-gray-400">ไม่พบท่าที่ต้องการ</p>
                                <p className="text-xs text-gray-300 mt-1 uppercase">Try adjusting your filters</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-400 font-medium italic">
                            เลือกท่าที่ต้องการจากรายการด้านบน เพื่อเพิ่มลงในโปรแกรมของคุณ
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
