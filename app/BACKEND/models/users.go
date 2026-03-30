package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID               uint           `gorm:"primaryKey;autoIncrement"`
	Name             string         `gorm:"size:255;not null"`
	Email            string         `gorm:"size:255;not null;uniqueIndex"`
	Password         string         `gorm:"size:255;not null"`
	Role             string         `gorm:"size:50;not null;default:'user'"`    // user, trainer, admin
	Status           string         `gorm:"size:20;not null;default:'ACTIVE'"` // ACTIVE, SUSPENDED
	CurrentProgramID *uint          `gorm:"index"`                              // Currently active program
	ImageURL         *string        `gorm:"size:500"`                           // MinIO key path for profile picture
	TrainerID        *uint          `gorm:"index"`                              // Assigned trainer (nullable)
	// Profile fields
	DateOfBirth  *time.Time `gorm:"type:date"`
	Gender       *string    `gorm:"size:10"`  // male, female, other
	HeightCm     *int
	FitnessLevel *string `gorm:"size:20"` // beginner, intermediate, advanced
	FitnessGoal  *string `gorm:"size:20"` // weight_loss, muscle_gain, endurance, maintenance
	Phone        *string `gorm:"size:20"`
	Bio          *string `gorm:"type:text"`
	CreatedAt    time.Time      `gorm:"autoCreateTime"`
	UpdatedAt    time.Time      `gorm:"autoUpdateTime"`
	DeletedAt    gorm.DeletedAt `gorm:"index"`

	// Relationships
	Programs         []Program        `gorm:"foreignKey:UserID"`
	WorkoutLogs      []WorkoutLog     `gorm:"foreignKey:UserID"`
	MuscleTracking   []MuscleTracking `gorm:"foreignKey:UserID"`
	CurrentProgram   *Program         `gorm:"foreignKey:CurrentProgramID;constraint:OnDelete:SET NULL,OnUpdate:CASCADE"`
	AssignedPrograms []UserProgram    `gorm:"foreignKey:UserID"`
	Trainer          *User            `gorm:"foreignKey:TrainerID;constraint:OnDelete:SET NULL"` // Assigned trainer
	Trainees         []User           `gorm:"foreignKey:TrainerID"`                              // Reverse: trainer's assigned users
}
