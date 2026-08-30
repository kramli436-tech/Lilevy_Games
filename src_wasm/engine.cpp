// ============================================================================
// MONOPOLY CYBERPUNK - HIGH PERFORMANCE WEBASSEMBLY ENGINE (C++ SOURCE)
// HARDCORE GRANDMASTER AI & ZERO-OVERHEAD GAME SIMULATION CORE
// (Freestanding / Zero Standard Library Header Dependency)
// ============================================================================

// Standard fixed-width integer types without requiring external headers
#if !defined(_STDINT_H) && !defined(_STDINT) && !defined(_CSTDINT_) && !defined(_INT32_T_DECLARED)
typedef int                int32_t;
typedef long long          int64_t;
typedef unsigned int       uint32_t;
#endif

// Universal cross-platform WASM / DLL export definition
#if defined(__EMSCRIPTEN__)
    #define WASM_EXPORT __attribute__((used))
#elif defined(__wasm__) || defined(__clang__) || defined(__GNUC__)
    #define WASM_EXPORT __attribute__((visibility("default")))
#elif defined(_MSC_VER) || defined(_WIN32)
    #define WASM_EXPORT __declspec(dllexport)
#else
    #define WASM_EXPORT
#endif

#ifdef __cplusplus
extern "C" {
#endif

/// 1. High Performance Pseudo-Random Number Generator (Xorshift32 PRNG)
WASM_EXPORT
int32_t fast_rng(uint32_t seed, int32_t min, int32_t max) {
    if (min >= max) return min;
    if (seed == 0) seed = 0x6D2B79F5U;
    seed ^= seed << 13;
    seed ^= seed >> 17;
    seed ^= seed << 5;
    uint32_t span = (uint32_t)(max - min + 1);
    return min + (int32_t)(seed % span);
}

/// 2. Fast 7-Tier Rent Calculator
WASM_EXPORT
int32_t calculate_rent_wasm(
    int32_t base_rent,
    int32_t building_level,
    int32_t has_monopoly,
    int32_t synergy_pct,
    int32_t economy_mod_pct,
    int32_t weather_mod_pct,
    int32_t skill_mod_pct
) {
    int64_t rent = (int64_t)base_rent;
    if (has_monopoly != 0 && building_level == 0) {
        rent *= 2;
    }
    int64_t syn = synergy_pct > 0 ? (int64_t)synergy_pct : 100LL;
    rent = (rent * syn) / 100LL;
    int64_t econ = economy_mod_pct > 0 ? (int64_t)economy_mod_pct : 100LL;
    rent = (rent * econ) / 100LL;
    int64_t weather = weather_mod_pct > 0 ? (int64_t)weather_mod_pct : 100LL;
    rent = (rent * weather) / 100LL;
    int64_t skill = skill_mod_pct > 0 ? (int64_t)skill_mod_pct : 100LL;
    rent = (rent * skill) / 100LL;
    return rent < 0 ? 0 : (int32_t)rent;
}

/// 3. Grandmaster AI Bot Property Buy Evaluator (Score 0-1000)
WASM_EXPORT
int32_t evaluate_buy_decision(
    int32_t price,
    int32_t cash,
    int32_t owned_in_group,
    int32_t group_size,
    int32_t district_props,
    int32_t cash_buffer_required
) {
    int32_t min_buffer = cash_buffer_required > 0 ? cash_buffer_required : 250;
    int32_t remaining = cash - price;
    if (remaining < min_buffer) return 0;
    
    int32_t score = 550;
    if (group_size > 0 && owned_in_group >= (group_size - 1)) {
        score += 450;
    } else if (owned_in_group > 0) {
        score += 200;
    }
    score += district_props * 90;
    if (remaining > 800) score += 120;
    else if (remaining < 350) score -= 100;
    
    if (score > 1000) return 1000;
    if (score < 0) return 0;
    return score;
}

/// 4. Hardcore AI Auction Bidding Evaluator (Aggressive Snipe & Denial)
WASM_EXPORT
int32_t evaluate_auction_bid(
    int32_t property_price,
    int32_t cash,
    int32_t owned_in_group,
    int32_t group_size,
    int32_t current_bid
) {
    int32_t min_buffer = 200;
    if (cash < min_buffer + 50) return 0;
    
    int32_t max_ratio = 90;
    if (group_size > 0 && owned_in_group >= (group_size - 1)) max_ratio = 180;
    else if (owned_in_group > 0) max_ratio = 125;
    
    int32_t ceiling = (property_price * max_ratio) / 100;
    int32_t safe_cash = cash - min_buffer;
    int32_t effective_max = ceiling < safe_cash ? ceiling : safe_cash;
    
    int32_t next_inc = (current_bid * 110) / 100;
    int32_t min_next = next_inc > (current_bid + 15) ? next_inc : (current_bid + 15);
    
    if (min_next <= effective_max) return min_next;
    return 0;
}

/// 5. Hardcore AI Trade Proposal Evaluator (Anti-Exploit & Monopoly Denial)
WASM_EXPORT
int32_t evaluate_trade(
    int32_t offer_value,
    int32_t request_value,
    int32_t completes_my_monopoly,
    int32_t completes_opponent_monopoly
) {
    int64_t net = (int64_t)offer_value - (int64_t)request_value;
    if (completes_my_monopoly != 0) net += 600LL;
    if (completes_opponent_monopoly != 0) net -= 800LL; // Hard monopoly denial
    return net >= 0 ? 1 : 0;
}

/// 6. Fast Bankruptcy Risk Simulator
WASM_EXPORT
int32_t simulate_bankruptcy_risk(
    int32_t cash,
    int32_t net_worth,
    int32_t avg_opponent_rent,
    int32_t total_debt
) {
    if (cash < 0 || net_worth < 0) return 100;
    if (cash > (avg_opponent_rent * 4 + total_debt)) return 0;
    
    float ratio = (float)cash / (float)(avg_opponent_rent * 2 + total_debt + 1);
    if (ratio >= 2.0f) return 0;
    if (ratio >= 1.0f) return (int32_t)((2.0f - ratio) * 35.0f);
    int32_t risk = 35 + (int32_t)((1.0f - ratio) * 65.0f);
    return risk > 100 ? 100 : risk;
}

/// 7. Building Upgrade Priority Evaluator (Score 0-1000)
WASM_EXPORT
int32_t evaluate_building_priority(
    int32_t current_level,
    int32_t has_monopoly,
    int32_t cash_after_build,
    int32_t opponents_in_range
) {
    if (cash_after_build < 250) return 0;
    int32_t score = 400;
    score += (current_level + 1) * 80;
    if (current_level == 4 && has_monopoly != 0) score += 350;
    if (opponents_in_range > 0) score += opponents_in_range * 100;
    return score > 1000 ? 1000 : score;
}

/// 8. Engine Version Identifier
WASM_EXPORT
int32_t get_engine_version(void) {
    return 2026;
}

#ifdef __cplusplus
}
#endif
