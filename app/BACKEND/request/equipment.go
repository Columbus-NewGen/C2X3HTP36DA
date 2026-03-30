package request

// CreateEquipmentRequest represents the request to create equipment
type CreateEquipmentRequest struct {
	EquipmentName string  `json:"equipment_name" form:"equipment_name" binding:"required"`
	EquipmentType string  `json:"equipment_type" form:"equipment_type" binding:"required,oneof=machine free_weight bodyweight cable facility area"`
	Description   string  `json:"description" form:"description"`
	ImageURL      *string `json:"image_url" form:"image_url"` // Optional MinIO key (for JSON approach)
}

// UpdateEquipmentRequest represents the request to update equipment
type UpdateEquipmentRequest struct {
	EquipmentName *string `json:"equipment_name" form:"equipment_name"`
	EquipmentType *string `json:"equipment_type" form:"equipment_type" binding:"omitempty,oneof=machine free_weight bodyweight cable facility area"`
	Description   *string `json:"description" form:"description"`
	Status        *string `json:"status" form:"status" binding:"omitempty,oneof=ACTIVE MAINTENANCE"`
	ImageURL      *string `json:"image_url" form:"image_url"` // Optional MinIO key (for JSON approach)
}
