package request

// FlexSubRequest is the main request for finding exercise substitutions
type FlexSubRequest struct {
	ExerciseID  uint  `json:"exercise_id" binding:"required"`
	EquipmentID *uint `json:"equipment_id"` // Optional: specific equipment being used
	FloorplanID *uint `json:"floorplan_id"` // Optional: defaults to active floorplan
}

// UpdateStatusRequest updates status of equipment or machine
type UpdateStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=ACTIVE MAINTENANCE"`
}
