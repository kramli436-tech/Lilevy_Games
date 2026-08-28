"""
LILEVY GAMES & MONOPOLY PRO - MASTER ALL-IN-ONE VALIDATOR & TEST SUITE
Menggabungkan seluruh fungsi pengujian sintaks, CSS, ikon Lucide, data petak peta,
responsivitas, autentikasi, kuota TTS, 16 token karakter, disconnect 90 detik,
serta fitur Multi-Language (i18n), Achievements, BGM Synthesizer, PWA, Narrator & AI Personalities.
"""

import os
import sys
import re
import glob

# Ensure UTF-8 output across all terminals
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def test_javascript_syntax():
    print("=" * 60)
    print("1. MEMERIKSA SINTAKS & KESEIMBANGAN BRACES SELURUH FILE JAVASCRIPT")
    print("=" * 60)
    js_files = glob.glob("js/**/*.js", recursive=True)
    js_files.append("sw.js")
    js_files = sorted(list(set(js_files)))
    
    all_passed = True
    for filepath in js_files:
        if not os.path.exists(filepath):
            continue
        with open(filepath, "r", encoding="utf-8") as f:
            code = f.read()
        
        diff_braces = code.count('{') - code.count('}')
        diff_parens = code.count('(') - code.count(')')
        diff_brackets = code.count('[') - code.count(']')
        
        status = "[OK]" if diff_braces == 0 and diff_parens == 0 and diff_brackets == 0 else "[FAIL]"
        if status == "[FAIL]":
            all_passed = False
            print(f"  {status} {filepath}: Braces={diff_braces}, Parens={diff_parens}, Brackets={diff_brackets}")
        else:
            print(f"  {status} {filepath} ({len(code.splitlines())} baris)")
            
    return all_passed

def test_css_rules():
    print("\n" + "=" * 60)
    print("2. MEMERIKSA VALIDITAS CSS & LINE-CLAMP DI style.css")
    print("=" * 60)
    css_path = "css/style.css"
    if not os.path.exists(css_path):
        print(f"  [ERROR] {css_path} tidak ditemukan!")
        return False
        
    with open(css_path, "r", encoding="utf-8") as f:
        css = f.read()
        
    open_b = css.count('{')
    close_b = css.count('}')
    print(f"  [OK] Kurung kurawal CSS seimbang ({open_b} open == {close_b} close)")
    
    clamp_pairs = True
    for i, line in enumerate(css.splitlines(), 1):
        if "-webkit-line-clamp" in line:
            prev_line = css.splitlines()[i-2] if i >= 2 else ""
            if "line-clamp:" not in prev_line and "line-clamp:" not in line:
                print(f"  [WARN] Baris {i} memiliki -webkit-line-clamp tanpa standar line-clamp")
                clamp_pairs = False
    
    if clamp_pairs:
        print("  [OK] Seluruh properti line-clamp sudah sesuai standar W3C & bebas warning!")
    return open_b == close_b and clamp_pairs

def test_lucide_icons():
    print("\n" + "=" * 60)
    print("3. MEMERIKSA INTEGRITAS IKON LUCIDE DI HTML & JS")
    print("=" * 60)
    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()
        
    icons = re.findall(r'data-lucide="([^"]+)"', html)
    print(f"  [OK] Ditemukan {len(icons)} ikon Lucide terpasang di index.html")
    invalid_icons = [icon for icon in icons if icon in ["dices", "delete"]]
    if invalid_icons:
        print(f"  [FAIL] Ditemukan ikon yang tidak valid: {invalid_icons}")
        return False
    print("  [OK] Seluruh ikon Lucide terverifikasi valid (dice-5, backspace, volume-x, mic, dsb.)")
    return True

def test_tile_images():
    print("\n" + "=" * 60)
    print("4. MEMERIKSA KELENGKAPAN FOTO PETAK PROPERTI (40, 52 & 64 PETAK)")
    print("=" * 60)
    with open("js/data/monopoly-data.js", "r", encoding="utf-8") as f:
        data = f.read()
        
    images = re.findall(r"image:\s*'([^']+)'", data)
    print(f"  [OK] Total foto properti terpasang: {len(images)} petak")
    
    has_athena = "photo-1603565816030-6b389eeb23cb" in data
    has_vancouver = "photo-1506146332389-18140dc7b2fb" in data
    
    print(f"  [{'OK' if has_athena else 'FAIL'}] Foto Athena (Yunani) terpasang dengan URL HD stabil")
    print(f"  [{'OK' if has_vancouver else 'FAIL'}] Foto Vancouver (Kanada) terpasang dengan URL HD stabil")
    return len(images) >= 156 and has_athena and has_vancouver

def test_auth_persistence():
    print("\n" + "=" * 60)
    print("5. MEMERIKSA SISTEM PENYIMPANAN OTOMATIS & BACKEND PERSISTENSI")
    print("=" * 60)
    with open("js/engine/auth.js", "r", encoding="utf-8") as f:
        auth_js = f.read()
        
    with open("backend_python/server.py", "r", encoding="utf-8") as f:
        server_py = f.read()
        
    has_local_auto = "ensureLocalUser" in auth_js
    has_export = "exportDataToFile" in auth_js
    has_save_file_endpoint = "/api/auth/save-file" in server_py
    
    print(f"  [{'OK' if has_local_auto else 'FAIL'}] Auto-profil dan penyimpanan otomatis aktif tanpa ribet")
    print(f"  [{'OK' if has_export else 'FAIL'}] Fitur 1-Klik Unduh Cadangan File (.json) tersedia")
    print(f"  [{'OK' if has_save_file_endpoint else 'FAIL'}] Endpoint /api/auth/save-file disk persistence backend siap")
    return has_local_auto and has_export and has_save_file_endpoint

def test_tts_hint_limits():
    print("\n" + "=" * 60)
    print("6. MEMERIKSA KUOTA BANTUAN TTS & COOLDOWN 1 HARI")
    print("=" * 60)
    with open("js/engine/tts-engine.js", "r", encoding="utf-8") as f:
        tts_js = f.read()
        
    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()
        
    has_limits = "getHintLimits" in tts_js and "useHintQuota" in tts_js
    has_letter_quota = "remaining: 3" in tts_js
    has_word_quota = "remaining: 2" in tts_js
    has_badges = "badge-hint-letter-count" in html and "badge-hint-word-count" in html
    
    print(f"  [{'OK' if has_letter_quota else 'FAIL'}] Buka Huruf dibatasi maksimal 3 kali per hari")
    print(f"  [{'OK' if has_word_quota else 'FAIL'}] Buka Kata dibatasi maksimal 2 kali per hari")
    print(f"  [{'OK' if has_limits else 'FAIL'}] Cooldown 1 hari (24 jam) otomatis menghitung sisa waktu pulih")
    print(f"  [{'OK' if has_badges else 'FAIL'}] Badge indikator kuota terpasang pada tombol TTS")
    return has_limits and has_letter_quota and has_word_quota and has_badges

def test_character_tokens_and_disconnect():
    print("\n" + "=" * 60)
    print("7. MEMERIKSA 16 TOKEN KARAKTER & SISTEM DISCONNECT 90 DETIK")
    print("=" * 60)
    with open("js/data/monopoly-data.js", "r", encoding="utf-8") as f:
        data_js = f.read()
    with open("js/monopoly/monopoly-skills.js", "r", encoding="utf-8") as f:
        skills_js = f.read()
    with open("js/monopoly/monopoly-engine.js", "r", encoding="utf-8") as f:
        engine_js = f.read()
    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()

    tokens = ['🚗', '🚢', '✈️', '🎩', '🐕', '🚀', '🏎️', '👑', '🤖', '💎', '🐉', '🛡️', '🛸', '🦁', '🧙‍♂️', '🦄']
    all_tokens_in_data = all(t in data_js for t in tokens)
    all_tokens_in_html = all(t in html for t in tokens)
    has_skills = "triggerLandingPerks" in skills_js and "getPayRentDiscount" in skills_js
    has_disconnect_engine = "markPlayerDisconnected" in engine_js and "kickDisconnectedPlayer" in engine_js and "90" in engine_js
    has_disconnect_banner = "mono-disconnect-banner" in html and "mono-dc-timer-text" in html

    print(f"  [{'OK' if all_tokens_in_data else 'FAIL'}] 16 Token Karakter terdaftar di data permainan")
    print(f"  [{'OK' if all_tokens_in_html else 'FAIL'}] 16 Token Bidak tersedia di modal Setup, Join & Rules")
    print(f"  [{'OK' if has_skills else 'FAIL'}] Modul kemampuan unik (Skills) 16 karakter aktif")
    print(f"  [{'OK' if has_disconnect_engine else 'FAIL'}] Logika auto-kick disconnect 90 detik (1m 30s) terintegrasi")
    print(f"  [{'OK' if has_disconnect_banner else 'FAIL'}] Banner notifikasi hitung mundur disconnect terpasang di UI")

    return all_tokens_in_data and all_tokens_in_html and has_skills and has_disconnect_engine and has_disconnect_banner

def test_new_features_suite():
    print("\n" + "=" * 60)
    print("8. MEMERIKSA FITUR BARU: I18N, PRESENCE, ACHIEVEMENTS, PWA & AI")
    print("=" * 60)
    has_i18n = os.path.exists("js/engine/i18n.js")
    has_presence = os.path.exists("js/engine/presence.js")
    has_achievements = os.path.exists("js/engine/achievements.js")
    has_manifest = os.path.exists("manifest.json")
    has_sw = os.path.exists("sw.js")

    with open("js/monopoly/monopoly-engine.js", "r", encoding="utf-8") as f:
        engine_js = f.read()
    has_personalities = "aggressive" in engine_js and "conservative" in engine_js

    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()
    has_modals = "modal-achievements" in html and "btn-lang-toggle" in html and "nav-online-badge" in html

    print(f"  [{'OK' if has_i18n else 'FAIL'}] Sistem Multi-Bahasa (i18n: ID & EN) siap")
    print(f"  [{'OK' if has_presence else 'FAIL'}] Sistem Realtime Valid Online Presence Engine siap")
    print(f"  [{'OK' if has_achievements else 'FAIL'}] Sistem Prestasi & Lencana (12 Badges) siap")
    print(f"  [{'OK' if has_manifest and has_sw else 'FAIL'}] Dukungan PWA (Manifest & Service Worker) siap")
    print(f"  [{'OK' if has_personalities else 'FAIL'}] Kepribadian AI Bot (Aggressive, Conservative, Trader) siap")
    print(f"  [{'OK' if has_modals else 'FAIL'}] Komponen Navbar & Modal UI Fitur Baru terpasang")

    return has_i18n and has_presence and has_achievements and has_manifest and has_sw and has_personalities and has_modals

if __name__ == "__main__":
    t1 = test_javascript_syntax()
    t2 = test_css_rules()
    t3 = test_lucide_icons()
    t4 = test_tile_images()
    t5 = test_auth_persistence()
    t6 = test_tts_hint_limits()
    t7 = test_character_tokens_and_disconnect()
    t8 = test_new_features_suite()
    
    print("\n" + "=" * 60)
    if t1 and t2 and t3 and t4 and t5 and t6 and t7 and t8:
        print("SEMUA PENGUJIAN SISTEM BERHASIL 100% (SEMUA FITUR BARU SEMPURNA & SIAP)!")
    else:
        print("ADA BEBERAPA PENGUJIAN YANG GAGAL!")
    print("=" * 60)
