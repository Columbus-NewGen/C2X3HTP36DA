package repository

import (
	"time"

	"github.com/gymmate/backend/constant"
	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/models"
	"github.com/pkg/errors"
	"gorm.io/gorm"
)

type programRepository struct {
	db *gorm.DB
}

func NewProgramRepository(db *gorm.DB) domain.ProgramRepository {
	return &programRepository{db: db}
}

// Program CRUD
func (r *programRepository) CreateProgram(program *models.Program) error {
	if err := r.db.Create(program).Error; err != nil {
		return errors.Wrap(err, "[ProgramRepository.CreateProgram]: Error creating program")
	}
	return nil
}

func (r *programRepository) GetProgramByID(id uint) (*models.Program, error) {
	var program models.Program
	if err := r.db.Preload("Creator").First(&program, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, errors.Wrap(err, "[ProgramRepository.GetProgramByID]: Error querying database")
	}
	return &program, nil
}

func (r *programRepository) GetPrograms(isTemplate *bool, difficulty string, authenticatedUserID uint) ([]models.Program, error) {
	var programs []models.Program
	query := r.db.Preload("Creator")

	if isTemplate != nil && *isTemplate {
		query = query.Where("is_template = true")
	} else if isTemplate != nil && !*isTemplate {
		query = query.Where("is_template = false").
			Where("created_by = ? OR id IN (SELECT program_id FROM user_programs WHERE user_id = ?)",
				authenticatedUserID, authenticatedUserID)
	} else {
		query = query.Where(
			"is_template = true OR (is_template = false AND (created_by = ? OR id IN (SELECT program_id FROM user_programs WHERE user_id = ?)))",
			authenticatedUserID, authenticatedUserID)
	}

	if difficulty != "" {
		query = query.Where("difficulty_level = ?", difficulty)
	}

	if err := query.Order("created_at DESC").Find(&programs).Error; err != nil {
		return nil, errors.Wrap(err, "[ProgramRepository.GetPrograms]: Error querying database")
	}
	return programs, nil
}

func (r *programRepository) UpdateProgram(program *models.Program) error {
	if err := r.db.Save(program).Error; err != nil {
		return errors.Wrap(err, "[ProgramRepository.UpdateProgram]: Error updating program")
	}
	return nil
}

func (r *programRepository) DeleteProgram(id uint) error {
	if err := r.db.Delete(&models.Program{}, id).Error; err != nil {
		return errors.Wrap(err, "[ProgramRepository.DeleteProgram]: Error deleting program")
	}
	return nil
}

// Program with sessions
func (r *programRepository) GetProgramWithSessions(id uint) (*models.Program, error) {
	var program models.Program
	if err := r.db.
		Preload("Sessions.Exercises.Exercise").
		Preload("Creator").
		First(&program, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, errors.Wrap(err, "[ProgramRepository.GetProgramWithSessions]: Error querying database")
	}
	return &program, nil
}

// Session management
func (r *programRepository) CreateSession(session *models.ProgramSession) error {
	if err := r.db.Create(session).Error; err != nil {
		return errors.Wrap(err, "[ProgramRepository.CreateSession]: Error creating session")
	}
	return nil
}

func (r *programRepository) CreateSessionExercise(exercise *models.SessionExercise) error {
	if err := r.db.Create(exercise).Error; err != nil {
		return errors.Wrap(err, "[ProgramRepository.CreateSessionExercise]: Error creating session exercise")
	}
	return nil
}

func (r *programRepository) DeleteSessionsByProgramID(programID uint) error {
	if err := r.db.Where("program_id = ?", programID).Delete(&models.ProgramSession{}).Error; err != nil {
		return errors.Wrap(err, "[ProgramRepository.DeleteSessionsByProgramID]: Error deleting sessions")
	}
	return nil
}

// User Program CRUD
func (r *programRepository) CreateUserProgram(userProgram *models.UserProgram) error {
	if err := r.db.Create(userProgram).Error; err != nil {
		return errors.Wrap(err, "[ProgramRepository.CreateUserProgram]: Error creating user program")
	}
	return nil
}

func (r *programRepository) GetUserProgramByID(id uint) (*models.UserProgram, error) {
	var userProgram models.UserProgram
	if err := r.db.
		Preload("User").
		Preload("Program.Creator").
		Preload("Program.Sessions").
		Preload("Trainer").
		First(&userProgram, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, errors.Wrap(err, "[ProgramRepository.GetUserProgramByID]: Error querying database")
	}
	return &userProgram, nil
}

func (r *programRepository) GetUserPrograms(userID uint, status string) ([]models.UserProgram, error) {
	var userPrograms []models.UserProgram
	query := r.db.
		Preload("Program.Creator").
		Preload("Trainer").
		Where("user_id = ?", userID)

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Order("assigned_at DESC").Find(&userPrograms).Error; err != nil {
		return nil, errors.Wrap(err, "[ProgramRepository.GetUserPrograms]: Error querying database")
	}
	return userPrograms, nil
}

func (r *programRepository) GetActiveUserProgram(userID uint) (*models.UserProgram, error) {
	var userProgram models.UserProgram
	if err := r.db.
		Where("user_id = ? AND status = ?", userID, constant.UserProgramStatusActive).
		First(&userProgram).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, errors.Wrap(err, "[ProgramRepository.GetActiveUserProgram]: Error querying database")
	}
	return &userProgram, nil
}

func (r *programRepository) UpdateUserProgram(userProgram *models.UserProgram) error {
	if err := r.db.Save(userProgram).Error; err != nil {
		return errors.Wrap(err, "[ProgramRepository.UpdateUserProgram]: Error updating user program")
	}
	return nil
}

func (r *programRepository) PauseActivePrograms(userID uint) error {
	if err := r.db.Model(&models.UserProgram{}).
		Where("user_id = ? AND status = ?", userID, constant.UserProgramStatusActive).
		Update("status", constant.UserProgramStatusPaused).Error; err != nil {
		return errors.Wrap(err, "[ProgramRepository.PauseActivePrograms]: Error pausing programs")
	}
	return nil
}

// User management
func (r *programRepository) GetUserByID(id uint) (*models.User, error) {
	var user models.User
	if err := r.db.First(&user, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, errors.Wrap(err, "[ProgramRepository.GetUserByID]: Error querying database")
	}
	return &user, nil
}

// GetScheduledWorkoutsByUserProgramID fetches all scheduled workouts for a user program ordered by date
func (r *programRepository) GetScheduledWorkoutsByUserProgramID(userProgramID uint) ([]models.ScheduledWorkout, error) {
	var workouts []models.ScheduledWorkout
	if err := r.db.
		Select("id, status").
		Where("user_program_id = ?", userProgramID).
		Order("scheduled_date ASC").
		Find(&workouts).Error; err != nil {
		return nil, errors.Wrap(err, "[ProgramRepository.GetScheduledWorkoutsByUserProgramID]: Error querying database")
	}
	return workouts, nil
}

// CancelScheduledWorkouts bulk-cancels all SCHEDULED workouts for a user program
func (r *programRepository) CancelScheduledWorkouts(userProgramID uint) error {
	err := r.db.Model(&models.ScheduledWorkout{}).
		Where("user_program_id = ? AND status = ?", userProgramID, constant.WorkoutStatusScheduled).
		Updates(map[string]interface{}{
			"status":     constant.WorkoutStatusCancelled,
			"updated_at": time.Now(),
		}).Error
	if err != nil {
		return errors.Wrap(err, "[ProgramRepository.CancelScheduledWorkouts]: Error cancelling workouts")
	}
	return nil
}

// SpawnScheduledWorkouts creates calendar instances for all program sessions
func (r *programRepository) SpawnScheduledWorkouts(userProgramID uint, programID uint, startDate string) error {
	// Parse start date (format: YYYY-MM-DD)
	parsedStartDate, err := time.Parse("2006-01-02", startDate)
	if err != nil {
		return errors.Wrap(err, "[ProgramRepository.SpawnScheduledWorkouts]: Invalid start date format")
	}

	// Get program with sessions
	program, err := r.GetProgramWithSessions(programID)
	if err != nil {
		return errors.Wrap(err, "[ProgramRepository.SpawnScheduledWorkouts]: Error fetching program")
	}
	if program == nil {
		return errors.New("program not found")
	}

	// Validate all sessions have day_of_week set
	for _, session := range program.Sessions {
		if session.DayOfWeek == nil {
			return errors.Errorf("[ProgramRepository.SpawnScheduledWorkouts]: Session %d (%s) does not have day_of_week set", session.ID, session.SessionName)
		}
		if *session.DayOfWeek < 1 || *session.DayOfWeek > 7 {
			return errors.Errorf("[ProgramRepository.SpawnScheduledWorkouts]: Session %d has invalid day_of_week: %d", session.ID, *session.DayOfWeek)
		}
	}

	// Start transaction
	tx := r.db.Begin()
	if tx.Error != nil {
		return errors.Wrap(tx.Error, "[ProgramRepository.SpawnScheduledWorkouts]: Error starting transaction")
	}

	// Spawn scheduled workouts for each week
	for week := 1; week <= program.DurationWeeks; week++ {
		// Calculate base date for this week (Monday of week N)
		weekOffset := (week - 1) * 7
		baseDate := parsedStartDate.AddDate(0, 0, weekOffset)

		// Create scheduled workout for each session in this week
		for _, session := range program.Sessions {
			// Calculate scheduled date: base date + (day_of_week - 1)
			// Example: If baseDate is Monday and day_of_week=3 (Wednesday), add 2 days
			dayOffset := *session.DayOfWeek - 1
			scheduledDate := baseDate.AddDate(0, 0, dayOffset)

			scheduledWorkout := models.ScheduledWorkout{
				UserProgramID:    userProgramID,
				ProgramSessionID: session.ID,
				ScheduledDate:    scheduledDate,
				WeekNumber:       week,
				Status:           constant.WorkoutStatusScheduled,
				SessionName:      session.SessionName,  // Snapshot from template
				WorkoutSplit:     session.WorkoutSplit, // Snapshot from template
			}

			if err := tx.Create(&scheduledWorkout).Error; err != nil {
				tx.Rollback()
				return errors.Wrap(err, "[ProgramRepository.SpawnScheduledWorkouts]: Error creating scheduled workout")
			}

			// Embed exercise prescriptions (snapshot from template session)
			for _, exercise := range session.Exercises {
				swe := models.ScheduledWorkoutExercise{
					ScheduledWorkoutID: scheduledWorkout.ID,
					ExerciseID:         exercise.ExerciseID,
					Sets:               exercise.Sets,
					Reps:               exercise.Reps,
					Weight:             exercise.Weight,
					RestSeconds:        exercise.RestSeconds,
					OrderSequence:      exercise.OrderSequence,
				}
				if err := tx.Create(&swe).Error; err != nil {
					tx.Rollback()
					return errors.Wrap(err, "[ProgramRepository.SpawnScheduledWorkouts]: Error creating scheduled workout exercise")
				}
			}
		}
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return errors.Wrap(err, "[ProgramRepository.SpawnScheduledWorkouts]: Error committing transaction")
	}

	return nil
}
