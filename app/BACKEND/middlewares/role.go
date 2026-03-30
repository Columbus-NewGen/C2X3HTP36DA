package middlewares

import (
	"net/http"

	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
)

// RoleMiddleware restricts access to specified roles
// Usage: router.Use(RoleMiddleware("trainer", "admin"))
// This middleware should be applied AFTER AuthMiddleware
func RoleMiddleware(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get role from context (set by AuthMiddleware)
		roleInterface, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			c.Abort()
			return
		}

		userRole, ok := roleInterface.(string)
		if !ok {
			log.Error("[RoleMiddleware]: Invalid role type in context")
			c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
			c.Abort()
			return
		}

		// Check if user's role is in allowed roles
		for _, allowedRole := range allowedRoles {
			if userRole == allowedRole {
				c.Next()
				return
			}
		}

		// User's role is not in the allowed list
		log.Warnf("[RoleMiddleware]: Access denied for role '%s', allowed: %v", userRole, allowedRoles)
		c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
		c.Abort()
	}
}
