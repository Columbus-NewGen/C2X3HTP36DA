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

type floorplanHandler struct {
	floorplanUsecase domain.FloorplanUsecase
}

func NewFloorplanHandler(floorplanUsecase domain.FloorplanUsecase) *floorplanHandler {
	return &floorplanHandler{floorplanUsecase: floorplanUsecase}
}

// Floorplan handlers
func (h *floorplanHandler) GetFloorplan(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[FloorplanHandler.GetFloorplan]: Error parsing floorplan id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	floorplan, err := h.floorplanUsecase.GetFloorplan(uint(id))
	if err != nil {
		if err.Error() == "floorplan not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		err = errors.Wrap(err, "[FloorplanHandler.GetFloorplan]: Error fetching floorplan")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"floorplan": floorplan})
}

func (h *floorplanHandler) GetActiveFloorplan(c *gin.Context) {
	floorplan, err := h.floorplanUsecase.GetActiveFloorplan()
	if err != nil {
		if err.Error() == "no active floorplan found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		err = errors.Wrap(err, "[FloorplanHandler.GetActiveFloorplan]: Error fetching active floorplan")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"floorplan": floorplan})
}

func (h *floorplanHandler) CreateFloorplan(c *gin.Context) {
	var req request.CreateFloorplanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		err = errors.Wrap(err, "[FloorplanHandler.CreateFloorplan]: Invalid request body")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	floorplan, err := h.floorplanUsecase.CreateFloorplan(&req)
	if err != nil {
		err = errors.Wrap(err, "[FloorplanHandler.CreateFloorplan]: Error creating floorplan")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":   "floorplan created successfully",
		"floorplan": floorplan,
	})
}

func (h *floorplanHandler) UpdateFloorplan(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[FloorplanHandler.UpdateFloorplan]: Error parsing floorplan id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	var req request.UpdateFloorplanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		err = errors.Wrap(err, "[FloorplanHandler.UpdateFloorplan]: Invalid request body")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	floorplan, err := h.floorplanUsecase.UpdateFloorplan(uint(id), &req)
	if err != nil {
		if err.Error() == "floorplan not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		err = errors.Wrap(err, "[FloorplanHandler.UpdateFloorplan]: Error updating floorplan")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":   "floorplan updated successfully",
		"floorplan": floorplan,
	})
}

func (h *floorplanHandler) DeleteFloorplan(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[FloorplanHandler.DeleteFloorplan]: Error parsing floorplan id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	if err := h.floorplanUsecase.DeleteFloorplan(uint(id)); err != nil {
		err = errors.Wrap(err, "[FloorplanHandler.DeleteFloorplan]: Error deleting floorplan")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "floorplan deleted successfully"})
}

// Wall handlers
func (h *floorplanHandler) CreateWall(c *gin.Context) {
	var req request.CreateWallRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		err = errors.Wrap(err, "[FloorplanHandler.CreateWall]: Invalid request body")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	wall, err := h.floorplanUsecase.CreateWall(&req)
	if err != nil {
		err = errors.Wrap(err, "[FloorplanHandler.CreateWall]: Error creating wall")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "wall created successfully",
		"wall":    wall,
	})
}

func (h *floorplanHandler) UpdateWall(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[FloorplanHandler.UpdateWall]: Error parsing wall id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	var req request.UpdateWallRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		err = errors.Wrap(err, "[FloorplanHandler.UpdateWall]: Invalid request body")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	wall, err := h.floorplanUsecase.UpdateWall(uint(id), &req)
	if err != nil {
		if err.Error() == "wall not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		err = errors.Wrap(err, "[FloorplanHandler.UpdateWall]: Error updating wall")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "wall updated successfully",
		"wall":    wall,
	})
}

func (h *floorplanHandler) DeleteWall(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[FloorplanHandler.DeleteWall]: Error parsing wall id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	if err := h.floorplanUsecase.DeleteWall(uint(id)); err != nil {
		err = errors.Wrap(err, "[FloorplanHandler.DeleteWall]: Error deleting wall")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "wall deleted successfully"})
}

func (h *floorplanHandler) GetWallsByFloorplan(c *gin.Context) {
	idStr := c.Param("id")
	floorplanID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[FloorplanHandler.GetWallsByFloorplan]: Error parsing floorplan id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	walls, err := h.floorplanUsecase.GetWallsByFloorplan(uint(floorplanID))
	if err != nil {
		err = errors.Wrap(err, "[FloorplanHandler.GetWallsByFloorplan]: Error fetching walls")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"walls": walls})
}

// Equipment Instance handlers
func (h *floorplanHandler) CreateEquipmentInstance(c *gin.Context) {
	var req request.CreateEquipmentInstanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		err = errors.Wrap(err, "[FloorplanHandler.CreateEquipmentInstance]: Invalid request body")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	instance, err := h.floorplanUsecase.CreateEquipmentInstance(&req)
	if err != nil {
		err = errors.Wrap(err, "[FloorplanHandler.CreateEquipmentInstance]: Error creating equipment instance")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":            "equipment instance created successfully",
		"equipment_instance": instance,
	})
}

func (h *floorplanHandler) UpdateEquipmentInstance(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[FloorplanHandler.UpdateEquipmentInstance]: Error parsing equipment instance id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	var req request.UpdateEquipmentInstanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		err = errors.Wrap(err, "[FloorplanHandler.UpdateEquipmentInstance]: Invalid request body")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	instance, err := h.floorplanUsecase.UpdateEquipmentInstance(uint(id), &req)
	if err != nil {
		if err.Error() == "equipment instance not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		err = errors.Wrap(err, "[FloorplanHandler.UpdateEquipmentInstance]: Error updating equipment instance")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":            "equipment instance updated successfully",
		"equipment_instance": instance,
	})
}

func (h *floorplanHandler) DeleteEquipmentInstance(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[FloorplanHandler.DeleteEquipmentInstance]: Error parsing equipment instance id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	if err := h.floorplanUsecase.DeleteEquipmentInstance(uint(id)); err != nil {
		err = errors.Wrap(err, "[FloorplanHandler.DeleteEquipmentInstance]: Error deleting equipment instance")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "equipment instance deleted successfully"})
}

func (h *floorplanHandler) GetEquipmentInstancesByFloorplan(c *gin.Context) {
	idStr := c.Param("id")
	floorplanID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[FloorplanHandler.GetEquipmentInstancesByFloorplan]: Error parsing floorplan id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	instances, err := h.floorplanUsecase.GetEquipmentInstancesByFloorplan(uint(floorplanID))
	if err != nil {
		err = errors.Wrap(err, "[FloorplanHandler.GetEquipmentInstancesByFloorplan]: Error fetching equipment instances")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"equipment_instances": instances})
}
