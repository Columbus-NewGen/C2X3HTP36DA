package models

import (
	"time"

	"gorm.io/gorm"
)

type MuscleTracking struct {
	ID             uint           `gorm:"primaryKey;autoIncrement"`
	UserID         uint           `gorm:"not null;index"`
	MuscleID       uint           `gorm:"not null;index"`
	TrackingDate   time.Time      `gorm:"type:date;not null"`
	WeeklyVolume   int            `gorm:"check:weekly_volume >= 0"` // total sets per week
	RecoveryStatus int            `gorm:"check:recovery_status >= 1 AND recovery_status <= 5"` // 1=fully recovered, 5=very fatigued
	Notes          string         `gorm:"type:text"`
	CreatedAt      time.Time      `gorm:"autoCreateTime"`
	UpdatedAt      time.Time      `gorm:"autoUpdateTime"`
	DeletedAt      gorm.DeletedAt `gorm:"index"`

	// Relationships
	User   User   `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
	Muscle Muscle `gorm:"foreignKey:MuscleID;constraint:OnDelete:CASCADE"`
}
