/**
 * MyProfilePage V2 — Premium Gamification Edition
 *
 * Layout Structure:
 *   1. HERO PROFILE — Identity + Level Frame + XP Progress + Quick Stats
 *   2. STREAK PET — Motivational companion (centered, prominent)
 *   3. BADGE COLLECTION — Achievement showcase
 *   4. PROGRESSION OVERVIEW — Total stats summary
 *   5. CONTENT GRID — Programs, Workouts, Stats (existing sections)
 */
import { useState, useCallback, useRef, useMemo, type ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userStorage } from '../../contexts/user.storage';
import { type Badge } from '../../types/gamification.types';
import {
  Camera,
  Settings,
  Loader2,
  Trophy,
  Copy,
  Flame,
  Rocket,
  Activity,
  X,
  Crown,
  CheckCircle2,
  Info
} from 'lucide-react';
import { PageLoader, ToastContainer, useToasts } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { usersApi } from '../../services/UsersAPI';
import { userProgramsApi } from '../../services/userProgramsApi';
import { workoutsApi } from '../../services/workoutsApi';
import { gamificationApi } from '../../services/GamificationAPI';
import { getLevelTier, getTierName, getTierColors, getBadgeIcon, getDefaultBadgeTier } from '../../utils/gamification.utils';
import {
  LevelFrameAvatar,
  EvolutionStreak,
  BadgeGrid,
  StatCard,
  EvolutionSpoiler,
} from '../../components/Gamification';
import ProgramsSection from '../../components/Me/ProgramsSection';
import WorkoutsSection from '../../components/Me/WorkoutsSection';
import WeightTrackingSection from '../../components/Me/WeightTrackingSection';
import EditProfileModal from '../../components/Me/EditProfileModal';
import MuscleProgressSection from '../../components/Me/MuscleProgressSection';
import PerformanceStatsSection from '../../components/Me/PerformanceStatsSection';
import type { UserProgramStatus } from '../../types/userProgram.types';
import type {
  UpdateUserProfilePayload,
  CreateWeightPayload,
} from '../../types/user.types';
import type { User } from '../../types/auth.types';

// ─── Utilities ────────────────────────────────────────────────────────────────

function getImageUrl(user: User): string | null {
  const full = user.image_full_url;
  const key = user.image_url;
  if (full) {
    if (full.startsWith('http')) return full;
    return `${(import.meta.env.VITE_SERVER_URL || '').replace(/\/$/, '')}${full}`;
  }
  if (key) {
    if (key.startsWith('http')) return key;
    return `${(import.meta.env.VITE_SERVER_URL || '').replace(/\/$/, '')}/api/v1/media/${key}`;
  }
  return null;
}

const ROLE_TH: Record<string, string> = {
  root: 'ผู้ดูแลระบบสูงสุด',
  admin: 'ผู้ดูแลระบบ',
  trainer: 'เทรนเนอร์',
  user: 'สมาชิก',
};

// ─── Hero Profile Section ─────────────────────────────────────────────────────

interface ProfileHeroProps {
  user: User;
  level: number;
  nextLevelXp: number;
  totalXp: number;
  xpToNextLevel: number;
  currentStreak: number;
  weeklyCompleted: number;
  weeklyTarget: number;
  badgesAwarded: number;
  onImageSelect: (f: File) => void;
  isUploadingImage: boolean;
  onEdit: () => void;
  addToast: (type: 'success' | 'error' | 'info', msg: string) => void;
  imgKey: number;
}

function BadgeDetailModal({ badge, isOpen, onClose }: { badge: Badge | null, isOpen: boolean, onClose: () => void }) {
  if (!badge) return null;
  const tier = badge.tier || getDefaultBadgeTier(badge.name);
  const colors = getTierColors(tier);
  const isUnlocked = !!(badge.earned_at || badge.unlocked_at);

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={isOpen ? { scale: 1, y: 0 } : { scale: 0.9, y: 20 }}
        className="relative bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl border border-white/20"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors z-20">
          <X className="w-5 h-5 text-neutral-500" />
        </button>

        <div className="p-8 flex flex-col items-center text-center">
          <div
            className="w-32 h-32 rounded-3xl flex items-center justify-center relative mb-8"
            style={{
              background: isUnlocked ? `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` : '#f1f5f9',
              boxShadow: isUnlocked ? `0 20px 50px -10px ${colors.glow}` : 'none'
            }}
          >
            {/* Ambient Shine */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />

            {/* The Badge Icon - large version */}
            <div className="relative z-10">
              {(() => {
                const BadgeIcon = getBadgeIcon(badge.name);
                return badge.icon_url ? (
                  <img src={badge.icon_url} alt={badge.name} className="w-16 h-16 object-contain" />
                ) : (
                  <BadgeIcon className={`w-14 h-14 ${isUnlocked ? 'text-white' : 'text-neutral-300'}`} strokeWidth={2.5} />
                );
              })()}
            </div>

            {/* Tier decorator */}
            {tier === 'legend' && <Crown className="absolute -top-3 -right-3 w-10 h-10 text-amber-500 drop-shadow-lg" />}
          </div>

          <div className="space-y-2 mb-8">
            <div
              className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase  border"
              style={{
                background: colors.glow,
                color: colors.secondary,
                borderColor: `${colors.primary}30`
              }}
            >
              ระดับ {tier.toUpperCase()}
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 leading-tight">
              {badge.display_name || badge.name}
            </h2>
            <p className="text-sm text-neutral-500 font-medium leading-relaxed px-4">
              {badge.description}
            </p>
          </div>

          <div className="w-full pt-6 border-t border-neutral-100">
            {isUnlocked ? (
              <div className="flex flex-col items-center">
                <div
                  className="text-xs font-bold uppercase  mb-1 items-center flex gap-1.5"
                  style={{ color: colors.primary }}
                >
                  <CheckCircle2 className="w-3 h-3" /> ปลดล็อกแล้ว
                </div>
                <div className="text-xs text-neutral-400 font-bold">
                  เมื่อ {new Date(badge.earned_at || badge.unlocked_at || '').toLocaleDateString('th-TH', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </div>
              </div>
            ) : (
              <div className="text-xs font-bold text-neutral-400 uppercase  flex items-center gap-2">
                ฝึกฝนต่อไปเพื่อปลดล็อก! 🔒
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function HeroQuickStat({ icon: Icon, value, color, unit }: { icon: any, value: string | number, color: string, unit?: string }) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-neutral-50 border border-neutral-100 flex-shrink-0">
      <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color }} strokeWidth={3} />
      <div className="flex items-baseline gap-1">
        <span className="text-xs sm:text-sm font-bold text-neutral-900 leading-none">{value}</span>
        {unit && <span className="text-xs sm:text-xs font-bold text-neutral-400 uppercase ">{unit}</span>}
      </div>
    </div>
  );
}

function ProfileHero({
  user,
  level,
  nextLevelXp,
  totalXp,
  xpToNextLevel,
  currentStreak,
  weeklyCompleted,
  weeklyTarget,
  badgesAwarded,
  onImageSelect,
  isUploadingImage,
  onEdit,
  addToast,
  imgKey,
}: ProfileHeroProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const baseImgUrl = user ? getImageUrl(user) : null;
  const imageUrl = baseImgUrl ? `${baseImgUrl}${baseImgUrl.includes('?') ? '&' : '?'}v=${imgKey}` : null;
  const tier = getLevelTier(level);
  const tierName = getTierName(tier);
  const colors = getTierColors(tier);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onImageSelect(f);
    e.target.value = '';
  };

  // total_xp = XP ทั้งหมดที่สะสม, next_level_xp = ขอบเขตเลเวลถัดไป, xp_to_next_level = XP ที่ขาดถึงเลเวลถัดไป
  const displayXp = Math.round(totalXp);
  const displayNextXp = nextLevelXp;
  const actualXpProgress = nextLevelXp > 0 ? Math.min(100, Math.round((totalXp / nextLevelXp) * 100)) : 0;
  const xpNeeded = Math.max(0, Math.round(xpToNextLevel));

  return (
    <div className="relative bg-white rounded-3xl overflow-hidden border border-neutral-200 shadow-sm">
      {/* Background Glow */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: colors.glow }}
      />

      <div className="relative z-10 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
          {/* Left: Avatar with Level Frame */}
          <div className="relative flex-shrink-0">
            <LevelFrameAvatar level={level} imageUrl={imageUrl} size="lg" showLabel />

            {/* Camera Button */}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={isUploadingImage}
              className={`absolute bottom-0 right-0 w-8 h-8 rounded-xl bg-lime-500 flex items-center justify-center transition-all shadow-lg z-[70] border-2 border-white ${isUploadingImage
                ? "opacity-80 cursor-not-allowed scale-90"
                : "hover:bg-lime-400 active:scale-90 cursor-pointer"
                }`}
            >
              {isUploadingImage ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-white" />
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />

            {/* Loading Overlay for Avatar */}
            {isUploadingImage && (
              <div className="absolute inset-[-5px] flex items-center justify-center bg-black/40 backdrop-blur-[1px] rounded-full z-[65]">
                <div className="bg-white/90 p-2 rounded-xl shadow-xl">
                  <Loader2 className="w-6 h-6 animate-spin text-lime-500" />
                </div>
              </div>
            )}
          </div>

          {/* Right: Identity + Progress */}
          <div className="flex-1 space-y-5 min-w-0">
            {/* Name + Role + Actions */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-neutral-500 uppercase ">
                    {ROLE_TH[user.role] ?? user.role}
                  </span>
                  <button
                    type="button"
                    className="flex items-center gap-1 group/id"
                    onClick={() => {
                      navigator.clipboard.writeText(user.id.toString());
                      addToast('success', `คัดลอก ID ${user.id} แล้ว`);
                    }}
                    title="คลิกเพื่อคัดลอก ID"
                  >
                    <span className="text-xs font-bold text-neutral-600 uppercase group-hover/id:text-lime-400 transition-colors">
                      #{user.id}
                    </span>
                    <Copy className="w-2.5 h-2.5 text-neutral-600 group-hover/id:text-lime-400 transition-colors opacity-0 group-hover/id:opacity-100" />
                  </button>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 leading-tight truncate">
                  {user.name}
                </h1>
                {user.email && (
                  <p className="text-xs text-neutral-500 mt-1 truncate">{user.email}</p>
                )}
              </div>

              <button
                onClick={onEdit}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-bold transition-all active:scale-95"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">แก้ไข</span>
              </button>
            </div>

            {/* Top Stats & XP Stack */}
            <div className="flex flex-col gap-6 pt-2">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <HeroQuickStat
                  icon={Flame}
                  value={currentStreak}
                  unit="Streak"
                  color="#f97316"
                />
                <HeroQuickStat
                  icon={Activity}
                  value={weeklyTarget > 0 ? `${weeklyCompleted}/${weeklyTarget}` : weeklyCompleted}
                  unit="Workouts"
                  color="#84cc16"
                />
                <HeroQuickStat
                  icon={Trophy}
                  value={badgesAwarded}
                  unit="Awarded"
                  color="#f59e0b"
                />
              </div>

              {/* Level & XP Progress Section (Full Width Style) */}
              <div className="space-y-3">
                <div className="flex items-end justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="text-3xl sm:text-4xl font-bold leading-none drop-shadow-sm"
                      style={{ color: colors.primary }}
                    >
                      {level}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-xs font-bold text-neutral-400 uppercase ">LEVEL</span>
                      <span className="text-xs sm:text-xs font-bold uppercase " style={{ color: colors.primary }}>
                        {tierName}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-xs sm:text-xs font-bold text-neutral-400 uppercase  mb-1">XP PROGRESS</span>
                    <div className="flex items-baseline gap-1 sm:gap-1.5 leading-none">
                      <span className="text-xs sm:text-sm font-bold text-neutral-900">{displayXp.toLocaleString()}</span>
                      <span className="text-xs sm:text-xs font-bold text-neutral-300">/ {displayNextXp.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar Row */}
                <div className="relative h-2.5 w-full bg-neutral-100/80 rounded-full overflow-hidden border border-neutral-200/30">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(actualXpProgress, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>

                <div className="flex justify-center">
                  <span className="text-xs font-bold text-neutral-400 uppercase ">
                    Next Level in <span className="text-neutral-900 font-bold">{Math.round(xpNeeded).toLocaleString()} XP</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}} />
    </div>
  );
}

// ─── Section Title ────────────────────────────────────────────────────────────

function SectionTitle({ children, dark = false }: { children: React.ReactNode, dark?: boolean }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <h2 className={`text-sm font-bold uppercase  ${dark ? 'text-white/40' : 'text-neutral-400'}`}>
        {children}
      </h2>
      <div className={`flex-1 h-px bg-gradient-to-r to-transparent ${dark ? 'from-white/10' : 'from-neutral-200'}`} />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MyprofilePage() {
  const queryClient = useQueryClient();
  const { user, refreshMe } = useAuth();
  const { toasts, addToast, removeToast } = useToasts();

  const [editOpen, setEditOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [imgKey, setImgKey] = useState(Date.now());

  // ── Queries ────────────────────────────────────────────────────────────────

  const userQ = useQuery({
    queryKey: ['user', user?.id],
    queryFn: () => (user ? usersApi.getUserById(user.id) : null),
    enabled: !!user,
  });

  const progressQ = useQuery({
    queryKey: ['userProgress', user?.id],
    queryFn: () => usersApi.getUserProgress(),
    enabled: !!user,
  });

  const muscleTrendsQ = useQuery({
    queryKey: ['muscleTrends', user?.id],
    queryFn: () => usersApi.getUserProgressTrends('muscle'),
    enabled: !!user,
  });

  const exerciseTrendsQ = useQuery({
    queryKey: ['exerciseTrends', user?.id],
    queryFn: () => usersApi.getUserProgressTrends('exercise'),
    enabled: !!user,
  });

  const weightQ = useQuery({
    queryKey: ['weights', user?.id],
    queryFn: () => usersApi.getWeightHistory(user?.id ?? 0),
    enabled: !!user,
  });

  const programsQ = useQuery({
    queryKey: ['user-programs', user?.id],
    queryFn: () => userProgramsApi.getByUserId(user?.id ?? 0),
    enabled: !!user,
  });

  const scheduledQ = useQuery({
    queryKey: ['scheduled-now', user?.id],
    queryFn: () => {
      const now = new Date();
      const start = now.toISOString().split('T')[0];
      const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      return workoutsApi.getScheduled(user?.id ?? 0, start, end);
    },
    enabled: !!user,
  });

  const logsQ = useQuery({
    queryKey: ['workout-logs', user?.id],
    queryFn: () => workoutsApi.getLogs(user?.id ?? 0),
    enabled: !!user,
  });

  const gamQ = useQuery({
    queryKey: ['gamification-profile', user?.id],
    queryFn: () => gamificationApi.getProfile(),
    enabled: !!user,
  });

  // ── Mutations ──────────────────────────────────────────────────────────────

  const updateProfileMut = useMutation({
    mutationFn: (payload: UpdateUserProfilePayload) =>
      usersApi.updateProfile(user?.id ?? 0, payload),
    onSuccess: async (res) => {
      if (res.user) userStorage.set(res.user);
      queryClient.invalidateQueries({ queryKey: ['user', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['gamification-profile', user?.id] });
      refreshMe();
      addToast('success', 'อัปเดตข้อมูลส่วนตัวสำเร็จ');
      setEditOpen(false);
    },
    onError: () => addToast('error', 'อัปเดตข้อมูลไม่สำเร็จ'),
  });

  const uploadMut = useMutation({
    mutationFn: (file: File) => usersApi.updateProfileImageFile(user?.id ?? 0, file),
    onSuccess: async (res) => {
      if (res.user) userStorage.set(res.user);
      setImgKey(Date.now());
      queryClient.invalidateQueries({ queryKey: ['user', user?.id] });
      refreshMe();
      addToast('success', 'อัปโหลดรูปโปรไฟล์สำเร็จ');
    },
    onError: () => addToast('error', 'อัปโหลดรูปไม่สำเร็จ'),
  });

  const progMut = useMutation({
    mutationFn: ({ pid, data }: { pid: number; data: any }) =>
      userProgramsApi.updateProgress(user?.id ?? 0, pid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-programs'] });
      queryClient.invalidateQueries({ queryKey: ['scheduled-now'] });
      queryClient.invalidateQueries({ queryKey: ['gamification-profile'] });
      addToast('success', 'อัปเดตสถานะสำเร็จ');
    },
  });

  const addWeightMut = useMutation({
    mutationFn: (payload: CreateWeightPayload) =>
      usersApi.createWeight(user?.id ?? 0, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weights'] });
      addToast('success', 'บันทึกน้ำหนักแล้ว');
    },
  });

  const delWeightMut = useMutation({
    mutationFn: (id: number) => usersApi.deleteWeightEntry(user?.id ?? 0, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weights'] });
      addToast('success', 'ลบการบันทึกน้ำหนักแล้ว');
    },
  });

  const handleUpdateProgram = useCallback(
    (
      pid: number,
      data: {
        status?: UserProgramStatus;
        current_week?: number;
        current_day?: number;
      }
    ) => {
      progMut.mutate({ pid, data });
    },
    [progMut]
  );

  // ── Derived ────────────────────────────────────────────────────────────────

  const profileUser = userQ.data ?? user!;
  const gamProfile = gamQ.data;
  const updatingId = progMut.isPending ? (progMut.variables?.pid ?? null) : null;

  const tier = getLevelTier(gamProfile?.current_level ?? 1);
  const colors = getTierColors(tier);

  // Get active program IDs
  const activeProgramIds = useMemo(() => {
    return (programsQ.data || [])
      .filter((p) => p.status === 'ACTIVE')
      .map((p) => p.id);
  }, [programsQ.data]);

  // Filter scheduled workouts to only show from active programs
  const filteredScheduled = useMemo(() => {
    if (activeProgramIds.length === 0) return [];
    return (scheduledQ.data || []).filter((w) =>
      activeProgramIds.includes(w.user_program_id)
    );
  }, [scheduledQ.data, activeProgramIds]);

  // ── Guards ─────────────────────────────────────────────────────────────────

  if (!user)
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center p-8 bg-neutral-50">
        <div className="max-w-xs">
          <Info className="h-9 w-9 text-neutral-400 mx-auto mb-3" />
          <h2 className="text-base font-bold text-neutral-900 mb-1">
            ยังไม่ได้เข้าสู่ระบบ
          </h2>
          <p className="text-sm text-neutral-500">กรุณาเข้าสู่ระบบเพื่อดูโปรไฟล์</p>
        </div>
      </div>
    );

  if (gamQ.isLoading || programsQ.isLoading)
    return <PageLoader message="กำลังโหลด..." />;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-neutral-50">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Content Column (Left/Center) */}
          <div className="lg:col-span-8 space-y-6">
            {/* ══ 1. HERO PROFILE ══════════════════════════════════════════════ */}
            <ProfileHero
              user={profileUser}
              level={gamProfile?.current_level ?? 1}
              nextLevelXp={gamProfile?.next_level_xp ?? 1000}
              totalXp={gamProfile?.total_xp ?? 0}
              xpToNextLevel={gamProfile?.xp_to_next_level ?? 0}
              currentStreak={gamProfile?.current_streak ?? 0}
              weeklyCompleted={gamProfile?.weekly_completed ?? 0}
              weeklyTarget={gamProfile?.weekly_target ?? 0}
              badgesAwarded={gamProfile?.badges?.filter((b) => b.earned_at).length ?? 0}
              onImageSelect={(f) => uploadMut.mutate(f)}
              isUploadingImage={uploadMut.isPending}
              onEdit={() => setEditOpen(true)}
              addToast={addToast}
              imgKey={imgKey}
            />

            {/* ══ 2. CONTENT GRID (Programs & PRs) ═════════════════════════════ */}
            <div>
              <SectionTitle>โปรแกรมของฉัน</SectionTitle>
              <ProgramsSection
                programs={programsQ.data || []}
                isLoading={programsQ.isLoading}
                onUpdateProgress={handleUpdateProgram}
                isUpdating={!!updatingId}
              />
            </div>

            <div>
              <SectionTitle>สถิติของคุณ</SectionTitle>
              <MuscleProgressSection
                exercisePrs={progressQ.data?.exercise_prs}
                muscleTrends={muscleTrendsQ.data?.items}
                exerciseTrends={exerciseTrendsQ.data?.items}
                isLoading={
                  progressQ.isLoading ||
                  muscleTrendsQ.isLoading ||
                  exerciseTrendsQ.isLoading
                }
              />
            </div>
          </div>

          {/* Side Column (Right) */}
          <div className="lg:col-span-4 space-y-6">
            {/* ══ 3. STREAK PET (Prominent) ══════════════════════════════════════ */}
            {gamProfile && (
              <div className="bg-[#111112] bg-gradient-to-b from-[#1a1a1c] to-[#111112] rounded-[2.5rem] p-6 border border-white/5 shadow-2xl overflow-hidden relative group">
                <div className="relative z-10">
                  <SectionTitle dark>Evolution</SectionTitle>
                  <div className="flex justify-center -mt-4 mb-2">
                    <EvolutionStreak streakDays={gamProfile.current_streak} compact />
                  </div>
                </div>
                {/* Visual interest: particles effect simplified */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-lime-500/5 opacity-50" />
                </div>
              </div>
            )}

            {/* ══ NEXT EVOLUTION SPOILER ════════════════════════════════════════ */}
            {gamProfile && (
              <EvolutionSpoiler currentStreak={gamProfile.current_streak} />
            )}

            {/* ══ 4. PERFORMANCE ═══════════════════════════════════════════════ */}
            <div>
              <SectionTitle>วินัย</SectionTitle>
              <PerformanceStatsSection
                stats={progressQ.data?.workout_stats}
                isLoading={progressQ.isLoading}
              />
            </div>

            {/* ══ 5. PROGRESSION STATS ═════════════════════════════════════════ */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={Rocket}
                label="Total XP"
                value={gamProfile?.total_xp.toLocaleString() ?? '0'}
                color="#39e75f"
                glow="rgba(57, 231, 95, 0.2)"
              />
              <StatCard
                icon={Flame}
                label="Longest"
                value={`${gamProfile?.longest_streak ?? 0}d`}
                color="#ff9800"
                glow="rgba(255, 152, 0, 0.2)"
              />
            </div>

            {/* ══ 6. ACHIEVEMENTS (Compact Row) ════════════════════════════════ */}
            {gamProfile && gamProfile.badges && gamProfile.badges.length > 0 && (
              <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase  text-neutral-400">ACHIEVEMENT</h3>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: colors.glow, color: colors.secondary }}
                  >
                    ปลดล็อกแล้ว {gamProfile.badges.filter(b => b.earned_at || b.unlocked_at).length}
                  </span>
                </div>
                <BadgeGrid
                  badges={gamProfile.badges}
                  variant="compact"
                  onBadgeClick={(b) => setSelectedBadge(b)}
                />
              </div>
            )}

            {/* Weight Section Mini */}
            <WeightTrackingSection
              weightData={weightQ.data}
              isLoading={weightQ.isLoading}
              onCreateWeight={(d) => addWeightMut.mutate(d)}
              onDeleteWeight={(id) => delWeightMut.mutate(id)}
              isCreating={addWeightMut.isPending}
            />
          </div>
        </div>

        {/* ══ 7. NEXT WORKOUTS & HISTORY (Bottom) ═════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-neutral-200">
          <div>
            <SectionTitle>ถัดไป</SectionTitle>
            <WorkoutsSection
              scheduled={filteredScheduled}
              logs={logsQ.data || []}
              isLoadingScheduled={scheduledQ.isLoading}
              isLoadingLogs={logsQ.isLoading}
              variant="upcoming"
            />
          </div>
          <div>
            <SectionTitle>ประวัติ</SectionTitle>
            <WorkoutsSection
              scheduled={scheduledQ.data || []}
              logs={logsQ.data || []}
              isLoadingScheduled={scheduledQ.isLoading}
              isLoadingLogs={logsQ.isLoading}
              variant="activity"
            />
          </div>
        </div>
      </div>

      <BadgeDetailModal
        badge={selectedBadge}
        isOpen={!!selectedBadge}
        onClose={() => setSelectedBadge(null)}
      />

      <EditProfileModal
        user={profileUser}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={(data) => updateProfileMut.mutate(data)}
        isSaving={updateProfileMut.isPending}
      />
    </div>
  );
}
