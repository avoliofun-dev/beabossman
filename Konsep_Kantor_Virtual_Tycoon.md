# Kantor Virtual Tycoon — Dokumen Konsep

> Pengembangan dari prototipe "Kantor Virtual 2 Lantai" (simulasi 3D isometrik, 8 karyawan, dashboard admin) menjadi game tycoon yang bisa dimainkan dengan login dan progres tersimpan.

Semua angka di dokumen ini adalah **usulan awal** dan perlu diseimbangkan lewat uji coba.

---

## 1. Ringkasan

Pemain memulai sebagai **pendiri solo** di sebuah ruangan kecil. Ia mengambil kontrak dari klien, mengerjakannya, mendapat uang dan reputasi, lalu mengembangkan kantor: merekrut pekerja, membuka ruangan, dan akhirnya membuka lantai 2.

**Satu kalimat:** *"Mulai dari satu meja, bangun studio kreatif yang ramai."*

### Pilar desain

1. **Mulai kecil, tumbuh terlihat.** Setiap kemajuan tampak langsung di kantor 3D.
2. **Keputusan yang berarti.** Pemain selalu punya pilihan dengan untung-rugi, bukan sekadar menonton.
3. **Hidup tanpa menuntut.** Game tetap berjalan saat pemain offline, tetapi tidak menghukum pemain yang jarang login.
4. **Jujur dan adil.** Semua perhitungan uang dan hasil kerja dilakukan di server.

---

## 2. Loop inti

```
Pilih kontrak → Tugaskan pekerja → Pekerja bekerja (energi turun)
      ↑                                        ↓
Rekrut / upgrade ← Uang + reputasi ← Kontrak selesai
```

- **Loop menit-ke-menit:** pilih kontrak, atur siapa mengerjakan apa, kelola energi.
- **Loop jam-ke-jam:** kumpulkan uang untuk rekrut dan upgrade.
- **Loop hari-ke-hari:** misi harian, naik tier kantor, kejar reputasi.

---

## 3. Fase permainan

| Fase | Pekerja | Kantor | Fokus |
|---|---|---|---|
| 1. Solo | 1 (pemain/pendiri) | 1 ruangan | Belajar loop dasar, kontrak kecil |
| 2. Tim kecil | 2–4 | 4 ruangan di lantai 1 | Rekrut, spesialisasi, jadwal |
| 3. Studio | 5–8 | 8 ruangan di lantai 1 | Tangga & lantai 2 terbuka, sistem energi penuh |
| 4. Agensi | 9+ | Lantai 2 diperluas, dekorasi | Kontrak besar, reputasi, event, sosial |

**Target pacing awal:** kontrak pertama selesai dalam ±2 menit, pekerja kedua bisa direkrut sekitar menit ke-10.

---

## 4. Sistem pekerja

### Stat

- **Skill per bidang:** Konten, Desain, Video, Media Sosial, Data, Layanan Pelanggan, Keuangan/Admin, Manajemen. Tiap pekerja punya 1 bidang utama dan 1 bidang sampingan.
- **Kecepatan:** pengali durasi kerja.
- **Energi (0–100):** turun saat bekerja, pulih saat istirahat.
- **Mood:** dipengaruhi energi, gaji, dan kondisi kantor. Mood rendah menurunkan kualitas.
- **Level & XP:** naik setelah menyelesaikan kontrak, membuka skill baru.
- **Gaji harian:** makin tinggi skill, makin mahal.
- **Sifat (opsional):** misalnya *Teliti* (kualitas naik, lebih lambat) atau *Cepat tapi ceroboh*.

### Energi dan istirahat

- Pekerja yang energinya rendah akan naik ke **lantai 2** untuk istirahat.
- Fasilitas lantai 2 (sofa, pantry, ruang main) mempercepat pemulihan dan menaikkan mood.
- **Lembur:** pekerjaan lebih cepat, tetapi energi turun lebih cepat dan risiko kesalahan naik. Ini pilihan yang harus dipertimbangkan pemain.

### Hasil kerja

Kualitas ditentukan oleh **kecocokan skill dengan kesulitan kontrak**, ditambah sedikit faktor acak.
- Kualitas tinggi: bonus bayaran dan reputasi.
- Kualitas rendah: bayaran dipotong, klien bisa meminta revisi.

---

## 5. Sistem rekrutmen: siapa yang direkrut?

### Keputusan: kandidat NPC sebagai sistem utama

Pekerja yang direkrut adalah **karakter NPC yang dihasilkan sistem**, bukan pemain lain.

**Alasan:**
1. Game tetap seimbang dan bisa dimainkan sendirian tanpa menunggu pemain lain.
2. Tidak ada masalah moderasi, penipuan, atau pemain yang tiba-tiba menghilang.
3. Kandidat bisa dirancang sebagai karakter dengan cerita, sehingga cocok dengan dunia Narayan.
4. Lebih mudah diseimbangkan dan diuji.

### Cara kerja

- Papan **Lowongan** menampilkan 3–5 kandidat yang diperbarui berkala (misalnya tiap hari atau lewat tombol "cari kandidat" dengan biaya kecil).
- Tiap kandidat memperlihatkan nama, bidang, skill, sifat, dan gaji yang diminta. Sebagian stat bisa **tersembunyi** sampai masa percobaan, jadi ada unsur risiko.
- **Masa percobaan** beberapa kontrak sebelum stat penuh terlihat.
- Pemain bisa **memberi kenaikan gaji**, **memecat**, atau **melatih** pekerja.
- Kandidat unik atau langka (karakter cerita) muncul pada milestone tertentu.

### Opsi tahap lanjut (bukan versi awal)

| Opsi | Penjelasan | Catatan |
|---|---|---|
| **Kerja sama antar pemain** | Pemain mengirim "pekerja pinjaman" ke kantor teman untuk satu kontrak dengan bagi hasil, tanpa saling mengontrol | Asinkron, tidak butuh online bersamaan |
| **Freelancer pemain** | Pemain lain bisa daftar sebagai freelancer di papan lowongan | Butuh basis pemain besar dan moderasi |
| **Karyawan AI yang menghasilkan output nyata** | Tugas tertentu (mis. menulis caption) dikerjakan lewat API AI sungguhan | Ada biaya per pemakaian, cocok sebagai fitur premium |

Opsi di atas sebaiknya baru dipertimbangkan setelah sistem NPC stabil dan ada pemain aktif.

---

## 6. Papan kontrak

Setiap kontrak memiliki:
- Klien dan deskripsi singkat (di sinilah **cerita** bisa masuk)
- Bidang skill yang dibutuhkan dan tingkat kesulitan
- Durasi dan **deadline**
- Bayaran, bonus kualitas, dan penalti telat
- Reputasi minimum untuk mengambilnya

**Jenis kontrak:**
- **Kontrak kecil:** cepat, bayaran kecil, cocok untuk pemain baru.
- **Kontrak besar:** butuh beberapa bidang sekaligus (mis. desain + video + sosial media), jadi pemain harus mengatur tim.
- **Kontrak klien tetap:** pemasukan berulang, tetapi menuntut kualitas stabil.
- **Kontrak kilat:** bayaran tinggi, waktu sempit, risiko lebih besar.

---

## 7. Ekonomi

**Pemasukan:** bayaran kontrak + bonus kualitas.
**Pengeluaran:** gaji harian + sewa kantor (naik tiap tier) + biaya upgrade/dekorasi + biaya cari kandidat.

Contoh awal (perlu diseimbangkan):

| Parameter | Usulan |
|---|---|
| Modal awal | Rp 2.000.000 |
| Sewa harian fase 1 | Rp 100.000 |
| Gaji pekerja pemula | Rp 150.000–250.000/hari |
| Bayaran kontrak kecil | Rp 50.000–120.000 |
| Bayaran kontrak besar | Rp 500.000+ |

**Prinsip anti-frustrasi:**
- **Tidak ada game over keras.** Jika kas habis, pemain bisa mengambil pinjaman darurat atau kontrak "penyelamat" dengan bunga atau penalti ringan.
- Gaji tidak dipotong saat pemain offline lama, atau dibatasi agar tidak menumpuk.

---

## 8. Event

Satu atau dua event singkat per sesi agar tidak mengganggu:
- Klien meminta revisi
- Bonus kilat dari klien
- Pekerja sakit atau kelelahan
- Gangguan teknis (kontrak tertunda)
- Tawaran dari kompetitor untuk mengambil pekerja (menguji loyalitas dan mood)

Setiap event memberi **pilihan**, bukan hanya akibat.

---

## 9. Kantor dan visual

- Pakai kembali adegan 3D yang ada: lantai 1 (ruangan kerja), tangga, lantai 2 (istirahat), papan jam.
- **Ruangan terbuka bertahap:** awalnya hanya 1 ruangan terlihat, sisanya terkunci.
- **Dekorasi:** tanaman, poster, meja lebih bagus, mesin kopi. Memberi mood dan juga kosmetik.
- **Avatar pemain:** pekerja pertama bisa dikustomisasi (warna baju, rambut).

---

## 10. Umpan balik dan retensi

- Koin melayang, bunyi saat tugas selesai, animasi naik level.
- **Misi harian** (mis. selesaikan 3 kontrak) dan **pencapaian**.
- **Leaderboard reputasi mingguan.**
- Notifikasi opsional saat kontrak selesai.
- Ringkasan **"Selama kamu pergi"** saat login: apa yang selesai, berapa pendapatan.

---

## 11. Arsitektur teknis

**Stack yang diusulkan:** React + Vite, Three.js untuk adegan 3D, Supabase (Auth + Postgres), deploy di Vercel.

### Prinsip utama
- **Server sebagai sumber kebenaran.** Kas, hasil tugas, dan rekrutmen dihitung di server (fungsi Postgres / Edge Function). Klien hanya menampilkan.
- **Progres offline berbasis timestamp.** Tiap tugas menyimpan `started_at` dan `finish_at`. Saat login, server menghitung apa yang selesai.
- **RLS (Row Level Security)** agar pemain hanya bisa mengakses data miliknya.

### Tabel inti (draft)

| Tabel | Isi |
|---|---|
| `profiles` | Data pemain |
| `companies` | Kas, reputasi, tier kantor, hari ke-berapa |
| `employees` | Stat, bidang, gaji, energi, mood, level |
| `candidates` | Kandidat yang tersedia untuk direkrut |
| `contracts` | Kontrak tersedia dan yang diambil |
| `assignments` | Siapa mengerjakan kontrak apa, `started_at`, `finish_at` |
| `transactions` | Riwayat pemasukan/pengeluaran |
| `events` | Event aktif dan pilihan pemain |

---

## 12. Roadmap

1. **MVP:** login, 1 pekerja, papan kontrak, simpan progres, progres offline.
2. **Rekrut dan ruangan:** kandidat NPC, stat, gaji, tier kantor.
3. **Lantai 2, energi, dan event.**
4. **Konten dan cerita:** karakter kontrak, kandidat langka, misi.
5. **Sosial (opsional):** leaderboard, kerja sama antar pemain.

---

## 13. Risiko

| Risiko | Mitigasi |
|---|---|
| Ekonomi tidak seimbang (terlalu mudah/sulit) | Uji dengan simulasi dan beta kecil, parameter dipisah di konfigurasi |
| Pemain curang lewat klien | Semua perhitungan di server, RLS ketat |
| Pemain bosan setelah fase awal | Event, kontrak bercerita, tujuan jangka panjang |
| Beban 3D di HP | Mode kualitas rendah, batasi jumlah objek dan bayangan |
| Cakupan terlalu luas | Kerjakan per fase, jangan sentuh fitur sosial sebelum inti stabil |

---

## 14. Keputusan desain (diperbarui)

| Topik | Keputusan |
|---|---|
| Gaya bermain | **Idle dengan keputusan ringan**: kerja berjalan otomatis (termasuk saat offline), pemain memilih kontrak, rekrut, istirahat/lembur |
| Rekrutmen | Kandidat **NPC** dari sistem |
| Tema kantor | **Dipilih pemain.** Mesin dibuat netral tema; MVP memakai satu tema (agensi kreatif) |
| Sosial | **Solo dulu**; struktur data disiapkan agar bisa ditambah nanti |
| Platform | **HP**, tampilan tetap miring (isometrik) seperti desktop; visual dipercantik bertahap |
| Monetisasi | Belum diputuskan; arsitektur siap menampung kosmetik |

### Paket tema
Tema hanyalah **paket data**: daftar klien dan kontrak, nama kandidat, palet warna dan dekorasi, serta cerita. Tema yang direncanakan: *Agensi Kreatif* (sudah ada), *Startup Web Developer*, dan *Dunia Narayan* (kontrak dan kandidat bertokoh cerita).

### Layout HP
Adegan 3D isometrik di bagian atas, panel kontrak dan pekerja di bagian bawah. Kontrol sentuh: geser untuk memutar, ketuk tombol untuk aksi.

---

## 15. Spesifikasi MVP

### 15.1 Cakupan
**Masuk:** login, satu pekerja (pendiri), papan kontrak 3 slot, energi dan istirahat, XP skill, kas dan reputasi, simpan progres, progres offline.
**Belum masuk:** rekrut (terbuka di reputasi 20, Fase 2), gaji dan sewa, lantai 2 penuh, event, tema lain, sosial.

### 15.2 Rumus awal
- **Kontrak:** kesulitan 1–5 (naik seiring reputasi), durasi = 15 + kesulitan × 8 detik + acak, bayaran = Rp 50.000 + kesulitan × Rp 25.000 (±15%), biaya energi = 8 + kesulitan × 4.
- **Kualitas:** `0,75 + (level skill − kesulitan) × 0,12 + acak(0–0,25)`, dibatasi 0,5–1,3. Bayaran akhir = bayaran × kualitas.
- **Skill:** +1 XP per kontrak di bidangnya; level = 1 + XP ÷ 3.
- **Reputasi:** + kesulitan jika kualitas ≥ 0,8.
- **Istirahat:** pulih ke 100 dalam (100 − energi) × 0,4 detik.
- **Modal awal:** Rp 300.000.

### 15.3 Data model Supabase (draft)

```sql
create table companies (
  id uuid primary key default gen_random_uuid(),
  owner uuid unique references auth.users on delete cascade,
  name text not null, theme text default 'agensi',
  cash bigint default 300000, rep int default 0, updated_at timestamptz default now()
);
create table employees (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies on delete cascade,
  name text, is_founder bool default false,
  skills jsonb default '{"Konten":0,"Desain":0,"Video":0}',
  energy int default 100, salary int default 0
);
create table contracts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies on delete cascade,
  field text, title text, difficulty int, duration_s int, pay int, energy_cost int,
  employee_id uuid references employees, started_at timestamptz, finish_at timestamptz, done bool default false
);
-- RLS: setiap tabel hanya bisa diakses pemilik company
```

### 15.4 Fungsi server (RPC)
- `take_contract(contract_id, employee_id)`: cek energi, set `started_at`/`finish_at`.
- `settle_finished()`: selesaikan semua kontrak yang `finish_at`-nya lewat, hitung kualitas, tambah kas/XP/reputasi. Dipanggil saat login dan secara berkala.
- `rest(employee_id)`: set waktu pulih.
- `refill_contracts()`: isi ulang slot kontrak.

### 15.5 Kriteria MVP selesai
1. Pemain baru bisa login dan menyelesaikan kontrak pertama dalam ±2 menit.
2. Tutup HP, buka lagi: kontrak yang selesai langsung dihitung.
3. Tidak ada angka uang yang dihitung di klien.
4. Lancar di HP kelas menengah (target 30 fps).

> **Status:** prototipe MVP berbentuk satu halaman HTML (data tersimpan di browser) sudah dibuat untuk menguji loop inti. Login dan penyimpanan Supabase adalah langkah berikutnya.

---

## 16. Pertanyaan yang masih terbuka

1. Monetisasi: gratis penuh, kosmetik, atau tidak sama sekali?
2. Angka ekonomi: perlu diuji setelah prototipe dimainkan.
3. Nama game.
