-- Drop manual flex-sub tables (moving to computed approach)
-- See: docs/COMPUTED_FLEX_SUB.md

BEGIN;

-- Drop exercise substitution table
DROP TABLE IF EXISTS exercise_substitutes CASCADE;

-- Drop equipment substitution table
DROP TABLE IF EXISTS equipment_substitutions CASCADE;

COMMIT;
