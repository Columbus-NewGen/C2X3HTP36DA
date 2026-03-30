package usecase

import (
	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/models"
	"github.com/gymmate/backend/request"
	"github.com/gymmate/backend/response"
	"github.com/pkg/errors"
)

type equipmentUsecase struct {
	equipmentRepo domain.EquipmentRepository
}

// NewEquipmentUsecase creates a new equipment usecase instance
func NewEquipmentUsecase(equipmentRepo domain.EquipmentRepository) domain.EquipmentUsecase {
	return &equipmentUsecase{
		equipmentRepo: equipmentRepo,
	}
}

// CreateEquipment creates a new equipment
func (u *equipmentUsecase) CreateEquipment(req *request.CreateEquipmentRequest) (*response.EquipmentResponse, error) {
	equipment := &models.Equipment{
		EquipmentName: req.EquipmentName,
		EquipmentType: req.EquipmentType,
		Description:   req.Description,
		Status:        "ACTIVE",
		ImageURL:      req.ImageURL,
	}

	if err := u.equipmentRepo.Create(equipment); err != nil {
		return nil, errors.Wrap(err, "[EquipmentUsecase.CreateEquipment]: Failed to create equipment")
	}

	return u.modelToResponse(equipment), nil
}

// GetEquipment retrieves an equipment by ID
func (u *equipmentUsecase) GetEquipment(id uint) (*response.EquipmentResponse, error) {
	equipment, err := u.equipmentRepo.GetByID(id)
	if err != nil {
		return nil, errors.Wrap(err, "[EquipmentUsecase.GetEquipment]: Failed to get equipment")
	}

	return u.modelToResponse(equipment), nil
}

// ListEquipment retrieves all equipment
func (u *equipmentUsecase) ListEquipment() ([]*response.EquipmentResponse, error) {
	equipment, err := u.equipmentRepo.List()
	if err != nil {
		return nil, errors.Wrap(err, "[EquipmentUsecase.ListEquipment]: Failed to list equipment")
	}

	var result []*response.EquipmentResponse
	for _, eq := range equipment {
		result = append(result, u.modelToResponse(eq))
	}

	return result, nil
}

// UpdateEquipment updates an equipment
func (u *equipmentUsecase) UpdateEquipment(id uint, req *request.UpdateEquipmentRequest) (*response.EquipmentResponse, error) {
	// Get existing equipment
	equipment, err := u.equipmentRepo.GetByID(id)
	if err != nil {
		return nil, errors.Wrap(err, "[EquipmentUsecase.UpdateEquipment]: Failed to get equipment")
	}

	// Update fields if provided
	if req.EquipmentName != nil {
		equipment.EquipmentName = *req.EquipmentName
	}
	if req.EquipmentType != nil {
		equipment.EquipmentType = *req.EquipmentType
	}
	if req.Description != nil {
		equipment.Description = *req.Description
	}
	if req.Status != nil {
		equipment.Status = *req.Status
	}
	if req.ImageURL != nil {
		equipment.ImageURL = req.ImageURL
	}

	// Save updated equipment
	if err := u.equipmentRepo.Update(equipment); err != nil {
		return nil, errors.Wrap(err, "[EquipmentUsecase.UpdateEquipment]: Failed to update equipment")
	}

	return u.modelToResponse(equipment), nil
}

// DeleteEquipment deletes an equipment
func (u *equipmentUsecase) DeleteEquipment(id uint) error {
	// Check if equipment exists
	_, err := u.equipmentRepo.GetByID(id)
	if err != nil {
		return errors.Wrap(err, "[EquipmentUsecase.DeleteEquipment]: Failed to get equipment")
	}

	// Delete equipment
	if err := u.equipmentRepo.Delete(id); err != nil {
		return errors.Wrap(err, "[EquipmentUsecase.DeleteEquipment]: Failed to delete equipment")
	}

	return nil
}

// GetEquipmentExercises retrieves all exercises that use this equipment
func (u *equipmentUsecase) GetEquipmentExercises(id uint) ([]*response.ExerciseResponse, error) {
	equipment, err := u.equipmentRepo.GetWithExercises(id)
	if err != nil {
		return nil, errors.Wrap(err, "[EquipmentUsecase.GetEquipmentExercises]: Failed to get equipment")
	}

	var result []*response.ExerciseResponse
	for _, ee := range equipment.ExerciseEquipments {
		ex := &ee.Exercise
		result = append(result, &response.ExerciseResponse{
			ID:              ex.ID,
			ExerciseName:    ex.ExerciseName,
			MovementType:    ex.MovementType,
			MovementPattern: ex.MovementPattern,
			Description:     ex.Description,
			DifficultyLevel: ex.DifficultyLevel,
			IsCompound:      ex.IsCompound,
			ImageURL:        ex.ImageURL,
			ImageFullURL:    response.BuildImageURL(ex.ImageURL),
			VideoURL:        ex.VideoURL,
			CreatedAt:       ex.CreatedAt,
			UpdatedAt:       ex.UpdatedAt,
		})
	}
	return result, nil
}

// modelToResponse converts a model to response DTO
func (u *equipmentUsecase) modelToResponse(equipment *models.Equipment) *response.EquipmentResponse {
	return &response.EquipmentResponse{
		ID:            equipment.ID,
		EquipmentName: equipment.EquipmentName,
		EquipmentType: equipment.EquipmentType,
		Description:   equipment.Description,
		Status:        equipment.Status,
		ImageURL:      equipment.ImageURL,
		ImageFullURL:  response.BuildImageURL(equipment.ImageURL),
		CreatedAt:     equipment.CreatedAt,
		UpdatedAt:     equipment.UpdatedAt,
	}
}
