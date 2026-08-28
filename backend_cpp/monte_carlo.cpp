/**
 * LILEVY GAMES - C++ HIGH-PERFORMANCE MONTE CARLO SIMULATION ENGINE
 * 
 * Melakukan komputasi 1.000.000 (1 Juta) simulasi lemparan 3 dadu Monopoli
 * untuk menghitung probabilitas pendaratan di peta Dunia (52 petak) & Nusantara (40 petak).
 *
 * Cara Kompilasi:
 * Native: g++ -O3 monte_carlo.cpp -o monte_carlo.exe
 * WebAssembly: emcc monte_carlo.cpp -O3 -s WASM=1 -o monte_carlo.wasm
 */

#include <iostream>
#include <vector>
#include <random>
#include <chrono>
#include <iomanip>
#include <string>

struct SimulationResult {
    int tileCount;
    long long totalIterations;
    std::vector<double> landingProbabilities;
    int hottestTileIndex;
    double maxProbability;
    double executionTimeMs;
};

class MonopolySimulator {
public:
    static SimulationResult run(int tileCount = 52, long long iterations = 1000000) {
        auto startTime = std::chrono::high_resolution_clock::now();

        std::vector<long long> visits(tileCount, 0);
        std::mt19937 rng(std::random_device{}());
        std::uniform_int_distribution<int> diceDist(1, 6);

        int pos = 0;
        int jailTile = (tileCount == 40) ? 10 : 13;
        int goToJailTile = (tileCount == 40) ? 30 : 39;

        for (long long i = 0; i < iterations; ++i) {
            int d1 = diceDist(rng);
            int d2 = diceDist(rng);
            int d3 = diceDist(rng);

            // Triple dadu = langsung ke penjara
            if (d1 == d2 && d2 == d3) {
                pos = jailTile;
            } else {
                int steps = d1 + d2 + d3;
                pos = (pos + steps) % tileCount;

                // Petak Masuk Penjara
                if (pos == goToJailTile) {
                    pos = jailTile;
                }
            }

            visits[pos]++;
        }

        auto endTime = std::chrono::high_resolution_clock::now();
        double elapsedMs = std::chrono::duration<double, std::milli>(endTime - startTime).count();

        std::vector<double> probs(tileCount, 0.0);
        int maxIdx = 0;
        double maxProb = 0.0;

        for (int i = 0; i < tileCount; ++i) {
            probs[i] = (static_cast<double>(visits[i]) / iterations) * 100.0;
            if (probs[i] > maxProb) {
                maxProb = probs[i];
                maxIdx = i;
            }
        }

        return {tileCount, iterations, probs, maxIdx, maxProb, elapsedMs};
    }
};

int main(int argc, char* argv[]) {
    int tiles = (argc > 1) ? std::stoi(argv[1]) : 52;
    long long iters = (argc > 2) ? std::stoll(argv[2]) : 1000000;

    std::cout << "========================================================\n";
    std::cout << " [LILEVY GAMES] C++ HIGH-PERFORMANCE MONTE CARLO ENGINE \n";
    std::cout << "========================================================\n";
    std::cout << "Menjalankan " << iters << " simulasi lemparan 3 dadu (" << tiles << " petak)...\n";

    SimulationResult res = MonopolySimulator::run(tiles, iters);

    std::cout << "\n✅ Simulasi selesai dalam: " << std::fixed << std::setprecision(2) 
              << res.executionTimeMs << " ms (" << (iters / (res.executionTimeMs / 1000.0)) << " iterasi/detik)\n";
    std::cout << "📍 Petak Paling Sering Disinggahi: Petak #" << res.hottestTileIndex 
              << " (" << res.maxProbability << "% peluang)\n\n";

    std::cout << "--- 10 Petak Probabilitas Tertinggi ---\n";
    for (int i = 0; i < res.tileCount; ++i) {
        if (res.landingProbabilities[i] >= 2.2) {
            std::cout << "Petak #" << std::setw(2) << i << ": " 
                      << std::fixed << std::setprecision(3) << res.landingProbabilities[i] << "%\n";
        }
    }

    return 0;
}

