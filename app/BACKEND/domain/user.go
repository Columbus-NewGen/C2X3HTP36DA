package domain

import (
	"time"

	"github.com/gymmate/backend/models"
	"github.com/gymmate/backend/request"
	"github.com/gymmate/backend/response"
)

type UserUsecase interface {
	GetUser(id uint32) (*response.UserResponse, error)
	UpdateProfileImage(userID uint32, imageURL string) (*response.UserResponse, error)
	UpdateProfile(userID uint, req *request.UpdateProfileRequest) (*response.UserResponse, error)
	AssignTrainer(userID uint, trainerID uint) (*response.UserResponse, error)
	UnassignTrainer(userID uint) (*response.UserResponse, error)
	GetTraineesByTrainerID(trainerID uint, page int, pageSize int) (*response.TraineeListResponse, error)
	GetTrainerDashboard(trainerID uint) (*response.TrainerDashboardResponse, error)
	GetTraineeProgress(trainerID uint, traineeID uint, from, to *time.Time) (*response.TraineeProgressResponse, error)
	GetMyProgress(userID uint, from, to *time.Time) (*response.UserProgressResponse, error)
	GetMyProgressTrends(userID uint, trendsType string) (*response.TrendOptionsResponse, error)
	GetAllUsers(page int, pageSize int, role string, status string) (*response.UserListResponse, error)
	UpdateStatus(userID uint, status string) (*response.UserResponse, error)
	UpdateRole(userID uint, role string) (*response.UserResponse, error)
	DeleteUser(adminID uint, userID uint) error
	LogWeight(userID uint, req *request.LogWeightRequest) (*response.WeightLogEntry, error)
	GetWeightHistory(userID uint, from, to *string) (*response.WeightHistoryResponse, error)
	DeleteWeightEntry(userID uint, entryID uint) error
}

type UserRepository interface {
	GetUser(id uint32) (*models.User, error)
	GetUserByEmail(email string) (*models.User, error)
	CreateUser(user *models.User) error
	UpdateProfileImage(userID uint32, imageURL string) error
	UpdateProfile(userID uint, req *request.UpdateProfileRequest) error
	AssignTrainer(userID uint, trainerID uint) error
	UnassignTrainer(userID uint) error
	GetTraineesByTrainerID(trainerID uint, page int, pageSize int) ([]models.User, int64, error)
	GetAllUsers(page int, pageSize int, role string, status string) ([]models.User, int64, error)
	UpdateStatus(userID uint, status string) (*models.User, error)
	UpdateRole(userID uint, role string) (*models.User, error)
	DeleteUser(userID uint) error
	LogWeight(entry *models.UserWeightLog) error
	GetWeightHistory(userID uint, from, to *time.Time) ([]models.UserWeightLog, int64, error)
	DeleteWeightEntry(userID uint, entryID uint) error
}

type AuthUsecase interface {
	Register(req *request.RegisterRequest) (*response.AuthResponse, error)
	Login(req *request.LoginRequest) (*response.AuthResponse, error)
}

type AuthRepository interface {
	GetUserByEmail(email string) (*models.User, error)
	CreateUser(user *models.User) error
}
