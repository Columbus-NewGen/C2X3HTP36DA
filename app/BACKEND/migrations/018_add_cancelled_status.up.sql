BEGIN;

ALTER TABLE user_programs
    DROP CONSTRAINT IF EXISTS chk_user_programs_status,
    ADD CONSTRAINT chk_user_programs_status
        CHECK (status IN ('ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED'));

ALTER TABLE scheduled_workouts
    DROP CONSTRAINT IF EXISTS chk_scheduled_workouts_status,
    ADD CONSTRAINT chk_scheduled_workouts_status
        CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'MISSED', 'SKIPPED', 'CANCELLED'));

COMMIT;
