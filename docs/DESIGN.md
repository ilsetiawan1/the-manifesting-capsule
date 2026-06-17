# UI/UX & Design Specification Document
## Project: The Manifesting Capsule (Mobile-First Responsive Web App)
### Version: 2.5 — Luxury Wellness & Photo Support Edition (Current)

---

## 1. Design Philosophy

Aplikasi ini mengusung tema **"Silent Digital Sanctuary / Luxury Wellness Journal"** — tempat perlindungan digital yang tenang, reflektif, intim, dan premium. Gaya visual menggunakan perpaduan *Warm Ivory*, *Soft Beige*, dan *Champagne Gold* yang memberikan kesan hangat dan mendalam, berlawanan dengan gaya aplikasi SaaS produktivitas konvensional.

**Prinsip Desain Utama:**
- **No Onboarding** — UI yang bersih menjelaskan dirinya sendiri. User buka web, langsung disambut feed manifestasi global.
- **Frictionless First** — Setiap aksi harus bisa diselesaikan dalam 3 tap atau kurang.
- **Text & Photo as Hero** — Dukungan visualisasi foto target yang elegan berpadu dengan tipografi serif/sans yang kokoh memberikan ikatan emosional tinggi pada manifestasi pengguna.

---

## 2. Design System

### A. Color Palette (Luxury Wellness V2)

| Token | Light Value | Dark Value | Penggunaan |
|---|---|---|---|
| **Background** | `#F7F4EF` (Warm Ivory) | `#1C1917` (Rich Espresso) | Background utama aplikasi |
| **Surface / Card** | `#FCFAF8` (Cream White) | `#292524` (Warm Stone) | Bento Card, Sidebar, Bottom Navigation |
| **Primary Brand** | `#C8A96B` (Champagne Gold) | `#D4B06A` (Soft Gold) | CTA Button, Active Tab, Progress Bar |
| **Primary Hover** | `#B8935F` (Deep Gold) | `#D4B06A` (Soft Gold) | State hover/aktif tombol utama |
| **Primary Text** | `#2D2926` (Dark Coffee) | `#F5F1EB` (Ivory White) | Judul & heading utama |
| **Secondary Text** | `#8A8278` (Warm Gray) | `#B8AEA3` (Warm Gray) | Sub-header, keterangan waktu, metadata |
| **Border / Divider** | `#E8DFD4` (Soft Beige) | `#44403C` (Stone Border) | Border tipis card dan separator menu |
| **Success State** | `#4F8A5B` (Sage Green) | `#4F8A5B` (Sage Green) | Indikator unlocked, toast sukses |
| **Danger State** | `#B85C5C` (Soft Red) | `#B85C5C` (Soft Red) | Tombol logout, delete, error |
| **Awakened Card Bg** | `#2D2926` (Dark Coffee) | `#1C1917` (Rich Espresso) | Background kartu yang sudah terbuka (high contrast) |

### B. Typography

- Font Family: Geist Sans (bawaan Next.js) — bersih, modern, readable di layar kecil.
- Hierarchy:
  - `text-xl font-bold` — Nama target / judul kapsul.
  - `text-sm font-medium` — Tanggal & metadata.
  - `text-xs text-slate-400` — Label keterangan (Days Left, Created At).
  - `font-mono text-xs` — Countdown timer & Access Key display.

### C. Component Geometry

- Corner Radius: `rounded-2xl` (16px) — untuk menu items, inputs, dan card sekunder. `rounded-[2.5rem]` (40px) untuk detail modal dan bottom navigation.
- Card Shadow: `shadow-sm` untuk Locked, `shadow-lg` untuk Awakened.
- Spacing System: Kelipatan 4px via Tailwind (`p-4`, `gap-3`, `mb-6`, dll.).

---

## 3. Responsive Layout Strategy

### A. Mobile (`w-full` / Layar < 640px) — Primary Target

- Aplikasi mengambil 100% lebar layar.
- **Header:** Logo aplikasi di kiri, ikon Ghost Search di kanan.
- **Bento Grid:** 2 kolom simetris dengan alternating pattern (lihat Section 5).
- **Bottom Nav:** Concave navigation menempel permanen di bawah layar.

### B. Tablet (`sm:max-w-xl` / 640px–1024px)

- Container dikunci di tengah (`mx-auto`).
- **Bento Grid:** Beralih ke 3 kolom.
- **Bottom Nav:** Tetap di bawah container.

### C. Desktop (`lg:max-w-4xl` / > 1024px) — Split Layout

```text
┌─────────────────────────────────────────────────────┐
│  SIDEBAR (Statis)      │  MAIN FEED (Scrollable)    │
│  ─────────────────     │  ──────────────────────    │
│  • Logo                │  • Bento Grid (4 kolom)    │
│  • Filter Vibe Pills   │  • Global / My History     │
│  • Live Stats Counter  │                            │
│  • Tombol [ + ] besar  │                            │
│  • Settings Link       │                            │
└─────────────────────────────────────────────────────┘
```

- **Bottom Nav Concave** → disembunyikan di desktop, digantikan sidebar kiri.
- Tombol `[ + ]` menjadi tombol besar di sidebar kiri.

---

## 4. Navigation Architecture

### Concave Bottom Nav (Mobile & Tablet)

```text
┌────────────────────────────────────────┐
│                                        │
│   [Explore]   ╭──────╮   [Settings]   │
│               │  ✚  │                │
│               ╰──────╯                │
└────────────────────────────────────────┘
```

- **Explore Tab** → Global Feed (`/` default).
- **[ + ] FAB** → Trigger Bottom Sheet Drawer (form buat kapsul).
- **Settings Tab** → SyncPanel (Access Key management).

---

## 5. Bento Grid Layout Rules

### Asymmetrical Alternating Pattern

Setiap batch 4 card mengikuti pola berikut:

```text
Batch Pattern (Mobile — 2 kolom):

┌────────────────────────┐
│   Card 1 (colspan-2)   │  ← Full width
├───────────┬────────────┤
│  Card 2   │   Card 3   │  ← Half / Half
├───────────┴────────────┤
│   Card 4 (colspan-2)   │  ← Full width
└────────────────────────┘
```

---

## 6. Component Specifications

### A. BentoCard — Locked State

```text
┌─────────────────────────────────────┐  bg-card (#FCFAF8 / #292524)
│ May 30, 2026              Live ⏳   │  border border-border
│                                     │  rounded-3xl
│  Untuk: Diri Sendiri                │
│                                     │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    │  ← blur-md (messageContent)
│  ░░░░░░░░░░░░░░ 🔒 ░░░░░░░░░░░░    │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    │
│                                     │
│  ████████████░░░░░░░░░░   45%      │  ← Time Progress Bar
│  ⏳ 12 Days Left                    │  font-mono text-xs
│                                     │
│                        ✨ 24        │  ← Resonate toggle
└─────────────────────────────────────┘
```

- Progress Bar: persentase hari yang sudah lewat sejak `createdAt` menuju `unlockAt`.
- Countdown: Hari tersisa secara real-time.

### B. BentoCard — Awakened State

```text
┌─────────────────────────────────────┐  bg-blue-900 (#2D2926 / #1C1917)
│ May 30, 2026              Awakened  │  rounded-3xl
│                                     │  text-blue-100 (Warm Ivory / Ivory White)
│  Untuk: Diri Sendiri                │  accent: text-blue-300 (Gold)
│                                     │
│  "Aku percaya bahwa di tahun ini    │
│   aku akan lulus cum laude..."      │
│                                     │
│  ████████████████████████  100%    │  ← Progress Bar full (Gold)
│  ✅ Awakened                        │
│                                     │
│                        ✨ 24        │  ← Resonate toggle (aktif)
└─────────────────────────────────────┘
```

### C. Create Capsule — Bottom Sheet Drawer
- **Trigger:** FAB `[ + ]` di center Bottom Nav.
- **Form Layout:** 2-Step Workflow dengan opsi target pencapaian (`ifAchieved` / `ifNotAchieved`) dan foto target (via Vercel Blob).

### D. SyncPanel (iOS Native Compact Settings)
- **Struktur Akun Aktif:** Profil user berukuran ramping `w-11 h-11` dengan nama berukuran `text-sm sm:text-base font-semibold` dan sub-teks key `text-xs text-slate-400`.
- **Card Container:** Menggunakan sudut kelonggaran `rounded-2xl` dengan border tipis dan divider `border-b border-slate-100 dark:border-slate-800` antar menu.
- **Menu Items:** Padding vertikal rapat `px-4 py-3` dengan ikon polos tanpa background box tebal.

### E. Instagram Story Share Card Layout
- **Preview Canvas (9:16):** Area rendering berukuran tinggi yang memuat Bento Card detail kapsul.
- **Tema Terang (Light):** Latar belakang gradasi pastel lembut (`bg-gradient-to-tr from-slate-50 via-white to-blue-50/50`) dengan Bento Card putih bersih.
- **Tema Gelap (Dark):** Latar belakang gradasi gelap/aurora premium dengan Bento Card gelap yang kontras dan elegan.
- **Pengeksporan Gambar:** Menggunakan tombol unduh gambar yang memicu rendering `html2canvas` beresolusi tinggi dengan setelan CORS penuh.

---

## 7. Micro-Interactions & Feedback

| Aksi | Feedback |
|---|---|
| Klik FAB `[ + ]` | Bottom Sheet slide-up (Framer Motion spring) |
| Submit "Drop Capsule" berhasil | Toast Sonner: *"🔒 Kapsulmu berhasil dikunci!"* |
| Submit gagal (validasi) | Toast Sonner error: *"Lengkapi semua field dulu ya."* |
| Klik Resonate | Toggle animasi ✨ (scale pulse), counter +1 instant (optimistic update) |
| Copy Access Key | Toast: *"✅ Access Key berhasil disalin!"* |
| QR Code | Modal/Dialog muncul dengan QR Code besar yang siap di-screenshot |
| Paste & Sinkronkan Key | Toast konfirmasi + redirect ke My History |
| Unduh Instagram Story | Memulai konversi canvas ke blob gambar, mengunduh file, dan menampilkan Toast sukses. |

---

## 8. Filter & Search UI

### Vibe Filter Pills

```text
[ All ]  [ Career & Study ]  [ Love & Self ]  [ Random ]
```

- Horizontal scroll jika overflow di mobile.
- Active state: `bg-primary text-primary-foreground rounded-full`
- Inactive state: `bg-card text-slate-400 rounded-full border border-border`

### Ghost Search

- Icon kaca pembesar di Header kanan atas.
- Klik → Input muncul inline (expand animation) menggantikan area kanan header.
- Memfilter `targetName` secara real-time di grid yang aktif.
- Klik di luar atau tekan `Esc` → Input collapse kembali.