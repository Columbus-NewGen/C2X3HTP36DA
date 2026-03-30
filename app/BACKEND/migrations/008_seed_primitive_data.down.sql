-- ============================================
-- Migration Rollback: 008_seed_primitive_data
-- Description: Remove seeded primitive reference data
-- Created: 2026-02-20
-- ============================================

BEGIN;

-- Delete in reverse dependency order

-- Muscle Group Members (depends on muscles and muscle_groups)
DELETE FROM muscle_group_members
WHERE muscle_id IN (SELECT id FROM muscles WHERE muscle_name IN (
    'Pectoralis Major', 'Pectoralis Minor',
    'Latissimus Dorsi', 'Trapezius', 'Rhomboids', 'Erector Spinae',
    'Anterior Deltoid', 'Lateral Deltoid', 'Posterior Deltoid',
    'Biceps Brachii', 'Triceps Brachii', 'Brachialis', 'Forearm Flexors', 'Forearm Extensors',
    'Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Adductors',
    'Rectus Abdominis', 'Obliques', 'Transverse Abdominis'
));

-- Muscle Groups
DELETE FROM muscle_groups WHERE group_name IN (
    'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'
);

-- Muscles
DELETE FROM muscles WHERE muscle_name IN (
    'Pectoralis Major', 'Pectoralis Minor',
    'Latissimus Dorsi', 'Trapezius', 'Rhomboids', 'Erector Spinae',
    'Anterior Deltoid', 'Lateral Deltoid', 'Posterior Deltoid',
    'Biceps Brachii', 'Triceps Brachii', 'Brachialis', 'Forearm Flexors', 'Forearm Extensors',
    'Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Adductors',
    'Rectus Abdominis', 'Obliques', 'Transverse Abdominis'
);

-- Equipment
DELETE FROM equipment WHERE equipment_name IN (
    'Aerobic fitness area gym', 'Assisted Pull Up Machine', 'Barbell Rack', 'Bench',
    'Cable Chest Fly', 'Cable Crossover Machine', 'Captain Chair Abs Station', 'Cardio zone gym',
    'Chest Press Machine', 'Curve Treadmill', 'Dual Lat Machine', 'Dumbbell Rack',
    'EZ Curl Bar Rack', 'Flat Barbell Bench Press Station', 'Gym locker', 'Gym reception counter',
    'Gym vending machine', 'Hip Abductor Machine', 'Hip Adductor Machine',
    'Incline Barbell Bench Press Station', 'Incline Chest Press Machine',
    'Lat Pull', 'Lat Pulldown Machine', 'Lateral Raise Machine',
    'Leg Curl Machine', 'Leg Extension Machine', 'Lying Leg Curl Machine',
    'Olympic Lifting Platform', 'Pec Deck Fly', 'Preacher Curl Machine', 'Roman Chair',
    'Row Machine', 'Rowing Machine', 'Seated Cable Row', 'Seated Calf Press Machine',
    'Seated Crunch Machine', 'Seated Leg Curl Machine', 'Seated Leg Press Machine',
    'Seated Row Machine', 'Seated Shoulder Press', 'Seated Triceps Press',
    'Shoulder Press Machine', 'Smith Machine', 'Squat Rack',
    'Standing Leg Curl Machine', 'Tricep Extension Machine', 'V Squat Machine'
);

-- Reset sequences
SELECT setval('muscles_id_seq', COALESCE((SELECT MAX(id) FROM muscles), 0) + 1, false);
SELECT setval('muscle_groups_id_seq', COALESCE((SELECT MAX(id) FROM muscle_groups), 0) + 1, false);
SELECT setval('muscle_group_members_id_seq', COALESCE((SELECT MAX(id) FROM muscle_group_members), 0) + 1, false);
SELECT setval('equipment_id_seq', COALESCE((SELECT MAX(id) FROM equipment), 0) + 1, false);

COMMIT;
