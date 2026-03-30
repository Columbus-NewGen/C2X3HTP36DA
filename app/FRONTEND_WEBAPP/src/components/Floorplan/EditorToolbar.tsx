/**
 * EditorToolbar Component
 * Top toolbar with mode selector and actions
 */

import { MenuIcon, UndoIcon, RedoIcon } from "./FloorplanIcons";
import type { EditorMode } from "../../types/floorplan.types";
import { MousePointer2, Weight, Square } from "lucide-react";

interface EditorToolbarProps {
  editorMode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  leftSidebarOpen: boolean;
  onToggleSidebar: () => void;
  floorSettings: { widthM: number; heightM: number };
  machinesCount: number;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onCancel: () => void;
  onExport: () => void;
  onSave: () => void;
  isSaving: boolean;
}

const MODES: { id: EditorMode; label: string; icon: React.ReactNode }[] = [
  { id: "select", label: "เลือก", icon: <MousePointer2 size={16} /> },
  { id: "machine", label: "เพิ่มเครื่อง", icon: <Weight size={16} /> },
  { id: "wall", label: "เพิ่มกำแพง", icon: <Square size={16} /> },
];

export function EditorToolbar({
  editorMode,
  onModeChange,
  leftSidebarOpen,
  onToggleSidebar,
  floorSettings,
  machinesCount,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onCancel,
  onExport,
  onSave,
  isSaving,
}: EditorToolbarProps) {
  return (
    <header className="h-14 sm:h-16 bg-white/95 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-3 sm:px-6 z-50 shrink-0 shadow-sm transition-all selection:bg-lime-100">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded-xl transition-all duration-200 flex items-center gap-2 border ${leftSidebarOpen
            ? "bg-lime-50 border-lime-200 text-lime-700 shadow-sm"
            : "bg-white border-gray-200 hover:bg-gray-50 text-gray-600"
            }`}
          aria-label={leftSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <MenuIcon size={20} />
        </button>

        <div className="flex flex-col min-w-0">
          <h1 className="text-sm sm:text-base font-bold text-gray-900 leading-tight truncate font-heading">
            แก้ไขแผนผัง
          </h1>
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 font-medium">
            <span className="truncate">
              Size {floorSettings.widthM}m × {floorSettings.heightM}m
            </span>
            <span className="text-gray-300">•</span>
            <span>{machinesCount} เครื่อง</span>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="hidden md:flex items-center gap-1 p-1 bg-gray-100 rounded-xl border border-gray-200">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => onModeChange(m.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${editorMode === m.id
                ? "bg-lime-500 text-white shadow-sm"
                : "text-gray-600 hover:bg-white hover:text-gray-900"
                }`}
            >
              {m.icon}
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Undo/Redo */}
      <div className="hidden md:flex items-center gap-2 mr-4 bg-gray-100/50 p-1 rounded-xl border border-gray-200/50">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 rounded-lg hover:bg-white text-gray-600 disabled:opacity-40 transition-all shadow-sm disabled:shadow-none bg-transparent"
          title="ย้อนกลับ (Ctrl+Z)"
        >
          <UndoIcon size={18} />
        </button>
        <div className="w-px h-4 bg-gray-300"></div>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 rounded-lg hover:bg-white text-gray-600 disabled:opacity-40 transition-all shadow-sm disabled:shadow-none bg-transparent"
          title="ทำซ้ำ (Ctrl+Shift+Z)"
        >
          <RedoIcon size={18} />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={onCancel}
          className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center gap-1.5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          ย้อนกลับ
        </button>
        <button
          onClick={onExport}
          className="hidden lg:inline-flex px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
        >
          ส่งออก
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2 ${isSaving
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-lime-500 hover:bg-lime-600"
            }`}
        >
          {isSaving ? (
            <>
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="hidden sm:inline">กำลังบันทึก...</span>
              <span className="sm:hidden">บันทึก...</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">บันทึกข้อมูล</span>
              <span className="sm:hidden">บันทึก</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
