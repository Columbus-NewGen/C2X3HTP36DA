package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/gymmate/backend/database"
	equipmentHandler "github.com/gymmate/backend/feature/equipment/delivery"
	equipmentRepository "github.com/gymmate/backend/feature/equipment/repository"
	equipmentUsecase "github.com/gymmate/backend/feature/equipment/usecase"
	mediaRepository "github.com/gymmate/backend/feature/media/repository"
	mediaUsecase "github.com/gymmate/backend/feature/media/usecase"
	"github.com/gymmate/backend/middlewares"
)

// EquipmentRoutes registers all equipment-related routes
func EquipmentRoutes(v1 *gin.RouterGroup) {
	// Initialize equipment layers
	equipmentRepo := equipmentRepository.NewEquipmentRepository(database.DB)
	equipmentUC := equipmentUsecase.NewEquipmentUsecase(equipmentRepo)

	// Initialize media layers
	mediaRepo := mediaRepository.NewMediaRepository()
	mediaUC := mediaUsecase.NewMediaUsecase(mediaRepo)

	// Create handler with both dependencies
	handler := equipmentHandler.NewEquipmentHandler(equipmentUC, mediaUC)

	// Create equipment route group with authentication
	equipmentRoutes := v1.Group("/equipment")
	equipmentRoutes.Use(middlewares.AuthMiddleware())
	{
		// Create requires trainer/admin role
		equipmentRoutes.POST("",
			middlewares.RoleMiddleware("trainer", "admin"),
			handler.Create)

		// Read operations (any authenticated user)
		equipmentRoutes.GET("/:id", handler.Get)
		equipmentRoutes.GET("/:id/exercises", handler.GetExercises)
		equipmentRoutes.GET("", handler.List)

		// Update requires trainer/admin role
		equipmentRoutes.PUT("/:id",
			middlewares.RoleMiddleware("trainer", "admin"),
			handler.Update)

		// Delete requires trainer/admin role
		equipmentRoutes.DELETE("/:id",
			middlewares.RoleMiddleware("trainer", "admin"),
			handler.Delete)
	}
}
