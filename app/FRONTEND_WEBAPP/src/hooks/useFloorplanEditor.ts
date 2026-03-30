/**
 * useFloorplanEditor Hook
 * Manages editor-specific logic: selection, dragging, history
 */

import { useState, useCallback, useEffect, useRef } from "react";
import type {
  Machine,
  Wall,
  SelectedItem,
  FloorSettings,
  HistoryAction,
  DragOffset,
  MachineFormData,
  HoveredItem,
  WallFormData,
  WallPreview,
} from "../types/floorplan.types";
import {
  snapToGrid as snapToGridUtil,
  metersToCm,
  getDefaultMachineImage,
} from "../utils/floorplan.utils";

export interface UseFloorplanEditorOptions {
  initialMachines: Machine[];
  initialWalls: Wall[];
  floorSettings: FloorSettings;
  zoom: number;
  panOffset: { x: number; y: number };
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function useFloorplanEditor({
  initialMachines,
  initialWalls,
  floorSettings,
  zoom,
  panOffset,
  containerRef,
}: UseFloorplanEditorOptions) {
  const canvasRef = useRef<HTMLDivElement>(null);

  const [machines, setMachines] = useState<Machine[]>(initialMachines);
  const [walls, setWalls] = useState<Wall[]>(initialWalls);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [hoveredItem, setHoveredItem] = useState<HoveredItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<DragOffset>({ x: 0, y: 0 });
  const [wallPreview, setWallPreview] = useState<WallPreview | null>(null);
  const wallDrawStartRef = useRef<{ x: number; y: number } | null>(null);

  // History management
  const [history, setHistory] = useState<HistoryAction[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Use refs to track previous values and prevent unnecessary updates
  const prevInitialMachinesRef = useRef<string>(
    JSON.stringify(initialMachines)
  );
  const prevInitialWallsRef = useRef<string>(JSON.stringify(initialWalls));
  const isInitialMountMachinesRef = useRef(true);
  const isInitialMountWallsRef = useRef(true);

  // Sync with initial data when it loads (only when data actually changes)
  useEffect(() => {
    // Skip on initial mount (state already initialized with initialMachines)
    if (isInitialMountMachinesRef.current) {
      isInitialMountMachinesRef.current = false;
      prevInitialMachinesRef.current = JSON.stringify(initialMachines);
      return;
    }

    // Only update if the data actually changed (deep comparison by JSON)
    const currJson = JSON.stringify(initialMachines);
    if (prevInitialMachinesRef.current !== currJson) {
      setMachines(initialMachines);
      prevInitialMachinesRef.current = currJson;
    }
  }, [initialMachines]);

  // Sync walls with initial data (only when data actually changes)
  useEffect(() => {
    // Skip on initial mount (state already initialized with initialWalls)
    if (isInitialMountWallsRef.current) {
      isInitialMountWallsRef.current = false;
      prevInitialWallsRef.current = JSON.stringify(initialWalls);
      return;
    }

    // Only update if the data actually changed (deep comparison by JSON)
    const currJson = JSON.stringify(initialWalls);
    if (prevInitialWallsRef.current !== currJson) {
      setWalls(initialWalls);
      prevInitialWallsRef.current = currJson;
    }
  }, [initialWalls]);

  /**
   * Save current state to history
   */
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ machines: [...machines], walls: [...walls] });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex, machines, walls]);

  /**
   * Undo last action
   */
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setMachines(prevState.machines);
      setWalls(prevState.walls);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  /**
   * Redo last undone action
   */
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setMachines(nextState.machines);
      setWalls(nextState.walls);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  /**
   * Handle machine mouse down (start dragging)
   */
  const handleMachineMouseDown = useCallback(
    (e: React.MouseEvent, machine: Machine) => {
      e.stopPropagation();
      if (e.button !== 0) return;

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left - panOffset.x) / zoom;
      const y = (e.clientY - rect.top - panOffset.y) / zoom;

      setSelectedItem({ id: machine.id, type: "machine" });

      const machineX =
        (machine.position_x / 100) * floorSettings.pixelsPerMeter;
      const machineY =
        (machine.position_y / 100) * floorSettings.pixelsPerMeter;

      setDragOffset({ x: x - machineX, y: y - machineY });
      setSelectedItem({ id: machine.id, type: "machine" });
      setIsDragging(true);
    },
    [containerRef, panOffset, zoom, floorSettings.pixelsPerMeter]
  );

  /**
   * Handle wall mouse down (selection)
   */
  const handleWallMouseDown = useCallback((e: React.MouseEvent, wall: Wall) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    setSelectedItem({ id: wall.id, type: "wall" });
    setHoveredItem(null);
  }, []);

  /**
   * Handle canvas mouse move (drag machine)
   */
  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging && selectedItem && selectedItem.type === "machine") {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left - panOffset.x) / zoom - dragOffset.x;
        const y = (e.clientY - rect.top - panOffset.y) / zoom - dragOffset.y;

        let xM = x / floorSettings.pixelsPerMeter;
        let yM = y / floorSettings.pixelsPerMeter;

        // Snap to grid if enabled
        if (floorSettings.snapToGrid) {
          const snapped = snapToGridUtil(xM, yM, floorSettings.gridSizeM);
          xM = snapped.x;
          yM = snapped.y;
        }

        // Get machine dimensions for boundary checking
        const machine = machines.find((m) => m.id === selectedItem.id);
        if (machine) {
          const widthM = machine.width / 100;
          const heightM = machine.height / 100;

          // Clamp to floor boundaries
          xM = Math.max(0, Math.min(floorSettings.widthM - widthM, xM));
          yM = Math.max(0, Math.min(floorSettings.heightM - heightM, yM));

          // Update machine position
          setMachines((prev) =>
            prev.map((m) =>
              m.id === selectedItem.id
                ? {
                  ...m,
                  position_x: metersToCm(xM),
                  position_y: metersToCm(yM),
                }
                : m
            )
          );
        }
      }
    },
    [
      isDragging,
      selectedItem,
      containerRef,
      panOffset,
      zoom,
      dragOffset,
      floorSettings,
      machines,
    ]
  );

  /**
   * Handle canvas mouse up (stop dragging)
   */
  const handleCanvasMouseUp = useCallback(() => {
    if (isDragging) {
      saveToHistory();
    }
    setIsDragging(false);
  }, [isDragging, saveToHistory]);

  /**
   * Update machine property
   */
  const updateMachine = useCallback(
    (id: number, updates: Partial<Machine>) => {
      setMachines((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
      );
    },
    []
  );

  /**
   * Add new machine at position (meters). Used for canvas click-to-place.
   */
  const addMachineAtPosition = useCallback(
    (formData: MachineFormData, xM: number, yM: number) => {
      const tempId = Math.floor(Math.random() * -1000000);

      const widthM = formData.widthM;
      const heightM = formData.heightM;

      // Center the machine on the click position
      let x = xM - widthM / 2;
      let y = yM - heightM / 2;

      if (floorSettings.snapToGrid) {
        const snapped = snapToGridUtil(x, y, floorSettings.gridSizeM);
        x = snapped.x;
        y = snapped.y;
      }

      x = Math.max(0, Math.min(floorSettings.widthM - widthM, x));
      y = Math.max(0, Math.min(floorSettings.heightM - heightM, y));

      const newMachine: Machine = {
        id: tempId,
        floorplan_id: 0,
        equipment_id: formData.equipmentId || 1,
        label: formData.label,
        status: formData.status,
        position_x: metersToCm(x),
        position_y: metersToCm(y),
        rotation: 0,
        width: metersToCm(formData.widthM),
        height: metersToCm(formData.heightM),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        equipment: {
          id: 0,
          equipment_name: formData.machine,
          equipment_type: formData.machine as any,
          status: formData.status,
          image_url: null,
          image_full_url: null,
        },
        images: [{ url: getDefaultMachineImage(formData.machine) || '' }],
      };

      setMachines((prev) => [...prev, newMachine]);
      saveToHistory();
      return newMachine;
    },
    [saveToHistory, floorSettings]
  );

  /**
   * Add new wall from start/end points (cm). Used for canvas click-drag.
   */
  const addWallFromPoints = useCallback(
    (data: WallFormData, startXCm: number, startYCm: number, endXCm: number, endYCm: number) => {
      const tempId = Math.floor(Math.random() * -1000000);
      const newWall: Wall = {
        id: tempId,
        floorplan_id: 0,
        start_x: startXCm,
        start_y: startYCm,
        end_x: endXCm,
        end_y: endYCm,
        thickness: data.thickness,
        color: "#374151",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setWalls((prev) => [...prev, newWall]);
      saveToHistory();
      return newWall;
    },
    [saveToHistory]
  );

  /** Legacy addMachine (places at center). Prefer addMachineAtPosition. */
  const addMachine = useCallback(
    (formData: MachineFormData) => {
      const cx = floorSettings.widthM / 2 - formData.widthM / 2;
      const cy = floorSettings.heightM / 2 - formData.heightM / 2;
      return addMachineAtPosition(formData, cx, cy);
    },
    [addMachineAtPosition, floorSettings]
  );

  /** Legacy addWall. Prefer addWallFromPoints. */
  const addWall = useCallback(
    (data: WallFormData) => {
      const w = data.orientation === "HORIZONTAL" ? data.lengthM * 100 : data.thickness;
      const h = data.orientation === "VERTICAL" ? data.lengthM * 100 : data.thickness;
      const startX = (floorSettings.widthM * 100) / 2 - w / 2;
      const startY = (floorSettings.heightM * 100) / 2 - h / 2;
      return addWallFromPoints(data, startX, startY, startX + (data.orientation === "HORIZONTAL" ? w : 0), startY + (data.orientation === "VERTICAL" ? h : 0));
    },
    [addWallFromPoints, floorSettings]
  );

  /** Start wall drawing (mouse down on canvas in wall mode) */
  const startWallDraw = useCallback(
    (xCm: number, yCm: number, thickness: number) => {
      wallDrawStartRef.current = { x: xCm, y: yCm };
      setWallPreview({ start_x: xCm, start_y: yCm, end_x: xCm, end_y: yCm, thickness });
    },
    []
  );

  /** Update wall preview during drag */
  const updateWallPreview = useCallback((endXCm: number, endYCm: number) => {
    const start = wallDrawStartRef.current;
    if (!start) return;
    setWallPreview((prev) => (prev ? { ...prev, end_x: endXCm, end_y: endYCm } : null));
  }, []);

  /** Commit wall from drag. Returns new wall or null. */
  const commitWallDraw = useCallback(
    (data: WallFormData) => {
      const start = wallDrawStartRef.current;
      wallDrawStartRef.current = null;
      setWallPreview(null);
      if (!start) return null;
      const dx = Math.abs(start.x - (wallPreview?.end_x ?? start.x));
      const dy = Math.abs(start.y - (wallPreview?.end_y ?? start.y));
      if (dx < 5 && dy < 5) return null; // Ignore tiny clicks
      const endX = wallPreview?.end_x ?? start.x;
      const endY = wallPreview?.end_y ?? start.y;
      return addWallFromPoints(data, start.x, start.y, endX, endY);
    },
    [addWallFromPoints, wallPreview]
  );

  const cancelWallDraw = useCallback(() => {
    wallDrawStartRef.current = null;
    setWallPreview(null);
  }, []);

  /**
   * Delete selected item
   */
  const deleteSelected = useCallback(() => {
    if (!selectedItem) return;

    if (selectedItem.type === "machine") {
      setMachines((prev) => prev.filter((m) => m.id !== selectedItem.id));
    } else {
      setWalls((prev) => prev.filter((w) => w.id !== selectedItem.id));
    }

    setSelectedItem(null);
    saveToHistory();
  }, [selectedItem, saveToHistory]);

  /**
   * Keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" && e.shiftKey) {
          e.preventDefault();
          redo();
        } else if (e.key === "z") {
          e.preventDefault();
          undo();
        }
      }
      if (e.key === "Delete" && selectedItem) {
        deleteSelected();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, selectedItem, deleteSelected]);

  return {
    canvasRef,
    machines,
    walls,
    selectedItem,
    hoveredItem,
    isDragging,
    wallPreview,
    history,
    historyIndex,
    setMachines,
    setWalls,
    setSelectedItem,
    setHoveredItem,
    handleMachineMouseDown,
    handleWallMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    addMachine,
    addMachineAtPosition,
    updateMachine,
    addWall,
    addWallFromPoints,
    startWallDraw,
    updateWallPreview,
    commitWallDraw,
    cancelWallDraw,
    deleteSelected,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  };
}
