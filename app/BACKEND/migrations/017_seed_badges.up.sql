-- ============================================
-- Migration: 017_seed_badges
-- Description: Seed initial badge definitions for the gamification system
-- Created: 2026-03-01
-- ============================================

BEGIN;

INSERT INTO badges (name, display_name, description, trigger_type, trigger_value, xp_reward, sort_order) VALUES
    ('first_workout',    'First Step',         'ออกกำลังกายครั้งแรกของคุณสำเร็จแล้ว',          'WORKOUT_COUNT', 1,   0,  1),
    ('workouts_50',      '50 Workouts',        'ออกกำลังกายครบ 50 ครั้ง',                       'WORKOUT_COUNT', 50,  100, 2),
    ('workouts_100',     'Century Club',       'ออกกำลังกายครบ 100 ครั้ง',                      'WORKOUT_COUNT', 100, 200, 3),
    ('streak_7',         'Week Warrior',       'รักษา streak การออกกำลังกายต่อเนื่อง 7 วัน',    'STREAK',        7,   75,  4),
    ('streak_30',        'Iron Discipline',    'รักษา streak การออกกำลังกายต่อเนื่อง 30 วัน',   'STREAK',        30,  250, 5),
    ('program_complete', 'Program Graduate',   'เรียนจบโปรแกรมการฝึกแรกของคุณสำเร็จ',           'PROGRAM',       1,   150, 6),
    ('level_5',          'Rising Star',        'ไต่ระดับถึง Level 5',                           'LEVEL',         5,   0,  7),
    ('level_10',         'Elite Athlete',      'ไต่ระดับถึง Level 10',                          'LEVEL',         10,  0,  8)
ON CONFLICT (name) DO NOTHING;

-- Reset sequence to max id so future inserts don't conflict
SELECT setval('badges_id_seq', COALESCE((SELECT MAX(id) FROM badges), 0) + 1, false);

COMMIT;
