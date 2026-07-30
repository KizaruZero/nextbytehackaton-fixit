package models

import "time"

type Upvote struct {
	ID          uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	ReportID    uint      `json:"report_id" gorm:"not null;index"`
	DeviceToken string    `json:"device_token" gorm:"not null"`
	CreatedAt   time.Time `json:"created_at"`
}
