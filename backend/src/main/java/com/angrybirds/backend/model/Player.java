package com.birdgame.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "players")
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String chosenBird;    // "FireBird", "IceBird" etc
    private int evolutionStage;   // 1, 2, or 3
    private int totalEggs;
    private int highScore;
}