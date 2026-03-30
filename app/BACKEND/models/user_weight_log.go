package models

import "time"

type UserWeightLog struct {
	ID         uint      `gorm:"primaryKey;autoIncrement"`
	UserID     uint      `gorm:"not null;index"`
	WeightKg   float64   `gorm:"type:decimal(5,2);not null"`
	RecordedAt time.Time `gorm:"not null"`
	Note       *string   `gorm:"type:text"`
	CreatedAt  time.Time `gorm:"autoCreateTime"`
}
