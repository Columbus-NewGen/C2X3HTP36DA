/**
 * EditorSidebar Component
 * Mode-based left sidebar: MachineCreatePanel, WallCreatePanel, or SelectedItemPanel
 */

import {
  MachineCreatePanel,
  WallCreatePanel,
  SelectedItemPanel,
} from "./panels";
import { FloorSettingsPanel } from "./FloorSettingsPanel";
import type {
  MachineFormData,
  WallFormData,
  FloorSettings,
  Machine,
  Wall,
  SelectedItem,
  EditorMode,
} from "../../types/floorplan.types";

interface EditorSidebarProps {
  isOpen: boolean;
  editorMode: EditorMode;
  activeTab: "edit" | "settings";
  onTabChange: (tab: "edit" | "settings") => void;
  machineForm: MachineFormData;
  onMachineFormChange: (data: MachineFormData) => void;
  equipmentList: any[];
  wallForm: WallFormData;
  onWallFormChange: (data: WallFormData) => void;
  machines: Machine[];
  selectedItem: SelectedItem | null;
  selectedMachine: Machine | null;
  selectedWall: Wall | null;
  onMachineSelect: (id: number) => void;
  onDeleteSelected: () => void;
  floorSettings: FloorSettings;
  onFloorSettingsChange: (settings: FloorSettings) => void;
  onClose?: () => void;
}

export function EditorSidebar({
  isOpen,
  editorMode,
  activeTab,
  onTabChange,
  machineForm,
  onMachineFormChange,
  equipmentList,
  wallForm,
  onWallFormChange,
  machines,
  selectedItem,
  selectedMachine,
  selectedWall,
  onMachineSelect,
  onDeleteSelected,
  floorSettings,
  onFloorSettingsChange,
  onClose,
}: EditorSidebarProps) {
  const renderEditContent = () => {
    if (editorMode === "machine") {
      return (
        <MachineCreatePanel
          formData={machineForm}
          onFormChange={onMachineFormChange}
          equipmentList={equipmentList}
        />
      );
    }
    if (editorMode === "wall") {
      return (
        <WallCreatePanel formData={wallForm} onFormChange={onWallFormChange} />
      );
    }
    if (!selectedItem) return null;
    return (
      <SelectedItemPanel
        selectedItem={selectedItem}
        selectedMachine={selectedMachine}
        selectedWall={selectedWall}
        machines={machines}
        onMachineSelect={onMachineSelect}
        onDelete={onDeleteSelected}
      />
    );
  };

  const sidebarContent = (
    <>
      <div className="flex border-b border-gray-200 bg-gray-50/50 shrink-0">
        {(["edit", "settings"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`flex-1 py-3 text-xs font-medium uppercase  transition-colors ${activeTab === tab
              ? "text-lime-600 border-b-2 border-lime-500 bg-white"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {tab === "edit" ? "แก้ไข" : "ตั้งค่า"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 p-4">
        {activeTab === "edit" ? (
          <div className="space-y-4 pb-24">
            {editorMode === "select" && !selectedItem ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm text-gray-600">เลือก item บน canvas</p>
                  <p className="text-xs text-gray-500 mt-1">
                    คลิกที่พื้นที่ว่างเพื่อยกเลิกการเลือก
                  </p>
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
                        className="w-full text-left px-3 py-2 rounded-lg text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
                      >
                        {m.label ||
                          m.equipment?.equipment_name ||
                          `Machine ${m.id}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              renderEditContent()
            )}
          </div>
        ) : (
          <FloorSettingsPanel
            settings={floorSettings}
            onSettingsChange={onFloorSettingsChange}
          />
        )}
      </div>
    </>
  );

  return (
    <>
      <aside
        className={`hidden md:flex flex-col ${isOpen ? "w-80" : "w-0"
          } bg-white/95 backdrop-blur-md border-r border-lime-100 transition-all duration-300 z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)] h-full overflow-hidden`}
      >
        {sidebarContent}
      </aside>

      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-80 h-full bg-white/95 backdrop-blur-md border-r border-lime-100 shadow-2xl animate-slide-right flex flex-col">
            {sidebarContent}
          </div>
          <div
            className="flex-1 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />
        </div>
      )}
    </>
  );
}
