import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, cubicBezier } from "framer-motion";
import { AlertCircle, CalendarDays, ChevronRight, Activity } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useScheduledWorkouts } from "../../hooks/workout/useScheduledWorkouts";
import { WeekStrip } from "../../components/Workout/WeekStrip";
import { WorkoutList } from "../../components/Workout/WorkoutList";
import { WorkoutDetailSheet } from "../../components/Workout/WorkoutDetailSheet";
import { PageLoader } from "../../components/ui";
import { toYYYYMMDD, getWeekRange } from "../../utils/workout.utils";
import type { ScheduledWorkout } from "../../types/workout.types";


// ── Stagger animation ─────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.42,
      ease: cubicBezier(0.22, 1, 0.36, 1),
      delay: i * 0.07,
    },
  }),
};

// ── Stats Banner ──────────────────────────────────────────────────────────────
function WeekStats({ workouts }: { workouts: ScheduledWorkout[] }) {
  const total = workouts.length;
  const completed = workouts.filter((w) => w.status === "COMPLETED").length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  if (total === 0) return null;

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={0}
      className="mx-5 mb-6"
    >
      <div className="relative overflow-hidden rounded-[2rem] bg-gray-900 p-6 shadow-2xl shadow-gray-900/20">
        {/* Background Decorative Circles */}
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-lime-500/10 blur-2xl" />
        <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-lime-500/10 blur-2xl" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-500 text-gray-900 shadow-lg shadow-lime-500/30">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white">สัปดาห์นี้</h4>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
                {completed} จาก {total} โปรแกรมสำเร็จแล้ว
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div className="text-2xl font-bold text-lime-400 leading-none">
              {Math.round(progress)}%
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
              PROGRESS
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 h-1.5 w-full rounded-full bg-gray-800 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-lime-500 to-lime-400"
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function WorkoutCalendarPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const { start, end } = useMemo(
    () => getWeekRange(selectedDate),
    [selectedDate],
  );
  const startStr = toYYYYMMDD(start);
  const endStr = toYYYYMMDD(end);

  const { workouts, loading, error, refetch } = useScheduledWorkouts({
    userId: user?.id,
    startDate: startStr,
    endDate: endStr,
    programStatus: "ACTIVE",
    enabled: !!user?.id,
  });

  const workoutsByDate = useMemo(() => {
    const map: Record<string, boolean> = {};
    workouts.forEach((w) => {
      map[w.scheduled_date.slice(0, 10)] = true;
    });
    return map;
  }, [workouts]);

  const selectedStr = toYYYYMMDD(selectedDate);
  const dayWorkouts = useMemo(
    () => workouts.filter((w) => w.scheduled_date.slice(0, 10) === selectedStr),
    [workouts, selectedStr],
  );

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailWorkout, setDetailWorkout] = useState<ScheduledWorkout | null>(null);

  const handleSelectWorkout = useCallback((w: ScheduledWorkout) => {
    setDetailWorkout(w);
    setDetailOpen(true);
  }, []);

  useEffect(() => {
    setDetailOpen(false);
  }, [selectedStr]);

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-[80vh] bg-gray-50">
      <WeekStrip
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        workoutsByDate={workoutsByDate}
        sticky
      />

      {/* Week Stats Banner */}
      <WeekStats workouts={workouts} />

      {/* Main Container with Max Width for Desktop */}
      <div className="flex-1 w-full max-w-2xl mx-auto flex flex-col pt-4 px-4 pb-8">
        {/* Error with retry */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-6 rounded-3xl border border-red-100 bg-white p-5 flex items-center justify-between gap-4 shadow-xl shadow-red-500/5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <p className="text-sm font-semibold text-gray-700">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => refetch()}
                className="shrink-0 h-10 px-4 rounded-xl bg-gray-900 text-xs font-bold text-white hover:bg-gray-800 transition-all active:scale-95"
              >
                Retry
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && !workouts.length ? (
          <PageLoader message="กำลังโหลด..." variant="inline" />
        ) : dayWorkouts.length === 0 ? (
          /* ── Premium Empty State ── */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="pt-10 flex flex-col items-center justify-center"
          >
            <div className="relative mt-8">
              <div className="flex h-32 w-32 items-center justify-center rounded-[2.5rem] bg-white shadow-2xl shadow-gray-200/50 relative z-10">
                <Activity className="h-12 w-12 text-gray-200" />
              </div>
              {/* Decorative Blur */}
              <div className="absolute inset-0 bg-lime-500/20 blur-3xl rounded-full" />

              <div className="absolute -right-3 -top-3 z-20 flex h-10 w-10 items-center justify-center rounded-2xl bg-lime-500 shadow-xl shadow-lime-500/40">
                <CalendarDays className="h-5 w-5 text-white" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mt-8">วันพักผ่อนที่ยอดเยี่ยม</h3>
            <p className="mt-3 text-sm font-medium text-gray-400 text-center max-w-[280px] leading-relaxed">
              ไม่มีตารางฝึกในวันที่เลือก คุณสามารถ <span className="text-gray-900 font-bold">เลือกวันอื่น</span> เพื่อวางแผนล่วงหน้าได้
            </p>

            <motion.button
              type="button"
              onClick={() => setSelectedDate(new Date())}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-8 group flex items-center gap-3 rounded-2xl bg-gray-900 px-6 py-4 text-sm font-bold text-white shadow-2xl shadow-gray-900/20 hover:bg-gray-800 transition-all"
            >
              <CalendarDays className="h-4 w-4 text-lime-400" />
              กลับไปยังวันนี้
              <ChevronRight className="h-4 w-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        ) : (
          /* ── Workout list with stagger ── */
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <WorkoutList
              workouts={dayWorkouts}
              onSelect={handleSelectWorkout}
              showExercisePreview
              showStatus
            />
          </motion.div>
        )}
      </div>

      <WorkoutDetailSheet
        open={detailOpen}
        workout={detailWorkout}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}
