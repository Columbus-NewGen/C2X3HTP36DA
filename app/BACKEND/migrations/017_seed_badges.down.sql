BEGIN;
DELETE FROM badges WHERE name IN (
    'first_workout','workouts_50','workouts_100',
    'streak_7','streak_30','program_complete','level_5','level_10'
);
COMMIT;
