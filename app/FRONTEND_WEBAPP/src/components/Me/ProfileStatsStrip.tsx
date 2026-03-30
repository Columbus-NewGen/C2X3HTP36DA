import { Flame, Weight, Target, Share2 } from "lucide-react";
import { Link } from "react-router-dom";

// ── Props ──

interface ProfileStatsStripProps {
  /** Streak count - placeholder until API exists */
  streak: number;
  /** Workouts completed this week (derived from logs) */
  workoutsThisWeek: number;
  /** Active programs count */
  activePrograms: number;
  /** Total programs */
  totalPrograms: number;
}

// ── Component ──

export default function ProfileStatsStrip({
  streak,
  workoutsThisWeek,
  activePrograms,
  totalPrograms,
}: ProfileStatsStripProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Streak */}
      <div className="group relative overflow-hidden rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-4 transition-all duration-300 hover:shadow-md hover:shadow-amber-100/50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 transition-transform group-hover:scale-110">
            <Flame className="h-5 w-5 animate-streak-flicker" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-base font-bold tabular-nums text-gray-900">{streak}</p>
            <p className="text-xs font-medium text-amber-700">วันติดกัน</p>
          </div>
        </div>
      </div>

      {/* Workouts this week */}
      <div className="group relative overflow-hidden rounded-2xl border border-lime-100 bg-gradient-to-br from-lime-50 to-emerald-50 p-4 transition-all duration-300 hover:shadow-md hover:shadow-lime-100/50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-100 text-lime-600 transition-transform group-hover:scale-110">
            <Weight className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-base font-bold tabular-nums text-gray-900">{workoutsThisWeek}</p>
            <p className="text-xs font-medium text-lime-700">สัปดาห์นี้</p>
          </div>
        </div>
      </div>

      {/* Active programs */}
      <div className="group relative overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-indigo-50 p-4 transition-all duration-300 hover:shadow-md hover:shadow-sky-100/50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600 transition-transform group-hover:scale-110">
            <Target className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-base font-bold tabular-nums text-gray-900">
              {activePrograms}
              {totalPrograms > 0 && (
                <span className="text-sm font-medium text-gray-500">/{totalPrograms}</span>
              )}
            </p>
            <p className="text-xs font-medium text-sky-700">โปรแกรม</p>
          </div>
        </div>
      </div>

      {/* Social / Share placeholder (Strava-like) */}
      <Link
        to="/leaderboard"
        className="group flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 transition-all duration-300 hover:border-lime-200 hover:shadow-md hover:shadow-gray-100/80"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition-all group-hover:bg-lime-100 group-hover:text-lime-600">
          <Share2 className="h-5 w-5" strokeWidth={2.5} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 group-hover:text-lime-700">ดูอันดับ</p>
          <p className="text-xs text-gray-500">กิจกรรม & ความสม่ำเสมอ</p>
        </div>
      </Link>
    </div>
  );
}
