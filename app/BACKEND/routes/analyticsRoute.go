package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/gymmate/backend/database"
	analyticsHandler "github.com/gymmate/backend/feature/analytics/delivery"
	analyticsRepository "github.com/gymmate/backend/feature/analytics/repository"
	analyticsUsecase "github.com/gymmate/backend/feature/analytics/usecase"
	"github.com/gymmate/backend/middlewares"
)

func AnalyticsRoutes(v1 *gin.RouterGroup) {
	// Initialize analytics layers
	analyticsRepo := analyticsRepository.NewAnalyticsRepository(database.DB)
	analyticsUC := analyticsUsecase.NewAnalyticsUsecase(analyticsRepo)
	analyticsHandler := analyticsHandler.NewAnalyticsHandler(analyticsUC)

	// All analytics routes require authentication
	analyticsRoutes := v1.Group("/analytics")
	analyticsRoutes.Use(middlewares.AuthMiddleware())
	{
		analyticsRoutes.GET("/trainers/count", analyticsHandler.GetTrainerCount)
		analyticsRoutes.GET("/users/count", analyticsHandler.GetUserCount)
		analyticsRoutes.GET("/equipment-instances/stats", analyticsHandler.GetMachineStats)
	}
}
