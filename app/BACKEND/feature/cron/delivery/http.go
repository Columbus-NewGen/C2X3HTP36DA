package delivery

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/utils"
	log "github.com/sirupsen/logrus"
)

type internalHandler struct {
	workoutUC domain.WorkoutUsecase
}

func NewInternalHandler(workoutUC domain.WorkoutUsecase) *internalHandler {
	return &internalHandler{workoutUC: workoutUC}
}

// DailyCron handles POST /internal/cron/daily.
// Step 1: mark past SCHEDULED workouts as MISSED (also fires program auto-close goroutines).
// Step 2: reset stale current_streaks for users who missed yesterday.
func (h *internalHandler) DailyCron(c *gin.Context) {
	log.Info("[DailyCron]: starting daily cron job")

	log.Info("[DailyCron]: step 1 — marking missed workouts")
	if err := h.workoutUC.MarkMissedWorkouts(); err != nil {
		log.Warnf("[DailyCron]: MarkMissedWorkouts error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		return
	}
	log.Info("[DailyCron]: step 1 complete")

	log.Info("[DailyCron]: step 2 — resetting stale streaks")
	if err := h.workoutUC.ResetStaleStreaks(); err != nil {
		log.Warnf("[DailyCron]: ResetStaleStreaks error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		return
	}
	log.Info("[DailyCron]: step 2 complete")

	log.Info("[DailyCron]: daily cron completed successfully")
	c.JSON(http.StatusOK, gin.H{"message": "daily cron completed successfully"})
}

// AutoCompleteProgram handles POST /internal/programs/:id/auto-complete.
// Triggers the auto-complete check for a specific user_program synchronously.
func (h *internalHandler) AutoCompleteProgram(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid program id"})
		return
	}

	if err := h.workoutUC.RunAutoCompleteProgram(uint(id)); err != nil {
		log.Warnf("[AutoCompleteProgram]: error for program %d: %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "auto-complete check ran successfully"})
}
