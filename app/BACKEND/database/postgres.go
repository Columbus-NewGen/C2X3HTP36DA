package database

import (
	"fmt"
	"os"

	log "github.com/sirupsen/logrus"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// ConnectDB establishes database connection
// Note: Migrations must be run separately via `make migrate-up`
func ConnectDB(runEnv string) (err error) {
	sslMode := os.Getenv("DATABASE_SSLMODE")
	if sslMode == "" {
		if runEnv == "development" {
			sslMode = "disable"
		} else {
			sslMode = "require"
		}
	}

	connectionString := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s search_path=public",
		os.Getenv("DATABASE_HOST"),
		os.Getenv("DATABASE_PORT"),
		os.Getenv("DATABASE_USERNAME"),
		os.Getenv("DATABASE_PASSWORD"),
		os.Getenv("DATABASE_NAME"),
		sslMode,
	)

	db, err := gorm.Open(postgres.Open(connectionString), &gorm.Config{
		Logger:                 logger.Default.LogMode(logger.Silent),
		SkipDefaultTransaction: true,
	})
	if err != nil {
		return err
	}

	log.Info("[database]: Connected to database")
	DB = db

	return nil
}

