BEGIN;

-- New table: exercise prescriptions per scheduled workout (snapshot from template)
CREATE TABLE scheduled_workout_exercises (
    id BIGSERIAL PRIMARY KEY,
    scheduled_workout_id BIGINT NOT NULL REFERENCES scheduled_workouts(id) ON DELETE CASCADE,
    exercise_id BIGINT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    sets INT NOT NULL CHECK (sets > 0),
    reps INT NOT NULL CHECK (reps > 0),
    weight DECIMAL(10,2),
    rest_seconds INT CHECK (rest_seconds >= 0),
    order_sequence INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_swe_scheduled_workout_id ON scheduled_workout_exercises(scheduled_workout_id);
CREATE INDEX idx_swe_exercise_id ON scheduled_workout_exercises(exercise_id);

-- Snapshot session metadata on scheduled_workouts (isolation from template edits)
ALTER TABLE scheduled_workouts ADD COLUMN session_name VARCHAR(255);
ALTER TABLE scheduled_workouts ADD COLUMN workout_split VARCHAR(50);

-- User's custom name for their assigned program (replaces copied program name)
ALTER TABLE user_programs ADD COLUMN program_name VARCHAR(255);

COMMIT;
