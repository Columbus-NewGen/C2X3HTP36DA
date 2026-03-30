package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/gymmate/backend/database"
	gamificationDelivery "github.com/gymmate/backend/feature/gamification/delivery"
	gamificationRepository "github.com/gymmate/backend/feature/gamification/repository"
	gamificationUsecase "github.com/gymmate/backend/feature/gamification/usecase"
	"github.com/gymmate/backend/middlewares"
)

func GamificationRoutes(v1 *gin.RouterGroup) {
	repo := gamificationRepository.NewGamificationRepository(database.DB)
	uc := gamificationUsecase.NewGamificationUsecase(repo)
	handler := gamificationDelivery.NewGamificationHandler(uc)

	userGroup := v1.Group("/users")
	userGroup.GET("/me/gamification",
		middlewares.AuthMiddleware(),
		handler.GetMyGamification)
	userGroup.GET("/me/gamification/badges",
		middlewares.AuthMiddleware(),
		handler.GetMyBadges)
}
