package models

import (
	"time"

	"gorm.io/gorm"
)

type Muscle struct {
	ID             uint           `gorm:"primaryKey;autoIncrement"`
	MuscleName     string         `gorm:"size:255;not null;uniqueIndex"`
	ScientificName string         `gorm:"size:255"`
	BodyRegion     string         `gorm:"size:100"` // chest, back, arms, legs, core, shoulders
	Function       string         `gorm:"type:text"`
	CreatedAt      time.Time      `gorm:"autoCreateTime"`
	UpdatedAt      time.Time      `gorm:"autoUpdateTime"`
	DeletedAt      gorm.DeletedAt `gorm:"index"`

	// Relationships
	MuscleGroupMembers []MuscleGroupMember `gorm:"foreignKey:MuscleID"`
	ExerciseMuscles    []ExerciseMuscle    `gorm:"foreignKey:MuscleID"`
	MuscleTracking     []MuscleTracking    `gorm:"foreignKey:MuscleID"`
}

type MuscleGroup struct {
	ID            uint           `gorm:"primaryKey;autoIncrement"`
	GroupName     string         `gorm:"size:255;not null;uniqueIndex"`
	SplitCategory string         `gorm:"size:50"` // Push, Pull, Legs, Upper, Lower
	CreatedAt     time.Time      `gorm:"autoCreateTime"`
	UpdatedAt     time.Time      `gorm:"autoUpdateTime"`
	DeletedAt     gorm.DeletedAt `gorm:"index"`

	// Relationships
	MuscleGroupMembers []MuscleGroupMember `gorm:"foreignKey:GroupID"`
}

type MuscleGroupMember struct {
	ID        uint      `gorm:"primaryKey;autoIncrement"`
	MuscleID  uint      `gorm:"not null;index"`
	GroupID   uint      `gorm:"not null;index"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`

	// Relationships
	Muscle      Muscle      `gorm:"foreignKey:MuscleID;constraint:OnDelete:CASCADE"`
	MuscleGroup MuscleGroup `gorm:"foreignKey:GroupID;constraint:OnDelete:CASCADE"`
}
