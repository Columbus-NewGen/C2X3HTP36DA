import { useRef, useState, type ChangeEvent } from "react";
import {
  Camera,
  Loader2,
  UserRound,
  Zap,
  Settings,
  Flame,
  NotebookPen,
  ListCheck,
} from "lucide-react";
import type { User } from "../../types/auth.types";

function getImageUrl(user: User): string | null {
  const full = user.image_full_url;
  const key = user.image_url;
  if (full) {
    if (full.startsWith("http")) return full;
    return `${(import.meta.env.VITE_SERVER_URL || "").replace(/\/$/, "")}${full}`;
  }
  if (key) {
    if (key.startsWith("http")) return key;
    return `${(import.meta.env.VITE_SERVER_URL || "").replace(/\/$/, "")}/api/v1/media/${key}`;
  }
  return null;
}

function getRoleLabel(role: string): string {
  const map: Record<string, string> = {
    root: "System Owner",
    admin: "Administrator",
    trainer: "Professional Trainer",
    user: "Elite Member",
  };
  return map[role] ?? role;
}

function xpForNextLevel(level: number) {
  return level * 500;
}

interface ProfileHeroProps {
  user: User;
  onImageSelect: (file: File) => void;
  isUploadingImage: boolean;
  onEdit?: () => void;
  stats?: {
    streak?: number;
    workoutsThisWeek?: number;
    totalPrograms?: number;
  };
}

export default function ProfileHero({
  user,
  onImageSelect,
  isUploadingImage,
  onEdit,
  stats,
}: ProfileHeroProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [imgErr, setImgErr] = useState(false);
  const imageUrl = getImageUrl(user);
  const level = user.level ?? 1;
  const xp = user.xp ?? 0;
  const needed = xpForNextLevel(level);
  const progress = Math.min(xp / needed, 1);
  const pct = Math.round(progress * 100);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImageSelect(file);
    e.target.value = "";
  };

  return (
    <header className="relative overflow-hidden rounded-[3rem] bg-zinc-950 p-6 sm:p-10 shadow-2xl border border-white/5">
      {/* Dynamic Background Art */}
      <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-lime-500/10 to-transparent opacity-50" />
      <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-blue-600/10 blur-[100px]" />

      {/* Layer 1: Top Navigation & Identity */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with Glow */}
          <div className="relative shrink-0">
            <div className="h-28 w-28 rounded-[2rem] overflow-hidden bg-zinc-900 ring-2 ring-white/10 p-1 shadow-2xl">
              <div className="h-full w-full rounded-[1.8rem] overflow-hidden relative">
                {imageUrl && !imgErr ? (
                  <img
                    src={imageUrl}
                    alt={user.name}
                    className="h-full w-full object-cover"
                    onError={() => setImgErr(true)}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-zinc-800">
                    <UserRound className="h-12 w-12 text-zinc-600" />
                  </div>
                )}
                {isUploadingImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <Loader2 className="h-6 w-6 animate-spin text-lime-400" />
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-lime-500 text-bold flex items-center justify-center shadow-lg hover:bg-lime-400 transition-transform active:scale-90 cursor-pointer"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
          </div>

          <div className="text-center sm:text-left flex flex-col justify-end pb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/20 mb-3 w-fit mx-auto sm:mx-0">
              <Zap className="h-3 w-3 text-lime-500 fill-lime-500" />
              <span className="text-xs font-bold uppercase  text-lime-500">
                Lvl {level}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white  mb-1">
              {user.name}
            </h1>
            <p className="text-zinc-500 font-bold uppercase text-xs  flex items-center gap-2">
              {getRoleLabel(user.role)}
              <span className="text-zinc-700 font-bold">• ID: {user.id}</span>
            </p>
          </div>
        </div>

        {/* Minimalist Edit Button */}
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-white text-xs font-bold uppercase  transition-all active:scale-95 cursor-pointer"
        >
          <Settings className="h-3.5 w-3.5" />
          Edit Profile
        </button>
      </div>

      {/* Layer 2: Command Center Stats (Fixing Errors & Aesthetics) */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-0 rounded-[2rem] bg-zinc-900/40 border border-white/5 backdrop-blur-xl overflow-hidden shadow-inner">
        {[
          {
            label: "Workout Streak",
            value: stats?.streak ?? 0, // FIXED: Added optional chaining
            unit: "Days",
            icon: <Flame className="h-4 w-4 text-orange-500" />,
            bg: "hover:bg-orange-500/[0.02]",
          },
          {
            label: "Workouts",
            value: stats?.workoutsThisWeek ?? 0, // FIXED: Added optional chaining
            unit: "This Week",
            icon: <NotebookPen className="h-4 w-4 text-blue-500" />,
            bg: "hover:bg-blue-500/[0.02]",
          },
          {
            label: "Programs",
            value: stats?.totalPrograms ?? 0, // FIXED: Added optional chaining
            unit: "Active",
            icon: <ListCheck className="h-4 w-4 text-lime-500" />,
            bg: "hover:bg-lime-500/[0.02]",
          },
        ].map((item, i) => (
          <div
            key={i}
            className={`p-6 flex flex-col gap-3 transition-colors border-white/5 border-b sm:border-b-0 sm:border-r last:border-0 ${item.bg} group`}
          >
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-zinc-800/50 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <span className="text-xs font-bold uppercase  text-zinc-500">
                {item.label}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white tabular-nums ">
                {item.value}
              </span>
              <span className="text-xs font-bold text-zinc-600 uppercase  leading-none">
                {item.unit}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Layer 3: XP & Progress (Industrial Look) */}
      <div className="relative z-10 mt-10 space-y-4">
        <div className="flex items-end justify-between px-2">
          <div className="space-y-1">
            <span className="text-xs font-bold text-zinc-600 uppercase ">
              System Progress
            </span>
            <div className="flex items-center gap-2">
              <span className="text-white text-xs font-bold">
                {xp.toLocaleString()}
              </span>
              <span className="text-zinc-700 text-xs font-bold">
                / {needed.toLocaleString()} XP
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lime-500 text-base font-bold italic leading-none">
              {pct}%
            </span>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="h-4 w-full rounded-full bg-zinc-900 border border-white/5 p-1 shadow-inner relative overflow-hidden">
          {/* Animated Glow Track */}
          <div
            className="h-full rounded-full bg-gradient-to-r from-lime-600 via-lime-400 to-emerald-400 transition-all duration-1000 relative shadow-[0_0_20px_rgba(163,230,53,0.2)]"
            style={{ width: `${pct}%` }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-[shimmer_2s_infinite] w-20" />
          </div>
        </div>
      </div>
    </header>
  );
}
