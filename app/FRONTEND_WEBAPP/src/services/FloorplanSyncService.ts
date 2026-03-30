/**
 * Floorplan Sync Service
 * - syncFloorplan(floorplanId, initialFloorplan, currentMachines, currentWalls, floorSettings):
 *   Orchestrates the synchronization of floorplan elements (machines and walls) by
 *   calculating diffs and executing create, update, and delete requests in parallel.
 */
import { machinesApi } from "../services/MachinesAPI";
import { wallsApi } from "../services/WallsAPI";
import { floorplanApi } from "../services/FloorplanAPI";
import type { Floorplan, Machine, Wall, UpdateFloorplanRequest, UpdateWallRequest } from "../types/floorplan.types";

interface SyncResult {
    success: boolean;
    message?: string;
    error?: any;
}

export const FloorplanSyncService = {
    /**
     * Syncs the current state of machines and walls with the backend.
     * Calculates diffs (create/update/delete) and executes requests.
     */
    async syncFloorplan(
        floorplanId: number,
        initialFloorplan: Floorplan,
        currentMachines: Machine[],
        currentWalls: Wall[],
        floorSettings: { widthM: number; heightM: number }
    ): Promise<SyncResult> {
        try {
            // 1. Update Floorplan Dimensions
            const updateRequest: Partial<UpdateFloorplanRequest> = {
                canvas_width: floorSettings.widthM * 100,
                canvas_height: floorSettings.heightM * 100,
            };
            await floorplanApi.update(floorplanId, updateRequest);

            // 2. Sync Machines
            const initialMachineMap = new Map((initialFloorplan.equipment_instances || []).map((m: Machine) => [m.id, m]));
            const currMachineMap = new Map(currentMachines.map((m) => [m.id, m]));

            // Logic: If equipment ID changes, we must DELETE and RE-CREATE 
            // because the backend PUT endpoint doesn't support changing equipment_id.

            const machinesToCreate = currentMachines.filter((m) => m.id < 0);
            const machinesToUpdate = currentMachines.filter(
                (m: Machine) => m.id > 0 && isMachineChanged(m, initialMachineMap.get(m.id))
            );
            const machinesToDelete = (initialFloorplan.equipment_instances || []).filter(
                (m: Machine) => !currMachineMap.has(m.id)
            );

            // 3. Sync Walls
            const initialWallMap = new Map((initialFloorplan.walls || []).map((w) => [w.id, w]));
            const currWallMap = new Map(currentWalls.map((w) => [w.id, w]));

            const wallsToCreate = currentWalls.filter((w) => w.id < 0);
            const wallsToUpdate = currentWalls.filter(
                (w) => w.id > 0 && isWallChanged(w, initialWallMap.get(w.id))
            );
            const wallsToDelete = (initialFloorplan.walls || []).filter(
                (w) => !currWallMap.has(w.id)
            );

            // Validate Walls
            const validWallsToCreate = wallsToCreate.filter(validateWall);
            const validWallsToUpdate = wallsToUpdate.filter(validateWall);

            const skippedWalls = wallsToCreate.length - validWallsToCreate.length;

            // Debug logging
            if (import.meta.env.DEV) {
                console.log("Floorplan Sync Debug:", {
                    creating: machinesToCreate.length,
                    updating: machinesToUpdate.length,
                    deleting: machinesToDelete.length
                });
            }

            // Execute All Requests
            await Promise.all([
                ...machinesToCreate.map((m) =>
                    machinesApi.create({
                        floorplan_id: floorplanId,
                        equipment_id: m.equipment_id || m.equipment?.id || 1,
                        label: m.label,
                        position_x: m.position_x,
                        position_y: m.position_y,
                        width: m.width,
                        height: m.height,
                        rotation: m.rotation,
                    })
                ),
                ...machinesToUpdate.map((m) =>
                    machinesApi.update(m.id, {
                        position_x: m.position_x,
                        position_y: m.position_y,
                        width: m.width,
                        height: m.height,
                        rotation: m.rotation,
                        label: m.label,
                        equipment_id: m.equipment_id || m.equipment?.id,
                    })
                ),
                ...machinesToDelete.map((m: Machine) => machinesApi.delete(m.id)),
                ...validWallsToCreate.map((w) =>
                    wallsApi.create({
                        floorplan_id: floorplanId,
                        start_x: w.start_x!,
                        start_y: w.start_y!,
                        end_x: w.end_x!,
                        end_y: w.end_y!,
                        thickness: w.thickness,
                        color: w.color,
                    })
                ),
                ...validWallsToUpdate.map((w) => {
                    const updateData: UpdateWallRequest = {
                        start_x: w.start_x,
                        start_y: w.start_y,
                        end_x: w.end_x,
                        end_y: w.end_y,
                    };
                    if (w.thickness !== undefined && w.thickness !== null) updateData.thickness = w.thickness;
                    if (w.color) updateData.color = w.color;
                    return wallsApi.update(w.id, updateData);
                }),
                ...wallsToDelete.map((w) => wallsApi.delete(w.id)),
            ]);

            const skippedMsg = skippedWalls > 0 ? ` (ข้ามกำแพงที่ไม่สมบูรณ์ ${skippedWalls} รายการ)` : "";

            return {
                success: true,
                message: `บันทึกเรียบร้อย! (สร้าง: ${machinesToCreate.length}, อัปเดต: ${machinesToUpdate.length}, ลบ: ${machinesToDelete.length})${skippedMsg}`,
            };
        } catch (err: any) {
            console.error("Sync failed", err);
            return {
                success: false,
                error: err.response?.data || err.message,
            };
        }
    },
};

// --- Helpers ---

function isMachineChanged(curr: Machine, orig?: Machine) {
    if (!orig) return true;

    const currEqId = Number(curr.equipment_id || curr.equipment?.id || 0);
    const origEqId = Number(orig.equipment_id || orig.equipment?.id || 0);

    const idChanged = currEqId !== origEqId && currEqId !== 0;
    const nameChanged = curr.equipment?.equipment_name !== orig.equipment?.equipment_name;
    const labelChanged = curr.label !== orig.label;
    const statusChanged = curr.status !== orig.status;

    const posChanged =
        Math.abs(curr.position_x - orig.position_x) > 0.1 ||
        Math.abs(curr.position_y - orig.position_y) > 0.1;

    const sizeChanged =
        Math.abs(curr.width - orig.width) > 0.1 ||
        Math.abs(curr.height - orig.height) > 0.1;

    const rotationChanged = Math.abs((curr.rotation || 0) - (orig.rotation || 0)) > 0.1;

    const changed = idChanged || nameChanged || labelChanged || statusChanged || posChanged || sizeChanged || rotationChanged;

    if (changed && import.meta.env.DEV) {
        console.warn(`[SYNC] Machine ${curr.id} (${curr.label}) changes detected:`, {
            type: idChanged || nameChanged ? `ID: ${origEqId} -> ${currEqId}` : "None",
            label: labelChanged ? `"${orig.label}" -> "${curr.label}"` : "None",
            status: statusChanged ? `${orig.status} -> ${curr.status}` : "None",
            geometry: posChanged || sizeChanged || rotationChanged ? "Yes" : "No"
        });
    }

    return changed;
}

function isWallChanged(curr: Wall, orig?: Wall) {
    if (!orig) return true;
    return (
        Math.abs(curr.start_x - orig.start_x) > 0.1 ||
        Math.abs(curr.start_y - orig.start_y) > 0.1 ||
        Math.abs(curr.end_x - orig.end_x) > 0.1 ||
        Math.abs(curr.end_y - orig.end_y) > 0.1 ||
        Math.abs(curr.thickness - orig.thickness) > 0.1 ||
        curr.color !== orig.color
    );
}

function validateWall(w: Wall): boolean {
    const hasValidCoordinates =
        !isNaN(w.start_x) && isFinite(w.start_x) &&
        !isNaN(w.start_y) && isFinite(w.start_y) &&
        !isNaN(w.end_x) && isFinite(w.end_x) &&
        !isNaN(w.end_y) && isFinite(w.end_y);

    const hasLength =
        Math.abs(w.end_x - w.start_x) > 0.01 ||
        Math.abs(w.end_y - w.start_y) > 0.01;

    return hasValidCoordinates && hasLength;
}
