import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Download,
    Loader2,
    Activity
} from "lucide-react";
import { toPng } from 'html-to-image';
import Model from "react-body-highlighter";
import { formatThaiDate } from "../../utils/workout.utils";
import { exerciseApi } from "../../services/ExerciseAPI";

const ModelAny = Model as any;

interface ExerciseLogEntry {
    exercise_id: number;
    exercise_name?: string;
    sets_completed: number;
    reps_completed: number;
    weight_used?: number;
}

interface WorkoutPosterModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        sessionName: string;
        exercisesCount: number;
        durationMinutes: number;
        xpGained: number;
        exercises: ExerciseLogEntry[];
    };
}

const MUSCLE_MAP: Record<string, string> = {
    "Chest": "chest",
    "Pectoralis Major": "chest",
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
    "Latissimus Dorsi": "upper-back",
    "Rhomboids": "upper-back",
    "Erector Spinae": "lower-back",
};

/* Checkerboard CSS for transparent preview */
const CHECKER_BG = `repeating-conic-gradient(#808080 0% 25%, #b0b0b0 0% 50%) 50% / 16px 16px`;

export function WorkoutPosterModal({ isOpen, onClose, data }: WorkoutPosterModalProps) {
    const posterRef = useRef<HTMLDivElement>(null);
    const [downloading, setDownloading] = useState(false);
    const [loadingMuscles, setLoadingMuscles] = useState(false);
    const [muscleData, setMuscleData] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen && data.exercises.length > 0) {
            fetchMuscles();
        }
    }, [isOpen, data.exercises]);

    const fetchMuscles = async () => {
        setLoadingMuscles(true);
        try {
            const allMuscles = await Promise.all(
                data.exercises.map(ex => exerciseApi.getMuscles(ex.exercise_id))
            );
            const counts: Record<string, number> = {};
            allMuscles.forEach(res => {
                res.muscles.forEach(m => {
                    const mappedName = MUSCLE_MAP[m.muscle_name] || MUSCLE_MAP[m.body_region];
                    if (mappedName) counts[mappedName] = (counts[mappedName] || 0) + 1;
                });
            });
            const max = Math.max(...Object.values(counts), 1);
            setMuscleData(Object.entries(counts).map(([name, count]) => ({
                name, muscles: [name], frequency: Math.ceil((count / max) * 5)
            })));
        } catch (err) {
            console.error("Failed to fetch muscle data", err);
        } finally {
            setLoadingMuscles(false);
        }
    };

    const handleDownload = async () => {
        if (!posterRef.current) return;
        setDownloading(true);
        try {
            await new Promise(r => setTimeout(r, 800));
            const dataUrl = await toPng(posterRef.current, {
                cacheBust: true,
                pixelRatio: 3,
                backgroundColor: '', // TRUE TRANSPARENT
            });
            const link = document.createElement("a");
            link.download = `gymmate-${data.sessionName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error("Download failed:", err);
            alert("ดาวน์โหลดไม่สำเร็จ โปรดลองอีกครั้ง");
        } finally {
            setDownloading(false);
        }
    };

    if (!isOpen) return null;
    const totalSets = data.exercises.reduce((s, e) => s + (e.sets_completed || 0), 0);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] overflow-y-auto">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/95"
                    />

                    {/* Top-right close button for mobile / desktop */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="fixed top-4 right-4 z-[110] h-9 w-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-zinc-200 hover:bg-white/20 active:scale-95"
                    >
                        ✕
                    </button>

                    <div className="flex min-h-full justify-center p-4 sm:p-6 relative pointer-events-none">
                        <div className="relative w-full max-w-md flex flex-col items-center py-6 my-auto pointer-events-auto">

                            {/* Transparent Preview Background (checkerboard) */}
                            <div
                                className="scale-[0.85] sm:scale-100 origin-top transition-transform"
                                style={{
                                    background: CHECKER_BG,
                                    borderRadius: 24,
                                    padding: 0,
                                }}
                            >
                                {/* ═══ PNG CAPTURE ZONE ═══ */}
                                <div
                                    ref={posterRef}
                                    style={{
                                        width: 350,
                                        padding: 10,
                                        backgroundColor: 'transparent',
                                    }}
                                >
                                    {/* Card with visible semi-transparent bg */}
                                    <div
                                        style={{
                                            backgroundColor: 'rgba(10,10,12,0.92)',
                                            borderRadius: 24,
                                            border: '1px solid rgba(255,255,255,0.12)',
                                            padding: '20px 20px',
                                            display: 'flex',
                                            flexDirection: 'column' as const,
                                            gap: 16,
                                            boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
                                        }}
                                    >
                                        {/* ── Header ── */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <img crossOrigin="anonymous" src="/logo-gymmate512.png" style={{ width: 30, height: 30, objectFit: 'contain' }} alt="" />
                                                <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.15em', color: '#ffffff' }}>GYMMATE</span>
                                            </div>
                                            <span style={{ fontSize: 10, fontWeight: 700, color: '#71717a' }}>{formatThaiDate(new Date())}</span>
                                        </div>

                                        {/* ── Title ── */}
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                                                <div style={{ width: 4, height: 22, backgroundColor: '#84cc16', borderRadius: 4 }} />
                                                <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', lineHeight: 1.1, textTransform: 'uppercase' as const, letterSpacing: '-0.02em', fontStyle: 'italic' }}>
                                                    {data.sessionName}
                                                </h2>
                                            </div>
                                            <p style={{ fontSize: 10, fontWeight: 800, color: '#84cc16', letterSpacing: '0.3em', paddingLeft: 14, textTransform: 'uppercase' as const, opacity: 0.7 }}>
                                                WORKOUT COMPLETED
                                            </p>
                                        </div>

                                        {/* ── Hero Stats ── */}
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr 1fr',
                                            gap: 8,
                                            padding: '14px 0',
                                            borderTop: '1px solid rgba(255,255,255,0.06)',
                                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                                        }}>
                                            {[
                                                { val: data.durationMinutes, label: 'MINS', col: '#a1a1aa' },
                                                { val: totalSets, label: 'SETS', col: '#84cc16' },
                                                { val: `+${data.xpGained}`, label: 'XP', col: '#34d399' },
                                            ].map((s, i) => (
                                                <div key={i} style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 4 }}>
                                                    <span style={{ fontSize: 24, fontWeight: 900, color: '#fff', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{s.val}</span>
                                                    <span style={{ fontSize: 8, fontWeight: 900, color: s.col, letterSpacing: '0.2em' }}>{s.label}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* ── Body Map ── */}
                                        <div style={{
                                            backgroundColor: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            borderRadius: 22,
                                            padding: '8px 14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-around',
                                            height: 140,
                                            overflow: 'hidden',
                                        }}>
                                            {loadingMuscles ? (
                                                <Activity className="animate-pulse" size={20} style={{ color: '#3f3f46' }} />
                                            ) : (
                                                <>
                                                    <div style={{ width: 100, height: 130, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, paddingTop: 4 }}>
                                                        <div style={{ transform: 'scale(0.55)', transformOrigin: 'top center' }}>
                                                            <ModelAny data={muscleData} type="anterior" highlightedColors={["#bef264", "#84cc16", "#65a30d", "#4d7c0f"]} bodyColor="#555555" />
                                                        </div>
                                                    </div>
                                                    <div style={{ width: 1, height: 50, backgroundColor: 'rgba(255,255,255,0.08)' }} />
                                                    <div style={{ width: 100, height: 130, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, paddingTop: 4 }}>
                                                        <div style={{ transform: 'scale(0.55)', transformOrigin: 'top center' }}>
                                                            <ModelAny data={muscleData} type="posterior" highlightedColors={["#bef264", "#84cc16", "#65a30d", "#4d7c0f"]} bodyColor="#555555" />
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* ── Exercise List ── */}
                                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px', marginBottom: 2 }}>
                                                <span style={{ fontSize: 9, fontWeight: 900, color: '#52525b', letterSpacing: '0.2em' }}>EXERCISE</span>
                                                <div style={{ display: 'flex', gap: 20 }}>
                                                    <span style={{ fontSize: 9, fontWeight: 900, color: '#52525b', letterSpacing: '0.1em', width: 30, textAlign: 'center' as const }}>SETS</span>
                                                    <span style={{ fontSize: 9, fontWeight: 900, color: '#52525b', letterSpacing: '0.1em', width: 30, textAlign: 'center' as const }}>REPS</span>
                                                </div>
                                            </div>
                                            {data.exercises.slice(0, 5).map((ex, i) => (
                                                <div key={i} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '8px 10px',
                                                    borderRadius: 12,
                                                    backgroundColor: 'rgba(255,255,255,0.04)',
                                                    border: '1px solid rgba(255,255,255,0.06)',
                                                }}>
                                                    <span style={{
                                                        fontSize: 11,
                                                        fontWeight: 800,
                                                        color: '#e4e4e7',
                                                        maxWidth: 190,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap' as const,
                                                        textTransform: 'uppercase' as const,
                                                    }}>
                                                        {ex.exercise_name}
                                                    </span>
                                                    <div style={{ display: 'flex', gap: 20, fontVariantNumeric: 'tabular-nums' }}>
                                                        <span style={{ fontSize: 13, fontWeight: 900, color: '#84cc16', width: 30, textAlign: 'center' as const }}>{ex.sets_completed}</span>
                                                        <span style={{ fontSize: 13, fontWeight: 900, color: '#fff', width: 30, textAlign: 'center' as const }}>{ex.reps_completed}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {data.exercises.length > 5 && (
                                                <p style={{ fontSize: 9, fontWeight: 700, color: '#3f3f46', textAlign: 'center' as const, letterSpacing: '0.15em', paddingTop: 4 }}>
                                                    + {data.exercises.length - 5} MORE
                                                </p>
                                            )}
                                        </div>

                                        {/* ── Footer ── */}
                                        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                            <span style={{ fontSize: 8, fontWeight: 900, color: '#3f3f46', letterSpacing: '0.3em' }}>POWERED BY GYMMATE</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Label ── */}
                            <p style={{ fontSize: 11, color: '#71717a', marginTop: 12, fontWeight: 600, textAlign: 'center' }}>
                                ▎ตาราง ด้านหลังคือ Preview ว่าพื้นหลังโปร่งใส — ไฟล์ PNG จริงจะไม่มีตาราง
                            </p>

                            {/* ── Buttons ── */}
                            <div className="w-full space-y-3 px-8 mt-6">
                                <button
                                    onClick={handleDownload}
                                    disabled={downloading || loadingMuscles}
                                    className="w-full h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all active:scale-[0.97] disabled:opacity-50"
                                    style={{ backgroundColor: '#84cc16', color: '#000' }}
                                >
                                    {downloading ? (
                                        <Loader2 size={22} className="animate-spin" />
                                    ) : (
                                        <>
                                            <Download size={20} strokeWidth={3} />
                                            Save Transparent PNG
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={onClose}
                                    className="w-full py-3 font-bold text-xs uppercase tracking-widest transition-colors"
                                    style={{ color: '#52525b' }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}
