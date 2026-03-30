BEGIN;

-- Add IN_PROGRESS to scheduled_workouts status constraint
ALTER TABLE scheduled_workouts
    DROP CONSTRAINT IF EXISTS chk_scheduled_workouts_status;

ALTER TABLE scheduled_workouts
    ADD CONSTRAINT chk_scheduled_workouts_status
        CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'MISSED', 'SKIPPED'));

COMMENT ON COLUMN scheduled_workouts.status IS
    'SCHEDULED (not started), IN_PROGRESS (log created, exercises being added), COMPLETED (all exercises logged), MISSED (past date, not logged), SKIPPED (user explicitly skipped)';

COMMIT;
