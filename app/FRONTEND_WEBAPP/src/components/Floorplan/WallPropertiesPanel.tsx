/**
 * WallPropertiesPanel Component
 * Right sidebar panel for editing wall properties
 */

import { cmToMeters, metersToCm } from "../../utils/floorplan.utils";
import type { Wall } from "../../types/floorplan.types";

interface WallPropertiesPanelProps {
  wall: Wall;
  onUpdate: (id: number, updates: Partial<Wall>) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function WallPropertiesPanel({
  wall,
  onUpdate,
  onDelete,
  onClose,
}: WallPropertiesPanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:flex-row md:justify-end pointer-events-none">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />
      <aside className="relative pointer-events-auto w-full h-[60dvh] md:h-full md:w-80 bg-white border-l border-gray-200 shadow-2xl transition-transform duration-300 flex flex-col rounded-t-2xl md:rounded-none animate-slide-up md:animate-slide-in-right">

        {/* Drag Handle (Mobile only) */}
        <div className="md:hidden w-full flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        <div className="flex items-center justify-between p-4 shrink-0">
          <h3 className="font-bold text-gray-900">คุณสมบัติกำแพง (Wall)</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 transition"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-20 space-y-6">
          <div className="p-4 bg-lime-50 rounded-2xl border border-lime-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-500 flex items-center justify-center text-white shadow-lg shadow-lime-500/20">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900 leading-none">
                กำแพงกั้นห้อง
              </div>
              <div className="text-xs text-lime-600 font-medium uppercase  mt-1">
                Partition Wall
              </div>
            </div>
          </div>

          <div className="space-y-4 px-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase font-bold text-gray-500 mb-1 ">
                  จุดเริ่ม X (ม.)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={cmToMeters(wall.start_x)}
                  onChange={(e) => {
                    onUpdate(wall.id, {
                      start_x: metersToCm(Number(e.target.value)),
                    });
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-lime-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-gray-500 mb-1  ">
                  จุดเริ่ม Y (ม.)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={cmToMeters(wall.start_y)}
                  onChange={(e) => {
                    onUpdate(wall.id, {
                      start_y: metersToCm(Number(e.target.value)),
                    });
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-lime-500 outline-none transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase font-bold text-gray-500 mb-1  ">
                  จุดสิ้นสุด X (ม.)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={cmToMeters(wall.end_x)}
                  onChange={(e) => {
                    onUpdate(wall.id, {
                      end_x: metersToCm(Number(e.target.value)),
                    });
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-lime-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-gray-500 mb-1  ">
                  จุดสิ้นสุด Y (ม.)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={cmToMeters(wall.end_y)}
                  onChange={(e) => {
                    onUpdate(wall.id, {
                      end_y: metersToCm(Number(e.target.value)),
                    });
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-lime-500 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-gray-500 mb-1.5 ">
                ความหนา (ซม.)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={wall.thickness}
                  onChange={(e) => {
                    onUpdate(wall.id, {
                      thickness: Number(e.target.value),
                    });
                  }}
                  className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-lime-500"
                />
                <span className="text-xs font-medium text-gray-600 w-8">
                  {wall.thickness}cm
                </span>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100">
              <button
                onClick={onDelete}
                className="w-full py-3 rounded-2xl bg-rose-50 text-rose-600 font-bold text-sm hover:bg-rose-600 hover:text-white transition-all border border-rose-100 active:scale-95 flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                ลบกำแพงนี้
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
