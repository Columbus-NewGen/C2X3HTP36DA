import { cn } from "./cn";

export { cn };

export const formatThaiDate = (date: string | Date) =>
    new Date(date).toLocaleDateString("th-TH", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

export const formatShortDate = (date: string | Date) =>
    new Date(date).toLocaleDateString("th-TH", {
        weekday: "short",
        day: "numeric",
        month: "short",
    });

export const toYYYYMMDD = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const addDays = (d: Date, n: number) => {
    const out = new Date(d);
    out.setDate(out.getDate() + n);
    return out;
};

export const getWeekRange = (center: Date) => {
    const day = center.getDay();
    const sunOffset = day === 0 ? 0 : -day;
    const start = addDays(center, sunOffset);
    const end = addDays(start, 6);
    return { start, end };
};

export const getWeekDates = (center: Date): Date[] => {
    const { start } = getWeekRange(center);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

/** ~2 min per exercise, rough estimate */
export const estimateMinutes = (exerciseCount: number) =>
    Math.max(15, Math.min(120, exerciseCount * 2.5));

export const formatMonthYear = (d: Date) =>
    new Date(d).toLocaleDateString("th-TH", { month: "long", year: "numeric" });

/** Week key for grouping: start date YYYY-MM-DD of that week */
export const getWeekKey = (d: Date): string => {
    const { start } = getWeekRange(d);
    return toYYYYMMDD(start);
};

export const getWeekLabel = (weekKey: string, today: Date): string => {
    const weekStart = new Date(weekKey);
    const { start: todayWeekStart } = getWeekRange(today);
    const lastWeekStart = addDays(todayWeekStart, -7);
    if (toYYYYMMDD(weekStart) === toYYYYMMDD(todayWeekStart)) return "สัปดาห์นี้";
    if (toYYYYMMDD(weekStart) === toYYYYMMDD(lastWeekStart)) return "สัปดาห์ที่แล้ว";
    const weekEnd = addDays(weekStart, 6);
    return `${formatShortDate(weekStart)} – ${formatShortDate(weekEnd)}`;
};
