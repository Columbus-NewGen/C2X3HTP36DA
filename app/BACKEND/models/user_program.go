package models

import (
	"time"
)

// UserProgram represents assignment of a template program to a user.
// ProgramID references the template directly (no copy). Exercises are snapshotted into ScheduledWorkoutExercises.
type UserProgram struct {
	ID          uint       `gorm:"primaryKey;autoIncrement"`
	UserID      uint       `gorm:"not null;index"`
	ProgramID   uint       `gorm:"not null;index"` // References the template program directly
	ProgramName string     `gorm:"size:255"`       // User's custom name for the assigned program
	AssignedBy  uint       `gorm:"not null;index"` // Trainer ID who assigned
	AssignedAt  time.Time  `gorm:"autoCreateTime"`
	StartDate   *time.Time `gorm:"type:date"` // User-selected start date for program (when scheduled workouts begin)
	StartedAt   *time.Time // When user actually started the program (first workout logged)
	CurrentWeek int        `gorm:"default:1"`
	CurrentDay  int        `gorm:"default:1"`
	Status      string     `gorm:"size:20;not null;default:'ACTIVE';index;check:status IN ('ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED', 'MISSED')"`
	CompletedAt *time.Time
	Notes       string    `gorm:"type:text"`
	CreatedAt   time.Time `gorm:"autoCreateTime"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime"`

	// Relationships
	User              User               `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
	Program           Program            `gorm:"foreignKey:ProgramID;constraint:OnDelete:CASCADE"` // Loads template
	Trainer           User               `gorm:"foreignKey:AssignedBy;constraint:OnDelete:SET NULL"`
	ScheduledWorkouts []ScheduledWorkout `gorm:"foreignKey:UserProgramID"` // Calendar instances
}
