package middlewares

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/gymmate/backend/database"
	"github.com/gymmate/backend/models"
	log "github.com/sirupsen/logrus"
)

// OwnershipOrTrainerMiddleware ensures the authenticated user can only access:
// 1. Their own data (user_id matches :userId param)
// 2. Their assigned trainees' data (if user is a trainer)
// 3. Any data (if user is an admin)
//
// This middleware MUST be applied AFTER AuthMiddleware (requires user_id and role in context)
// Usage: router.Use(AuthMiddleware(), OwnershipOrTrainerMiddleware("userId"))
func OwnershipOrTrainerMiddleware(userIDParamName string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get authenticated user info from context (set by AuthMiddleware)
		authenticatedUserID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			c.Abort()
			return
		}

		roleInterface, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			c.Abort()
			return
		}

		role := roleInterface.(string)
		authUserID := authenticatedUserID.(uint)

		// Admins can access everything
		if role == "admin" {
			c.Next()
			return
		}

		// Get requested user ID from URL parameter
		requestedUserIDStr := c.Param(userIDParamName)
		requestedUserID, err := strconv.ParseUint(requestedUserIDStr, 10, 32)
		if err != nil {
			log.Warnf("[OwnershipOrTrainerMiddleware]: Invalid user ID parameter: %s", requestedUserIDStr)
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
			c.Abort()
			return
		}

		// Allow if user is accessing their own data
		if authUserID == uint(requestedUserID) {
			c.Next()
			return
		}

		// If user is a trainer, check if requested user is their trainee
		if role == "trainer" {
			var requestedUser models.User
			if err := database.DB.Select("trainer_id").First(&requestedUser, requestedUserID).Error; err != nil {
				log.Warnf("[OwnershipOrTrainerMiddleware]: Requested user not found: %d", requestedUserID)
				c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
				c.Abort()
				return
			}

			// Check if authenticated trainer is assigned to this user
			if requestedUser.TrainerID != nil && *requestedUser.TrainerID == authUserID {
				c.Next()
				return
			}
		}

		// Access denied - user is not owner, not trainer of this user, and not admin
		log.Warnf("[OwnershipOrTrainerMiddleware]: Access denied - user %d tried to access user %d (role: %s)",
			authUserID, requestedUserID, role)
		c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
		c.Abort()
	}
}
