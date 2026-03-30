package domain

import (
	"github.com/gymmate/backend/models"
	"github.com/gymmate/backend/request"
	"github.com/gymmate/backend/response"
)


// EquipmentUsecase defines the business logic for equipment operations
type EquipmentUsecase interface {
	// CreateEquipment creates a new equipment
	CreateEquipment(req *request.CreateEquipmentRequest) (*response.EquipmentResponse, error)

	// GetEquipment retrieves an equipment by ID
	GetEquipment(id uint) (*response.EquipmentResponse, error)

	// ListEquipment retrieves all equipment
	ListEquipment() ([]*response.EquipmentResponse, error)

	// UpdateEquipment updates an equipment
	UpdateEquipment(id uint, req *request.UpdateEquipmentRequest) (*response.EquipmentResponse, error)

	// DeleteEquipment deletes an equipment
	DeleteEquipment(id uint) error

	// GetEquipmentExercises retrieves all exercises that use this equipment
	GetEquipmentExercises(id uint) ([]*response.ExerciseResponse, error)
}

// EquipmentRepository defines the data access layer for equipment
type EquipmentRepository interface {
	// Create creates a new equipment
	Create(equipment *models.Equipment) error

	// GetByID retrieves an equipment by ID
	GetByID(id uint) (*models.Equipment, error)

	// List retrieves all equipment
	List() ([]*models.Equipment, error)

	// Update updates an equipment
	Update(equipment *models.Equipment) error

	// Delete soft deletes an equipment
	Delete(id uint) error

	// GetWithExercises retrieves equipment with exercise relationships preloaded
	GetWithExercises(id uint) (*models.Equipment, error)
}
