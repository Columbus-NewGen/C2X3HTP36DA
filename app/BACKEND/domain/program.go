package domain

import (
	"github.com/gymmate/backend/models"
	"github.com/gymmate/backend/request"
	"github.com/gymmate/backend/response"
)

type ProgramUsecase interface {
	// Program CRUD
	CreateProgram(req *request.CreateProgramRequest, createdByUserID uint) (*response.ProgramResponse, error)
	GetProgramByID(id uint) (*response.ProgramDetailResponse, error)
	GetPrograms(isTemplate *bool, difficulty string, authenticatedUserID uint) ([]response.ProgramResponse, error)
	UpdateProgram(id uint, req *request.UpdateProgramRequest, callerID uint, callerRole string) (*response.ProgramDetailResponse, error)
	DeleteProgram(id uint, callerID uint, callerRole string) error

	// Template Assignment
	AssignProgramToUser(userID uint, req *request.AssignProgramRequest, assignedByUserID uint, callerRole string) (*response.UserProgramResponse, error)

	// User Program Management
	GetUserPrograms(userID uint, status string) ([]response.UserProgramResponse, error)
	GetUserProgramByID(userProgramID uint) (*response.UserProgramResponse, error)
	GetUserProgramDetail(userProgramID uint) (*response.UserProgramDetailResponse, error)
	UpdateUserProgram(userProgramID uint, req *request.UpdateUserProgramRequest) (*response.UserProgramResponse, error)
	CompleteUserProgram(userProgramID uint) error
	PauseUserProgram(userProgramID uint) error
}

type ProgramRepository interface {
	// Program CRUD
	CreateProgram(program *models.Program) error
	GetProgramByID(id uint) (*models.Program, error)
	GetPrograms(isTemplate *bool, difficulty string, authenticatedUserID uint) ([]models.Program, error)
	UpdateProgram(program *models.Program) error
	DeleteProgram(id uint) error

	// Program with sessions
	GetProgramWithSessions(id uint) (*models.Program, error)

	// Session management
	CreateSession(session *models.ProgramSession) error
	CreateSessionExercise(exercise *models.SessionExercise) error
	DeleteSessionsByProgramID(programID uint) error

	// User Program CRUD
	CreateUserProgram(userProgram *models.UserProgram) error
	GetUserProgramByID(id uint) (*models.UserProgram, error)
	GetUserPrograms(userID uint, status string) ([]models.UserProgram, error)
	GetActiveUserProgram(userID uint) (*models.UserProgram, error)
	UpdateUserProgram(userProgram *models.UserProgram) error
	PauseActivePrograms(userID uint) error // Pause all active programs for a user

	// User management
	GetUserByID(id uint) (*models.User, error)

	// Calendar scheduling
	SpawnScheduledWorkouts(userProgramID uint, programID uint, startDate string) error
	CancelScheduledWorkouts(userProgramID uint) error
	GetScheduledWorkoutsByUserProgramID(userProgramID uint) ([]models.ScheduledWorkout, error)
}
