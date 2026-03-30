package models

import (
	"time"

	"gorm.io/gorm"
)

type Equipment struct {
	ID            uint           `gorm:"primaryKey;autoIncrement"`
	EquipmentName string         `gorm:"size:255;not null;uniqueIndex"`
	EquipmentType string         `gorm:"size:50;not null"` // machine, free_weight, bodyweight, cable
	Description   string         `gorm:"type:text"`
	Status        string         `gorm:"size:20;not null;default:'ACTIVE'"` // ACTIVE, MAINTENANCE
	ImageURL      *string        `gorm:"size:500"`                           // MinIO key path
	CreatedAt     time.Time      `gorm:"autoCreateTime"`
	UpdatedAt     time.Time      `gorm:"autoUpdateTime"`
	DeletedAt     gorm.DeletedAt `gorm:"index"`

	// Relationships
	ExerciseEquipments []ExerciseEquipment `gorm:"foreignKey:EquipmentID"`
	EquipmentInstances []EquipmentInstance `gorm:"foreignKey:EquipmentID"`
}

