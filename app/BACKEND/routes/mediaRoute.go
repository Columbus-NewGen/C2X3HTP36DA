package routes

import (
	"github.com/gin-gonic/gin"
	mediaHandler "github.com/gymmate/backend/feature/media/delivery"
	mediaRepository "github.com/gymmate/backend/feature/media/repository"
	mediaUsecase "github.com/gymmate/backend/feature/media/usecase"
	"github.com/gymmate/backend/middlewares"
)

// MediaRoutes registers all media-related routes
func MediaRoutes(v1 *gin.RouterGroup) {
	// Initialize layers: repository → usecase → handler
	mediaRepo := mediaRepository.NewMediaRepository()
	mediaUC := mediaUsecase.NewMediaUsecase(mediaRepo)
	handler := mediaHandler.NewMediaHandler(mediaUC)

	// Create media route group
	mediaRoutes := v1.Group("/media")
	{
		// Upload requires authentication and trainer/admin role
		mediaRoutes.POST("/upload",
			middlewares.AuthMiddleware(),
			middlewares.RoleMiddleware("trainer", "admin"),
			handler.Upload)

		// Retrieval is public (no authentication required)
		mediaRoutes.GET("/*key", handler.Retrieve)

		// Update requires authentication and trainer/admin role
		mediaRoutes.PUT("/*key",
			middlewares.AuthMiddleware(),
			middlewares.RoleMiddleware("trainer", "admin"),
			handler.Update)

		// Delete requires authentication and trainer/admin role
		mediaRoutes.DELETE("/*key",
			middlewares.AuthMiddleware(),
			middlewares.RoleMiddleware("trainer", "admin"),
			handler.Delete)
	}
}
