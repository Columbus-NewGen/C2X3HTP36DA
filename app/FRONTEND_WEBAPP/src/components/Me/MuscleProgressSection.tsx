import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Zap, Trophy, Flame, X } from "lucide-react";
import Model from "react-body-highlighter";
const ModelAny = Model as any;

interface TrendItem {
    name: string;
    frequency: number;
    last_trained: string;
}

interface MuscleProgressSectionProps {
    exercisePrs?: {
        exercise_name: string;
        max_weight: number;
        max_reps?: number;
        max_volume?: number;
        achieved_at?: string;
    }[];
    muscleTrends?: TrendItem[];
    exerciseTrends?: TrendItem[];
    isLoading: boolean;
}

const MUSCLE_MAP: Record<string, string> = {
    "Chest": "chest",
    "Upper Back": "upper-back",
    "Lower Back": "lower-back",
    "Anterior Deltoid": "front-deltoids",
    "Lateral Deltoid": "front-deltoids",
    "Posterior Deltoid": "back-deltoids",
    "Trapezius": "trapezius",
    "Biceps": "biceps",
    "Triceps": "triceps",
    "Forearms": "forearms",
    "Abdominals": "abs",
    "Glutes": "gluteal",
    "Quadriceps": "quadriceps",
    "Hamstrings": "hamstring",
    "Calves": "calves",
};



export default function MuscleProgressSection({
    exercisePrs = [],
    muscleTrends = [],
    exerciseTrends = [],
    isLoading,
}: MuscleProgressSectionProps) {
    const [tab, setTab] = useState<"muscle" | "exercise">("muscle");
    const [hoveredItem, setHoveredItem] = useState<TrendItem | null>(null);

    // Normalize API muscle names to display names
    const normalizedMuscleTrends = useMemo(() => {
        const apiToCommon: Record<string, string> = {
            "Pectoralis Major": "Chest",
            "Quadriceps": "Quadriceps",
            "Glutes": "Glutes",
            "Hamstrings": "Hamstrings",
            "Latissimus Dorsi": "Upper Back",
            "Trapezius": "Trapezius",
            "Biceps Brachii": "Biceps",
            "Triceps Brachii": "Triceps",
            "Abdominals": "Abdominals",
            "Anterior Deltoid": "Anterior Deltoid",
            "Lateral Deltoid": "Lateral Deltoid",
            "Posterior Deltoid": "Posterior Deltoid",
            "Rhomboids": "Upper Back",
            "Erector Spinae": "Lower Back",
            "Gastrocnemius": "Calves",
        };
        return muscleTrends.map(t => ({
            ...t,
            displayName: apiToCommon[t.name] || t.name
        }));
    }, [muscleTrends]);

    const stats = useMemo(() => {
        if (!muscleTrends.length) return { max: 1, avg: 0 };
        const max = Math.max(...muscleTrends.map(t => t.frequency), 1);
        const avg = muscleTrends.reduce((acc, t) => acc + t.frequency, 0) / muscleTrends.length;
        return { max, avg };
    }, [muscleTrends]);

    const highlighterData = useMemo(() => {
        if (tab !== "muscle" || !normalizedMuscleTrends.length) return [];

        return normalizedMuscleTrends
            .map((t) => {
                const mappedName = MUSCLE_MAP[t.displayName];
                if (!mappedName) return null;

                const intensity = Math.ceil((t.frequency / stats.max) * 4);

                return {
                    name: t.displayName,
                    muscles: [mappedName],
                    frequency: intensity,
                    actualFrequency: t.frequency
                };
            })
            .filter(Boolean) as any[];
    }, [normalizedMuscleTrends, tab, stats.max]);

    const handleModelClick = (s: any) => {
        const item = normalizedMuscleTrends.find(t => MUSCLE_MAP[t.displayName] === s.muscle);
        if (item) {
            setHoveredItem(item as any);
        }
    };

    if (isLoading) {
        return (
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-neutral-100 animate-pulse h-[400px]" />
        );
    }

    const displayItems = tab === "muscle"
        ? normalizedMuscleTrends.sort((a, b) => b.frequency - a.frequency).slice(0, 6)
        : exerciseTrends.sort((a, b) => b.frequency - a.frequency).slice(0, 6);

    const hasData = displayItems.length > 0;

    return (
        <div className="rounded-2xl sm:rounded-[2.5rem] bg-white p-3 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-neutral-100 overflow-hidden relative">
            <div className="flex flex-col gap-6 sm:gap-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${tab === 'muscle' ? 'bg-lime-50' : 'bg-sky-50'}`}>
                            {tab === "muscle" ? <Flame className="h-5 w-5 sm:h-6 sm:w-6 text-lime-600 fill-lime-600/10" /> : <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-sky-600 fill-sky-600/10" />}
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-neutral-900 leading-tight">
                                {tab === "muscle" ? "สถิติมัดกล้ามเนื้อ" : "สถิติจำนวนครั้งท่าฝึก"}
                            </h2>
                            <p className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase mt-0.5">สมดุลการฝึกซ้อม</p>
                        </div>
                    </div>

                    <div className="flex p-1 sm:p-1.5 rounded-xl sm:rounded-2xl bg-neutral-50 border border-neutral-100 self-start sm:self-auto">
                        <button
                            onClick={() => setTab("muscle")}
                            className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase transition-all duration-300 ${tab === 'muscle' ? 'bg-white text-neutral-900 shadow-sm border border-neutral-100' : 'text-neutral-400 hover:text-neutral-600'}`}
                        >
                            มัดกล้ามเนื้อ
                        </button>
                        <button
                            onClick={() => setTab("exercise")}
                            className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase transition-all duration-300 ${tab === 'exercise' ? 'bg-white text-neutral-900 shadow-sm border border-neutral-100' : 'text-neutral-400 hover:text-neutral-600'}`}
                        >
                            รายชื่อท่า
                        </button>
                    </div>
                </div>

                {tab === 'muscle' && (
                    <div className="relative">
                        <div className="grid grid-cols-2 gap-3 sm:gap-6 bg-neutral-50/50 rounded-2xl sm:rounded-[2rem] p-3 sm:p-5 border border-neutral-100 mb-4">
                            <div className="flex flex-col items-center">
                                <span className="text-xs font-bold text-neutral-300 uppercase mb-4 ">ร่างกายด้านหน้า</span>
                                <div className="w-full max-w-[160px] mx-auto flex items-center justify-center transition-all duration-500">
                                    <ModelAny
                                        data={highlighterData}
                                        type="anterior"
                                        highlightedColors={["#d9f99d", "#bef264", "#84cc16", "#65a30d", "#4d7c0f"]}
                                        bodyColor="#f1f5f9"
                                        onClick={handleModelClick}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-xs font-bold text-neutral-300 uppercase mb-4 ">ร่างกายด้านหลัง</span>
                                <div className="w-full max-w-[160px] mx-auto flex items-center justify-center transition-all duration-500">
                                    <ModelAny
                                        data={highlighterData}
                                        type="posterior"
                                        highlightedColors={["#d9f99d", "#bef264", "#84cc16", "#65a30d", "#4d7c0f"]}
                                        bodyColor="#f1f5f9"
                                        onClick={handleModelClick}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Legend / Detailed Info Overlay */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-2 min-h-[40px]">
                            <div className="flex gap-2 items-center">
                                <span className="text-xs font-bold text-neutral-400 uppercase  mr-1">ความเข้มข้น</span>
                                {[1, 2, 3, 4, 5].map(idx => (
                                    <div key={idx} className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: ["#d9f99d", "#bef264", "#84cc16", "#65a30d", "#4d7c0f"][idx - 1] }} />
                                ))}
                            </div>

                            {hoveredItem && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className="bg-neutral-900 text-white px-4 py-2 rounded-2xl shadow-xl flex items-center gap-4 border border-neutral-800"
                                >
                                    <div>
                                        <div className="text-xs font-bold text-neutral-400 uppercase  leading-none mb-1">Muscle Group</div>
                                        <div className="text-sm font-bold leading-none">{(hoveredItem as any).displayName || hoveredItem.name}</div>
                                    </div>
                                    <div className="w-px h-6 bg-neutral-800" />
                                    <div className="text-center">
                                        <div className="text-xs font-bold text-lime-400">{hoveredItem.frequency}</div>
                                        <div className="text-xs font-bold text-neutral-500 uppercase">เซสชัน</div>
                                    </div>
                                    <button
                                        onClick={() => setHoveredItem(null)}
                                        className="ml-1 text-neutral-500 hover:text-white transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </div>
                )}

                {!hasData && (
                    <div className="py-16 text-center bg-neutral-50 rounded-[2rem] border-2 border-dashed border-neutral-100">
                        <p className="text-sm font-bold text-neutral-400 uppercase ">ยังไม่มีข้อมูลการฝึกในส่วนนี้</p>
                    </div>
                )}

                {/* Training Balance List */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-[10px] font-bold text-neutral-500 uppercase">สัดส่วนการฝึกซ้อม</h3>
                        <span className="text-[10px] font-bold text-neutral-300 uppercase">Top 6</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-2">
                        {displayItems.map((item, i) => {
                            const displayName = (item as any).displayName || item.name;
                            const percent = (item.frequency / stats.max) * 100;
                            const isHigh = item.frequency > stats.avg * 1.5;

                            return (
                                <div key={item.name} className="group">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <span className="text-xs font-bold text-neutral-700 truncate">{displayName}</span>
                                            {isHigh && (
                                                <span className="px-1 py-px rounded bg-orange-50 text-orange-500 text-[9px] font-bold uppercase shrink-0">เน้น</span>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-bold text-neutral-400 tabular-nums shrink-0 ml-2">
                                            {item.frequency}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percent}%` }}
                                            transition={{ duration: 1, ease: "easeOut", delay: i * 0.04 }}
                                            className={`h-full rounded-full ${tab === 'muscle' ? 'bg-lime-500' : 'bg-sky-500'}`}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {exercisePrs.length > 0 && (
                    <div className="pt-4 border-t border-neutral-100">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Trophy className="h-4 w-4 text-amber-500" strokeWidth={2.5} />
                                <h3 className="text-xs font-bold text-neutral-700 uppercase">สถิติ PRs</h3>
                            </div>
                            <span className="text-[10px] font-bold text-neutral-300 uppercase">Top 5</span>
                        </div>

                        {/* Table header */}
                        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 px-2 pb-1.5 border-b border-neutral-100">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase">ท่า</span>
                            <span className="text-[10px] font-bold text-neutral-400 uppercase w-12 text-right">น้ำหนัก</span>
                            <span className="text-[10px] font-bold text-neutral-400 uppercase w-8 text-right">ครั้ง</span>
                            <span className="text-[10px] font-bold text-neutral-400 uppercase w-14 text-right hidden sm:block">วันที่</span>
                        </div>

                        {/* Table rows */}
                        <div className="divide-y divide-neutral-50">
                            {exercisePrs.slice(0, 5).map((pr, idx) => (
                                <div
                                    key={idx}
                                    className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 items-center px-2 py-2 hover:bg-neutral-50/50 transition-colors rounded-lg"
                                >
                                    <span className="text-xs font-bold text-neutral-800 truncate">{pr.exercise_name}</span>
                                    <span className="text-xs font-bold text-amber-600 tabular-nums w-12 text-right">{pr.max_weight}<span className="text-[10px] text-neutral-400 ml-0.5">kg</span></span>
                                    <span className="text-xs font-bold text-neutral-500 tabular-nums w-8 text-right">{pr.max_reps || '—'}</span>
                                    <span className="text-[10px] font-bold text-neutral-400 w-14 text-right hidden sm:block">
                                        {pr.achieved_at ? new Date(pr.achieved_at).toLocaleDateString("th-TH", { month: "short", day: "numeric" }) : '—'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
