# AGENT.md — FixIt (Report & Resolve)

> Dokumen ini adalah instruksi teknis lengkap untuk Claude Code. Tujuan: membangun aplikasi web "FixIt" dari nol hingga siap demo dalam waktu terbatas (hackathon, ~10 jam). Ikuti urutan prioritas di bawah — fitur inti HARUS selesai dan berfungsi sebelum menyentuh fitur stretch.

---

## 1. Ringkasan Proyek

**Nama:** FixIt (bisa diganti sesuai selera)
**Tagline:** "GitHub Issues untuk masalah di lingkungan sekitar."

**Masalah yang diselesaikan:**
Warga sering melihat masalah komunitas (jalan rusak, sampah menumpuk, lampu jalan mati, fasilitas rusak) tapi tidak ada saluran terpusat untuk melaporkannya, apalagi mengetahui mana yang paling mendesak menurut warga lain, dan apakah sudah ditindaklanjuti.

**Solusi:**
Platform web sederhana di mana:
1. Warga bisa submit laporan masalah lengkap dengan foto dan lokasi.
2. Warga lain bisa **upvote** laporan yang mereka anggap paling penting/mendesak — ini menciptakan prioritas secara organik dari komunitas, bukan dari admin.
3. Status setiap laporan bisa di-update (Pending → In Progress → Resolved), dengan histori waktu (timeline) yang transparan.

**Target pengguna:** Warga RT/RW, komunitas kampus, atau kelompok masyarakat kecil yang butuh cara sederhana melaporkan & memprioritaskan masalah bersama.

**Kenapa ini kuat untuk judging:**
| Kriteria | Alasan |
|---|---|
| Innovation & Creativity | Bukan sekadar CRUD — ada mekanisme sosial (upvote) yang menciptakan prioritas dari bawah (bottom-up), bukan top-down |
| Technical Complexity | Relasi 3 entitas (Report, Upvote, StatusLog), file upload, agregasi data (vote count, filter, sort), device-based vote-limiting |
| Functionality & Execution | Scope terkontrol, tanpa dependency eksternal yang rawan gagal saat demo |
| Presentation & Clarity | Narasi jelas: lapor → komunitas prioritaskan lewat vote → transparansi progres |

---

## 2. Prioritas Eksekusi (PENTING — baca ini dulu)

Kerjakan **dalam urutan ini**. Jangan lompat ke stretch goals sebelum semua P0 selesai dan teruji jalan end-to-end.

- **P0 (wajib, harus selesai & bisa didemo):**
  1. Submit laporan (judul, deskripsi, kategori, 1 foto, lokasi teks)
  2. Feed laporan (list, sort by upvote/terbaru, filter kategori & status)
  3. Upvote (1 device = 1 vote per laporan)
  4. Halaman detail laporan
  5. Update status laporan + timeline riwayat status

- **P1 (kerjakan jika P0 sudah solid & waktu masih ada):**
  6. Dashboard statistik ringkas (total laporan, resolved rate, breakdown kategori)
  7. Styling & responsiveness polish

- **P2 (skip jika waktu mepet, jangan mulai kalau < 2 jam tersisa):**
  8. Komentar per laporan
  9. Geolocation otomatis dari browser (`navigator.geolocation`) sebagai pelengkap lokasi teks

**Aturan tambahan:**
- Jangan integrasi cloud storage (S3, Cloudinary, dsb) — simpan upload gambar di folder lokal server.
- Jangan pakai library peta interaktif (Leaflet/Mapbox) — lokasi cukup berupa teks bebas.
- Jangan bangun sistem login penuh — gunakan device token (UUID random) yang disimpan di `localStorage` untuk membedakan siapa yang sudah upvote.
- Selalu commit ke git setiap kali satu fitur P0 selesai dan teruji, supaya ada checkpoint yang bisa di-rollback.

---

## 3. Tech Stack

| Layer | Teknologi | Catatan |
|---|---|---|
| Backend | Go + Fiber (atau Gin, pilih salah satu, jangan campur) | REST API |
| Database | SQLite (via `gorm` atau `database/sql` + `mattn/go-sqlite3`) | File-based, tidak perlu setup server DB |
| Frontend | React (Vite) + Tailwind CSS | SPA, konsumsi REST API |
| File upload | Simpan ke folder lokal `/uploads`, di-serve sebagai static file oleh backend | Tidak pakai cloud storage |
| State management FE | React `useState`/`useEffect` biasa, tidak perlu Redux (scope kecil) | |
| Auth | Tanpa login. Device token UUID di localStorage, dikirim di header `X-Device-Token` | |
| Deploy (opsional) | Railway/Render untuk backend, Vercel untuk frontend. Jika waktu mepet, cukup jalankan localhost saat demo | |

---

## 4. Struktur Folder

```
fixit/
├── backend/
│   ├── main.go
│   ├── go.mod
│   ├── go.sum
│   ├── config/
│   │   └── database.go
│   ├── models/
│   │   ├── report.go
│   │   ├── upvote.go
│   │   └── status_log.go
│   ├── handlers/
│   │   ├── report_handler.go
│   │   ├── upvote_handler.go
│   │   └── stats_handler.go       # P1
│   ├── middleware/
│   │   └── device_token.go
│   ├── routes/
│   │   └── routes.go
│   ├── uploads/                    # folder penyimpanan foto (gitignored isi, keep .gitkeep)
│   └── database.db                 # SQLite file (gitignored)
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── api/
│   │   │   └── client.js           # fetch wrapper + base URL
│   │   ├── utils/
│   │   │   └── deviceToken.js      # generate & simpan device token
│   │   ├── pages/
│   │   │   ├── FeedPage.jsx
│   │   │   ├── SubmitPage.jsx
│   │   │   ├── DetailPage.jsx
│   │   │   └── StatsPage.jsx       # P1
│   │   └── components/
│   │       ├── ReportCard.jsx
│   │       ├── StatusBadge.jsx
│   │       ├── UpvoteButton.jsx
│   │       ├── CategoryFilter.jsx
│   │       └── StatusTimeline.jsx
│   └── public/
│
├── .gitignore
└── README.md
```

---

## 5. Data Model

### Report
| Field | Tipe | Keterangan |
|---|---|---|
| id | integer, PK, autoincrement | |
| title | string, required | max 100 karakter |
| description | text, required | |
| category | enum string | `jalan_rusak`, `sampah`, `lampu_mati`, `fasilitas_umum`, `keamanan`, `lainnya` |
| image_path | string, nullable | path relatif ke file di `/uploads` |
| location_text | string, required | alamat/deskripsi lokasi bebas |
| latitude | float, nullable | P2, opsional |
| longitude | float, nullable | P2, opsional |
| status | enum string | `pending` (default), `in_progress`, `resolved` |
| upvote_count | integer, default 0 | denormalized counter, di-update tiap ada upvote baru |
| reporter_device_token | string | pemilik laporan, untuk otorisasi update status sederhana |
| created_at | datetime | |
| updated_at | datetime | |

### Upvote
| Field | Tipe | Keterangan |
|---|---|---|
| id | integer, PK | |
| report_id | integer, FK → Report.id | |
| device_token | string | dikombinasikan dengan report_id harus unique (1 device = 1 vote per laporan) |
| created_at | datetime | |

**Constraint:** unique index pada (`report_id`, `device_token`).

### StatusLog
| Field | Tipe | Keterangan |
|---|---|---|
| id | integer, PK | |
| report_id | integer, FK → Report.id | |
| status | enum string | status baru yang di-set |
| changed_at | datetime | |

**Catatan:** setiap kali status Report berubah, insert satu baris baru di StatusLog. Saat Report dibuat pertama kali, langsung insert satu StatusLog dengan status `pending`.

---

## 6. API Endpoints

Base URL: `/api/v1`

| Method | Endpoint | Deskripsi | Body / Query |
|---|---|---|---|
| POST | `/reports` | Buat laporan baru (multipart form karena ada upload gambar) | `title, description, category, location_text, image (file)` + header `X-Device-Token` |
| GET | `/reports` | List laporan | Query: `sort=upvotes|newest`, `category=...`, `status=...` |
| GET | `/reports/:id` | Detail satu laporan (termasuk status_logs) | — |
| POST | `/reports/:id/upvote` | Upvote laporan | Header `X-Device-Token`. Return 409 jika device sudah pernah vote laporan ini |
| PATCH | `/reports/:id/status` | Update status laporan | Body: `{ "status": "in_progress" }`. Insert StatusLog baru + update Report.status |
| GET | `/stats` | (P1) Statistik ringkas | Return total reports, resolved rate, breakdown per kategori |
| GET | `/uploads/:filename` | Static serve file gambar | — |

**Format response sukses:**
```json
{ "data": { ... } }
```

**Format response error:**
```json
{ "error": "pesan error singkat dan jelas" }
```

**Validasi penting:**
- `title`, `description`, `category`, `location_text` wajib diisi saat create.
- `category` dan `status` harus salah satu dari enum yang valid — tolak dengan 400 jika tidak.
- Upvote endpoint harus cek duplikasi (unique constraint report_id + device_token) sebelum insert, return 409 Conflict jika sudah pernah vote.
- Upload gambar: validasi tipe file (jpg/png/webp) dan batasi ukuran max 5MB.

---

## 7. Alur Kerja Frontend (User Flow)

1. **FeedPage** (halaman utama `/`)
   - Fetch `GET /reports?sort=upvotes` saat load.
   - Tampilkan grid/list `ReportCard`: foto thumbnail, judul, kategori, `StatusBadge`, jumlah upvote, `UpvoteButton`.
   - `CategoryFilter` dan toggle sort (upvote terbanyak / terbaru) di atas list.
   - Klik card → navigasi ke `DetailPage`.
   - Tombol "+ Lapor Masalah" mengarah ke `SubmitPage`.

2. **SubmitPage** (`/submit`)
   - Form: title, description, category (dropdown), location_text, image upload (dengan preview).
   - Submit → `POST /reports` (multipart), sertakan device token dari localStorage di header.
   - Setelah sukses, redirect ke `DetailPage` laporan yang baru dibuat.

3. **DetailPage** (`/reports/:id`)
   - Fetch `GET /reports/:id`.
   - Tampilkan foto besar, deskripsi lengkap, `UpvoteButton` (disable jika device sudah vote — cek dari response API atau simpan daftar id yang sudah divote di localStorage), `StatusTimeline` menampilkan riwayat status dari StatusLog.
   - Jika `reporter_device_token` sama dengan device token user saat ini (pelapor asli), tampilkan dropdown untuk update status → `PATCH /reports/:id/status`.

4. **StatsPage** (P1, `/stats`)
   - Fetch `GET /stats`, tampilkan angka ringkas + chart sederhana (pakai `recharts`) breakdown kategori.

---

## 8. Device Token Logic (Frontend)

```js
// src/utils/deviceToken.js
export function getDeviceToken() {
  let token = localStorage.getItem('fixit_device_token');
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem('fixit_device_token', token);
  }
  return token;
}
```

Sertakan token ini di header `X-Device-Token` pada setiap request POST/PATCH ke API.

---

## 9. Design System — Neo-Brutalism

UI wajib mengikuti gaya **Neo-Brutalism**: tegas, kontras tinggi, border tebal, tanpa gradient, tanpa soft-shadow. Cocok dengan karakter aplikasi (laporan warga = langsung, jujur, tanpa basa-basi) dan cepat dieksekusi dalam waktu terbatas.

### Prinsip Wajib
- **Border tebal solid**, bukan tipis: `border: 3px solid #000000` (atau 2-4px, konsisten di semua komponen).
- **Shadow keras (hard shadow)**, bukan blur: `box-shadow: 4px 4px 0px #000000` — tanpa `blur-radius`. Efek hover: geser shadow (`translate` element + shadow mengecil) untuk kesan "ditekan".
- **Tanpa border-radius** atau radius sangat kecil (0–4px). Bentuk kotak tegas adalah ciri khas gaya ini.
- **Warna flat/solid**, tidak ada gradient sama sekali.
- **Tipografi tebal & besar** untuk heading — gunakan font sans-serif dengan weight tinggi (700–900), bisa sedikit "kasar"/kondensat untuk kesan poster.
- **Elemen interaktif harus terlihat sangat jelas jadi elemen** — tombol tampak seperti tombol fisik (border tebal + shadow), bukan flat minimal.

### Palet Warna (token, gunakan sebagai CSS variables)
```css
:root {
  --color-bg: #FFFDF6;         /* off-white, bukan putih polos */
  --color-text: #111111;       /* hitam pekat */
  --color-primary: #4D61FC;    /* biru elektrik — aksen utama, tombol CTA */
  --color-accent: #FFDE59;     /* kuning terang — highlight, upvote aktif */
  --color-danger: #FF3D3D;     /* merah — kategori "keamanan", status urgent */
  --color-success: #3DFFA2;    /* hijau mint — status resolved */
  --color-border: #111111;     /* border selalu hitam pekat, konsisten */
}
```

### Mapping Status → Warna (untuk StatusBadge)
| Status | Background | Border/Text |
|---|---|---|
| `pending` | `--color-accent` (kuning) | hitam |
| `in_progress` | `--color-primary` (biru) | putih |
| `resolved` | `--color-success` (hijau mint) | hitam |

### Komponen Kunci
- **ReportCard**: kotak dengan border 3px hitam + hard shadow 4px, background putih/off-white. Hover: card sedikit terangkat (translate -2px) dengan shadow membesar, atau sebaliknya (ditekan) — pilih satu, konsisten di semua card.
- **UpvoteButton**: kotak kecil dengan angka besar dan ikon panah/anak panah. Saat sudah divote, ubah background jadi `--color-accent` penuh (solid fill) sebagai indikator visual jelas — jangan hanya ubah warna teks.
- **StatusBadge**: label kotak kecil, border tebal, warna solid sesuai tabel di atas, teks uppercase bold.
- **Form (SubmitPage)**: input dan textarea dengan border tebal hitam, focus state ganti warna border jadi `--color-primary`, tanpa efek shadow blur bawaan browser.
- **Signature element (elemen unik halaman)**: heading utama Feed page pakai tipografi besar dengan sedikit rotasi (`transform: rotate(-1deg)`) pada elemen dekoratif kecil (misal label "LAPORAN TERBARU") untuk kesan "ditempel", khas neo-brutalism poster style. Gunakan secukupnya, jangan di semua elemen.

### Yang Harus Dihindari
- Jangan pakai shadow blur (`box-shadow` dengan blur-radius besar) — itu ciri soft-UI/neumorphism, bukan neo-brutalism.
- Jangan pakai gradient di background atau tombol manapun.
- Jangan pakai border-radius besar (di atas 4px) kecuali ada elemen yang sengaja dibuat bulat penuh (misal avatar/icon) sebagai kontras yang disengaja.
- Jangan campur terlalu banyak warna aksen dalam satu komponen — maksimal 2 warna aksen per elemen.

### Implementasi Tailwind (opsional, mempercepat konsistensi)
Tambahkan ke `tailwind.config.js`:
```js
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: '#FFFDF6',
        ink: '#111111',
        primary: '#4D61FC',
        accent: '#FFDE59',
        danger: '#FF3D3D',
        success: '#3DFFA2',
      },
      boxShadow: {
        brutal: '4px 4px 0px #111111',
        'brutal-sm': '2px 2px 0px #111111',
        'brutal-lg': '6px 6px 0px #111111',
      },
      borderWidth: {
        3: '3px',
      },
    },
  },
};
```
Lalu komponen tinggal pakai class seperti: `border-3 border-ink shadow-brutal bg-bg`.

---

## 10. Setup & Menjalankan Proyek (untuk README)

### Backend
```bash
cd backend
go mod tidy
go run main.go
# server jalan di http://localhost:8080
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# app jalan di http://localhost:5173
```

Pastikan `.env` atau konstanta di `src/api/client.js` mengarah ke `http://localhost:8080/api/v1`.

---

## 11. Definition of Done (per fitur)

Sebuah fitur P0 dianggap selesai HANYA jika:
- Endpoint API sudah diuji manual (curl/Postman) dan mengembalikan response sesuai kontrak di atas.
- UI terhubung ke endpoint tersebut dan berfungsi tanpa error di console.
- Sudah dicoba end-to-end minimal 1 kali skenario penuh (submit → muncul di feed → upvote → detail → update status → status log bertambah).
- Sudah di-commit ke git dengan pesan commit yang jelas.

**Checklist akhir sebelum demo:**
- [ ] Bisa submit laporan baru dengan foto
- [ ] Laporan muncul di feed, bisa difilter kategori & status
- [ ] Sort by upvote terbanyak berfungsi
- [ ] Upvote bertambah, tidak bisa double-vote dari device yang sama
- [ ] Detail laporan menampilkan foto, deskripsi, timeline status
- [ ] Update status berfungsi dan tercatat di timeline
- [ ] Tidak ada error di console browser maupun terminal backend
- [ ] README berisi cara menjalankan proyek dari nol

---

## 12. Yang Sengaja Tidak Dikerjakan (Out of Scope)

Agar Claude Code tidak membuang waktu di luar prioritas:
- Tidak ada sistem login/register penuh
- Tidak ada peta interaktif (Leaflet/Mapbox)
- Tidak ada cloud storage untuk gambar
- Tidak ada real-time update (WebSocket/polling) — refresh manual cukup
- Tidak ada notifikasi
- Tidak ada multi-bahasa
- Tidak ada testing otomatis (unit test) kecuali waktu sangat berlebih di akhir
