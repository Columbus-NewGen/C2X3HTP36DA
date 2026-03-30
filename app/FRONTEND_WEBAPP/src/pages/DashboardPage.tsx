// src/pages/DashboardPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DashboardHeader,
  KPICard,
  QuickActionsGrid,
} from "../components/Dashboard";
import { ROUTES } from "../constants/routes";
import { getTodaySchedule, calcOpenNow } from "../utils/dashboard.utils";
import { analyticsApi } from "../services/analyticsApi";
import {
  Map,
  Users,
  Wrench,
  Trophy,
  Library,
  BicepsFlexedIcon,
  ListCheck,
} from "lucide-react";
import { PageLoader } from "../components/ui/PageLoader";

export type KPIIcon = "users" | "members" | "machines" | "clock";

export type DashboardKPI = {
  key: string;
  label: string;
  value: string | number;
  icon: KPIIcon;
  sub?: string;
};

export default function DashboardPage() {
  const nav = useNavigate();

  /* ---------------- State ---------------- */
  const [trainerCount, setTrainerCount] = useState<number>(0);
  const [userCount, setUserCount] = useState<number>(0);
  const [machineStats, setMachineStats] = useState<{
    active_machines: number;
    total_machines: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- Static header data ---------------- */
  const gymHours = {
    weekdays: { open: "07:00", close: "22:00" },
    weekends: { open: "07:00", close: "21:00" },
  };

  const todaySch = getTodaySchedule(gymHours);
  const openNow = calcOpenNow(gymHours);

  /* ---------------- Load data ---------------- */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [trainers, users, machines] = await Promise.all([
          analyticsApi.getTrainerCount(),
          analyticsApi.getUserCount(),
          analyticsApi.getMachineStats(),
        ]);
        setTrainerCount(trainers);
        setUserCount(users);
        setMachineStats(machines);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ---------------- KPIs ---------------- */
  const kpis: DashboardKPI[] = useMemo(
    () => [
      {
        key: "totalUsers",
        label: "จำนวนผู้ใช้งานทั้งหมด",
        value: userCount,
        icon: "users",
        sub: "สมาชิกทั้งหมด",
      },
      {
        key: "trainers",
        label: "เทรนเนอร์",
        value: trainerCount,
        icon: "members",
        sub: "ผู้ดูแลการฝึก",
      },
      {
        key: "machines",
        label: "สถานะเครื่อง",
        value: machineStats
          ? `${machineStats.active_machines}/${machineStats.total_machines}`
          : "-",
        icon: "machines",
        sub: "พร้อมใช้งาน",
      },
      {
        key: "hours",
        label: "เวลาเปิดทำการ",
        value: `${todaySch.open}-${todaySch.close}`,
        icon: "clock",
        sub: "เวลาวันนี้",
      },
    ],
    [userCount, trainerCount, machineStats, todaySch],
  );

  if (loading) return <PageLoader message="กำลังโหลดข้อมูล..." />;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* ────────────────────────────────────────
          Hero Header — full-width, no side padding
      ──────────────────────────────────────── */}
      <DashboardHeader
        gymName="GymMate Fitness"
        today={new Date().toLocaleDateString()}
        isOpenNow={openNow}
        imageUrl="https://images.unsplash.com/photo-1534438327276-14e5300c3a48"
      />

      {/* ────────────────────────────────────────
          Content wrapper — constrained + padded
      ──────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── KPI Cards — ลอยทับ header ด้วย negative margin ── */}
        <div
          className="
            relative z-10 -mt-10 sm:-mt-12
            grid gap-3 sm:gap-4
            grid-cols-2
            lg:grid-cols-4
          "
        >
          {kpis.map((k) => (
            <KPICard key={k.key} k={k} />
          ))}
        </div>

        {/* ── Quick Actions ── */}
        <div className="mt-8 sm:mt-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
            เมนูด่วน
          </p>
          <QuickActionsGrid
            actions={[
              {
                id: "users",
                label: "สมาชิกทั้งหมด",
                route: ROUTES.users,
                desc: "จัดการสมาชิกในระบบ",
                icon: Users,
                color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
              },
              {
                id: "programs",
                label: "โปรแกรมการฝึก",
                route: ROUTES.programs,
                desc: "สร้าง / ปรับโปรแกรม",
                icon: ListCheck,
                color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
              },
              {
                id: "machines",
                label: "เครื่องออกกำลังกาย",
                route: ROUTES.machines,
                desc: "เช็คสถานะ / แจ้งซ่อม",
                icon: Wrench,
                color: "bg-orange-50 text-orange-600 hover:bg-orange-100",
              },
              {
                id: "floorplan",
                label: "ผังเครื่องในยิม",
                route: ROUTES.floorplan,
                desc: "ดูภาพรวมตำแหน่งเครื่อง",
                icon: Map,
                color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
              },
              {
                id: "leaderboard",
                label: "Leaderboard",
                route: ROUTES.leaderboard,
                desc: "จัดอันดับความฟิต",
                icon: Trophy,
                color: "bg-sky-50 text-sky-600 hover:bg-sky-100",
              } as const,
              {
                id: "exercises",
                label: "ท่าออกกำลังกาย",
                route: ROUTES.exercises,
                desc: "ค้นหา / จัดการท่า",
                icon: Library,
                color: "bg-rose-50 text-rose-600 hover:bg-rose-100",
              } as const,
              {
                id: "muscles",
                label: "Muscle Atlas",
                route: ROUTES.muscles,
                desc: "ดูแผนที่กล้ามเนื้อ",
                icon: BicepsFlexedIcon,
                color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
              } as const,
            ]}
            onActionClick={(route) => nav(route)}
          />
        </div>
      </div>
    </div>
  );
}
