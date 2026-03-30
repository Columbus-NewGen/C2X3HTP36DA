-- ============================================
-- Migration: 002_add_media_fields (ROLLBACK)
-- Description: Remove media fields from equipment, exercises, and users tables
-- ============================================

BEGIN;

ALTER TABLE equipment DROP COLUMN IF EXISTS image_url;
ALTER TABLE exercises DROP COLUMN IF EXISTS image_url;
ALTER TABLE exercises DROP COLUMN IF EXISTS video_url;
ALTER TABLE users DROP COLUMN IF EXISTS image_url;

COMMIT;
