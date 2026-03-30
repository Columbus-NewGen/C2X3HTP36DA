import React from "react";
import { cn } from "../../utils/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

export function Textarea({ className, ...props }: TextareaProps) {
    return (
        <textarea
            {...props}
            className={cn(
                "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-lime-400 focus:ring-2 focus:ring-lime-500/20 resize-none disabled:bg-gray-50 disabled:text-gray-500",
                className
            )}
        />
    );
}
