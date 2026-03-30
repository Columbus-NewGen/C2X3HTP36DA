import {
  CalendarDays,
  Clock,
  Copy,
  MoreHorizontal,
  Pencil,
  ListCheck,
  Trash2,
  UserPlus,
  Plus,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "../../utils/cn";
import type { DifficultyLevel } from "../../types/program.types";
import {
  type ProgramDisplay,
  getGoalLabel,
  formatDate,
} from "../../utils/programs.utils";

// ─── Design tokens ─────────────────────────────────────────────────────────
const DIFFICULTY_STYLES: Record<
  DifficultyLevel,
  { dot: string; badge: string; label: string }
> = {
  beginner: {
    dot: "bg-emerald-400",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
    label: "Beginner",
  },
  intermediate: {
    dot: "bg-amber-400",
    badge: "bg-amber-50 text-amber-700 border-amber-100",
    label: "Intermediate",
  },
  advanced: {
    dot: "bg-rose-400",
    badge: "bg-rose-50 text-rose-600 border-rose-100",
    label: "Advanced",
  },
};

interface ProgramListProps {
  programs: ProgramDisplay[];
  hasAnyPrograms: boolean;
  searchQuery: string;
  difficultyFilter: DifficultyLevel | "ALL";
  templateFilter: boolean | "ALL";
  onOpenView: (id: number) => void;
  onOpenAssign: (program: ProgramDisplay) => void;
  onOpenEdit: (id: number) => void;
  onClone: (id: number) => void;
  onDelete: (id: number) => void;
  onOpenCreate?: () => void;
  canManage?: boolean;
}

// ─── Program List ───────────────────────────────────────────────────────────
export function ProgramList({
  programs,
  hasAnyPrograms,
  searchQuery,
  difficultyFilter,
  templateFilter,
  onOpenView,
  onOpenAssign,
  onOpenEdit,
  onClone,
  onDelete,
  onOpenCreate,
  canManage = false,
}: ProgramListProps) {
  const isFiltered =
    !!searchQuery || difficultyFilter !== "ALL" || templateFilter !== "ALL";

  if (!hasAnyPrograms) {
    return (
      // [FIX #8] Empty state — bigger icon, real CTA, more breathing room
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-8 py-16 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-100 bg-white">
          <ListCheck className="h-8 w-8 text-slate-300" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">
          {isFiltered ? "ไม่พบโปรแกรมที่ตรงกัน" : "ยังไม่มีโปรแกรม"}
        </h3>
        <p className="mt-2 text-sm text-slate-400">
          {isFiltered
            ? "ลองปรับตัวกรองหรือคำค้นหา"
            : "เริ่มต้นด้วยการสร้างโปรแกรมแรกของคุณ"}
        </p>
        {!isFiltered && onOpenCreate && (
          <button
            type="button"
            onClick={onOpenCreate}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            สร้างโปรแกรม
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl md:border md:border-slate-100 md:bg-white md:p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {programs.map((program) => (
          <ProgramCard
            key={program.id}
            program={program}
            onOpenView={onOpenView}
            onOpenAssign={onOpenAssign}
            onOpenEdit={onOpenEdit}
            onClone={onClone}
            onDelete={onDelete}
            canManage={canManage}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Program Card ───────────────────────────────────────────────────────────
interface ProgramCardProps {
  program: ProgramDisplay;
  onOpenView: (id: number) => void;
  onOpenAssign: (program: ProgramDisplay) => void;
  onOpenEdit: (id: number) => void;
  onClone: (id: number) => void;
  onDelete: (id: number) => void;
  canManage?: boolean;
}

const ProgramCard = ({
  program,
  onOpenView,
  onOpenAssign,
  onOpenEdit,
  onClone,
  onDelete,
  canManage = false,
}: ProgramCardProps) => {
  const diff =
    DIFFICULTY_STYLES[program.difficulty] ?? DIFFICULTY_STYLES.beginner;

  return (
    // [FIX #1] Root is <div> — no nested <button> inside <button>
    // Overlay anchor covers the card for click-to-view
    // [FIX #4] Hover = border shift only, no translate, no shadow jump
    <div className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 hover:border-slate-300 transition-colors">
      {/* Invisible overlay for card click — sits between text (z-10) and actions (z-30) */}
      <button
        type="button"
        aria-label={`ดูโปรแกรม ${program.name}`}
        onClick={() => onOpenView(program.id)}
        className="absolute inset-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1 z-20"
      />

      {/* All visible content sits on z-10 so it renders below the overlay layer */}
      <div className="relative z-10 flex flex-col gap-3">
        <CardHeader program={program} diff={diff} />
        <CardMeta program={program} diff={diff} />
      </div>

      {/* Actions float top-right, z-30 so they intercept clicks before the z-20 overlay */}
      {canManage && (
        <div className="absolute top-3 right-3 z-30">
          {/* Desktop: icon row */}
          <div className="hidden md:flex items-center gap-1">
            <IconButton label="มอบหมาย" onClick={() => onOpenAssign(program)}>
              <UserPlus className="h-3.5 w-3.5" />
            </IconButton>
            <IconButton label="คัดลอก" onClick={() => onClone(program.id)}>
              <Copy className="h-3.5 w-3.5" />
            </IconButton>
            <IconButton label="แก้ไข" onClick={() => onOpenEdit(program.id)}>
              <Pencil className="h-3.5 w-3.5" />
            </IconButton>
            <IconButton
              label="ลบ"
              tone="danger"
              onClick={() => onDelete(program.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </IconButton>
          </div>

          {/* Mobile: 3-dot menu [FIX #7] */}
          <MobileMenu
            program={program}
            onOpenAssign={onOpenAssign}
            onOpenEdit={onOpenEdit}
            onClone={onClone}
            onDelete={onDelete}
          />
        </div>
      )}
    </div>
  );
};

// ─── Card Header ─────────────────────────────────────────────────────────────
// [FIX #3] Clear hierarchy: title large+bold, goal small+muted
function CardHeader({
  program,
  diff,
}: {
  program: ProgramDisplay;
  diff: (typeof DIFFICULTY_STYLES)[DifficultyLevel];
}) {
  return (
    <div className="flex items-start gap-3 pr-10 md:pr-28">
      {/* Icon */}
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
        <ListCheck className="h-5 w-5 text-slate-500" />
        {/* [FIX #2,#3] Difficulty dot on icon — semantic, not a rainbow pill */}
        <span
          className={cn(
            "absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white",
            diff.dot,
          )}
        />
      </div>

      <div className="min-w-0 flex-1">
        {/* Template badge inline — slate, not violet */}
        {program.isTemplate && (
          <span className="inline-flex items-center mb-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
            Template
          </span>
        )}
        {/* [FIX #3] title = text-base, heavier */}
        <h3 className="text-base font-bold leading-snug text-slate-900 line-clamp-2 pr-1">
          {program.name}
        </h3>
        {/* [FIX #3] goal = text-xs, muted */}
        <p className="mt-0.5 text-xs font-medium text-slate-400 line-clamp-1">
          {getGoalLabel(program.goal)}
          {program.description && (
            <span className="hidden sm:inline"> · {program.description}</span>
          )}
        </p>
      </div>
    </div>
  );
}

// ─── Card Meta ───────────────────────────────────────────────────────────────
// [FIX #3.2] Meta row: 2 pills max + date flush right. No pill overload.
function CardMeta({
  program,
  diff,
}: {
  program: ProgramDisplay;
  diff: (typeof DIFFICULTY_STYLES)[DifficultyLevel];
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <MetaPill
        icon={CalendarDays}
        label={`${program.durationWeeks} สัปดาห์`}
      />
      <MetaPill icon={Clock} label={`${program.daysPerWeek} วัน/สัปดาห์`} />
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold",
          diff.badge,
        )}
      >
        {diff.label}
      </span>
      {/* Date — hidden on mobile, shown on sm+ flush right */}
      <span className="hidden sm:block ml-auto text-xs text-slate-300 shrink-0">
        {formatDate(program.updatedAt)}
      </span>
    </div>
  );
}

// ─── Mobile Menu ─────────────────────────────────────────────────────────────
// [FIX #7] 3-dot dropdown for mobile — no hidden actions
function MobileMenu({
  program,
  onOpenAssign,
  onOpenEdit,
  onClone,
  onDelete,
}: {
  program: ProgramDisplay;
  onOpenAssign: (p: ProgramDisplay) => void;
  onOpenEdit: (id: number) => void;
  onClone: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="md:hidden">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 transition-colors"
        aria-label="เพิ่มเติม"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden z-30">
          <MenuItem
            icon={UserPlus}
            label="มอบหมาย"
            onClick={() => {
              onOpenAssign(program);
              setOpen(false);
            }}
          />
          <MenuItem
            icon={Copy}
            label="คัดลอก"
            onClick={() => {
              onClone(program.id);
              setOpen(false);
            }}
          />
          <MenuItem
            icon={Pencil}
            label="แก้ไข"
            onClick={() => {
              onOpenEdit(program.id);
              setOpen(false);
            }}
          />
          <MenuItem
            icon={Trash2}
            label="ลบ"
            tone="danger"
            onClick={() => {
              onDelete(program.id);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  tone = "default",
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  tone?: "default" | "danger";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-slate-50",
        tone === "danger" ? "text-rose-500 hover:bg-rose-50" : "text-slate-700",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </button>
  );
}

// ─── Icon Button ─────────────────────────────────────────────────────────────
// [FIX #5] h-9 w-9, rounded-xl, consistent focus ring
interface IconButtonProps {
  children: React.ReactNode;
  label: string;
  tone?: "default" | "danger";
  onClick: () => void;
}

const IconButton = ({
  children,
  label,
  tone = "default",
  onClick,
}: IconButtonProps) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className={cn(
      "inline-flex h-8 w-8 items-center justify-center rounded-xl border bg-white transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
      tone === "danger"
        ? "border-rose-100 text-rose-400 hover:bg-rose-50 hover:text-rose-600 focus-visible:ring-rose-300"
        : "border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-700 focus-visible:ring-slate-300",
    )}
  >
    {children}
  </button>
);

// ─── Meta Pill ───────────────────────────────────────────────────────────────
interface MetaPillProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  className?: string;
}

const MetaPill = ({ icon: Icon, label, className }: MetaPillProps) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600",
      className,
    )}
  >
    <Icon className="h-3 w-3 text-slate-400" />
    {label}
  </span>
);
