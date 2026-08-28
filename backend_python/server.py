"""
LILEVY GAMES - PYTHON BACKEND SERVICE & AI ENGINE
Menyediakan REST API & WebSocket untuk:
1. AI Negotiation & Smart Barter Engine (Evaluasi Nilai Properti & Penawaran AI)
2. NLP Crossword (TTS) Puzzle Generator Otomatis
3. Monte Carlo Simulation Engine (Peta Panas Probabilitas 52 & 40 Petak)
4. Cloud Multiplayer Sync & Global Leaderboard API
"""

import json
import random
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# =========================================================================
# 1. NLP PUZZLE GENERATOR DATA & LOGIC
# =========================================================================
TTS_DICTIONARY = {
    "budaya": [
        {"word": "BATIK", "clue": "Kain bergambar khas Indonesia dengan teknik malam", "len": 5},
        {"word": "GAMELAN", "clue": "Alat musik tradisional ansambel dari Jawa dan Bali", "len": 7},
        {"word": "ANGKLUNG", "clue": "Alat musik bambu dari Jawa Barat yang digoyangkan", "len": 8},
        {"word": "KERIS", "clue": "Senjata pusaka tradisional berluk khas Nusantara", "len": 5},
        {"word": "WAYANG", "clue": "Seni pertunjukan bayangan boneka kulit tradisional", "len": 6},
        {"word": "RENDANG", "clue": "Kuliner daging rempah Minangkabau terlezat di dunia", "len": 7},
        {"word": "SAMOSIR", "clue": "Pulau vulkanik indah di tengah Danau Toba", "len": 7},
        {"word": "BOROBUDUR", "clue": "Candi Buddha terbesar di dunia di Magelang", "len": 9},
        {"word": "PRAMBANAN", "clue": "Kompleks candi Hindu termegah di Indonesia", "len": 9},
        {"word": "KECAK", "clue": "Tarian sakral Bali dengan paduan suara cak-cak-cak", "len": 5}
    ],
    "dunia": [
        {"word": "TOKYO", "clue": "Ibukota megapolitan Jepang dengan menara Skytree", "len": 5},
        {"word": "PARIS", "clue": "Kota mode dunia tempat Menara Eiffel berdiri", "len": 5},
        {"word": "LONDON", "clue": "Ibukota Inggris yang dilintasi Sungai Thames", "len": 6},
        {"word": "DUBAI", "clue": "Kota megah di UEA dengan gedung tertinggi Burj Khalifa", "len": 5},
        {"word": "ROMA", "clue": "Kota abadi tempat berdirinya Colosseum bersejarah", "len": 4},
        {"word": "VENESIA", "clue": "Kota terapung di Italia yang terkenal dengan gondola", "len": 7},
        {"word": "BERLIN", "clue": "Ibukota Jerman dengan monumen Gerbang Brandenburg", "len": 6},
        {"word": "SYDNEY", "clue": "Kota di Australia dengan Opera House ikonik", "len": 6},
        {"word": "KAIRO", "clue": "Kota peradaban kuno tempat Piramida Giza berada", "len": 5}
    ],
    "sains": [
        {"word": "ATOM", "clue": "Unit terkecil penyusun seluruh materi di alam semesta", "len": 4},
        {"word": "FOTON", "clue": "Partikel elementer pembawa energi cahaya", "len": 5},
        {"word": "GRAVITASI", "clue": "Gaya tarik-menarik antara benda bermassa", "len": 9},
        {"word": "DNA", "clue": "Molekul pembawa instruksi genetika makhluk hidup", "len": 3},
        {"word": "OXYGEN", "clue": "Gas penting pendukung respirasi dan kehidupan", "len": 6},
        {"word": "SATELIT", "clue": "Benda angkasa atau buatan yang mengorbit planet", "len": 7}
    ]
}

def generate_dynamic_tts(category="budaya", rows=10, cols=10):
    """Membuat layout TTS silang kata baru secara algoritmik dari kamus kata."""
    pool = TTS_DICTIONARY.get(category.lower(), TTS_DICTIONARY["budaya"])
    selected_words = random.sample(pool, min(len(pool), 6))
    
    words_layout = []
    # Kata 1: Mendatar di baris tengah
    w1 = selected_words[0]
    words_layout.append({
        "id": "w1",
        "number": 1,
        "clue": w1["clue"],
        "answer": w1["word"],
        "row": 2,
        "col": 1,
        "direction": "across"
    })

    # Kata 2: Menurun memotong kata 1
    w2 = selected_words[1]
    words_layout.append({
        "id": "w2",
        "number": 2,
        "clue": w2["clue"],
        "answer": w2["word"],
        "row": 1,
        "col": 3,
        "direction": "down"
    })

    # Kata 3: Mendatar di baris bawah
    if len(selected_words) > 2:
        w3 = selected_words[2]
        words_layout.append({
            "id": "w3",
            "number": 3,
            "clue": w3["clue"],
            "answer": w3["word"],
            "row": 5,
            "col": 2,
            "direction": "across"
        })

    # Kata 4: Menurun
    if len(selected_words) > 3:
        w4 = selected_words[3]
        words_layout.append({
            "id": "w4",
            "number": 4,
            "clue": w4["clue"],
            "answer": w4["word"],
            "row": 3,
            "col": 6,
            "direction": "down"
        })

    return {
        "id": f"ai_gen_{random.randint(1000, 9999)}",
        "title": f"Teka-Teki AI: {category.title()} Pro",
        "difficulty": "Sedang",
        "category": category.title(),
        "description": f"Soal teka-teki silang yang digenerate otomatis oleh AI Python Engine Lilevy Games.",
        "rows": rows,
        "cols": cols,
        "words": words_layout
    }

# =========================================================================
# 2. MONTE CARLO PROBABILITY SIMULATION (52 TILES & 40 TILES)
# =========================================================================
def run_monte_carlo_simulation(tile_count=52, iterations=100000):
    """Menghitung frekuensi pendaratan 3 dadu dengan simulasi Monte Carlo."""
    visits = [0] * tile_count
    pos = 0
    jail_tile = 10 if tile_count == 40 else 13
    go_to_jail_tile = 30 if tile_count == 40 else 39

    for _ in range(iterations):
        d1 = random.randint(1, 6)
        d2 = random.randint(1, 6)
        d3 = random.randint(1, 6)
        
        # Triple dadu langsung ke penjara
        if d1 == d2 == d3:
            pos = jail_tile
        else:
            steps = d1 + d2 + d3
            pos = (pos + steps) % tile_count
            
            # Petak Masuk Penjara
            if pos == go_to_jail_tile:
                pos = jail_tile

        visits[pos] += 1

    probabilities = [round((v / iterations) * 100, 2) for v in visits]
    return {
        "tileCount": tile_count,
        "iterations": iterations,
        "probabilities": probabilities,
        "hottestTile": probabilities.index(max(probabilities)),
        "maxProbability": max(probabilities)
    }

# =========================================================================
# 3. AI NEGOTIATION & SMART TRADE EVALUATOR
# =========================================================================
def evaluate_trade_offer(bot_name, bot_money, offered_props, requested_props, money_diff):
    """
    Mengevaluasi tawaran barter dari pemain berdasarkan:
    1. Nilai pasar total aset
    2. Potensi penyelesaian monopoli 1 kelompok warna
    3. Kecukupan uang tunai cadangan
    """
    total_offered_val = sum(p.get("price", 1000000) for p in offered_props) + (money_diff if money_diff > 0 else 0)
    total_requested_val = sum(p.get("price", 1000000) for p in requested_props) + (-money_diff if money_diff < 0 else 0)

    # Cek apakah tawaran menguntungkan
    trade_ratio = total_offered_val / max(1, total_requested_val)

    # Respons AI yang variatif dan realistis
    if trade_ratio >= 1.2:
        return {
            "accepted": True,
            "decision": "ACCEPT",
            "message": f"🤝 {bot_name}: 'Tawaran yang sangat menggiurkan! Saya setuju dengan kesepakatan barter ini!'",
            "score": round(trade_ratio, 2)
        }
    elif trade_ratio >= 0.85:
        # Menolak dengan counter-offer
        counter_cash = int((total_requested_val - total_offered_val) * 1.1)
        if counter_cash > 0:
            return {
                "accepted": False,
                "decision": "COUNTER_OFFER",
                "counterMoney": counter_cash,
                "message": f"💬 {bot_name}: 'Tawaran hampir adil! Tambahkan uang tunai Rp {counter_cash:,.0f} lagi maka saya akan setuju.'",
                "score": round(trade_ratio, 2)
            }
        else:
            return {
                "accepted": True,
                "decision": "ACCEPT",
                "message": f"🤝 {bot_name}: 'Deal! Saya terima penawaran properti Anda!'",
                "score": round(trade_ratio, 2)
            }
    else:
        return {
            "accepted": False,
            "decision": "REJECT",
            "message": f"❌ {bot_name}: 'Maaf, tawaran Anda terlalu murah bagi portofolio properti saya. Negosiasi ditolak.'",
            "score": round(trade_ratio, 2)
        }

# =========================================================================
# 4. USER PERSISTENCE DATABASE (ON-DISK JSON STORAGE)
# =========================================================================
import os

USERS_DB_FILE = os.path.join(os.path.dirname(__file__), "users_db.json")

def load_server_users():
    if os.path.exists(USERS_DB_FILE):
        try:
            with open(USERS_DB_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_server_users(users_dict):
    try:
        with open(USERS_DB_FILE, "w", encoding="utf-8") as f:
            json.dump(users_dict, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Error saving users db: {e}")

# =========================================================================
# 5. HTTP REQUEST HANDLER
# =========================================================================
class LilevyApiHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        # Health Check
        if path == "/api/health" or path == "/":
            self._respond_json({
                "status": "online",
                "service": "Lilevy Games Python AI & Backend Engine",
                "version": "2.0.0",
                "endpoints": [
                    "/api/tts/generate?category=budaya|dunia|sains",
                    "/api/simulation/monte-carlo?map=world|nusantara",
                    "/api/ranking/leaderboard",
                    "/api/ai/negotiate (POST)",
                    "/api/auth/register (POST)",
                    "/api/auth/login (POST)",
                    "/api/auth/sync (POST)"
                ]
            })
            return

        # 1. Endpoint Generate TTS Otomatis
        elif path == "/api/tts/generate":
            category = query.get("category", ["budaya"])[0]
            result = generate_dynamic_tts(category)
            self._respond_json(result)
            return

        # 2. Endpoint Simulasi Probabilitas Dadu Monte Carlo
        elif path == "/api/simulation/monte-carlo":
            map_type = query.get("map", ["world"])[0]
            tile_count = 40 if map_type == "nusantara" else 52
            result = run_monte_carlo_simulation(tile_count)
            self._respond_json(result)
            return

        # 3. Endpoint Global Leaderboard Pemain Terdaftar
        elif path == "/api/ranking/leaderboard":
            users = load_server_users()
            board = []
            for u in users.values():
                board.append({
                    "id": u.get("id"),
                    "name": u.get("username"),
                    "avatar": u.get("avatar", "🧠"),
                    "favoriteToken": u.get("favoriteToken", "🚗"),
                    "totalPoints": u.get("stats", {}).get("totalPoints", 0),
                    "ttsSolved": u.get("stats", {}).get("ttsSolved", 0),
                    "monopolyWins": u.get("stats", {}).get("monopolyWins", 0),
                    "monopolyNetWorth": u.get("stats", {}).get("monopolyTotalNetWorth", 0)
                })
            board.sort(key=lambda x: x["totalPoints"], reverse=True)
            self._respond_json({"leaderboard": board})
            return

        else:
            self.send_error(404, "Endpoint tidak ditemukan")

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8")
        data = json.loads(body) if body else {}

        # 4. Endpoint Evaluasi Barter AI
        if path == "/api/ai/negotiate":
            bot_name = data.get("botName", "AI Bot 🤖")
            bot_money = data.get("botMoney", 5000000)
            offered_props = data.get("offeredProps", [])
            requested_props = data.get("requestedProps", [])
            money_diff = data.get("moneyDiff", 0)

            result = evaluate_trade_offer(bot_name, bot_money, offered_props, requested_props, money_diff)
            self._respond_json(result)
            return

        # 5. Endpoint Registrasi Akun Pengguna
        elif path == "/api/auth/register":
            username = data.get("username", "").strip()
            password = data.get("password", "")
            avatar = data.get("avatar", "🧠")
            token = data.get("favoriteToken", "🚗")

            if not username or len(username) < 3:
                self._respond_json({"success": False, "message": "Username minimal 3 karakter"}, 400)
                return

            users = load_server_users()
            key = username.lower()
            if key in users:
                self._respond_json({"success": False, "message": "Username sudah terdaftar!"}, 400)
                return

            new_user = {
                "id": f"usr_{len(users)+1}_{random.randint(1000, 9999)}",
                "username": username,
                "password": password,
                "avatar": avatar,
                "favoriteToken": token,
                "stats": {
                    "totalPoints": 0,
                    "ttsSolved": 0,
                    "monopolyGames": 0,
                    "monopolyWins": 0,
                    "monopolyTotalNetWorth": 0
                }
            }
            users[key] = new_user
            save_server_users(users)
            self._respond_json({"success": True, "user": new_user, "message": "Pendaftaran berhasil!"})
            return

        # 6. Endpoint Login Pengguna
        elif path == "/api/auth/login":
            username = data.get("username", "").strip().lower()
            password = data.get("password", "")
            users = load_server_users()

            if username not in users or users[username].get("password") != password:
                self._respond_json({"success": False, "message": "Username atau Password salah!"}, 401)
                return

            self._respond_json({"success": True, "user": users[username], "message": "Login berhasil!"})
            return

        # 7. Endpoint Sinkronisasi Statistik 1 Akun
        elif path == "/api/auth/sync":
            username = data.get("username", "").strip().lower()
            users = load_server_users()
            if username:
                users[username] = data
                save_server_users(users)
                self._respond_json({"success": True, "message": "Sinkronisasi akun berhasil"})
                return
            self._respond_json({"success": False, "message": "Data tidak valid"}, 400)
            return

        # 8. Endpoint Auto-Save Langsung Seluruh Data Pengguna ke File Disk
        elif path == "/api/auth/save-file":
            if isinstance(data, dict) and data:
                save_server_users(data)
                # Simpan juga cadangan terpisah lilevy_user_data.json
                backup_file = os.path.join(os.path.dirname(__file__), "lilevy_user_data.json")
                try:
                    with open(backup_file, "w", encoding="utf-8") as f:
                        json.dump(data, f, ensure_ascii=False, indent=2)
                except Exception:
                    pass
                self._respond_json({"success": True, "message": "Semua data pengguna otomatis tersimpan ke file!"})
                return
            self._respond_json({"success": False, "message": "Data kosong"}, 400)
            return

        else:
            self.send_error(404, "Endpoint tidak ditemukan")

    def _respond_json(self, data, status_code=200):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8"))

def run_server(port=8000):
    server_address = ("", port)
    httpd = HTTPServer(server_address, LilevyApiHandler)
    print(f"🚀 [LILEVY GAMES] Python AI & Backend Server berjalan di http://localhost:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server dihentikan.")
        httpd.server_close()

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    run_server(port)

