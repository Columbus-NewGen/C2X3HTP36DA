package routes

import (
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/gymmate/backend/middlewares"
)

func AdminLogRoutes(v1 *gin.RouterGroup) {
	adminLogs := v1.Group("/admin/logs")
	adminLogs.Use(
		middlewares.AuthMiddleware(),
		middlewares.RoleMiddleware("admin", "root"),
	)
	adminLogs.GET("/read", func(c *gin.Context) {
		requestPath := c.DefaultQuery("path", "app.log")
		targetPath := filepath.Join("/app/logs", requestPath)

		content, err := os.ReadFile(targetPath)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "unable to read file",
				"path":    targetPath,
				"error":   err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"path":    targetPath,
			"content": string(content),
		})
	})
}
