/**
 * DATABASE TEKA-TEKI SILANG (TTS) - MASTER REPOSITORY
 * Koleksi puzzle multi-kategori (Hewan, Makanan, Sejarah, Tokoh, Benda, Budaya, Sains, Geografi, dll.)
 * Semua koordinat terverifikasi berpotongan (intersect) 100% presisi dan bebas konflik.
 */

const PUZZLE_DATA = [
  // 1. Budaya & Tradisi Nusantara
  {
    id: "nusantara-pemula",
    title: "Pesona Budaya Nusantara",
    difficulty: "Mudah",
    category: "Budaya & Tradisi",
    description: "Kuis seputar tradisi, kuliner, dan warisan kebudayaan Indonesia.",
    icon: "landmark",
    rows: 10,
    cols: 10,
    words: [
      {
        number: 1,
        direction: "across",
        clue: "Kain tradisional bercorak khas warisan luhur bangsa Indonesia",
        answer: "BATIK",
        row: 0,
        col: 0
      },
      {
        number: 1,
        direction: "down",
        clue: "Candi Buddha terbesar di dunia yang berada di Magelang",
        answer: "BOROBUDUR",
        row: 0,
        col: 0
      },
      {
        number: 2,
        direction: "across",
        clue: "Kuliner daging rempah lezat khas Minangkabau yang mendunia",
        answer: "RENDANG",
        row: 2,
        col: 0
      },
      {
        number: 3,
        direction: "down",
        clue: "Alat musik bambu goyang khas Sunda, Jawa Barat",
        answer: "ANGKLUNG",
        row: 2,
        col: 4
      },
      {
        number: 4,
        direction: "across",
        clue: "Seni memahat kayu atau batu khas kota Jepara",
        answer: "UKIR",
        row: 5,
        col: 0
      },
      {
        number: 5,
        direction: "across",
        clue: "Senjata tradisional berbilah tajam khas suku Sunda",
        answer: "KUJANG",
        row: 5,
        col: 4
      },
      {
        number: 6,
        direction: "across",
        clue: "Kesenian tari topeng singa dan bulu merak khas Ponorogo",
        answer: "REOG",
        row: 8,
        col: 0
      },
      {
        number: 7,
        direction: "across",
        clue: "Informasi atau warta tentang suatu peristiwa penting",
        answer: "KABAR",
        row: 0,
        col: 5
      },
      {
        number: 8,
        direction: "down",
        clue: "Pulau Dewata tujuan wisata primadona internasional",
        answer: "BALI",
        row: 0,
        col: 7
      },
      {
        number: 9,
        direction: "down",
        clue: "Kuliner daging tusuk bakar berbumbu kacang khas Nusantara",
        answer: "SATE",
        row: 4,
        col: 7
      }
    ]
  },

  // 2. Kuliner & Makanan Tradisional
  {
    id: "kuliner-makanan",
    title: "Surga Kuliner & Makanan Nusantara",
    difficulty: "Mudah",
    category: "Kuliner & Makanan",
    description: "Jelajah kelezatan makanan tradisional, jajanan pasar, dan masakan legendaris.",
    icon: "utensils",
    rows: 10,
    cols: 10,
    words: [
      {
        number: 1,
        direction: "across",
        clue: "Kuliner daging tusuk bakar bumbu kacang atau kecap",
        answer: "SATE",
        row: 0,
        col: 0
      },
      {
        number: 1,
        direction: "down",
        clue: "Sup berkuah kaldu kuning gurih berisi daging dan tauge",
        answer: "SOTO",
        row: 0,
        col: 0
      },
      {
        number: 2,
        direction: "down",
        clue: "Olahan kedelai putih lembut sumber protein nabati",
        answer: "TAHU",
        row: 0,
        col: 2
      },
      {
        number: 3,
        direction: "down",
        clue: "Minuman segar manis bersantan gula merah khas Banjarnegara (Es ...)",
        answer: "ESDAWET",
        row: 0,
        col: 3
      },
      {
        number: 4,
        direction: "across",
        clue: "Minuman seduhan daun herbal aromatik hangat berkhasiat",
        answer: "TEH",
        row: 2,
        col: 0
      },
      {
        number: 5,
        direction: "across",
        clue: "Kue goreng berbentuk cincin bulat berlubang di tengah",
        answer: "DONAT",
        row: 2,
        col: 3
      },
      {
        number: 6,
        direction: "down",
        clue: "Makanan pokok utama masyarakat Indonesia yang diolah dari beras",
        answer: "NASI",
        row: 2,
        col: 5
      },
      {
        number: 7,
        direction: "across",
        clue: "Bumbu pasta hijau pedas khas masakan Jepang yang menyengat",
        answer: "WASABI",
        row: 4,
        col: 3
      },
      {
        number: 8,
        direction: "down",
        clue: "Hewan laut atau air tawar bernapas dengan insang untuk lauk lezat",
        answer: "IKAN",
        row: 4,
        col: 8
      },
      {
        number: 9,
        direction: "across",
        clue: "Bahan makanan oval berkulit cangkang dari unggas (ceplok/dadar)",
        answer: "TELUR",
        row: 6,
        col: 3
      },
      {
        number: 10,
        direction: "across",
        clue: "Olahan daging sapi rempah khas Minang berpredikat terenak di dunia",
        answer: "RENDANG",
        row: 7,
        col: 3
      }
    ]
  },

  // 3. Dunia Hewan & Satwa Liar
  {
    id: "flora-fauna-indonesia",
    title: "Dunia Satwa & Fauna Liar",
    difficulty: "Mudah",
    category: "Hewan & Satwa",
    description: "Keanekaragaman fauna unik, mamalia, reptil, dan satwa Nusantara.",
    icon: "trees",
    rows: 10,
    cols: 10,
    words: [
      {
        number: 1,
        direction: "across",
        clue: "Kadal purba raksasa karnivora endemik Pulau Komodo di NTT",
        answer: "KOMODO",
        row: 0,
        col: 0
      },
      {
        number: 1,
        direction: "down",
        clue: "Hewan mamalia berkuku satu yang tangguh, kuat, dan lincah berlari",
        answer: "KUDA",
        row: 0,
        col: 0
      },
      {
        number: 2,
        direction: "down",
        clue: "Primata endemik berbulu oranye kemerahan asal hutan Kalimantan & Sumatra",
        answer: "ORANGUTAN",
        row: 0,
        col: 3
      },
      {
        number: 3,
        direction: "across",
        clue: "Burung merpati jinak lambang perdamaian dan kesetiaan",
        answer: "DARA",
        row: 2,
        col: 0
      },
      {
        number: 4,
        direction: "down",
        clue: "Mamalia bertanduk indah bercabang yang hidup di padang rumput",
        answer: "RUSA",
        row: 2,
        col: 2
      },
      {
        number: 5,
        direction: "across",
        clue: "Pancaran energi batin atau atmosfer khas di sekitar makhluk hidup",
        answer: "AURA",
        row: 5,
        col: 2
      },
      {
        number: 6,
        direction: "down",
        clue: "Satwa langka bercula satu di Taman Nasional Ujung Kulon, Banten",
        answer: "BADAK",
        row: 4,
        col: 5
      },
      {
        number: 7,
        direction: "across",
        clue: "Hewan ternak berbulu tebal keriting penghasil kain wol",
        answer: "DOMBA",
        row: 6,
        col: 5
      },
      {
        number: 8,
        direction: "across",
        clue: "Unggas peliharaan berkokok merdu di pagi hari",
        answer: "AYAM",
        row: 7,
        col: 3
      }
    ]
  },

  // 4. Jejak Sejarah & Kerajaan
  {
    id: "sejarah-nusantara",
    title: "Jejak Sejarah & Kerajaan Nusantara",
    difficulty: "Sedang",
    category: "Sejarah & Kerajaan",
    description: "Kilas balik peradaban kerajaan maritim, peninggalan kuno, dan proklamasi.",
    icon: "scroll",
    rows: 10,
    cols: 10,
    words: [
      {
        number: 1,
        direction: "across",
        clue: "Kerajaan maritim terbesar di Jawa Timur dengan patih Gajah Mada",
        answer: "MAJAPAHIT",
        row: 0,
        col: 0
      },
      {
        number: 1,
        direction: "down",
        clue: "Kerajaan Islam di Jawa Tengah yang dipimpin Sultan Agung",
        answer: "MATARAM",
        row: 0,
        col: 0
      },
      {
        number: 2,
        direction: "down",
        clue: "Piagam batu bertulis peninggalan masa sejarah kuno",
        answer: "PRASASTI",
        row: 0,
        col: 4
      },
      {
        number: 3,
        direction: "across",
        clue: "Singgasana kedudukan kekuasaan seorang raja",
        answer: "TAHTA",
        row: 2,
        col: 0
      },
      {
        number: 4,
        direction: "across",
        clue: "Permata intan berlian perhiasan mahkota para raja",
        answer: "RATNA",
        row: 4,
        col: 0
      },
      {
        number: 5,
        direction: "down",
        clue: "Waktu atau masa lampau dalam sejarah (bahasa serapan)",
        answer: "TEMPO",
        row: 0,
        col: 8
      },
      {
        number: 6,
        direction: "across",
        clue: "Satuan waktu 60 detik / pencatatan rapat penting",
        answer: "MENIT",
        row: 6,
        col: 0
      },
      {
        number: 7,
        direction: "down",
        clue: "Rempah biji bernilai tinggi asal Kepulauan Banda Maluku",
        answer: "PALA",
        row: 6,
        col: 6
      },
      {
        number: 8,
        direction: "across",
        clue: "Pertemuan dua garis atau permainan kata seperti teka-teki ...",
        answer: "SILANG",
        row: 8,
        col: 4
      }
    ]
  },

  // 5. Tokoh Bangsa & Pahlawan Nasional
  {
    id: "tokoh-pahlawan",
    title: "Tokoh Bangsa & Pahlawan Nasional",
    difficulty: "Sedang",
    category: "Tokoh Sejarah",
    description: "Mengenang jasa proklamator, pejuang emansipasi, dan panglima besar.",
    icon: "award",
    rows: 10,
    cols: 10,
    words: [
      {
        number: 1,
        direction: "across",
        clue: "Presiden pertama Republik Indonesia dan Sang Proklamator",
        answer: "SOEKARNO",
        row: 0,
        col: 0
      },
      {
        number: 1,
        direction: "down",
        clue: "Panglima Besar TNI pemimpin perang gerilya yang gigih",
        answer: "SUDIRMAN",
        row: 0,
        col: 0
      },
      {
        number: 2,
        direction: "down",
        clue: "Pahlawan emansipasi wanita pelopor 'Habis Gelap Terbitlah Terang'",
        answer: "KARTINI",
        row: 0,
        col: 3
      },
      {
        number: 3,
        direction: "across",
        clue: "Mendobrak atau menerobos pertahanan musuh dengan berani",
        answer: "DOBRAK",
        row: 2,
        col: 0
      },
      {
        number: 4,
        direction: "down",
        clue: "Daerah permukiman yang menjadi pusat pemerintahan & ekonomi",
        answer: "KOTA",
        row: 2,
        col: 5
      },
      {
        number: 5,
        direction: "across",
        clue: "Alat komunikasi nirkabel pemancar siaran berita perjuangan",
        answer: "RADIO",
        row: 4,
        col: 0
      },
      {
        number: 6,
        direction: "across",
        clue: "Tindakan nyata atau pergerakan perjuangan merebut kemerdekaan",
        answer: "AKSI",
        row: 6,
        col: 0
      },
      {
        number: 7,
        direction: "down",
        clue: "Mata air subur di tengah gurun / lambang kesegaran",
        answer: "OASIS",
        row: 0,
        col: 7
      },
      {
        number: 8,
        direction: "across",
        clue: "Wilayah kesatuan berdaulat dengan rakyat dan pemerintah resmi",
        answer: "NEGARA",
        row: 7,
        col: 0
      },
      {
        number: 9,
        direction: "across",
        clue: "Gagasan atau pandangan pendapat pribadi terhadap suatu isu",
        answer: "OPINI",
        row: 3,
        col: 5
      }
    ]
  },

  // 6. Benda, Perkakas & Alat Sehari-hari
  {
    id: "benda-perkakas",
    title: "Benda, Perkakas & Alat Sehari-hari",
    difficulty: "Mudah",
    category: "Benda & Peralatan",
    description: "Kenali berbagai peralatan rumah, alat navigasi, optik, dan instrumen.",
    icon: "package",
    rows: 10,
    cols: 10,
    words: [
      {
        number: 1,
        direction: "across",
        clue: "Alat fotografi untuk mengabadikan momen visual dan video",
        answer: "KAMERA",
        row: 0,
        col: 0
      },
      {
        number: 1,
        direction: "down",
        clue: "Lembaran tipis dari bubur serat kayu untuk media tulis",
        answer: "KERTAS",
        row: 0,
        col: 0
      },
      {
        number: 2,
        direction: "down",
        clue: "Wadah silinder bertangkai untuk menampung air",
        answer: "EMBER",
        row: 0,
        col: 3
      },
      {
        number: 3,
        direction: "down",
        clue: "Perkakas atau perabot perlengkapan kerja",
        answer: "ALAT",
        row: 0,
        col: 5
      },
      {
        number: 4,
        direction: "across",
        clue: "Hutan lebat belantara alami tempat aneka flora dan fauna",
        answer: "RIMBA",
        row: 2,
        col: 0
      },
      {
        number: 5,
        direction: "across",
        clue: "Benda bundar berporos pada kendaraan agar dapat menggelinding",
        answer: "RODA",
        row: 4,
        col: 3
      },
      {
        number: 6,
        direction: "down",
        clue: "Alat penunjuk waktu berjarum detik, menit, dan jam (Jam tangan)",
        answer: "ARLOJI",
        row: 4,
        col: 6
      },
      {
        number: 7,
        direction: "across",
        clue: "Alat makan cekung bertangkai untuk menyendok nasi atau kuah",
        answer: "SENDOK",
        row: 5,
        col: 0
      },
      {
        number: 8,
        direction: "across",
        clue: "Kawat tembaga berisolator penghantar arus listrik",
        answer: "KABEL",
        row: 6,
        col: 2
      }
    ]
  },

  // 7. Dunia Teknologi & Komputer
  {
    id: "teknologi-sains",
    title: "Dunia Teknologi & Komputer",
    difficulty: "Sedang",
    category: "Teknologi & Sains",
    description: "Uji wawasan Anda tentang pemrograman, internet, dan ilmu komputer.",
    icon: "cpu",
    rows: 10,
    cols: 10,
    words: [
      {
        number: 1,
        direction: "across",
        clue: "Mesin otomatis cerdas yang dapat menjalankan tugas terprogram",
        answer: "ROBOT",
        row: 0,
        col: 1
      },
      {
        number: 1,
        direction: "down",
        clue: "Metode pengembangan aplikasi kilat (Rapid Application Development)",
        answer: "RAD",
        row: 0,
        col: 1
      },
      {
        number: 2,
        direction: "down",
        clue: "Satuan unit data digital memori yang terdiri dari 8 bit",
        answer: "BYTE",
        row: 0,
        col: 3
      },
      {
        number: 3,
        direction: "across",
        clue: "Kumpulan fakta atau informasi mentah digital dalam database",
        answer: "DATA",
        row: 2,
        col: 1
      },
      {
        number: 4,
        direction: "across",
        clue: "Surat elektronik pengirim pesan dan berkas melalui internet",
        answer: "EMAIL",
        row: 3,
        col: 3
      },
      {
        number: 5,
        direction: "across",
        clue: "Status kondisi terbuka atau dapat diakses publik",
        answer: "OPEN",
        row: 0,
        col: 6
      },
      {
        number: 6,
        direction: "down",
        clue: "Status tersambung langsung ke jaringan daring / internet",
        answer: "ONLINE",
        row: 0,
        col: 6
      },
      {
        number: 7,
        direction: "across",
        clue: "Pengguna atau pemakai suatu sistem operasi maupun aplikasi",
        answer: "USER",
        row: 5,
        col: 4
      },
      {
        number: 8,
        direction: "down",
        clue: "Framework PHP populer dengan sintaks elegan untuk web modern",
        answer: "LARAVEL",
        row: 3,
        col: 7
      },
      {
        number: 9,
        direction: "across",
        clue: "Bahasa pemrograman berlogo cangkir kopi (Berorientasi Objek)",
        answer: "JAVA",
        row: 7,
        col: 5
      }
    ]
  },

  // 8. Jelajah Alam & Geografi Dunia
  {
    id: "geografi-dunia",
    title: "Jelajah Alam & Geografi Dunia",
    difficulty: "Sedang",
    category: "Geografi & Alam",
    description: "Tantangan seputar benua, samudra, ibukota, dan keajaiban alam bumi.",
    icon: "globe",
    rows: 10,
    cols: 10,
    words: [
      {
        number: 1,
        direction: "across",
        clue: "Samudra terluas dan terdalam di muka bumi",
        answer: "PASIFIK",
        row: 0,
        col: 0
      },
      {
        number: 1,
        direction: "down",
        clue: "Negara Amerika Tengah yang terkenal dengan terusan kapal",
        answer: "PANAMA",
        row: 0,
        col: 0
      },
      {
        number: 2,
        direction: "down",
        clue: "Gurun pasir terluas dan terpanas di kawasan Afrika Utara",
        answer: "SAHARA",
        row: 0,
        col: 2
      },
      {
        number: 3,
        direction: "across",
        clue: "Kawasan jazirah di Timur Tengah tempat Mekkah dan Madinah berada",
        answer: "ARAB",
        row: 3,
        col: 0
      },
      {
        number: 4,
        direction: "down",
        clue: "Titik poros ujung bumi yang diselimuti lapisan es abadi",
        answer: "KUTUB",
        row: 0,
        col: 6
      },
      {
        number: 5,
        direction: "across",
        clue: "Pusat permukiman dan kegiatan administrasi masyarakat",
        answer: "KOTA",
        row: 2,
        col: 4
      },
      {
        number: 6,
        direction: "down",
        clue: "Pegunungan megah bersalju yang membentang di Eropa Tengah",
        answer: "ALPEN",
        row: 2,
        col: 7
      },
      {
        number: 7,
        direction: "across",
        clue: "Hutan hujan tropis terbesar di dunia di lembah Amerika Selatan",
        answer: "AMAZON",
        row: 5,
        col: 0
      },
      {
        number: 8,
        direction: "down",
        clue: "Sungai terpanjang di benua Afrika yang mengalir melintasi Mesir",
        answer: "NIL",
        row: 5,
        col: 5
      },
      {
        number: 9,
        direction: "across",
        clue: "Partikel atom atau molekul yang memiliki muatan listrik",
        answer: "ION",
        row: 6,
        col: 5
      }
    ]
  },

  // 9. Misteri Tata Surya & Antariksa
  {
    id: "antariksa-kosmos",
    title: "Misteri Tata Surya & Antariksa",
    difficulty: "Tantangan",
    category: "Sains & Astronomi",
    description: "Eksplorasi bintang, planet, gravitasi, dan astronomi kosmik.",
    icon: "rocket",
    rows: 10,
    cols: 11,
    words: [
      {
        number: 1,
        direction: "across",
        clue: "Bintang induk pusat tata surya yang memancarkan cahaya dan panas",
        answer: "MATAHARI",
        row: 0,
        col: 0
      },
      {
        number: 1,
        direction: "down",
        clue: "Planet keempat terdekat dari matahari yang dijuluki Planet Merah",
        answer: "MARS",
        row: 0,
        col: 0
      },
      {
        number: 2,
        direction: "down",
        clue: "Satelit alami terbesar dari planet Saturnus yang memiliki atmosfer",
        answer: "TITAN",
        row: 0,
        col: 2
      },
      {
        number: 3,
        direction: "across",
        clue: "Jalur lintasan perjalanan yang ditempuh roket wahana antariksa",
        answer: "RUTE",
        row: 2,
        col: 0
      },
      {
        number: 4,
        direction: "across",
        clue: "Benda langit berbatu di sabuk antara planet Mars dan Jupiter",
        answer: "ASTEROID",
        row: 3,
        col: 2
      },
      {
        number: 5,
        direction: "down",
        clue: "Sebutan bahasa Inggris untuk satelit alami bumi (Bulan)",
        answer: "MOON",
        row: 1,
        col: 7
      },
      {
        number: 6,
        direction: "across",
        clue: "Ledakan bintang yang mendadak memancarkan energi dahsyat",
        answer: "NOVA",
        row: 4,
        col: 7
      },
      {
        number: 7,
        direction: "down",
        clue: "Kemunculan matahari atau benda langit di atas ufuk timur saat fajar",
        answer: "TERBIT",
        row: 3,
        col: 4
      },
      {
        number: 8,
        direction: "across",
        clue: "Gumpalan uap air atau partikel debu kosmik menyerupai awan",
        answer: "KABUT",
        row: 6,
        col: 2
      },
      {
        number: 9,
        direction: "down",
        clue: "Awalan satuan ukuran triliun dalam sistem metrik dan komputasi (10^12)",
        answer: "TERA",
        row: 6,
        col: 6
      },
      {
        number: 10,
        direction: "across",
        clue: "Planet gas raksasa bercincin es paling spektakuler di tata surya",
        answer: "SATURNUS",
        row: 8,
        col: 2
      }
    ]
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PUZZLE_DATA };
}
