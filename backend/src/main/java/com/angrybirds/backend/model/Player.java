package com.angrybirds.backend.model;

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
    private String chosenBird;
    private int evolutionStage;
    private int totalEggs;
    private int highScore;
}
