import type { WallFormData } from "../../types/floorplan.types";

export interface WallFormPanelProps {
    formData: WallFormData;
    onFormChange: (data: WallFormData) => void;
    onAdd: () => void;
}

export function WallFormPanel({
    formData,
    onFormChange,
    onAdd,
}: WallFormPanelProps) {
    const updateField = <K extends keyof WallFormData>(
        field: K,
        value: WallFormData[K]
    ) => {
        onFormChange({ ...formData, [field]: value });
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                {/* Orientation Toggle */}
                <div>
                    <label className="block text-xs uppercase font-medium text-gray-500 mb-2 ">Orientation</label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                        <button
                            onClick={() => updateField("orientation", "HORIZONTAL")}
                            className={`py-2 rounded-lg text-xs font-medium transition-all ${formData.orientation === "HORIZONTAL"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Horizontal
                        </button>
                        <button
                            onClick={() => updateField("orientation", "VERTICAL")}
                            className={`py-2 rounded-lg text-xs font-medium transition-all ${formData.orientation === "VERTICAL"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Vertical
                        </button>
                    </div>
                </div>

                {/* Dimensions */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs uppercase font-medium text-gray-500 mb-1.5 ">Length (m)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="1"
                            value={formData.lengthM}
                            onChange={(e) => updateField("lengthM", Math.max(1, Number(e.target.value)))}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-lime-500 focus:ring-4 focus:ring-lime-500/10 outline-none transition-all shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase font-medium text-gray-500 mb-1.5 ">Thickness (cm)</label>
                        <input
                            type="number"
                            step="1"
                            min="20"
                            max="50"
                            value={formData.thickness}
                            onChange={(e) => updateField("thickness", Math.max(20, Number(e.target.value)))}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-lime-500 focus:ring-4 focus:ring-lime-500/10 outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
                    <p className="text-xs text-gray-400 font-medium italic">
                        Newly added walls will appear at the center of the floorplan.
                    </p>
                </div>

                {/* Add Button */}
                <button
                    onClick={onAdd}
                    className="w-full py-3 rounded-2xl bg-gray-900 text-white font-medium text-sm hover:bg-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                >
                    <span className="text-lime-400">╋</span>
                    Add Partition Wall
                </button>
            </div>
        </div>
    );
}
