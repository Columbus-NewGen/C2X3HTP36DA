import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X, Search, Plus } from "lucide-react";
import { AuthenticatedImage } from "../ui";
import { resolveImageUrl } from "../../utils/floorplan.utils";
import { exerciseApi } from "../../services/ExerciseAPI";
import type { ExercisePickerModalProps } from "../../types/trainerDashboard.types";

export default function ExercisePickerModal({
    isOpen,
    onClose,
    onSelect,
}: ExercisePickerModalProps) {
    const [search, setSearch] = useState("");

    const { data: exercises, isLoading } = useQuery({
        queryKey: ["all-exercises"],
        queryFn: () => exerciseApi.getAll(),
        enabled: isOpen,
    });

    const filtered = useMemo(
        () =>
            (exercises?.exercises || []).filter((e: { exercise_name: string }) =>
                e.exercise_name.toLowerCase().includes(search.toLowerCase()),
            ),
        [exercises, search],
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
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
                        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col max-h-[80vh]"
                    >
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">
                                เลือกท่าออกกำลังกาย
                            </h3>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" strokeWidth={1.75} />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="p-4 bg-slate-50 border-b border-slate-100">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.75} />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="ค้นหาท่าออกกำลังกาย..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-lime-500 outline-none transition-all placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {isLoading ? (
                                <div className="py-12 flex justify-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-lime-500" />
                                </div>
                            ) : filtered.length > 0 ? (
                                filtered.map((e: { id: number; exercise_name: string; image_url?: string | null; primary_muscle?: string; primary_muscles?: string[] }) => {
                                    const img = resolveImageUrl(e.image_url);
                                    return (
                                        <button
                                            key={e.id}
                                            onClick={() => onSelect(e)}
                                            className="w-full text-left p-3 rounded-2xl hover:bg-lime-50 transition-all duration-200 group flex items-center gap-3"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/50">
                                                {img && (
                                                    <AuthenticatedImage
                                                        src={img}
                                                        alt={e.exercise_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-800 group-hover:text-lime-700 truncate transition-colors">
                                                    {e.exercise_name}
                                                </p>
                                                <p className="text-xs text-slate-400 font-medium">
                                                    {e.primary_muscle || e.primary_muscles?.[0] || "General"}
                                                </p>
                                            </div>
                                            <Plus className="w-5 h-5 text-slate-300 group-hover:text-lime-500 transition-colors" strokeWidth={1.75} />
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="py-12 text-center text-sm text-slate-400 font-medium">
                                    ไม่พบท่าออกกำลังกายที่ค้นหา
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
