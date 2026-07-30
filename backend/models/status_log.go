package models

import "time"

type StatusLog struct {
	ID        uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	ReportID  uint      `json:"report_id" gorm:"not null;index"`
	Status    string    `json:"status" gorm:"not null"`
	ChangedAt time.Time `json:"changed_at"`
}
