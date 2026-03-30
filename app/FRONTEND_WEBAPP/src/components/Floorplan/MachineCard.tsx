import type { Machine } from "../../types/floorplan.types";
import {
  getStatusColor,
  getDefaultMachineImage,
  resolveImageUrl,
} from "../../utils/floorplan.utils";
import { Component } from "lucide-react";

export interface MachineCardProps {
  machine: Machine;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  showImage?: boolean;
  compact?: boolean;
}

export function MachineCard({
  machine,
  isSelected,
  onClick,
  onMouseEnter,
  onMouseLeave,
  showImage = true,
  compact = false,
}: MachineCardProps) {
  const statusColor = getStatusColor(machine.status);
  const displayName =
    machine.label ||
    machine.equipment?.equipment_name ||
    `Machine #${machine.id}`;
  const displayType = machine.equipment?.equipment_type || "Unknown Type";

  const imageUrl =
    resolveImageUrl(machine.equipment?.image_full_url) ||
    resolveImageUrl(machine.images?.[0]?.url) ||
    getDefaultMachineImage(displayType);

  // Shared interactive props for accessibility
  const interactiveProps = {
    role: "button" as const,
    tabIndex: 0,
    onClick,
    onMouseEnter,
    onMouseLeave,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick();
      }
    },
  };

  const selectedClasses = isSelected
    ? "border-lime-400 bg-lime-50 shadow-sm"
    : "border-gray-200 hover:border-gray-300 hover:shadow-sm";

  if (compact) {
    return (
      <div
        {...interactiveProps}
        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border-2 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-1 ${selectedClasses}`}
      >
        {showImage && (
          <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-50 shrink-0 flex items-center justify-center border border-gray-100">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={displayType}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            ) : (
              <Component size={16} className="text-gray-300" />
            )}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate leading-tight">
            {displayName}
          </div>
          <div className="text-xs text-gray-500 truncate">{displayType}</div>
        </div>
        <div
          className={`w-2 h-2 rounded-full shrink-0 ${statusColor.bg}`}
          aria-label={`Status: ${machine.status}`}
        />
      </div>
    );
  }

  return (
    <div
      {...interactiveProps}
      className={`p-3 rounded-xl border-2 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-1 ${selectedClasses}`}
    >
      <div className="flex gap-3">
        {showImage && (
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-50 shrink-0 flex items-center justify-center p-1 border border-gray-100">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={displayName}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            ) : (
              <Component size={24} className="text-gray-300" />
            )}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 text-sm leading-tight truncate">
            {displayName}
          </div>
          <div className="text-xs text-gray-500 mt-0.5 truncate">
            {displayType}
          </div>
          <div className="mt-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${statusColor.light} ${statusColor.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusColor.bg}`} />
              {machine.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}