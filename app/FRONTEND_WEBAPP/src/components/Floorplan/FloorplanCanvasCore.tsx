// =============================
// FloorplanCanvasCore — refactored for legibility & UX quality
// Key improvements:
//   • Zoom-aware LOD (Level of Detail): dot-only → icon+status → full label
//   • Status expressed as colored border + dot (not floating detached dot)
//   • Overlap detection highlights colliding machines in amber
//   • Canvas has subtle warm tint so white floor pops with contrast
//   • Labels only render when machine is large enough to hold text legibly
//   • Tooltip on hover for always-readable name regardless of zoom
// =============================
import React, { useMemo } from "react";
import { MapPin, Component as MachineComponent } from "lucide-react";
import {
  getDefaultMachineImage,
  resolveImageUrl,
} from "../../utils/floorplan.utils";
import { cn } from "../../utils/workout.utils";
import type {
  Machine,
  Wall,
  SelectedItem,
  HoveredItem,
  FloorSettings,
  WallPreview,
} from "../../types/floorplan.types";

interface FloorplanCanvasCoreProps {
  canvasRef?: React.RefObject<HTMLDivElement | null>;
  widthPx: number;
  heightPx: number;
  gridSizePx: number;
  scale: number;
  panOffset: { x: number; y: number };
  floorSettings: FloorSettings;

  machines: Machine[];
  walls: Wall[];
  wallPreview?: WallPreview | null;

  selectedItem?: SelectedItem | null;
  hoveredItem?: HoveredItem | null;

  onWallMouseDown?: (e: React.MouseEvent, wall: Wall) => void;
  onMachineMouseDown?: (e: React.MouseEvent, machine: Machine) => void;
  onMachineClick?: (e: React.MouseEvent, machine: Machine) => void;
  onBackgroundMouseDown?: (e: React.MouseEvent) => void;
  onMouseEnterItem?: (id: number, type: "machine" | "wall") => void;
  onMouseLeaveItem?: () => void;

  isEditor?: boolean;
  isDragging?: boolean;
}

// ─── Zoom Level of Detail thresholds ───────────────────────────────────────
// Compared against effective rendered size = (machineCanvasPx) * scale
const LOD_LABEL_MIN_PX = 52; // show label when rendered height > this
const LOD_ICON_MIN_PX = 22; // show icon  when rendered height > this
// below LOD_ICON_MIN_PX → status-colored block only (no icon clutter)

// ─── Overlap detection ─────────────────────────────────────────────────────
function detectOverlaps(machines: Machine[], ppm: number): Set<number> {
  const overlapping = new Set<number>();
  const rects = machines.map((m) => ({
    id: m.id,
    l: (m.position_x / 100) * ppm,
    t: (m.position_y / 100) * ppm,
    r: (m.position_x / 100) * ppm + (m.width / 100) * ppm,
    b: (m.position_y / 100) * ppm + (m.height / 100) * ppm,
  }));
  for (let i = 0; i < rects.length; i++) {
    for (let j = i + 1; j < rects.length; j++) {
      const a = rects[i], b = rects[j];
      if (a.l < b.r - 2 && a.r > b.l + 2 && a.t < b.b - 2 && a.b > b.t + 2) {
        overlapping.add(a.id);
        overlapping.add(b.id);
      }
    }
  }
  return overlapping;
}

// ─── Status color maps ──────────────────────────────────────────────────────
const STATUS_BORDER_COLOR: Record<string, string> = {
  active: "#84cc16",      // Primary Lime-500 for consistency
  available: "#84cc16",
  online: "#84cc16",
  maintenance: "#f97316", // Orange-500
  warning: "#f97316",
  error: "#ef4444",       // Red-500
  offline: "#ef4444",
  inactive: "#64748b",    // Slate-500
  idle: "#eab308",        // Yellow-500
};

const STATUS_BG_COLOR: Record<string, string> = {
  active: "#f8fafc",      // Slate-50 - subtle and neutral
  available: "#f8fafc",
  online: "#f8fafc",
  maintenance: "#fff7ed",
  warning: "#fff7ed",
  error: "#fef2f2",
  offline: "#fef2f2",
  inactive: "#f8fafc",
  idle: "#fefce8",
};

const getBorderColor = (status: string | undefined) =>
  STATUS_BORDER_COLOR[(status ?? "").toLowerCase()] ?? "#e5e7eb";

const getBgColor = (status: string | undefined) =>
  STATUS_BG_COLOR[(status ?? "").toLowerCase()] ?? "#f9fafb";

// ─── Shared tooltip ─────────────────────────────────────────────────────────
const Tooltip: React.FC<{ label: string; scale: number }> = ({ label, scale }) => (
  <div
    className="pointer-events-none select-none"
    style={{
      position: "absolute",
      bottom: "calc(100% + 7px)",
      left: "50%",
      // Counter-scale so tooltip text is always the same real-world px size
      transform: `translateX(-50%) scale(${1 / scale})`,
      transformOrigin: "bottom center",
      background: "#111827",
      color: "#f9fafb",
      fontSize: 11,
      fontWeight: 600,
      whiteSpace: "nowrap",
      padding: "4px 9px",
      borderRadius: 6,
      zIndex: 100,
      boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
    }}
  >
    {label}
    <span
      style={{
        position: "absolute",
        top: "100%",
        left: "50%",
        transform: "translateX(-50%)",
        width: 0,
        height: 0,
        borderLeft: "5px solid transparent",
        borderRight: "5px solid transparent",
        borderTop: "5px solid #111827",
        display: "block",
      }}
    />
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────────────
export const FloorplanCanvasCore: React.FC<FloorplanCanvasCoreProps> = ({
  canvasRef,
  widthPx,
  heightPx,
  gridSizePx,
  scale,
  panOffset,
  floorSettings,
  machines,
  walls,
  wallPreview,
  selectedItem,
  hoveredItem,
  onWallMouseDown,
  onMachineMouseDown,
  onMachineClick,
  onBackgroundMouseDown,
  onMouseEnterItem,
  onMouseLeaveItem,
  isEditor = false,
  isDragging = false,
}) => {
  const safeWidth = Math.max(widthPx || 600, 100);
  const safeHeight = Math.max(heightPx || 400, 100);
  const ppm = floorSettings.pixelsPerMeter;

  const overlappingIds = useMemo(
    () => detectOverlaps(machines, ppm),
    [machines, ppm],
  );

  const handleBgMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onBackgroundMouseDown?.(e);
  };

  return (
    <div
      ref={canvasRef}
      className="absolute will-change-transform z-10"
      style={{
        width: safeWidth,
        height: safeHeight,
        transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
        transformOrigin: "0 0",
        left: 0,
        top: 0,
      }}
    >
      {/* Global Selection Animations */}
      <style>
        {`
          @keyframes pulse-ring {
            0% { transform: scale(0.95); opacity: 0.8; }
            50% { transform: scale(1.1); opacity: 0.3; }
            100% { transform: scale(1.25); opacity: 0; }
          }
          @keyframes floating-pin {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          .animate-pulse-ring {
            animation: pulse-ring 2s cubic-bezier(0, 0.2, 0.8, 1) infinite;
          }
          .animate-floating {
            animation: floating-pin 1.5s ease-in-out infinite;
          }
        `}
      </style>
      {/* ── Floor plate ────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{
          border: "2px solid #e2e8f0",
          background: "#fdfdfd",
          boxShadow: [
            "0 0 0 8px #e9ebee",      // halo ring — lifts floor off background
            "0 8px 40px rgba(0,0,0,0.2)",
            "inset 0 1px 0 rgba(255,255,255,1)",
          ].join(", "),
          // Fine dot grid
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.06) 1px, transparent 0)",
          backgroundSize: `${gridSizePx}px ${gridSizePx}px`,
        }}
        onMouseDown={handleBgMouseDown}
      >
        {/* Major grid lines at 5× cell */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: [
              "linear-gradient(to right,  rgba(0,0,0,0.035) 1px, transparent 1px)",
              "linear-gradient(to bottom, rgba(0,0,0,0.035) 1px, transparent 1px)",
            ].join(","),
            backgroundSize: `${gridSizePx * 5}px ${gridSizePx * 5}px`,
          }}
        />

        {/* Dimension badges */}
        {(
          [
            {
              style: {
                position: "absolute" as const,
                top: -28,
                left: "50%",
                transform: "translateX(-50%)",
                pointerEvents: "none" as const,
                userSelect: "none" as const,
              },
              label: `${floorSettings.widthM}m`,
            },
            {
              style: {
                position: "absolute" as const,
                left: -36,
                top: "50%",
                transform: "translateY(-50%) rotate(-90deg)",
                pointerEvents: "none" as const,
                userSelect: "none" as const,
              },
              label: `${floorSettings.heightM}m`,
            },
          ] as const
        ).map(({ style, label }) => (
          <div
            key={label}
            style={{
              ...style,
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(4px)",
              border: "1px solid #e5e7eb",
              borderRadius: 999,
              padding: "2px 10px",
              fontSize: 11,
              fontWeight: 500,
              color: "#6b7280",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </div>
        ))}

        {/* ── Contents ──────────────────────────────────────────────────── */}
        <div
          className="relative w-full h-full"
          onMouseDown={handleBgMouseDown}
        >
          {/* Wall preview */}
          {wallPreview &&
            (() => {
              const ms = ppm / 100;
              const left = Math.min(wallPreview.start_x, wallPreview.end_x) * ms;
              const top = Math.min(wallPreview.start_y, wallPreview.end_y) * ms;
              const w = Math.max(
                Math.abs(wallPreview.end_x - wallPreview.start_x) * ms,
                wallPreview.thickness * ms,
              );
              const h = Math.max(
                Math.abs(wallPreview.end_y - wallPreview.start_y) * ms,
                wallPreview.thickness * ms,
              );
              return (
                <div
                  className="absolute z-50 pointer-events-none"
                  style={{
                    left, top,
                    width: Math.max(w, 6),
                    height: Math.max(h, 6),
                    background: "rgba(132,204,22,0.25)",
                    border: "2px dashed #84cc16",
                  }}
                />
              );
            })()}

          {/* ── Walls — z-20 ─────────────────────────────────────────── */}
          {walls.map((wall) => {
            const isSelected = selectedItem?.id === wall.id && selectedItem.type === "wall";
            const isHovered = hoveredItem?.id === wall.id && hoveredItem.type === "wall";
            const isIsolated = isEditor && !!selectedItem && !isSelected;

            const ms = ppm / 100;
            const left = Math.min(wall.start_x, wall.end_x) * ms;
            const top = Math.min(wall.start_y, wall.end_y) * ms;
            const wWidth = Math.max(Math.max(Math.abs(wall.end_x - wall.start_x), wall.thickness) * ms, 6);
            const wHeight = Math.max(Math.max(Math.abs(wall.end_y - wall.start_y), wall.thickness) * ms, 6);

            return (
              <div
                key={wall.id}
                className="absolute transition-colors duration-100"
                style={{
                  left, top,
                  width: wWidth,
                  height: wHeight,
                  zIndex: isSelected ? 50 : isHovered ? 40 : 20,
                  background: isSelected ? "#84cc16" : isHovered ? "#4b5563" : "#374151",
                  opacity: isIsolated ? 0.15 : 1,
                  boxShadow: isSelected ? "0 0 0 3px rgba(132,204,22,0.4)" : undefined,
                  cursor: "pointer",
                }}
                onMouseDown={(e) => onWallMouseDown?.(e, wall)}
                onMouseEnter={() => onMouseEnterItem?.(wall.id, "wall")}
                onMouseLeave={onMouseLeaveItem}
              />
            );
          })}

          {/* ── Machines — z-30 ──────────────────────────────────────── */}
          {machines.map((machine) => {
            const x = (machine.position_x / 100) * ppm;
            const y = (machine.position_y / 100) * ppm;
            const width = (machine.width / 100) * ppm;
            const height = (machine.height / 100) * ppm;

            // Effective rendered size for LOD
            const renderedH = height * scale;
            const renderedW = width * scale;

            const isSelected = selectedItem?.id === machine.id && selectedItem.type === "machine";
            const isHovered = hoveredItem?.id === machine.id && hoveredItem.type === "machine";
            const isOverlap = overlappingIds.has(machine.id);

            const borderColor = isOverlap && !isSelected
              ? "#f59e0b"
              : isSelected
                ? "#84cc16" // Primary Lime-500 for clear selection
                : getBorderColor(machine.status);

            const displayName = machine.label || machine.equipment?.equipment_name || `#${machine.id}`;
            const displayType = machine.equipment?.equipment_type || "Unknown";
            const imageUrl =
              resolveImageUrl(machine.equipment?.image_full_url) ||
              resolveImageUrl(machine.images?.[0]?.url) ||
              getDefaultMachineImage(displayType);

            const showIcon = renderedH > LOD_ICON_MIN_PX && renderedW > LOD_ICON_MIN_PX;
            const showLabel = renderedH > LOD_LABEL_MIN_PX && renderedW > LOD_LABEL_MIN_PX;
            const bgColor = getBgColor(machine.status);

            // Dynamic font size — clamped between 8px and 11px
            const labelFontSize = Math.max(Math.min(width * 0.13, 11), 8);

            return (
              <div
                key={machine.id}
                className={cn(
                  "absolute",
                  !isDragging && "transition-all duration-300",
                  isSelected && "ring-4 ring-lime-400/50"
                )}
                style={{
                  left: x,
                  top: y,
                  width,
                  height,
                  zIndex: isSelected ? 50 : isHovered ? 40 : 30,
                  transform: machine.rotation ? `rotate(${machine.rotation}deg)` : undefined,
                  cursor: "pointer",
                  border: `2px solid ${borderColor}`,
                  borderRadius: 12,
                  background: "#fff",
                  boxShadow: isSelected
                    ? `0 0 40px ${borderColor}88, 0 10px 25px rgba(0,0,0,0.3)`
                    : isHovered
                      ? `0 0 10px ${borderColor}44, 0 4px 16px rgba(0,0,0,0.14)`
                      : "0 1px 3px rgba(0,0,0,0.08)",
                  overflow: "visible",
                }}
                onMouseDown={(e) => onMachineMouseDown?.(e, machine)}
                onClick={(e) => onMachineClick?.(e, machine)}
                onMouseEnter={() => onMouseEnterItem?.(machine.id, "machine")}
                onMouseLeave={onMouseLeaveItem}
              >
                {/* ── Selection Indicator — Pulsing Ring and Floating Pin ──── */}
                {isSelected && (
                  <div className="absolute inset-0 -m-4 pointer-events-none">
                    <div className="absolute inset-0 rounded-[18px] border-4 border-lime-400 animate-pulse-ring" />

                    {/* Floating Pin above machine */}
                    <div
                      className="absolute left-1/2 -top-10 -translate-x-1/2 flex flex-col items-center animate-floating"
                      style={{ transformOrigin: "bottom center" }}
                    >
                      <div className="bg-lime-500 text-white p-1 rounded-full shadow-lg ring-2 ring-white">
                        <MapPin size={18} fill="currentColor" strokeWidth={3} />
                      </div>
                      <div className="w-1 h-3 bg-lime-500 rounded-full mt-[-2px] shadow-sm" />
                    </div>
                  </div>
                )}
                {/* Clip inner content separately from overflow:visible outer */}
                <div
                  className="absolute inset-0"
                  style={{ borderRadius: 10, overflow: "hidden" }}
                >
                  {showIcon ? (
                    <>
                      {/* Background tint */}
                      <div
                        className="absolute inset-0"
                        style={{ background: bgColor }}
                      />

                      {/* Machine image */}
                      <div
                        className="absolute inset-0 flex items-center justify-center p-2"
                        style={{ padding: showLabel ? "4px 4px 20px" : "4px" }}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={displayType}
                            className="max-w-full max-h-full object-contain"
                            loading="lazy"
                            draggable={false}
                          />
                        ) : (
                          <MachineComponent
                            size={Math.min(width, height) * 0.4}
                            className="text-gray-300 transition-colors"
                            style={{ opacity: 0.6 }}
                            strokeWidth={1.5}
                          />
                        )}
                      </div>

                      {/* Status dot — anchored top-right, INSIDE the card */}
                      <div
                        style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: borderColor,
                          border: "1.5px solid #fff",
                          boxShadow: `0 0 5px ${borderColor}44`,
                        }}
                        aria-label={`Status: ${machine.status}`}
                      />

                      {/* Overlap warning badge */}
                      {isOverlap && (
                        <div
                          style={{
                            position: "absolute",
                            top: 3,
                            left: 3,
                            background: "#f59e0b",
                            color: "#fff",
                            fontSize: 8,
                            fontWeight: 800,
                            padding: "1px 3px",
                            borderRadius: 3,
                            lineHeight: 1.2,
                          }}
                        >
                          !
                        </div>
                      )}

                      {/* Label — bottom fade strip */}
                      {showLabel && (
                        <div
                          className="absolute bottom-0 inset-x-0 pointer-events-none select-none text-center"
                          style={{
                            background:
                              "linear-gradient(to top, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0) 100%)",
                            padding: "12px 4px 3px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: labelFontSize,
                              fontWeight: 600,
                              color: "#111827",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: "block",
                              lineHeight: 1.3,
                            }}
                          >
                            {displayName}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Nano view: status-colored block, no image clutter */
                    <div
                      className="absolute inset-0"
                      style={{ background: bgColor }}
                    />
                  )}
                </div>

                {/* Hover tooltip — counter-scaled, always legible */}
                {isHovered && !showLabel && (
                  <Tooltip label={displayName} scale={scale} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};