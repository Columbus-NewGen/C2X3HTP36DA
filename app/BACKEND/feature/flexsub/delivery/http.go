package delivery

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/request"
	"github.com/gymmate/backend/utils"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

type flexSubHandler struct {
	flexSubUsecase domain.FlexSubUsecase
}

func NewFlexSubHandler(flexSubUsecase domain.FlexSubUsecase) *flexSubHandler {
	return &flexSubHandler{flexSubUsecase: flexSubUsecase}
}

// GetSubstitutions handles the main flex substitution request
func (h *flexSubHandler) GetSubstitutions(c *gin.Context) {
	var req request.FlexSubRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		err = errors.Wrap(err, "[FlexSubHandler.GetSubstitutions]: Invalid request body")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	result, err := h.flexSubUsecase.GetSubstitutions(&req)
	if err != nil {
		if err.Error() == "exercise not found" || err.Error() == "no active floorplan found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		err = errors.Wrap(err, "[FlexSubHandler.GetSubstitutions]: Error getting substitutions")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, result)
}

// UpdateEquipmentStatus updates equipment status (ACTIVE/MAINTENANCE)
func (h *flexSubHandler) UpdateEquipmentStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[FlexSubHandler.UpdateEquipmentStatus]: Error parsing equipment id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	var req request.UpdateStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		err = errors.Wrap(err, "[FlexSubHandler.UpdateEquipmentStatus]: Invalid request body")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	result, err := h.flexSubUsecase.UpdateEquipmentStatus(uint(id), req.Status)
	if err != nil {
		if err.Error() == "equipment not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		err = errors.Wrap(err, "[FlexSubHandler.UpdateEquipmentStatus]: Error updating status")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":   "equipment status updated successfully",
		"equipment": result,
	})
}

// UpdateEquipmentInstanceStatus updates equipment instance status (ACTIVE/MAINTENANCE)
func (h *flexSubHandler) UpdateEquipmentInstanceStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[FlexSubHandler.UpdateEquipmentInstanceStatus]: Error parsing equipment instance id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	var req request.UpdateStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		err = errors.Wrap(err, "[FlexSubHandler.UpdateEquipmentInstanceStatus]: Invalid request body")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	result, err := h.flexSubUsecase.UpdateEquipmentInstanceStatus(uint(id), req.Status)
	if err != nil {
		if err.Error() == "equipment instance not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		err = errors.Wrap(err, "[FlexSubHandler.UpdateEquipmentInstanceStatus]: Error updating status")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":            "equipment instance status updated successfully",
		"equipment_instance": result,
	})
}
