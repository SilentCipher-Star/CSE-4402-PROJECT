package com.angrybirds.backend.controller;

import com.angrybirds.backend.model.*;
import com.angrybirds.backend.service.GameService;
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

    @PostMapping("/player/create")
    public Player createPlayer(@RequestBody Player player) {
        return gameService.createPlayer(player);
    }

    @GetMapping("/player/{id}")
    public Player getPlayer(@PathVariable Long id) {
        return gameService.getPlayer(id);
    }

    @PutMapping("/player/{id}/evolve")
    public Player evolvePlayer(@PathVariable Long id,
                               @RequestParam int stage) {
        return gameService.evolvePlayer(id, stage);
    }

    @PostMapping("/score/save")
    public Score saveScore(@RequestBody Score score) {
        return gameService.saveScore(score);
    }

    @GetMapping("/leaderboard")
    public List<Score> getLeaderboard() {
        return gameService.getLeaderboard();
    }
}
