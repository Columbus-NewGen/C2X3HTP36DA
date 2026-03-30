package response

// FlexSubResponse is the main response for substitution recommendations
type FlexSubResponse struct {
	OriginalExercise    ExerciseDetailResponse       `json:"original_exercise"`
	Recommendations     []SubstitutionRecommendation `json:"recommendations"`
	SkipToNextSuggested bool                         `json:"skip_to_next_suggested"`
	Message             string                       `json:"message,omitempty"`
}

// SubstitutionRecommendation represents a single substitution option
type SubstitutionRecommendation struct {
	Exercise           ExerciseDetailResponse                `json:"exercise"`
	Equipment          EquipmentDetailResponse               `json:"equipment"`
	EquipmentInstances []EquipmentInstanceLocationResponse   `json:"equipment_instances"`
	SubstitutionType   string                                `json:"substitution_type"` // SAME_EXERCISE, SAME_MUSCLE
	Score              int                                   `json:"score"`             // 0-100 similarity score
	Reason             string                                `json:"reason,omitempty"`
}

// ExerciseDetailResponse contains exercise details for flex sub
type ExerciseDetailResponse struct {
	ID              uint                      `json:"id"`
	ExerciseName    string                    `json:"exercise_name"`
	MovementType    string                    `json:"movement_type"`
	MovementPattern string                    `json:"movement_pattern"`
	IsCompound      bool                      `json:"is_compound"`
	DifficultyLevel string                    `json:"difficulty_level"`
	PrimaryMuscles  []MuscleDetailResponse    `json:"primary_muscles,omitempty"`
	Equipment       []EquipmentDetailResponse `json:"equipment,omitempty"`
}

// EquipmentDetailResponse contains equipment details
type EquipmentDetailResponse struct {
	ID            uint   `json:"id"`
	EquipmentName string `json:"equipment_name"`
	EquipmentType string `json:"equipment_type"`
	Status        string `json:"status"`
}

// EquipmentInstanceLocationResponse represents an equipment instance's position on the floorplan
type EquipmentInstanceLocationResponse struct {
	ID        uint    `json:"id"`
	PositionX float64 `json:"position_x"`
	PositionY float64 `json:"position_y"`
	Rotation  float64 `json:"rotation"`
	Width     int     `json:"width"`
	Height    int     `json:"height"`
	Label     string  `json:"label"`
	Status    string  `json:"status"`
}

// MuscleDetailResponse contains muscle info
type MuscleDetailResponse struct {
	ID         uint   `json:"id"`
	MuscleName string `json:"muscle_name"`
	BodyRegion string `json:"body_region"`
}

