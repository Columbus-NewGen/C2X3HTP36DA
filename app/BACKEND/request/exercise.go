package request

// ExerciseMuscleInput represents a muscle involvement for exercise creation
type ExerciseMuscleInput struct {
	MuscleID             uint   `json:"muscle_id" binding:"required"`
	InvolvementType      string `json:"involvement_type" binding:"required,oneof=primary secondary stabilizer"`
	ActivationPercentage int    `json:"activation_percentage" binding:"omitempty,min=0,max=100"`
}

// ExerciseEquipmentInput represents an equipment association for exercise creation
type ExerciseEquipmentInput struct {
	EquipmentID uint `json:"equipment_id" binding:"required"`
	IsRequired  bool `json:"is_required"`
}

// CreateExerciseRequest represents the request body for creating an exercise
type CreateExerciseRequest struct {
	ExerciseName    string  `json:"exercise_name" form:"exercise_name" binding:"required"`
	MovementType    string  `json:"movement_type" form:"movement_type"`
	MovementPattern string  `json:"movement_pattern" form:"movement_pattern"`
	Description     string  `json:"description" form:"description"`
	DifficultyLevel string  `json:"difficulty_level" form:"difficulty_level" binding:"omitempty,oneof=beginner intermediate advanced"`
	IsCompound      bool    `json:"is_compound" form:"is_compound"`
	ImageURL        *string `json:"image_url" form:"image_url"`  // Optional MinIO key (for JSON approach)
	VideoURL        *string `json:"video_url" form:"video_url"`  // Optional external video URL (YouTube, Vimeo)
	Muscles         []ExerciseMuscleInput    `json:"muscles"`    // Optional muscle involvements
	Equipment       []ExerciseEquipmentInput `json:"equipment"`  // Optional equipment associations
}

// UpdateExerciseRequest represents the request body for updating an exercise
type UpdateExerciseRequest struct {
	ExerciseName    *string `json:"exercise_name" form:"exercise_name"`
	MovementType    *string `json:"movement_type" form:"movement_type"`
	MovementPattern *string `json:"movement_pattern" form:"movement_pattern"`
	Description     *string `json:"description" form:"description"`
	DifficultyLevel *string `json:"difficulty_level" form:"difficulty_level" binding:"omitempty,oneof=beginner intermediate advanced"`
	IsCompound      *bool   `json:"is_compound" form:"is_compound"`
	ImageURL        *string `json:"image_url" form:"image_url"`  // Optional MinIO key (for JSON approach)
	VideoURL        *string `json:"video_url" form:"video_url"`  // Optional external video URL
	// If provided (even as empty array), fully replaces existing associations.
	// Omit the field entirely to leave existing associations unchanged.
	Muscles   *[]ExerciseMuscleInput   `json:"muscles"`
	Equipment *[]ExerciseEquipmentInput `json:"equipment"`
}

// GetSubstitutesRequest represents query parameters for finding exercise substitutes
type GetSubstitutesRequest struct {
	MinSimilarity int    `form:"min_similarity" binding:"omitempty,min=0,max=100"` // 0-100, default 70
	ExcludeIDs    string `form:"exclude_ids"`                                      // Comma-separated IDs: "1,2,3"
	Limit         int    `form:"limit" binding:"omitempty,min=1,max=50"`           // Max results, default 10
}
