import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { Role } from "../types/common.types";
import type { User } from "../types/auth.types";
import { X } from "lucide-react";
import {
  LayoutDashboard,
  UserRoundCog,
  Map,
  Wrench,
  ListCheck,
  Library,
  Users,
  LogOut,
  ClipboardList,
  CircleUserRound,
  Trophy,
  ChevronRight,
  BicepsFlexedIcon,
  FileText,
} from "lucide-react";
import AuthenticatedImage from "./ui/AuthenticatedImage";

const baseItem =
  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all";
const inactiveItem =
  "text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-transparent shadow-none";
const activeItem = "bg-lime-100 text-lime-700 font-semibold";

function getUserImageUrl(user: User): string | null {
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

function getRoleLabel(role: Role): string {
  const map: Record<Role, string> = {
    root: "Root",
    admin: "Administrator",
    trainer: "Trainer",
    user: "Member",
  };
  return map[role] ?? role;
}

import { createPortal } from "react-dom";

function LogoutConfirmModal({
  open,
  onConfirm,
  onClose,
}: {
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute left-1/2 top-1/2 w-[min(400px,92vw)] -translate-x-1/2 -translate-y-1/2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xl">
          <div className="mb-4 text-sm font-semibold text-gray-900">
            ยืนยันการออกจากระบบ
          </div>
          <p className="mb-4 text-sm text-gray-500">
            คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={onClose}
            >
              ยกเลิก
            </button>
            <button
              type="button"
              className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

type NavbarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

type NavItemConfig = {
  to: string;
  label: string;
  icon: React.ReactNode;
  roles: Role[];
};

const NAV_ITEMS: NavItemConfig[] = [
  {
    to: "/workout",
    label: "Workout",
    icon: <ClipboardList size={18} />,
    roles: ["user", "trainer", "admin", "root"],
  },
  {
    to: "/leaderboard",
    label: "Leaderboard",
    icon: <Trophy size={18} />,
    roles: ["user", "trainer", "admin", "root"],
  },
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    roles: ["admin", "root"],
  },
  {
    to: "/trainer/dashboard",
    label: "Trainer Dashboard",
    icon: <UserRoundCog size={18} />,
    roles: ["trainer", "admin", "root"],
  },
  {
    to: "/floorplan",
    label: "Floorplan",
    icon: <Map size={18} />,
    roles: ["user", "trainer", "admin", "root"],
  },
  {
    to: "/machines",
    label: "Machines",
    icon: <Wrench size={18} />,
    roles: ["admin", "root"],
  },
  {
    to: "/programs",
    label: "Programs",
    icon: <ListCheck size={18} />,
    roles: ["user", "trainer", "admin", "root"],
  },
  {
    to: "/exercises",
    label: "Exercises",
    icon: <Library size={18} />,
    roles: ["user", "trainer", "admin", "root"],
  },
  {
    to: "/muscles",
    label: "Muscle Atlas",
    icon: <BicepsFlexedIcon size={18} />,
    roles: ["user", "trainer", "admin", "root"],
  },
  {
    to: "/users",
    label: "Users",
    icon: <Users size={18} />,
    roles: ["admin", "root"],
  },
  {
    to: "/admin/logs",
    label: "Log Reader",
    icon: <FileText size={18} />,
    roles: ["admin", "root"],
  },
];

export default function Navbar({ isOpen = false, onClose }: NavbarProps) {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const role = user?.role;

  const visibleNavItems = role
    ? NAV_ITEMS.filter((item) => item.roles.includes(role))
    : [];

  return (
    <aside
      className={[
        "bg-white border-r border-gray-200 flex flex-col",
        "w-72 lg:w-64",
        "lg:fixed lg:inset-y-0 lg:left-0 lg:h-screen lg:translate-x-0",
        "fixed inset-y-0 left-0 z-50 h-full transform transition-transform duration-200",
        isOpen ? "translate-x-0" : "-translate-x-full",
      ].join(" ")}
    >
      {/* ─── HEADER BLOCK: Logo + User profile รวมกัน ─── */}
      <div className="px-4 pt-5 pb-3 border-b border-gray-100">
        {/* Logo row */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              navigate("/app");
              onClose?.();
            }}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <img src="/logo-gymmate192.png" alt="Logo" className="h-7 w-7" />
            <span className="text-lg font-bold text-gray-900">
              GYM<span className="text-lime-600">MATE</span>
            </span>
          </button>

          {isOpen && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg border hover:bg-gray-100"
              aria-label="Close sidebar"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* User profile — subordinate, subtle card style */}
        {isAuthenticated && user && (
          <button
            type="button"
            onClick={() => {
              navigate("/profile");
              onClose?.();
            }}
            className="w-full flex items-center gap-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 px-3 py-2.5 text-left transition-colors group"
          >
            {/* Avatar — ขนาดเล็กลง เพื่อไม่แข่งกับ logo */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 ring-2 ring-white relative">
              {(() => {
                const avatarUrl = getUserImageUrl(user);
                return avatarUrl ? (
                  <AuthenticatedImage
                    src={avatarUrl}
                    alt={user.name}
                    className="h-full w-full object-cover"
                    fallback={
                      <CircleUserRound size={18} className="text-gray-400" />
                    }
                  />
                ) : (
                  <CircleUserRound size={18} className="text-gray-400" />
                );
              })()}
            </div>

            {/* Name + role */}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-gray-800 leading-tight">
                {user.name}
              </div>
              <div className="truncate text-xs text-gray-400 leading-tight mt-0.5">
                {getRoleLabel(user.role)}
              </div>
            </div>

            {/* Subtle chevron hint */}
            <ChevronRight
              size={14}
              className="shrink-0 text-gray-300 group-hover:text-gray-400 transition-colors"
            />
          </button>
        )}
      </div>

      {/* ─── NAV ITEMS ─── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleNavItems.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            onClick={onClose}
          />
        ))}

        {/* Logout — ย้ายไปอยู่ใน nav flow แต่ยังโดดเด่น */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              if (isAuthenticated) {
                setShowLogoutConfirm(true);
              } else {
                onClose?.();
                navigate("/");
              }
            }}
            className={`${baseItem} w-full text-left bg-rose-50 hover:bg-rose-600 group transition-all duration-200 border border-rose-100 hover:border-rose-600 shadow-sm hover:shadow-rose-200`}
          >
            <span className="shrink-0 text-rose-500 group-hover:text-white transition-colors">
              <LogOut size={18} strokeWidth={2.5} />
            </span>
            <span className="truncate font-medium text-rose-600 group-hover:text-white transition-colors text-sm">
              ออกจากระบบ
            </span>
          </button>
        </div>
      </nav>

      {/* ─── FOOTER ─── */}
      <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-300">
        © {new Date().getFullYear() + 543} GymMate
      </div>

      <LogoutConfirmModal
        open={showLogoutConfirm}
        onConfirm={() => {
          onClose?.();
          logout();
          navigate("/");
        }}
        onClose={() => setShowLogoutConfirm(false)}
      />
    </aside>
  );
}

function NavItem({
  to,
  icon,
  label,
  onClick,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      onClick={() => onClick?.()}
      className={({ isActive }) =>
        `${baseItem} ${isActive ? activeItem : inactiveItem}`
      }
    >
      <span className="shrink-0 text-gray-400">{icon}</span>
      <span className="truncate">{label}</span>
    </NavLink>
  );
}
