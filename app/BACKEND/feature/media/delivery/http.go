package delivery

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/gymmate/backend/constant"
	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/utils"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

type mediaHandler struct {
	mediaUsecase domain.MediaUsecase
}

// NewMediaHandler creates a new media handler instance
func NewMediaHandler(mediaUsecase domain.MediaUsecase) *mediaHandler {
	return &mediaHandler{
		mediaUsecase: mediaUsecase,
	}
}

// Upload handles media file upload
// POST /media/upload
func (h *mediaHandler) Upload(c *gin.Context) {
	// Get file from form
	file, err := c.FormFile("file")
	if err != nil {
		err = errors.Wrap(err, "[MediaHandler.Upload]: Failed to get file from form")
		c.JSON(http.StatusBadRequest, gin.H{"error": constant.MissingFile})
		log.Warn(err)
		return
	}

	// Get entity type
	entityType := c.PostForm("entity_type")
	if entityType == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": constant.InvalidEntityType})
		log.Warn("[MediaHandler.Upload]: entity_type is required")
		return
	}

	// Upload image
	result, err := h.mediaUsecase.UploadImage(file, entityType)
	if err != nil {
		err = errors.Wrap(err, "[MediaHandler.Upload]: Failed to upload image")
		statusCode := http.StatusInternalServerError

		// Check if it's a validation error
		errMsg := utils.StandardError(err)
		if strings.Contains(errMsg, constant.InvalidFileType) ||
			strings.Contains(errMsg, constant.FileTooLarge) ||
			strings.Contains(errMsg, constant.InvalidEntityType) {
			statusCode = http.StatusBadRequest
		}

		c.JSON(statusCode, gin.H{"error": errMsg})
		log.Error(err)
		return
	}

	c.JSON(http.StatusCreated, result)
}

// Retrieve handles media file retrieval
// GET /media/*key
func (h *mediaHandler) Retrieve(c *gin.Context) {
	// Get key from path (everything after /media/)
	key := strings.TrimPrefix(c.Param("key"), "/")

	if key == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "media key is required"})
		return
	}

	// Retrieve media
	data, contentType, err := h.mediaUsecase.GetMedia(key)
	if err != nil {
		err = errors.Wrap(err, "[MediaHandler.Retrieve]: Failed to retrieve media")
		statusCode := http.StatusInternalServerError

		// Check if it's a not found error
		errMsg := utils.StandardError(err)
		if strings.Contains(errMsg, constant.MediaNotFound) {
			statusCode = http.StatusNotFound
		}

		c.JSON(statusCode, gin.H{"error": errMsg})
		log.Error(err)
		return
	}

	// Set content type and return binary data
	c.Data(http.StatusOK, contentType, data)
}

// Update handles media file replacement using the same key
// PUT /media/*key
func (h *mediaHandler) Update(c *gin.Context) {
	// Get key from path
	key := strings.TrimPrefix(c.Param("key"), "/")

	if key == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "media key is required"})
		return
	}

	// Get file from form
	file, err := c.FormFile("file")
	if err != nil {
		err = errors.Wrap(err, "[MediaHandler.Update]: Failed to get file from form")
		c.JSON(http.StatusBadRequest, gin.H{"error": constant.MissingFile})
		log.Warn(err)
		return
	}

	// Overwrite existing object with new file
	result, err := h.mediaUsecase.UpdateImage(key, file)
	if err != nil {
		err = errors.Wrap(err, "[MediaHandler.Update]: Failed to update image")
		statusCode := http.StatusInternalServerError

		errMsg := utils.StandardError(err)
		if strings.Contains(errMsg, constant.MediaNotFound) {
			statusCode = http.StatusNotFound
		} else if strings.Contains(errMsg, constant.InvalidFileType) ||
			strings.Contains(errMsg, constant.FileTooLarge) {
			statusCode = http.StatusBadRequest
		}

		c.JSON(statusCode, gin.H{"error": errMsg})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, result)
}

// Delete handles media file deletion
// DELETE /media/*key
func (h *mediaHandler) Delete(c *gin.Context) {
	// Get key from path
	key := strings.TrimPrefix(c.Param("key"), "/")

	if key == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "media key is required"})
		return
	}

	// Delete media
	err := h.mediaUsecase.DeleteMedia(key)
	if err != nil {
		err = errors.Wrap(err, "[MediaHandler.Delete]: Failed to delete media")
		statusCode := http.StatusInternalServerError

		// Check if it's a not found error
		errMsg := utils.StandardError(err)
		if strings.Contains(errMsg, constant.MediaNotFound) {
			statusCode = http.StatusNotFound
		}

		c.JSON(statusCode, gin.H{"error": errMsg})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "media deleted successfully",
	})
}
