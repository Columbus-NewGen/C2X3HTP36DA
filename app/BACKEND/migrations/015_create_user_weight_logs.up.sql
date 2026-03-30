BEGIN;

CREATE TABLE IF NOT EXISTS user_weight_logs (
    id          SERIAL PRIMARY KEY,
    user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weight_kg   DECIMAL(5,2) NOT NULL,
    recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
    note        TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_uwl_user_id     ON user_weight_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_uwl_recorded_at ON user_weight_logs(user_id, recorded_at DESC);

COMMIT;
