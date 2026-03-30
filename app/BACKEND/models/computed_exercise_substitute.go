package models

import "time"

type ComputedExerciseSubstitute struct {
	ID                   uint      `gorm:"primaryKey;autoIncrement"`
	OriginalExerciseID   uint      `gorm:"not null;uniqueIndex:uq_computed_subs_pair"`
	SubstituteExerciseID uint      `gorm:"not null;uniqueIndex:uq_computed_subs_pair"`
	SimilarityScore      int       `gorm:"not null;check:similarity_score >= 0 AND similarity_score <= 100"`
	Reason               string    `gorm:"type:text"`
	CreatedAt            time.Time `gorm:"autoCreateTime"`
	UpdatedAt            time.Time `gorm:"autoUpdateTime"`

	// Relationships
	OriginalExercise   Exercise `gorm:"foreignKey:OriginalExerciseID;constraint:OnDelete:CASCADE"`
	SubstituteExercise Exercise `gorm:"foreignKey:SubstituteExerciseID;constraint:OnDelete:CASCADE"`
}
