/**
 * Floorplan Components Index
 * Central export for all floorplan components
 */

// Icon components
export * from "./FloorplanIcons";

// UI Components
export { ZoomControls } from "./ZoomControls";
export type { ZoomControlsProps } from "./ZoomControls";

export { StatusLegend } from "./StatusLegend";
export type { StatusLegendProps } from "./StatusLegend";

export { MachineCard } from "./MachineCard";
export type { MachineCardProps } from "./MachineCard";

export { FloorplanStats } from "./FloorplanStats";
export type { FloorplanStatsProps } from "./FloorplanStats";

export { MachineFormPanel } from "./MachineFormPanel";
export type { MachineFormPanelProps } from "./MachineFormPanel";

export { FloorSettingsPanel } from "./FloorSettingsPanel";
export type { FloorSettingsPanelProps } from "./FloorSettingsPanel";

export { EquipmentDetailDrawer } from "./EquipmentDetailDrawer";
export type { EquipmentDetailDrawerProps } from "./EquipmentDetailDrawer";

export { MiniFloorplanPreview } from "./MiniFloorPlanPreview";

// Editor Components
export * from "./panels";
export { EditorToolbar } from "./EditorToolbar";
export { EditorSidebar } from "./EditorSidebar";
export { EditorCanvas } from "./EditorCanvas";
export { MachinePropertiesPanel } from "./MachinePropertiesPanel";
export { WallPropertiesPanel } from "./WallPropertiesPanel";
