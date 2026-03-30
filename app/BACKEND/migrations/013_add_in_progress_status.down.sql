BEGIN;

ALTER TABLE scheduled_workouts
    DROP CONSTRAINT IF EXISTS chk_scheduled_workouts_status;

ALTER TABLE scheduled_workouts
    ADD CONSTRAINT chk_scheduled_workouts_status
        CHECK (status IN ('SCHEDULED', 'COMPLETED', 'MISSED', 'SKIPPED'));

COMMIT;
