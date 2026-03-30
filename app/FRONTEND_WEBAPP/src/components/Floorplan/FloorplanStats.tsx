/**
 * FloorplanStats Component
 * Displays floorplan statistics and details
 */

import type { StatItem } from "../../types/floorplan.types";

export interface FloorplanStatsProps {
    stats: StatItem[];
    className?: string;
}

export function FloorplanStats({ stats, className = "" }: FloorplanStatsProps) {
    return (
        <div
            className={`rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-0 shadow-sm overflow-hidden ${className}`}
        >
            <div className="border-b border-gray-100 bg-gray-50/50 px-4 sm:px-6 py-3 sm:py-4">
                <h3 className="text-sm font-semibold text-gray-900">Floor Details</h3>
            </div>
            <div className="divide-y divide-gray-100">
                {stats.map((stat, idx) => (
                    <div
                        key={idx}
                        className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <div className="flex-shrink-0">{stat.icon}</div>
                            <span className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                                {stat.label}
                            </span>
                        </div>
                        <span className="font-bold text-gray-900 text-sm sm:text-base ml-2 flex-shrink-0">{stat.value}</span>
                    </div>
                ))}

                {/* Status Row */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-600">Status</span>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 sm:px-2.5 py-0.5 text-xs font-medium text-emerald-700 flex-shrink-0">
                        Active
                    </span>
                </div>
            </div>
        </div>
    );
}
