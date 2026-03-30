package repository

import (
	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/models"
	"github.com/pkg/errors"
	"gorm.io/gorm"
)

type muscleRepository struct {
	db *gorm.DB
}

// NewMuscleRepository creates a new muscle repository instance
func NewMuscleRepository(db *gorm.DB) domain.MuscleRepository {
	return &muscleRepository{db: db}
}

// ListMuscles retrieves all muscles with their group memberships
func (r *muscleRepository) ListMuscles() ([]*models.Muscle, error) {
	var muscles []*models.Muscle
	if err := r.db.Preload("MuscleGroupMembers.MuscleGroup").Find(&muscles).Error; err != nil {
		return nil, errors.Wrap(err, "[MuscleRepository.ListMuscles]: Failed to list muscles")
	}
	return muscles, nil
}

// ListMuscleGroups retrieves all muscle groups
func (r *muscleRepository) ListMuscleGroups() ([]*models.MuscleGroup, error) {
	var groups []*models.MuscleGroup
	if err := r.db.Find(&groups).Error; err != nil {
		return nil, errors.Wrap(err, "[MuscleRepository.ListMuscleGroups]: Failed to list muscle groups")
	}
	return groups, nil
}

// ListExercisesByMuscleID retrieves exercise_muscle join rows for a specific muscle, with Exercise preloaded
func (r *muscleRepository) ListExercisesByMuscleID(muscleID uint) ([]*models.ExerciseMuscle, error) {
	var rows []*models.ExerciseMuscle
	err := r.db.Preload("Exercise").
		Where("muscle_id = ?", muscleID).
		Find(&rows).Error
	if err != nil {
		return nil, errors.Wrap(err, "[MuscleRepository.ListExercisesByMuscleID]: Failed to list exercises by muscle")
	}
	return rows, nil
}

// ListMusclesByGroupID retrieves all muscles belonging to a specific group
func (r *muscleRepository) ListMusclesByGroupID(groupID uint) ([]*models.Muscle, error) {
	var muscles []*models.Muscle
	err := r.db.
		Preload("MuscleGroupMembers.MuscleGroup").
		Joins("JOIN muscle_group_members ON muscle_group_members.muscle_id = muscles.id").
		Where("muscle_group_members.group_id = ?", groupID).
		Find(&muscles).Error
	if err != nil {
		return nil, errors.Wrap(err, "[MuscleRepository.ListMusclesByGroupID]: Failed to list muscles by group")
	}
	return muscles, nil
}
