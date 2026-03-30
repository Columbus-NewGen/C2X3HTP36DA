package repository

import (
	"time"

	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/models"
	"github.com/pkg/errors"
	"gorm.io/gorm"
)

type progressRepository struct {
	db *gorm.DB
}

func NewProgressRepository(db *gorm.DB) domain.ProgressRepository {
	return &progressRepository{db: db}
}

func (r *progressRepository) GetActiveUserProgramName(userID uint) (*string, error) {
	var name string
	err := r.db.Raw(
		`SELECT program_name FROM user_programs WHERE user_id = ? AND status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1`,
		userID,
	).Scan(&name).Error

	if err != nil {
		return nil, errors.Wrap(err, "[ProgressRepository.GetActiveUserProgramName]")
	}
	if name == "" {
		return nil, nil
	}
	return &name, nil
}

func (r *progressRepository) GetLastWorkoutDate(userID uint) (*time.Time, error) {
	var date *time.Time
	err := r.db.Raw(
		`SELECT MAX(workout_date) FROM workout_logs WHERE user_id = ? AND deleted_at IS NULL`,
		userID,
	).Scan(&date).Error

	if err != nil {
		return nil, errors.Wrap(err, "[ProgressRepository.GetLastWorkoutDate]")
	}
	return date, nil
}

func (r *progressRepository) CountWorkoutLogsInRange(userID uint, from, to time.Time) (int, error) {
	var count int
	err := r.db.Raw(
		`SELECT COUNT(*) FROM workout_logs WHERE user_id = ? AND workout_date >= ? AND workout_date <= ? AND deleted_at IS NULL`,
		userID, from, to,
	).Scan(&count).Error

	if err != nil {
		return 0, errors.Wrap(err, "[ProgressRepository.CountWorkoutLogsInRange]")
	}
	return count, nil
}

func (r *progressRepository) CountUpcomingScheduledWorkouts(userID uint, fromDate time.Time) (int, error) {
	var count int
	err := r.db.Raw(
		`SELECT COUNT(*) FROM scheduled_workouts sw
		 JOIN user_programs up ON up.id = sw.user_program_id
		 WHERE up.user_id = ? AND sw.status = 'SCHEDULED' AND sw.scheduled_date >= ?`,
		userID, fromDate,
	).Scan(&count).Error

	if err != nil {
		return 0, errors.Wrap(err, "[ProgressRepository.CountUpcomingScheduledWorkouts]")
	}
	return count, nil
}

func (r *progressRepository) GetActiveUserProgram(userID uint) (*models.ActiveProgramInfo, error) {
	var info models.ActiveProgramInfo
	err := r.db.Raw(
		`SELECT up.id AS user_program_id, up.program_name, up.start_date, p.duration_weeks
		 FROM user_programs up
		 JOIN programs p ON p.id = up.program_id
		 WHERE up.user_id = ? AND up.status = 'ACTIVE'
		 ORDER BY up.created_at DESC LIMIT 1`,
		userID,
	).Scan(&info).Error

	if err != nil {
		return nil, errors.Wrap(err, "[ProgressRepository.GetActiveUserProgram]")
	}
	if info.UserProgramID == 0 {
		return nil, nil
	}
	return &info, nil
}

func (r *progressRepository) GetScheduledWorkoutStats(userID uint) (*models.ScheduledWorkoutStats, error) {
	var stats models.ScheduledWorkoutStats
	err := r.db.Raw(
		`SELECT
			COUNT(*) AS total_scheduled,
			COUNT(CASE WHEN sw.status = 'COMPLETED' THEN 1 END) AS completed,
			COUNT(CASE WHEN sw.status = 'MISSED' THEN 1 END) AS missed,
			COUNT(CASE WHEN sw.status = 'SKIPPED' THEN 1 END) AS skipped
		 FROM scheduled_workouts sw
		 JOIN user_programs up ON up.id = sw.user_program_id
		 WHERE up.user_id = ? AND up.status != 'CANCELLED'`,
		userID,
	).Scan(&stats).Error

	if err != nil {
		return nil, errors.Wrap(err, "[ProgressRepository.GetScheduledWorkoutStats]")
	}
	return &stats, nil
}

func (r *progressRepository) GetCurrentStreak(userID uint) (int, error) {
	var streak int
	err := r.db.Raw(
		`WITH workout_dates AS (
			SELECT DISTINCT workout_date::date AS d
			FROM workout_logs
			WHERE user_id = ? AND deleted_at IS NULL
		),
		numbered AS (
			SELECT d, d - (ROW_NUMBER() OVER (ORDER BY d DESC))::int * INTERVAL '1 day' AS grp
			FROM workout_dates
		)
		SELECT COUNT(*)
		FROM numbered
		WHERE grp = (SELECT grp FROM numbered ORDER BY d DESC LIMIT 1)`,
		userID,
	).Scan(&streak).Error

	if err != nil {
		return 0, errors.Wrap(err, "[ProgressRepository.GetCurrentStreak]")
	}
	return streak, nil
}

func (r *progressRepository) GetRecentWorkoutLogs(userID uint, limit int, from, to *time.Time) ([]models.RecentWorkoutInfo, error) {
	var results []models.RecentWorkoutInfo

	query := `SELECT
			wl.id AS workout_log_id,
			wl.workout_date,
			ps.session_name AS program_session_name,
			COUNT(DISTINCT le.id) AS exercise_count,
			COALESCE(SUM(le.sets_completed), 0) AS total_sets,
			COALESCE(SUM(COALESCE(le.weight_used, 0) * le.reps_completed * le.sets_completed), 0) AS total_volume,
			wl.duration_minutes
		 FROM workout_logs wl
		 LEFT JOIN program_sessions ps ON ps.id = wl.session_id
		 LEFT JOIN log_exercises le ON le.log_id = wl.id
		 WHERE wl.user_id = ? AND wl.deleted_at IS NULL`
	args := []any{userID}

	if from != nil {
		query += ` AND wl.workout_date >= ?`
		args = append(args, *from)
	}
	if to != nil {
		query += ` AND wl.workout_date <= ?`
		args = append(args, *to)
	}

	query += ` GROUP BY wl.id, wl.workout_date, ps.session_name, wl.duration_minutes
		 ORDER BY wl.workout_date DESC
		 LIMIT ?`
	args = append(args, limit)

	err := r.db.Raw(query, args...).Scan(&results).Error
	if err != nil {
		return nil, errors.Wrap(err, "[ProgressRepository.GetRecentWorkoutLogs]")
	}
	return results, nil
}

func (r *progressRepository) GetMuscleProgress(userID uint, from, to *time.Time) ([]models.MuscleProgressInfo, error) {
	var results []models.MuscleProgressInfo

	query := `SELECT
			m.muscle_name,
			m.body_region,
			COALESCE(SUM(le.sets_completed), 0) AS total_sets,
			COALESCE(SUM(le.sets_completed * COALESCE(em.activation_percentage, 100) / 100.0), 0) AS weighted_sets,
			COALESCE(SUM(le.reps_completed), 0) AS total_reps,
			COALESCE(SUM(COALESCE(le.weight_used, 0) * le.reps_completed * le.sets_completed), 0) AS total_volume,
			COALESCE(AVG(le.weight_used), 0) AS average_weight,
			COUNT(DISTINCT wl.id) AS workouts_targeted,
			MAX(wl.workout_date) AS last_trained
		 FROM log_exercises le
		 JOIN exercise_muscles em ON em.exercise_id = le.exercise_id
		 JOIN muscles m ON m.id = em.muscle_id
		 JOIN workout_logs wl ON wl.id = le.log_id
		 WHERE wl.user_id = ? AND wl.deleted_at IS NULL`
	args := []any{userID}

	if from != nil {
		query += ` AND wl.workout_date >= ?`
		args = append(args, *from)
	}
	if to != nil {
		query += ` AND wl.workout_date <= ?`
		args = append(args, *to)
	}

	query += ` GROUP BY m.id, m.muscle_name, m.body_region
		 ORDER BY weighted_sets DESC`

	err := r.db.Raw(query, args...).Scan(&results).Error
	if err != nil {
		return nil, errors.Wrap(err, "[ProgressRepository.GetMuscleProgress]")
	}
	return results, nil
}

func (r *progressRepository) GetExercisePRs(userID uint, limit int, from, to *time.Time) ([]models.ExercisePRInfo, error) {
	var results []models.ExercisePRInfo

	query := `SELECT
			e.exercise_name,
			COALESCE(MAX(le.weight_used), 0) AS max_weight,
			MAX(le.reps_completed) AS max_reps,
			COALESCE(MAX(COALESCE(le.weight_used, 0) * le.reps_completed), 0) AS max_volume,
			MAX(wl.workout_date) AS achieved_at
		 FROM log_exercises le
		 JOIN exercises e ON e.id = le.exercise_id
		 JOIN workout_logs wl ON wl.id = le.log_id
		 WHERE wl.user_id = ? AND wl.deleted_at IS NULL`
	args := []any{userID}

	if from != nil {
		query += ` AND wl.workout_date >= ?`
		args = append(args, *from)
	}
	if to != nil {
		query += ` AND wl.workout_date <= ?`
		args = append(args, *to)
	}

	query += ` GROUP BY e.id, e.exercise_name
		 ORDER BY max_weight DESC
		 LIMIT ?`
	args = append(args, limit)

	err := r.db.Raw(query, args...).Scan(&results).Error
	if err != nil {
		return nil, errors.Wrap(err, "[ProgressRepository.GetExercisePRs]")
	}
	return results, nil
}

func (r *progressRepository) GetUserExercises(userID uint) ([]models.ExerciseFrequencyInfo, error) {
	var results []models.ExerciseFrequencyInfo

	query := `SELECT 
  e.exercise_name AS exercise_name,
  COUNT(DISTINCT wl.id) AS session_count,
  MAX(wl.workout_date) AS last_performed
FROM log_exercises le
JOIN exercises e ON e.id = le.exercise_id
JOIN workout_logs wl ON wl.id = le.log_id
WHERE wl.user_id = ? AND wl.deleted_at IS NULL
GROUP BY e.id, e.exercise_name
ORDER BY session_count DESC;`

	err := r.db.Raw(query, userID).Scan(&results).Error
	if err != nil {
		return nil, errors.Wrap(err, "[ProgressRepository.GetUserExercises]")
	}
	return results, nil
}

func (r *progressRepository) GetRecentTraineeActivity(traineeIDs []uint, limit int) ([]models.TraineeActivity, error) {
	if len(traineeIDs) == 0 {
		return []models.TraineeActivity{}, nil
	}

	var activities []models.TraineeActivity
	err := r.db.Raw(
		`(SELECT wl.user_id, u.name AS user_name, 'workout_logged' AS type,
		         'Logged a workout' AS description, wl.created_at AS timestamp
		  FROM workout_logs wl
		  JOIN users u ON u.id = wl.user_id
		  WHERE wl.user_id IN ? AND wl.deleted_at IS NULL)
		 UNION ALL
		 (SELECT up2.user_id, u2.name AS user_name, 'missed_workout' AS type,
		         CONCAT('Missed: ', sw.session_name) AS description, sw.updated_at AS timestamp
		  FROM scheduled_workouts sw
		  JOIN user_programs up2 ON up2.id = sw.user_program_id
		  JOIN users u2 ON u2.id = up2.user_id
		  WHERE up2.user_id IN ? AND sw.status = 'MISSED')
		 ORDER BY timestamp DESC
		 LIMIT ?`,
		traineeIDs, traineeIDs, limit,
	).Scan(&activities).Error

	if err != nil {
		return nil, errors.Wrap(err, "[ProgressRepository.GetRecentTraineeActivity]")
	}
	return activities, nil
}
