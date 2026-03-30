// Shared UI Components for Dashboard
import {
    Users,
    UserRound,

    Clock,
    ArrowUpRight,
    ArrowDownRight,
    Minus,
    Wrench
} from "lucide-react";
import type { KPI, Priority, Trend } from "../../types/dashboard.types";
import { cn } from "../../utils/dashboard.utils";

// KPI Icon Component
export function KpiIcon({ name }: { name: KPI["icon"] }) {
    const config = {
        users: { icon: Users, color: "text-blue-500 bg-blue-50" },
        members: { icon: UserRound, color: "text-emerald-500 bg-emerald-50" },
        machines: { icon: Wrench, color: "text-orange-500 bg-orange-50" },
        clock: { icon: Clock, color: "text-purple-500 bg-purple-50" },
    };
    const { icon: Icon, color } = config[name];
    return (
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl", color)}>
            <Icon className="h-4 w-4" />
        </div>
    );
}

// Priority Dot Component
export function PriorityDot({ p }: { p: Priority }) {
    const color =
        p === "HIGH"
            ? "bg-red-500"
            : p === "MEDIUM"
                ? "bg-orange-400"
                : "bg-gray-300";
    return <div className={cn("h-2 w-2 rounded-full", color)} />;
}

// Sparkline Chart Component
export function Sparkline({ data }: { data: number[] }) {
    const w = 90;
    const h = 24;
    const pad = 3;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = Math.max(1, max - min);

    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * (w - pad * 2) + pad;
        const y = h - ((v - min) / span) * (h - pad * 2) - pad;
        return `${x},${y}`;
    });

    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block">
            <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                points={pts.join(" ")}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-80"
            />
        </svg>
    );
}

// Trend Chip Component
export function TrendChip({ trend, value }: { trend?: Trend; value?: number }) {
    if (!trend || typeof value !== "number") return null;

    const tone =
        trend === "up"
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : trend === "down"
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : "bg-gray-50 text-gray-600 border-gray-200";

    const Icon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold",
                tone
            )}
        >
            <Icon className="h-3.5 w-3.5" />
            {value === 0 ? "0%" : `${value}%`}
        </span>
    );
}
