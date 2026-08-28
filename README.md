# 🎮 Portal Game Nusantara & Dunia - TTS Pintar & Monopoli Pro

Portal game interaktif modern bertaraf internasional dengan 2 permainan utama: **Teka-Teki Silang (TTS Pintar Pro)** dan **Monopoli Pro (Nusantara 40, Dunia 52 & Galaksi 64)**, dirancang dengan antarmuka memukau, responsif di Desktop, Tablet, iPad & Mobile, serta arsitektur kode modular yang bersih dan terpisah.

---

## 🌟 1. Beranda Utama (*Home Page Portal Hub*)

- **Pusat Game Interaktif**: Antarmuka *Bento Cards* untuk memilih game Teka-Teki Silang atau Monopoli Pro.
- **🌐 Sistem Pilihan Bahasa (*Multi-Language / i18n*)**: Penggantian instan antara **🇮🇩 Bahasa Indonesia** dan **🇬🇧 English Edition** di seluruh tombol, antarmuka, modal, dan log.
- **🏆 Sistem Prestasi & Lencana (*Achievements & Trophy Badges*)**: 12+ lencana pencapaian (*Tycoon Master, Sky Architect, Color Monopolist, Pure Mind, Savvy Negotiator, Casino High Roller, Word Master, dsb.*) lengkap dengan progress bar dan reward EXP.
- **🎵 Pemutar Musik Latar Dinamis (*Web Audio BGM Synthesizer*)**: 4 pilihan tema musik relaksasi murni Web Audio (🎶 *Lofi Chill*, 🎺 *Nusantara Ethno*, 🕹️ *Retro 8-Bit*, 🌌 *Cyberpunk Synthwave*) tanpa buffering file audio eksternal.
- **🎙️ Suara Narator Interaktif (*Web Speech API Narration*)**: Menyuarakan lemparan dadu, double roll, destinasi pendaratan petak, krisis global, dan ucapan selamat kemenangan.
- **📱 Aplikasi Web Progresif (*Progressive Web App - PWA*)**: Siap di-install langsung seperti aplikasi asli di HP Android, iOS/iPad, dan Desktop PC melalui `manifest.json` & `sw.js` (Service Worker).
- **Profil & Pangkat Global**: Menampilkan Nickname, Avatar (14+ pilihan), Tingkat Gelar Pangkat (Bronze, Silver, Gold, Platinum, Grandmaster), serta total EXP.
- **Papan Peringkat Terpadu**: Papan skor interaktif murni pemain asli dengan medali Emas 🥇, Perak 🥈, Perunggu 🥉, dan sorotan pemain secara *real-time*.
- **Penyimpanan Otomatis & Ekspor Cadangan**: Profil otomatis tersimpan ke file JSON lokal dan server backend python tanpa perlu repot.

---

## 🎩 2. Monopoli Pro (*Advanced Monopoly Engine*)

Permainan papan strategi terlengkap dengan 3 varian peta: **🇮🇩 Nusantara (40 Petak)**, **🌍 Dunia (52 Petak)**, dan **🪐 Galaksi Metro Non-Kotak (64 Petak)**.

### Fitur Unggulan Monopoli Pro:
1. **🎭 16 Kemampuan Unik Karakter Token (*16 Character Tokens & Skills*)**:
   - 🚗 **Pembalap Kilat**: Bebas denda tilang & dadu genap memberikan bonus langkah +1.
   - 🚢 **Kapten Maritim**: Bebas sewa Stasiun/Bandara & sewa kawasan Pantai/Kepulauan +25%.
   - ✈️ **Pilot Elit**: Bebas biaya tiket transportasi & diskon sewa lintas wilayah 50%.
   - 🎩 **Sultan Konglomerat**: Diskon 10% beli tanah & bonus petak MULAI bertambah Rp 500.000.
   - 🐕 **Detektif Cerdik**: Kebal 1x masuk penjara & diskon seluruh pembayaran pajak 50%.
   - 🚀 **Visioner Teknologi**: Sewa Utilitas Publik 2x lipat & diskon membangun rumah 15%.
   - 🏎️ **Juara Formula**: Sewa properti kota megapolitan (Tokyo/New York/Paris/Jakarta) +30%.
   - 👑 **Kaisar Properti**: Diskon 15% bangun rumah & kebal bebas sewa 1x di properti lawan.
   - 🤖 **AI Cyber Master**: Diskon 20% biaya upgrade gedung Skyscraper & diskon 10% beli tanah baru.
   - 💎 **Ratu Permata**: Menerima dividen kas Rp 500.000 dari bank setiap kali pemain lain mendarat di tanah miliknya.
   - 🐉 **Naga Keberuntungan**: Bonus +50% saat memenangkan hadiah kasino roda keberuntungan & lelang terbuka.
   - 🛡️ **Ksatria Pelindung**: Diskon 20% untuk semua denda sewa yang harus dibayarkan ke lawan.
   - 🛸 **Penjelajah Antariksa**: Setiap melewati Stasiun/Warp Gate menerima subsidi energi Rp 500.000 tunai.
   - 🦁 **Raja Rimba**: Pendapatan sewa seluruh petak cagar alam & kepulauan bertambah +35%.
   - 🧙‍♂️ **Penyihir Waktu**: Kebal bebas 100% dari seluruh tagihan denda petak Pajak!
   - 🦄 **Pegasus Mistis**: Bonus gaji petak MULAI bertambah Rp 750.000 tunai.
2. **⏳ Sistem Deteksi Disconnect & Auto-Kick 1 Menit 30 Detik (90s)**:
   - Menghitung mundur waktu toleransi saat pemain terputus (01:30) dengan banner visual berkedip.
   - Jika waktu habis tanpa koneksi kembali, pemain otomatis dikeluarkan (*kicked*), seluruh asetnya dilelang/dilepaskan ke Bank, dan giliran berlanjut mulus.
3. **🤖 Variasi Kepribadian AI Bot (*AI Personalities*)**:
   - 🦁 **Aggressive Tycoon**: Membeli cepat dan menaikkan harga lelang.
   - 🛡️ **Conservative Saver**: Menjaga cadangan kas besar dan hanya membeli aset strategis.
   - 🤝 **Trader Master**: Aktif menawarkan barter tanah taktis.
4. **🖼️ Foto Landmark Nyata Full-Box & Ikon Properti 3D**:
   - Visualisasi tingkat bangunan bertingkat: **🏠 1-4 Rumah**, **🏨 Hotel Megah (Level 5)**, hingga **🏢 Gedung Pencakar Langit (*Skyscraper* Level 6)** dengan sewa raksasa 1.8x Hotel.
5. **🏘️ Hak Monopoli 1 Set Warna Lengkap (*Color Group Monopoly*)**:
   - Menguasai seluruh tanah dalam satu kelompok warna otomatis melipatgandakan sewa (2x) dan membuka izin membangun gedung.
6. **📈 20+ Event Ekonomi Makro Global Berkala (*Macro-Economy Cycles*)**:
   - Dipicu otomatis setiap **4 putaran**: *Economic Boom, Tourism Boom, Reli Wall Street, Revolusi FinTech (Cashback 20%), Subsidi Konstruksi Hijau, Booming Monopoli, World Expo, Kolam Jackpot Pajak Dunia di Parkir Bebas, Resesi Global, Krisis Energi & Hiperinflasi*.
7. **🔨 Sistem Lelang Terbuka Cepat 15 Detik (*Live Open Auction*)**:
   - Properti yang dilewati dapat langsung dilelang terbuka dan diperebutkan semua pemain & AI Bot dengan hitung mundur visual.
8. **🤝 Sistem Barter & Negosiasi Properti (*Player Trading*)**:
   - Fasilitas barter tanah dan uang tunai antar sesama pemain.
9. **🏦 Bank Sentral, Pinjaman Utang & Gadai Properti**:
   - Pinjaman darurat hingga Rp 5.000.000 serta mekanisme gadai/tebus sertifikat tanah.
10. **🔥 Heatmap Peta Interaktif (*Board Landing Frequency Heatmap*)**:
    - Statistik pendaratan petak untuk analisis investasi properti.

---

## 🧩 3. Teka-Teki Silang Pintar Pro (*TTS Pro*)

1. **9+ Kategori Soal Lengkap**:
   - 🦁 Satwa & Fauna Liar, 🍲 Kuliner Nusantara, 📜 Sejarah Kerajaan, 🎖️ Tokoh Bangsa & Pahlawan, 📦 Benda & Perkakas, 🏛️ Budaya Tradisi, 💻 Sains Komputer, 🌍 Geografi Dunia, 🚀 Antariksa.
2. **⏳ Batasan Bantuan Cerdas & Cooldown 1 Hari (24 Jam)**:
   - **Buka Huruf (*Reveal Letter*)**: Maksimal **3 kali** per hari (Badge counter `3/3`).
   - **Buka Kata (*Reveal Word*)**: Maksimal **2 kali** per hari (Badge counter `2/2`).
   - Sisa kuota dan status cooldown tersimpan permanen di `localStorage`.
3. **Pembuat TTS Kustom & Shareable Link**: Rancang puzzle sendiri dan bagikan tautan instan ke teman.
4. **Mode Cetak PDF**: Format kisi bersih siap cetak ke kertas atau PDF.

---

## 📂 Struktur Arsitektur Kode Modular

```
TEST/
├── index.html                     # Portal Beranda, View TTS, View Monopoli & Modal Dialogs
├── manifest.json                  # PWA Manifest metadata untuk instalasi aplikasi di HP/Desktop
├── sw.js                          # Service Worker untuk caching lokal & offline capability
├── README.md                      # Dokumentasi komprehensif proyek
├── css/
│   └── style.css                  # Tema visual, papan responsif, token, dan overlay gambar
├── backend_python/
│   └── server.py                  # Backend server persintensi file JSON & API auth
├── validate_all.py                # Master All-in-One Validator & Test Suite (100% Pass)
└── js/
    ├── app.js                     # Main SPA Router & Coordinator
    ├── data/
    │   ├── puzzles.js             # Master database soal TTS 9+ kategori
    │   └── monopoly-data.js       # Master database 156+ petak landmark, 16 token & 20+ event
    ├── engine/
    │   ├── audio.js               # Web Audio API sound & BGM synthesizer (4 tema lagu)
    │   ├── auth.js                # Sistem profil otomatis & ekspor/impor JSON
    │   ├── ranking.js             # Engine peringkat, EXP & leaderboard
    │   ├── tts-engine.js          # Core engine TTS & sistem limit kuota cooldown
    │   ├── custom-builder.js      # Generator puzzle TTS kustom
    │   ├── i18n.js                # Multi-Language translation engine (🇮🇩 ID & 🇬🇧 EN)
    │   ├── achievements.js        # Engine prestasi, lencana juara & reward EXP
    │   └── narrator.js            # Web Speech API voice narrator engine
    └── monopoly/
        ├── monopoly-skills.js     # Modul kemampuan unik 16 karakter token
        ├── monopoly-bank.js       # Modul perbankan, pinjaman utang & gadai tanah
        ├── monopoly-economy.js    # Modul 20+ event ekonomi makro global berkala
        ├── monopoly-auction.js    # Modul lelang terbuka cepat 15 detik & AI bidding
        ├── monopoly-trade.js      # Modul barter & negosiasi properti
        ├── monopoly-casino.js     # Modul kasino roda keberuntungan
        ├── monopoly-heatmap.js    # Modul analisis heatmap frekuensi petak
        ├── monopoly-engine.js     # Core orchestrator permainan monopoli, AI playstyle & disconnect
        └── monopoly-ui.js         # Modul UI rendering papan & visualisasi 3D
```

---

## 🚀 Cara Menjalankan

Buka berkas [index.html](file:///c:/Users/Ramli%20Kusuma/Documents/VSCODE/TEST/index.html) di peramban favorit Anda (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari) atau via *Live Server*.
