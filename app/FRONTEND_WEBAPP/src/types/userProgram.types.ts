/* ---------- Enums ---------- */
export type UserProgramStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
export type ScheduledWorkoutStatus = "SCHEDULED" | "COMPLETED" | "MISSED" | "SKIPPED";


/* ---------- Assign Program ---------- */
export interface AssignProgramRequest {
  template_program_id: number;
  program_name: string;
  start_date: string; // YYYY-MM-DD
  notes?: string;
}

/* ---------- Update Progress ---------- */
export interface UpdateUserProgramRequest {
  status?: UserProgramStatus;
  current_week?: number;
  current_day?: number;
  notes?: string;
}

/* ---------- Assigned By ---------- */
export interface AssignedBy {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface ScheduledWorkout {
  id: number;
  status: ScheduledWorkoutStatus;
}


/* ---------- User (Assignee) ---------- */
export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}
export interface GetUserProgramsResponse {
  programs: UserProgram[];
}

export interface GetUserProgramResponse {
  program: UserProgram;
}


/* ---------- User Program ---------- */
export interface UserProgram {
  id: number;
  user_id: number;
  program_id: number;
  template_program_id: number;
  program_name?: string;
  status: UserProgramStatus;
  current_week: number;
  current_day: number;
  assigned_at: string;
  start_date?: string;
  started_at?: string;
  completed_at?: string;
  notes?: string;
  assigned_by: AssignedBy;
  user?: User; // User who was assigned the program (for trainer view)
  program?: Program | null; //ชื่อโปรแกรมที่ตั้งใหม่ว่าชื่ออะไร
  template_program?: TemplateProgram | null; //อ้างอิงตารางการออกกำลังกายมาจากtemplate ไหน
  completion_rate?: number;
  progression_rate?: number;
  scheduled_workouts?: ScheduledWorkout[];
}


export interface ProgramSession {
  id: number;
  session_name: string;
  workout_split: string;
  day_number: number;
  day_of_week: number;
}

// =========================
// Program (Actual Program)
// =========================


export interface Program {
  id: number;
  program_name: string;
  goal: string;
  duration_weeks: number;
  days_per_week: number;

  difficulty_level: "beginner" | "intermediate" | "advanced" | string;

  description?: string | null;
  is_active: boolean;
  is_template: boolean;
  created_by?: AssignedBy;

  sessions: ProgramSession[];

  created_at: string;

  updated_at: string;
}

// =========================
// Template Program
// =========================

export interface TemplateProgram {
  id: number;
  program_name: string;
  goal: string;
  duration_weeks: number;
  days_per_week: number;

  difficulty_level: "beginner" | "intermediate" | "advanced" | string;

  description?: string | null;
  is_active: boolean;
  is_template: true;

  session_count: number;
  created_at: string;
  updated_at: string;
}
