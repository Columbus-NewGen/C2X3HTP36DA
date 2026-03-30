/**
 * FloorplanEditorPage
 * Mode-based interactive floorplan editor
 * Structure: FloorplanEditor > EditorToolbar | EditorSidebar | FloorplanCanvas
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useFloorplanData } from "../../hooks";
import { equipmentApi } from "../../services/EquipmentAPI";
import { useFloorplanCanvas, useFloorplanEditor } from "../../hooks";
import { PageLoader } from "../../components/ui";
import { FloorplanSyncService } from "../../services/FloorplanSyncService";
import { FloorplanCanvasCore } from "../../components/Floorplan/FloorplanCanvasCore";
import { EditorToolbar } from "../../components/Floorplan/EditorToolbar";
import { EditorSidebar } from "../../components/Floorplan/EditorSidebar";
import { MachinePropertiesPanel } from "../../components/Floorplan/MachinePropertiesPanel";
import { WallPropertiesPanel } from "../../components/Floorplan/WallPropertiesPanel";
import { ZoomControls } from "../../components/Floorplan/ZoomControls";
import {
  MIN_ZOOM,
  MAX_ZOOM,
  DEFAULT_PIXELS_PER_METER,
  GRID_SIZE_M,
} from "../../utils/floorplan.utils";
import type {
  FloorSettings,
  MachineFormData,
  MachineStatus,
  WallFormData,
  EditorMode,
} from "../../types/floorplan.types";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3000,
    );
  };
  return { toasts, showToast };
}

function getCanvasCoordsFromEvent(
  e: React.MouseEvent,
  containerRect: DOMRect,
  panOffset: { x: number; y: number },
  zoom: number,
  pixelsPerMeter: number,
): { xCm: number; yCm: number } {
  const x = (e.clientX - containerRect.left - panOffset.x) / zoom;
  const y = (e.clientY - containerRect.top - panOffset.y) / zoom;
  const xCm = (x / pixelsPerMeter) * 100;
  const yCm = (y / pixelsPerMeter) * 100;
  return { xCm, yCm };
}

export default function FloorplanEditorPage() {
  const nav = useNavigate();
  const { floorplan: initialFloorplan, loading, refresh } = useFloorplanData();
  const { toasts, showToast } = useToast();

  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>("select");
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState<"edit" | "settings">(
    "edit",
  );

  const [floorSettings, setFloorSettings] = useState<FloorSettings>({
    widthM: 12,
    heightM: 8,
    gridSizeM: GRID_SIZE_M,
    snapToGrid: true,
    pixelsPerMeter: DEFAULT_PIXELS_PER_METER,
  });

  const [machineForm, setMachineForm] = useState<MachineFormData>({
    label: "New Machine",
    machine: "Leg Press",
    status: "ACTIVE" as MachineStatus,
    widthM: 1.5,
    heightM: 1.0,
  });
  const [wallForm, setWallForm] = useState<WallFormData>({
    orientation: "HORIZONTAL",
    lengthM: 2,
    thickness: 20,
  });

  useEffect(() => {
    equipmentApi
      .getAll()
      .then((res) => {
        const sorted = [...res.equipment].sort((a, b) =>
          a.equipment_name.localeCompare(b.equipment_name)
        );
        setEquipmentList(sorted);
        if (sorted.length > 0) {
          setMachineForm(prev => ({
            ...prev,
            machine: sorted[0].equipment_name,
            equipmentId: sorted[0].id
          }));
        }
      })
      .catch((err) => console.error("Failed to load equipment:", err));
  }, []);

  useEffect(() => {
    if (initialFloorplan) {
      setFloorSettings((prev) => ({
        ...prev,
        widthM: (initialFloorplan.canvas_width || 1200) / 100,
        heightM: (initialFloorplan.canvas_height || 800) / 100,
      }));
    }
  }, [initialFloorplan]);

  const canvasWidthPx = floorSettings.widthM * floorSettings.pixelsPerMeter;
  const canvasHeightPx = floorSettings.heightM * floorSettings.pixelsPerMeter;
  const gridSizePx = floorSettings.gridSizeM * floorSettings.pixelsPerMeter;

  const {
    containerRef,
    zoom,
    panOffset,
    isPanning,
    setZoom,
    fitToScreen,
    handlers,
  } = useFloorplanCanvas({
    canvasWidth: canvasWidthPx,
    canvasHeight: canvasHeightPx,
    minZoom: MIN_ZOOM,
    maxZoom: MAX_ZOOM,
    initialZoom: 0.6,
    fitPadding: 16,
  });

  const {
    canvasRef,
    machines,
    walls,
    selectedItem,
    hoveredItem,
    isDragging,
    wallPreview,
    setWalls,
    setSelectedItem,
    setHoveredItem,
    handleMachineMouseDown,
    handleWallMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    addMachineAtPosition,
    updateMachine,
    startWallDraw,
    updateWallPreview,
    commitWallDraw,
    cancelWallDraw,
    deleteSelected,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useFloorplanEditor({
    initialMachines: initialFloorplan?.equipment_instances || [],
    initialWalls: initialFloorplan?.walls || [],
    floorSettings,
    zoom,
    panOffset,
    containerRef,
  });

  useEffect(() => {
    if (window.innerWidth < 768) setLeftSidebarOpen(false);
  }, []);

  useEffect(() => {
    cancelWallDraw();
  }, [editorMode, cancelWallDraw]);

  useEffect(() => {
    if (selectedItem) {
      setRightSidebarOpen(true);
      if (window.innerWidth < 768) setLeftSidebarOpen(false);
    }
  }, [selectedItem]);

  useEffect(() => {
    if (initialFloorplan && !isReady) {
      setTimeout(() => {
        fitToScreen();
        setIsReady(true);
      }, 500);
    }
  }, [initialFloorplan, isReady, fitToScreen]);

  const handleSave = useCallback(async () => {
    if (!initialFloorplan) return;
    setIsSaving(true);
    const result = await FloorplanSyncService.syncFloorplan(
      initialFloorplan.id,
      initialFloorplan,
      machines,
      walls,
      floorSettings,
    );
    setIsSaving(false);
    if (result.success) {
      showToast(result.message || "บันทึกเรียบร้อย!", "success");
      refresh();
    } else {
      showToast(
        typeof result.error === "string" ? result.error : "บันทึกไม่สำเร็จ",
        "error",
      );
    }
  }, [initialFloorplan, machines, walls, floorSettings, refresh, showToast]);

  const handleExport = useCallback(() => {
    const data = {
      name: initialFloorplan?.name || "floorplan",
      exportedAt: new Date().toISOString(),
      canvas: {
        widthM: floorSettings.widthM,
        heightM: floorSettings.heightM,
      },
      machines,
      walls,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    a.download = `${initialFloorplan?.name || "floorplan"}-${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("ส่งออก JSON เรียบร้อย", "success");
  }, [initialFloorplan?.name, floorSettings, machines, walls, showToast]);

  const handleBackgroundMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const { xCm, yCm } = getCanvasCoordsFromEvent(
        e,
        rect,
        panOffset,
        zoom,
        floorSettings.pixelsPerMeter,
      );
      const xM = xCm / 100;
      const yM = yCm / 100;

      if (editorMode === "select") {
        setSelectedItem(null);
      } else if (editorMode === "machine") {
        const m = addMachineAtPosition(machineForm, xM, yM);
        setSelectedItem({ id: m.id, type: "machine" });
      } else if (editorMode === "wall") {
        startWallDraw(xCm, yCm, wallForm.thickness);
      }
    },
    [
      editorMode,
      machineForm,
      wallForm.thickness,
      addMachineAtPosition,
      startWallDraw,
      setSelectedItem,
      containerRef,
      panOffset,
      zoom,
      floorSettings.pixelsPerMeter,
    ],
  );

  const combinedMouseMove = useCallback(
    (e: React.MouseEvent) => {
      handlers.onMouseMove(e);
      if (isDragging) handleCanvasMouseMove(e);
      if (wallPreview) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const { xCm, yCm } = getCanvasCoordsFromEvent(
            e,
            rect,
            panOffset,
            zoom,
            floorSettings.pixelsPerMeter,
          );
          updateWallPreview(xCm, yCm);
        }
      }
    },
    [
      handlers,
      isDragging,
      handleCanvasMouseMove,
      wallPreview,
      updateWallPreview,
      containerRef,
      panOffset,
      zoom,
      floorSettings.pixelsPerMeter,
    ],
  );

  const combinedMouseUp = useCallback(() => {
    if (wallPreview) {
      const w = commitWallDraw(wallForm);
      if (w) setSelectedItem({ id: w.id, type: "wall" });
    }
    handlers.onMouseUp();
    handleCanvasMouseUp();
  }, [
    handlers,
    handleCanvasMouseUp,
    wallPreview,
    commitWallDraw,
    wallForm,
    setSelectedItem,
  ]);

  const combinedMouseDown = useCallback(
    (e: React.MouseEvent) => {
      handlers.onMouseDown(e);
    },
    [handlers],
  );

  const selectedMachine =
    selectedItem?.type === "machine"
      ? (machines.find((m) => m.id === selectedItem.id) ?? null)
      : null;
  const selectedWall =
    selectedItem?.type === "wall"
      ? (walls.find((w) => w.id === selectedItem.id) ?? null)
      : null;

  if (loading || !initialFloorplan) {
    return <PageLoader message="กำลังโหลดตัวแก้ไข..." fixed />;
  }

  return (
    <div className="min-h-0 flex-1 flex flex-col overflow-hidden w-full bg-gray-50">
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 animate-fade-in-down ${toast.type === "success"
              ? "bg-white border-lime-200 text-gray-800"
              : "bg-white border-red-200 text-red-800"
              }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${toast.type === "success" ? "bg-lime-500" : "bg-red-500"}`}
            />
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        ))}
      </div>

      <EditorToolbar
        editorMode={editorMode}
        onModeChange={setEditorMode}
        leftSidebarOpen={leftSidebarOpen}
        onToggleSidebar={() => setLeftSidebarOpen(!leftSidebarOpen)}
        floorSettings={floorSettings}
        machinesCount={machines.length}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onCancel={() => nav("/floorplan")}
        onExport={handleExport}
        onSave={handleSave}
        isSaving={isSaving}
      />

      <div className="flex-1 flex overflow-hidden">
        <EditorSidebar
          isOpen={leftSidebarOpen}
          editorMode={editorMode}
          activeTab={activeLeftTab}
          onTabChange={setActiveLeftTab}
          machineForm={machineForm}
          onMachineFormChange={setMachineForm}
          equipmentList={equipmentList}
          wallForm={wallForm}
          onWallFormChange={setWallForm}
          machines={machines}
          selectedItem={selectedItem}
          selectedMachine={selectedMachine}
          selectedWall={selectedWall}
          onMachineSelect={(id) => {
            setSelectedItem({ type: "machine", id });
            setRightSidebarOpen(true);
            if (window.innerWidth < 768) setLeftSidebarOpen(false);
          }}
          onDeleteSelected={deleteSelected}
          floorSettings={floorSettings}
          onFloorSettingsChange={setFloorSettings}
          onClose={() => setLeftSidebarOpen(false)}
        />

        <main
          ref={containerRef}
          className="flex-1 relative bg-gray-100 overflow-hidden"
          style={{
            cursor: isPanning
              ? "grabbing"
              : editorMode === "wall"
                ? "crosshair"
                : editorMode === "machine"
                  ? "crosshair"
                  : "default",
          }}
          onMouseDown={combinedMouseDown}
          onMouseMove={combinedMouseMove}
          onMouseUp={combinedMouseUp}
          onMouseLeave={combinedMouseUp}
          onTouchStart={handlers.onTouchStart}
          onTouchMove={handlers.onTouchMove}
          onTouchEnd={handlers.onTouchEnd}
          onWheel={handlers.onWheel}
          onContextMenu={(e) => e.preventDefault()}
        >
          <FloorplanCanvasCore
            canvasRef={canvasRef}
            widthPx={canvasWidthPx}
            heightPx={canvasHeightPx}
            gridSizePx={gridSizePx}
            scale={zoom}
            panOffset={panOffset}
            floorSettings={floorSettings}
            machines={machines}
            walls={walls}
            wallPreview={wallPreview}
            selectedItem={selectedItem}
            hoveredItem={hoveredItem}
            onWallMouseDown={handleWallMouseDown}
            onMachineMouseDown={handleMachineMouseDown}
            onBackgroundMouseDown={handleBackgroundMouseDown}
            onMouseEnterItem={(id, type) => setHoveredItem({ id, type })}
            onMouseLeaveItem={() => setHoveredItem(null)}
            isEditor={true}
            isDragging={isDragging}
          />

          <ZoomControls
            zoom={zoom}
            onZoomChange={setZoom}
            onFit={fitToScreen}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            className="absolute bottom-4 right-4 z-50 pointer-events-auto"
          />
        </main>

        {rightSidebarOpen && selectedMachine && (
          <MachinePropertiesPanel
            machine={selectedMachine}
            equipmentList={equipmentList}
            onUpdate={updateMachine}
            onDelete={deleteSelected}
            onClose={() => setRightSidebarOpen(false)}
          />
        )}

        {rightSidebarOpen && selectedWall && (
          <WallPropertiesPanel
            wall={selectedWall}
            onUpdate={(id, updates) => {
              setWalls((prev) =>
                prev.map((w) => (w.id === id ? { ...w, ...updates } : w)),
              );
            }}
            onDelete={deleteSelected}
            onClose={() => setRightSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
