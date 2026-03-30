package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/gymmate/backend/database"
	flexsubHandler "github.com/gymmate/backend/feature/flexsub/delivery"
	flexsubRepository "github.com/gymmate/backend/feature/flexsub/repository"
	flexsubUsecase "github.com/gymmate/backend/feature/flexsub/usecase"
	"github.com/gymmate/backend/middlewares"
)

func FlexSubRoutes(v1 *gin.RouterGroup) {
	// Initialize layers
	flexsubRepo := flexsubRepository.NewFlexSubRepository(database.DB)
	flexsubUC := flexsubUsecase.NewFlexSubUsecase(flexsubRepo)
	flexsubH := flexsubHandler.NewFlexSubHandler(flexsubUC)

	// Flex Substitution routes - all protected by auth middleware
	flexSubRoutes := v1.Group("")
	flexSubRoutes.Use(middlewares.AuthMiddleware())
	{
		// Main flex substitution endpoint
		flexSubRoutes.POST("/flex-substitute", flexsubH.GetSubstitutions)

		// Status update endpoints
		flexSubRoutes.PUT("/equipment/:id/status", flexsubH.UpdateEquipmentStatus)
		flexSubRoutes.PUT("/floorplan/equipment-instances/:id/status", flexsubH.UpdateEquipmentInstanceStatus)
	}
}
