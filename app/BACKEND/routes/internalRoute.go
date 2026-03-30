package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/gymmate/backend/database"
	gamificationRepository "github.com/gymmate/backend/feature/gamification/repository"
	gamificationUsecase "github.com/gymmate/backend/feature/gamification/usecase"
	cronDelivery "github.com/gymmate/backend/feature/cron/delivery"
	workoutRepository "github.com/gymmate/backend/feature/workout/repository"
	workoutUsecase "github.com/gymmate/backend/feature/workout/usecase"
	"github.com/gymmate/backend/middlewares"
)

// InternalRoutes registers /internal/* routes on the root engine (not /api/v1).
func InternalRoutes(app *gin.Engine) {
	gamificationRepo := gamificationRepository.NewGamificationRepository(database.DB)
	gamificationUC := gamificationUsecase.NewGamificationUsecase(gamificationRepo)

	workoutRepo := workoutRepository.NewWorkoutRepository(database.DB)
	workoutUC := workoutUsecase.NewWorkoutUsecase(workoutRepo, gamificationUC)

	handler := cronDelivery.NewInternalHandler(workoutUC)

	internal := app.Group("/internal")
	internal.Use(middlewares.CronSecretMiddleware())
	internal.POST("/cron/daily", handler.DailyCron)
	internal.POST("/programs/:id/auto-complete", handler.AutoCompleteProgram)
}
