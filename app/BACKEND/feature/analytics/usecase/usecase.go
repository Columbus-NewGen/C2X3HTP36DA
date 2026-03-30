package usecase

import (
	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/response"
	"github.com/pkg/errors"
)

type analyticsUsecase struct {
	analyticsRepository domain.AnalyticsRepository
}

func NewAnalyticsUsecase(analyticsRepository domain.AnalyticsRepository) domain.AnalyticsUsecase {
	return &analyticsUsecase{analyticsRepository: analyticsRepository}
}

func (u *analyticsUsecase) GetTrainerCount() (*response.CountResponse, error) {
	count, err := u.analyticsRepository.CountTrainers()
	if err != nil {
		return nil, errors.Wrap(err, "[AnalyticsUsecase.GetTrainerCount]: Error getting trainer count")
	}

	return &response.CountResponse{
		Count: count,
	}, nil
}

func (u *analyticsUsecase) GetUserCount() (*response.CountResponse, error) {
	count, err := u.analyticsRepository.CountUsers()
	if err != nil {
		return nil, errors.Wrap(err, "[AnalyticsUsecase.GetUserCount]: Error getting user count")
	}

	return &response.CountResponse{
		Count: count,
	}, nil
}

func (u *analyticsUsecase) GetMachineStats() (*response.MachineStatsResponse, error) {
	activeCount, err := u.analyticsRepository.CountActiveMachines()
	if err != nil {
		return nil, errors.Wrap(err, "[AnalyticsUsecase.GetMachineStats]: Error getting active machine count")
	}

	totalCount, err := u.analyticsRepository.CountTotalMachines()
	if err != nil {
		return nil, errors.Wrap(err, "[AnalyticsUsecase.GetMachineStats]: Error getting total machine count")
	}

	return &response.MachineStatsResponse{
		ActiveMachines: activeCount,
		TotalMachines:  totalCount,
	}, nil
}
