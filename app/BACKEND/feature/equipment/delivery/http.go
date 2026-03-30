package delivery

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/request"
	"github.com/gymmate/backend/utils"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

type equipmentHandler struct {
	equipmentUsecase domain.EquipmentUsecase
	mediaUsecase     domain.MediaUsecase // Inject for file upload
}

// NewEquipmentHandler creates a new equipment handler instance
func NewEquipmentHandler(equipmentUsecase domain.EquipmentUsecase, mediaUsecase domain.MediaUsecase) *equipmentHandler {
	return &equipmentHandler{
		equipmentUsecase: equipmentUsecase,
		mediaUsecase:     mediaUsecase,
	}
}

// Create handles creating a new equipment
// POST /equipment
// Supports both multipart/form-data (with image file) and application/json (with image_url)
func (h *equipmentHandler) Create(c *gin.Context) {
	var req request.CreateEquipmentRequest

	// Detect content type
	contentType := c.ContentType()
	if strings.Contains(contentType, "multipart/form-data") {
		// Multipart approach: bind form fields
		if err := c.ShouldBind(&req); err != nil {
			err = errors.Wrap(err, "[EquipmentHandler.Create]: Failed to bind multipart request")
			c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
			log.Warn(err)
			return
		}

		// Extract and upload image file if provided
		file, err := c.FormFile("image")
		if err == nil { // File provided
			mediaResp, uploadErr := h.mediaUsecase.UploadImage(file, "equipment")
			if uploadErr != nil {
				uploadErr = errors.Wrap(uploadErr, "[EquipmentHandler.Create]: Failed to upload image")
				c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(uploadErr)})
				log.Warn(uploadErr)
				return
			}
			req.ImageURL = &mediaResp.Key
		}
		// If err != nil, no file provided - that's okay (optional)
	} else {
		// JSON approach: bind JSON body
		if err := c.ShouldBindJSON(&req); err != nil {
			err = errors.Wrap(err, "[EquipmentHandler.Create]: Failed to bind JSON request")
			c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
			log.Warn(err)
			return
		}
	}

	result, err := h.equipmentUsecase.CreateEquipment(&req)
	if err != nil {
		err = errors.Wrap(err, "[EquipmentHandler.Create]: Failed to create equipment")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":   "equipment created successfully",
		"equipment": result,
	})
}

// Get handles retrieving an equipment by ID
// GET /equipment/:id
func (h *equipmentHandler) Get(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[EquipmentHandler.Get]: Invalid equipment ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	result, err := h.equipmentUsecase.GetEquipment(uint(id))
	if err != nil {
		err = errors.Wrap(err, "[EquipmentHandler.Get]: Failed to get equipment")
		statusCode := http.StatusInternalServerError
		if strings.Contains(utils.StandardError(err), "not found") {
			statusCode = http.StatusNotFound
		}
		c.JSON(statusCode, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, result)
}

// List handles retrieving all equipment
// GET /equipment
func (h *equipmentHandler) List(c *gin.Context) {
	result, err := h.equipmentUsecase.ListEquipment()
	if err != nil {
		err = errors.Wrap(err, "[EquipmentHandler.List]: Failed to list equipment")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"equipment": result,
		"count":     len(result),
	})
}

// Update handles updating an equipment
// PUT /equipment/:id
// Supports both multipart/form-data (with image file) and application/json (with image_url)
func (h *equipmentHandler) Update(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[EquipmentHandler.Update]: Invalid equipment ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	// Get existing equipment to retrieve old image_url for cleanup
	existing, err := h.equipmentUsecase.GetEquipment(uint(id))
	if err != nil {
		err = errors.Wrap(err, "[EquipmentHandler.Update]: Failed to get existing equipment")
		statusCode := http.StatusInternalServerError
		if strings.Contains(utils.StandardError(err), "not found") {
			statusCode = http.StatusNotFound
		}
		c.JSON(statusCode, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	var req request.UpdateEquipmentRequest

	// Detect content type
	contentType := c.ContentType()
	if strings.Contains(contentType, "multipart/form-data") {
		// Multipart approach: bind form fields
		if err := c.ShouldBind(&req); err != nil {
			err = errors.Wrap(err, "[EquipmentHandler.Update]: Failed to bind multipart request")
			c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
			log.Warn(err)
			return
		}

		// Extract and upload image file if provided
		file, err := c.FormFile("image")
		if err == nil { // New file provided
			// Delete old image if exists (ignore error if not found)
			if existing.ImageURL != nil && *existing.ImageURL != "" {
				_ = h.mediaUsecase.DeleteMedia(*existing.ImageURL)
			}

			// Upload new image
			mediaResp, uploadErr := h.mediaUsecase.UploadImage(file, "equipment")
			if uploadErr != nil {
				uploadErr = errors.Wrap(uploadErr, "[EquipmentHandler.Update]: Failed to upload image")
				c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(uploadErr)})
				log.Warn(uploadErr)
				return
			}
			req.ImageURL = &mediaResp.Key
		}
		// If err != nil, no file provided - keep existing image
	} else {
		// JSON approach: bind JSON body
		if err := c.ShouldBindJSON(&req); err != nil {
			err = errors.Wrap(err, "[EquipmentHandler.Update]: Failed to bind JSON request")
			c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
			log.Warn(err)
			return
		}
	}

	result, err := h.equipmentUsecase.UpdateEquipment(uint(id), &req)
	if err != nil {
		err = errors.Wrap(err, "[EquipmentHandler.Update]: Failed to update equipment")
		statusCode := http.StatusInternalServerError
		if strings.Contains(utils.StandardError(err), "not found") {
			statusCode = http.StatusNotFound
		}
		c.JSON(statusCode, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":   "equipment updated successfully",
		"equipment": result,
	})
}

// GetExercises handles retrieving all exercises that use this equipment
// GET /equipment/:id/exercises
func (h *equipmentHandler) GetExercises(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[EquipmentHandler.GetExercises]: Invalid equipment ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	result, err := h.equipmentUsecase.GetEquipmentExercises(uint(id))
	if err != nil {
		err = errors.Wrap(err, "[EquipmentHandler.GetExercises]: Failed to get equipment exercises")
		statusCode := http.StatusInternalServerError
		if strings.Contains(utils.StandardError(err), "not found") {
			statusCode = http.StatusNotFound
		}
		c.JSON(statusCode, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"equipment_id": uint(id),
		"exercises":    result,
		"count":        len(result),
	})
}

// Delete handles deleting an equipment
// DELETE /equipment/:id
// Automatically deletes associated image from MinIO
func (h *equipmentHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[EquipmentHandler.Delete]: Invalid equipment ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	// Get existing equipment to retrieve image_url for cleanup
	existing, err := h.equipmentUsecase.GetEquipment(uint(id))
	if err != nil {
		err = errors.Wrap(err, "[EquipmentHandler.Delete]: Failed to get existing equipment")
		statusCode := http.StatusInternalServerError
		if strings.Contains(utils.StandardError(err), "not found") {
			statusCode = http.StatusNotFound
		}
		c.JSON(statusCode, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	// Delete equipment from database
	err = h.equipmentUsecase.DeleteEquipment(uint(id))
	if err != nil {
		err = errors.Wrap(err, "[EquipmentHandler.Delete]: Failed to delete equipment")
		statusCode := http.StatusInternalServerError
		if strings.Contains(utils.StandardError(err), "not found") {
			statusCode = http.StatusNotFound
		}
		c.JSON(statusCode, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	// Delete associated image if exists (ignore error if not found)
	if existing.ImageURL != nil && *existing.ImageURL != "" {
		_ = h.mediaUsecase.DeleteMedia(*existing.ImageURL)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "equipment deleted successfully",
	})
}
