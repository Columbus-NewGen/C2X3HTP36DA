package models

import (
	"time"

	"gorm.io/gorm"
)

// Floorplan represents the global gym floorplan canvas
type Floorplan struct {
	ID           uint           `gorm:"primaryKey;autoIncrement"`
	Name         string         `gorm:"size:255;not null"`
	CanvasWidth  int            `gorm:"not null;default:1000"`
	CanvasHeight int            `gorm:"not null;default:800"`
	GridSize     int            `gorm:"default:10"`
	Description  string         `gorm:"type:text"`
	IsActive     bool           `gorm:"default:true"`
	CreatedAt    time.Time      `gorm:"autoCreateTime"`
	UpdatedAt    time.Time      `gorm:"autoUpdateTime"`
	DeletedAt    gorm.DeletedAt `gorm:"index"`

	// Relationships
	Walls              []FloorplanWall     `gorm:"foreignKey:FloorplanID"`
	EquipmentInstances []EquipmentInstance `gorm:"foreignKey:FloorplanID"`
}

// FloorplanWall represents a wall entity on the floorplan
type FloorplanWall struct {
	ID          uint           `gorm:"primaryKey;autoIncrement"`
	FloorplanID uint           `gorm:"not null;index"`
	StartX      float64        `gorm:"type:decimal(10,2);not null"`
	StartY      float64        `gorm:"type:decimal(10,2);not null"`
	EndX        float64        `gorm:"type:decimal(10,2);not null"`
	EndY        float64        `gorm:"type:decimal(10,2);not null"`
	Thickness   int            `gorm:"default:5"`
	Color       string         `gorm:"size:7;default:'#000000'"`
	CreatedAt   time.Time      `gorm:"autoCreateTime"`
	UpdatedAt   time.Time      `gorm:"autoUpdateTime"`
	DeletedAt   gorm.DeletedAt `gorm:"index"`

	// Relationships
	Floorplan Floorplan `gorm:"foreignKey:FloorplanID;constraint:OnDelete:CASCADE"`
}

// EquipmentInstance represents a positioned equipment instance on the floorplan
type EquipmentInstance struct {
	ID          uint           `gorm:"primaryKey;autoIncrement"`
	FloorplanID uint           `gorm:"not null;index"`
	EquipmentID uint           `gorm:"not null;index"`
	PositionX   float64        `gorm:"type:decimal(10,2);not null"`
	PositionY   float64        `gorm:"type:decimal(10,2);not null"`
	Rotation    float64        `gorm:"type:decimal(5,2);default:0"`
	Width       int            `gorm:"not null;default:100"`
	Height      int            `gorm:"not null;default:100"`
	Label       string         `gorm:"size:255"`
	Status      string         `gorm:"size:20;not null;default:'ACTIVE'"` // ACTIVE, MAINTENANCE
	CreatedAt   time.Time      `gorm:"autoCreateTime"`
	UpdatedAt   time.Time      `gorm:"autoUpdateTime"`
	DeletedAt   gorm.DeletedAt `gorm:"index"`

	// Relationships
	Floorplan Floorplan `gorm:"foreignKey:FloorplanID;constraint:OnDelete:CASCADE"`
	Equipment Equipment `gorm:"foreignKey:EquipmentID;constraint:OnDelete:RESTRICT"`
}
