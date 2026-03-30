BEGIN;

-- Migrate existing data: set program_id to template_program_id where applicable
-- This makes program_id point to the template directly instead of the copy
UPDATE user_programs
SET program_id = template_program_id
WHERE template_program_id IS NOT NULL;

-- Copy program names from copied programs to user_programs.program_name (preserve user's custom names)
UPDATE user_programs up
SET program_name = p.program_name
FROM programs p
WHERE up.program_id = p.id AND (up.program_name IS NULL OR up.program_name = '');

-- Drop template_program_id column (now redundant — program_id IS the template)
ALTER TABLE user_programs DROP COLUMN IF EXISTS template_program_id;

COMMIT;
