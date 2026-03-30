import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Trash2 } from "lucide-react";
import type { ConfirmDeleteModalProps } from "../../types/trainerDashboard.types";

export default function ConfirmDeleteModal({
    info,
    isPending,
    onConfirm,
    onCancel,
}: ConfirmDeleteModalProps) {
    return (
        <AnimatePresence>
            {info && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-8 shadow-2xl text-center"
                    >
                        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Trash2 className="w-8 h-8" strokeWidth={1.75} />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mb-2">
                            ยืนยันการลบ
                        </h4>
                        <p className="text-sm font-medium text-slate-500 mb-8 px-4">
                            ต้องการลบท่า{" "}
                            <span className="text-slate-900 font-bold">
                                "{info.name}"
                            </span>{" "}
                            ออกจากตารางฝึกนี้ใช่หรือไม่?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={onCancel}
                                className="flex-1 py-3 px-4 bg-slate-100 text-slate-600 text-sm font-bold rounded-2xl hover:bg-slate-200 transition-all duration-200"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isPending}
                                className="flex-1 py-3 px-4 bg-rose-500 text-white text-sm font-bold rounded-2xl hover:bg-rose-600 transition-all duration-200 shadow-lg shadow-rose-200 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    "ยืนยันลบ"
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
