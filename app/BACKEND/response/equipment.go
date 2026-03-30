package response

import (
	"fmt"
	"time"
)

// EquipmentResponse represents the response for equipment
type EquipmentResponse struct {
	ID            uint      `json:"id"`
	EquipmentName string    `json:"equipment_name"`
	EquipmentType string    `json:"equipment_type"`
	Description   string    `json:"description"`
	Status        string    `json:"status"`
	ImageURL      *string   `json:"image_url"`       // MinIO key
	ImageFullURL  *string   `json:"image_full_url"`  // Full URL (e.g., "/api/v1/media/equipment/uuid.jpg")
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// BuildImageURL converts a MinIO key to a full URL
// Returns nil if key is nil or empty
func BuildImageURL(key *string) *string {
	if key == nil || *key == "" {
		return nil
	}
	fullURL := fmt.Sprintf("/api/v1/media/%s", *key)
	return &fullURL
}
