import { useMemo, useState } from 'react';
import { ChevronRight, Lock, Sparkles, X, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const EVOLUTION_STAGES = [
    {
        id: 'orb',
        minDays: 0,
        label: 'The Origin',
        title: 'MYSTIC ORB',
        color: '#34D399',
        glow: 'rgba(52, 211, 153, 0.4)',
        description: 'ทุกความยิ่งใหญ่เริ่มต้นจากจุดเล็กๆ ความสม่ำเสมอคือเปลือกที่ปกป้องวินัยของคุณ',
        image: "/streakPet/1.png"
    },
    {
        id: 'gem-1',
        minDays: 3,
        label: 'The Awakening',
        title: 'DISCIPLINED GEM',
        color: '#10B981',
        glow: 'rgba(16, 185, 129, 0.4)',
        description: 'เริ่มเป็นรูปเป็นร่าง วินัยของคุณเริ่มส่งผลลัพธ์ที่มองเห็นได้ชัดเจน',
        image: "/streakPet/2.png"
    },
    {
        id: 'gem-2',
        minDays: 7,
        label: 'The Radiant',
        title: 'RADIANT SPIRIT',
        color: '#059669',
        glow: 'rgba(5, 150, 105, 0.4)',
        description: 'ความแข็งแกร่งที่มั่นคง คุณไม่ได้แค่ทำตามหน้าที่ แต่คุณกำลังสร้างนิสัย',
        image: "/streakPet/3.png"
    },
    {
        id: 'winged-1',
        minDays: 14,
        label: 'The Ascended',
        title: 'WINGED RESOLVE',
        color: '#047857',
        glow: 'rgba(4, 120, 87, 0.4)',
        description: 'เหนือกว่าคนทั่วไป คุณมีมุมมองที่กว้างไกลและพลังที่ไม่มีใครเทียบ',
        image: "/streakPet/4.png"
    },
    {
        id: 'winged-2',
        minDays: 30,
        label: 'The Master',
        title: 'ASCENDED APEX',
        color: '#F59E0B',
        glow: 'rgba(245, 158, 11, 0.6)',
        description: 'วินัยกลายเป็นตำนาน คุณไม่ได้เดินตามกฎอีกต่อไป แต่คุณคือผู้สร้างมัน',
        image: "/streakPet/5.png"
    },
    {
        id: 'eternal',
        minDays: 60,
        label: 'The Immortal',
        title: 'DIVINE ETERNAL',
        color: '#D97706',
        glow: 'rgba(217, 119, 6, 0.7)',
        description: 'บรรลุซึ่งความเป็นนิรันดร์แห่งวินัย พลังของคุณกลายเป็นแรงบันดาลใจแก่ผู้อื่น',
        image: "/streakPet/6.png"
    }
];

interface EvolutionRoadmapProps {
    currentStreak: number;
}

export function EvolutionSpoiler({ currentStreak }: EvolutionRoadmapProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const nextStage = useMemo(() => {
        return EVOLUTION_STAGES.find(s => s.minDays > currentStreak) || null;
    }, [currentStreak]);

    // Set active index to current/next when opening
    const handleOpen = () => {
        const index = EVOLUTION_STAGES.findIndex(s => s.minDays > currentStreak);
        setActiveIndex(index === -1 ? EVOLUTION_STAGES.length - 1 : index);
        setIsOpen(true);
    };

    if (!nextStage && currentStreak < 60) return null;

    const daysNeeded = nextStage ? nextStage.minDays - currentStreak : 0;

    return (
        <>
            <button
                onClick={handleOpen}
                className="w-full text-left group"
            >
                <div className="relative overflow-hidden p-5 rounded-3xl bg-zinc-900 border border-zinc-800 transition-all hover:border-lime-500/30 hover:shadow-2xl hover:shadow-lime-500/5 active:scale-[0.98]">
                    {/* Decorative background */}
                    <div
                        className="absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 pointer-events-none"
                        style={{ backgroundColor: nextStage?.color || '#D97706' }}
                    />

                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-800/50 flex items-center justify-center border border-white/5 overflow-hidden">
                                    <img
                                        src={nextStage?.image || EVOLUTION_STAGES[5].image}
                                        alt="Next Reward"
                                        className="w-8 h-8 object-contain grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                                    />
                                </div>
                                <div className="absolute -top-1 -right-1">
                                    <Lock size={12} className="text-zinc-600" />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Next Evolution</span>
                                    <Sparkles size={12} className="text-lime-500" />
                                </div>
                                <h3 className="text-sm font-bold text-white uppercase group-hover:text-lime-400 transition-colors">
                                    {nextStage?.label || 'All Unlocked!'}
                                </h3>
                                {nextStage && (
                                    <p className="text-xs text-zinc-400 mt-1">
                                        คงสภาพ Streak อีก <span className="text-white font-bold">{daysNeeded}</span> วัน
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="w-10 h-10 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-500 group-hover:text-white group-hover:bg-lime-500 transition-all">
                            <ChevronRight size={18} />
                        </div>
                    </div>
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-zinc-950/90 backdrop-blur-xl"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-zinc-900 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all z-50"
                            >
                                <X size={20} />
                            </button>

                            {/* Header */}
                            <div className="p-6 pb-0 text-center">
                                <h2 className="text-[10px] font-bold text-lime-500 uppercase tracking-[0.3em] mb-1">Evolution Roadmap</h2>
                                <h3 className="text-xl font-bold text-white uppercase tracking-tight">เส้นทางแห่งวินัย</h3>
                            </div>

                            {/* Scrollable Container */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {/* Carousel / Focus Content */}
                                <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
                                    <div className="relative w-full max-w-[240px] aspect-square flex items-center justify-center mb-6">
                                        {/* Ambient Glow */}
                                        <motion.div
                                            key={`glow-${activeIndex}`}
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 0.4, scale: 1 }}
                                            className="absolute inset-0 blur-[100px] rounded-full pointer-events-none"
                                            style={{ backgroundColor: EVOLUTION_STAGES[activeIndex].color }}
                                        />

                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={EVOLUTION_STAGES[activeIndex].id}
                                                initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                                                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                                exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                                                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                                                className="relative z-10 flex flex-col items-center"
                                            >
                                                <div className="relative group">
                                                    <motion.img
                                                        animate={{ y: [0, -10, 0] }}
                                                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                                        src={EVOLUTION_STAGES[activeIndex].image}
                                                        className={cn(
                                                            "w-36 h-36 sm:w-48 sm:h-48 object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
                                                            currentStreak < EVOLUTION_STAGES[activeIndex].minDays && "grayscale opacity-30 brightness-50"
                                                        )}
                                                        alt={EVOLUTION_STAGES[activeIndex].label}
                                                    />
                                                    {currentStreak < EVOLUTION_STAGES[activeIndex].minDays && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="bg-zinc-950/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-white/60 flex items-center gap-2">
                                                                <Lock size={16} />
                                                                <span className="text-xs font-bold uppercase tracking-widest">Locked</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>

                                    {/* Info */}
                                    <div className="text-center space-y-2 px-4">
                                        <div className="flex items-center justify-center gap-3">
                                            <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Stage {activeIndex + 1}</span>
                                            <div className="w-1 h-1 rounded-full bg-zinc-700" />
                                            <span className="text-[9px] font-bold text-lime-500 uppercase tracking-[0.2em]">{EVOLUTION_STAGES[activeIndex].minDays} Days Required</span>
                                        </div>
                                        <h4 className="text-xl font-bold text-white uppercase tracking-tight">
                                            {EVOLUTION_STAGES[activeIndex].label}
                                        </h4>
                                        <p className="text-xs text-zinc-400 max-w-[260px] mx-auto leading-relaxed">
                                            "{EVOLUTION_STAGES[activeIndex].description}"
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Navigation */}
                            <div className="p-6 pt-2 flex items-center justify-between gap-4">
                                <button
                                    onClick={() => setActiveIndex(prev => Math.max(0, prev - 1))}
                                    disabled={activeIndex === 0}
                                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white disabled:opacity-20 transition-all hover:bg-white/10 active:scale-90"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <div className="flex items-center gap-2">
                                    {EVOLUTION_STAGES.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveIndex(i)}
                                            className={cn(
                                                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                                activeIndex === i ? "w-4 bg-lime-500" : "bg-zinc-800 hover:bg-zinc-700"
                                            )}
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={() => setActiveIndex(prev => Math.min(EVOLUTION_STAGES.length - 1, prev + 1))}
                                    disabled={activeIndex === EVOLUTION_STAGES.length - 1}
                                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white disabled:opacity-20 transition-all hover:bg-white/10 active:scale-90"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}} />
        </>
    );
}
