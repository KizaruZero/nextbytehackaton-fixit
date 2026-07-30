package config

import (
	"log"

	"fixit-backend/models"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB() *gorm.DB {
	var err error
	DB, err = gorm.Open(sqlite.Open("database.db"), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Create unique index on upvotes manually after migration
	err = DB.AutoMigrate(&models.Report{}, &models.Upvote{}, &models.StatusLog{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Ensure unique constraint on (report_id, device_token)
	DB.Exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_upvotes_report_device ON upvotes(report_id, device_token)")

	log.Println("Database initialized and migrated successfully")
	return DB
}
