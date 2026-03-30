/**
 * MachineFormPanel Component
 * Form for creating new machines in the editor
 */

import { useState } from "react";
import type { MachineFormData } from "../../types/floorplan.types";
import type { MachineStatus } from "../../types/floorplan.types";

export interface MachineFormPanelProps {
  formData: MachineFormData;
  onFormChange: (data: MachineFormData) => void;
  onAdd?: () => void;
  equipmentList: any[];
  existingLabels?: Record<string, string[]>;
}

export function MachineFormPanel({
  formData,
  onFormChange,
  onAdd,
  equipmentList,
  existingLabels = {},
}: MachineFormPanelProps) {
  const updateField = <K extends keyof MachineFormData>(
    field: K,
    value: MachineFormData[K]
  ) => {
    onFormChange({ ...formData, [field]: value });
  };

  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = equipmentList.filter(item =>
    item.equipment_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {/* Label Input */}
        <div>
          <label className="block text-gray-600 text-[10px] uppercase font-bold mb-1 opacity-60">Label Name</label>
          <input
            type="text"
            value={formData.label}
            onChange={(e) => updateField("label", e.target.value)}
            className="w-full border border-gray-100 bg-gray-50/50 rounded-xl px-3 py-2.5 text-sm focus:border-lime-400 focus:bg-white outline-none transition-all shadow-sm"
            placeholder="e.g. Row A1"
          />
        </div>

        {/* Machine Select with Search */}
        <div className="space-y-2">
          <label className="block text-gray-600 text-[10px] uppercase font-bold mb-1 opacity-60">Machine Model</label>
          <div className="relative group">
            <input
              type="text"
              placeholder="ระบุประเภทเครื่องเล่น..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-100 bg-gray-50/50 rounded-t-xl px-3 py-2 text-xs focus:border-lime-400 focus:bg-white outline-none transition-all border-b-lime-200"
            />
            <select
              value={formData.machine}
              size={Math.min(filteredItems.length + 1, 6)}
              onChange={(e) => {
                const name = e.target.value;
                const eq = equipmentList.find(item => item.equipment_name === name);
                onFormChange({
                  ...formData,
                  machine: name,
                  equipmentId: eq?.id
                });
              }}
              className="w-full border border-gray-100 bg-white rounded-b-xl px-2 py-1 text-sm focus:border-lime-400 outline-none transition-all shadow-md overflow-y-auto max-h-40 scrollbar-thin scrollbar-thumb-lime-200"
            >
              {filteredItems.map((eq: any) => (
                <option key={eq.id} value={eq.equipment_name} className="py-1.5 px-2 hover:bg-lime-50 rounded-md cursor-pointer checked:bg-lime-500 checked:text-white">
                  {eq.equipment_name}
                </option>
              ))}
              {filteredItems.length === 0 && (
                <option disabled>ไม่พบรายการที่ค้นหา...</option>
              )}
            </select>
          </div>

          {/* Existing labels for selected machine */}
          <div className="mt-2 text-xs text-gray-500">
            <div className="font-medium text-gray-700 mb-1">
              Existing labels
            </div>
            <div className="flex flex-wrap gap-2">
              {(existingLabels?.[formData.machine] || []).map((lbl) => (
                <span
                  key={lbl}
                  className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs"
                >
                  {lbl}
                </span>
              ))}
              {!(existingLabels?.[formData.machine] || []).length && (
                <span className="text-gray-400">None</span>
              )}
            </div>
          </div>
        </div>

        {/* NOTE: Number removed — create one machine per add action */}

        {/* Dimensions */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-gray-600 text-xs mb-1">
              Width (m)
            </label>
            <input
              type="number"
              value={formData.widthM}
              onChange={(e) => updateField("widthM", Number(e.target.value))}
              step="0.1"
              min="0.5"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-lime-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-600 text-xs mb-1">
              Height (m)
            </label>
            <input
              type="number"
              value={formData.heightM}
              onChange={(e) => updateField("heightM", Number(e.target.value))}
              step="0.1"
              min="0.5"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-lime-400 outline-none"
            />
          </div>
        </div>

        {/* Status Select */}
        <div>
          <label className="block text-gray-600 text-xs mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) =>
              updateField("status", e.target.value as MachineStatus)
            }
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-lime-400 outline-none"
          >
            <option value="ACTIVE">Active</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>

        {/* Add Button - only when onAdd is provided */}
        {onAdd && (
          <button
            onClick={onAdd}
            disabled={
              !formData.label?.trim() ||
              (existingLabels?.[formData.machine] || []).includes(
                formData.label?.trim()
              )
            }
            className="w-full py-2.5 rounded-lg bg-lime-500 text-white font-medium text-sm hover:bg-lime-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + Add Machine
          </button>
        )}
      </div>
    </div>
  );
}
