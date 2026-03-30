/**
 * useFloorplanData Hook
 * Centralizes standard floorplan fetching logic (ID = 1)
 */

import { useState, useCallback, useEffect } from "react";
import { floorplanApi } from "../services/FloorplanAPI";
import type { Floorplan } from "../types/floorplan.types";

const FLOORPLAN_ID = 1;

export function useFloorplanData() {
    const [floorplan, setFloorplan] = useState<Floorplan | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFloorplan = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await floorplanApi.getById(FLOORPLAN_ID);
            setFloorplan(data);
        } catch (err: any) {
            console.error("Failed to load floorplan:", err);
            setError(err?.message || "Failed to load floorplan");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFloorplan();
    }, [fetchFloorplan]);

    return {
        floorplan,
        loading,
        error,
        refresh: fetchFloorplan,
    };
}
