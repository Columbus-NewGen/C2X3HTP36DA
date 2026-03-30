package usecase

import (
	"time"

	"github.com/gymmate/backend/constant"
	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/models"
	"github.com/gymmate/backend/response"
	"github.com/pkg/errors"
)

type gamificationUsecase struct {
	repo domain.GamificationRepository
}

func NewGamificationUsecase(repo domain.GamificationRepository) domain.GamificationUsecase {
	return &gamificationUsecase{repo: repo}
}

func (u *gamificationUsecase) GetProfile(userID uint) (*response.GamificationProfileResponse, error) {
	profile, err := u.repo.GetOrCreateProfile(userID)
	if err != nil {
		return nil, errors.Wrap(err, "[GamificationUsecase.GetProfile]: Failed to get profile")
	}

	// Compute current week boundaries (Monday 00:00 – Sunday 00:00)
	now := time.Now()
	weekday := int(now.Weekday())
	if weekday == 0 {
		weekday = 7 // Sunday = 7
	}
	weekStart := time.Date(now.Year(), now.Month(), now.Day()-weekday+1, 0, 0, 0, 0, now.Location())
	weekEnd := weekStart.AddDate(0, 0, 7)

	weeklyCompleted, err := u.repo.CountWorkoutLogsInWeek(userID, weekStart, weekEnd)
	if err != nil {
		return nil, errors.Wrap(err, "[GamificationUsecase.GetProfile]: Failed to count weekly workouts")
	}

	userBadges, err := u.repo.GetUserBadges(userID)
	if err != nil {
		return nil, errors.Wrap(err, "[GamificationUsecase.GetProfile]: Failed to get user badges")
	}
	earnedBadges := make([]response.EarnedBadge, len(userBadges))
	for i, ub := range userBadges {
		earnedBadges[i] = response.EarnedBadge{
			ID:          ub.Badge.ID,
			Name:        ub.Badge.Name,
			DisplayName: ub.Badge.DisplayName,
			Description: ub.Badge.Description,
			IconURL:     ub.Badge.IconURL,
			EarnedAt:    ub.EarnedAt.Format("2006-01-02T15:04:05Z07:00"),
		}
	}

	xpEvents, err := u.repo.GetRecentXPEvents(userID, 5)
	if err != nil {
		return nil, errors.Wrap(err, "[GamificationUsecase.GetProfile]: Failed to get XP events")
	}
	recentEvents := make([]response.XPEventSummary, len(xpEvents))
	for i, ev := range xpEvents {
		desc := ""
		if ev.Description != nil {
			desc = *ev.Description
		}
		recentEvents[i] = response.XPEventSummary{
			ID:          ev.ID,
			EventType:   ev.EventType,
			XPAmount:    ev.XPAmount,
			Description: desc,
			CreatedAt:   ev.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		}
	}

	// Level math
	currentLevel := constant.LevelForXP(profile.TotalXP)
	nextLevelXP := constant.NextLevelXP(currentLevel)

	levelStartXP := 0
	if currentLevel < len(constant.LevelThresholds) {
		levelStartXP = constant.LevelThresholds[currentLevel]
	}

	xpProgress := profile.TotalXP - levelStartXP
	xpToNextLevel := 0
	if nextLevelXP > 0 {
		xpToNextLevel = nextLevelXP - profile.TotalXP
	}

	var lastWorkoutDateStr *string
	if profile.LastWorkoutDate != nil {
		s := profile.LastWorkoutDate.Format("2006-01-02")
		lastWorkoutDateStr = &s
	}

	return &response.GamificationProfileResponse{
		TotalXP:         profile.TotalXP,
		CurrentLevel:    currentLevel,
		NextLevelXP:     nextLevelXP,
		XPProgress:      xpProgress,
		XPToNextLevel:   xpToNextLevel,
		CurrentStreak:   profile.CurrentStreak,
		LongestStreak:   profile.LongestStreak,
		LastWorkoutDate: lastWorkoutDateStr,
		WeeklyTarget:    profile.WeeklyTarget,
		WeeklyCompleted: weeklyCompleted,
		Badges:          earnedBadges,
		RecentXPEvents:  recentEvents,
	}, nil
}

func (u *gamificationUsecase) GetBadges(userID uint) (*response.BadgesResponse, error) {
	allBadges, err := u.repo.GetAllBadges()
	if err != nil {
		return nil, errors.Wrap(err, "[GamificationUsecase.GetBadges]: Failed to get all badges")
	}

	userBadges, err := u.repo.GetUserBadges(userID)
	if err != nil {
		return nil, errors.Wrap(err, "[GamificationUsecase.GetBadges]: Failed to get user badges")
	}

	// Build earned map: badgeID → earnedAt
	earnedMap := make(map[uint]time.Time, len(userBadges))
	for _, ub := range userBadges {
		earnedMap[ub.BadgeID] = ub.EarnedAt
	}

	result := make([]response.BadgeWithStatus, len(allBadges))
	for i, b := range allBadges {
		earned := false
		var earnedAtStr *string
		if t, ok := earnedMap[b.ID]; ok {
			earned = true
			s := t.Format("2006-01-02T15:04:05Z07:00")
			earnedAtStr = &s
		}
		result[i] = response.BadgeWithStatus{
			ID:           b.ID,
			Name:         b.Name,
			DisplayName:  b.DisplayName,
			Description:  b.Description,
			IconURL:      b.IconURL,
			TriggerType:  b.TriggerType,
			TriggerValue: b.TriggerValue,
			XPReward:     b.XPReward,
			Earned:       earned,
			EarnedAt:     earnedAtStr,
		}
	}

	return &response.BadgesResponse{Badges: result}, nil
}

// ProcessWorkoutCompleted awards XP and checks badge eligibility after a workout is logged.
// Called as a best-effort goroutine — errors are returned but callers should log and ignore.
func (u *gamificationUsecase) ProcessWorkoutCompleted(userID uint, workoutLogID uint, workoutDate time.Time) error {
	profile, err := u.repo.GetOrCreateProfile(userID)
	if err != nil {
		return errors.Wrap(err, "[GamificationUsecase.ProcessWorkoutCompleted]: Failed to get profile")
	}

	// --- Streak calculation ---
	today := workoutDate.Truncate(24 * time.Hour)
	newStreak := u.calculateStreak(profile, today)

	// --- XP accumulation ---
	totalNewXP := 0

	// Base workout XP
	baseDesc := "Completed a workout"
	if err := u.repo.AddXPEvent(&models.XPEvent{
		UserID:        userID,
		EventType:     constant.XPEventWorkoutCompleted,
		XPAmount:      constant.XPWorkoutCompleted,
		Description:   &baseDesc,
		ReferenceID:   intPtr(int(workoutLogID)),
		ReferenceType: strPtr("workout_log"),
	}); err != nil {
		return errors.Wrap(err, "[GamificationUsecase.ProcessWorkoutCompleted]: Failed to record workout XP event")
	}
	totalNewXP += constant.XPWorkoutCompleted

	// Streak bonus XP
	streakBonusXP, streakBonusDesc := streakBonus(newStreak)
	if streakBonusXP > 0 {
		if err := u.repo.AddXPEvent(&models.XPEvent{
			UserID:      userID,
			EventType:   constant.XPEventStreakBonus,
			XPAmount:    streakBonusXP,
			Description: &streakBonusDesc,
		}); err != nil {
			return errors.Wrap(err, "[GamificationUsecase.ProcessWorkoutCompleted]: Failed to record streak bonus event")
		}
		totalNewXP += streakBonusXP
	}

	// Weekly goal check
	weekStart, weekEnd := currentWeekBounds(workoutDate)
	weeklyCompleted, err := u.repo.CountWorkoutLogsInWeek(userID, weekStart, weekEnd)
	if err != nil {
		return errors.Wrap(err, "[GamificationUsecase.ProcessWorkoutCompleted]: Failed to count weekly workouts")
	}
	if weeklyCompleted == profile.WeeklyTarget {
		weeklyDesc := "Weekly workout goal achieved!"
		if err := u.repo.AddXPEvent(&models.XPEvent{
			UserID:      userID,
			EventType:   constant.XPEventWeeklyGoal,
			XPAmount:    constant.XPWeeklyGoal,
			Description: &weeklyDesc,
		}); err != nil {
			return errors.Wrap(err, "[GamificationUsecase.ProcessWorkoutCompleted]: Failed to record weekly goal event")
		}
		totalNewXP += constant.XPWeeklyGoal
	}

	// --- Update profile ---
	newTotalXP := profile.TotalXP + totalNewXP
	newLevel := constant.LevelForXP(newTotalXP)

	longestStreak := profile.LongestStreak
	if newStreak > longestStreak {
		longestStreak = newStreak
	}

	profile.TotalXP = newTotalXP
	profile.CurrentLevel = newLevel
	profile.CurrentStreak = newStreak
	profile.LongestStreak = longestStreak
	profile.LastWorkoutDate = &today

	if err := u.repo.UpdateProfile(profile); err != nil {
		return errors.Wrap(err, "[GamificationUsecase.ProcessWorkoutCompleted]: Failed to update profile")
	}

	// --- Badge checks ---
	totalLogs, err := u.repo.CountTotalWorkoutLogs(userID)
	if err != nil {
		return errors.Wrap(err, "[GamificationUsecase.ProcessWorkoutCompleted]: Failed to count total workout logs")
	}

	type badgeCheck struct {
		name      string
		condition bool
	}
	checks := []badgeCheck{
		{"first_workout", totalLogs == 1},
		{"workouts_50", totalLogs == 50},
		{"workouts_100", totalLogs == 100},
		{"streak_7", newStreak >= 7},
		{"streak_30", newStreak >= 30},
		{"level_5", newLevel >= 5},
		{"level_10", newLevel >= 10},
	}

	for _, check := range checks {
		if !check.condition {
			continue
		}
		badge, err := u.repo.GetBadgeByName(check.name)
		if err != nil || badge == nil {
			continue
		}
		earned, err := u.repo.AwardBadge(userID, badge.ID)
		if err != nil || !earned {
			continue
		}
		// Award badge XP if configured
		if badge.XPReward > 0 {
			desc := "Badge earned: " + badge.DisplayName
			_ = u.repo.AddXPEvent(&models.XPEvent{
				UserID:        userID,
				EventType:     constant.XPEventBadgeEarned,
				XPAmount:      badge.XPReward,
				Description:   &desc,
				ReferenceID:   intPtr(int(badge.ID)),
				ReferenceType: strPtr("badge"),
			})
			profile.TotalXP += badge.XPReward
			profile.CurrentLevel = constant.LevelForXP(profile.TotalXP)
			_ = u.repo.UpdateProfile(profile)
		}
	}

	return nil
}

// ProcessProgramCompleted awards XP and checks badge eligibility when a user finishes a program.
// Called as a best-effort goroutine — errors are returned but callers should log and ignore.
func (u *gamificationUsecase) ProcessProgramCompleted(userID uint, userProgramID uint) error {
	profile, err := u.repo.GetOrCreateProfile(userID)
	if err != nil {
		return errors.Wrap(err, "[GamificationUsecase.ProcessProgramCompleted]: Failed to get profile")
	}

	// Award program completion XP
	desc := "Completed a training program"
	if err := u.repo.AddXPEvent(&models.XPEvent{
		UserID:        userID,
		EventType:     constant.XPEventProgramCompleted,
		XPAmount:      constant.XPProgramCompleted,
		Description:   &desc,
		ReferenceID:   intPtr(int(userProgramID)),
		ReferenceType: strPtr("user_program"),
	}); err != nil {
		return errors.Wrap(err, "[GamificationUsecase.ProcessProgramCompleted]: Failed to record program XP event")
	}

	newTotalXP := profile.TotalXP + constant.XPProgramCompleted
	newLevel := constant.LevelForXP(newTotalXP)
	profile.TotalXP = newTotalXP
	profile.CurrentLevel = newLevel

	if err := u.repo.UpdateProfile(profile); err != nil {
		return errors.Wrap(err, "[GamificationUsecase.ProcessProgramCompleted]: Failed to update profile")
	}

	// Badge checks: program_complete + level thresholds
	type badgeCheck struct {
		name      string
		condition bool
	}
	checks := []badgeCheck{
		{"program_complete", true}, // always try — AwardBadge is idempotent
		{"level_5", newLevel >= 5},
		{"level_10", newLevel >= 10},
	}

	for _, check := range checks {
		if !check.condition {
			continue
		}
		badge, err := u.repo.GetBadgeByName(check.name)
		if err != nil || badge == nil {
			continue
		}
		earned, err := u.repo.AwardBadge(userID, badge.ID)
		if err != nil || !earned {
			continue
		}
		if badge.XPReward > 0 {
			bdesc := "Badge earned: " + badge.DisplayName
			_ = u.repo.AddXPEvent(&models.XPEvent{
				UserID:        userID,
				EventType:     constant.XPEventBadgeEarned,
				XPAmount:      badge.XPReward,
				Description:   &bdesc,
				ReferenceID:   intPtr(int(badge.ID)),
				ReferenceType: strPtr("badge"),
			})
			profile.TotalXP += badge.XPReward
			profile.CurrentLevel = constant.LevelForXP(profile.TotalXP)
			_ = u.repo.UpdateProfile(profile)
		}
	}

	return nil
}

// ResetStaleStreaks sets current_streak = 0 for users who did not work out on or after yesterday.
func (u *gamificationUsecase) ResetStaleStreaks(yesterday time.Time) (int64, error) {
	affected, err := u.repo.ResetStaleStreaks(yesterday)
	return affected, errors.Wrap(err, "[GamificationUsecase.ResetStaleStreaks]")
}

// calculateStreak returns the new streak value based on the last workout date and today.
func (u *gamificationUsecase) calculateStreak(profile *models.UserGamificationProfile, today time.Time) int {
	if profile.LastWorkoutDate == nil {
		return 1
	}
	last := profile.LastWorkoutDate.Truncate(24 * time.Hour)
	diff := today.Sub(last)
	switch {
	case diff < 0:
		// workoutDate is in the past relative to last — treat as same day safety
		return profile.CurrentStreak
	case diff == 0:
		// Same day — idempotent, no streak change
		return profile.CurrentStreak
	case diff == 24*time.Hour:
		// Consecutive day — extend streak
		return profile.CurrentStreak + 1
	default:
		// Gap — reset to 1
		return 1
	}
}

// streakBonus returns bonus XP and description for notable streak milestones.
func streakBonus(streak int) (int, string) {
	switch streak {
	case 2:
		return constant.XPStreakBonus2Day, "2-day streak bonus!"
	case 3:
		return constant.XPStreakBonus3Day, "3-day streak bonus!"
	case 7:
		return constant.XPStreakBonus7Day, "7-day streak bonus!"
	default:
		return 0, ""
	}
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

func intPtr(v int) *int       { return &v }
func strPtr(v string) *string { return &v }
