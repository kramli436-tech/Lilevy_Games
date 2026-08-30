const Board = (function() {
  'use strict';
  const TILES = [];
  
  function createProperty(index, name_id, name_en, group, district, price, rentBase, houseCost) {
    const rent = [
      rentBase,
      rentBase * 5,
      rentBase * 15,
      rentBase * 45,
      rentBase * 80,
      rentBase * 125
    ];
    return { index, type: 'property', name_id, name_en, group, district, price, rent, houseCost, mortgageValue: price / 2, owner: null, building: null, isMortgaged: false };
  }
  
  function createSpecial(index, type, name_id, name_en, district, price = 0) {
    return { index, type, name_id, name_en, group: null, district, price, rent: [], houseCost: 0, mortgageValue: price / 2, owner: null };
  }
  
  // District 2 (Bottom: 0-12)
  TILES.push(createSpecial(0, 'go', 'MULAI', 'GO', 4));
  TILES.push(createProperty(1, 'Gang Neon', 'Neon Alley', 'purple', 2, 60, 2, 50));
  TILES.push(createSpecial(2, 'chest', 'Cyber Chest', 'Cyber Chest', 2));
  TILES.push(createProperty(3, 'Jalan Kripto', 'Crypto Street', 'purple', 2, 60, 4, 50));
  TILES.push(createSpecial(4, 'tax', 'Pajak Data', 'Data Tax', 2, 200));
  TILES.push(createSpecial(5, 'station', 'Stasiun Hyperloop S', 'Hyperloop Station S', 5, 200));
  TILES.push(createProperty(6, 'Blok Bit', 'Bit Block', 'lightblue', 2, 100, 6, 50));
  TILES.push(createSpecial(7, 'chance', 'Kesempatan', 'Chance', 2));
  TILES.push(createProperty(8, 'Jalan Byte', 'Byte Ave', 'lightblue', 2, 100, 6, 50));
  TILES.push(createProperty(9, 'Jalan Glitch', 'Glitch Blvd', 'lightblue', 2, 120, 8, 50));
  TILES.push(createSpecial(10, 'black_market', 'Pasar Gelap', 'Black Market', 2));
  TILES.push(createProperty(11, 'Sektor Synth', 'Synth Sector', 'pink', 2, 140, 10, 100));
  TILES.push(createSpecial(12, 'utility', 'Jaringan Listrik', 'Power Grid', 5, 150));
  
  // District 1 (Right: 13-25)
  TILES.push(createSpecial(13, 'jail', 'Penjara', 'Jail', 4));
  TILES.push(createProperty(14, 'Area Hologram', 'Holo Area', 'pink', 1, 140, 10, 100));
  TILES.push(createProperty(15, 'Taman Virtual', 'Virtual Park', 'pink', 1, 160, 12, 100));
  TILES.push(createSpecial(16, 'chest', 'Cyber Chest', 'Cyber Chest', 1));
  TILES.push(createProperty(17, 'Distrik Drone', 'Drone District', 'orange', 1, 180, 14, 100));
  TILES.push(createSpecial(18, 'station', 'Stasiun Hyperloop E', 'Hyperloop Station E', 5, 200));
  TILES.push(createProperty(19, 'Jalan Sirkuit', 'Circuit St', 'orange', 1, 180, 14, 100));
  TILES.push(createProperty(20, 'Kawasan Android', 'Android Zone', 'orange', 1, 200, 16, 100));
  TILES.push(createSpecial(21, 'chance', 'Kesempatan', 'Chance', 1));
  TILES.push(createProperty(22, 'Sektor Merah', 'Red Sector', 'red', 1, 220, 18, 150));
  TILES.push(createSpecial(23, 'black_market', 'Pasar Gelap', 'Black Market', 1));
  TILES.push(createProperty(24, 'Kawasan Cyber', 'Cyber Avenue', 'red', 1, 220, 18, 150));
  TILES.push(createProperty(25, 'Jalur Laser', 'Laser Line', 'red', 1, 240, 20, 150));
  
  // District 0 (Top: 26-38)
  TILES.push(createSpecial(26, 'free_parking', 'Parkir Bebas', 'Free Parking', 4));
  TILES.push(createProperty(27, 'Jalan Kuantum', 'Quantum Way', 'yellow', 0, 260, 22, 150));
  TILES.push(createProperty(28, 'Bulevar Nano', 'Nano Blvd', 'yellow', 0, 260, 22, 150));
  TILES.push(createSpecial(29, 'utility', 'Pusat Jaringan', 'Net Hub', 5, 150));
  TILES.push(createProperty(30, 'Kawasan Foton', 'Photon Zone', 'yellow', 0, 280, 24, 150));
  TILES.push(createSpecial(31, 'station', 'Stasiun Hyperloop N', 'Hyperloop Station N', 5, 200));
  TILES.push(createProperty(32, 'Jalan Matrix', 'Matrix St', 'green', 0, 300, 26, 200));
  TILES.push(createProperty(33, 'Distrik AI', 'AI District', 'green', 0, 300, 26, 200));
  TILES.push(createSpecial(34, 'chest', 'Cyber Chest', 'Cyber Chest', 0));
  TILES.push(createProperty(35, 'Pusat Server', 'Server Central', 'green', 0, 320, 28, 200));
  TILES.push(createSpecial(36, 'chance', 'Kesempatan', 'Chance', 0));
  TILES.push(createProperty(37, 'Akses Root', 'Root Access', 'blue', 0, 350, 35, 200));
  TILES.push(createSpecial(38, 'tax', 'Pajak Mewah', 'Luxury Tax', 0, 100));
  
  // District 3 (Left: 39-51)
  TILES.push(createSpecial(39, 'go_to_jail', 'Masuk Penjara', 'Go to Jail', 4));
  TILES.push(createProperty(40, 'Kawasan Inti', 'Core Area', 'blue', 3, 400, 50, 200));
  TILES.push(createSpecial(41, 'chance', 'Kesempatan', 'Chance', 3));
  TILES.push(createProperty(42, 'Jalan Silikon', 'Silicon Ave', 'purple', 3, 80, 4, 50));
  TILES.push(createProperty(43, 'Sektor Terabyte', 'Terabyte Sector', 'purple', 3, 80, 4, 50));
  TILES.push(createSpecial(44, 'station', 'Stasiun Hyperloop W', 'Hyperloop Station W', 5, 200));
  TILES.push(createSpecial(45, 'black_market', 'Pasar Gelap', 'Black Market', 3));
  TILES.push(createProperty(46, 'Kawasan Orbit', 'Orbit Zone', 'lightblue', 3, 100, 6, 50));
  TILES.push(createSpecial(47, 'chest', 'Cyber Chest', 'Cyber Chest', 3));
  TILES.push(createProperty(48, 'Jalur Optik', 'Optic Line', 'lightblue', 3, 100, 6, 50));
  TILES.push(createProperty(49, 'Bulevar Plasma', 'Plasma Blvd', 'lightblue', 3, 120, 8, 50));
  TILES.push(createSpecial(50, 'tax', 'Biaya Keamanan', 'Security Fee', 3, 150));
  TILES.push(createProperty(51, 'Menara Eksekutif', 'Executive Tower', 'blue', 3, 400, 50, 200));

  function init(deps) {}
  function getTile(index) { return TILES[index]; }
  function getTilesByGroup(group) { return TILES.filter(t => t.group === group); }
  function getTilesByDistrict(district) { return TILES.filter(t => t.district === district); }
  function getTilesByType(type) { return TILES.filter(t => t.type === type); }
  function getTileCount() { return TILES.length; }
  function getColorGroups() { return ['purple', 'lightblue', 'pink', 'orange', 'red', 'yellow', 'green', 'blue']; }
  
  return { init, getTile, getTilesByGroup, getTilesByDistrict, getTilesByType, getTileCount, getColorGroups, TILES };
})();
