import { useState } from "react";
import {
    Edit2,
    Trash2,
    Save,
    ArrowLeftRight,
    ClipboardList,
} from "lucide-react";
import { AuthenticatedImage } from "../ui";
import { resolveImageUrl } from "../../utils/floorplan.utils";
import type { ExerciseRowProps } from "../../types/trainerDashboard.types";

export default function ExerciseRow({
    exercise,
    onUpdate,
    onDelete,
    onReplace,
    readOnly = false,
}: ExerciseRowProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [sets, setSets] = useState(exercise.sets);
    const [reps, setReps] = useState(exercise.reps);
    const [weight, setWeight] = useState(exercise.weight || 0);
    const imgUrl = resolveImageUrl(exercise.image_url);

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-200 group gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200/50">
                    {imgUrl ? (
                        <AuthenticatedImage
                            src={imgUrl}
                            alt={exercise.exercise_name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <ClipboardList className="w-5 h-5 text-slate-300" strokeWidth={1.75} />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">
                        {exercise.exercise_name}
                    </p>
                    {!isEditing && (
                        <p className="text-xs font-medium text-slate-500 mt-0.5">
                            {exercise.sets} เซต × {exercise.reps} ครั้ง{" "}
                            {exercise.weight > 0 && `• ${exercise.weight} kg`}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
                {isEditing ? (
                    <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">
                                เซต
                            </span>
                            <input
                                type="number"
                                value={sets}
                                onChange={(e) => setSets(Number(e.target.value))}
                                className="w-10 h-7 text-center text-xs font-bold border-none p-0 focus:ring-0 bg-slate-50 rounded-md"
                            />
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">
                                ครั้ง
                            </span>
                            <input
                                type="number"
                                value={reps}
                                onChange={(e) => setReps(Number(e.target.value))}
                                className="w-10 h-7 text-center text-xs font-bold border-none p-0 focus:ring-0 bg-slate-50 rounded-md"
                            />
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">
                                Kg
                            </span>
                            <input
                                type="number"
                                value={weight}
                                onChange={(e) => setWeight(Number(e.target.value))}
                                className="w-12 h-7 text-center text-xs font-bold border-none p-0 focus:ring-0 bg-slate-50 rounded-md"
                            />
                        </div>
                        <button
                            onClick={() => {
                                onUpdate({ sets, reps, weight });
                                setIsEditing(false);
                            }}
                            className="p-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600 transition-colors shrink-0 shadow-sm flex items-center justify-center"
                        >
                            <Save className="w-4 h-4" strokeWidth={1.75} />
                        </button>
                    </div>
                ) : !readOnly ? (
                    <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0">
                        <button
                            onClick={onReplace}
                            className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all duration-200"
                            title="เปลี่ยนท่า"
                        >
                            <ArrowLeftRight className="w-4 h-4" strokeWidth={1.75} />
                        </button>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all duration-200"
                            title="แก้ไข"
                        >
                            <Edit2 className="w-4 h-4" strokeWidth={1.75} />
                        </button>
                        <button
                            onClick={onDelete}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-200"
                            title="ลบ"
                        >
                            <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
