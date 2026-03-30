package repository

import (
	"time"

	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/models"
	"github.com/pkg/errors"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type gamificationRepository struct {
	db *gorm.DB
}

func NewGamificationRepository(db *gorm.DB) domain.GamificationRepository {
	return &gamificationRepository{db: db}
}

func (r *gamificationRepository) GetOrCreateProfile(userID uint) (*models.UserGamificationProfile, error) {
	newProfile := models.UserGamificationProfile{
		UserID:       userID,
		TotalXP:      0,
		CurrentLevel: 1,
		WeeklyTarget: 3,
	}
	// INSERT ... ON CONFLICT DO NOTHING avoids the SELECT-then-INSERT race condition
	// that causes duplicate key violations when concurrent requests hit simultaneously.
	result := r.db.Clauses(clause.OnConflict{DoNothing: true}).Create(&newProfile)
	if result.Error != nil {
		return nil, errors.Wrap(result.Error, "[GamificationRepository.GetOrCreateProfile]: Error getting or creating profile")
	}
	// RowsAffected == 0 means the row already existed; fetch it.
	if result.RowsAffected == 0 {
		var existing models.UserGamificationProfile
		if err := r.db.Where("user_id = ?", userID).First(&existing).Error; err != nil {
			return nil, errors.Wrap(err, "[GamificationRepository.GetOrCreateProfile]: Error fetching existing profile")
		}
		return &existing, nil
	}
	return &newProfile, nil
}

func (r *gamificationRepository) GetAllBadges() ([]models.Badge, error) {
	var badges []models.Badge
	if err := r.db.Order("sort_order ASC").Find(&badges).Error; err != nil {
		return nil, errors.Wrap(err, "[GamificationRepository.GetAllBadges]: Error fetching badges")
	}
	return badges, nil
}

func (r *gamificationRepository) GetUserBadges(userID uint) ([]models.UserBadge, error) {
	var userBadges []models.UserBadge
	if err := r.db.Preload("Badge").Where("user_id = ?", userID).Find(&userBadges).Error; err != nil {
		return nil, errors.Wrap(err, "[GamificationRepository.GetUserBadges]: Error fetching user badges")
	}
	return userBadges, nil
}

func (r *gamificationRepository) GetRecentXPEvents(userID uint, limit int) ([]models.XPEvent, error) {
	var events []models.XPEvent
	err := r.db.Raw(
		`SELECT * FROM xp_events WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
		userID, limit,
	).Scan(&events).Error
	if err != nil {
		return nil, errors.Wrap(err, "[GamificationRepository.GetRecentXPEvents]: Error fetching XP events")
	}
	return events, nil
}

func (r *gamificationRepository) CountWorkoutLogsInWeek(userID uint, weekStart, weekEnd time.Time) (int, error) {
	var count int
	err := r.db.Raw(
		`SELECT COUNT(*) FROM workout_logs WHERE user_id = ? AND workout_date >= ? AND workout_date < ? AND deleted_at IS NULL`,
		userID, weekStart, weekEnd,
	).Scan(&count).Error
	if err != nil {
		return 0, errors.Wrap(err, "[GamificationRepository.CountWorkoutLogsInWeek]: Error counting workout logs")
	}
	return count, nil
}

func (r *gamificationRepository) CountTotalWorkoutLogs(userID uint) (int, error) {
	var count int
	err := r.db.Raw(
		`SELECT COUNT(*) FROM workout_logs WHERE user_id = ? AND deleted_at IS NULL`,
		userID,
	).Scan(&count).Error
	if err != nil {
		return 0, errors.Wrap(err, "[GamificationRepository.CountTotalWorkoutLogs]: Error counting total workout logs")
	}
	return count, nil
}

func (r *gamificationRepository) GetBadgeByName(name string) (*models.Badge, error) {
	var badge models.Badge
	if err := r.db.Where("name = ?", name).First(&badge).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, errors.Wrap(err, "[GamificationRepository.GetBadgeByName]: Error fetching badge")
	}
	return &badge, nil
}

func (r *gamificationRepository) UpdateProfile(profile *models.UserGamificationProfile) error {
	if err := r.db.Save(profile).Error; err != nil {
		return errors.Wrap(err, "[GamificationRepository.UpdateProfile]: Error updating profile")
	}
	return nil
}

func (r *gamificationRepository) AddXPEvent(event *models.XPEvent) error {
	if err := r.db.Create(event).Error; err != nil {
		return errors.Wrap(err, "[GamificationRepository.AddXPEvent]: Error creating XP event")
	}
	return nil
}

// ResetStaleStreaks sets current_streak = 0 for users whose last_workout_date is before yesterday.
// Returns the number of rows affected.
func (r *gamificationRepository) ResetStaleStreaks(yesterday time.Time) (int64, error) {
	result := r.db.Model(&models.UserGamificationProfile{}).
		Where("last_workout_date < ? AND current_streak > 0", yesterday).
		Updates(map[string]interface{}{"current_streak": 0, "updated_at": time.Now()})
	return result.RowsAffected, errors.Wrap(result.Error, "[GamificationRepository.ResetStaleStreaks]: Error resetting stale streaks")
}

// AwardBadge inserts a new user_badge row. Returns true if the badge was newly earned,
// false if the user already had it (ON CONFLICT DO NOTHING).
func (r *gamificationRepository) AwardBadge(userID, badgeID uint) (bool, error) {
	result := r.db.Clauses(clause.OnConflict{DoNothing: true}).Create(&models.UserBadge{
		UserID:  userID,
		BadgeID: badgeID,
	})
	if result.Error != nil {
		return false, errors.Wrap(result.Error, "[GamificationRepository.AwardBadge]: Error awarding badge")
	}
	return result.RowsAffected > 0, nil
}
