package models

import "time"

type Report struct {
	ID                  uint       `json:"id" gorm:"primaryKey;autoIncrement"`
	Title               string     `json:"title" gorm:"not null;size:100"`
	Description         string     `json:"description" gorm:"not null;type:text"`
	Category            string     `json:"category" gorm:"not null"`
	ImagePath           string     `json:"image_path"`
	LocationText        string     `json:"location_text" gorm:"not null"`
	Latitude            *float64   `json:"latitude"`
	Longitude           *float64   `json:"longitude"`
	Status              string     `json:"status" gorm:"default:pending"`
	UpvoteCount         int        `json:"upvote_count" gorm:"default:0"`
	ReporterDeviceToken string     `json:"reporter_device_token" gorm:"not null"`
	CreatedAt           time.Time  `json:"created_at"`
	UpdatedAt           time.Time  `json:"updated_at"`
	StatusLogs          []StatusLog `json:"status_logs,omitempty" gorm:"foreignKey:ReportID"`
}

var ValidCategories = map[string]bool{
	"jalan_rusak":    true,
	"sampah":         true,
	"lampu_mati":     true,
	"fasilitas_umum": true,
	"keamanan":       true,
	"lainnya":        true,
}

var ValidStatuses = map[string]bool{
	"pending":     true,
	"in_progress": true,
	"resolved":    true,
}
