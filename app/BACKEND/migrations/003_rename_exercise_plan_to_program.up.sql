-- ============================================
-- Migration: 003_rename_exercise_plan_to_program
-- Description: Rename exercise_plans to programs and plan_sessions to program_sessions for consistency
-- Created: 2026-01-10
-- ============================================

BEGIN;

-- ============================================
-- Step 1: Drop foreign key constraints that reference the tables we're renaming
-- ============================================

-- Drop FK from users that references exercise_plans
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_current_program;

-- Drop FKs from plan_sessions
ALTER TABLE plan_sessions DROP CONSTRAINT IF EXISTS fk_plan_sessions_plan;

-- Drop FKs from session_exercises
ALTER TABLE session_exercises DROP CONSTRAINT IF EXISTS fk_session_exercises_session;

-- Drop FKs from user_programs
ALTER TABLE user_programs DROP CONSTRAINT IF EXISTS fk_user_programs_program;
ALTER TABLE user_programs DROP CONSTRAINT IF EXISTS fk_user_programs_template;

-- Drop FKs from exercise_plans itself
ALTER TABLE exercise_plans DROP CONSTRAINT IF EXISTS fk_exercise_plans_user;
ALTER TABLE exercise_plans DROP CONSTRAINT IF EXISTS fk_exercise_plans_creator;

-- ============================================
-- Step 2: Rename tables
-- ============================================

ALTER TABLE exercise_plans RENAME TO programs;
ALTER TABLE plan_sessions RENAME TO program_sessions;

-- ============================================
-- Step 2.5: Rename columns for consistency
-- ============================================

-- Rename plan_name to program_name in programs
ALTER TABLE programs RENAME COLUMN plan_name TO program_name;

-- Rename plan_id to program_id in program_sessions
ALTER TABLE program_sessions RENAME COLUMN plan_id TO program_id;

-- ============================================
-- Step 3: Rename indexes
-- ============================================

-- Programs indexes (formerly exercise_plans)
ALTER INDEX IF EXISTS idx_exercise_plans_user_id RENAME TO idx_programs_user_id;
ALTER INDEX IF EXISTS idx_exercise_plans_created_by RENAME TO idx_programs_created_by;
ALTER INDEX IF EXISTS idx_exercise_plans_deleted_at RENAME TO idx_programs_deleted_at;

-- Program sessions indexes (formerly plan_sessions)
ALTER INDEX IF EXISTS idx_plan_sessions_plan_id RENAME TO idx_program_sessions_program_id;
ALTER INDEX IF EXISTS idx_plan_sessions_deleted_at RENAME TO idx_program_sessions_deleted_at;

-- ============================================
-- Step 4: Rename check constraints
-- ============================================

-- Programs check constraints (formerly exercise_plans)
ALTER TABLE programs RENAME CONSTRAINT chk_exercise_plans_duration TO chk_programs_duration;
ALTER TABLE programs RENAME CONSTRAINT chk_exercise_plans_days TO chk_programs_days;

-- Program sessions check constraints (formerly plan_sessions)
ALTER TABLE program_sessions RENAME CONSTRAINT chk_plan_sessions_day TO chk_program_sessions_day;

-- ============================================
-- Step 5: Re-create foreign key constraints with new names
-- ============================================

-- Programs foreign keys (to users)
ALTER TABLE programs
    ADD CONSTRAINT fk_programs_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE programs
    ADD CONSTRAINT fk_programs_creator
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Users foreign key (to programs)
ALTER TABLE users
    ADD CONSTRAINT fk_users_current_program
    FOREIGN KEY (current_program_id) REFERENCES programs(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Program sessions foreign key (to programs)
ALTER TABLE program_sessions
    ADD CONSTRAINT fk_program_sessions_program
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE;

-- Session exercises foreign key (to program_sessions)
ALTER TABLE session_exercises
    ADD CONSTRAINT fk_session_exercises_program_session
    FOREIGN KEY (session_id) REFERENCES program_sessions(id) ON DELETE CASCADE;

-- User programs foreign keys (to programs)
ALTER TABLE user_programs
    ADD CONSTRAINT fk_user_programs_program
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE;

ALTER TABLE user_programs
    ADD CONSTRAINT fk_user_programs_template
    FOREIGN KEY (template_program_id) REFERENCES programs(id) ON DELETE SET NULL;

COMMIT;
