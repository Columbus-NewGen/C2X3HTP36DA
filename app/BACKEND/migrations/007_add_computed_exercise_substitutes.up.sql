BEGIN;

CREATE TABLE computed_exercise_substitutes (
    id BIGSERIAL PRIMARY KEY,
    original_exercise_id BIGINT NOT NULL,
    substitute_exercise_id BIGINT NOT NULL,
    similarity_score INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT uq_computed_subs_pair UNIQUE(original_exercise_id, substitute_exercise_id),
    CONSTRAINT chk_computed_subs_score CHECK (similarity_score >= 0 AND similarity_score <= 100),
    CONSTRAINT chk_computed_subs_not_self CHECK (original_exercise_id != substitute_exercise_id)
);

-- Primary read pattern: substitutes for exercise X, ordered by score
CREATE INDEX idx_computed_subs_original ON computed_exercise_substitutes(original_exercise_id, similarity_score DESC);
-- Cleanup pattern: find all rows referencing a deleted exercise
CREATE INDEX idx_computed_subs_substitute ON computed_exercise_substitutes(substitute_exercise_id);

ALTER TABLE computed_exercise_substitutes
ADD CONSTRAINT fk_computed_subs_original FOREIGN KEY (original_exercise_id) REFERENCES exercises(id) ON DELETE CASCADE;
ALTER TABLE computed_exercise_substitutes
ADD CONSTRAINT fk_computed_subs_substitute FOREIGN KEY (substitute_exercise_id) REFERENCES exercises(id) ON DELETE CASCADE;

COMMIT;
