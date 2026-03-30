package domain

import "github.com/gymmate/backend/response"

type AnalyticsUsecase interface {
	GetTrainerCount() (*response.CountResponse, error)
	GetUserCount() (*response.CountResponse, error)
	GetMachineStats() (*response.MachineStatsResponse, error)
}

type AnalyticsRepository interface {
	CountTrainers() (int64, error)
	CountUsers() (int64, error)
	CountActiveMachines() (int64, error)
	CountTotalMachines() (int64, error)
}
