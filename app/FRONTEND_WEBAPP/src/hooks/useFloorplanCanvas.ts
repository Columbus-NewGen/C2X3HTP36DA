/**
 * useFloorplanCanvas Hook
 * Manages canvas pan and zoom interactions
 */

import { useState, useCallback, useRef } from "react";
import type { PanOffset } from "../types/floorplan.types";

export interface UseFloorplanCanvasOptions {
  canvasWidth: number;
  canvasHeight: number;
  minZoom: number;
  maxZoom: number;
  initialZoom?: number;
  fitPadding?: number; // Padding around canvas when fitting to screen
}

export function useFloorplanCanvas({
  canvasWidth,
  canvasHeight,
  minZoom,
  maxZoom,
  initialZoom = 0.8,
  fitPadding = 40,
}: UseFloorplanCanvasOptions) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(initialZoom);
  const [panOffset, setPanOffset] = useState<PanOffset>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<PanOffset>({ x: 0, y: 0 });

  /**
   * Fit canvas to screen
   */
  const fitToScreen = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    if (!containerWidth || !containerHeight) return;

    // Add some padding (margin) so it doesn't touch edges
    const availableWidth = Math.max(0, containerWidth - fitPadding);
    const availableHeight = Math.max(0, containerHeight - fitPadding);

    const scaleX = availableWidth / canvasWidth;
    const scaleY = availableHeight / canvasHeight;

    const newZoom = Math.min(scaleX, scaleY);

    const clampedZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));

    const offsetX = (containerWidth - canvasWidth * clampedZoom) / 2;
    const offsetY = (containerHeight - canvasHeight * clampedZoom) / 2;

    setZoom(clampedZoom);
    setPanOffset({
      x: offsetX,
      y: offsetY,
    });
  }, [canvasWidth, canvasHeight, minZoom, maxZoom]);

  /**
   * Focus on a specific point in the canvas (canvas coordinates)
   */
  const focusOn = useCallback(
    (x: number, y: number, targetZoom?: number) => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const containerWidth = rect.width;
      const containerHeight = rect.height;

      if (!containerWidth || !containerHeight) return;

      const newZoom = targetZoom ?? zoom;
      const clampedZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));

      setZoom(clampedZoom);
      setPanOffset({
        x: containerWidth / 2 - x * clampedZoom,
        y: containerHeight / 2 - y * clampedZoom,
      });
    },
    [zoom, minZoom, maxZoom]
  );

  /**
   * Handle canvas mouse down (start panning)
   */
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Allow panning with Left Click (0) ONLY on background, or Middle Click (1) anywhere
      const isBackground = e.target === e.currentTarget;
      if (e.button === 1 || (e.button === 0 && isBackground)) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      }
    },
    [panOffset],
  );

  /**
   * Handle canvas mouse move (pan)
   */
  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setPanOffset({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      }
    },
    [isPanning, panStart],
  );

  /**
   * Handle canvas mouse up (stop panning)
   */
  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  /**
   * Handle wheel event (zoom)
   */
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      // Prevent page scroll and zoom
      e.preventDefault();

      // Smoother zoom steps
      const zoomStep = 0.05;
      const direction = e.deltaY > 0 ? -1 : 1;

      setZoom((prev) =>
        Math.max(
          minZoom,
          Math.min(maxZoom, prev + direction * zoomStep),
        ),
      );
    },
    [minZoom, maxZoom],
  );

  /**
   * Set zoom level programmatically
   */
  const setZoomLevel = useCallback(
    (newZoom: number) => {
      setZoom(Math.max(minZoom, Math.min(maxZoom, newZoom)));
    },
    [minZoom, maxZoom],
  );

  const lastTouchDistRef = useRef<number>(0);

  return {
    containerRef,
    zoom,
    panOffset,
    isPanning,
    setZoom: setZoomLevel,
    setPanOffset,
    fitToScreen,
    focusOn,
    handlers: {
      onMouseDown: handleCanvasMouseDown,
      onMouseMove: handleCanvasMouseMove,
      onMouseUp: handleCanvasMouseUp,
      onMouseLeave: handleCanvasMouseUp,
      onWheel: handleWheel,
      onTouchStart: (e: React.TouchEvent) => {
        if (e.touches.length === 1) {
          setIsPanning(true);
          setPanStart({
            x: e.touches[0].clientX - panOffset.x,
            y: e.touches[0].clientY - panOffset.y,
          });
        } else if (e.touches.length === 2) {
          setIsPanning(false);
          const dist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY,
          );
          lastTouchDistRef.current = dist;
        }
      },
      onTouchMove: (e: React.TouchEvent) => {
        if (e.touches.length === 1 && isPanning) {
          setPanOffset({
            x: e.touches[0].clientX - panStart.x,
            y: e.touches[0].clientY - panStart.y,
          });
        } else if (e.touches.length === 2) {
          const dist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY,
          );
          const lastDist = lastTouchDistRef.current || dist;
          const delta = dist - lastDist;
          if (Math.abs(delta) > 2) {
            setZoom((prev) => {
              const sens = 0.01;
              const next = prev + delta * sens;
              return Math.max(minZoom, Math.min(maxZoom, next));
            });
            lastTouchDistRef.current = dist;
          }
        }
      },
      onTouchEnd: () => {
        setIsPanning(false);
        lastTouchDistRef.current = 0;
      },
    },
  };
}
