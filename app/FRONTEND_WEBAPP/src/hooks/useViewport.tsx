import { useEffect, useRef, useState } from "react";

export type FloorplanViewport = {
  scale: number;
  worldW: number;
  worldH: number;
};

export function useFloorplanViewport(floorWcm: number, floorHcm: number) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [vp, setVp] = useState<FloorplanViewport>({
    scale: 1,
    worldW: 1,
    worldH: 1,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;

      const safeW = Math.max(1, floorWcm);
      const safeH = Math.max(1, floorHcm);

      const scale = Math.min(width / safeW, height / safeH);

      setVp({
        scale,
        worldW: safeW * scale,
        worldH: safeH * scale,
      });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [floorWcm, floorHcm]);

  return { containerRef, vp };
}
