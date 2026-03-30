package constant

// XP amounts awarded for different events
const (
	XPWorkoutCompleted = 50
	XPStreakBonus2Day  = 10
	XPStreakBonus3Day  = 20
	XPStreakBonus7Day  = 50
	XPWeeklyGoal       = 40
	XPProgramCompleted = 150
)

// XP event type identifiers
const (
	XPEventWorkoutCompleted = "WORKOUT_COMPLETED"
	XPEventStreakBonus      = "STREAK_BONUS"
	XPEventWeeklyGoal       = "WEEKLY_GOAL"
	XPEventProgramCompleted = "PROGRAM_COMPLETED"
	XPEventBadgeEarned      = "BADGE_EARNED"
)

// Badge trigger type identifiers
const (
	BadgeTriggerStreak       = "STREAK"
	BadgeTriggerProgram      = "PROGRAM"
	BadgeTriggerWorkoutCount = "WORKOUT_COUNT"
	BadgeTriggerLevel        = "LEVEL"
)

// ProgramCompletionThreshold is the minimum completion rate for a program to be marked COMPLETED (vs MISSED).
const ProgramCompletionThreshold = 0.70

// LevelThresholds[i] = minimum XP required for level i (index 0 unused).
var LevelThresholds = []int{0, 0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500, 10000, 13000, 17000, 22000, 28000}

// LevelForXP returns the current level for a given total XP.
func LevelForXP(xp int) int {
	level := 1
	for i := len(LevelThresholds) - 1; i >= 1; i-- {
		if xp >= LevelThresholds[i] {
			return i
		}
	}
	return level
}

// NextLevelXP returns the XP threshold for the next level (0 if at max level).
func NextLevelXP(currentLevel int) int {
	next := currentLevel + 1
	if next >= len(LevelThresholds) {
		return 0
	}
	return LevelThresholds[next]
}
