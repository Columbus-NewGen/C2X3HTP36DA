BEGIN;

ALTER TABLE user_weight_logs
  ALTER COLUMN recorded_at TYPE TIMESTAMPTZ USING recorded_at::timestamptz,
  ALTER COLUMN recorded_at SET DEFAULT NOW();

COMMIT;
