import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "ghost";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
}

export function Button({
    children,
    onClick,
    variant = "primary",
    size = "md",
    disabled,
    loading,
    className,
    ...props
}: ButtonProps) {
    const base =
        "inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

    const sizeClass =
        size === "sm"
            ? "px-3 h-8 text-sm"
            : size === "lg"
                ? "px-6 py-3 text-base"
                : "px-4 h-10 text-base";

    const variantClass =
        variant === "primary"
            ? "bg-lime-500 text-white hover:bg-lime-600 shadow-sm shadow-lime-200 border-none"
            : variant === "danger"
                ? "bg-rose-500 text-white hover:bg-rose-600 shadow-sm shadow-rose-200 border-none"
                : variant === "secondary"
                    ? "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 font-bold";

    return (
        <button
            className={cn(base, sizeClass, variantClass, className)}
            onClick={onClick}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
}
