package usecase

import (
	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/models"
	"github.com/gymmate/backend/response"
	"github.com/pkg/errors"
)

type muscleUsecase struct {
	muscleRepo domain.MuscleRepository
}

// NewMuscleUsecase creates a new muscle usecase instance
func NewMuscleUsecase(muscleRepo domain.MuscleRepository) domain.MuscleUsecase {
	return &muscleUsecase{muscleRepo: muscleRepo}
}

// ListMuscles retrieves all muscles with their group memberships
func (u *muscleUsecase) ListMuscles() ([]*response.MuscleResponse, error) {
	muscles, err := u.muscleRepo.ListMuscles()
	if err != nil {
		return nil, errors.Wrap(err, "[MuscleUsecase.ListMuscles]: Failed to list muscles")
	}

	var result []*response.MuscleResponse
	for _, m := range muscles {
		result = append(result, u.muscleToResponse(m))
	}
	return result, nil
}

// ListMuscleGroups retrieves all muscle groups
func (u *muscleUsecase) ListMuscleGroups() ([]*response.MuscleGroupResponse, error) {
	groups, err := u.muscleRepo.ListMuscleGroups()
	if err != nil {
		return nil, errors.Wrap(err, "[MuscleUsecase.ListMuscleGroups]: Failed to list muscle groups")
	}

	var result []*response.MuscleGroupResponse
	for _, g := range groups {
		result = append(result, u.muscleGroupToResponse(g))
	}
	return result, nil
}

// ListMusclesByGroupID retrieves all muscles belonging to a specific group
func (u *muscleUsecase) ListMusclesByGroupID(groupID uint) ([]*response.MuscleResponse, error) {
	muscles, err := u.muscleRepo.ListMusclesByGroupID(groupID)
	if err != nil {
		return nil, errors.Wrap(err, "[MuscleUsecase.ListMusclesByGroupID]: Failed to list muscles by group")
	}

	var result []*response.MuscleResponse
	for _, m := range muscles {
		result = append(result, u.muscleToResponse(m))
	}
	return result, nil
}

// ListExercisesByMuscleID retrieves all exercises that target a specific muscle
func (u *muscleUsecase) ListExercisesByMuscleID(muscleID uint) ([]*response.MuscleExerciseResponse, error) {
	rows, err := u.muscleRepo.ListExercisesByMuscleID(muscleID)
	if err != nil {
		return nil, errors.Wrap(err, "[MuscleUsecase.ListExercisesByMuscleID]: Failed to list exercises by muscle")
	}

	var result []*response.MuscleExerciseResponse
	for _, em := range rows {
		result = append(result, &response.MuscleExerciseResponse{
			ID:                   em.Exercise.ID,
			ExerciseName:         em.Exercise.ExerciseName,
			MovementType:         em.Exercise.MovementType,
			MovementPattern:      em.Exercise.MovementPattern,
			DifficultyLevel:      em.Exercise.DifficultyLevel,
			IsCompound:           em.Exercise.IsCompound,
			ImageURL:             em.Exercise.ImageURL,
			ImageFullURL:         response.BuildImageURL(em.Exercise.ImageURL),
			InvolvementType:      em.InvolvementType,
			ActivationPercentage: em.ActivationPercentage,
		})
	}
	return result, nil
}

func (u *muscleUsecase) muscleToResponse(m *models.Muscle) *response.MuscleResponse {
	groups := make([]response.MuscleGroupBrief, 0, len(m.MuscleGroupMembers))
	for _, mgm := range m.MuscleGroupMembers {
		groups = append(groups, response.MuscleGroupBrief{
			ID:            mgm.MuscleGroup.ID,
			GroupName:     mgm.MuscleGroup.GroupName,
			SplitCategory: mgm.MuscleGroup.SplitCategory,
		})
	}

	return &response.MuscleResponse{
		ID:             m.ID,
		MuscleName:     m.MuscleName,
		ScientificName: m.ScientificName,
		BodyRegion:     m.BodyRegion,
		Function:       m.Function,
		Groups:         groups,
		CreatedAt:      m.CreatedAt,
		UpdatedAt:      m.UpdatedAt,
	}
}

func (u *muscleUsecase) muscleGroupToResponse(g *models.MuscleGroup) *response.MuscleGroupResponse {
	return &response.MuscleGroupResponse{
		ID:            g.ID,
		GroupName:     g.GroupName,
		SplitCategory: g.SplitCategory,
		CreatedAt:     g.CreatedAt,
		UpdatedAt:     g.UpdatedAt,
	}
}
