BEGIN;

ALTER TABLE user_programs
    DROP CONSTRAINT IF EXISTS chk_user_programs_status,
    ADD CONSTRAINT chk_user_programs_status
        CHECK (status IN ('ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED', 'MISSED'));

COMMIT;
