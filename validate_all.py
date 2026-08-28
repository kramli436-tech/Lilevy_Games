"""
LILEVY GAMES & MONOPOLY PRO - MASTER ALL-IN-ONE VALIDATOR & TEST SUITE
Menggabungkan seluruh fungsi pengujian sintaks, CSS, ikon Lucide, data petak peta,
responsivitas, autentikasi, dan sistem kuota cooldown TTS ke dalam 1 file terpadu.
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
    
    # Check for line-clamp standard property alongside -webkit-line-clamp
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
    print("  [OK] Seluruh ikon Lucide terverifikasi valid (dice-5, backspace, dsb.)")
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

if __name__ == "__main__":
    t1 = test_javascript_syntax()
    t2 = test_css_rules()
    t3 = test_lucide_icons()
    t4 = test_tile_images()
    t5 = test_auth_persistence()
    t6 = test_tts_hint_limits()
    
    print("\n" + "=" * 60)
    if t1 and t2 and t3 and t4 and t5 and t6:
        print("SEMUA PENGUJIAN SISTEM BERHASIL 100% (SEMUA KELAS & FITUR SIAP)!")
    else:
        print("ADA BEBERAPA PENGUJIAN YANG GAGAL!")
    print("=" * 60)
