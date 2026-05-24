import Phaser from 'phaser';
import './style.css';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'app',
    backgroundColor: '#121212',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 }, // Pulls the bird down
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);
let player;
let keys; // Changed from 'cursors' to 'keys'

function preload() {
    this.load.image('bird_right', 'resource/player/Angry_bird_right.png'); 
    this.load.image('bird_left', 'resource/player/Angry_bird_left.png'); 
    this.load.image('bird_back', 'resource/player/Angry_bird_back.png'); 
}

function create() {
    player = this.physics.add.sprite(400, 100, 'bird_right');

    player.setBounce(0.8);
    player.setCollideWorldBounds(true);
    
    // 1. Wire up the WASD keys!
    keys = this.input.keyboard.addKeys('W,A,S,D');
}

function update() {
    // --- WASD MOVEMENT ---
    
    // A = Left, D = Right
    if (keys.A.isDown) {
        player.setVelocityX(-200);
        player.setTexture('bird_left'); 
    } 
    else if (keys.D.isDown) {
        player.setVelocityX(200);
        player.setTexture('bird_right'); 
    } 
    else {
        player.setVelocityX(0); 
    }

    // W = Up / Jump
    if (keys.W.isDown && player.body.blocked.down) {
        player.setVelocityY(-350);
        player.setTexture('bird_back'); 
    }
    
    // S = Down / Fast Fall (Smash down if in the air)
    if (keys.S.isDown && !player.body.blocked.down) {
        player.setVelocityY(400); 
    }
    
    // Reset to facing right/left when landing
    if (player.body.blocked.down && player.texture.key === 'bird_back') {
        player.setTexture('bird_right');
    }
}