package delivery

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/utils"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

type analyticsHandler struct {
	analyticsUsecase domain.AnalyticsUsecase
}

func NewAnalyticsHandler(analyticsUsecase domain.AnalyticsUsecase) *analyticsHandler {
	return &analyticsHandler{
		analyticsUsecase: analyticsUsecase,
	}
}

// GetTrainerCount handles GET /api/v1/analytics/trainers/count
func (h *analyticsHandler) GetTrainerCount(c *gin.Context) {
	result, err := h.analyticsUsecase.GetTrainerCount()
	if err != nil {
		err = errors.Wrap(err, "[AnalyticsHandler.GetTrainerCount]: Error getting trainer count")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}
	c.JSON(http.StatusOK, result)
}

// GetUserCount handles GET /api/v1/analytics/users/count
func (h *analyticsHandler) GetUserCount(c *gin.Context) {
	result, err := h.analyticsUsecase.GetUserCount()
	if err != nil {
		err = errors.Wrap(err, "[AnalyticsHandler.GetUserCount]: Error getting user count")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}
	c.JSON(http.StatusOK, result)
}

// GetMachineStats handles GET /api/v1/analytics/machines/stats
func (h *analyticsHandler) GetMachineStats(c *gin.Context) {
	result, err := h.analyticsUsecase.GetMachineStats()
	if err != nil {
		err = errors.Wrap(err, "[AnalyticsHandler.GetMachineStats]: Error getting machine stats")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}
	c.JSON(http.StatusOK, result)
}
