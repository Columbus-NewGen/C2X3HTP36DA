/**
 * WallCreatePanel
 * Form to configure wall properties. User draws via click-drag on canvas in wall mode.
 */

import type { WallFormData } from "../../../types/floorplan.types";

export interface WallCreatePanelProps {
  formData: WallFormData;
  onFormChange: (data: WallFormData) => void;
}

export function WallCreatePanel({
  formData,
  onFormChange,
}: WallCreatePanelProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-lime-200 bg-lime-50/50 p-3 text-xs text-lime-800">
        <p className="font-medium">คลิกแล้วลากบน canvas เพื่อวาดกำแพง</p>
      </div>
      <hr className="border-gray-200" />
      <WallCreateForm formData={formData} onFormChange={onFormChange} />
    </div>
  );
}

function WallCreateForm({
  formData,
  onFormChange,
}: {
  formData: WallFormData;
  onFormChange: (data: WallFormData) => void;
}) {
  const updateField = <K extends keyof WallFormData>(
    field: K,
    value: WallFormData[K]
  ) => onFormChange({ ...formData, [field]: value });

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs uppercase font-medium text-gray-500 mb-2 ">
          Orientation
        </label>
        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => updateField("orientation", "HORIZONTAL")}
            className={`py-2 rounded-lg text-xs font-medium transition-all ${formData.orientation === "HORIZONTAL"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            Horizontal
          </button>
          <button
            onClick={() => updateField("orientation", "VERTICAL")}
            className={`py-2 rounded-lg text-xs font-medium transition-all ${formData.orientation === "VERTICAL"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            Vertical
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase font-medium text-gray-500 mb-1.5 ">
            Thickness (cm)
          </label>
          <input
            type="number"
            step="1"
            min="20"
            max="50"
            value={formData.thickness}
            onChange={(e) =>
              updateField("thickness", Math.max(20, Number(e.target.value)))
            }
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 outline-none"
          />
        </div>
      </div>
    </div>
  );
}
