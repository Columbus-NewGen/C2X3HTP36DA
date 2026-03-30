package models

import (
	"time"

	"gorm.io/gorm"
)

type WorkoutLog struct {
	ID                 uint           `gorm:"primaryKey;autoIncrement"`
	UserID             uint           `gorm:"not null;index"`
	SessionID          *uint          `gorm:"index"` // nullable - user might do ad-hoc workouts (backward compatibility)
	ScheduledWorkoutID *uint          `gorm:"index"` // nullable - links to scheduled workout if this log is for a calendar session
	WorkoutDate        time.Time      `gorm:"type:date;not null"`
	DurationMinutes    int            `gorm:"check:duration_minutes >= 0"`
	Notes              string         `gorm:"type:text"`
	CreatedAt          time.Time      `gorm:"autoCreateTime"`
	UpdatedAt          time.Time      `gorm:"autoUpdateTime"`
	DeletedAt          gorm.DeletedAt `gorm:"index"`

	// Relationships
	User             User             `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
	ProgramSession   *ProgramSession  `gorm:"foreignKey:SessionID;constraint:OnDelete:SET NULL"`
	ScheduledWorkout *ScheduledWorkout `gorm:"foreignKey:ScheduledWorkoutID;constraint:OnDelete:SET NULL"`
	LogExercises     []LogExercise    `gorm:"foreignKey:LogID"`
}

type LogExercise struct {
	ID                         uint      `gorm:"primaryKey;autoIncrement"`
	LogID                      uint      `gorm:"not null;index"`
	ExerciseID                 uint      `gorm:"not null;index"`
	ScheduledWorkoutExerciseID *uint     `gorm:"index"` // nullable - links to the prescribed exercise slot
	SetsCompleted              int       `gorm:"not null;check:sets_completed >= 0"`
	RepsCompleted              int       `gorm:"not null;check:reps_completed >= 0"`
	WeightUsed                 *float64  `gorm:"type:decimal(10,2)"` // nullable for bodyweight exercises
	RPERating                  *int      `gorm:"check:rpe_rating >= 1 AND rpe_rating <= 10"` // Rate of Perceived Exertion 1-10
	Notes                      string    `gorm:"type:text"`
	CreatedAt                  time.Time `gorm:"autoCreateTime"`
	UpdatedAt                  time.Time `gorm:"autoUpdateTime"`

	// Relationships
	WorkoutLog                WorkoutLog                `gorm:"foreignKey:LogID;constraint:OnDelete:CASCADE"`
	Exercise                  Exercise                  `gorm:"foreignKey:ExerciseID;constraint:OnDelete:CASCADE"`
	ScheduledWorkoutExercise  *ScheduledWorkoutExercise `gorm:"foreignKey:ScheduledWorkoutExerciseID;constraint:OnDelete:SET NULL"`
}
