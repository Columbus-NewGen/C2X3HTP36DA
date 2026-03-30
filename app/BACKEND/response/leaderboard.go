package response

type LeaderboardEntry struct {
	Rank       int     `json:"rank"`
	UserID     uint    `json:"user_id"`
	UserName   string  `json:"user_name"`
	AvatarURL  *string `json:"avatar_url"`
	Value      float64 `json:"value"`
	ValueLabel string  `json:"value_label"`
}

type LeaderboardResponse struct {
	Type    string             `json:"type"`
	Period  string             `json:"period"`
	Entries []LeaderboardEntry `json:"entries"`
}
