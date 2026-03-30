package usecase

import (
	"fmt"
	"strings"

	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/models"
	"github.com/gymmate/backend/request"
	"github.com/gymmate/backend/response"
	"github.com/gymmate/backend/utils"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

// MinSimilarityThreshold is the minimum similarity score to store in computed substitutes
const MinSimilarityThreshold = 0

type exerciseUsecase struct {
	exerciseRepo domain.ExerciseRepository
}

// NewExerciseUsecase creates a new exercise usecase instance
func NewExerciseUsecase(exerciseRepo domain.ExerciseRepository) domain.ExerciseUsecase {
	return &exerciseUsecase{
		exerciseRepo: exerciseRepo,
	}
}

// CreateExercise creates a new exercise
func (u *exerciseUsecase) CreateExercise(req *request.CreateExerciseRequest) (*response.ExerciseResponse, error) {
	exercise := &models.Exercise{
		ExerciseName:    req.ExerciseName,
		MovementType:    req.MovementType,
		MovementPattern: req.MovementPattern,
		Description:     req.Description,
		DifficultyLevel: req.DifficultyLevel,
		IsCompound:      req.IsCompound,
		ImageURL:        req.ImageURL,
		VideoURL:        req.VideoURL,
	}

	// Map muscle involvements if provided (GORM handles nested creation)
	if len(req.Muscles) > 0 {
		for _, m := range req.Muscles {
			exercise.ExerciseMuscles = append(exercise.ExerciseMuscles, models.ExerciseMuscle{
				MuscleID:             m.MuscleID,
				InvolvementType:      m.InvolvementType,
				ActivationPercentage: m.ActivationPercentage,
			})
		}
	}

	// Map equipment associations if provided (GORM handles nested creation)
	if len(req.Equipment) > 0 {
		for _, e := range req.Equipment {
			exercise.ExerciseEquipments = append(exercise.ExerciseEquipments, models.ExerciseEquipment{
				EquipmentID: e.EquipmentID,
				IsRequired:  e.IsRequired,
			})
		}
	}

	if err := u.exerciseRepo.Create(exercise); err != nil {
		return nil, errors.Wrap(err, "[ExerciseUsecase.CreateExercise]: Failed to create exercise")
	}

	// Compute and store substitutes (best-effort, don't fail create)
	if err := u.computeAndStoreSubstitutes(exercise.ID); err != nil {
		log.Warn(errors.Wrap(err, "[ExerciseUsecase.CreateExercise]: Failed to compute substitutes"))
	}

	return u.modelToResponse(exercise), nil
}

// GetExercise retrieves an exercise by ID
func (u *exerciseUsecase) GetExercise(id uint) (*response.ExerciseResponse, error) {
	exercise, err := u.exerciseRepo.GetByID(id)
	if err != nil {
		return nil, errors.Wrap(err, "[ExerciseUsecase.GetExercise]: Failed to get exercise")
	}

	return u.modelToResponse(exercise), nil
}

// ListExercise retrieves all exercises
func (u *exerciseUsecase) ListExercise() ([]*response.ExerciseResponse, error) {
	exercises, err := u.exerciseRepo.List()
	if err != nil {
		return nil, errors.Wrap(err, "[ExerciseUsecase.ListExercise]: Failed to list exercises")
	}

	var result []*response.ExerciseResponse
	for _, ex := range exercises {
		result = append(result, u.modelToResponse(ex))
	}

	return result, nil
}

// UpdateExercise updates an exercise
func (u *exerciseUsecase) UpdateExercise(id uint, req *request.UpdateExerciseRequest) (*response.ExerciseResponse, error) {
	// Get existing exercise
	exercise, err := u.exerciseRepo.GetByID(id)
	if err != nil {
		return nil, errors.Wrap(err, "[ExerciseUsecase.UpdateExercise]: Failed to get exercise")
	}

	// Update fields if provided
	if req.ExerciseName != nil {
		exercise.ExerciseName = *req.ExerciseName
	}
	if req.MovementType != nil {
		exercise.MovementType = *req.MovementType
	}
	if req.MovementPattern != nil {
		exercise.MovementPattern = *req.MovementPattern
	}
	if req.Description != nil {
		exercise.Description = *req.Description
	}
	if req.DifficultyLevel != nil {
		exercise.DifficultyLevel = *req.DifficultyLevel
	}
	if req.IsCompound != nil {
		exercise.IsCompound = *req.IsCompound
	}
	if req.ImageURL != nil {
		exercise.ImageURL = req.ImageURL
	}
	if req.VideoURL != nil {
		exercise.VideoURL = req.VideoURL
	}

	// Save updated exercise
	if err := u.exerciseRepo.Update(exercise); err != nil {
		return nil, errors.Wrap(err, "[ExerciseUsecase.UpdateExercise]: Failed to update exercise")
	}

	// Full replace muscles if provided
	musclesChanged := false
	if req.Muscles != nil {
		newMuscles := make([]models.ExerciseMuscle, len(*req.Muscles))
		for i, m := range *req.Muscles {
			newMuscles[i] = models.ExerciseMuscle{
				ExerciseID:           id,
				MuscleID:             m.MuscleID,
				InvolvementType:      m.InvolvementType,
				ActivationPercentage: m.ActivationPercentage,
			}
		}
		if err := u.exerciseRepo.ReplaceMuscles(id, newMuscles); err != nil {
			return nil, errors.Wrap(err, "[ExerciseUsecase.UpdateExercise]: Failed to replace muscles")
		}
		musclesChanged = true
	}

	// Full replace equipment if provided
	if req.Equipment != nil {
		newEquipment := make([]models.ExerciseEquipment, len(*req.Equipment))
		for i, e := range *req.Equipment {
			newEquipment[i] = models.ExerciseEquipment{
				ExerciseID:  id,
				EquipmentID: e.EquipmentID,
				IsRequired:  e.IsRequired,
			}
		}
		if err := u.exerciseRepo.ReplaceEquipment(id, newEquipment); err != nil {
			return nil, errors.Wrap(err, "[ExerciseUsecase.UpdateExercise]: Failed to replace equipment")
		}
	}

	// Recompute substitutes when muscles changed (best-effort)
	if musclesChanged {
		if err := u.exerciseRepo.DeleteComputedSubstitutes(id); err != nil {
			log.Warn(errors.Wrap(err, "[ExerciseUsecase.UpdateExercise]: Failed to delete old computed substitutes"))
		}
		if err := u.computeAndStoreSubstitutes(id); err != nil {
			log.Warn(errors.Wrap(err, "[ExerciseUsecase.UpdateExercise]: Failed to recompute substitutes"))
		}
	}

	return u.modelToResponse(exercise), nil
}

// DeleteExercise deletes an exercise
func (u *exerciseUsecase) DeleteExercise(id uint) error {
	// Check if exercise exists
	_, err := u.exerciseRepo.GetByID(id)
	if err != nil {
		return errors.Wrap(err, "[ExerciseUsecase.DeleteExercise]: Failed to get exercise")
	}

	// Clean up computed substitutes (GORM soft delete doesn't trigger CASCADE)
	if err := u.exerciseRepo.DeleteComputedSubstitutes(id); err != nil {
		log.Warn(errors.Wrap(err, "[ExerciseUsecase.DeleteExercise]: Failed to delete computed substitutes"))
	}

	// Delete exercise
	if err := u.exerciseRepo.Delete(id); err != nil {
		return errors.Wrap(err, "[ExerciseUsecase.DeleteExercise]: Failed to delete exercise")
	}

	return nil
}

// GetExerciseMuscles retrieves all muscles targeted by an exercise with involvement details
func (u *exerciseUsecase) GetExerciseMuscles(id uint) ([]*response.ExerciseMuscleResponse, error) {
	exercise, err := u.exerciseRepo.GetWithMuscles(id)
	if err != nil {
		return nil, errors.Wrap(err, "[ExerciseUsecase.GetExerciseMuscles]: Failed to get exercise")
	}

	var result []*response.ExerciseMuscleResponse
	for _, em := range exercise.ExerciseMuscles {
		result = append(result, &response.ExerciseMuscleResponse{
			ID:                   em.Muscle.ID,
			MuscleName:           em.Muscle.MuscleName,
			ScientificName:       em.Muscle.ScientificName,
			BodyRegion:           em.Muscle.BodyRegion,
			InvolvementType:      em.InvolvementType,
			ActivationPercentage: em.ActivationPercentage,
		})
	}
	return result, nil
}

// GetExerciseEquipment retrieves all equipment used by an exercise with requirement details
func (u *exerciseUsecase) GetExerciseEquipment(id uint) ([]*response.ExerciseEquipmentResponse, error) {
	exercise, err := u.exerciseRepo.GetWithEquipment(id)
	if err != nil {
		return nil, errors.Wrap(err, "[ExerciseUsecase.GetExerciseEquipment]: Failed to get exercise")
	}

	var result []*response.ExerciseEquipmentResponse
	for _, ee := range exercise.ExerciseEquipments {
		instances := make([]response.EquipmentInstanceBriefResponse, len(ee.Equipment.EquipmentInstances))
		for j, inst := range ee.Equipment.EquipmentInstances {
			instances[j] = response.EquipmentInstanceBriefResponse{
				ID:          inst.ID,
				FloorplanID: inst.FloorplanID,
				Label:       inst.Label,
				Status:      inst.Status,
				PositionX:   inst.PositionX,
				PositionY:   inst.PositionY,
				Rotation:    inst.Rotation,
				Width:       inst.Width,
				Height:      inst.Height,
			}
		}
		result = append(result, &response.ExerciseEquipmentResponse{
			ID:                 ee.Equipment.ID,
			EquipmentName:      ee.Equipment.EquipmentName,
			EquipmentType:      ee.Equipment.EquipmentType,
			Description:        ee.Equipment.Description,
			ImageURL:           ee.Equipment.ImageURL,
			ImageFullURL:       response.BuildImageURL(ee.Equipment.ImageURL),
			IsRequired:         ee.IsRequired,
			EquipmentInstances: instances,
		})
	}
	return result, nil
}

// FindSubstitutes reads pre-computed substitute exercises from the database
func (u *exerciseUsecase) FindSubstitutes(exerciseID uint, minSimilarity int, excludeIDs []uint, limit int) ([]*response.ExerciseSubstituteResponse, error) {
	// Verify exercise exists
	_, err := u.exerciseRepo.GetByID(exerciseID)
	if err != nil {
		return nil, errors.Wrap(err, "[ExerciseUsecase.FindSubstitutes]: Failed to get exercise")
	}

	// Read pre-computed substitutes from table
	computed, err := u.exerciseRepo.GetComputedSubstitutes(exerciseID, minSimilarity, excludeIDs, limit)
	if err != nil {
		return nil, errors.Wrap(err, "[ExerciseUsecase.FindSubstitutes]: Failed to get computed substitutes")
	}

	// Map to response DTOs
	var substitutes []*response.ExerciseSubstituteResponse
	for _, c := range computed {
		substitutes = append(substitutes, &response.ExerciseSubstituteResponse{
			Exercise:        *u.modelToResponse(&c.SubstituteExercise),
			SimilarityScore: c.SimilarityScore,
			Reason:          c.Reason,
		})
	}

	return substitutes, nil
}

// computeAndStoreSubstitutes computes similarity scores for a new exercise against all existing exercises
// and stores the results bidirectionally in the computed_exercise_substitutes table
func (u *exerciseUsecase) computeAndStoreSubstitutes(exerciseID uint) error {
	// Get the new exercise with muscles
	newExercise, err := u.exerciseRepo.GetWithMuscles(exerciseID)
	if err != nil {
		return errors.Wrap(err, "[ExerciseUsecase.computeAndStoreSubstitutes]: Failed to get new exercise")
	}

	// Build vector for the new exercise
	newVector := utils.BuildExerciseVector(newExercise.ExerciseMuscles)

	// Get all other exercises with muscles
	candidates, err := u.exerciseRepo.ListWithMuscles([]uint{exerciseID})
	if err != nil {
		return errors.Wrap(err, "[ExerciseUsecase.computeAndStoreSubstitutes]: Failed to list candidates")
	}

	// Compute similarities and collect pairs above threshold
	var pairs []*models.ComputedExerciseSubstitute
	for _, candidate := range candidates {
		candidateVector := utils.BuildExerciseVector(candidate.ExerciseMuscles)
		cosineSim := utils.CosineSimilarity(newVector, candidateVector)
		score := utils.SimilarityScore(cosineSim)

		if score >= MinSimilarityThreshold {
			reason := u.generateReason(newExercise, candidate, score)

			// Bidirectional: new→candidate
			pairs = append(pairs, &models.ComputedExerciseSubstitute{
				OriginalExerciseID:   exerciseID,
				SubstituteExerciseID: candidate.ID,
				SimilarityScore:      score,
				Reason:               reason,
			})

			// Bidirectional: candidate→new
			reverseReason := u.generateReason(candidate, newExercise, score)
			pairs = append(pairs, &models.ComputedExerciseSubstitute{
				OriginalExerciseID:   candidate.ID,
				SubstituteExerciseID: exerciseID,
				SimilarityScore:      score,
				Reason:               reverseReason,
			})
		}
	}

	// Store all pairs
	if err := u.exerciseRepo.StoreComputedSubstitutes(pairs); err != nil {
		return errors.Wrap(err, "[ExerciseUsecase.computeAndStoreSubstitutes]: Failed to store substitutes")
	}

	return nil
}

// generateReason creates a human-readable explanation for the substitution
func (u *exerciseUsecase) generateReason(original, substitute *models.Exercise, score int) string {
	originalMuscles := u.getPrimaryMuscleNames(original.ExerciseMuscles)
	substituteMuscles := u.getPrimaryMuscleNames(substitute.ExerciseMuscles)
	commonMuscles := u.intersectStrings(originalMuscles, substituteMuscles)

	switch {
	case score >= 90:
		if len(commonMuscles) > 0 {
			return fmt.Sprintf("Nearly identical movement targeting %s", strings.Join(commonMuscles, ", "))
		}
		return "Nearly identical muscle activation pattern"
	case score >= 75:
		if len(commonMuscles) > 0 {
			return fmt.Sprintf("Similar exercise targeting %s", strings.Join(commonMuscles, ", "))
		}
		return "Similar muscle activation pattern"
	default:
		if len(substituteMuscles) > 0 {
			return fmt.Sprintf("Alternative targeting %s", strings.Join(substituteMuscles, ", "))
		}
		return "Alternative exercise option"
	}
}

// getPrimaryMuscleNames extracts primary muscle names from ExerciseMuscles
func (u *exerciseUsecase) getPrimaryMuscleNames(exerciseMuscles []models.ExerciseMuscle) []string {
	var muscles []string
	for _, em := range exerciseMuscles {
		if em.InvolvementType == "primary" && em.Muscle.MuscleName != "" {
			muscles = append(muscles, em.Muscle.MuscleName)
		}
	}
	return muscles
}

// intersectStrings finds common strings between two slices
func (u *exerciseUsecase) intersectStrings(a, b []string) []string {
	set := make(map[string]bool)
	for _, item := range a {
		set[item] = true
	}

	var result []string
	for _, item := range b {
		if set[item] {
			result = append(result, item)
		}
	}
	return result
}

// modelToResponse converts a model to response DTO
func (u *exerciseUsecase) modelToResponse(exercise *models.Exercise) *response.ExerciseResponse {
	return &response.ExerciseResponse{
		ID:              exercise.ID,
		ExerciseName:    exercise.ExerciseName,
		MovementType:    exercise.MovementType,
		MovementPattern: exercise.MovementPattern,
		Description:     exercise.Description,
		DifficultyLevel: exercise.DifficultyLevel,
		IsCompound:      exercise.IsCompound,
		ImageURL:        exercise.ImageURL,
		ImageFullURL:    response.BuildImageURL(exercise.ImageURL),
		VideoURL:        exercise.VideoURL,
		CreatedAt:       exercise.CreatedAt,
		UpdatedAt:       exercise.UpdatedAt,
	}
}
