/**
 * EditorCanvas Component
 * Main canvas area with floorplan rendering
 */

import { ZoomControls } from "./ZoomControls";
import {
  getStatusColor,
  getHighlightColor,
  isSubstituteMachine,
  getDefaultMachineImage,
} from "../../utils/floorplan.utils";
import type {
  Machine,
  Wall,
  SelectedItem,
  HoveredItem,
  FloorSettings,
} from "../../types/floorplan.types";
import { MIN_ZOOM, MAX_ZOOM } from "../../utils/floorplan.utils";

interface EditorCanvasProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  canvasWidthPx: number;
  canvasHeightPx: number;
  gridSizePx: number;
  floorSettings: FloorSettings;
  zoom: number;
  panOffset: { x: number; y: number };
  isPanning: boolean;
  isReady: boolean;
  machines: Machine[];
  walls: Wall[];
  selectedItem: SelectedItem | null;
  hoveredItem: HoveredItem | null;
  selectedMachine: Machine | null | undefined;
  onMachineMouseDown: (e: React.MouseEvent, machine: Machine) => void;
  onWallMouseDown: (e: React.MouseEvent, wall: Wall) => void;
  onMouseEnter: (id: number, type: "machine" | "wall") => void;
  onMouseLeave: () => void;
  onCanvasMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onWheel: (e: React.WheelEvent) => void;
  onDeselect: () => void;
  setZoom: (zoom: number) => void;
  fitToScreen: () => void;
}

export function EditorCanvas({
  containerRef,
  canvasRef,
  canvasWidthPx,
  canvasHeightPx,
  gridSizePx,
  floorSettings,
  zoom,
  panOffset,
  isPanning,
  isReady,
  machines,
  walls,
  selectedItem,
  hoveredItem,
  selectedMachine,
  onMachineMouseDown,
  onWallMouseDown,
  onMouseEnter,
  onMouseLeave,
  onCanvasMouseDown,
  onMouseMove,
  onMouseUp,
  onWheel,
  onDeselect,
  setZoom,
  fitToScreen,
}: EditorCanvasProps) {
  return (
    <main
      ref={containerRef}
      className="flex-1 relative bg-gray-100 overflow-auto md:overflow-hidden transition-[cursor] duration-75"
      style={{
        cursor: isPanning ? "grabbing" : "default",
      }}
      onMouseDown={onCanvasMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onWheel={onWheel}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        ref={canvasRef}
        className={`absolute origin-top-left transition-all duration-300 ease-out will-change-transform ${isReady ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        style={{
          width: canvasWidthPx,
          height: canvasHeightPx,
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {/* Floor with Grid */}
        <div
          className="absolute inset-0 bg-white rounded-2xl overflow-hidden border-4 border-gray-800 shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.8)]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)`,
            backgroundSize: `${gridSizePx}px ${gridSizePx}px`,
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              onDeselect();
            }
          }}
        >
          {/* Grid Overlay */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)`,
              backgroundSize: `${gridSizePx * 5}px ${gridSizePx * 5}px`,
            }}
          />

          {/* Dimensions Labels */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm text-xs font-medium text-gray-500 border border-gray-100">
            {floorSettings.widthM}m
          </div>
          <div className="absolute -left-10 top-1/2 -translate-y-1/2 -rotate-90 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm text-xs font-medium text-gray-500 border border-gray-100">
            {floorSettings.heightM}m
          </div>

          {/* Contents Area */}
          <div className="relative w-full h-full">
            {/* Walls */}
            {walls.map((wall) => {
              const isSelected =
                selectedItem?.id === wall.id && selectedItem.type === "wall";
              const isHovered =
                hoveredItem?.id === wall.id && hoveredItem.type === "wall";
              const isIsolated = selectedItem && !isSelected;

              const scale = floorSettings.pixelsPerMeter / 100;
              const left = Math.min(wall.start_x, wall.end_x) * scale;
              const top = Math.min(wall.start_y, wall.end_y) * scale;
              const rawWidth =
                Math.max(Math.abs(wall.end_x - wall.start_x), wall.thickness) *
                scale;
              const rawHeight =
                Math.max(Math.abs(wall.end_y - wall.start_y), wall.thickness) *
                scale;
              const width = Math.max(rawWidth, 6);
              const height = Math.max(rawHeight, 6);

              return (
                <div
                  key={wall.id}
                  className={`absolute transition-all duration-200 ${isSelected
                      ? "bg-lime-500 ring-4 ring-lime-400 shadow-[0_0_20px_rgba(132,204,22,0.4)] z-50 scale-[1.02] border-2 border-white"
                      : isHovered
                        ? "bg-gray-600 scale-[1.01] z-40 cursor-pointer shadow-md"
                        : isIsolated
                          ? "bg-gray-800 opacity-20 z-10"
                          : "bg-gray-700 z-30 hover:bg-gray-600 cursor-pointer"
                    }`}
                  style={{ left, top, width, height }}
                  onMouseDown={(e) => onWallMouseDown(e, wall)}
                  onMouseEnter={() => onMouseEnter(wall.id, "wall")}
                  onMouseLeave={onMouseLeave}
                />
              );
            })}

            {/* Machines */}
            {machines.map((machine) => {
              const x =
                (machine.position_x / 100) * floorSettings.pixelsPerMeter;
              const y =
                (machine.position_y / 100) * floorSettings.pixelsPerMeter;
              const width =
                (machine.width / 100) * floorSettings.pixelsPerMeter;
              const height =
                (machine.height / 100) * floorSettings.pixelsPerMeter;

              const isSelected =
                selectedItem?.id === machine.id &&
                selectedItem.type === "machine";
              const isHovered =
                hoveredItem?.id === machine.id &&
                hoveredItem.type === "machine";
              const isSubstitute =
                selectedMachine &&
                !isSelected &&
                isSubstituteMachine(selectedMachine, machine);
              const isIsolated = selectedItem && !isSelected && !isSubstitute;

              const statusColor = getStatusColor(machine.status);
              const highlightColor = isSelected
                ? getHighlightColor(1)
                : isSubstitute
                  ? getHighlightColor(2)
                  : null;

              const displayName =
                machine.label || machine.equipment?.equipment_name || "Machine";
              const displayType =
                machine.equipment?.equipment_type || "Unknown";
              const imageUrl =
                machine.equipment?.image_full_url ||
                getDefaultMachineImage(displayType);

              return (
                <div
                  key={machine.id}
                  className={`absolute cursor-move rounded-[14px] transition-all duration-200 ease-out overflow-hidden bg-white flex flex-col ${highlightColor
                      ? `ring-4 ${highlightColor.border}/50 border-${highlightColor.border.split("-")[1]
                      }-500 z-40 shadow-2xl scale-105`
                      : isIsolated
                        ? "opacity-10 z-10 scale-90 grayscale contrast-50"
                        : isHovered
                          ? `${statusColor.border} z-40 shadow-xl scale-[1.03] ring-2 ring-gray-200`
                          : `${statusColor.border} z-20 shadow-md hover:shadow-lg hover:z-30`
                    }`}
                  style={{
                    left: x,
                    top: y,
                    width,
                    height,
                    transform: machine.rotation
                      ? `rotate(${machine.rotation}deg)`
                      : undefined,
                  }}
                  onMouseDown={(e) => onMachineMouseDown(e, machine)}
                  onMouseEnter={() => onMouseEnter(machine.id, "machine")}
                  onMouseLeave={onMouseLeave}
                >
                  {/* Image */}
                  <div className="relative flex-1 bg-gray-50 overflow-hidden">
                    <img
                      src={imageUrl ?? undefined}
                      alt={displayType}
                      className="w-full h-full object-cover opacity-95 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div
                      className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm ${highlightColor ? highlightColor.bg : statusColor.bg
                        } ${isSubstitute ? "animate-pulse" : ""}`}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>

                  {/* Label */}
                  <div className="shrink-0 bg-white px-2 py-1.5 border-t border-gray-100 flex items-center justify-center">
                    <div className="text-xs font-medium text-gray-800 truncate leading-tight">
                      {displayName}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ZoomControls
        zoom={zoom}
        onZoomChange={setZoom}
        onFit={fitToScreen}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        className="absolute bottom-4 right-4 z-50 pointer-events-auto"
      />
    </main>
  );
}
