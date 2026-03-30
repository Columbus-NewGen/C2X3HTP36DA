package delivery

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/request"
	"github.com/gymmate/backend/utils"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

type authHandler struct {
	authUsecase domain.AuthUsecase
}

func NewAuthHandler(authUsecase domain.AuthUsecase) *authHandler {
	return &authHandler{authUsecase: authUsecase}
}

func (h *authHandler) Register(c *gin.Context) {
	var req request.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		err = errors.Wrap(err, "[AuthHandler.Register]: Invalid request body")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	authResponse, err := h.authUsecase.Register(&req)
	if err != nil {
		if err.Error() == "email already registered" {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		err = errors.Wrap(err, "[AuthHandler.Register]: Error registering user")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	// Set cookie
	c.SetCookie("token", authResponse.Token, 3600, "/", "", false, true)

	c.JSON(http.StatusCreated, gin.H{
		"message": "user registered successfully",
		"user":    authResponse.User,
		"token":   authResponse.Token,
	})
}

func (h *authHandler) Login(c *gin.Context) {
	var req request.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		err = errors.Wrap(err, "[AuthHandler.Login]: Invalid request body")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	authResponse, err := h.authUsecase.Login(&req)
	if err != nil {
		if err.Error() == "invalid email or password" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		err = errors.Wrap(err, "[AuthHandler.Login]: Error logging in")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	// Set cookie
	c.SetCookie("token", authResponse.Token, 3600, "/", "", false, true)

	c.JSON(http.StatusOK, gin.H{
		"message": "login successful",
		"user":    authResponse.User,
		"token":   authResponse.Token,
	})
}

