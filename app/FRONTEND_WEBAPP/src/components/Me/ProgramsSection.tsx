import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  ChevronDown,
  PlayCircle,
  PauseCircle,
  Loader2,
  XCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { userProgramsApi } from "../../services/userProgramsApi";
import type {
  UserProgram,
  UserProgramStatus,
} from "../../types/userProgram.types";

function getProgramName(p: UserProgram): string {
  return (
    p.program_name ||
    p.program?.program_name ||
    p.template_program?.program_name ||
    `Program #${p.id}`
  );
}


function getTotalWeeks(p: UserProgram) {
  return p.program?.duration_weeks || p.template_program?.duration_weeks;
}

function getDaysPerWeek(p: UserProgram) {
  return p.program?.days_per_week || p.template_program?.days_per_week;
}

function getProgress(p: UserProgram): number {
  const tw = getTotalWeeks(p);
  const dpw = getDaysPerWeek(p);
  if (!tw || !dpw) return 0;
  const total = tw * dpw;
  const done = (p.current_week - 1) * dpw + (p.current_day - 1);
  return Math.min(Math.round((done / total) * 100), 100);
}

function formatDate(iso?: string) {
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

function normalizeProgress(val: number | null | undefined): number {
  if (val == null) return 0;
  // Handle both 0-1 and 0-100 scales
  return val > 0 && val <= 1 ? Math.round(val * 100) : Math.round(val);
}


const scrollbarY =
  "overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-stone-200 [&::-webkit-scrollbar-thumb]:rounded-full";

const statusMeta: Record<
  UserProgramStatus,
  { label: string; bar: string; dot: string }
> = {
  ACTIVE: {
    label: "Active",
    bar: "bg-lime-500",
    dot: "bg-lime-500",
  },
  PAUSED: {
    label: "Paused",
    bar: "bg-amber-400",
    dot: "bg-amber-500",
  },
  COMPLETED: {
    label: "Completed",
    bar: "bg-sky-400",
    dot: "bg-sky-500",
  },
  CANCELLED: {
    label: "Cancelled",
    bar: "bg-gray-300",
    dot: "bg-gray-400",
  },
};

function CircularProgress({
  value,
  status,
}: {
  value: number;
  status: UserProgramStatus;
}) {
  const r = 18;
  const circ = 2 * Math.PI * r;

  return (
    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
      <svg
        className="absolute inset-0 -rotate-90"
        viewBox="0 0 40 40"
        fill="none"
      >
        <circle cx={20} cy={20} r={r} strokeWidth={2.5} stroke="#e7e5e4" />
        <motion.circle
          cx={20}
          cy={20}
          r={r}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (circ * value) / 100 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          stroke={
            status === "ACTIVE"
              ? "#84cc16"
              : status === "PAUSED"
                ? "#f59e0b"
                : "#38bdf8"
          }
        />
      </svg>
      <span className="relative text-xs font-semibold text-stone-600 tabular-nums">
        {value}%
      </span>
    </div>
  );
}

function ProgramCard({
  program: p,
  onUpdateProgress,
  isUpdating,
}: {
  program: UserProgram;
  onUpdateProgress: (
    id: number,
    data: {
      status?: UserProgramStatus;
      current_week?: number;
      current_day?: number;
    },
  ) => void;
  isUpdating: boolean;
}) {
  const [open, setOpen] = useState(false);

  // Fetch full details if scheduled_workouts is missing (common in list API)
  const { data: fullProgram } = useQuery({
    queryKey: ["user-program-detail", p.id],
    queryFn: () => userProgramsApi.getById(p.user_id, p.id),
    enabled: !p.scheduled_workouts || p.scheduled_workouts.length === 0,
    staleTime: 5 * 60 * 1000,
  });


  const displayProgram = fullProgram || p;

  const progress =
    displayProgram.completion_rate != null
      ? normalizeProgress(displayProgram.completion_rate)
      : getProgress(displayProgram);

  const tw = getTotalWeeks(displayProgram);
  const dpw = getDaysPerWeek(displayProgram);
  const meta = statusMeta[displayProgram.status];


  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)] border border-stone-100/80 transition-all duration-200 hover:shadow-[0_2px_4px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.06)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left focus:outline-none cursor-pointer active:scale-[0.99] transition-transform"
      >
        <div className="flex items-center gap-4 p-5">
          <CircularProgress value={progress} status={p.status} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-medium text-stone-500 uppercase ">
                {meta.label}
              </span>
              {tw && dpw && (
                <span className="text-xs font-medium text-stone-400">
                  W{p.current_week}/{tw} · D{p.current_day}/{dpw}
                </span>
              )}
            </div>
            <h4 className="text-base font-semibold text-stone-900 truncate">
              {getProgramName(displayProgram)}
            </h4>

          </div>

          <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 text-stone-500">
            <motion.div
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </div>
        </div>

        {tw && dpw && (
          <div className="px-5 pb-5">
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: tw * dpw }).map((_, i) => {
                const scheduled = displayProgram.scheduled_workouts?.[i];
                const done =
                  Math.min(
                    (displayProgram.current_week - 1) * dpw + (displayProgram.current_day - 1),
                    tw * dpw,
                  ) > i;
                const current =
                  (displayProgram.current_week - 1) * dpw + (displayProgram.current_day - 1) === i &&
                  displayProgram.status !== "COMPLETED";

                let dotColor = "bg-stone-100";

                if (scheduled) {
                  switch (scheduled.status) {
                    case "COMPLETED":
                      dotColor = "bg-lime-500";
                      break;
                    case "MISSED":
                      dotColor = "bg-rose-500";
                      break;
                    case "SKIPPED":
                      dotColor = "bg-amber-500";
                      break;
                    case "SCHEDULED":
                      dotColor = "bg-stone-100";
                      break;
                    default:
                      dotColor = "bg-stone-100";
                  }
                } else if (done) {
                  dotColor = meta.bar;
                } else if (current) {
                  dotColor = "bg-lime-300 ring-1 ring-lime-400";
                }

                return (
                  <div
                    key={i}
                    className={`h-1 w-1.5 rounded-sm transition-colors ${dotColor}`}
                  />
                );
              })}
            </div>
          </div>
        )}

      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-stone-100 bg-stone-50/50"
          >
            <div className="px-5 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <p className="text-xs font-medium text-stone-500 uppercase  mb-1">
                    ผู้กำหนด
                  </p>
                  <p className="text-xs font-medium text-stone-800 truncate">
                    {displayProgram.assigned_by?.name || "ระบบ"}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <p className="text-xs font-medium text-stone-500 uppercase  mb-1">
                    วันที่เริ่ม
                  </p>
                  <p className="text-xs font-medium text-stone-800 truncate">
                    {displayProgram.start_date ? formatDate(displayProgram.start_date) : "-"}
                  </p>
                </div>
              </div>

              {displayProgram.notes && (
                <div className="rounded-xl bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <p className="text-xs font-medium text-stone-500 uppercase  mb-1">
                    โน้ต
                  </p>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {displayProgram.notes}
                  </p>
                </div>
              )}


              {p.status !== "COMPLETED" && (
                <div className="flex flex-wrap gap-2">
                  {progress === 0 && p.status === "ACTIVE" && (
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateProgress(p.id, {
                          current_week: 1,
                          current_day: 1,
                        })
                      }
                      disabled={isUpdating}
                      className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-lime-500 text-white font-medium text-xs cursor-pointer transition-all duration-200 hover:bg-lime-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-lime-500"
                    >
                      {isUpdating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        "เริ่มโปรแกรม"
                      )}
                    </button>
                  )}
                  {p.status === "ACTIVE" && (
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateProgress(p.id, { status: "PAUSED" })
                      }
                      disabled={isUpdating}
                      className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-700 font-medium text-xs cursor-pointer transition-all duration-200 hover:bg-stone-50 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                    >
                      {isUpdating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <PauseCircle className="h-3.5 w-3.5" />
                          หยุดชั่วคราว
                        </>
                      )}
                    </button>
                  )}
                  {p.status === "PAUSED" && (
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateProgress(p.id, { status: "ACTIVE" })
                      }
                      disabled={isUpdating}
                      className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-lime-500 text-white font-medium text-xs cursor-pointer transition-all duration-200 hover:bg-lime-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-lime-500"
                    >
                      {isUpdating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <PlayCircle className="h-3.5 w-3.5" />
                          ดำเนินการต่อ
                        </>
                      )}
                    </button>
                  )}
                  {p.status !== "CANCELLED" && (
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateProgress(p.id, { status: "CANCELLED" })
                      }
                      disabled={isUpdating}
                      className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-rose-50 text-rose-500 font-medium text-xs cursor-pointer transition-all duration-200 hover:bg-rose-100 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-rose-50"
                    >
                      {isUpdating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="h-3.5 w-3.5" />
                          ยกเลิกโปรแกรม
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ProgramsSectionProps {
  programs: UserProgram[];
  isLoading: boolean;
  onUpdateProgress: (
    id: number,
    data: {
      status?: UserProgramStatus;
      current_week?: number;
      current_day?: number;
    },
  ) => void;
  isUpdating: boolean;
}

export default function ProgramsSection({
  programs,
  isLoading,
  onUpdateProgress,
  isUpdating,
}: ProgramsSectionProps) {
  const [filter, setFilter] = useState<UserProgramStatus>("ACTIVE");

  const filtered = programs.filter((p) => p.status === filter);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)] border border-stone-100/80 transition-all duration-300 h-full flex flex-col">
      <div className="flex flex-col gap-4 mb-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-stone-900  flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-stone-500" />
            โปรแกรมของฉัน
          </h2>
          {programs.length > 0 && (
            <span className="text-xs font-medium text-stone-500 tabular-nums">
              {programs.length} ทั้งหมด
            </span>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-stone-50 border border-stone-100/50">
          {(["ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"] as UserProgramStatus[]).map((st) => {
            const count = programs.filter(p => p.status === st).length;
            const active = filter === st;
            const meta = statusMeta[st];

            return (
              <button
                key={st}
                type="button"
                onClick={() => setFilter(st)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-bold uppercase  transition-all duration-200 cursor-pointer ${active
                  ? "bg-white text-stone-900 shadow-sm ring-1 ring-stone-200/50"
                  : "text-stone-400 hover:text-stone-600"
                  }`}
              >
                <div className={`h-1.5 w-1.5 rounded-full ${meta.dot} ${active ? "opacity-100" : "opacity-40"}`} />
                {meta.label}
                {count > 0 && (
                  <span className={`px-1 rounded-md text-xs ${active ? "bg-stone-100" : "bg-stone-200/50"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-24 rounded-xl bg-stone-50 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-xl bg-stone-50/60 border border-stone-100 h-full">
            <TrendingUp className="h-10 w-10 text-stone-300 mb-4" />
            <p className="text-sm font-medium text-stone-700">
              ไม่พบโปรแกรมสถานะ {statusMeta[filter].label}
            </p>
            <p className="mt-1 text-xs text-stone-500 max-w-[200px] leading-relaxed">
              {filter === 'ACTIVE'
                ? "ไปที่หน้า Programs เพื่อสำรวจและเพิ่มโปรแกรมใหม่"
                : `คุณไม่มีโปรแกรมที่อยู่ในสถานะ ${statusMeta[filter].label.toLowerCase()} ในขณะนี้`}
            </p>
          </div>
        ) : (
          <div className={`space-y-3 max-h-[420px] ${scrollbarY}`}>
            {filtered.map((p) => (
              <ProgramCard
                key={p.id}
                program={p}
                onUpdateProgress={onUpdateProgress}
                isUpdating={isUpdating}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
