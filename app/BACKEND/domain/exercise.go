package domain

import (
	"github.com/gymmate/backend/models"
	"github.com/gymmate/backend/request"
	"github.com/gymmate/backend/response"
)

// ExerciseUsecase represents the exercise business logic
type ExerciseUsecase interface {
	CreateExercise(req *request.CreateExerciseRequest) (*response.ExerciseResponse, error)
	GetExercise(id uint) (*response.ExerciseResponse, error)
	ListExercise() ([]*response.ExerciseResponse, error)
	UpdateExercise(id uint, req *request.UpdateExerciseRequest) (*response.ExerciseResponse, error)
	DeleteExercise(id uint) error
	FindSubstitutes(exerciseID uint, minSimilarity int, excludeIDs []uint, limit int) ([]*response.ExerciseSubstituteResponse, error)
	GetExerciseMuscles(id uint) ([]*response.ExerciseMuscleResponse, error)
	GetExerciseEquipment(id uint) ([]*response.ExerciseEquipmentResponse, error)
}

// ExerciseRepository represents the exercise data access layer
type ExerciseRepository interface {
	Create(exercise *models.Exercise) error
	GetByID(id uint) (*models.Exercise, error)
	List() ([]*models.Exercise, error)
	Update(exercise *models.Exercise) error
	Delete(id uint) error
	GetWithMuscles(id uint) (*models.Exercise, error)
	ListWithMuscles(excludeIDs []uint) ([]*models.Exercise, error)
	GetWithEquipment(id uint) (*models.Exercise, error)
	GetComputedSubstitutes(exerciseID uint, minSimilarity int, excludeIDs []uint, limit int) ([]*models.ComputedExerciseSubstitute, error)
	StoreComputedSubstitutes(substitutes []*models.ComputedExerciseSubstitute) error
	DeleteComputedSubstitutes(exerciseID uint) error
	ReplaceMuscles(exerciseID uint, muscles []models.ExerciseMuscle) error
	ReplaceEquipment(exerciseID uint, equipment []models.ExerciseEquipment) error
}
