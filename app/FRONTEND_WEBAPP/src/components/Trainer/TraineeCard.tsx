import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import Avatar from "./Avatar";
import { cn } from "../../utils/cn";
import { statusLabel } from "../../utils/trainer.utils";
import type { TraineeCardProps } from "../../types/trainerDashboard.types";

export default function TraineeCard({ trainee: t, onClick }: TraineeCardProps) {
    return (
        <motion.button
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={cn(
                "w-full text-left p-5 rounded-2xl border bg-white shadow-sm hover:shadow-xl transition-all duration-200 group flex flex-col gap-4",
                t.status === "AT_RISK"
                    ? "border-amber-100"
                    : t.status === "FAILING"
                        ? "border-rose-100"
                        : "border-slate-100 hover:border-lime-200",
            )}
        >
            {/* Top row */}
            <div className="flex items-center gap-4">
                <Avatar src={t.image_url} name={t.name} size="lg" />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-base font-bold text-slate-900 truncate">
                            {t.name}
                        </p>
                        <span
                            className={cn(
                                "text-[9px] font-bold px-2 py-1 rounded-lg uppercase shrink-0",
                                t.status === "AT_RISK"
                                    ? "bg-amber-50 text-amber-600"
                                    : t.status === "FAILING"
                                        ? "bg-rose-50 text-rose-600"
                                        : "bg-emerald-50 text-emerald-600",
                            )}
                        >
                            {statusLabel(t.status)}
                        </span>
                    </div>
                    <p className="text-xs font-medium text-slate-400 truncate flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-lime-500" strokeWidth={2} />
                        {t.current_program || "ยังไม่ได้กำหนดโปรแกรม"}
                    </p>
                </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
                <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-400 uppercase">
                        ฝึกสัปดาห์นี้
                    </span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">
                        {t.workouts_this_week}
                        <span className="text-xs text-slate-400 ml-0.5">/ 5</span>
                    </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{
                            width: `${Math.min(100, (t.workouts_this_week / 5) * 100)}%`,
                        }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-slate-800 group-hover:bg-slate-900 transition-colors duration-300 rounded-full"
                    />
                </div>
            </div>
        </motion.button>
    );
}
