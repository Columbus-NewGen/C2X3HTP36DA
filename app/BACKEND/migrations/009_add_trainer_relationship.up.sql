-- ============================================
-- Migration: 009_add_trainer_relationship
-- Description: Add trainer_id column to users for 1:N trainer-trainee relationship
-- Created: 2026-02-20
-- ============================================

BEGIN;

-- Add trainer_id column (nullable, self-referencing FK)
ALTER TABLE users
ADD COLUMN trainer_id INTEGER;

-- Create index for faster trainer lookups
CREATE INDEX idx_users_trainer_id ON users(trainer_id);

-- Add foreign key constraint (ON DELETE SET NULL to preserve user if trainer deleted)
ALTER TABLE users
ADD CONSTRAINT fk_users_trainer
    FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE SET NULL;

-- Add check constraint to prevent self-assignment (user cannot be their own trainer)
ALTER TABLE users
ADD CONSTRAINT chk_users_trainer_not_self
    CHECK (trainer_id IS NULL OR trainer_id != id);

COMMIT;
