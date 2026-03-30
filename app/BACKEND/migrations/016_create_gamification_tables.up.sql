-- ============================================
-- Migration: 016_create_gamification_tables
-- Description: Create gamification system tables (badges, user profiles, XP events, user badges)
-- Created: 2026-03-01
-- ============================================

BEGIN;

CREATE TABLE IF NOT EXISTS badges (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL UNIQUE,
    display_name  VARCHAR(255) NOT NULL,
    description   TEXT,
    icon_url      VARCHAR(500),
    trigger_type  VARCHAR(50) NOT NULL,   -- STREAK, PROGRAM, WORKOUT_COUNT, LEVEL
    trigger_value INT,
    xp_reward     INT NOT NULL DEFAULT 0,
    sort_order    INT NOT NULL DEFAULT 0,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_gamification_profiles (
    id                SERIAL PRIMARY KEY,
    user_id           INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    total_xp          INT NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
    current_level     INT NOT NULL DEFAULT 1 CHECK (current_level >= 1),
    current_streak    INT NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
    longest_streak    INT NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
    last_workout_date DATE,
    weekly_target     INT NOT NULL DEFAULT 3 CHECK (weekly_target >= 1 AND weekly_target <= 7),
    created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS xp_events (
    id             SERIAL PRIMARY KEY,
    user_id        INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type     VARCHAR(50) NOT NULL,
    xp_amount      INT NOT NULL,
    description    TEXT,
    reference_id   INT,
    reference_type VARCHAR(50),
    created_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badges (
    id        SERIAL PRIMARY KEY,
    user_id   INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id  INT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_ugp_user_id      ON user_gamification_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_xpe_user_id      ON xp_events(user_id);
CREATE INDEX IF NOT EXISTS idx_xpe_user_created ON xp_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ub_user_id       ON user_badges(user_id);

COMMIT;
