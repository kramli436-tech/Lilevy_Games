/**
 * TTS ENGINE - CORE CROSSWORD GAME LOGIC
 * Mengelola state papan catur silang, navigasi kursor, validasi isian,
 * sistem petunjuk (hint), timer, dan kalkulasi skor.
 */

class TTSEngine {
  constructor() {
    this.puzzle = null;
    this.grid = []; // Matrix 2D [row][col]
    this.selectedCell = null; // { row: number, col: number }
    this.direction = 'across'; // 'across' | 'down'
    this.timerSeconds = 0;
    this.timerInterval = null;
    this.isPaused = false;
    this.isCompleted = false;
    this.hintsCount = 0;
    this.wrongChecksCount = 0;
    this.completedWords = new Set();
    
    // Callbacks untuk event UI
    this.onCellChange = null;
    this.onSelectionChange = null;
    this.onWordCompleted = null;
    this.onPuzzleCompleted = null;
    this.onTimerTick = null;
  }

  // Memuat puzzle baru
  loadPuzzle(puzzleData, restoreSaved = true) {
    this.puzzle = JSON.parse(JSON.stringify(puzzleData));
    this.isCompleted = false;
    this.isPaused = false;
    this.hintsCount = 0;
    this.wrongChecksCount = 0;
    this.completedWords.clear();
    this.timerSeconds = 0;
    this.direction = 'across';

    // Inisialisasi Matrix Grid
    this.grid = [];
    for (let r = 0; r < this.puzzle.rows; r++) {
      const row = [];
      for (let c = 0; c < this.puzzle.cols; c++) {
        row.push({
          row: r,
          col: c,
          isBlocked: true,
          letter: '',
          answer: '',
          number: null,
          acrossWord: null,
          downWord: null,
          isRevealed: false,
          isError: false,
          isCorrect: false
        });
      }
      this.grid.push(row);
    }

    // Tempatkan kata-kata pada grid
    this.puzzle.words.forEach((w, idx) => {
      w.id = `w_${w.direction}_${w.number}_${idx}`;
      const len = w.answer.length;
      for (let i = 0; i < len; i++) {
        const r = w.direction === 'across' ? w.row : w.row + i;
        const c = w.direction === 'across' ? w.col + i : w.col;
        const cell = this.grid[r][c];

        cell.isBlocked = false;
        cell.answer = w.answer[i].toUpperCase();

        if (i === 0) {
          cell.number = w.number;
        }

        if (w.direction === 'across') {
          cell.acrossWord = w;
        } else {
          cell.downWord = w;
        }
      }
    });

    // Coba restore progres dari LocalStorage jika diizinkan
    const saved = restoreSaved ? this.loadProgressFromStorage() : null;
    if (saved) {
      this.timerSeconds = saved.timerSeconds || 0;
      this.hintsCount = saved.hintsCount || 0;
      this.isCompleted = !!saved.isCompleted;

      saved.letters.forEach(({ r, c, val, revealed }) => {
        if (this.grid[r] && this.grid[r][c] && !this.grid[r][c].isBlocked) {
          this.grid[r][c].letter = val || '';
          this.grid[r][c].isRevealed = !!revealed;
        }
      });
      this.recheckAllCompletedWords();
    }

    // Set seleksi awal pada sel pertama yang valid
    this.findFirstValidCell();

    // Mulai timer
    this.startTimer();

    if (this.onSelectionChange) this.onSelectionChange();
  }

  // Cari sel pertama yang valid untuk seleksi default
  findFirstValidCell() {
    for (let r = 0; r < this.puzzle.rows; r++) {
      for (let c = 0; c < this.puzzle.cols; c++) {
        if (!this.grid[r][c].isBlocked) {
          this.selectedCell = { row: r, col: c };
          this.direction = this.grid[r][c].acrossWord ? 'across' : 'down';
          return;
        }
      }
    }
  }

  // Pengaturan Timer
  startTimer() {
    this.stopTimer();
    if (this.isCompleted) return;
    this.timerInterval = setInterval(() => {
      if (!this.isPaused && !this.isCompleted) {
        this.timerSeconds++;
        if (this.onTimerTick) this.onTimerTick(this.timerSeconds);
        // Auto simpan tiap 10 detik
        if (this.timerSeconds % 10 === 0) {
          this.saveProgressToStorage();
        }
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    return this.isPaused;
  }

  // Dapatkan referensi kata aktif saat ini
  getActiveWord() {
    if (!this.selectedCell) return null;
    const cell = this.grid[this.selectedCell.row][this.selectedCell.col];
    if (!cell || cell.isBlocked) return null;

    if (this.direction === 'across') {
      return cell.acrossWord || cell.downWord;
    } else {
      return cell.downWord || cell.acrossWord;
    }
  }

  // Dapatkan sel-sel milik kata aktif saat ini
  getActiveWordCells() {
    const word = this.getActiveWord();
    if (!word) return [];
    const cells = [];
    const len = word.answer.length;
    for (let i = 0; i < len; i++) {
      const r = word.direction === 'across' ? word.row : word.row + i;
      const c = word.direction === 'across' ? word.col + i : word.col;
      cells.push(this.grid[r][c]);
    }
    return cells;
  }

  // Klik pada sel grid
  selectCell(row, col) {
    const cell = this.grid[row]?.[col];
    if (!cell || cell.isBlocked) return;

    // Jika mengklik sel yang sama, toggle arah jika sel memiliki kedua kata (across & down)
    if (this.selectedCell && this.selectedCell.row === row && this.selectedCell.col === col) {
      if (cell.acrossWord && cell.downWord) {
        this.direction = this.direction === 'across' ? 'down' : 'across';
      }
    } else {
      this.selectedCell = { row, col };
      // Sesuaikan arah jika sel hanya milik satu arah
      if (this.direction === 'across' && !cell.acrossWord && cell.downWord) {
        this.direction = 'down';
      } else if (this.direction === 'down' && !cell.downWord && cell.acrossWord) {
        this.direction = 'across';
      }
    }

    if (window.soundEngine) window.soundEngine.playNavigate();
    if (this.onSelectionChange) this.onSelectionChange();
  }

  // Klik pada clue list untuk melompat ke kata tertentu
  selectWord(word) {
    if (!word) return;
    this.direction = word.direction;
    
    // Cari sel pertama yang masih kosong pada kata tersebut, atau sel awal
    let targetRow = word.row;
    let targetCol = word.col;
    for (let i = 0; i < word.answer.length; i++) {
      const r = word.direction === 'across' ? word.row : word.row + i;
      const c = word.direction === 'across' ? word.col + i : word.col;
      if (!this.grid[r][c].letter) {
        targetRow = r;
        targetCol = c;
        break;
      }
    }

    this.selectedCell = { row: targetRow, col: targetCol };
    if (window.soundEngine) window.soundEngine.playNavigate();
    if (this.onSelectionChange) this.onSelectionChange();
  }

  // Toggle arah manual (Spasi / Tombol UI)
  toggleDirection() {
    if (!this.selectedCell) return;
    const cell = this.grid[this.selectedCell.row][this.selectedCell.col];
    if (cell.acrossWord && cell.downWord) {
      this.direction = this.direction === 'across' ? 'down' : 'across';
      if (window.soundEngine) window.soundEngine.playNavigate();
      if (this.onSelectionChange) this.onSelectionChange();
    }
  }

  // Input huruf dari keyboard (PC atau Virtual Keyboard)
  inputLetter(char) {
    if (this.isCompleted || this.isPaused || !this.selectedCell) return;
    const cell = this.grid[this.selectedCell.row][this.selectedCell.col];
    if (!cell || cell.isBlocked) return;

    const upper = char.toUpperCase().replace(/[^A-Z]/g, '');
    if (!upper) return;

    cell.letter = upper;
    cell.isError = false; // Reset status error saat diinput baru

    if (window.soundEngine) window.soundEngine.playType();
    if (this.onCellChange) this.onCellChange(cell);

    // Cek kelengkapan kata yang terpengaruh
    this.checkWordCompleted(cell.acrossWord);
    this.checkWordCompleted(cell.downWord);

    // Otomatis pindah ke sel berikutnya dalam kata yang sama
    this.advanceCursor(1);

    // Cek apakah seluruh puzzle sudah selesai
    this.checkPuzzleCompletion();
    this.saveProgressToStorage();
  }

  // Hapus huruf (Backspace)
  handleBackspace() {
    if (this.isCompleted || this.isPaused || !this.selectedCell) return;
    const cell = this.grid[this.selectedCell.row][this.selectedCell.col];
    if (!cell || cell.isBlocked) return;

    if (cell.letter !== '') {
      cell.letter = '';
      cell.isError = false;
      if (window.soundEngine) window.soundEngine.playType();
      if (this.onCellChange) this.onCellChange(cell);
      this.recheckAllCompletedWords();
    } else {
      // Jika sel sudah kosong, mundur ke sel sebelumnya lalu hapus
      this.advanceCursor(-1);
      const prevCell = this.grid[this.selectedCell.row][this.selectedCell.col];
      if (prevCell && !prevCell.isBlocked) {
        prevCell.letter = '';
        prevCell.isError = false;
        if (window.soundEngine) window.soundEngine.playType();
        if (this.onCellChange) this.onCellChange(prevCell);
        this.recheckAllCompletedWords();
      }
    }
    this.saveProgressToStorage();
  }

  // Geser kursor maju (+1) atau mundur (-1) di dalam kata aktif
  advanceCursor(step = 1) {
    const word = this.getActiveWord();
    if (!word || !this.selectedCell) return;

    const isAcross = word.direction === 'across';
    const currentIndex = isAcross 
      ? this.selectedCell.col - word.col 
      : this.selectedCell.row - word.row;

    const nextIndex = currentIndex + step;
    if (nextIndex >= 0 && nextIndex < word.answer.length) {
      const nextRow = isAcross ? word.row : word.row + nextIndex;
      const nextCol = isAcross ? word.col + nextIndex : word.col;
      this.selectedCell = { row: nextRow, col: nextCol };
      if (this.onSelectionChange) this.onSelectionChange();
    }
  }

  // Navigasi tombol panah (Arrow Keys)
  moveArrow(dRow, dCol) {
    if (!this.selectedCell) return;
    let r = this.selectedCell.row + dRow;
    let c = this.selectedCell.col + dCol;

    // Boundary check
    while (r >= 0 && r < this.puzzle.rows && c >= 0 && c < this.puzzle.cols) {
      if (!this.grid[r][c].isBlocked) {
        this.selectedCell = { row: r, col: c };
        // Sesuaikan arah jika bergerak vertikal vs horizontal
        if (dRow !== 0 && this.grid[r][c].downWord) {
          this.direction = 'down';
        } else if (dCol !== 0 && this.grid[r][c].acrossWord) {
          this.direction = 'across';
        }
        if (window.soundEngine) window.soundEngine.playNavigate();
        if (this.onSelectionChange) this.onSelectionChange();
        return;
      }
      r += dRow;
      c += dCol;
    }
  }

  // Buka 1 Huruf (Hint Reveal Letter)
  revealCurrentLetter() {
    if (this.isCompleted || !this.selectedCell) return;
    const cell = this.grid[this.selectedCell.row][this.selectedCell.col];
    if (!cell || cell.isBlocked || cell.letter === cell.answer) return;

    cell.letter = cell.answer;
    cell.isRevealed = true;
    cell.isError = false;
    this.hintsCount++;

    if (window.soundEngine) window.soundEngine.playHint();
    if (this.onCellChange) this.onCellChange(cell);

    this.checkWordCompleted(cell.acrossWord);
    this.checkWordCompleted(cell.downWord);
    this.checkPuzzleCompletion();
    this.saveProgressToStorage();
  }

  // Buka 1 Kata (Hint Reveal Word)
  revealCurrentWord() {
    const word = this.getActiveWord();
    if (this.isCompleted || !word) return;

    const len = word.answer.length;
    let hasChanged = false;
    for (let i = 0; i < len; i++) {
      const r = word.direction === 'across' ? word.row : word.row + i;
      const c = word.direction === 'across' ? word.col + i : word.col;
      const cell = this.grid[r][c];
      if (cell.letter !== cell.answer) {
        cell.letter = cell.answer;
        cell.isRevealed = true;
        cell.isError = false;
        hasChanged = true;
        if (this.onCellChange) this.onCellChange(cell);
      }
    }

    if (hasChanged) {
      this.hintsCount += 3;
      if (window.soundEngine) window.soundEngine.playHint();
      this.checkWordCompleted(word);
      this.checkPuzzleCompletion();
      this.saveProgressToStorage();
    }
  }

  // Periksa Kesalahan (Cek isian salah tanpa memberi jawaban langsung)
  checkErrors() {
    if (this.isCompleted) return 0;
    let errorCount = 0;
    this.wrongChecksCount++;

    for (let r = 0; r < this.puzzle.rows; r++) {
      for (let c = 0; c < this.puzzle.cols; c++) {
        const cell = this.grid[r][c];
        if (!cell.isBlocked && cell.letter !== '') {
          if (cell.letter !== cell.answer) {
            cell.isError = true;
            errorCount++;
          } else {
            cell.isError = false;
          }
          if (this.onCellChange) this.onCellChange(cell);
        }
      }
    }

    if (errorCount > 0 && window.soundEngine) {
      window.soundEngine.playError();
    } else if (errorCount === 0 && window.soundEngine) {
      window.soundEngine.playWordSuccess();
    }

    return errorCount;
  }

  // Selesaikan seluruh puzzle secara instan
  solveAll() {
    if (this.isCompleted) return;
    for (let r = 0; r < this.puzzle.rows; r++) {
      for (let c = 0; c < this.puzzle.cols; c++) {
        const cell = this.grid[r][c];
        if (!cell.isBlocked) {
          cell.letter = cell.answer;
          cell.isRevealed = true;
          cell.isError = false;
          if (this.onCellChange) this.onCellChange(cell);
        }
      }
    }
    this.hintsCount += 10;
    this.recheckAllCompletedWords();
    this.checkPuzzleCompletion(true);
  }

  // Reset isi jawaban pada puzzle aktif
  resetPuzzle() {
    for (let r = 0; r < this.puzzle.rows; r++) {
      for (let c = 0; c < this.puzzle.cols; c++) {
        const cell = this.grid[r][c];
        if (!cell.isBlocked) {
          cell.letter = '';
          cell.isRevealed = false;
          cell.isError = false;
          if (this.onCellChange) this.onCellChange(cell);
        }
      }
    }
    this.completedWords.clear();
    this.isCompleted = false;
    this.timerSeconds = 0;
    this.hintsCount = 0;
    this.wrongChecksCount = 0;
    this.saveProgressToStorage();
    this.startTimer();
    if (this.onSelectionChange) this.onSelectionChange();
  }

  // Cek apakah satu kata tertentu sudah terjawab benar
  checkWordCompleted(word) {
    if (!word) return false;
    const len = word.answer.length;
    let isCorrect = true;

    for (let i = 0; i < len; i++) {
      const r = word.direction === 'across' ? word.row : word.row + i;
      const c = word.direction === 'across' ? word.col + i : word.col;
      if (this.grid[r][c].letter !== word.answer[i]) {
        isCorrect = false;
        break;
      }
    }

    const wasAlreadyCompleted = this.completedWords.has(word.id);
    if (isCorrect && !wasAlreadyCompleted) {
      this.completedWords.add(word.id);
      if (window.soundEngine) window.soundEngine.playWordSuccess();
      if (this.onWordCompleted) this.onWordCompleted(word);
    } else if (!isCorrect && wasAlreadyCompleted) {
      this.completedWords.delete(word.id);
      if (this.onWordCompleted) this.onWordCompleted(word);
    }

    return isCorrect;
  }

  // Evaluasi ulang semua kata dalam grid
  recheckAllCompletedWords() {
    this.puzzle.words.forEach(w => this.checkWordCompleted(w));
  }

  // Cek apakah seluruh kotak di papan sudah terisi benar 100%
  checkPuzzleCompletion(forceComplete = false) {
    if (this.isCompleted) return true;

    let allCorrect = true;
    for (let r = 0; r < this.puzzle.rows; r++) {
      for (let c = 0; c < this.puzzle.cols; c++) {
        const cell = this.grid[r][c];
        if (!cell.isBlocked && cell.letter !== cell.answer) {
          allCorrect = false;
          break;
        }
      }
      if (!allCorrect) break;
    }

    if (allCorrect || forceComplete) {
      this.isCompleted = true;
      this.stopTimer();
      const stats = this.calculateScore();
      
      // Simpan skor tertinggi
      this.saveHighScore(stats);
      this.saveProgressToStorage();

      // Catat poin ke Ranking Engine
      if (window.rankingEngine) {
        stats.rankingResult = window.rankingEngine.recordGameVictory(stats);
      }

      if (window.soundEngine) window.soundEngine.playVictory();
      if (this.onPuzzleCompleted) this.onPuzzleCompleted(stats);
      return true;
    }
    return false;
  }

  // Kalkulasi skor, akurasi, dan bintang
  calculateScore() {
    const baseScore = 1500;
    // Penalti waktu: 1 poin tiap 2 detik
    const timePenalty = Math.floor(this.timerSeconds / 2);
    // Penalti hint: 60 poin per hint
    const hintPenalty = this.hintsCount * 60;
    // Penalti cek salah
    const errorCheckPenalty = this.wrongChecksCount * 25;

    let finalScore = Math.max(100, baseScore - timePenalty - hintPenalty - errorCheckPenalty);
    if (this.hintsCount === 0 && this.timerSeconds <= 180) {
      finalScore += 200; // Bonus cepat dan tanpa bantuan
    }

    let stars = 1;
    if (this.hintsCount === 0 && finalScore >= 1100) {
      stars = 3;
    } else if (this.hintsCount <= 2 && finalScore >= 750) {
      stars = 2;
    }

    return {
      puzzleId: this.puzzle.id,
      puzzleTitle: this.puzzle.title,
      score: finalScore,
      stars: stars,
      timeSeconds: this.timerSeconds,
      formattedTime: this.formatTime(this.timerSeconds),
      hintsUsed: this.hintsCount,
      accuracy: Math.max(50, Math.round(100 - (this.hintsCount * 8) - (this.wrongChecksCount * 5)))
    };
  }

  formatTime(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // LocalStorage Helpers
  saveProgressToStorage() {
    if (!this.puzzle) return;
    const letters = [];
    for (let r = 0; r < this.puzzle.rows; r++) {
      for (let c = 0; c < this.puzzle.cols; c++) {
        const cell = this.grid[r][c];
        if (!cell.isBlocked && (cell.letter || cell.isRevealed)) {
          letters.push({ r, c, val: cell.letter, revealed: cell.isRevealed });
        }
      }
    }

    const payload = {
      puzzleId: this.puzzle.id,
      timerSeconds: this.timerSeconds,
      hintsCount: this.hintsCount,
      isCompleted: this.isCompleted,
      letters
    };

    localStorage.setItem(`tts_progress_${this.puzzle.id}`, JSON.stringify(payload));
    localStorage.setItem('tts_last_active_puzzle', this.puzzle.id);
  }

  loadProgressFromStorage() {
    if (!this.puzzle) return null;
    const raw = localStorage.getItem(`tts_progress_${this.puzzle.id}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  saveHighScore(stats) {
    const key = `tts_highscore_${this.puzzle.id}`;
    const raw = localStorage.getItem(key);
    let best = stats;
    if (raw) {
      try {
        const old = JSON.parse(raw);
        if (old.score > stats.score) {
          best = old;
        }
      } catch (e) {}
    }
    localStorage.setItem(key, JSON.stringify(best));
  }

  getHighScore(puzzleId) {
    const raw = localStorage.getItem(`tts_highscore_${puzzleId}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }
}

// Export single instance
window.ttsEngine = new TTSEngine();

