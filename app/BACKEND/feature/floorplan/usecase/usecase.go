package usecase

import (
	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/models"
	"github.com/gymmate/backend/request"
	"github.com/gymmate/backend/response"
	"github.com/pkg/errors"
)

type floorplanUsecase struct {
	floorplanRepository domain.FloorplanRepository
}

func NewFloorplanUsecase(floorplanRepository domain.FloorplanRepository) domain.FloorplanUsecase {
	return &floorplanUsecase{floorplanRepository: floorplanRepository}
}

// Floorplan operations
func (u *floorplanUsecase) GetFloorplan(id uint) (*response.FloorplanResponse, error) {
	floorplan, err := u.floorplanRepository.GetFloorplanByID(id)
	if err != nil {
		return nil, errors.Wrap(err, "[FloorplanUsecase.GetFloorplan]: Error fetching floorplan")
	}
	if floorplan == nil {
		return nil, errors.New("floorplan not found")
	}

	return u.mapFloorplanToResponse(floorplan), nil
}

func (u *floorplanUsecase) GetActiveFloorplan() (*response.FloorplanResponse, error) {
	floorplan, err := u.floorplanRepository.GetActiveFloorplan()
	if err != nil {
		return nil, errors.Wrap(err, "[FloorplanUsecase.GetActiveFloorplan]: Error fetching active floorplan")
	}
	if floorplan == nil {
		return nil, errors.New("no active floorplan found")
	}

	return u.mapFloorplanToResponse(floorplan), nil
}

func (u *floorplanUsecase) CreateFloorplan(req *request.CreateFloorplanRequest) (*response.FloorplanResponse, error) {
	floorplan := &models.Floorplan{
		Name:         req.Name,
		CanvasWidth:  req.CanvasWidth,
		CanvasHeight: req.CanvasHeight,
		GridSize:     req.GridSize,
		Description:  req.Description,
		IsActive:     req.IsActive,
	}

	if err := u.floorplanRepository.CreateFloorplan(floorplan); err != nil {
		return nil, errors.Wrap(err, "[FloorplanUsecase.CreateFloorplan]: Error creating floorplan")
	}

	return u.mapFloorplanToResponse(floorplan), nil
}

func (u *floorplanUsecase) UpdateFloorplan(id uint, req *request.UpdateFloorplanRequest) (*response.FloorplanResponse, error) {
	floorplan, err := u.floorplanRepository.GetFloorplanByID(id)
	if err != nil {
		return nil, errors.Wrap(err, "[FloorplanUsecase.UpdateFloorplan]: Error fetching floorplan")
	}
	if floorplan == nil {
		return nil, errors.New("floorplan not found")
	}

	// Update fields
	if req.Name != "" {
		floorplan.Name = req.Name
	}
	if req.CanvasWidth > 0 {
		floorplan.CanvasWidth = req.CanvasWidth
	}
	if req.CanvasHeight > 0 {
		floorplan.CanvasHeight = req.CanvasHeight
	}
	if req.GridSize > 0 {
		floorplan.GridSize = req.GridSize
	}
	floorplan.Description = req.Description
	floorplan.IsActive = req.IsActive

	if err := u.floorplanRepository.UpdateFloorplan(floorplan); err != nil {
		return nil, errors.Wrap(err, "[FloorplanUsecase.UpdateFloorplan]: Error updating floorplan")
	}

	return u.mapFloorplanToResponse(floorplan), nil
}

func (u *floorplanUsecase) DeleteFloorplan(id uint) error {
	if err := u.floorplanRepository.DeleteFloorplan(id); err != nil {
		return errors.Wrap(err, "[FloorplanUsecase.DeleteFloorplan]: Error deleting floorplan")
	}
	return nil
}

// Wall operations
func (u *floorplanUsecase) CreateWall(req *request.CreateWallRequest) (*response.WallResponse, error) {
	wall := &models.FloorplanWall{
		FloorplanID: req.FloorplanID,
		StartX:      req.StartX,
		StartY:      req.StartY,
		EndX:        req.EndX,
		EndY:        req.EndY,
		Thickness:   req.Thickness,
		Color:       req.Color,
	}

	if err := u.floorplanRepository.CreateWall(wall); err != nil {
		return nil, errors.Wrap(err, "[FloorplanUsecase.CreateWall]: Error creating wall")
	}

	return u.mapWallToResponse(wall), nil
}

func (u *floorplanUsecase) UpdateWall(id uint, req *request.UpdateWallRequest) (*response.WallResponse, error) {
	wall, err := u.floorplanRepository.GetWallByID(id)
	if err != nil {
		return nil, errors.Wrap(err, "[FloorplanUsecase.UpdateWall]: Error fetching wall")
	}
	if wall == nil {
		return nil, errors.New("wall not found")
	}

	// Update fields
	if req.StartX != 0 {
		wall.StartX = req.StartX
	}
	if req.StartY != 0 {
		wall.StartY = req.StartY
	}
	if req.EndX != 0 {
		wall.EndX = req.EndX
	}
	if req.EndY != 0 {
		wall.EndY = req.EndY
	}
	if req.Thickness > 0 {
		wall.Thickness = req.Thickness
	}
	if req.Color != "" {
		wall.Color = req.Color
	}

	if err := u.floorplanRepository.UpdateWall(wall); err != nil {
		return nil, errors.Wrap(err, "[FloorplanUsecase.UpdateWall]: Error updating wall")
	}

	return u.mapWallToResponse(wall), nil
}

func (u *floorplanUsecase) DeleteWall(id uint) error {
	if err := u.floorplanRepository.DeleteWall(id); err != nil {
		return errors.Wrap(err, "[FloorplanUsecase.DeleteWall]: Error deleting wall")
	}
	return nil
}

func (u *floorplanUsecase) GetWallsByFloorplan(floorplanID uint) ([]response.WallResponse, error) {
	walls, err := u.floorplanRepository.GetWallsByFloorplanID(floorplanID)
	if err != nil {
		return nil, errors.Wrap(err, "[FloorplanUsecase.GetWallsByFloorplan]: Error fetching walls")
	}

	responses := make([]response.WallResponse, len(walls))
	for i, wall := range walls {
		responses[i] = *u.mapWallToResponse(&wall)
	}

	return responses, nil
}

// Equipment Instance operations
func (u *floorplanUsecase) CreateEquipmentInstance(req *request.CreateEquipmentInstanceRequest) (*response.EquipmentInstanceResponse, error) {
	instance := &models.EquipmentInstance{
		FloorplanID: req.FloorplanID,
		EquipmentID: req.EquipmentID,
		PositionX:   req.PositionX,
		PositionY:   req.PositionY,
		Rotation:    req.Rotation,
		Width:       req.Width,
		Height:      req.Height,
		Label:       req.Label,
	}

	if err := u.floorplanRepository.CreateEquipmentInstance(instance); err != nil {
		return nil, errors.Wrap(err, "[FloorplanUsecase.CreateEquipmentInstance]: Error creating equipment instance")
	}

	// Fetch instance with equipment details
	createdInstance, err := u.floorplanRepository.GetEquipmentInstanceByID(instance.ID)
	if err != nil {
		return nil, errors.Wrap(err, "[FloorplanUsecase.CreateEquipmentInstance]: Error fetching created equipment instance")
	}

	return u.mapEquipmentInstanceToResponse(createdInstance), nil
}

func (u *floorplanUsecase) UpdateEquipmentInstance(id uint, req *request.UpdateEquipmentInstanceRequest) (*response.EquipmentInstanceResponse, error) {
	instance, err := u.floorplanRepository.GetEquipmentInstanceByID(id)
	if err != nil {
		return nil, errors.Wrap(err, "[FloorplanUsecase.UpdateEquipmentInstance]: Error fetching equipment instance")
	}
	if instance == nil {
		return nil, errors.New("equipment instance not found")
	}

	// Update fields
	equipmentChanged := false
	if req.EquipmentID != 0 {
		instance.EquipmentID = req.EquipmentID
		instance.Equipment = models.Equipment{} // clear preloaded association so GORM uses EquipmentID
		equipmentChanged = true
	}
	if req.PositionX != 0 {
		instance.PositionX = req.PositionX
	}
	if req.PositionY != 0 {
		instance.PositionY = req.PositionY
	}
	if req.Rotation >= 0 && req.Rotation <= 360 {
		instance.Rotation = req.Rotation
	}
	if req.Width > 0 {
		instance.Width = req.Width
	}
	if req.Height > 0 {
		instance.Height = req.Height
	}
	if req.Label != "" {
		instance.Label = req.Label
	}

	if err := u.floorplanRepository.UpdateEquipmentInstance(instance); err != nil {
		return nil, errors.Wrap(err, "[FloorplanUsecase.UpdateEquipmentInstance]: Error updating equipment instance")
	}

	// Re-fetch to get updated equipment association when equipment changed
	if equipmentChanged {
		instance, err = u.floorplanRepository.GetEquipmentInstanceByID(id)
		if err != nil {
			return nil, errors.Wrap(err, "[FloorplanUsecase.UpdateEquipmentInstance]: Error fetching updated equipment instance")
		}
	}

	return u.mapEquipmentInstanceToResponse(instance), nil
}

func (u *floorplanUsecase) DeleteEquipmentInstance(id uint) error {
	if err := u.floorplanRepository.DeleteEquipmentInstance(id); err != nil {
		return errors.Wrap(err, "[FloorplanUsecase.DeleteEquipmentInstance]: Error deleting equipment instance")
	}
	return nil
}

func (u *floorplanUsecase) GetEquipmentInstancesByFloorplan(floorplanID uint) ([]response.EquipmentInstanceResponse, error) {
	instances, err := u.floorplanRepository.GetEquipmentInstancesByFloorplanID(floorplanID)
	if err != nil {
		return nil, errors.Wrap(err, "[FloorplanUsecase.GetEquipmentInstancesByFloorplan]: Error fetching equipment instances")
	}

	responses := make([]response.EquipmentInstanceResponse, len(instances))
	for i, instance := range instances {
		responses[i] = *u.mapEquipmentInstanceToResponse(&instance)
	}

	return responses, nil
}

// Helper mapping functions
func (u *floorplanUsecase) mapFloorplanToResponse(floorplan *models.Floorplan) *response.FloorplanResponse {
	resp := &response.FloorplanResponse{
		ID:           floorplan.ID,
		Name:         floorplan.Name,
		CanvasWidth:  floorplan.CanvasWidth,
		CanvasHeight: floorplan.CanvasHeight,
		GridSize:     floorplan.GridSize,
		Description:  floorplan.Description,
		IsActive:     floorplan.IsActive,
		CreatedAt:    floorplan.CreatedAt,
		UpdatedAt:    floorplan.UpdatedAt,
	}

	// Map walls
	if len(floorplan.Walls) > 0 {
		resp.Walls = make([]response.WallResponse, len(floorplan.Walls))
		for i, wall := range floorplan.Walls {
			resp.Walls[i] = *u.mapWallToResponse(&wall)
		}
	}

	// Map equipment instances
	if len(floorplan.EquipmentInstances) > 0 {
		resp.EquipmentInstances = make([]response.EquipmentInstanceResponse, len(floorplan.EquipmentInstances))
		for i, instance := range floorplan.EquipmentInstances {
			resp.EquipmentInstances[i] = *u.mapEquipmentInstanceToResponse(&instance)
		}
	}

	return resp
}

func (u *floorplanUsecase) mapWallToResponse(wall *models.FloorplanWall) *response.WallResponse {
	return &response.WallResponse{
		ID:          wall.ID,
		FloorplanID: wall.FloorplanID,
		StartX:      wall.StartX,
		StartY:      wall.StartY,
		EndX:        wall.EndX,
		EndY:        wall.EndY,
		Thickness:   wall.Thickness,
		Color:       wall.Color,
		CreatedAt:   wall.CreatedAt,
		UpdatedAt:   wall.UpdatedAt,
	}
}

func (u *floorplanUsecase) mapEquipmentInstanceToResponse(instance *models.EquipmentInstance) *response.EquipmentInstanceResponse {
	resp := &response.EquipmentInstanceResponse{
		ID:          instance.ID,
		FloorplanID: instance.FloorplanID,
		EquipmentID: instance.EquipmentID,
		PositionX:   instance.PositionX,
		PositionY:   instance.PositionY,
		Rotation:    instance.Rotation,
		Width:       instance.Width,
		Height:      instance.Height,
		Label:       instance.Label,
		Status:      instance.Status,
		CreatedAt:   instance.CreatedAt,
		UpdatedAt:   instance.UpdatedAt,
	}

	// Map equipment if loaded
	if instance.Equipment.ID != 0 {
		resp.Equipment = response.EquipmentResponse{
			ID:            instance.Equipment.ID,
			EquipmentName: instance.Equipment.EquipmentName,
			EquipmentType: instance.Equipment.EquipmentType,
			Description:   instance.Equipment.Description,
			Status:        instance.Equipment.Status,
			ImageURL:      instance.Equipment.ImageURL,
			ImageFullURL:  response.BuildImageURL(instance.Equipment.ImageURL),
			CreatedAt:     instance.Equipment.CreatedAt,
			UpdatedAt:     instance.Equipment.UpdatedAt,
		}
	}

	return resp
}
