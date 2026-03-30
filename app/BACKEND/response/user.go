package response

// TrainerInfo represents minimal trainer information in user response
type TrainerInfo struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
	Role string `json:"role"` // Should always be "trainer"
}

type UserResponse struct {
	ID           uint         `json:"id"`
	Email        string       `json:"email,omitempty"`
	Name         string       `json:"name"`
	Role         string       `json:"role"`
	Status       string       `json:"status"`
	ImageURL     *string      `json:"image_url"`         // MinIO key
	ImageFullURL *string      `json:"image_full_url"`    // Full URL
	Trainer      *TrainerInfo `json:"trainer,omitempty"` // null if no trainer assigned
	// Profile fields
	DateOfBirth  *string `json:"date_of_birth,omitempty"`  // "YYYY-MM-DD"
	Gender       *string `json:"gender,omitempty"`
	HeightCm     *int    `json:"height_cm,omitempty"`
	FitnessLevel *string `json:"fitness_level,omitempty"`
	FitnessGoal  *string `json:"fitness_goal,omitempty"`
	Phone        *string `json:"phone,omitempty"`
	Bio          *string `json:"bio,omitempty"`
}

// TraineeResponse represents a user assigned to a trainer
type TraineeResponse struct {
	ID           uint    `json:"id"`
	Name         string  `json:"name"`
	Email        string  `json:"email"`
	Role         string  `json:"role"`
	Status       string  `json:"status"` // ACTIVE, SUSPENDED
	ImageURL     *string `json:"image_url,omitempty"`
	ImageFullURL *string `json:"image_full_url,omitempty"`
	AssignedAt   string  `json:"assigned_at"` // When trainer was assigned
}

// TraineeListResponse wraps trainee list with pagination
type TraineeListResponse struct {
	Trainees []TraineeResponse `json:"trainees"`
	Total    int64             `json:"total"`
	Page     int               `json:"page"`
	PageSize int               `json:"page_size"`
}

// WeightLogEntry represents a single weight log entry
type WeightLogEntry struct {
	ID         uint    `json:"id"`
	WeightKg   float64 `json:"weight_kg"`
	RecordedAt string  `json:"recorded_at"` // "YYYY-MM-DD"
	Note       *string `json:"note,omitempty"`
	CreatedAt  string  `json:"created_at"`
}

// WeightHistoryResponse wraps the list of weight entries
type WeightHistoryResponse struct {
	Entries []WeightLogEntry `json:"entries"`
	Total   int64            `json:"total"`
}

// UserListResponse wraps user list with pagination (admin use)
type UserListResponse struct {
	Users    []UserResponse `json:"users"`
	Total    int64          `json:"total"`
	Page     int            `json:"page"`
	PageSize int            `json:"page_size"`
}

// TrendFilterOption is a single muscle or exercise the user has trained, used in trend selection.
type TrendFilterOption struct {
	Name        string  `json:"name"`
	Frequency   int     `json:"frequency"`
	LastTrained *string `json:"last_trained,omitempty"` // "YYYY-MM-DD"
}

// TrendOptionsResponse is the response for GET /users/me/progress/trends?type=muscle|exercise.
type TrendOptionsResponse struct {
	Type  string              `json:"type"` // "muscle" or "exercise"
	Items []TrendFilterOption `json:"items"`
}

// UserProgressResponse provides detailed progress analytics for the authenticated user
type UserProgressResponse struct {
	UserID         uint                 `json:"user_id"`
	UserName       string               `json:"user_name"`
	CurrentProgram *ProgramSummary      `json:"current_program,omitempty"`
	WorkoutStats   WorkoutStatistics    `json:"workout_stats"`
	MuscleProgress []MuscleProgressItem `json:"muscle_progress"`
	ExercisePRs    []ExercisePRItem     `json:"exercise_prs"`
	RecentWorkouts []RecentWorkoutItem  `json:"recent_workouts"`
}
