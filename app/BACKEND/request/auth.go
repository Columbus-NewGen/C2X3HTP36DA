package request

type RegisterRequest struct {
	Email    string  `json:"email" binding:"required,email"`
	Password string  `json:"password" binding:"required,min=6"`
	Name     string  `json:"name" binding:"required"`
	Secret   *string `json:"secret,omitempty"`  // Optional backdoor secret for role assignment
	Role     *string `json:"role,omitempty"`    // Optional role (requires valid secret)
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}
