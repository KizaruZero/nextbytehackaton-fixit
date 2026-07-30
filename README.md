# FixIt — Lapor & Selesaikan

> "GitHub Issues untuk masalah di lingkungan sekitar."

Platform laporan masalah komunitas di mana warga bisa **submit**, **upvote**, dan **pantau status** penyelesaian masalah di lingkungan mereka.

## 🚀 Fitur Utama

- **Submit laporan** — judul, deskripsi, kategori, foto, lokasi
- **Feed laporan** — sort by upvote/terbaru, filter kategori & status
- **Upvote** — 1 device = 1 vote per laporan (via device token)
- **Detail laporan** — foto, deskripsi lengkap, timeline riwayat status
- **Update status** — Pending → In Progress → Resolved (hanya pelapor asli)
- **Statistik** — total laporan, resolved rate, chart per kategori

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | Go + Fiber v2 + GORM |
| Database | SQLite (pure Go, no CGO) |
| Frontend | React + Vite + Tailwind CSS v3 |
| Auth | Device token UUID (localStorage) |

## 📦 Cara Menjalankan

### Backend

```bash
cd backend
go mod tidy
go run main.go
# Server jalan di http://localhost:8080
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App jalan di http://localhost:5173
```

> Pastikan backend sudah running sebelum membuka frontend.

## 📁 Struktur Folder

```
fixit/
├── backend/
│   ├── main.go
│   ├── go.mod
│   ├── config/database.go
│   ├── models/          # report.go, upvote.go, status_log.go
│   ├── handlers/        # report_handler.go, upvote_handler.go, stats_handler.go
│   ├── middleware/      # device_token.go
│   ├── routes/          # routes.go
│   └── uploads/         # foto tersimpan di sini
│
└── frontend/
    ├── src/
    │   ├── api/client.js
    │   ├── utils/deviceToken.js
    │   ├── components/  # ReportCard, StatusBadge, UpvoteButton, dll
    │   └── pages/       # FeedPage, SubmitPage, DetailPage, StatsPage
    └── ...
```

## 🔌 API Endpoints

| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/api/v1/reports` | Buat laporan baru (multipart) |
| GET | `/api/v1/reports` | List laporan (sort, filter) |
| GET | `/api/v1/reports/:id` | Detail laporan + status logs |
| POST | `/api/v1/reports/:id/upvote` | Upvote laporan |
| PATCH | `/api/v1/reports/:id/status` | Update status |
| GET | `/api/v1/stats` | Statistik dashboard |
| GET | `/uploads/:filename` | Serve foto laporan |
