-- ============================================
-- Migration: 002_add_media_fields
-- Description: Add media fields to equipment, exercises, and users tables
-- Created: 2026-01-09
-- ============================================

BEGIN;

-- Add media columns (all nullable/optional)
ALTER TABLE equipment
ADD COLUMN image_url VARCHAR(500) DEFAULT NULL;

ALTER TABLE exercises
ADD COLUMN image_url VARCHAR(500) DEFAULT NULL,
ADD COLUMN video_url VARCHAR(500) DEFAULT NULL;

ALTER TABLE users
ADD COLUMN image_url VARCHAR(500) DEFAULT NULL;

-- Add helpful comments
COMMENT ON COLUMN equipment.image_url IS 'MinIO key path (e.g., equipment/uuid.jpg)';
COMMENT ON COLUMN exercises.image_url IS 'MinIO key path (e.g., exercise/uuid.jpg)';
COMMENT ON COLUMN exercises.video_url IS 'External video URL (YouTube, Vimeo, etc.)';
COMMENT ON COLUMN users.image_url IS 'MinIO key path for profile picture (e.g., user/uuid.jpg)';

COMMIT;
