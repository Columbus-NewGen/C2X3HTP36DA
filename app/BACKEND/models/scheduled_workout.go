package models

import (
	"time"
)

// ScheduledWorkout represents a calendar instance of a workout session
// This bridges the gap between program templates and actual workout logs
type ScheduledWorkout struct {
	ID               uint       `gorm:"primaryKey;autoIncrement"`
	UserProgramID    uint       `gorm:"not null;index"`
	ProgramSessionID uint       `gorm:"not null;index"`
	ScheduledDate    time.Time  `gorm:"type:date;not null;index"`
	WeekNumber       int        `gorm:"not null;check:week_number > 0"`
	Status           string     `gorm:"size:20;not null;default:'SCHEDULED';index;check:status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'MISSED', 'SKIPPED', 'CANCELLED')"`
	CompletedAt      *time.Time `gorm:"type:timestamptz"`
	WorkoutLogID     *uint      `gorm:"index"`
	Notes            string     `gorm:"type:text"`
	SessionName      string     `gorm:"size:255"`  // Snapshot from template session
	WorkoutSplit     string     `gorm:"size:50"`   // Snapshot from template session
	CreatedAt        time.Time  `gorm:"autoCreateTime"`
	UpdatedAt        time.Time  `gorm:"autoUpdateTime"`

	// Relationships
	UserProgram                UserProgram                `gorm:"foreignKey:UserProgramID;constraint:OnDelete:CASCADE"`
	ProgramSession             ProgramSession             `gorm:"foreignKey:ProgramSessionID;constraint:OnDelete:CASCADE"`
	WorkoutLog                 *WorkoutLog                `gorm:"foreignKey:WorkoutLogID;constraint:OnDelete:SET NULL"`
	ScheduledWorkoutExercises  []ScheduledWorkoutExercise `gorm:"foreignKey:ScheduledWorkoutID"`
}

// TableName overrides the default table name
func (ScheduledWorkout) TableName() string {
	return "scheduled_workouts"
}
