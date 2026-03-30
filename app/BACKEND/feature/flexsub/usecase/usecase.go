package usecase

import (
	"fmt"
	"sort"

	"github.com/gymmate/backend/constant"
	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/models"
	"github.com/gymmate/backend/request"
	"github.com/gymmate/backend/response"
	"github.com/pkg/errors"
)

type flexSubUsecase struct {
	flexSubRepo domain.FlexSubRepository
}

func NewFlexSubUsecase(flexSubRepo domain.FlexSubRepository) domain.FlexSubUsecase {
	return &flexSubUsecase{
		flexSubRepo: flexSubRepo,
	}
}

// GetSubstitutions implements the main flex substitution algorithm
func (u *flexSubUsecase) GetSubstitutions(req *request.FlexSubRequest) (*response.FlexSubResponse, error) {
	// 1. Get exercise details
	exercise, err := u.flexSubRepo.GetExerciseWithDetails(req.ExerciseID)
	if err != nil {
		return nil, errors.Wrap(err, "[FlexSubUsecase.GetSubstitutions]: Error fetching exercise")
	}
	if exercise == nil {
		return nil, errors.New("exercise not found")
	}

	// 2. Get active floorplan
	var floorplanID uint
	if req.FloorplanID != nil {
		floorplanID = *req.FloorplanID
	} else {
		floorplan, err := u.flexSubRepo.GetActiveFloorplan()
		if err != nil {
			return nil, errors.Wrap(err, "[FlexSubUsecase.GetSubstitutions]: Error fetching active floorplan")
		}
		if floorplan == nil {
			return nil, errors.New("no active floorplan found")
		}
		floorplanID = floorplan.ID
	}

	// 3. Get all active equipment instances on the floorplan
	activeInstances, err := u.flexSubRepo.GetActiveEquipmentInstancesByFloorplan(floorplanID)
	if err != nil {
		return nil, errors.Wrap(err, "[FlexSubUsecase.GetSubstitutions]: Error fetching active equipment instances")
	}

	// Build map of available equipment IDs on floorplan
	availableEquipmentMap := make(map[uint][]models.EquipmentInstance)
	for _, instance := range activeInstances {
		if instance.Equipment.Status == constant.StatusActive {
			availableEquipmentMap[instance.EquipmentID] = append(
				availableEquipmentMap[instance.EquipmentID],
				instance,
			)
		}
	}

	var recommendations []response.SubstitutionRecommendation

	// 4. Priority 1: Same exercise, different equipment (score 80-100)
	currentEquipmentID := req.EquipmentID
	for _, ee := range exercise.ExerciseEquipments {
		// Skip the current equipment being used
		if currentEquipmentID != nil && ee.EquipmentID == *currentEquipmentID {
			continue
		}

		// Check if this equipment is available on floorplan
		if machines, ok := availableEquipmentMap[ee.EquipmentID]; ok && len(machines) > 0 {
			rec := u.buildRecommendation(
				exercise,
				&ee.Equipment,
				machines,
				constant.SubstitutionTypeSameExercise,
				90, // Base score for same exercise, different equipment
				"Same exercise with alternative equipment",
			)
			recommendations = append(recommendations, rec)
		}
	}

	// 5. Priority 2: Different exercise, pre-computed muscle similarity (score 60-100, cosine similarity)
	computedSubs, err := u.flexSubRepo.GetComputedSubstitutes(exercise.ID, 60, 20)
	if err != nil {
		return nil, errors.Wrap(err, "[FlexSubUsecase.GetSubstitutions]: Error fetching computed substitutes")
	}

	for _, cs := range computedSubs {
		subEx := &cs.SubstituteExercise
		for _, ee := range subEx.ExerciseEquipments {
			if machines, ok := availableEquipmentMap[ee.EquipmentID]; ok && len(machines) > 0 {
				rec := u.buildRecommendation(
					subEx,
					&ee.Equipment,
					machines,
					constant.SubstitutionTypeSameMuscle,
					cs.SimilarityScore,
					cs.Reason,
				)
				recommendations = append(recommendations, rec)
			}
		}
	}

	// 7. Sort recommendations by type (SAME_EXERCISE first) then by score (descending)
	sort.Slice(recommendations, func(i, j int) bool {
		// First sort by type (SAME_EXERCISE first)
		if recommendations[i].SubstitutionType != recommendations[j].SubstitutionType {
			return recommendations[i].SubstitutionType == constant.SubstitutionTypeSameExercise
		}
		// Then by score
		return recommendations[i].Score > recommendations[j].Score
	})

	// 8. Remove duplicates (same exercise + equipment combo)
	recommendations = u.deduplicateRecommendations(recommendations)

	// 9. Build response
	resp := &response.FlexSubResponse{
		OriginalExercise:    u.mapExerciseToDetailResponse(exercise),
		Recommendations:     recommendations,
		SkipToNextSuggested: len(recommendations) == 0,
	}

	if len(recommendations) == 0 {
		resp.Message = "No alternative equipment available. Consider skipping to the next exercise in your plan."
	}

	return resp, nil
}

// buildRecommendation creates a SubstitutionRecommendation
func (u *flexSubUsecase) buildRecommendation(
	exercise *models.Exercise,
	equipment *models.Equipment,
	instances []models.EquipmentInstance,
	subType string,
	score int,
	reason string,
) response.SubstitutionRecommendation {
	instanceLocations := make([]response.EquipmentInstanceLocationResponse, len(instances))
	for i, inst := range instances {
		instanceLocations[i] = response.EquipmentInstanceLocationResponse{
			ID:        inst.ID,
			PositionX: inst.PositionX,
			PositionY: inst.PositionY,
			Rotation:  inst.Rotation,
			Width:     inst.Width,
			Height:    inst.Height,
			Label:     inst.Label,
			Status:    inst.Status,
		}
	}

	return response.SubstitutionRecommendation{
		Exercise:           u.mapExerciseToDetailResponse(exercise),
		Equipment:          u.mapEquipmentToDetailResponse(equipment),
		EquipmentInstances: instanceLocations,
		SubstitutionType:   subType,
		Score:              score,
		Reason:             reason,
	}
}

// deduplicateRecommendations removes duplicate exercise+equipment combinations
func (u *flexSubUsecase) deduplicateRecommendations(recs []response.SubstitutionRecommendation) []response.SubstitutionRecommendation {
	seen := make(map[string]bool)
	result := make([]response.SubstitutionRecommendation, 0, len(recs))

	for _, rec := range recs {
		key := fmt.Sprintf("%d-%d", rec.Exercise.ID, rec.Equipment.ID)
		if !seen[key] {
			seen[key] = true
			result = append(result, rec)
		}
	}

	return result
}

// mapExerciseToDetailResponse maps exercise model to response
func (u *flexSubUsecase) mapExerciseToDetailResponse(exercise *models.Exercise) response.ExerciseDetailResponse {
	resp := response.ExerciseDetailResponse{
		ID:              exercise.ID,
		ExerciseName:    exercise.ExerciseName,
		MovementType:    exercise.MovementType,
		MovementPattern: exercise.MovementPattern,
		IsCompound:      exercise.IsCompound,
		DifficultyLevel: exercise.DifficultyLevel,
	}

	// Map primary muscles
	for _, em := range exercise.ExerciseMuscles {
		if em.InvolvementType == "primary" {
			resp.PrimaryMuscles = append(resp.PrimaryMuscles, response.MuscleDetailResponse{
				ID:         em.Muscle.ID,
				MuscleName: em.Muscle.MuscleName,
				BodyRegion: em.Muscle.BodyRegion,
			})
		}
	}

	// Map equipment
	for _, ee := range exercise.ExerciseEquipments {
		resp.Equipment = append(resp.Equipment, response.EquipmentDetailResponse{
			ID:            ee.Equipment.ID,
			EquipmentName: ee.Equipment.EquipmentName,
			EquipmentType: ee.Equipment.EquipmentType,
			Status:        ee.Equipment.Status,
		})
	}

	return resp
}

// mapEquipmentToDetailResponse maps equipment model to response
func (u *flexSubUsecase) mapEquipmentToDetailResponse(equipment *models.Equipment) response.EquipmentDetailResponse {
	return response.EquipmentDetailResponse{
		ID:            equipment.ID,
		EquipmentName: equipment.EquipmentName,
		EquipmentType: equipment.EquipmentType,
		Status:        equipment.Status,
	}
}

// UpdateEquipmentStatus updates equipment status
func (u *flexSubUsecase) UpdateEquipmentStatus(id uint, status string) (*response.EquipmentDetailResponse, error) {
	equipment, err := u.flexSubRepo.GetEquipmentByID(id)
	if err != nil {
		return nil, errors.Wrap(err, "[FlexSubUsecase.UpdateEquipmentStatus]: Error fetching equipment")
	}
	if equipment == nil {
		return nil, errors.New("equipment not found")
	}

	if err := u.flexSubRepo.UpdateEquipmentStatus(id, status); err != nil {
		return nil, errors.Wrap(err, "[FlexSubUsecase.UpdateEquipmentStatus]: Error updating status")
	}

	equipment.Status = status
	resp := u.mapEquipmentToDetailResponse(equipment)
	return &resp, nil
}

// UpdateEquipmentInstanceStatus updates equipment instance status
func (u *flexSubUsecase) UpdateEquipmentInstanceStatus(id uint, status string) (*response.EquipmentInstanceResponse, error) {
	instance, err := u.flexSubRepo.GetEquipmentInstanceByID(id)
	if err != nil {
		return nil, errors.Wrap(err, "[FlexSubUsecase.UpdateEquipmentInstanceStatus]: Error fetching equipment instance")
	}
	if instance == nil {
		return nil, errors.New("equipment instance not found")
	}

	if err := u.flexSubRepo.UpdateEquipmentInstanceStatus(id, status); err != nil {
		return nil, errors.Wrap(err, "[FlexSubUsecase.UpdateEquipmentInstanceStatus]: Error updating status")
	}

	instance.Status = status
	return &response.EquipmentInstanceResponse{
		ID:          instance.ID,
		FloorplanID: instance.FloorplanID,
		EquipmentID: instance.EquipmentID,
		Equipment: response.EquipmentResponse{
			ID:            instance.Equipment.ID,
			EquipmentName: instance.Equipment.EquipmentName,
			EquipmentType: instance.Equipment.EquipmentType,
			Status:        instance.Equipment.Status,
		},
		PositionX: instance.PositionX,
		PositionY: instance.PositionY,
		Rotation:  instance.Rotation,
		Width:     instance.Width,
		Height:    instance.Height,
		Label:     instance.Label,
		Status:    instance.Status,
		CreatedAt: instance.CreatedAt,
		UpdatedAt: instance.UpdatedAt,
	}, nil
}
