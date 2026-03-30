package repository

import (
	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/models"
	"github.com/pkg/errors"
	"gorm.io/gorm"
)

type authRepository struct {
	db *gorm.DB
}

func NewAuthRepository(db *gorm.DB) domain.AuthRepository {
	return &authRepository{db: db}
}

func (r *authRepository) GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, errors.Wrap(err, "[AuthRepository.GetUserByEmail]: Error querying database")
	}
	return &user, nil
}

func (r *authRepository) CreateUser(user *models.User) error {
	if err := r.db.Create(user).Error; err != nil {
		return errors.Wrap(err, "[AuthRepository.CreateUser]: Error creating user")
	}
	return nil
}

