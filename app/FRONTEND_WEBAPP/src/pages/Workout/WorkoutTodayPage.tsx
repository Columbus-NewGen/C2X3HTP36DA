import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  ChevronRight,
  AlertCircle,
  Play,
  Activity,
  Loader2,
  RefreshCw,
  CalendarCheck,
  Zap,
  SkipForward,
  ListCheck,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useScheduledWorkouts } from "../../hooks/workout/useScheduledWorkouts";
import { useWorkoutStatus } from "../../hooks/workout/useWorkoutStatus";
import { useExerciseChecklist } from "../../hooks/workout/useExerciseChecklist";
import type { ChecklistMap } from "../../hooks/workout/useExerciseChecklist";
import { WorkoutLogSheet } from "../../components/Workout/WorkoutLogSheet";
import { SubstituteExerciseModal } from "../../components/Workout/SubstituteExerciseModal";
import { MachineSelectionModal } from "../../components/Workout/MachineSelectionModal";
import { formatThaiDate, toYYYYMMDD, estimateMinutes, cn } from "../../utils/workout.utils";
import { WorkoutPosterModal } from "../../components/Workout/WorkoutPosterModal";
import { Share2 } from "lucide-react";
import { resolveImageUrl } from "../../utils/floorplan.utils";
import { PageLoader, useToasts } from "../../components/ui";
import type { ScheduledWorkout, WorkoutSessionExercise } from "../../types/workout.types";
import type { Exercise } from "../../types/exercise.types";



// ── Stagger animation helpers ─────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as any,
      delay: i * 0.08,
    },
  }),
};

// ── Exercise Row ──────────────────────────────────────────────────────────────
import { MapPin } from "lucide-react";
import { useFloorplanData } from "../../hooks";
import { useNavigate } from "react-router-dom";

function ExerciseRow({
  exercise,
  index,
  done = false,
  loading = false,
  onToggle,
  onSubstitute,
  currentExerciseId,
  currentExerciseName,
  imageUrl,
  onShowMachines,
}: {
  exercise: WorkoutSessionExercise;
  index: number;
  done?: boolean;
  loading?: boolean;
  onToggle?: () => void;
  onSubstitute?: () => void;
  currentExerciseId?: number;
  currentExerciseName?: string;
  imageUrl?: string | null;
  onShowMachines?: (id: number, name: string) => void;
  floorplan: any;
}) {
  const isSubstituted = !!(currentExerciseId && currentExerciseId !== exercise.exercise_id);
  const displayName = currentExerciseName || exercise.exercise_name;

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -2, scale: 1.01 }}
      className={cn(
        "flex items-center gap-4 p-3 rounded-2xl border border-transparent hover:border-lime-100 hover:bg-white hover:shadow-md transition-all duration-300 relative group",
        done && "opacity-60",
      )}
    >
      {/* Sequence number / check button */}
      <div className="flex flex-col items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!done && !loading) onToggle?.();
          }}
          disabled={done || loading}
          aria-label={done ? "Completed" : "Mark as done"}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all shadow-sm",
            done
              ? "bg-lime-500 text-white cursor-default"
              : loading
                ? "bg-gray-50 text-gray-400 cursor-wait"
                : "bg-white border border-gray-200 text-gray-400 hover:border-lime-500 hover:text-lime-600 active:scale-90"
          )}
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : done ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            index + 1
          )}
        </button>
      </div>

      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner group-hover:border-lime-200 transition-colors">
        {imageUrl ? (
          <img
            src={resolveImageUrl(imageUrl) || undefined}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            alt={displayName}
          />
        ) : (
          <Activity size={24} className="text-gray-200" />
        )}
      </div>

      {/* Exercise info */}
      <div className="flex-1 min-w-0">
        <div className="relative">
          <div className={cn(
            "text-base font-bold text-gray-900 pr-10 leading-tight",
            isSubstituted && "text-lime-600"
          )}>
            {displayName}
          </div>
          <div className="text-sm font-bold text-gray-400 mt-1.5 flex items-center gap-2">
            <span className="flex items-center gap-1 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-md text-xs text-gray-500 font-bold uppercase">
              {exercise.sets} Sets
            </span>
            <span className="text-gray-300">×</span>
            <span className="text-gray-600 font-semibold">{exercise.reps} Reps</span>
            {exercise.weight != null && (
              <>
                <span className="h-1 w-1 rounded-full bg-gray-200" />
                <span className="text-lime-600 font-semibold">{exercise.weight} kg</span>
              </>
            )}
          </div>

          {/* Quick Find Floorplan Link */}
          {!done && (
            <button
              onClick={() => onShowMachines?.(currentExerciseId || exercise.exercise_id, displayName)}
              className="absolute right-0 top-0.5 p-2.5 rounded-2xl bg-lime-50 text-lime-600 hover:bg-lime-500 hover:text-white transition-all active:scale-90 shadow-sm border border-lime-100"
              title="ดูตำแหน่งเครื่อง"
            >
              <MapPin size={18} fill="currentColor" fillOpacity={0.2} />
            </button>
          )}
        </div>
        {isSubstituted && (
          <p className="text-xs font-bold text-amber-600 bg-amber-50/50 px-1.5 py-0.5 rounded-md inline-flex items-center gap-1 mt-1.5 border border-amber-100">
            <RefreshCw size={8} /> แทนที่จาก: {exercise.exercise_name}
          </p>
        )}
      </div>

      {!loading && onSubstitute && (
        <button
          onClick={(e) => { e.stopPropagation(); onSubstitute(); }}
          className="p-2 rounded-xl text-gray-300 hover:text-lime-600 hover:bg-lime-50 transition-all opacity-0 group-hover:opacity-100 active:scale-90"
          title="ค้นหาท่าทดแทน"
        >
          <RefreshCw size={14} />
        </button>
      )}
    </motion.div>
  );
}

// ── Completed State ───────────────────────────────────────────────────────────
function CompletedBanner({
  workout,
  checklist,
  floorplan,
  onEdit,
  onShowMachines,
  onShare,
}: {
  workout: ScheduledWorkout,
  checklist: ChecklistMap,
  floorplan: any,
  onEdit?: () => void,
  onShowMachines?: (id: number, name: string) => void,
  onShare?: () => void
}) {
  const exercises = [...workout.session.exercises].sort(
    (a, b) => a.order_sequence - b.order_sequence,
  );

  return (
    <div className="space-y-4">
      {/* Hero celebration card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl bg-lime-500 p-6 shadow-lg shadow-lime-500/25"
      >
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        {/* Decorative circle */}
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -right-2 -bottom-12 h-32 w-32 rounded-full bg-white/10" />

        <div className="relative z-10">
          {/* Icon + date */}
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 18,
                delay: 0.25,
              }}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20"
            >
              <CheckCircle2 className="h-6 w-6 text-white" />
            </motion.div>
            <span className="text-xs font-semibold text-lime-100">
              {formatThaiDate(new Date())}
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex items-start justify-between"
          >
            <div>
              <p className="mt-4 text-xs font-bold uppercase text-lime-200/80">
                เสร็จแล้ว!
              </p>
              <h2 className="mt-0.5 text-3xl font-bold text-white leading-tight">
                {workout.session.session_name}
              </h2>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-lime-300 animate-pulse" />
                <p className="text-sm font-medium text-lime-50/90">
                  {exercises.length} ท่า · ออกกำลังกายเสร็จสมบูรณ์
                </p>
              </div>
            </div>

            {onEdit && (
              <div className="mt-4 flex flex-col gap-2">
                <button
                  onClick={onShare}
                  className="flex items-center gap-1.5 rounded-xl bg-white text-lime-600 px-3 py-2 text-xs font-bold hover:bg-lime-50 transition-all active:scale-95 shadow-md"
                >
                  <Share2 className="h-3 w-3" />
                  แชร์
                </button>
              </div>
            )}
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mt-5 flex gap-3"
          >
            <div className="flex-1 rounded-2xl bg-white/15 px-3 py-2.5 text-center">
              <p className="text-xl font-bold text-white">
                {exercises.length}
              </p>
              <p className="text-xs font-semibold uppercase  text-lime-200">
                ท่า
              </p>
            </div>
            <div className="flex-1 rounded-2xl bg-white/15 px-3 py-2.5 text-center">
              <p className="text-xl font-bold text-white">
                {estimateMinutes(exercises.length)}
              </p>
              <p className="text-xs font-semibold uppercase  text-lime-200">
                นาที
              </p>
            </div>
            <div className="flex-1 rounded-2xl bg-white/15 px-3 py-2.5 text-center">
              <p className="text-xl font-bold text-white">+XP</p>
              <p className="text-xs font-semibold uppercase  text-lime-200">
                รับแล้ว
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Exercise list */}
      {exercises.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.45 }}
          className="rounded-3xl bg-white border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <p className="flex items-center gap-2 text-xs font-bold uppercase  text-gray-400">
              <CalendarCheck className="h-3.5 w-3.5" />
              ท่าที่ฝึกวันนี้
            </p>
          </div>
          <div className="px-5 pb-4">
            {exercises.map((ex, i) => {
              const slot = checklist.get(ex.id);
              return (
                <ExerciseRow
                  key={ex.id}
                  exercise={ex}
                  index={i}
                  done
                  currentExerciseId={slot?.exercise_id}
                  currentExerciseName={slot?.exercise_name}
                  imageUrl={slot?.image_url}
                  onShowMachines={onShowMachines}
                  floorplan={floorplan}
                />
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function HoldToConfirmButton({
  onComplete,
  className,
  children,
}: {
  onComplete: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  const [isHolding, setIsHolding] = useState(false);

  return (
    <motion.button
      type="button"
      className={cn("relative overflow-hidden active:scale-[0.98] transition-transform", className)}
      onPointerDown={() => setIsHolding(true)}
      onPointerUp={() => setIsHolding(false)}
      onPointerLeave={() => setIsHolding(false)}
    >
      {/* Progress Bar Background */}
      <AnimatePresence>
        {isHolding && (
          <motion.div
            className="absolute inset-0 bg-white/20 origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "linear" }}
          />
        )}
      </AnimatePresence>

      {/* Auto-trigger logic using a callback delay */}
      <HoldingEffect isHolding={isHolding} onComplete={onComplete} />

      <div className="relative z-10">{children}</div>
    </motion.button>
  );
}

function HoldingEffect({ isHolding, onComplete }: { isHolding: boolean; onComplete: () => void }) {
  useEffect(() => {
    let timer: any;
    if (isHolding) {
      timer = setTimeout(() => {
        onComplete();
      }, 1000); // 1 second hold
    }
    return () => clearTimeout(timer);
  }, [isHolding, onComplete]);
  return null;
}

// ── Scheduled Card ────────────────────────────────────────────────────────────
function ScheduledCard({
  workout,
  checklist,
  loadingSlotId,
  onStart,
  onToggleSlot,
  onSubstitute,
  onShowMachines,
  floorplan,
}: {
  workout: ScheduledWorkout;
  checklist: ChecklistMap;
  loadingSlotId: number | null;
  onStart: () => void;
  onToggleSlot: (slotId: number, overrideId?: number) => void;
  onSubstitute: (slot: WorkoutSessionExercise) => void;
  onShowMachines?: (id: number, name: string) => void;
  floorplan: any;
}) {
  const exercises = [...workout.session.exercises].sort(
    (a, b) => a.order_sequence - b.order_sequence,
  );
  const exerciseCount = exercises.length;
  const estimatedTime = estimateMinutes(exerciseCount);

  return (
    <div className="space-y-4">
      {/* Main session card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-xl shadow-gray-200/50"
      >
        {/* Dynamic gradient background */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-lime-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-48 w-48 rounded-full bg-lime-500/5 blur-3xl" />

        {/* Top accent with pulse effect */}
        <div className="relative h-1.5 w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-lime-400 via-lime-500 to-lime-600" />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{ x: ['100%', '-100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="p-5">
          {/* Date label */}
          <div className="flex items-center justify-between">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-lime-500 px-3 py-1.5 text-xs font-bold uppercase text-white shadow-sm shadow-lime-500/20"
            >
              <Zap className="h-3 w-3 fill-white" />
              ตารางวันนี้
            </motion.span>
            <span className="text-xs font-bold text-gray-400">
              {formatThaiDate(new Date())}
            </span>
          </div>

          {/* Session name */}
          <h1 className="mt-3 text-2xl font-bold text-gray-900 leading-tight">
            {workout.session.session_name}
          </h1>

          {/* Meta chips */}
          <div className="mt-3 flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500">
              <Activity className="h-4 w-4 text-gray-400" />
              {exerciseCount} ท่า
            </span>
            <span className="text-gray-200">·</span>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500">
              <Clock className="h-4 w-4 text-gray-400" />~{estimatedTime} นาที
            </span>
          </div>
        </div>

        {/* Exercise list — O(1) lookup via checklist Map */}
        {exercises.length > 0 && (
          <div className="border-t border-gray-50 bg-gray-50/30 px-3 py-4">
            <p className="mb-3 px-2 text-xs font-bold uppercase text-gray-400 flex items-center gap-2">
              <ListCheck className="h-3 w-3" />
              ลำดับการฝึก
            </p>
            <div className="space-y-1">
              {exercises.map((ex, i) => {
                const slot = checklist.get(ex.id); // O(1)
                return (
                  <ExerciseRow
                    key={ex.id}
                    exercise={ex}
                    index={i}
                    done={slot?.completed ?? false}
                    loading={loadingSlotId === ex.id}
                    onToggle={() => onToggleSlot(ex.id)}
                    onSubstitute={() => onSubstitute(ex)}
                    currentExerciseId={slot?.exercise_id}
                    currentExerciseName={slot?.exercise_name}
                    imageUrl={slot?.image_url || ex.image_url}
                    onShowMachines={onShowMachines}
                    floorplan={floorplan}
                  />
                );
              })}
            </div>
          </div>
        )}
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <HoldToConfirmButton
          onComplete={onStart}
          className={cn(
            "group relative w-full overflow-hidden rounded-2xl py-4",
            "bg-gray-900 shadow-xl shadow-gray-900/10",
            "transition-all duration-300",
          )}
        >
          <span className="relative flex items-center justify-center gap-3 font-bold text-white text-base">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-lime-500 shadow-lg shadow-lime-500/40 group-hover:rotate-12 transition-transform duration-300">
              <Play className="h-4 w-4 fill-white text-white translate-x-0.5" />
            </span>
            กดค้างเพื่อบันทึกผล
            <ChevronRight className="h-4 w-4 text-lime-500 group-hover:translate-x-1 transition-transform" />
          </span>
        </HoldToConfirmButton>
      </motion.div>

      {/* XP reward hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-center gap-1.5 text-xs text-gray-400"
      >
        <Zap className="h-3.5 w-3.5 text-lime-500" />
        เสร็จแล้วรับ XP ทันที
      </motion.div>
    </div>
  );
}

// ── Empty / Missed / Skipped State ────────────────────────────────────────────
function EmptyState({ status }: { status: string | null }) {
  const config = useMemo(() => {
    if (status === "SKIPPED")
      return {
        icon: <SkipForward className="h-8 w-8 text-amber-400" />,
        iconBg: "bg-amber-50",
        title: "ข้ามการฝึกวันนี้",
        desc: "ไม่เป็นไร เริ่มใหม่ได้พรุ่งนี้เลย 💪",
      };
    if (status === "MISSED")
      return {
        icon: <AlertCircle className="h-8 w-8 text-red-400" />,
        iconBg: "bg-red-50",
        title: "พลาดการฝึกวันนี้",
        desc: "อย่าให้พลาดอีกนะ streak รอคุณอยู่!",
      };
    return {
      icon: <Activity className="h-8 w-8 text-gray-400" />,
      iconBg: "bg-gray-100",
      title: "ไม่มีตารางฝึกวันนี้",
      desc: "เลือกวันอื่นจากเมนู Calendar หรือ History",
    };
  }, [status]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div
        className={cn(
          "flex h-20 w-20 items-center justify-center rounded-3xl",
          config.iconBg,
        )}
      >
        {config.icon}
      </div>
      <h3 className="mt-5 text-xl font-bold text-gray-900">{config.title}</h3>
      <p className="mt-2 max-w-xs text-sm text-gray-500 leading-relaxed">
        {config.desc}
      </p>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function WorkoutTodayPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToasts();
  const { floorplan } = useFloorplanData();
  const today = useMemo(() => new Date(), []);
  const todayStr = toYYYYMMDD(today);

  const rangeStart = useMemo(
    () => toYYYYMMDD(new Date(today.getTime() - 7 * 86400000)),
    [today],
  );
  const rangeEnd = useMemo(
    () => toYYYYMMDD(new Date(today.getTime() + 7 * 86400000)),
    [today],
  );

  const {
    workouts: fetchedWorkouts,
    loading,
    error,
    refetch,
  } = useScheduledWorkouts({
    userId: user?.id,
    startDate: rangeStart,
    endDate: rangeEnd,
    programStatus: "ACTIVE",
    enabled: !!user?.id,
  });

  const [workouts, setWorkouts] = useState(fetchedWorkouts);
  useEffect(() => {
    setWorkouts(fetchedWorkouts);
  }, [fetchedWorkouts]);

  const todayWorkouts = useMemo(
    () => workouts.filter((w) => w.scheduled_date.slice(0, 10) === todayStr),
    [workouts, todayStr],
  );
  const primaryWorkout = todayWorkouts[0] ?? null;

  const todayStatus = primaryWorkout?.status ?? null;
  const isCompleted = todayStatus === "COMPLETED";
  const isScheduled = todayStatus === "SCHEDULED";

  const [logSheetWorkout, setLogSheetWorkout] =
    useState<ScheduledWorkout | null>(null);

  useWorkoutStatus({
    userId: user?.id,
    workouts,
    onWorkoutsChange: (fn) => setWorkouts(fn),
    onSuccess: () => { },
    onCompleted: (workout) => {
      setLogSheetWorkout(workout);
    },
  });

  const [showPoster, setShowPoster] = useState(false);

  const {
    checklist,
    toggleExercise,
    substituteExercise,
  } = useExerciseChecklist({
    userId: user?.id,
    workout: primaryWorkout,
    refetch,
    onError: (msg) => addToast("error", msg),
  });

  const handleToggle = useCallback((slotId: number) => {
    toggleExercise(slotId);
  }, [toggleExercise]);

  // --- Subbing logic ---
  const [subbingSlot, setSubbingSlot] = useState<WorkoutSessionExercise | null>(null);

  // --- Machine Selection logic ---
  const [machineSelectionTarget, setMachineSelectionTarget] = useState<{ id: number, name: string } | null>(null);

  const handleStartWorkout = useCallback(() => {
    if (primaryWorkout) {
      setLogSheetWorkout(primaryWorkout);
    }
  }, [primaryWorkout]);

  if (!user) return null;

  return (
    <div className="min-h-[80vh] flex flex-col bg-gray-50/70">
      {/* Page header */}
      <div className="px-6 pt-6 pb-4 max-w-2xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="absolute -left-3 top-0 bottom-0 w-1 bg-lime-500 rounded-full" />
          <p className="text-xs font-bold uppercase text-gray-400 translate-y-0.5">
            WORKOUT PROGRAM
          </p>
          <h1 className="mt-0 text-3xl font-bold text-gray-900">
            วันนี้
          </h1>
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-8 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {loading && !workouts.length ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PageLoader message="กำลังโหลด..." variant="inline" />
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-5 text-center text-sm text-red-600"
            >
              {error}
            </motion.div>
          ) : isCompleted ? (
            <motion.div
              key="completed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CompletedBanner
                workout={primaryWorkout!}
                checklist={checklist}
                floorplan={floorplan}
                onEdit={handleStartWorkout}
                onShowMachines={(id, name) => setMachineSelectionTarget({ id, name })}
                onShare={() => setShowPoster(true)}
              />
            </motion.div>
          ) : isScheduled ? (
            <motion.div
              key="scheduled"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ScheduledCard
                workout={primaryWorkout!}
                checklist={checklist}
                loadingSlotId={null}
                onStart={handleStartWorkout}
                onToggleSlot={handleToggle}
                onSubstitute={setSubbingSlot}
                onShowMachines={(id, name) => setMachineSelectionTarget({ id, name })}
                floorplan={floorplan}
              />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState status={todayStatus} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sheets */}
      <WorkoutLogSheet
        open={!!logSheetWorkout}
        workout={logSheetWorkout}
        checklist={checklist}
        logId={checklist.values().next().value?.exerciseLogId} // Extracting from checklist if any exercise was already synced before refresh
        onClose={() => setLogSheetWorkout(null)}
        onSaved={refetch}
      />

      <SubstituteExerciseModal
        isOpen={!!subbingSlot}
        onClose={() => setSubbingSlot(null)}
        originalExerciseId={subbingSlot?.exercise_id ?? 0}
        originalExerciseName={subbingSlot?.exercise_name ?? ""}
        onSelect={(newEx: Exercise) => {
          if (subbingSlot) {
            substituteExercise(subbingSlot.id, {
              id: newEx.id,
              name: newEx.exercise_name,
              image_url: newEx.image_url
            });

            // Check if available on map to give better feedback
            const hasMachine = floorplan?.equipment_instances?.some(m => m.equipment?.id === newEx.id);
            if (hasMachine) {
              addToast("success", `เปลี่ยนเป็น ${newEx.exercise_name} แล้ว! ดูตำแหน่งได้ที่รูปแผนที่สีเขียว 📍`);
            } else {
              addToast("success", `เปลี่ยนเป็น ${newEx.exercise_name} แล้ว! (ท่านี้ไม่มีในแผนที่)`);
            }

            setSubbingSlot(null);
          }
        }}
      />

      <MachineSelectionModal
        isOpen={!!machineSelectionTarget}
        onClose={() => setMachineSelectionTarget(null)}
        exerciseId={machineSelectionTarget?.id ?? 0}
        exerciseName={machineSelectionTarget?.name ?? ""}
        floorplan={floorplan}
        onSelect={(machineId) => {
          setMachineSelectionTarget(null);
          navigate(`/floorplan?machineId=${machineId}`);
        }}
      />

      {primaryWorkout && (
        <WorkoutPosterModal
          isOpen={showPoster}
          onClose={() => setShowPoster(false)}
          data={{
            sessionName: primaryWorkout.session.session_name,
            exercisesCount: primaryWorkout.session.exercises.length,
            durationMinutes: estimateMinutes(primaryWorkout.session.exercises.length),
            xpGained: primaryWorkout.session.exercises.length * 50,
            exercises: primaryWorkout.workout_log?.exercises || primaryWorkout.session.exercises.map(ex => ({
              exercise_id: ex.exercise_id,
              exercise_name: ex.exercise_name,
              sets_completed: ex.sets,
              reps_completed: ex.reps,
              weight_used: ex.weight
            }))
          }}
        />
      )}
    </div>
  );
}
