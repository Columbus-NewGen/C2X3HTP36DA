package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/gymmate/backend/database"
	"github.com/gymmate/backend/middlewares"
	"github.com/gymmate/backend/routes"
	"github.com/gymmate/backend/utils"
	"github.com/joho/godotenv"
	log "github.com/sirupsen/logrus"
)

var appEnv string
var runningMode string

func init() {
	fmt.Println("Hello, World from init()")

	log.SetFormatter(&log.TextFormatter{
		ForceColors:   true,
		FullTimestamp: true,
	})
	log.SetLevel(log.InfoLevel)

	runningMode = os.Getenv("RUNNING_MODE")
	if runningMode == "" {
		runningMode = "local"
	}
	log.Info("[init]: Running mode: ", runningMode)

	if runningMode == "local" {
		if err := godotenv.Load("configs/.env"); err != nil {
			log.Fatal("[init]: Error loading .env file: ", err)
		}
	}

	appEnv = os.Getenv("APP_ENV")
	if appEnv == "" {
		appEnv = "development"
	}
	log.Info("[init]: App environment: ", appEnv)

	if appEnv == "development" {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	log.Info("[init]: Run environment: ", appEnv)

	if err := database.ConnectDB(appEnv); err != nil {
		log.Fatal("[init]: Connect database PG error: ", err.Error())
	}

	// Initialize MinIO client
	if err := utils.InitMinIOClient(); err != nil {
		log.Fatal("[init]: Connect MinIO error: ", err.Error())
	}
}

func main() {
	fmt.Println("Hello, World from main()")

	app := gin.Default()

	app.Use(middlewares.CORSMiddleware())

	// Health check endpoint - handle both GET and HEAD for healthchecks
	app.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})
	app.HEAD("/healthz", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	app.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{
			"status": "not found",
		})
	})
	app.NoMethod(func(c *gin.Context) {
		c.JSON(http.StatusMethodNotAllowed, gin.H{
			"status": "method not allowed",
		})
	})

	v1 := app.Group("/api/v1")
	routes.AuthRoutes(v1)
	routes.UserRoutes(v1)
	routes.FloorplanRoutes(v1)
	routes.FlexSubRoutes(v1)
	routes.ProgramRoutes(v1)
	routes.WorkoutRoutes(v1)
	routes.MediaRoutes(v1)
	routes.EquipmentRoutes(v1)
	routes.ExerciseRoutes(v1)
	routes.MuscleRoutes(v1)
	routes.AnalyticsRoutes(v1)
	routes.GamificationRoutes(v1)
	routes.LeaderboardRoutes(v1)
	routes.AdminLogRoutes(v1)
	routes.InternalRoutes(app)

	port := os.Getenv("BACKEND_PORT")
	if port == "" {
		port = "8080"
	}
	app.Run(":" + port)
}
