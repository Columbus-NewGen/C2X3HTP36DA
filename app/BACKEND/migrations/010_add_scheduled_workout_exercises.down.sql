BEGIN;

DROP TABLE IF EXISTS scheduled_workout_exercises;

ALTER TABLE scheduled_workouts DROP COLUMN IF EXISTS session_name;
ALTER TABLE scheduled_workouts DROP COLUMN IF EXISTS workout_split;

ALTER TABLE user_programs DROP COLUMN IF EXISTS program_name;

COMMIT;
