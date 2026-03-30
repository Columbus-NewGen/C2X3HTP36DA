import { useMemo } from "react";
import { Map, Maximize2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFloorplanViewport } from "../../hooks/useViewport";
import type { Floorplan, MachineStatus, Machine } from "../../types/floorplan.types";

function shortName(name: string) {
  // 1) normalize ช่องว่าง
  const normalized = (name || "").replace(/\s+/g, " ").trim();

  // 2) ถ้าสั้นอยู่แล้ว ใช้ตรง ๆ
  if (normalized.length <= 10) {
    return normalized;
  }

  // 3) แยก hash เช่น "#12" ออกมา (ถ้ามี)
  const hashMatch = normalized.match(/#\d+/);
  const hash = hashMatch ? hashMatch[0] : "";

  // 4) ตัด hash ออกจากชื่อ
  const nameWithoutHash = normalized.replace(hash, "").trim();

  // 5) รวม initials + hash และจำกัดความยาว
  return `${nameWithoutHash.split(" ")[0]}${hash}`.slice(0, 10);
}

function getStatusStyle(status: MachineStatus) {
  if (status === "ACTIVE") return { bg: "bg-lime-500", ring: "ring-lime-200" };
  if (status === "MAINTENANCE")
    return { bg: "bg-rose-500", ring: "ring-rose-200" };
  return { bg: "bg-gray-500", ring: "ring-gray-200" };
}

interface Props {
  floorplan: Floorplan;
}

export function MiniFloorplanPreview({ floorplan }: Props) {
  const nav = useNavigate();

  const machines = floorplan.equipment_instances ?? [];

  const stats = useMemo(() => {
    return {
      total: machines.length,
      active: machines.filter((m: Machine) => m.status === "ACTIVE").length,
      maintenance: machines.filter((m: Machine) => m.status === "MAINTENANCE").length,
    };
  }, [machines]);

  const floorW = floorplan.canvas_width ?? 1200;
  const floorH = floorplan.canvas_height ?? 800;
  const { containerRef, vp } = useFloorplanViewport(floorW, floorH);

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg border bg-white flex items-center justify-center">
            <Map className="h-3 w-3 text-gray-700" />
          </div>
          <div className="text-xs font-semibold text-gray-900 truncate">
            {floorplan.name}
          </div>
        </div>

        <div className="flex gap-1.5">
          <span className="px-2 py-0.5 text-xs rounded-full bg-lime-50 text-lime-700 border border-lime-200">
            {stats.active}
          </span>
          {stats.maintenance > 0 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              {stats.maintenance}
            </span>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="relative h-[1560px] w-auto">
        <div
          ref={containerRef}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div
            className="relative bg-white shadow-inner"
            style={{
              width: vp.worldW,
              height: vp.worldH,
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)",
              backgroundSize: "20px 20px",
            }}
          >
            {machines.map((machine: Machine) => {
              const st = getStatusStyle(machine.status);
              return (
                <div
                  key={machine.id}
                  className="absolute"
                  style={{
                    left: machine.position_x * vp.scale,
                    top: machine.position_y * vp.scale,
                    width: machine.width * vp.scale,
                    height: machine.height * vp.scale,
                  }}
                >
                  <div
                    className={`h-full w-full rounded-sm ${st.bg} ring-2 ${st.ring}`}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                    {shortName(
                      machine.label ?? machine.equipment?.equipment_name ?? "M"
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Overlay */}
        <button
          onClick={() => nav(`/floorplan/${floorplan.id}`)}
          className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/5 transition"
        >
          <span className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-xs font-semibold shadow opacity-0 hover:opacity-100 transition">
            <Maximize2 className="h-3.5 w-3.5" />
            View Full
          </span>
        </button>
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 bg-gray-50 border-t flex justify-between text-xs text-gray-600">
        <span>
          <strong className="text-gray-900">{stats.total}</strong> machines
        </span>
        <span>
          {Math.round(floorW / 100)}m × {Math.round(floorH / 100)}m
        </span>
      </div>
    </div>
  );
}
