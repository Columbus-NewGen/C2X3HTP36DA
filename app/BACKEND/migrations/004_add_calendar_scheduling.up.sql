-- ============================================
-- Migration: 004_add_calendar_scheduling
-- Description: Add calendar-based workout scheduling with scheduled_workouts table and day_of_week support
-- Created: 2026-01-10
-- ============================================

BEGIN;

-- ============================================
-- Step 1: Add day_of_week to program_sessions
-- ============================================

ALTER TABLE program_sessions
ADD COLUMN day_of_week INTEGER
    CHECK (day_of_week IS NULL OR (day_of_week >= 1 AND day_of_week <= 7));

COMMENT ON COLUMN program_sessions.day_of_week IS 'Day of week: 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday, 7=Sunday';

-- ============================================
-- Step 2: Add start_date to user_programs
-- ============================================

ALTER TABLE user_programs
ADD COLUMN start_date DATE;

COMMENT ON COLUMN user_programs.start_date IS 'User-selected start date for program (when scheduled workouts begin)';

-- ============================================
-- Step 3: Create scheduled_workouts table
-- ============================================

CREATE TABLE scheduled_workouts (
    id BIGSERIAL PRIMARY KEY,
    user_program_id BIGINT NOT NULL,
    program_session_id BIGINT NOT NULL,
    scheduled_date DATE NOT NULL,
    week_number INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    completed_at TIMESTAMPTZ DEFAULT NULL,
    workout_log_id BIGINT DEFAULT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- Constraints
    CONSTRAINT chk_scheduled_workouts_week CHECK (week_number > 0),
    CONSTRAINT chk_scheduled_workouts_status CHECK (status IN ('SCHEDULED', 'COMPLETED', 'MISSED', 'SKIPPED'))
);

COMMENT ON TABLE scheduled_workouts IS 'Calendar instances of workout sessions with scheduled dates and completion status';
COMMENT ON COLUMN scheduled_workouts.user_program_id IS 'Reference to user program assignment';
COMMENT ON COLUMN scheduled_workouts.program_session_id IS 'Reference to program session template';
COMMENT ON COLUMN scheduled_workouts.scheduled_date IS 'The date this workout is scheduled for';
COMMENT ON COLUMN scheduled_workouts.week_number IS 'Which week of the program (1 to duration_weeks)';
COMMENT ON COLUMN scheduled_workouts.status IS 'SCHEDULED (not done yet), COMPLETED (logged), MISSED (past date, not logged), SKIPPED (user explicitly skipped)';
COMMENT ON COLUMN scheduled_workouts.completed_at IS 'Timestamp when workout was completed (when workout_log created)';
COMMENT ON COLUMN scheduled_workouts.workout_log_id IS 'Link to actual workout log if completed';

-- ============================================
-- Step 4: Add scheduled_workout_id to workout_logs
-- ============================================

ALTER TABLE workout_logs
ADD COLUMN scheduled_workout_id BIGINT DEFAULT NULL;

COMMENT ON COLUMN workout_logs.scheduled_workout_id IS 'Link to scheduled workout (NULL for ad-hoc workouts)';

-- ============================================
-- Step 5: Create indexes for scheduled_workouts
-- ============================================

CREATE INDEX idx_scheduled_workouts_user_program_id ON scheduled_workouts(user_program_id);
CREATE INDEX idx_scheduled_workouts_program_session_id ON scheduled_workouts(program_session_id);
CREATE INDEX idx_scheduled_workouts_scheduled_date ON scheduled_workouts(scheduled_date);
CREATE INDEX idx_scheduled_workouts_status ON scheduled_workouts(status);
CREATE INDEX idx_scheduled_workouts_workout_log_id ON scheduled_workouts(workout_log_id);

-- Composite index for calendar queries (user + date range)
CREATE INDEX idx_scheduled_workouts_user_date
    ON scheduled_workouts(user_program_id, scheduled_date);

-- Index for finding missed workouts
CREATE INDEX idx_scheduled_workouts_status_date
    ON scheduled_workouts(status, scheduled_date)
    WHERE status = 'SCHEDULED';

-- ============================================
-- Step 6: Create index for workout_logs.scheduled_workout_id
-- ============================================

CREATE INDEX idx_workout_logs_scheduled_workout_id ON workout_logs(scheduled_workout_id);

-- ============================================
-- Step 7: Add foreign key constraints
-- ============================================

-- Foreign key from scheduled_workouts to user_programs
ALTER TABLE scheduled_workouts
ADD CONSTRAINT fk_scheduled_workouts_user_program
    FOREIGN KEY (user_program_id) REFERENCES user_programs(id) ON DELETE CASCADE;

-- Foreign key from scheduled_workouts to program_sessions
ALTER TABLE scheduled_workouts
ADD CONSTRAINT fk_scheduled_workouts_program_session
    FOREIGN KEY (program_session_id) REFERENCES program_sessions(id) ON DELETE CASCADE;

-- Foreign key from scheduled_workouts to workout_logs (nullable, SET NULL on delete)
ALTER TABLE scheduled_workouts
ADD CONSTRAINT fk_scheduled_workouts_workout_log
    FOREIGN KEY (workout_log_id) REFERENCES workout_logs(id) ON DELETE SET NULL;

-- Foreign key from workout_logs to scheduled_workouts (nullable, SET NULL on delete)
ALTER TABLE workout_logs
ADD CONSTRAINT fk_workout_logs_scheduled_workout
    FOREIGN KEY (scheduled_workout_id) REFERENCES scheduled_workouts(id) ON DELETE SET NULL;

COMMIT;
