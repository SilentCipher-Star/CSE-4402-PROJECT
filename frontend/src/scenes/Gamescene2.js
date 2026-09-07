import Phaser from 'phaser'
import { Terminal } from '../ui/Terminal.js'

export class GameScene2 extends Phaser.Scene {
  constructor() { super('GameScene2') }

  preload() {
    this.load.image('arctic_ground', 'resource/tiles/ground_arctic.png')
    this.load.image('arctic_tree', 'resource/tiles/tree_arctic.png')
    this.load.image('arctic_tree_frozen', 'resource/tiles/tree_arctic_frozen.png')
    // Reuse existing assets
    this.load.image('sand', 'resource/tiles/sand.png')
    this.load.image('card_wollemi', 'resource/flashcards/card_wollemi.png')
    this.load.image('card_pennantia', 'resource/flashcards/card_pennantia.png')
    this.load.image('card_bois', 'resource/flashcards/card_bois.png')
    this.load.image('card_baobab', 'resource/flashcards/card_baobab.png')
    this.load.image('card_torreya', 'resource/flashcards/card_torreya.png')
    this.load.image('card_monkey', 'resource/flashcards/card_monkey.png')
    this.load.image('card_chestnut', 'resource/flashcards/card_chestnut.png')
    this.load.image('card_dragon', 'resource/flashcards/card_dragon.png')
    this.load.image('ember_right', 'resource/player/ember_right.png')
    this.load.image('ember_left', 'resource/player/ember_left.png')
    this.load.image('ember_back', 'resource/player/ember_back.png')
    this.load.image('ember_front', 'resource/player/ember_front.png')
    this.load.image('frost_right', 'resource/player/frost_right.png')
    this.load.image('frost_left', 'resource/player/frost_left.png')
    this.load.image('frost_back', 'resource/player/frost_back.png')
    this.load.image('frost_front', 'resource/player/frost_front.png')
    this.load.image('volt_right', 'resource/player/volt_right.png')
    this.load.image('volt_left', 'resource/player/volt_left.png')
    this.load.image('volt_back', 'resource/player/volt_back.png')
    this.load.image('volt_front', 'resource/player/volt_front.png')
    this.load.image('shade_right', 'resource/player/shade_right.png')
    this.load.image('shade_left', 'resource/player/shade_left.png')
    this.load.image('shade_back', 'resource/player/shade_back.png')
    this.load.image('shade_front', 'resource/player/shade_front.png')
    this.load.image('gale_right', 'resource/player/gale_right.png')
    this.load.image('gale_left', 'resource/player/gale_left.png')
    this.load.image('gale_back', 'resource/player/gale_back.png')
    this.load.image('gale_front', 'resource/player/gale_front.png')
    this.load.image('hunter_front', 'resource/hunters/hunter_front.png')
    this.load.image('hunter_back', 'resource/hunters/hunter_back.png')
    this.load.image('hunter_left', 'resource/hunters/hunter_left.png')
    this.load.image('hunter_right', 'resource/hunters/hunter_right.png')
    this.load.image('penguin_front', 'resource/wildlife/penguin_front.png')
    this.load.image('penguin_back', 'resource/wildlife/penguin_back.png')
    this.load.image('penguin_left', 'resource/wildlife/penguin_left.png')
    this.load.image('penguin_right', 'resource/wildlife/penguin_right.png')
    this.load.image('bear_front', 'resource/wildlife/bear_front.png')
    this.load.image('bear_back', 'resource/wildlife/bear_back.png')
    this.load.image('bear_left', 'resource/wildlife/bear_left.png')
    this.load.image('bear_right', 'resource/wildlife/bear_right.png')
  }

  init(data) {
    this.playerName = data.playerName || 'Adventurer'
    this.chosenBird = data.chosenBird || 'Ember'
    this.score = data.score || 0
    this.eggsCollected = 0
    this.evolutionStage = data.evolutionStage || 1
    this.goldenEggs = 0
    this.isAttacking = false
    this.playerDir = 'right'
    this.timeLeft = 200
    this.bobTimer = 0
    this.isMoving = false
    this.currentWeapon = 'normal'
    this.playerHitCooldown = false
    this.playerHP = data.playerHP || 5
    this.maxHP = data.maxHP || 5
    this.terminalOpen = false
    this.stealthMode = false
    this.gameEnding = false
    this.forestHealth = 100
    this.totalSaplings = 14
    this.wildlifeJournal = data.wildlifeJournal || []
  }

  create() {
    this.createSnowEffect()
    this.input.keyboard.enabled = true
    this.input.keyboard.enableGlobalCapture()
    document.querySelectorAll('input').forEach(el => el.remove())

    this.TILE = 48

    this.mapData = this.parseMap()
    this.mapRows = this.mapData.length
    this.mapCols = this.mapData[0].length
    this.worldW = this.mapCols * this.TILE
    this.worldH = this.mapRows * this.TILE

    const birdColors = {
      Ember: 0xFF4500, Frost: 0x00BFFF,
      Volt: 0xFFD700, Shade: 0xBF5FFF, Gale: 0x00FF88
    }
    this.birdColor = birdColors[this.chosenBird] || 0xffffff

    this.physics.world.setBounds(0, 0, this.worldW, this.worldH)
    this.cameras.main.setBounds(0, 0, this.worldW, this.worldH)
    this.cameras.main.setBackgroundColor('#a8c8e0')

    this.drawWorld()

    this.eggList = []
    this.spawnEggs()
    this.monsterList = []
    this.spawnMonsters()
    this.weaponList = []
    this.spawnWeapons()
    this.spawnWildlife()

    this.portalGfx = this.add.graphics()
    this.portalAngle = 0
    this.portalCol = 45
    this.portalRow = 43
    this.drawPortal()

    const b = this.chosenBird.toLowerCase()
    this.player = this.physics.add.sprite(
      1 * this.TILE + this.TILE / 2,
      1 * this.TILE + this.TILE / 2,
      b + '_right'
    )
    this.player.setDisplaySize(this.TILE + 8, this.TILE + 8)
    this.player.setCollideWorldBounds(true)
    this.player.body.setSize(28, 28)

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)

    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    })
    this.cursors = this.input.keyboard.createCursorKeys()
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    this.collectKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)

    this.time.addEvent({
      delay: 1000,
      callback: () => { if (this.timeLeft > 0) this.timeLeft-- },
      repeat: 199
    })

    this.scene.launch('UIScene', { gameScene: this })

    this.terminal = new Terminal(this)
    this.input.keyboard.on('keydown-TILDE', () => this.terminal.toggle())
    this.input.keyboard.on('keydown-BACKTICK', () => this.terminal.toggle())
  }

  parseMap() {
    const raw = [
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [2, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 5, 5, 5, 5, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5, 5, 5, 1, 1, 1, 2],
      [2, 5, 1, 1, 1, 1, 1, 1, 5, 1, 1, 5, 1, 1, 1, 5, 1, 5, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 2],
      [2, 5, 1, 1, 5, 5, 5, 1, 5, 1, 1, 5, 1, 1, 1, 5, 1, 5, 1, 1, 5, 5, 5, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 2],
      [2, 5, 1, 1, 5, 1, 1, 1, 5, 1, 1, 5, 1, 1, 1, 5, 1, 5, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5, 5, 5, 1, 1, 1, 2],
      [2, 5, 5, 5, 5, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 2],
      [2, 5, 1, 1, 5, 1, 1, 1, 5, 1, 1, 5, 1, 1, 1, 5, 1, 5, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 1, 5, 1, 1, 1, 2],
      [2, 5, 1, 1, 5, 1, 1, 1, 5, 1, 1, 5, 1, 1, 1, 5, 1, 5, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 1, 5, 1, 1, 1, 2],
      [2, 5, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 5, 1, 1, 1, 2],
      [2, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 5, 5, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 1, 5, 1, 1, 1, 2],
      [2, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 5, 1, 1, 1, 2],
      [2, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 1, 5, 1, 1, 1, 2],
      [2, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 5, 5, 5, 5, 5, 5, 1, 1, 1, 2],
      [2, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 5, 1, 1, 1, 2],
      [2, 1, 5, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 5, 1, 1, 1, 2],
      [2, 1, 5, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 5, 1, 1, 1, 2],
      [2, 1, 5, 1, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 5, 1, 1, 1, 2],
      [2, 1, 5, 1, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 5, 1, 1, 1, 2],
      [2, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 5, 1, 1, 1, 2],
      [2, 1, 1, 1, 1, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 1, 5, 1, 1, 1, 2],
      [2, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 5, 1, 1, 1, 1, 5, 1, 1, 1, 2],
      [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 1, 5, 1, 1, 1, 2],
      [2, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 5, 1, 1, 1, 2],
      [2, 1, 1, 5, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 5, 1, 1, 1, 2],
      [2, 1, 1, 5, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 5, 1, 1, 1, 1, 5, 1, 1, 1, 2],
      [2, 1, 1, 5, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 2],
      [2, 1, 1, 5, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 2],
      [2, 1, 1, 5, 5, 5, 5, 1, 1, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 2],
      [2, 1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 5, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 2],
      [2, 1, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 2],
      [2, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 2],
      [2, 5, 1, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5, 1, 2],
      [2, 5, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 2],
      [2, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 2],
      [2, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 2],
      [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 2],
      [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 2],
      [2, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 5, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 2],
      [2, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 2],
      [2, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 2],
      [2, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 2],
      [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 2],
      [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 2],
      [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 2],
      [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 2],
      [2, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 2],
      [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
      [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    ]
    return raw
  }
   showWildlifeCard(species, fact) {
  const { width, height } = this.scale

  const card = this.add.graphics().setScrollFactor(0).setDepth(400)
  card.fillStyle(0x0a1420, 0.97)
  card.fillRoundedRect(width/2 - 180, height/2 - 90, 360, 180, 16)
  card.lineStyle(3, 0xFFD700, 1)
  card.strokeRoundedRect(width/2 - 180, height/2 - 90, 360, 180, 16)

  const title = this.add.text(width/2, height/2 - 60, '🐧 SPECIES COLLECTED!', {
    fontSize: '15px', fontFamily: 'Arial Black', color: '#FFD700'
  }).setOrigin(0.5).setScrollFactor(0).setDepth(401)

  const name = this.add.text(width/2, height/2 - 30, species, {
    fontSize: '20px', fontFamily: 'Arial Black', color: '#ffffff'
  }).setOrigin(0.5).setScrollFactor(0).setDepth(401)

  const factText = this.add.text(width/2, height/2 + 10, fact, {
    fontSize: '11px', fontFamily: 'Arial', color: '#aaccdd',
    wordWrap: { width: 320 }, align: 'center'
  }).setOrigin(0.5).setScrollFactor(0).setDepth(401)

  const count = this.wildlifeJournal.length
  const counter = this.add.text(width/2, height/2 + 60, `Journal: ${count} / 8 species`, {
    fontSize: '11px', fontFamily: 'Arial Black', color: '#00d4ff'
  }).setOrigin(0.5).setScrollFactor(0).setDepth(401)

  const elements = [card, title, name, factText, counter]
  elements.forEach(el => { el.setAlpha(0) })
  this.tweens.add({
    targets: elements, alpha: 1, duration: 250
  })

  this.time.delayedCall(2600, () => {
    this.tweens.add({
      targets: elements, alpha: 0, duration: 300,
      onComplete: () => elements.forEach(el => el.destroy())
    })
  })
}
  drawWorld() {
    for (let row = 0; row < this.mapRows; row++) {
      for (let col = 0; col < this.mapCols; col++) {
        const t = this.mapData[row][col]
        const x = col * this.TILE
        const y = row * this.TILE
        let key = 'arctic_ground'
        if (t === 1) key = 'arctic_tree'
        if (t === 2) key = 'arctic_tree_frozen'
        if (t === 5) key = 'arctic_ground'
        this.add.image(x, y, key)
          .setOrigin(0)
          .setDisplaySize(this.TILE + 2, this.TILE + 2)
      }
    }
  }

  isWall(col, row) {
    if (row < 0 || row >= this.mapRows) return true
    if (col < 0 || col >= this.mapCols) return true
    const t = this.mapData[row][col]
    return t === 1 || t === 2
  }

  spawnEggs() {
    const positions = [
      { col: 3, row: 1, type: 'normal', card: 'card_wollemi' },
      { col: 11, row: 1, type: 'fire', card: 'card_bois' },
      { col: 20, row: 3, type: 'normal', card: 'card_baobab' },
      { col: 4, row: 8, type: 'thunder', card: 'card_torreya' },
      { col: 13, row: 8, type: 'normal', card: 'card_monkey' },
      { col: 17, row: 10, type: 'fire', card: 'card_chestnut' },
      { col: 32, row: 10, type: 'normal', card: 'card_dragon' },
      { col: 3, row: 13, type: 'thunder', card: 'card_pennantia' },
      { col: 24, row: 15, type: 'normal', card: 'card_baobab' },
      { col: 20, row: 20, type: 'fire', card: 'card_wollemi' },
      { col: 6, row: 22, type: 'thunder', card: 'card_bois' },
      { col: 3, row: 24, type: 'normal', card: 'card_torreya' },
      { col: 45, row: 25, type: 'golden', card: 'card_monkey' },
      { col: 45, row: 35, type: 'golden', card: 'card_dragon' },
    ]

    const eggColors = {
      normal: 0xaaddff, fire: 0xFF4500,
      thunder: 0xFFD700, golden: 0xFFD700
    }

    positions.forEach(e => {
      const x = e.col * this.TILE + this.TILE / 2
      const y = e.row * this.TILE + this.TILE / 2
      if (this.isWall(e.col, e.row)) return

      const g = this.add.graphics()
      const stemColor = 0x4a6fa5
      const leafColor = eggColors[e.type]

      g.fillStyle(0x2a4a70, 1)
      g.fillRect(x - 2, y + 4, 4, 12)
      g.fillStyle(leafColor, 1)
      g.fillTriangle(x, y - 14, x - 10, y + 6, x + 10, y + 6)
      g.fillStyle(leafColor, 0.9)
      g.fillTriangle(x, y - 22, x - 7, y - 6, x + 7, y - 6)

      if (e.type !== 'normal') {
        const glow = this.add.circle(x, y, 18, leafColor, 0.2)
        this.tweens.add({
          targets: glow, scaleX: 2, scaleY: 2, alpha: 0,
          duration: 1000, repeat: -1
        })
      }

      this.tweens.add({
        targets: g, angle: 2, duration: 1200,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      })

      this.eggList.push({ graphic: g, x, y, type: e.type, card: e.card, collected: false })
    })
  }
  spawnWildlife() {
const positions = [
  { col: 5,  row: 1,  species: 'Emperor Penguin',    fact: 'Can dive deeper than any other bird — over 500 meters.',        type: 'penguin' },
  { col: 20, row: 1,  species: 'Adelie Penguin',     fact: 'Travels up to 8,000 km per year hunting for food.',             type: 'penguin' },
  { col: 5,  row: 5,  species: 'King Penguin',       fact: 'Takes over a year to raise a single chick.',                    type: 'penguin' },
  { col: 20, row: 5,  species: 'Chinstrap Penguin',  fact: 'Named for the thin black line under its chin.',                 type: 'penguin' },
  { col: 5,  row: 8,  species: 'Gentoo Penguin',     fact: 'The fastest swimming penguin species alive.',                   type: 'penguin' },
  { col: 34, row: 8,  species: 'Rockhopper Penguin', fact: 'Known for hopping between rocks instead of waddling.',          type: 'penguin' },
  { col: 5,  row: 10, species: 'Polar Bear',         fact: 'Sea ice loss is shrinking their hunting grounds every year.',   type: 'bear' },
  { col: 20, row: 10, species: 'Polar Bear Cub',     fact: 'Cubs stay with their mother for over two years.',               type: 'bear' },
]

    this.wildlifeList = []

    positions.forEach(p => {
      if (this.isWall(p.col, p.row)) return
      const x = p.col * this.TILE + this.TILE / 2
      const y = p.row * this.TILE + this.TILE / 2

      const size = p.type === 'bear' ? { w: 70, h: 74 } : { w: 52, h: 58 }

      const sprite = this.add.sprite(x, y, p.type + '_front')
      sprite.setDisplaySize(size.w, size.h)
      sprite.setDepth(8)

      const shadow = this.add.ellipse(x, y + (p.type === 'bear' ? 28 : 22), p.type === 'bear' ? 38 : 30, 12, 0x000000, 0.3)
      shadow.setDepth(7)

      const prompt = this.add.text(x, y - (p.type === 'bear' ? 52 : 42), 'Press E', {
        fontSize: '10px', fontFamily: 'Arial Black',
        color: '#FFD700', stroke: '#000000', strokeThickness: 3
      }).setOrigin(0.5).setDepth(11).setVisible(false)

      this.wildlifeList.push({
        graphic: sprite, shadow, prompt,
        x, y,
        spawnX: x, spawnY: y,
        wanderTimer: Phaser.Math.Between(0, 60),
        moving: false,
        fleeing: false,
        dir: 'front',
        type: p.type,
        size,
        species: p.species,
        fact: p.fact,
        collected: this.wildlifeJournal.includes(p.species)
      })

      if (this.wildlifeJournal.includes(p.species)) {
        sprite.setAlpha(0.4)
      }
    })
  }
  spawnMonsters() {
    const positions = [
      { col: 5, row: 3 },
      { col: 16, row: 5 },
      { col: 24, row: 7 },
      { col: 16, row: 10 },
      { col: 11, row: 13 },
      { col: 14, row: 17 },
      { col: 7, row: 21 },
      { col: 4, row: 25 },
      { col: 40, row: 30 },
    ]

    positions.forEach(m => {
      if (this.isWall(m.col, m.row)) return
      const x = m.col * this.TILE + this.TILE / 2
      const y = m.row * this.TILE + this.TILE / 2

      // Sprite instead of drawn graphic
      const sprite = this.add.sprite(x, y, 'hunter_front')
      sprite.setDisplaySize(48, 58)
      sprite.setOrigin(0.5, 0.6)
      sprite.setDepth(10)

      // Shadow beneath hunter
      const shadow = this.add.ellipse(x, y + 22, 30, 10, 0x000000, 0.35)
      shadow.setDepth(9)

      const body = this.physics.add.image(x, y, null).setVisible(false)
      body.body.setSize(28, 28)
      body.setCollideWorldBounds(true)
      body.setVelocity(60, 0)

      const hpBar = this.add.graphics()
      this.drawHPBar(hpBar, x, y - 28, 2, 2)

      const alert = this.add.text(x, y - 40, '❗', { fontSize: '16px' })
        .setOrigin(0.5).setVisible(false)

      this.monsterList.push({
        graphic: sprite, shadow, body, hpBar, alert,
        hp: 2, maxHp: 2, alive: true,
        chasing: false, patrolTimer: 0, frozen: false,
        alwaysChase: false, hacked: false,
        spawnX: x, spawnY: y,
        dir: 'front', walkTween: null
      })
    })
  }

  spawnWeapons() {
    const weapons = [
      { col: 11, row: 3, type: 'bomb', label: '💣', color: 0xFF6600, desc: 'Area explosion' },
      { col: 24, row: 8, type: 'ice', label: '❄️', color: 0x00BFFF, desc: 'Freeze enemies' },
      { col: 32, row: 18, type: 'lightning', label: '⚡', color: 0xFFD700, desc: 'Chain 3 enemies' },
      { col: 13, row: 27, type: 'boomerang', label: '🪃', color: 0xC8A25A, desc: 'Double hit' },
    ]
    weapons.forEach(w => {
      if (this.isWall(w.col, w.row)) return
      const x = w.col * this.TILE + this.TILE / 2
      const y = w.row * this.TILE + this.TILE / 2
      const bg = this.add.circle(x, y, 20, w.color, 0.9)
      const label = this.add.text(x, y, w.label, { fontSize: '20px' }).setOrigin(0.5)
      const desc = this.add.text(x, y + 28, w.desc, {
        fontSize: '9px', fontFamily: 'Arial',
        color: '#ffffff', stroke: '#000000', strokeThickness: 2
      }).setOrigin(0.5)
      this.tweens.add({
        targets: bg, scaleX: 1.3, scaleY: 1.3, alpha: 0.5,
        duration: 600, yoyo: true, repeat: -1
      })
      this.weaponList.push({ bg, label, desc, x, y, type: w.type, collected: false })
    })
  }

  drawMonster(m, x, y, frozen) {
    // m here is the whole monster object now, not just graphic
    m.graphic.setPosition(x, y)
    if (m.shadow) m.shadow.setPosition(x, y + 22)
    if (frozen) {
      m.graphic.setTint(0x88ccff)
    } else {
      m.graphic.clearTint()
    }
  }

  drawHPBar(g, x, y, hp, maxHp) {
    g.clear()
    g.fillStyle(0x000044, 1)
    g.fillRect(-16, 0, 32, 5)
    g.fillStyle(hp > 1 ? 0x4488ff : 0xff0000, 1)
    g.fillRect(-16, 0, (hp / maxHp) * 32, 5)
    g.setPosition(x, y)
  }

  drawPortal() {
    this.portalGfx.clear()
    const x = this.portalCol * this.TILE + this.TILE / 2
    const y = this.portalRow * this.TILE + this.TILE / 2
    const a = this.portalAngle
    this.portalGfx.lineStyle(5, 0x00BFFF, 0.25)
    this.portalGfx.strokeCircle(x, y, 30)
    this.portalGfx.lineStyle(3, 0x88EEFF, 0.5)
    this.portalGfx.strokeCircle(x, y, 22)
    for (let i = 0; i < 4; i++) {
      const angle = a + (i * Math.PI / 2)
      this.portalGfx.fillStyle(0xffffff, 0.9)
      this.portalGfx.fillCircle(x + Math.cos(angle) * 22, y + Math.sin(angle) * 22, 3)
    }
    this.portalGfx.fillStyle(0x00BFFF, 0.5)
    this.portalGfx.fillCircle(x, y, 13)
    this.portalGfx.fillStyle(0xffffff, 0.4)
    this.portalGfx.fillCircle(x, y, 6)
  }

  showFloatingText(worldX, worldY, msg, color) {
    const t = this.add.text(worldX, worldY, msg, {
      fontSize: '14px', fontFamily: 'Arial Black', color
    }).setOrigin(0.5)
    this.tweens.add({
      targets: t, y: worldY - 55, alpha: 0,
      duration: 1100, onComplete: () => t.destroy()
    })
  }

  showSpeciesCard(cardKey) {
    const { width, height } = this.scale
    const card = this.add.image(width + 300, height / 2, cardKey)
      .setOrigin(1, 0.5).setScrollFactor(0).setDepth(200).setScale(0.38).setAlpha(0)
    this.tweens.add({ targets: card, x: width - 20, alpha: 1, duration: 300, ease: 'Back.easeOut' })
    this.time.delayedCall(3200, () => {
      this.tweens.add({
        targets: card, x: width + 300, alpha: 0, duration: 250, ease: 'Back.easeIn',
        onComplete: () => card.destroy()
      })
    })
  }

  checkEvolution() {
    if (this.goldenEggs >= 3 && this.evolutionStage < 3) {
      this.evolutionStage = 3
      this.maxHP = 6
      this.playerHP = Math.min(this.playerHP + 1, 6)
      this.player.setTint(0xFFD700)
      this.showFloatingText(this.player.x, this.player.y - 40, '🔥 STAGE 3!', '#FF6B2B')
    } else if (this.goldenEggs >= 1 && this.evolutionStage < 2) {
      this.evolutionStage = 2
      this.player.setTint(0xaaffff)
      this.showFloatingText(this.player.x, this.player.y - 40, '✨ STAGE 2!', '#00BFFF')
    }
  }
  createSnowEffect() {
    const { width, height } = this.scale

    for (let i = 0; i < 120; i++) {
      const x = Phaser.Math.Between(0, width)
      const y = Phaser.Math.Between(-height, height)
      const size = Phaser.Math.FloatBetween(1, 4)
      const alpha = Phaser.Math.FloatBetween(0.4, 1.0)
      const fallSpeed = Phaser.Math.Between(2000, 6000)
      const drift = Phaser.Math.Between(-30, 30)

      const flake = this.add.circle(x, y, size, 0xffffff, alpha)
      flake.setScrollFactor(0)
      flake.setDepth(199)

      this.tweens.add({
        targets: flake,
        y: height + 20,
        x: flake.x + drift,
        duration: fallSpeed,
        repeat: -1,
        onRepeat: () => {
          flake.setPosition(
            Phaser.Math.Between(0, width),
            Phaser.Math.Between(-50, -10)
          )
          flake.setAlpha(Phaser.Math.FloatBetween(0.4, 1.0))
        }
      })
    }
  }
  useWeapon() {
    if (this.isAttacking) return
    this.isAttacking = true
    const range = this.evolutionStage >= 3 ? 220 :
      this.evolutionStage >= 2 ? 170 : 120

    switch (this.currentWeapon) {
      case 'normal': {
        const sw = this.add.graphics()
        sw.lineStyle(3, this.birdColor, 0.9)
        sw.strokeCircle(this.player.x, this.player.y, 10)
        this.tweens.add({ targets: sw, scaleX: range / 10, scaleY: range / 10, alpha: 0, duration: 350, onComplete: () => sw.destroy() })
        this.hitMonstersInRange(this.player.x, this.player.y, range, 1, this.birdColor)
        break
      }
      case 'bomb': {
        const boom = this.add.graphics()
        boom.fillStyle(0xFF6600, 0.7)
        boom.fillCircle(this.player.x, this.player.y, 20)
        this.tweens.add({ targets: boom, scaleX: 8, scaleY: 8, alpha: 0, duration: 500, onComplete: () => boom.destroy() })
        this.hitMonstersInRange(this.player.x, this.player.y, range * 2.2, 3, 0xFF6600)
        this.cameras.main.shake(300, 0.01)
        break
      }
      case 'ice': {
        const iceRing = this.add.graphics()
        iceRing.lineStyle(3, 0x00BFFF, 0.9)
        iceRing.strokeCircle(this.player.x, this.player.y, 10)
        this.tweens.add({ targets: iceRing, scaleX: range / 10, scaleY: range / 10, alpha: 0, duration: 400, onComplete: () => iceRing.destroy() })
        this.monsterList.forEach(m => {
          if (!m.alive || !m.body || !m.body.active) return
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, m.body.x, m.body.y)
          if (dist < range) {
            m.frozen = true
            m.body.setVelocity(0, 0)
            this.drawMonster(m, m.body.x, m.body.y, true)
            this.showFloatingText(m.body.x, m.body.y - 20, '❄️ FROZEN!', '#00BFFF')
            this.time.delayedCall(3000, () => { if (m.alive) { m.frozen = false; this.drawMonster(m, m.body.x, m.body.y, false) } })
          }
        })
        break
      }
      case 'lightning': {
        const sorted = this.monsterList.filter(m => m.alive && m.body && m.body.active)
          .sort((a, b) => Phaser.Math.Distance.Between(this.player.x, this.player.y, a.body.x, a.body.y) - Phaser.Math.Distance.Between(this.player.x, this.player.y, b.body.x, b.body.y))
          .slice(0, 3)
        const lightning = this.add.graphics()
        lightning.lineStyle(3, 0xFFD700, 1)
        let lx = this.player.x, ly = this.player.y
        sorted.forEach(m => {
          lightning.beginPath(); lightning.moveTo(lx, ly)
          const mx = (lx + m.body.x) / 2 + Phaser.Math.Between(-20, 20)
          const my = (ly + m.body.y) / 2 + Phaser.Math.Between(-20, 20)
          lightning.lineTo(mx, my); lightning.lineTo(m.body.x, m.body.y); lightning.strokePath()
          lx = m.body.x; ly = m.body.y
          m.hp--; this.drawHPBar(m.hpBar, m.body.x, m.body.y - 28, m.hp, m.maxHp)
          this.showFloatingText(m.body.x, m.body.y - 20, '⚡ ZAP!', '#FFD700')
          if (m.hp <= 0) this.killMonster(m)
        })
        this.tweens.add({ targets: lightning, alpha: 0, duration: 300, onComplete: () => lightning.destroy() })
        break
      }
      case 'boomerang': {
        this.hitMonstersInRange(this.player.x, this.player.y, range, 1, 0xC8A25A)
        this.time.delayedCall(400, () => {
          this.hitMonstersInRange(this.player.x, this.player.y, range, 1, 0xC8A25A)
          this.showFloatingText(this.player.x, this.player.y - 30, '🪃 Boomerang!', '#C8A25A')
        })
        break
      }
    }
    this.time.delayedCall(400, () => { this.isAttacking = false })
  }

  hitMonstersInRange(x, y, range, damage, color) {
    let hit = false
    this.monsterList.forEach(m => {
      if (!m.alive || !m.body || !m.body.active) return
      const dist = Phaser.Math.Distance.Between(x, y, m.body.x, m.body.y)
      if (dist < range) {
        hit = true
        m.hp -= damage
        this.drawHPBar(m.hpBar, m.body.x, m.body.y - 28, m.hp, m.maxHp)
        m.graphic.setAlpha(0.3)
        this.time.delayedCall(150, () => { if (m.graphic) m.graphic.setAlpha(1) })
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2
          const burst = this.add.graphics()
          burst.fillStyle(color, 1)
          burst.fillCircle(m.body.x, m.body.y, 4)
          this.tweens.add({
            targets: burst,
            x: m.body.x + Math.cos(angle) * Phaser.Math.Between(15, 40),
            y: m.body.y + Math.sin(angle) * Phaser.Math.Between(15, 40),
            alpha: 0, scaleX: 0.2, scaleY: 0.2,
            duration: Phaser.Math.Between(200, 500),
            onComplete: () => burst.destroy()
          })
        }
        if (m.hp <= 0) this.killMonster(m)
        else this.showFloatingText(m.body.x, m.body.y - 20, '⚔️ Hit!', '#ffaaaa')
      }
    })
    if (!hit && this.currentWeapon === 'normal')
      this.showFloatingText(this.player.x, this.player.y - 30, 'Miss!', '#888888')
  }

  killMonster(m) {
    m.alive = false
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2
      const burst = this.add.graphics()
      burst.fillStyle(0x0044ff, 1)
      burst.fillCircle(m.body.x, m.body.y, 5)
      this.tweens.add({
        targets: burst,
        x: m.body.x + Math.cos(angle) * Phaser.Math.Between(20, 50),
        y: m.body.y + Math.sin(angle) * Phaser.Math.Between(20, 50),
        alpha: 0, scaleX: 0.2, scaleY: 0.2,
        duration: Phaser.Math.Between(300, 600),
        onComplete: () => burst.destroy()
      })
    }
    m.graphic.destroy(); m.hpBar.destroy(); m.alert.destroy(); m.body.destroy()
    this.score += 300
    this.showFloatingText(m.body.x, m.body.y, '💥 +300', '#4488ff')
  }

  async saveScore() {
    try {
      const pr = await fetch('http://localhost:8080/api/player/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: this.playerName, chosenBird: this.chosenBird })
      })
      const player = await pr.json()
      await fetch('http://localhost:8080/api/score/save', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: player.id, levelNumber: 2, score: this.score, eggsSaved: this.eggsCollected, timeSeconds: 200 - this.timeLeft })
      })
    } catch (e) { console.log('Score not saved') }
  }

  endGame(escaped) {
    if (this.gameEnding) return
    this.gameEnding = true
    this.cameras.main.shake(1, 0)
    this.cameras.main.stopFollow()
    this.cameras.main.resetFX()
    if (this.player) { this.player.setVelocity(0, 0); this.player.body.enable = false }
    this.monsterList.forEach(m => {
      if (m.alive && m.body && m.body.active) { m.body.setVelocity(0, 0); m.body.enable = false }
      if (m.alert) m.alert.setVisible(false)
    })
    this.tweens.killAll()
    this.time.removeAllEvents()
    this.physics.pause()
    this.input.keyboard.enabled = false
    if (this.terminal) this.terminal.destroy()
    this.saveScore()
    this.scene.stop('UIScene')
    this.time.delayedCall(200, () => this.showConservationReport(escaped))
  }
  animateHunterWalk(m) {
    if (m.walkTween) return // already animating
    m.walkTween = this.tweens.add({
      targets: m.graphic,
      y: m.graphic.y - 3,
      duration: 220,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }
  showConservationReport(escaped) {
    const { width, height } = this.scale

    const saplings = this.eggsCollected
    const total = this.totalSaplings || 14
    const co2 = saplings * 22
    const machines = this.monsterList.filter(m => !m.alive).length
    const health = Math.max(0, Math.round(this.forestHealth || 100))
    const timeTaken = 200 - (this.timeLeft || 0)

    const grade =
      saplings >= 12 ? 'S' :
        saplings >= 10 ? 'A' :
          saplings >= 7 ? 'B' :
            saplings >= 4 ? 'C' : 'D'

    const gradeColorInt =
      grade === 'S' ? 0xFFD700 :
        grade === 'A' ? 0x00ff88 :
          grade === 'B' ? 0x00d4ff :
            grade === 'C' ? 0xFF8C00 : 0xff3355

    const gradeColor =
      grade === 'S' ? '#FFD700' :
        grade === 'A' ? '#00ff88' :
          grade === 'B' ? '#00d4ff' :
            grade === 'C' ? '#FF8C00' : '#ff3355'

    const birdFacts = {
      Ember: 'Scarlet Macaws mate for life and can live 75 years in the wild.',
      Frost: 'Snowy Owls are now Vulnerable due to rapid Arctic habitat loss.',
      Volt: 'Only ~800 Philippine Eagles remain. Every individual matters.',
      Shade: 'The Forest Owlet was thought extinct for 113 years until 1997.',
      Gale: 'Fewer than 15 Bristlefronts may exist on Earth right now.'
    }

    // ── Dark overlay ────────────────────────────────────────────
    const overlay = this.add.graphics().setScrollFactor(0).setDepth(300)
    overlay.fillStyle(0x000000, 0.93)
    overlay.fillRect(0, 0, width, height)

    // ── Main card — icy dark blue ────────────────────────────────
    const cardX = width / 2 - 320
    const cardY = 20
    const cardW = 640
    const cardH = height - 40

    const card = this.add.graphics().setScrollFactor(0).setDepth(301)
    card.fillStyle(0x0a1420, 1)
    card.fillRoundedRect(cardX, cardY, cardW, cardH, 20)
    card.lineStyle(2, escaped ? 0x1e4e6e : 0x5e1e1e, 1)
    card.strokeRoundedRect(cardX, cardY, cardW, cardH, 20)

    // ── Header banner ────────────────────────────────────────────
    const headerH = 88
    const headerBg = this.add.graphics().setScrollFactor(0).setDepth(301)
    headerBg.fillGradientStyle(
      escaped ? 0x0d2a40 : 0x330d0d,
      escaped ? 0x0d2a40 : 0x330d0d,
      0x0a1420, 0x0a1420, 1
    )
    headerBg.fillRoundedRect(cardX, cardY, cardW, headerH, { tl: 20, tr: 20, bl: 0, br: 0 })

    headerBg.fillStyle(escaped ? 0x00d4ff : 0xff3355, 1)
    headerBg.fillRect(cardX, cardY + headerH - 2, cardW, 3)

    this.add.text(cardX + 28, cardY + 18, escaped ? '❄️ ARCTIC CONSERVATION REPORT' : '💀 EXPEDITION FAILED', {
      fontSize: '20px', fontFamily: 'Arial Black',
      color: escaped ? '#00d4ff' : '#ff3355'
    }).setScrollFactor(0).setDepth(302)

    this.add.text(cardX + 28, cardY + 50, escaped
      ? 'Saplings delivered to the tundra replanting zone'
      : 'The tundra machines won this expedition', {
      fontSize: '11px', fontFamily: 'Arial',
      color: '#7a94aa'
    }).setScrollFactor(0).setDepth(302)

    // ── Grade badge ───────────────────────────────────────────────
    const gradeX = cardX + cardW - 66
    const gradeY = cardY + 44
    const gradeGlow = this.add.graphics().setScrollFactor(0).setDepth(301)
    gradeGlow.fillStyle(gradeColorInt, 0.15)
    gradeGlow.fillCircle(gradeX, gradeY, 38)
    gradeGlow.fillStyle(0x0a1420, 1)
    gradeGlow.fillCircle(gradeX, gradeY, 30)
    gradeGlow.lineStyle(2.5, gradeColorInt, 1)
    gradeGlow.strokeCircle(gradeX, gradeY, 30)

    this.add.text(gradeX, gradeY, grade, {
      fontSize: '26px', fontFamily: 'Arial Black', color: gradeColor
    }).setOrigin(0.5).setScrollFactor(0).setDepth(303)

    this.add.text(gradeX, gradeY + 44, 'GRADE', {
      fontSize: '9px', fontFamily: 'Arial Black', color: '#4a6a80'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302)

    // ── Stat rows ────────────────────────────────────────────────
    const stats = [
      { icon: '🌱', label: 'SAPLINGS RESCUED', value: `${saplings}/${total}`, bar: saplings / total, barColor: 0x00ff88, chip: 0x0d3320 },
      { icon: '👹', label: 'HUNTERS DEFEATED', value: `${machines}`, bar: Math.min(machines / 9, 1), barColor: 0xff6644, chip: 0x331a0d },
      { icon: '🌲', label: 'FOREST HEALTH', value: `${health}%`, bar: health / 100, barColor: health > 60 ? 0x00ff88 : health > 30 ? 0xFF8C00 : 0xff3355, chip: 0x1a2a2a },
      { icon: '💨', label: 'CO₂ ABSORBED/YR', value: `${co2} kg`, bar: Math.min(co2 / 308, 1), barColor: 0x00d4ff, chip: 0x0d2733 },
      { icon: '⏱️', label: 'TIME TAKEN', value: `${timeTaken}s`, bar: Math.max(0, 1 - timeTaken / 200), barColor: 0xFFD700, chip: 0x332a0d },
    ]

    const startY = cardY + headerH + 18
    const rowH = 56
    const rowGap = 6

    stats.forEach((st, i) => {
      const ry = startY + i * (rowH + rowGap)

      const rowBg = this.add.graphics().setScrollFactor(0).setDepth(301)
      rowBg.fillStyle(0x0f1c28, 1)
      rowBg.fillRoundedRect(cardX + 16, ry, cardW - 32, rowH, 10)

      const chipBg = this.add.graphics().setScrollFactor(0).setDepth(302)
      chipBg.fillStyle(st.chip, 1)
      chipBg.fillRoundedRect(cardX + 26, ry + 9, 38, 38, 9)
      this.add.text(cardX + 45, ry + 28, st.icon, {
        fontSize: '17px'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(303)

      this.add.text(cardX + 76, ry + 10, st.label, {
        fontSize: '10px', fontFamily: 'Arial Black', color: '#e8f2f8'
      }).setScrollFactor(0).setDepth(302)

      this.add.text(cardX + cardW - 30, ry + 8, st.value, {
        fontSize: '15px', fontFamily: 'Arial Black', color: '#ffffff'
      }).setOrigin(1, 0).setScrollFactor(0).setDepth(302)

      const barX = cardX + 76
      const barY = ry + 32
      const barW = cardW - 122
      const barH = 6

      const barTrack = this.add.graphics().setScrollFactor(0).setDepth(302)
      barTrack.fillStyle(0x081018, 1)
      barTrack.fillRoundedRect(barX, barY, barW, barH, 3)

      const fillW = Math.max(6, barW * Math.min(st.bar, 1))
      const barFill = this.add.graphics().setScrollFactor(0).setDepth(303)
      barFill.fillStyle(st.barColor, 1)
      barFill.fillRoundedRect(barX, barY, fillW, barH, 3)
      barFill.fillStyle(st.barColor, 0.5)
      barFill.fillCircle(barX + fillW, barY + barH / 2, 5)
    })

    // ── CO2 equivalence banner ───────────────────────────────────
    const eqY = startY + stats.length * (rowH + rowGap) + 4
    const eqBg = this.add.graphics().setScrollFactor(0).setDepth(301)
    eqBg.fillStyle(0x0d1f2f, 1)
    eqBg.fillRoundedRect(cardX + 16, eqY, cardW - 32, 34, 10)
    eqBg.lineStyle(1, 0x1e4e6e, 0.6)
    eqBg.strokeRoundedRect(cardX + 16, eqY, cardW - 32, 34, 10)
    this.add.text(width / 2, eqY + 17,
      `🚗  Equal to removing ${Math.max(1, Math.round(co2 / 140))} car${co2 >= 140 ? 's' : ''} from the road for a year`, {
      fontSize: '11px', fontFamily: 'Arial', color: '#8fc9d9'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302)

    // ── Species spotlight ─────────────────────────────────────────
    const spotY = eqY + 44
    const spotBg = this.add.graphics().setScrollFactor(0).setDepth(301)
    spotBg.fillStyle(0x1f1a0a, 1)
    spotBg.fillRoundedRect(cardX + 16, spotY, cardW - 32, 58, 10)
    spotBg.lineStyle(1, 0xFFD700, 0.35)
    spotBg.strokeRoundedRect(cardX + 16, spotY, cardW - 32, 58, 10)

    this.add.text(cardX + 32, spotY + 10, '🐦  SPECIES SPOTLIGHT', {
      fontSize: '10px', fontFamily: 'Arial Black', color: '#FFD700'
    }).setScrollFactor(0).setDepth(302)

    this.add.text(width / 2, spotY + 34, birdFacts[this.chosenBird] || '', {
      fontSize: '11px', fontFamily: 'Arial', color: '#d8c9a3',
      wordWrap: { width: cardW - 64 }, align: 'center'
    }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(302)

    // ── Button ───────────────────────────────────────────────────
    const btnY = cardY + cardH - 58

    if (escaped) {
      const nextBtn = this.add.text(width / 2, btnY, '  EXPEDITION COMPLETE  ', {
        fontSize: '15px', fontFamily: 'Arial Black',
        color: '#04141c', backgroundColor: '#00d4ff',
        padding: { x: 26, y: 13 }
      }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(303).setInteractive()

      this.tweens.add({
        targets: nextBtn, scaleX: 1.04, scaleY: 1.04,
        duration: 700, yoyo: true, repeat: -1
      })
      nextBtn.on('pointerover', () => {
        nextBtn.setStyle({ backgroundColor: '#33e0ff' })
        this.input.setDefaultCursor('pointer')
      })
      nextBtn.on('pointerout', () => {
        nextBtn.setStyle({ backgroundColor: '#00d4ff' })
        this.input.setDefaultCursor('default')
      })
      nextBtn.on('pointerdown', () => this.scene.start('MenuScene'))
    } else {
      const retryBtn = this.add.text(width / 2, btnY, '  PLAY AGAIN  ', {
        fontSize: '16px', fontFamily: 'Arial Black',
        color: '#ffffff', backgroundColor: '#ff3355',
        padding: { x: 26, y: 13 }
      }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(303).setInteractive()

      this.tweens.add({
        targets: retryBtn, scaleX: 1.04, scaleY: 1.04,
        duration: 700, yoyo: true, repeat: -1
      })
      retryBtn.on('pointerover', () => {
        retryBtn.setStyle({ backgroundColor: '#ff5577' })
        this.input.setDefaultCursor('pointer')
      })
      retryBtn.on('pointerout', () => {
        retryBtn.setStyle({ backgroundColor: '#ff3355' })
        this.input.setDefaultCursor('default')
      })
      retryBtn.on('pointerdown', () => this.scene.start('MenuScene'))
    }
  }

  update() {
  if (this.gameEnding) return

  const speed = this.evolutionStage >= 2 ? 190 : 140
  let vx = 0, vy = 0
  this.isMoving = false

  if (this.terminalOpen) {
    this.player.setVelocity(0, 0)
    this.monsterList.forEach(m => { if (m.alive && m.body && m.body.active) m.body.setVelocity(0, 0) })
    this.portalAngle += 0.035
    this.drawPortal()
    return
  }

  const b = this.chosenBird.toLowerCase()
  if (this.wasd.left.isDown || this.cursors.left.isDown) {
    vx = -speed; this.playerDir = 'left'
    this.player.setTexture(b + '_left'); this.isMoving = true
  } else if (this.wasd.right.isDown || this.cursors.right.isDown) {
    vx = speed; this.playerDir = 'right'
    this.player.setTexture(b + '_right'); this.isMoving = true
  }
  if (this.wasd.up.isDown || this.cursors.up.isDown) {
    vy = -speed; this.playerDir = 'up'
    this.player.setTexture(b + '_back'); this.isMoving = true
  } else if (this.wasd.down.isDown || this.cursors.down.isDown) {
    vy = speed; this.playerDir = 'down'
    this.player.setTexture(b + '_front'); this.isMoving = true
  }

  const nextX = this.player.x + vx * 0.05
  const nextY = this.player.y + vy * 0.05
  const hw = 16
  const curRow = Math.floor(this.player.y / this.TILE)
  const curCol = Math.floor(this.player.x / this.TILE)
  if (vx < 0 && this.isWall(Math.floor((nextX - hw) / this.TILE), curRow)) vx = 0
  if (vx > 0 && this.isWall(Math.floor((nextX + hw) / this.TILE), curRow)) vx = 0
  if (vy < 0 && this.isWall(curCol, Math.floor((nextY - hw) / this.TILE))) vy = 0
  if (vy > 0 && this.isWall(curCol, Math.floor((nextY + hw) / this.TILE))) vy = 0

  this.player.setVelocity(vx, vy)

  if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) this.useWeapon()

  // ── Hunter AI ──────────────────────────────────────────────
  this.monsterList.forEach(m => {
    if (!m.alive || !m.body || !m.body.active) return

    if (m.frozen) {
      this.drawMonster(m, m.body.x, m.body.y, true)
      this.drawHPBar(m.hpBar, m.body.x, m.body.y - 28, m.hp, m.maxHp)
      return
    }

    const mc = Math.floor(m.body.x / this.TILE)
    const mr = Math.floor(m.body.y / this.TILE)
    if (this.isWall(mc, mr)) {
      m.body.setPosition(m.spawnX, m.spawnY)
      m.body.setVelocity(0, 0); m.patrolTimer = 0
      this.drawMonster(m, m.body.x, m.body.y, false)
      this.drawHPBar(m.hpBar, m.body.x, m.body.y - 28, m.hp, m.maxHp)
      return
    }

    const distToPlayer = Phaser.Math.Distance.Between(this.player.x, this.player.y, m.body.x, m.body.y)
    const chaseRange = m.alwaysChase ? 9999 : this.stealthMode ? 0 : this.evolutionStage >= 2 ? 110 : 140

    if (distToPlayer < chaseRange) {
      m.chasing = true
      m.alert.setVisible(true)
      m.alert.setPosition(m.body.x, m.body.y - 42)
      const angle = Phaser.Math.Angle.Between(m.body.x, m.body.y, this.player.x, this.player.y)
      const ms = 55
      const mvx = Math.cos(angle) * ms, mvy = Math.sin(angle) * ms
      const nc = Math.floor((m.body.x + mvx * 0.05) / this.TILE)
      const nr = Math.floor((m.body.y + mvy * 0.05) / this.TILE)
      const finalVx = this.isWall(nc, mr) ? 0 : mvx
      const finalVy = this.isWall(mc, nr) ? 0 : mvy
      m.body.setVelocity(finalVx, finalVy)
      this.animateHunterWalk(m)

      if (Math.abs(finalVx) > Math.abs(finalVy)) {
        if (finalVx !== 0) m.graphic.setTexture(finalVx > 0 ? 'hunter_right' : 'hunter_left')
      } else if (finalVy !== 0) {
        m.graphic.setTexture(finalVy > 0 ? 'hunter_front' : 'hunter_back')
      }
      m.graphic.setDisplaySize(48, 58)

      if (distToPlayer < 36 && !this.playerHitCooldown) {
        this.playerHitCooldown = true
        this.playerHP--
        this.cameras.main.shake(200, 0.008)
        this.player.setTint(0xff0000)
        this.showFloatingText(this.player.x, this.player.y - 30, '💔 -1 Heart', '#ff0000')
        this.time.delayedCall(1500, () => {
          this.player.clearTint()
          if (this.evolutionStage === 2) this.player.setTint(0xaaffff)
          if (this.evolutionStage === 3) this.player.setTint(0xFFD700)
          this.playerHitCooldown = false
        })
        if (this.playerHP <= 0) this.endGame(false)
      }

    } else {
      m.chasing = false
      m.alert.setVisible(false)
      m.patrolTimer = (m.patrolTimer || 0) + 1

      if (m.patrolTimer > 120) {
        m.patrolTimer = 0
        const allDirs = [{ vx: 55, vy: 0, dc: 1, dr: 0 }, { vx: -55, vy: 0, dc: -1, dr: 0 }, { vx: 0, vy: 55, dc: 0, dr: 1 }, { vx: 0, vy: -55, dc: 0, dr: -1 }]
        const safe = allDirs.filter(d => !this.isWall(mc + d.dc, mr + d.dr))
        const dirs = safe.length > 0 ? safe : allDirs
        const d = dirs[Phaser.Math.Between(0, dirs.length - 1)]
        m.body.setVelocity(d.vx, d.vy)
        this.animateHunterWalk(m)
        if (Math.abs(d.vx) > Math.abs(d.vy)) {
          if (d.vx !== 0) m.graphic.setTexture(d.vx > 0 ? 'hunter_right' : 'hunter_left')
        } else if (d.vy !== 0) {
          m.graphic.setTexture(d.vy > 0 ? 'hunter_front' : 'hunter_back')
        }
        m.graphic.setDisplaySize(48, 58)
      }

      for (let i = 0; i < this.eggList.length; i++) {
        const e = this.eggList[i]
        if (!e || e.collected || e.destroyed || !e.graphic) continue

        const dist = Phaser.Math.Distance.Between(m.body.x, m.body.y, e.x, e.y)
        if (dist < 30) {
          e.destroyed = true
          e.collected = true
          this.forestHealth = Math.max(0, (this.forestHealth || 100) - 8)

          for (let p = 0; p < 4; p++) {
            const angle = (p / 4) * Math.PI * 2
            const burst = this.add.graphics()
            burst.fillStyle(0x553300, 1)
            burst.fillCircle(e.x, e.y, 3)
            this.tweens.add({
              targets: burst,
              x: e.x + Math.cos(angle) * 25,
              y: e.y + Math.sin(angle) * 25,
              alpha: 0,
              duration: 400,
              onComplete: () => { if (burst) burst.destroy() }
            })
          }

          this.showFloatingText(e.x, e.y - 20, '💔 Sapling Lost!', '#ff4444')

          if (e.graphic) {
            e.graphic.destroy()
            e.graphic = null
          }
        }
      }
    }

    this.drawMonster(m, m.body.x, m.body.y, false)
    this.drawHPBar(m.hpBar, m.body.x, m.body.y - 28, m.hp, m.maxHp)
  })

  // ── Sapling collection ────────────────────────────────────────
  this.eggList.forEach(e => {
    if (e.collected || !e.graphic) return
    if (Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y) < 34) {
      e.collected = true
      e.graphic.destroy()
      e.graphic = null
      this.eggsCollected++
      this.showSpeciesCard(e.card)
      if (e.type === 'golden') {
        this.goldenEggs++; this.score += 500
        this.checkEvolution()
        this.showFloatingText(this.player.x, this.player.y - 30, '🌟 RARE SAPLING! +500', '#FFD700')
      } else if (e.type === 'fire') {
        this.score += 200
        this.showFloatingText(this.player.x, this.player.y - 30, '🔥 FIRE SAPLING! +200', '#FF4500')
      } else if (e.type === 'thunder') {
        this.score += 300
        this.showFloatingText(this.player.x, this.player.y - 30, '⚡ ANCIENT SAPLING! +300', '#FFD700')
      } else {
        this.score += 100
        this.showFloatingText(this.player.x, this.player.y - 30, '🌱 +100', '#aaffaa')
      }
    }
  })

  // ── Wildlife wander + flee + collection ────────────────────────
  if (this.wildlifeList) {

  this.wildlifeList.forEach(w => {
      // Collection prompt + E key handling
      const playerDistCol = Phaser.Math.Distance.Between(this.player.x, this.player.y, w.x, w.y)
     const canCollect = playerDistCol < 55 && !w.fleeing && !w.collected
     
if (playerDistCol < 100) console.log('dist:', Math.round(playerDistCol), 'fleeing:', w.fleeing, 'collected:', w.collected, 'canCollect:', canCollect)

      if (w.prompt) {
        w.prompt.setVisible(canCollect)
        w.prompt.setPosition(w.x, w.y - (w.type === 'bear' ? 52 : 42))
      }

      if (canCollect && Phaser.Input.Keyboard.JustDown(this.collectKey)) {
        w.collected = true
        this.wildlifeJournal.push(w.species)
        w.graphic.setAlpha(0.4)
        if (w.prompt) w.prompt.setVisible(false)
        this.showWildlifeCard(w.species, w.fact)
      }

    const distToPlayer = Phaser.Math.Distance.Between(this.player.x, this.player.y, w.x, w.y)

let nearestHunterDist = 9999
let nearestHunter = null
this.monsterList.forEach(m => {
  if (!m.alive || !m.body) return
  const d = Phaser.Math.Distance.Between(m.body.x, m.body.y, w.x, w.y)
  if (d < nearestHunterDist) { nearestHunterDist = d; nearestHunter = m }
})

w.fleeing = nearestHunterDist < 90

      if (!w.moving) {
        let dc = 0, dr = 0

       if (w.fleeing) {
  let fromX, fromY
  if (nearestHunter) {
    fromX = nearestHunter.body.x; fromY = nearestHunter.body.y
  }
          if (fromX !== undefined) {
            const angle = Phaser.Math.Angle.Between(fromX, fromY, w.x, w.y)
            dc = Math.round(Math.cos(angle))
            dr = Math.round(Math.sin(angle))
          }
        } else {
          w.wanderTimer = (w.wanderTimer || 0) + 1
          const waitTime = w.fleeing ? 0 : 60
          if (w.wanderTimer >= waitTime) {
            w.wanderTimer = 0
            const dirs = [{ dc: 1, dr: 0 }, { dc: -1, dr: 0 }, { dc: 0, dr: 1 }, { dc: 0, dr: -1 }, { dc: 0, dr: 0 }]
            const d = dirs[Phaser.Math.Between(0, dirs.length - 1)]
            dc = d.dc; dr = d.dr
          }
        }

        if (dc !== 0 || dr !== 0) {
          const curCol = Math.round((w.x - this.TILE / 2) / this.TILE)
          const curRow = Math.round((w.y - this.TILE / 2) / this.TILE)
          const targetCol = curCol + dc
          const targetRow = curRow + dr

          if (!this.isWall(targetCol, targetRow)) {
            w.targetX = targetCol * this.TILE + this.TILE / 2
            w.targetY = targetRow * this.TILE + this.TILE / 2
            w.moving = true

            if (Math.abs(dc) > Math.abs(dr)) {
              w.dir = dc > 0 ? 'right' : 'left'
            } else if (dr !== 0) {
              w.dir = dr > 0 ? 'front' : 'back'
            }
            w.graphic.setTexture(w.type + '_' + w.dir)
            w.graphic.setDisplaySize(w.size.w, w.size.h)
          }
        }
      }

      if (w.moving) {
        const speed = w.type === 'bear'
          ? (w.fleeing ? 2.2 : 0.8)
          : (w.fleeing ? 3.2 : 1.4)
        const dx = w.targetX - w.x
        const dy = w.targetY - w.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < speed) {
          w.x = w.targetX
          w.y = w.targetY
          w.moving = false
        } else {
          w.x += (dx / dist) * speed
          w.y += (dy / dist) * speed
        }
      }

      w.graphic.setPosition(w.x, w.y)
      w.shadow.setPosition(w.x, w.y + (w.type === 'bear' ? 28 : 22))
    })
  }

  // ── Weapon pickup ─────────────────────────────────────────────
  this.weaponList.forEach(w => {
    if (w.collected) return
    if (Phaser.Math.Distance.Between(this.player.x, this.player.y, w.x, w.y) < 32) {
      w.collected = true
      w.bg.destroy(); w.label.destroy(); w.desc.destroy()
      this.currentWeapon = w.type
      const labels = { bomb: '💣 BOMB!', ice: '❄️ ICE!', lightning: '⚡ LIGHTNING!', boomerang: '🪃 BOOMERANG!' }
      this.showFloatingText(this.player.x, this.player.y - 30, labels[w.type], '#ffffff')
    }
  })

  // ── Portal check ────────────────────────────────────────────
  const px = this.portalCol * this.TILE + this.TILE / 2
  const py = this.portalRow * this.TILE + this.TILE / 2
  if (Phaser.Math.Distance.Between(this.player.x, this.player.y, px, py) < 38) this.endGame(true)
  if (this.timeLeft < 0) this.endGame(false)

  this.portalAngle += 0.035
  this.drawPortal()

  this.bobTimer += 1
  if (this.isMoving) {
    this.player.setDisplaySize(this.bobTimer > 8 ? (this.TILE + 8) + 5 : (this.TILE + 8) - 2, this.bobTimer > 8 ? (this.TILE + 8) - 5 : (this.TILE + 8) + 5)
    if (this.bobTimer > 15) this.bobTimer = 0
  } else {
    this.player.setDisplaySize(this.TILE + 8, this.TILE + 8)
  }
}
}
