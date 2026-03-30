package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/gymmate/backend/database"
	leaderboardDelivery "github.com/gymmate/backend/feature/leaderboard/delivery"
	leaderboardRepository "github.com/gymmate/backend/feature/leaderboard/repository"
	leaderboardUsecase "github.com/gymmate/backend/feature/leaderboard/usecase"
	"github.com/gymmate/backend/middlewares"
)

func LeaderboardRoutes(v1 *gin.RouterGroup) {
	repo := leaderboardRepository.NewLeaderboardRepository(database.DB)
	uc := leaderboardUsecase.NewLeaderboardUsecase(repo)
	handler := leaderboardDelivery.NewLeaderboardHandler(uc)

	leaderboardRoutes := v1.Group("/leaderboard")
	leaderboardRoutes.Use(middlewares.AuthMiddleware())
	{
		leaderboardRoutes.GET("", handler.GetLeaderboard)
	}
}
