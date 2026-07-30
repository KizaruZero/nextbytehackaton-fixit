package models

import "time"

type Comment struct {
	ID          uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	ReportID    uint      `json:"report_id" gorm:"not null;index"`
	DeviceToken string    `json:"device_token" gorm:"not null"`
	Content     string    `json:"content" gorm:"not null;type:text"`
	CreatedAt   time.Time `json:"created_at"`
}
