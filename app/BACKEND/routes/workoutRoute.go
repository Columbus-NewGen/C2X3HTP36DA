package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/gymmate/backend/database"
	gamificationRepository "github.com/gymmate/backend/feature/gamification/repository"
	gamificationUsecase "github.com/gymmate/backend/feature/gamification/usecase"
	workoutDelivery "github.com/gymmate/backend/feature/workout/delivery"
	workoutRepository "github.com/gymmate/backend/feature/workout/repository"
	workoutUsecase "github.com/gymmate/backend/feature/workout/usecase"
	"github.com/gymmate/backend/middlewares"
)

func WorkoutRoutes(v1 *gin.RouterGroup) {
	// Initialize gamification layers (needed for XP awarding after workout logging)
	gamificationRepo := gamificationRepository.NewGamificationRepository(database.DB)
	gamificationUC := gamificationUsecase.NewGamificationUsecase(gamificationRepo)

	// Initialize workout layers (repository → usecase → handler)
	workoutRepo := workoutRepository.NewWorkoutRepository(database.DB)
	workoutUC := workoutUsecase.NewWorkoutUsecase(workoutRepo, gamificationUC)
	workoutH := workoutDelivery.NewWorkoutHandler(workoutUC)

	// User workout routes - protected by auth and ownership middleware
	userWorkoutRoutes := v1.Group("/users/:userId/workouts")
	userWorkoutRoutes.Use(
		middlewares.AuthMiddleware(),
		middlewares.OwnershipOrTrainerMiddleware("userId"),
	)
	{
		// Calendar/Scheduled workouts
		userWorkoutRoutes.GET("/calendar", workoutH.GetCalendarView)                          // Calendar view grouped by date
		userWorkoutRoutes.GET("/scheduled", workoutH.GetScheduledWorkouts)                    // Get scheduled workouts in date range
		userWorkoutRoutes.GET("/scheduled/:id", workoutH.GetScheduledWorkout)                 // Get specific scheduled workout
		userWorkoutRoutes.PUT("/scheduled/:id/status", workoutH.UpdateScheduledWorkoutStatus) // Update status (MISSED, SKIPPED)

		// Scheduled workout exercise CRUD
		userWorkoutRoutes.POST("/scheduled/:id/exercises", workoutH.AddScheduledWorkoutExercise)
		userWorkoutRoutes.PUT("/scheduled/:id/exercises/:exerciseId", workoutH.UpdateScheduledWorkoutExercise)
		userWorkoutRoutes.DELETE("/scheduled/:id/exercises/:exerciseId", workoutH.DeleteScheduledWorkoutExercise)

		// Workout logging
		userWorkoutRoutes.POST("/log", workoutH.LogWorkout)                                           // Log a workout
		userWorkoutRoutes.GET("/logs", workoutH.GetWorkoutLogs)                                       // Get workout logs with optional date filtering
		userWorkoutRoutes.GET("/logs/:logId", workoutH.GetWorkoutLog)                                 // Get specific workout log
		userWorkoutRoutes.POST("/logs/:logId/exercises", workoutH.AddLogExercise)                     // Add exercise to existing log
		userWorkoutRoutes.PUT("/logs/:logId/exercises/:exerciseLogId", workoutH.UpdateLogExercise)    // Update exercise in log
		userWorkoutRoutes.DELETE("/logs/:logId/exercises/:exerciseLogId", workoutH.DeleteLogExercise) // Delete exercise from log
	}
}
