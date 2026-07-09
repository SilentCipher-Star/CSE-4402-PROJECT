package com.angrybirds.backend.service;

import com.angrybirds.backend.model.Player;
import com.angrybirds.backend.model.Score;
import com.angrybirds.backend.repository.PlayerRepository;
import com.angrybirds.backend.repository.ScoreRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class GameService {

    private final PlayerRepository playerRepository;
    private final ScoreRepository scoreRepository;

    public GameService(PlayerRepository playerRepository, ScoreRepository scoreRepository) {
        this.playerRepository = playerRepository;
        this.scoreRepository = scoreRepository;
    }

    public Player createPlayer(Player player) {
        return playerRepository.save(player);
    }

    public Player getPlayer(Long id) {
        return playerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Player not found: " + id));
    }

    public Player evolvePlayer(Long id, int stage) {
        Player player = getPlayer(id);
        player.setEvolutionStage(stage);
        return playerRepository.save(player);
    }

    public Score saveScore(Score score) {
        return scoreRepository.save(score);
    }

    public List<Score> getLeaderboard() {
        return scoreRepository.findTop10ByOrderByScoreDesc();
    }
}
