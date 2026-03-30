package response

import "time"

// ProgramResponse represents a program (template or user-specific)
type ProgramResponse struct {
	ID              uint                `json:"id"`
	ProgramName     string              `json:"program_name"`
	Goal            string              `json:"goal"`
	DurationWeeks   int                 `json:"duration_weeks"`
	IsTemplate      bool                `json:"is_template"`
	DifficultyLevel string              `json:"difficulty_level,omitempty"`
	DaysPerWeek     int                 `json:"days_per_week,omitempty"`
	Description     string              `json:"description,omitempty"`
	IsActive        bool                `json:"is_active"`
	CreatedBy       *UserSimpleResponse `json:"created_by,omitempty"`
	SessionCount    int                 `json:"session_count"`
	CreatedAt       time.Time           `json:"created_at"`
	UpdatedAt       time.Time           `json:"updated_at"`
}

// ProgramDetailResponse includes sessions and exercises
type ProgramDetailResponse struct {
	ID              uint                    `json:"id"`
	ProgramName     string                  `json:"program_name"`
	Goal            string                  `json:"goal"`
	DurationWeeks   int                     `json:"duration_weeks"`
	IsTemplate      bool                    `json:"is_template"`
	DifficultyLevel string                  `json:"difficulty_level,omitempty"`
	DaysPerWeek     int                     `json:"days_per_week,omitempty"`
	Description     string                  `json:"description,omitempty"`
	IsActive        bool                    `json:"is_active"`
	CreatedBy       *UserSimpleResponse     `json:"created_by,omitempty"`
	Sessions        []PlanSessionResponse   `json:"sessions"`
	CreatedAt       time.Time               `json:"created_at"`
	UpdatedAt       time.Time               `json:"updated_at"`
}

// PlanSessionResponse represents a workout session
type PlanSessionResponse struct {
	ID           uint                    `json:"id"`
	SessionName  string                  `json:"session_name"`
	WorkoutSplit string                  `json:"workout_split"`
	DayNumber    int                     `json:"day_number"`
	DayOfWeek    *int                    `json:"day_of_week,omitempty"`
	Notes        string                  `json:"notes,omitempty"`
	Exercises    []SessionExerciseDetail `json:"exercises,omitempty"`
}

// SessionExerciseDetail represents an exercise in a session
type SessionExerciseDetail struct {
	ID            uint                        `json:"id"`
	ExerciseID    uint                        `json:"exercise_id"`
	ExerciseName  string                      `json:"exercise_name"`
	ImageURL      *string                     `json:"image_url,omitempty"`
	ImageFullURL  *string                     `json:"image_full_url,omitempty"`
	Sets          int                         `json:"sets"`
	Reps          int                         `json:"reps"`
	Weight        *float64                    `json:"weight,omitempty"`
	RestSeconds   int                         `json:"rest_seconds"`
	OrderSequence int                         `json:"order_sequence"`
	Equipment     []ExerciseEquipmentResponse `json:"equipment,omitempty"`
}

// UserProgramResponse represents a program assigned to a user
type UserProgramResponse struct {
	ID          uint                   `json:"id"`
	UserID      uint                   `json:"user_id"`
	ProgramName string                 `json:"program_name"`
	Status      string                 `json:"status"`
	CurrentWeek int                    `json:"current_week"`
	CurrentDay  int                    `json:"current_day"`
	AssignedAt  time.Time              `json:"assigned_at"`
	StartDate   *time.Time             `json:"start_date,omitempty"`
	StartedAt   *time.Time             `json:"started_at,omitempty"`
	CompletedAt *time.Time             `json:"completed_at,omitempty"`
	Notes       string                 `json:"notes,omitempty"`
	AssignedBy  *UserSimpleResponse    `json:"assigned_by,omitempty"`
	Program     *ProgramDetailResponse `json:"program,omitempty"` // Template program info
	CreatedAt   time.Time              `json:"created_at"`
	UpdatedAt   time.Time              `json:"updated_at"`
}

// ScheduledWorkoutSimple is a minimal scheduled workout for progress display
type ScheduledWorkoutSimple struct {
	ID     uint   `json:"id"`
	Status string `json:"status"`
}

// UserProgramDetailResponse extends UserProgramResponse with scheduled workouts and rates
type UserProgramDetailResponse struct {
	UserProgramResponse
	CompletionRate     float64                  `json:"completion_rate"`
	ProgressionRate    float64                  `json:"progression_rate"`
	ScheduledWorkouts  []ScheduledWorkoutSimple `json:"scheduled_workouts"`
}

// UserSimpleResponse is a simplified user representation
type UserSimpleResponse struct {
	ID    uint   `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Role  string `json:"role"`
}
