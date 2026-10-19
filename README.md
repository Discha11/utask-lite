# uTask-lite — Task Dashboard

Dashboard manajemen tugas berbasis web (HTML5, CSS3, Vanilla JavaScript) yang dibuat dengan **Generative AI sebagai asisten pemrograman**. Tanpa framework, tanpa build tool, tanpa dependensi runtime. Tampilan terinspirasi dashboard "uTask" (referensi gaya warna ungu-pink saja; tidak ada aset gambar yang disalin).

> Isi nama, NIM, mata kuliah, dan institusi di sini: `NAMA – NIM – Mata Kuliah – Kampus`

## Fitur
| Kelompok | Fitur |
|---|---|
| Tugas | Tambah, ubah, hapus, centang selesai; prioritas (tinggi/sedang/rendah); tenggat opsional |
| Daftar | Urut otomatis (aktif dulu, prioritas, tenggat terdekat); filter Semua/Aktif/Selesai/Terlambat |
| Progres | Cincin persentase dihitung dari data (0% saat belum ada tugas) |
| Grafik | Tugas selesai per hari pada minggu berjalan (SVG buatan sendiri, tanpa library) |
| Kalender | Navigasi bulan, tanggal tenggat bertanda titik, klik tanggal mengisi formulir |
| Tema | Terang/gelap, tersimpan, mengikuti preferensi sistem saat pertama dibuka |
| Penyimpanan | `localStorage` dengan cadangan memori bila diblokir |
| Keamanan | Input pengguna dipasang lewat `textContent` (bukan `innerHTML`) |

## Struktur
```
utask-lite/
├── index.html          Struktur antarmuka
├── css/style.css       Tema (CSS variables), tata letak, responsif
├── js/
│   ├── logic.js        Fungsi murni (progres, urut, filter, minggu, kalender) — bisa diuji di Node
│   ├── storage.js      Pembungkus localStorage + cadangan memori
│   └── app.js          Event listener, state, render
├── tests/
│   ├── logic.test.js       Unit test otomatis (30 kasus)
│   └── ui-smoke.manual.js  Uji antarmuka via jsdom (opsional)
├── docs/               Proposal dan docs/images/ (screenshot)
├── package.json
└── README.md
```
Urutan `<script>` penting: `logic.js` → `storage.js` → `app.js`. Tanpa ES Modules agar `index.html` bisa dibuka langsung lewat `file://`.

## Cara menjalankan
**Cara 1:** klik dua kali `index.html` (Chrome, Edge, Firefox, Safari).
**Cara 2 (server lokal):**
```bash
python3 -m http.server 5500      # lalu buka http://localhost:5500
# atau: npm start
```
## Inisialisasi dan konfigurasi
```bash
git clone https://github.com/<username>/utask-lite.git
cd utask-lite
```
Tidak perlu `npm install` dan tidak ada file konfigurasi/`.env`. Satu-satunya "konfigurasi" adalah data di `localStorage` (kunci `utask:tasks`, `utask:theme`); lihat di DevTools → Application → Local Storage. Untuk reset: hapus kedua kunci itu.

## Cara menguji
**Otomatis** (Node.js 16+, tanpa dependensi):
```bash
npm test      # atau: node tests/logic.test.js
```
Keluaran yang diharapkan: `Semua 30 kasus uji lulus.`

**Manual di peramban**
| No | Skenario | Langkah | Hasil yang diharapkan |
|---|---|---|---|
| 1 | Tambah tugas | Isi judul, klik Simpan | Tugas muncul, total +1 |
| 2 | Judul kosong | Klik Simpan tanpa judul | Pesan galat, tugas tidak bertambah |
| 3 | Progres | Centang 1 dari 2 tugas | Cincin 50% |
| 4 | Tanpa tugas | Hapus semua tugas | 0% (bukan NaN) |
| 5 | Terlambat | Beri tenggat kemarin | Bertanda merah, hitungan Terlambat +1 |
| 6 | Hapus | Hapus tugas yang sudah selesai | Grafik dan kalender ikut berubah |
| 7 | Ubah | Klik ✎, ganti judul, simpan | Judul berubah |
| 8 | Filter | Klik Selesai/Aktif/Terlambat | Daftar sesuai filter |
| 9 | Kalender | Beri tenggat tanggal tertentu | Titik muncul di tanggal itu; pindah bulan berfungsi |
| 10 | Persisten | Muat ulang (F5) | Tugas tetap ada |
| 11 | Tema | Klik Ganti tema lalu F5 | Tema tetap; grafik & cincin ikut berwarna |
| 12 | Injeksi | Judul `<b>x</b>` | Tampil sebagai teks, bukan tebal |
| 13 | Responsif | Lebar ±360 px | Satu kolom, tanpa scroll horizontal |

## Alur kerja dengan AI
Proses lengkap (prompt, evaluasi kode, kesalahan, perbaikan) ada di `docs/` — lihat `docs/PROPOSAL_KERANGKA.md`.

## Push ke GitHub
```bash
git init && git add . && git commit -m "feat: uTask-lite versi awal"
git branch -M main
git remote add origin https://github.com/<username>/utask-lite.git
git push -u origin main
```
Disarankan commit per tahap (tugas → progres → tema → grafik → kalender → perbaikan bug) supaya riwayat commit menjadi bukti proses.
