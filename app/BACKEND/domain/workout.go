package domain

import (
	"time"

	"github.com/gymmate/backend/models"
	"github.com/gymmate/backend/request"
	"github.com/gymmate/backend/response"
)

// ProgramCompletionStats holds aggregated scheduled workout counts for auto-close check.
type ProgramCompletionStats struct {
	UserID    uint // from JOIN on user_programs
	Total     int  // all scheduled workouts for the program
	Completed int  // status = COMPLETED
	Cancelled int  // status = CANCELLED (excluded from rate denominator)
	Remaining int  // status = SCHEDULED or IN_PROGRESS (any = not ready to close)
}

// WorkoutUsecase defines business logic for workout scheduling and logging
type WorkoutUsecase interface {
	// Calendar views
	GetScheduledWorkouts(userID uint, startDate, endDate time.Time, programStatus *string) ([]response.ScheduledWorkoutResponse, error)
	GetScheduledWorkoutByID(id uint) (*response.ScheduledWorkoutResponse, error)
	GetCalendarView(userID uint, startDate, endDate time.Time, programStatus *string) ([]response.CalendarWorkoutResponse, error)

	// Status management
	UpdateScheduledWorkoutStatus(id uint, req *request.UpdateScheduledWorkoutStatusRequest) (*response.ScheduledWorkoutResponse, error)
	MarkMissedWorkouts() error        // Background job to mark past scheduled workouts as MISSED
	ResetStaleStreaks() error         // Reset current_streak to 0 for users who missed yesterday
	RunAutoCompleteProgram(userProgramID uint) error // Trigger auto-complete check for a specific user program

	// Workout logging
	LogWorkout(userID uint, req *request.LogWorkoutRequest) (*response.WorkoutLogResponse, error)
	GetWorkoutLogs(userID uint, startDate, endDate *time.Time) ([]response.WorkoutLogResponse, error)
	GetWorkoutLogByID(id uint) (*response.WorkoutLogResponse, error)

	// Log exercise CRUD
	AddLogExercise(logID uint, userID uint, req *request.AddLogExerciseRequest) (*response.LogExerciseDetail, error)
	UpdateLogExercise(logID, exerciseLogID, userID uint, req *request.UpdateLogExerciseRequest) (*response.LogExerciseDetail, error)
	DeleteLogExercise(logID, exerciseLogID, userID uint) error

	// Scheduled workout exercise CRUD
	AddScheduledWorkoutExercise(userID, scheduledWorkoutID uint, req *request.AddScheduledWorkoutExerciseRequest) (*response.SessionExerciseDetail, error)
	UpdateScheduledWorkoutExercise(userID, scheduledWorkoutID, exerciseID uint, req *request.UpdateScheduledWorkoutExerciseRequest) (*response.SessionExerciseDetail, error)
	DeleteScheduledWorkoutExercise(userID, scheduledWorkoutID, exerciseID uint) error
}

// WorkoutRepository defines data access for workout scheduling and logging
type WorkoutRepository interface {
	// Scheduled workouts
	GetScheduledWorkoutByID(id uint) (*models.ScheduledWorkout, error)
	GetScheduledWorkoutsByUserProgramID(userProgramID uint, startDate, endDate time.Time) ([]models.ScheduledWorkout, error)
	GetScheduledWorkoutsByUserID(userID uint, startDate, endDate time.Time, programStatus *string) ([]models.ScheduledWorkout, error)
	UpdateScheduledWorkoutStatus(id uint, status string, notes string, completedAt *time.Time) error
	UpdateScheduledWorkoutLog(id uint, workoutLogID uint) error
	MarkPastWorkoutsAsMissed(today time.Time) ([]uint, error) // returns affected user_program_ids
	GetProgramCompletionStats(userProgramID uint) (*ProgramCompletionStats, error)
	AutoCompleteUserProgram(userProgramID uint, status string, completedAt time.Time) error

	// Workout logging
	CreateWorkoutLog(log *models.WorkoutLog) error
	CreateLogExercises(exercises []models.LogExercise) error
	GetWorkoutLogsByUserID(userID uint, startDate, endDate *time.Time) ([]models.WorkoutLog, error)
	GetWorkoutLogByID(id uint) (*models.WorkoutLog, error)
	UpdateWorkoutLogDuration(logID uint, durationMinutes int) error

	// Exercise lookup for log details
	GetExerciseByID(id uint) (*models.Exercise, error)

	// Log exercise CRUD
	CreateLogExercise(exercise *models.LogExercise) error
	GetLogExerciseByID(id uint) (*models.LogExercise, error)
	UpdateLogExercise(exercise *models.LogExercise) error
	DeleteLogExercise(id uint) error

	// Scheduled workout exercise lookup (for slot link validation & auto-linking)
	GetScheduledWorkoutExerciseByID(id uint) (*models.ScheduledWorkoutExercise, error)
	GetScheduledWorkoutExercisesByWorkoutID(scheduledWorkoutID uint) ([]models.ScheduledWorkoutExercise, error)
	CountScheduledWorkoutExercises(scheduledWorkoutID uint) (int, error)
	CountFilledSlots(logID uint) (int, error)

	// Scheduled workout exercise CRUD
	CreateScheduledWorkoutExercise(exercise *models.ScheduledWorkoutExercise) error
	UpdateScheduledWorkoutExercise(exercise *models.ScheduledWorkoutExercise) error
	DeleteScheduledWorkoutExercise(id uint) error
}
