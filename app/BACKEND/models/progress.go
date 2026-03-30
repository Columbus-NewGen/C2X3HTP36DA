package models

import "time"

// TraineeActivity is a query result for the trainer dashboard activity feed.
// Not a GORM model — used by ProgressRepository aggregate queries.
type TraineeActivity struct {
	UserID      uint
	UserName    string
	Type        string // "workout_logged", "missed_workout"
	Description string
	Timestamp   time.Time
}

// ActiveProgramInfo is a query result for the user's current active program.
type ActiveProgramInfo struct {
	UserProgramID uint
	ProgramName   string
	StartDate     *time.Time
	DurationWeeks int
}

// ScheduledWorkoutStats aggregates scheduled workout counts by status.
type ScheduledWorkoutStats struct {
	TotalScheduled int
	Completed      int
	Missed         int
	Skipped        int
}

// RecentWorkoutInfo is a query result for recent workout log summaries.
type RecentWorkoutInfo struct {
	WorkoutLogID       uint
	WorkoutDate        time.Time
	ProgramSessionName *string
	ExerciseCount      int
	TotalSets          int
	TotalVolume        float64
	DurationMinutes    int
}

// MuscleProgressInfo aggregates training volume per muscle.
type MuscleProgressInfo struct {
	MuscleName       string
	BodyRegion       string
	TotalSets        int
	WeightedSets     float64
	TotalReps        int
	TotalVolume      float64
	AverageWeight    float64
	WorkoutsTargeted int
	LastTrained      *time.Time
}

// ExercisePRInfo represents a personal record for an exercise.
type ExercisePRInfo struct {
	ExerciseName string
	MaxWeight    float64
	MaxReps      int
	MaxVolume    float64
	AchievedAt   time.Time
}

// ExerciseFrequencyInfo is a query result for exercises a user has performed, sorted by session count.
type ExerciseFrequencyInfo struct {
	ExerciseName  string     `gorm:"column:exercise_name"`
	SessionCount  int        `gorm:"column:session_count"`
	LastPerformed *time.Time `gorm:"column:last_performed"`
}
