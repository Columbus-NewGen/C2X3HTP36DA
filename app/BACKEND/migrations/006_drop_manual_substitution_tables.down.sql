-- Recreate manual flex-sub tables (rollback to manual approach)

BEGIN;

-- Recreate exercise_substitutes table
CREATE TABLE exercise_substitutes (
    id                     BIGSERIAL PRIMARY KEY,
    original_exercise_id   BIGINT NOT NULL,
    substitute_exercise_id BIGINT NOT NULL,
    similarity_score       INTEGER,
    reason                 TEXT,
    created_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_exercise_substitutes_similarity CHECK (
        similarity_score >= 0 AND similarity_score <= 100
    )
);

-- Recreate equipment_substitutions table
CREATE TABLE equipment_substitutions (
    id                      BIGSERIAL PRIMARY KEY,
    original_equipment_id   BIGINT NOT NULL,
    substitute_equipment_id BIGINT NOT NULL,
    similarity_score        INTEGER NOT NULL,
    reason                  TEXT,
    created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_equipment_substitutions_similarity CHECK (
        similarity_score >= 0 AND similarity_score <= 100
    )
);

-- Recreate indexes
CREATE INDEX idx_exercise_substitutes_original_exercise_id ON exercise_substitutes(original_exercise_id);
CREATE INDEX idx_exercise_substitutes_substitute_exercise_id ON exercise_substitutes(substitute_exercise_id);

CREATE INDEX idx_equipment_substitutions_original_equipment_id ON equipment_substitutions(original_equipment_id);
CREATE INDEX idx_equipment_substitutions_substitute_equipment_id ON equipment_substitutions(substitute_equipment_id);

-- Recreate foreign key constraints
ALTER TABLE exercise_substitutes
    ADD CONSTRAINT fk_exercise_substitutes_original
    FOREIGN KEY (original_exercise_id) REFERENCES exercises(id) ON DELETE CASCADE;

ALTER TABLE exercise_substitutes
    ADD CONSTRAINT fk_exercise_substitutes_substitute
    FOREIGN KEY (substitute_exercise_id) REFERENCES exercises(id) ON DELETE CASCADE;

ALTER TABLE equipment_substitutions
    ADD CONSTRAINT fk_equipment_substitutions_original
    FOREIGN KEY (original_equipment_id) REFERENCES equipment(id) ON DELETE CASCADE;

ALTER TABLE equipment_substitutions
    ADD CONSTRAINT fk_equipment_substitutions_substitute
    FOREIGN KEY (substitute_equipment_id) REFERENCES equipment(id) ON DELETE CASCADE;

COMMIT;
