-- ============================================
-- Migration Rollback: 001_initial_schema
-- Description: Drop all tables in reverse dependency order
-- Created: 2026-01-05
-- ============================================

BEGIN;

-- Drop tracking tables (highest dependencies)
DROP TABLE IF EXISTS muscle_trackings CASCADE;
DROP TABLE IF EXISTS log_exercises CASCADE;
DROP TABLE IF EXISTS workout_logs CASCADE;

-- Drop floorplan detail tables
DROP TABLE IF EXISTS floorplan_machines CASCADE;
DROP TABLE IF EXISTS floorplan_walls CASCADE;

-- Drop program/plan tables
DROP TABLE IF EXISTS user_programs CASCADE;
DROP TABLE IF EXISTS session_exercises CASCADE;
DROP TABLE IF EXISTS plan_sessions CASCADE;
DROP TABLE IF EXISTS exercise_plans CASCADE;

-- Drop relationship tables
DROP TABLE IF EXISTS equipment_substitutions CASCADE;
DROP TABLE IF EXISTS exercise_substitutes CASCADE;
DROP TABLE IF EXISTS exercise_equipments CASCADE;
DROP TABLE IF EXISTS exercise_muscles CASCADE;
DROP TABLE IF EXISTS muscle_group_members CASCADE;

-- Drop core tables (lowest dependencies)
DROP TABLE IF EXISTS floorplans CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS muscle_groups CASCADE;
DROP TABLE IF EXISTS muscles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

COMMIT;
