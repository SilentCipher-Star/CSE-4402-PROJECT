import Phaser from 'phaser'

import { GameScene2 } from './scenes/Gamescene2.js'
import { FlashcardScene2 } from './scenes/FlashcardScene2.js'
import { GameScene3 } from './scenes/GameScene3.js'
import { ReportScene } from './scenes/ReportScene.js'
import { FlashCardScene } from './scenes/FlashCardScene.js'
import { ShowcaseScene } from './scenes/ShowcaseScene.js'
import { MenuScene }  from './scenes/MenuScene.js'
import { StoryScene } from './scenes/StoryScene.js'
import { GameScene }  from './scenes/GameScene.js'
import { UIScene }    from './scenes/UIScene.js'
import { LastScene }  from './scenes/LastScene.js'

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
    ReportScene,
    FlashCardScene,
    ShowcaseScene,
    GameScene2,
    FlashcardScene2,
    GameScene3,
    UIScene,
    LastScene
  ]
}

new Phaser.Game(config)