package response

// TrainerDashboardResponse provides overview of trainer's trainees
type TrainerDashboardResponse struct {
	TotalTrainees     int                       `json:"total_trainees"`
	ActiveTrainees    int                       `json:"active_trainees"`
	SuspendedTrainees int                       `json:"suspended_trainees"`
	RecentActivity    []TraineeActivitySummary  `json:"recent_activity"`
	Trainees          []TraineeDashboardSummary `json:"trainees"`
}

// TraineeDashboardSummary is a summary card for each trainee
type TraineeDashboardSummary struct {
	ID               uint    `json:"id"`
	Name             string  `json:"name"`
	ImageURL         *string `json:"image_url,omitempty"`
	Status           string  `json:"status"` // ACTIVE, SUSPENDED
	CurrentProgram   *string `json:"current_program,omitempty"`
	LastWorkoutDate  *string `json:"last_workout_date,omitempty"`
	WorkoutsThisWeek int     `json:"workouts_this_week"`
	UpcomingWorkouts int     `json:"upcoming_workouts"`
}

// TraineeActivitySummary represents recent trainee activity
type TraineeActivitySummary struct {
	TraineeID    uint   `json:"trainee_id"`
	TraineeName  string `json:"trainee_name"`
	ActivityType string `json:"activity_type"` // "workout_logged", "program_assigned", "missed_workout"
	Description  string `json:"description"`
	Timestamp    string `json:"timestamp"`
}

// TraineeProgressResponse provides detailed progress analytics for a trainee
type TraineeProgressResponse struct {
	TraineeID      uint                 `json:"trainee_id"`
	TraineeName    string               `json:"trainee_name"`
	CurrentProgram *ProgramSummary      `json:"current_program,omitempty"`
	WorkoutStats   WorkoutStatistics    `json:"workout_stats"`
	MuscleProgress []MuscleProgressItem `json:"muscle_progress"`
	ExercisePRs    []ExercisePRItem     `json:"exercise_prs"` // Personal records
	RecentWorkouts []RecentWorkoutItem  `json:"recent_workouts"`
}

// ProgramSummary is a minimal program summary
type ProgramSummary struct {
	ID             uint    `json:"id"`
	Name           string  `json:"name"`
	StartDate      string  `json:"start_date"`
	DurationWeeks  int     `json:"duration_weeks"`
	CompletionRate float64 `json:"completion_rate"` // Percentage of workouts completed
}

// WorkoutStatistics aggregates workout completion data
type WorkoutStatistics struct {
	TotalWorkoutsScheduled int     `json:"total_workouts_scheduled"`
	WorkoutsCompleted      int     `json:"workouts_completed"`
	WorkoutsMissed         int     `json:"workouts_missed"`
	WorkoutsSkipped        int     `json:"workouts_skipped"`
	CompletionRate         float64 `json:"completion_rate"` // Percentage
	CurrentStreak          int     `json:"current_streak"`  // Days in a row
}

// MuscleProgressItem shows volume/frequency per muscle group
type MuscleProgressItem struct {
	MuscleName       string  `json:"muscle_name"`
	BodyRegion       string  `json:"body_region"`
	TotalSets        int     `json:"total_sets"`
	WeightedSets     float64 `json:"weighted_sets"`
	TotalReps        int     `json:"total_reps"`
	TotalVolume      float64 `json:"total_volume"`
	AverageWeight    float64 `json:"average_weight"`
	WorkoutsTargeted int     `json:"workouts_targeted"`
	LastTrained      *string `json:"last_trained,omitempty"`
	IntensityScore   float64 `json:"intensity_score"`
}

// ExercisePRItem represents a personal record for an exercise
type ExercisePRItem struct {
	ExerciseName string  `json:"exercise_name"`
	MaxWeight    float64 `json:"max_weight"`
	MaxReps      int     `json:"max_reps"`
	MaxVolume    float64 `json:"max_volume"` // weight * reps
	AchievedAt   string  `json:"achieved_at"`
}

// RecentWorkoutItem shows recent logged workouts
type RecentWorkoutItem struct {
	WorkoutLogID       uint    `json:"workout_log_id"`
	WorkoutDate        string  `json:"workout_date"`
	ProgramSessionName *string `json:"program_session_name,omitempty"`
	ExerciseCount      int     `json:"exercise_count"`
	TotalSets          int     `json:"total_sets"`
	TotalVolume        float64 `json:"total_volume"`
	Duration           int     `json:"duration"` // Minutes
}
