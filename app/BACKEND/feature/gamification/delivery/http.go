package delivery

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/utils"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

type gamificationHandler struct {
	uc domain.GamificationUsecase
}

func NewGamificationHandler(uc domain.GamificationUsecase) *gamificationHandler {
	return &gamificationHandler{uc: uc}
}

// GetMyGamification handles GET /api/v1/users/me/gamification
func (h *gamificationHandler) GetMyGamification(c *gin.Context) {
	authenticatedUserID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	profile, err := h.uc.GetProfile(authenticatedUserID.(uint))
	if err != nil {
		err = errors.Wrap(err, "[GamificationHandler.GetMyGamification]: Failed to get gamification profile")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, profile)
}

// GetMyBadges handles GET /api/v1/users/me/gamification/badges
func (h *gamificationHandler) GetMyBadges(c *gin.Context) {
	authenticatedUserID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	badgesResp, err := h.uc.GetBadges(authenticatedUserID.(uint))
	if err != nil {
		err = errors.Wrap(err, "[GamificationHandler.GetMyBadges]: Failed to get badges")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, badgesResp)
}
