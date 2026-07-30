package handlers

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	"fixit-backend/middleware"
	"fixit-backend/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ReportHandler struct {
	DB *gorm.DB
}

func NewReportHandler(db *gorm.DB) *ReportHandler {
	return &ReportHandler{DB: db}
}

// POST /api/v1/reports
func (h *ReportHandler) CreateReport(c *fiber.Ctx) error {
	deviceToken := c.Locals(middleware.DeviceTokenKey).(string)
	if deviceToken == "anonymous" {
		return c.Status(400).JSON(fiber.Map{"error": "X-Device-Token header is required"})
	}

	title := strings.TrimSpace(c.FormValue("title"))
	description := strings.TrimSpace(c.FormValue("description"))
	category := strings.TrimSpace(c.FormValue("category"))
	locationText := strings.TrimSpace(c.FormValue("location_text"))

	// Validate required fields
	if title == "" || description == "" || category == "" || locationText == "" {
		return c.Status(400).JSON(fiber.Map{"error": "title, description, category, and location_text are required"})
	}
	if len(title) > 100 {
		return c.Status(400).JSON(fiber.Map{"error": "title must not exceed 100 characters"})
	}
	if !models.ValidCategories[category] {
		return c.Status(400).JSON(fiber.Map{"error": "invalid category"})
	}

	// Handle file upload
	imagePath := ""
	file, err := c.FormFile("image")
	if err == nil && file != nil {
		// Validate size
		if file.Size > 5*1024*1024 {
			return c.Status(400).JSON(fiber.Map{"error": "image must be less than 5MB"})
		}

		// Validate type
		ext := strings.ToLower(filepath.Ext(file.Filename))
		if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" {
			return c.Status(400).JSON(fiber.Map{"error": "image must be jpg, png, or webp"})
		}

		// Save file
		newFilename := fmt.Sprintf("%s%s", uuid.New().String(), ext)
		savePath := filepath.Join("uploads", newFilename)

		src, err := file.Open()
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "failed to open uploaded file"})
		}
		defer src.Close()

		dst, err := os.Create(savePath)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "failed to save file"})
		}
		defer dst.Close()

		if _, err = io.Copy(dst, src); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "failed to write file"})
		}

		imagePath = "/uploads/" + newFilename
	}

	report := models.Report{
		Title:               title,
		Description:         description,
		Category:            category,
		ImagePath:           imagePath,
		LocationText:        locationText,
		Status:              "pending",
		UpvoteCount:         0,
		ReporterDeviceToken: deviceToken,
	}

	if err := h.DB.Create(&report).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to create report"})
	}

	// Insert initial status log
	statusLog := models.StatusLog{
		ReportID:  report.ID,
		Status:    "pending",
		ChangedAt: time.Now(),
	}
	h.DB.Create(&statusLog)

	// Reload with status logs
	h.DB.Preload("StatusLogs").First(&report, report.ID)

	return c.Status(201).JSON(fiber.Map{"data": report})
}

// GET /api/v1/reports
func (h *ReportHandler) GetReports(c *fiber.Ctx) error {
	sort := c.Query("sort", "upvotes") // upvotes | newest
	category := c.Query("category", "")
	status := c.Query("status", "")

	query := h.DB.Model(&models.Report{})

	if category != "" && models.ValidCategories[category] {
		query = query.Where("category = ?", category)
	}
	if status != "" && models.ValidStatuses[status] {
		query = query.Where("status = ?", status)
	}

	if sort == "newest" {
		query = query.Order("created_at DESC")
	} else {
		query = query.Order("upvote_count DESC, created_at DESC")
	}

	var reports []models.Report
	if err := query.Find(&reports).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to fetch reports"})
	}

	return c.JSON(fiber.Map{"data": reports})
}

// GET /api/v1/reports/:id
func (h *ReportHandler) GetReport(c *fiber.Ctx) error {
	id := c.Params("id")
	var report models.Report
	if err := h.DB.Preload("StatusLogs", func(db *gorm.DB) *gorm.DB {
		return db.Order("changed_at ASC")
	}).First(&report, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(404).JSON(fiber.Map{"error": "report not found"})
		}
		return c.Status(500).JSON(fiber.Map{"error": "failed to fetch report"})
	}
	return c.JSON(fiber.Map{"data": report})
}

// PATCH /api/v1/reports/:id/status
func (h *ReportHandler) UpdateStatus(c *fiber.Ctx) error {
	id := c.Params("id")

	var body struct {
		Status string `json:"status"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid request body"})
	}

	if !models.ValidStatuses[body.Status] {
		return c.Status(400).JSON(fiber.Map{"error": "invalid status value"})
	}

	var report models.Report
	if err := h.DB.First(&report, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(404).JSON(fiber.Map{"error": "report not found"})
		}
		return c.Status(500).JSON(fiber.Map{"error": "failed to fetch report"})
	}

	// Update report status
	report.Status = body.Status
	if err := h.DB.Save(&report).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to update status"})
	}

	// Insert status log
	statusLog := models.StatusLog{
		ReportID:  report.ID,
		Status:    body.Status,
		ChangedAt: time.Now(),
	}
	h.DB.Create(&statusLog)

	// Reload with status logs
	h.DB.Preload("StatusLogs", func(db *gorm.DB) *gorm.DB {
		return db.Order("changed_at ASC")
	}).First(&report, report.ID)

	return c.JSON(fiber.Map{"data": report})
}
