package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/gymmate/backend/database"
	muscleHandler "github.com/gymmate/backend/feature/muscle/delivery"
	muscleRepository "github.com/gymmate/backend/feature/muscle/repository"
	muscleUsecase "github.com/gymmate/backend/feature/muscle/usecase"
	"github.com/gymmate/backend/middlewares"
)

// MuscleRoutes registers all muscle-related routes
func MuscleRoutes(v1 *gin.RouterGroup) {
	repo := muscleRepository.NewMuscleRepository(database.DB)
	uc := muscleUsecase.NewMuscleUsecase(repo)
	handler := muscleHandler.NewMuscleHandler(uc)

	muscles := v1.Group("/muscles")
	muscles.Use(middlewares.AuthMiddleware())
	{
		muscles.GET("", handler.ListMuscles)
		muscles.GET("/groups", handler.ListMuscleGroups)
		muscles.GET("/groups/:id/muscles", handler.ListMusclesByGroup)
		muscles.GET("/:id/exercises", handler.ListExercisesByMuscle)
	}
}
