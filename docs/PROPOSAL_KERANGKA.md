# Kerangka Proposal uTask-lite (min. 5 halaman + gambar)

Bobot 70%. Setiap bagian di bawah memuat: isi yang ditulis, dan **screenshot yang harus kamu ambil sendiri** selama bekerja dengan AI. Bukti proses harus asli: jangan menulis bug yang tidak benar-benar kamu temui.

## 1. Pendahuluan (±0,5 hal)
Latar belakang (mahasiswa sulit memantau tugas), tujuan, batasan, alat AI yang dipakai (nama + versi), referensi desain uTask.
📷 Gambar 1: screenshot referensi desain.

## 2. Analisis kebutuhan (±1 hal)
Kebutuhan fungsional (F1 kelola tugas, F2 progres, F3 grafik, F4 kalender, F5 tema, F6 simpan data), non-fungsional (tanpa instalasi, responsif, aman dari injeksi), dan alasan memilih Vanilla JS.

## 3. Perancangan (±1 hal)
Alur pengguna, struktur data tugas `{id, title, priority, deadline, done, completedOn}`, pemisahan `logic.js` (murni) / `storage.js` / `app.js`, dan alasannya (bisa diuji tanpa browser).
📷 Gambar 2: sketsa/wireframe. Gambar 3: diagram modul.

## 4. Penulisan kode dengan AI (±1,5 hal)
Untuk **setiap prompt** tulis: tujuan, isi prompt, **alasan** prompt ditulis demikian, ringkasan hasil.
Tahapan prompt yang disarankan: (1) rancangan struktur, (2) logika murni, (3) antarmuka, (4) tema, (5) grafik, (6) kalender.
Contoh alasan: "Saya minta fungsi murni dipisah dari DOM supaya bisa diuji di Node."
📷 Gambar 4–6: screenshot percakapan prompt + kode awal AI.

## 5. Evaluasi kode hasil AI (±0,5 hal)
Checklist: apakah sesuai spesifikasi, kasus tepi (daftar kosong, tanggal), keamanan (`innerHTML`), keterbacaan, dependensi tak perlu. Catat apa yang kamu terima dan tolak.

## 6. Pengujian dan identifikasi kesalahan (±1 hal)
Hasil `npm test`, tabel uji manual (di README), dan **log bug**:

| ID | Gejala | Penyebab | Cara menemukan |
|---|---|---|---|
| B1 | (isi dari temuanmu) | | |

Area yang layak diperiksa (cek apakah kode AI-mu benar-benar mengalaminya): pembagian nol di progres, `new Date('YYYY-MM-DD')` terbaca UTC sehingga tanggal bergeser, grafik/kalender tidak ikut diperbarui setelah hapus, warna tidak ikut tema, data hilang saat refresh, judul HTML dieksekusi.
📷 Gambar: console error / tampilan salah.

## 7. Perbaikan dan debugging (±1 hal)
Per bug: kode **sebelum**, prompt perbaikan + alasannya, kode **sesudah**, uji ulang. Tambahkan unit test yang mencegah bug itu kembali.
📷 Gambar: DevTools, diff sebelum/sesudah, test lulus.

## 8. Penjelasan keputusan dan kesimpulan (±0,5 hal)
Keputusan teknis (tanpa ES Modules, SVG sendiri bukan Chart.js, `textContent`, tanggal lokal), kelebihan/batas bantuan AI, pengembangan lanjutan (Analytics, Meetings, profil).

## Daftar pustaka / referensi
Desain uTask (sebagai inspirasi), dokumentasi MDN (Date, localStorage), nama alat AI.
