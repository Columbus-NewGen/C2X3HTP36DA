-- ============================================
-- Migration: 001_initial_schema
-- Description: Initial database schema with all 20 tables
-- Created: 2026-01-05
-- ============================================

BEGIN;

-- ============================================
-- PHASE 1: Create all tables without foreign keys
-- ============================================

-- Core Tables

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    current_program_id BIGINT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE TABLE muscles (
    id BIGSERIAL PRIMARY KEY,
    muscle_name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    body_region VARCHAR(100),
    function TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE TABLE muscle_groups (
    id BIGSERIAL PRIMARY KEY,
    group_name VARCHAR(255) NOT NULL,
    split_category VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE TABLE equipment (
    id BIGSERIAL PRIMARY KEY,
    equipment_name VARCHAR(255) NOT NULL,
    equipment_type VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE TABLE exercises (
    id BIGSERIAL PRIMARY KEY,
    exercise_name VARCHAR(255) NOT NULL,
    movement_type VARCHAR(50),
    movement_pattern VARCHAR(100),
    description TEXT,
    difficulty_level VARCHAR(50),
    is_compound BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE TABLE floorplans (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    canvas_width INTEGER NOT NULL DEFAULT 1000,
    canvas_height INTEGER NOT NULL DEFAULT 800,
    grid_size INTEGER DEFAULT 10,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- Relationship Tables

CREATE TABLE muscle_group_members (
    id BIGSERIAL PRIMARY KEY,
    muscle_id BIGINT NOT NULL,
    group_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE exercise_muscles (
    id BIGSERIAL PRIMARY KEY,
    exercise_id BIGINT NOT NULL,
    muscle_id BIGINT NOT NULL,
    involvement_type VARCHAR(50) NOT NULL,
    activation_percentage INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_exercise_muscles_activation CHECK (
        activation_percentage IS NULL OR
        (activation_percentage >= 0 AND activation_percentage <= 100)
    )
);

CREATE TABLE exercise_equipments (
    id BIGSERIAL PRIMARY KEY,
    exercise_id BIGINT NOT NULL,
    equipment_id BIGINT NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE exercise_substitutes (
    id BIGSERIAL PRIMARY KEY,
    original_exercise_id BIGINT NOT NULL,
    substitute_exercise_id BIGINT NOT NULL,
    similarity_score INTEGER,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_exercise_substitutes_similarity CHECK (
        similarity_score IS NULL OR
        (similarity_score >= 0 AND similarity_score <= 100)
    )
);

CREATE TABLE equipment_substitutions (
    id BIGSERIAL PRIMARY KEY,
    original_equipment_id BIGINT NOT NULL,
    substitute_equipment_id BIGINT NOT NULL,
    similarity_score INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_equipment_substitutions_similarity CHECK (
        similarity_score >= 0 AND similarity_score <= 100
    )
);

-- Program/Plan Tables

CREATE TABLE exercise_plans (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT DEFAULT NULL,
    plan_name VARCHAR(255) NOT NULL,
    description TEXT,
    goal VARCHAR(255),
    duration_weeks INTEGER,
    days_per_week INTEGER,
    difficulty_level VARCHAR(50),
    is_template BOOLEAN DEFAULT FALSE,
    created_by BIGINT DEFAULT NULL,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    CONSTRAINT chk_exercise_plans_duration CHECK (duration_weeks IS NULL OR duration_weeks > 0),
    CONSTRAINT chk_exercise_plans_days CHECK (days_per_week IS NULL OR (days_per_week >= 1 AND days_per_week <= 7))
);

CREATE TABLE plan_sessions (
    id BIGSERIAL PRIMARY KEY,
    plan_id BIGINT NOT NULL,
    session_name VARCHAR(255) NOT NULL,
    workout_split VARCHAR(50),
    day_number INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    CONSTRAINT chk_plan_sessions_day CHECK (day_number > 0)
);

CREATE TABLE session_exercises (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL,
    exercise_id BIGINT NOT NULL,
    sets INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    weight DECIMAL(10,2),
    rest_seconds INTEGER,
    order_sequence INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_session_exercises_sets CHECK (sets > 0),
    CONSTRAINT chk_session_exercises_reps CHECK (reps > 0),
    CONSTRAINT chk_session_exercises_rest CHECK (rest_seconds IS NULL OR rest_seconds >= 0)
);

CREATE TABLE user_programs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    program_id BIGINT NOT NULL,
    template_program_id BIGINT DEFAULT NULL,
    assigned_by BIGINT NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    started_at TIMESTAMPTZ,
    current_week INTEGER DEFAULT 1,
    current_day INTEGER DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_user_programs_status CHECK (status IN ('ACTIVE', 'COMPLETED', 'PAUSED'))
);

-- Floorplan Detail Tables

CREATE TABLE floorplan_walls (
    id BIGSERIAL PRIMARY KEY,
    floorplan_id BIGINT NOT NULL,
    start_x DECIMAL(10,2) NOT NULL,
    start_y DECIMAL(10,2) NOT NULL,
    end_x DECIMAL(10,2) NOT NULL,
    end_y DECIMAL(10,2) NOT NULL,
    thickness INTEGER DEFAULT 5,
    color VARCHAR(7) DEFAULT '#000000',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE TABLE floorplan_machines (
    id BIGSERIAL PRIMARY KEY,
    floorplan_id BIGINT NOT NULL,
    equipment_id BIGINT NOT NULL,
    position_x DECIMAL(10,2) NOT NULL,
    position_y DECIMAL(10,2) NOT NULL,
    rotation DECIMAL(5,2) DEFAULT 0,
    width INTEGER NOT NULL DEFAULT 100,
    height INTEGER NOT NULL DEFAULT 100,
    label VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- Tracking Tables

CREATE TABLE workout_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    session_id BIGINT DEFAULT NULL,
    workout_date DATE NOT NULL,
    duration_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    CONSTRAINT chk_workout_logs_duration CHECK (duration_minutes IS NULL OR duration_minutes >= 0)
);

CREATE TABLE log_exercises (
    id BIGSERIAL PRIMARY KEY,
    log_id BIGINT NOT NULL,
    exercise_id BIGINT NOT NULL,
    sets_completed INTEGER NOT NULL,
    reps_completed INTEGER NOT NULL,
    weight_used DECIMAL(10,2),
    rpe_rating INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_log_exercises_sets CHECK (sets_completed >= 0),
    CONSTRAINT chk_log_exercises_reps CHECK (reps_completed >= 0),
    CONSTRAINT chk_log_exercises_rpe CHECK (rpe_rating IS NULL OR (rpe_rating >= 1 AND rpe_rating <= 10))
);

CREATE TABLE muscle_trackings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    muscle_id BIGINT NOT NULL,
    tracking_date DATE NOT NULL,
    weekly_volume INTEGER,
    recovery_status INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    CONSTRAINT chk_muscle_trackings_volume CHECK (weekly_volume IS NULL OR weekly_volume >= 0),
    CONSTRAINT chk_muscle_trackings_recovery CHECK (recovery_status IS NULL OR (recovery_status >= 1 AND recovery_status <= 5))
);

-- ============================================
-- PHASE 2: Create indexes
-- ============================================

-- Users indexes
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
CREATE INDEX idx_users_current_program_id ON users(current_program_id);

-- Muscles indexes
CREATE UNIQUE INDEX idx_muscles_muscle_name ON muscles(muscle_name);
CREATE INDEX idx_muscles_deleted_at ON muscles(deleted_at);

-- Muscle Groups indexes
CREATE UNIQUE INDEX idx_muscle_groups_group_name ON muscle_groups(group_name);
CREATE INDEX idx_muscle_groups_deleted_at ON muscle_groups(deleted_at);

-- Equipment indexes
CREATE UNIQUE INDEX idx_equipment_equipment_name ON equipment(equipment_name);
CREATE INDEX idx_equipment_deleted_at ON equipment(deleted_at);

-- Exercises indexes
CREATE UNIQUE INDEX idx_exercises_exercise_name ON exercises(exercise_name);
CREATE INDEX idx_exercises_deleted_at ON exercises(deleted_at);

-- Floorplans indexes
CREATE INDEX idx_floorplans_deleted_at ON floorplans(deleted_at);

-- Muscle Group Members indexes
CREATE INDEX idx_muscle_group_members_muscle_id ON muscle_group_members(muscle_id);
CREATE INDEX idx_muscle_group_members_group_id ON muscle_group_members(group_id);

-- Exercise Muscles indexes
CREATE INDEX idx_exercise_muscles_exercise_id ON exercise_muscles(exercise_id);
CREATE INDEX idx_exercise_muscles_muscle_id ON exercise_muscles(muscle_id);

-- Exercise Equipments indexes
CREATE INDEX idx_exercise_equipments_exercise_id ON exercise_equipments(exercise_id);
CREATE INDEX idx_exercise_equipments_equipment_id ON exercise_equipments(equipment_id);

-- Exercise Substitutes indexes
CREATE INDEX idx_exercise_substitutes_original_exercise_id ON exercise_substitutes(original_exercise_id);
CREATE INDEX idx_exercise_substitutes_substitute_exercise_id ON exercise_substitutes(substitute_exercise_id);

-- Equipment Substitutions indexes
CREATE INDEX idx_equipment_substitutions_original_equipment_id ON equipment_substitutions(original_equipment_id);
CREATE INDEX idx_equipment_substitutions_substitute_equipment_id ON equipment_substitutions(substitute_equipment_id);

-- Exercise Plans indexes
CREATE INDEX idx_exercise_plans_user_id ON exercise_plans(user_id);
CREATE INDEX idx_exercise_plans_created_by ON exercise_plans(created_by);
CREATE INDEX idx_exercise_plans_deleted_at ON exercise_plans(deleted_at);

-- Plan Sessions indexes
CREATE INDEX idx_plan_sessions_plan_id ON plan_sessions(plan_id);
CREATE INDEX idx_plan_sessions_deleted_at ON plan_sessions(deleted_at);

-- Session Exercises indexes
CREATE INDEX idx_session_exercises_session_id ON session_exercises(session_id);
CREATE INDEX idx_session_exercises_exercise_id ON session_exercises(exercise_id);

-- User Programs indexes
CREATE INDEX idx_user_programs_user_id ON user_programs(user_id);
CREATE INDEX idx_user_programs_program_id ON user_programs(program_id);
CREATE INDEX idx_user_programs_template_program_id ON user_programs(template_program_id);
CREATE INDEX idx_user_programs_assigned_by ON user_programs(assigned_by);
CREATE INDEX idx_user_programs_status ON user_programs(status);

-- Floorplan Walls indexes
CREATE INDEX idx_floorplan_walls_floorplan_id ON floorplan_walls(floorplan_id);
CREATE INDEX idx_floorplan_walls_deleted_at ON floorplan_walls(deleted_at);

-- Floorplan Machines indexes
CREATE INDEX idx_floorplan_machines_floorplan_id ON floorplan_machines(floorplan_id);
CREATE INDEX idx_floorplan_machines_equipment_id ON floorplan_machines(equipment_id);
CREATE INDEX idx_floorplan_machines_deleted_at ON floorplan_machines(deleted_at);

-- Workout Logs indexes
CREATE INDEX idx_workout_logs_user_id ON workout_logs(user_id);
CREATE INDEX idx_workout_logs_session_id ON workout_logs(session_id);
CREATE INDEX idx_workout_logs_deleted_at ON workout_logs(deleted_at);

-- Log Exercises indexes
CREATE INDEX idx_log_exercises_log_id ON log_exercises(log_id);
CREATE INDEX idx_log_exercises_exercise_id ON log_exercises(exercise_id);

-- Muscle Trackings indexes
CREATE INDEX idx_muscle_trackings_user_id ON muscle_trackings(user_id);
CREATE INDEX idx_muscle_trackings_muscle_id ON muscle_trackings(muscle_id);
CREATE INDEX idx_muscle_trackings_deleted_at ON muscle_trackings(deleted_at);

-- ============================================
-- PHASE 3: Add foreign key constraints
-- ============================================

-- Users foreign keys (self-referencing FK to exercise_plans added after exercise_plans exists)

-- Muscle Group Members foreign keys
ALTER TABLE muscle_group_members
    ADD CONSTRAINT fk_muscle_group_members_muscle
    FOREIGN KEY (muscle_id) REFERENCES muscles(id) ON DELETE CASCADE;

ALTER TABLE muscle_group_members
    ADD CONSTRAINT fk_muscle_group_members_group
    FOREIGN KEY (group_id) REFERENCES muscle_groups(id) ON DELETE CASCADE;

-- Exercise Muscles foreign keys
ALTER TABLE exercise_muscles
    ADD CONSTRAINT fk_exercise_muscles_exercise
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE;

ALTER TABLE exercise_muscles
    ADD CONSTRAINT fk_exercise_muscles_muscle
    FOREIGN KEY (muscle_id) REFERENCES muscles(id) ON DELETE CASCADE;

-- Exercise Equipments foreign keys
ALTER TABLE exercise_equipments
    ADD CONSTRAINT fk_exercise_equipments_exercise
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE;

ALTER TABLE exercise_equipments
    ADD CONSTRAINT fk_exercise_equipments_equipment
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE;

-- Exercise Substitutes foreign keys
ALTER TABLE exercise_substitutes
    ADD CONSTRAINT fk_exercise_substitutes_original
    FOREIGN KEY (original_exercise_id) REFERENCES exercises(id) ON DELETE CASCADE;

ALTER TABLE exercise_substitutes
    ADD CONSTRAINT fk_exercise_substitutes_substitute
    FOREIGN KEY (substitute_exercise_id) REFERENCES exercises(id) ON DELETE CASCADE;

-- Equipment Substitutions foreign keys
ALTER TABLE equipment_substitutions
    ADD CONSTRAINT fk_equipment_substitutions_original
    FOREIGN KEY (original_equipment_id) REFERENCES equipment(id) ON DELETE CASCADE;

ALTER TABLE equipment_substitutions
    ADD CONSTRAINT fk_equipment_substitutions_substitute
    FOREIGN KEY (substitute_equipment_id) REFERENCES equipment(id) ON DELETE CASCADE;

-- Exercise Plans foreign keys
ALTER TABLE exercise_plans
    ADD CONSTRAINT fk_exercise_plans_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE exercise_plans
    ADD CONSTRAINT fk_exercise_plans_creator
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Now add users.current_program_id FK (after exercise_plans exists)
ALTER TABLE users
    ADD CONSTRAINT fk_users_current_program
    FOREIGN KEY (current_program_id) REFERENCES exercise_plans(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Plan Sessions foreign keys
ALTER TABLE plan_sessions
    ADD CONSTRAINT fk_plan_sessions_plan
    FOREIGN KEY (plan_id) REFERENCES exercise_plans(id) ON DELETE CASCADE;

-- Session Exercises foreign keys
ALTER TABLE session_exercises
    ADD CONSTRAINT fk_session_exercises_session
    FOREIGN KEY (session_id) REFERENCES plan_sessions(id) ON DELETE CASCADE;

ALTER TABLE session_exercises
    ADD CONSTRAINT fk_session_exercises_exercise
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE;

-- User Programs foreign keys
ALTER TABLE user_programs
    ADD CONSTRAINT fk_user_programs_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_programs
    ADD CONSTRAINT fk_user_programs_program
    FOREIGN KEY (program_id) REFERENCES exercise_plans(id) ON DELETE CASCADE;

ALTER TABLE user_programs
    ADD CONSTRAINT fk_user_programs_template
    FOREIGN KEY (template_program_id) REFERENCES exercise_plans(id) ON DELETE SET NULL;

ALTER TABLE user_programs
    ADD CONSTRAINT fk_user_programs_trainer
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL;

-- Floorplan Walls foreign keys
ALTER TABLE floorplan_walls
    ADD CONSTRAINT fk_floorplan_walls_floorplan
    FOREIGN KEY (floorplan_id) REFERENCES floorplans(id) ON DELETE CASCADE;

-- Floorplan Machines foreign keys
ALTER TABLE floorplan_machines
    ADD CONSTRAINT fk_floorplan_machines_floorplan
    FOREIGN KEY (floorplan_id) REFERENCES floorplans(id) ON DELETE CASCADE;

ALTER TABLE floorplan_machines
    ADD CONSTRAINT fk_floorplan_machines_equipment
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE RESTRICT;

-- Workout Logs foreign keys
ALTER TABLE workout_logs
    ADD CONSTRAINT fk_workout_logs_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE workout_logs
    ADD CONSTRAINT fk_workout_logs_session
    FOREIGN KEY (session_id) REFERENCES plan_sessions(id) ON DELETE SET NULL;

-- Log Exercises foreign keys
ALTER TABLE log_exercises
    ADD CONSTRAINT fk_log_exercises_log
    FOREIGN KEY (log_id) REFERENCES workout_logs(id) ON DELETE CASCADE;

ALTER TABLE log_exercises
    ADD CONSTRAINT fk_log_exercises_exercise
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE;

-- Muscle Trackings foreign keys
ALTER TABLE muscle_trackings
    ADD CONSTRAINT fk_muscle_trackings_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE muscle_trackings
    ADD CONSTRAINT fk_muscle_trackings_muscle
    FOREIGN KEY (muscle_id) REFERENCES muscles(id) ON DELETE CASCADE;

COMMIT;
