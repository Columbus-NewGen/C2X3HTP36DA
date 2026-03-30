package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/gymmate/backend/database"
	authHandler "github.com/gymmate/backend/feature/auth/delivery"
	authRepository "github.com/gymmate/backend/feature/auth/repository"
	authUsecase "github.com/gymmate/backend/feature/auth/usecase"
)

func AuthRoutes(v1 *gin.RouterGroup) {
	authRepository := authRepository.NewAuthRepository(database.DB)
	authUsecase := authUsecase.NewAuthUsecase(authRepository)
	authHandler := authHandler.NewAuthHandler(authUsecase)

	authRoutes := v1.Group("/auth")
	{
		authRoutes.POST("/register", authHandler.Register)
		authRoutes.POST("/login", authHandler.Login)
	}
}

