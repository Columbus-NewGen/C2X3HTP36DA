// ExerciseList.tsx — Card Grid layout (C)
// Desktop md+: 2–3 col grid with image on top
// Mobile: single-column list rows

import { useState } from "react";
import {
  Pencil,
  Trash2,
  MoreVertical,
  Activity,
  Layers,
  Zap,
} from "lucide-react";
import { cn } from "../../utils/cn";
import type { ExerciseDisplay } from "../../types/exercise.types";

// ─── Config ───────────────────────────────────────────────────────────────────
const PATTERN_LABEL: Record<string, string> = {
  push: "Push",
  pull: "Pull",
  squat: "Squat",
  hinge: "Hinge",
  carry: "Carry",
  rotation: "Rotation",
};

const DIFFICULTY_CFG: Record<string, { label: string; style: string }> = {
  beginner: {
    label: "Beginner",
    style: "text-lime-700 bg-lime-50 border-lime-200",
  },
  intermediate: {
    label: "Intermediate",
    style: "text-amber-700 bg-amber-50 border-amber-200",
  },
  advanced: {
    label: "Advanced",
    style: "text-rose-700 bg-rose-50 border-rose-200",
  },
};

function formatShortDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
}

// ─── Shared dropdown menu ─────────────────────────────────────────────────────
function ActionMenu({
  show,
  onToggle,
  onEdit,
  onDelete,
  overlayClass = "right-0 top-full mt-1.5",
}: {
  show: boolean;
  onToggle: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  overlayClass?: string;
}) {
  return (
    <div
      className={cn("relative", show ? "z-[60]" : "z-20")}
      onClick={(e) => e.stopPropagation()}
    >
      {show && (
        <div
          className="fixed inset-0 z-40"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(e);
          }}
        />
      )}
      <button
        onClick={onToggle}
        className={cn(
          "w-8 h-8 flex items-center justify-center rounded-xl border transition-all active:scale-95",
          show
            ? "bg-gray-900 border-gray-900 text-white shadow-lg"
            : "bg-white/90 backdrop-blur-sm border-white/50 text-gray-500 hover:bg-white hover:text-gray-900 shadow-sm",
        )}
      >
        <MoreVertical size={14} />
      </button>
      {show && (
        <div
          className={cn(
            "absolute w-44 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 py-1.5 overflow-hidden",
            overlayClass,
          )}
        >
          <button
            onClick={onEdit}
            className="w-full px-3 py-2.5 flex items-center gap-2.5 hover:bg-gray-50 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
              <Pencil size={13} />
            </div>
            <span className="text-xs font-bold text-gray-700">แก้ไขท่าฝึก</span>
          </button>
          <div className="mx-3 my-1 h-px bg-gray-100" />
          <button
            onClick={onDelete}
            className="w-full px-3 py-2.5 flex items-center gap-2.5 hover:bg-rose-50 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-400 flex-shrink-0">
              <Trash2 size={13} />
            </div>
            <span className="text-xs font-bold text-rose-500">ลบท่าฝึก</span>
          </button>
        </div>
      )}
    </div>
  );
}

interface ItemProps {
  exercise: ExerciseDisplay;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  canManage?: boolean;
}

// ─── Desktop: Card ────────────────────────────────────────────────────────────
function ExerciseCard({ exercise, onView, onEdit, onDelete, canManage }: ItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const diff = DIFFICULTY_CFG[exercise.difficulty] ?? {
    label: exercise.difficulty,
    style: "text-gray-500 bg-gray-50 border-gray-100",
  };

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu((p) => !p);
  };
  const edit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit(exercise.id);
  };
  const del = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete(exercise.id);
  };

  return (
    <div
      onClick={() => onView(exercise.id)}
      className="group relative bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-lime-500/5 hover:border-lime-200 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col p-4"
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0">
        {exercise.image ? (
          <img
            src={exercise.image}
            alt={exercise.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <Activity className="w-10 h-10 text-gray-200" />
          </div>
        )}
        {/* Difficulty — top left */}
        <span
          className={cn(
            "absolute top-3 left-3 text-[11px] font-bold px-3 py-1 rounded-xl border shadow-sm backdrop-blur-md",
            diff.style,
          )}
        >
          {diff.label}
        </span>
        {/* Menu — top right */}
        {canManage && (
          <div className="absolute top-2 right-2">
            <ActionMenu
              show={showMenu}
              onToggle={toggle}
              onEdit={edit}
              onDelete={del}
              overlayClass="right-0 top-full mt-1.5"
            />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 py-4 gap-2">
        <span className="text-xs font-bold text-lime-600 uppercase tracking-wider">
          {PATTERN_LABEL[exercise.movementPattern] ?? exercise.movementPattern}
        </span>

        <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-lime-600 transition-colors line-clamp-1">
          {exercise.name}
        </h3>

        {exercise.description && (
          <p className="text-sm font-medium text-gray-400 leading-relaxed line-clamp-2 flex-1">
            {exercise.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-tight",
              exercise.isCompound ? "text-violet-600" : "text-gray-400",
            )}
          >
            {exercise.isCompound ? (
              <>
                <Layers size={14} className="flex-shrink-0" />
                Compound
              </>
            ) : (
              <>
                <Zap size={14} className="flex-shrink-0" />
                Isolated
              </>
            )}
          </span>
          <span className="text-xs font-bold text-gray-300 tabular-nums">
            {formatShortDate(exercise.updatedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Mobile: Row ──────────────────────────────────────────────────────────────
function ExerciseRow({ exercise, onView, onEdit, onDelete, canManage }: ItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const diff = DIFFICULTY_CFG[exercise.difficulty] ?? {
    label: exercise.difficulty,
    style: "text-gray-500 bg-gray-50 border-gray-100",
  };

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu((p) => !p);
  };
  const edit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit(exercise.id);
  };
  const del = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete(exercise.id);
  };

  return (
    <div
      onClick={() => onView(exercise.id)}
      className="relative border-b border-gray-100 last:border-none hover:bg-gray-50/60 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-3 px-3 py-3.5 sm:gap-4 sm:px-5 sm:py-5">
        {/* Thumbnail */}
        <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-[1.5rem] overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
          {exercise.image ? (
            <img
              src={exercise.image}
              alt={exercise.name}
              className="w-full h-full object-cover transition-transform group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Activity className="w-8 h-8 text-gray-200" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-widest text-lime-600">
              {PATTERN_LABEL[exercise.movementPattern] ??
                exercise.movementPattern}
            </span>
            <span className="text-gray-200">·</span>
            <span
              className={cn(
                "text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border",
                diff.style,
              )}
            >
              {diff.label}
            </span>
          </div>
          <h3 className="text-sm sm:text-lg font-bold text-gray-900 truncate leading-tight">
            {exercise.name}
          </h3>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
            <span
              className={cn(
                "font-bold uppercase tracking-wider",
                exercise.isCompound ? "text-violet-600" : "text-gray-400",
              )}
            >
              {exercise.isCompound ? "Compound" : "Isolated"}
            </span>
            <span className="text-gray-200">·</span>
            <span className="tabular-nums font-bold text-gray-300/80">
              {formatShortDate(exercise.updatedAt)}
            </span>
          </div>
        </div>

        {/* Menu */}
        {canManage && (
          <ActionMenu
            show={showMenu}
            onToggle={toggle}
            onEdit={edit}
            onDelete={del}
            overlayClass="right-0 top-full mt-2"
          />
        )}
      </div>
    </div>
  );
}

// ─── List wrapper ─────────────────────────────────────────────────────────────
interface ListProps {
  exercises: ExerciseDisplay[];
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  canManage?: boolean;
}

export function ExerciseList({
  exercises,
  onView,
  onEdit,
  onDelete,
  canManage = false,
}: ListProps) {
  const props = { onView, onEdit, onDelete, canManage };
  return (
    <>
      {/* Mobile list */}
      <div className="md:hidden bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
        {exercises.map((ex) => (
          <ExerciseRow key={ex.id} exercise={ex} {...props} />
        ))}
      </div>

      {/* Tablet & Desktop grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-2 gap-6">
        {exercises.map((ex) => (
          <ExerciseCard key={ex.id} exercise={ex} {...props} />
        ))}
      </div>
    </>
  );
}
