import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

export interface DrawerProps {
    open: boolean;
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    onClose: () => void;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export function Drawer({
    open,
    title,
    subtitle,
    onClose,
    children,
    footer,
}: DrawerProps) {
    const panelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        setTimeout(() => {
            const el = panelRef.current?.querySelector<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            el?.focus();
        }, 0);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />
            <div className="absolute inset-y-0 right-0 w-full sm:w-[min(640px,95vw)] flex">
                <div
                    ref={panelRef}
                    className="flex h-full w-full flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300 ease-out"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="flex items-start justify-between gap-2 sm:gap-3 border-b border-gray-100 px-4 sm:px-8 py-4 sm:py-6">
                        <div className="min-w-0 flex-1 pr-2">
                            <div className="truncate text-xl font-bold text-gray-900 ">
                                {title}
                            </div>
                            {subtitle && (
                                <div className="mt-1 text-xs sm:text-sm text-gray-400 font-medium">
                                    {subtitle}
                                </div>
                            )}
                        </div>
                        <button
                            className="shrink-0 rounded-xl bg-gray-50 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all active:scale-95"
                            onClick={onClose}
                            aria-label="ปิด"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">{children}</div>

                    {footer && (
                        <div className="border-t border-gray-100 bg-gray-50/50 px-4 sm:px-8 py-4 sm:py-6">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
