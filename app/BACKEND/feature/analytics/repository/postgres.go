package repository

import (
	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/models"
	"github.com/pkg/errors"
	"gorm.io/gorm"
)

type analyticsRepository struct {
	db *gorm.DB
}

func NewAnalyticsRepository(db *gorm.DB) domain.AnalyticsRepository {
	return &analyticsRepository{db: db}
}

func (r *analyticsRepository) CountTrainers() (int64, error) {
	var count int64
	if err := r.db.Model(&models.User{}).Where("role = ?", "trainer").Count(&count).Error; err != nil {
		return 0, errors.Wrap(err, "[AnalyticsRepository.CountTrainers]: Error counting trainers")
	}
	return count, nil
}

func (r *analyticsRepository) CountUsers() (int64, error) {
	var count int64
	if err := r.db.Model(&models.User{}).Where("role = ?", "user").Count(&count).Error; err != nil {
		return 0, errors.Wrap(err, "[AnalyticsRepository.CountUsers]: Error counting users")
	}
	return count, nil
}

func (r *analyticsRepository) CountActiveMachines() (int64, error) {
	var count int64
	if err := r.db.Model(&models.EquipmentInstance{}).
		Where("status = ?", "ACTIVE").
		Count(&count).Error; err != nil {
		return 0, errors.Wrap(err, "[AnalyticsRepository.CountActiveMachines]: Error counting active equipment instances")
	}
	return count, nil
}

func (r *analyticsRepository) CountTotalMachines() (int64, error) {
	var count int64
	if err := r.db.Model(&models.EquipmentInstance{}).
		Count(&count).Error; err != nil {
		return 0, errors.Wrap(err, "[AnalyticsRepository.CountTotalMachines]: Error counting total equipment instances")
	}
	return count, nil
}
