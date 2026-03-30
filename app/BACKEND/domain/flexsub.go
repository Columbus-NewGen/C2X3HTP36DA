package domain

import (
	"github.com/gymmate/backend/models"
	"github.com/gymmate/backend/request"
	"github.com/gymmate/backend/response"
)

// FlexSubUsecase defines business logic for flex substitution
type FlexSubUsecase interface {
	// Main algorithm endpoint
	GetSubstitutions(req *request.FlexSubRequest) (*response.FlexSubResponse, error)

	// Status management
	UpdateEquipmentStatus(id uint, status string) (*response.EquipmentDetailResponse, error)
	UpdateEquipmentInstanceStatus(id uint, status string) (*response.EquipmentInstanceResponse, error)
}

// FlexSubRepository defines data access for flex substitution
type FlexSubRepository interface {
	// Exercise queries
	GetExerciseWithDetails(exerciseID uint) (*models.Exercise, error)
	GetComputedSubstitutes(exerciseID uint, minSimilarity int, limit int) ([]*models.ComputedExerciseSubstitute, error)

	// Equipment queries
	GetEquipmentByID(id uint) (*models.Equipment, error)
	UpdateEquipmentStatus(id uint, status string) error

	// Floorplan queries
	GetActiveFloorplan() (*models.Floorplan, error)
	GetActiveEquipmentInstancesByFloorplan(floorplanID uint) ([]models.EquipmentInstance, error)
	UpdateEquipmentInstanceStatus(id uint, status string) error
	GetEquipmentInstanceByID(id uint) (*models.EquipmentInstance, error)

	// Exercise-Equipment relationships
	GetEquipmentForExercise(exerciseID uint) ([]models.ExerciseEquipment, error)
}
