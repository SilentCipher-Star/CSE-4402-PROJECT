package com.birdgame.backend.controller;

import com.birdgame.backend.model.*;
import com.birdgame.backend.service.GameService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class GameController {

    private final GameService gameService;

    public GameController(GameService g) {
        this.gameService = g;
    }

    // Create a new player
    @PostMapping("/player/create")
    public Player createPlayer(@RequestBody Player player) {
        return gameService.createPlayer(player);
    }

    // Get player by ID
    @GetMapping("/player/{id}")
    public Player getPlayer(@PathVariable Long id) {
        return gameService.getPlayer(id);
    }

    // Evolve player's bird
    @PutMapping("/player/{id}/evolve")
    public Player evolvePlayer(@PathVariable Long id,
                               @RequestParam int stage) {
        return gameService.evolvePlayer(id, stage);
    }

    // Save score after a level
    @PostMapping("/score/save")
    public Score saveScore(@RequestBody Score score) {
        return gameService.saveScore(score);
    }

    // Get top 10 leaderboard
    @GetMapping("/leaderboard")
    public List<Score> getLeaderboard() {
        return gameService.getLeaderboard();
    }
}