package response

import "time"

// MuscleGroupBrief is a compact group reference embedded in MuscleResponse
type MuscleGroupBrief struct {
	ID            uint   `json:"id"`
	GroupName     string `json:"group_name"`
	SplitCategory string `json:"split_category"`
}

// MuscleResponse represents the response for a muscle
type MuscleResponse struct {
	ID             uint               `json:"id"`
	MuscleName     string             `json:"muscle_name"`
	ScientificName string             `json:"scientific_name"`
	BodyRegion     string             `json:"body_region"`
	Function       string             `json:"function"`
	Groups         []MuscleGroupBrief `json:"groups"`
	CreatedAt      time.Time          `json:"created_at"`
	UpdatedAt      time.Time          `json:"updated_at"`
}

// MuscleExerciseResponse represents an exercise that targets a muscle, including involvement context
type MuscleExerciseResponse struct {
	ID                   uint    `json:"id"`
	ExerciseName         string  `json:"exercise_name"`
	MovementType         string  `json:"movement_type"`
	MovementPattern      string  `json:"movement_pattern"`
	DifficultyLevel      string  `json:"difficulty_level"`
	IsCompound           bool    `json:"is_compound"`
	ImageURL             *string `json:"image_url"`
	ImageFullURL         *string `json:"image_full_url"`
	InvolvementType      string  `json:"involvement_type"`      // primary, secondary, stabilizer
	ActivationPercentage int     `json:"activation_percentage"` // 0-100
}

// MuscleGroupResponse represents the response for a muscle group
type MuscleGroupResponse struct {
	ID            uint      `json:"id"`
	GroupName     string    `json:"group_name"`
	SplitCategory string    `json:"split_category"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}
