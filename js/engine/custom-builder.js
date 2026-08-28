/**
 * CUSTOM TTS BUILDER & GENERATOR
 * Memungkinkan pengguna membuat, memvalidasi, mengekspor, mengimpor,
 * dan langsung memainkan puzzle Teka-Teki Silang buatan sendiri.
 */

class CustomTTSBuilder {
  constructor() {
    this.customPuzzle = {
      id: 'custom-' + Date.now(),
      title: 'Teka-Teki Silang Kreasiku',
      difficulty: 'Kustom',
      category: 'Kreasi Sendiri',
      description: 'Teka-teki silang khusus yang dibuat menggunakan Pembuat TTS.',
      icon: 'sparkles',
      rows: 10,
      cols: 10,
      words: []
    };
  }

  reset(rows = 10, cols = 10) {
    this.customPuzzle = {
      id: 'custom-' + Date.now(),
      title: 'Teka-Teki Silang Kreasiku',
      difficulty: 'Kustom',
      category: 'Kreasi Sendiri',
      description: 'Teka-teki silang khusus yang dibuat menggunakan Pembuat TTS.',
      icon: 'sparkles',
      rows: Math.min(15, Math.max(5, rows)),
      cols: Math.min(15, Math.max(5, cols)),
      words: []
    };
  }

  // Tambah kata baru ke kreasi puzzle
  addWord(clue, answer, row, col, direction) {
    const cleanAnswer = answer.trim().toUpperCase().replace(/[^A-Z]/g, '');
    const cleanClue = clue.trim();

    if (!cleanAnswer) {
      return { success: false, message: 'Jawaban kata tidak boleh kosong dan harus huruf A-Z.' };
    }
    if (!cleanClue) {
      return { success: false, message: 'Pertanyaan (Clue) tidak boleh kosong.' };
    }

    const r = parseInt(row, 10);
    const c = parseInt(col, 10);

    // Cek batas kisi
    if (direction === 'across') {
      if (c + cleanAnswer.length > this.customPuzzle.cols || r >= this.customPuzzle.rows || r < 0 || c < 0) {
        return { success: false, message: `Kata '${cleanAnswer}' mendatar keluar dari batas kisi (${this.customPuzzle.rows}x${this.customPuzzle.cols}).` };
      }
    } else {
      if (r + cleanAnswer.length > this.customPuzzle.rows || c >= this.customPuzzle.cols || r < 0 || c < 0) {
        return { success: false, message: `Kata '${cleanAnswer}' menurun keluar dari batas kisi (${this.customPuzzle.rows}x${this.customPuzzle.cols}).` };
      }
    }

    // Nomor urut otomatis
    const nextNumber = this.customPuzzle.words.length + 1;

    const newWord = {
      number: nextNumber,
      direction: direction,
      clue: cleanClue,
      answer: cleanAnswer,
      row: r,
      col: c
    };

    // Validasi perpotongan dengan kata-kata yang sudah ada
    const validation = this.validateWithWord(newWord);
    if (!validation.valid) {
      return { success: false, message: validation.error };
    }

    this.customPuzzle.words.push(newWord);
    this.renumberWords();

    return { success: true, word: newWord };
  }

  // Hapus kata dari daftar
  removeWord(index) {
    if (index >= 0 && index < this.customPuzzle.words.length) {
      this.customPuzzle.words.splice(index, 1);
      this.renumberWords();
      return true;
    }
    return false;
  }

  // Penomoran ulang nomor clue agar konsisten
  renumberWords() {
    let num = 1;
    const cellMap = {};
    
    // Sort words by row then col
    this.customPuzzle.words.sort((a, b) => (a.row - b.row) || (a.col - b.col));

    this.customPuzzle.words.forEach(w => {
      const key = `${w.row},${w.col}`;
      if (!cellMap[key]) {
        cellMap[key] = num++;
      }
      w.number = cellMap[key];
    });
  }

  // Validasi sel perpotongan
  validateWithWord(newWord) {
    const grid = {};
    
    // Isi sel yang sudah ada
    for (const w of this.customPuzzle.words) {
      for (let i = 0; i < w.answer.length; i++) {
        const r = w.direction === 'across' ? w.row : w.row + i;
        const c = w.direction === 'across' ? w.col + i : w.col;
        grid[`${r},${c}`] = w.answer[i];
      }
    }

    // Cek huruf baru
    for (let i = 0; i < newWord.answer.length; i++) {
      const r = newWord.direction === 'across' ? newWord.row : newWord.row + i;
      const c = newWord.direction === 'across' ? newWord.col + i : newWord.col;
      const key = `${r},${c}`;
      if (grid[key] && grid[key] !== newWord.answer[i]) {
        return {
          valid: false,
          error: `Konflik huruf di baris ${r + 1}, kolom ${c + 1}: sudah ada '${grid[key]}', tidak cocok dengan '${newWord.answer[i]}'`
        };
      }
    }

    return { valid: true };
  }

  // Validasi seluruh puzzle secara total
  validateEntirePuzzle() {
    if (this.customPuzzle.words.length < 2) {
      return { valid: false, error: 'Minimal harus ada 2 kata agar teka-teki silang bisa dimainkan.' };
    }
    return { valid: true };
  }

  // Ekspor ke JSON
  exportJSON() {
    return JSON.stringify(this.customPuzzle, null, 2);
  }

  // Impor dari JSON
  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.rows || !parsed.cols || !Array.isArray(parsed.words)) {
        return { success: false, message: 'Format JSON puzzle tidak valid.' };
      }
      this.customPuzzle = parsed;
      this.customPuzzle.id = 'imported-' + Date.now();
      return { success: true, puzzle: this.customPuzzle };
    } catch (e) {
      return { success: false, message: 'Gagal membaca format JSON: ' + e.message };
    }
  }

  // Dapatkan kode Base64 untuk dibagikan via URL
  getShareableCode() {
    try {
      return btoa(unescape(encodeURIComponent(JSON.stringify(this.customPuzzle))));
    } catch (e) {
      return '';
    }
  }

  // Muat dari kode Base64 URL
  loadFromShareableCode(code) {
    try {
      const json = decodeURIComponent(escape(atob(code)));
      return this.importJSON(json);
    } catch (e) {
      return { success: false, message: 'Kode shareable puzzle tidak valid.' };
    }
  }
}

// Export single instance
window.customTTSBuilder = new CustomTTSBuilder();

