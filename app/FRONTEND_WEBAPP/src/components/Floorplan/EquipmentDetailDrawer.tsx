import { memo, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Machine, MachineStatus } from "../../types/floorplan.types";
import {
  getDefaultMachineImage,
  getStatusColor,
  resolveImageUrl,
} from "../../utils/floorplan.utils";

type DrawerTab = "detail" | "exercises";

export interface EquipmentDetailDrawerProps {
  machine: Machine | null;
  isOpen: boolean;
  onClose: () => void;
}

/* ================= Utilities ================= */

const getMachineDisplayName = (machine: Machine) =>
  machine.label ||
  machine.equipment?.equipment_name ||
  `Machine #${machine.id}`;

const getMachineDisplayType = (machine: Machine) =>
  machine.equipment?.equipment_type ?? "Unknown Type";

const getMachineImageUrl = (machine: Machine) => {
  const displayType = getMachineDisplayType(machine);
  return (
    resolveImageUrl(machine.equipment?.image_full_url) ||
    resolveImageUrl(machine.images?.[0]?.url) ||
    getDefaultMachineImage(displayType)
  );
};

/* ================= UI Components ================= */

const TabHeader = memo(function TabHeader({
  activeTab,
  onTabChange,
}: {
  activeTab: DrawerTab;
  onTabChange: (tab: DrawerTab) => void;
}) {
  return (
    <div className="border-b border-gray-200 px-4 pb-3">
      <div className="flex gap-2 rounded-xl bg-gray-100 p-1 text-xs font-medium">
        <button
          onClick={() => onTabChange("detail")}
          className={`flex-1 rounded-lg px-3 py-1.5 transition-all font-bold ${activeTab === "detail"
            ? "bg-white text-lime-600 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
            }`}
        >
          ข้อมูลเครื่องเล่น
        </button>

        <button
          onClick={() => onTabChange("exercises")}
          className={`flex-1 rounded-lg px-3 py-1.5 transition-all font-bold ${activeTab === "exercises"
            ? "bg-white text-lime-600 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
            }`}
        >
          ท่าฝึกที่เกี่ยวข้อง
        </button>

        {/* <button
          onClick={() => onTabChange("flex")}
          className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-3 py-1.5 transition-all ${activeTab === "flex"
            ? "bg-lime-100 text-lime-700"
            : "text-gray-500 hover:text-gray-700"
            }`}
        >
          Flex
        </button> */}
      </div>
    </div>
  );
});

/**
 * StatusBadge — maps status to appropriate color, not hardcoded lime for everything.
 */
const StatusBadge = memo(function StatusBadge({
  status,
}: {
  status: MachineStatus | string | undefined;
}) {
  if (!status) return null;
  // Reuse the same getStatusColor util used on the canvas for consistency
  const color = getStatusColor(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${color.light} ${color.text}`}
    >
      <span className={`h-2 w-2 rounded-full ${color.bg}`} />
      {status}
    </span>
  );
});

/* ================= Detail Tab ================= */

const DetailTab = memo(function DetailTab({ machine }: { machine: Machine }) {
  const displayName = getMachineDisplayName(machine);
  const displayType = getMachineDisplayType(machine);
  const imageUrl = getMachineImageUrl(machine);
  const [isEnlarged, setIsEnlarged] = useState(false);

  return (
    <div className="flex h-full flex-col overflow-y-auto scrollbar-hide">
      {/* Lightbox Overlay */}
      <AnimatePresence>
        {isEnlarged && imageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsEnlarged(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md cursor-zoom-out"
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={imageUrl}
              alt={displayName}
              className="max-h-full max-w-full object-contain drop-shadow-2xl"
            />
            <button className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors">
              <X size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO IMAGE - Premium Refresh */}
      <div
        className="relative h-96 w-full bg-slate-50 flex items-center justify-center overflow-hidden cursor-zoom-in group/hero"
        onClick={() => setIsEnlarged(true)}
      >
        {/* Decorative accents */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-lime-400/10 rounded-full blur-[60px]" />

        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-60" />

        {imageUrl ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="relative z-10 w-full h-full flex items-center justify-center p-8"
          >
            <img
              src={imageUrl}
              alt={displayName}
              className="max-h-72 w-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.12)] transition-transform duration-700 group-hover/hero:scale-110"
            />
            <div className="absolute bottom-6 right-6 opacity-0 group-hover/hero:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm p-2 rounded-xl border border-slate-100 shadow-sm text-[10px] font-bold uppercase text-slate-500 tracking-widest">
              คลิกเพื่อขยาย
            </div>
          </motion.div>
        ) : (
          <Component className="w-20 h-20 text-slate-200" strokeWidth={1} />
        )}
      </div>

      {/* CONTENT */}
      <div className="flex flex-col gap-8 p-8">
        {/* TITLE & STATUS */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
              {displayName}
            </h2>
            <p className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-wider">{displayType}</p>
          </div>

          <div className="shrink-0 pt-0.5">
            <StatusBadge status={machine.status} />
          </div>
        </div>

        {/* SPECIFICATIONS - Pro Cards */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em]">
              TECHNICAL SPECS
            </h3>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-[1.5rem] p-5 border border-slate-100 transition-all hover:bg-white hover:shadow-md group">
              <span className="block text-[9px] font-bold text-slate-400 mb-2 uppercase tracking-widest group-hover:text-lime-500 transition-colors">Dimensions</span>
              <span className="text-sm font-bold text-slate-900 tabular-nums">
                {(machine.width / 100).toFixed(2)}m <span className="text-slate-300 mx-1">×</span> {(machine.height / 100).toFixed(2)}m
              </span>
            </div>
            <div className="bg-slate-50 rounded-[1.5rem] p-5 border border-slate-100 transition-all hover:bg-white hover:shadow-md group">
              <span className="block text-[9px] font-bold text-slate-400 mb-2 uppercase tracking-widest group-hover:text-lime-500 transition-colors">Floor Coordinates</span>
              <span className="text-sm font-bold text-slate-900 tabular-nums">
                <span className="text-slate-400 mr-0.5">X:</span>{(machine.position_x / 100).toFixed(1)} <span className="text-slate-300 mx-1">•</span> <span className="text-slate-400 mr-0.5">Y:</span>{(machine.position_y / 100).toFixed(1)}
              </span>
            </div>
            <div className="bg-slate-50 rounded-[1.5rem] p-5 border border-slate-100 col-span-2 flex justify-between items-center transition-all hover:bg-white hover:shadow-md group">
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-lime-500 transition-colors">Placement Rotation</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 tabular-nums">{machine.rotation || 0}°</span>
                <div className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center p-1.5 overflow-hidden">
                  <div className="w-1.5 h-full bg-slate-900 rounded-full" style={{ transform: `rotate(${machine.rotation || 0}deg)` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NOTES - If exists */}
        {machine.notes && (
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
            <p className="text-xs font-semibold text-amber-800 leading-relaxed italic">"{machine.notes}"</p>
          </div>
        )}
      </div>
    </div>
  );
});

/* ================= Exercises Tab ================= */
import { equipmentApi } from "../../services/EquipmentAPI";
import type { Exercise } from "../../types/exercise.types";
import { ChevronRight, Activity, Loader2, Component, X } from "lucide-react";
import { Link } from "react-router-dom";

const ExercisesTab = memo(function ExercisesTab({ machine }: { machine: Machine }) {
  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const eqId = machine.equipment_id || machine.equipment?.id;
    if (!eqId) {
      setExercises([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    equipmentApi.getExercises(eqId)
      .then(res => {
        setExercises(res.exercises || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load equipment exercises", err);
        setExercises([]);
        setLoading(false);
      });
  }, [machine.equipment_id, machine.equipment?.id]);

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-[11px] font-bold uppercase text-lime-600 ">
          ท่าฝึกที่ใช้เครื่องเล่นนี้
        </h3>
        <div className="h-px flex-1 bg-lime-100" />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-6 w-6 text-lime-500 animate-spin" />
          <p className="text-xs font-bold text-gray-400 uppercase">กำลังโหลด...</p>
        </div>
      ) : exercises?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Activity className="h-8 w-8 text-gray-200 mb-3" />
          <p className="text-sm font-bold text-gray-400">ไม่พบท่าฝึกที่เกี่ยวข้อง</p>
        </div>
      ) : (
        <div className="space-y-4">
          {exercises?.map((ex) => (
            <Link
              key={ex.id}
              to={`/exercises?id=${ex.id}&search=${encodeURIComponent(ex.exercise_name)}`}
              className="flex items-center gap-4 p-4 rounded-[2rem] bg-indigo-50/20 border border-indigo-100/30 hover:bg-white hover:border-lime-200 hover:shadow-xl hover:shadow-lime-500/5 transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white border border-slate-100 shrink-0 flex items-center justify-center relative shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-200/5" />
                {ex.image_url ? (
                  <img
                    src={resolveImageUrl(ex.image_url) || ""}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    alt={ex.exercise_name}
                  />
                ) : (
                  <Activity size={20} className="text-slate-200" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate group-hover:text-lime-600 transition-colors mb-0.5">
                  {ex.exercise_name}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{ex.movement_pattern}</span>
                  <div className="w-1 h-1 rounded-full bg-slate-200" />
                  <span className="text-[10px] text-lime-600 font-bold uppercase tracking-wider">{ex.movement_type}</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-lime-500 group-hover:text-white transition-all">
                <ChevronRight size={20} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
});
/* ================= Main Drawer ================= */

export function EquipmentDetailDrawer({
  machine,
  isOpen,
  onClose,
}: EquipmentDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<DrawerTab>("detail");

  useEffect(() => {
    setActiveTab("detail");
  }, [machine?.id]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  return (
    // AnimatePresence wraps the entire drawer so the exit animation plays correctly
    <AnimatePresence>
      {isOpen && machine && (
        <div className="pointer-events-none fixed inset-0 z-50 flex flex-col justify-end md:flex-row md:justify-end">
          {/* Backdrop */}
          <motion.div
            className="pointer-events-auto absolute inset-0 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-label="Close drawer"
          />

          {/* Drawer panel */}
          <motion.div
            className="pointer-events-auto relative flex h-[62dvh] w-full flex-col rounded-t-2xl border border-gray-200 bg-white shadow-2xl md:h-full md:w-96 md:rounded-l-2xl md:rounded-tr-none"
            initial={{ y: "100%", opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            // Desktop: slide in from right
            // Mobile: slide up from bottom
            // We achieve both by using y for mobile; on desktop the layout handles it
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 shrink-0">
              <div className="min-w-0">
                <p className="text-[10px] uppercase text-lime-600 font-bold ">
                  เครื่องเล่น
                </p>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {getMachineDisplayName(machine)}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-lime-400"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="pt-3 shrink-0">
              <TabHeader activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            {/* Tab content with per-tab animation */}
            <div className="flex-1 min-h-0 overflow-hidden relative">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeTab}
                  className="absolute inset-0"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.16 }}
                >
                  {activeTab === "detail" ? (
                    <DetailTab machine={machine} />
                  ) : activeTab === "exercises" ? (
                    <ExercisesTab machine={machine} />
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
