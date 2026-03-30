package response

type AuthResponse struct {
	User  UserResponse `json:"user"`
	Token string       `json:"token,omitempty"`
}
