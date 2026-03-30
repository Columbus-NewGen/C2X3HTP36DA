package usecase

import (
	"fmt"
	"time"

	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/response"
	"github.com/pkg/errors"
)

type leaderboardUsecase struct {
	repo domain.LeaderboardRepository
}

func NewLeaderboardUsecase(repo domain.LeaderboardRepository) domain.LeaderboardUsecase {
	return &leaderboardUsecase{repo: repo}
}

func (u *leaderboardUsecase) GetLeaderboard(leaderType, period string, limit int) (*response.LeaderboardResponse, error) {
	// Validate type
	switch leaderType {
	case "program", "streak", "volume":
	default:
		return nil, fmt.Errorf("invalid type %q: must be one of program, streak, volume", leaderType)
	}

	// Validate period
	switch period {
	case "week", "month", "alltime":
	default:
		return nil, fmt.Errorf("invalid period %q: must be one of week, month, alltime", period)
	}

	// Clamp limit
	if limit < 1 {
		limit = 1
	}
	if limit > 50 {
		limit = 50
	}

	// Compute period boundaries
	var from, to *time.Time
	now := time.Now()
	switch period {
	case "week":
		f, t := currentWeekBounds(now)
		from, to = &f, &t
	case "month":
		f := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
		t := time.Date(now.Year(), now.Month()+1, 1, 0, 0, 0, 0, now.Location())
		from, to = &f, &t
	}

	// Determine value label
	var valueLabel string
	switch leaderType {
	case "program":
		valueLabel = "programs"
	case "streak":
		valueLabel = "days"
	case "volume":
		valueLabel = "kg"
	}

	// Fetch entries from repository
	var entries []response.LeaderboardEntry
	var err error

	switch leaderType {
	case "program":
		entries, err = u.repo.GetProgramLeaderboard(from, to, limit)
	case "streak":
		if period == "alltime" {
			entries, err = u.repo.GetStreakAllTimeLeaderboard(limit)
		} else {
			entries, err = u.repo.GetStreakLeaderboard(from, to, limit)
		}
	case "volume":
		entries, err = u.repo.GetVolumeLeaderboard(from, to, limit)
	}

	if err != nil {
		return nil, errors.Wrap(err, "[LeaderboardUsecase.GetLeaderboard]: Failed to fetch leaderboard")
	}

	// Assign ranks and value labels
	for i := range entries {
		entries[i].Rank = i + 1
		entries[i].ValueLabel = valueLabel
	}

	return &response.LeaderboardResponse{
		Type:    leaderType,
		Period:  period,
		Entries: entries,
	}, nil
}

// currentWeekBounds returns Monday 00:00 and the following Monday 00:00 for the week containing t.
func currentWeekBounds(t time.Time) (time.Time, time.Time) {
	weekday := int(t.Weekday())
	if weekday == 0 {
		weekday = 7 // Sunday = 7
	}
	weekStart := time.Date(t.Year(), t.Month(), t.Day()-weekday+1, 0, 0, 0, 0, t.Location())
	weekEnd := weekStart.AddDate(0, 0, 7)
	return weekStart, weekEnd
}
