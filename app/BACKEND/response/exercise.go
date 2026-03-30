package response

import "time"

// ExerciseResponse represents the response body for an exercise
type ExerciseResponse struct {
	ID              uint      `json:"id"`
	ExerciseName    string    `json:"exercise_name"`
	MovementType    string    `json:"movement_type"`
	MovementPattern string    `json:"movement_pattern"`
	Description     string    `json:"description"`
	DifficultyLevel string    `json:"difficulty_level"`
	IsCompound      bool      `json:"is_compound"`
	ImageURL        *string   `json:"image_url"`       // MinIO key
	ImageFullURL    *string   `json:"image_full_url"`  // Full URL (e.g., "/api/v1/media/exercise/uuid.jpg")
	VideoURL        *string   `json:"video_url"`       // External video URL
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// ExerciseMuscleResponse represents a muscle targeted by an exercise, including involvement context
type ExerciseMuscleResponse struct {
	ID                   uint   `json:"id"`
	MuscleName           string `json:"muscle_name"`
	ScientificName       string `json:"scientific_name"`
	BodyRegion           string `json:"body_region"`
	InvolvementType      string `json:"involvement_type"`      // primary, secondary, stabilizer
	ActivationPercentage int    `json:"activation_percentage"` // 0-100
}

// ExerciseSubstituteResponse represents a substitute exercise with similarity score
type ExerciseSubstituteResponse struct {
	Exercise        ExerciseResponse `json:"exercise"`
	SimilarityScore int              `json:"similarity_score"` // 0-100
	Reason          string           `json:"reason"`
}

// ExerciseEquipmentResponse represents equipment used by an exercise, including requirement context
type ExerciseEquipmentResponse struct {
	ID                 uint                              `json:"id"`
	EquipmentName      string                            `json:"equipment_name"`
	EquipmentType      string                            `json:"equipment_type"`
	Description        string                            `json:"description"`
	ImageURL           *string                           `json:"image_url"`
	ImageFullURL       *string                           `json:"image_full_url"`
	IsRequired         bool                              `json:"is_required"`
	EquipmentInstances []EquipmentInstanceBriefResponse  `json:"equipment_instances"`
}
