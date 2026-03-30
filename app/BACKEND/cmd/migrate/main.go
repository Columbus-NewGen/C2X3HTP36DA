package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strconv"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	runningMode := os.Getenv("RUNNING_MODE")
	if runningMode == "" {
		runningMode = "local"
	}

	if runningMode == "local" {
		if err := godotenv.Load("configs/.env"); err != nil {
			log.Printf("Warning: Error loading .env file: %v", err)
		}
	}

	// Build PostgreSQL connection string
	var dbURL string
	mode := os.Getenv("MODE")

	if mode == "remote" {
		// Use DB_URL directly for remote connections
		dbURL = os.Getenv("DB_URL")
		if dbURL == "" {
			log.Fatal("Error: DB_URL environment variable is required when MODE=remote")
		}
		log.Printf("Using remote database connection")
	} else {
		// Build connection string from individual components
		sslMode := os.Getenv("DATABASE_SSLMODE")
		if sslMode == "" {
			sslMode = "disable"
		}

		dbURL = fmt.Sprintf(
			"postgres://%s:%s@%s:%s/%s?sslmode=%s",
			os.Getenv("DATABASE_USERNAME"),
			os.Getenv("DATABASE_PASSWORD"),
			os.Getenv("DATABASE_HOST"),
			os.Getenv("DATABASE_PORT"),
			os.Getenv("DATABASE_NAME"),
			sslMode,
		)
	}

	// Get absolute path to migrations directory
	projectRoot, err := os.Getwd()
	if err != nil {
		log.Fatal("Error getting working directory:", err)
	}
	migrationsPath := filepath.Join(projectRoot, "migrations")
	sourceURL := fmt.Sprintf("file://%s", migrationsPath)

	// Create migrate instance
	m, err := migrate.New(sourceURL, dbURL)
	if err != nil {
		log.Fatal("Error creating migrate instance:", err)
	}
	defer m.Close()

	// Parse command
	if len(os.Args) < 2 {
		printUsage()
		os.Exit(1)
	}

	command := os.Args[1]

	switch command {
	case "up":
		if err := m.Up(); err != nil && err != migrate.ErrNoChange {
			log.Fatal("Error migrating up:", err)
		}
		version, dirty, _ := m.Version()
		fmt.Printf("✓ Migration completed successfully. Current version: %d (dirty: %v)\n", version, dirty)

	case "down":
		if err := m.Down(); err != nil && err != migrate.ErrNoChange {
			log.Fatal("Error migrating down:", err)
		}
		fmt.Println("✓ Migration rolled back successfully")

	case "version":
		version, dirty, err := m.Version()
		if err != nil {
			log.Fatal("Error getting version:", err)
		}
		fmt.Printf("Current version: %d (dirty: %v)\n", version, dirty)

	case "force":
		if len(os.Args) < 3 {
			fmt.Println("Error: force command requires version number")
			fmt.Println("Usage: migrate force <version>")
			os.Exit(1)
		}
		version, err := strconv.Atoi(os.Args[2])
		if err != nil {
			log.Fatal("Error: version must be a number")
		}
		if err := m.Force(version); err != nil {
			log.Fatal("Error forcing version:", err)
		}
		fmt.Printf("✓ Forced database version to: %d\n", version)

	case "steps":
		if len(os.Args) < 3 {
			fmt.Println("Error: steps command requires number of steps")
			fmt.Println("Usage: migrate steps <n> (use negative for down)")
			os.Exit(1)
		}
		steps, err := strconv.Atoi(os.Args[2])
		if err != nil {
			log.Fatal("Error: steps must be a number")
		}
		if err := m.Steps(steps); err != nil && err != migrate.ErrNoChange {
			log.Fatal("Error migrating steps:", err)
		}
		version, dirty, _ := m.Version()
		fmt.Printf("✓ Migration completed. Current version: %d (dirty: %v)\n", version, dirty)

	case "goto":
		if len(os.Args) < 3 {
			fmt.Println("Error: goto command requires version number")
			fmt.Println("Usage: migrate goto <version>")
			os.Exit(1)
		}
		version, err := strconv.ParseUint(os.Args[2], 10, 64)
		if err != nil {
			log.Fatal("Error: version must be a number")
		}
		if err := m.Migrate(uint(version)); err != nil && err != migrate.ErrNoChange {
			log.Fatal("Error migrating to version:", err)
		}
		fmt.Printf("✓ Migrated to version: %d\n", version)

	default:
		fmt.Printf("Unknown command: %s\n", command)
		printUsage()
		os.Exit(1)
	}
}

func printUsage() {
	fmt.Println("Database Migration Tool")
	fmt.Println("\nUsage:")
	fmt.Println("  migrate <command> [arguments]")
	fmt.Println("\nCommands:")
	fmt.Println("  up              Apply all pending migrations")
	fmt.Println("  down            Rollback all migrations")
	fmt.Println("  version         Show current migration version")
	fmt.Println("  force <version> Force set version (use to fix dirty state)")
	fmt.Println("  steps <n>       Apply n migrations (use negative to rollback)")
	fmt.Println("  goto <version>  Migrate to specific version")
	fmt.Println("\nExamples:")
	fmt.Println("  migrate up")
	fmt.Println("  migrate down")
	fmt.Println("  migrate version")
	fmt.Println("  migrate force 1")
	fmt.Println("  migrate steps 1")
	fmt.Println("  migrate steps -1")
	fmt.Println("  migrate goto 2")
}
