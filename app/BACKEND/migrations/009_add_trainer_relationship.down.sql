-- ============================================
-- Migration: 009_add_trainer_relationship (ROLLBACK)
-- Description: Remove trainer_id column and related constraints
-- ============================================

BEGIN;

-- Drop check constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_trainer_not_self;

-- Drop foreign key constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_trainer;

-- Drop index
DROP INDEX IF EXISTS idx_users_trainer_id;

-- Drop column
ALTER TABLE users DROP COLUMN IF EXISTS trainer_id;

COMMIT;
