package com.lilevy.games;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * LILEVY GAMES - JAVA SPRING BOOT BACKEND SERVICE
 * Mengelola Autentikasi Pengguna, Database Profil Cloud, Peringkat Global Terpusat & Matchmaking.
 */
@SpringBootApplication
public class LilevyGamesApplication {

    public static void main(String[] args) {
        SpringApplication.run(LilevyGamesApplication.class, args);
        System.out.println("🚀 [LILEVY GAMES] Java Spring Boot Enterprise Server berjalan di port 8080");
    }
}

