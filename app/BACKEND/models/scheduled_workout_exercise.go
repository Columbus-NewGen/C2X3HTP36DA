package models

import (
	"time"
)

// ScheduledWorkoutExercise represents an exercise prescription snapshot for a scheduled workout.
// These are copied from session exercises at spawn time, providing isolation from template edits.
type ScheduledWorkoutExercise struct {
	ID                 uint      `gorm:"primaryKey;autoIncrement"`
	ScheduledWorkoutID uint      `gorm:"not null;index"`
	ExerciseID         uint      `gorm:"not null;index"`
	Sets               int       `gorm:"not null;check:sets > 0"`
	Reps               int       `gorm:"not null;check:reps > 0"`
	Weight             *float64  `gorm:"type:decimal(10,2)"`
	RestSeconds        int       `gorm:"check:rest_seconds >= 0"`
	OrderSequence      int       `gorm:"not null;default:1"`
	CreatedAt          time.Time `gorm:"autoCreateTime"`
	UpdatedAt          time.Time `gorm:"autoUpdateTime"`

	// Relationships
	ScheduledWorkout ScheduledWorkout `gorm:"foreignKey:ScheduledWorkoutID;constraint:OnDelete:CASCADE"`
	Exercise         Exercise         `gorm:"foreignKey:ExerciseID;constraint:OnDelete:CASCADE"`
}

// TableName overrides the default table name
func (ScheduledWorkoutExercise) TableName() string {
	return "scheduled_workout_exercises"
}
