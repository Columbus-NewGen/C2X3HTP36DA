package models

import (
	"time"

	"gorm.io/gorm"
)

type Program struct {
	ID              uint           `gorm:"primaryKey;autoIncrement"`
	UserID          *uint          `gorm:"index"`                         // nullable for templates
	ProgramName     string         `gorm:"size:255;not null"`
	Description     string         `gorm:"type:text"`
	Goal            string         `gorm:"size:255"`                      // muscle gain, fat loss, strength, endurance
	DurationWeeks   int            `gorm:"check:duration_weeks > 0"`
	DaysPerWeek     int            `gorm:"check:days_per_week >= 1 AND days_per_week <= 7"`
	DifficultyLevel string         `gorm:"size:50"`                       // beginner, intermediate, advanced
	IsTemplate      bool           `gorm:"default:false"`
	CreatedBy       *uint          `gorm:"index"`                         // trainer ID who created the template
	StartDate       *time.Time     `gorm:"type:date"`
	EndDate         *time.Time     `gorm:"type:date"`
	IsActive        bool           `gorm:"default:false"`
	CreatedAt       time.Time      `gorm:"autoCreateTime"`
	UpdatedAt       time.Time      `gorm:"autoUpdateTime"`
	DeletedAt       gorm.DeletedAt `gorm:"index"`

	// Relationships
	User            *User            `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
	Creator         *User            `gorm:"foreignKey:CreatedBy;constraint:OnDelete:SET NULL"`
	ProgramSessions []ProgramSession `gorm:"foreignKey:ProgramID"`
	Sessions        []ProgramSession `gorm:"foreignKey:ProgramID"` // Alias for convenience
}

// TableName overrides the default table name
func (Program) TableName() string {
	return "programs"
}

type ProgramSession struct {
	ID           uint           `gorm:"primaryKey;autoIncrement"`
	ProgramID    uint           `gorm:"not null;index"`
	SessionName  string         `gorm:"size:255;not null"`
	WorkoutSplit string         `gorm:"size:50"` // Push, Pull, Legs, Upper, Lower, Full Body
	DayNumber    int            `gorm:"not null;check:day_number > 0"`
	DayOfWeek    *int           `gorm:"check:day_of_week >= 1 AND day_of_week <= 7"` // 1=Monday, 7=Sunday (nullable for backward compatibility)
	Notes        string         `gorm:"type:text"`
	CreatedAt    time.Time      `gorm:"autoCreateTime"`
	UpdatedAt    time.Time      `gorm:"autoUpdateTime"`
	DeletedAt    gorm.DeletedAt `gorm:"index"`

	// Relationships
	Program          Program           `gorm:"foreignKey:ProgramID;constraint:OnDelete:CASCADE"`
	SessionExercises []SessionExercise `gorm:"foreignKey:SessionID"`
	Exercises        []SessionExercise `gorm:"foreignKey:SessionID"` // Alias for convenience
	WorkoutLogs      []WorkoutLog      `gorm:"foreignKey:SessionID"`
}

// TableName overrides the default table name
func (ProgramSession) TableName() string {
	return "program_sessions"
}

