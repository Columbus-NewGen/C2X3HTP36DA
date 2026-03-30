import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { leaderboardApi } from "../../services/LeaderboardAPI";
import LeaderboardTabs from "../../components/Leaderboard/LeaderboardTabs";
import PeriodFilter from "../../components/Leaderboard/PeriodFilter";
import TopThreePodium from "../../components/Leaderboard/TopThreePodium";
import RankingList from "../../components/Leaderboard/RankingList";
import CurrentUserCard from "../../components/Leaderboard/CurrentUserCard";
import { PageLoader } from "../../components/ui";
import { Trophy, AlertCircle, Medal } from "lucide-react";
import { motion } from "framer-motion";
import type {
  LeaderboardDimension,
  LeaderboardPeriod,
} from "../../types/leaderboard.types";

export default function LeaderboardPage() {
  const { user: currentAuthUser } = useAuth();
  const [selectedType, setSelectedType] =
    useState<LeaderboardDimension>("volume");
  const [selectedPeriod, setSelectedPeriod] =
    useState<LeaderboardPeriod>("week");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["leaderboard", selectedType, selectedPeriod],
    queryFn: () =>
      leaderboardApi.getLeaderboard(selectedType, selectedPeriod, 50),
    staleTime: 60000,
  });

  const entries = data?.entries || [];
  const topThree = entries.slice(0, 3);
  const currentUserEntry =
    entries.find((e) => e.user_id === currentAuthUser?.id) || null;

  if (isLoading) return <PageLoader message="กำลังขอข้อมูลทำเนียบแชมป์..." />;

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <AlertCircle className="text-rose-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">
            อุ๊ปส์! เกิดข้อผิดพลาด
          </h2>
          <p className="text-sm text-zinc-400 mb-6 font-medium">
            ไม่สามารถโหลดข้อมูลอันดับได้ในขณะนี้ กรุณลองใหม่อีกครั้ง
          </p>
          <button
            onClick={() => refetch()}
            className="px-8 h-12 bg-zinc-900 text-white rounded-2xl text-sm font-bold shadow-xl active:scale-95 transition-all"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-32">
      {/* ─── Grand Hero Section ─────────────────────────────────────────── */}
      <div className="relative bg-[#09090b] pt-16 sm:pt-24 pb-24 sm:pb-32 px-6 overflow-hidden">
        {/* Animated Background Layers */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_rgba(163,230,53,0.15)_0%,_transparent_70%)] opacity-50" />
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-lime-500/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full" />
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-4 sm:space-y-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
          >
            <Trophy size={14} className="text-lime-500" />
            <span className="text-[10px] sm:text-[11px] font-bold text-white/60 uppercase tracking-widest">GymMate Rankings</span>
          </motion.div>

          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
            className="text-4xl sm:text-7xl font-bold text-white tracking-tight leading-tight"
          >
            ชิงความเป็น<span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-400 italic">หนึ่ง</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-lg text-white/40 font-medium max-w-xl mx-auto leading-relaxed"
          >
            สนามประลองเพื่อพิสูจน์ความพยายาม
          </motion.p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 -mt-10 sm:-mt-20 relative z-20">

        {/* ─── Filter Bar ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, type: 'spring', damping: 25 }}
          className="bg-white/80 backdrop-blur-2xl p-2.5 rounded-[2rem] sm:rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] border border-white flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 sm:mb-20 w-full max-w-3xl mx-auto"
        >
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-8 w-full sm:w-auto">
            <LeaderboardTabs
              selectedType={selectedType}
              onTypeChange={setSelectedType}
            />
            <div className="hidden sm:block w-px h-8 bg-zinc-200/50" />
            <PeriodFilter
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
            />
          </div>
        </motion.div>

        {/* ─── Podium Section ───────────────────────────────────────────── */}
        <div className="mb-16 sm:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
          >
            {topThree.length > 0 && <TopThreePodium entries={topThree} />}
          </motion.div>
        </div>

        {/* ─── Ranking Table ───────────────────────────────────────────── */}
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 px-2">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tighter mb-1">
                รายชื่อ<span className="text-lime-500">ผู้กล้า</span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-semibold flex items-center gap-2">
                <Medal size={14} />
                TOP 50 อันดับทรงเกียรติ • {entries.length} ผู้เข้าแข่งขัน
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-zinc-100 shadow-sm self-start sm:self-auto">
              <div className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase">
                อัปเดต: {new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-zinc-100 overflow-hidden">
            <RankingList
              entries={entries}
              currentUserId={currentAuthUser?.id || 0}
            />
          </div>
        </div>

        {/* ─── Sticky User Presence ────────────────────────────────────── */}
        {currentUserEntry && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.8, duration: 1, type: 'spring' }}
            className="sticky bottom-6 sm:bottom-8 z-50 mt-16 pointer-events-none"
          >
            <div className="max-w-xl mx-auto pointer-events-auto px-2 sm:px-4">
              <CurrentUserCard
                currentEntry={currentUserEntry}
                allEntries={entries}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
