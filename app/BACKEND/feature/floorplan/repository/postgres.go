package repository

import (
	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/models"
	"github.com/pkg/errors"
	"gorm.io/gorm"
)

type floorplanRepository struct {
	db *gorm.DB
}

func NewFloorplanRepository(db *gorm.DB) domain.FloorplanRepository {
	return &floorplanRepository{db: db}
}

// Floorplan operations
func (r *floorplanRepository) GetFloorplanByID(id uint) (*models.Floorplan, error) {
	var floorplan models.Floorplan
	if err := r.db.Preload("Walls").Preload("EquipmentInstances.Equipment").First(&floorplan, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, errors.Wrap(err, "[FloorplanRepository.GetFloorplanByID]: Error querying database")
	}
	return &floorplan, nil
}

func (r *floorplanRepository) GetActiveFloorplan() (*models.Floorplan, error) {
	var floorplan models.Floorplan
	if err := r.db.Preload("Walls").Preload("EquipmentInstances.Equipment").Where("is_active = ?", true).First(&floorplan).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, errors.Wrap(err, "[FloorplanRepository.GetActiveFloorplan]: Error querying database")
	}
	return &floorplan, nil
}

func (r *floorplanRepository) CreateFloorplan(floorplan *models.Floorplan) error {
	// If setting as active, deactivate all others first
	if floorplan.IsActive {
		if err := r.db.Model(&models.Floorplan{}).Where("is_active = ?", true).Update("is_active", false).Error; err != nil {
			return errors.Wrap(err, "[FloorplanRepository.CreateFloorplan]: Error deactivating existing floorplans")
		}
	}

	if err := r.db.Create(floorplan).Error; err != nil {
		return errors.Wrap(err, "[FloorplanRepository.CreateFloorplan]: Error creating floorplan")
	}
	return nil
}

func (r *floorplanRepository) UpdateFloorplan(floorplan *models.Floorplan) error {
	// If setting as active, deactivate all others first
	if floorplan.IsActive {
		if err := r.db.Model(&models.Floorplan{}).Where("id != ? AND is_active = ?", floorplan.ID, true).Update("is_active", false).Error; err != nil {
			return errors.Wrap(err, "[FloorplanRepository.UpdateFloorplan]: Error deactivating existing floorplans")
		}
	}

	if err := r.db.Save(floorplan).Error; err != nil {
		return errors.Wrap(err, "[FloorplanRepository.UpdateFloorplan]: Error updating floorplan")
	}
	return nil
}

func (r *floorplanRepository) DeleteFloorplan(id uint) error {
	if err := r.db.Delete(&models.Floorplan{}, id).Error; err != nil {
		return errors.Wrap(err, "[FloorplanRepository.DeleteFloorplan]: Error deleting floorplan")
	}
	return nil
}

// Wall operations
func (r *floorplanRepository) CreateWall(wall *models.FloorplanWall) error {
	if err := r.db.Create(wall).Error; err != nil {
		return errors.Wrap(err, "[FloorplanRepository.CreateWall]: Error creating wall")
	}
	return nil
}

func (r *floorplanRepository) UpdateWall(wall *models.FloorplanWall) error {
	if err := r.db.Save(wall).Error; err != nil {
		return errors.Wrap(err, "[FloorplanRepository.UpdateWall]: Error updating wall")
	}
	return nil
}

func (r *floorplanRepository) DeleteWall(id uint) error {
	if err := r.db.Delete(&models.FloorplanWall{}, id).Error; err != nil {
		return errors.Wrap(err, "[FloorplanRepository.DeleteWall]: Error deleting wall")
	}
	return nil
}

func (r *floorplanRepository) GetWallsByFloorplanID(floorplanID uint) ([]models.FloorplanWall, error) {
	var walls []models.FloorplanWall
	if err := r.db.Where("floorplan_id = ?", floorplanID).Find(&walls).Error; err != nil {
		return nil, errors.Wrap(err, "[FloorplanRepository.GetWallsByFloorplanID]: Error querying database")
	}
	return walls, nil
}

func (r *floorplanRepository) GetWallByID(id uint) (*models.FloorplanWall, error) {
	var wall models.FloorplanWall
	if err := r.db.First(&wall, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, errors.Wrap(err, "[FloorplanRepository.GetWallByID]: Error querying database")
	}
	return &wall, nil
}

// Equipment Instance operations
func (r *floorplanRepository) CreateEquipmentInstance(instance *models.EquipmentInstance) error {
	if err := r.db.Create(instance).Error; err != nil {
		return errors.Wrap(err, "[FloorplanRepository.CreateEquipmentInstance]: Error creating equipment instance")
	}
	return nil
}

func (r *floorplanRepository) UpdateEquipmentInstance(instance *models.EquipmentInstance) error {
	if err := r.db.Save(instance).Error; err != nil {
		return errors.Wrap(err, "[FloorplanRepository.UpdateEquipmentInstance]: Error updating equipment instance")
	}
	return nil
}

func (r *floorplanRepository) DeleteEquipmentInstance(id uint) error {
	if err := r.db.Delete(&models.EquipmentInstance{}, id).Error; err != nil {
		return errors.Wrap(err, "[FloorplanRepository.DeleteEquipmentInstance]: Error deleting equipment instance")
	}
	return nil
}

func (r *floorplanRepository) GetEquipmentInstancesByFloorplanID(floorplanID uint) ([]models.EquipmentInstance, error) {
	var instances []models.EquipmentInstance
	if err := r.db.Preload("Equipment").Where("floorplan_id = ?", floorplanID).Find(&instances).Error; err != nil {
		return nil, errors.Wrap(err, "[FloorplanRepository.GetEquipmentInstancesByFloorplanID]: Error querying database")
	}
	return instances, nil
}

func (r *floorplanRepository) GetEquipmentInstanceByID(id uint) (*models.EquipmentInstance, error) {
	var instance models.EquipmentInstance
	if err := r.db.Preload("Equipment").First(&instance, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, errors.Wrap(err, "[FloorplanRepository.GetEquipmentInstanceByID]: Error querying database")
	}
	return &instance, nil
}
