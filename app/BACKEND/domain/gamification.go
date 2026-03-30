package domain

import (
	"time"

	"github.com/gymmate/backend/models"
	"github.com/gymmate/backend/response"
)

type GamificationUsecase interface {
	GetProfile(userID uint) (*response.GamificationProfileResponse, error)
	GetBadges(userID uint) (*response.BadgesResponse, error)
	ProcessWorkoutCompleted(userID uint, workoutLogID uint, workoutDate time.Time) error
	ProcessProgramCompleted(userID uint, userProgramID uint) error
	ResetStaleStreaks(yesterday time.Time) (int64, error)
}

type GamificationRepository interface {
	// Read
	GetOrCreateProfile(userID uint) (*models.UserGamificationProfile, error)
	GetAllBadges() ([]models.Badge, error)
	GetUserBadges(userID uint) ([]models.UserBadge, error)
	GetRecentXPEvents(userID uint, limit int) ([]models.XPEvent, error)
	CountWorkoutLogsInWeek(userID uint, weekStart, weekEnd time.Time) (int, error)
	CountTotalWorkoutLogs(userID uint) (int, error)
	GetBadgeByName(name string) (*models.Badge, error)

	// Write
	UpdateProfile(profile *models.UserGamificationProfile) error
	AddXPEvent(event *models.XPEvent) error
	AwardBadge(userID, badgeID uint) (bool, error)         // returns true if newly earned
	ResetStaleStreaks(yesterday time.Time) (int64, error)  // bulk-reset current_streak for users who missed yesterday
}
