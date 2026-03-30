/**
 * MachinePropertiesPanel Component
 * Right sidebar panel for editing machine properties
 */

import type { Machine } from "../../types/floorplan.types";
import { cmToMeters, metersToCm, resolveImageUrl } from "../../utils/floorplan.utils";
import { Component } from "lucide-react";

/**
 * Get equipment image URL from API response
 */
function getEquipmentImageUrl(machine: Machine): string | null {
  const url = machine.equipment?.image_full_url || machine.equipment?.image_url;
  return resolveImageUrl(url);
}

interface MachinePropertiesPanelProps {
  machine: Machine;
  equipmentList: any[];
  onUpdate: (id: number, updates: Partial<Machine>) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function MachinePropertiesPanel({
  machine,
  equipmentList,
  onUpdate,
  onDelete,
  onClose,
}: MachinePropertiesPanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:flex-row md:justify-end pointer-events-none">
      <div
        className="absolute inset-0 bg-black/10 pointer-events-auto"
        onClick={onClose}
      />
      <aside className="relative pointer-events-auto w-full h-[70dvh] md:h-full md:w-80 bg-white/95 backdrop-blur-md border-l border-lime-100 shadow-2xl transition-transform duration-300 flex flex-col rounded-t-3xl md:rounded-none animate-slide-up md:animate-slide-in-right">
        {/* Drag Handle (Mobile only) */}
        <div className="md:hidden w-full flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        <div className="flex items-center justify-between p-4 shrink-0">
          <h3 className="font-bold text-gray-900">คุณสมบัติเครื่องเล่น</h3>
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
          {/* Machine Header */}
          <div className="relative group overflow-hidden rounded-2xl aspect-video bg-gray-50 shadow-inner shrink-0 flex items-center justify-center">
            {getEquipmentImageUrl(machine) ? (
              <img
                src={getEquipmentImageUrl(machine)!}
                alt={machine.label}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <Component className="w-16 h-16 text-gray-200" strokeWidth={1.5} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <div className="text-xs uppercase font-medium  opacity-80 mb-1">
                {machine.equipment?.equipment_type || "เครื่องจักร"}
              </div>
              <h4 className="font-semibold text-base leading-tight">
                {machine.label || "เครื่องจักรที่ไม่มีชื่อ"}
              </h4>
            </div>
          </div>

          {/* Basic Info Edit */}
          <div className="space-y-4 px-1">
            <div>
              <label className="block text-xs uppercase font-bold text-lime-700 mb-1.5 ">
                ชื่อกำกับ (Label)
              </label>
              <input
                type="text"
                value={machine.label || ""}
                onChange={(e) =>
                  onUpdate(machine.id, { label: e.target.value })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-lime-500 focus:ring-4 focus:ring-lime-500/10 outline-none transition-all shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-lime-700 mb-1.5 ">
                ชนิดเครื่อง (Machine Type)
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="ค้นหาเครื่อง..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-t-xl px-3 py-1.5 text-xs focus:border-lime-500 focus:bg-white outline-none transition-all shadow-sm"
                  onChange={(e) => {
                    const term = e.target.value.toLowerCase();
                    const options = e.target.nextElementSibling as HTMLSelectElement;
                    if (options) {
                      Array.from(options.options).forEach(opt => {
                        const show = opt.text.toLowerCase().includes(term);
                        opt.style.display = show ? "block" : "none";
                      });
                    }
                  }}
                />
                <select
                  value={machine.equipment_id || machine.equipment?.id}
                  size={5}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    const eq = equipmentList.find(i => i.id === id);
                    onUpdate(machine.id, {
                      equipment_id: id,
                      equipment: eq
                    });
                  }}
                  className="w-full bg-white border border-gray-200 rounded-b-xl px-2 py-1 text-sm focus:border-lime-500 outline-none transition-all shadow-md overflow-y-auto max-h-40"
                >
                  {equipmentList
                    .sort((a, b) => a.equipment_name.localeCompare(b.equipment_name))
                    .map(item => (
                      <option key={item.id} value={item.id} className="py-1 px-2 hover:bg-lime-50 rounded select-none">
                        {item.equipment_name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">
                  สถานะ (Status)
                </label>
                <select
                  value={machine.status}
                  onChange={(e) => onUpdate(machine.id, { status: e.target.value as any })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-lime-500 outline-none transition-all shadow-sm"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">
                  หมุน (องศา)
                </label>
                <select
                  value={machine.rotation || 0}
                  onChange={(e) => onUpdate(machine.id, { rotation: Number(e.target.value) })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-lime-500 outline-none transition-all shadow-sm"
                >
                  {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                    <option key={deg} value={deg}>{deg}°</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grid Layout for Position and Size */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5 ">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase leading-none">
                      ตำแหน่ง X (ม.)
                    </label>
                    <div className="group relative">
                      <svg className="w-3 h-3 text-gray-300 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <div className="absolute bottom-full right-0 mb-2 w-32 hidden group-hover:block bg-gray-900 text-white text-[9px] p-2 rounded shadow-xl z-50">
                        ระยะห่างจากขอบซ้าย (เมตร)
                      </div>
                    </div>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={Number(cmToMeters(machine.position_x)).toFixed(2)}
                    onChange={(e) =>
                      onUpdate(machine.id, {
                        position_x: metersToCm(Number(e.target.value)),
                      })
                    }
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm font-bold focus:border-lime-500 focus:bg-white outline-none transition-all shadow-sm tabular-nums"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5 ">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase leading-none">
                      กว้าง (ม.)
                    </label>
                    <div className="group relative">
                      <svg className="w-3 h-3 text-gray-300 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <div className="absolute bottom-full right-0 mb-2 w-32 hidden group-hover:block bg-gray-900 text-white text-[9px] p-2 rounded shadow-xl z-50">
                        ขนาดด้านกว้างของเครื่อง (เมตร)
                      </div>
                    </div>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={Number(cmToMeters(machine.width)).toFixed(2)}
                    onChange={(e) =>
                      onUpdate(machine.id, {
                        width: metersToCm(Number(e.target.value)),
                      })
                    }
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm font-bold focus:border-lime-500 focus:bg-white outline-none transition-all shadow-sm tabular-nums"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5 ">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase leading-none">
                      ตำแหน่ง Y (ม.)
                    </label>
                    <div className="group relative">
                      <svg className="w-3 h-3 text-gray-300 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <div className="absolute bottom-full right-0 mb-2 w-32 hidden group-hover:block bg-gray-900 text-white text-[9px] p-2 rounded shadow-xl z-50">
                        ระยะห่างจากขอบบน (เมตร)
                      </div>
                    </div>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={Number(cmToMeters(machine.position_y)).toFixed(2)}
                    onChange={(e) =>
                      onUpdate(machine.id, {
                        position_y: metersToCm(Number(e.target.value)),
                      })
                    }
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm font-bold focus:border-lime-500 focus:bg-white outline-none transition-all shadow-sm tabular-nums"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5 ">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase leading-none">
                      สูง (ม.)
                    </label>
                    <div className="group relative">
                      <svg className="w-3 h-3 text-gray-300 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <div className="absolute bottom-full right-0 mb-2 w-32 hidden group-hover:block bg-gray-900 text-white text-[9px] p-2 rounded shadow-xl z-50">
                        ขนาดด้านสูงของเครื่อง (เมตร)
                      </div>
                    </div>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={Number(cmToMeters(machine.height)).toFixed(2)}
                    onChange={(e) =>
                      onUpdate(machine.id, {
                        height: metersToCm(Number(e.target.value)),
                      })
                    }
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm font-bold focus:border-lime-500 focus:bg-white outline-none transition-all shadow-sm tabular-nums"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-gray-500 mb-1.5 ">
                หมุน (องศา)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="45"
                  value={machine.rotation || 0}
                  onChange={(e) =>
                    onUpdate(machine.id, {
                      rotation: Number(e.target.value),
                    })
                  }
                  className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-lime-500"
                />
                <span className="text-xs font-bold text-lime-600 w-10 tabular-nums">
                  {machine.rotation || 0}°
                </span>
              </div>
            </div>
          </div>

          {/* Delete Button */}
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={onDelete}
              className="w-full py-2.5 rounded-xl bg-rose-50 text-rose-600 font-bold text-sm hover:bg-rose-100 transition-all border border-rose-100 flex items-center justify-center gap-2"
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
              ลบออกจากผัง
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
