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

type exerciseHandler struct {
	exerciseUsecase domain.ExerciseUsecase
	mediaUsecase    domain.MediaUsecase // Inject for file upload
}

// NewExerciseHandler creates a new exercise handler instance
func NewExerciseHandler(exerciseUsecase domain.ExerciseUsecase, mediaUsecase domain.MediaUsecase) *exerciseHandler {
	return &exerciseHandler{
		exerciseUsecase: exerciseUsecase,
		mediaUsecase:    mediaUsecase,
	}
}

// Create handles creating a new exercise
// POST /exercises
// Supports both multipart/form-data (with image file) and application/json (with image_url)
func (h *exerciseHandler) Create(c *gin.Context) {
	var req request.CreateExerciseRequest

	// Detect content type
	contentType := c.ContentType()
	if strings.Contains(contentType, "multipart/form-data") {
		// Multipart approach: bind form fields
		if err := c.ShouldBind(&req); err != nil {
			err = errors.Wrap(err, "[ExerciseHandler.Create]: Failed to bind multipart request")
			c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
			log.Warn(err)
			return
		}

		// Extract and upload image file if provided
		file, err := c.FormFile("image")
		if err == nil { // File provided
			mediaResp, uploadErr := h.mediaUsecase.UploadImage(file, "exercise")
			if uploadErr != nil {
				uploadErr = errors.Wrap(uploadErr, "[ExerciseHandler.Create]: Failed to upload image")
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
			err = errors.Wrap(err, "[ExerciseHandler.Create]: Failed to bind JSON request")
			c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
			log.Warn(err)
			return
		}
	}

	result, err := h.exerciseUsecase.CreateExercise(&req)
	if err != nil {
		err = errors.Wrap(err, "[ExerciseHandler.Create]: Failed to create exercise")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "exercise created successfully",
		"exercise": result,
	})
}

// Get handles retrieving an exercise by ID
// GET /exercises/:id
func (h *exerciseHandler) Get(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[ExerciseHandler.Get]: Invalid exercise ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	result, err := h.exerciseUsecase.GetExercise(uint(id))
	if err != nil {
		err = errors.Wrap(err, "[ExerciseHandler.Get]: Failed to get exercise")
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

// List handles retrieving all exercises
// GET /exercises
func (h *exerciseHandler) List(c *gin.Context) {
	result, err := h.exerciseUsecase.ListExercise()
	if err != nil {
		err = errors.Wrap(err, "[ExerciseHandler.List]: Failed to list exercises")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"exercises": result,
		"count":     len(result),
	})
}

// Update handles updating an exercise
// PUT /exercises/:id
// Supports both multipart/form-data (with image file) and application/json (with image_url)
func (h *exerciseHandler) Update(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[ExerciseHandler.Update]: Invalid exercise ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	// Get existing exercise to retrieve old image_url for cleanup
	existing, err := h.exerciseUsecase.GetExercise(uint(id))
	if err != nil {
		err = errors.Wrap(err, "[ExerciseHandler.Update]: Failed to get existing exercise")
		statusCode := http.StatusInternalServerError
		if strings.Contains(utils.StandardError(err), "not found") {
			statusCode = http.StatusNotFound
		}
		c.JSON(statusCode, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	var req request.UpdateExerciseRequest

	// Detect content type
	contentType := c.ContentType()
	if strings.Contains(contentType, "multipart/form-data") {
		// Multipart approach: bind form fields
		if err := c.ShouldBind(&req); err != nil {
			err = errors.Wrap(err, "[ExerciseHandler.Update]: Failed to bind multipart request")
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
			mediaResp, uploadErr := h.mediaUsecase.UploadImage(file, "exercise")
			if uploadErr != nil {
				uploadErr = errors.Wrap(uploadErr, "[ExerciseHandler.Update]: Failed to upload image")
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
			err = errors.Wrap(err, "[ExerciseHandler.Update]: Failed to bind JSON request")
			c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
			log.Warn(err)
			return
		}
	}

	result, err := h.exerciseUsecase.UpdateExercise(uint(id), &req)
	if err != nil {
		err = errors.Wrap(err, "[ExerciseHandler.Update]: Failed to update exercise")
		statusCode := http.StatusInternalServerError
		if strings.Contains(utils.StandardError(err), "not found") {
			statusCode = http.StatusNotFound
		}
		c.JSON(statusCode, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "exercise updated successfully",
		"exercise": result,
	})
}

// Delete handles deleting an exercise
// DELETE /exercises/:id
// Automatically deletes associated image from MinIO
func (h *exerciseHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[ExerciseHandler.Delete]: Invalid exercise ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	// Get existing exercise to retrieve image_url for cleanup
	existing, err := h.exerciseUsecase.GetExercise(uint(id))
	if err != nil {
		err = errors.Wrap(err, "[ExerciseHandler.Delete]: Failed to get existing exercise")
		statusCode := http.StatusInternalServerError
		if strings.Contains(utils.StandardError(err), "not found") {
			statusCode = http.StatusNotFound
		}
		c.JSON(statusCode, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	// Delete exercise from database
	err = h.exerciseUsecase.DeleteExercise(uint(id))
	if err != nil {
		err = errors.Wrap(err, "[ExerciseHandler.Delete]: Failed to delete exercise")
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
		"message": "exercise deleted successfully",
	})
}

// GetSubstitutes handles finding substitute exercises based on muscle similarity
// GET /exercises/:id/substitutes?min_similarity=70&exclude_ids=1,2,3&limit=10
func (h *exerciseHandler) GetSubstitutes(c *gin.Context) {
	// Parse exercise ID from path parameter
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[ExerciseHandler.GetSubstitutes]: Invalid exercise ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	// Bind query parameters
	var req request.GetSubstitutesRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		err = errors.Wrap(err, "[ExerciseHandler.GetSubstitutes]: Failed to bind query parameters")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	// Set default values
	minSimilarity := 70
	if req.MinSimilarity > 0 {
		minSimilarity = req.MinSimilarity
	}

	limit := 10
	if req.Limit > 0 {
		limit = req.Limit
	}

	// Parse comma-separated exclude_ids
	var excludeIDs []uint
	if req.ExcludeIDs != "" {
		idStrs := strings.Split(req.ExcludeIDs, ",")
		for _, idStr := range idStrs {
			idStr = strings.TrimSpace(idStr)
			if idStr == "" {
				continue
			}
			excludeID, parseErr := strconv.ParseUint(idStr, 10, 32)
			if parseErr != nil {
				parseErr = errors.Wrap(parseErr, "[ExerciseHandler.GetSubstitutes]: Invalid exclude_id format")
				c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(parseErr)})
				log.Warn(parseErr)
				return
			}
			excludeIDs = append(excludeIDs, uint(excludeID))
		}
	}

	// Call usecase to find substitutes
	substitutes, err := h.exerciseUsecase.FindSubstitutes(uint(id), minSimilarity, excludeIDs, limit)
	if err != nil {
		err = errors.Wrap(err, "[ExerciseHandler.GetSubstitutes]: Failed to find substitutes")
		statusCode := http.StatusInternalServerError
		if strings.Contains(utils.StandardError(err), "not found") {
			statusCode = http.StatusNotFound
		}
		c.JSON(statusCode, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"exercise_id":  uint(id),
		"substitutes":  substitutes,
		"count":        len(substitutes),
		"excluded_ids": excludeIDs,
	})
}

// GetEquipment handles retrieving all equipment used by an exercise
// GET /exercises/:id/equipment
func (h *exerciseHandler) GetEquipment(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[ExerciseHandler.GetEquipment]: Invalid exercise ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	result, err := h.exerciseUsecase.GetExerciseEquipment(uint(id))
	if err != nil {
		err = errors.Wrap(err, "[ExerciseHandler.GetEquipment]: Failed to get exercise equipment")
		statusCode := http.StatusInternalServerError
		if strings.Contains(utils.StandardError(err), "not found") {
			statusCode = http.StatusNotFound
		}
		c.JSON(statusCode, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"exercise_id": uint(id),
		"equipment":   result,
		"count":       len(result),
	})
}

// GetMuscles handles retrieving all muscles targeted by an exercise
// GET /exercises/:id/muscles
func (h *exerciseHandler) GetMuscles(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[ExerciseHandler.GetMuscles]: Invalid exercise ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	result, err := h.exerciseUsecase.GetExerciseMuscles(uint(id))
	if err != nil {
		err = errors.Wrap(err, "[ExerciseHandler.GetMuscles]: Failed to get exercise muscles")
		statusCode := http.StatusInternalServerError
		if strings.Contains(utils.StandardError(err), "not found") {
			statusCode = http.StatusNotFound
		}
		c.JSON(statusCode, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"exercise_id": uint(id),
		"muscles":     result,
		"count":       len(result),
	})
}
