# Product Requirement Document (PRD)
## Project: The Manifesting Capsule (Mobile-First Web App)
### Version: 2.5 — Luxury Wellness & Photo Support Edition (Current)

---

## 1. Project Overview & Background

**The Manifesting Capsule** adalah aplikasi web berbasis *mobile-first* anonim yang memungkinkan pengguna mengunci pesan, harapan, mimpi, atau manifesto mereka ke dalam sebuah "kapsul digital" berwaktu (Time-Locked Capsule). Kapsul ini tidak dapat dibuka oleh siapa pun (termasuk penerima atau pembuatnya) sampai tanggal gembok (*unlock date*) yang ditentukan telah tercapai.

Aplikasi ini mengusung prinsip **frictionless & anonymous** — tidak ada sistem registrasi, email, atau password. Akun dan kepemilikan kapsul dikelola murni menggunakan sistem *Anonymous Access Key* yang unik dan tersinkronisasi.

> **MVP Scope Note:** Aplikasi ini berfokus pada kekuatan teks manifestasi dan visualisasi personal dengan dukungan unggahan foto target (opsional) via Vercel Blob. Ringan, cepat, dan bebas dari dependensi berat.

---

## 2. Core Value Proposition

- **Frictionless Engagement:** User bisa langsung membuat kapsul dalam hitungan detik tanpa hambatan form registrasi atau onboarding.
- **Curiosity & Anticipation:** Efek "gembok waktu" memicu rasa penasaran dan nilai emosional tinggi dari pesan masa depan.
- **Social Resonance:** Fitur publik yang memungkinkan sesama pengguna saling beresonansi dengan manifestasi orang lain secara anonim.
- **Pure Text & Photo Sanctuary:** Ruang refleksi yang tenang dengan perpaduan visualisasi foto target yang membangkitkan niat emosional.

---

## 3. Target User Persona & User Journey

**User Persona:** Mahasiswa, Gen-Z, atau individu yang menyukai refleksi diri, memiliki target masa depan, atau ingin mengirim pesan rahasia ke orang terdekat (pacar, sahabat) yang baru bisa dibaca di waktu tertentu.

**User Journey:**
1. User membuka halaman utama (`/`) via smartphone.
2. User langsung dihadapkan pada *Explore Feed* — kumpulan teks manifestasi publik global dalam *Asymmetrical Bento Grid*. Tidak ada onboarding yang menginterupsi.
3. User mengklik tombol `[ + ]` di tengah *Bottom Nav* untuk membuat kapsulnya sendiri.
4. User mengisi nama target, isi pesan, foto target (opsional), dan tanggal gembok, lalu menekan **"Drop Capsule"**.
5. User mendapatkan *Anonymous Access Key* yang otomatis tersimpan di perangkatnya (via HttpOnly Cookie & Local Storage).
6. User bisa membagikan link kapsul, mengunduh kartu cerita Instagram, atau menyimpannya sendiri sampai hari gembok terbuka.

---

## 4. Technology Stack Specification

### A. Frontend Layer
- **Core Framework:** Next.js 16+ (App Router) dengan TypeScript
- **Styling Engine:** Tailwind CSS v4 (Luxury Beige & Gold Palette V2)
- **Component Library:** Shadcn UI + Radix UI
- **Animation Library:** Framer Motion
- **Toast Notification:** Sonner
- **Image Generation:** html2canvas (skala 2x, dukungan CORS)

### B. Backend & Data Layer
- **Server Logic:** Next.js Server Actions
- **Data Validation:** Zod Schema Validation
- **ORM:** Prisma ORM
- **Database:** PostgreSQL (Neon Cloud - Shared Serverless Database)
- **Unique ID Generator:** NanoID

### C. Auth & Storage
- **Anonymous Key Storage:** HttpOnly Cookie (server-readable) + Local Storage backup dengan riwayat multi-akun
- **Photo Storage:** Vercel Blob Storage (penyimpanan cloud dengan limit ukuran file < 500KB)
- **Rate Limiting:** Next.js Middleware (IP-based)

---

## 5. Functional Requirements

### FR-01: Explore Feed (Global & History Tab)
- **Global Feed:** Menampilkan seluruh kapsul manifestasi publik dalam *Asymmetrical Bento Grid* (alternating pattern: card ke-1 & ke-4 setiap batch = `colspan-2`).
- **My History:** Menampilkan kapsul milik pengguna aktif berdasarkan `accessKey` dari HttpOnly Cookie atau akun sekunder dalam riwayat local storage.
- **Empty State:** Jika "My History" kosong, tampilkan pesan: *"Belum ada teks mimpi yang ditanam. Klik tombol `[ + ]` di bawah untuk mengunci manifestasi pertamamu."* disertai CTA langsung ke form buat kapsul.
- **Filtering:** Filter pil berdasarkan kategori Vibe: *All, Career & Study, Love & Self, Random*.
- **Ghost Search:** Input pencarian di kanan atas untuk memfilter nama target secara instan di grid aktif.

### FR-02: Time-Locked Capsule Logic
- **State Terkunci (Locked):** Jika `currentTime < unlockAt`:
  - Pesan, target pencapaian (`ifAchieved` dan `ifNotAchieved`) tidak dikirimkan dari server.
  - Tampilan kartu menunjukkan info target, sisa waktu gembok (*Live Countdown Timer*), *Time Progress Bar*, status *vibe*, dan foto target (jika diunggah).
  - Mengetuk/mengklik kartu akan memicu micro-animation "goyang/shake" dan menampilkan toast bahwa kapsul masih terkunci.
- **State Terbuka (Awakened):** Jika `currentTime >= unlockAt`:
  - Kartu menggunakan warna **Dark Coffee (`#2D2926`)** pada Light Mode dan **Rich Espresso (`#1C1917`)** pada Dark Mode di sisi depan (sisi kartu yang terbuka/Awakened) dengan teks berlawanan yang kontras tinggi (Warm Ivory/Ivory White) dan aksen Champagne Gold/Soft Gold.
  - Indikator visual "✨ Tap untuk Balik" diaktifkan.
  - Mengetuk/mengklik kartu akan men-trigger animasi flip 3D (180 derajat) menggunakan Framer Motion.
  - **Sisi Depan (Front):** Nama target, foto target (jika ada), progres waktu (100%), dan metadata pembuat.
  - **Sisi Belakang (Back):** Teks pesan manifestasi (`messageContent`), target jika tercapai (`ifAchieved`), dan target jika belum tercapai (`ifNotAchieved`).
- **Resonate Interaction:** Tombol Resonate (✨) dapat ditekan di sisi depan maupun belakang.

### FR-03: Create Manifesting Capsule (2-Step Form)
- **Trigger:** Tombol `[ + ]` di tengah *Concave Bottom Nav*.
- **Alur Pengisian (2-Step Workflow):**
  - **Step 1 (Main info & Photo):** Pengisian nama target, kategori vibe, waktu gembok (minimal +1 hari), dan fitur **Photo Upload** (opsional) dengan kompresi otomatis di client (< 500KB) sebelum diunggah ke Vercel Blob.
  - **Step 2 (Milestone Optional Goals):** Pengisian opsional target pencapaian: *"Jika impian tercapai"* (`ifAchieved`) dan *"Jika impian belum tercapai"* (`ifNotAchieved`).
- **Close Confirmation:** Jika pengguna menekan tombol tutup saat form sudah terisi data, modal konfirmasi kustom (animated modal overlay) akan muncul untuk mengonfirmasi pembatalan agar data tidak terbuang sia-sia.
- **Save Key Modal:** Setelah kapsul berhasil ditanam (di-drop), modal pop-up kustom akan muncul menampilkan *Access Key* pembuat, tombol *Copy Key* ke clipboard, dan disclaimer penting: *"Key ini tidak dapat dipulihkan jika hilang!"*.
- **Validasi:** Zod Schema — semua field wajib di step 1 harus valid, tanggal tidak boleh di masa lalu.
- **Feedback:** Toast Sonner sukses/gagal setelah submit.

### FR-04: Anonymous Auth & Multi-Account Manager
- Key otomatis di-generate menggunakan NanoID saat user membuat kapsul pertama kali.
- Disimpan sebagai **HttpOnly Cookie** agar Server Components bisa membacanya langsung tanpa flickering di client.
- Menu **Settings (SyncPanel)** menyediakan:
  - Manajemen multi-akun tersimpan dengan fitur beralih akun instan (*Quick Switch*).
  - Tombol **"Copy Access Key"** — menyalin key ke clipboard.
  - **QR Code Generator** — menghasilkan QR yang bisa di-screenshot sebagai backup.
  - Kolom **"Paste Access Key"** — untuk sinkronisasi riwayat kapsul saat ganti browser/device.
  - Tombol **"Keluar Akun Aktif"** — keluar secara aman dengan menghapus cookie tetapi tetap menyimpan riwayat jika diizinkan local storage.

### FR-05: Resonate Interaction
- Setiap kapsul (terkunci maupun terbuka) memiliki toggle **Resonate (✨)**.
- Menambah `resonateCount` di database secara anonim.
- Satu perangkat (berdasarkan `accessKey`) hanya bisa resonate sekali per kapsul.

### FR-06: Instagram Story Share Card Generator
- Mengizinkan pengguna menghasilkan kartu gambar berukuran 9:16 (Bento-style card preview) dari detail kapsul mereka untuk dibagikan ke Instagram Story.
- Menyediakan fitur "Ubah Tema Kartu" secara instan:
  - **Tema Terang (Light):** Latar belakang gradasi pastel lembut dengan Bento Card berwarna putih/terang kontras.
  - **Tema Gelap (Dark):** Latar belakang gradasi gelap/aurora premium dengan Bento Card gelap yang elegan.
- Ekspor gambar menggunakan `html2canvas` beresolusi tinggi (skala 2x) dengan dukungan CORS penuh agar gambar dari Vercel Blob tetap ter-render sempurna.

---

## 6. Non-Functional Requirements (NFR)

- **Performance:** Loading time < 2 detik pada jaringan mobile menggunakan Next.js Server Components.
- **Security:** Query DB untuk kapsul terkunci tidak mengambil kolom `messageContent` — perlindungan di level database query, bukan hanya di UI.
- **Privacy:** Tidak ada data personal yang dikumpulkan — sistem sepenuhnya anonim.
- **Rate Limiting:** Endpoint pembuatan kapsul dan resonate dibatasi per IP untuk mencegah abuse/spam.
- **Responsiveness & Density:** Mobile-first (`w-full`), tablet (`max-w-xl`), desktop split layout (`max-w-4xl`), dengan visualisasi super rapat bergaya iOS native compact settings.

---

## 7. Out of Scope (Future Scope)

- Integrasi musik Spotify / media apapun.
- Push Notification PWA saat kapsul terbuka.
- Enkripsi End-to-End tingkat lanjut untuk isi pesan.
- Sistem komentar atau reply antar kapsul.
- Kategori/tag yang bisa dikustomisasi user.