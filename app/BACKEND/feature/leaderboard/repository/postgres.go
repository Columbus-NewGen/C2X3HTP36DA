package repository

import (
	"time"

	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/response"
	"github.com/pkg/errors"
	"gorm.io/gorm"
)

type leaderboardRepository struct {
	db *gorm.DB
}

func NewLeaderboardRepository(db *gorm.DB) domain.LeaderboardRepository {
	return &leaderboardRepository{db: db}
}

type leaderboardRow struct {
	UserID    uint    `db:"user_id"`
	UserName  string  `db:"user_name"`
	AvatarURL *string `db:"avatar_url"`
	Value     float64 `db:"value"`
}

func (r *leaderboardRepository) GetProgramLeaderboard(from, to *time.Time, limit int) ([]response.LeaderboardEntry, error) {
	query := `SELECT u.id AS user_id, u.name AS user_name, u.image_url AS avatar_url,
	           COUNT(*) AS value
	          FROM user_programs up
	          JOIN users u ON u.id = up.user_id
	          WHERE up.status = 'COMPLETED'`
	args := []any{}

	if from != nil && to != nil {
		query += ` AND up.completed_at >= ? AND up.completed_at < ?`
		args = append(args, *from, *to)
	}

	query += ` GROUP BY u.id, u.name, u.image_url
	           ORDER BY value DESC
	           LIMIT ?`
	args = append(args, limit)

	var rows []leaderboardRow
	if err := r.db.Raw(query, args...).Scan(&rows).Error; err != nil {
		return nil, errors.Wrap(err, "[LeaderboardRepository.GetProgramLeaderboard]: Error querying program leaderboard")
	}

	return mapToEntries(rows), nil
}

func (r *leaderboardRepository) GetStreakLeaderboard(from, to *time.Time, limit int) ([]response.LeaderboardEntry, error) {
	query := `SELECT u.id AS user_id, u.name AS user_name, u.image_url AS avatar_url,
	           COUNT(DISTINCT wl.workout_date) AS value
	          FROM workout_logs wl
	          JOIN users u ON u.id = wl.user_id
	          WHERE wl.deleted_at IS NULL
	            AND wl.workout_date >= ? AND wl.workout_date < ?
	          GROUP BY u.id, u.name, u.image_url
	          ORDER BY value DESC
	          LIMIT ?`

	var rows []leaderboardRow
	if err := r.db.Raw(query, *from, *to, limit).Scan(&rows).Error; err != nil {
		return nil, errors.Wrap(err, "[LeaderboardRepository.GetStreakLeaderboard]: Error querying streak leaderboard")
	}

	return mapToEntries(rows), nil
}

func (r *leaderboardRepository) GetStreakAllTimeLeaderboard(limit int) ([]response.LeaderboardEntry, error) {
	query := `SELECT u.id AS user_id, u.name AS user_name, u.image_url AS avatar_url,
	           ugp.longest_streak AS value
	          FROM user_gamification_profiles ugp
	          JOIN users u ON u.id = ugp.user_id
	          WHERE ugp.longest_streak > 0
	          ORDER BY value DESC
	          LIMIT ?`

	var rows []leaderboardRow
	if err := r.db.Raw(query, limit).Scan(&rows).Error; err != nil {
		return nil, errors.Wrap(err, "[LeaderboardRepository.GetStreakAllTimeLeaderboard]: Error querying all-time streak leaderboard")
	}

	return mapToEntries(rows), nil
}

func (r *leaderboardRepository) GetVolumeLeaderboard(from, to *time.Time, limit int) ([]response.LeaderboardEntry, error) {
	query := `SELECT u.id AS user_id, u.name AS user_name, u.image_url AS avatar_url,
	           COALESCE(SUM(COALESCE(le.weight_used, 0) * le.reps_completed * le.sets_completed), 0) AS value
	          FROM workout_logs wl
	          JOIN users u ON u.id = wl.user_id
	          JOIN log_exercises le ON le.log_id = wl.id
	          WHERE wl.deleted_at IS NULL`
	args := []any{}

	if from != nil && to != nil {
		query += ` AND wl.workout_date >= ? AND wl.workout_date < ?`
		args = append(args, *from, *to)
	}

	query += ` GROUP BY u.id, u.name, u.image_url
	           HAVING COALESCE(SUM(COALESCE(le.weight_used, 0) * le.reps_completed * le.sets_completed), 0) > 0
	           ORDER BY value DESC
	           LIMIT ?`
	args = append(args, limit)

	var rows []leaderboardRow
	if err := r.db.Raw(query, args...).Scan(&rows).Error; err != nil {
		return nil, errors.Wrap(err, "[LeaderboardRepository.GetVolumeLeaderboard]: Error querying volume leaderboard")
	}

	return mapToEntries(rows), nil
}

func mapToEntries(rows []leaderboardRow) []response.LeaderboardEntry {
	entries := make([]response.LeaderboardEntry, len(rows))
	for i, row := range rows {
		entries[i] = response.LeaderboardEntry{
			UserID:    row.UserID,
			UserName:  row.UserName,
			AvatarURL: row.AvatarURL,
			Value:     row.Value,
		}
	}
	return entries
}
