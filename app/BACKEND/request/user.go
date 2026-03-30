package request

type UserRequest struct {
	Firstname string `json:"firstname" binding:"required"`
	Lastname  string `json:"lastname" binding:"required"`
	Age       int    `json:"age" binding:"required"`
}

// UpdateProfileImageRequest represents the request body for updating a user's profile image
type UpdateProfileImageRequest struct {
	ImageURL string `json:"image_url" form:"image_url" binding:"required"` // MinIO key (for JSON approach)
}

// AssignTrainerRequest is used to assign a trainer to a user
type AssignTrainerRequest struct {
	TrainerID uint `json:"trainer_id" binding:"required"`
}

// UpdateUserStatusRequest is used to update a user's status (admin only)
type UpdateUserStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=ACTIVE SUSPENDED"`
}

// UpdateUserRoleRequest is used to update a user's role (admin only)
type UpdateUserRoleRequest struct {
	Role string `json:"role" binding:"required,oneof=user trainer admin"`
}

// LogWeightRequest is used to log a weight entry
type LogWeightRequest struct {
	WeightKg   float64 `json:"weight_kg"   binding:"required,gt=0"`
	RecordedAt *string `json:"recorded_at"` // RFC3339 e.g. "2026-03-02T07:30:00Z", defaults to time.Now() if omitted
	Note       *string `json:"note"`
}

// UpdateProfileRequest is used to update a user's personal profile info
type UpdateProfileRequest struct {
	DateOfBirth  *string `json:"date_of_birth"`                                                                    // "YYYY-MM-DD"
	Gender       *string `json:"gender"        binding:"omitempty,oneof=male female other"`
	HeightCm     *int    `json:"height_cm"     binding:"omitempty,min=1,max=300"`
	FitnessLevel *string `json:"fitness_level" binding:"omitempty,oneof=beginner intermediate advanced"`
	FitnessGoal  *string `json:"fitness_goal"  binding:"omitempty,oneof=weight_loss muscle_gain endurance maintenance"`
	Phone        *string `json:"phone"`
	Bio          *string `json:"bio"`
}
