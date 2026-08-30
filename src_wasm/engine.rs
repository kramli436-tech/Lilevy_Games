// ============================================================================
// MONOPOLY CYBERPUNK - HIGH PERFORMANCE WEBASSEMBLY ENGINE (RUST SOURCE)
// HARDCORE GRANDMASTER AI & ZERO-OVERHEAD GAME SIMULATION CORE
// ============================================================================

#![no_std]

/// 1. High Performance Pseudo-Random Number Generator (Xorshift32 PRNG)
#[no_mangle]
pub extern "C" fn fast_rng(mut seed: u32, min: i32, max: i32) -> i32 {
    if min >= max { return min; }
    if seed == 0 { seed = 0x6D2B79F5; }
    seed ^= seed << 13;
    seed ^= seed >> 17;
    seed ^= seed << 5;
    let span = (max - min + 1) as u32;
    min + ((seed % span) as i32)
}

/// 2. Fast 7-Tier Rent Calculator
#[no_mangle]
pub extern "C" fn calculate_rent_wasm(
    base_rent: i32,
    building_level: i32,
    has_monopoly: i32,
    synergy_pct: i32,
    economy_mod_pct: i32,
    weather_mod_pct: i32,
    skill_mod_pct: i32,
) -> i32 {
    let mut rent = base_rent as i64;
    if has_monopoly != 0 && building_level == 0 {
        rent *= 2;
    }
    let syn = if synergy_pct > 0 { synergy_pct as i64 } else { 100 };
    rent = (rent * syn) / 100;
    let econ = if economy_mod_pct > 0 { economy_mod_pct as i64 } else { 100 };
    rent = (rent * econ) / 100;
    let weather = if weather_mod_pct > 0 { weather_mod_pct as i64 } else { 100 };
    rent = (rent * weather) / 100;
    let skill = if skill_mod_pct > 0 { skill_mod_pct as i64 } else { 100 };
    rent = (rent * skill) / 100;
    if rent < 0 { 0 } else { rent as i32 }
}

/// 3. Grandmaster AI Bot Property Buy Evaluator (Score 0-1000)
/// Evaluates acquisition value, monopoly denial, and district dominance.
#[no_mangle]
pub extern "C" fn evaluate_buy_decision(
    price: i32,
    cash: i32,
    owned_in_group: i32,
    group_size: i32,
    district_props: i32,
    cash_buffer_required: i32,
) -> i32 {
    let min_buffer = if cash_buffer_required > 0 { cash_buffer_required } else { 250 };
    let remaining_cash = cash - price;
    
    if remaining_cash < min_buffer {
        return 0;
    }
    
    let mut score = 550; // High baseline willingness for hard AI
    
    // Completes our own monopoly (+450 priority)
    if group_size > 0 && owned_in_group >= (group_size - 1) {
        score += 450;
    } 
    // Builds towards monopoly (+200 priority)
    else if owned_in_group > 0 {
        score += 200;
    }
    
    // District synergy building (+90 for each owned tile in district)
    score += district_props * 90;
    
    // Wealth factor
    if remaining_cash > 800 {
        score += 120;
    } else if remaining_cash < 350 {
        score -= 100;
    }
    
    if score > 1000 { 1000 } else if score < 0 { 0 } else { score }
}

/// 4. Hardcore AI Auction Bidding Evaluator (Aggressive Snipe & Denial)
#[no_mangle]
pub extern "C" fn evaluate_auction_bid(
    property_price: i32,
    cash: i32,
    owned_in_group: i32,
    group_size: i32,
    current_bid: i32,
) -> i32 {
    let min_buffer = 200;
    if cash < min_buffer + 50 {
        return 0;
    }
    
    let mut max_bid_ratio = 90; // default aggressive 90%
    if group_size > 0 && owned_in_group >= (group_size - 1) {
        max_bid_ratio = 180; // Willing to bid up to 180% to lock monopoly!
    } else if owned_in_group > 0 {
        max_bid_ratio = 125;
    }
    
    let ceiling = (property_price * max_bid_ratio) / 100;
    let safe_cash_limit = cash - min_buffer;
    let effective_max = if ceiling < safe_cash_limit { ceiling } else { safe_cash_limit };
    
    let next_increment = (current_bid * 110) / 100;
    let min_next_bid = if next_increment > current_bid + 15 { next_increment } else { current_bid + 15 };
    
    if min_next_bid <= effective_max {
        min_next_bid
    } else {
        0
    }
}

/// 5. Hardcore AI Trade Proposal Evaluator (Anti-Exploit & Monopoly Denial)
#[no_mangle]
pub extern "C" fn evaluate_trade(
    offer_value: i32,
    request_value: i32,
    completes_my_monopoly: i32,
    completes_opponent_monopoly: i32,
) -> i32 {
    let mut net_value = (offer_value as i64) - (request_value as i64);
    
    // Completing our monopoly is worth +$600 strategic value
    if completes_my_monopoly != 0 {
        net_value += 600;
    }
    
    // Hard AI will NEVER give human player a monopoly unless human overpays by +$800
    if completes_opponent_monopoly != 0 {
        net_value -= 800;
    }
    
    if net_value >= 0 { 1 } else { 0 }
}

/// 6. Fast Bankruptcy Risk Simulator
#[no_mangle]
pub extern "C" fn simulate_bankruptcy_risk(
    cash: i32,
    net_worth: i32,
    avg_opponent_rent: i32,
    total_debt: i32,
) -> i32 {
    if cash < 0 || net_worth < 0 { return 100; }
    if cash > (avg_opponent_rent * 4 + total_debt) { return 0; }
    
    let liquid_ratio = (cash as f32) / ((avg_opponent_rent * 2 + total_debt + 1) as f32);
    if liquid_ratio >= 2.0 {
        0
    } else if liquid_ratio >= 1.0 {
        ((2.0 - liquid_ratio) * 35.0) as i32
    } else {
        let risk = 35 + (((1.0 - liquid_ratio) * 65.0) as i32);
        if risk > 100 { 100 } else { risk }
    }
}

/// 7. Building Upgrade Priority Evaluator (Score 0-1000)
#[no_mangle]
pub extern "C" fn evaluate_building_priority(
    current_level: i32,
    has_monopoly: i32,
    cash_after_build: i32,
    opponents_in_range: i32,
) -> i32 {
    if cash_after_build < 250 { return 0; }
    let mut score = 400;
    
    // Houses 1..4 (Fast rent multiplier)
    score += (current_level + 1) * 80;
    
    // Hotel upgrade with monopoly gives massive priority
    if current_level == 4 && has_monopoly != 0 {
        score += 350;
    }
    
    // If opponents are approaching (2..12 steps away), rush building!
    if opponents_in_range > 0 {
        score += opponents_in_range * 100;
    }
    
    if score > 1000 { 1000 } else { score }
}

/// 8. Engine Version Identifier
#[no_mangle]
pub extern "C" fn get_engine_version() -> i32 {
    2026 // Version 2.0.26 Hardcore Core
}
