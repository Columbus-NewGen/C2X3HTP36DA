package repository

import (
	"time"

	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/models"
	"github.com/gymmate/backend/request"
	"github.com/pkg/errors"
	"gorm.io/gorm"
)

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) domain.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) GetUser(id uint32) (*models.User, error) {
	var user models.User
	if err := r.db.Preload("Trainer").Where("id = ?", id).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		err = errors.Wrap(err, "[UserRepository.GetUser]: Error getting user")
		return nil, err
	}

	return &user, nil
}

func (r *userRepository) GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, errors.Wrap(err, "[UserRepository.GetUserByEmail]: Error querying database")
	}
	return &user, nil
}

func (r *userRepository) CreateUser(user *models.User) error {
	if err := r.db.Create(user).Error; err != nil {
		return errors.Wrap(err, "[UserRepository.CreateUser]: Error creating user")
	}
	return nil
}

func (r *userRepository) UpdateProfileImage(userID uint32, imageURL string) error {
	if err := r.db.Model(&models.User{}).Where("id = ?", userID).Update("image_url", imageURL).Error; err != nil {
		return errors.Wrap(err, "[UserRepository.UpdateProfileImage]: Error updating profile image")
	}
	return nil
}

// UpdateProfile updates a user's personal profile fields
func (r *userRepository) UpdateProfile(userID uint, req *request.UpdateProfileRequest) error {
	updates := map[string]interface{}{}

	if req.Gender != nil {
		updates["gender"] = req.Gender
	}
	if req.HeightCm != nil {
		updates["height_cm"] = req.HeightCm
	}
	if req.FitnessLevel != nil {
		updates["fitness_level"] = req.FitnessLevel
	}
	if req.FitnessGoal != nil {
		updates["fitness_goal"] = req.FitnessGoal
	}
	if req.Phone != nil {
		updates["phone"] = req.Phone
	}
	if req.Bio != nil {
		updates["bio"] = req.Bio
	}
	if req.DateOfBirth != nil {
		dob, err := time.Parse("2006-01-02", *req.DateOfBirth)
		if err != nil {
			return errors.Wrap(err, "[UserRepository.UpdateProfile]: Invalid date_of_birth format, expected YYYY-MM-DD")
		}
		updates["date_of_birth"] = dob
	}

	if len(updates) == 0 {
		return nil
	}

	if err := r.db.Model(&models.User{}).Where("id = ?", userID).Updates(updates).Error; err != nil {
		return errors.Wrap(err, "[UserRepository.UpdateProfile]: Failed to update profile")
	}
	return nil
}

// AssignTrainer assigns a trainer to a user
func (r *userRepository) AssignTrainer(userID uint, trainerID uint) error {
	// Validate trainer exists and has role=trainer
	var trainer models.User
	if err := r.db.First(&trainer, trainerID).Error; err != nil {
		return errors.Wrap(err, "[UserRepository.AssignTrainer]: Trainer not found")
	}

	if trainer.Role != "trainer" {
		return errors.New("[UserRepository.AssignTrainer]: User is not a trainer")
	}

	// Validate user exists
	var user models.User
	if err := r.db.First(&user, userID).Error; err != nil {
		return errors.Wrap(err, "[UserRepository.AssignTrainer]: User not found")
	}

	// Prevent self-assignment
	if userID == trainerID {
		return errors.New("[UserRepository.AssignTrainer]: User cannot be their own trainer")
	}

	// Update user's trainer_id
	if err := r.db.Model(&models.User{}).Where("id = ?", userID).Update("trainer_id", trainerID).Error; err != nil {
		return errors.Wrap(err, "[UserRepository.AssignTrainer]: Failed to assign trainer")
	}

	return nil
}

// UnassignTrainer removes trainer assignment from a user
func (r *userRepository) UnassignTrainer(userID uint) error {
	// Validate user exists
	var user models.User
	if err := r.db.First(&user, userID).Error; err != nil {
		return errors.Wrap(err, "[UserRepository.UnassignTrainer]: User not found")
	}

	// Set trainer_id to NULL
	if err := r.db.Model(&models.User{}).Where("id = ?", userID).Update("trainer_id", nil).Error; err != nil {
		return errors.Wrap(err, "[UserRepository.UnassignTrainer]: Failed to unassign trainer")
	}

	return nil
}

// GetAllUsers retrieves all users with optional role/status filters and pagination
func (r *userRepository) GetAllUsers(page int, pageSize int, role string, status string) ([]models.User, int64, error) {
	var users []models.User
	var total int64

	query := r.db.Model(&models.User{})

	if role != "" {
		query = query.Where("role = ?", role)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, errors.Wrap(err, "[UserRepository.GetAllUsers]: Failed to count users")
	}

	offset := (page - 1) * pageSize
	if err := query.Preload("Trainer").
		Order("created_at DESC").
		Limit(pageSize).
		Offset(offset).
		Find(&users).Error; err != nil {
		return nil, 0, errors.Wrap(err, "[UserRepository.GetAllUsers]: Failed to get users")
	}

	return users, total, nil
}

// UpdateStatus updates a user's status (ACTIVE or SUSPENDED)
func (r *userRepository) UpdateStatus(userID uint, status string) (*models.User, error) {
	if err := r.db.Model(&models.User{}).Where("id = ?", userID).Update("status", status).Error; err != nil {
		return nil, errors.Wrap(err, "[UserRepository.UpdateStatus]: Failed to update status")
	}

	var user models.User
	if err := r.db.Preload("Trainer").First(&user, userID).Error; err != nil {
		return nil, errors.Wrap(err, "[UserRepository.UpdateStatus]: Failed to get updated user")
	}

	return &user, nil
}

// UpdateRole updates a user's role
func (r *userRepository) UpdateRole(userID uint, role string) (*models.User, error) {
	if err := r.db.Model(&models.User{}).Where("id = ?", userID).Update("role", role).Error; err != nil {
		return nil, errors.Wrap(err, "[UserRepository.UpdateRole]: Failed to update role")
	}

	var user models.User
	if err := r.db.Preload("Trainer").First(&user, userID).Error; err != nil {
		return nil, errors.Wrap(err, "[UserRepository.UpdateRole]: Failed to get updated user")
	}

	return &user, nil
}

// DeleteUser soft-deletes a user (sets deleted_at via GORM)
func (r *userRepository) DeleteUser(userID uint) error {
	if err := r.db.Delete(&models.User{}, userID).Error; err != nil {
		return errors.Wrap(err, "[UserRepository.DeleteUser]: Failed to delete user")
	}
	return nil
}

// LogWeight inserts a new weight entry for a user
func (r *userRepository) LogWeight(entry *models.UserWeightLog) error {
	if err := r.db.Create(entry).Error; err != nil {
		return errors.Wrap(err, "[UserRepository.LogWeight]: Failed to log weight")
	}
	return nil
}

// GetWeightHistory retrieves weight entries for a user, optionally filtered by date range
func (r *userRepository) GetWeightHistory(userID uint, from, to *time.Time) ([]models.UserWeightLog, int64, error) {
	var entries []models.UserWeightLog
	var total int64

	query := r.db.Model(&models.UserWeightLog{}).Where("user_id = ?", userID)
	if from != nil {
		query = query.Where("recorded_at >= ?", *from)
	}
	if to != nil {
		query = query.Where("recorded_at < ?", *to)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, errors.Wrap(err, "[UserRepository.GetWeightHistory]: Failed to count entries")
	}

	if err := query.Order("recorded_at DESC").Find(&entries).Error; err != nil {
		return nil, 0, errors.Wrap(err, "[UserRepository.GetWeightHistory]: Failed to get entries")
	}

	return entries, total, nil
}

// DeleteWeightEntry deletes a weight entry belonging to a user
func (r *userRepository) DeleteWeightEntry(userID uint, entryID uint) error {
	result := r.db.Where("id = ? AND user_id = ?", entryID, userID).Delete(&models.UserWeightLog{})
	if result.Error != nil {
		return errors.Wrap(result.Error, "[UserRepository.DeleteWeightEntry]: Failed to delete entry")
	}
	if result.RowsAffected == 0 {
		return errors.New("[UserRepository.DeleteWeightEntry]: Entry not found")
	}
	return nil
}

// GetTraineesByTrainerID retrieves all users assigned to a specific trainer with pagination
func (r *userRepository) GetTraineesByTrainerID(trainerID uint, page int, pageSize int) ([]models.User, int64, error) {
	var trainees []models.User
	var total int64

	// Validate trainer exists
	var trainer models.User
	if err := r.db.First(&trainer, trainerID).Error; err != nil {
		return nil, 0, errors.Wrap(err, "[UserRepository.GetTraineesByTrainerID]: Trainer not found")
	}

	// Count total trainees
	if err := r.db.Model(&models.User{}).Where("trainer_id = ?", trainerID).Count(&total).Error; err != nil {
		return nil, 0, errors.Wrap(err, "[UserRepository.GetTraineesByTrainerID]: Failed to count trainees")
	}

	// Get paginated trainees
	offset := (page - 1) * pageSize
	if err := r.db.Where("trainer_id = ?", trainerID).
		Order("created_at DESC").
		Limit(pageSize).
		Offset(offset).
		Find(&trainees).Error; err != nil {
		return nil, 0, errors.Wrap(err, "[UserRepository.GetTraineesByTrainerID]: Failed to get trainees")
	}

	return trainees, total, nil
}
