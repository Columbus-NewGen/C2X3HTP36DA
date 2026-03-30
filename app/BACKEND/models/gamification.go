package models

import "time"

type Badge struct {
	ID           uint      `gorm:"primaryKey;autoIncrement"`
	Name         string    `gorm:"type:varchar(100);not null;uniqueIndex"`
	DisplayName  string    `gorm:"type:varchar(255);not null"`
	Description  *string   `gorm:"type:text"`
	IconURL      *string   `gorm:"type:varchar(500)"`
	TriggerType  string    `gorm:"type:varchar(50);not null"`
	TriggerValue *int      `gorm:"type:int"`
	XPReward     int       `gorm:"not null;default:0"`
	SortOrder    int       `gorm:"not null;default:0"`
	CreatedAt    time.Time `gorm:"autoCreateTime"`
}

type UserGamificationProfile struct {
	ID              uint       `gorm:"primaryKey;autoIncrement"`
	UserID          uint       `gorm:"not null;uniqueIndex"`
	TotalXP         int        `gorm:"not null;default:0"`
	CurrentLevel    int        `gorm:"not null;default:1"`
	CurrentStreak   int        `gorm:"not null;default:0"`
	LongestStreak   int        `gorm:"not null;default:0"`
	LastWorkoutDate *time.Time `gorm:"type:date"`
	WeeklyTarget    int        `gorm:"not null;default:3"`
	CreatedAt       time.Time  `gorm:"autoCreateTime"`
	UpdatedAt       time.Time  `gorm:"autoUpdateTime"`
}

type XPEvent struct {
	ID            uint      `gorm:"primaryKey;autoIncrement"`
	UserID        uint      `gorm:"not null;index"`
	EventType     string    `gorm:"type:varchar(50);not null"`
	XPAmount      int       `gorm:"not null"`
	Description   *string   `gorm:"type:text"`
	ReferenceID   *int      `gorm:"type:int"`
	ReferenceType *string   `gorm:"type:varchar(50)"`
	CreatedAt     time.Time `gorm:"autoCreateTime"`
}

type UserBadge struct {
	ID       uint      `gorm:"primaryKey;autoIncrement"`
	UserID   uint      `gorm:"not null;index"`
	BadgeID  uint      `gorm:"not null"`
	Badge    Badge     `gorm:"foreignKey:BadgeID"`
	EarnedAt time.Time `gorm:"not null;autoCreateTime"`
}
