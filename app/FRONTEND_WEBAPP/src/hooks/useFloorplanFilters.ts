import { useState, useMemo } from "react";
import type { Machine, MachineStatus, FloorplanFilters } from "../types/floorplan.types";

export function useFloorplanFilters(machines: Machine[]) {
    const [filters, setFilters] = useState<FloorplanFilters>({
        searchQuery: "",
        statusFilter: "ALL",
    });

    /**
     * Filter machines based on current filters
     */
    const filteredMachines = useMemo(() => {
        return machines.filter((machine) => {
            const name = machine.label || machine.equipment?.equipment_name || "";
            const eqType = machine.equipment?.equipment_type || "";

            const matchesSearch =
                name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                eqType.toLowerCase().includes(filters.searchQuery.toLowerCase());

            const matchesStatus =
                filters.statusFilter === "ALL" ||
                machine.status === filters.statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [machines, filters]);

    /**
     * Update search query
     */
    const setSearchQuery = (query: string) => {
        setFilters((prev) => ({ ...prev, searchQuery: query }));
    };

    /**
     * Update status filter
     */
    const setStatusFilter = (status: MachineStatus | "ALL") => {
        setFilters((prev) => ({ ...prev, statusFilter: status }));
    };

    /**
     * Reset all filters
     */
    const resetFilters = () => {
        setFilters({
            searchQuery: "",
            statusFilter: "ALL",
        });
    };

    return {
        filters,
        filteredMachines,
        setSearchQuery,
        setStatusFilter,
        resetFilters,
    };
}
