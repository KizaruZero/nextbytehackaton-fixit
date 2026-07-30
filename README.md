# FixIt — Report. Vote. Resolve.

A community-driven civic reporting platform. Residents report local issues (broken infrastructure, trash, safety hazards, etc.), the community upvotes what's most urgent, and progress is tracked transparently from report to resolution.

Built for **Next Byte Hacks V3**.

---

## Table of Contents
- [Features](#features)
- [Design](#design)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Screenshots](#screenshots)
- [Roadmap](#roadmap)

---

## Features

### Core
- 📝 **Report an issue** — title, description, category, photo upload, and location picked directly on an interactive map
- 📋 **Feed** — browse all reports, sorted by upvotes or recency, filterable by category and status
- ⬆️ **Upvote** — one vote per device, community-driven prioritization (no admin gatekeeping)
- 🔄 **Status tracking** — Pending → In Progress → Resolved, with a full timeline of every change
- 🔍 **Detail view** — full report info, photo, status history

### Added enhancements
- 🗺️ **Map location picker** — drop a pin instead of typing an address; generates a direct map link
- 🏠 **Landing page** — clean first impression before entering the feed
- 🔗 **Share button** — copy a report's link to clipboard instantly, no backend needed
- 🖼️ **Image lightbox** — click any photo for a fullscreen view
- 💬 **Comments** — add context or confirm resolution on any report
- 📍 **"Near Me" filter** — surface reports closest to the user's current location using GPS
- ✨ **Upvote animation** — lightweight, satisfying feedback on interaction
- 🏷️ **Trending / Just Reported badges** — surface high-engagement or brand-new reports at a glance

---

## Design

FixIt uses a **neo-brutalist** design system: thick black borders, hard offset shadows, flat high-contrast colors, and no border-radius. This was a deliberate choice — the visual language mirrors the app's purpose: direct, transparent, no-nonsense civic reporting.

**Color tokens:**
| Token | Hex | Usage |
|---|---|---|
| `--color-bg` | `#FFFDF6` | Background |
| `--color-text` | `#111111` | Text, borders |
| `--color-primary` | `#4D61FC` | CTA, "In Progress" status |
| `--color-accent` | `#FFDE59` | Highlights, "Pending" status, active upvote |
| `--color-danger` | `#FF3D3D` | Urgent categories |
| `--color-success` | `#3DFFA2` | "Resolved" status |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Go + Fiber |
| Database | SQLite |
| Frontend | React (Vite) + Tailwind CSS |
| Maps | [insert map library used, e.g. Leaflet] |
| File storage | Local filesystem (`/uploads`) |
| Identity | Device token (UUID in `localStorage`), no login required |

---

## Project Structure

```
fixit/
├── backend/
│   ├── main.go
│   ├── config/
│   ├── models/          # Report, Upvote, StatusLog, Comment
│   ├── handlers/
│   ├── middleware/
│   ├── routes/
│   └── uploads/          # uploaded report photos
│
├── frontend/
│   ├── src/
│   │   ├── pages/         # Landing, Feed, Submit, Detail
│   │   ├── components/    # ReportCard, StatusBadge, UpvoteButton, MapPicker, Lightbox, CommentSection
│   │   ├── api/
│   │   └── utils/
│   └── public/
│
└── README.md
```

---

## Getting Started

### Prerequisites
- Go 1.21+
- Node.js 18+
- npm or yarn

### Backend Setup
```bash
cd backend
go mod tidy
go run main.go
# Server runs at http://localhost:8080
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

Make sure the frontend's API base URL (in `src/api/client.js`) points to `http://localhost:8080/api/v1`.

---

## API Reference

Base URL: `/api/v1`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/reports` | Create a new report (multipart form, includes image) |
| `GET` | `/reports` | List reports — supports `sort`, `category`, `status`, `near` (lat/lng) query params |
| `GET` | `/reports/:id` | Get report detail including status history and comments |
| `POST` | `/reports/:id/upvote` | Upvote a report (one per device) |
| `PATCH` | `/reports/:id/status` | Update a report's status |
| `POST` | `/reports/:id/comments` | Add a comment to a report |
| `GET` | `/uploads/:filename` | Serve an uploaded report photo |

All write requests require an `X-Device-Token` header for identity tracking (no login required).

---

## Screenshots

> _Add screenshots here before submitting — landing page, feed, submit form with map picker, and detail page with timeline/comments are the most important shots to include._

---

## Roadmap

- [ ] Full authentication for reporters and local authorities
- [ ] Push notifications on status change
- [ ] Admin dashboard for community organizations / local government
- [ ] Real-time feed updates via WebSocket

---

## License
MIT — free to use, modify, and build on for your own community.
