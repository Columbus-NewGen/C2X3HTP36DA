import {
  Weight,
  Zap,
  ChevronRight,
  Activity,
  Wrench,
  Target,
  Sparkles,
  Info,
  TrendingUp,
  Component,
} from "lucide-react";
import { useState, useCallback, useEffect, useMemo, memo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Model, {
  type IExerciseData,
  type Muscle,
} from "react-body-highlighter";
import { exerciseApi } from "../../services/ExerciseAPI";
import {
  getMovementPatternLabel,
  getImageUrl,
} from "../../utils/exercise.utils";
import type { ExerciseDisplay } from "../../types/exercise.types";
import type { SubstituteEntry } from "../../types/exercise.types";
import { SectionTitle } from "../../components/ui";
import { DrawerMediaSection } from "./DrawerMediaSection";
import {
  BACK_SLUGS,
  INV_BADGE,
  INV_COLOR,
  toBodySlug,
} from "../../utils/muscleBodyMap";

// ─── Types ─────────────────────────────────────────────────────────────────
interface MuscleEntry {
  id: number;
  muscle_name: string;
  scientific_name: string;
  body_region: string;
  involvement_type: "primary" | "secondary" | "stabilizer";
  activation_percentage: number;
}

interface EquipmentEntry {
  id: number;
  equipment_name: string;
  equipment_type: string;
  description: string;
  image_url: string | null;
  image_full_url: string | null;
  is_required: boolean;
}

// ─── Design tokens ──────────────────────────────────────────────────────────
// [FIX #3, #6, #7] Single accent strategy: navy as primary action,
// amber as highlight, lime ONLY for "active/live" state.
// No more lime-everywhere.
const DIFFICULTY_CONFIG: Record<
  string,
  { bg: string; text: string; bar: string; label: string }
> = {
  beginner: {
    bg: "bg-emerald-50 border border-emerald-100",
    text: "text-emerald-700",
    bar: "bg-emerald-400",
    label: "Beginner",
  },
  intermediate: {
    bg: "bg-amber-50 border border-amber-100",
    text: "text-amber-700",
    bar: "bg-amber-400",
    label: "Intermediate",
  },
  advanced: {
    bg: "bg-rose-50 border border-rose-100",
    text: "text-rose-600",
    bar: "bg-rose-500",
    label: "Advanced",
  },
};

function getDifficultyConfig(d: string) {
  return (
    DIFFICULTY_CONFIG[d?.toLowerCase()] ?? {
      bg: "bg-gray-100",
      text: "text-gray-500",
      bar: "bg-gray-300",
      label: d,
    }
  );
}

// ─── Animation ───────────────────────────────────────────────────────────────
const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

// [FIX #4 delay system] Index-driven, no magic numbers scattered around
function getSectionVariants(reducedMotion: boolean) {
  return {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: reducedMotion ? 0 : 0.3,
        delay: reducedMotion ? 0 : i * 0.07,
        ease: EASE_OUT_EXPO,
      },
    }),
  };
}

interface DrawerViewContentProps {
  exercise: ExerciseDisplay;
  substitutes: SubstituteEntry[] | null;
  substitutesLoading: boolean;
  substitutesError: string | null;
  onOpenView: (id: number) => void;
}

// ─── Skeletons ──────────────────────────────────────────────────────────────
function SkeletonMuscles() {
  return (
    <div className="p-5 space-y-4 animate-pulse">
      <div className="flex justify-center gap-8">
        <div className="w-32 h-40 rounded-xl bg-gray-100" />
        <div className="w-32 h-40 rounded-xl bg-gray-100" />
      </div>
      <div className="space-y-2 pt-2 border-t border-gray-100">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <div className="h-2 w-2 rounded-full bg-gray-100" />
            <div className="flex-1 h-4 rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonSubstitutes() {
  return (
    <div className="animate-pulse divide-y divide-gray-100">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-4">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-36 rounded bg-gray-100" />
            <div className="h-2 w-20 rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonEquipment() {
  return (
    <div className="p-5 pt-0 space-y-2 animate-pulse">
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 py-3 px-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-28 rounded bg-gray-100" />
            <div className="h-3 w-16 rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Muscles Section ────────────────────────────────────────────────────────
function MusclesSection({ exerciseId }: { exerciseId: number }) {
  const [muscles, setMuscles] = useState<MuscleEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    exerciseApi
      .getMuscles(exerciseId)
      .then((res: any) => {
        if (!cancelled) setMuscles(res.muscles ?? []);
      })
      .catch((err: any) => {
        if (!cancelled) {
          const status = err?.response?.status;
          if (!status || status === 404) setMuscles([]);
          else
            setError(
              err?.response?.data?.error || err?.message || "โหลดไม่สำเร็จ",
            );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [exerciseId]);

  const modelData: IExerciseData[] = useMemo(() => {
    if (!muscles) return [];
    const byType: Record<string, string[]> = {
      primary: [],
      secondary: [],
      stabilizer: [],
    };
    for (const m of muscles) {
      const slug = toBodySlug(m.muscle_name);
      if (slug) byType[m.involvement_type]?.push(slug);
    }
    const result: IExerciseData[] = [];
    if (byType.primary.length)
      result.push({
        name: "Primary",
        muscles: byType.primary as Muscle[],
        frequency: 1,
      });
    if (byType.secondary.length)
      result.push({
        name: "Secondary",
        muscles: byType.secondary as Muscle[],
        frequency: 2,
      });
    if (byType.stabilizer.length)
      result.push({
        name: "Stabilizer",
        muscles: byType.stabilizer as Muscle[],
        frequency: 3,
      });
    return result;
  }, [muscles]);

  const hasFront = useMemo(
    () =>
      muscles?.some((m) => {
        const s = toBodySlug(m.muscle_name);
        return s && !BACK_SLUGS.has(s);
      }),
    [muscles],
  );
  const hasBack = useMemo(
    () =>
      muscles?.some((m) => {
        const s = toBodySlug(m.muscle_name);
        return s && BACK_SLUGS.has(s);
      }),
    [muscles],
  );

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <SectionTitle
        icon={Activity}
        title="กล้ามเนื้อที่ใช้"
        desc="Target Muscles"
        count={muscles?.length}
      />
      {loading ? (
        <SkeletonMuscles />
      ) : error ? (
        <p className="px-5 py-4 text-sm text-rose-500">{error}</p>
      ) : (
        <div className="p-5 pt-2 space-y-4">
          {/* [FIX #5] Darker bg so model highlights pop more */}
          <div className="flex items-center justify-center gap-6 bg-gray-100/60 rounded-2xl py-6">
            {hasFront && (
              <Model
                data={modelData}
                style={{ width: "7rem" }}
                highlightedColors={["#16a34a", "#d97706", "#0284c7"]}
                bodyColor="#d1d5db"
                type="anterior"
              />
            )}
            {hasBack && (
              <Model
                data={modelData}
                style={{ width: "7rem" }}
                highlightedColors={["#16a34a", "#d97706", "#0284c7"]}
                bodyColor="#d1d5db"
                type="posterior"
              />
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 px-1">
            {(["primary", "secondary", "stabilizer"] as const).map((type) => (
              <div key={type} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: INV_COLOR[type] }}
                />
                <span className="text-xs text-gray-500">
                  {INV_BADGE[type].label}
                </span>
              </div>
            ))}
          </div>

          <div className="divide-y divide-gray-50">
            {muscles?.map((m) => {
              const badge =
                INV_BADGE[m.involvement_type] ?? INV_BADGE.stabilizer;
              return (
                <div key={m.id} className="flex items-center gap-3 py-3">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: INV_COLOR[m.involvement_type] }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 leading-none">
                      {m.muscle_name}
                    </p>
                    {/* [FIX #1-style] scientific name readable, not ghost text */}
                    <p className="text-xs text-gray-400 mt-0.5 italic">
                      {m.scientific_name}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${badge.bg} ${badge.text}`}
                  >
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Equipment Section ───────────────────────────────────────────────────────
import { useNavigate } from "react-router-dom";
import { useFloorplanData } from "../../hooks";
import type { Machine } from "../../types/floorplan.types";

const API_BASE_URL =
  import.meta.env.VITE_SERVER_URL || "https://api.gymmate.site";
const resolveImageUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
};

function EquipmentSection({ exerciseId }: { exerciseId: number }) {
  const navigate = useNavigate();
  const { floorplan } = useFloorplanData();
  const [equipment, setEquipment] = useState<EquipmentEntry[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    exerciseApi
      .getEquipment(exerciseId)
      .then((res: any) => {
        if (!cancelled) setEquipment(res.equipment ?? []);
      })
      .catch(() => {
        if (!cancelled) setEquipment([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [exerciseId]);

  // Helper to find machines on floorplan for a given equipment_id
  const getMachinesShowingOnFloorplan = (equipmentId: number): Machine[] => {
    if (!floorplan || !floorplan.equipment_instances) return [];
    return floorplan.equipment_instances.filter(
      (m) => m.equipment_id === equipmentId,
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <SectionTitle
        icon={Wrench}
        title="อุปกรณ์ที่ใช้"
        desc="Required Equipment"
        count={equipment?.length}
      />
      {loading ? (
        <SkeletonEquipment />
      ) : (
        <div className="p-5 pt-2 space-y-3">
          {equipment?.length === 0 ? (
            <div className="px-4 py-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <Weight className="h-8 w-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400 font-medium">
                ไม่ต้องใช้อุปกรณ์ (Bodyweight)
              </p>
            </div>
          ) : (
            equipment?.map((eq) => {
              const matchedMachines = getMachinesShowingOnFloorplan(eq.id);
              const hasOnFloorplan = matchedMachines.length > 0;

              return (
                <div key={eq.id} className="group flex flex-col gap-2">
                  <div className="flex items-center gap-3 py-3 px-3 rounded-2xl bg-gray-50/50 border border-transparent hover:border-gray-100 transition-all">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-gray-100 shrink-0 flex items-center justify-center">
                      {resolveImageUrl(eq.image_full_url || eq.image_url) ? (
                        <img
                          src={resolveImageUrl(eq.image_full_url || eq.image_url)!}
                          alt={eq.equipment_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Component size={16} className="text-gray-300" strokeWidth={1.5} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate leading-none">
                        {eq.equipment_name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <p className="text-xs text-gray-400 font-bold uppercase ">
                          {eq.equipment_type.replace(/_/g, " ")}
                        </p>
                        {hasOnFloorplan && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-lime-50 text-xs font-bold text-lime-600 uppercase ">
                            <div className="w-1 h-1 rounded-full bg-lime-500 animate-pulse" />
                            On Floor
                          </div>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-lg uppercase  ${eq.is_required
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-500"
                        }`}
                    >
                      {eq.is_required ? "จำเป็น" : "เสริม"}
                    </span>
                  </div>

                  {hasOnFloorplan && (
                    <button
                      onClick={() =>
                        navigate(
                          `/floorplan?machineId=${matchedMachines[0].id}`,
                        )
                      }
                      className="ml-13 mr-3 py-2 px-3 rounded-xl bg-white border border-gray-100 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:border-lime-200 hover:text-lime-600 transition-all flex items-center justify-center gap-2 group-hover:translate-x-1"
                    >
                      <TrendingUp size={12} className="text-lime-500" />
                      <span>
                        ดูตำแหน่งบนแผนที่ (มี {matchedMachines.length} เครื่อง)
                      </span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ─── Substitute Row ──────────────────────────────────────────────────────────
const SubstituteRow = memo(function SubstituteRow({
  s,
  tappedId,
  onOpenView,
}: {
  s: SubstituteEntry;
  tappedId: number | null;
  onOpenView: (id: number) => void;
}) {
  const imgUrl = getImageUrl(s.exercise);
  return (
    <button
      onClick={() => onOpenView(s.exercise.id)}
      disabled={tappedId !== null}
      className="w-full flex items-center gap-4 px-5 py-4 transition-all hover:bg-gray-50/80 active:scale-[0.99] disabled:opacity-50 text-left"
    >
      <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={s.exercise.exercise_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Activity size={20} className="text-gray-300" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 leading-none truncate">
          {s.exercise.exercise_name}
        </p>
        <div className="flex items-center gap-2 mt-2">
          {/* [FIX #7] Similarity bar — use gray track, amber fill, not lime */}
          <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full"
              style={{ width: `${s.similarity_score}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-500">
            {s.similarity_score}% match
          </span>
        </div>
      </div>
      <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors">
        <ChevronRight className="h-4 w-4" />
      </div>
    </button>
  );
});

// ─── Main Component ──────────────────────────────────────────────────────────
export function DrawerViewContent({
  exercise,
  substitutes,
  substitutesLoading,
  substitutesError,
  onOpenView,
}: DrawerViewContentProps) {
  const [tappedId, setTappedId] = useState<number | null>(null);
  const reducedMotion = useReducedMotion();
  const sectionVariants = useMemo(
    () => getSectionVariants(!!reducedMotion),
    [reducedMotion],
  );

  const handleOpenView = useCallback(
    (id: number) => {
      setTappedId(id);
      setTimeout(() => {
        setTappedId(null);
        onOpenView(id);
      }, 100);
    },
    [onOpenView],
  );

  const diffCfg = getDifficultyConfig(exercise.difficulty);
  return (
    <div className="flex flex-col gap-5 pb-6 mt-2">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-1"
      >
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0 pt-0.5">
            {/* [FIX #2] ID badge — muted, not electric green */}
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-xs font-semibold text-gray-500 mb-1.5">
              #{exercise.id}
            </span>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">
              {exercise.name}
            </h2>
            {/* [FIX #2] Difficulty as inline pill beside title, not floating dot */}
            <span
              className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg text-xs font-semibold ${diffCfg.bg} ${diffCfg.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${diffCfg.bar}`} />
              {diffCfg.label}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      {/* [FIX #3] Difficulty gets visual priority — wider, labeled properly */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="grid grid-cols-2 gap-2.5 px-1"
      >
        {/* Movement Pattern — full width to signal importance */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
            <Target className="h-4 w-4 text-gray-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Movement Pattern</p>
            <p className="text-sm font-bold text-gray-900">
              {getMovementPatternLabel(exercise.movementPattern)}
            </p>
          </div>
        </div>

        {/* Type */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-3.5 w-3.5 text-gray-400" />
            <p className="text-xs text-gray-400">Type</p>
          </div>
          <p className="text-sm font-bold text-gray-900">
            {exercise.isCompound ? "Compound" : "Isolation"}
          </p>
        </div>

        {/* Muscle focus count */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-3.5 w-3.5 text-gray-400" />
            <p className="text-xs text-gray-400">Focus</p>
          </div>
          <p className="text-sm font-bold text-gray-900">
            {exercise.isCompound ? "Multi-joint" : "Single-joint"}
          </p>
        </div>
      </motion.div>

      {/* ── Description ─────────────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        custom={0}
        className="px-1"
      >
        <SectionTitle icon={Info} title="คำอธิบาย" desc="Exercise Guide" />
        {/* [FIX #4] Tighter padding when content is short, readable text size */}
        <div className="bg-white rounded-3xl border border-gray-100 px-5 py-4 shadow-sm">
          <p className="text-sm text-gray-600 leading-relaxed">
            {exercise.description}
          </p>
        </div>
      </motion.section>

      {/* ── Media ────────────────────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        custom={1}
        className="px-1"
      >
        <DrawerMediaSection exercise={exercise} />
      </motion.section>

      {/* ── Muscles ──────────────────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        custom={2}
        className="px-1"
      >
        <MusclesSection exerciseId={exercise.id} />
      </motion.section>

      {/* ── Equipment ────────────────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        custom={3}
        className="px-1"
      >
        <EquipmentSection exerciseId={exercise.id} />
      </motion.section>

      {/* ── Substitutes ──────────────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        custom={4}
        className="px-1"
      >
        <SectionTitle
          icon={Sparkles}
          title="ท่าฝึกทดแทน"
          desc="AI Suggested Substitutes"
          count={substitutes?.length || 0}
        />
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {substitutesLoading ? (
            <SkeletonSubstitutes />
          ) : substitutesError ? (
            <p className="p-6 text-sm text-rose-500">{substitutesError}</p>
          ) : !substitutes || substitutes.length === 0 ? (
            // [FIX #7] Empty state with personality
            <div className="px-6 py-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-700 mb-1">
                ยังไม่มีท่าทดแทน
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                กดปุ่ม "แทนที่" ด้านล่าง
                <br />
                เพื่อให้ AI แนะนำท่าที่ใกล้เคียง
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {substitutes.map((s) => (
                <SubstituteRow
                  key={s.exercise.id}
                  s={s}
                  tappedId={tappedId}
                  onOpenView={handleOpenView}
                />
              ))}
            </div>
          )}
        </div>
      </motion.section>
    </div>
  );
}
