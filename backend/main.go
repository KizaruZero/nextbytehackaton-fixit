package main

import (
	"log"
	"os"

	"fixit-backend/config"
	"fixit-backend/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	// Ensure uploads directory exists
	if err := os.MkdirAll("uploads", os.ModePerm); err != nil {
		log.Fatal("Failed to create uploads directory:", err)
	}

	// Initialize database
	db := config.InitDB()

	// Create Fiber app
	app := fiber.New(fiber.Config{
		BodyLimit: 10 * 1024 * 1024, // 10MB body limit
	})

	// Middleware
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, X-Device-Token",
		AllowMethods: "GET, POST, PATCH, DELETE, OPTIONS",
	}))

	// Static file serving for uploads
	app.Static("/uploads", "./uploads")

	// Setup API routes
	routes.SetupRoutes(app, db)

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	log.Println("FixIt backend starting on :8080")
	log.Fatal(app.Listen(":8080"))
}
