import Phaser from 'phaser'
import { MenuScene }  from './scenes/MenuScene.js'
import { StoryScene } from './scenes/StoryScene.js'
import { GameScene }  from './scenes/GameScene.js'
import { UIScene }    from './scenes/UIScene.js'

const config = {
  type: Phaser.AUTO,
  parent: 'app',
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scene: [MenuScene, StoryScene, GameScene, UIScene]
}

new Phaser.Game(config)
