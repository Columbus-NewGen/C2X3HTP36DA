package response

type GamificationProfileResponse struct {
	TotalXP         int              `json:"total_xp"`
	CurrentLevel    int              `json:"current_level"`
	NextLevelXP     int              `json:"next_level_xp"`    // 0 if max level
	XPProgress      int              `json:"xp_progress"`      // XP within current level
	XPToNextLevel   int              `json:"xp_to_next_level"` // 0 if max level
	CurrentStreak   int              `json:"current_streak"`
	LongestStreak   int              `json:"longest_streak"`
	LastWorkoutDate *string          `json:"last_workout_date"` // "YYYY-MM-DD" or null
	WeeklyTarget    int              `json:"weekly_target"`
	WeeklyCompleted int              `json:"weekly_completed"`
	Badges          []EarnedBadge    `json:"badges"`
	RecentXPEvents  []XPEventSummary `json:"recent_xp_events"`
}

type EarnedBadge struct {
	ID          uint    `json:"id"`
	Name        string  `json:"name"`
	DisplayName string  `json:"display_name"`
	Description *string `json:"description"`
	IconURL     *string `json:"icon_url"`
	EarnedAt    string  `json:"earned_at"`
}

type XPEventSummary struct {
	ID          uint   `json:"id"`
	EventType   string `json:"event_type"`
	XPAmount    int    `json:"xp_amount"`
	Description string `json:"description"`
	CreatedAt   string `json:"created_at"`
}

type BadgeWithStatus struct {
	ID           uint    `json:"id"`
	Name         string  `json:"name"`
	DisplayName  string  `json:"display_name"`
	Description  *string `json:"description"`
	IconURL      *string `json:"icon_url"`
	TriggerType  string  `json:"trigger_type"`
	TriggerValue *int    `json:"trigger_value"`
	XPReward     int     `json:"xp_reward"`
	Earned       bool    `json:"earned"`
	EarnedAt     *string `json:"earned_at"` // null if not earned
}

type BadgesResponse struct {
	Badges []BadgeWithStatus `json:"badges"`
}
