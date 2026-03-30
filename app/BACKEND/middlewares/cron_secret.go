package middlewares

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// CronSecretMiddleware protects internal cron endpoints by requiring the X-Cron-Secret header
// to match the CRON_SECRET environment variable.
func CronSecretMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		secret := os.Getenv("CRON_SECRET")
		if secret == "" {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "CRON_SECRET not configured"})
			c.Abort()
			return
		}

		provided := c.GetHeader("X-Cron-Secret")
		if provided == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "X-Cron-Secret header required"})
			c.Abort()
			return
		}

		if provided != secret {
			c.JSON(http.StatusForbidden, gin.H{"error": "invalid cron secret"})
			c.Abort()
			return
		}

		c.Next()
	}
}
