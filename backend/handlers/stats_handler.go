package handlers

import (
	"fixit-backend/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type StatsHandler struct {
	DB *gorm.DB
}

func NewStatsHandler(db *gorm.DB) *StatsHandler {
	return &StatsHandler{DB: db}
}

type CategoryStat struct {
	Category string `json:"category"`
	Count    int64  `json:"count"`
}

// GET /api/v1/stats
func (h *StatsHandler) GetStats(c *fiber.Ctx) error {
	var total int64
	h.DB.Model(&models.Report{}).Count(&total)

	var resolved int64
	h.DB.Model(&models.Report{}).Where("status = ?", "resolved").Count(&resolved)

	resolvedRate := 0.0
	if total > 0 {
		resolvedRate = float64(resolved) / float64(total) * 100
	}

	// Breakdown by category
	categories := []string{
		"jalan_rusak", "sampah", "lampu_mati",
		"fasilitas_umum", "keamanan", "lainnya",
	}
	var categoryStats []CategoryStat
	for _, cat := range categories {
		var count int64
		h.DB.Model(&models.Report{}).Where("category = ?", cat).Count(&count)
		categoryStats = append(categoryStats, CategoryStat{Category: cat, Count: count})
	}

	// Top voted
	var topReports []models.Report
	h.DB.Order("upvote_count DESC").Limit(5).Find(&topReports)

	return c.JSON(fiber.Map{
		"data": fiber.Map{
			"total_reports":  total,
			"resolved_count": resolved,
			"resolved_rate":  resolvedRate,
			"by_category":    categoryStats,
			"top_voted":      topReports,
		},
	})
}
