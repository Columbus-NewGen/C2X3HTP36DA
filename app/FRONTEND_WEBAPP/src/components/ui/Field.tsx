import React from "react";
import { AlertCircle } from "lucide-react";

export interface FieldProps {
    label: string;
    hint?: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
}

export function Field({
    label,
    hint,
    error,
    required,
    children,
}: FieldProps) {
    return (
        <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
                <label className="text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-rose-500 ml-1">*</span>}
                </label>
                {hint && <div className="text-xs text-gray-500">{hint}</div>}
            </div>
            {children}
            {error && (
                <div className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                </div>
            )}
        </div>
    );
}
