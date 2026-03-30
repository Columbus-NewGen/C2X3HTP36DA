package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/gymmate/backend/database"
	floorplanHandler "github.com/gymmate/backend/feature/floorplan/delivery"
	floorplanRepository "github.com/gymmate/backend/feature/floorplan/repository"
	floorplanUsecase "github.com/gymmate/backend/feature/floorplan/usecase"
	"github.com/gymmate/backend/middlewares"
)

func FloorplanRoutes(v1 *gin.RouterGroup) {
	// Initialize layers
	floorplanRepo := floorplanRepository.NewFloorplanRepository(database.DB)
	floorplanUC := floorplanUsecase.NewFloorplanUsecase(floorplanRepo)
	floorplanH := floorplanHandler.NewFloorplanHandler(floorplanUC)

	// Floorplan routes - all protected by auth middleware
	// Note: Role-based authorization will be added later
	floorplanRoutes := v1.Group("/floorplan")
	floorplanRoutes.Use(middlewares.AuthMiddleware())
	{
		// Floorplan CRUD - specific routes first
		floorplanRoutes.GET("/active", floorplanH.GetActiveFloorplan)

		// Wall CRUD - must come before generic /:id to avoid conflicts
		floorplanRoutes.GET("/:id/walls", floorplanH.GetWallsByFloorplan)
		floorplanRoutes.POST("/walls", floorplanH.CreateWall)
		floorplanRoutes.PUT("/walls/:id", floorplanH.UpdateWall)
		floorplanRoutes.DELETE("/walls/:id", floorplanH.DeleteWall)

		// Equipment Instance CRUD - must come before generic /:id to avoid conflicts
		floorplanRoutes.GET("/:id/equipment-instances", floorplanH.GetEquipmentInstancesByFloorplan)
		floorplanRoutes.POST("/equipment-instances", floorplanH.CreateEquipmentInstance)
		floorplanRoutes.PUT("/equipment-instances/:id", floorplanH.UpdateEquipmentInstance)
		floorplanRoutes.DELETE("/equipment-instances/:id", floorplanH.DeleteEquipmentInstance)

		// Generic floorplan routes - must come last to avoid wildcard conflicts
		floorplanRoutes.GET("/:id", floorplanH.GetFloorplan)
		floorplanRoutes.POST("", floorplanH.CreateFloorplan)
		floorplanRoutes.PUT("/:id", floorplanH.UpdateFloorplan)
		floorplanRoutes.DELETE("/:id", floorplanH.DeleteFloorplan)
	}
}
