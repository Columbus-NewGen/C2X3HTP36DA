package repository

import (
	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/models"
	"github.com/pkg/errors"
	"gorm.io/gorm"
)

type equipmentRepository struct {
	db *gorm.DB
}

// NewEquipmentRepository creates a new equipment repository instance
func NewEquipmentRepository(db *gorm.DB) domain.EquipmentRepository {
	return &equipmentRepository{
		db: db,
	}
}

// Create creates a new equipment
func (r *equipmentRepository) Create(equipment *models.Equipment) error {
	if err := r.db.Create(equipment).Error; err != nil {
		return errors.Wrap(err, "[EquipmentRepository.Create]: Failed to create equipment")
	}
	return nil
}

// GetByID retrieves an equipment by ID
func (r *equipmentRepository) GetByID(id uint) (*models.Equipment, error) {
	var equipment models.Equipment
	if err := r.db.First(&equipment, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.Wrap(err, "[EquipmentRepository.GetByID]: Equipment not found")
		}
		return nil, errors.Wrap(err, "[EquipmentRepository.GetByID]: Failed to get equipment")
	}
	return &equipment, nil
}

// List retrieves all equipment
func (r *equipmentRepository) List() ([]*models.Equipment, error) {
	var equipment []*models.Equipment
	if err := r.db.Find(&equipment).Error; err != nil {
		return nil, errors.Wrap(err, "[EquipmentRepository.List]: Failed to list equipment")
	}
	return equipment, nil
}

// Update updates an equipment
func (r *equipmentRepository) Update(equipment *models.Equipment) error {
	if err := r.db.Save(equipment).Error; err != nil {
		return errors.Wrap(err, "[EquipmentRepository.Update]: Failed to update equipment")
	}
	return nil
}

// GetWithExercises retrieves equipment with exercise relationships preloaded
func (r *equipmentRepository) GetWithExercises(id uint) (*models.Equipment, error) {
	var equipment models.Equipment
	if err := r.db.Preload("ExerciseEquipments.Exercise").First(&equipment, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.Wrap(err, "[EquipmentRepository.GetWithExercises]: Equipment not found")
		}
		return nil, errors.Wrap(err, "[EquipmentRepository.GetWithExercises]: Failed to get equipment")
	}
	return &equipment, nil
}

// Delete soft deletes an equipment
func (r *equipmentRepository) Delete(id uint) error {
	if err := r.db.Delete(&models.Equipment{}, id).Error; err != nil {
		return errors.Wrap(err, "[EquipmentRepository.Delete]: Failed to delete equipment")
	}
	return nil
}
