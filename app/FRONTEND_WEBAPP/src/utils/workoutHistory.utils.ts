import type { WorkoutLog, WorkoutLogExercise } from "../types/workout.types";

/**
 * Group workout logs by date string (YYYY-MM-DD)
 */
export function groupLogsByDate(logs: WorkoutLog[]) {
    const groups: Record<string, WorkoutLog[]> = {};

    logs.forEach((log) => {
        const date = new Date(log.workout_date).toISOString().split("T")[0];
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(log);
    });

    return Object.entries(groups)
        .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
        .map(([date, logs]) => ({
            date,
            logs: logs.sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime())
        }));
}

/**
 * Calculate total volume for a workout session
 * Volume = sets * reps * weight
 */
export function calculateSessionVolume(exercises: WorkoutLogExercise[]) {
    return exercises.reduce((acc, ex) => {
        return acc + (ex.sets_completed * ex.reps_completed * (ex.weight_used || 0));
    }, 0);
}

/**
 * Format date to Thai format (e.g., 1 มี.ค. 2026)
 */
export function formatThaiDate(date: Date | string, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("th-TH", options);
}

/**
 * Calculate completion percentage from completeness object
 */
export function calculateCompletionPercent(completeness?: { total_prescribed: number; completed_slots: number }) {
    if (!completeness || completeness.total_prescribed === 0) return 0;
    return Math.round((completeness.completed_slots / completeness.total_prescribed) * 100);
}

/**
 * Get simple day name in Thai (e.g., อา., จ.)
 */
export function getThaiDayName(date: Date | string) {
    const d = typeof date === "string" ? new Date(date) : date;
    const days = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
    return days[d.getDay()];
}

/**
 * Get Thai Month Name for Calendar
 */
export function getThaiMonthYear(month: number, year: number) {
    const months = [
        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    return `${months[month]} ${year + 543}`;
}
