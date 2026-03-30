import { memo, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Info, Loader2, Weight, X, Activity } from "lucide-react";
import { exerciseApi } from "../../services/ExerciseAPI";
import { resolveImageUrl } from "../../utils/floorplan.utils";

interface MachineSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    exerciseId: number;
    exerciseName: string;
    floorplan: any; // The floorplan context data
    onSelect: (machineId: number) => void;
}

export const MachineSelectionModal = memo(({
    isOpen,
    onClose,
    exerciseId,
    exerciseName,
    floorplan,
    onSelect
}: MachineSelectionModalProps) => {
    // 1. Fetch equipment for this exercise to know what machine types we serve
    const { data: equipmentData, isLoading } = useQuery({
        queryKey: ["exercise-equipment", exerciseId],
        queryFn: () => exerciseApi.getEquipment(exerciseId),
        enabled: isOpen && !!exerciseId,
    });

    // 2. Map exercise equipment to actual floorplan machine instances
    const availableMachines = useMemo(() => {
        if (!floorplan || !floorplan.equipment_instances) return [];

        const equipmentIds = (equipmentData?.equipment || []).map(eq => eq.id);

        // Strategy A: Match by equipment_id (Precise)
        const matchesByEqId = floorplan.equipment_instances.filter((m: any) => {
            const mEqId = m.equipment_id || m.equipment?.id;
            return mEqId && equipmentIds.includes(mEqId);
        });

        if (matchesByEqId.length > 0) return matchesByEqId;

        // Strategy B: Fuzzy name match (Fallback)
        const targetName = exerciseName.toLowerCase().trim();
        const targetWords = targetName.split(/\s+/).filter(w => w.length > 2);

        return floorplan.equipment_instances.filter((m: any) => {
            const mLabel = (m.label || "").toLowerCase();
            const mEqName = (m.equipment?.equipment_name || "").toLowerCase();

            // Match if exact name is inside
            if (mLabel.includes(targetName) || mEqName.includes(targetName) || targetName.includes(mLabel)) return true;

            // Match if any significant word matches
            if (targetWords.length > 0) {
                return targetWords.some(word => mLabel.includes(word) || mEqName.includes(word));
            }
            return false;
        });
    }, [floorplan, equipmentData, exerciseName]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4">
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
                    className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex items-start justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-lime-600 uppercase tracking-widest mb-1">
                                Select Machine
                            </p>
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">
                                เลือกเครื่องเล่น
                            </h2>
                            <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5 mt-1">
                                สำหรับ: <span className="text-gray-900 font-bold">{exerciseName}</span>
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {isLoading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-3">
                                <Loader2 size={32} className="animate-spin text-lime-500" />
                                <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">หาเครื่องเล่นที่ใช้...</p>
                            </div>
                        ) : availableMachines.length > 0 ? (
                            <div className="grid grid-cols-1 gap-2">
                                {availableMachines.map((m: any) => (
                                    <button
                                        key={m.id}
                                        onClick={() => onSelect(m.id)}
                                        className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-lime-200 hover:bg-lime-50/30 transition-all text-left active:scale-[0.98] shadow-sm"
                                    >
                                        {/* Machine Thumbnail */}
                                        <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner group-hover:border-lime-200 transition-colors">
                                            {m.equipment?.image_url ? (
                                                <img
                                                    src={resolveImageUrl(m.equipment.image_url) || undefined}
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                    alt=""
                                                />
                                            ) : (
                                                <Activity size={24} className="text-gray-200 group-hover:text-lime-500 transition-colors" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900 leading-tight mb-1">
                                                {m.label || m.equipment?.equipment_name || "เครื่องเล่นไม่ระบุชื่อ"}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-1.5 py-0.5 rounded">
                                                    ID: #{m.id}
                                                </span>
                                                {m.status === "ACTIVE" ? (
                                                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                ) : (
                                                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
                                                )}
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">
                                                    {m.status || "UNKNOWN"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-300 group-hover:bg-lime-500 group-hover:text-white transition-all">
                                            <MapPin size={18} fill="currentColor" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="py-16 text-center border-2 border-dashed border-gray-100 rounded-[2.5rem] bg-gray-50/30">
                                <div className="w-16 h-16 bg-white rounded-2xl border border-gray-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
                                    <Weight size={32} className="text-gray-200" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-700">ไม่พบเครื่องเล่นในแผนที่</h3>
                                <p className="text-xs text-gray-400 px-8 mt-2 leading-relaxed">
                                    ท่านี้อาจปรับเปลี่ยนไปใช้เครื่องอื่นที่ใกล้เคียงแทน หรือท่านี้ไม่ได้ระบุเครื่องเล่นไว้ในระบบแผนที่
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="p-4 border-t border-gray-50 bg-gray-50/30">
                        <div className="flex items-start gap-2 text-[10px] text-gray-400 font-medium p-2 leading-relaxed">
                            <Info size={12} className="shrink-0 mt-0.5 text-lime-500" />
                            <p>เลือกเครื่องที่คุณต้องการเพื่อดูตำแหน่งที่ตั้งแน่ชัดบนแผนที่ยิม</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
});

MachineSelectionModal.displayName = "MachineSelectionModal";
