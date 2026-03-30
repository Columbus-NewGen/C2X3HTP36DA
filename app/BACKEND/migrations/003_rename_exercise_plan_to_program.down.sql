-- ============================================
-- Migration: 003_rename_exercise_plan_to_program (ROLLBACK)
-- Description: Revert programs back to exercise_plans and program_sessions back to plan_sessions
-- Created: 2026-01-10
-- ============================================

BEGIN;

-- ============================================
-- Step 1: Drop foreign key constraints
-- ============================================

-- Drop FK from users that references programs
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_current_program;

-- Drop FKs from program_sessions
ALTER TABLE program_sessions DROP CONSTRAINT IF EXISTS fk_program_sessions_program;

-- Drop FKs from session_exercises
ALTER TABLE session_exercises DROP CONSTRAINT IF EXISTS fk_session_exercises_program_session;

-- Drop FKs from user_programs
ALTER TABLE user_programs DROP CONSTRAINT IF EXISTS fk_user_programs_program;
ALTER TABLE user_programs DROP CONSTRAINT IF EXISTS fk_user_programs_template;

-- Drop FKs from programs itself
ALTER TABLE programs DROP CONSTRAINT IF EXISTS fk_programs_user;
ALTER TABLE programs DROP CONSTRAINT IF EXISTS fk_programs_creator;

-- ============================================
-- Step 2: Rename columns back
-- ============================================

-- Rename program_id back to plan_id in program_sessions
ALTER TABLE program_sessions RENAME COLUMN program_id TO plan_id;

-- Rename program_name back to plan_name in programs
ALTER TABLE programs RENAME COLUMN program_name TO plan_name;

-- ============================================
-- Step 3: Rename tables back
-- ============================================

ALTER TABLE programs RENAME TO exercise_plans;
ALTER TABLE program_sessions RENAME TO plan_sessions;

-- ============================================
-- Step 4: Rename indexes back
-- ============================================

-- Exercise plans indexes (formerly programs)
ALTER INDEX IF EXISTS idx_programs_user_id RENAME TO idx_exercise_plans_user_id;
ALTER INDEX IF EXISTS idx_programs_created_by RENAME TO idx_exercise_plans_created_by;
ALTER INDEX IF EXISTS idx_programs_deleted_at RENAME TO idx_exercise_plans_deleted_at;

-- Plan sessions indexes (formerly program_sessions)
ALTER INDEX IF EXISTS idx_program_sessions_program_id RENAME TO idx_plan_sessions_plan_id;
ALTER INDEX IF EXISTS idx_program_sessions_deleted_at RENAME TO idx_plan_sessions_deleted_at;

-- ============================================
-- Step 5: Rename check constraints back
-- ============================================

-- Exercise plans check constraints (formerly programs)
ALTER TABLE exercise_plans RENAME CONSTRAINT chk_programs_duration TO chk_exercise_plans_duration;
ALTER TABLE exercise_plans RENAME CONSTRAINT chk_programs_days TO chk_exercise_plans_days;

-- Plan sessions check constraints (formerly program_sessions)
ALTER TABLE plan_sessions RENAME CONSTRAINT chk_program_sessions_day TO chk_plan_sessions_day;

-- ============================================
-- Step 6: Re-create foreign key constraints with original names
-- ============================================

-- Exercise plans foreign keys (to users)
ALTER TABLE exercise_plans
    ADD CONSTRAINT fk_exercise_plans_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE exercise_plans
    ADD CONSTRAINT fk_exercise_plans_creator
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Users foreign key (to exercise_plans)
ALTER TABLE users
    ADD CONSTRAINT fk_users_current_program
    FOREIGN KEY (current_program_id) REFERENCES exercise_plans(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Plan sessions foreign key (to exercise_plans)
ALTER TABLE plan_sessions
    ADD CONSTRAINT fk_plan_sessions_plan
    FOREIGN KEY (plan_id) REFERENCES exercise_plans(id) ON DELETE CASCADE;

-- Session exercises foreign key (to plan_sessions)
ALTER TABLE session_exercises
    ADD CONSTRAINT fk_session_exercises_session
    FOREIGN KEY (session_id) REFERENCES plan_sessions(id) ON DELETE CASCADE;

-- User programs foreign keys (to exercise_plans)
ALTER TABLE user_programs
    ADD CONSTRAINT fk_user_programs_program
    FOREIGN KEY (program_id) REFERENCES exercise_plans(id) ON DELETE CASCADE;

ALTER TABLE user_programs
    ADD CONSTRAINT fk_user_programs_template
    FOREIGN KEY (template_program_id) REFERENCES exercise_plans(id) ON DELETE SET NULL;

COMMIT;
