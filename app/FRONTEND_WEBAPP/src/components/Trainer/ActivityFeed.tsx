import { motion } from "framer-motion";
import { Activity, CalendarX2, Clock, Inbox } from "lucide-react";
import { formatDateTime } from "../../utils/trainer.utils";
import type { ActivityFeedProps } from "../../types/trainerDashboard.types";

/** Pick icon & color based on activity description */
function activityMeta(description: string) {
    const lower = description.toLowerCase();
    if (lower.includes("logged") || lower.includes("บันทึก")) {
        return {
            icon: <Activity className="w-4 h-4" strokeWidth={2} />,
            bg: "bg-slate-100 text-slate-600 group-hover:bg-slate-800 group-hover:text-white",
        };
    }
    // missed / skipped / default
    return {
        icon: <CalendarX2 className="w-4 h-4" strokeWidth={2} />,
        bg: "bg-slate-50 text-slate-400 group-hover:bg-slate-700 group-hover:text-white",
    };
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm min-h-[400px] flex flex-col overflow-hidden">
            <div className="space-y-1 overflow-y-auto pr-1 scrollbar-hide max-h-[600px] flex-1 p-4">
                {activities.map((act, i) => {
                    const meta = activityMeta(act.description);
                    return (
                        <motion.div
                            key={`${act.trainee_id}-${act.timestamp}-${i}`}
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="flex items-start gap-3 p-3 rounded-xl group transition-all duration-200 hover:bg-slate-50 border border-transparent hover:border-slate-100"
                        >
                            <div
                                className={`p-2 rounded-lg mt-0.5 transition-all duration-200 shrink-0 ${meta.bg}`}
                            >
                                {meta.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-900 leading-snug">
                                    <span className="font-bold">{act.trainee_name}</span>{" "}
                                    <span className="text-slate-500 font-medium">
                                        {act.description}
                                    </span>
                                </p>
                                <p className="text-xs font-bold text-slate-400 mt-1.5 flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" strokeWidth={2} />
                                    {formatDateTime(act.timestamp)}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
                {!activities.length && (
                    <div className="flex-1 flex flex-col items-center justify-center py-16 text-slate-300">
                        <Inbox className="w-8 h-8 mb-3 opacity-30" strokeWidth={1.5} />
                        <p className="text-xs font-bold uppercase">ยังไม่มีกิจกรรม</p>
                    </div>
                )}
            </div>
        </div>
    );
}
