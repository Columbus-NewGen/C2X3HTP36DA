package models

import (
	"time"

	"gorm.io/gorm"
)

type Exercise struct {
	ID              uint           `gorm:"primaryKey;autoIncrement"`
	ExerciseName    string         `gorm:"size:255;not null;uniqueIndex"`
	MovementType    string         `gorm:"size:50"`  // compound, isolated
	MovementPattern string         `gorm:"size:100"` // horizontal push, vertical pull, etc.
	Description     string         `gorm:"type:text"`
	DifficultyLevel string         `gorm:"size:50"` // beginner, intermediate, advanced
	IsCompound      bool           `gorm:"default:false"`
	ImageURL        *string        `gorm:"size:500"` // MinIO key path
	VideoURL        *string        `gorm:"size:500"` // External video URL (YouTube, Vimeo)
	CreatedAt       time.Time      `gorm:"autoCreateTime"`
	UpdatedAt       time.Time      `gorm:"autoUpdateTime"`
	DeletedAt       gorm.DeletedAt `gorm:"index"`

	// Relationships
	ExerciseMuscles    []ExerciseMuscle    `gorm:"foreignKey:ExerciseID"`
	ExerciseEquipments []ExerciseEquipment `gorm:"foreignKey:ExerciseID"`
}

type ExerciseMuscle struct {
	ID                   uint      `gorm:"primaryKey;autoIncrement"`
	ExerciseID           uint      `gorm:"not null;index"`
	MuscleID             uint      `gorm:"not null;index"`
	InvolvementType      string    `gorm:"size:50;not null"` // primary, secondary, stabilizer
	ActivationPercentage int       `gorm:"check:activation_percentage >= 0 AND activation_percentage <= 100"`
	CreatedAt            time.Time `gorm:"autoCreateTime"`
	UpdatedAt            time.Time `gorm:"autoUpdateTime"`

	// Relationships
	Exercise Exercise `gorm:"foreignKey:ExerciseID;constraint:OnDelete:CASCADE"`
	Muscle   Muscle   `gorm:"foreignKey:MuscleID;constraint:OnDelete:CASCADE"`
}

type ExerciseEquipment struct {
	ID          uint      `gorm:"primaryKey;autoIncrement"`
	ExerciseID  uint      `gorm:"not null;index"`
	EquipmentID uint      `gorm:"not null;index"`
	IsRequired  bool      `gorm:"default:true"`
	CreatedAt   time.Time `gorm:"autoCreateTime"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime"`

	// Relationships
	Exercise  Exercise  `gorm:"foreignKey:ExerciseID;constraint:OnDelete:CASCADE"`
	Equipment Equipment `gorm:"foreignKey:EquipmentID;constraint:OnDelete:CASCADE"`
}

