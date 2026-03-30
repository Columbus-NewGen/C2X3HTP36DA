package usecase

import (
	"time"

	"github.com/gymmate/backend/constant"
	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/models"
	"github.com/gymmate/backend/request"
	"github.com/gymmate/backend/response"
	"github.com/pkg/errors"
	logger "github.com/sirupsen/logrus"
)

type workoutUsecase struct {
	workoutRepo         domain.WorkoutRepository
	gamificationUsecase domain.GamificationUsecase
}

func NewWorkoutUsecase(workoutRepo domain.WorkoutRepository, gamificationUsecase domain.GamificationUsecase) domain.WorkoutUsecase {
	return &workoutUsecase{
		workoutRepo:         workoutRepo,
		gamificationUsecase: gamificationUsecase,
	}
}

// GetScheduledWorkouts retrieves scheduled workouts for a user in date range
func (u *workoutUsecase) GetScheduledWorkouts(userID uint, startDate, endDate time.Time, programStatus *string) ([]response.ScheduledWorkoutResponse, error) {
	workouts, err := u.workoutRepo.GetScheduledWorkoutsByUserID(userID, startDate, endDate, programStatus)
	if err != nil {
		return nil, errors.Wrap(err, "[WorkoutUsecase.GetScheduledWorkouts]: Error fetching workouts")
	}

	responses := make([]response.ScheduledWorkoutResponse, len(workouts))
	for i, workout := range workouts {
		responses[i] = *u.mapScheduledWorkoutToResponse(&workout)
	}

	return responses, nil
}

// GetScheduledWorkoutByID retrieves a specific scheduled workout
func (u *workoutUsecase) GetScheduledWorkoutByID(id uint) (*response.ScheduledWorkoutResponse, error) {
	workout, err := u.workoutRepo.GetScheduledWorkoutByID(id)
	if err != nil {
		return nil, errors.Wrap(err, "[WorkoutUsecase.GetScheduledWorkoutByID]: Error fetching workout")
	}
	if workout == nil {
		return nil, errors.New("scheduled workout not found")
	}

	return u.mapScheduledWorkoutToResponse(workout), nil
}

// GetCalendarView groups scheduled workouts by date for calendar display
func (u *workoutUsecase) GetCalendarView(userID uint, startDate, endDate time.Time, programStatus *string) ([]response.CalendarWorkoutResponse, error) {
	workouts, err := u.workoutRepo.GetScheduledWorkoutsByUserID(userID, startDate, endDate, programStatus)
	if err != nil {
		return nil, errors.Wrap(err, "[WorkoutUsecase.GetCalendarView]: Error fetching workouts")
	}

	// Group by date
	dateMap := make(map[string][]response.ScheduledWorkoutResponse)
	for _, workout := range workouts {
		dateStr := workout.ScheduledDate.Format("2006-01-02")
		workoutResponse := u.mapScheduledWorkoutToResponse(&workout)
		dateMap[dateStr] = append(dateMap[dateStr], *workoutResponse)
	}

	// Convert to response array
	var responses []response.CalendarWorkoutResponse
	for dateStr, dayWorkouts := range dateMap {
		date, _ := time.Parse("2006-01-02", dateStr)
		responses = append(responses, response.CalendarWorkoutResponse{
			Date:     date,
			Workouts: dayWorkouts,
		})
	}

	return responses, nil
}

// UpdateScheduledWorkoutStatus updates the status of a scheduled workout.
// When DurationMinutes is provided, it is written to the linked workout log (used for progressive log finalization).
func (u *workoutUsecase) UpdateScheduledWorkoutStatus(id uint, req *request.UpdateScheduledWorkoutStatusRequest) (*response.ScheduledWorkoutResponse, error) {
	// Fetch workout to verify it exists
	workout, err := u.workoutRepo.GetScheduledWorkoutByID(id)
	if err != nil {
		return nil, errors.Wrap(err, "[WorkoutUsecase.UpdateScheduledWorkoutStatus]: Error fetching workout")
	}
	if workout == nil {
		return nil, errors.New("scheduled workout not found")
	}

	// MISSED is terminal — prevent any further updates
	if workout.Status == constant.WorkoutStatusMissed {
		return nil, errors.New("cannot update a MISSED scheduled workout")
	}

	// Determine completed_at timestamp
	var completedAt *time.Time
	if req.Status == constant.WorkoutStatusCompleted {
		now := time.Now()
		completedAt = &now
	}

	// Update status
	err = u.workoutRepo.UpdateScheduledWorkoutStatus(id, req.Status, req.Notes, completedAt)
	if err != nil {
		return nil, errors.Wrap(err, "[WorkoutUsecase.UpdateScheduledWorkoutStatus]: Error updating status")
	}

	// If duration provided and there is a linked workout log, update its duration
	if req.DurationMinutes != nil && workout.WorkoutLogID != nil {
		if err := u.workoutRepo.UpdateWorkoutLogDuration(*workout.WorkoutLogID, *req.DurationMinutes); err != nil {
			return nil, errors.Wrap(err, "[WorkoutUsecase.UpdateScheduledWorkoutStatus]: Error updating workout log duration")
		}
	}

	// Fetch updated workout
	updatedWorkout, err := u.workoutRepo.GetScheduledWorkoutByID(id)
	if err != nil {
		return nil, errors.Wrap(err, "[WorkoutUsecase.UpdateScheduledWorkoutStatus]: Error fetching updated workout")
	}

	return u.mapScheduledWorkoutToResponse(updatedWorkout), nil
}

// MarkMissedWorkouts marks past scheduled workouts as MISSED and fires auto-close checks.
func (u *workoutUsecase) MarkMissedWorkouts() error {
	today := time.Now().Truncate(24 * time.Hour)
	affectedIDs, err := u.workoutRepo.MarkPastWorkoutsAsMissed(today)
	if err != nil {
		return errors.Wrap(err, "[WorkoutUsecase.MarkMissedWorkouts]: Error marking workouts")
	}
	for _, pid := range affectedIDs {
		p := pid
		go u.checkAndAutoCompleteProgram(p)
	}
	return nil
}

// RunAutoCompleteProgram exposes checkAndAutoCompleteProgram synchronously for admin/internal use.
func (u *workoutUsecase) RunAutoCompleteProgram(userProgramID uint) error {
	u.checkAndAutoCompleteProgram(userProgramID)
	return nil
}

// ResetStaleStreaks resets current_streak to 0 for users who missed yesterday.
func (u *workoutUsecase) ResetStaleStreaks() error {
	yesterday := time.Now().Truncate(24*time.Hour).AddDate(0, 0, -1)
	_, err := u.gamificationUsecase.ResetStaleStreaks(yesterday)
	return errors.Wrap(err, "[WorkoutUsecase.ResetStaleStreaks]")
}

// checkAndAutoCompleteProgram checks if a user program is fully done and auto-closes it.
// Best-effort — intended to be called in a goroutine; errors are silently dropped.
func (u *workoutUsecase) checkAndAutoCompleteProgram(userProgramID uint) {
	stats, err := u.workoutRepo.GetProgramCompletionStats(userProgramID)
	if err != nil || stats == nil || stats.Remaining > 0 || stats.Total == 0 {
		return
	}

	denominator := stats.Total - stats.Cancelled
	if denominator <= 0 {
		return // all cancelled — skip
	}

	rate := float64(stats.Completed) / float64(denominator)
	now := time.Now()

	if rate >= constant.ProgramCompletionThreshold {
		_ = u.workoutRepo.AutoCompleteUserProgram(userProgramID, constant.UserProgramStatusCompleted, now)
		uid := stats.UserID
		go func() { _ = u.gamificationUsecase.ProcessProgramCompleted(uid, userProgramID) }()
	} else {
		_ = u.workoutRepo.AutoCompleteUserProgram(userProgramID, constant.UserProgramStatusMissed, now)
	}
}

// LogWorkout creates a workout log with exercises
func (u *workoutUsecase) LogWorkout(userID uint, req *request.LogWorkoutRequest) (*response.WorkoutLogResponse, error) {
	// Parse workout date
	workoutDate, err := time.Parse("2006-01-02", req.WorkoutDate)
	if err != nil {
		return nil, errors.Wrap(err, "[WorkoutUsecase.LogWorkout]: Invalid workout_date format")
	}

	// Validate exercises exist and validate slot links
	for _, ex := range req.Exercises {
		exercise, err := u.workoutRepo.GetExerciseByID(ex.ExerciseID)
		if err != nil {
			return nil, errors.Wrapf(err, "[WorkoutUsecase.LogWorkout]: Error validating exercise %d", ex.ExerciseID)
		}
		if exercise == nil {
			return nil, errors.Errorf("[WorkoutUsecase.LogWorkout]: Exercise %d not found", ex.ExerciseID)
		}

		// Validate slot link if provided
		if ex.ScheduledWorkoutExerciseID != nil {
			if req.ScheduledWorkoutID == nil {
				return nil, errors.New("scheduled_workout_exercise_id requires scheduled_workout_id to be set")
			}
			swe, err := u.workoutRepo.GetScheduledWorkoutExerciseByID(*ex.ScheduledWorkoutExerciseID)
			if err != nil {
				return nil, errors.Wrapf(err, "[WorkoutUsecase.LogWorkout]: Error validating slot %d", *ex.ScheduledWorkoutExerciseID)
			}
			if swe == nil {
				return nil, errors.Errorf("scheduled workout exercise %d not found", *ex.ScheduledWorkoutExerciseID)
			}
			if swe.ScheduledWorkoutID != *req.ScheduledWorkoutID {
				return nil, errors.Errorf("scheduled workout exercise %d does not belong to scheduled workout %d", *ex.ScheduledWorkoutExerciseID, *req.ScheduledWorkoutID)
			}
		}
	}

	// If scheduled_workout_id provided, validate it and check for duplicates.
	// scheduledWorkout is hoisted so it remains accessible in the post-create block below.
	var scheduledWorkout *models.ScheduledWorkout
	if req.ScheduledWorkoutID != nil {
		scheduledWorkout, err = u.workoutRepo.GetScheduledWorkoutByID(*req.ScheduledWorkoutID)
		if err != nil {
			return nil, errors.Wrap(err, "[WorkoutUsecase.LogWorkout]: Error fetching scheduled workout")
		}
		if scheduledWorkout == nil {
			return nil, errors.New("scheduled workout not found")
		}

		// Check if already logged
		if scheduledWorkout.WorkoutLogID != nil {
			return nil, errors.New("workout already logged for this scheduled session")
		}

		// Use session_id from scheduled workout if not provided
		if req.SessionID == nil {
			req.SessionID = &scheduledWorkout.ProgramSessionID
		}

		// Auto-link: for exercises without explicit slot link, match by exercise_id
		u.autoLinkSlots(req)
	}

	// Create workout log
	workoutLog := &models.WorkoutLog{
		UserID:             userID,
		SessionID:          req.SessionID,
		ScheduledWorkoutID: req.ScheduledWorkoutID,
		WorkoutDate:        workoutDate,
		DurationMinutes:    req.DurationMinutes,
		Notes:              req.Notes,
	}

	if err := u.workoutRepo.CreateWorkoutLog(workoutLog); err != nil {
		return nil, errors.Wrap(err, "[WorkoutUsecase.LogWorkout]: Error creating workout log")
	}

	// Create log exercises (if any provided)
	if len(req.Exercises) > 0 {
		logExercises := make([]models.LogExercise, len(req.Exercises))
		for i, ex := range req.Exercises {
			logExercises[i] = models.LogExercise{
				LogID:                      workoutLog.ID,
				ExerciseID:                 ex.ExerciseID,
				ScheduledWorkoutExerciseID: ex.ScheduledWorkoutExerciseID,
				SetsCompleted:              ex.SetsCompleted,
				RepsCompleted:              ex.RepsCompleted,
				WeightUsed:                 ex.WeightUsed,
				RPERating:                  ex.RPERating,
				Notes:                      ex.Notes,
			}
		}

		if err := u.workoutRepo.CreateLogExercises(logExercises); err != nil {
			return nil, errors.Wrap(err, "[WorkoutUsecase.LogWorkout]: Error creating log exercises")
		}
	}

	// If this is for a scheduled workout, link the log and check auto-complete
	if req.ScheduledWorkoutID != nil {
		if err := u.workoutRepo.UpdateScheduledWorkoutLog(*req.ScheduledWorkoutID, workoutLog.ID); err != nil {
			return nil, errors.Wrap(err, "[WorkoutUsecase.LogWorkout]: Error updating scheduled workout")
		}

		// Auto-complete: check if all prescribed slots are now filled
		u.checkAndAutoComplete(*req.ScheduledWorkoutID, req.Exercises)

		// Auto-close program if all workouts in the program are now terminal
		if scheduledWorkout != nil {
			go u.checkAndAutoCompleteProgram(scheduledWorkout.UserProgramID)
		}
	}

	// Fetch the complete workout log with relationships
	completeLog, err := u.workoutRepo.GetWorkoutLogByID(workoutLog.ID)
	if err != nil {
		return nil, errors.Wrap(err, "[WorkoutUsecase.LogWorkout]: Error fetching created log")
	}

	// Award XP — best-effort, must not block or fail the log operation
	if u.gamificationUsecase != nil {
		go func(uid, logID uint, date time.Time) {
			if err := u.gamificationUsecase.ProcessWorkoutCompleted(uid, logID, date); err != nil {
				logger.Warnf("[WorkoutUsecase.LogWorkout]: gamification processing failed for user %d: %v", uid, err)
			}
		}(userID, workoutLog.ID, workoutDate)
	}

	return u.mapWorkoutLogToResponse(completeLog), nil
}

// GetWorkoutLogs retrieves workout logs for a user with optional date filtering
func (u *workoutUsecase) GetWorkoutLogs(userID uint, startDate, endDate *time.Time) ([]response.WorkoutLogResponse, error) {
	logs, err := u.workoutRepo.GetWorkoutLogsByUserID(userID, startDate, endDate)
	if err != nil {
		return nil, errors.Wrap(err, "[WorkoutUsecase.GetWorkoutLogs]: Error fetching logs")
	}

	responses := make([]response.WorkoutLogResponse, len(logs))
	for i, log := range logs {
		responses[i] = *u.mapWorkoutLogToResponse(&log)
	}

	return responses, nil
}

// GetWorkoutLogByID retrieves a specific workout log
func (u *workoutUsecase) GetWorkoutLogByID(id uint) (*response.WorkoutLogResponse, error) {
	log, err := u.workoutRepo.GetWorkoutLogByID(id)
	if err != nil {
		return nil, errors.Wrap(err, "[WorkoutUsecase.GetWorkoutLogByID]: Error fetching log")
	}
	if log == nil {
		return nil, errors.New("workout log not found")
	}

	return u.mapWorkoutLogToResponse(log), nil
}

// AddLogExercise adds a single exercise to an existing workout log
func (u *workoutUsecase) AddLogExercise(logID uint, userID uint, req *request.AddLogExerciseRequest) (*response.LogExerciseDetail, error) {
	// Get workout log and verify it exists
	workoutLog, err := u.workoutRepo.GetWorkoutLogByID(logID)
	if err != nil {
		return nil, errors.Wrap(err, "[WorkoutUsecase.AddLogExercise]: Error fetching workout log")
	}
	if workoutLog == nil {
		return nil, errors.New("workout log not found")
	}

	// Verify ownership
	if workoutLog.UserID != userID {
		return nil, errors.New("workout log does not belong to this user")
	}

	// Validate exercise exists
	exercise, err := u.workoutRepo.GetExerciseByID(req.ExerciseID)
	if err != nil {
		return nil, errors.Wrapf(err, "[WorkoutUsecase.AddLogExercise]: Error validating exercise %d", req.ExerciseID)
	}
	if exercise == nil {
		return nil, errors.Errorf("exercise %d not found", req.ExerciseID)
	}

	// Validate slot link if provided
	if req.ScheduledWorkoutExerciseID != nil {
		if workoutLog.ScheduledWorkoutID == nil {
			return nil, errors.New("scheduled_workout_exercise_id requires the log to be linked to a scheduled workout")
		}
		swe, err := u.workoutRepo.GetScheduledWorkoutExerciseByID(*req.ScheduledWorkoutExerciseID)
		if err != nil {
			return nil, errors.Wrapf(err, "[WorkoutUsecase.AddLogExercise]: Error validating slot %d", *req.ScheduledWorkoutExerciseID)
		}
		if swe == nil {
			return nil, errors.Errorf("scheduled workout exercise %d not found", *req.ScheduledWorkoutExerciseID)
		}
		if swe.ScheduledWorkoutID != *workoutLog.ScheduledWorkoutID {
			return nil, errors.Errorf("scheduled workout exercise %d does not belong to scheduled workout %d", *req.ScheduledWorkoutExerciseID, *workoutLog.ScheduledWorkoutID)
		}
	}

	// Create log exercise
	logExercise := &models.LogExercise{
		LogID:                      logID,
		ExerciseID:                 req.ExerciseID,
		ScheduledWorkoutExerciseID: req.ScheduledWorkoutExerciseID,
		SetsCompleted:              req.SetsCompleted,
		RepsCompleted:              req.RepsCompleted,
		WeightUsed:                 req.WeightUsed,
		RPERating:                  req.RPERating,
		Notes:                      req.Notes,
	}

	if err := u.workoutRepo.CreateLogExercise(logExercise); err != nil {
		return nil, errors.Wrap(err, "[WorkoutUsecase.AddLogExercise]: Error creating log exercise")
	}

	// Auto-complete check
	if workoutLog.ScheduledWorkoutID != nil {
		u.checkAndAutoCompleteFromDB(*workoutLog.ScheduledWorkoutID, logID)
	}

	// Fetch the created exercise with relationships
	created, err := u.workoutRepo.GetLogExerciseByID(logExercise.ID)
	if err != nil {
		return nil, errors.Wrap(err, "[WorkoutUsecase.AddLogExercise]: Error fetching created exercise")
	}

	return u.mapLogExerciseToDetail(created), nil
}

// UpdateLogExercise updates a single exercise in an existing workout log
func (u *workoutUsecase) UpdateLogExercise(logID, exerciseLogID, userID uint, req *request.UpdateLogExerciseRequest) (*response.LogExerciseDetail, error) {
	// Get workout log and verify it exists + ownership
	workoutLog, err := u.workoutRepo.GetWorkoutLogByID(logID)
	if err != nil {
		return nil, errors.Wrap(err, "[WorkoutUsecase.UpdateLogExercise]: Error fetching workout log")
	}
	if workoutLog == nil {
		return nil, errors.New("workout log not found")
	}
	if workoutLog.UserID != userID {
		return nil, errors.New("workout log does not belong to this user")
	}

	// Get log exercise and verify it belongs to this log
	logExercise, err := u.workoutRepo.GetLogExerciseByID(exerciseLogID)
	if err != nil {
		return nil, errors.Wrap(err, "[WorkoutUsecase.UpdateLogExercise]: Error fetching log exercise")
	}
	if logExercise == nil {
		return nil, errors.New("log exercise not found")
	}
	if logExercise.LogID != logID {
		return nil, errors.New("log exercise does not belong to this workout log")
	}

	// Validate new exercise_id if provided
	if req.ExerciseID != nil {
		exercise, err := u.workoutRepo.GetExerciseByID(*req.ExerciseID)
		if err != nil {
			return nil, errors.Wrapf(err, "[WorkoutUsecase.UpdateLogExercise]: Error validating exercise %d", *req.ExerciseID)
		}
		if exercise == nil {
			return nil, errors.Errorf("exercise %d not found", *req.ExerciseID)
		}
		logExercise.ExerciseID = *req.ExerciseID
	}

	// Validate new slot if provided
	if req.ScheduledWorkoutExerciseID != nil {
		if workoutLog.ScheduledWorkoutID == nil {
			return nil, errors.New("scheduled_workout_exercise_id requires the log to be linked to a scheduled workout")
		}
		swe, err := u.workoutRepo.GetScheduledWorkoutExerciseByID(*req.ScheduledWorkoutExerciseID)
		if err != nil {
			return nil, errors.Wrapf(err, "[WorkoutUsecase.UpdateLogExercise]: Error validating slot %d", *req.ScheduledWorkoutExerciseID)
		}
		if swe == nil {
			return nil, errors.Errorf("scheduled workout exercise %d not found", *req.ScheduledWorkoutExerciseID)
		}
		if swe.ScheduledWorkoutID != *workoutLog.ScheduledWorkoutID {
			return nil, errors.Errorf("scheduled workout exercise %d does not belong to scheduled workout %d", *req.ScheduledWorkoutExerciseID, *workoutLog.ScheduledWorkoutID)
		}
		logExercise.ScheduledWorkoutExerciseID = req.ScheduledWorkoutExerciseID
	}

	// Merge non-nil fields
	if req.SetsCompleted != nil {
		logExercise.SetsCompleted = *req.SetsCompleted
	}
	if req.RepsCompleted != nil {
		logExercise.RepsCompleted = *req.RepsCompleted
	}
	if req.WeightUsed != nil {
		logExercise.WeightUsed = req.WeightUsed
	}
	if req.RPERating != nil {
		logExercise.RPERating = req.RPERating
	}
	if req.Notes != nil {
		logExercise.Notes = *req.Notes
	}

	if err := u.workoutRepo.UpdateLogExercise(logExercise); err != nil {
		return nil, errors.Wrap(err, "[WorkoutUsecase.UpdateLogExercise]: Error updating log exercise")
	}

	// Re-check auto-complete (slot may have changed)
	if workoutLog.ScheduledWorkoutID != nil {
		u.checkAndAutoCompleteFromDB(*workoutLog.ScheduledWorkoutID, logID)
	}

	// Fetch updated with relationships
	updated, err := u.workoutRepo.GetLogExerciseByID(exerciseLogID)
	if err != nil {
		return nil, errors.Wrap(err, "[WorkoutUsecase.UpdateLogExercise]: Error fetching updated exercise")
	}

	return u.mapLogExerciseToDetail(updated), nil
}

// DeleteLogExercise removes a single exercise from a workout log
func (u *workoutUsecase) DeleteLogExercise(logID, exerciseLogID, userID uint) error {
	// Get workout log and verify it exists + ownership
	workoutLog, err := u.workoutRepo.GetWorkoutLogByID(logID)
	if err != nil {
		return errors.Wrap(err, "[WorkoutUsecase.DeleteLogExercise]: Error fetching workout log")
	}
	if workoutLog == nil {
		return errors.New("workout log not found")
	}
	if workoutLog.UserID != userID {
		return errors.New("workout log does not belong to this user")
	}

	// Get log exercise and verify it belongs to this log
	logExercise, err := u.workoutRepo.GetLogExerciseByID(exerciseLogID)
	if err != nil {
		return errors.Wrap(err, "[WorkoutUsecase.DeleteLogExercise]: Error fetching log exercise")
	}
	if logExercise == nil {
		return errors.New("log exercise not found")
	}
	if logExercise.LogID != logID {
		return errors.New("log exercise does not belong to this workout log")
	}

	if err := u.workoutRepo.DeleteLogExercise(exerciseLogID); err != nil {
		return errors.Wrap(err, "[WorkoutUsecase.DeleteLogExercise]: Error deleting log exercise")
	}

	return nil
}

// AddScheduledWorkoutExercise adds a prescribed exercise to a scheduled workout instance
func (u *workoutUsecase) AddScheduledWorkoutExercise(userID, scheduledWorkoutID uint, req *request.AddScheduledWorkoutExerciseRequest) (*response.SessionExerciseDetail, error) {
	workout, err := u.workoutRepo.GetScheduledWorkoutByID(scheduledWorkoutID)
	if err != nil {
		return nil, errors.Wrap(err, "[WorkoutUsecase.AddScheduledWorkoutExercise]: Error fetching scheduled workout")
	}
	if workout == nil {
		return nil, errors.New("scheduled workout not found")
	}

	if workout.Status != constant.WorkoutStatusScheduled && workout.Status != constant.WorkoutStatusInProgress {
		return nil, errors.Errorf("cannot modify exercises on a workout with status %s", workout.Status)
	}

	if workout.UserProgram.UserID != userID {
		return nil, errors.New("scheduled workout does not belong to this user")
	}

	exercise, err := u.workoutRepo.GetExerciseByID(req.ExerciseID)
	if err != nil {
		return nil, errors.Wrapf(err, "[WorkoutUsecase.AddScheduledWorkoutExercise]: Error validating exercise %d", req.ExerciseID)
	}
	if exercise == nil {
		return nil, errors.Errorf("exercise %d not found", req.ExerciseID)
	}

	orderSeq := req.OrderSequence
	if orderSeq == 0 {
		count, err := u.workoutRepo.CountScheduledWorkoutExercises(scheduledWorkoutID)
		if err == nil {
			orderSeq = count + 1
		} else {
			orderSeq = 1
		}
	}

	swe := &models.ScheduledWorkoutExercise{
		ScheduledWorkoutID: scheduledWorkoutID,
		ExerciseID:         req.ExerciseID,
		Sets:               req.Sets,
		Reps:               req.Reps,
		Weight:             req.Weight,
		RestSeconds:        req.RestSeconds,
		OrderSequence:      orderSeq,
	}

	if err := u.workoutRepo.CreateScheduledWorkoutExercise(swe); err != nil {
		return nil, errors.Wrap(err, "[WorkoutUsecase.AddScheduledWorkoutExercise]: Error creating exercise")
	}

	return &response.SessionExerciseDetail{
		ID:            swe.ID,
		ExerciseID:    swe.ExerciseID,
		ExerciseName:  exercise.ExerciseName,
		Sets:          swe.Sets,
		Reps:          swe.Reps,
		Weight:        swe.Weight,
		RestSeconds:   swe.RestSeconds,
		OrderSequence: swe.OrderSequence,
	}, nil
}

// UpdateScheduledWorkoutExercise partially updates a prescribed exercise on a scheduled workout
func (u *workoutUsecase) UpdateScheduledWorkoutExercise(userID, scheduledWorkoutID, exerciseID uint, req *request.UpdateScheduledWorkoutExerciseRequest) (*response.SessionExerciseDetail, error) {
	swe, err := u.workoutRepo.GetScheduledWorkoutExerciseByID(exerciseID)
	if err != nil {
		return nil, errors.Wrap(err, "[WorkoutUsecase.UpdateScheduledWorkoutExercise]: Error fetching exercise")
	}
	if swe == nil {
		return nil, errors.New("scheduled workout exercise not found")
	}
	if swe.ScheduledWorkoutID != scheduledWorkoutID {
		return nil, errors.New("scheduled workout exercise does not belong to this scheduled workout")
	}

	workout, err := u.workoutRepo.GetScheduledWorkoutByID(scheduledWorkoutID)
	if err != nil {
		return nil, errors.Wrap(err, "[WorkoutUsecase.UpdateScheduledWorkoutExercise]: Error fetching scheduled workout")
	}
	if workout == nil {
		return nil, errors.New("scheduled workout not found")
	}
	if workout.Status != constant.WorkoutStatusScheduled && workout.Status != constant.WorkoutStatusInProgress {
		return nil, errors.Errorf("cannot modify exercises on a workout with status %s", workout.Status)
	}
	if workout.UserProgram.UserID != userID {
		return nil, errors.New("scheduled workout does not belong to this user")
	}

	exerciseName := ""
	if req.ExerciseID != nil {
		ex, err := u.workoutRepo.GetExerciseByID(*req.ExerciseID)
		if err != nil {
			return nil, errors.Wrapf(err, "[WorkoutUsecase.UpdateScheduledWorkoutExercise]: Error validating exercise %d", *req.ExerciseID)
		}
		if ex == nil {
			return nil, errors.Errorf("exercise %d not found", *req.ExerciseID)
		}
		swe.ExerciseID = *req.ExerciseID
		exerciseName = ex.ExerciseName
	} else {
		ex, err := u.workoutRepo.GetExerciseByID(swe.ExerciseID)
		if err == nil && ex != nil {
			exerciseName = ex.ExerciseName
		}
	}

	if req.Sets != nil {
		swe.Sets = *req.Sets
	}
	if req.Reps != nil {
		swe.Reps = *req.Reps
	}
	if req.Weight != nil {
		swe.Weight = req.Weight
	}
	if req.RestSeconds != nil {
		swe.RestSeconds = *req.RestSeconds
	}
	if req.OrderSequence != nil {
		swe.OrderSequence = *req.OrderSequence
	}

	if err := u.workoutRepo.UpdateScheduledWorkoutExercise(swe); err != nil {
		return nil, errors.Wrap(err, "[WorkoutUsecase.UpdateScheduledWorkoutExercise]: Error updating exercise")
	}

	return &response.SessionExerciseDetail{
		ID:            swe.ID,
		ExerciseID:    swe.ExerciseID,
		ExerciseName:  exerciseName,
		Sets:          swe.Sets,
		Reps:          swe.Reps,
		Weight:        swe.Weight,
		RestSeconds:   swe.RestSeconds,
		OrderSequence: swe.OrderSequence,
	}, nil
}

// DeleteScheduledWorkoutExercise removes a prescribed exercise from a scheduled workout
func (u *workoutUsecase) DeleteScheduledWorkoutExercise(userID, scheduledWorkoutID, exerciseID uint) error {
	swe, err := u.workoutRepo.GetScheduledWorkoutExerciseByID(exerciseID)
	if err != nil {
		return errors.Wrap(err, "[WorkoutUsecase.DeleteScheduledWorkoutExercise]: Error fetching exercise")
	}
	if swe == nil {
		return errors.New("scheduled workout exercise not found")
	}
	if swe.ScheduledWorkoutID != scheduledWorkoutID {
		return errors.New("scheduled workout exercise does not belong to this scheduled workout")
	}

	workout, err := u.workoutRepo.GetScheduledWorkoutByID(scheduledWorkoutID)
	if err != nil {
		return errors.Wrap(err, "[WorkoutUsecase.DeleteScheduledWorkoutExercise]: Error fetching scheduled workout")
	}
	if workout == nil {
		return errors.New("scheduled workout not found")
	}
	if workout.Status != constant.WorkoutStatusScheduled && workout.Status != constant.WorkoutStatusInProgress {
		return errors.Errorf("cannot modify exercises on a workout with status %s", workout.Status)
	}
	if workout.UserProgram.UserID != userID {
		return errors.New("scheduled workout does not belong to this user")
	}

	if err := u.workoutRepo.DeleteScheduledWorkoutExercise(exerciseID); err != nil {
		return errors.Wrap(err, "[WorkoutUsecase.DeleteScheduledWorkoutExercise]: Error deleting exercise")
	}

	return nil
}

// mapLogExerciseToDetail maps a single LogExercise model to response
func (u *workoutUsecase) mapLogExerciseToDetail(ex *models.LogExercise) *response.LogExerciseDetail {
	exerciseName := ""
	if ex.Exercise.ID != 0 {
		exerciseName = ex.Exercise.ExerciseName
	}

	return &response.LogExerciseDetail{
		ID:                         ex.ID,
		ExerciseID:                 ex.ExerciseID,
		ExerciseName:               exerciseName,
		ScheduledWorkoutExerciseID: ex.ScheduledWorkoutExerciseID,
		SetsCompleted:              ex.SetsCompleted,
		RepsCompleted:              ex.RepsCompleted,
		WeightUsed:                 ex.WeightUsed,
		RPERating:                  ex.RPERating,
		Notes:                      ex.Notes,
	}
}

// checkAndAutoCompleteFromDB checks filled slots from DB state (for progressive exercise adding)
func (u *workoutUsecase) checkAndAutoCompleteFromDB(scheduledWorkoutID uint, logID uint) {
	totalPrescribed, err := u.workoutRepo.CountScheduledWorkoutExercises(scheduledWorkoutID)
	if err != nil || totalPrescribed == 0 {
		return
	}

	filledSlots, err := u.workoutRepo.CountFilledSlots(logID)
	if err != nil {
		return
	}

	if filledSlots >= totalPrescribed {
		now := time.Now()
		_ = u.workoutRepo.UpdateScheduledWorkoutStatus(scheduledWorkoutID, constant.WorkoutStatusCompleted, "", &now)
	}
}

// Helper: Map ScheduledWorkout model to response
func (u *workoutUsecase) mapScheduledWorkoutToResponse(workout *models.ScheduledWorkout) *response.ScheduledWorkoutResponse {
	resp := &response.ScheduledWorkoutResponse{
		ID:            workout.ID,
		UserProgramID: workout.UserProgramID,
		ProgramName:   workout.UserProgram.ProgramName,
		ScheduledDate: workout.ScheduledDate,
		WeekNumber:    workout.WeekNumber,
		Status:        workout.Status,
		CompletedAt:   workout.CompletedAt,
		Notes:         workout.Notes,
		CreatedAt:     workout.CreatedAt,
		UpdatedAt:     workout.UpdatedAt,
	}

	// Map session — prefer snapshot fields, fallback to ProgramSession for old data
	if workout.SessionName != "" || workout.ProgramSession.ID != 0 {
		sessionName := workout.SessionName
		if sessionName == "" {
			sessionName = workout.ProgramSession.SessionName
		}
		workoutSplit := workout.WorkoutSplit
		if workoutSplit == "" {
			workoutSplit = workout.ProgramSession.WorkoutSplit
		}

		// Prefer exercises from snapshot, fallback to session exercises for old data
		var exercises []response.SessionExerciseDetail
		if len(workout.ScheduledWorkoutExercises) > 0 {
			exercises = u.mapScheduledWorkoutExercises(workout.ScheduledWorkoutExercises)
		} else {
			exercises = u.mapSessionExercises(workout.ProgramSession.SessionExercises)
		}

		resp.Session = &response.PlanSessionResponse{
			ID:           workout.ProgramSession.ID,
			SessionName:  sessionName,
			WorkoutSplit: workoutSplit,
			DayNumber:    workout.ProgramSession.DayNumber,
			DayOfWeek:    workout.ProgramSession.DayOfWeek,
			Notes:        workout.ProgramSession.Notes,
			Exercises:    exercises,
		}
	}

	// Map workout log if completed
	if workout.WorkoutLog != nil && workout.WorkoutLog.ID != 0 {
		resp.WorkoutLog = u.mapWorkoutLogToResponse(workout.WorkoutLog)
	}

	return resp
}

// mapExerciseEquipment maps ExerciseEquipment models to response DTOs including instances
func (u *workoutUsecase) mapExerciseEquipment(equipments []models.ExerciseEquipment) []response.ExerciseEquipmentResponse {
	result := make([]response.ExerciseEquipmentResponse, len(equipments))
	for i, ee := range equipments {
		instances := make([]response.EquipmentInstanceBriefResponse, len(ee.Equipment.EquipmentInstances))
		for j, inst := range ee.Equipment.EquipmentInstances {
			instances[j] = response.EquipmentInstanceBriefResponse{
				ID:          inst.ID,
				FloorplanID: inst.FloorplanID,
				Label:       inst.Label,
				Status:      inst.Status,
				PositionX:   inst.PositionX,
				PositionY:   inst.PositionY,
				Rotation:    inst.Rotation,
				Width:       inst.Width,
				Height:      inst.Height,
			}
		}
		result[i] = response.ExerciseEquipmentResponse{
			ID:                 ee.Equipment.ID,
			EquipmentName:      ee.Equipment.EquipmentName,
			EquipmentType:      ee.Equipment.EquipmentType,
			Description:        ee.Equipment.Description,
			ImageURL:           ee.Equipment.ImageURL,
			ImageFullURL:       response.BuildImageURL(ee.Equipment.ImageURL),
			IsRequired:         ee.IsRequired,
			EquipmentInstances: instances,
		}
	}
	return result
}

// Helper: Map ScheduledWorkoutExercises to response (snapshot exercises)
func (u *workoutUsecase) mapScheduledWorkoutExercises(exercises []models.ScheduledWorkoutExercise) []response.SessionExerciseDetail {
	result := make([]response.SessionExerciseDetail, len(exercises))
	for i, ex := range exercises {
		exerciseName := ""
		if ex.Exercise.ID != 0 {
			exerciseName = ex.Exercise.ExerciseName
		}

		result[i] = response.SessionExerciseDetail{
			ID:            ex.ID,
			ExerciseID:    ex.ExerciseID,
			ExerciseName:  exerciseName,
			ImageURL:      ex.Exercise.ImageURL,
			ImageFullURL:  response.BuildImageURL(ex.Exercise.ImageURL),
			Sets:          ex.Sets,
			Reps:          ex.Reps,
			Weight:        ex.Weight,
			RestSeconds:   ex.RestSeconds,
			OrderSequence: ex.OrderSequence,
			Equipment:     u.mapExerciseEquipment(ex.Exercise.ExerciseEquipments),
		}
	}
	return result
}

// Helper: Map WorkoutLog model to response
func (u *workoutUsecase) mapWorkoutLogToResponse(log *models.WorkoutLog) *response.WorkoutLogResponse {
	resp := &response.WorkoutLogResponse{
		ID:                 log.ID,
		UserID:             log.UserID,
		ScheduledWorkoutID: log.ScheduledWorkoutID,
		WorkoutDate:        log.WorkoutDate,
		DurationMinutes:    log.DurationMinutes,
		Notes:              log.Notes,
		CreatedAt:          log.CreatedAt,
		UpdatedAt:          log.UpdatedAt,
	}

	// Map session if present
	if log.ProgramSession != nil && log.ProgramSession.ID != 0 {
		resp.Session = &response.PlanSessionResponse{
			ID:           log.ProgramSession.ID,
			SessionName:  log.ProgramSession.SessionName,
			WorkoutSplit: log.ProgramSession.WorkoutSplit,
			DayNumber:    log.ProgramSession.DayNumber,
			DayOfWeek:    log.ProgramSession.DayOfWeek,
		}
	}

	// Map log exercises
	exercises := make([]response.LogExerciseDetail, len(log.LogExercises))
	for i, ex := range log.LogExercises {
		exerciseName := ""
		if ex.Exercise.ID != 0 {
			exerciseName = ex.Exercise.ExerciseName
		}

		exercises[i] = response.LogExerciseDetail{
			ID:                         ex.ID,
			ExerciseID:                 ex.ExerciseID,
			ExerciseName:               exerciseName,
			ScheduledWorkoutExerciseID: ex.ScheduledWorkoutExerciseID,
			SetsCompleted:              ex.SetsCompleted,
			RepsCompleted:              ex.RepsCompleted,
			WeightUsed:                 ex.WeightUsed,
			RPERating:                  ex.RPERating,
			Notes:                      ex.Notes,
			Equipment:                  u.mapExerciseEquipment(ex.Exercise.ExerciseEquipments),
		}
	}
	resp.Exercises = exercises

	// Compute completeness for scheduled workout logs
	if log.ScheduledWorkoutID != nil {
		totalPrescribed, err := u.workoutRepo.CountScheduledWorkoutExercises(*log.ScheduledWorkoutID)
		if err == nil && totalPrescribed > 0 {
			completedSlots := 0
			extraExercises := 0
			for _, ex := range log.LogExercises {
				if ex.ScheduledWorkoutExerciseID != nil {
					completedSlots++
				} else {
					extraExercises++
				}
			}
			resp.Completeness = &response.WorkoutCompleteness{
				TotalPrescribed: totalPrescribed,
				CompletedSlots:  completedSlots,
				ExtraExercises:  extraExercises,
			}
		}
	}

	return resp
}

// autoLinkSlots matches logged exercises to prescribed slots by exercise_id.
// For each exercise without an explicit scheduled_workout_exercise_id, if a prescribed slot
// has the same exercise_id (and hasn't been claimed yet), auto-link it. Best-effort — skips on error.
func (u *workoutUsecase) autoLinkSlots(req *request.LogWorkoutRequest) {
	if req.ScheduledWorkoutID == nil || len(req.Exercises) == 0 {
		return
	}

	prescribed, err := u.workoutRepo.GetScheduledWorkoutExercisesByWorkoutID(*req.ScheduledWorkoutID)
	if err != nil || len(prescribed) == 0 {
		return
	}

	// Build exercise_id → slot_id map (first unclaimed slot wins)
	claimed := make(map[uint]bool)
	// Mark already-explicit links as claimed
	for _, ex := range req.Exercises {
		if ex.ScheduledWorkoutExerciseID != nil {
			claimed[*ex.ScheduledWorkoutExerciseID] = true
		}
	}

	for i := range req.Exercises {
		if req.Exercises[i].ScheduledWorkoutExerciseID != nil {
			continue // already linked
		}
		for _, slot := range prescribed {
			if slot.ExerciseID == req.Exercises[i].ExerciseID && !claimed[slot.ID] {
				slotID := slot.ID
				req.Exercises[i].ScheduledWorkoutExerciseID = &slotID
				claimed[slot.ID] = true
				break
			}
		}
	}
}

// checkAndAutoComplete checks if all prescribed slots are filled and auto-completes the scheduled workout.
// This is best-effort — errors are logged but do not fail the parent operation.
func (u *workoutUsecase) checkAndAutoComplete(scheduledWorkoutID uint, exercises []request.LogWorkoutExercise) {
	totalPrescribed, err := u.workoutRepo.CountScheduledWorkoutExercises(scheduledWorkoutID)
	if err != nil || totalPrescribed == 0 {
		return
	}

	// Count how many exercises have slot links
	filledSlots := 0
	for _, ex := range exercises {
		if ex.ScheduledWorkoutExerciseID != nil {
			filledSlots++
		}
	}

	if filledSlots >= totalPrescribed {
		// All slots filled — auto-complete (best-effort)
		now := time.Now()
		_ = u.workoutRepo.UpdateScheduledWorkoutStatus(scheduledWorkoutID, constant.WorkoutStatusCompleted, "", &now)
	}
}

// Helper: Map SessionExercises to response
func (u *workoutUsecase) mapSessionExercises(exercises []models.SessionExercise) []response.SessionExerciseDetail {
	result := make([]response.SessionExerciseDetail, len(exercises))
	for i, ex := range exercises {
		exerciseName := ""
		if ex.Exercise.ID != 0 {
			exerciseName = ex.Exercise.ExerciseName
		}

		result[i] = response.SessionExerciseDetail{
			ID:            ex.ID,
			ExerciseID:    ex.ExerciseID,
			ExerciseName:  exerciseName,
			ImageURL:      ex.Exercise.ImageURL,
			ImageFullURL:  response.BuildImageURL(ex.Exercise.ImageURL),
			Sets:          ex.Sets,
			Reps:          ex.Reps,
			Weight:        ex.Weight,
			RestSeconds:   ex.RestSeconds,
			OrderSequence: ex.OrderSequence,
		}
	}
	return result
}
