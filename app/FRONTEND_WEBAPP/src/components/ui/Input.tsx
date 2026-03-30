import React from "react";
import { cn } from "../../utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export function Input({ className, ...props }: InputProps) {
    return (
        <input
            {...props}
            className={cn(
                "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-base outline-none transition-all focus:border-lime-400 focus:ring-2 focus:ring-lime-500/20 disabled:bg-gray-50 disabled:text-gray-500",
                className
            )}
        />
    );
}
