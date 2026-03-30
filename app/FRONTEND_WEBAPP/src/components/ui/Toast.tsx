import React, { useEffect, useState, useCallback, useRef } from "react";
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react";
import { cn } from "../../utils/cn";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
    id: number;
    type: ToastType;
    message: string;
}

interface ToastProps {
    toast: Toast;
    onClose: (id: number) => void;
}

const ToastItem: React.FC<ToastProps> = ({ toast, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Animate in
        const timer = setTimeout(() => setVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = useCallback(() => {
        setVisible(false);
        // Wait for animation out
        setTimeout(() => onClose(toast.id), 300);
    }, [toast.id, onClose]);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, 4000);
        return () => clearTimeout(timer);
    }, [handleClose]);

    const icons = {
        success: <CheckCircle2 className="h-5 w-5 text-lime-500" />,
        error: <AlertCircle className="h-5 w-5 text-rose-500" />,
        info: <Info className="h-5 w-5 text-blue-500" />,
        warning: <AlertCircle className="h-5 w-5 text-amber-500" />,
    };

    const bgStyles = {
        success: "bg-white border-lime-100",
        error: "bg-white border-rose-100",
        info: "bg-white border-blue-100",
        warning: "bg-white border-amber-100",
    };

    return (
        <div
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl border bg-white shadow-xl transition-all duration-300 pointer-events-auto min-w-[280px] max-w-sm",
                bgStyles[toast.type],
                visible ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95"
            )}
        >
            <div className="shrink-0">{icons[toast.type]}</div>
            <p className="flex-1 text-sm font-bold text-gray-900 leading-tight">
                {toast.message}
            </p>
            <button
                onClick={handleClose}
                className="shrink-0 p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
};

export interface ToastContainerProps {
    toasts: Toast[];
    onClose: (id: number) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
    return (
        <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onClose={onClose} />
            ))}
        </div>
    );
};

export function useToasts() {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const idRef = useRef(0);

    const addToast = useCallback((type: ToastType, message: string) => {
        const id = ++idRef.current;
        setToasts((prev) => [...prev, { id, type, message }]);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return { toasts, addToast, removeToast };
}
