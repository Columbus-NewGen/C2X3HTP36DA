/**
 * Trainer Dashboard — shared utility functions
 */

/** Format an ISO date string to Thai locale (short month + day + year) */
export const formatDate = (iso?: string | null): string => {
    if (!iso) return "—";
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
        ? "—"
        : d.toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
};

/** Format to Thai date + time (short month, day, HH:mm) */
export const formatDateTime = (iso: string): string => {
    const d = new Date(iso);
    return d.toLocaleDateString("th-TH", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

/** Extract uppercase initials from a full name */
export const initials = (name: string): string =>
    name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

/** Map API status codes to professional Thai labels */
export const statusLabel = (s: string): string => {
    switch (s) {
        case "ACTIVE":
            return "ปกติ";
        case "AT_RISK":
            return "เสี่ยง";
        case "FAILING":
            return "ต่ำกว่าเป้า";
        default:
            return s;
    }
};

/**
 * Muscle‐name mappings — bridge between the Trainer progress API
 * names and the react‐body‐highlighter slug format.
 *
 * NOTE: for the exercise-detail pages we already have `muscleBodyMap.ts`.
 * These two maps are intentionally kept separate because the Trainer
 * progress API returns a different set of canonical names.
 */
export const MUSCLE_MAP: Record<string, string> = {
    Chest: "chest",
    "Upper Back": "upper-back",
    "Lower Back": "lower-back",
    "Anterior Deltoid": "front-deltoids",
    "Lateral Deltoid": "front-deltoids",
    "Posterior Deltoid": "back-deltoids",
    Trapezius: "trapezius",
    Biceps: "biceps",
    Triceps: "triceps",
    Forearms: "forearms",
    Abdominals: "abs",
    Glutes: "gluteal",
    Quadriceps: "quadriceps",
    Hamstrings: "hamstring",
    Calves: "calves",
};

/** Map from raw API muscle names to the common names used by MUSCLE_MAP */
export const API_TO_COMMON: Record<string, string> = {
    "Pectoralis Major": "Chest",
    Quadriceps: "Quadriceps",
    Glutes: "Glutes",
    Hamstrings: "Hamstrings",
    "Latissimus Dorsi": "Upper Back",
    Trapezius: "Trapezius",
    "Biceps Brachii": "Biceps",
    "Triceps Brachii": "Triceps",
    Abdominals: "Abdominals",
    "Anterior Deltoid": "Anterior Deltoid",
    "Lateral Deltoid": "Lateral Deltoid",
    "Posterior Deltoid": "Posterior Deltoid",
    Rhomboids: "Upper Back",
    "Erector Spinae": "Lower Back",
    Gastrocnemius: "Calves",
};

/** Shared intensity color palette for the body highlighter */
export const INTENSITY_COLORS = [
    "#d9f99d",
    "#bef264",
    "#84cc16",
    "#65a30d",
    "#4d7c0f",
] as const;
