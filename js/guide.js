const Guide = (function() {
  'use strict';
  let currentPage = 0;

  function getPages() {
    const lang = (typeof Lang !== 'undefined') ? Lang.getLang() : 'id';
    const pages = [
      {
        title: lang === 'id' ? '🎲 Dasar Permainan' : '🎲 Game Basics',
        content: lang === 'id'
          ? '<h3>Tujuan Permainan</h3><p>Jadilah konglomerat cyberpunk terkaya atau pemain terakhir yang bertahan tanpa bangkrut! Kumpulkan properti strategis, bangun mega struktur bisnis, dan dominasi ekonomi kota neon.</p><h3>Alur Giliran Lengkap</h3><ul><li>🎲 <strong>Lempar Dadu</strong> — Gerakkan bidak token sesuai total angka dadu 3D physics. Jika lemparan menghasilkan Double, kamu mendapat giliran lempar ekstra (maks 3x berturut-turut sebelum masuk penjara).</li><li>📍 <strong>Aksi Petak</strong> — Beli properti tak bertuan, bayar sewa jika milik lawan, tarik kartu Chance/Chest, atau mendarat di petak khusus (Pasar Gelap, Pajak, GO, Penjara).</li><li>⚡ <strong>Aksi Bebas</strong> — Lakukan upgrade bangunan (Rumah/Hotel/Mall/HQ/Kasino/Benteng), ajukan pertukaran (Trade), transaksi pasar saham, ajukan pinjaman/gadai, beli gadget pasar gelap, bentuk Joint Venture, atau aktifkan Skill Karakter.</li><li>⏹️ <strong>Akhiri Giliran</strong> — Oper giliran ke pemain berikutnya setelah seluruh transaksi selesai.</li></ul><h3>Kondisi Menang</h3><p>Pemain terakhir yang bertahan saat seluruh lawan bangkrut dinyatakan <strong>MENANG MUTLAK</strong>, atau pemain dengan Total Net Worth (Uang Kas + Properti + Portofolio Saham + Bangunan) tertinggi saat batas ronde tercapai.</p>'
          : '<h3>Game Objective</h3><p>Become the wealthiest cyberpunk tycoon or the last player standing without going bankrupt! Acquire prime properties, construct mega business structures, and dominate the neon metropolis economy.</p><h3>Complete Turn Flow</h3><ul><li>🎲 <strong>Roll Dice</strong> — Move token according to 3D physics dice total. Rolling doubles grants an extra roll (up to 3 consecutive doubles before being jailed for speeding).</li><li>📍 <strong>Tile Action</strong> — Purchase unowned property, pay rent if owned by rival, draw Chance/Chest cards, or trigger special tiles (Black Market, Taxes, GO, Jail).</li><li>⚡ <strong>Free Actions</strong> — Build structures (House/Hotel/Mall/HQ/Casino/Fortress), initiate property trade, trade corporate stocks, apply for loans/mortgages, buy contraband, form Joint Ventures, or trigger Character Skills.</li><li>⏹️ <strong>End Turn</strong> — Pass control to the next player once all actions are completed.</li></ul><h3>Winning Conditions</h3><p>The last surviving player after all opponents go bankrupt achieves <strong>ABSOLUTE VICTORY</strong>, or the player with the highest Total Net Worth (Cash + Real Estate + Stocks + Buildings) when the round limit is reached.</p>'
      },
      {
        title: lang === 'id' ? '🗺️ Papan 52 Petak & 6 Distrik' : '🗺️ 52-Tile Board & 6 Districts',
        content: lang === 'id'
          ? '<h3>Papan 52 Petak Berdaya Tinggi</h3><p>Papan permainan memiliki total <strong>52 petak persegi</strong> (13 petak per sisi) yang terbagi ke dalam 6 distrik bertema cyberpunk:</p><ul><li>🟣 <strong>Neon Utara</strong> (Petak 1–12) — Distrik hiburan dan lampu neon gemerlap dengan sewa awal yang stabil.</li><li>🔵 <strong>Cyber Timur</strong> (Petak 14–25) — Pusat teknologi tinggi, robotik, dan semikonduktor.</li><li>🌌 <strong>Zona Kuantum</strong> (Petak 26–38) — Wilayah anomali eksperimental dengan multiplier sewa paling fluktuatif.</li><li>🔴 <strong>Shadow Selatan</strong> (Petak 40–51) — Wilayah industri bawah tanah, rentenir, dan pasar gelap.</li><li>🟡 <strong>Pusat Finansial</strong> & 🟢 <strong>Data Barat</strong> — Hub perbankan, server data, dan korporasi multinasional.</li></ul><h3>Jenis-Jenis Petak Khusus</h3><ul><li>🏠 <strong>Properti Distrik</strong> (32) — Dapat dibeli, dimonopoli, dan ditingkatkan.</li><li>🚄 <strong>Stasiun Hyperloop</strong> (4) — Sewa bertingkat eksponensial ($50 → $100 → $200 → $400).</li><li>⚡ <strong>Pembangkit Listrik / Utility</strong> (2) — Sewa dikali lemparan dadu (4x jika punya 1, 10x jika punya 2).</li><li>❓ <strong>Chance & 📦 Chest</strong> (8) — Kartu event taktis dan dana likuiditas.</li><li>💸 <strong>Pajak Kota</strong> (3) — Bayar pajak 10% atau denda flat ke perbendaharaan bank.</li><li>🏴 <strong>Pasar Gelap</strong> (3) — Tempat rahasia untuk membeli item selundupan berisiko.</li><li>🚀 <strong>GO</strong> — Terima gaji likuiditas $200 setiap kali melewati atau mendarat.</li><li>🔒 <strong>Penjara / Sel Tahanan</strong> — Ditahan 3 giliran jika terkena razia atau tertangkap polisi.</li></ul>'
          : '<h3>52 High-Density Board Tiles</h3><p>The board features <strong>52 square tiles</strong> (13 tiles per side) divided across 6 thematic cyberpunk districts:</p><ul><li>🟣 <strong>Neon North</strong> (Tiles 1–12) — Vibrant entertainment strip with balanced initial rent yields.</li><li>🔵 <strong>Cyber East</strong> (Tiles 14–25) — High-tech robotics and semiconductor corridor.</li><li>🌌 <strong>Quantum Zone</strong> (Tiles 26–38) — Experimental anomalous sector with high-volatility multipliers.</li><li>🔴 <strong>Shadow South</strong> (Tiles 40–51) — Gritty underground industrial quarter and black market hub.</li><li>🟡 <strong>Financial Core</strong> & 🟢 <strong>Data West</strong> — Megacorp banking centers and data server hubs.</li></ul><h3>Special Tile Types</h3><ul><li>🏠 <strong>District Properties</strong> (32) — Available for purchase, monopoly, and development.</li><li>🚄 <strong>Hyperloop Stations</strong> (4) — Tiered exponential rent ($50 → $100 → $200 → $400).</li><li>⚡ <strong>Power Utilities</strong> (2) — Rent multiplied by dice roll (4x for 1 utility, 10x for both).</li><li>❓ <strong>Chance & 📦 Chest</strong> (8) — Tactical event cards and treasury dividends.</li><li>💸 <strong>City Taxes</strong> (3) — Pay 10% income tax or flat levy to bank.</li><li>🏴 <strong>Black Market</strong> (3) — Underground haven for contraband gadgets.</li><li>🚀 <strong>GO</strong> — Collect $200 baseline salary on every pass or landing.</li><li>🔒 <strong>Jail Precinct</strong> — Detained for 3 turns upon police raids or severe penalties.</li></ul>'
      },
      {
        title: lang === 'id' ? '🏠 Properti & Formula Sewa 7-Tier' : '🏠 Properties & 7-Tier Rent',
        content: lang === 'id'
          ? '<h3>Mekanisme Pembelian & Monopoli</h3><p>Saat mendarat di properti kosong, kamu dapat membelinya langsung. Jika ditolak, properti akan dilelang terbuka ke semua pemain.</p><h3>Monopoli Grup Warna</h3><p>Menguasai seluruh properti dalam satu grup warna memberikan <strong>Monopoli Penuh</strong>. Sewa dasar tanpa bangunan berlipat ganda (2x) dan izin mendirikan <strong>HOTEL</strong> terbuka!</p><h3>Formula Sewa 7-Tier Canggih</h3><p>Sewa dihitung secara dinamis melalui formula WebAssembly 7 lapis:</p><code>Sewa = Base × Bangunan × Monopoli (2x) × Sinergi Distrik × Event Ekonomi × Cuaca × Skill Karakter</code><p>Contoh: Properti sewa dasar $50 dengan Hotel (15x), Monopoli (2x), Major Synergy (+30%), dan Bull Market (+20%) akan menghasilkan sewa mematikan sebesar <strong>$2,340</strong>!</p>'
          : '<h3>Acquisition & Monopoly Rules</h3><p>When landing on unowned real estate, purchase it directly. If declined, it goes directly to open public auction.</p><h3>Color Group Monopoly</h3><p>Owning all properties in a color group grants <strong>Full Monopoly</strong>. Unimproved base rent doubles (2x) and top-tier <strong>HOTEL</strong> construction is unlocked!</p><h3>7-Tier WebAssembly Rent Matrix</h3><p>Rent is dynamically calculated via our 7-layer WebAssembly engine:</p><code>Rent = Base × Building × Monopoly (2x) × District Synergy × Economy Event × Weather × Character Skill</code><p>Example: A $50 base rent property with Hotel (15x), Monopoly (2x), Major Synergy (+30%), and Bull Market (+20%) deals a devastating <strong>$2,340</strong> rent strike!</p>'
      },
      {
        title: lang === 'id' ? '🏗️ 5 Jalur Konstruksi Bangunan' : '🏗️ 5 Construction Paths',
        content: lang === 'id'
          ? '<h3>Fleksibilitas Pembangunan</h3><p>Pemain dapat membangun <strong>hingga 4 Rumah</strong> di properti sendiri kapan saja tanpa harus menunggu monopoli lengkap. Dengan Monopoli Penuh, kamu dapat memilih salah satu dari 5 jalur spesialisasi:</p><ul><li>🏨 <strong>Hotel</strong> (4 Rumah + Monopoli → Hotel) — Penghasil sewa puncak tertinggi (hingga 40x sewa dasar).</li><li>🏬 <strong>Mall Bisnis</strong> (2 Rumah → Mall) — Memberikan dividen pasif tunai +$50 ke kas setiap giliranmu dimulai.</li><li>🏢 <strong>Markas Besar / HQ</strong> (2 Rumah → HQ) — Menggandakan (2x) efektivitas skill aktif karakter saat berada di petak ini.</li><li>🎰 <strong>Kasino Mewah</strong> (1 Rumah → Kasino) — Sewa acak bertaruh antara 0.5x hingga 3.0x lipat saat lawan mendarat.</li><li>🏰 <strong>Benteng / Fortress</strong> (3 Rumah → Benteng) — Memberikan kekebalan 100% dari kartu sabotase, kebakaran, dan bencana alam!</li></ul>'
          : '<h3>Construction Flexibility</h3><p>You can build <strong>up to 4 Houses</strong> anytime without waiting for a monopoly. With Full Monopoly, choose one of 5 specialized construction branches:</p><ul><li>🏨 <strong>Hotel</strong> (4 Houses + Monopoly → Hotel) — Maximum peak rent multiplier (up to 40x base rent).</li><li>🏬 <strong>Commercial Mall</strong> (2 Houses → Mall) — Generates +$50 passive cash dividends at the start of your turn.</li><li>🏢 <strong>Corporate HQ</strong> (2 Houses → HQ) — Doubles (2x) active character skill effects on this tile.</li><li>🎰 <strong>Casino</strong> (1 House → Casino) — Gambles randomized rent multiplier between 0.5x and 3.0x on arrival.</li><li>🏰 <strong>Fortress</strong> (3 Houses → Fortress) — Grants 100% complete immunity against sabotages, fires, and natural disasters!</li></ul>'
      },
      {
        title: lang === 'id' ? '⚡ 12 Karakter & Skill Unik' : '⚡ 12 Unique Characters & Skills',
        content: lang === 'id'
          ? '<h3>Daftar 12 Karakter Spesialisasi Cyberpunk</h3><ul>' +
            '<li>💼 <strong>Banker</strong> — Pasif: Bunga pinjaman bank hanya 3% | Aktif: Bekukan sewa 1 properti lawan selama 3 giliran.</li>' +
            '<li>🔧 <strong>Engineer</strong> — Pasif: Diskon 20% biaya konstruksi | Aktif: Upgrade 1 bangunan properti sendiri gratis.</li>' +
            '<li>📈 <strong>Trader</strong> — Pasif: Nilai tukar barter aset +15% | Aktif: Memaksa transaksi barter properti dengan lawan.</li>' +
            '<li>🎩 <strong>Politician</strong> — Pasif: Kebal seluruh petak pajak kota | Aktif: Menarik pajak 15% dari saldo kas seluruh lawan.</li>' +
            '<li>🎲 <strong>Gambler</strong> — Pasif: Peluang 25% lemparan dadu Double | Aktif: Menggandakan seluruh sewa properti sendiri (2x) 2 giliran.</li>' +
            '<li>🛡️ <strong>Guardian</strong> — Pasif: Kebal lelang paksa & sabotase | Aktif: Perisai energi mengabaikan 2 pembayaran sewa berikutnya.</li>' +
            '<li>💻 <strong>Hacker</strong> — Pasif: Diskon 30% Pasar Gelap & kebal razia | Aktif: Meretas dan menyedot $350 langsung dari kas lawan terkaya.</li>' +
            '<li>👑 <strong>Tycoon</strong> — Pasif: Bonus lewat GO ekstra +$400 | Aktif: Beli paksa properti non-monopoli lawan seharga 1.5x pasar.</li>' +
            '<li>🦾 <strong>Cyborg</strong> — Pasif: Kurangi 40% denda kerusakan bencana | Aktif: Overdrive +6 langkah dadu ekstra & bebas sewa saat mendarat.</li>' +
            '<li>📊 <strong>Broker</strong> — Pasif: Diskon 25% beli saham & dividen +50% | Aktif: Pompa portofolio saham +40% & panen dividen kas $250.</li>' +
            '<li>🕵️ <strong>Detective</strong> — Pasif: Hadiah bounty +$200 saat lawan dipenjara | Aktif: Pasang karantina polisi di 1 distrik lawan selama 2 giliran.</li>' +
            '<li>🧪 <strong>Alchemist</strong> — Pasif: Cashback pinjaman 10% & diskon gadai 30% | Aktif: Menarik 2 kartu aksi taktis instan ke tangan.</li>' +
            '</ul>'
          : '<h3>12 Specialized Cyberpunk Character Classes</h3><ul>' +
            '<li>💼 <strong>Banker</strong> — Passive: Bank loan interest reduced to 3% | Active: Freeze opponent property rent for 3 turns.</li>' +
            '<li>🔧 <strong>Engineer</strong> — Passive: -20% building construction discount | Active: Free instant 1-tier building upgrade.</li>' +
            '<li>📈 <strong>Trader</strong> — Passive: +15% trade valuation appraisal | Active: Force trade property with opponent.</li>' +
            '<li>🎩 <strong>Politician</strong> — Passive: 100% immune to tax tiles | Active: Levy 15% tax on all opponents cash balances.</li>' +
            '<li>🎲 <strong>Gambler</strong> — Passive: 25% lucky double roll chance | Active: Double all property rents (2x) for 2 turns.</li>' +
            '<li>🛡️ <strong>Guardian</strong> — Passive: Immune to forced auction & sabotage | Active: Energy shield absorbs next 2 rents.</li>' +
            '<li>💻 <strong>Hacker</strong> — Passive: 30% off Black Market & raid immunity | Active: Siphon $350 from richest opponent cash.</li>' +
            '<li>👑 <strong>Tycoon</strong> — Passive: +$400 extra GO pass bonus | Active: Force buy opponent non-monopoly property at 1.5x.</li>' +
            '<li>🦾 <strong>Cyborg</strong> — Passive: 40% disaster damage reduction | Active: Overdrive +6 movement steps & free landing.</li>' +
            '<li>📊 <strong>Broker</strong> — Passive: 25% stock discount & +50% dividend | Active: Surge stock values +40% & harvest $250.</li>' +
            '<li>🕵️ <strong>Detective</strong> — Passive: +$200 bounty when opponent jailed | Active: Police lockdown opponent district for 2 turns.</li>' +
            '<li>🧪 <strong>Alchemist</strong> — Passive: 10% loan cashback & 30% unmortgage discount | Active: Draw 2 tactical cards instantly.</li>' +
            '</ul>'
      },
      {
        title: lang === 'id' ? '🤝 Sistem Trade & Barter' : '🤝 Trade & Barter System',
        content: lang === 'id'
          ? '<h3>Negosiasi Antar Pemain</h3><p>Tombol <strong>Trade</strong> di bilah atas memungkinkanmu mengajukan proposal pertukaran properti dan uang tunai secara dinamis.</p><h3>Aturan Barter</h3><ul><li>🔄 <strong>Pertukaran Multi-Aset</strong> — Kamu dapat menawarkan beberapa properti sekaligus dan meminta beberapa properti lawan dalam satu kesepakatan.</li><li>💵 <strong>Kompensasi Kas Tambahan</strong> — Tambahkan uang tunai sebagai pemanis (*sweetener*) untuk menyamakan valuasi transaksi.</li><li>🤖 <strong>Kecerdasan AI Evaluasi Trade</strong> — Bot AI menganalisis tawaran berdasarkan kebutuhan monopoli. Bot akan menolak keras jika tawaran memberikan pemain manusia monopoli kecuali pemain membayar kompensasi sangat tinggi (+$800).</li><li>🚫 <strong>Restriksi</strong> — Properti yang sedang digadaikan (*mortgaged*) atau saat event <em>Pandemi</em> berlangsung tidak dapat diperdagangkan.</li></ul>'
          : '<h3>Dynamic Player Negotiation</h3><p>The top <strong>Trade</strong> tool allows you to propose real-time property and cash exchange packages with rivals.</p><h3>Barter Mechanics</h3><ul><li>🔄 <strong>Multi-Asset Exchange</strong> — Bundle multiple properties into a single comprehensive offer.</li><li>💵 <strong>Cash Compensation</strong> — Add cash sweeteners to balance the trade valuation.</li><li>🤖 <strong>AI Evaluation Engine</strong> — AI bots evaluate proposals based on monopoly potential. Hard bots strictly deny trades that grant humans a monopoly unless heavily overcompensated (+$800).</li><li>🚫 <strong>Trade Restrictions</strong> — Mortgaged properties or trades during active <em>Pandemic</em> events are prohibited.</li></ul>'
      },
      {
        title: lang === 'id' ? '🃏 Action Cards Taktis' : '🃏 Tactical Action Cards',
        content: lang === 'id'
          ? '<h3>Simpan Hingga 3 Kartu di Inventaris</h3><p>Kartu aksi dapat disimpan dan digunakan kapan saja pada giliranmu:</p><ul><li>⚔️ <strong>Kartu Serangan</strong>: Hostile Takeover (beli paksa aset lawan seharga 1.5x), Sabotage (hancurkan level bangunan), Tax Audit (tarik 20% kekayaan lawan), Cyber Attack (nonaktifkan skill lawan 3 giliran).</li><li>🛡️ <strong>Kartu Pertahanan</strong>: Firewall (blokir 1 serangan lawan), Insurance (bebas sewa 1x), Legal Shield (kebal takeover 2 giliran), Bail Bond (keluar penjara seketika).</li><li>🌍 <strong>Kartu Ekonomi</strong>: Market Manipulation (ubah harga saham ±30%), Stimulus (semua dapat $200), Embargo (bekukan sewa 1 distrik), Gentrification (sewa 1 distrik naik +50%).</li><li>🚀 <strong>Kartu Khusus</strong>: Teleportasi (pindah bebas ke petak manapun), Balik Arah (putar arah langkah), Dadu Ganda (lempar 3 dadu), Retas Bank (curi dana kas bank).</li></ul>'
          : '<h3>Hold Up to 3 Tactical Cards</h3><p>Store tactical action cards in your hand and deploy them strategically:</p><ul><li>⚔️ <strong>Attack Cards</strong>: Hostile Takeover (force buy at 1.5x), Sabotage (destroy building tier), Tax Audit (levy 20% target net worth), Cyber Attack (disable skill for 3 turns).</li><li>🛡️ <strong>Defense Cards</strong>: Firewall (block 1 attack), Insurance (skip rent 1x), Legal Shield (immune to takeover 2 turns), Bail Bond (instant jail release).</li><li>🌍 <strong>Economy Cards</strong>: Market Manipulation (shift stock ±30%), Stimulus (all get $200), Embargo (freeze district rent), Gentrification (+50% district rent).</li><li>🚀 <strong>Special Cards</strong>: Teleport (move anywhere), Reverse (invert direction), Double Dice (roll 3 dice), Bank Hack (steal bank funds).</li></ul>'
      },
      {
        title: lang === 'id' ? '📦 Kartu Chance & Cyber Chest' : '📦 Chance & Chest Cards',
        content: lang === 'id'
          ? '<h3>Event Instan Saat Mendarat</h3><p>Mendarat di petak ❓ Chance atau 📦 Cyber Chest memicu kartu taktis dengan animasi cyberpunk:</p><ul><li>🚄 <strong>Ekspres Metro</strong> — Maju langsung ke Stasiun Hyperloop terdekat dan klaim bonus.</li><li>⚡ <strong>Koneksi Jaringan Listrik</strong> — Maju ke Pembangkit Listrik terdekat (Utility).</li><li>💎 <strong>Airdrop Kripto & Hibah Komunitas</strong> — Terima suntikan dana kas mulai dari $150 hingga $400.</li><li>💸 <strong>Audit Pajak & Biaya Perawatan</strong> — Bayar biaya perawatan server/listrik ($25/rumah, $100/hotel).</li><li>🌌 <strong>Quantum Warp Glitch</strong> — Berpindah seketika ke Zona Kuantum petak 26.</li><li>🚨 <strong>Razia Polisi Siber</strong> — Ditahan langsung di sel penjara tanpa menerima bonus GO!</li></ul>'
          : '<h3>Instant Dynamic Tile Events</h3><p>Landing on ❓ Chance or 📦 Cyber Chest triggers instant tactical cards with neon animations:</p><ul><li>🚄 <strong>Hyperloop Express</strong> — Advance immediately to the nearest Metro Station.</li><li>⚡ <strong>Power Grid Link</strong> — Advance to the nearest Power Utility.</li><li>💎 <strong>Crypto Airdrop & Grants</strong> — Receive instant cash injections from $150 to $400.</li><li>💸 <strong>Audit & Server Upkeep</strong> — Pay maintenance fees ($25/house, $100/hotel).</li><li>🌌 <strong>Quantum Warp Glitch</strong> — Teleport directly to Quantum Zone tile 26.</li><li>🚨 <strong>Cyber Police Raid</strong> — Sent directly to jail without collecting GO salary!</li></ul>'
      },
      {
        title: lang === 'id' ? '🌍 16 Event Ekonomi Global' : '🌍 16 Global Economy Events',
        content: lang === 'id'
          ? '<h3>Siklus Pasar Tiap 4-5 Giliran</h3><ul><li>📈 <strong>Bull Market</strong> — Sewa +20%, harga properti +30%</li><li>📉 <strong>Market Crash</strong> — Harga properti -40%, saham anjlok drastis</li><li>💸 <strong>Inflasi</strong> — Semua biaya sewa, bangun, dan denda pajak +25%</li><li>🏗️ <strong>Boom Konstruksi</strong> — Biaya upgrade bangunan didiskon -50%</li><li>🦠 <strong>Pandemi</strong> — Sewa turun -50%, fitur barter/trading dilarang</li><li>⚡ <strong>Revolusi Teknologi</strong> — Penghasilan utility listrik naik 3x lipat</li><li>🏛️ <strong>Bailout Pemerintah</strong> — Pemain termiskin mendapat suntikan kas $500</li><li>🔥 <strong>Kebakaran</strong> — 1 properti acak kehilangan 1 level bangunan</li><li>💎 <strong>Demam Emas</strong> — Bonus lewat GO naik 2x lipat ($400)</li><li>🌪️ <strong>Bencana Alam</strong> — Seluruh pemain membayar $200 perbaikan darurat</li><li>🛡️ <strong>Perang Siber</strong> — Sistem bank diserang, semua bayar $150 & saham tech anjlok</li><li>🚀 <strong>Ledakan Kripto</strong> — Dividen kas +$300 & sewa distrik kuantum +50%</li><li>🎉 <strong>Tax Holiday</strong> — Bebas pajak (0%) & diskon upgrade -30%</li><li>🏢 <strong>Mega Merger</strong> — Sewa stasiun dan utility naik 2.5x lipat</li><li>⚡ <strong>Anomali Kuantum</strong> — Cooldown seluruh skill pemain di-reset seketika</li><li>💥 <strong>Hiperinflasi</strong> — Sewa +40%, harga beli +50%, bonus GO $600</li></ul>'
          : '<h3>Market Cycles Every 4-5 Turns</h3><ul><li>📈 <strong>Bull Market</strong> — Rent +20%, property purchase price +30%</li><li>📉 <strong>Market Crash</strong> — Property prices -40%, stock market plunges</li><li>💸 <strong>Inflation</strong> — All rent, construction, and tax costs +25%</li><li>🏗️ <strong>Construction Boom</strong> — Building construction costs slashed by -50%</li><li>🦠 <strong>Pandemic</strong> — Rent reduced by -50%, trade feature locked</li><li>⚡ <strong>Tech Revolution</strong> — Power utility revenue multiplied by 3x</li><li>🏛️ <strong>Government Bailout</strong> — Poorest player receives $500 support grant</li><li>🔥 <strong>Fire Incident</strong> — 1 random property loses building level</li><li>💎 <strong>Gold Rush</strong> — GO salary bonus doubled ($400)</li><li>🌪️ <strong>Natural Disaster</strong> — All players pay $200 emergency relief</li><li>🛡️ <strong>Cyber Warfare</strong> — Bank outage (-$150) & tech stocks drop</li><li>🚀 <strong>Crypto Boom</strong> — Cash dividend +$300 & Quantum rent +50%</li><li>🎉 <strong>Tax Holiday</strong> — Zero taxes (0%) & -30% build upgrade discount</li><li>🏢 <strong>Mega Merger</strong> — Metro and Utility rents multiplied by 2.5x</li><li>⚡ <strong>Quantum Glitch</strong> — All character skill cooldowns instantly reset</li><li>💥 <strong>Hyperinflation</strong> — Rent +40%, buy prices +50%, GO bonus $600</li></ul>'
      },
      {
        title: lang === 'id' ? '🌦️ 11 Sistem Cuaca Distrik' : '🌦️ 11 Dynamic Weather Systems',
        content: lang === 'id'
          ? '<h3>Efek Cuaca Dinamis Per Distrik</h3><ul><li>☀️ <strong>Cerah</strong> — Aktivitas ekonomi lancar, sewa distrik +15%.</li><li>🌧️ <strong>Hujan</strong> — Lalu lintas sepi, sewa distrik turun -20%.</li><li>⛈️ <strong>Badai</strong> — Konstruksi dilarang, 10% peluang bangunan rusak.</li><li>🌫️ <strong>Kabut Tebal</strong> — Informasi status properti lawan disamarkan.</li><li>❄️ <strong>Badai Salju</strong> — Pergerakan dadu dipotong -2 langkah lambat.</li><li>🔥 <strong>Gelombang Panas</strong> — Beban listrik utility x2, denda pendingin $50/giliran.</li><li>🌈 <strong>Langit Cerah</strong> — Seluruh bonus penghasilan bertambah +10%.</li><li>🌌 <strong>Aurora Kuantum</strong> — Dadu +1 langkah, sinergi distrik sewa naik +25%.</li><li>🧪 <strong>Hujan Asam</strong> — Dilarang bangun, biaya audit polusi $30/bangunan saat lewat GO.</li><li>🌑 <strong>Gerhana Matahari</strong> — Diskon Pasar Gelap 25%, sewa semua properti -30%.</li><li>💨 <strong>Asap Siber</strong> — Fitur trading terkunci, revenue utility naik 1.5x.</li></ul>'
          : '<h3>Dynamic District Weather Effects</h3><ul><li>☀️ <strong>Sunny</strong> — Flawless business conditions, district rent +15%.</li><li>🌧️ <strong>Rain</strong> — Reduced foot traffic, district rent -20%.</li><li>⛈️ <strong>Storm</strong> — Construction blocked, 10% chance of building damage.</li><li>🌫️ <strong>Fog</strong> — Opponent tile info obscured.</li><li>❄️ <strong>Blizzard</strong> — Dice movement slowed by -2 steps.</li><li>🔥 <strong>Heatwave</strong> — Utility demand x2, cooling fee $50/turn.</li><li>🌈 <strong>Rainbow Skies</strong> — All financial earnings boosted by +10%.</li><li>🌌 <strong>Quantum Aurora</strong> — Movement +1, district synergy rent +25%.</li><li>🧪 <strong>Acid Rain</strong> — Construction blocked, $30 pollution tax per building on GO.</li><li>🌑 <strong>Solar Eclipse</strong> — Black Market 25% discount, all rent -30%.</li><li>💨 <strong>Cyber Smog</strong> — Trading locked, utility revenue 1.5x.</li></ul>'
      },
      {
        title: lang === 'id' ? '🏘️ Sinergi Distrik & Wilayah' : '🏘️ District Synergy & Domination',
        content: lang === 'id'
          ? '<h3>Bonus Penguasaan Wilayah</h3><p>Papan terbagi menjadi 6 distrik metropolitan:</p><ul><li>🟣 <strong>Neon Utara</strong> • 🔵 <strong>Cyber Timur</strong> • 🌌 <strong>Zona Kuantum</strong></li><li>🔴 <strong>Shadow Selatan</strong> • 🟡 <strong>Pusat Finansial</strong> • 🟢 <strong>Data Barat</strong></li></ul><h3>Tingkatan Sinergi Distrik</h3><ul><li>🔹 <strong>Minor Synergy</strong> (Miliki 2 properti di distrik yang sama): Sewa seluruh propertimu di distrik tersebut naik +15%.</li><li>🔷 <strong>Major Synergy</strong> (Miliki 3 properti): Sewa naik +30% dan diskon biaya bangun -10%.</li><li>👑 <strong>District Lord</strong> (Miliki 4+ properti): Sewa melonjak +50% di seluruh distrik tersebut!</li></ul>'
          : '<h3>Regional Domination Bonuses</h3><p>The board is partitioned into 6 metropolitan districts:</p><ul><li>🟣 <strong>Neon North</strong> • 🔵 <strong>Cyber East</strong> • 🌌 <strong>Quantum Zone</strong></li><li>🔴 <strong>Shadow South</strong> • 🟡 <strong>Financial Core</strong> • 🟢 <strong>Data West</strong></li></ul><h3>Synergy Tiers</h3><ul><li>🔹 <strong>Minor Synergy</strong> (Own 2 properties in same district): +15% rent boost across district.</li><li>🔷 <strong>Major Synergy</strong> (Own 3 properties): +30% rent boost & -10% build discount.</li><li>👑 <strong>District Lord</strong> (Own 4+ properties): +50% rent surge across the entire district!</li></ul>'
      },
      {
        title: lang === 'id' ? '🏴 Pasar Gelap & Risiko Razia' : '🏴 Black Market & Contraband',
        content: lang === 'id'
          ? '<h3>Aset Ilegal & Peluang Tertangkap Polisi</h3><p>Mendarat di petak Pasar Gelap membuka akses item selundupan berisiko tinggi:</p><ul><li>🕵️ <strong>Alat Mata-mata</strong> ($300, 20% risiko) — Mengintip kartu rahasia dan saldo kas lawan.</li><li>💵 <strong>Uang Palsu</strong> ($200, 30% risiko) — Dapat $500 instan, tapi jika gagal langsung masuk penjara!</li><li>🔓 <strong>Kunci Master</strong> ($250, 15% risiko) — Melewati kewajiban membayar sewa 1x.</li><li>📋 <strong>Sertifikat Palsu</strong> ($400, 25% risiko) — Mengklaim 1 properti kosong secara gratis.</li><li>🛡️ <strong>Perlindungan Sindikat</strong> ($350, 0% risiko) — Kebal 100% dari kartu serangan lawan selama 3 giliran.</li><li>💊 <strong>Stimulan Kuantum</strong> ($150, 10% risiko) — Me-reset cooldown skill aktif karakter seketika.</li></ul>'
          : '<h3>High-Risk Contraband Gear & Police Busts</h3><p>Landing on Black Market tiles unlocks powerful illegal gadgets with bust probabilities:</p><ul><li>🕵️ <strong>Spy Device</strong> ($300, 20% risk) — Inspect opponent hand and hidden cash balances.</li><li>💵 <strong>Counterfeit Cash</strong> ($200, 30% risk) — Gain $500 instant cash, failure triggers immediate jail detention!</li><li>🔓 <strong>Master Key</strong> ($250, 15% risk) — Bypass 1 upcoming rent payment completely.</li><li>📋 <strong>Forged Deed</strong> ($400, 25% risk) — Claim 1 unowned property for free.</li><li>🛡️ <strong>Syndicate Protection</strong> ($350, 0% risk) — 100% immune to hostile cards for 3 turns.</li><li>💊 <strong>Quantum Stimulant</strong> ($150, 10% risk) — Instantly reset active character skill cooldown.</li></ul>'
      },
      {
        title: lang === 'id' ? '🏢 Joint Venture (JV) Kemitraan' : '🏢 Joint Venture (JV)',
        content: lang === 'id'
          ? '<h3>Kerjasama Kepemilikan Aset Bersama</h3><p>Dua pemain dapat berkolaborasi memiliki properti secara patungan:</p><ul><li>📝 <strong>Ajukan Kontrak JV</strong> — Tawarkan kerjasama properti ke pemain lain dengan rasio bagi hasil (50/50, 60/40, atau 70/30).</li><li>💰 <strong>Sewa Berbagi + Bonus Dividen</strong> — Hasil sewa dibagi proporsional dengan ekstra bonus dividen kemitraan +20%!</li><li>🏗️ <strong>Biaya Bangun Patungan</strong> — Biaya upgrade rumah/hotel ditanggung bersama sesuai porsi saham.</li><li>💔 <strong>Pembubaran JV (Buyout)</strong> — Salah satu pihak dapat membeli sisa saham rekanan untuk mengambil alih kepemilikan penuh.</li></ul><p><em>Maksimal 3 kontrak Joint Venture aktif per pemain.</em></p>'
          : '<h3>Co-Ownership Property Partnerships</h3><p>Two players can collaborate to co-own and develop prime real estate:</p><ul><li>📝 <strong>Propose JV Contract</strong> — Offer property co-ownership with customizable split ratios (50/50, 60/40, or 70/30).</li><li>💰 <strong>Shared Rent + Partnership Bonus</strong> — Rent is shared proportionally plus an extra +20% partnership dividend bonus!</li><li>🏗️ <strong>Shared Construction</strong> — Building upgrade costs are split according to equity share.</li><li>💔 <strong>Buyout & Dissolution</strong> — Either partner can buyout the remaining share for full exclusive ownership.</li></ul><p><em>Max 3 active JV contracts per player.</em></p>'
      },
      {
        title: lang === 'id' ? '🎯 Misi Rahasia & Kemenangan' : '🎯 Secret Objectives',
        content: lang === 'id'
          ? '<h3>Target Kemenangan Taktis</h3><p>Setiap pemain mendapatkan misi rahasia di awal permainan. Selesaikan targetnya untuk mendapatkan hadiah kas raksasa:</p><ul><li>🏘️ <strong>Baron Distrik</strong> — Miliki 4+ properti di 1 distrik (Hadiah: +$800).</li><li>🎰 <strong>Raja Kasino</strong> — Bangun minimal 2 Kasino (Hadiah: +$600).</li><li>📈 <strong>Konglomerat Saham</strong> — Miliki total portofolio saham $1000+ (Hadiah: +$500).</li><li>👑 <strong>Raja Monopoli</strong> — Kuasai 2 grup warna monopoli penuh (Hadiah: +$900).</li><li>🤝 <strong>Master Kerjasama</strong> — Jalankan 2 Joint Venture aktif (Hadiah: +$500).</li><li>💰 <strong>Raja Likuiditas</strong> — Capai saldo kas $3000 tanpa hutang aktif (Hadiah: +$750).</li></ul>'
          : '<h3>Tactical Secret Victory Targets</h3><p>Players receive hidden secret objectives at match start. Complete them for massive cash rewards:</p><ul><li>🏘️ <strong>District Baron</strong> — Own 4+ properties in 1 district (Reward: +$800).</li><li>🎰 <strong>Casino Mogul</strong> — Construct at least 2 Casinos (Reward: +$600).</li><li>📈 <strong>Stock Tycoon</strong> — Hold $1000+ in stock market portfolio (Reward: +$500).</li><li>👑 <strong>Monopoly King</strong> — Control 2 complete color monopolies (Reward: +$900).</li><li>🤝 <strong>JV Master</strong> — Maintain 2 active Joint Ventures (Reward: +$500).</li><li>💰 <strong>Cash King</strong> — Reach $3000 cash with zero active loans (Reward: +$750).</li></ul>'
      },
      {
        title: lang === 'id' ? '💳 3 Skema Pinjaman & Gadai' : '💳 3 Loan Types & Mortgages',
        content: lang === 'id'
          ? '<h3>Manajemen Hutang & Likuiditas</h3><ul><li>🏦 <strong>Pinjaman Bank</strong>: Bunga rendah 5%/giliran, limit maks $1000, tenor 10 giliran. Banker hanya kena bunga 3%!</li><li>🦈 <strong>Pinjaman Rentenir / Shark</strong>: Tanpa batas plafon dana, bunga tinggi 15%/giliran, tenor ketat 5 giliran.</li><li>🏠 <strong>Gadai Properti / Mortgage</strong>: Bunga 0%, terima 50% nilai properti instan (properti terkunci tidak menghasilkan sewa sampai ditebus kembali seharga 55%).</li></ul><h3>Risiko Gagal Bayar (Default)</h3><p>Jika tenor habis tanpa pelunasan:<br>• Bank: Properti jaminan disita paksa oleh pengadilan.<br>• Rentenir: Denda 2x lipat atau penyitaan properti termahal secara paksa!</p>'
          : '<h3>Debt & Liquidity Management</h3><ul><li>🏦 <strong>Bank Loan</strong>: Low 5% interest/turn, max $1000 limit, 10-turn term. Banker enjoys 3% rate!</li><li>🦈 <strong>Loan Shark</strong>: Unlimited liquidity, aggressive 15% interest/turn, 5-turn term.</li><li>🏠 <strong>Property Mortgage</strong>: 0% interest, receive 50% property value (rent frozen until unmortgaged at 55%).</li></ul><h3>Default Penalties</h3><p>Failing to repay before term expires:<br>• Bank: Forecloses on collateral property.<br>• Shark: Demands 2x debt or seizes your highest-value property!</p>'
      },
      {
        title: lang === 'id' ? '⚖️ Sistem Lelang Real-Time' : '⚖️ Live Auction System',
        content: lang === 'id'
          ? '<h3>Lelang Terbuka & Dynamic Bidding</h3><p>Saat pemain menolak membeli petak properti yang dipijak, properti masuk ke ruang lelang real-time:</p><ul><li>⏱️ <strong>Timer Bid 15 Detik</strong> — Waktu berpikir per putaran penawaran.</li><li>💰 <strong>Penawaran Minimum</strong> — Tawaran baru harus minimal 10% atau +$15 lebih tinggi dari penawaran sebelumnya.</li><li>🤖 <strong>Taktik AI Bot Snipe</strong> — Bot AI akan mengkalkulasi monopoli distrik untuk melakukan snipe di detik-detik terakhir!</li><li>🛡️ <strong>Proteksi Guardian</strong> — Karakter Guardian kebal dari lelang paksa aset propertinya.</li></ul>'
          : '<h3>Live Open Bidding Auctions</h3><p>When a player declines purchasing an unowned tile, it enters live auction:</p><ul><li>⏱️ <strong>15-Second Bid Timer</strong> — Decision timer per bidding round.</li><li>💰 <strong>Minimum Increment</strong> — New bids must exceed previous bid by at least 10% or +$15.</li><li>🤖 <strong>AI Sniper Tactics</strong> — AI bots calculate district monopoly value and snipe in the final seconds!</li><li>🛡️ <strong>Guardian Perk</strong> — Guardian character is immune to forced property auctions.</li></ul>'
      },
      {
        title: lang === 'id' ? '📊 Pasar Saham Cyber & Dividen' : '📊 Cyber Stock Market',
        content: lang === 'id'
          ? '<h3>4 Emiten Saham Korporasi Neon</h3><ul><li>💜 <strong>NeonCorp</strong> — Harga dasar $100, volatilitas moderat, cocok untuk investasi jangka menengah.</li><li>💙 <strong>CyberTech</strong> — Harga dasar $80, volatilitas tinggi, melonjak drastis saat Revolusi Teknologi.</li><li>💚 <strong>DataFlow</strong> — Harga dasar $120, volatilitas rendah & dividen stabil.</li><li>💛 <strong>QuantumAI</strong> — Harga dasar $60, volatilitas sangat ekstrem (potensi cuan 300% atau anjlok 70%).</li></ul><h3>Mekanisme Dividen</h3><p>Dividen tunai dibayarkan setiap 10 ronde giliran. Karakter Broker mendapatkan dividen ekstra +50% dan diskon beli saham 25%!</p>'
          : '<h3>4 Corporate Stocks</h3><ul><li>💜 <strong>NeonCorp</strong> — Base $100, moderate volatility for balanced growth.</li><li>💙 <strong>CyberTech</strong> — Base $80, high volatility, skyrockets during Tech Revolution.</li><li>💚 <strong>DataFlow</strong> — Base $120, low risk & steady dividend payout.</li><li>💛 <strong>QuantumAI</strong> — Base $60, extreme volatility (up to 300% swings).</li></ul><h3>Dividend Cycles</h3><p>Cash dividends payout every 10 turns. Broker character receives +50% extra dividends and 25% purchase discounts!</p>'
      },
      {
        title: lang === 'id' ? '📜 Riwayat Pertandingan & Arsip' : '📜 Match History & Archive',
        content: lang === 'id'
          ? '<h3>Timeline Aktivitas & Log Event Lengkap</h3><p>Tekan tombol <code>📜</code> di bilah atas untuk membuka rekaman lengkap riwayat pertandingan:</p><ul><li>🔍 <strong>5 Tab Filter Kategori</strong> — <code>🌐 Semua</code>, <code>🏠 Properti & Sewa</code>, <code>💰 Finansial & Saham</code>, <code>⚡ Skill & Sabotase</code>, <code>🌍 Event & Cuaca</code>.</li><li>🔎 <strong>Kotak Pencarian Real-Time</strong> — Cari nama pemain, petak properti, atau jenis transaksi secara instan.</li><li>💡 <strong>Kotak Penjelasan & Dampak</strong> — Setiap aksi dilengkapi rincian rumus matematis dan alasan terjadinya event.</li><li>🏆 <strong>Arsip Riwayat Pertandingan</strong> — Setiap game yang selesai otomatis diarsipkan ke memori lokal browser (pemenang, durasi, total kekayaan, dan tanggal).</li></ul>'
          : '<h3>Comprehensive Match History Timeline</h3><p>Tap the <code>📜</code> button on the top HUD to view the full game event archives:</p><ul><li>🔍 <strong>5 Category Filters</strong> — <code>🌐 All</code>, <code>🏠 Property & Rent</code>, <code>💰 Finance & Stocks</code>, <code>⚡ Skills & Sabotage</code>, <code>🌍 Events & Weather</code>.</li><li>🔎 <strong>Instant Search Bar</strong> — Filter logs by player name, tile, or transaction type.</li><li>💡 <strong>Impact & Rule Explanations</strong> — Every log entry features deep mathematical breakdown boxes.</li><li>🏆 <strong>Match Archive Vault</strong> — Finished games are automatically archived to local storage (winner, duration, net worth, and timestamps).</li></ul>'
      },
      {
        title: lang === 'id' ? '💬 Room Chat & AI Bot Banter' : '💬 Room Chat & AI Bot Banter',
        content: lang === 'id'
          ? '<h3>Komunikasi Real-Time di Room & Game</h3><p>Mengobrol langsung dengan teman atau respon dinamis dari Bot AI yang cerdas!</p><ul><li>🚪 <strong>Room Lobby Chat</strong> — Kirim pesan, atur strategi, dan saling sapa sebelum permainan dimulai.</li><li>🎮 <strong>In-Game Drawer Panel</strong> — Tekan tombol <code>💬</code> di pojok kanan atas untuk membuka live chat tanpa mengganggu papan.</li><li>⚡ <strong>Quick Taunt Chips</strong> — Tombol reaksi cepat (👋 Halo, 🔥 Gas, 💀 Boncos, 🤝 Trade, 😎 GG).</li><li>🤖 <strong>AI Bot Dynamic Banter</strong> — Bot AI akan merespon obrolan, mengomentari lemparan dadu double, sewa mahal, dan momen kebangkrutan!</li><li>🔔 <strong>Unread Counter Badge</strong> — Notifikasi jumlah pesan masuk yang belum dibaca saat laci chat ditutup.</li></ul>'
          : '<h3>Real-Time Room & In-Game Communication</h3><p>Chat directly with peers and receive intelligent live banter from AI bots!</p><ul><li>🚪 <strong>Room Lobby Chat</strong> — Coordinate strategies and greet players before launching the match.</li><li>🎮 <strong>In-Game Drawer Panel</strong> — Tap the <code>💬</code> button on the top right HUD to open live chat seamlessly without obstructing the board.</li><li>⚡ <strong>Quick Taunt Chips</strong> — One-tap rapid responses for instant reactions (👋 Hey, 🔥 Let\'s go, 💀 Ouch, 🤝 Trade, 😎 GG).</li><li>🤖 <strong>AI Bot Dynamic Banter</strong> — AI players actively participate in chat, reacting to double rolls, high rents, and bankruptcy moments!</li><li>🔔 <strong>Unread Counter Badge</strong> — Real-time badge counter for incoming messages while the drawer is closed.</li></ul>'
      },
      {
        title: lang === 'id' ? '⚙️ WebAssembly Engine & Optimasi Spek Rendah' : '⚙️ WebAssembly & Low-End Optimization',
        content: lang === 'id'
          ? '<h3>Arsitektur Berdaya Tinggi Tanpa Lag</h3><ul><li>⚡ <strong>WebAssembly Core Engine (engine.wasm)</strong> — Seluruh komputasi berat (RNG Xorshift32, evaluasi AI bot Grandmaster, kalkulasi sewa 7-tier, dan simulasi risiko kebangkrutan) diproses di level biner mendekati kecepatan C/Rust native.</li><li>🎨 <strong>Offscreen Canvas Caching</strong> — Papan 52 petak, nama jalan, dan distrik di-cache ke memori offscreen. GPU hanya melakukan 1x blit per frame sehingga stabil 60 FPS di HP spek rendah (RAM 1–2 GB).</li><li>🔋 <strong>Battery & Low-DPR Clamping</strong> — DPR dibatasi optimal (1.0x–2.0x) dan render loop otomatis istirahat saat layar HP terkunci atau tab browser diminimalkan.</li><li>🔊 <strong>Web Audio Synthesizer</strong> — Seluruh efek suara (SFX) disintesis secara dinamis dari oscillator browser tanpa membebani kuota internet.</li></ul>'
          : '<h3>Lag-Free High-Performance Architecture</h3><ul><li>⚡ <strong>WebAssembly Core Engine (engine.wasm)</strong> — Heavy computations (Xorshift32 PRNG, Grandmaster AI decision trees, 7-tier rent matrix, bankruptcy risk modeling) execute at near-native C/Rust speeds.</li><li>🎨 <strong>Offscreen Canvas Caching</strong> — 52-tile board, labels, and districts are pre-rendered into an offscreen buffer. GPU performs a single blit per frame for stable 60 FPS on low-end hardware (1–2 GB RAM).</li><li>🔋 <strong>Battery & DPR Clamping</strong> — DPR is clamped (1.0x–2.0x) and render loops pause when minimized to conserve battery.</li><li>🔊 <strong>Procedural Web Audio Synthesizer</strong> — Sound effects are synthesized on-the-fly via Web Audio oscillators without downloading bulky audio assets.</li></ul>'
      },
      {
        title: lang === 'id' ? '💡 Tips & Strategi Hardcore Grandmaster' : '💡 Grandmaster Strategy Tips',
        content: lang === 'id'
          ? '<h3>Kunci Kemenangan Juara</h3><ul><li>💰 <strong>Penyangga Kas Minimal $300</strong> — Jangan pernah menghabiskan kas hingga $0 saat membeli properti; selalu sisakan bantalan untuk membayar sewa darurat.</li><li>🏘️ <strong>Prioritas Monopoli & Sinergi</strong> — 1 monopoli dengan 3 rumah jauh lebih mematikan daripada 10 properti acak tanpa monopoli.</li><li>📈 <strong>Waktu Pasar Saham</strong> — Borong saham saat Market Crash / Perang Siber, lalu panen keuntungan saat Bull Market atau Ledakan Kripto.</li><li>🏰 <strong>Benteng di Properti Termahal</strong> — Bangun Benteng di hotel termahalmu agar kebal 100% dari kartu sabotase dan bencana alam!</li><li>🛡️ <strong>Simpan Firewall</strong> — Selalu simpan minimal 1 kartu pertahanan di tangan untuk mengantisipasi Hostile Takeover lawan.</li><li>🤝 <strong>Manfaatkan Joint Venture</strong> — Kunci lawan ke dalam kemitraan JV di properti dengan lalu lintas tinggi untuk mengamankan cash flow pasif stabil.</li></ul>'
          : '<h3>Mastery Tips for Victory</h3><ul><li>💰 <strong>Maintain $300+ Cash Buffer</strong> — Never spend down to zero; always prepare for emergency rents.</li><li>🏘️ <strong>Monopoly & Synergy First</strong> — 1 monopoly with 3 houses is deadlier than 10 scattered unmonopolized tiles.</li><li>📈 <strong>Stock Market Timing</strong> — Buy heavily during Crash / Cyber Warfare; cash out during Bull Market or Crypto Boom.</li><li>🏰 <strong>Fortress Expensive Assets</strong> — Build Fortress on high-tier hotels to grant immunity against sabotage and fires!</li><li>🛡️ <strong>Hand Management</strong> — Always keep a Firewall card in reserve against hostile takeovers.</li><li>🤝 <strong>Strategic Joint Ventures</strong> — Bind opponents into JV contracts on high-traffic tiles for guaranteed shared income.</li></ul>'
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

    // Setup dots and counter
    const dotsContainer = document.getElementById('guide-dots');
    if (dotsContainer) {
      dotsContainer.innerHTML = `
        <div id="guide-dots-wrapper" style="display:flex;align-items:center;gap:0.35rem;flex-wrap:wrap;justify-content:center;max-width:320px;"></div>
        <div id="guide-page-indicator" style="font-size:0.85rem;font-weight:700;color:var(--neon-cyan);margin-top:0.35rem;letter-spacing:0.5px;">1 / ${pages.length}</div>
      `;
      const wrapper = dotsContainer.querySelector('#guide-dots-wrapper');
      if (wrapper) {
        pages.forEach((_, i) => {
          const dot = document.createElement('span');
          dot.className = 'guide-dot' + (i === 0 ? ' active' : '');
          dot.addEventListener('click', () => showPage(i));
          wrapper.appendChild(dot);
        });
      }
    }

    // Setup prev/next
    document.getElementById('btn-guide-prev')?.addEventListener('click', prevPage);
    document.getElementById('btn-guide-next')?.addEventListener('click', nextPage);

    currentPage = 0;
  }

  function showPage(index) {
    const pages = document.querySelectorAll('.guide-page');
    const dots = document.querySelectorAll('.guide-dot');
    const indicator = document.getElementById('guide-page-indicator');
    const lang = (typeof Lang !== 'undefined') ? Lang.getLang() : 'id';
    
    if (index < 0 || index >= pages.length) return;
    currentPage = index;
    pages.forEach((p, i) => p.classList.toggle('active', i === index));
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
    if (indicator) {
      indicator.textContent = (lang === 'id' ? `Halaman ${index + 1} / ${pages.length}` : `Page ${index + 1} / ${pages.length}`);
    }

    // Scroll active guide container to top
    const container = document.querySelector('.guide-pages');
    if (container) container.scrollTop = 0;
  }

  function nextPage() { showPage(currentPage + 1); }
  function prevPage() { showPage(currentPage - 1); }
  function updateLanguage() { init(); }

  return { init, showPage, nextPage, prevPage, getPages, updateLanguage };
})();
