const Guide = (function() {
  'use strict';
  let currentPage = 0;
  const totalPages = 16;

  function getPages() {
    const lang = (typeof Lang !== 'undefined') ? Lang.getLang() : 'id';
    const pages = [
      {
        title: lang === 'id' ? '🎲 Dasar Permainan' : '🎲 Game Basics',
        content: lang === 'id'
          ? '<h3>Tujuan</h3><p>Jadilah pemain terkaya atau pemain terakhir yang bertahan tanpa bangkrut! Kumpulkan properti, bangun aset bisnis, dan kuasai ekonomi kota neon.</p><h3>Alur Giliran Lengkap</h3><ul><li>🎲 <strong>Lempar Dadu</strong> — gerakkan bidak token sesuai angka dadu</li><li>📍 <strong>Aksi Petak</strong> — beli properti, bayar sewa, ambil kartu Chance/Chest, atau masuk penjara</li><li>⚡ <strong>Aksi Bebas</strong> — bangun rumah/hotel/kasino, trading, beli saham, ajukan pinjaman, beli barang pasar gelap, atau aktifkan skill karakter</li><li>⏹️ <strong>Akhiri Giliran</strong> — oper giliran ke pemain berikutnya</li></ul><h3>Kondisi Menang</h3><p>Pemain terakhir yang tidak bangkrut <strong>MENANG MUTLAK</strong>, atau pemain dengan total kekayaan (uang + properti + saham) tertinggi saat ronde berakhir.</p>'
          : '<h3>Objective</h3><p>Become the richest player or the last one standing! Collect properties, build business assets, and dominate the neon city economy.</p><h3>Turn Flow</h3><ul><li>🎲 <strong>Roll Dice</strong> — move token by rolled dice total</li><li>📍 <strong>Tile Action</strong> — buy property, pay rent, draw Chance/Chest cards, or visit jail</li><li>⚡ <strong>Free Actions</strong> — build structures, trade, trade stocks, take loans, buy black market items, or trigger character skills</li><li>⏹️ <strong>End Turn</strong> — pass turn to the next player</li></ul><h3>Winning Condition</h3><p>Last surviving player <strong>WINS</strong>, or the wealthiest player (cash + properties + stocks) when round limit ends.</p>'
      },
      {
        title: lang === 'id' ? '🗺️ Papan 52 Petak' : '🗺️ The 52-Tile Board',
        content: lang === 'id'
          ? '<h3>52 Petak Papan</h3><p>Papan memiliki total 52 petak persegi (13 petak per sisi), terbagi ke dalam 6 distrik kota neon.</p><h3>Jenis-Jenis Petak</h3><ul><li>🏠 <strong>Properti Distrik</strong> (32) — dapat dibeli, dimonopoli, dan dibangun</li><li>🚄 <strong>Stasiun Hyperloop</strong> (4) — sewa meningkat bertingkat sesuai jumlah stasiun yang dikuasai ($50 → $100 → $200 → $400)</li><li>⚡ <strong>Pembangkit Listrik / Utility</strong> (2) — sewa dikali lemparan dadu (4x atau 10x)</li><li>❓ <strong>Chance</strong> (4) — kartu event dan taktik tak terduga</li><li>📦 <strong>Chest</strong> (4) — kartu hadiah dana komunitas atau denda audit</li><li>💸 <strong>Pajak Kota</strong> (3) — bayar pajak 10% atau denda flat ke bank</li><li>🏴 <strong>Pasar Gelap</strong> (3) — akses pembelian item ilegal berisiko</li><li>🚀 <strong>GO</strong> — terima bonus kas $200 setiap melewati atau mendarat</li><li>🔒 <strong>Penjara</strong> — ditahan 3 giliran jika tertangkap atau mendarat di petak razia</li></ul>'
          : '<h3>52 Board Tiles</h3><p>The board features 52 tiles arranged in a square (13 per side), divided across 6 distinct districts.</p><h3>Tile Types</h3><ul><li>🏠 <strong>District Properties</strong> (32) — buy, monopolize, and build</li><li>🚄 <strong>Hyperloop Stations</strong> (4) — tiered rent based on stations owned ($50 → $100 → $200 → $400)</li><li>⚡ <strong>Utilities</strong> (2) — rent multiplied by dice roll (4x or 10x)</li><li>❓ <strong>Chance</strong> (4) — draw unpredictable tactical cards</li><li>📦 <strong>Chest</strong> (4) — community dividend rewards or audit fines</li><li>💸 <strong>City Taxes</strong> (3) — pay 10% tax or flat penalty to bank</li><li>🏴 <strong>Black Market</strong> (3) — buy high-risk illegal gadgets</li><li>🚀 <strong>GO</strong> — collect $200 salary bonus whenever passing</li><li>🔒 <strong>Jail</strong> — detained for 3 turns if caught or landing on raid tile</li></ul>'
      },
      {
        title: lang === 'id' ? '🏠 Properti & Sewa Berlapis' : '🏠 Properties & Tiered Rent',
        content: lang === 'id'
          ? '<h3>Sistem Pembelian</h3><p>Saat mendarat di properti tanpa pemilik, kamu bisa membelinya langsung. Jika kamu menolak, properti akan otomatis dilempar ke <strong>Lelang Publik</strong>!</p><h3>Pembangunan Rumah & Monopoli</h3><p>Kamu dapat membangun <strong>hingga 4 Rumah</strong> di propertimu kapan saja tanpa harus menunggu semua properti sewarna terkumpul. Namun, untuk upgrade ke tingkat tertinggi (<strong>HOTEL</strong>), kamu <strong>wajib memiliki Monopoli Penuh</strong> (mengumpulkan seluruh properti warna tersebut)!</p><h3>Monopoli Grup Warna</h3><p>Memiliki seluruh properti dalam satu grup warna = <strong>Monopoli Penuh</strong>! Sewa dasar properti tanpa bangunan naik 2x lipat dan izin upgrade Hotel terbuka.</p><h3>Formula Sewa 7-Tier</h3><p>Sewa dihitung secara dinamis berlapis:</p><code>Sewa = Base × Bangunan × Monopoli (2x) × Sinergi Distrik × Event Ekonomi × Cuaca × Skill Karakter</code><p>Kombinasi modifier ini bisa menghasilkan sewa mematikan hingga ribuan dollar!</p>'
          : '<h3>Purchase System</h3><p>When landing on unowned property, buy it directly. If declined, it enters a <strong>Public Auction</strong>!</p><h3>Building Houses & Monopoly</h3><p>You can build <strong>up to 4 Houses</strong> on your properties anytime without needing all same-colored properties. However, upgrading to the top tier (<strong>HOTEL</strong>) strictly <strong>requires a Full Monopoly</strong> (owning all properties of that color group)!</p><h3>Color Group Monopoly</h3><p>Own all properties in the same color group = <strong>Full Monopoly</strong>! Base rent of unimproved properties doubles and Hotel construction unlocks.</p><h3>7-Tier Rent Formula</h3><p>Rent is dynamically calculated:</p><code>Rent = Base × Building × Monopoly (2x) × District Synergy × Economy Event × Weather × Character Skill</code><p>These stacking multipliers can create devastating four-figure rent strikes!</p>'
      },
      {
        title: lang === 'id' ? '🏗️ 5 Jalur Pembangunan' : '🏗️ 5 Building Paths',
        content: lang === 'id'
          ? '<h3>Pilih Strategi Pembangunan</h3><p>Setiap properti dapat ditingkatkan hingga 4 Rumah, dan dengan Monopoli Penuh dapat ditingkatkan ke Hotel atau cabang bangunan khusus lainnya:</p><ul><li>🏨 <strong>Hotel</strong> (4 Rumah + Monopoli Penuh → Hotel): Penghasil sewa terbesar (hingga 40x sewa dasar).</li><li>🏬 <strong>Mall Bisnis</strong> (2 Rumah → Mall): Memberikan penghasilan pasif kas +$50 setiap giliran.</li><li>🏢 <strong>Markas Besar / HQ</strong> (2 Rumah → HQ): Menggandakan efek skill karakter saat berada di petak ini.</li><li>🎰 <strong>Kasino Mewah</strong> (1 Rumah → Kasino): Sewa acak bertaruh antara 0.5x hingga 3.0x lipat.</li><li>🏰 <strong>Benteng Pertahanan / Fortress</strong> (3 Rumah → Benteng): Kebal 100% dari serangan kartu sabotase dan bencana alam!</li></ul>'
          : '<h3>Choose Your Construction Path</h3><p>Every property can be upgraded up to 4 Houses without monopoly, and with Full Monopoly can be upgraded to Hotel or specialized structures:</p><ul><li>🏨 <strong>Hotel</strong> (4 Houses + Full Monopoly → Hotel): Highest rent output (up to 40x base rent).</li><li>🏬 <strong>Shopping Mall</strong> (2 Houses → Mall): Generates +$50 passive cash income every turn.</li><li>🏢 <strong>Corporate HQ</strong> (2 Houses → HQ): Doubles active skill effects on this tile.</li><li>🎰 <strong>Casino</strong> (1 House → Casino): Gambles random rent multiplier from 0.5x to 3.0x.</li><li>🏰 <strong>Fortress</strong> (3 Houses → Fortress): 100% immune to sabotage cards and natural disasters!</li></ul>'
      },
      {
        title: lang === 'id' ? '⚡ 12 Karakter & Skill' : '⚡ 12 Characters & Skills',
        content: lang === 'id'
          ? '<h3>Daftar 12 Karakter Unik & Skill Pasif/Aktif</h3><ul>' +
            '<li>💼 <strong>Banker</strong> — Pasif: Bunga pinjaman bank 3% | Aktif: Bekukan sewa properti lawan 3 giliran.</li>' +
            '<li>🔧 <strong>Engineer</strong> — Pasif: Diskon biaya bangun 20% | Aktif: Upgrade 1 bangunan gratis.</li>' +
            '<li>📈 <strong>Trader</strong> — Pasif: Evaluasi tukar tambah +15% | Aktif: Paksa tukar properti lawan.</li>' +
            '<li>🎩 <strong>Politician</strong> — Pasif: Kebal semua petak denda pajak | Aktif: Kuras 15% saldo uang seluruh lawan.</li>' +
            '<li>🎲 <strong>Gambler</strong> — Pasif: Peluang 25% double dadu | Aktif: Gandakan seluruh sewa (2x lipat) 2 giliran.</li>' +
            '<li>🛡️ <strong>Guardian</strong> — Pasif: Kebal lelang & sabotase | Aktif: Perisai mengabaikan 2 pembayaran sewa.</li>' +
            '<li>💻 <strong>Hacker</strong> — Pasif: Diskon 30% Pasar Gelap & kebal razia | Aktif: Retas $350 langsung dari kas lawan terkaya.</li>' +
            '<li>👑 <strong>Tycoon</strong> — Pasif: Ekstra bonus lewat GO +$400 | Aktif: Beli paksa properti non-monopoli lawan 1.5x harga.</li>' +
            '<li>🦾 <strong>Cyborg</strong> — Pasif: Kurangi 40% denda bencana & krisis | Aktif: Overdrive +6 langkah dadu & kebal sewa.</li>' +
            '<li>📊 <strong>Broker</strong> — Pasif: Diskon beli saham 25% & dividen +50% | Aktif: Pompa portofolio saham +40% & panen kas $250.</li>' +
            '<li>🕵️ <strong>Detective</strong> — Pasif: Hadiah bounty +$200 saat lawan dipenjara | Aktif: Karantina polisi 1 distrik lawan 2 giliran.</li>' +
            '<li>🧪 <strong>Alchemist</strong> — Pasif: Cashback pinjaman 10% & diskon gadai 30% | Aktif: Duplikasi 2 kartu aksi taktis instan.</li>' +
            '</ul>'
          : '<h3>12 Unique Characters & Passive/Active Skills</h3><ul>' +
            '<li>💼 <strong>Banker</strong> — Passive: Bank loan interest 3% | Active: Freeze opponent property rent for 3 turns.</li>' +
            '<li>🔧 <strong>Engineer</strong> — Passive: -20% building construction cost | Active: Upgrade 1 building for free.</li>' +
            '<li>📈 <strong>Trader</strong> — Passive: +15% trade valuation bonus | Active: Force trade property with opponent.</li>' +
            '<li>🎩 <strong>Politician</strong> — Passive: Immune to tax tiles | Active: Levy 15% tax on all opponents cash.</li>' +
            '<li>🎲 <strong>Gambler</strong> — Passive: 25% lucky double chance | Active: Double all property rents for 2 turns.</li>' +
            '<li>🛡️ <strong>Guardian</strong> — Passive: Immune to forced auction & sabotage | Active: Energy shield ignores 2 rents.</li>' +
            '<li>💻 <strong>Hacker</strong> — Passive: 30% off Black Market & raid immunity | Active: Siphon $350 from richest opponent.</li>' +
            '<li>👑 <strong>Tycoon</strong> — Passive: +$400 GO passing bonus | Active: Force buy opponent non-monopoly property at 1.5x.</li>' +
            '<li>🦾 <strong>Cyborg</strong> — Passive: 40% disaster damage reduction | Active: Overdrive +6 movement steps & free landing.</li>' +
            '<li>📊 <strong>Broker</strong> — Passive: 25% stock discount & +50% dividend | Active: Surge stock values +40% & harvest $250.</li>' +
            '<li>🕵️ <strong>Detective</strong> — Passive: +$200 bounty when opponent jailed | Active: Lockdown opponent district for 2 turns.</li>' +
            '<li>🧪 <strong>Alchemist</strong> — Passive: 10% loan cashback & 30% unmortgage discount | Active: Draw 2 tactical cards instantly.</li>' +
            '</ul>'
      },
      {
        title: lang === 'id' ? '🃏 Action Cards Taktis' : '🃏 Tactical Action Cards',
        content: lang === 'id'
          ? '<h3>Simpan Hingga 3 Kartu</h3><p>Kartu aksi dapat disimpan di inventaris dan digunakan kapan saja pada giliranmu:</p><ul><li>⚔️ <strong>Kartu Serangan</strong>: Hostile Takeover (paksa beli aset lawan 1.5x), Sabotage (hancurkan level bangunan), Tax Audit (denda 20% kekayaan lawan), Cyber Attack (disable skill lawan 3 giliran).</li><li>🛡️ <strong>Kartu Pertahanan</strong>: Firewall (blokir 1 serangan lawan), Insurance (bebas sewa 1x), Legal Shield (imun takeover 2 giliran), Bail Bond (keluar penjara instan).</li><li>🌍 <strong>Kartu Ekonomi</strong>: Market Manipulation (ubah harga saham ±30%), Stimulus (semua dapat $200), Embargo (bekukan sewa 1 distrik), Gentrification (sewa 1 distrik +50%).</li><li>🚀 <strong>Kartu Khusus</strong>: Teleportasi (pindah bebas), Balik Arah (putar arah gerak), Dadu Ganda (lempar 3 dadu), Retas Bank (curi uang bank).</li></ul>'
          : '<h3>Hold Up to 3 Cards</h3><p>Store tactical cards in your hand and trigger them during your turn:</p><ul><li>⚔️ <strong>Attack Cards</strong>: Hostile Takeover (force buy at 1.5x), Sabotage (destroy building level), Tax Audit (levy 20% target net worth), Cyber Attack (disable skill for 3 turns).</li><li>🛡️ <strong>Defense Cards</strong>: Firewall (block 1 incoming attack), Insurance (skip rent 1x), Legal Shield (immune to hostile buy 2 turns), Bail Bond (free jail exit).</li><li>🌍 <strong>Economy Cards</strong>: Market Manipulation (shift stock ±30%), Stimulus (all get $200), Embargo (freeze district rent), Gentrification (+50% district rent).</li><li>🚀 <strong>Special Cards</strong>: Teleport (move anywhere), Reverse (invert direction), Double Dice (roll 3 dice), Bank Hack (steal cash from bank).</li></ul>'
      },
      {
        title: lang === 'id' ? '📦 Kartu Chance & Chest' : '📦 Chance & Chest Cards',
        content: lang === 'id'
          ? '<h3>Event Instan di Petak</h3><p>Mendarat di petak ❓ Chance atau 📦 Chest akan memicu kartu instan:</p><ul><li>🚄 <strong>Ekspres Metro</strong> — Maju langsung ke Stasiun Hyperloop terdekat.</li><li>⚡ <strong>Koneksi Jaringan</strong> — Maju ke Pembangkit Listrik terdekat.</li><li>💵 <strong>Airdrop Kripto & Bonus Bank</strong> — Terima suntikan likuiditas $150 hingga $400.</li><li>💸 <strong>Denda Audit & Perawatan</strong> — Bayar biaya perawatan server/listrik per properti yang dimiliki.</li><li>🌌 <strong>Warp Glitch</strong> — Berpindah seketika ke Zona Kuantum petak 26.</li><li>🚨 <strong>Razia Penjara</strong> — Ditahan di sel tahanan tanpa melewati GO.</li></ul>'
          : '<h3>Instant Tile Events</h3><p>Landing on ❓ Chance or 📦 Chest triggers instant cards:</p><ul><li>🚄 <strong>Hyperloop Express</strong> — Advance to the nearest Metro Station.</li><li>⚡ <strong>Grid Connection</strong> — Advance to the nearest Power Utility.</li><li>💵 <strong>Crypto Airdrops & Grants</strong> — Receive cash injections from $150 to $400.</li><li>💸 <strong>Maintenance & Audit Fines</strong> — Pay electrical/server fees per property owned.</li><li>🌌 <strong>Warp Glitch</strong> — Teleport directly to Quantum Zone tile 26.</li><li>🚨 <strong>Police Raid</strong> — Go directly to jail without collecting GO salary.</li></ul>'
      },
      {
        title: lang === 'id' ? '🌍 16 Event Ekonomi' : '🌍 16 Economy Events',
        content: lang === 'id'
          ? '<h3>Event Global Tiap 4-5 Giliran</h3><ul><li>📈 <strong>Bull Market</strong> — Sewa +20%, harga properti +30%</li><li>📉 <strong>Market Crash</strong> — Harga properti -40%, saham anjlok</li><li>💸 <strong>Inflasi</strong> — Semua biaya sewa, bangun, & pajak +25%</li><li>🏗️ <strong>Boom Konstruksi</strong> — Biaya bangun didiskon -50%</li><li>🦠 <strong>Pandemi</strong> — Sewa turun -50%, transaksi trading dilarang</li><li>⚡ <strong>Revolusi Teknologi</strong> — Revenue utility pembangkit x3</li><li>🏛️ <strong>Bailout</strong> — Pemain termiskin mendapat bantuan kas $500</li><li>🔥 <strong>Kebakaran</strong> — 1 properti acak kehilangan 1 level bangunan</li><li>💎 <strong>Demam Emas</strong> — Bonus lewat GO naik 2x lipat ($400)</li><li>🌪️ <strong>Bencana Alam</strong> — Seluruh pemain membayar $200 perbaikan</li><li>🛡️ <strong>Perang Siber</strong> — Sistem bank diserang, semua bayar $150 & saham tech anjlok</li><li>🚀 <strong>Ledakan Kripto</strong> — Dividen kas +$300 & sewa distrik kuantum +50%</li><li>🎉 <strong>Tax Holiday</strong> — Bebas pajak (0%) & diskon upgrade -30%</li><li>🏢 <strong>Mega Merger</strong> — Sewa stasiun dan utility naik 2.5x lipat</li><li>⚡ <strong>Anomali Kuantum</strong> — Cooldown seluruh skill pemain di-reset seketika</li><li>💥 <strong>Hiperinflasi</strong> — Sewa +40%, harga beli +50%, bonus GO $600</li></ul>'
          : '<h3>Global Events Every 4-5 Turns</h3><ul><li>📈 <strong>Bull Market</strong> — Rent +20%, property prices +30%</li><li>📉 <strong>Market Crash</strong> — Property prices -40%, stocks plummet</li><li>💸 <strong>Inflation</strong> — Rent, building, and tax costs +25%</li><li>🏗️ <strong>Construction Boom</strong> — Building costs slashed by -50%</li><li>🦠 <strong>Pandemic</strong> — Rent -50%, trading prohibited</li><li>⚡ <strong>Tech Revolution</strong> — Utility revenues multiplied by 3x</li><li>🏛️ <strong>Bailout</strong> — Poorest player receives $500 support grant</li><li>🔥 <strong>Fire Disaster</strong> — 1 random property loses building level</li><li>💎 <strong>Gold Rush</strong> — GO pass bonus doubled ($400)</li><li>🌪️ <strong>Natural Disaster</strong> — All players pay $200 emergency relief</li><li>🛡️ <strong>Cyber Warfare</strong> — Bank systems hit, all lose $150 & tech stocks dive</li><li>🚀 <strong>Crypto Boom</strong> — Cash dividend +$300 & Quantum rent +50%</li><li>🎉 <strong>Tax Holiday</strong> — Zero taxes (0%) & -30% build upgrade discount</li><li>🏢 <strong>Mega Merger</strong> — Metro and Utility rents multiplied by 2.5x</li><li>⚡ <strong>Quantum Glitch</strong> — All character skill cooldowns instantly reset</li><li>💥 <strong>Hyperinflation</strong> — Rent +40%, purchase prices +50%, GO bonus $600</li></ul>'
      },
      {
        title: lang === 'id' ? '🌦️ 11 Sistem Cuaca' : '🌦️ 11 Weather Systems',
        content: lang === 'id'
          ? '<h3>Cuaca Dinamis Per Distrik</h3><ul><li>☀️ <strong>Cerah</strong> — Sewa distrik +15%</li><li>🌧️ <strong>Hujan</strong> — Sewa distrik turun -20%</li><li>⛈️ <strong>Badai</strong> — Dilarang membangun, 10% peluang bangunan rusak</li><li>🌫️ <strong>Kabut Tebal</strong> — Informasi properti lawan disamarkan</li><li>❄️ <strong>Badai Salju</strong> — Pergerakan dadu dipotong -2 langkah</li><li>🔥 <strong>Gelombang Panas</strong> — Biaya utility x2, denda pendingin $50/giliran</li><li>🌈 <strong>Langit Cerah</strong> — Seluruh bonus penghasilan +10%</li><li>🌌 <strong>Aurora Kuantum</strong> — Dadu +1 langkah, sinergi distrik sewa +25%</li><li>🧪 <strong>Hujan Asam</strong> — Dilarang bangun, biaya audit $30/bangunan saat lewat GO</li><li>🌑 <strong>Gerhana Matahari</strong> — Diskon Pasar Gelap 25%, sewa semua properti -30%</li><li>💨 <strong>Asap Siber</strong> — Fitur trading terkunci, revenue utility naik 1.5x</li></ul>'
          : '<h3>Dynamic District Weather</h3><ul><li>☀️ <strong>Sunny</strong> — District rent +15%</li><li>🌧️ <strong>Rain</strong> — District rent reduced by -20%</li><li>⛈️ <strong>Storm</strong> — Construction blocked, 10% chance of building damage</li><li>🌫️ <strong>Fog</strong> — Opponent tile info concealed</li><li>❄️ <strong>Blizzard</strong> — Dice movement reduced by -2 steps</li><li>🔥 <strong>Heatwave</strong> — Utility cost x2, cooling fee $50/turn</li><li>🌈 <strong>Rainbow Skies</strong> — All financial bonuses +10%</li><li>🌌 <strong>Quantum Aurora</strong> — Dice movement +1, district synergy rent +25%</li><li>🧪 <strong>Acid Rain</strong> — Construction blocked, $30 audit fee per building on GO</li><li>🌑 <strong>Solar Eclipse</strong> — Black Market 25% discount, all rent -30%</li><li>💨 <strong>Cyber Smog</strong> — Trading locked, utility revenue 1.5x</li></ul>'
      },
      {
        title: lang === 'id' ? '🏘️ 6 Distrik & Sinergi' : '🏘️ Districts & Synergy',
        content: lang === 'id'
          ? '<h3>Bonus Penguasaan Wilayah</h3><p>Papan terbagi menjadi 6 distrik bertema:</p><ul><li>🟣 <strong>Neon Utara</strong> • 🔵 <strong>Cyber Timur</strong> • 🔴 <strong>Shadow Selatan</strong></li><li>🟢 <strong>Data Barat</strong> • 🟡 <strong>Pusat Finansial</strong> • 🌌 <strong>Zona Kuantum</strong></li></ul><h3>Tingkatan Sinergi Distrik</h3><ul><li>🔹 <strong>Minor Synergy</strong> (Miliki 2 properti di distrik yang sama): Sewa +15%.</li><li>🔷 <strong>Major Synergy</strong> (Miliki 3 properti): Sewa +30%, diskon bangun -10%.</li><li>👑 <strong>District Lord</strong> (Miliki 4+ properti): Sewa melonjak +50% di seluruh distrik tersebut!</li></ul>'
          : '<h3>Regional Domination Bonuses</h3><p>The board is divided into 6 themed districts:</p><ul><li>🟣 <strong>Neon North</strong> • 🔵 <strong>Cyber East</strong> • 🔴 <strong>Shadow South</strong></li><li>🟢 <strong>Data West</strong> • 🟡 <strong>Financial Core</strong> • 🌌 <strong>Quantum Zone</strong></li></ul><h3>Synergy Tiers</h3><ul><li>🔹 <strong>Minor Synergy</strong> (Own 2 properties in same district): Rent +15%.</li><li>🔷 <strong>Major Synergy</strong> (Own 3 properties): Rent +30%, build discount -10%.</li><li>👑 <strong>District Lord</strong> (Own 4+ properties): Rent surges by +50% across the entire district!</li></ul>'
      },
      {
        title: lang === 'id' ? '🏴 Pasar Gelap & Risiko' : '🏴 Black Market & Risk',
        content: lang === 'id'
          ? '<h3>Aset Ilegal & Peluang Tertangkap</h3><p>Mendarat di petak Pasar Gelap membuka akses item rahasia berisiko razia polisi:</p><ul><li>🕵️ <strong>Alat Mata-mata</strong> ($300, 20% risiko) — Mengintip kartu dan saldo kas lawan.</li><li>💵 <strong>Uang Palsu</strong> ($200, 30% risiko) — Dapat $500 instan, tapi jika tertangkap langsung masuk penjara!</li><li>🔓 <strong>Kunci Master</strong> ($250, 15% risiko) — Melewati kewajiban sewa 1x.</li><li>📋 <strong>Sertifikat Palsu</strong> ($400, 25% risiko) — Klaim 1 properti kosong gratis.</li><li>🛡️ <strong>Perlindungan Sindikat</strong> ($350, 0% risiko) — Kebal kartu serangan lawan selama 3 giliran.</li><li>💊 <strong>Stimulan Kuantum</strong> ($150, 10% risiko) — Me-reset cooldown skill karakter seketika.</li></ul>'
          : '<h3>Illegal Gear & Police Bust Risk</h3><p>Landing on Black Market tiles unlocks powerful contraband items with bust risks:</p><ul><li>🕵️ <strong>Spy Device</strong> ($300, 20% risk) — Inspect opponent hand and hidden cash.</li><li>💵 <strong>Counterfeit Cash</strong> ($200, 30% risk) — Gain $500 instantly, but failure sends you to jail!</li><li>🔓 <strong>Master Key</strong> ($250, 15% risk) — Skip 1 upcoming rent payment.</li><li>📋 <strong>Forged Deed</strong> ($400, 25% risk) — Claim 1 unowned property for free.</li><li>🛡️ <strong>Syndicate Protection</strong> ($350, 0% risk) — 100% immune to attack cards for 3 turns.</li><li>💊 <strong>Quantum Stimulant</strong> ($150, 10% risk) — Instantly reset active skill cooldown.</li></ul>'
      },
      {
        title: lang === 'id' ? '🤝 Joint Venture (JV)' : '🤝 Joint Venture (JV)',
        content: lang === 'id'
          ? '<h3>Kerjasama Kepemilikan Properti</h3><p>Dua pemain dapat berkolaborasi mengelola aset bersama:</p><ul><li>📝 <strong>Ajukan JV</strong> — Tawarkan kerjasama properti ke pemain lain dengan rasio bagi hasil (50/50, 60/40, atau 70/30).</li><li>💰 <strong>Sewa Berbagi + Bonus</strong> — Sewa dibagi proporsional dengan ekstra bonus dividen kemitraan +20%!</li><li>🏗️ <strong>Biaya Bangun Bersama</strong> — Biaya upgrade rumah/hotel dibagi sesuai porsi kepemilikan.</li><li>💔 <strong>Pembubaran JV</strong> — Salah satu pihak dapat membeli sisa saham rekanan untuk kepemilikan penuh.</li></ul><p><em>Maksimal 3 kontrak Joint Venture aktif per pemain.</em></p>'
          : '<h3>Co-Ownership Partnerships</h3><p>Two players can collaborate to own and develop properties:</p><ul><li>📝 <strong>Propose JV</strong> — Offer co-ownership with split ratios (50/50, 60/40, or 70/30).</li><li>💰 <strong>Shared Income + Bonus</strong> — Rent is shared by split ratio plus a +20% partnership bonus!</li><li>🏗️ <strong>Shared Upgrades</strong> — House and hotel construction costs are shared by split ratio.</li><li>💔 <strong>Buyout & Dissolve</strong> — Either partner can buy out the remaining share for full ownership.</li></ul><p><em>Max 3 active JV contracts per player.</em></p>'
      },
      {
        title: lang === 'id' ? '🎯 Misi Rahasia' : '🎯 Secret Objectives',
        content: lang === 'id'
          ? '<h3>Target Kemenangan Taktis</h3><p>Setiap pemain mendapatkan misi rahasia di awal permainan. Capai targetnya untuk bonus kas raksasa:</p><ul><li>🏘️ <strong>Baron Distrik</strong> — Miliki 4+ properti di 1 distrik (Hadiah: +$800).</li><li>🎰 <strong>Raja Kasino</strong> — Bangun minimal 2 Kasino (Hadiah: +$600).</li><li>📈 <strong>Konglomerat Saham</strong> — Miliki total portofolio saham $1000+ (Hadiah: +$500).</li><li>👑 <strong>Raja Monopoli</strong> — Kuasai 2 grup warna monopoli penuh (Hadiah: +$900).</li><li>🤝 <strong>Master Kerjasama</strong> — Jalankan 2 Joint Venture aktif (Hadiah: +$500).</li><li>💰 <strong>Raja Likuiditas</strong> — Capai saldo kas $3000 tanpa pinjaman aktif (Hadiah: +$750).</li></ul>'
          : '<h3>Secret Victory Milestones</h3><p>Players receive hidden objectives at the start. Complete them for massive cash rewards:</p><ul><li>🏘️ <strong>District Baron</strong> — Own 4+ properties in 1 district (Reward: +$800).</li><li>🎰 <strong>Casino Mogul</strong> — Build at least 2 Casinos (Reward: +$600).</li><li>📈 <strong>Stock Tycoon</strong> — Hold $1000+ in stock market value (Reward: +$500).</li><li>👑 <strong>Monopoly King</strong> — Control 2 complete color monopolies (Reward: +$900).</li><li>🤝 <strong>JV Master</strong> — Maintain 2 active Joint Ventures (Reward: +$500).</li><li>💰 <strong>Cash King</strong> — Reach $3000 cash with zero active debts (Reward: +$750).</li></ul>'
      },
      {
        title: lang === 'id' ? '💳 3 Jenis Pinjaman' : '💳 3 Loan Types',
        content: lang === 'id'
          ? '<h3>Manajemen Hutang & Likuiditas</h3><ul><li>🏦 <strong>Pinjaman Bank</strong>: Bunga rendah 5%/giliran, limit maks $1000, tenor 10 giliran. Banker hanya kena bunga 3%!</li><li>🦈 <strong>Pinjaman Rentenir / Shark</strong>: Tanpa batas plafon dana, bunga tinggi 15%/giliran, tenor ketat 5 giliran.</li><li>🏠 <strong>Gadai Properti / Mortgage</strong>: Bunga 0%, terima 50% nilai properti instan (properti terkunci tidak menghasilkan sewa sampai ditebus).</li></ul><h3>Risiko Gagal Bayar (Default)</h3><p>Jika tenor habis tanpa pelunasan:<br>• Bank: Properti disita paksa oleh pengadilan.<br>• Rentenir: Denda 2x lipat atau penyitaan properti termahal!</p>'
          : '<h3>Debt & Liquidity Management</h3><ul><li>🏦 <strong>Bank Loan</strong>: Low 5% interest/turn, max $1000 limit, 10-turn term. Banker enjoys 3% rate!</li><li>🦈 <strong>Loan Shark</strong>: Unlimited liquidity, aggressive 15% interest/turn, 5-turn term.</li><li>🏠 <strong>Property Mortgage</strong>: 0% interest, receive 50% property value (rent frozen until unmortgaged).</li></ul><h3>Default Penalties</h3><p>Failing to repay before term expires:<br>• Bank: Forecloses on collateral property.<br>• Shark: Demands 2x debt or seizes your highest-value property!</p>'
      },
      {
        title: lang === 'id' ? '⚖️ Sistem Lelang' : '⚖️ Auction System',
        content: lang === 'id'
          ? '<h3>Lelang Terbuka & Blind Bidding</h3><p>Saat pemain menolak membeli petak yang dipijak, properti masuk ke ruang lelang real-time:</p><ul><li>⏱️ <strong>Timer Bid</strong> — 15 detik waktu berpikir per ronde tawaran.</li><li>💰 <strong>Penawaran Minimum</strong> — Tawaran baru harus minimal 10% lebih tinggi dari penawaran sebelumnya.</li><li>🤖 <strong>Strategi AI Bot</strong> — Bot AI akan menganalisis kebutuhan monopoli distrik untuk menentukan harga lelang tertinggi.</li><li>🛡️ <strong>Proteksi Guardian</strong> — Karakter Guardian kebal dari lelang paksa propertinya.</li></ul>'
          : '<h3>Open Bidding & Blind Auctions</h3><p>When a player declines purchasing an unowned tile, it enters live auction:</p><ul><li>⏱️ <strong>Bid Timer</strong> — 15-second decision timer per bidding round.</li><li>💰 <strong>Minimum Increment</strong> — New bids must exceed previous bid by at least 10%.</li><li>🤖 <strong>AI Bot Bidding</strong> — AI players bid dynamically based on district monopoly values.</li><li>🛡️ <strong>Guardian Perk</strong> — Guardian character is immune to forced property auctions.</li></ul>'
      },
      {
        title: lang === 'id' ? '📊 Pasar Saham Cyber' : '📊 Cyber Stock Market',
        content: lang === 'id'
          ? '<h3>4 Saham Korporasi Neon</h3><ul><li>💜 <strong>NeonCorp</strong> — Harga dasar $100, volatilitas moderat, cocok untuk investasi jangka menengah.</li><li>💙 <strong>CyberTech</strong> — Harga dasar $80, volatilitas tinggi, melonjak saat Revolusi Teknologi.</li><li>💚 <strong>DataFlow</strong> — Harga dasar $120, volatilitas rendah & dividen stabil.</li><li>💛 <strong>QuantumAI</strong> — Harga dasar $60, volatilitas sangat ekstrem (potensi cuan 300% atau anjlok 70%).</li></ul><h3>Mekanik Dividen</h3><p>Dividen tunai dibayarkan setiap 10 ronde giliran. Skill Trader dapat membaca sentimen pasar sebelum grafik harga bergerak!</p>'
          : '<h3>4 Corporate Stocks</h3><ul><li>💜 <strong>NeonCorp</strong> — Base $100, moderate volatility for balanced growth.</li><li>💙 <strong>CyberTech</strong> — Base $80, high volatility, skyrockets during Tech Revolution.</li><li>💚 <strong>DataFlow</strong> — Base $120, low risk & steady dividend payout.</li><li>💛 <strong>QuantumAI</strong> — Base $60, extreme volatility (up to 300% swings).</li></ul><h3>Dividend Cycles</h3><p>Cash dividends payout every 10 turns. Trader character can foresee market shifts before price tickers update!</p>'
      },
      {
        title: lang === 'id' ? '💬 Fitur Chat Room & Live Banter' : '💬 Room Chat & Live Banter',
        content: lang === 'id'
          ? '<h3>Komunikasi Real-Time di Room & Game</h3><p>Mengobrol langsung dengan teman atau respon otomatis dari Bot AI yang cerdas!</p><h3>Fitur-Fitur Chat</h3><ul><li>🚪 <strong>Room Lobby Chat</strong> — Kirim pesan, atur strategi, dan saling sapa sebelum permainan dimulai.</li><li>🎮 <strong>In-Game Floating Drawer</strong> — Tekan tombol <code>💬</code> di pojok kanan atas untuk membuka live chat tanpa mengganggu papan.</li><li>⚡ <strong>Quick Taunt Chips</strong> — Tombol cepat satu-klik untuk reaksi kilat (👋 Halo, 🔥 Gas, 💀 Boncos, 🤝 Trade, 😎 GG).</li><li>🤖 <strong>AI Bot Dynamic Banter</strong> — Bot AI akan merespon obrolan, mengomentari lemparan dadu double, sewa tinggi, dan momen dramatis permainan!</li><li>🔔 <strong>Badge & Notifikasi Melayang</strong> — Pesan masuk saat chat ditutup akan memicu gelembung notifikasi di atas layar.</li></ul>'
          : '<h3>Real-Time Room & In-Game Communication</h3><p>Chat directly with peers and receive witty live banter from intelligent AI bots!</p><h3>Chat Highlights</h3><ul><li>🚪 <strong>Room Lobby Chat</strong> — Coordinate strategies and greet players before launching the match.</li><li>🎮 <strong>In-Game Floating Drawer</strong> — Tap the <code>💬</code> button on the top right HUD to open live chat seamlessly without obstructing the board.</li><li>⚡ <strong>Quick Taunt Chips</strong> — One-tap rapid responses for instant reactions (👋 Hey, 🔥 Let\'s go, 💀 Ouch, 🤝 Trade, 😎 GG).</li><li>🤖 <strong>AI Bot Dynamic Banter</strong> — AI players actively participate in chat, reacting to double rolls, high rents, and bankruptcy moments!</li><li>🔔 <strong>Badges & Floating Previews</strong> — Incoming messages while closed trigger pop-up preview banners at the top of the screen.</li></ul>'
      },
      {
        title: lang === 'id' ? '💡 Tips & Strategi Hardcore' : '💡 Hardcore Strategy',
        content: lang === 'id'
          ? '<h3>Kunci Kemenangan Juara</h3><ul><li>💰 <strong>Penyangga Kas Minimal $300</strong> — Jangan habiskan seluruh uang saat membeli properti; selalu sisakan bantalan sewa.</li><li>🏘️ <strong>Prioritas Monopoli & Sinergi</strong> — 1 monopoli dengan 3 rumah jauh lebih mematikan daripada 10 properti tanpa monopoli.</li><li>📈 <strong>Waktu Saham</strong> — Borong saham saat Market Crash / Perang Siber, jual saat Bull Market atau Kripto Boom.</li><li>🏰 <strong>Benteng di Properti Termahal</strong> — Lindungi hotel termahalmu dengan Benteng agar imun dari sabotase dan kebakaran!</li><li>🃏 <strong>Simpan Firewall</strong> — Selalu simpan minimal 1 kartu pertahanan di tangan untuk mengantisipasi Takeover lawan.</li><li>🤝 <strong>Gunakan Joint Venture Taktis</strong> — Kunci lawan ke dalam JV di propertimu untuk menjamin cash flow stabil.</li></ul>'
          : '<h3>Mastery Tips for Victory</h3><ul><li>💰 <strong>Maintain $300+ Cash Buffer</strong> — Never spend down to zero; always prepare for emergency rents.</li><li>🏘️ <strong>Monopoly & Synergy First</strong> — 1 monopoly with 3 houses is deadlier than 10 scattered unmonopolized tiles.</li><li>📈 <strong>Stock Market Timing</strong> — Buy heavily during Crash / Cyber Warfare; cash out during Bull Market or Crypto Boom.</li><li>🏰 <strong>Fortress Expensive Assets</strong> — Build Fortress on high-tier hotels to grant immunity against sabotage and fires!</li><li>🃏 <strong>Hand Management</strong> — Always keep a Firewall card in reserve against hostile takeovers.</li><li>🤝 <strong>Strategic Joint Ventures</strong> — Bind opponents into JV contracts on high-traffic tiles for guaranteed shared income.</li></ul>'
      }
    ];
    return pages;
  }

  function init() {
    const pages = getPages();
    const container = document.querySelector('.guide-pages');
    if (!container) return;

    // Clear and recreate pages
    container.innerHTML = '';
    pages.forEach((page, i) => {
      const div = document.createElement('div');
      div.className = 'guide-page' + (i === 0 ? ' active' : '');
      div.dataset.page = i + 1;
      div.innerHTML = '<h3 class="guide-page-title" style="color:var(--neon-cyan);margin-bottom:1rem;font-size:1.3rem;">' + page.title + '</h3>' + page.content;
      container.appendChild(div);
    });

    // Setup dots
    const dotsContainer = document.getElementById('guide-dots');
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      pages.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'guide-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => showPage(i));
        dotsContainer.appendChild(dot);
      });
    }

    // Setup prev/next
    document.getElementById('btn-guide-prev')?.addEventListener('click', prevPage);
    document.getElementById('btn-guide-next')?.addEventListener('click', nextPage);

    currentPage = 0;
  }

  function showPage(index) {
    const pages = document.querySelectorAll('.guide-page');
    const dots = document.querySelectorAll('.guide-dot');
    if (index < 0 || index >= pages.length) return;
    currentPage = index;
    pages.forEach((p, i) => p.classList.toggle('active', i === index));
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }

  function nextPage() { showPage(currentPage + 1); }
  function prevPage() { showPage(currentPage - 1); }
  function updateLanguage() { init(); }

  return { init, showPage, nextPage, prevPage, getPages, updateLanguage };
})();
