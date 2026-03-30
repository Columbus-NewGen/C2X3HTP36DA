BEGIN;

ALTER TABLE user_weight_logs
  ALTER COLUMN recorded_at TYPE DATE USING recorded_at::date,
  ALTER COLUMN recorded_at SET DEFAULT CURRENT_DATE;

COMMIT;
