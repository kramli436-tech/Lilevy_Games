package com.lilevy.games.model;

public class PlayerProfile {
    private String id;
    private String username;
    private String avatar;
    private long totalPoints;
    private int puzzlesSolved;
    private int monopolyVictories;
    private String rankTier;

    public PlayerProfile() {}

    public PlayerProfile(String id, String username, String avatar, long totalPoints, int puzzlesSolved, int monopolyVictories, String rankTier) {
        this.id = id;
        this.username = username;
        this.avatar = avatar;
        this.totalPoints = totalPoints;
        this.puzzlesSolved = puzzlesSolved;
        this.monopolyVictories = monopolyVictories;
        this.rankTier = rankTier;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public long getTotalPoints() { return totalPoints; }
    public void setTotalPoints(long totalPoints) { this.totalPoints = totalPoints; }
    public int getPuzzlesSolved() { return puzzlesSolved; }
    public void setPuzzlesSolved(int puzzlesSolved) { this.puzzlesSolved = puzzlesSolved; }
    public int getMonopolyVictories() { return monopolyVictories; }
    public void setMonopolyVictories(int monopolyVictories) { this.monopolyVictories = monopolyVictories; }
    public String getRankTier() { return rankTier; }
    public void setRankTier(String rankTier) { this.rankTier = rankTier; }
}

