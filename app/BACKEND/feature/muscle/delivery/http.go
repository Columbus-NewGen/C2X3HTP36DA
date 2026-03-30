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

type muscleHandler struct {
	muscleUsecase domain.MuscleUsecase
}

// NewMuscleHandler creates a new muscle handler instance
func NewMuscleHandler(muscleUsecase domain.MuscleUsecase) *muscleHandler {
	return &muscleHandler{muscleUsecase: muscleUsecase}
}

// ListMuscles handles retrieving all muscles
// GET /muscles
func (h *muscleHandler) ListMuscles(c *gin.Context) {
	result, err := h.muscleUsecase.ListMuscles()
	if err != nil {
		err = errors.Wrap(err, "[MuscleHandler.ListMuscles]: Failed to list muscles")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"muscles": result,
		"count":   len(result),
	})
}

// ListMuscleGroups handles retrieving all muscle groups
// GET /muscles/groups
func (h *muscleHandler) ListMuscleGroups(c *gin.Context) {
	result, err := h.muscleUsecase.ListMuscleGroups()
	if err != nil {
		err = errors.Wrap(err, "[MuscleHandler.ListMuscleGroups]: Failed to list muscle groups")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"muscle_groups": result,
		"count":         len(result),
	})
}

// ListExercisesByMuscle handles retrieving exercises that target a specific muscle
// GET /muscles/:id/exercises
func (h *muscleHandler) ListExercisesByMuscle(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[MuscleHandler.ListExercisesByMuscle]: Invalid muscle ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	result, err := h.muscleUsecase.ListExercisesByMuscleID(uint(id))
	if err != nil {
		err = errors.Wrap(err, "[MuscleHandler.ListExercisesByMuscle]: Failed to list exercises by muscle")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"muscle_id": uint(id),
		"exercises": result,
		"count":     len(result),
	})
}

// ListMusclesByGroup handles retrieving muscles by group ID
// GET /muscles/groups/:id/muscles
func (h *muscleHandler) ListMusclesByGroup(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[MuscleHandler.ListMusclesByGroup]: Invalid group ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	result, err := h.muscleUsecase.ListMusclesByGroupID(uint(id))
	if err != nil {
		err = errors.Wrap(err, "[MuscleHandler.ListMusclesByGroup]: Failed to list muscles by group")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"muscles": result,
		"count":   len(result),
	})
}
