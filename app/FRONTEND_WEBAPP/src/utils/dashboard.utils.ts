// Dashboard utility functions

export function cn(...xs: Array<string | false | undefined | null>) {
    return xs.filter(Boolean).join(" ");
}

export function toMin(hhmm: string) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
}

export function getTodaySchedule(hours: {
    weekdays: { open: string; close: string };
    weekends: { open: string; close: string };
}) {
    const day = new Date().getDay(); // 0=Sun ... 6=Sat
    const isWeekend = day === 0 || day === 6;
    return isWeekend ? hours.weekends : hours.weekdays;
}

export function calcOpenNow(hours: {
    weekdays: { open: string; close: string };
    weekends: { open: string; close: string };
}) {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const sch = getTodaySchedule(hours);
    return nowMin >= toMin(sch.open) && nowMin < toMin(sch.close);
}

export function parseFraction(v: string | number) {
    if (typeof v !== "string") return null;
    const m = v.match(/^(\d+)\s*\/\s*(\d+)$/);
    if (!m) return null;
    const a = Number(m[1]);
    const b = Number(m[2]);
    if (!b) return null;
    return { a, b, pct: a / b };
}
