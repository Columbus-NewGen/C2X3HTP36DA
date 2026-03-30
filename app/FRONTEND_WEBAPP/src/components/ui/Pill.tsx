import React from "react";
import { cn } from "../../utils/cn";

export interface PillProps {
    children: React.ReactNode;
    tone?: "neutral" | "lime" | "sky" | "amber" | "rose" | "purple";
    className?: string;
}

export function Pill({
    children,
    tone = "neutral",
    className,
}: PillProps) {
    const cls =
        tone === "lime"
            ? "bg-lime-50 text-lime-700 border-lime-200"
            : tone === "sky"
                ? "bg-sky-50 text-sky-700 border-sky-200"
                : tone === "amber"
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : tone === "rose"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : tone === "purple"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-gray-50 text-gray-700 border-gray-200";

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase ",
                cls,
                className
            )}
        >
            {children}
        </span>
    );
}
