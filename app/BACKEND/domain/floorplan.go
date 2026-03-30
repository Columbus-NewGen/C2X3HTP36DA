package domain

import (
	"github.com/gymmate/backend/models"
	"github.com/gymmate/backend/request"
	"github.com/gymmate/backend/response"
)

// FloorplanUsecase defines business logic for floorplan operations
type FloorplanUsecase interface {
	// Floorplan CRUD
	GetFloorplan(id uint) (*response.FloorplanResponse, error)
	GetActiveFloorplan() (*response.FloorplanResponse, error)
	CreateFloorplan(req *request.CreateFloorplanRequest) (*response.FloorplanResponse, error)
	UpdateFloorplan(id uint, req *request.UpdateFloorplanRequest) (*response.FloorplanResponse, error)
	DeleteFloorplan(id uint) error

	// Wall CRUD
	CreateWall(req *request.CreateWallRequest) (*response.WallResponse, error)
	UpdateWall(id uint, req *request.UpdateWallRequest) (*response.WallResponse, error)
	DeleteWall(id uint) error
	GetWallsByFloorplan(floorplanID uint) ([]response.WallResponse, error)

	// Equipment Instance CRUD
	CreateEquipmentInstance(req *request.CreateEquipmentInstanceRequest) (*response.EquipmentInstanceResponse, error)
	UpdateEquipmentInstance(id uint, req *request.UpdateEquipmentInstanceRequest) (*response.EquipmentInstanceResponse, error)
	DeleteEquipmentInstance(id uint) error
	GetEquipmentInstancesByFloorplan(floorplanID uint) ([]response.EquipmentInstanceResponse, error)
}

// FloorplanRepository defines data access for floorplan
type FloorplanRepository interface {
	// Floorplan operations
	GetFloorplanByID(id uint) (*models.Floorplan, error)
	GetActiveFloorplan() (*models.Floorplan, error)
	CreateFloorplan(floorplan *models.Floorplan) error
	UpdateFloorplan(floorplan *models.Floorplan) error
	DeleteFloorplan(id uint) error

	// Wall operations
	CreateWall(wall *models.FloorplanWall) error
	UpdateWall(wall *models.FloorplanWall) error
	DeleteWall(id uint) error
	GetWallsByFloorplanID(floorplanID uint) ([]models.FloorplanWall, error)
	GetWallByID(id uint) (*models.FloorplanWall, error)

	// Equipment Instance operations
	CreateEquipmentInstance(instance *models.EquipmentInstance) error
	UpdateEquipmentInstance(instance *models.EquipmentInstance) error
	DeleteEquipmentInstance(id uint) error
	GetEquipmentInstancesByFloorplanID(floorplanID uint) ([]models.EquipmentInstance, error)
	GetEquipmentInstanceByID(id uint) (*models.EquipmentInstance, error)
}
