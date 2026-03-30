package repository

import (
	"github.com/gymmate/backend/constant"
	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/models"
	"github.com/pkg/errors"
	"gorm.io/gorm"
)

type flexSubRepository struct {
	db *gorm.DB
}

func NewFlexSubRepository(db *gorm.DB) domain.FlexSubRepository {
	return &flexSubRepository{db: db}
}

// GetExerciseWithDetails fetches exercise with muscles and equipment
func (r *flexSubRepository) GetExerciseWithDetails(exerciseID uint) (*models.Exercise, error) {
	var exercise models.Exercise
	if err := r.db.
		Preload("ExerciseMuscles.Muscle").
		Preload("ExerciseEquipments.Equipment").
		First(&exercise, exerciseID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, errors.Wrap(err, "[FlexSubRepository.GetExerciseWithDetails]: Error querying database")
	}
	return &exercise, nil
}

// GetComputedSubstitutes retrieves pre-computed substitutes for an exercise
// with deep preloading for equipment and muscle relationships (needed for floorplan availability checks)
func (r *flexSubRepository) GetComputedSubstitutes(exerciseID uint, minSimilarity int, limit int) ([]*models.ComputedExerciseSubstitute, error) {
	var substitutes []*models.ComputedExerciseSubstitute
	query := r.db.
		Preload("SubstituteExercise.ExerciseEquipments.Equipment").
		Preload("SubstituteExercise.ExerciseMuscles.Muscle").
		Where("original_exercise_id = ? AND similarity_score >= ?", exerciseID, minSimilarity).
		Order("similarity_score DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}

	if err := query.Find(&substitutes).Error; err != nil {
		return nil, errors.Wrap(err, "[FlexSubRepository.GetComputedSubstitutes]: Error querying database")
	}
	return substitutes, nil
}

// GetEquipmentByID fetches equipment by ID
func (r *flexSubRepository) GetEquipmentByID(id uint) (*models.Equipment, error) {
	var equipment models.Equipment
	if err := r.db.First(&equipment, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, errors.Wrap(err, "[FlexSubRepository.GetEquipmentByID]: Error querying database")
	}
	return &equipment, nil
}

// UpdateEquipmentStatus updates equipment status
func (r *flexSubRepository) UpdateEquipmentStatus(id uint, status string) error {
	if err := r.db.Model(&models.Equipment{}).Where("id = ?", id).Update("status", status).Error; err != nil {
		return errors.Wrap(err, "[FlexSubRepository.UpdateEquipmentStatus]: Error updating status")
	}
	return nil
}

// GetActiveFloorplan gets the currently active floorplan
func (r *flexSubRepository) GetActiveFloorplan() (*models.Floorplan, error) {
	var floorplan models.Floorplan
	if err := r.db.Where("is_active = ?", true).First(&floorplan).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, errors.Wrap(err, "[FlexSubRepository.GetActiveFloorplan]: Error finding active floorplan")
	}
	return &floorplan, nil
}

// GetActiveEquipmentInstancesByFloorplan gets all active equipment instances on a floorplan
func (r *flexSubRepository) GetActiveEquipmentInstancesByFloorplan(floorplanID uint) ([]models.EquipmentInstance, error) {
	var instances []models.EquipmentInstance
	if err := r.db.
		Preload("Equipment").
		Where("floorplan_id = ? AND status = ?", floorplanID, constant.StatusActive).
		Find(&instances).Error; err != nil {
		return nil, errors.Wrap(err, "[FlexSubRepository.GetActiveEquipmentInstancesByFloorplan]: Error querying equipment instances")
	}
	return instances, nil
}

// UpdateEquipmentInstanceStatus updates equipment instance status
func (r *flexSubRepository) UpdateEquipmentInstanceStatus(id uint, status string) error {
	if err := r.db.Model(&models.EquipmentInstance{}).Where("id = ?", id).Update("status", status).Error; err != nil {
		return errors.Wrap(err, "[FlexSubRepository.UpdateEquipmentInstanceStatus]: Error updating status")
	}
	return nil
}

// GetEquipmentInstanceByID fetches equipment instance by ID with equipment
func (r *flexSubRepository) GetEquipmentInstanceByID(id uint) (*models.EquipmentInstance, error) {
	var instance models.EquipmentInstance
	if err := r.db.Preload("Equipment").First(&instance, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, errors.Wrap(err, "[FlexSubRepository.GetEquipmentInstanceByID]: Error querying database")
	}
	return &instance, nil
}

// GetEquipmentForExercise gets all equipment that can be used for an exercise
func (r *flexSubRepository) GetEquipmentForExercise(exerciseID uint) ([]models.ExerciseEquipment, error) {
	var equipments []models.ExerciseEquipment
	if err := r.db.
		Preload("Equipment").
		Where("exercise_id = ?", exerciseID).
		Find(&equipments).Error; err != nil {
		return nil, errors.Wrap(err, "[FlexSubRepository.GetEquipmentForExercise]: Error querying database")
	}
	return equipments, nil
}
