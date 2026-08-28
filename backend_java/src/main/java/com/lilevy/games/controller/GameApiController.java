package com.lilevy.games.controller;

import com.lilevy.games.model.PlayerProfile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class GameApiController {

    private final Map<String, PlayerProfile> playerDatabase = new ConcurrentHashMap<>();

    public GameApiController() {
        // Data inisialisasi awal
        PlayerProfile dev = new PlayerProfile("dev_1", "LilevyMaster", "👑", 7500, 20, 15, "Grandmaster");
        playerDatabase.put(dev.getId(), dev);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> resp = new HashMap<>();
        resp.put("status", "healthy");
        resp.put("service", "Lilevy Games Java Backend");
        resp.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/player/save")
    public ResponseEntity<PlayerProfile> savePlayerProfile(@RequestBody PlayerProfile profile) {
        if (profile.getId() == null || profile.getId().isEmpty()) {
            profile.setId("player_" + UUID.randomUUID().toString().substring(0, 8));
        }
        playerDatabase.put(profile.getId(), profile);
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/leaderboard/global")
    public ResponseEntity<List<PlayerProfile>> getGlobalLeaderboard() {
        List<PlayerProfile> list = new ArrayList<>(playerDatabase.values());
        list.sort((a, b) -> Long.compare(b.getTotalPoints(), a.getTotalPoints()));
        return ResponseEntity.ok(list);
    }
}

