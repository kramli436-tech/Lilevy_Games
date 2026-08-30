# 🎲 MONOPOLY: Ultimate Hardcore Cyberpunk Edition

[![Developer](https://img.shields.io/badge/Developer-Lilevy%20Games-00f0ff?style=for-the-badge)](https://github.com/)
[![Version](https://img.shields.io/badge/Version-2.7%20Hardcore-ff007f?style=for-the-badge)](https://github.com/)
[![License](https://img.shields.io/badge/License-MIT-39ff14?style=for-the-badge)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Mobile%20%7C%20Desktop-7928ca?style=for-the-badge)](https://github.com/)

> **Monopoly: Ultimate Hardcore Edition** adalah adaptasi game papan monopoli modern bertema *Cyberpunk Neon Metropolis* karya **Lilevy Games**. Menghadirkan formula ekonomi berlapis, cuaca distrik dinamis, pasar saham cyber, pinjaman rentenir, pasar gelap, sistem lelang, kerjasama Joint Venture, dadu 3D interaktif, multiplayer realtime, live chat dengan bot AI, serta core engine biner WebAssembly berkecepatan tinggi.

---

## 🌟 Fitur Utama Permainan

### 🗺️ 1. Papan 52 Petak & 6 Distrik Kota
Papan permainan terdiri dari **52 petak persegi** (13 petak per sisi) yang terbagi ke dalam 6 distrik bertema:
* 🟣 **Neon Utara** (Petak 1–12) — Distrik hiburan dan lampu neon gemerlap.
* 🔵 **Cyber Timur** (Petak 14–25) — Pusat industri robotik dan semikonduktor canggih.
* 🌌 **Zona Kuantum** (Petak 26–38) — Wilayah anomali eksperimental dengan multiplier sewa paling fluktuatif.
* 🔴 **Shadow Selatan** (Petak 40–51) — Wilayah industri bawah tanah, rentenir, dan pasar gelap.
* 🟡 **Pusat Finansial** & 🟢 **Data Barat** — Hub perbankan, server data kuantum, dan korporasi multinasional.

Masing-masing distrik memiliki tingkat **Sinergi Wilayah**:
* **Minor Synergy** (2 Properti di distrik sama) ➔ Sewa seluruh properti distrik +15%
* **Major Synergy** (3 Properti di distrik sama) ➔ Sewa +30% & Diskon Bangun -10%
* **District Lord** (4+ Properti di distrik sama) ➔ Sewa melonjak +50% di seluruh distrik!

---

### ⚡ 2. 12 Karakter Unik & Skill Aktif/Pasif
Pemain dapat memilih salah satu dari 12 kelas karakter spesialis:
| Karakter | Skill Pasif | Skill Aktif (Cooldown) |
| :--- | :--- | :--- |
| 💼 **Banker** | Bunga pinjaman bank hanya 3% | Membekukan sewa 1 properti lawan selama 3 giliran |
| 🔧 **Engineer** | Biaya konstruksi diskon 20% | Upgrade 1 level bangunan properti sendiri secara gratis |
| 📈 **Trader** | Nilai evaluasi tukar properti +15% | Memaksa transaksi pertukaran properti dengan lawan |
| 🎩 **Politician** | Kebal seluruh petak pajak kota | Menarik pajak 15% dari saldo kas seluruh lawan |
| 🎲 **Gambler** | Peluang 25% lemparan dadu Double | Menggandakan seluruh sewa properti sendiri (2x lipat) 2 turn |
| 🛡️ **Guardian** | Kebal dari lelang paksa & sabotase | Memasang perisai energi mengabaikan 2 pembayaran sewa |
| 💻 **Hacker** | Diskon 30% Pasar Gelap & kebal razia | Meretas dan menyedot $350 langsung dari kas lawan terkaya |
| 👑 **Tycoon** | Bonus kas lewat GO +$400 | Membeli paksa properti non-monopoli lawan seharga 1.5x pasar |
| 🦾 **Cyborg** | Mengurangi 40% denda kerusakan bencana | Overdrive +6 langkah dadu ekstra & bebas sewa saat mendarat |
| 📊 **Broker** | Diskon 25% beli saham & dividen +50% | Memompa portofolio saham +40% & panen dividen kas $250 |
| 🕵️ **Detective** | Hadiah bounty +$200 saat lawan dipenjara | Memasang karantina polisi di 1 distrik lawan selama 2 giliran |
| 🧪 **Alchemist** | Cashback pinjaman 10% & diskon gadai 30% | Menarik 2 kartu aksi taktis (Chance/Chest) instan ke tangan |

---

### 🏠 3. Formula Sewa 7-Tier & 5 Jalur Konstruksi
Sewa properti dihitung secara dinamis melalui formula 7 lapis WebAssembly:
```text
Sewa = Base × Bangunan × Monopoli (2x) × Sinergi Distrik × Event Ekonomi × Cuaca × Skill
```

**5 Pilihan Jalur Bangunan:**
* 🏨 **Hotel** (4 Rumah + Monopoli ➔ Hotel): Sewa tertinggi hingga 40x sewa dasar.
* 🏬 **Mall Bisnis** (2 Rumah ➔ Mall): Menghasilkan dividen pasif kas +$50 per giliran.
* 🏢 **Markas Besar / HQ** (2 Rumah ➔ HQ): Menggandakan efek skill karakter saat berada di petak ini.
* 🎰 **Kasino Mewah** (1 Rumah ➔ Kasino): Sewa acak bertaruh antara 0.5x hingga 3.0x lipat.
* 🏰 **Benteng / Fortress** (3 Rumah ➔ Benteng): Kebal 100% dari sabotase dan bencana alam.

---

### 🤝 4. Sistem Negosiasi & Pertukaran Properti (Trade)
* **Paket Barter Fleksibel**: Menawarkan gabungan multi-properti sekaligus meminta beberapa properti lawan dalam satu proposal.
* **Kompensasi Kas (Sweetener)**: Tambahkan uang tunai untuk menyetarakan nilai transaksi.
* **Kecerdasan Bot AI Trade**: Bot AI mengevaluasi potensi monopoli lawan. Bot akan menolak keras trade yang memberikan monopoli pada pemain manusia kecuali ditukar dengan kompensasi berlipat ganda (+$800).
* **Restriksi**: Properti yang sedang digadaikan (*mortgaged*) atau saat event *Pandemi* berlangsung tidak dapat diperdagangkan.

---

### 🃏 5. Action Cards & 6 Misi Rahasia Kemenangan
* **Inventaris Kartu Taktis (Maks 3)**:
  * *Serangan*: Hostile Takeover (beli paksa 1.5x), Sabotage (hancurkan level bangunan), Tax Audit (tarik 20% kekayaan lawan), Cyber Attack (kunci skill lawan 3 giliran).
  * *Pertahanan*: Firewall (tangkal 1 serangan), Insurance (bebas sewa 1x), Legal Shield (kebal takeover 2 turn), Bail Bond (keluar penjara instan).
  * *Ekonomi & Utilitas*: Market Manipulation (ubah saham ±30%), Teleportasi, Balik Arah, dan Dadu Ganda (3 dadu).
* **6 Misi Rahasia (Secret Objectives)**:
  * 🏘️ *Baron Distrik* (Kuasai 4 properti 1 distrik ➔ +$800).
  * 🎰 *Raja Kasino* (Bangun 2 Kasino ➔ +$600).
  * 📈 *Konglomerat Saham* (Portofolio $1000+ ➔ +$500).
  * 👑 *Raja Monopoli* (2 grup warna monopoli ➔ +$900).
  * 🤝 *Master Kerjasama* (2 Joint Venture aktif ➔ +$500).
  * 💰 *Raja Likuiditas* ($3000 kas tanpa hutang ➔ +$750).

---

### 🌍 6. 16 Event Global & 11 Sistem Cuaca
* **16 Event Ekonomi Global**: *Bull Market, Market Crash, Inflasi, Boom Konstruksi, Pandemi, Revolusi Teknologi, Bailout Pemerintah, Kebakaran, Demam Emas, Bencana Alam, Perang Siber, Ledakan Kripto, Tax Holiday, Mega Merger, Anomali Kuantum, Hiperinflasi*.
* **11 Sistem Cuaca Dinamis**: *Cerah ☀️, Hujan 🌧️, Badai ⛈️, Kabut 🌫️, Badai Salju ❄️, Gelombang Panas 🔥, Langit Cerah 🌈, Aurora Kuantum 🌌, Hujan Asam 🧪, Gerhana Matahari 🌑, Asap Siber 💨*.

---

### 📊 7. Pasar Saham Cyber, Pinjaman & Pasar Gelap
* **Pasar Saham Korporasi**: Trading 4 emiten saham (*NeonCorp, CyberTech, DataFlow, QuantumAI*) dengan siklus pembayaran dividen setiap 10 giliran.
* **3 Skema Pinjaman**:
  * 🏦 *Pinjaman Bank* (Bunga 5%/turn, limit $1000, tenor 10 turn).
  * 🦈 *Pinjaman Rentenir* (Bunga 15%/turn, unlimited, tenor 5 turn).
  * 🏠 *Gadai Properti* (Bunga 0%, terima 50% nilai aset, tebus 55%).
* **Pasar Gelap (Black Market)**: Beli item selundupan ilegal (*Alat Mata-mata, Uang Palsu, Kunci Master, Sertifikat Palsu, Perlindungan Sindikat, Stimulan*) dengan risiko razia penjara.
* **Joint Venture (JV)**: Kerjasama kepemilikan aset dengan pemain lain dengan pembagian hasil fleksibel (50/50, 60/40, 70/30) plus bonus kemitraan +20%.

---

### ⚖️ 8. Sistem Lelang Properti Real-Time
* **Lelang Terbuka 15 Detik**: Setiap kali pemain menolak membeli properti kosong yang dipijak, properti otomatis masuk ke sesi lelang publik.
* **Increment Tawaran**: Tawaran baru minimal naik +10% atau +$15.
* **AI Bot Snipe**: Bot AI menganalisis distrik dan melakukan penawaran agresif di detik-detik akhir untuk mengamankan wilayah.

---

### 💬 9. Room & In-Game Live Chat System
* **Lobby Chat**: Mengobrol di ruang tunggu dengan daftar pemain dan tombol *Quick Taunt Chips* (`👋 Halo!`, `🔥 Gas!`, `🎲 GL!`, `🤑 Sultan!`).
* **In-Game Chat Drawer**: Panel chat samping yang dapat dibuka/ditutup tanpa menghalangi papan, dilengkapi *Unread Notification Badge*.
* **AI Bot Dynamic Banter**: Bot AI dapat ikut mengobrol secara otomatis menyapa di room, merespon obrolan pemain, dan bereaksi pada momen seru (dadu double, sewa mahal, bangkrut).

---

### 📜 10. Riwayat Pertandingan Live & Log Event Lengkap
* **Timeline Aktivitas Real-Time**: Mencatat setiap aksi giliran (lemparan dadu, pembelian properti, upgrade bangunan, pembayaran sewa, penggunaan skill karakter, kartu aksi, transaksi pasar gelap, pinjaman, gadai, saham, lelang, hingga kebangkrutan).
* **5 Tab Kategori & Filter Cepat**: `🌐 Semua (All)`, `🏠 Properti & Sewa`, `💰 Finansial & Saham`, `⚡ Skill & Sabotase`, `🌍 Event & Cuaca`.
* **Pencarian Cepat (*Search Bar*)**: Cari log pertandingan berdasarkan nama pemain, nama properti, atau jenis event secara instan.
* **Penjelasan & Dampak Mendalam**: Setiap kartu log dilengkapi kotak informasi detail (*"💡 Penjelasan & Dampak:"*) mengenai mengapa event tersebut terjadi dan efek matematisnya terhadap permainan.
* **Arsip Riwayat Pertandingan (*Match Archive*)**: Ringkasan setiap pertandingan yang selesai disimpan otomatis ke `localStorage` (Tanggal, Pemenang, Karakter, Durasi, Total Giliran, dan Total Kekayaan).

---

### ⚙️ 11. WebAssembly Core Simulation Engine (Rust & C++)
* **Biner WebAssembly `engine.wasm` (594 Bytes)**: Seluruh komputasi performa tinggi dieksekusi mendekati kecepatan native:
  1. `fast_rng`: High-Entropy Xorshift32 Pseudo-Random Number Generator.
  2. `calculate_rent_wasm`: 7-Tier instant rent mathematical matrix.
  3. `evaluate_buy_decision`: Grandmaster AI acquisition heuristic scoring (0–1000).
  4. `evaluate_auction_bid`: AI real-time auction bidding & snip ratio calculator.
  5. `evaluate_trade`: Monopoly denial & barter appraisal engine.
  6. `simulate_bankruptcy_risk`: Liquidity ratio vs liability risk evaluator.
  7. `evaluate_building_priority`: Building upgrade urgency evaluator.
  8. `get_engine_version`: Engine version identifier.
* **Pure JS Fallback**: Sistem otomatis beralih ke engine JavaScript internal jika WebAssembly tidak didukung perangkat.

---

## 🛠️ Arsitektur Teknologi & Struktur File

Game ini dibangun dengan pendekatan **High-Performance Hybrid Architecture (WebAssembly Core + Zero-Dependency Vanilla Web Stack)**:

```text
PORT/
├── index.html            # Antarmuka utama, Canvas game stage, Modals & Dadu 3D
├── wasm/
│   └── engine.wasm       # Compiled WebAssembly High-Performance Binary Core (594 B)
├── src_wasm/
│   ├── engine.rs         # Source Code Rust Engine (PRNG, Hardcore MCTS AI, Rent Matrix)
│   └── engine.cpp        # Source Code C++ Engine (Freestanding / Zero-Dependency)
├── css/
│   └── style.css         # Cyberpunk Glassmorphism UI, Match History Timeline & Responsive Mobile
├── js/
│   ├── wasm-engine.js    # WebAssembly Loader, Native Bridge & Embedded Fallback
│   ├── history.js        # Match History Engine, Event Explanations & Match Archival
│   ├── ai.js             # Kecerdasan Buatan Bot (Hardcore Grandmaster AI & MCTS Heuristics)
│   ├── animations.js     # Engine partikel neon, cash float effect & screen shake
│   ├── audio.js          # Web Audio API Sound Synthesizer (SFX Dadu, Beli, Chat, dll)
│   ├── auction.js        # Modul lelang real-time & blind bidding 15s timer
│   ├── black-market.js   # Modul pasar gelap, item ilegal & kalkulasi risiko razia
│   ├── board.js          # Definisi 52 petak papan, distrik, dan warna grup
│   ├── cards.js          # Kartu Action (Attack/Defense), Chance, Chest & Misi Rahasia
│   ├── chat.js           # Sistem Chat Room, In-Game Drawer, Quick Taunt & Bot Banter
│   ├── dice.js           # Engine kocok dadu 3D CSS physics & Wasm High-Entropy RNG
│   ├── district.js       # Logika kalkulasi sinergi wilayah distrik
│   ├── economy.js        # Engine 16 event ekonomi global acak
│   ├── game.js           # State Manager alur giliran, transaksi uang, dan aturan game
│   ├── guide.js          # Buku Panduan Interaktif 21 Bab (Guidebook)
│   ├── joint-venture.js  # Sistem kemitraan kepemilikan properti bersama (JV)
│   ├── lang.js           # Sistem multi-bahasa (Bahasa Indonesia & English)
│   ├── loan.js           # Modul 3 jenis pinjaman, bunga per giliran, & penyitaan aset
│   ├── main.js           # Inisialisasi aplikasi, navigasi screen, & event bindings
│   ├── network.js        # Supabase Realtime WebSocket engine & sync room state
│   ├── player.js         # Model data pemain, inventaris kartu, aset, dan status
│   ├── property.js       # Manajemen kepemilikan properti, monopoli, & Wasm Rent Multipliers
│   ├── renderer.js       # HTML5 Canvas 2D High-DPI Render Pipeline & Auto Centering
│   ├── skills.js         # Logika skill pasif & aktif 12 karakter
│   ├── stock.js          # Simulasi pasar saham korporasi & siklus dividen
│   ├── trade.js          # Sistem negosiasi pertukaran properti antar pemain
│   ├── ui.js             # HUD Manager, modal dialog controller, & action panel
│   └── weather.js        # Engine 11 sistem cuaca distrik dinamis
```

---

## 🚀 Cara Menjalankan Game Secara Lokal

1. **Clone atau Unduh Repositori**:
   ```bash
   git clone https://github.com/username/monopoly-hardcore.git
   cd monopoly-hardcore
   ```

2. **Jalankan via Local Server**:
   Anda dapat menggunakan Live Server di VS Code atau Python HTTP server sederhana:
   ```bash
   # Menggunakan Python 3
   python -m http.server 8000
   
   # Atau menggunakan Node http-server
   npx http-server . -p 8000
   ```

3. **Buka di Browser**:
   Buka browser favorit Anda dan akses:
   ```text
   http://localhost:8000
   ```

---

## 📱 Optimalisasi Mobile & Perangkat Spek Rendah (Low-End Hardware)
* **Offscreen Canvas Caching**: Papan statis 52 petak, nama jalan, warna distrik, dan ikon di-render sekali ke *Offscreen Canvas Buffer*. Saat pemain melangkah, GPU hanya melakukan 1x blit instan sehingga frame rate stabil 60 FPS tanpa lag.
* **Capped DPR (Device Pixel Ratio Clamping)**: Mencegah HP murah berlayar FHD/QHD merender kanvas 3x–4x ukuran fisik yang biasanya menyebabkan GPU *throttling*.
* **Adaptive Graphics Quality (Low, Medium, High)**:
  - **⚡ Low**: Mematikan partikel dan `backdrop-filter: blur`, DPR = 1.0, konsumsi RAM dan baterai sangat minim untuk HP spek kentang / RAM 1–2 GB.
  - **⚖️ Medium**: Keseimbangan optimal (DPR 1.35x, efek ringan).
  - **✨ High**: Efek partikel, neon glow, dan cuaca distrik penuh (DPR 2.0x).
* **Battery & Power Saver**: Otomatis menghentikan render loop saat tab diminimalkan / layar terkunci (*Page Visibility API*).
* **Procedural Web Audio Synthesizer**: Seluruh efek suara disintesis langsung melalui Web Audio API Oscillators tanpa mengunduh file audio eksternal, menghemat memori dan kuota internet.
* **100dvh Viewport Support**: Mengatasi bilah navigasi dinamis pada browser Android Chrome & iOS Safari.
* **Elevated Action Dock**: 4 tombol aksi utama terangkat naik sehingga 100% aman dan nyaman ditekan oleh jempol.

---

## 📜 Panduan Singkat Memulai Game
1. Klik **BERMAIN / PLAY** pada menu utama.
2. Masukkan **Nama Pemain** dan pilih salah satu dari **12 Karakter Spesialisasi**.
3. Pilih **BUAT ROOM** untuk membuat kode room baru, atau **GABUNG** menggunakan kode room teman.
4. Di Ruang Tunggu (*Waiting Room*), Anda dapat menambahkan **Bot AI (Hard)** dan mulai mengobrol di Room Chat.
5. Tekan **START GAME** untuk memulai petualangan menguasai kota neon!

---

## 📄 Lisensi
Proyek ini dilisensikan di bawah **MIT License**. Hak Cipta &copy; 2026 **Lilevy Games**.
