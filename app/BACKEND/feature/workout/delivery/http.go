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

type workoutHandler struct {
	workoutUsecase domain.WorkoutUsecase
}

func NewWorkoutHandler(workoutUsecase domain.WorkoutUsecase) *workoutHandler {
	return &workoutHandler{workoutUsecase: workoutUsecase}
}

// GetScheduledWorkouts retrieves scheduled workouts for a user in a date range
func (h *workoutHandler) GetScheduledWorkouts(c *gin.Context) {
	userIDStr := c.Param("userId")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[WorkoutHandler.GetScheduledWorkouts]: Error parsing user id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	// Parse date range (required)
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")

	if startDateStr == "" || endDateStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "start_date and end_date query parameters are required (format: YYYY-MM-DD)"})
		return
	}

	startDate, err := time.Parse("2006-01-02", startDateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid start_date format, expected YYYY-MM-DD"})
		return
	}

	endDate, err := time.Parse("2006-01-02", endDateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid end_date format, expected YYYY-MM-DD"})
		return
	}

	var programStatusPtr *string
	if ps := c.Query("program_status"); ps != "" {
		allowed := map[string]bool{"ACTIVE": true, "PAUSED": true, "COMPLETED": true}
		if !allowed[ps] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid program_status, must be ACTIVE, PAUSED, or COMPLETED"})
			return
		}
		programStatusPtr = &ps
	}

	workouts, err := h.workoutUsecase.GetScheduledWorkouts(uint(userID), startDate, endDate, programStatusPtr)
	if err != nil {
		err = errors.Wrap(err, "[WorkoutHandler.GetScheduledWorkouts]: Error fetching workouts")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"workouts": workouts})
}

// GetScheduledWorkout retrieves a specific scheduled workout
func (h *workoutHandler) GetScheduledWorkout(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[WorkoutHandler.GetScheduledWorkout]: Error parsing workout id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	workout, err := h.workoutUsecase.GetScheduledWorkoutByID(uint(id))
	if err != nil {
		if err.Error() == "scheduled workout not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		err = errors.Wrap(err, "[WorkoutHandler.GetScheduledWorkout]: Error fetching workout")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"workout": workout})
}

// UpdateScheduledWorkoutStatus updates the status of a scheduled workout
func (h *workoutHandler) UpdateScheduledWorkoutStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[WorkoutHandler.UpdateScheduledWorkoutStatus]: Error parsing workout id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	var req request.UpdateScheduledWorkoutStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		err = errors.Wrap(err, "[WorkoutHandler.UpdateScheduledWorkoutStatus]: Invalid request body")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	workout, err := h.workoutUsecase.UpdateScheduledWorkoutStatus(uint(id), &req)
	if err != nil {
		if err.Error() == "scheduled workout not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		err = errors.Wrap(err, "[WorkoutHandler.UpdateScheduledWorkoutStatus]: Error updating status")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "workout status updated successfully",
		"workout": workout,
	})
}

// GetCalendarView retrieves a calendar view of workouts grouped by date
func (h *workoutHandler) GetCalendarView(c *gin.Context) {
	userIDStr := c.Param("userId")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[WorkoutHandler.GetCalendarView]: Error parsing user id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	// Parse date range (required)
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")

	if startDateStr == "" || endDateStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "start_date and end_date query parameters are required (format: YYYY-MM-DD)"})
		return
	}

	startDate, err := time.Parse("2006-01-02", startDateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid start_date format, expected YYYY-MM-DD"})
		return
	}

	endDate, err := time.Parse("2006-01-02", endDateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid end_date format, expected YYYY-MM-DD"})
		return
	}

	var programStatusPtr *string
	if ps := c.Query("program_status"); ps != "" {
		allowed := map[string]bool{"ACTIVE": true, "PAUSED": true, "COMPLETED": true}
		if !allowed[ps] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid program_status, must be ACTIVE, PAUSED, or COMPLETED"})
			return
		}
		programStatusPtr = &ps
	}

	calendar, err := h.workoutUsecase.GetCalendarView(uint(userID), startDate, endDate, programStatusPtr)
	if err != nil {
		err = errors.Wrap(err, "[WorkoutHandler.GetCalendarView]: Error fetching calendar")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"calendar": calendar})
}

// LogWorkout creates a workout log
func (h *workoutHandler) LogWorkout(c *gin.Context) {
	userIDStr := c.Param("userId")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[WorkoutHandler.LogWorkout]: Error parsing user id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	var req request.LogWorkoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		err = errors.Wrap(err, "[WorkoutHandler.LogWorkout]: Invalid request body")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	workoutLog, err := h.workoutUsecase.LogWorkout(uint(userID), &req)
	if err != nil {
		if err.Error() == "scheduled workout not found" || err.Error() == "workout already logged for this scheduled session" {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		err = errors.Wrap(err, "[WorkoutHandler.LogWorkout]: Error logging workout")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":     "workout logged successfully",
		"workout_log": workoutLog,
	})
}

// AddLogExercise adds a single exercise to an existing workout log
func (h *workoutHandler) AddLogExercise(c *gin.Context) {
	userIDStr := c.Param("userId")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[WorkoutHandler.AddLogExercise]: Error parsing user id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	logIDStr := c.Param("logId")
	logID, err := strconv.ParseUint(logIDStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[WorkoutHandler.AddLogExercise]: Error parsing log id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	var req request.AddLogExerciseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		err = errors.Wrap(err, "[WorkoutHandler.AddLogExercise]: Invalid request body")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	exercise, err := h.workoutUsecase.AddLogExercise(uint(logID), uint(userID), &req)
	if err != nil {
		errMsg := err.Error()
		if errMsg == "workout log not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": errMsg})
			return
		}
		if errMsg == "workout log does not belong to this user" ||
			strings.Contains(errMsg, "not found") ||
			strings.Contains(errMsg, "does not belong to") ||
			strings.Contains(errMsg, "requires") {
			c.JSON(http.StatusBadRequest, gin.H{"error": errMsg})
			return
		}
		err = errors.Wrap(err, "[WorkoutHandler.AddLogExercise]: Error adding exercise")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "exercise added successfully",
		"exercise": exercise,
	})
}

// UpdateLogExercise updates a single exercise in an existing workout log
func (h *workoutHandler) UpdateLogExercise(c *gin.Context) {
	userIDStr := c.Param("userId")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[WorkoutHandler.UpdateLogExercise]: Error parsing user id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	logIDStr := c.Param("logId")
	logID, err := strconv.ParseUint(logIDStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[WorkoutHandler.UpdateLogExercise]: Error parsing log id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	exerciseLogIDStr := c.Param("exerciseLogId")
	exerciseLogID, err := strconv.ParseUint(exerciseLogIDStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[WorkoutHandler.UpdateLogExercise]: Error parsing exercise log id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	var req request.UpdateLogExerciseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		err = errors.Wrap(err, "[WorkoutHandler.UpdateLogExercise]: Invalid request body")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	exercise, err := h.workoutUsecase.UpdateLogExercise(uint(logID), uint(exerciseLogID), uint(userID), &req)
	if err != nil {
		errMsg := err.Error()
		if errMsg == "workout log not found" || errMsg == "log exercise not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": errMsg})
			return
		}
		if errMsg == "workout log does not belong to this user" ||
			strings.Contains(errMsg, "does not belong to") ||
			strings.Contains(errMsg, "not found") ||
			strings.Contains(errMsg, "requires") {
			c.JSON(http.StatusBadRequest, gin.H{"error": errMsg})
			return
		}
		err = errors.Wrap(err, "[WorkoutHandler.UpdateLogExercise]: Error updating exercise")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "exercise updated successfully",
		"exercise": exercise,
	})
}

// DeleteLogExercise removes a single exercise from a workout log
func (h *workoutHandler) DeleteLogExercise(c *gin.Context) {
	userIDStr := c.Param("userId")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[WorkoutHandler.DeleteLogExercise]: Error parsing user id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	logIDStr := c.Param("logId")
	logID, err := strconv.ParseUint(logIDStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[WorkoutHandler.DeleteLogExercise]: Error parsing log id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	exerciseLogIDStr := c.Param("exerciseLogId")
	exerciseLogID, err := strconv.ParseUint(exerciseLogIDStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[WorkoutHandler.DeleteLogExercise]: Error parsing exercise log id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	err = h.workoutUsecase.DeleteLogExercise(uint(logID), uint(exerciseLogID), uint(userID))
	if err != nil {
		errMsg := err.Error()
		if errMsg == "workout log not found" || errMsg == "log exercise not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": errMsg})
			return
		}
		if errMsg == "workout log does not belong to this user" ||
			strings.Contains(errMsg, "does not belong to") {
			c.JSON(http.StatusBadRequest, gin.H{"error": errMsg})
			return
		}
		err = errors.Wrap(err, "[WorkoutHandler.DeleteLogExercise]: Error deleting exercise")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "exercise deleted successfully",
	})
}

// AddScheduledWorkoutExercise adds a prescribed exercise to a scheduled workout instance
func (h *workoutHandler) AddScheduledWorkoutExercise(c *gin.Context) {
	userIDStr := c.Param("userId")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[WorkoutHandler.AddScheduledWorkoutExercise]: Error parsing user id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	idStr := c.Param("id")
	scheduledWorkoutID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[WorkoutHandler.AddScheduledWorkoutExercise]: Error parsing scheduled workout id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	var req request.AddScheduledWorkoutExerciseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		err = errors.Wrap(err, "[WorkoutHandler.AddScheduledWorkoutExercise]: Invalid request body")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	exercise, err := h.workoutUsecase.AddScheduledWorkoutExercise(uint(userID), uint(scheduledWorkoutID), &req)
	if err != nil {
		errMsg := err.Error()
		if errMsg == "scheduled workout not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": errMsg})
			return
		}
		if strings.Contains(errMsg, "cannot modify") ||
			strings.Contains(errMsg, "does not belong to") ||
			strings.Contains(errMsg, "not found") {
			c.JSON(http.StatusBadRequest, gin.H{"error": errMsg})
			return
		}
		err = errors.Wrap(err, "[WorkoutHandler.AddScheduledWorkoutExercise]: Error adding exercise")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "exercise added successfully",
		"exercise": exercise,
	})
}

// UpdateScheduledWorkoutExercise partially updates a prescribed exercise on a scheduled workout
func (h *workoutHandler) UpdateScheduledWorkoutExercise(c *gin.Context) {
	userIDStr := c.Param("userId")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[WorkoutHandler.UpdateScheduledWorkoutExercise]: Error parsing user id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	idStr := c.Param("id")
	scheduledWorkoutID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[WorkoutHandler.UpdateScheduledWorkoutExercise]: Error parsing scheduled workout id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	exerciseIDStr := c.Param("exerciseId")
	exerciseID, err := strconv.ParseUint(exerciseIDStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[WorkoutHandler.UpdateScheduledWorkoutExercise]: Error parsing exercise id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	var req request.UpdateScheduledWorkoutExerciseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		err = errors.Wrap(err, "[WorkoutHandler.UpdateScheduledWorkoutExercise]: Invalid request body")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Warn(err)
		return
	}

	exercise, err := h.workoutUsecase.UpdateScheduledWorkoutExercise(uint(userID), uint(scheduledWorkoutID), uint(exerciseID), &req)
	if err != nil {
		errMsg := err.Error()
		if errMsg == "scheduled workout not found" || errMsg == "scheduled workout exercise not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": errMsg})
			return
		}
		if strings.Contains(errMsg, "cannot modify") ||
			strings.Contains(errMsg, "does not belong to") ||
			strings.Contains(errMsg, "not found") {
			c.JSON(http.StatusBadRequest, gin.H{"error": errMsg})
			return
		}
		err = errors.Wrap(err, "[WorkoutHandler.UpdateScheduledWorkoutExercise]: Error updating exercise")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "exercise updated successfully",
		"exercise": exercise,
	})
}

// DeleteScheduledWorkoutExercise removes a prescribed exercise from a scheduled workout
func (h *workoutHandler) DeleteScheduledWorkoutExercise(c *gin.Context) {
	userIDStr := c.Param("userId")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[WorkoutHandler.DeleteScheduledWorkoutExercise]: Error parsing user id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	idStr := c.Param("id")
	scheduledWorkoutID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[WorkoutHandler.DeleteScheduledWorkoutExercise]: Error parsing scheduled workout id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	exerciseIDStr := c.Param("exerciseId")
	exerciseID, err := strconv.ParseUint(exerciseIDStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[WorkoutHandler.DeleteScheduledWorkoutExercise]: Error parsing exercise id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	err = h.workoutUsecase.DeleteScheduledWorkoutExercise(uint(userID), uint(scheduledWorkoutID), uint(exerciseID))
	if err != nil {
		errMsg := err.Error()
		if errMsg == "scheduled workout not found" || errMsg == "scheduled workout exercise not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": errMsg})
			return
		}
		if strings.Contains(errMsg, "cannot modify") ||
			strings.Contains(errMsg, "does not belong to") {
			c.JSON(http.StatusBadRequest, gin.H{"error": errMsg})
			return
		}
		err = errors.Wrap(err, "[WorkoutHandler.DeleteScheduledWorkoutExercise]: Error deleting exercise")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "exercise deleted successfully",
	})
}

// GetWorkoutLogs retrieves workout logs for a user with optional date filtering
func (h *workoutHandler) GetWorkoutLogs(c *gin.Context) {
	userIDStr := c.Param("userId")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[WorkoutHandler.GetWorkoutLogs]: Error parsing user id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	// Optional date filters
	var startDate, endDate *time.Time
	if startDateStr := c.Query("start_date"); startDateStr != "" {
		sd, err := time.Parse("2006-01-02", startDateStr)
		if err == nil {
			startDate = &sd
		}
	}
	if endDateStr := c.Query("end_date"); endDateStr != "" {
		ed, err := time.Parse("2006-01-02", endDateStr)
		if err == nil {
			endDate = &ed
		}
	}

	logs, err := h.workoutUsecase.GetWorkoutLogs(uint(userID), startDate, endDate)
	if err != nil {
		err = errors.Wrap(err, "[WorkoutHandler.GetWorkoutLogs]: Error fetching logs")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"logs": logs})
}

// GetWorkoutLog retrieves a specific workout log
func (h *workoutHandler) GetWorkoutLog(c *gin.Context) {
	idStr := c.Param("logId")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		err = errors.Wrap(err, "[WorkoutHandler.GetWorkoutLog]: Error parsing log id")
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	workoutLog, err := h.workoutUsecase.GetWorkoutLogByID(uint(id))
	if err != nil {
		if err.Error() == "workout log not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		err = errors.Wrap(err, "[WorkoutHandler.GetWorkoutLog]: Error fetching log")
		c.JSON(http.StatusInternalServerError, gin.H{"error": utils.StandardError(err)})
		log.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"workout_log": workoutLog})
}
