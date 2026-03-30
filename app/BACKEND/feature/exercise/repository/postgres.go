package repository

import (
	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/models"
	"github.com/pkg/errors"
	"gorm.io/gorm"
)

type exerciseRepository struct {
	db *gorm.DB
}

// NewExerciseRepository creates a new exercise repository instance
func NewExerciseRepository(db *gorm.DB) domain.ExerciseRepository {
	return &exerciseRepository{
		db: db,
	}
}

// Create creates a new exercise in the database
func (r *exerciseRepository) Create(exercise *models.Exercise) error {
	if err := r.db.Create(exercise).Error; err != nil {
		return errors.Wrap(err, "[ExerciseRepository.Create]: Failed to create exercise")
	}
	return nil
}

// GetByID retrieves an exercise by its ID
func (r *exerciseRepository) GetByID(id uint) (*models.Exercise, error) {
	var exercise models.Exercise
	if err := r.db.First(&exercise, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.Wrap(err, "[ExerciseRepository.GetByID]: Exercise not found")
		}
		return nil, errors.Wrap(err, "[ExerciseRepository.GetByID]: Failed to get exercise")
	}
	return &exercise, nil
}

// List retrieves all exercises
func (r *exerciseRepository) List() ([]*models.Exercise, error) {
	var exercises []*models.Exercise
	if err := r.db.Find(&exercises).Error; err != nil {
		return nil, errors.Wrap(err, "[ExerciseRepository.List]: Failed to list exercises")
	}
	return exercises, nil
}

// Update updates an exercise in the database
func (r *exerciseRepository) Update(exercise *models.Exercise) error {
	if err := r.db.Save(exercise).Error; err != nil {
		return errors.Wrap(err, "[ExerciseRepository.Update]: Failed to update exercise")
	}
	return nil
}

// Delete deletes an exercise from the database (soft delete)
func (r *exerciseRepository) Delete(id uint) error {
	if err := r.db.Delete(&models.Exercise{}, id).Error; err != nil {
		return errors.Wrap(err, "[ExerciseRepository.Delete]: Failed to delete exercise")
	}
	return nil
}

// GetWithMuscles retrieves an exercise with muscle relationships preloaded
func (r *exerciseRepository) GetWithMuscles(id uint) (*models.Exercise, error) {
	var exercise models.Exercise
	if err := r.db.Preload("ExerciseMuscles.Muscle").First(&exercise, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.Wrap(err, "[ExerciseRepository.GetWithMuscles]: Exercise not found")
		}
		return nil, errors.Wrap(err, "[ExerciseRepository.GetWithMuscles]: Failed to get exercise")
	}
	return &exercise, nil
}

// ListWithMuscles retrieves exercises with muscle relationships, excluding specific IDs
func (r *exerciseRepository) ListWithMuscles(excludeIDs []uint) ([]*models.Exercise, error) {
	var exercises []*models.Exercise
	query := r.db.Preload("ExerciseMuscles.Muscle")

	if len(excludeIDs) > 0 {
		query = query.Where("id NOT IN ?", excludeIDs)
	}

	if err := query.Find(&exercises).Error; err != nil {
		return nil, errors.Wrap(err, "[ExerciseRepository.ListWithMuscles]: Failed to list exercises")
	}
	return exercises, nil
}

// GetComputedSubstitutes retrieves pre-computed substitutes for an exercise
func (r *exerciseRepository) GetComputedSubstitutes(exerciseID uint, minSimilarity int, excludeIDs []uint, limit int) ([]*models.ComputedExerciseSubstitute, error) {
	var substitutes []*models.ComputedExerciseSubstitute
	query := r.db.Preload("SubstituteExercise").
		Where("original_exercise_id = ? AND similarity_score >= ?", exerciseID, minSimilarity)

	if len(excludeIDs) > 0 {
		query = query.Where("substitute_exercise_id NOT IN ?", excludeIDs)
	}

	query = query.Order("similarity_score DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}

	if err := query.Find(&substitutes).Error; err != nil {
		return nil, errors.Wrap(err, "[ExerciseRepository.GetComputedSubstitutes]: Failed to get computed substitutes")
	}
	return substitutes, nil
}

// StoreComputedSubstitutes batch-inserts computed substitutes
func (r *exerciseRepository) StoreComputedSubstitutes(substitutes []*models.ComputedExerciseSubstitute) error {
	if len(substitutes) == 0 {
		return nil
	}
	if err := r.db.Create(&substitutes).Error; err != nil {
		return errors.Wrap(err, "[ExerciseRepository.StoreComputedSubstitutes]: Failed to store computed substitutes")
	}
	return nil
}

// GetWithEquipment retrieves an exercise with equipment relationships preloaded
func (r *exerciseRepository) GetWithEquipment(id uint) (*models.Exercise, error) {
	var exercise models.Exercise
	if err := r.db.Preload("ExerciseEquipments.Equipment.EquipmentInstances").First(&exercise, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.Wrap(err, "[ExerciseRepository.GetWithEquipment]: Exercise not found")
		}
		return nil, errors.Wrap(err, "[ExerciseRepository.GetWithEquipment]: Failed to get exercise")
	}
	return &exercise, nil
}

// ReplaceMuscles replaces all muscle associations for an exercise (full replace)
func (r *exerciseRepository) ReplaceMuscles(exerciseID uint, muscles []models.ExerciseMuscle) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("exercise_id = ?", exerciseID).Delete(&models.ExerciseMuscle{}).Error; err != nil {
			return errors.Wrap(err, "[ExerciseRepository.ReplaceMuscles]: Failed to delete existing muscles")
		}
		if len(muscles) > 0 {
			if err := tx.Create(&muscles).Error; err != nil {
				return errors.Wrap(err, "[ExerciseRepository.ReplaceMuscles]: Failed to insert new muscles")
			}
		}
		return nil
	})
}

// ReplaceEquipment replaces all equipment associations for an exercise (full replace)
func (r *exerciseRepository) ReplaceEquipment(exerciseID uint, equipment []models.ExerciseEquipment) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("exercise_id = ?", exerciseID).Delete(&models.ExerciseEquipment{}).Error; err != nil {
			return errors.Wrap(err, "[ExerciseRepository.ReplaceEquipment]: Failed to delete existing equipment")
		}
		if len(equipment) > 0 {
			if err := tx.Create(&equipment).Error; err != nil {
				return errors.Wrap(err, "[ExerciseRepository.ReplaceEquipment]: Failed to insert new equipment")
			}
		}
		return nil
	})
}

// DeleteComputedSubstitutes removes all computed substitutes referencing an exercise
func (r *exerciseRepository) DeleteComputedSubstitutes(exerciseID uint) error {
	if err := r.db.Where("original_exercise_id = ? OR substitute_exercise_id = ?", exerciseID, exerciseID).
		Delete(&models.ComputedExerciseSubstitute{}).Error; err != nil {
		return errors.Wrap(err, "[ExerciseRepository.DeleteComputedSubstitutes]: Failed to delete computed substitutes")
	}
	return nil
}
