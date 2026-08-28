# 🎮 Portal Game Nusantara - TTS Pintar & Monopoli Nusantara Pro

Portal game interaktif modern dengan 2 permainan utama: **Teka-Teki Silang (TTS Pintar Pro)** dan **Monopoli Nusantara Pro (Edisi Indonesia)**, dirancang dengan antarmuka memukau, responsif di Desktop & Mobile, serta arsitektur kode modular yang bersih dan terpisah.

---

## 🌟 1. Beranda Utama (*Home Page Portal Hub*)

- **Pusat Game Interaktif**: Antarmuka *Bento Cards* untuk memilih game Teka-Teki Silang atau Monopoli Nusantara Pro.
- **Profil & Pangkat Global**: Menampilkan Nickname, Avatar (14+ pilihan), Tingkat Gelar Pangkat (Bronze, Silver, Gold, Platinum, Grandmaster), serta total EXP.
- **Papan Peringkat Terpadu**: Papan skor interaktif lengkap dengan medali Emas 🥇, Perak 🥈, Perunggu 🥉, dan sorotan pemain secara *real-time*.
- **Router SPA**: Berpindah game seketika (*Home ↔ TTS ↔ Monopoli*) tanpa memuat ulang halaman.

---

## 🎩 2. Monopoli Nusantara Pro (*Advanced Monopoly Edition*)

Permainan papan strategi 40 petak terlengkap bertema destinasi dan kota di Indonesia:

### Fitur Unggulan Monopoli Pro:
1. **🖼️ Foto Landmark Nyata & Ikon Rumah/Hotel 3D**:
   - Setiap petak tanah dilengkapi foto landmark ikonik resolusi tinggi (Monas, Borobudur, Kawah Putih, Bromo, Raja Ampat, dll.).
   - Visualisasi tingkat bangunan nyata: 1-4 Rumah 🏠 dan Hotel Megah 🏨 di petak papan.
2. **🏘️ Sistem Kompleks Properti (*Color Group Monopoly*)**:
   - Menguasai seluruh tanah dalam satu kelompok warna otomatis melipatgandakan sewa (2x) dan membuka izin konstruksi rumah.
3. **⚡ 6 Kemampuan Unik Karakter (*Character Abilities*)**:
   - 🚗 **Pembalap Kilat**: Bebas denda tilang & kesempatan lempar dadu ekstra jika jumlah dadu genap.
   - 🚢 **Kapten Maritim**: Bebas biaya sewa Stasiun & pendapatan sewa kawasan Kepulauan/Pantai +25%.
   - ✈️ **Pilot Elit**: Bebas denda kartu transportasi & diskon sewa antar-provinsi 50%.
   - 🎩 **Sultan Nusantara**: Diskon beli tanah 10% & bonus petak MULAI bertambah Rp 500.000.
   - 🐕 **Detektif Cerdik**: Kebal 1x masuk penjara & diskon seluruh pajak 50%.
   - 🚀 **Visioner Teknologi**: Pendapatan sewa PLN & PDAM 2x lipat & diskon membangun rumah/hotel 15%.
4. **🏦 Bank Sentral, Pinjaman Utang & Gadai Properti**:
   - **Pinjaman Darurat**: Pinjam modal kas darurat dari Bank dengan cicilan bunga 8% per putaran.
   - **Gadai Properti (*Mortgage*)**: Menggadaikan tanah dengan nilai 50% harga beli saat krisis kas.
   - **Tebus Gadai**: Membayar tebusan gadai untuk mengaktifkan kembali pendapatan sewa.
5. **📈 Krisis Ekonomi & Inflasi Dinamis (*Macro-Economy Engine*)**:
   - Event ekonomi global berkala: *Inflasi Nasional (+25% sewa)*, *Festival Pariwisata (Sewa pulau 2x lipat)*, *Subsidi Konstruksi (Diskon bangun rumah 30%)*, *Tax Amnesty (Bebas pajak)*, dan *Resesi Global*.
6. **🔨 Sistem Lelang Terbuka Otomatis (*Live Open Auction*)**:
   - Jika pemain yang mendarat di petak tak bertuan menolak membeli, tanah otomatis dilelang terbuka dan diperebutkan semua pemain & AI Bot dengan penawaran (+Rp 100k, +Rp 500k, atau Pass).
7. **🤖 Mode Lawan AI Pintar (*Smart Human-like AI*)**:
   - AI cerdas yang menghitung nilai investasi tanah, menjaga cadangan kas, membangun rumah secara taktis, dan ikut lelang terbuka.
8. **👥 Mode Buat Room Kustom (*Multiplayer Room Setup*)**:
   - Pengaturan 2 s/d 4 pemain, pilihan modal awal (Rp 10 Juta - Rp 20 Juta), dan pemilihan token bidak favorit.

---

## 🧩 3. Teka-Teki Silang Pintar Pro (*TTS Pro*)

1. **9+ Kategori Soal Lengkap**:
   - 🦁 Satwa & Fauna Liar, 🍲 Kuliner Nusantara, 📜 Sejarah Kerajaan, 🎖️ Tokoh Bangsa & Pahlawan, 📦 Benda & Perkakas, 🏛️ Budaya Tradisi, 💻 Sains Komputer, 🌍 Geografi Dunia, 🚀 Antariksa.
2. **🎲 Mode Acak Cepat**: Memulai teka-teki silang secara spontan.
3. **Bantuan Cerdas**: Buka 1 Huruf, Buka 1 Kata, Cek Kesalahan (penanda merah).
4. **Pembuat TTS Kustom & Shareable Link**: Rancang puzzle sendiri dan bagikan tautan instan ke teman.
5. **Mode Cetak PDF**: Format kisi bersih siap cetak ke kertas atau PDF.

---

## 📂 Struktur Arsitektur Kode Modular

Proyek ini telah direstrukturisasi menjadi modul-modul independen yang rapi dan terpisah:

```
TEST/
├── index.html                     # Portal Beranda, View TTS, View Monopoli & Modal Dialogs
├── README.md                      # Dokumentasi komprehensif proyek
├── css/
│   └── style.css                  # Tema visual, papan 11x11, dadu 3D, token & print layout
└── js/
    ├── app.js                     # Main SPA Router & Coordinator
    ├── data/
    │   ├── puzzles.js             # Master database soal TTS 9+ kategori
    │   └── monopoly-data.js       # Master database 40 petak, foto landmark, skill & event
    ├── engine/
    │   ├── audio.js               # Web Audio API sound synthesizer
    │   ├── ranking.js             # Engine peringkat, EXP & leaderboard
    │   ├── tts-engine.js          # Core engine Teka-Teki Silang
    │   └── custom-builder.js      # Generator puzzle TTS kustom
    └── monopoly/
        ├── monopoly-skills.js     # Modul kemampuan unik & pasif karakter
        ├── monopoly-bank.js       # Modul perbankan, pinjaman utang & gadai tanah
        ├── monopoly-economy.js    # Modul event inflasi & siklus makroekonomi
        ├── monopoly-auction.js    # Modul lelang terbuka & AI bidding
        ├── monopoly-engine.js     # Core orchestrator jalannya permainan monopoli
        └── monopoly-ui.js         # Modul UI rendering papan 11x11 & foto landmark
```

---

## 🚀 Cara Menjalankan

Buka berkas [index.html](file:///c:/Users/Ramli%20Kusuma/Documents/VSCODE/TEST/index.html) di peramban favorit Anda (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari) atau via *Live Server*.
