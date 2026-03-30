package usecase

import (
	"os"

	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/models"
	"github.com/gymmate/backend/request"
	"github.com/gymmate/backend/response"
	"github.com/gymmate/backend/utils"
	"github.com/pkg/errors"
)

type authUsecase struct {
	authRepository domain.AuthRepository
}

func NewAuthUsecase(authRepository domain.AuthRepository) domain.AuthUsecase {
	return &authUsecase{authRepository: authRepository}
}

func (u *authUsecase) Register(req *request.RegisterRequest) (*response.AuthResponse, error) {
	// Check if user already exists
	existingUser, err := u.authRepository.GetUserByEmail(req.Email)
	if err != nil {
		return nil, errors.Wrap(err, "[AuthUsecase.Register]: Error checking existing user")
	}
	if existingUser != nil {
		return nil, errors.New("email already registered")
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, errors.Wrap(err, "[AuthUsecase.Register]: Error hashing password")
	}

	// Determine role (default to "user")
	role := "user"
	if req.Secret != nil && req.Role != nil {
		// Check if secret matches the env variable
		registerSecret := os.Getenv("REGISTER_SECRET")
		if registerSecret != "" && *req.Secret == registerSecret {
			// Valid secret - accept the provided role
			role = *req.Role
		}
		// If secret doesn't match or env var not set, ignore the role and use default "user"
	}

	// Create user
	user := &models.User{
		Email:    req.Email,
		Password: hashedPassword,
		Name:     req.Name,
		Role:     role,
	}

	if err := u.authRepository.CreateUser(user); err != nil {
		return nil, errors.Wrap(err, "[AuthUsecase.Register]: Error creating user")
	}

	// Generate token
	token, err := utils.GenerateToken(user.ID, user.Email, user.Role)
	if err != nil {
		return nil, errors.Wrap(err, "[AuthUsecase.Register]: Error generating token")
	}

	return &response.AuthResponse{
		User: response.UserResponse{
			ID:    user.ID,
			Email: user.Email,
			Name:  user.Name,
			Role:  user.Role,
		},
		Token: token,
	}, nil
}

func (u *authUsecase) Login(req *request.LoginRequest) (*response.AuthResponse, error) {
	// Get user by email
	user, err := u.authRepository.GetUserByEmail(req.Email)
	if err != nil {
		return nil, errors.Wrap(err, "[AuthUsecase.Login]: Error querying user")
	}
	if user == nil {
		return nil, errors.New("invalid email or password")
	}

	// Check password
	if !utils.CheckPasswordHash(req.Password, user.Password) {
		return nil, errors.New("invalid email or password")
	}

	// Generate token
	token, err := utils.GenerateToken(user.ID, user.Email, user.Role)
	if err != nil {
		return nil, errors.Wrap(err, "[AuthUsecase.Login]: Error generating token")
	}

	return &response.AuthResponse{
		User: response.UserResponse{
			ID:           user.ID,
			Email:        user.Email,
			Name:         user.Name,
			Role:         user.Role,
			ImageURL:     user.ImageURL,
			ImageFullURL: response.BuildImageURL(user.ImageURL),
		},
		Token: token,
	}, nil
}
