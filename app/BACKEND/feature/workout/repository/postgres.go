package repository

import (
	"time"

	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/models"
	"github.com/pkg/errors"
	"gorm.io/gorm"
)

type workoutRepository struct {
	db *gorm.DB
}

func NewWorkoutRepository(db *gorm.DB) *workoutRepository {
	return &workoutRepository{db: db}
}

// GetScheduledWorkoutByID retrieves a scheduled workout by ID with preloaded relationships
func (r *workoutRepository) GetScheduledWorkoutByID(id uint) (*models.ScheduledWorkout, error) {
	var workout models.ScheduledWorkout
	err := r.db.
		Preload("ScheduledWorkoutExercises.Exercise").
		Preload("ProgramSession").
		Preload("WorkoutLog.LogExercises.Exercise").
		Preload("UserProgram").
		First(&workout, id).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, errors.Wrap(err, "[WorkoutRepository.GetScheduledWorkoutByID]: Error fetching scheduled workout")
	}

	return &workout, nil
}

// GetScheduledWorkoutsByUserProgramID retrieves scheduled workouts for a user program in date range
func (r *workoutRepository) GetScheduledWorkoutsByUserProgramID(userProgramID uint, startDate, endDate time.Time) ([]models.ScheduledWorkout, error) {
	var workouts []models.ScheduledWorkout
	err := r.db.
		Preload("ScheduledWorkoutExercises.Exercise").
		Preload("ProgramSession").
		Preload("WorkoutLog.LogExercises.Exercise").
		Where("user_program_id = ? AND scheduled_date >= ? AND scheduled_date <= ?", userProgramID, startDate, endDate).
		Order("scheduled_date ASC").
		Find(&workouts).Error

	if err != nil {
		return nil, errors.Wrap(err, "[WorkoutRepository.GetScheduledWorkoutsByUserProgramID]: Error fetching workouts")
	}

	return workouts, nil
}

// GetScheduledWorkoutsByUserID retrieves all scheduled workouts for a user across all programs in date range
func (r *workoutRepository) GetScheduledWorkoutsByUserID(userID uint, startDate, endDate time.Time, programStatus *string) ([]models.ScheduledWorkout, error) {
	var workouts []models.ScheduledWorkout
	query := r.db.
		Preload("UserProgram").
		Preload("ScheduledWorkoutExercises.Exercise.ExerciseEquipments.Equipment.EquipmentInstances").
		Preload("ProgramSession").
		Preload("WorkoutLog.LogExercises.Exercise.ExerciseEquipments.Equipment.EquipmentInstances").
		Joins("JOIN user_programs ON user_programs.id = scheduled_workouts.user_program_id").
		Where("user_programs.user_id = ? AND scheduled_workouts.scheduled_date >= ? AND scheduled_workouts.scheduled_date <= ?", userID, startDate, endDate)

	if programStatus != nil {
		query = query.Where("user_programs.status = ?", *programStatus)
	}

	err := query.
		Order("scheduled_workouts.scheduled_date ASC").
		Find(&workouts).Error

	if err != nil {
		return nil, errors.Wrap(err, "[WorkoutRepository.GetScheduledWorkoutsByUserID]: Error fetching workouts")
	}

	return workouts, nil
}

// UpdateScheduledWorkoutStatus updates the status of a scheduled workout
func (r *workoutRepository) UpdateScheduledWorkoutStatus(id uint, status string, notes string, completedAt *time.Time) error {
	updates := map[string]interface{}{
		"status":       status,
		"notes":        notes,
		"completed_at": completedAt,
		"updated_at":   time.Now(),
	}

	err := r.db.Model(&models.ScheduledWorkout{}).
		Where("id = ?", id).
		Updates(updates).Error

	if err != nil {
		return errors.Wrap(err, "[WorkoutRepository.UpdateScheduledWorkoutStatus]: Error updating status")
	}

	return nil
}

// UpdateScheduledWorkoutLog links a workout log to a scheduled workout.
// Does NOT change status — completion is handled separately by auto-complete or manual status update.
func (r *workoutRepository) UpdateScheduledWorkoutLog(id uint, workoutLogID uint) error {
	err := r.db.Model(&models.ScheduledWorkout{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"workout_log_id": workoutLogID,
			"updated_at":     time.Now(),
		}).Error

	if err != nil {
		return errors.Wrap(err, "[WorkoutRepository.UpdateScheduledWorkoutLog]: Error updating workout log")
	}

	return nil
}

// MarkPastWorkoutsAsMissed marks all past SCHEDULED and stale IN_PROGRESS workouts as MISSED.
// Returns the distinct user_program_ids affected so callers can check auto-close.
func (r *workoutRepository) MarkPastWorkoutsAsMissed(today time.Time) ([]uint, error) {
	nonTerminal := []string{"SCHEDULED", "IN_PROGRESS"}

	var affectedIDs []uint
	err := r.db.Raw(
		`SELECT DISTINCT user_program_id FROM scheduled_workouts
		 WHERE scheduled_date < ? AND status IN ?`, today, nonTerminal,
	).Scan(&affectedIDs).Error
	if err != nil {
		return nil, errors.Wrap(err, "[WorkoutRepository.MarkPastWorkoutsAsMissed]: Error collecting affected program IDs")
	}
	if len(affectedIDs) == 0 {
		return nil, nil
	}

	err = r.db.Model(&models.ScheduledWorkout{}).
		Where("scheduled_date < ? AND status IN ?", today, nonTerminal).
		Updates(map[string]interface{}{
			"status":     "MISSED",
			"updated_at": time.Now(),
		}).Error
	if err != nil {
		return nil, errors.Wrap(err, "[WorkoutRepository.MarkPastWorkoutsAsMissed]: Error marking workouts as missed")
	}

	return affectedIDs, nil
}

// GetProgramCompletionStats aggregates scheduled workout counts for a user program.
func (r *workoutRepository) GetProgramCompletionStats(userProgramID uint) (*domain.ProgramCompletionStats, error) {
	type row struct {
		UserID uint
		Status string
		Count  int
	}
	var rows []row
	err := r.db.Raw(`
		SELECT up.user_id, sw.status, COUNT(*) AS count
		FROM scheduled_workouts sw
		JOIN user_programs up ON up.id = sw.user_program_id
		WHERE sw.user_program_id = ?
		GROUP BY up.user_id, sw.status
	`, userProgramID).Scan(&rows).Error
	if err != nil {
		return nil, errors.Wrap(err, "[WorkoutRepository.GetProgramCompletionStats]: Error aggregating stats")
	}
	if len(rows) == 0 {
		return nil, nil
	}

	stats := &domain.ProgramCompletionStats{}
	for _, r := range rows {
		stats.UserID = r.UserID
		stats.Total += r.Count
		switch r.Status {
		case "COMPLETED":
			stats.Completed += r.Count
		case "CANCELLED":
			stats.Cancelled += r.Count
		case "SCHEDULED", "IN_PROGRESS":
			stats.Remaining += r.Count
		}
	}
	return stats, nil
}

// AutoCompleteUserProgram updates a user program's status to the given value.
// The AND status = 'ACTIVE' guard prevents overwriting a CANCELLED program.
func (r *workoutRepository) AutoCompleteUserProgram(userProgramID uint, status string, completedAt time.Time) error {
	err := r.db.Model(&models.UserProgram{}).
		Where("id = ? AND status IN ?", userProgramID, []string{"ACTIVE", "PAUSED"}).
		Updates(map[string]interface{}{
			"status":       status,
			"completed_at": completedAt,
			"updated_at":   time.Now(),
		}).Error
	if err != nil {
		return errors.Wrap(err, "[WorkoutRepository.AutoCompleteUserProgram]: Error updating user program status")
	}
	return nil
}

// CreateWorkoutLog creates a new workout log
func (r *workoutRepository) CreateWorkoutLog(log *models.WorkoutLog) error {
	err := r.db.Create(log).Error
	if err != nil {
		return errors.Wrap(err, "[WorkoutRepository.CreateWorkoutLog]: Error creating workout log")
	}
	return nil
}

// UpdateWorkoutLogDuration updates the duration_minutes of an existing workout log
func (r *workoutRepository) UpdateWorkoutLogDuration(logID uint, durationMinutes int) error {
	err := r.db.Model(&models.WorkoutLog{}).
		Where("id = ?", logID).
		Updates(map[string]interface{}{
			"duration_minutes": durationMinutes,
			"updated_at":       time.Now(),
		}).Error
	if err != nil {
		return errors.Wrap(err, "[WorkoutRepository.UpdateWorkoutLogDuration]: Error updating duration")
	}
	return nil
}

// CreateLogExercises creates multiple log exercises in bulk
func (r *workoutRepository) CreateLogExercises(exercises []models.LogExercise) error {
	if len(exercises) == 0 {
		return nil
	}

	err := r.db.Create(&exercises).Error
	if err != nil {
		return errors.Wrap(err, "[WorkoutRepository.CreateLogExercises]: Error creating log exercises")
	}
	return nil
}

// GetWorkoutLogsByUserID retrieves workout logs for a user with optional date filtering
func (r *workoutRepository) GetWorkoutLogsByUserID(userID uint, startDate, endDate *time.Time) ([]models.WorkoutLog, error) {
	var logs []models.WorkoutLog
	query := r.db.
		Preload("ProgramSession").
		Preload("ScheduledWorkout.ProgramSession").
		Preload("LogExercises.Exercise").
		Where("user_id = ?", userID)

	if startDate != nil {
		query = query.Where("workout_date >= ?", *startDate)
	}
	if endDate != nil {
		query = query.Where("workout_date <= ?", *endDate)
	}

	err := query.Order("workout_date DESC").Find(&logs).Error
	if err != nil {
		return nil, errors.Wrap(err, "[WorkoutRepository.GetWorkoutLogsByUserID]: Error fetching workout logs")
	}

	return logs, nil
}

// GetWorkoutLogByID retrieves a workout log by ID with all relationships
func (r *workoutRepository) GetWorkoutLogByID(id uint) (*models.WorkoutLog, error) {
	var log models.WorkoutLog
	err := r.db.
		Preload("ProgramSession").
		Preload("ScheduledWorkout.ProgramSession").
		Preload("LogExercises.Exercise").
		First(&log, id).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, errors.Wrap(err, "[WorkoutRepository.GetWorkoutLogByID]: Error fetching workout log")
	}

	return &log, nil
}

// CreateLogExercise creates a single log exercise
func (r *workoutRepository) CreateLogExercise(exercise *models.LogExercise) error {
	err := r.db.Create(exercise).Error
	if err != nil {
		return errors.Wrap(err, "[WorkoutRepository.CreateLogExercise]: Error creating log exercise")
	}
	return nil
}

// GetLogExerciseByID retrieves a log exercise by ID with preloaded Exercise
func (r *workoutRepository) GetLogExerciseByID(id uint) (*models.LogExercise, error) {
	var exercise models.LogExercise
	err := r.db.Preload("Exercise").First(&exercise, id).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, errors.Wrap(err, "[WorkoutRepository.GetLogExerciseByID]: Error fetching log exercise")
	}

	return &exercise, nil
}

// UpdateLogExercise updates an existing log exercise (full save after usecase merges fields)
func (r *workoutRepository) UpdateLogExercise(exercise *models.LogExercise) error {
	err := r.db.Save(exercise).Error
	if err != nil {
		return errors.Wrap(err, "[WorkoutRepository.UpdateLogExercise]: Error updating log exercise")
	}
	return nil
}

// DeleteLogExercise hard-deletes a log exercise by ID
func (r *workoutRepository) DeleteLogExercise(id uint) error {
	err := r.db.Delete(&models.LogExercise{}, id).Error
	if err != nil {
		return errors.Wrap(err, "[WorkoutRepository.DeleteLogExercise]: Error deleting log exercise")
	}
	return nil
}

// GetScheduledWorkoutExerciseByID retrieves a scheduled workout exercise by ID
func (r *workoutRepository) GetScheduledWorkoutExerciseByID(id uint) (*models.ScheduledWorkoutExercise, error) {
	var swe models.ScheduledWorkoutExercise
	err := r.db.First(&swe, id).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, errors.Wrap(err, "[WorkoutRepository.GetScheduledWorkoutExerciseByID]: Error fetching scheduled workout exercise")
	}

	return &swe, nil
}

// GetScheduledWorkoutExercisesByWorkoutID returns all prescribed exercises for a scheduled workout
func (r *workoutRepository) GetScheduledWorkoutExercisesByWorkoutID(scheduledWorkoutID uint) ([]models.ScheduledWorkoutExercise, error) {
	var exercises []models.ScheduledWorkoutExercise
	err := r.db.Where("scheduled_workout_id = ?", scheduledWorkoutID).
		Order("order_sequence ASC").
		Find(&exercises).Error
	if err != nil {
		return nil, errors.Wrap(err, "[WorkoutRepository.GetScheduledWorkoutExercisesByWorkoutID]: Error fetching exercises")
	}
	return exercises, nil
}

// CountScheduledWorkoutExercises counts the prescribed exercises for a scheduled workout
func (r *workoutRepository) CountScheduledWorkoutExercises(scheduledWorkoutID uint) (int, error) {
	var count int64
	err := r.db.Model(&models.ScheduledWorkoutExercise{}).
		Where("scheduled_workout_id = ?", scheduledWorkoutID).
		Count(&count).Error

	if err != nil {
		return 0, errors.Wrap(err, "[WorkoutRepository.CountScheduledWorkoutExercises]: Error counting exercises")
	}

	return int(count), nil
}

// CountFilledSlots counts how many log exercises in a workout log have a slot link
func (r *workoutRepository) CountFilledSlots(logID uint) (int, error) {
	var count int64
	err := r.db.Model(&models.LogExercise{}).
		Where("log_id = ? AND scheduled_workout_exercise_id IS NOT NULL", logID).
		Count(&count).Error

	if err != nil {
		return 0, errors.Wrap(err, "[WorkoutRepository.CountFilledSlots]: Error counting filled slots")
	}

	return int(count), nil
}

// CreateScheduledWorkoutExercise inserts a new prescribed exercise into a scheduled workout
func (r *workoutRepository) CreateScheduledWorkoutExercise(exercise *models.ScheduledWorkoutExercise) error {
	err := r.db.Create(exercise).Error
	if err != nil {
		return errors.Wrap(err, "[WorkoutRepository.CreateScheduledWorkoutExercise]: Error creating scheduled workout exercise")
	}
	return nil
}

// UpdateScheduledWorkoutExercise saves changes to an existing scheduled workout exercise
func (r *workoutRepository) UpdateScheduledWorkoutExercise(exercise *models.ScheduledWorkoutExercise) error {
	err := r.db.Save(exercise).Error
	if err != nil {
		return errors.Wrap(err, "[WorkoutRepository.UpdateScheduledWorkoutExercise]: Error updating scheduled workout exercise")
	}
	return nil
}

// DeleteScheduledWorkoutExercise hard-deletes a scheduled workout exercise by ID
func (r *workoutRepository) DeleteScheduledWorkoutExercise(id uint) error {
	err := r.db.Delete(&models.ScheduledWorkoutExercise{}, id).Error
	if err != nil {
		return errors.Wrap(err, "[WorkoutRepository.DeleteScheduledWorkoutExercise]: Error deleting scheduled workout exercise")
	}
	return nil
}

// GetExerciseByID retrieves an exercise by ID (for validation and log details)
func (r *workoutRepository) GetExerciseByID(id uint) (*models.Exercise, error) {
	var exercise models.Exercise
	err := r.db.First(&exercise, id).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, errors.Wrap(err, "[WorkoutRepository.GetExerciseByID]: Error fetching exercise")
	}

	return &exercise, nil
}
