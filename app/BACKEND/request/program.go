package request

// CreateProgramRequest creates a new program (template or user-specific)
type CreateProgramRequest struct {
	ProgramName     string                      `json:"program_name" binding:"required"`
	Goal            string                      `json:"goal" binding:"required"`
	DurationWeeks   int                         `json:"duration_weeks" binding:"required,gte=1"`
	IsTemplate      bool                        `json:"is_template"`
	DifficultyLevel string                      `json:"difficulty_level" binding:"omitempty,oneof=beginner intermediate advanced"`
	DaysPerWeek     int                         `json:"days_per_week" binding:"required,gte=1,lte=7"`
	Description     string                      `json:"description"`
	Sessions        []CreateProgramSessionRequest `json:"sessions"` // Program sessions with exercises
}

// CreateProgramSessionRequest creates a session in a program
type CreateProgramSessionRequest struct {
	SessionName  string                        `json:"session_name" binding:"required"`
	WorkoutSplit string                        `json:"workout_split" binding:"required"`
	DayOfWeek    *int                          `json:"day_of_week" binding:"required,gte=1,lte=7"` // 1=Monday, 7=Sunday (required for templates)
	DayNumber    int                           `json:"day_number" binding:"required,gte=1"`
	Notes        string                        `json:"notes"`
	Exercises    []CreateSessionExerciseRequest `json:"exercises" binding:"required,dive"`
}

// CreateSessionExerciseRequest creates an exercise in a session
type CreateSessionExerciseRequest struct {
	ExerciseID    uint     `json:"exercise_id" binding:"required"`
	Sets          int      `json:"sets" binding:"required,gte=1"`
	Reps          int      `json:"reps" binding:"required,gte=1"`
	Weight        *float64 `json:"weight"`
	RestSeconds   int      `json:"rest_seconds" binding:"required,gte=0"`
	OrderSequence int      `json:"order_sequence" binding:"required,gte=1"`
}

// UpdateProgramRequest updates program details
type UpdateProgramRequest struct {
	ProgramName     string                        `json:"program_name"`
	Goal            string                        `json:"goal"`
	DurationWeeks   int                           `json:"duration_weeks" binding:"omitempty,gte=1"`
	DifficultyLevel string                        `json:"difficulty_level" binding:"omitempty,oneof=beginner intermediate advanced"`
	DaysPerWeek     int                           `json:"days_per_week" binding:"omitempty,gte=1,lte=7"`
	Description     string                        `json:"description"`
	IsActive        *bool                         `json:"is_active"`
	Sessions        []CreateProgramSessionRequest `json:"sessions"` // Optional: replaces all existing sessions
}

// AssignProgramRequest assigns a template to a user
type AssignProgramRequest struct {
	TemplateProgramID uint   `json:"template_program_id" binding:"required"`
	ProgramName       string `json:"program_name" binding:"required"` // Name for user's personal copy
	StartDate         string `json:"start_date" binding:"required"`   // Format: YYYY-MM-DD (required for calendar scheduling)
	Notes             string `json:"notes"`
}

// UpdateUserProgramRequest updates user program progress
type UpdateUserProgramRequest struct {
	Status      string `json:"status" binding:"omitempty,oneof=ACTIVE COMPLETED PAUSED CANCELLED"`
	CurrentWeek int    `json:"current_week" binding:"omitempty,gte=1"`
	CurrentDay  int    `json:"current_day" binding:"omitempty,gte=1"`
	Notes       string `json:"notes"`
}
