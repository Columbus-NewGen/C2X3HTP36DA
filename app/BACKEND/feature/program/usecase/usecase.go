package usecase

import (
	"time"

	"github.com/gymmate/backend/constant"
	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/models"
	"github.com/gymmate/backend/request"
	"github.com/gymmate/backend/response"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

type programUsecase struct {
	programRepo         domain.ProgramRepository
	gamificationUsecase domain.GamificationUsecase
}

func NewProgramUsecase(programRepo domain.ProgramRepository, gamificationUsecase domain.GamificationUsecase) domain.ProgramUsecase {
	return &programUsecase{
		programRepo:         programRepo,
		gamificationUsecase: gamificationUsecase,
	}
}

// CreateProgram creates a new program (template or user-specific)
func (u *programUsecase) CreateProgram(req *request.CreateProgramRequest, createdByUserID uint) (*response.ProgramResponse, error) {
	// Validation: templates require difficulty
	if req.IsTemplate && req.DifficultyLevel == "" {
		return nil, errors.New("template programs must have a difficulty level")
	}

	// Validation: templates with sessions must have day_of_week set
	if req.IsTemplate && len(req.Sessions) > 0 {
		for i, session := range req.Sessions {
			if session.DayOfWeek == nil {
				return nil, errors.New("template program sessions must have day_of_week set (1=Monday, 7=Sunday)")
			}
			if *session.DayOfWeek < 1 || *session.DayOfWeek > 7 {
				return nil, errors.New("day_of_week must be between 1 (Monday) and 7 (Sunday)")
			}
			if len(session.Exercises) == 0 {
				return nil, errors.Errorf("session %d (%s) must have at least one exercise", i+1, session.SessionName)
			}
		}
	}

	program := &models.Program{
		ProgramName:     req.ProgramName,
		Goal:            req.Goal,
		DurationWeeks:   req.DurationWeeks,
		IsTemplate:      req.IsTemplate,
		DifficultyLevel: req.DifficultyLevel,
		DaysPerWeek:     req.DaysPerWeek,
		Description:     req.Description,
		IsActive:        false, // Programs start inactive
		CreatedBy:       &createdByUserID,
	}

	if err := u.programRepo.CreateProgram(program); err != nil {
		return nil, errors.Wrap(err, "[ProgramUsecase.CreateProgram]: Error creating program")
	}

	// Create sessions if provided
	if len(req.Sessions) > 0 {
		for _, sessionReq := range req.Sessions {
			session := &models.ProgramSession{
				ProgramID:    program.ID,
				SessionName:  sessionReq.SessionName,
				WorkoutSplit: sessionReq.WorkoutSplit,
				DayOfWeek:    sessionReq.DayOfWeek,
				DayNumber:    sessionReq.DayNumber,
				Notes:        sessionReq.Notes,
			}

			if err := u.programRepo.CreateSession(session); err != nil {
				return nil, errors.Wrap(err, "[ProgramUsecase.CreateProgram]: Error creating session")
			}

			// Create exercises for this session
			for _, exerciseReq := range sessionReq.Exercises {
				sessionExercise := &models.SessionExercise{
					SessionID:     session.ID,
					ExerciseID:    exerciseReq.ExerciseID,
					Sets:          exerciseReq.Sets,
					Reps:          exerciseReq.Reps,
					Weight:        exerciseReq.Weight,
					RestSeconds:   exerciseReq.RestSeconds,
					OrderSequence: exerciseReq.OrderSequence,
				}

				if err := u.programRepo.CreateSessionExercise(sessionExercise); err != nil {
					return nil, errors.Wrap(err, "[ProgramUsecase.CreateProgram]: Error creating session exercise")
				}
			}
		}
	}

	// Return program with session count
	sessionCount := len(req.Sessions)
	return u.mapProgramToResponse(program, sessionCount), nil
}

// GetProgramByID gets a program with all sessions and exercises
func (u *programUsecase) GetProgramByID(id uint) (*response.ProgramDetailResponse, error) {
	program, err := u.programRepo.GetProgramWithSessions(id)
	if err != nil {
		return nil, errors.Wrap(err, "[ProgramUsecase.GetProgramByID]: Error fetching program")
	}
	if program == nil {
		return nil, errors.New("program not found")
	}

	return u.mapProgramToDetailResponse(program), nil
}

// GetPrograms lists programs with optional filters
func (u *programUsecase) GetPrograms(isTemplate *bool, difficulty string, authenticatedUserID uint) ([]response.ProgramResponse, error) {
	programs, err := u.programRepo.GetPrograms(isTemplate, difficulty, authenticatedUserID)
	if err != nil {
		return nil, errors.Wrap(err, "[ProgramUsecase.GetPrograms]: Error fetching programs")
	}

	responses := make([]response.ProgramResponse, len(programs))
	for i := range programs {
		response := u.mapProgramToResponse(&programs[i], 0)
		responses[i] = *response
	}

	return responses, nil
}

// UpdateProgram updates program details and optionally replaces all sessions
func (u *programUsecase) UpdateProgram(id uint, req *request.UpdateProgramRequest, callerID uint, callerRole string) (*response.ProgramDetailResponse, error) {
	program, err := u.programRepo.GetProgramByID(id)
	if err != nil {
		return nil, errors.Wrap(err, "[ProgramUsecase.UpdateProgram]: Error fetching program")
	}
	if program == nil {
		return nil, errors.New("program not found")
	}

	// Ownership check
	if callerRole != "admin" && (program.CreatedBy == nil || *program.CreatedBy != callerID) {
		return nil, errors.New("forbidden: you do not own this program")
	}

	// Update fields
	if req.ProgramName != "" {
		program.ProgramName = req.ProgramName
	}
	if req.Goal != "" {
		program.Goal = req.Goal
	}
	if req.DurationWeeks > 0 {
		program.DurationWeeks = req.DurationWeeks
	}
	if req.DifficultyLevel != "" {
		program.DifficultyLevel = req.DifficultyLevel
	}
	if req.DaysPerWeek > 0 {
		program.DaysPerWeek = req.DaysPerWeek
	}
	if req.Description != "" {
		program.Description = req.Description
	}
	if req.IsActive != nil {
		program.IsActive = *req.IsActive
	}

	if err := u.programRepo.UpdateProgram(program); err != nil {
		return nil, errors.Wrap(err, "[ProgramUsecase.UpdateProgram]: Error updating program")
	}

	// Replace sessions if provided
	if len(req.Sessions) > 0 {
		if err := u.programRepo.DeleteSessionsByProgramID(id); err != nil {
			return nil, errors.Wrap(err, "[ProgramUsecase.UpdateProgram]: Error deleting existing sessions")
		}

		for _, sessionReq := range req.Sessions {
			session := &models.ProgramSession{
				ProgramID:    id,
				SessionName:  sessionReq.SessionName,
				WorkoutSplit: sessionReq.WorkoutSplit,
				DayOfWeek:    sessionReq.DayOfWeek,
				DayNumber:    sessionReq.DayNumber,
				Notes:        sessionReq.Notes,
			}

			if err := u.programRepo.CreateSession(session); err != nil {
				return nil, errors.Wrap(err, "[ProgramUsecase.UpdateProgram]: Error creating session")
			}

			for _, exerciseReq := range sessionReq.Exercises {
				sessionExercise := &models.SessionExercise{
					SessionID:     session.ID,
					ExerciseID:    exerciseReq.ExerciseID,
					Sets:          exerciseReq.Sets,
					Reps:          exerciseReq.Reps,
					Weight:        exerciseReq.Weight,
					RestSeconds:   exerciseReq.RestSeconds,
					OrderSequence: exerciseReq.OrderSequence,
				}

				if err := u.programRepo.CreateSessionExercise(sessionExercise); err != nil {
					return nil, errors.Wrap(err, "[ProgramUsecase.UpdateProgram]: Error creating session exercise")
				}
			}
		}
	}

	return u.GetProgramByID(id)
}

// DeleteProgram deletes a program
func (u *programUsecase) DeleteProgram(id uint, callerID uint, callerRole string) error {
	program, err := u.programRepo.GetProgramByID(id)
	if err != nil {
		return errors.Wrap(err, "[ProgramUsecase.DeleteProgram]: Error fetching program")
	}
	if program == nil {
		return errors.New("program not found")
	}

	// Ownership check
	if callerRole != "admin" && (program.CreatedBy == nil || *program.CreatedBy != callerID) {
		return errors.New("forbidden: you do not own this program")
	}

	if err := u.programRepo.DeleteProgram(id); err != nil {
		return errors.Wrap(err, "[ProgramUsecase.DeleteProgram]: Error deleting program")
	}

	return nil
}

// AssignProgramToUser assigns a template program to a user.
// No copy is made — UserProgram.ProgramID references the template directly.
// Exercise prescriptions are snapshotted into ScheduledWorkoutExercises at spawn time.
func (u *programUsecase) AssignProgramToUser(userID uint, req *request.AssignProgramRequest, assignedByUserID uint, callerRole string) (*response.UserProgramResponse, error) {
	// Validate user exists and is active
	user, err := u.programRepo.GetUserByID(userID)
	if err != nil {
		return nil, errors.Wrap(err, "[ProgramUsecase.AssignProgramToUser]: Error fetching user")
	}
	if user == nil {
		return nil, errors.New("user not found")
	}
	if user.Status != constant.UserStatusActive {
		return nil, errors.New("cannot assign program to inactive user")
	}

	// Validate template exists and is actually a template
	template, err := u.programRepo.GetProgramByID(req.TemplateProgramID)
	if err != nil {
		return nil, errors.Wrap(err, "[ProgramUsecase.AssignProgramToUser]: Error fetching template")
	}
	if template == nil {
		return nil, errors.New("template program not found")
	}
	if !template.IsTemplate {
		isCreator := template.CreatedBy != nil && *template.CreatedBy == assignedByUserID
		if callerRole != "admin" && !isCreator {
			return nil, errors.New("forbidden: only the creator or admin can assign a private program")
		}
	}

	// Check if user already has this template assigned (non-completed)
	existingPrograms, err := u.programRepo.GetUserPrograms(userID, "")
	if err != nil {
		return nil, errors.Wrap(err, "[ProgramUsecase.AssignProgramToUser]: Error checking existing programs")
	}
	for _, existing := range existingPrograms {
		isTerminal := existing.Status == constant.UserProgramStatusCompleted || existing.Status == constant.UserProgramStatusCancelled
		if existing.ProgramID == req.TemplateProgramID && !isTerminal {
			return nil, errors.New("user already has this template assigned")
		}
	}

	// Pause any active programs for this user
	if err := u.programRepo.PauseActivePrograms(userID); err != nil {
		return nil, errors.Wrap(err, "[ProgramUsecase.AssignProgramToUser]: Error pausing active programs")
	}

	// Parse start date (format: YYYY-MM-DD)
	startDate, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		return nil, errors.Wrap(err, "[ProgramUsecase.AssignProgramToUser]: Invalid start_date format, expected YYYY-MM-DD")
	}

	// Create user program record — references template directly (no copy)
	userProgram := &models.UserProgram{
		UserID:      userID,
		ProgramID:   req.TemplateProgramID, // Points to TEMPLATE directly
		ProgramName: req.ProgramName,       // User's custom name
		AssignedBy:  assignedByUserID,
		StartDate:   &startDate,
		CurrentWeek: 1,
		CurrentDay:  1,
		Status:      constant.UserProgramStatusActive,
		Notes:       req.Notes,
	}

	if err := u.programRepo.CreateUserProgram(userProgram); err != nil {
		return nil, errors.Wrap(err, "[ProgramUsecase.AssignProgramToUser]: Error creating user program")
	}

	// Spawn scheduled workouts (reads template sessions, snapshots exercises into ScheduledWorkoutExercises)
	if err := u.programRepo.SpawnScheduledWorkouts(userProgram.ID, req.TemplateProgramID, req.StartDate); err != nil {
		return nil, errors.Wrap(err, "[ProgramUsecase.AssignProgramToUser]: Error spawning scheduled workouts")
	}

	// Return the full user program with details
	return u.GetUserProgramByID(userProgram.ID)
}

// GetUserPrograms gets all programs assigned to a user
func (u *programUsecase) GetUserPrograms(userID uint, status string) ([]response.UserProgramResponse, error) {
	userPrograms, err := u.programRepo.GetUserPrograms(userID, status)
	if err != nil {
		return nil, errors.Wrap(err, "[ProgramUsecase.GetUserPrograms]: Error fetching user programs")
	}

	responses := make([]response.UserProgramResponse, len(userPrograms))
	for i, up := range userPrograms {
		responses[i] = *u.mapUserProgramToResponse(&up)
	}

	return responses, nil
}

// GetUserProgramByID gets a specific user program
func (u *programUsecase) GetUserProgramByID(userProgramID uint) (*response.UserProgramResponse, error) {
	userProgram, err := u.programRepo.GetUserProgramByID(userProgramID)
	if err != nil {
		return nil, errors.Wrap(err, "[ProgramUsecase.GetUserProgramByID]: Error fetching user program")
	}
	if userProgram == nil {
		return nil, errors.New("user program not found")
	}

	return u.mapUserProgramToResponse(userProgram), nil
}

// GetUserProgramDetail gets a user program with scheduled workout list and computed rates
func (u *programUsecase) GetUserProgramDetail(userProgramID uint) (*response.UserProgramDetailResponse, error) {
	userProgram, err := u.programRepo.GetUserProgramByID(userProgramID)
	if err != nil {
		return nil, errors.Wrap(err, "[ProgramUsecase.GetUserProgramDetail]: Error fetching user program")
	}
	if userProgram == nil {
		return nil, errors.New("user program not found")
	}

	scheduledWorkouts, err := u.programRepo.GetScheduledWorkoutsByUserProgramID(userProgramID)
	if err != nil {
		return nil, errors.Wrap(err, "[ProgramUsecase.GetUserProgramDetail]: Error fetching scheduled workouts")
	}

	// Compute rates excluding cancelled workouts
	var total, completed, nonScheduled int
	for _, sw := range scheduledWorkouts {
		if sw.Status == constant.WorkoutStatusCancelled {
			continue
		}
		total++
		switch sw.Status {
		case constant.WorkoutStatusCompleted:
			completed++
			nonScheduled++
		case constant.WorkoutStatusMissed, constant.WorkoutStatusSkipped:
			nonScheduled++
		}
	}

	var completionRate, progressionRate float64
	if total > 0 {
		completionRate = float64(completed) / float64(total)
		progressionRate = float64(nonScheduled) / float64(total)
	}

	simpleWorkouts := make([]response.ScheduledWorkoutSimple, len(scheduledWorkouts))
	for i, sw := range scheduledWorkouts {
		simpleWorkouts[i] = response.ScheduledWorkoutSimple{
			ID:     sw.ID,
			Status: sw.Status,
		}
	}

	return &response.UserProgramDetailResponse{
		UserProgramResponse: *u.mapUserProgramToResponse(userProgram),
		CompletionRate:      completionRate,
		ProgressionRate:     progressionRate,
		ScheduledWorkouts:   simpleWorkouts,
	}, nil
}

// UpdateUserProgram updates user program progress/status
func (u *programUsecase) UpdateUserProgram(userProgramID uint, req *request.UpdateUserProgramRequest) (*response.UserProgramResponse, error) {
	userProgram, err := u.programRepo.GetUserProgramByID(userProgramID)
	if err != nil {
		return nil, errors.Wrap(err, "[ProgramUsecase.UpdateUserProgram]: Error fetching user program")
	}
	if userProgram == nil {
		return nil, errors.New("user program not found")
	}

	// Update fields
	if req.Status != "" {
		// If changing to ACTIVE, pause other active programs
		if req.Status == constant.UserProgramStatusActive && userProgram.Status != constant.UserProgramStatusActive {
			if err := u.programRepo.PauseActivePrograms(userProgram.UserID); err != nil {
				return nil, errors.Wrap(err, "[ProgramUsecase.UpdateUserProgram]: Error pausing other programs")
			}
		}

		userProgram.Status = req.Status

		// Set completed_at if status is COMPLETED
		if req.Status == constant.UserProgramStatusCompleted {
			now := time.Now()
			userProgram.CompletedAt = &now
		}

		// Bulk-cancel remaining SCHEDULED workouts when program is cancelled
		if req.Status == constant.UserProgramStatusCancelled {
			if err := u.programRepo.CancelScheduledWorkouts(userProgramID); err != nil {
				return nil, errors.Wrap(err, "[ProgramUsecase.UpdateUserProgram]: Error cancelling workouts")
			}
			// No gamification hook — intentional
		}
	}

	if req.CurrentWeek > 0 {
		userProgram.CurrentWeek = req.CurrentWeek
	}
	if req.CurrentDay > 0 {
		userProgram.CurrentDay = req.CurrentDay
	}
	if req.Notes != "" {
		userProgram.Notes = req.Notes
	}

	if err := u.programRepo.UpdateUserProgram(userProgram); err != nil {
		return nil, errors.Wrap(err, "[ProgramUsecase.UpdateUserProgram]: Error updating user program")
	}

	// Award XP for program completion — best-effort, must not block
	if req.Status == constant.UserProgramStatusCompleted && u.gamificationUsecase != nil {
		uid := userProgram.UserID
		pid := userProgramID
		go func() {
			if err := u.gamificationUsecase.ProcessProgramCompleted(uid, pid); err != nil {
				log.Warnf("[ProgramUsecase.UpdateUserProgram]: gamification processing failed for user %d: %v", uid, err)
			}
		}()
	}

	return u.GetUserProgramByID(userProgramID)
}

// CompleteUserProgram marks a program as completed
func (u *programUsecase) CompleteUserProgram(userProgramID uint) error {
	userProgram, err := u.programRepo.GetUserProgramByID(userProgramID)
	if err != nil {
		return errors.Wrap(err, "[ProgramUsecase.CompleteUserProgram]: Error fetching user program")
	}
	if userProgram == nil {
		return errors.New("user program not found")
	}

	now := time.Now()
	userProgram.Status = constant.UserProgramStatusCompleted
	userProgram.CompletedAt = &now

	if err := u.programRepo.UpdateUserProgram(userProgram); err != nil {
		return errors.Wrap(err, "[ProgramUsecase.CompleteUserProgram]: Error completing program")
	}

	// Award XP for program completion — best-effort, must not block
	if u.gamificationUsecase != nil {
		uid := userProgram.UserID
		pid := userProgramID
		go func() {
			if err := u.gamificationUsecase.ProcessProgramCompleted(uid, pid); err != nil {
				log.Warnf("[ProgramUsecase.CompleteUserProgram]: gamification processing failed for user %d: %v", uid, err)
			}
		}()
	}

	return nil
}

// PauseUserProgram pauses a program
func (u *programUsecase) PauseUserProgram(userProgramID uint) error {
	userProgram, err := u.programRepo.GetUserProgramByID(userProgramID)
	if err != nil {
		return errors.Wrap(err, "[ProgramUsecase.PauseUserProgram]: Error fetching user program")
	}
	if userProgram == nil {
		return errors.New("user program not found")
	}

	userProgram.Status = constant.UserProgramStatusPaused

	if err := u.programRepo.UpdateUserProgram(userProgram); err != nil {
		return errors.Wrap(err, "[ProgramUsecase.PauseUserProgram]: Error pausing program")
	}

	return nil
}

// Helper mapping functions
func (u *programUsecase) mapProgramToResponse(program *models.Program, sessionCount int) *response.ProgramResponse {
	resp := &response.ProgramResponse{
		ID:              program.ID,
		ProgramName:     program.ProgramName,
		Goal:            program.Goal,
		DurationWeeks:   program.DurationWeeks,
		IsTemplate:      program.IsTemplate,
		DifficultyLevel: program.DifficultyLevel,
		DaysPerWeek:     program.DaysPerWeek,
		Description:     program.Description,
		IsActive:        program.IsActive,
		SessionCount:    sessionCount,
		CreatedAt:       program.CreatedAt,
		UpdatedAt:       program.UpdatedAt,
	}

	if program.Creator != nil && program.Creator.ID != 0 {
		resp.CreatedBy = &response.UserSimpleResponse{
			ID:    program.Creator.ID,
			Name:  program.Creator.Name,
			Email: program.Creator.Email,
			Role:  program.Creator.Role,
		}
	}

	return resp
}

func (u *programUsecase) mapProgramToDetailResponse(program *models.Program) *response.ProgramDetailResponse {
	resp := &response.ProgramDetailResponse{
		ID:              program.ID,
		ProgramName:     program.ProgramName,
		Goal:            program.Goal,
		DurationWeeks:   program.DurationWeeks,
		IsTemplate:      program.IsTemplate,
		DifficultyLevel: program.DifficultyLevel,
		DaysPerWeek:     program.DaysPerWeek,
		Description:     program.Description,
		IsActive:        program.IsActive,
		CreatedAt:       program.CreatedAt,
		UpdatedAt:       program.UpdatedAt,
	}

	if program.Creator != nil && program.Creator.ID != 0 {
		resp.CreatedBy = &response.UserSimpleResponse{
			ID:    program.Creator.ID,
			Name:  program.Creator.Name,
			Email: program.Creator.Email,
			Role:  program.Creator.Role,
		}
	}

	// Map sessions
	sessions := make([]response.PlanSessionResponse, len(program.Sessions))
	for i, session := range program.Sessions {
		sessions[i] = response.PlanSessionResponse{
			ID:           session.ID,
			SessionName:  session.SessionName,
			WorkoutSplit: session.WorkoutSplit,
			DayNumber:    session.DayNumber,
			DayOfWeek:    session.DayOfWeek,
			Notes:        session.Notes,
			Exercises:    u.mapSessionExercises(session.Exercises),
		}
	}
	resp.Sessions = sessions

	return resp
}

func (u *programUsecase) mapSessionExercises(exercises []models.SessionExercise) []response.SessionExerciseDetail {
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
			Sets:          ex.Sets,
			Reps:          ex.Reps,
			Weight:        ex.Weight,
			RestSeconds:   ex.RestSeconds,
			OrderSequence: ex.OrderSequence,
		}
	}
	return result
}

func (u *programUsecase) mapUserProgramToResponse(up *models.UserProgram) *response.UserProgramResponse {
	resp := &response.UserProgramResponse{
		ID:          up.ID,
		UserID:      up.UserID,
		ProgramName: up.ProgramName,
		Status:      up.Status,
		CurrentWeek: up.CurrentWeek,
		CurrentDay:  up.CurrentDay,
		AssignedAt:  up.AssignedAt,
		StartDate:   up.StartDate,
		StartedAt:   up.StartedAt,
		CompletedAt: up.CompletedAt,
		Notes:       up.Notes,
		CreatedAt:   up.CreatedAt,
		UpdatedAt:   up.UpdatedAt,
	}

	// Map trainer
	if up.Trainer.ID != 0 {
		resp.AssignedBy = &response.UserSimpleResponse{
			ID:    up.Trainer.ID,
			Name:  up.Trainer.Name,
			Email: up.Trainer.Email,
			Role:  up.Trainer.Role,
		}
	}

	// Map program (now shows template info)
	if up.Program.ID != 0 {
		resp.Program = u.mapProgramToDetailResponse(&up.Program)
	}

	return resp
}
