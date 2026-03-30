import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- CONFIGURATION & ASSETS ---
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

const INTERACTIVE_MESSAGES = [
    "Keep pushing!",
    "Great work today!",
    "You are unstoppable!",
    "Feel the power!",
    "One more rep!",
    "Consistency wins!",
    "Stay focused!",
    "Legend in making!"
];

// --- COMPONENT ---

export default function EvolutionStreak({ streakDays = 0, compact = false }: { streakDays: number, compact?: boolean }) {
    const [tapMessage, setTapMessage] = useState<string | null>(null);
    const [isPulsing, setIsPulsing] = useState(false);

    // ค้นหา Stage ปัจจุบันตามจำนวนวัน
    const stage = useMemo(() => {
        return [...EVOLUTION_STAGES].reverse().find(s => streakDays >= s.minDays) || EVOLUTION_STAGES[0];
    }, [streakDays]);

    // คำนวณความคืบหน้าไปยัง Stage ถัดไป
    const { progressToNext } = useMemo(() => {
        const currentIndex = EVOLUTION_STAGES.indexOf(stage);
        const next = EVOLUTION_STAGES[currentIndex + 1];

        if (!next) return { progressToNext: 100 };

        const diff = next.minDays - stage.minDays;
        const currentDiff = streakDays - stage.minDays;
        const progress = Math.min(Math.max((currentDiff / diff) * 100, 0), 100);

        return { progressToNext: progress };
    }, [stage, streakDays]);

    const handleInteract = () => {
        if (isPulsing) return;

        // Trigger pulse
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 600);

        // Show random message
        const msg = INTERACTIVE_MESSAGES[Math.floor(Math.random() * INTERACTIVE_MESSAGES.length)];
        setTapMessage(msg);
        setTimeout(() => setTapMessage(null), 2000);
    };

    return (
        <div className="flex items-center justify-center w-full font-sans">
            <motion.div
                layout
                className={`relative w-full overflow-hidden group/card ${compact ? 'max-w-[280px] rounded-[1.5rem]' : 'max-w-sm rounded-[2.5rem] p-1'}`}
                style={{ background: `linear-gradient(180deg, ${stage.color}44 0%, #1A1A1C 100%)` }}
            >
                {/* Main Card Body */}
                <div
                    className={`relative bg-[#111112] overflow-hidden cursor-pointer ${compact ? 'rounded-[1.4rem] p-5' : 'rounded-[2.4rem] p-8'}`}
                    onClick={handleInteract}
                >

                    {/* Background Ambient Glow */}
                    <motion.div
                        animate={{
                            scale: isPulsing ? [1, 1.4, 1] : [1, 1.2, 1],
                            rotate: [0, 90, 180, 270, 360],
                            opacity: isPulsing ? [0.2, 0.5, 0.2] : [0.1, 0.3, 0.1]
                        }}
                        transition={{
                            duration: isPulsing ? 0.6 : 10,
                            repeat: isPulsing ? 0 : Infinity,
                            ease: isPulsing ? "easeOut" : "linear"
                        }}
                        className={`absolute top-0 left-1/2 -translate-x-1/2 blur-[100px] pointer-events-none ${compact ? 'w-40 h-40' : 'w-80 h-80'}`}
                        style={{ backgroundColor: stage.color }}
                    />

                    {/* Header Section */}
                    <div className={`relative z-10 flex justify-between items-start ${compact ? 'mb-6' : 'mb-12'}`}>
                        <div>
                            <p className="text-[10px] font-bold  uppercase text-white/30 mb-1">Evolution</p>
                            <h2 className={`${compact ? 'text-sm' : 'text-xl'} font-bold  text-white`}>{stage.label}</h2>
                        </div>
                        <div className={`px-2 py-0.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md`}>
                            <span className="text-[8px] font-bold text-white/60  uppercase">Stage {EVOLUTION_STAGES.indexOf(stage) + 1}</span>
                        </div>
                    </div>

                    {/* Character Sprite Display */}
                    <div className={`relative flex items-center justify-center ${compact ? 'h-32 mb-6' : 'h-56 mb-10'}`}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={stage.id}
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 1.1, y: -20 }}
                                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                                className="relative group/sprite"
                            >
                                {/* Aura Bloom Effect */}
                                <motion.div
                                    animate={{
                                        scale: isPulsing ? [1, 1.5, 1] : 1,
                                        opacity: isPulsing ? [0.4, 0.8, 0.4] : 0.4
                                    }}
                                    className="absolute inset-0 blur-3xl group-hover/sprite:opacity-60 transition-opacity duration-500"
                                    style={{ backgroundColor: stage.color }}
                                />

                                {/* The Sprite with floating effect + Interaction */}
                                <motion.img
                                    animate={isPulsing ? {
                                        scale: [1, 1.25, 1],
                                        rotate: [0, 15, -15, 0]
                                    } : {
                                        y: [0, -15, 0],
                                        rotate: [0, 2, -2, 0]
                                    }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    transition={isPulsing ? { duration: 0.4 } : {
                                        y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                                        rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                                    }}
                                    src={stage.image}
                                    alt={stage.title}
                                    className={`${compact ? 'w-28 h-28' : 'w-44 h-44'} object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]`}
                                />

                                {/* Interactive Message Bubble */}
                                <AnimatePresence>
                                    {tapMessage && (
                                        <motion.div
                                            initial={{ opacity: 0.5, y: -20, scale: 0.5 }}
                                            animate={{ opacity: 1, y: compact ? -40 : -60, scale: 1.1 }}
                                            exit={{ opacity: 0, y: -100, scale: 0.8 }}
                                            className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-neutral-900 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase  shadow-xl z-[20]"
                                        >
                                            {tapMessage}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-6 border-transparent border-t-white" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Progress Section */}
                    <div className={`relative z-10 text-center ${compact ? 'space-y-2' : 'space-y-4'}`}>
                        <div>
                            <motion.h1
                                key={streakDays}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: isPulsing ? [1, 1.2, 1] : [1, 1.05, 1]
                                }}
                                transition={{
                                    scale: { duration: isPulsing ? 0.3 : 0.5, ease: "easeOut" }
                                }}
                                className={`${compact ? 'text-4xl' : 'text-6xl'} font-bold italic  text-white`}
                            >
                                {streakDays}
                                <span className={`${compact ? 'text-[10px]' : 'text-sm'} not-italic font-bold  text-white/20 ${compact ? 'ml-1' : 'ml-3'}`}>DAYS</span>
                            </motion.h1>
                            <motion.p
                                animate={{ opacity: isPulsing ? 1 : [0.6, 1, 0.6] }}
                                transition={{ duration: 2, repeat: isPulsing ? 0 : Infinity }}
                                className={`${compact ? 'text-[10px]' : 'text-sm'} font-bold mt-1`}
                                style={{ color: stage.color }}
                            >
                                {stage.title}
                            </motion.p>
                        </div>

                        {!compact && (
                            <p className="text-xs leading-relaxed text-white/40 px-4">
                                "{stage.description}"
                            </p>
                        )}

                        {/* Custom Styled Progress Bar */}
                        <div className={`${compact ? 'pt-1' : 'pt-4'} px-2`}>
                            <div className="flex justify-between text-[8px] font-bold text-white/20 uppercase  mb-1">
                                <span>Progress</span>
                                <span>{Math.round(progressToNext)}%</span>
                            </div>
                            <div className={`${compact ? 'h-1' : 'h-2'} w-full bg-white/5 rounded-full overflow-hidden`}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressToNext}%` }}
                                    className="h-full rounded-full relative"
                                    style={{ backgroundColor: stage.color }}
                                >
                                    <motion.div
                                        animate={{ x: ["-100%", "200%"] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 bg-white/20"
                                    />
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Glossy Overlay Reflect */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/10 to-transparent opacity-50 transition-opacity group-hover/card:opacity-70" />
            </motion.div>
        </div>
    );
}
