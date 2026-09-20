import Phaser from 'phaser'
import { MenuScene }  from './scenes/MenuScene.js'
import { StoryScene } from './scenes/StoryScene.js'
import { GameScene }  from './scenes/GameScene.js'
import { GameScene2 } from './scenes/GameScene2.js'
import { GameScene3 } from './scenes/GameScene3.js'
import { UIScene }    from './scenes/UIScene.js'
import { FlashcardScene }    from './scenes/FlashcardScene.js'
import { FlashcardScene2 }    from './scenes/FlashcardScene2.js'
import { Showcasescene }    from './scenes/Showcasescene.js'
import { LastScene }    from './scenes/LastScene.js'
import { ReportScene }    from './scenes/ReportScene.js'

const config = {
  type: Phaser.AUTO,
  parent: 'app',
  backgroundColor: '#2d5a1b',
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
  scene: [MenuScene, StoryScene, GameScene, GameScene2, GameScene3, UIScene, FlashcardScene,FlashcardScene2, Showcasescene,LastScene,ReportScene]
}

new Phaser.Game(config)
