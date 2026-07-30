package routes

import (
	"fixit-backend/handlers"
	"fixit-backend/middleware"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func SetupRoutes(app *fiber.App, db *gorm.DB) {
	reportHandler := handlers.NewReportHandler(db)
	upvoteHandler := handlers.NewUpvoteHandler(db)
	statsHandler := handlers.NewStatsHandler(db)
	commentHandler := handlers.NewCommentHandler(db)

	api := app.Group("/api/v1", middleware.DeviceToken())

	api.Post("/reports", reportHandler.CreateReport)
	api.Get("/reports", reportHandler.GetReports)
	api.Get("/reports/:id", reportHandler.GetReport)
	api.Post("/reports/:id/upvote", upvoteHandler.UpvoteReport)
	api.Patch("/reports/:id/status", reportHandler.UpdateStatus)
	api.Get("/reports/:id/comments", commentHandler.GetComments)
	api.Post("/reports/:id/comments", commentHandler.CreateComment)
	api.Get("/stats", statsHandler.GetStats)
}
