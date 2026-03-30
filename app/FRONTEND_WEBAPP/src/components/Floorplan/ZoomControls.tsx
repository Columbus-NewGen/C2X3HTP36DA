/**
 * ZoomControls Component
 * Reusable zoom control widget for floorplan pages
 */

import { ZoomInIcon, ZoomOutIcon } from "./FloorplanIcons";

export interface ZoomControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onFit: () => void;
  minZoom: number;
  maxZoom: number;
  className?: string;
}

export function ZoomControls({
  zoom,
  onZoomChange,
  onFit,
  minZoom,
  maxZoom,
  className = "",
}: ZoomControlsProps) {
  const handleIncrement = () => {
    onZoomChange(Math.min(maxZoom, zoom + 0.1));
  };

  const handleDecrement = () => {
    onZoomChange(Math.max(minZoom, zoom - 0.1));
  };

  return (
    <div
      className={`flex items-center gap-2 bg-white/90 backdrop-blur rounded-xl px-3 py-2 border border-gray-200 shadow-sm ${className}`}
    >
      <button
        onClick={handleDecrement}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
        disabled={zoom <= minZoom}
        aria-label="Zoom out"
      >
        <ZoomOutIcon />
      </button>

      <input
        type="range"
        min={minZoom}
        max={maxZoom}
        step={0.05}
        value={zoom}
        onChange={(e) => onZoomChange(Number(e.target.value))}
        className="w-24 accent-lime-500"
        aria-label="Zoom level"
      />

      <button
        onClick={handleIncrement}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
        disabled={zoom >= maxZoom}
        aria-label="Zoom in"
      >
        <ZoomInIcon />
      </button>

      <div className="w-px h-4 bg-gray-300" />

      <button
        onClick={onFit}
        className="px-2 py-1 rounded-lg hover:bg-gray-100 text-gray-600 text-xs font-medium"
        aria-label="Fit to screen"
      >
        Fit
      </button>

      <span className="text-gray-500 text-xs font-medium w-10 text-right">
        {Math.round(zoom * 100)}%
      </span>
    </div>
  );
}
