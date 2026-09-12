import Phaser from 'phaser'

// import { GameScene2 } from './scenes/GameScene2'
import { ReportScene } from './scenes/ReportScene.js'
import { FlashCardScene } from './scenes/FlashCardScene.js'
import { ShowcaseScene } from './scenes/ShowcaseScene.js'
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
  scene: [
    MenuScene,
    StoryScene,
    GameScene,
    UIScene,
    ReportScene,
    FlashCardScene,
    ShowcaseScene
  ]
}

new Phaser.Game(config)