/**
 * FloorSettingsPanel Component
 * Floor configuration settings for the editor
 */

import type { FloorSettings } from "../../types/floorplan.types";

export interface FloorSettingsPanelProps {
    settings: FloorSettings;
    onSettingsChange: (settings: FloorSettings) => void;
}

export function FloorSettingsPanel({
    settings,
    onSettingsChange,
}: FloorSettingsPanelProps) {
    const updateSetting = <K extends keyof FloorSettings>(
        key: K,
        value: FloorSettings[K]
    ) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    const totalArea = settings.widthM * settings.heightM;

    return (
        <div className="space-y-4">
            {/* Floor Width */}
            <div>
                <label className="block text-gray-600 text-xs mb-1">
                    Floor Width (m)
                </label>
                <input
                    type="number"
                    value={settings.widthM}
                    onChange={(e) => updateSetting("widthM", Number(e.target.value))}
                    min="5"
                    max="100"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-lime-400 outline-none"
                />
            </div>

            {/* Floor Height */}
            <div>
                <label className="block text-gray-600 text-xs mb-1">
                    Floor Height (m)
                </label>
                <input
                    type="number"
                    value={settings.heightM}
                    onChange={(e) => updateSetting("heightM", Number(e.target.value))}
                    min="5"
                    max="100"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-lime-400 outline-none"
                />
            </div>

            {/* Grid Size */}
            <div>
                <label className="block text-gray-600 text-xs mb-1">
                    Grid Size (m)
                </label>
                <select
                    value={settings.gridSizeM}
                    onChange={(e) => updateSetting("gridSizeM", Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-lime-400 outline-none"
                >
                    <option value="0.1">0.1m</option>
                    <option value="0.5">0.5m</option>
                    <option value="1">1m</option>
                    <option value="2">2m</option>
                </select>
            </div>

            {/* Snap to Grid Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={settings.snapToGrid}
                    onChange={(e) => updateSetting("snapToGrid", e.target.checked)}
                    className="rounded border-gray-300 text-lime-500"
                />
                <span className="text-gray-700 text-sm">Snap to Grid</span>
            </label>

            {/* Total Area Display */}
            <div className="pt-4 border-t border-gray-200">
                <p className="text-gray-600 text-xs">
                    Total Area:{" "}
                    <span className="font-semibold text-gray-900">
                        {totalArea} m²
                    </span>
                </p>
            </div>
        </div>
    );
}
