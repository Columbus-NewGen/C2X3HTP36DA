/**
 * MachineCreatePanel
 * Form to configure machine properties. User places via canvas click in machine mode.
 */

import type { MachineFormData } from "../../../types/floorplan.types";
import { MachineFormPanel } from "../MachineFormPanel";

export interface MachineCreatePanelProps {
  formData: MachineFormData;
  onFormChange: (data: MachineFormData) => void;
  equipmentList: any[];
  existingLabels?: Record<string, string[]>;
}

export function MachineCreatePanel({
  formData,
  onFormChange,
  equipmentList,
  existingLabels = {},
}: MachineCreatePanelProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-lime-200 bg-lime-50/50 p-3 text-xs text-lime-800">
        <p className="font-medium">คลิกบน canvas เพื่อวางเครื่อง</p>
      </div>
      <hr className="border-gray-200" />
      <MachineFormPanel
        formData={formData}
        onFormChange={onFormChange}
        equipmentList={equipmentList}
        existingLabels={existingLabels}
      />
    </div>
  );
}
