import {
  AlertCircle,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  Clock,
  Info,
  ListChecks,
  Target,
  UserCheck,
} from "lucide-react";
import { SectionTitle } from "../ui";
import type { ProgramDetail } from "../../types/program.types";
import {
  type ProgramDisplay,
  getDifficultyLabel,
  getGoalLabel,

} from "../../utils/programs.utils";

import type { DifficultyLevel } from "../../types/program.types";

interface ProgramViewDrawerContentProps {
  selectedProgram: ProgramDisplay | null;
  programDetail: ProgramDetail | null;
  loadingDetail: boolean;
  canSelfAssign?: boolean;
  onSelfAssign?: () => void;
  selfAssignLoading?: boolean;
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------
function ProgramDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex gap-1.5">
            <div className="h-4 w-16 rounded-md bg-gray-100" />
            <div className="h-4 w-20 rounded-md bg-gray-100" />
          </div>
          <div className="h-5 w-44 rounded-full bg-gray-100" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-[72px] rounded-xl bg-gray-100" />
        ))}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <div className="h-4 w-32 rounded-full bg-gray-100" />
        <div className="rounded-xl bg-gray-50 p-4 space-y-2">
          <div className="h-3 w-full rounded-full bg-gray-100" />
          <div className="h-3 w-5/6 rounded-full bg-gray-100" />
          <div className="h-3 w-3/4 rounded-full bg-gray-100" />
        </div>
      </div>

      {/* Sessions */}
      {[...Array(2)].map((_, i) => (
        <div key={i} className="h-28 rounded-2xl bg-gray-100" />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Difficulty helpers
// ---------------------------------------------------------------------------
const difficultyConfig: Record<
  DifficultyLevel,
  { bg: string; text: string; dot: string }
> = {
  beginner: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-400",
  },
  intermediate: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-400",
  },
  advanced: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-400" },
};

function DifficultyBadge({ difficulty }: { difficulty: DifficultyLevel }) {
  const cfg = difficultyConfig[difficulty] ?? difficultyConfig.beginner;
  return (
    <span
      className={`inline-flex items-center gap-1 h-5 px-2 rounded-md text-xs font-bold uppercase ${cfg.bg} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {getDifficultyLabel(difficulty)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------
function StatCard({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 flex flex-col items-center text-center gap-1">
      <Icon className="h-4 w-4 text-gray-300" />
      <span className="text-[10px] font-bold text-gray-400 uppercase  leading-none">
        {label}
      </span>
      <div className="flex items-baseline gap-0.5">
        <span className="text-sm font-bold text-gray-900 leading-none">
          {value}
        </span>
        {unit && (
          <span className="text-[10px] font-semibold text-gray-400 leading-none">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Exercise Row
// ---------------------------------------------------------------------------
function ExerciseRow({
  name,
  sets,
  reps,
  weight,
}: {
  name: string;
  sets: number;
  reps: number;
  weight?: number | null;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <div className="flex items-center gap-2 min-w-0">
        <CheckSquare className="h-3 w-3 text-gray-200 shrink-0" />
        <span className="text-xs font-semibold text-gray-700 truncate">
          {name}
        </span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="inline-flex items-center h-5 px-2 rounded-md bg-gray-100 text-[11px] font-bold text-gray-600">
          {sets} × {reps}
        </span>
        {weight != null && (
          <span className="inline-flex items-center h-5 px-2 rounded-md bg-lime-50 text-[11px] font-bold text-lime-700">
            {weight} kg
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export function ProgramViewDrawerContent({
  selectedProgram,
  programDetail,
  loadingDetail,
  canSelfAssign,
  onSelfAssign,
  selfAssignLoading,
}: ProgramViewDrawerContentProps) {
  // ── Empty state ────────────────────────────────────────────────────────────
  if (!selectedProgram) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
          <ClipboardList className="h-6 w-6 text-gray-200" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold text-gray-400 uppercase ">
            No program selected
          </p>
          <p className="text-xs text-gray-300">เลือกโปรแกรมเพื่อดูรายละเอียด</p>
        </div>
      </div>
    );
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loadingDetail) {
    return <ProgramDetailSkeleton />;
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (!programDetail) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-rose-400" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-gray-500">
            โหลดรายละเอียดไม่สำเร็จ
          </p>
          <p className="text-xs text-gray-400">กรุณาลองใหม่อีกครั้ง</p>
        </div>
      </div>
    );
  }

  const sessionCount = programDetail.sessions?.length ?? 0;

  // ── Main content ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="shrink-0 relative">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
            <ClipboardList className="h-6 w-6 text-gray-400" />
          </div>
          {/* Active dot */}
          <span
            title={selectedProgram.isActive ? "Active" : "Inactive"}
            className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white transition-colors ${selectedProgram.isActive ? "bg-lime-400" : "bg-gray-200"
              }`}
          />
        </div>

        {/* Meta + self-assign */}
        <div className="min-w-0 flex-1 pt-0.5">
          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            <DifficultyBadge
              difficulty={selectedProgram.difficulty as DifficultyLevel}
            />
            <span className="inline-flex items-center h-5 px-2 rounded-md bg-sky-50 text-xs font-bold text-sky-700 uppercase">
              {getGoalLabel(selectedProgram.goal)}
            </span>
            {selectedProgram.isTemplate && (
              <span className="inline-flex items-center h-5 px-2 rounded-md bg-violet-50 text-xs font-bold text-violet-700 uppercase">
                Template
              </span>
            )}
          </div>

          {/* Title — allow 2 lines, full title in title attr for a11y */}
          <div className="flex items-start gap-3">
            <h2
              className="flex-1 text-base font-bold text-gray-900 leading-snug line-clamp-2"
              title={selectedProgram.name}
            >
              {selectedProgram.name}
            </h2>
            {canSelfAssign && selectedProgram.isTemplate && (
              <button
                type="button"
                onClick={onSelfAssign}
                disabled={selfAssignLoading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-lime-500 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-lime-600 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <UserCheck className="h-3.5 w-3.5" />
                ใช้โปรแกรมนี้
              </button>
            )}
          </div>

          {programDetail.start_date && (
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">START:</span>
              <span className="text-[11px] font-bold text-lime-600 bg-lime-50 px-2 py-0.5 rounded-full border border-lime-100">
                {new Date(programDetail.start_date).toLocaleDateString('th-TH', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── STATS ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={Clock}
          label="Duration"
          value={selectedProgram.durationWeeks}
          unit="สัปดาห์"
        />
        <StatCard
          icon={UserCheck}
          label="Frequency"
          value={selectedProgram.daysPerWeek}
          unit="วัน/สัปดาห์"
        />
        <StatCard
          icon={ListChecks}
          label="Sessions"
          value={sessionCount}
          unit="วันฝึก"
        />
      </div>

      {/* ── DESCRIPTION ────────────────────────────────────────────────────── */}
      {selectedProgram.description && (
        <div className="space-y-2">
          <SectionTitle icon={Info} title="รายละเอียดโปรแกรม" />
          <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {selectedProgram.description}
            </p>
          </div>
        </div>
      )}

      {/* ── SESSIONS ───────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <SectionTitle
          icon={CalendarDays}
          title={`รายการวันฝึก (${sessionCount})`}
        />

        {sessionCount === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 p-6 flex flex-col items-center gap-2 text-center">
            <Target className="h-5 w-5 text-gray-200" />
            <p className="text-xs font-semibold text-gray-400">
              ยังไม่มีวันฝึกในโปรแกรมนี้
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Group by weeks if day_number > 7 */}
            {(() => {
              const sessions = [...(programDetail.sessions ?? [])].sort((a, b) => a.day_number - b.day_number);
              const elements: React.ReactNode[] = [];
              let currentWeek = -1;

              sessions.forEach((session, sIdx) => {
                const weekNum = Math.floor((session.day_number - 1) / 7) + 1;
                const isNewWeek = weekNum !== currentWeek;

                if (isNewWeek && sessions.length > 7) {
                  currentWeek = weekNum;
                  elements.push(
                    <div key={`week-${weekNum}`} className="flex items-center gap-2 py-2">
                      <span className="h-px flex-1 bg-gray-100" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">
                        สัปดาห์ที่ {weekNum}
                      </span>
                      <span className="h-px flex-1 bg-gray-100" />
                    </div>
                  );
                }

                // Slot within the 7-day window (1-indexed)
                const slotInWindow = session.day_of_week ?? ((session.day_number - 1) % 7 + 1);
                const dayLabel = `วันที่ ${slotInWindow}`;

                elements.push(
                  <div
                    key={session.id ?? sIdx}
                    className="group relative rounded-2xl border border-gray-100 bg-white overflow-hidden
                                transition-all duration-200 hover:border-lime-200 hover:shadow-md"
                  >
                    <div className="absolute left-0 inset-y-0 w-1 bg-lime-400 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="p-4">
                      {/* Session header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 shrink-0">
                            <span className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-1">
                              DAY
                            </span>
                            <span className="text-sm font-bold text-gray-700 leading-none">
                              {slotInWindow}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 leading-tight">
                              {session.session_name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold text-lime-600 uppercase">
                                {session.workout_split}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-gray-200" />
                              <span className="text-[10px] font-semibold text-gray-400">
                                {dayLabel}
                              </span>
                            </div>
                          </div>
                        </div>

                        <span className="shrink-0 inline-flex items-center h-5 px-2 rounded-full bg-gray-50 border border-gray-100 text-[10px] font-bold text-gray-400">
                          {session.exercises?.length ?? 0} ท่า
                        </span>
                      </div>

                      {/* Notes */}
                      {session.notes && (
                        <div className="mb-3 px-3 py-2 rounded-lg bg-gray-50/50 border border-gray-100">
                          <p className="text-[11px] text-gray-500 italic leading-relaxed">
                            "{session.notes}"
                          </p>
                        </div>
                      )}

                      {/* Exercise list */}
                      {session.exercises && session.exercises.length > 0 && (
                        <div className="border-t border-gray-50 pt-2 space-y-0.5">
                          {session.exercises
                            .slice()
                            .sort((a, b) => a.order_sequence - b.order_sequence)
                            .map((ex, eIdx) => (
                              <ExerciseRow
                                key={ex.id ?? eIdx}
                                name={ex.exercise_name ?? `ท่าฝึกที่ ${ex.order_sequence}`}
                                sets={ex.sets}
                                reps={ex.reps}
                                weight={ex.weight}
                              />
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              });
              return elements;
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
