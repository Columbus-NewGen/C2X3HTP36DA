package response

import "time"

type FloorplanResponse struct {
	ID                 uint                        `json:"id"`
	Name               string                      `json:"name"`
	CanvasWidth        int                         `json:"canvas_width"`
	CanvasHeight       int                         `json:"canvas_height"`
	GridSize           int                         `json:"grid_size"`
	Description        string                      `json:"description"`
	IsActive           bool                        `json:"is_active"`
	CreatedAt          time.Time                   `json:"created_at"`
	UpdatedAt          time.Time                   `json:"updated_at"`
	Walls              []WallResponse              `json:"walls,omitempty"`
	EquipmentInstances []EquipmentInstanceResponse `json:"equipment_instances,omitempty"`
}

type WallResponse struct {
	ID          uint      `json:"id"`
	FloorplanID uint      `json:"floorplan_id"`
	StartX      float64   `json:"start_x"`
	StartY      float64   `json:"start_y"`
	EndX        float64   `json:"end_x"`
	EndY        float64   `json:"end_y"`
	Thickness   int       `json:"thickness"`
	Color       string    `json:"color"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type EquipmentInstanceResponse struct {
	ID          uint              `json:"id"`
	FloorplanID uint              `json:"floorplan_id"`
	EquipmentID uint              `json:"equipment_id"`
	Equipment   EquipmentResponse `json:"equipment"`
	PositionX   float64           `json:"position_x"`
	PositionY   float64           `json:"position_y"`
	Rotation    float64           `json:"rotation"`
	Width       int               `json:"width"`
	Height      int               `json:"height"`
	Label       string            `json:"label"`
	Status      string            `json:"status"`
	CreatedAt   time.Time         `json:"created_at"`
	UpdatedAt   time.Time         `json:"updated_at"`
}

// EquipmentInstanceBriefResponse is a slim DTO for equipment instances nested inside exercise equipment responses
type EquipmentInstanceBriefResponse struct {
	ID          uint    `json:"id"`
	FloorplanID uint    `json:"floorplan_id"`
	Label       string  `json:"label"`
	Status      string  `json:"status"`
	PositionX   float64 `json:"position_x"`
	PositionY   float64 `json:"position_y"`
	Rotation    float64 `json:"rotation"`
	Width       int     `json:"width"`
	Height      int     `json:"height"`
}

// EquipmentResponse is now defined in response/equipment.go
// This file now imports and uses that definition
