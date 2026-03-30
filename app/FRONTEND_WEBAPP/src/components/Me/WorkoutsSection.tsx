import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ListChecks, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import type {
  ScheduledWorkout,
  WorkoutLog,
} from "../../types/workout.types";

function formatDateFull(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "-"
    : d.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
}

function relativeDay(
  iso?: string
): { label: string; isToday: boolean } | null {
  if (!iso) return null;
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  const todayMid = new Date(today);
  todayMid.setHours(0, 0, 0, 0);
  const targetMid = new Date(target);
  targetMid.setHours(0, 0, 0, 0);
  const diff = Math.round(
    (targetMid.getTime() - todayMid.getTime()) / 86400000
  );
  if (diff === 0) return { label: "วันนี้", isToday: true };
  if (diff === 1) return { label: "พรุ่งนี้", isToday: false };
  if (diff === -1) return { label: "เมื่อวาน", isToday: false };
  if (diff > 1 && diff <= 7) return { label: `อีก ${diff} วัน`, isToday: false };
  return null;
}

const scrollbarY =
  "overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-stone-200 [&::-webkit-scrollbar-thumb]:rounded-full";

function EmptyState({
  icon,
  title,
  desc,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-stone-50/60 py-16 px-6 text-center border border-stone-100">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100 text-stone-400 mb-4">
        {icon}
      </div>
      <p className="text-sm font-medium text-stone-700">{title}</p>
      <p className="mt-1 text-xs text-stone-500 max-w-[200px] leading-relaxed">
        {desc}
      </p>
    </div>
  );
}

function SectionTitle({
  icon,
  title,
  count,
  onAction,
}: {
  icon: ReactNode;
  title: string;
  count?: number;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-semibold text-stone-900  flex items-center gap-2">
        {icon}
        {title}
      </h2>
      <div className="flex items-center gap-3">
        {count !== undefined && count > 0 && (
          <span className="text-xs font-bold text-stone-400 tabular-nums uppercase">
            {count} รายการ
          </span>
        )}
        {onAction && (
          <button
            onClick={onAction}
            className="flex items-center gap-0.5 text-xs font-bold text-lime-600 uppercase  hover:text-lime-700 transition-colors cursor-pointer group"
          >
            ดูทั้งหมด
            <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function UpcomingCard({ workout: w }: { workout: ScheduledWorkout }) {
  const [open, setOpen] = useState(false);
  const exercises = [...(w?.session?.exercises ?? [])].sort(
    (a, b) => (a.order_sequence ?? 0) - (b.order_sequence ?? 0)
  );
  const rel = relativeDay(w?.scheduled_date);
  const isToday = rel?.isToday ?? false;
  const date = w?.scheduled_date ? new Date(w.scheduled_date) : null;

  return (
    <div
      className={`rounded-2xl overflow-hidden bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_2px_4px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.06)] active:scale-[0.99] ${isToday ? "ring-1 ring-lime-300 border-lime-200" : ""
        }`}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div
            className={`shrink-0 flex flex-col items-center justify-center rounded-xl px-3 py-2 min-w-[48px] ${isToday
              ? "bg-lime-500 text-white"
              : "bg-gray-100 text-gray-600"
              }`}
          >
            <span className="text-xs font-medium uppercase ">
              {date?.toLocaleDateString("th-TH", { month: "short" }) ?? "-"}
            </span>
            <span className="text-base font-semibold leading-none mt-0.5">
              {date?.getDate() ?? "-"}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            {rel && (
              <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isToday ? "text-lime-600" : "text-slate-400"}`}>
                {rel.label}
              </span>
            )}
            <h4 className={`text-lg font-bold truncate mt-0.5 leading-tight ${isToday ? "text-lime-700" : "text-slate-900"}`}>
              {w?.session?.session_name || `Workout #${w?.id ?? "?"}`}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {exercises.length} EXERCISES
              </p>
              <div className="w-1 h-1 rounded-full bg-slate-200" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                PROGRAM SCHEDULED
              </p>
            </div>
          </div>
        </div>

        {exercises.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="mt-4 w-full text-xs font-medium text-gray-600 cursor-pointer transition-colors hover:text-lime-600 active:scale-[0.99]"
          >
            {open ? "ซ่อน" : "ดูทั้งหมด"}
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-stone-100"
          >
            <div className="p-4 space-y-1 max-h-[180px] overflow-y-auto bg-stone-50/50">
              {exercises.map((ex) => (
                <div
                  key={ex.id}
                  className="text-xs text-stone-600 py-1"
                >
                  {ex.exercise_name} · {ex.sets}×{ex.reps}
                  {ex.weight != null && <> · {ex.weight}kg</>}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LogCard({ log }: { log: WorkoutLog }) {
  const navigate = useNavigate();
  return (
    <motion.div
      whileHover={{ x: 4 }}
      onClick={() => navigate('/workout/history')}
      className="flex items-center gap-4 rounded-[2rem] bg-white p-5 border border-slate-100 shadow-sm transition-all duration-300 hover:border-lime-200 hover:shadow-xl hover:shadow-lime-500/5 cursor-pointer group"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-lime-50 group-hover:text-lime-500 transition-colors border border-slate-100/50">
        <ListChecks className="h-7 w-7" strokeWidth={1.5} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-base font-bold text-slate-900 truncate mb-0.5 group-hover:text-lime-600 transition-colors">
          {log?.session?.session_name || `Workout #${log?.id ?? "?"}`}
        </p>
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {formatDateFull(log?.workout_date)}
          </p>
          <div className="w-1 h-1 rounded-full bg-slate-200" />
          <p className="text-[11px] font-bold text-lime-600 uppercase tracking-wider">
            {log?.duration_minutes ?? "-"} MINS
          </p>
        </div>
      </div>

      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-lime-500 group-hover:text-white transition-all">
        <ChevronRight size={18} />
      </div>
    </motion.div>
  );
}

export type WorkoutsVariant = "upcoming" | "activity" | "full";

interface WorkoutsSectionProps {
  scheduled?: ScheduledWorkout[];
  logs?: WorkoutLog[];
  isLoadingScheduled: boolean;
  isLoadingLogs: boolean;
  variant?: WorkoutsVariant;
}

export default function WorkoutsSection({
  scheduled = [],
  logs = [],
  isLoadingScheduled,
  isLoadingLogs,
  variant = "full",
}: WorkoutsSectionProps) {
  const navigate = useNavigate();
  const safeScheduled = scheduled || [];
  const safeLogs = logs || [];

  const upcoming = safeScheduled
    .filter((w) => w?.status === "SCHEDULED")
    .sort((a, b) => {
      const dateA = a?.scheduled_date
        ? new Date(a.scheduled_date).getTime()
        : 0;
      const dateB = b?.scheduled_date
        ? new Date(b.scheduled_date).getTime()
        : 0;
      return dateA - dateB;
    });

  const recentLogs = [...safeLogs].sort((a, b) => {
    const dateA = a?.workout_date ? new Date(a.workout_date).getTime() : 0;
    const dateB = b?.workout_date ? new Date(b.workout_date).getTime() : 0;
    return dateB - dateA;
  });

  const showUpcoming = variant === "upcoming" || variant === "full";
  const showActivity = variant === "activity" || variant === "full";

  if (variant === "upcoming") {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)] border border-stone-100/80">
        <SectionTitle
          icon={<Calendar className="h-4 w-4 text-stone-500" />}
          title="Workout ที่จะมาถึง"
          count={upcoming.length}
          onAction={() => navigate("/workout/calendar")}
        />
        {isLoadingScheduled ? (
          <div className="h-32 rounded-xl bg-stone-50 animate-pulse" />
        ) : upcoming.length === 0 ? (
          <EmptyState
            icon={<Calendar className="h-5 w-5" />}
            title="ยังไม่มี workout"
            desc="รอ trainer กำหนด"
          />
        ) : (
          <UpcomingCard workout={upcoming[0]} />
        )}
      </div>
    );
  }

  if (variant === "activity") {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)] border border-stone-100/80">
        <SectionTitle
          icon={<ListChecks className="h-4 w-4 text-stone-500" />}
          title="ประวัติการออกกำลังกาย"
          count={recentLogs.length}
          onAction={() => navigate("/workout/history")}
        />
        {isLoadingLogs ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-stone-50 animate-pulse"
              />
            ))}
          </div>
        ) : recentLogs.length === 0 ? (
          <EmptyState
            icon={<ListChecks className="h-5 w-5" />}
            title="ยังไม่มีประวัติ"
            desc="เริ่มออกกำลังกายเลย"
          />
        ) : (
          <div className={`space-y-2 max-h-[320px] ${scrollbarY}`}>
            {recentLogs.slice(0, 8).map((log) => (
              <LogCard key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <SectionTitle
          icon={<Calendar className="h-4 w-4 text-stone-500" />}
          title="Workout ที่จะมาถึง"
          count={upcoming.length}
          onAction={() => navigate("/workout/calendar")}
        />
        {showUpcoming &&
          (isLoadingScheduled ? (
            <div className="h-32 rounded-xl bg-stone-50 animate-pulse" />
          ) : upcoming.length === 0 ? (
            <EmptyState
              icon={<Calendar className="h-5 w-5" />}
              title="ยังไม่มี workout"
              desc="รอ trainer กำหนด"
            />
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 2).map((w) => (
                <UpcomingCard key={w.id} workout={w} />
              ))}
            </div>
          ))}
      </section>

      <section>
        <SectionTitle
          icon={<ListChecks className="h-4 w-4 text-stone-500" />}
          title="ประวัติการออกกำลังกาย"
          count={recentLogs.length}
          onAction={() => navigate("/workout/history")}
        />
        {showActivity &&
          (isLoadingLogs ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl bg-stone-50 animate-pulse"
                />
              ))}
            </div>
          ) : recentLogs.length === 0 ? (
            <EmptyState
              icon={<ListChecks className="h-5 w-5" />}
              title="ยังไม่มีประวัติ"
              desc="เริ่มออกกำลังกายเลย"
            />
          ) : (
            <div className={`space-y-2 max-h-[280px] ${scrollbarY}`}>
              {recentLogs.slice(0, 6).map((log) => (
                <LogCard key={log.id} log={log} />
              ))}
            </div>
          ))}
      </section>
    </div>
  );
}
