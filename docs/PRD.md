# Product Requirements Document (PRD)
## The Manifesting Capsule — Platform Kapsul Waktu Digital Anonim Berbasis Web

---

## 1. Document Control & Metadata

| Atribut | Keterangan |
| :--- | :--- |
| **Nama Proyek** | The Manifesting Capsule |
| **Tipe Dokumen** | Product Requirements Document (PRD) |
| **Penulis / Pengembang** | Muhammad Ilham Setiawan |
| **Versi Dokumen** | v1.0 |
| **Domain Bisnis** | Digital Wellness, Personal Goal Tracking & Anonymous Time-Capsule |
| **Target Platform** | Mobile-First Web Application (Responsive Smartphone, Tablet, Desktop) |
| **Status Dokumen** | Selesai & Terimplementasi |

---

## 2. Executive Summary & Business Background

### 2.1 Latar Belakang Masalah (Problem Statement)
Banyak individu, mahasiswa, dan generasi muda yang memiliki impian, refleksi diri, komitmen jangka panjang, atau pesan rahasia yang ingin disampaikan ke diri sendiri atau orang terdekat di masa depan. Namun, platform media sosial dan aplikasi catatan umum saat ini memiliki sejumlah kelemahan:
1. **Hambatan Registrasi (*High Sign-up Friction*):** Pengguna enggan menuliskan refleksi yang sangat personal jika diwajibkan mendaftar akun menggunakan email, nomor telepon, atau data pribadi yang rawan kebocoran privasi.
2. **Ketiadaan Komitmen Gembok Waktu (*No True Time-Lock Mechanism*):** Catatan digital biasa dapat dibaca, diubah, atau dihapus kapan saja, sehingga menghilangkan nilai emosional antisipasi, kejutan, dan evaluasi target diri secara berkala.
3. **Ketiadaan Ruang Berbagi Resonansi Tanpa Identitas (*Anonymous Social Resonance*):** Sulit menemukan wadah yang aman untuk membaca harapan orang lain dan saling menyemangati secara positif tanpa risiko penghakiman sosial (*social judgment*).

### 2.2 Solusi Produk (Product Solution)
Membangun platform **The Manifesting Capsule**, yaitu aplikasi web *mobile-first* yang memungkinkan pengguna:
* Mengunci pesan manifestasi, foto target impian, dan target pencapaian (*milestone goals*) ke dalam kapsul waktu digital berwaktu (*Time-Locked Capsule*).
* Beroperasi secara **100% Anonim & Bebas Hambatan (Frictionless)** tanpa form pendaftaran, menggunakan sistem *Anonymous Access Key* otomatis yang tersinkronisasi via HttpOnly Cookie.
* Menjamin **Keamanan Nol Bocor (*Zero-Leakage Censorship*)**, di mana isi pesan terkunci disensor total di level server dan tidak dapat diintip melalui inspeksi jaringan frontend sampai waktu gembok tiba.
* Menyediakan fitur **Social Resonance** dan ekspor kartu cerita (*Shareable Card*) untuk membagikan kapsul ke media sosial.

---

## 3. Product Vision & Goals

Sistem platform kapsul waktu ini dibangun untuk mencapai tiga target utama:
* **Frictionless Anonymous Engagement:** Pengguna dapat menanam kapsul waktu dalam hitungan detik tanpa hambatan form registrasi atau pengumpulan data pribadi.
* **Guaranteed Time-Locked Integrity:** Pesan dan target pencapaian terkunci aman di level server sampai tanggal pembukaan tiba, menciptakan efek penasaran dan refleksi emosional yang kuat.
* **Seamless Multi-Account Portability:** Kunci akses anonim dapat disinkronkan, dipindahkan ke perangkat lain, atau disimpan sebagai QR Code tanpa kehilangan data riwayat kapsul.

---

## 4. User Personas & User Journey

### 4.1 Profil Pengguna (User Personas)
* **Pribadi yang Berefleksi Diri (*The Self-Reflector*):** Individu yang ingin mengunci target hidup 1–5 tahun ke depan beserta target pencapaian (*"Jika tercapai"* dan *"Jika belum tercapai"*).
* **Pengirim Pesan Rahasia (*The Secret Messenger*):** Pengguna yang ingin membuat surat cinta, permohonan maaf, atau ucapan selamat ulang tahun berwaktu untuk sahabat atau pasangan yang link-nya dibagikan lebih awal namun hanya bisa dibuka saat tanggalnya tiba.
* **Penikmat Inspirasi Anonim (*The Casual Browser*):** Pengunjung yang menjelajahi *Explore Feed* untuk membaca harapan positif sesama pengguna global dan memberikan tanda resonansi (✨).

### 4.2 Alur Pengalaman Pengguna (User Journey)
1. **Eksplorasi Awal:** Pengguna membuka aplikasi via smartphone dan langsung disajikan *Explore Feed* dalam format *Asymmetrical Bento Grid*.
2. **Penanaman Kapsul (*Drop Capsule*):** Pengguna menekan tombol `[ + ]`, mengisi nama target, kategori vibe, tanggal gembok (minimal +1 hari), mengunggah foto target (opsional), serta menulis pesan manifestasi dan target pencapaian.
3. **Penyimpanan Kunci Anonim:** Setelah kapsul ditanam, sistem otomatis membuatkan *Access Key* unik (contoh: `MANI-789-VIB`) yang tersimpan di HttpOnly Cookie browser, disertai modal untuk menyalin kunci.
4. **Masa Penantian (Locked State):** Kapsul tampil di riwayat dengan sisa waktu hitung mundur (*Countdown Timer*) dan progres waktu berjalan. Isi pesan disensor aman oleh server.
5. **Pembukaan Kapsul (Awakened State):** Saat tanggal gembok tercapai, kartu berubah warna, indikator "✨ Tap untuk Balik" aktif, dan pengguna dapat membalik kartu secara 3D untuk membaca seluruh pesan dan target impian.

---

## 5. Functional Requirements (Spesifikasi Fitur)

### 5.1 Modul 1: Explore Feed & Manajemen Riwayat
* **FR-01.1 (Global Explore Feed):** Menampilkan seluruh kapsul publik dalam tata letak *Asymmetrical Bento Grid* dengan pola selang-seling dinamis.
* **FR-01.2 (Filter Kategori Vibe):** Pengguna dapat memfilter feed berdasarkan kategori: `All`, `Career & Study`, `Love & Self`, dan `Random`.
* **FR-01.3 (Pencarian Cepat / Ghost Search):** Filter instan berdasarkan nama target pada feed aktif.
* **FR-01.4 (Riwayat Kapsul Saya / My History):** Menampilkan seluruh kapsul milik pengguna aktif yang terhubung dengan `accessKey` di cookie perangkat.

### 5.2 Modul 2: Logika Gembok Waktu & Kartu Interaktif 3D
* **FR-02.1 (Status Terkunci / Locked):** Jika waktu saat ini $<$ waktu gembok (`now < unlockAt`):
  * Server menyensor total kolom `messageContent`, `ifAchieved`, dan `ifNotAchieved` menjadi `null`.
  * Kartu menampilkan nama target, foto target (jika ada), sisa hari gembok, dan *Time Progress Bar*.
  * Interaksi klik memicu animasi goyang (*shake*) dan notifikasi toast bahwa kapsul masih terkunci.
* **FR-02.2 (Status Terbuka / Awakened):** Jika waktu saat ini $\ge$ waktu gembok (`now >= unlockAt`):
  * Kartu mengaktifkan indikator "✨ Tap untuk Balik".
  * Klik pada kartu memicu animasi *Flip 3D (180°)* menggunakan Framer Motion.
  * Sisi Depan menampilkan target, foto, dan progres 100%. Sisi Belakang menampilkan isi pesan lengkap serta target pencapaian.
* **FR-02.3 (Interaksi Resonansi):** Pengguna dapat menekan tombol Resonate (✨) untuk memberikan apresiasi anonim (menambah angka resonansi).

### 5.3 Modul 3: Pembuatan Kapsul Manifestasi (2-Step Form)
* **FR-03.1 (Step 1 - Informasi Utama & Unggah Foto):** Input nama target, kategori vibe, waktu gembok (minimal +1 hari dari hari ini), dan unggah foto target opsional (dikompresi otomatis di sisi klien $< 500\text{ KB}$ sebelum disimpan ke Vercel Blob).
* **FR-03.2 (Step 2 - Target Pencapaian / Milestone Goals):** Input opsional komitmen: *"Jika impian tercapai"* dan *"Jika impian belum tercapai"*.
* **FR-03.3 (Pengaturan Privasi):** Opsi membuat kapsul bersifat privat (hanya muncul di riwayat pemilik) dan menyamarkan nama pembuat (*Anonim*).
* **FR-03.4 (Konfirmasi Pembatalan & Modal Kunci):** Muncul konfirmasi jika user menutup form saat sudah ada data terisi, serta menampilkan modal *Access Key* setelah kapsul berhasil dibuat.

### 5.4 Modul 4: Autentikasi Anonim & Manajemen Akun
* **FR-04.1 (Auto-Generate Key):** Sistem otomatis membuatkan Access Key unik berbasis NanoID berformat `XXXX-000-XXX` saat user pertama kali membuat kapsul.
* **FR-04.2 (HttpOnly Cookie Storage):** Kunci disimpan di cookie yang aman dan terbaca langsung oleh Server Components tanpa flicker.
* **FR-04.3 (Sync & Switch Key):** Panel pengaturan memungkinkan pengguna menyinkronkan kunci lama (*Paste Key*), menyalin kunci aktif, melihat QR Code, atau keluar sesi (*Logout*).

### 5.5 Modul 5: Tautan Berbagi & Ekspor Kartu Media Sosial
* **FR-05.1 (Dedicated Share URL):** Setiap kapsul memiliki rute URL publik tersendiri (`/capsule/[id]`) untuk dibagikan ke teman atau media sosial.
* **FR-05.2 (Ekspor Kartu Instagram Story):** Mengubah kartu kapsul menjadi gambar visual beresolusi tinggi menggunakan `html2canvas` siap unggah ke Story.

---

## 6. Non-Functional Requirements (NFR)

* **NFR-01 (Keamanan & Privasi / Zero Data Leakage):** Teks pesan yang terkunci tidak boleh dikirimkan ke browser dalam bentuk apa pun sampai waktu gembok terbukti sah lewat validasi server.
* **NFR-02 (Rate Limiting & Proteksi Spam):** Pembuatan kapsul dibatasi maksimal 5 request/menit per IP, dan aksi resonansi dibatasi maksimal 10 request/menit.
* **NFR-03 (Mobile-First Responsiveness & PWA):** Tampilan dioptimalkan khusus untuk layar sentuh ponsel dengan navigasi melengkung (*Concave Bottom Nav*), transisi halus 60fps, dan dukungan Progressive Web App.
* **NFR-04 (Integritas Skema & Type Safety):** Seluruh input divalidasi ketat menggunakan Zod Schema dan tipe data TypeScript dari layer antarmuka hingga Prisma ORM.