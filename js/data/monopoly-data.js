/**
 * MONOPOLI NUSANTARA & DUNIA PRO - MASTER DATA & CONFIGURATIONS
 * Berisi konfigurasi 2 Peta:
 * 1. Peta Nusantara (40 Petak Indonesia)
 * 2. Peta Dunia Global Raksasa (52 Petak Kota & Negara Internasional)
 * Dilengkapi foto landmark HD di setiap petak, 8+ kemampuan karakter, kartu kejutan, dan event ekonomi.
 */

// =============================================================================
// 1. PETA NUSANTARA (40 PETAK)
// =============================================================================
const MONOPOLY_GROUPS_NUSANTARA = {
  BROWN: { id: 'BROWN', name: 'DKI Jakarta', color: '#78350f', bg: 'bg-amber-900', border: 'border-amber-900', houseCost: 500000 },
  CYAN: { id: 'CYAN', name: 'Jawa Barat', color: '#06b6d4', bg: 'bg-cyan-500', border: 'border-cyan-500', houseCost: 500000 },
  PINK: { id: 'PINK', name: 'D.I. Yogyakarta', color: '#ec4899', bg: 'bg-pink-500', border: 'border-pink-500', houseCost: 1000000 },
  ORANGE: { id: 'ORANGE', name: 'Jawa Timur', color: '#f97316', bg: 'bg-orange-500', border: 'border-orange-500', houseCost: 1000000 },
  RED: { id: 'RED', name: 'Sumatra', color: '#ef4444', bg: 'bg-red-500', border: 'border-red-500', houseCost: 1500000 },
  YELLOW: { id: 'YELLOW', name: 'Bali', color: '#eab308', bg: 'bg-yellow-500', border: 'border-yellow-500', houseCost: 1500000 },
  GREEN: { id: 'GREEN', name: 'Nusa Tenggara', color: '#10b981', bg: 'bg-emerald-500', border: 'border-emerald-500', houseCost: 2000000 },
  BLUE: { id: 'BLUE', name: 'Papua & Sulawesi', color: '#3b82f6', bg: 'bg-blue-600', border: 'border-blue-600', houseCost: 2000000 },
  STATION: { id: 'STATION', name: 'Stasiun Kereta', color: '#475569', bg: 'bg-slate-600', border: 'border-slate-600', houseCost: 0 },
  UTILITY: { id: 'UTILITY', name: 'Utilitas Publik', color: '#64748b', bg: 'bg-slate-500', border: 'border-slate-500', houseCost: 0 },
  SPECIAL: { id: 'SPECIAL', name: 'Petak Khusus', color: '#0f172a', bg: 'bg-slate-900', border: 'border-slate-900', houseCost: 0 }
};

const MONOPOLY_TILES_NUSANTARA = [
  { id: 0, name: 'MULAI (GO)', type: 'special', group: 'SPECIAL', subtitle: 'Bonus Rp 2.000.000', icon: 'flag', image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=400&q=80' },
  { 
    id: 1, name: 'Kota Tua', type: 'property', group: 'BROWN', price: 600000, 
    rent: [20000, 100000, 300000, 900000, 1600000, 2500000], city: 'Jakarta',
    image: 'https://images.unsplash.com/photo-1555899434-94d1368aa7af?w=400&q=80',
    desc: 'Kawasan bersejarah peninggalan Batavia dengan Museum Fatahillah.'
  },
  { id: 2, name: 'Dana Umum', type: 'chest', group: 'SPECIAL', icon: 'wallet', image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&q=80' },
  { 
    id: 3, name: 'Monas', type: 'property', group: 'BROWN', price: 600000, 
    rent: [40000, 200000, 600000, 1800000, 3200000, 4500000], city: 'Jakarta',
    image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=400&q=80',
    desc: 'Monumen Nasional lambang perjuangan dengan puncak lidah api emas.'
  },
  { id: 4, name: 'Pajak Penghasilan', type: 'tax', group: 'SPECIAL', taxAmount: 2000000, icon: 'receipt', image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80' },
  { 
    id: 5, name: 'Stasiun Gambir', type: 'station', group: 'STATION', price: 2000000, 
    rent: [250000, 500000, 1000000, 2000000], icon: 'train',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80',
    desc: 'Pintu gerbang kereta eksekutif terkemuka di pusat ibukota.'
  },
  { 
    id: 6, name: 'Kawah Putih', type: 'property', group: 'CYAN', price: 1000000, 
    rent: [60000, 300000, 900000, 2700000, 4000000, 5500000], city: 'Bandung',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&q=80',
    desc: 'Danau kawah vulkanik putih kehijauan yang eksotis di Ciwidey.'
  },
  { id: 7, name: 'Kesempatan', type: 'chance', group: 'SPECIAL', icon: 'help-circle', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80' },
  { 
    id: 8, name: 'Tangkuban Perahu', type: 'property', group: 'CYAN', price: 1000000, 
    rent: [60000, 300000, 900000, 2700000, 4000000, 5500000], city: 'Bandung',
    image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&q=80',
    desc: 'Gunung berapi legendaris Sangkuriang dengan kawah megah.'
  },
  { 
    id: 9, name: 'Gedung Sate', type: 'property', group: 'CYAN', price: 1200000, 
    rent: [80000, 400000, 1000000, 3000000, 4500000, 6000000], city: 'Bandung',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80',
    desc: 'Ikon arsitektur neo-klasik dan pusat pemerintahan Jawa Barat.'
  },
  { id: 10, name: 'Penjara', type: 'special', group: 'SPECIAL', subtitle: 'Kunjungan / Ditahan', icon: 'shield-alert', image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&q=80' },
  { 
    id: 11, name: 'Malioboro', type: 'property', group: 'PINK', price: 1400000, 
    rent: [100000, 500000, 1500000, 4500000, 6250000, 7500000], city: 'Yogyakarta',
    image: 'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?w=400&q=80',
    desc: 'Jantung wisata belanja, musisi jalanan, dan kuliner khas kota budaya.'
  },
  { id: 12, name: 'PLN Persero', type: 'utility', group: 'UTILITY', price: 1500000, icon: 'zap', image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&q=80', desc: 'Pembangkit listrik nasional.' },
  { 
    id: 13, name: 'Candi Prambanan', type: 'property', group: 'PINK', price: 1400000, 
    rent: [100000, 500000, 1500000, 4500000, 6250000, 7500000], city: 'Yogyakarta',
    image: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?w=400&q=80',
    desc: 'Kompleks candi Hindu terindah dan termegah di Asia Tenggara.'
  },
  { 
    id: 14, name: 'Candi Borobudur', type: 'property', group: 'PINK', price: 1600000, 
    rent: [120000, 600000, 1800000, 5000000, 7000000, 9000000], city: 'Magelang',
    image: 'https://images.unsplash.com/photo-1598890777032-bde835ba27c2?w=400&q=80',
    desc: 'Mahakarya candi Buddha terbesar di dunia Dinasti Syailendra.'
  },
  { 
    id: 15, name: 'Stasiun Bandung', type: 'station', group: 'STATION', price: 2000000, 
    rent: [250000, 500000, 1000000, 2000000], icon: 'train',
    image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400&q=80',
    desc: 'Stasiun bersejarah penghubung jalur pegunungan Priangan.'
  },
  { 
    id: 16, name: 'Tugu Pahlawan', type: 'property', group: 'ORANGE', price: 1800000, 
    rent: [140000, 700000, 2000000, 5500000, 7500000, 9500000], city: 'Surabaya',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&q=80',
    desc: 'Monumen keberanian arek-arek Suroboyo 10 November.'
  },
  { id: 17, name: 'Dana Umum', type: 'chest', group: 'SPECIAL', icon: 'wallet', image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&q=80' },
  { 
    id: 18, name: 'Jembatan Suramadu', type: 'property', group: 'ORANGE', price: 1800000, 
    rent: [140000, 700000, 2000000, 5500000, 7500000, 9500000], city: 'Surabaya',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&q=80',
    desc: 'Jembatan gantung terpanjang penghubung Jawa dan Madura.'
  },
  { 
    id: 19, name: 'Gunung Bromo', type: 'property', group: 'ORANGE', price: 2000000, 
    rent: [160000, 800000, 2200000, 6000000, 8000000, 10000000], city: 'Jawa Timur',
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=400&q=80',
    desc: 'Lautan pasir berbisik dan matahari terbit spektakuler.'
  },
  { id: 20, name: 'Parkir Gratis', type: 'special', group: 'SPECIAL', subtitle: 'Istirahat Santai', icon: 'car', image: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400&q=80' },
  { 
    id: 21, name: 'Danau Toba', type: 'property', group: 'RED', price: 2200000, 
    rent: [180000, 900000, 2500000, 7000000, 8750000, 10500000], city: 'Sumatra Utara',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
    desc: 'Danau vulkanik terbesar di dunia dengan Pulau Samosir.'
  },
  { id: 22, name: 'Kesempatan', type: 'chance', group: 'SPECIAL', icon: 'help-circle', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80' },
  { 
    id: 23, name: 'Jam Gadang', type: 'property', group: 'RED', price: 2200000, 
    rent: [180000, 900000, 2500000, 7000000, 8750000, 10500000], city: 'Bukittinggi',
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400&q=80',
    desc: 'Menara jam ikonik ranah Minang bermesin langka Jerman.'
  },
  { 
    id: 24, name: 'Jembatan Ampera', type: 'property', group: 'RED', price: 2400000, 
    rent: [200000, 1000000, 3000000, 7500000, 9250000, 11000000], city: 'Palembang',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&q=80',
    desc: 'Ikon megah kota Palembang yang melintasi Sungai Musi.'
  },
  { 
    id: 25, name: 'Stasiun Gubeng', type: 'station', group: 'STATION', price: 2000000, 
    rent: [250000, 500000, 1000000, 2000000], icon: 'train',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80',
    desc: 'Stasiun kereta terbesar lintas timur pulau Jawa.'
  },
  { 
    id: 26, name: 'Tanah Lot', type: 'property', group: 'YELLOW', price: 2600000, 
    rent: [220000, 1100000, 3300000, 8000000, 9750000, 11500000], city: 'Bali',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80',
    desc: 'Pura sakral di atas batu karang dengan panorama sunset magis.'
  },
  { 
    id: 27, name: 'Pantai Kuta', type: 'property', group: 'YELLOW', price: 2600000, 
    rent: [220000, 1100000, 3300000, 8000000, 9750000, 11500000], city: 'Bali',
    image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400&q=80',
    desc: 'Garis pantai pasir putih surgawi para peselancar dunia.'
  },
  { id: 28, name: 'PDAM Tirta', type: 'utility', group: 'UTILITY', price: 1500000, icon: 'droplet', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80', desc: 'Penyedia air bersih nusantara.' },
  { 
    id: 29, name: 'Ubud Heritage', type: 'property', group: 'YELLOW', price: 2800000, 
    rent: [240000, 1200000, 3600000, 8500000, 10250000, 12000000], city: 'Bali',
    image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&q=80',
    desc: 'Pusat ketenangan spiritual, galeri seni, dan sawah Tegalalang.'
  },
  { id: 30, name: 'Masuk Penjara!', type: 'special', group: 'SPECIAL', subtitle: 'Menuju Petak 10', icon: 'gavel', image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&q=80' },
  { 
    id: 31, name: 'Danau Kelimutu', type: 'property', group: 'GREEN', price: 3000000, 
    rent: [260000, 1300000, 3900000, 9000000, 11000000, 12750000], city: 'Flores',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&q=80',
    desc: 'Danau kawah tiga warna misterius yang dapat berubah di puncak gunung.'
  },
  { 
    id: 32, name: 'Labuan Bajo', type: 'property', group: 'GREEN', price: 3000000, 
    rent: [260000, 1300000, 3900000, 9000000, 11000000, 12750000], city: 'NTT',
    image: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=400&q=80',
    desc: 'Pintu gerbang pulau komodo dan panorama spektakuler Pulau Padar.'
  },
  { id: 33, name: 'Dana Umum', type: 'chest', group: 'SPECIAL', icon: 'wallet', image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&q=80' },
  { 
    id: 34, name: 'Pulau Komodo', type: 'property', group: 'GREEN', price: 3200000, 
    rent: [280000, 1500000, 4500000, 10000000, 12000000, 14000000], city: 'NTT',
    image: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?w=400&q=80',
    desc: 'Habitat asli kadal purba raksasa purba satu-satunya di dunia.'
  },
  { 
    id: 35, name: 'Stasiun Medan', type: 'station', group: 'STATION', price: 2000000, 
    rent: [250000, 500000, 1000000, 2000000], icon: 'train',
    image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400&q=80',
    desc: 'Stasiun terintegrasi kereta bandara modern pertama di Indonesia.'
  },
  { id: 36, name: 'Kesempatan', type: 'chance', group: 'SPECIAL', icon: 'help-circle', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80' },
  { 
    id: 37, name: 'Taman Bunaken', type: 'property', group: 'BLUE', price: 3500000, 
    rent: [350000, 1750000, 5000000, 11000000, 13000000, 15000000], city: 'Manado',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80',
    desc: 'Taman laut dengan dinding karang raksasa dan biota laut terlengkap.'
  },
  { id: 38, name: 'Pajak Barang Mewah', type: 'tax', group: 'SPECIAL', taxAmount: 1000000, icon: 'gem', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80' },
  { 
    id: 39, name: 'Raja Ampat', type: 'property', group: 'BLUE', price: 4000000, 
    rent: [500000, 2000000, 6000000, 14000000, 17000000, 20000000], city: 'Papua Barat',
    image: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=400&q=80',
    desc: 'Gugusan pulau karang karst surgawi di ufuk timur nusantara.'
  }
];

// =============================================================================
// 2. PETA DUNIA GLOBAL RAKSASA (52 PETAK INTERNASIONAL)
// =============================================================================
const MONOPOLY_GROUPS_WORLD = {
  ASIA_EAST: { id: 'ASIA_EAST', name: 'Asia Timur (Jepang & Korea)', color: '#dc2626', bg: 'bg-red-600', border: 'border-red-600', houseCost: 1000000 },
  ASIA_SOUTHEAST: { id: 'ASIA_SOUTHEAST', name: 'Asia Tenggara (Singapura & Bangkok)', color: '#0d9488', bg: 'bg-teal-600', border: 'border-teal-600', houseCost: 1000000 },
  MIDDLE_EAST: { id: 'MIDDLE_EAST', name: 'Timur Tengah (Dubai & Riyadh)', color: '#d97706', bg: 'bg-amber-600', border: 'border-amber-600', houseCost: 1500000 },
  EUROPE_SOUTH: { id: 'EUROPE_SOUTH', name: 'Eropa Selatan (Roma & Madrid)', color: '#7c3aed', bg: 'bg-violet-600', border: 'border-violet-600', houseCost: 1500000 },
  EUROPE_WEST: { id: 'EUROPE_WEST', name: 'Eropa Barat (Paris & London)', color: '#2563eb', bg: 'bg-blue-600', border: 'border-blue-600', houseCost: 2000000 },
  EUROPE_NORTH: { id: 'EUROPE_NORTH', name: 'Eropa Utara (Berlin & Amsterdam)', color: '#059669', bg: 'bg-emerald-600', border: 'border-emerald-600', houseCost: 2000000 },
  NORTH_AMERICA_EAST: { id: 'NORTH_AMERICA_EAST', name: 'Amerika Timur (New York & Toronto)', color: '#4f46e5', bg: 'bg-indigo-600', border: 'border-indigo-600', houseCost: 2500000 },
  NORTH_AMERICA_WEST: { id: 'NORTH_AMERICA_WEST', name: 'Amerika Barat (Los Angeles & Vancouver)', color: '#ea580c', bg: 'bg-orange-600', border: 'border-orange-600', houseCost: 2500000 },
  OCEANIA: { id: 'OCEANIA', name: 'Oseania (Sydney & Melbourne)', color: '#0284c7', bg: 'bg-sky-600', border: 'border-sky-600', houseCost: 3000000 },
  LATIN_AFRICA: { id: 'LATIN_AFRICA', name: 'Amerika Latin & Afrika (Rio & Cairo)', color: '#9333ea', bg: 'bg-purple-600', border: 'border-purple-600', houseCost: 3000000 },
  WORLD_STATION: { id: 'WORLD_STATION', name: 'Bandara & Kereta Cepat Global', color: '#334155', bg: 'bg-slate-700', border: 'border-slate-700', houseCost: 0 },
  WORLD_UTILITY: { id: 'WORLD_UTILITY', name: 'Infrastruktur Satelit & Energi Global', color: '#475569', bg: 'bg-slate-600', border: 'border-slate-600', houseCost: 0 },
  SPECIAL: { id: 'SPECIAL', name: 'Petak Khusus Dunia', color: '#0f172a', bg: 'bg-slate-900', border: 'border-slate-900', houseCost: 0 }
};

const MONOPOLY_TILES_WORLD = [
  // 0: SUDUT MULAI DUNIA
  { id: 0, name: 'START GLOBAL', type: 'special', group: 'SPECIAL', subtitle: 'Bonus $ 3.000.000', icon: 'globe', image: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=400&q=80' },
  
  // 1-12: SISI BAWAH (ASIA TIMUR & TENGGARA)
  { 
    id: 1, name: 'Tokyo 🇯🇵', type: 'property', group: 'ASIA_EAST', price: 1200000, 
    rent: [80000, 400000, 1200000, 3600000, 5500000, 7500000], city: 'Jepang',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&q=80',
    desc: 'Metropolis megah Shibuya, Gunung Fuji, dan pusat teknologi dunia.'
  },
  { id: 2, name: 'Dana Dunia', type: 'chest', group: 'SPECIAL', icon: 'wallet', image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&q=80' },
  { 
    id: 3, name: 'Kyoto 🇯🇵', type: 'property', group: 'ASIA_EAST', price: 1200000, 
    rent: [80000, 400000, 1200000, 3600000, 5500000, 7500000], city: 'Jepang',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&q=80',
    desc: 'Kuil emas Kinkaku-ji, hutan bambu Arashiyama, dan budaya tradisional.'
  },
  { 
    id: 4, name: 'Seoul 🇰🇷', type: 'property', group: 'ASIA_EAST', price: 1400000, 
    rent: [100000, 500000, 1500000, 4500000, 6500000, 8500000], city: 'Korea Selatan',
    image: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=400&q=80',
    desc: 'Pusat K-Wave dunia, Istana Gyeongbokgung, dan kota kosmopolitan canggih.'
  },
  { id: 5, name: 'Pajak Impor Global', type: 'tax', group: 'SPECIAL', taxAmount: 2500000, icon: 'receipt', image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80' },
  { 
    id: 6, name: 'Shinkansen Express 🚄', type: 'station', group: 'WORLD_STATION', price: 2500000, 
    rent: [350000, 700000, 1400000, 2800000], icon: 'train',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80',
    desc: 'Kereta peluru berkecepatan 320 km/jam penghubung pulau Honshu.'
  },
  { 
    id: 7, name: 'Singapura 🇸🇬', type: 'property', group: 'ASIA_SOUTHEAST', price: 1600000, 
    rent: [120000, 600000, 1800000, 5000000, 7500000, 9500000], city: 'Singapura',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&q=80',
    desc: 'Marina Bay Sands, Gardens by the Bay, dan pusat finansial Asia.'
  },
  { id: 8, name: 'Kesempatan Dunia', type: 'chance', group: 'SPECIAL', icon: 'help-circle', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80' },
  { 
    id: 9, name: 'Bangkok 🇹🇭', type: 'property', group: 'ASIA_SOUTHEAST', price: 1600000, 
    rent: [120000, 600000, 1800000, 5000000, 7500000, 9500000], city: 'Thailand',
    image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400&q=80',
    desc: 'Grand Palace, pasar terapung, dan surga kuliner jalanan malam hari.'
  },
  { 
    id: 10, name: 'Kuala Lumpur 🇲🇾', type: 'property', group: 'ASIA_SOUTHEAST', price: 1800000, 
    rent: [140000, 700000, 2000000, 5500000, 8000000, 10000000], city: 'Malaysia',
    image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&q=80',
    desc: 'Menara Kembar Petronas kembar tertinggi di dunia dan Batu Caves.'
  },
  { id: 11, name: 'Satelit Starlink 🛰️', type: 'utility', group: 'WORLD_UTILITY', price: 2000000, icon: 'wifi', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80', desc: 'Jaringan konstelasi internet satelit orbit rendah bumi.' },
  { 
    id: 12, name: 'Jakarta 🇮🇩', type: 'property', group: 'ASIA_SOUTHEAST', price: 1800000, 
    rent: [140000, 700000, 2000000, 5500000, 8000000, 10000000], city: 'Indonesia',
    image: 'https://images.unsplash.com/photo-1555899434-94d1368aa7af?w=400&q=80',
    desc: 'Jantung ekonomi terbesar Asia Tenggara dengan monumen kebangsaan.'
  },

  // 13: SUDUT PENJARA INTERPOL
  { id: 13, name: 'Penjara INTERPOL', type: 'special', group: 'SPECIAL', subtitle: 'Penahanan Internasional', icon: 'shield-alert', image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&q=80' },

  // 14-25: SISI KIRI (TIMUR TENGAH & EROPA SELATAN)
  { 
    id: 14, name: 'Dubai 🇦🇪', type: 'property', group: 'MIDDLE_EAST', price: 2200000, 
    rent: [180000, 900000, 2500000, 7000000, 9500000, 12000000], city: 'Uni Emirat Arab',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80',
    desc: 'Burj Khalifa gedung tertinggi di dunia, Palm Jumeirah, dan pulau buatan mewah.'
  },
  { 
    id: 15, name: 'Doha 🇶🇦', type: 'property', group: 'MIDDLE_EAST', price: 2200000, 
    rent: [180000, 900000, 2500000, 7000000, 9500000, 12000000], city: 'Qatar',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&q=80',
    desc: 'Museum Seni Islam, arsitektur futuristik tepi teluk mutiara.'
  },
  { id: 16, name: 'Dana Dunia', type: 'chest', group: 'SPECIAL', icon: 'wallet', image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&q=80' },
  { 
    id: 17, name: 'Riyadh 🇸🇦', type: 'property', group: 'MIDDLE_EAST', price: 2400000, 
    rent: [200000, 1000000, 2800000, 7500000, 10000000, 13000000], city: 'Arab Saudi',
    image: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=400&q=80',
    desc: 'Kingdom Centre, mega proyek Neom, dan jantung jazirah Arab.'
  },
  { 
    id: 18, name: 'Eurostar Express 🚆', type: 'station', group: 'WORLD_STATION', price: 2500000, 
    rent: [350000, 700000, 1400000, 2800000], icon: 'train',
    image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400&q=80',
    desc: 'Kereta cepat lintas terowongan bawah laut Selat Channel Inggris-Prancis.'
  },
  { 
    id: 19, name: 'Roma 🇮🇹', type: 'property', group: 'EUROPE_SOUTH', price: 2600000, 
    rent: [220000, 1100000, 3200000, 8000000, 11000000, 14000000], city: 'Italia',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=80',
    desc: 'Colosseum megah, Basilika Santo Petrus Vatikan, dan peradaban Romawi kuno.'
  },
  { id: 20, name: 'Kesempatan Dunia', type: 'chance', group: 'SPECIAL', icon: 'help-circle', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80' },
  { 
    id: 21, name: 'Venesia 🇮🇹', type: 'property', group: 'EUROPE_SOUTH', price: 2600000, 
    rent: [220000, 1100000, 3200000, 8000000, 11000000, 14000000], city: 'Italia',
    image: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=400&q=80',
    desc: 'Kota kanal terapung romantis di atas air dengan perahu Gondola.'
  },
  { 
    id: 22, name: 'Madrid 🇪🇸', type: 'property', group: 'EUROPE_SOUTH', price: 2800000, 
    rent: [240000, 1200000, 3500000, 8500000, 11500000, 15000000], city: 'Spanyol',
    image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&q=80',
    desc: 'Istana Kerajaan Palacio Real, Plaza Mayor, dan museum seni Prado.'
  },
  { id: 23, name: 'Reaktor Fusi Termal ⚛️', type: 'utility', group: 'WORLD_UTILITY', price: 2000000, icon: 'zap', image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&q=80', desc: 'Pembangkit energi bersih masa depan dunia.' },
  { 
    id: 24, name: 'Barcelona 🇪🇸', type: 'property', group: 'EUROPE_SOUTH', price: 2800000, 
    rent: [240000, 1200000, 3500000, 8500000, 11500000, 15000000], city: 'Spanyol',
    image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&q=80',
    desc: 'Mahakarya Katedral Sagrada Familia Antoni Gaudi dan pantai Mediterania.'
  },
  { 
    id: 25, name: 'Athena 🇬🇷', type: 'property', group: 'EUROPE_SOUTH', price: 3000000, 
    rent: [260000, 1300000, 3800000, 9000000, 12000000, 16000000], city: 'Yunani',
    image: 'https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?w=600&q=80',
    desc: 'Kuil Parthenon di puncak Acropolis warisan lahirnya demokrasi.'
  },

  // 26: SUDUT PARKIR BEBAS INTERNASIONAL
  { id: 26, name: 'Bandara Bebas Pajak', type: 'special', group: 'SPECIAL', subtitle: 'Transit Internasional', icon: 'plane', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80' },

  // 27-38: SISI ATAS (EROPA BARAT & UTARA)
  { 
    id: 27, name: 'Paris 🇫🇷', type: 'property', group: 'EUROPE_WEST', price: 3200000, 
    rent: [280000, 1400000, 4000000, 9500000, 13000000, 17000000], city: 'Prancis',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80',
    desc: 'Menara Eiffel, Museum Louvre dengan lukisan Mona Lisa, dan Champs-Élysées.'
  },
  { id: 28, name: 'Dana Dunia', type: 'chest', group: 'SPECIAL', icon: 'wallet', image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&q=80' },
  { 
    id: 29, name: 'Nice 🇫🇷', type: 'property', group: 'EUROPE_WEST', price: 3200000, 
    rent: [280000, 1400000, 4000000, 9500000, 13000000, 17000000], city: 'Prancis',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400&q=80',
    desc: 'Kemewahan pesisir pantai biru French Riviera (Côte d Azur).'
  },
  { 
    id: 30, name: 'London 🇬🇧', type: 'property', group: 'EUROPE_WEST', price: 3400000, 
    rent: [300000, 1500000, 4300000, 10000000, 14000000, 18000000], city: 'Inggris',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&q=80',
    desc: 'Big Ben, Jembatan Tower Bridge, Istana Buckingham, dan Sungai Thames.'
  },
  { 
    id: 31, name: 'Orient Express 🚂', type: 'station', group: 'WORLD_STATION', price: 2500000, 
    rent: [350000, 700000, 1400000, 2800000], icon: 'train',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80',
    desc: 'Kereta penumpang mewah legendaris rute Paris melintasi benua hingga Istanbul.'
  },
  { 
    id: 32, name: 'Edinburgh 🏴󠁧󠁢󠁳󠁣󠁴󠁿', type: 'property', group: 'EUROPE_WEST', price: 3400000, 
    rent: [300000, 1500000, 4300000, 10000000, 14000000, 18000000], city: 'Skotlandia',
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&q=80',
    desc: 'Kastil megah abad pertengahan di atas tebing batu vulkanik kuno.'
  },
  { id: 33, name: 'Kesempatan Dunia', type: 'chance', group: 'SPECIAL', icon: 'help-circle', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80' },
  { 
    id: 34, name: 'Amsterdam 🇳🇱', type: 'property', group: 'EUROPE_NORTH', price: 3600000, 
    rent: [320000, 1600000, 4600000, 10500000, 15000000, 19000000], city: 'Belanda',
    image: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=400&q=80',
    desc: 'Kanal kota bertabur sepeda, kincir angin Zaanse Schans, dan kebun tulip.'
  },
  { 
    id: 35, name: 'Berlin 🇩🇪', type: 'property', group: 'EUROPE_NORTH', price: 3600000, 
    rent: [320000, 1600000, 4600000, 10500000, 15000000, 19000000], city: 'Jerman',
    image: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=400&q=80',
    desc: 'Gerbang Brandenburg, Tembok Berlin bersejarah, dan pusat teknologi Eropa.'
  },
  { id: 36, name: 'Desalinasi Air Laut Global 🌊', type: 'utility', group: 'WORLD_UTILITY', price: 2000000, icon: 'droplet', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80', desc: 'Instalasi pemurnian air tawar skala benua.' },
  { 
    id: 37, name: 'Zurich 🇨🇭', type: 'property', group: 'EUROPE_NORTH', price: 3800000, 
    rent: [350000, 1750000, 5000000, 11000000, 16000000, 20000000], city: 'Swiss',
    image: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=400&q=80',
    desc: 'Pegunungan Alpen salju abadi dan pusat perbankan paling aman di dunia.'
  },
  { 
    id: 38, name: 'Stockholm 🇸🇪', type: 'property', group: 'EUROPE_NORTH', price: 3800000, 
    rent: [350000, 1750000, 5000000, 11000000, 16000000, 20000000], city: 'Swedia',
    image: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=400&q=80',
    desc: 'Ibukota Skandinavia kota 14 pulau tempat penganugerahan Nobel.'
  },

  // 39: SUDUT MASUK PENJARA DUNIA
  { id: 39, name: 'Buronan INTERPOL!', type: 'special', group: 'SPECIAL', subtitle: 'Langsung ke Petak 13', icon: 'gavel', image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&q=80' },

  // 40-51: SISI KANAN (AMERIKA & OSEANIA)
  { 
    id: 40, name: 'New York 🇺🇸', type: 'property', group: 'NORTH_AMERICA_EAST', price: 4000000, 
    rent: [400000, 2000000, 6000000, 13000000, 18000000, 23000000], city: 'Amerika Serikat',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80',
    desc: 'Patung Liberty, Times Square gemerlap, Wall Street, dan Central Park.'
  },
  { 
    id: 41, name: 'Toronto 🇨🇦', type: 'property', group: 'NORTH_AMERICA_EAST', price: 4000000, 
    rent: [400000, 2000000, 6000000, 13000000, 18000000, 23000000], city: 'Kanada',
    image: 'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=400&q=80',
    desc: 'Menara CN Tower raksasa, Air Terjun Niagara, dan pusat multikultural.'
  },
  { id: 42, name: 'Dana Dunia', type: 'chest', group: 'SPECIAL', icon: 'wallet', image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&q=80' },
  { 
    id: 43, name: 'Los Angeles 🇺🇸', type: 'property', group: 'NORTH_AMERICA_WEST', price: 4200000, 
    rent: [450000, 2200000, 6500000, 14000000, 19000000, 25000000], city: 'Amerika Serikat',
    image: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=400&q=80',
    desc: 'Papan ikonik Hollywood, Beverly Hills glamor, dan Pantai Santa Monica.'
  },
  { 
    id: 44, name: 'Trans-Siberian 🚂', type: 'station', group: 'WORLD_STATION', price: 2500000, 
    rent: [350000, 700000, 1400000, 2800000], icon: 'train',
    image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400&q=80',
    desc: 'Jalur rel kereta api terpanjang di dunia membentang dari Moskow hingga Vladivostok.'
  },
  { 
    id: 45, name: 'Vancouver 🇨🇦', type: 'property', group: 'NORTH_AMERICA_WEST', price: 4200000, 
    rent: [450000, 2200000, 6500000, 14000000, 19000000, 25000000], city: 'Kanada',
    image: 'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?w=600&q=80',
    desc: 'Perpaduan megah pegunungan salju dan pelabuhan Samudra Pasifik.'
  },
  { id: 46, name: 'Kesempatan Dunia', type: 'chance', group: 'SPECIAL', icon: 'help-circle', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80' },
  { 
    id: 47, name: 'Sydney 🇦🇺', type: 'property', group: 'OCEANIA', price: 4500000, 
    rent: [500000, 2500000, 7500000, 16000000, 21000000, 27000000], city: 'Australia',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&q=80',
    desc: 'Sydney Opera House mahakarya arsitektur dunia dan Jembatan Harbour.'
  },
  { 
    id: 48, name: 'Melbourne 🇦🇺', type: 'property', group: 'OCEANIA', price: 4500000, 
    rent: [500000, 2500000, 7500000, 16000000, 21000000, 27000000], city: 'Australia',
    image: 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=400&q=80',
    desc: 'Pusat seni lorong mural grafiti, kopi terbaik, dan sirkuit F1 Albert Park.'
  },
  { id: 49, name: 'Pajak Konglomerat Dunia', type: 'tax', group: 'SPECIAL', taxAmount: 3000000, icon: 'gem', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80' },
  { 
    id: 50, name: 'Rio de Janeiro 🇧🇷', type: 'property', group: 'LATIN_AFRICA', price: 4800000, 
    rent: [550000, 2750000, 8000000, 17000000, 23000000, 30000000], city: 'Brasil',
    image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=400&q=80',
    desc: 'Patung Raksasa Kristus Penebus (Christ the Redeemer) dan Pantai Copacabana.'
  },
  { 
    id: 51, name: 'Kairo 🇪🇬', type: 'property', group: 'LATIN_AFRICA', price: 5000000, 
    rent: [600000, 3000000, 9000000, 19000000, 25000000, 35000000], city: 'Mesir',
    image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=400&q=80',
    desc: 'Piramida Agung Giza keajaiban dunia kuno dan patung legendaris Sphinx.'
  }
];

// =============================================================================
// 3. PETA METRO-GALACTIC ODYSSEY (64 PETAK RAKSASA NON-KOTAK / DIAMOND BELT)
// =============================================================================
const MONOPOLY_GROUPS_GALAXY = {
  SOLAR_INNER: { id: 'SOLAR_INNER', name: 'Koloni Tata Surya Dalam', color: '#f97316', bg: 'bg-orange-500', border: 'border-orange-500', houseCost: 1000000 },
  ASTEROID_BELT: { id: 'ASTEROID_BELT', name: 'Sabuk Asteroid & Tambang', color: '#78716c', bg: 'bg-stone-500', border: 'border-stone-500', houseCost: 1000000 },
  JUPITER_MOONS: { id: 'JUPITER_MOONS', name: 'Bulan Raksasa Jupiter', color: '#eab308', bg: 'bg-yellow-500', border: 'border-yellow-500', houseCost: 1500000 },
  SATURN_RINGS: { id: 'SATURN_RINGS', name: 'Cincin & Koloni Saturnus', color: '#06b6d4', bg: 'bg-cyan-500', border: 'border-cyan-500', houseCost: 1500000 },
  URANUS_NEPTUNE: { id: 'URANUS_NEPTUNE', name: 'Kawasan Es Uranus & Neptunus', color: '#3b82f6', bg: 'bg-blue-500', border: 'border-blue-500', houseCost: 2000000 },
  KUIPER_BELT: { id: 'KUIPER_BELT', name: 'Frontier Sabuk Kuiper', color: '#6366f1', bg: 'bg-indigo-500', border: 'border-indigo-500', houseCost: 2000000 },
  EXO_WORLDS: { id: 'EXO_WORLDS', name: 'Eksoplanet Layak Huni', color: '#a855f7', bg: 'bg-purple-500', border: 'border-purple-500', houseCost: 2500000 },
  CYBER_METROPOLIS: { id: 'CYBER_METROPOLIS', name: 'Metropolis Siber Galaktik', color: '#ec4899', bg: 'bg-pink-500', border: 'border-pink-500', houseCost: 2500000 },
  NEBULA_ZONES: { id: 'NEBULA_ZONES', name: 'Kawasan Nebula Antarbintang', color: '#10b981', bg: 'bg-emerald-500', border: 'border-emerald-500', houseCost: 3000000 },
  ANCIENT_ALIEN: { id: 'ANCIENT_ALIEN', name: 'Situs Megastruktur Kuno', color: '#14b8a6', bg: 'bg-teal-500', border: 'border-teal-500', houseCost: 3500000 },
  WARP_STATION: { id: 'WARP_STATION', name: 'Gerbang Warp & Hyperdrive', color: '#334155', bg: 'bg-slate-700', border: 'border-slate-700', houseCost: 0 },
  COSMIC_UTILITY: { id: 'COSMIC_UTILITY', name: 'Energi Antimateri & FTL', color: '#475569', bg: 'bg-slate-600', border: 'border-slate-600', houseCost: 0 },
  SPECIAL: { id: 'SPECIAL', name: 'Petak Khusus Galaksi', color: '#0f172a', bg: 'bg-slate-900', border: 'border-slate-900', houseCost: 0 }
};

const MONOPOLY_TILES_GALAXY = [
  // 0: SUDUT MULAI GALAKSI
  { id: 0, name: 'START ODYSSEY 🚀', type: 'special', group: 'SPECIAL', subtitle: 'Bonus ₡ 4.000.000', icon: 'rocket', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80' },
  
  // 1-15: SISI BAWAH (TATA SURYA DALAM & SABUK ASTEROID)
  { 
    id: 1, name: 'Merkurius Outpost ☀️', type: 'property', group: 'SOLAR_INNER', price: 1000000, 
    rent: [60000, 300000, 900000, 2700000, 4200000, 6000000], city: 'Tata Surya',
    image: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400&q=80',
    desc: 'Pangkalan panel surya raksasa di dekat orbit matahari terik.'
  },
  { id: 2, name: 'Dana Galaksi 💼', type: 'chest', group: 'SPECIAL', icon: 'wallet', image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&q=80' },
  { 
    id: 3, name: 'Venus Cloud Citadel ☁️', type: 'property', group: 'SOLAR_INNER', price: 1000000, 
    rent: [60000, 300000, 900000, 2700000, 4200000, 6000000], city: 'Tata Surya',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&q=80',
    desc: 'Kota melayang di atmosfer atas Venus yang kaya gas mulia.'
  },
  { 
    id: 4, name: 'Mars New Olympus 🔴', type: 'property', group: 'SOLAR_INNER', price: 1200000, 
    rent: [80000, 400000, 1200000, 3500000, 5000000, 7000000], city: 'Mars',
    image: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400&q=80',
    desc: 'Kubah biosfer koloni manusia pertama di lereng Gunung Olympus Mons.'
  },
  { id: 5, name: 'Pajak Ekspedisi Antariksa', type: 'tax', group: 'SPECIAL', taxAmount: 2000000, icon: 'receipt', image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80' },
  { 
    id: 6, name: 'Warp Gate Sol-Alpha 🌀', type: 'station', group: 'WARP_STATION', price: 2500000, 
    rent: [350000, 700000, 1400000, 2800000], icon: 'zap',
    image: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=400&q=80',
    desc: 'Gerbang lompatan relativistik antarsistem bintang.'
  },
  { 
    id: 7, name: 'Ceres Prime Mining 🪨', type: 'property', group: 'ASTEROID_BELT', price: 1400000, 
    rent: [100000, 500000, 1500000, 4200000, 6000000, 8000000], city: 'Sabuk Asteroid',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
    desc: 'Kilang tambang air es dan platinum di planet kerdil Ceres.'
  },
  { id: 8, name: 'Kesempatan Kosmik 🃏', type: 'chance', group: 'SPECIAL', icon: 'help-circle', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80' },
  { 
    id: 9, name: 'Vesta Heavy Depot 🔩', type: 'property', group: 'ASTEROID_BELT', price: 1400000, 
    rent: [100000, 500000, 1500000, 4200000, 6000000, 8000000], city: 'Sabuk Asteroid',
    image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&q=80',
    desc: 'Pangkalan reparasi kapal kargo luar angkasa berbahan basal.'
  },
  { 
    id: 10, name: 'Pallas Research Hub 🔬', type: 'property', group: 'ASTEROID_BELT', price: 1600000, 
    rent: [120000, 600000, 1800000, 4800000, 6800000, 9000000], city: 'Sabuk Asteroid',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80',
    desc: 'Observatorium gravitasi kuantum di ujung sabuk asteroid.'
  },
  { id: 11, name: 'Reaktor Fusi Antimateri ⚛️', type: 'utility', group: 'COSMIC_UTILITY', price: 2000000, icon: 'zap', image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&q=80', desc: 'Pembangkit daya fusi nuklir bintang.' },
  { 
    id: 12, name: 'Europa Ocean Dome 🌊', type: 'property', group: 'JUPITER_MOONS', price: 1800000, 
    rent: [140000, 700000, 2000000, 5200000, 7500000, 10000000], city: 'Jupiter',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
    desc: 'Kota bawah es di samudra cair samudra Europa berpenghuni mikroba alien.'
  },
  { 
    id: 13, name: 'Ganymede Capital 🏛️', type: 'property', group: 'JUPITER_MOONS', price: 1800000, 
    rent: [140000, 700000, 2000000, 5200000, 7500000, 10000000], city: 'Jupiter',
    image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&q=80',
    desc: 'Ibukota aliansi planet Jovian dengan perisai magnetik buatan.'
  },
  { 
    id: 14, name: 'Io Volcanic Station 🌋', type: 'property', group: 'JUPITER_MOONS', price: 2000000, 
    rent: [160000, 800000, 2400000, 6000000, 8500000, 11500000], city: 'Jupiter',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&q=80',
    desc: 'Pembangkit energi panas bumi ekstrem di atas danau lava sulfur.'
  },
  { id: 15, name: 'Dana Galaksi 💼', type: 'chest', group: 'SPECIAL', icon: 'wallet', image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&q=80' },

  // 16: SUDUT PENJARA ORBIT (JAIL)
  { id: 16, name: 'PENJARA ORBIT 🔒', type: 'special', group: 'SPECIAL', subtitle: 'Stasiun Isolasi Karantina', icon: 'shield-alert', image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&q=80' },

  // 17-31: SISI KIRI (SATURNUS, URANUS & NEPTUNUS)
  { 
    id: 17, name: 'Titan Methane Colony 🪐', type: 'property', group: 'SATURN_RINGS', price: 2200000, 
    rent: [180000, 900000, 2600000, 6800000, 9500000, 12500000], city: 'Saturnus',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&q=80',
    desc: 'Koloni terapung di atas danau metana cair Kraken Mare.'
  },
  { 
    id: 18, name: 'Enceladus Geyser Port ❄️', type: 'property', group: 'SATURN_RINGS', price: 2200000, 
    rent: [180000, 900000, 2600000, 6800000, 9500000, 12500000], city: 'Saturnus',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
    desc: 'Pelabuhan air murni dari semburan geyser es kutub selatan.'
  },
  { 
    id: 19, name: 'Rhea Ring View 💎', type: 'property', group: 'SATURN_RINGS', price: 2400000, 
    rent: [200000, 1000000, 3000000, 7500000, 10500000, 13500000], city: 'Saturnus',
    image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&q=80',
    desc: 'Resor wisata termegah dengan panorama cincin es spektakuler.'
  },
  { 
    id: 20, name: 'Hyperdrive Hub Beta 🛸', type: 'station', group: 'WARP_STATION', price: 2500000, 
    rent: [350000, 700000, 1400000, 2800000], icon: 'compass',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80',
    desc: 'Terminal penerbangan antarbintang kecepatan cahaya.'
  },
  { 
    id: 21, name: 'Miranda Canyon 🌌', type: 'property', group: 'URANUS_NEPTUNE', price: 2600000, 
    rent: [220000, 1100000, 3300000, 8200000, 11500000, 15000000], city: 'Uranus',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&q=80',
    desc: 'Tebing jurang es terdalam di tata surya setinggi 20 kilometer.'
  },
  { id: 22, name: 'Kesempatan Kosmik 🃏', type: 'chance', group: 'SPECIAL', icon: 'help-circle', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80' },
  { 
    id: 23, name: 'Triton Nitrogen Geysers ❄️', type: 'property', group: 'URANUS_NEPTUNE', price: 2600000, 
    rent: [220000, 1100000, 3300000, 8200000, 11500000, 15000000], city: 'Neptunus',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&q=80',
    desc: 'Pangkalan geyser nitrogen beku di orbit mundur Neptunus.'
  },
  { 
    id: 24, name: 'Neptune Diamond Rain 💎', type: 'property', group: 'URANUS_NEPTUNE', price: 2800000, 
    rent: [240000, 1200000, 3600000, 9000000, 12500000, 16500000], city: 'Neptunus',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80',
    desc: 'Pusat ekstraksi intan murni dari hujan berlian di kedalaman atmosfer.'
  },
  { id: 25, name: 'Pajak Emisi Fusi Bintang', type: 'tax', group: 'SPECIAL', taxAmount: 2500000, icon: 'receipt', image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80' },
  { 
    id: 26, name: 'Pluto Haven 🌑', type: 'property', group: 'KUIPER_BELT', price: 3000000, 
    rent: [260000, 1300000, 3900000, 9800000, 13500000, 18000000], city: 'Sabuk Kuiper',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
    desc: 'Stasiun peristirahatan di dataran es berbentuk hati Tombaugh Regio.'
  },
  { id: 27, name: 'Dana Galaksi 💼', type: 'chest', group: 'SPECIAL', icon: 'wallet', image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&q=80' },
  { 
    id: 28, name: 'Eris Outer Colony 🛸', type: 'property', group: 'KUIPER_BELT', price: 3000000, 
    rent: [260000, 1300000, 3900000, 9800000, 13500000, 18000000], city: 'Sabuk Kuiper',
    image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&q=80',
    desc: 'Koloni terluar pemburu komet di perbatasan tata surya.'
  },
  { 
    id: 29, name: 'Sedna Frontier Point 🛰️', type: 'property', group: 'KUIPER_BELT', price: 3200000, 
    rent: [280000, 1400000, 4200000, 10500000, 14500000, 19500000], city: 'Sabuk Kuiper',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80',
    desc: 'Titik pos terdepan pengawas objek awan Oort.'
  },
  { id: 30, name: 'Jaringan Komunikasi FTL 📡', type: 'utility', group: 'COSMIC_UTILITY', price: 2000000, icon: 'wifi', image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&q=80', desc: 'Satelit komunikasi kecepatan superluminal kuantum.' },
  { id: 31, name: 'Kesempatan Kosmik 🃏', type: 'chance', group: 'SPECIAL', icon: 'help-circle', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80' },

  // 32: SUDUT ISTIRAHAT KOSMIK (FREE PARKING & KASINO)
  { id: 32, name: 'STASIUN KOSMIK BEBAS 🎰', type: 'special', group: 'SPECIAL', subtitle: 'Kasino Roda Galaksi', icon: 'coffee', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80' },

  // 33-47: SISI ATAS (EKSOPLANET, METROPOLIS SIBER & NEBULA)
  { 
    id: 33, name: 'Proxima Centauri b 🪐', type: 'property', group: 'EXO_WORLDS', price: 3400000, 
    rent: [300000, 1500000, 4500000, 11500000, 15500000, 21000000], city: 'Alpha Centauri',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&q=80',
    desc: 'Eksoplanet terdekat dari bumi dengan dua matahari kerdil merah.'
  },
  { id: 34, name: 'Dana Galaksi 💼', type: 'chest', group: 'SPECIAL', icon: 'wallet', image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&q=80' },
  { 
    id: 35, name: 'Kepler-452b Earth 2.0 🌍', type: 'property', group: 'EXO_WORLDS', price: 3400000, 
    rent: [300000, 1500000, 4500000, 11500000, 15500000, 21000000], city: 'Kepler',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80',
    desc: 'Kembaran bumi tertua dengan samudra hijau dan atmosfer oksigen murni.'
  },
  { 
    id: 36, name: 'TRAPPIST-1e Paradise 🏝️', type: 'property', group: 'EXO_WORLDS', price: 3600000, 
    rent: [330000, 1650000, 5000000, 12500000, 17000000, 23000000], city: 'TRAPPIST',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
    desc: 'Surga tropis antariksa berlatar 6 planet lain yang menghiasi langit malam.'
  },
  { 
    id: 37, name: 'Stasiun Relativitas Gamma ⚡', type: 'station', group: 'WARP_STATION', price: 2500000, 
    rent: [350000, 700000, 1400000, 2800000], icon: 'radio',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80',
    desc: 'Hub akselerasi gravitasi lubang cacing buatan.'
  },
  { 
    id: 38, name: 'Neo Tokyo 3000 🏙️', type: 'property', group: 'CYBER_METROPOLIS', price: 3800000, 
    rent: [360000, 1800000, 5400000, 13500000, 18500000, 25000000], city: 'Siberia',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&q=80',
    desc: 'Gedung pencakar langit bercahaya neon holografik tanpa batas.'
  },
  { id: 39, name: 'Kesempatan Kosmik 🃏', type: 'chance', group: 'SPECIAL', icon: 'help-circle', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80' },
  { 
    id: 40, name: 'Coruscant Nexus 🌐', type: 'property', group: 'CYBER_METROPOLIS', price: 3800000, 
    rent: [360000, 1800000, 5400000, 13500000, 18500000, 25000000], city: 'Galactic Core',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
    desc: 'Ibukota seluruh galaksi dengan populasi satu triliun makhluk cerdas.'
  },
  { 
    id: 41, name: 'Zion Floating Citadel 🏰', type: 'property', group: 'CYBER_METROPOLIS', price: 4000000, 
    rent: [400000, 2000000, 6000000, 15000000, 20000000, 27000000], city: 'Sanctuary',
    image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&q=80',
    desc: 'Benteng anti-gravitasi tempat tinggal para maestro kecerdasan buatan.'
  },
  { id: 42, name: 'Panel Surya Dyson Swarm ☀️', type: 'utility', group: 'COSMIC_UTILITY', price: 2000000, icon: 'sun', image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&q=80', desc: 'Pembangkit energi bintang berkapasitas tak terbatas.' },
  { 
    id: 43, name: 'Orion Nebula Pillars 🌌', type: 'property', group: 'NEBULA_ZONES', price: 4200000, 
    rent: [430000, 2150000, 6500000, 16000000, 21500000, 29000000], city: 'Orion',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80',
    desc: 'Pilar-pilar pembentukan bintang baru berbahan debu kosmik gas neon.'
  },
  { 
    id: 44, name: 'Crab Pulsar Star 💫', type: 'property', group: 'NEBULA_ZONES', price: 4200000, 
    rent: [430000, 2150000, 6500000, 16000000, 21500000, 29000000], city: 'Taurus',
    image: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=400&q=80',
    desc: 'Bintang neutron berputar 30 kali per detik dengan medan magnet dahsyat.'
  },
  { 
    id: 45, name: 'Eagle Starforge 🦅', type: 'property', group: 'NEBULA_ZONES', price: 4400000, 
    rent: [460000, 2300000, 7000000, 17500000, 23000000, 31000000], city: 'Serpens',
    image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&q=80',
    desc: 'Kawasan industri perakitan armada kapal perang antarbintang.'
  },
  { id: 46, name: 'Pajak Transaksi Kripto Galaksi', type: 'tax', group: 'SPECIAL', taxAmount: 3000000, icon: 'receipt', image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80' },
  { id: 47, name: 'Dana Galaksi 💼', type: 'chest', group: 'SPECIAL', icon: 'wallet', image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&q=80' },

  // 48: SUDUT BLACK HOLE (GO TO JAIL)
  { id: 48, name: 'BLACK HOLE RAZIA 🕳️', type: 'special', group: 'SPECIAL', subtitle: 'Tersedot ke Penjara Orbit', icon: 'alert-triangle', image: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=400&q=80' },

  // 49-63: SISI KANAN (MEGASTRUKTUR KUNO & GATEWAYS)
  { 
    id: 49, name: 'Atlantis Prime Star 🔱', type: 'property', group: 'ANCIENT_ALIEN', price: 4600000, 
    rent: [500000, 2500000, 7500000, 18500000, 25000000, 33000000], city: 'Ancients',
    image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&q=80',
    desc: 'Peradaban antariksa pertama dengan kristal energi tak terbatas.'
  },
  { id: 50, name: 'Kesempatan Kosmik 🃏', type: 'chance', group: 'SPECIAL', icon: 'help-circle', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80' },
  { 
    id: 51, name: 'Vorlon Hyper-Ring 🪐', type: 'property', group: 'ANCIENT_ALIEN', price: 4600000, 
    rent: [500000, 2500000, 7500000, 18500000, 25000000, 33000000], city: 'Ancients',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&q=80',
    desc: 'Cincin habitat raksasa berdiameter 100 juta kilometer.'
  },
  { 
    id: 52, name: 'Dyson Sphere Core ☀️', type: 'property', group: 'ANCIENT_ALIEN', price: 5000000, 
    rent: [600000, 3000000, 9000000, 20000000, 28000000, 40000000], city: 'Ancients',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80',
    desc: 'Mahakarya peradaban Tipe II membungkus seluruh bintang surya.'
  },
  { 
    id: 53, name: 'Terminal Antariksa Delta 🚀', type: 'station', group: 'WARP_STATION', price: 2500000, 
    rent: [350000, 700000, 1400000, 2800000], icon: 'plane',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80',
    desc: 'Pusat transit antar-galaksi Andromeda dan Bima Sakti.'
  },
  { 
    id: 54, name: 'Mars New Olympus 2 🔴', type: 'property', group: 'SOLAR_INNER', price: 1200000, 
    rent: [80000, 400000, 1200000, 3500000, 5000000, 7000000], city: 'Mars',
    image: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400&q=80',
    desc: 'Sektor selatan terraforming planet merah Mars.'
  },
  { id: 55, name: 'Dana Galaksi 💼', type: 'chest', group: 'SPECIAL', icon: 'wallet', image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&q=80' },
  { 
    id: 56, name: 'Europa Ocean Dome 2 🌊', type: 'property', group: 'JUPITER_MOONS', price: 1800000, 
    rent: [140000, 700000, 2000000, 5200000, 7500000, 10000000], city: 'Jupiter',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
    desc: 'Laboratorium biologi laut dalam samudra Europa.'
  },
  { 
    id: 57, name: 'Titan Methane Colony 2 🪐', type: 'property', group: 'SATURN_RINGS', price: 2200000, 
    rent: [180000, 900000, 2600000, 6800000, 9500000, 12500000], city: 'Saturnus',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&q=80',
    desc: 'Pabrik gas hidrokarbon atmosfer Titan.'
  },
  { 
    id: 58, name: 'Miranda Canyon 2 🌌', type: 'property', group: 'URANUS_NEPTUNE', price: 2600000, 
    rent: [220000, 1100000, 3300000, 8200000, 11500000, 15000000], city: 'Uranus',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&q=80',
    desc: 'Sektor radar gravitasi ngarai es Miranda.'
  },
  { 
    id: 59, name: 'Pluto Haven 2 🌑', type: 'property', group: 'KUIPER_BELT', price: 3000000, 
    rent: [260000, 1300000, 3900000, 9800000, 13500000, 18000000], city: 'Sabuk Kuiper',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
    desc: 'Stasiun telemetri transmisi radio planet kerdil Pluto.'
  },
  { id: 60, name: 'Kesempatan Kosmik 🃏', type: 'chance', group: 'SPECIAL', icon: 'help-circle', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80' },
  { 
    id: 61, name: 'TRAPPIST-1e Paradise 2 🏝️', type: 'property', group: 'EXO_WORLDS', price: 3600000, 
    rent: [330000, 1650000, 5000000, 12500000, 17000000, 23000000], city: 'TRAPPIST',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
    desc: 'Sektor laguna dan kepulauan terraforming TRAPPIST.'
  },
  { 
    id: 62, name: 'Coruscant Nexus 2 🌐', type: 'property', group: 'CYBER_METROPOLIS', price: 3800000, 
    rent: [360000, 1800000, 5400000, 13500000, 18500000, 25000000], city: 'Galactic Core',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
    desc: 'Sektor bursa efek keuangan antar-galaksi Coruscant.'
  },
  { 
    id: 63, name: 'Dyson Sphere Core 2 ☀️', type: 'property', group: 'ANCIENT_ALIEN', price: 5000000, 
    rent: [600000, 3000000, 9000000, 20000000, 28000000, 40000000], city: 'Ancients',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80',
    desc: 'Ruang kendali kuantum pusat bola raksasa Dyson Sphere.'
  }
];

// =============================================================================
// 4. MASTER MAPS DICTIONARY (3 PILIHAN PETA)
// =============================================================================
const MONOPOLY_MAPS = {
  galaxy: {
    id: 'galaxy',
    name: '🪐 Peta Metro-Galactic Odyssey (64 Petak Non-Kotak)',
    tileCount: 64,
    gridDimension: 17,
    jailTileId: 16,
    goToJailTileId: 48,
    freeParkingTileId: 32,
    currency: '₡',
    currencyRate: 1,
    groups: MONOPOLY_GROUPS_GALAXY,
    tiles: MONOPOLY_TILES_GALAXY
  },
  world: {
    id: 'world',
    name: '🌍 Peta Dunia Global (52 Petak Internasional)',
    tileCount: 52,
    gridDimension: 14,
    jailTileId: 13,
    goToJailTileId: 39,
    freeParkingTileId: 26,
    currency: '$',
    currencyRate: 1,
    groups: MONOPOLY_GROUPS_WORLD,
    tiles: MONOPOLY_TILES_WORLD
  },
  nusantara: {
    id: 'nusantara',
    name: '🇮🇩 Peta Nusantara (40 Petak Indonesia)',
    tileCount: 40,
    gridDimension: 11,
    jailTileId: 10,
    goToJailTileId: 30,
    freeParkingTileId: 20,
    currency: 'Rp',
    currencyRate: 1,
    groups: MONOPOLY_GROUPS_NUSANTARA,
    tiles: MONOPOLY_TILES_NUSANTARA
  }
};

// Aliases for retro-compatibility
let MONOPOLY_GROUPS = MONOPOLY_GROUPS_GALAXY;
let MONOPOLY_TILES = MONOPOLY_TILES_GALAXY;

// =============================================================================
// 4. KEMAMPUAN UNIK 8+ KARAKTER TOKEN (CHARACTER ABILITIES)
// =============================================================================
const CHARACTER_ABILITIES = {
  '🚗': {
    name: 'Pembalap Kilat',
    desc: 'Bebas denda tilang & lemparan dadu bernilai genap memberikan bonus langkah +1.',
    perk: 'SPEED_EXTRA_ROLL',
    icon: 'zap'
  },
  '🚢': {
    name: 'Kapten Maritim',
    desc: 'Bebas sewa Stasiun/Bandara & sewa kawasan Pantai/Kepulauan +25%.',
    perk: 'ISLAND_RENT_BOOST',
    icon: 'anchor'
  },
  '✈️': {
    name: 'Pilot Elit',
    desc: 'Bebas denda tiket transportasi & diskon sewa lintas negara/provinsi 50%.',
    perk: 'AIRPORT_DISCOUNT',
    icon: 'plane'
  },
  '🎩': {
    name: 'Sultan Konglomerat',
    desc: 'Diskon 10% setiap beli tanah & bonus petak MULAI bertambah Rp 500.000 / $ 500.000.',
    perk: 'SULTAN_DISCOUNT',
    icon: 'crown'
  },
  '🐕': {
    name: 'Detektif Cerdik',
    desc: 'Kebal 1x masuk penjara & diskon seluruh pembayaran pajak 50%.',
    perk: 'JAIL_IMMUNITY',
    icon: 'shield'
  },
  '🚀': {
    name: 'Visioner Teknologi',
    desc: 'Pendapatan Utilitas Publik (Listrik/Satelit) 2x Lipat & diskon bangun rumah 15%.',
    perk: 'TECH_BOOST',
    icon: 'cpu'
  },
  '🏎️': {
    name: 'Juara Formula',
    desc: 'Sewa properti kota megapolitan (Tokyo/New York/Paris) +30% & dapat lempar dadu ulang jika total dadu > 14.',
    perk: 'SPEED_CHAMPION',
    icon: 'flame'
  },
  '👑': {
    name: 'Kaisar Properti',
    desc: 'Diskon 15% setiap membangun rumah/hotel & bebas 1x sewa saat pertama kali mendarat di properti lawan.',
    perk: 'EMPEROR_SHIELD',
    icon: 'gem'
  }
};

// =============================================================================
// 5. EVENT KRISIS & MAKRO-EKONOMI DINAMIS
// =============================================================================
// =============================================================================
// 5. EVENT KRISIS & MAKRO-EKONOMI DINAMIS (GLOBAL & TARGETED)
// =============================================================================
const ECONOMIC_EVENTS = [
  // --- A. TARGETED: MENGUNTUNGKAN 1 PEMAIN ---
  {
    id: 'SUBSIDY_PROPERTY',
    title: '🎁 Subsidi Konglomerat Properti',
    desc: 'Pemerintah memberikan dana hibah Rp 3.000.000 kepada pemilik properti terbanyak!',
    scope: 'TARGETED_ADVANTAGE',
    type: 'success',
    effectType: 'CASH_GRANT_TOP_PROPERTY',
    grantAmount: 3000000,
    duration: 1
  },
  {
    id: 'JACKPOT_WINDFALL',
    title: '💎 Jackpot Rezeki Nomplok',
    desc: 'Satu pemain terpilih secara acak memenangkan undian nasional sebesar Rp 4.000.000!',
    scope: 'TARGETED_ADVANTAGE',
    type: 'success',
    effectType: 'CASH_GRANT_RANDOM',
    grantAmount: 4000000,
    duration: 1
  },
  {
    id: 'PATENT_ROYALTY',
    title: '🛡️ Hak Paten Transportasi Bebas',
    desc: 'Satu pemain beruntung mendapat hak kebal bebas sewa di seluruh Stasiun/Warp Gate selama 3 putaran!',
    scope: 'TARGETED_ADVANTAGE',
    type: 'success',
    effectType: 'STATION_SHIELD_RANDOM',
    duration: 3
  },

  // --- B. TARGETED: MERUGIKAN 1 PEMAIN ---
  {
    id: 'TAX_AUDIT_RICHEST',
    title: '🕵️ Audit Pajak Investigasi KPK',
    desc: 'Pemain dengan kekayaan tertinggi terkena audit dan wajib membayar pajak 15% dari uang kas!',
    scope: 'TARGETED_DISADVANTAGE',
    type: 'danger',
    effectType: 'TAX_PERCENT_RICHEST',
    taxPercent: 0.15,
    duration: 1
  },
  {
    id: 'CORPORATE_SCANDAL',
    title: '💥 Skandal Korporasi & Ganti Rugi',
    desc: 'Satu pemain acak terkena denda ganti rugi pencemaran lingkungan sebesar Rp 2.500.000!',
    scope: 'TARGETED_DISADVANTAGE',
    type: 'danger',
    effectType: 'FINE_RANDOM',
    fineAmount: 2500000,
    duration: 1
  },
  {
    id: 'ASSET_FREEZE',
    title: '🔒 Pembekuan Aset Monopoli',
    desc: 'Satu properti acak dibekukan oleh regulator (bebas sewa / tidak menghasilkan uang) selama 2 putaran!',
    scope: 'TARGETED_DISADVANTAGE',
    type: 'warning',
    effectType: 'FREEZE_PROPERTY_RANDOM',
    duration: 2
  },

  // --- C. GLOBAL: MENGUNTUNGKAN SEMUA PEMAIN ---
  {
    id: 'ECONOMIC_BOOM',
    title: '🚀 Ledakan Ekonomi (Economic Boom)',
    desc: 'Seluruh pemain menerima stimulus Rp 2.000.000 & biaya bangun rumah didiskon 30%!',
    scope: 'GLOBAL_ADVANTAGE',
    type: 'success',
    effectType: 'GLOBAL_STIMULUS',
    stimulusAmount: 2000000,
    costMultiplier: 0.7,
    duration: 3
  },
  {
    id: 'TOURISM_BOOM',
    title: '🏖️ Festival Pariwisata Dunia',
    desc: 'Sewa destinasi wisata & seluruh properti melonjak +50% selama 3 putaran!',
    scope: 'GLOBAL_ADVANTAGE',
    type: 'success',
    rentMultiplier: 1.5,
    duration: 3
  },
  {
    id: 'INTEREST_RATE_CUT',
    title: '🏦 Penurunan Suku Bunga Bank Sentral',
    desc: 'Seluruh utang bank dibebaskan dari bunga & pinjaman bank darurat tanpa biaya!',
    scope: 'GLOBAL_ADVANTAGE',
    type: 'info',
    zeroInterest: true,
    duration: 3
  },
  {
    id: 'TAX_AMNESTY',
    title: '🏛️ Program Tax Holiday Nasional',
    desc: 'Semua petak Pajak bebas biaya (0 rupiah) selama 3 putaran!',
    scope: 'GLOBAL_ADVANTAGE',
    type: 'info',
    taxFree: true,
    duration: 3
  },

  // --- D. GLOBAL: MERUGIKAN SEMUA PEMAIN ---
  {
    id: 'RECESSION',
    title: '📉 Resesi Ekonomi Global',
    desc: 'Semua pemain ditarik iuran krisis Rp 1.500.000 & pendapatan sewa tanah turun 25%.',
    scope: 'GLOBAL_DISADVANTAGE',
    type: 'danger',
    effectType: 'GLOBAL_LEVY',
    levyAmount: 1500000,
    rentMultiplier: 0.75,
    passGoReduction: 1000000,
    duration: 3
  },
  {
    id: 'ENERGY_CRISIS',
    title: '⚡ Krisis Energi & Blackout Masal',
    desc: 'Krisis bahan bakar global! Sewa seluruh petak Utilitas Publik dan Stasiun naik 2x lipat!',
    scope: 'GLOBAL_DISADVANTAGE',
    type: 'warning',
    utilityMultiplier: 2.0,
    duration: 3
  },
  {
    id: 'HYPERINFLATION',
    title: '💸 Hiperinflasi Moneter',
    desc: 'Biaya pembelian properti baru dan konstruksi bangunan melonjak naik +40%!',
    scope: 'GLOBAL_DISADVANTAGE',
    type: 'danger',
    costMultiplier: 1.4,
    duration: 3
  }
];

// =============================================================================
// 6. KARTU KESEMPATAN & DANA UMUM
// =============================================================================
const CHANCE_CARDS = [
  { id: 1, text: 'Maju langsung ke petak MULAI (Ambil bonus putaran penuh).', action: 'move_to', targetTile: 0, collectGo: true },
  { id: 2, text: 'Terbang ekspres ke destinasi properti termahal di papan!', action: 'move_to_highest', collectGo: true },
  { id: 3, text: 'Naik kereta api/stasiun terdekat sekarang juga.', action: 'move_to_nearest_station', collectGo: true },
  { id: 4, text: 'Dividen investasi pasar modal cair! Anda menerima 1.500.000 dari Bank.', action: 'receive_money', amount: 1500000 },
  { id: 5, text: 'Melanggar batas kecepatan di jalan raya! Bayar denda 500.000.', action: 'pay_money', amount: 500000 },
  { id: 6, text: 'KARTU BEBAS PENJARA! Simpan kartu ini untuk digunakan saat darurat.', action: 'get_jail_card' },
  { id: 7, text: 'Tertangkap razia INTERPOL / Petugas! Masuk penjara sekarang tanpa melewati Mulai.', action: 'go_to_jail' },
  { id: 8, text: 'Renovasi properti berkala! Bayar 250.000 per rumah dan 1.000.000 per hotel.', action: 'property_repairs', houseFee: 250000, hotelFee: 1000000 }
];

const CHEST_CARDS = [
  { id: 1, text: 'Maju langsung ke petak MULAI (Ambil bonus putaran penuh).', action: 'move_to', targetTile: 0, collectGo: true },
  { id: 2, text: 'Pengembalian lebih bayar pajak negara! Terima 2.000.000 dari Bank.', action: 'receive_money', amount: 2000000 },
  { id: 3, text: 'Menang juara kuis wawasan geografi & sejarah! Terima 1.000.000 dari Bank.', action: 'receive_money', amount: 1000000 },
  { id: 4, text: 'Iuran dana pembangunan kota dan infrastruktur. Bayar 500.000.', action: 'pay_money', amount: 500000 },
  { id: 5, text: 'Biaya asuransi kesehatan & perawatan keluarga. Bayar 1.000.000.', action: 'pay_money', amount: 1000000 },
  { id: 6, text: 'KARTU BEBAS PENJARA! Simpan kartu ini untuk digunakan nanti.', action: 'get_jail_card' },
  { id: 7, text: 'Hari Ulang Tahun Anda! Dapatkan kado 500.000 dari setiap pemain lain.', action: 'collect_from_players', amount: 500000 },
  { id: 8, text: 'Pelanggaran regulasi bisnis internasional! Langsung masuk penjara.', action: 'go_to_jail' }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MONOPOLY_MAPS,
    MONOPOLY_TILES_NUSANTARA,
    MONOPOLY_GROUPS_NUSANTARA,
    MONOPOLY_TILES_WORLD,
    MONOPOLY_GROUPS_WORLD,
    CHARACTER_ABILITIES,
    ECONOMIC_EVENTS,
    CHANCE_CARDS,
    CHEST_CARDS
  };
}
