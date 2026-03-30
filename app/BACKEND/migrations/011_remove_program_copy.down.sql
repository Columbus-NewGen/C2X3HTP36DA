BEGIN;

-- Re-add template_program_id column
ALTER TABLE user_programs ADD COLUMN template_program_id BIGINT REFERENCES programs(id) ON DELETE SET NULL;

-- Note: We cannot perfectly restore the original state since copied programs may have been cleaned up.
-- This rollback adds the column back but does not recreate copied programs.

COMMIT;
