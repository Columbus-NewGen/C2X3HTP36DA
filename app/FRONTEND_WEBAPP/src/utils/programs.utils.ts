import type {
  ProgramListItem,
  DifficultyLevel,
  ProgramGoal,
} from "../types/program.types";
import type { ProgramSessionPayload } from "../types/program.types";
import type { ProgramExercisePayload } from "../types/program.types";

export type SortKey = "updatedDesc" | "nameAsc" | "difficultyAsc";

export type DrawerMode = "VIEW" | "CREATE" | "EDIT";

// Frontend-friendly Program type (for UI)
export interface ProgramDisplay {
  id: number;
  name: string;
  goal: ProgramGoal;
  durationWeeks: number;
  isTemplate: boolean;
  difficulty: DifficultyLevel;
  daysPerWeek: number;
  description: string;
  isActive: boolean;
  sessionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProgramFormData {
  program_name: string;
  goal: ProgramGoal;
  duration_weeks: number;
  is_template: boolean;
  difficulty_level: DifficultyLevel;
  days_per_week: number;
  description: string;
}

export interface AssignFormData {
  userId: string;
  programName: string;
  startDate: string;
  notes: string;
}

export type ProgramFormErrors = Partial<
  Record<keyof ProgramFormData, string>
> & { _general?: string };

export type AssignFormErrors = Partial<Record<keyof AssignFormData, string>> & {
  _general?: string;
};

export function todayYmd(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getNextMondayYmd(): string {
  const d = new Date();
  // d.getDay(): 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  const day = d.getDay();
  // If today is Monday, get the *next* Monday (7 days later), 
  // or if today is Monday and user wants *this* Monday?
  // User says "programs often start on Monday".
  // Let's get the upcoming Monday. If today is Monday, diff is 7.
  const diff = (day === 0 ? 1 : 8 - day);
  d.setDate(d.getDate() + diff);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
}

export const THAI_DAYS = [
  "วันอาทิตย์",
  "วันจันทร์",
  "วันอังคาร",
  "วันพุธ",
  "วันพฤหัสบดี",
  "วันศุกร์",
  "วันเสาร์",
];

export const THAI_DAYS_SHORT = [
  "อา.",
  "จ.",
  "อ.",
  "พ.",
  "พฤ.",
  "ศ.",
  "ส.",
];

export function formatDate(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getDifficultyLabel(level: DifficultyLevel): string {
  const labels: Record<DifficultyLevel, string> = {
    beginner: "เริ่มต้น",
    intermediate: "ปานกลาง",
    advanced: "ขั้นสูง",
  };
  return labels[level] || capitalize(level);
}

export function getGoalLabel(goal: ProgramGoal): string {
  const labels: Record<ProgramGoal, string> = {
    "muscle gain": "เพิ่มกล้ามเนื้อ",
    strength: "เพิ่มความแข็งแรง",
    "general fitness": "ฟิตเนสทั่วไป",
    "weight loss": "ลดน้ำหนัก",
  };
  return labels[goal] || capitalize(goal);
}

export function mapToDisplay(program: ProgramListItem): ProgramDisplay {
  return {
    id: program.id,
    name: program.program_name,
    goal: program.goal,
    durationWeeks: program.duration_weeks,
    isTemplate: program.is_template,
    difficulty: program.difficulty_level,
    daysPerWeek: program.days_per_week,
    description: program.description,
    isActive: program.is_active,
    sessionCount: program.session_count,
    createdAt: program.created_at,
    updatedAt: program.updated_at,
  };
}

export type { ProgramSessionPayload, ProgramExercisePayload };
