package domain

import (
	"github.com/gymmate/backend/models"
	"github.com/gymmate/backend/response"
)

// MuscleUsecase defines the business logic for muscle operations
type MuscleUsecase interface {
	// ListMuscles retrieves all muscles with their group memberships
	ListMuscles() ([]*response.MuscleResponse, error)

	// ListMuscleGroups retrieves all muscle groups
	ListMuscleGroups() ([]*response.MuscleGroupResponse, error)

	// ListMusclesByGroupID retrieves all muscles belonging to a specific group
	ListMusclesByGroupID(groupID uint) ([]*response.MuscleResponse, error)

	// ListExercisesByMuscleID retrieves all exercises that target a specific muscle
	ListExercisesByMuscleID(muscleID uint) ([]*response.MuscleExerciseResponse, error)
}

// MuscleRepository defines the data access layer for muscles
type MuscleRepository interface {
	// ListMuscles retrieves all muscles with their group memberships
	ListMuscles() ([]*models.Muscle, error)

	// ListMuscleGroups retrieves all muscle groups
	ListMuscleGroups() ([]*models.MuscleGroup, error)

	// ListMusclesByGroupID retrieves all muscles belonging to a specific group
	ListMusclesByGroupID(groupID uint) ([]*models.Muscle, error)

	// ListExercisesByMuscleID retrieves exercise_muscle join rows for a specific muscle
	ListExercisesByMuscleID(muscleID uint) ([]*models.ExerciseMuscle, error)
}
