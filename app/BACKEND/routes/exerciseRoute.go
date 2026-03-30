package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/gymmate/backend/database"
	exerciseHandler "github.com/gymmate/backend/feature/exercise/delivery"
	exerciseRepository "github.com/gymmate/backend/feature/exercise/repository"
	exerciseUsecase "github.com/gymmate/backend/feature/exercise/usecase"
	mediaRepository "github.com/gymmate/backend/feature/media/repository"
	mediaUsecase "github.com/gymmate/backend/feature/media/usecase"
	"github.com/gymmate/backend/middlewares"
)

// ExerciseRoutes registers all exercise-related routes
func ExerciseRoutes(v1 *gin.RouterGroup) {
	// Initialize exercise layers
	exerciseRepo := exerciseRepository.NewExerciseRepository(database.DB)
	exerciseUC := exerciseUsecase.NewExerciseUsecase(exerciseRepo)

	// Initialize media layers
	mediaRepo := mediaRepository.NewMediaRepository()
	mediaUC := mediaUsecase.NewMediaUsecase(mediaRepo)

	// Create handler with both dependencies
	handler := exerciseHandler.NewExerciseHandler(exerciseUC, mediaUC)

	// Create exercise route group with authentication
	exerciseRoutes := v1.Group("/exercises")
	exerciseRoutes.Use(middlewares.AuthMiddleware())
	{
		// Create requires trainer/admin role
		exerciseRoutes.POST("",
			middlewares.RoleMiddleware("trainer", "admin"),
			handler.Create)

		// Read operations (any authenticated user)
		exerciseRoutes.GET("/:id", handler.Get)
		exerciseRoutes.GET("/:id/substitutes", handler.GetSubstitutes)
		exerciseRoutes.GET("/:id/muscles", handler.GetMuscles)
		exerciseRoutes.GET("/:id/equipment", handler.GetEquipment)
		exerciseRoutes.GET("", handler.List)

		// Update requires trainer/admin role
		exerciseRoutes.PUT("/:id",
			middlewares.RoleMiddleware("trainer", "admin"),
			handler.Update)

		// Delete requires trainer/admin role
		exerciseRoutes.DELETE("/:id",
			middlewares.RoleMiddleware("trainer", "admin"),
			handler.Delete)
	}
}
