// Dashboard Types
import type { LucideIcon } from "lucide-react";

export type Trend = "up" | "down" | "flat";
export type AlertType = "WARN" | "INFO" | "DANGER";
export type AnnStatus = "PUBLISHED" | "DRAFT";
export type Priority = "HIGH" | "MEDIUM" | "LOW";

export interface KPI {
    key: string;
    label: string;
    value: string | number;
    icon: "users" | "members" | "machines" | "clock";
    trend?: Trend;
    trendValue?: number;
    sub?: string;
    route?: string;
}

export interface Announcement {
    id: string;
    title: string;
    status: AnnStatus;
    publishedAt?: string;
}

export interface MaintenanceItem {
    machineId: string;
    machineName: string;
    note: string;
    updatedAt: string;
    priority: Priority;
}

export interface QuickAction {
    id:
        | "newAnnouncement"
        | "machines"
        | "floorplan"
        | "users"
        | "programs"
        | "leaderboard"
        | "exercises"
        | "muscles";
    label: string;
    route: string;
    desc?: string;
    icon: LucideIcon;
    color: string;
}

export interface AdminAlert {
    type: AlertType;
    text: string;
    route?: string;
    actionLabel?: string;
}

export interface GymHours {
    weekdays: { open: string; close: string };
    weekends: { open: string; close: string };
    isOpenNow: boolean;
}

export interface DashboardData {
    header: {
        gymName: string;
        today: string;
        gymHours: GymHours;
        imageUrl: string;
    };
    kpis: KPI[];
    sections: {
        announcements: Announcement[];
        maintenance: MaintenanceItem[];
        quickActions: QuickAction[];
        adminAlerts: AdminAlert[];
    };
}
