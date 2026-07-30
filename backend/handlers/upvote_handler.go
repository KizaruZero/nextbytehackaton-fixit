package handlers

import (
	"fixit-backend/middleware"
	"fixit-backend/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type UpvoteHandler struct {
	DB *gorm.DB
}

func NewUpvoteHandler(db *gorm.DB) *UpvoteHandler {
	return &UpvoteHandler{DB: db}
}

// POST /api/v1/reports/:id/upvote
func (h *UpvoteHandler) UpvoteReport(c *fiber.Ctx) error {
	id := c.Params("id")
	deviceToken := c.Locals(middleware.DeviceTokenKey).(string)
	if deviceToken == "anonymous" {
		return c.Status(400).JSON(fiber.Map{"error": "X-Device-Token header is required"})
	}

	// Check report exists
	var report models.Report
	if err := h.DB.First(&report, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(404).JSON(fiber.Map{"error": "report not found"})
		}
		return c.Status(500).JSON(fiber.Map{"error": "failed to fetch report"})
	}

	// Check for duplicate upvote
	var existing models.Upvote
	result := h.DB.Where("report_id = ? AND device_token = ?", report.ID, deviceToken).First(&existing)
	if result.Error == nil {
		return c.Status(409).JSON(fiber.Map{"error": "you have already upvoted this report"})
	}

	// Create upvote
	upvote := models.Upvote{
		ReportID:    report.ID,
		DeviceToken: deviceToken,
	}
	if err := h.DB.Create(&upvote).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to create upvote"})
	}

	// Increment denormalized counter
	h.DB.Model(&report).UpdateColumn("upvote_count", gorm.Expr("upvote_count + 1"))
	h.DB.First(&report, report.ID)

	return c.JSON(fiber.Map{"data": fiber.Map{
		"upvote_count": report.UpvoteCount,
		"message":      "upvote recorded",
	}})
}
