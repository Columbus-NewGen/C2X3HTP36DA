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

type programHandler struct {
	programUsecase domain.ProgramUsecase
}

func NewProgramHandler(programUsecase domain.ProgramUsecase) *programHandler {
	return &programHandler{programUsecase: programUsecase}
}

// CreateProgram creates a new program or template
func (h *programHandler) CreateProgram(c *gin.Context) {
	var req request.CreateProgramRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		err = errors.Wrap(err, "[ProgramHandler.CreateProgram]: Invalid request body")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	// Get current user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	program, err := h.programUsecase.CreateProgram(&req, userID.(uint))
	if err != nil {
		err = errors.Wrap(err, "[ProgramHandler.CreateProgram]: Error creating program")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "program created successfully",
		"program": program,
	})
}

// GetProgram gets a program by ID with all details
func (h *programHandler) GetProgram(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[ProgramHandler.GetProgram]: Error parsing program id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	program, err := h.programUsecase.GetProgramByID(uint(id))
	if err != nil {
		if err.Error() == "program not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		err = errors.Wrap(err, "[ProgramHandler.GetProgram]: Error fetching program")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"program": program})
}

// ListPrograms lists programs with optional filters
func (h *programHandler) ListPrograms(c *gin.Context) {
	// Parse query parameters
	var isTemplate *bool
	if c.Query("is_template") != "" {
		val := c.Query("is_template") == "true"
		isTemplate = &val
	}
	difficulty := c.Query("difficulty")

	callerID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	programs, err := h.programUsecase.GetPrograms(isTemplate, difficulty, callerID.(uint))
	if err != nil {
		err = errors.Wrap(err, "[ProgramHandler.ListPrograms]: Error fetching programs")
		log.Error(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"programs": programs})
}

// UpdateProgram updates a program
func (h *programHandler) UpdateProgram(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[ProgramHandler.UpdateProgram]: Error parsing program id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	var req request.UpdateProgramRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		err = errors.Wrap(err, "[ProgramHandler.UpdateProgram]: Invalid request body")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	callerID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}
	callerRole, _ := c.Get("role")
	callerRoleStr, _ := callerRole.(string)

	program, err := h.programUsecase.UpdateProgram(uint(id), &req, callerID.(uint), callerRoleStr)
	if err != nil {
		if err.Error() == "program not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		if err.Error() == "forbidden: you do not own this program" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		err = errors.Wrap(err, "[ProgramHandler.UpdateProgram]: Error updating program")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "program updated successfully",
		"program": program,
	})
}

// DeleteProgram deletes a program
func (h *programHandler) DeleteProgram(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[ProgramHandler.DeleteProgram]: Error parsing program id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	callerID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}
	callerRole, _ := c.Get("role")
	callerRoleStr, _ := callerRole.(string)

	if err := h.programUsecase.DeleteProgram(uint(id), callerID.(uint), callerRoleStr); err != nil {
		if err.Error() == "program not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		if err.Error() == "forbidden: you do not own this program" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		err = errors.Wrap(err, "[ProgramHandler.DeleteProgram]: Error deleting program")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "program deleted successfully"})
}

// AssignProgram assigns a template program to a user
func (h *programHandler) AssignProgram(c *gin.Context) {
	userIDStr := c.Param("userId")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[ProgramHandler.AssignProgram]: Error parsing user id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	var req request.AssignProgramRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		err = errors.Wrap(err, "[ProgramHandler.AssignProgram]: Invalid request body")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	// Get current user ID (trainer) from context
	trainerID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}
	callerRole, _ := c.Get("role")
	callerRoleStr, _ := callerRole.(string)

	userProgram, err := h.programUsecase.AssignProgramToUser(uint(userID), &req, trainerID.(uint), callerRoleStr)
	if err != nil {
		if err.Error() == "user not found" || err.Error() == "template program not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		if err.Error() == "cannot assign program to inactive user" || err.Error() == "user already has this template assigned" {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err.Error() == "forbidden: only the creator or admin can assign a private program" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		err = errors.Wrap(err, "[ProgramHandler.AssignProgram]: Error assigning program")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":      "program assigned successfully",
		"user_program": userProgram,
	})
}

// GetUserPrograms gets all programs assigned to a user
func (h *programHandler) GetUserPrograms(c *gin.Context) {
	userIDStr := c.Param("userId")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[ProgramHandler.GetUserPrograms]: Error parsing user id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	status := c.Query("status")

	programs, err := h.programUsecase.GetUserPrograms(uint(userID), status)
	if err != nil {
		err = errors.Wrap(err, "[ProgramHandler.GetUserPrograms]: Error fetching user programs")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"programs": programs})
}

// GetUserProgramDetail gets a specific user program with scheduled workouts and rates
func (h *programHandler) GetUserProgramDetail(c *gin.Context) {
	userProgramIDStr := c.Param("programId")
	userProgramID, err := strconv.ParseUint(userProgramIDStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[ProgramHandler.GetUserProgramDetail]: Error parsing program id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	detail, err := h.programUsecase.GetUserProgramDetail(uint(userProgramID))
	if err != nil {
		if err.Error() == "user program not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		err = errors.Wrap(err, "[ProgramHandler.GetUserProgramDetail]: Error fetching user program detail")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"program": detail})
}

// UpdateUserProgram updates user program progress/status
func (h *programHandler) UpdateUserProgram(c *gin.Context) {
	userProgramIDStr := c.Param("programId")
	userProgramID, err := strconv.ParseUint(userProgramIDStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[ProgramHandler.UpdateUserProgram]: Error parsing program id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	var req request.UpdateUserProgramRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		err = errors.Wrap(err, "[ProgramHandler.UpdateUserProgram]: Invalid request body")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	userProgram, err := h.programUsecase.UpdateUserProgram(uint(userProgramID), &req)
	if err != nil {
		if err.Error() == "user program not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		err = errors.Wrap(err, "[ProgramHandler.UpdateUserProgram]: Error updating user program")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":      "user program updated successfully",
		"user_program": userProgram,
	})
}
