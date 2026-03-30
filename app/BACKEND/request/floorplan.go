package request

// Floorplan requests
type CreateFloorplanRequest struct {
	Name         string `json:"name" binding:"required"`
	CanvasWidth  int    `json:"canvas_width" binding:"required,gt=0"`
	CanvasHeight int    `json:"canvas_height" binding:"required,gt=0"`
	GridSize     int    `json:"grid_size" binding:"omitempty,gt=0"`
	Description  string `json:"description"`
	IsActive     bool   `json:"is_active"`
}

type UpdateFloorplanRequest struct {
	Name         string `json:"name"`
	CanvasWidth  int    `json:"canvas_width" binding:"omitempty,gt=0"`
	CanvasHeight int    `json:"canvas_height" binding:"omitempty,gt=0"`
	GridSize     int    `json:"grid_size" binding:"omitempty,gt=0"`
	Description  string `json:"description"`
	IsActive     bool   `json:"is_active"`
}

// Wall requests
type CreateWallRequest struct {
	FloorplanID uint    `json:"floorplan_id" binding:"required"`
	StartX      float64 `json:"start_x" binding:"required"`
	StartY      float64 `json:"start_y" binding:"required"`
	EndX        float64 `json:"end_x" binding:"required"`
	EndY        float64 `json:"end_y" binding:"required"`
	Thickness   int     `json:"thickness" binding:"omitempty,gt=0"`
	Color       string  `json:"color" binding:"omitempty,hexcolor"`
}

type UpdateWallRequest struct {
	StartX    float64 `json:"start_x"`
	StartY    float64 `json:"start_y"`
	EndX      float64 `json:"end_x"`
	EndY      float64 `json:"end_y"`
	Thickness int     `json:"thickness" binding:"omitempty,gt=0"`
	Color     string  `json:"color" binding:"omitempty,hexcolor"`
}

// Equipment Instance requests
type CreateEquipmentInstanceRequest struct {
	FloorplanID uint    `json:"floorplan_id" binding:"required"`
	EquipmentID uint    `json:"equipment_id" binding:"required"`
	PositionX   float64 `json:"position_x" binding:"required"`
	PositionY   float64 `json:"position_y" binding:"required"`
	Rotation    float64 `json:"rotation" binding:"omitempty,gte=0,lte=360"`
	Width       int     `json:"width" binding:"required,gt=0"`
	Height      int     `json:"height" binding:"required,gt=0"`
	Label       string  `json:"label"`
}

type UpdateEquipmentInstanceRequest struct {
	EquipmentID uint    `json:"equipment_id"`
	PositionX   float64 `json:"position_x"`
	PositionY   float64 `json:"position_y"`
	Rotation    float64 `json:"rotation" binding:"omitempty,gte=0,lte=360"`
	Width       int     `json:"width" binding:"omitempty,gt=0"`
	Height      int     `json:"height" binding:"omitempty,gt=0"`
	Label       string  `json:"label"`
}
