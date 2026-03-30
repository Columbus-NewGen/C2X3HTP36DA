package domain

import (
	"time"

	"github.com/gymmate/backend/models"
)

// ProgressRepository provides cross-domain aggregate queries for trainer dashboard and progress tracking.
type ProgressRepository interface {
	// Dashboard summary queries (existing)
	GetActiveUserProgramName(userID uint) (*string, error)
	GetLastWorkoutDate(userID uint) (*time.Time, error)
	CountWorkoutLogsInRange(userID uint, from, to time.Time) (int, error)
	CountUpcomingScheduledWorkouts(userID uint, fromDate time.Time) (int, error)
	GetRecentTraineeActivity(traineeIDs []uint, limit int) ([]models.TraineeActivity, error)

	// Trainee progress detail queries
	GetActiveUserProgram(userID uint) (*models.ActiveProgramInfo, error)
	GetScheduledWorkoutStats(userID uint) (*models.ScheduledWorkoutStats, error)
	GetCurrentStreak(userID uint) (int, error)
	GetRecentWorkoutLogs(userID uint, limit int, from, to *time.Time) ([]models.RecentWorkoutInfo, error)
	GetMuscleProgress(userID uint, from, to *time.Time) ([]models.MuscleProgressInfo, error)
	GetExercisePRs(userID uint, limit int, from, to *time.Time) ([]models.ExercisePRInfo, error)
	GetUserExercises(userID uint) ([]models.ExerciseFrequencyInfo, error)
}
