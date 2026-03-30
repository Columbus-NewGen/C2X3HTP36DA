package request

// UpdateScheduledWorkoutStatusRequest updates the status of a scheduled workout.
// DurationMinutes is optional — when provided alongside COMPLETED, it is written to the linked workout log.
type UpdateScheduledWorkoutStatusRequest struct {
	Status          string `json:"status" binding:"required,oneof=SCHEDULED IN_PROGRESS COMPLETED MISSED SKIPPED"`
	Notes           string `json:"notes"`
	DurationMinutes *int   `json:"duration_minutes" binding:"omitempty,gte=0"`
}

// LogWorkoutRequest creates a workout log with exercises
type LogWorkoutRequest struct {
	ScheduledWorkoutID *uint                `json:"scheduled_workout_id"` // Optional: links to scheduled workout, null for ad-hoc workouts
	SessionID          *uint                `json:"session_id"`           // Optional: backward compatibility for ad-hoc workouts
	WorkoutDate        string               `json:"workout_date" binding:"required"`        // Format: YYYY-MM-DD
	DurationMinutes    int                  `json:"duration_minutes" binding:"omitempty,gte=0"`
	Notes              string               `json:"notes"`
	Exercises          []LogWorkoutExercise `json:"exercises" binding:"omitempty,dive"`
}

// AddLogExerciseRequest adds a single exercise to an existing workout log
type AddLogExerciseRequest struct {
	ExerciseID                 uint     `json:"exercise_id" binding:"required"`
	ScheduledWorkoutExerciseID *uint    `json:"scheduled_workout_exercise_id"` // Optional: links to the prescribed exercise slot
	SetsCompleted              int      `json:"sets_completed" binding:"required,gte=0"`
	RepsCompleted              int      `json:"reps_completed" binding:"required,gte=0"`
	WeightUsed                 *float64 `json:"weight_used"`                                // Optional: null for bodyweight exercises
	RPERating                  *int     `json:"rpe_rating" binding:"omitempty,gte=1,lte=10"` // Optional: Rate of Perceived Exertion (1-10)
	Notes                      string   `json:"notes"`
}

// UpdateLogExerciseRequest updates a single exercise in a workout log (partial update with pointers)
type UpdateLogExerciseRequest struct {
	ExerciseID                 *uint    `json:"exercise_id"`
	ScheduledWorkoutExerciseID *uint    `json:"scheduled_workout_exercise_id"`
	SetsCompleted              *int     `json:"sets_completed" binding:"omitempty,gte=0"`
	RepsCompleted              *int     `json:"reps_completed" binding:"omitempty,gte=0"`
	WeightUsed                 *float64 `json:"weight_used"`
	RPERating                  *int     `json:"rpe_rating" binding:"omitempty,gte=1,lte=10"`
	Notes                      *string  `json:"notes"`
}

// AddScheduledWorkoutExerciseRequest adds a prescribed exercise to a scheduled workout
type AddScheduledWorkoutExerciseRequest struct {
	ExerciseID    uint     `json:"exercise_id"    binding:"required"`
	Sets          int      `json:"sets"           binding:"required,min=1"`
	Reps          int      `json:"reps"           binding:"required,min=1"`
	Weight        *float64 `json:"weight"`
	RestSeconds   int      `json:"rest_seconds"   binding:"min=0"`
	OrderSequence int      `json:"order_sequence" binding:"min=0"`
}

// UpdateScheduledWorkoutExerciseRequest partially updates a prescribed exercise on a scheduled workout
type UpdateScheduledWorkoutExerciseRequest struct {
	ExerciseID    *uint    `json:"exercise_id"`
	Sets          *int     `json:"sets"           binding:"omitempty,min=1"`
	Reps          *int     `json:"reps"           binding:"omitempty,min=1"`
	Weight        *float64 `json:"weight"`
	RestSeconds   *int     `json:"rest_seconds"   binding:"omitempty,min=0"`
	OrderSequence *int     `json:"order_sequence" binding:"omitempty,min=1"`
}

// LogWorkoutExercise represents a single exercise in a workout log
type LogWorkoutExercise struct {
	ExerciseID                 uint     `json:"exercise_id" binding:"required"`
	ScheduledWorkoutExerciseID *uint    `json:"scheduled_workout_exercise_id"` // Optional: links to the prescribed exercise slot
	SetsCompleted              int      `json:"sets_completed" binding:"required,gte=0"`
	RepsCompleted              int      `json:"reps_completed" binding:"required,gte=0"`
	WeightUsed                 *float64 `json:"weight_used"`    // Optional: null for bodyweight exercises
	RPERating                  *int     `json:"rpe_rating" binding:"omitempty,gte=1,lte=10"` // Optional: Rate of Perceived Exertion (1-10)
	Notes                      string   `json:"notes"`
}
