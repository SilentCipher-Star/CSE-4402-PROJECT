package com.angrybirds.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "scores")
public class Score {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long playerId;
    private int levelNumber;
    private int score;
    private int eggsSaved;
    private int timeSeconds;
}
