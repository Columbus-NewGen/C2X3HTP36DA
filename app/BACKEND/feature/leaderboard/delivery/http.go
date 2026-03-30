package delivery

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/utils"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

type leaderboardHandler struct {
	uc domain.LeaderboardUsecase
}

func NewLeaderboardHandler(uc domain.LeaderboardUsecase) *leaderboardHandler {
	return &leaderboardHandler{uc: uc}
}

// GetLeaderboard handles GET /api/v1/leaderboard?type=...&period=...&limit=...
func (h *leaderboardHandler) GetLeaderboard(c *gin.Context) {
	leaderType := c.Query("type")
	period := c.Query("period")

	if leaderType == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "query param 'type' is required (program|streak|volume)"})
		return
	}
	if period == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "query param 'period' is required (week|month|alltime)"})
		return
	}

	limit := 10
	if limitStr := c.Query("limit"); limitStr != "" {
		parsed, err := strconv.Atoi(limitStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "query param 'limit' must be an integer"})
			return
		}
		limit = parsed
	}

	result, err := h.uc.GetLeaderboard(leaderType, period, limit)
	if err != nil {
		// Distinguish validation errors (returned as plain fmt.Errorf) from infra errors
		wrapped := errors.Wrap(err, "[LeaderboardHandler.GetLeaderboard]")
		// If the error originates from usecase validation (no wrapped cause), treat as 400
		if errors.Cause(err) == err {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			log.Warn(wrapped)
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(wrapped)})
		log.Warn(wrapped)
		return
	}

	c.JSON(http.StatusOK, result)
}
