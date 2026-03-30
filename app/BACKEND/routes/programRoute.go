package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/gymmate/backend/database"
	gamificationRepository "github.com/gymmate/backend/feature/gamification/repository"
	gamificationUsecase "github.com/gymmate/backend/feature/gamification/usecase"
	programHandler "github.com/gymmate/backend/feature/program/delivery"
	programRepository "github.com/gymmate/backend/feature/program/repository"
	programUsecase "github.com/gymmate/backend/feature/program/usecase"
	"github.com/gymmate/backend/middlewares"
)

func ProgramRoutes(v1 *gin.RouterGroup) {
	// Initialize gamification layers (needed for XP awarding on program completion)
	gamificationRepo := gamificationRepository.NewGamificationRepository(database.DB)
	gamificationUC := gamificationUsecase.NewGamificationUsecase(gamificationRepo)

	// Initialize program layers
	programRepo := programRepository.NewProgramRepository(database.DB)
	programUC := programUsecase.NewProgramUsecase(programRepo, gamificationUC)
	programH := programHandler.NewProgramHandler(programUC)

	// Program routes - all protected by auth middleware
	programRoutes := v1.Group("/programs")
	programRoutes.Use(middlewares.AuthMiddleware())
	{
		// Program CRUD
		programRoutes.POST("", middlewares.RoleMiddleware("trainer", "admin"), programH.CreateProgram)       // Create program/template
		programRoutes.GET("", programH.ListPrograms)                                                         // List programs (with filters)
		programRoutes.GET("/:id", programH.GetProgram)                                                       // Get program details
		programRoutes.PUT("/:id", middlewares.RoleMiddleware("trainer", "admin"), programH.UpdateProgram)    // Update program
		programRoutes.DELETE("/:id", middlewares.RoleMiddleware("trainer", "admin"), programH.DeleteProgram) // Delete program
	}

	// User program assignment routes - protected by auth and ownership middleware
	userProgramRoutes := v1.Group("/users/:userId/programs")
	userProgramRoutes.Use(
		middlewares.AuthMiddleware(),
		middlewares.OwnershipOrTrainerMiddleware("userId"),
	)
	{
		userProgramRoutes.POST("", programH.AssignProgram)                     // Assign template to user
		userProgramRoutes.GET("", programH.GetUserPrograms)                   // Get user's programs
		userProgramRoutes.GET("/:programId", programH.GetUserProgramDetail)   // Get user program detail with rates
		userProgramRoutes.PUT("/:programId", programH.UpdateUserProgram)      // Update user program progress
	}
}
