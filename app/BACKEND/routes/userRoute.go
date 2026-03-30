package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/gymmate/backend/database"
	mediaRepository "github.com/gymmate/backend/feature/media/repository"
	mediaUsecase "github.com/gymmate/backend/feature/media/usecase"
	progressRepository "github.com/gymmate/backend/feature/progress/repository"
	userHandler "github.com/gymmate/backend/feature/user/delivery"
	userRepository "github.com/gymmate/backend/feature/user/repository"
	userUsecase "github.com/gymmate/backend/feature/user/usecase"
	"github.com/gymmate/backend/middlewares"
)

func UserRoutes(v1 *gin.RouterGroup) {

	// Initialize user layers
	userRepository := userRepository.NewUserRepository(database.DB)
	progressRepo := progressRepository.NewProgressRepository(database.DB)
	userUsecase := userUsecase.NewUserUsecase(userRepository, progressRepo)

	// Initialize media layers
	mediaRepo := mediaRepository.NewMediaRepository()
	mediaUC := mediaUsecase.NewMediaUsecase(mediaRepo)

	// Create handler with both dependencies
	userHandler := userHandler.NewUserHandler(userUsecase, mediaUC)

	userRoutes := v1.Group("/users")

	// User's own progress (authenticated user)
	userRoutes.GET("/me/progress",
		middlewares.AuthMiddleware(),
		userHandler.GetMyProgress)

	// Progress trends (weekly time-series for muscle or exercise)
	userRoutes.GET("/me/progress/trends",
		middlewares.AuthMiddleware(),
		userHandler.GetMyProgressTrends)

	// Get all users (admin only)
	userRoutes.GET("",
		middlewares.AuthMiddleware(),
		middlewares.RoleMiddleware("admin"),
		userHandler.GetAllUsers)

	userRoutes.GET("/:userId",
		middlewares.AuthMiddleware(),
		middlewares.OwnershipOrTrainerMiddleware("userId"),
		userHandler.GetUser)

	// Weight history (owner or trainer)
	userRoutes.POST("/:userId/weight",
		middlewares.AuthMiddleware(),
		middlewares.OwnershipOrTrainerMiddleware("userId"),
		userHandler.LogWeight)
	userRoutes.GET("/:userId/weight",
		middlewares.AuthMiddleware(),
		middlewares.OwnershipOrTrainerMiddleware("userId"),
		userHandler.GetWeightHistory)
	userRoutes.DELETE("/:userId/weight/:entryId",
		middlewares.AuthMiddleware(),
		middlewares.OwnershipOrTrainerMiddleware("userId"),
		userHandler.DeleteWeightEntry)

	// Profile update (personal info) - owner or trainer
	userRoutes.PATCH("/:userId/profile",
		middlewares.AuthMiddleware(),
		middlewares.OwnershipOrTrainerMiddleware("userId"),
		userHandler.UpdateProfile)

	// Profile image update requires authentication and ownership
	userRoutes.PUT("/:userId/profile/image",
		middlewares.AuthMiddleware(),
		middlewares.OwnershipOrTrainerMiddleware("userId"),
		userHandler.UpdateProfileImage)

	// Trainer assignment (admin only)
	userRoutes.PUT("/:userId/trainer",
		middlewares.AuthMiddleware(),
		middlewares.RoleMiddleware("admin"),
		userHandler.AssignTrainer)

	// Unassign trainer (admin only)
	userRoutes.DELETE("/:userId/trainer",
		middlewares.AuthMiddleware(),
		middlewares.RoleMiddleware("admin"),
		userHandler.UnassignTrainer)

	// Update user status (admin only)
	userRoutes.PATCH("/:userId/status",
		middlewares.AuthMiddleware(),
		middlewares.RoleMiddleware("admin"),
		userHandler.UpdateStatus)

	// Update user role (admin only)
	userRoutes.PATCH("/:userId/role",
		middlewares.AuthMiddleware(),
		middlewares.RoleMiddleware("admin"),
		userHandler.UpdateRole)

	// Delete user (admin only)
	userRoutes.DELETE("/:userId",
		middlewares.AuthMiddleware(),
		middlewares.RoleMiddleware("admin"),
		userHandler.DeleteUser)

	// Trainer routes
	trainerRoutes := v1.Group("/trainers")
	trainerRoutes.Use(middlewares.AuthMiddleware())
	{
		// Get trainer's trainees (admin or trainer accessing self)
		trainerRoutes.GET("/:trainerId/trainees", userHandler.GetTrainerTrainees)

		// Trainer dashboard (trainer only, accessing self via "me")
		trainerRoutes.GET("/me/dashboard", userHandler.GetTrainerDashboard)

		// Trainee progress (trainer only)
		trainerRoutes.GET("/me/trainees/:traineeId/progress", userHandler.GetTraineeProgress)
	}
}
