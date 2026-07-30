package handlers

import (
	"strings"

	"fixit-backend/middleware"
	"fixit-backend/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type CommentHandler struct {
	DB *gorm.DB
}

func NewCommentHandler(db *gorm.DB) *CommentHandler {
	return &CommentHandler{DB: db}
}

// GET /api/v1/reports/:id/comments
func (h *CommentHandler) GetComments(c *fiber.Ctx) error {
	id := c.Params("id")

	// Verify report exists
	var report models.Report
	if err := h.DB.First(&report, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(404).JSON(fiber.Map{"error": "report not found"})
		}
		return c.Status(500).JSON(fiber.Map{"error": "failed to fetch report"})
	}

	var comments []models.Comment
	if err := h.DB.Where("report_id = ?", id).Order("created_at ASC").Find(&comments).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to fetch comments"})
	}

	return c.JSON(fiber.Map{"data": comments})
}

// POST /api/v1/reports/:id/comments
func (h *CommentHandler) CreateComment(c *fiber.Ctx) error {
	id := c.Params("id")
	deviceToken := c.Locals(middleware.DeviceTokenKey).(string)
	if deviceToken == "anonymous" {
		return c.Status(400).JSON(fiber.Map{"error": "X-Device-Token header is required"})
	}

	var body struct {
		Content string `json:"content"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid request body"})
	}

	content := strings.TrimSpace(body.Content)
	if content == "" {
		return c.Status(400).JSON(fiber.Map{"error": "comment content is required"})
	}
	if len(content) > 1000 {
		return c.Status(400).JSON(fiber.Map{"error": "comment must not exceed 1000 characters"})
	}

	// Verify report exists
	var report models.Report
	if err := h.DB.First(&report, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(404).JSON(fiber.Map{"error": "report not found"})
		}
		return c.Status(500).JSON(fiber.Map{"error": "failed to fetch report"})
	}

	comment := models.Comment{
		ReportID:    report.ID,
		DeviceToken: deviceToken,
		Content:     content,
	}
	if err := h.DB.Create(&comment).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to create comment"})
	}

	return c.Status(201).JSON(fiber.Map{"data": comment})
}
