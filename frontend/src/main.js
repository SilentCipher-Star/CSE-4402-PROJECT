import Phaser from 'phaser'
<<<<<<< HEAD
import { MenuScene }  from './scenes/MenuScene.js'
import { StoryScene } from './scenes/StoryScene.js'
import { GameScene }  from './scenes/GameScene.js'
import { UIScene }    from './scenes/UIScene.js'
=======
import { MenuScene } from './scenes/MenuScene.js'
import { GameScene } from './scenes/GameScene.js'
import { UIScene } from './scenes/UIScene.js'
import { StoryScene } from './scenes/StoryScene.js'
>>>>>>> 6fe7974 (Updated main menu UI, added custom play button and controls)

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
<<<<<<< HEAD
  scene: [MenuScene, StoryScene, GameScene, UIScene]
=======
scene: [MenuScene, StoryScene, GameScene, UIScene]
>>>>>>> 6fe7974 (Updated main menu UI, added custom play button and controls)
}

new Phaser.Game(config)
