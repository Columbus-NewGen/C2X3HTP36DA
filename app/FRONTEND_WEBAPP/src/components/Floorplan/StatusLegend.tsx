/**
 * StatusLegend Component
 * Displays machine status color legend
 */

export interface StatusLegendProps {
    className?: string;
}

export function StatusLegend({ className = "" }: StatusLegendProps) {
    return (
        <div
            className={`flex items-center gap-4 bg-white/90 backdrop-blur rounded-xl px-4 py-2 border border-gray-200 shadow-sm ${className}`}
        >
            <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#84cc16] shadow-[0_0_8px_rgba(132,204,22,0.4)]" />
                <span className="text-gray-900 text-[10px] font-bold uppercase tracking-wider">Active</span>
            </div>
            {/* Busy Status is removed from schema */}
            <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-gray-700 text-xs font-medium">Maintenance</span>
            </div>
        </div>
    );
}
