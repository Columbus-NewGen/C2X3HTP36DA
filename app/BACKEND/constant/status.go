package constant

// Equipment and Machine status constants
const (
	StatusActive      = "ACTIVE"
	StatusMaintenance = "MAINTENANCE"
)

// User status constants
const (
	UserStatusActive    = "ACTIVE"
	UserStatusSuspended = "SUSPENDED"
)

// Substitution type constants
const (
	SubstitutionTypeSameExercise = "SAME_EXERCISE"
	SubstitutionTypeSameMuscle   = "SAME_MUSCLE"
)

// User Program status constants
const (
	UserProgramStatusActive    = "ACTIVE"
	UserProgramStatusCompleted = "COMPLETED"
	UserProgramStatusPaused    = "PAUSED"
	UserProgramStatusCancelled = "CANCELLED"
	UserProgramStatusMissed    = "MISSED"
)

// Workout status constants
const (
	WorkoutStatusScheduled  = "SCHEDULED"
	WorkoutStatusInProgress = "IN_PROGRESS"
	WorkoutStatusCompleted  = "COMPLETED"
	WorkoutStatusMissed     = "MISSED"
	WorkoutStatusSkipped    = "SKIPPED"
	WorkoutStatusCancelled  = "CANCELLED"
)

// Day of week constants (1=Monday, 7=Sunday, following ISO 8601)
const (
	Monday    = 1
	Tuesday   = 2
	Wednesday = 3
	Thursday  = 4
	Friday    = 5
	Saturday  = 6
	Sunday    = 7
)
