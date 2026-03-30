BEGIN;

ALTER TABLE log_exercises DROP CONSTRAINT IF EXISTS fk_log_exercises_swe;
DROP INDEX IF EXISTS idx_log_exercises_swe_id;
ALTER TABLE log_exercises DROP COLUMN IF EXISTS scheduled_workout_exercise_id;

COMMIT;
