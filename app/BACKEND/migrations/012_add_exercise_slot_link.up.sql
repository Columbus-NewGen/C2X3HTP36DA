BEGIN;

-- Add slot link column to log_exercises for tracking which prescribed exercise slot was fulfilled
ALTER TABLE log_exercises ADD COLUMN scheduled_workout_exercise_id BIGINT DEFAULT NULL;

-- Index for efficient lookups
CREATE INDEX idx_log_exercises_swe_id ON log_exercises(scheduled_workout_exercise_id);

-- Foreign key to scheduled_workout_exercises (set null if prescription deleted)
ALTER TABLE log_exercises ADD CONSTRAINT fk_log_exercises_swe
    FOREIGN KEY (scheduled_workout_exercise_id)
    REFERENCES scheduled_workout_exercises(id) ON DELETE SET NULL;

COMMIT;
