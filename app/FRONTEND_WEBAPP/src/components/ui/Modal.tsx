import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    className?: string;
    footer?: React.ReactNode;
}

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    className,
    footer,
}: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <div
                ref={modalRef}
                className={cn(
                    "relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200",
                    className
                )}
            >
                <div className="flex items-center justify-between border-b border-gray-100 p-4 sm:p-6">
                    <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="rounded-xl bg-gray-50 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all active:scale-95"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="max-h-[70vh] overflow-y-auto p-4 sm:p-6">{children}</div>
                {footer && (
                    <div className="border-t border-gray-100 bg-gray-50/50 p-4 sm:p-6">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
