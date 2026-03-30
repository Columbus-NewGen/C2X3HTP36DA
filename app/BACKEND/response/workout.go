package response

import "time"

// ScheduledWorkoutResponse represents a scheduled workout on the calendar
type ScheduledWorkoutResponse struct {
	ID               uint                  `json:"id"`
	UserProgramID    uint                  `json:"user_program_id"`
	ProgramName      string                `json:"program_name"`
	ScheduledDate    time.Time             `json:"scheduled_date"` // Format: YYYY-MM-DD
	WeekNumber       int                   `json:"week_number"`
	Status           string                `json:"status"` // SCHEDULED, IN_PROGRESS, COMPLETED, MISSED, SKIPPED, CANCELLED
	CompletedAt      *time.Time            `json:"completed_at,omitempty"`
	Notes            string                `json:"notes,omitempty"`
	Session          *PlanSessionResponse  `json:"session,omitempty"`     // The planned session template
	WorkoutLog       *WorkoutLogResponse   `json:"workout_log,omitempty"` // The actual workout log if completed
	CreatedAt        time.Time             `json:"created_at"`
	UpdatedAt        time.Time             `json:"updated_at"`
}

// WorkoutLogResponse represents a completed workout
type WorkoutLogResponse struct {
	ID                 uint                  `json:"id"`
	UserID             uint                  `json:"user_id"`
	ScheduledWorkoutID *uint                 `json:"scheduled_workout_id,omitempty"`
	WorkoutDate        time.Time             `json:"workout_date"` // Format: YYYY-MM-DD
	DurationMinutes    int                   `json:"duration_minutes"`
	Notes              string                `json:"notes,omitempty"`
	Session            *PlanSessionResponse  `json:"session,omitempty"` // Session reference if available
	Exercises          []LogExerciseDetail   `json:"exercises"`
	Completeness       *WorkoutCompleteness  `json:"completeness,omitempty"`
	CreatedAt          time.Time             `json:"created_at"`
	UpdatedAt          time.Time             `json:"updated_at"`
}

// LogExerciseDetail represents a single exercise performed in a workout
type LogExerciseDetail struct {
	ID                         uint                       `json:"id"`
	ExerciseID                 uint                       `json:"exercise_id"`
	ExerciseName               string                     `json:"exercise_name"`
	ScheduledWorkoutExerciseID *uint                      `json:"scheduled_workout_exercise_id,omitempty"`
	SetsCompleted              int                        `json:"sets_completed"`
	RepsCompleted              int                        `json:"reps_completed"`
	WeightUsed                 *float64                   `json:"weight_used,omitempty"`
	RPERating                  *int                       `json:"rpe_rating,omitempty"` // 1-10
	Notes                      string                     `json:"notes,omitempty"`
	Equipment                  []ExerciseEquipmentResponse `json:"equipment,omitempty"`
}

// WorkoutCompleteness tracks how many prescribed exercises have been logged
type WorkoutCompleteness struct {
	TotalPrescribed int `json:"total_prescribed"`
	CompletedSlots  int `json:"completed_slots"`
	ExtraExercises  int `json:"extra_exercises"`
}

// CalendarWorkoutResponse groups scheduled workouts by date for calendar view
type CalendarWorkoutResponse struct {
	Date     time.Time                  `json:"date"` // Format: YYYY-MM-DD
	Workouts []ScheduledWorkoutResponse `json:"workouts"`
}

// WorkoutStatsResponse provides aggregated workout statistics (future enhancement)
type WorkoutStatsResponse struct {
	TotalWorkouts     int     `json:"total_workouts"`
	CompletedWorkouts int     `json:"completed_workouts"`
	MissedWorkouts    int     `json:"missed_workouts"`
	CompletionRate    float64 `json:"completion_rate"` // Percentage
	CurrentStreak     int     `json:"current_streak"`  // Days
	LongestStreak     int     `json:"longest_streak"`  // Days
}
