import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Edit, PanelRightClose, PanelRightOpen } from "lucide-react";
import { useFloorplanData, useFloorplanCanvas, useFloorplanFilters } from "../../hooks";
import { useAuth } from "../../hooks/useAuth";
import { PageLoader } from "../../components/ui";
import { FloorplanCanvasCore } from "../../components/Floorplan/FloorplanCanvasCore";
import {
  ZoomControls,
  StatusLegend,
  MachineCard,
  EquipmentDetailDrawer,
} from "../../components/Floorplan";
import { MIN_ZOOM, MAX_ZOOM } from "../../utils/floorplan.utils";
import type { Machine } from "../../types/floorplan.types";

export default function FloorplanViewerPage() {
  const [searchParams] = useSearchParams();
  const machineIdFromUrl = searchParams.get("machineId");
  const nav = useNavigate();
  const { user } = useAuth();
  const { floorplan, loading } = useFloorplanData();

  const canEdit = user?.role === "admin" || user?.role === "root";

  const [selectedMachineId, setSelectedMachineId] = useState<number | null>(
    null,
  );
  const [hoveredMachineId, setHoveredMachineId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Default sidebar open on desktop
  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const floorSettings = {
    widthM: (floorplan?.canvas_width || 1200) / 100,
    heightM: (floorplan?.canvas_height || 800) / 100,
    gridSizeM: 0.1,
    snapToGrid: false,
    pixelsPerMeter: 50,
  };

  const canvasWidth = floorSettings.widthM * floorSettings.pixelsPerMeter;
  const canvasHeight = floorSettings.heightM * floorSettings.pixelsPerMeter;

  const {
    containerRef,
    zoom,
    panOffset,
    isPanning,
    setZoom,
    fitToScreen,
    focusOn,
    handlers,
  } = useFloorplanCanvas({
    canvasWidth,
    canvasHeight,
    minZoom: MIN_ZOOM,
    maxZoom: MAX_ZOOM,
    initialZoom: 0.5,
  });

  const { filters, filteredMachines, setSearchQuery } = useFloorplanFilters(
    floorplan?.equipment_instances || [],
  );

  useEffect(() => {
    if (floorplan && !loading && !isReady) {
      if (machineIdFromUrl) {
        const mid = parseInt(machineIdFromUrl);
        const machine = floorplan.equipment_instances?.find((m) => m.id === mid);
        if (machine) {
          setSelectedMachineId(mid);
          setDetailDrawerOpen(true);
          const x = ((machine.position_x + machine.width / 2) / 100) * floorSettings.pixelsPerMeter;
          const y = ((machine.position_y + machine.height / 2) / 100) * floorSettings.pixelsPerMeter;
          setTimeout(() => {
            focusOn(x, y, 1.1);
            setIsReady(true);
          }, 450);
          return;
        }
      }
      fitToScreen();
      setIsReady(true);
    }
  }, [floorplan, loading, machineIdFromUrl, fitToScreen, focusOn, isReady, floorSettings.pixelsPerMeter]);

  const handleMachineClick = useCallback(
    (e: React.MouseEvent, machine: Machine) => {
      e.stopPropagation();
      setSelectedMachineId(machine.id);
      setDetailDrawerOpen(true);
    },
    [],
  );

  const selectMachineFromList = useCallback((machine: Machine) => {
    setSelectedMachineId(machine.id);
    setDetailDrawerOpen(true);
  }, []);

  const selectedMachine = (floorplan?.equipment_instances || []).find(
    (m) => m.id === selectedMachineId,
  );

  if (loading || !floorplan) {
    return <PageLoader message="กำลังโหลดข้อมูล..." />;
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm px-6 py-3 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase  text-gray-400">
            Floorplan
          </p>
          <h1 className="text-3xl font-bold text-gray-900 truncate leading-tight">
            {floorplan.name}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={() => nav("/floorplan/editor")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-lime-400"
            >
              <Edit size={15} />
              แก้ไข
            </button>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-400"
            aria-label={sidebarOpen ? "ซ่อน sidebar" : "แสดง sidebar"}
          >
            {sidebarOpen ? (
              <PanelRightClose size={18} />
            ) : (
              <PanelRightOpen size={18} />
            )}
          </button>
        </div>
      </header>

      {/* Main */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Canvas */}
        <main className="flex-1 min-h-0 relative bg-gray-100 overflow-hidden">
          <div
            ref={containerRef}
            className={`absolute inset-0 ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
            {...handlers}
          >
            <FloorplanCanvasCore
              widthPx={canvasWidth}
              heightPx={canvasHeight}
              gridSizePx={
                floorSettings.gridSizeM * floorSettings.pixelsPerMeter
              }
              scale={zoom}
              panOffset={panOffset}
              floorSettings={floorSettings}
              machines={floorplan.equipment_instances || []}
              walls={floorplan.walls || []}
              selectedItem={
                selectedMachineId
                  ? { id: selectedMachineId, type: "machine" }
                  : null
              }
              hoveredItem={
                hoveredMachineId
                  ? { id: hoveredMachineId, type: "machine" }
                  : null
              }
              onMachineClick={handleMachineClick}
              onBackgroundMouseDown={() => setSelectedMachineId(null)}
              onMouseEnterItem={(id, type) =>
                type === "machine" && setHoveredMachineId(id)
              }
              onMouseLeaveItem={() => setHoveredMachineId(null)}
              isEditor={false}
            />
          </div>

          <StatusLegend className="absolute top-4 left-4 z-20" />

          <ZoomControls
            zoom={zoom}
            onZoomChange={setZoom}
            onFit={fitToScreen}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            className="absolute bottom-4 right-4 z-20"
          />
        </main>

        {/* Mobile overlay backdrop — only rendered when sidebar open on mobile */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/40 z-30"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar
            Mobile: fixed, slides in from right over the canvas
            Desktop: inline panel, shown/hidden via width transition (no translate needed)
        */}
        <aside
          className={`
            fixed md:relative inset-y-0 right-0
            bg-white border-l border-gray-200
            flex flex-col z-40
            transition-[width,transform] duration-300 ease-in-out
            ${sidebarOpen
              ? "w-80 translate-x-0"
              : "w-0 translate-x-full md:translate-x-0 md:w-0 overflow-hidden"
            }
          `}
        >
          {/* Inner wrapper keeps content from wrapping during width transition */}
          <div className="w-80 flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 shrink-0">
              <input
                type="text"
                placeholder="ค้นหาเครื่องจักร..."
                value={filters.searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 bg-gray-50 placeholder:text-gray-400"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredMachines.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-sm font-medium text-gray-600">
                    ไม่พบเครื่องจักร
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    ลองเปลี่ยนคำค้นหา
                  </p>
                </div>
              ) : (
                filteredMachines.map((m) => (
                  <MachineCard
                    key={m.id}
                    machine={m}
                    isSelected={selectedMachineId === m.id}
                    onClick={() => {
                      selectMachineFromList(m);
                      if (window.innerWidth < 768) setSidebarOpen(false);
                    }}
                  />
                ))
              )}
            </div>

            {/* Footer count */}
            <div className="px-4 py-2 border-t border-gray-100 shrink-0">
              <p className="text-xs text-gray-400 text-center">
                {filteredMachines.length} เครื่องจักร
              </p>
            </div>
          </div>
        </aside>
      </div>

      <EquipmentDetailDrawer
        machine={selectedMachine || null}
        isOpen={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
      />
    </div>
  );
}
