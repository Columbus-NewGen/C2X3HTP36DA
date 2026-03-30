-- ============================================
-- Migration Rollback: 004_add_calendar_scheduling
-- Description: Rollback calendar-based workout scheduling changes
-- Created: 2026-01-10
-- ============================================

BEGIN;

-- ============================================
-- Step 1: Drop foreign key constraints
-- ============================================

-- Drop FK from workout_logs to scheduled_workouts
ALTER TABLE workout_logs DROP CONSTRAINT IF EXISTS fk_workout_logs_scheduled_workout;

-- Drop FK from scheduled_workouts to workout_logs
ALTER TABLE scheduled_workouts DROP CONSTRAINT IF EXISTS fk_scheduled_workouts_workout_log;

-- Drop FK from scheduled_workouts to program_sessions
ALTER TABLE scheduled_workouts DROP CONSTRAINT IF EXISTS fk_scheduled_workouts_program_session;

-- Drop FK from scheduled_workouts to user_programs
ALTER TABLE scheduled_workouts DROP CONSTRAINT IF EXISTS fk_scheduled_workouts_user_program;

-- ============================================
-- Step 2: Drop indexes
-- ============================================

-- Drop workout_logs index
DROP INDEX IF EXISTS idx_workout_logs_scheduled_workout_id;

-- Drop scheduled_workouts indexes
DROP INDEX IF EXISTS idx_scheduled_workouts_status_date;
DROP INDEX IF EXISTS idx_scheduled_workouts_user_date;
DROP INDEX IF EXISTS idx_scheduled_workouts_workout_log_id;
DROP INDEX IF EXISTS idx_scheduled_workouts_status;
DROP INDEX IF EXISTS idx_scheduled_workouts_scheduled_date;
DROP INDEX IF EXISTS idx_scheduled_workouts_program_session_id;
DROP INDEX IF EXISTS idx_scheduled_workouts_user_program_id;

-- ============================================
-- Step 3: Drop columns from workout_logs
-- ============================================

ALTER TABLE workout_logs DROP COLUMN IF EXISTS scheduled_workout_id;

-- ============================================
-- Step 4: Drop scheduled_workouts table
-- ============================================

DROP TABLE IF EXISTS scheduled_workouts;

-- ============================================
-- Step 5: Drop columns from user_programs
-- ============================================

ALTER TABLE user_programs DROP COLUMN IF EXISTS start_date;

-- ============================================
-- Step 6: Drop columns from program_sessions
-- ============================================

ALTER TABLE program_sessions DROP COLUMN IF EXISTS day_of_week;

COMMIT;
