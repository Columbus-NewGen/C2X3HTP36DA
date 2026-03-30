package usecase

import (
	"sort"
	"time"

	"github.com/gymmate/backend/constant"
	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/models"
	"github.com/gymmate/backend/request"
	"github.com/gymmate/backend/response"
	"github.com/pkg/errors"
)

type userUsecase struct {
	userRepository     domain.UserRepository
	progressRepository domain.ProgressRepository
}

func NewUserUsecase(userRepository domain.UserRepository, progressRepository domain.ProgressRepository) domain.UserUsecase {
	return &userUsecase{userRepository: userRepository, progressRepository: progressRepository}
}

func (u *userUsecase) GetUser(id uint32) (*response.UserResponse, error) {
	user, err := u.userRepository.GetUser(id)
	if err != nil {
		err = errors.Wrap(err, "[UserUsecase.GetUser]: Error getting user")
		return nil, err
	}

	if user == nil {
		err = errors.New(constant.UserNotFound)
		return nil, err
	}

	return u.toUserResponse(user), nil
}

func (u *userUsecase) UpdateProfileImage(userID uint32, imageURL string) (*response.UserResponse, error) {
	// Update profile image in database
	if err := u.userRepository.UpdateProfileImage(userID, imageURL); err != nil {
		return nil, errors.Wrap(err, "[UserUsecase.UpdateProfileImage]: Error updating profile image")
	}

	// Get updated user data
	user, err := u.userRepository.GetUser(userID)
	if err != nil {
		return nil, errors.Wrap(err, "[UserUsecase.UpdateProfileImage]: Error getting updated user")
	}

	if user == nil {
		return nil, errors.New(constant.UserNotFound)
	}

	return u.toUserResponse(user), nil
}

// UpdateProfile updates a user's personal profile fields
func (u *userUsecase) UpdateProfile(userID uint, req *request.UpdateProfileRequest) (*response.UserResponse, error) {
	if err := u.userRepository.UpdateProfile(userID, req); err != nil {
		return nil, errors.Wrap(err, "[UserUsecase.UpdateProfile]: Failed to update profile")
	}

	user, err := u.userRepository.GetUser(uint32(userID))
	if err != nil {
		return nil, errors.Wrap(err, "[UserUsecase.UpdateProfile]: Failed to get updated user")
	}
	if user == nil {
		return nil, errors.New(constant.UserNotFound)
	}

	return u.toUserResponse(user), nil
}

// AssignTrainer assigns a trainer to a user (admin only - enforced by middleware)
func (u *userUsecase) AssignTrainer(userID uint, trainerID uint) (*response.UserResponse, error) {
	// Validate and assign trainer
	if err := u.userRepository.AssignTrainer(userID, trainerID); err != nil {
		return nil, errors.Wrap(err, "[UserUsecase.AssignTrainer]: Failed to assign trainer")
	}

	// Get updated user with trainer preloaded
	user, err := u.userRepository.GetUser(uint32(userID))
	if err != nil {
		return nil, errors.Wrap(err, "[UserUsecase.AssignTrainer]: Failed to get updated user")
	}

	return u.toUserResponse(user), nil
}

// UnassignTrainer removes trainer assignment from a user (admin only - enforced by middleware)
func (u *userUsecase) UnassignTrainer(userID uint) (*response.UserResponse, error) {
	if err := u.userRepository.UnassignTrainer(userID); err != nil {
		return nil, errors.Wrap(err, "[UserUsecase.UnassignTrainer]: Failed to unassign trainer")
	}

	// Get updated user
	user, err := u.userRepository.GetUser(uint32(userID))
	if err != nil {
		return nil, errors.Wrap(err, "[UserUsecase.UnassignTrainer]: Failed to get updated user")
	}

	return u.toUserResponse(user), nil
}

// GetTraineesByTrainerID gets all trainees assigned to a trainer (admin or trainer accessing self)
func (u *userUsecase) GetTraineesByTrainerID(trainerID uint, page int, pageSize int) (*response.TraineeListResponse, error) {
	// Default pagination
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	trainees, total, err := u.userRepository.GetTraineesByTrainerID(trainerID, page, pageSize)
	if err != nil {
		return nil, errors.Wrap(err, "[UserUsecase.GetTraineesByTrainerID]: Failed to get trainees")
	}

	// Convert to response DTOs
	traineeResponses := make([]response.TraineeResponse, len(trainees))
	for i, trainee := range trainees {
		traineeResponses[i] = response.TraineeResponse{
			ID:           trainee.ID,
			Name:         trainee.Name,
			Email:        trainee.Email,
			Role:         trainee.Role,
			Status:       trainee.Status,
			ImageURL:     trainee.ImageURL,
			ImageFullURL: response.BuildImageURL(trainee.ImageURL),
			AssignedAt:   trainee.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		}
	}

	return &response.TraineeListResponse{
		Trainees: traineeResponses,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}, nil
}

// GetAllUsers retrieves all users with optional filters and pagination (admin only)
func (u *userUsecase) GetAllUsers(page int, pageSize int, role string, status string) (*response.UserListResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	users, total, err := u.userRepository.GetAllUsers(page, pageSize, role, status)
	if err != nil {
		return nil, errors.Wrap(err, "[UserUsecase.GetAllUsers]: Failed to get users")
	}

	userResponses := make([]response.UserResponse, len(users))
	for i, user := range users {
		userResponses[i] = *u.toUserResponse(&user)
	}

	return &response.UserListResponse{
		Users:    userResponses,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}, nil
}

// UpdateStatus updates a user's status (admin only — enforced by middleware)
func (u *userUsecase) UpdateStatus(userID uint, status string) (*response.UserResponse, error) {
	user, err := u.userRepository.UpdateStatus(userID, status)
	if err != nil {
		return nil, errors.Wrap(err, "[UserUsecase.UpdateStatus]: Failed to update status")
	}
	return u.toUserResponse(user), nil
}

// UpdateRole updates a user's role (admin only — enforced by middleware)
func (u *userUsecase) UpdateRole(userID uint, role string) (*response.UserResponse, error) {
	// Guard: if the user currently has a trainer assigned, they are a trainee and
	// cannot be promoted to trainer while still under a trainer relationship.
	existing, err := u.userRepository.GetUser(uint32(userID))
	if err != nil {
		return nil, errors.Wrap(err, "[UserUsecase.UpdateRole]: Failed to get user")
	}
	if existing == nil {
		return nil, errors.New(constant.UserNotFound)
	}
	if role == "trainer" && existing.TrainerID != nil {
		return nil, errors.New("[UserUsecase.UpdateRole]: Cannot promote to trainer while user has an assigned trainer")
	}

	user, err := u.userRepository.UpdateRole(userID, role)
	if err != nil {
		return nil, errors.Wrap(err, "[UserUsecase.UpdateRole]: Failed to update role")
	}
	return u.toUserResponse(user), nil
}

// DeleteUser soft-deletes a user (admin only — enforced by middleware)
func (u *userUsecase) DeleteUser(adminID uint, userID uint) error {
	if adminID == userID {
		return errors.New("[UserUsecase.DeleteUser]: Admin cannot delete their own account")
	}
	if err := u.userRepository.DeleteUser(userID); err != nil {
		return errors.Wrap(err, "[UserUsecase.DeleteUser]: Failed to delete user")
	}
	return nil
}

// LogWeight logs a weight entry for a user
func (u *userUsecase) LogWeight(userID uint, req *request.LogWeightRequest) (*response.WeightLogEntry, error) {
	recordedAt := time.Now()
	if req.RecordedAt != nil {
		parsed, err := time.Parse(time.RFC3339, *req.RecordedAt)
		if err != nil {
			return nil, errors.New("[UserUsecase.LogWeight]: Invalid recorded_at format, expected RFC3339 (e.g. 2026-03-02T07:30:00Z)")
		}
		recordedAt = parsed
	}

	entry := &models.UserWeightLog{
		UserID:     userID,
		WeightKg:   req.WeightKg,
		RecordedAt: recordedAt,
		Note:       req.Note,
	}

	if err := u.userRepository.LogWeight(entry); err != nil {
		return nil, errors.Wrap(err, "[UserUsecase.LogWeight]: Failed to log weight")
	}

	return u.toWeightLogEntry(entry), nil
}

// GetWeightHistory retrieves weight entries for a user with optional date range filter
func (u *userUsecase) GetWeightHistory(userID uint, from, to *string) (*response.WeightHistoryResponse, error) {
	var fromTime, toTime *time.Time

	if from != nil {
		t, err := time.Parse("2006-01-02", *from)
		if err != nil {
			return nil, errors.New("[UserUsecase.GetWeightHistory]: Invalid from date format, expected YYYY-MM-DD")
		}
		fromTime = &t
	}
	if to != nil {
		t, err := time.Parse("2006-01-02", *to)
		if err != nil {
			return nil, errors.New("[UserUsecase.GetWeightHistory]: Invalid to date format, expected YYYY-MM-DD")
		}
		t = t.AddDate(0, 0, 1) // exclusive upper bound: captures the full end day
		toTime = &t
	}

	entries, total, err := u.userRepository.GetWeightHistory(userID, fromTime, toTime)
	if err != nil {
		return nil, errors.Wrap(err, "[UserUsecase.GetWeightHistory]: Failed to get weight history")
	}

	result := make([]response.WeightLogEntry, len(entries))
	for i, e := range entries {
		result[i] = *u.toWeightLogEntry(&e)
	}

	return &response.WeightHistoryResponse{
		Entries: result,
		Total:   total,
	}, nil
}

// DeleteWeightEntry deletes a weight log entry belonging to a user
func (u *userUsecase) DeleteWeightEntry(userID uint, entryID uint) error {
	if err := u.userRepository.DeleteWeightEntry(userID, entryID); err != nil {
		return errors.Wrap(err, "[UserUsecase.DeleteWeightEntry]: Failed to delete entry")
	}
	return nil
}

func (u *userUsecase) toWeightLogEntry(e *models.UserWeightLog) *response.WeightLogEntry {
	return &response.WeightLogEntry{
		ID:         e.ID,
		WeightKg:   e.WeightKg,
		RecordedAt: e.RecordedAt.Format(time.RFC3339),
		Note:       e.Note,
		CreatedAt:  e.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

// toUserResponse converts a User model to UserResponse DTO
func (u *userUsecase) toUserResponse(user *models.User) *response.UserResponse {
	resp := &response.UserResponse{
		ID:           user.ID,
		Email:        user.Email,
		Name:         user.Name,
		Role:         user.Role,
		Status:       user.Status,
		ImageURL:     user.ImageURL,
		ImageFullURL: response.BuildImageURL(user.ImageURL),
		Gender:       user.Gender,
		HeightCm:     user.HeightCm,
		FitnessLevel: user.FitnessLevel,
		FitnessGoal:  user.FitnessGoal,
		Phone:        user.Phone,
		Bio:          user.Bio,
	}

	if user.DateOfBirth != nil {
		dob := user.DateOfBirth.Format("2006-01-02")
		resp.DateOfBirth = &dob
	}

	// Add trainer info if assigned
	if user.Trainer != nil {
		resp.Trainer = &response.TrainerInfo{
			ID:   user.Trainer.ID,
			Name: user.Trainer.Name,
			Role: user.Trainer.Role,
		}
	}

	return resp
}

// GetMyProgressTrends returns all muscles or exercises the user has trained, sorted by frequency.
func (u *userUsecase) GetMyProgressTrends(userID uint, trendsType string) (*response.TrendOptionsResponse, error) {
	switch trendsType {
	case "muscle":
		muscles, err := u.progressRepository.GetMuscleProgress(userID, nil, nil)
		if err != nil {
			return nil, errors.Wrap(err, "[UserUsecase.GetMyProgressTrends]: Failed to get muscles")
		}
		sort.Slice(muscles, func(i, j int) bool {
			return muscles[i].WorkoutsTargeted > muscles[j].WorkoutsTargeted
		})
		items := make([]response.TrendFilterOption, len(muscles))
		for i, m := range muscles {
			var lastTrained *string
			if m.LastTrained != nil {
				s := m.LastTrained.Format("2006-01-02")
				lastTrained = &s
			}
			items[i] = response.TrendFilterOption{
				Name:        m.MuscleName,
				Frequency:   m.WorkoutsTargeted,
				LastTrained: lastTrained,
			}
		}
		return &response.TrendOptionsResponse{Type: "muscle", Items: items}, nil

	case "exercise":
		exercises, err := u.progressRepository.GetUserExercises(userID)
		if err != nil {
			return nil, errors.Wrap(err, "[UserUsecase.GetMyProgressTrends]: Failed to get exercises")
		}
		items := make([]response.TrendFilterOption, len(exercises))
		for i, e := range exercises {
			var lastTrained *string
			if e.LastPerformed != nil {
				s := e.LastPerformed.Format("2006-01-02")
				lastTrained = &s
			}
			items[i] = response.TrendFilterOption{
				Name:        e.ExerciseName,
				Frequency:   e.SessionCount,
				LastTrained: lastTrained,
			}
		}
		return &response.TrendOptionsResponse{Type: "exercise", Items: items}, nil

	default:
		return nil, errors.New("[UserUsecase.GetMyProgressTrends]: type must be 'muscle' or 'exercise'")
	}
}

// GetTrainerDashboard provides overview of trainer's trainees and recent activity
func (u *userUsecase) GetTrainerDashboard(trainerID uint) (*response.TrainerDashboardResponse, error) {
	// Get all trainees assigned to this trainer
	trainees, total, err := u.userRepository.GetTraineesByTrainerID(trainerID, 1, 100)
	if err != nil {
		return nil, errors.Wrap(err, "[UserUsecase.GetTrainerDashboard]: Failed to get trainees")
	}

	// Count active/suspended
	activeCount := 0
	suspendedCount := 0
	for _, trainee := range trainees {
		if trainee.Status == "ACTIVE" {
			activeCount++
		} else if trainee.Status == "SUSPENDED" {
			suspendedCount++
		}
	}

	// Compute current week boundaries (Monday 00:00 – Sunday 23:59)
	now := time.Now()
	weekday := int(now.Weekday())
	if weekday == 0 {
		weekday = 7 // Sunday = 7
	}
	weekStart := time.Date(now.Year(), now.Month(), now.Day()-weekday+1, 0, 0, 0, 0, now.Location())
	weekEnd := weekStart.AddDate(0, 0, 6) // Sunday
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())

	// Build trainee summaries with real data
	traineeIDs := make([]uint, len(trainees))
	traineeSummaries := make([]response.TraineeDashboardSummary, len(trainees))
	for i, trainee := range trainees {
		traineeIDs[i] = trainee.ID

		programName, _ := u.progressRepository.GetActiveUserProgramName(trainee.ID)

		lastDate, _ := u.progressRepository.GetLastWorkoutDate(trainee.ID)
		var lastDateStr *string
		if lastDate != nil {
			s := lastDate.Format("2006-01-02")
			lastDateStr = &s
		}

		workoutsThisWeek, _ := u.progressRepository.CountWorkoutLogsInRange(trainee.ID, weekStart, weekEnd)
		upcomingWorkouts, _ := u.progressRepository.CountUpcomingScheduledWorkouts(trainee.ID, today)

		traineeSummaries[i] = response.TraineeDashboardSummary{
			ID:               trainee.ID,
			Name:             trainee.Name,
			ImageURL:         trainee.ImageURL,
			Status:           trainee.Status,
			CurrentProgram:   programName,
			LastWorkoutDate:  lastDateStr,
			WorkoutsThisWeek: workoutsThisWeek,
			UpcomingWorkouts: upcomingWorkouts,
		}
	}

	// Fetch recent activity across all trainees
	activities, _ := u.progressRepository.GetRecentTraineeActivity(traineeIDs, 20)
	recentActivity := make([]response.TraineeActivitySummary, len(activities))
	for i, a := range activities {
		recentActivity[i] = response.TraineeActivitySummary{
			TraineeID:    a.UserID,
			TraineeName:  a.UserName,
			ActivityType: a.Type,
			Description:  a.Description,
			Timestamp:    a.Timestamp.Format("2006-01-02T15:04:05Z07:00"),
		}
	}

	return &response.TrainerDashboardResponse{
		TotalTrainees:     int(total),
		ActiveTrainees:    activeCount,
		SuspendedTrainees: suspendedCount,
		RecentActivity:    recentActivity,
		Trainees:          traineeSummaries,
	}, nil
}

// GetTraineeProgress provides detailed progress analytics for a specific trainee
func (u *userUsecase) GetTraineeProgress(trainerID uint, traineeID uint, from, to *time.Time) (*response.TraineeProgressResponse, error) {
	// Verify trainee is assigned to this trainer
	trainee, err := u.userRepository.GetUser(uint32(traineeID))
	if err != nil {
		return nil, errors.Wrap(err, "[UserUsecase.GetTraineeProgress]: Trainee not found")
	}

	if trainee.TrainerID == nil || *trainee.TrainerID != trainerID {
		return nil, errors.New("[UserUsecase.GetTraineeProgress]: Trainee not assigned to this trainer")
	}

	// Current program
	var programSummary *response.ProgramSummary
	if activeProgram, err := u.progressRepository.GetActiveUserProgram(traineeID); err == nil && activeProgram != nil {
		startDateStr := ""
		if activeProgram.StartDate != nil {
			startDateStr = activeProgram.StartDate.Format("2006-01-02")
		}

		completionRate := 0.0
		if stats, err := u.progressRepository.GetScheduledWorkoutStats(traineeID); err == nil && stats != nil && stats.TotalScheduled > 0 {
			completionRate = float64(stats.Completed) / float64(stats.TotalScheduled) * 100
		}

		programSummary = &response.ProgramSummary{
			ID:             activeProgram.UserProgramID,
			Name:           activeProgram.ProgramName,
			StartDate:      startDateStr,
			DurationWeeks:  activeProgram.DurationWeeks,
			CompletionRate: completionRate,
		}
	}

	// Workout statistics
	workoutStats := response.WorkoutStatistics{}
	if stats, err := u.progressRepository.GetScheduledWorkoutStats(traineeID); err == nil && stats != nil {
		workoutStats.TotalWorkoutsScheduled = stats.TotalScheduled
		workoutStats.WorkoutsCompleted = stats.Completed
		workoutStats.WorkoutsMissed = stats.Missed
		workoutStats.WorkoutsSkipped = stats.Skipped
		if stats.TotalScheduled > 0 {
			workoutStats.CompletionRate = float64(stats.Completed) / float64(stats.TotalScheduled) * 100
		}
	}
	if streak, err := u.progressRepository.GetCurrentStreak(traineeID); err == nil {
		workoutStats.CurrentStreak = streak
	}

	// Recent workouts
	var recentWorkouts []response.RecentWorkoutItem
	if logs, err := u.progressRepository.GetRecentWorkoutLogs(traineeID, 10, from, to); err == nil {
		recentWorkouts = make([]response.RecentWorkoutItem, len(logs))
		for i, l := range logs {
			recentWorkouts[i] = response.RecentWorkoutItem{
				WorkoutLogID:       l.WorkoutLogID,
				WorkoutDate:        l.WorkoutDate.Format("2006-01-02"),
				ProgramSessionName: l.ProgramSessionName,
				ExerciseCount:      l.ExerciseCount,
				TotalSets:          l.TotalSets,
				TotalVolume:        l.TotalVolume,
				Duration:           l.DurationMinutes,
			}
		}
	}
	if recentWorkouts == nil {
		recentWorkouts = []response.RecentWorkoutItem{}
	}

	// Muscle progress
	var muscleProgress []response.MuscleProgressItem
	if muscles, err := u.progressRepository.GetMuscleProgress(traineeID, from, to); err == nil {
		// Find max weighted sets for intensity_score normalization
		maxWeightedSets := 0.0
		for _, m := range muscles {
			if m.WeightedSets > maxWeightedSets {
				maxWeightedSets = m.WeightedSets
			}
		}

		muscleProgress = make([]response.MuscleProgressItem, len(muscles))
		for i, m := range muscles {
			var lastTrained *string
			if m.LastTrained != nil {
				s := m.LastTrained.Format("2006-01-02")
				lastTrained = &s
			}

			intensityScore := 0.0
			if maxWeightedSets > 0 {
				intensityScore = m.WeightedSets / maxWeightedSets
			}

			muscleProgress[i] = response.MuscleProgressItem{
				MuscleName:       m.MuscleName,
				BodyRegion:       m.BodyRegion,
				TotalSets:        m.TotalSets,
				WeightedSets:     m.WeightedSets,
				TotalReps:        m.TotalReps,
				TotalVolume:      m.TotalVolume,
				AverageWeight:    m.AverageWeight,
				WorkoutsTargeted: m.WorkoutsTargeted,
				LastTrained:      lastTrained,
				IntensityScore:   intensityScore,
			}
		}
	}
	if muscleProgress == nil {
		muscleProgress = []response.MuscleProgressItem{}
	}

	// Exercise PRs
	var exercisePRs []response.ExercisePRItem
	if prs, err := u.progressRepository.GetExercisePRs(traineeID, 10, from, to); err == nil {
		exercisePRs = make([]response.ExercisePRItem, len(prs))
		for i, pr := range prs {
			exercisePRs[i] = response.ExercisePRItem{
				ExerciseName: pr.ExerciseName,
				MaxWeight:    pr.MaxWeight,
				MaxReps:      pr.MaxReps,
				MaxVolume:    pr.MaxVolume,
				AchievedAt:   pr.AchievedAt.Format("2006-01-02"),
			}
		}
	}
	if exercisePRs == nil {
		exercisePRs = []response.ExercisePRItem{}
	}

	return &response.TraineeProgressResponse{
		TraineeID:      traineeID,
		TraineeName:    trainee.Name,
		CurrentProgram: programSummary,
		WorkoutStats:   workoutStats,
		MuscleProgress: muscleProgress,
		ExercisePRs:    exercisePRs,
		RecentWorkouts: recentWorkouts,
	}, nil
}

// GetMyProgress provides detailed progress analytics for the authenticated user
func (u *userUsecase) GetMyProgress(userID uint, from, to *time.Time) (*response.UserProgressResponse, error) {
	user, err := u.userRepository.GetUser(uint32(userID))
	if err != nil {
		return nil, errors.Wrap(err, "[UserUsecase.GetMyProgress]: User not found")
	}

	// Current program
	var programSummary *response.ProgramSummary
	if activeProgram, err := u.progressRepository.GetActiveUserProgram(userID); err == nil && activeProgram != nil {
		startDateStr := ""
		if activeProgram.StartDate != nil {
			startDateStr = activeProgram.StartDate.Format("2006-01-02")
		}

		completionRate := 0.0
		if stats, err := u.progressRepository.GetScheduledWorkoutStats(userID); err == nil && stats != nil && stats.TotalScheduled > 0 {
			completionRate = float64(stats.Completed) / float64(stats.TotalScheduled) * 100
		}

		programSummary = &response.ProgramSummary{
			ID:             activeProgram.UserProgramID,
			Name:           activeProgram.ProgramName,
			StartDate:      startDateStr,
			DurationWeeks:  activeProgram.DurationWeeks,
			CompletionRate: completionRate,
		}
	}

	// Workout statistics
	workoutStats := response.WorkoutStatistics{}
	if stats, err := u.progressRepository.GetScheduledWorkoutStats(userID); err == nil && stats != nil {
		workoutStats.TotalWorkoutsScheduled = stats.TotalScheduled
		workoutStats.WorkoutsCompleted = stats.Completed
		workoutStats.WorkoutsMissed = stats.Missed
		workoutStats.WorkoutsSkipped = stats.Skipped
		if stats.TotalScheduled > 0 {
			workoutStats.CompletionRate = float64(stats.Completed) / float64(stats.TotalScheduled) * 100
		}
	}
	if streak, err := u.progressRepository.GetCurrentStreak(userID); err == nil {
		workoutStats.CurrentStreak = streak
	}

	// Recent workouts
	var recentWorkouts []response.RecentWorkoutItem
	if logs, err := u.progressRepository.GetRecentWorkoutLogs(userID, 10, from, to); err == nil {
		recentWorkouts = make([]response.RecentWorkoutItem, len(logs))
		for i, l := range logs {
			recentWorkouts[i] = response.RecentWorkoutItem{
				WorkoutLogID:       l.WorkoutLogID,
				WorkoutDate:        l.WorkoutDate.Format("2006-01-02"),
				ProgramSessionName: l.ProgramSessionName,
				ExerciseCount:      l.ExerciseCount,
				TotalSets:          l.TotalSets,
				TotalVolume:        l.TotalVolume,
				Duration:           l.DurationMinutes,
			}
		}
	}
	if recentWorkouts == nil {
		recentWorkouts = []response.RecentWorkoutItem{}
	}

	// Muscle progress
	var muscleProgress []response.MuscleProgressItem
	if muscles, err := u.progressRepository.GetMuscleProgress(userID, from, to); err == nil {
		maxWeightedSets := 0.0
		for _, m := range muscles {
			if m.WeightedSets > maxWeightedSets {
				maxWeightedSets = m.WeightedSets
			}
		}

		muscleProgress = make([]response.MuscleProgressItem, len(muscles))
		for i, m := range muscles {
			var lastTrained *string
			if m.LastTrained != nil {
				s := m.LastTrained.Format("2006-01-02")
				lastTrained = &s
			}

			intensityScore := 0.0
			if maxWeightedSets > 0 {
				intensityScore = m.WeightedSets / maxWeightedSets
			}

			muscleProgress[i] = response.MuscleProgressItem{
				MuscleName:       m.MuscleName,
				BodyRegion:       m.BodyRegion,
				TotalSets:        m.TotalSets,
				WeightedSets:     m.WeightedSets,
				TotalReps:        m.TotalReps,
				TotalVolume:      m.TotalVolume,
				AverageWeight:    m.AverageWeight,
				WorkoutsTargeted: m.WorkoutsTargeted,
				LastTrained:      lastTrained,
				IntensityScore:   intensityScore,
			}
		}
	}
	if muscleProgress == nil {
		muscleProgress = []response.MuscleProgressItem{}
	}

	// Exercise PRs
	var exercisePRs []response.ExercisePRItem
	if prs, err := u.progressRepository.GetExercisePRs(userID, 10, from, to); err == nil {
		exercisePRs = make([]response.ExercisePRItem, len(prs))
		for i, pr := range prs {
			exercisePRs[i] = response.ExercisePRItem{
				ExerciseName: pr.ExerciseName,
				MaxWeight:    pr.MaxWeight,
				MaxReps:      pr.MaxReps,
				MaxVolume:    pr.MaxVolume,
				AchievedAt:   pr.AchievedAt.Format("2006-01-02"),
			}
		}
	}
	if exercisePRs == nil {
		exercisePRs = []response.ExercisePRItem{}
	}

	return &response.UserProgressResponse{
		UserID:         userID,
		UserName:       user.Name,
		CurrentProgram: programSummary,
		WorkoutStats:   workoutStats,
		MuscleProgress: muscleProgress,
		ExercisePRs:    exercisePRs,
		RecentWorkouts: recentWorkouts,
	}, nil
}
