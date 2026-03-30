package models

import (
	"time"
)

type SessionExercise struct {
	ID            uint      `gorm:"primaryKey;autoIncrement"`
	SessionID     uint      `gorm:"not null;index"`
	ExerciseID    uint      `gorm:"not null;index"`
	Sets          int       `gorm:"not null;check:sets > 0"`
	Reps          int       `gorm:"not null;check:reps > 0"`
	Weight        *float64  `gorm:"type:decimal(10,2)"` // nullable for bodyweight exercises
	RestSeconds   int       `gorm:"check:rest_seconds >= 0"`
	OrderSequence int       `gorm:"not null;default:1"`
	CreatedAt     time.Time `gorm:"autoCreateTime"`
	UpdatedAt     time.Time `gorm:"autoUpdateTime"`

	// Relationships
	ProgramSession ProgramSession `gorm:"foreignKey:SessionID;constraint:OnDelete:CASCADE"`
	Exercise       Exercise       `gorm:"foreignKey:ExerciseID;constraint:OnDelete:CASCADE"`
}
