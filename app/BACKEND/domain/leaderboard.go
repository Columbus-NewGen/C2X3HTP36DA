package domain

import (
	"time"

	"github.com/gymmate/backend/response"
)

type LeaderboardUsecase interface {
	GetLeaderboard(leaderType, period string, limit int) (*response.LeaderboardResponse, error)
}

type LeaderboardRepository interface {
	GetProgramLeaderboard(from, to *time.Time, limit int) ([]response.LeaderboardEntry, error)
	GetStreakLeaderboard(from, to *time.Time, limit int) ([]response.LeaderboardEntry, error)
	GetStreakAllTimeLeaderboard(limit int) ([]response.LeaderboardEntry, error)
	GetVolumeLeaderboard(from, to *time.Time, limit int) ([]response.LeaderboardEntry, error)
}
