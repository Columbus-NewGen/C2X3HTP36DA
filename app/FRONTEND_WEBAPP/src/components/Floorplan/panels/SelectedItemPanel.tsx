/**
 * SelectedItemPanel
 * Compact panel shown when an item is selected in select mode.
 */

import type { Machine, Wall, SelectedItem } from "../../../types/floorplan.types";

export interface SelectedItemPanelProps {
  selectedItem: SelectedItem;
  selectedMachine?: Machine | null;
  selectedWall?: Wall | null;
  machines: Machine[];
  onMachineSelect: (id: number) => void;
  onDelete: () => void;
  onCloseProperties?: () => void;
}

export function SelectedItemPanel({
  selectedItem,
  selectedMachine,
  selectedWall,
  machines,
  onMachineSelect,
  onDelete,
}: SelectedItemPanelProps) {
  const label =
    selectedMachine?.label ||
    selectedMachine?.equipment?.equipment_name ||
    (selectedWall ? "กำแพง" : "Item");

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-lime-200 bg-lime-50/50 p-4">
        <h3 className="text-sm font-semibold text-lime-900 mb-2">ที่เลือกไว้</h3>
        <p className="text-xs text-gray-600 truncate">{label}</p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={onDelete}
            className="flex-1 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors"
          >
            ลบ
          </button>
        </div>
      </div>

      <hr className="border-gray-200" />

      <div>
        <h3 className="text-xs font-medium text-gray-500 uppercase  mb-2">
          ที่วางแล้ว ({machines.length})
        </h3>
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {machines.map((m) => (
            <button
              key={m.id}
              onClick={() => onMachineSelect(m.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${selectedItem?.type === "machine" && selectedItem?.id === m.id
                ? "bg-lime-100 text-lime-800 font-medium"
                : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                }`}
            >
              {m.label || m.equipment?.equipment_name || `Machine ${m.id}`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
