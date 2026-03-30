package delivery

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gymmate/backend/domain"
	"github.com/gymmate/backend/request"
	"github.com/gymmate/backend/utils"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

type userHandler struct {
	userUsecase  domain.UserUsecase
	mediaUsecase domain.MediaUsecase // Inject for file upload
}

func NewUserHandler(userUsecase domain.UserUsecase, mediaUsecase domain.MediaUsecase) *userHandler {
	return &userHandler{
		userUsecase:  userUsecase,
		mediaUsecase: mediaUsecase,
	}
}

// LogWeight logs a weight entry for a user
// POST /api/v1/users/:userId/weight
func (h *userHandler) LogWeight(c *gin.Context) {
	userIDStr := c.Param("userId")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[UserHandler.LogWeight]: Invalid user ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	var req request.LogWeightRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		err = errors.Wrap(err, "[UserHandler.LogWeight]: Invalid request body")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	entry, err := h.userUsecase.LogWeight(uint(userID), &req)
	if err != nil {
		err = errors.Wrap(err, "[UserHandler.LogWeight]: Failed to log weight")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusCreated, entry)
}

// GetWeightHistory returns weight entries for a user with optional date range filter
// GET /api/v1/users/:userId/weight?from=YYYY-MM-DD&to=YYYY-MM-DD
func (h *userHandler) GetWeightHistory(c *gin.Context) {
	userIDStr := c.Param("userId")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[UserHandler.GetWeightHistory]: Invalid user ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	var from, to *string
	if f := c.Query("from"); f != "" {
		from = &f
	}
	if t := c.Query("to"); t != "" {
		to = &t
	}

	history, err := h.userUsecase.GetWeightHistory(uint(userID), from, to)
	if err != nil {
		err = errors.Wrap(err, "[UserHandler.GetWeightHistory]: Failed to get weight history")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	c.JSON(http.StatusOK, history)
}

// DeleteWeightEntry deletes a specific weight log entry
// DELETE /api/v1/users/:userId/weight/:entryId
func (h *userHandler) DeleteWeightEntry(c *gin.Context) {
	userIDStr := c.Param("userId")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[UserHandler.DeleteWeightEntry]: Invalid user ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	entryIDStr := c.Param("entryId")
	entryID, err := strconv.ParseUint(entryIDStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[UserHandler.DeleteWeightEntry]: Invalid entry ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	if err := h.userUsecase.DeleteWeightEntry(uint(userID), uint(entryID)); err != nil {
		err = errors.Wrap(err, "[UserHandler.DeleteWeightEntry]: Failed to delete entry")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "weight entry deleted successfully"})
}

// GetAllUsers retrieves all users with optional filters (admin only)
// GET /api/v1/users?page=1&page_size=20&role=user&status=ACTIVE
func (h *userHandler) GetAllUsers(c *gin.Context) {
	pageStr := c.DefaultQuery("page", "1")
	pageSizeStr := c.DefaultQuery("page_size", "20")
	role := c.Query("role")
	status := c.Query("status")

	page, _ := strconv.Atoi(pageStr)
	pageSize, _ := strconv.Atoi(pageSizeStr)

	users, err := h.userUsecase.GetAllUsers(page, pageSize, role, status)
	if err != nil {
		err = errors.Wrap(err, "[UserHandler.GetAllUsers]: Failed to get users")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, users)
}

func (h *userHandler) GetUser(c *gin.Context) {
	id := c.Param("userId")
	idUint, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[UserHandler.GetUser]: Error parsing id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}
	user, err := h.userUsecase.GetUser(uint32(idUint))
	if err != nil {
		err = errors.Wrap(err, "[UserHandler.GetUser]: Error getting user")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}
	c.JSON(http.StatusOK, user)
}

// UpdateProfileImage handles updating a user's profile image
// PUT /users/:userId/profile/image
// Supports both multipart/form-data (with image file) and application/json (with image_url)
func (h *userHandler) UpdateProfileImage(c *gin.Context) {
	// Get user ID from URL parameter
	userIDStr := c.Param("userId")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[UserHandler.UpdateProfileImage]: Invalid user ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	// Ownership is validated by OwnershipOrTrainerMiddleware
	// No need for manual checks here

	// Get existing user to retrieve old image_url for cleanup
	existing, err := h.userUsecase.GetUser(uint32(userID))
	if err != nil {
		err = errors.Wrap(err, "[UserHandler.UpdateProfileImage]: Failed to get existing user")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	var imageURL string

	// Detect content type
	contentType := c.ContentType()
	if strings.Contains(contentType, "multipart/form-data") {
		// Multipart approach: extract and upload image file
		file, err := c.FormFile("image")
		if err != nil {
			err = errors.Wrap(err, "[UserHandler.UpdateProfileImage]: No image file provided")
			c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
			log.Warn(err)
			return
		}

		// Delete old image if exists (ignore error if not found)
		if existing.ImageURL != nil && *existing.ImageURL != "" {
			_ = h.mediaUsecase.DeleteMedia(*existing.ImageURL)
		}

		// Upload new image
		mediaResp, uploadErr := h.mediaUsecase.UploadImage(file, "user")
		if uploadErr != nil {
			uploadErr = errors.Wrap(uploadErr, "[UserHandler.UpdateProfileImage]: Failed to upload image")
			c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(uploadErr)})
			log.Warn(uploadErr)
			return
		}
		imageURL = mediaResp.Key
	} else {
		// JSON approach: bind JSON body
		var req request.UpdateProfileImageRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			err = errors.Wrap(err, "[UserHandler.UpdateProfileImage]: Failed to bind JSON request")
			c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
			log.Warn(err)
			return
		}

		// Delete old image if exists (ignore error if not found)
		if existing.ImageURL != nil && *existing.ImageURL != "" {
			_ = h.mediaUsecase.DeleteMedia(*existing.ImageURL)
		}

		imageURL = req.ImageURL
	}

	// Update profile image
	user, err := h.userUsecase.UpdateProfileImage(uint32(userID), imageURL)
	if err != nil {
		err = errors.Wrap(err, "[UserHandler.UpdateProfileImage]: Error updating profile image")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "profile image updated successfully",
		"user":    user,
	})
}

// UpdateProfile updates a user's personal profile fields
// PATCH /api/v1/users/:userId/profile
func (h *userHandler) UpdateProfile(c *gin.Context) {
	userIDStr := c.Param("userId")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[UserHandler.UpdateProfile]: Invalid user ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	var req request.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		err = errors.Wrap(err, "[UserHandler.UpdateProfile]: Invalid request body")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	user, err := h.userUsecase.UpdateProfile(uint(userID), &req)
	if err != nil {
		err = errors.Wrap(err, "[UserHandler.UpdateProfile]: Failed to update profile")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "profile updated successfully",
		"user":    user,
	})
}

// AssignTrainer assigns a trainer to a user (admin only)
// PUT /api/v1/users/:userId/trainer
func (h *userHandler) AssignTrainer(c *gin.Context) {
	// Parse user ID from URL
	userIDStr := c.Param("userId")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[UserHandler.AssignTrainer]: Invalid user ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	// Bind request
	var req request.AssignTrainerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		err = errors.Wrap(err, "[UserHandler.AssignTrainer]: Invalid request body")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	// Assign trainer
	user, err := h.userUsecase.AssignTrainer(uint(userID), req.TrainerID)
	if err != nil {
		err = errors.Wrap(err, "[UserHandler.AssignTrainer]: Failed to assign trainer")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "trainer assigned successfully",
		"user":    user,
	})
}

// UnassignTrainer removes trainer assignment from a user (admin only)
// DELETE /api/v1/users/:userId/trainer
func (h *userHandler) UnassignTrainer(c *gin.Context) {
	// Parse user ID from URL
	userIDStr := c.Param("userId")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[UserHandler.UnassignTrainer]: Invalid user ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	// Unassign trainer
	user, err := h.userUsecase.UnassignTrainer(uint(userID))
	if err != nil {
		err = errors.Wrap(err, "[UserHandler.UnassignTrainer]: Failed to unassign trainer")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "trainer unassigned successfully",
		"user":    user,
	})
}

// UpdateStatus updates a user's status (admin only)
// PATCH /api/v1/users/:userId/status
func (h *userHandler) UpdateStatus(c *gin.Context) {
	userIDStr := c.Param("userId")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[UserHandler.UpdateStatus]: Invalid user ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	var req request.UpdateUserStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		err = errors.Wrap(err, "[UserHandler.UpdateStatus]: Invalid request body")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	user, err := h.userUsecase.UpdateStatus(uint(userID), req.Status)
	if err != nil {
		err = errors.Wrap(err, "[UserHandler.UpdateStatus]: Failed to update status")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "user status updated successfully",
		"user":    user,
	})
}

// UpdateRole updates a user's role (admin only)
// PATCH /api/v1/users/:userId/role
func (h *userHandler) UpdateRole(c *gin.Context) {
	userIDStr := c.Param("userId")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[UserHandler.UpdateRole]: Invalid user ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	var req request.UpdateUserRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		err = errors.Wrap(err, "[UserHandler.UpdateRole]: Invalid request body")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	user, err := h.userUsecase.UpdateRole(uint(userID), req.Role)
	if err != nil {
		err = errors.Wrap(err, "[UserHandler.UpdateRole]: Failed to update role")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "user role updated successfully",
		"user":    user,
	})
}

// DeleteUser soft-deletes a user (admin only)
// DELETE /api/v1/users/:userId
func (h *userHandler) DeleteUser(c *gin.Context) {
	userIDStr := c.Param("userId")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[UserHandler.DeleteUser]: Invalid user ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	adminID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	if err := h.userUsecase.DeleteUser(adminID.(uint), uint(userID)); err != nil {
		err = errors.Wrap(err, "[UserHandler.DeleteUser]: Failed to delete user")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "user deleted successfully"})
}

// GetTrainerTrainees gets all trainees assigned to a trainer (admin or trainer accessing self)
// GET /api/v1/trainers/:trainerId/trainees
func (h *userHandler) GetTrainerTrainees(c *gin.Context) {
	// Parse trainer ID from URL
	trainerIDStr := c.Param("trainerId")
	trainerID, err := strconv.ParseUint(trainerIDStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[UserHandler.GetTrainerTrainees]: Invalid trainer ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	// Get authenticated user
	authenticatedUserID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// Get user role
	roleInterface, _ := c.Get("role")
	role := roleInterface.(string)

	// Authorization: Admin can view any trainer's trainees, trainer can only view their own
	if role != "admin" && uint(trainerID) != authenticatedUserID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
		return
	}

	// Parse pagination query params
	pageStr := c.DefaultQuery("page", "1")
	pageSizeStr := c.DefaultQuery("page_size", "20")

	page, _ := strconv.Atoi(pageStr)
	pageSize, _ := strconv.Atoi(pageSizeStr)

	// Get trainees
	trainees, err := h.userUsecase.GetTraineesByTrainerID(uint(trainerID), page, pageSize)
	if err != nil {
		err = errors.Wrap(err, "[UserHandler.GetTrainerTrainees]: Failed to get trainees")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, trainees)
}

// GetTrainerDashboard provides overview for logged-in trainer
// GET /api/v1/trainers/me/dashboard
func (h *userHandler) GetTrainerDashboard(c *gin.Context) {
	// Get authenticated user (must be trainer)
	authenticatedUserID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// Verify user is a trainer
	role, _ := c.Get("role")
	if role.(string) != "trainer" {
		c.JSON(http.StatusForbidden, gin.H{"error": "only trainers can access this endpoint"})
		return
	}

	// Get dashboard
	dashboard, err := h.userUsecase.GetTrainerDashboard(authenticatedUserID.(uint))
	if err != nil {
		err = errors.Wrap(err, "[UserHandler.GetTrainerDashboard]: Failed to get dashboard")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, dashboard)
}

// GetMyProgress provides detailed progress analytics for the authenticated user
// GET /api/v1/users/me/progress?from=YYYY-MM-DD&to=YYYY-MM-DD
func (h *userHandler) GetMyProgress(c *gin.Context) {
	authenticatedUserID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var from, to *time.Time
	if fromStr := c.Query("from"); fromStr != "" {
		t, err := time.Parse("2006-01-02", fromStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid from date format, expected YYYY-MM-DD"})
			return
		}
		from = &t
	}
	if toStr := c.Query("to"); toStr != "" {
		t, err := time.Parse("2006-01-02", toStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid to date format, expected YYYY-MM-DD"})
			return
		}
		to = &t
	}

	progress, err := h.userUsecase.GetMyProgress(authenticatedUserID.(uint), from, to)
	if err != nil {
		err = errors.Wrap(err, "[UserHandler.GetMyProgress]: Failed to get progress")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, progress)
}

// GetMyProgressTrends returns all muscles or exercises the authenticated user has trained, sorted by frequency.
// GET /api/v1/users/me/progress/trends?type=muscle
// GET /api/v1/users/me/progress/trends?type=exercise
func (h *userHandler) GetMyProgressTrends(c *gin.Context) {
	authenticatedUserID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	trendsType := c.Query("type")
	if trendsType != "muscle" && trendsType != "exercise" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "type must be 'muscle' or 'exercise'"})
		return
	}

	result, err := h.userUsecase.GetMyProgressTrends(authenticatedUserID.(uint), trendsType)
	if err != nil {
		err = errors.Wrap(err, "[UserHandler.GetMyProgressTrends]: Failed to get trend options")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, result)
}

// GetTraineeProgress provides detailed progress for a specific trainee
// GET /api/v1/trainers/me/trainees/:traineeId/progress?from=YYYY-MM-DD&to=YYYY-MM-DD
func (h *userHandler) GetTraineeProgress(c *gin.Context) {
	// Get authenticated user (must be trainer)
	authenticatedUserID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// Verify user is a trainer
	role, _ := c.Get("role")
	if role.(string) != "trainer" {
		c.JSON(http.StatusForbidden, gin.H{"error": "only trainers can access this endpoint"})
		return
	}

	// Parse trainee ID
	traineeIDStr := c.Param("traineeId")
	traineeID, err := strconv.ParseUint(traineeIDStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[UserHandler.GetTraineeProgress]: Invalid trainee ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	// Parse optional time range
	var from, to *time.Time
	if fromStr := c.Query("from"); fromStr != "" {
		t, err := time.Parse("2006-01-02", fromStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid from date format, expected YYYY-MM-DD"})
			return
		}
		from = &t
	}
	if toStr := c.Query("to"); toStr != "" {
		t, err := time.Parse("2006-01-02", toStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid to date format, expected YYYY-MM-DD"})
			return
		}
		to = &t
	}

	// Get progress (usecase verifies trainee is assigned to trainer)
	progress, err := h.userUsecase.GetTraineeProgress(authenticatedUserID.(uint), uint(traineeID), from, to)
	if err != nil {
		err = errors.Wrap(err, "[UserHandler.GetTraineeProgress]: Failed to get progress")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, progress)
}
