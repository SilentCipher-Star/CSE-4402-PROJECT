import Phaser from 'phaser'
import { Terminal } from '../ui/Terminal.js'

export class GameScene2 extends Phaser.Scene {
  constructor() { super('GameScene2') }

  preload() {
    this.load.image('snow_ground', 'resource/tiles/0_snow_ground.png')
    this.load.image('dark_snow', 'resource/tiles/1_dark_snow.png')
    this.load.image('ice', 'resource/tiles/2_ice.png')
    this.load.image('frozen_water', 'resource/tiles/3_frozen_water.png')
    this.load.image('snow_cliff', 'resource/tiles/4_snow_cliff.png')
    this.load.image('snow_rock', 'resource/tiles/5_snowy_rock.png')
    this.load.image('ice_wall', 'resource/tiles/6_ice_wall.png')
    this.load.image('snow_bank', 'resource/tiles/7_snow_bank.png')
    this.load.image('frozen_log', 'resource/tiles/8_frozen_log.png')
    this.load.image('pine_large', 'resource/tiles/10_pine_tree_large.png')
    this.load.image('pine_small', 'resource/tiles/11_pine_tree_small.png')
    this.load.image('dead_tree', 'resource/tiles/12_dead_tree.png')
    this.load.image('snow_stump', 'resource/tiles/13_stump.png')
    this.load.image('icicle', 'resource/tiles/14_icicle.png')
    this.load.image('snow_pile', 'resource/tiles/15_snow_pile.png')
    this.load.image('card_arctic_willow', 'resource/flashcards/card_arctic_willow.png')
    this.load.image('card_himalayan_yew', 'resource/flashcards/card_himalayan_yew.png')
    this.load.image('card_ice_grass', 'resource/flashcards/card_ice_grass.png')
    this.load.image('card_polar_bellflower', 'resource/flashcards/card_polar_bellflower.png')
    this.load.image('card_snow_lotus', 'resource/flashcards/card_snow_lotus.png')
    this.load.image('sapling_arctic_willow', 'resource/saplings2/arctic_willow.png')
    this.load.image('sapling_himalayan_yew', 'resource/saplings2/himalayan_yew.png')
    this.load.image('sapling_ice_grass', 'resource/saplings2/ice_grass.png')
    this.load.image('sapling_polar_bellflower', 'resource/saplings2/polar_bellflower.png')
    this.load.image('sapling_snow_lotus', 'resource/saplings2/snow_lotus.png')
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
    this.load.image('lightning_strike', 'resource/effects/lightning_strike.png')
  }

  init(data) {
    this.playerName = data.playerName || 'Adventurer'
    this.chosenBird = data.chosenBird || 'Ember'
    this.score = data.score || 0
    this.eggsCollected = 0
    this.collectedFlashCards = []
    this.evolutionStage = data.evolutionStage || 1
    this.goldenEggs = 0
    this.isAttacking = false
    this.playerDir = 'right'
    this.timeLeft = 200
    this.bobTimer = 0
    this.isMoving = false
    const birdPowerMap = {
      Ember: 'fire',
      Frost: 'ice',
      Volt: 'lightning',
      Shade: 'bomb',
      Gale: 'boomerang'
    }
    this.currentWeapon = birdPowerMap[this.chosenBird] || 'fire'
    this.basePower = this.currentWeapon
    this.playerHitCooldown = false
    this.playerHP = data.playerHP || 5
    this.maxHP = data.maxHP || 5
    this.terminalOpen = false
    this.stealthMode = false
    this.gameEnding = false
    this.forestHealth = 100
    this.totalSaplings = 14
    this.wildlifeJournal = data.wildlifeJournal || []

    // 🛡️ Shield system
    this.shieldActive = false
    this.shieldTimeRemaining = 0
    this.shieldTimerEvent = null
    this.playerShieldGfx = null
    this.shieldList = []
    this.weaponList = []

    // 🐾 Animal notification freeze
    this.animalNotificationFrozen = false
    this.cardFreezeTimestamp = 0
    this.activeWildlifeCard = null

    // ❄️ Warmth system
    this.warmth = 100
    this.maxWarmth = 100
    this.lastFrostbiteTick = 0
    this.isSheltered = false
    this.nearCampfire = false
    this.OPEN_DECAY_PER_SEC = 2.0
    this.SHELTER_DECAY_PER_SEC = 0.7
    this.CAMPFIRE_REGEN_PER_SEC = 9
    this.BLIZZARD_DECAY_MULT = 2.5

    // 🌨️ Blizzard system
    this.blizzardActive = false
    this.blizzardWarningActive = false
    this.blizzardFlakes = []
    this.blizzardOverlay = null

    // 👣 Footprints
    this.footprints = []
    this.playerLastFootX = null
    this.playerLastFootY = null
    this.isRescuing = false
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
    this.shieldList = []
    this.spawnShields()
    this.spawnWildlife()

    this.campfireList = []
    this.spawnCampfires()
    this.spawnAlarmTraps()
    this.spawnHunterCamps()
    this.createWarmthHUD()
    this.scheduleNextBlizzard()

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
    this.playerBaseSize = (this.chosenBird === 'Ember') ? 50 : 52
    this.player.setDisplaySize(this.playerBaseSize, this.playerBaseSize)
    this.player.setCollideWorldBounds(true)
    this.player.body.setSize(26, 26)
    this.player.setDepth(20)

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
      callback: () => { if (!this.animalNotificationFrozen && this.timeLeft > 0) this.timeLeft-- },
      repeat: 199
    })

    this.scene.launch('UIScene', { gameScene: this })

    this.terminal = new Terminal(this)
    this.input.keyboard.on('keydown-TILDE', () => this.terminal.toggle())
    this.input.keyboard.on('keydown-BACKTICK', () => this.terminal.toggle())
    this.events.once('shutdown', () => {
      if (this.terminal) {
        this.terminal.destroy()
        this.terminal = null
      }
    })
  }

  parseMap() {
    const rows = 50
    const cols = 50
    const map = []

    for (let r = 0; r < rows; r++) {
      const row = []
      for (let c = 0; c < cols; c++) row.push(5)
      map.push(row)
    }

    // seeded random so the layout is stable across reloads
    let seed = 928371
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296
      return seed / 4294967296
    }

    // Paints one themed blob (forest / cliff / water / pile-patch)
    // at the given fill density, so each theme reads as ONE coherent
    // region instead of everything being mixed and scattered across
    // the whole map.
    //   value      = tile type to paint (1 forest, 2 cliff, 3 water, 6 pile)
    //   fillChance = how solid the blob is (1 = packed solid, lower = looser/sparser)
    const paintBlob = (cx, cy, r, value, fillChance) => {
      for (let y = cy - r; y <= cy + r; y++) {
        for (let x = cx - r; x <= cx + r; x++) {
          if (x < 1 || x >= cols - 1 || y < 1 || y >= rows - 1) continue
          const dx = x - cx
          const dy = y - cy
          const dist = Math.sqrt(dx * dx + dy * dy)
          // uneven edge (not a perfect circle) so it reads as a natural blob
          const edge = r * (0.55 + rand() * 0.5)
          if (dist <= edge && rand() < fillChance) {
            map[y][x] = value
          }
        }
      }
    }

    // ── ONE solid forest region down the left side ────────────────
    paintBlob(9, 11, 8, 1, 0.88)
    paintBlob(7, 31, 7, 1, 0.85)

    // ── just a handful of standalone trees near the centre ────────
    paintBlob(25, 23, 4, 1, 0.3)

    // ── ONE solid cliff/rock region down the right side ───────────
    paintBlob(41, 12, 7, 2, 0.88)
    paintBlob(42, 31, 6, 2, 0.85)

    // ── frozen water — a single confined lake, not scattered ──────
    paintBlob(43, 42, 4, 3, 0.75)

    // ── snow piles clustered together in their own patch ──────────
    paintBlob(16, 40, 5, 6, 0.55)

    const clearCircle = (cx, cy, r) => {
      for (let y = cy - r; y <= cy + r; y++) {
        for (let x = cx - r; x <= cx + r; x++) {
          if (x < 0 || x >= cols || y < 0 || y >= rows) continue
          const dx = x - cx
          const dy = y - cy
          if (dx * dx + dy * dy <= r * r) map[y][x] = 5
        }
      }
    }

    // wide (3-tile) winding clearings between the regions, so open
    // ground reads as continuous space rather than a single-tile trail
    const carveLine = (x1, y1, x2, y2, width) => {
      const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) * 3
      for (let i = 0; i <= steps; i++) {
        const t = steps === 0 ? 0 : i / steps
        const x = Math.round(Phaser.Math.Linear(x1, x2, t))
        const y = Math.round(Phaser.Math.Linear(y1, y2, t))
        clearCircle(x, y, width)
      }
    }

    clearCircle(2, 2, 4)
    carveLine(2, 2, 46, 5, 3)
    carveLine(2, 15, 46, 17, 3)
    carveLine(2, 24, 46, 24, 3)
    carveLine(2, 34, 46, 35, 3)
    carveLine(2, 43, 46, 44, 3)
    carveLine(6, 6, 6, 42, 3)
    carveLine(27, 6, 27, 43, 3)
    carveLine(46, 5, 46, 41, 3)

    // every gameplay spawn point must stay walkable no matter how the
    // regions above landed
    const importantSpots = [
      [1, 1],
      [3, 1], [11, 1], [20, 3], [4, 8], [13, 8], [17, 10], [32, 10], [3, 13], [24, 15], [20, 20], [6, 22], [3, 24], [45, 25], [45, 35],
      [5, 1], [20, 1], [5, 5], [20, 5], [5, 8], [34, 8], [5, 10], [20, 10],
      [5, 3], [16, 5], [24, 7], [16, 10], [11, 13], [14, 17], [7, 21], [4, 25], [40, 30],
      [11, 3], [24, 8], [32, 18], [13, 27],
      [45, 43],

      // shield pickups
      [12, 8], [30, 15], [22, 32], [38, 28],

      // extra hunter spawns (more all over the map)
      [30, 3], [44, 6], [9, 17], [27, 17], [38, 20],
      [44, 24], [6, 35], [27, 35], [38, 38], [20, 43],

      // extra wildlife spawns (more all over the map)
      [30, 5], [44, 8], [9, 15], [27, 20], [38, 17],
      [15, 22], [6, 38], [38, 35],

      // campfires (warmth system)
      [8, 4], [24, 24], [40, 40], [16, 30],

      // alarm traps
      [12, 5], [33, 13], [20, 33], [42, 20],

      // hunter camps
      [19, 6], [44, 14], [6, 44], [33, 44]
    ]

    importantSpots.forEach(([c, r]) => clearCircle(c, r, 2))

    // ── Obstacle formations: frozen logs (4), icicles (7), dead trees (8) ──
    const isImportant = (c, r) => {
      return importantSpots.some(([ic, ir]) => Math.abs(ic - c) <= 1 && Math.abs(ir - r) <= 1)
    }
    const placeObstacle = (c, r, tileType) => {
      if (c >= 1 && c < cols - 1 && r >= 1 && r < rows - 1 && !isImportant(c, r)) {
        map[r][c] = tileType
      }
    }

    // Fallen frozen log barriers (4)
    const logFormations = [
      // Original logs
      [14, 12], [15, 12], [16, 12],
      [28, 28], [29, 28], [30, 28],
      [10, 36], [11, 36],
      [35, 12], [36, 12],
      [18, 16], [19, 16],
      [8, 26], [8, 27],
      [23, 10], [24, 10],
      [39, 22], [40, 22],
      [15, 34], [16, 34],
      [31, 40], [32, 40],
      [4, 17], [4, 18],
      [42, 34], [43, 34],
      [21, 14], [22, 14],
      [13, 31], [14, 31],

      // Additional stealth barriers & chicanes
      [7, 3], [8, 3], [14, 3], [15, 3], [22, 2], [23, 2], [33, 2], [34, 2], [41, 4], [42, 4],
      [5, 12], [6, 12], [26, 8], [27, 8], [39, 10], [40, 10],
      [17, 21], [18, 21], [23, 21], [24, 21], [29, 21], [30, 21], [35, 23], [36, 23],
      [9, 28], [10, 28], [17, 27], [18, 27], [22, 26], [23, 26], [36, 27], [37, 27],
      [7, 37], [8, 37], [13, 38], [14, 38], [24, 37], [25, 37], [34, 34], [35, 34], [40, 36], [41, 36],
      [18, 45], [19, 45], [26, 45], [27, 45], [38, 43], [39, 43]
    ]
    logFormations.forEach(([c, r]) => placeObstacle(c, r, 4))

    // Sharp icicle clusters (7)
    const icicleFormations = [
      // Original icicles
      [22, 12], [23, 12],
      [38, 8], [39, 8],
      [18, 26], [19, 26],
      [32, 38], [33, 38],
      [12, 22], [13, 22],
      [36, 16], [37, 16],
      [25, 30], [25, 31],
      [17, 38], [18, 38],
      [41, 26], [42, 26],
      [7, 10], [7, 11],
      [29, 12], [30, 12],
      [11, 44], [12, 44],
      [34, 4], [35, 4],
      [3, 30], [4, 30],

      // Additional crystalline barriers & vision blockers
      [17, 4], [18, 4], [27, 4], [28, 4], [36, 6], [37, 6],
      [12, 14], [12, 15], [20, 12], [21, 12], [31, 14], [32, 14], [41, 16], [42, 16],
      [11, 24], [11, 25], [16, 24], [17, 24], [25, 24], [26, 24], [32, 24], [33, 24], [41, 24], [42, 24],
      [8, 33], [8, 34], [14, 33], [15, 33], [23, 31], [24, 31], [30, 31], [31, 31], [42, 30], [43, 30],
      [9, 41], [10, 41], [17, 42], [18, 42], [22, 40], [23, 40], [28, 43], [29, 43], [36, 42], [37, 42]
    ]
    icicleFormations.forEach(([c, r]) => placeObstacle(c, r, 7))

    // Dead tree clusters (8)
    const deadTreeFormations = [
      // Original dead trees
      [8, 20], [9, 20],
      [26, 18], [27, 18],
      [14, 42], [15, 42],
      [36, 32], [37, 32],
      [21, 35], [22, 35],
      [10, 8], [10, 9],
      [33, 24], [34, 24],
      [19, 30], [20, 30],
      [43, 18], [44, 18],
      [5, 31], [5, 32],
      [17, 14], [17, 15],
      [28, 41], [29, 41],

      // Additional withered tree hideouts
      [3, 7], [3, 8], [13, 6], [14, 6], [22, 6], [23, 6], [32, 7], [33, 7], [40, 7], [41, 7],
      [6, 16], [7, 16], [15, 18], [16, 18], [24, 17], [25, 17], [34, 18], [35, 18], [43, 16], [44, 16],
      [4, 27], [5, 27], [12, 29], [13, 29], [21, 28], [22, 28], [29, 27], [30, 27], [38, 26], [39, 26],
      [3, 39], [4, 39], [11, 39], [12, 39], [21, 37], [22, 37], [33, 37], [34, 37], [43, 38], [44, 38],
      [7, 46], [8, 46], [15, 46], [16, 46], [24, 46], [25, 46], [34, 46], [35, 46], [42, 45], [43, 45]
    ]
    deadTreeFormations.forEach(([c, r]) => placeObstacle(c, r, 8))

    // Clustered snow pile & snow bank mounds (6)
    const snowPileFormations = [
      [10, 18], [11, 18], [28, 11], [28, 12], [39, 14], [40, 14],
      [7, 24], [8, 24], [19, 23], [20, 23], [37, 21], [38, 21],
      [14, 36], [14, 37], [26, 33], [27, 33], [35, 30], [36, 30],
      [12, 42], [13, 42], [25, 44], [26, 44], [39, 41], [40, 41]
    ]
    snowPileFormations.forEach(([c, r]) => placeObstacle(c, r, 6))

    // Pine tree dividers (1)
    const pineDividers = [
      [6, 9], [18, 8], [25, 4], [31, 8], [37, 10],
      [8, 14], [23, 15], [30, 16], [39, 18],
      [5, 23], [15, 25], [22, 22], [28, 23], [36, 25],
      [7, 32], [16, 32], [24, 33], [32, 33], [41, 32],
      [5, 42], [16, 43], [23, 44], [31, 44], [37, 44]
    ]
    pineDividers.forEach(([c, r]) => placeObstacle(c, r, 1))

    // frozen boundary wall around the whole map
    for (let c = 0; c < cols; c++) { map[0][c] = 2; map[rows - 1][c] = 2 }
    for (let r = 0; r < rows; r++) { map[r][0] = 2; map[r][cols - 1] = 2 }

    return map
  }

  showWildlifeCard(species, fact) {
    if (this.activeWildlifeCard) {
      this.activeWildlifeCard.forEach(el => {
        if (el && el.destroy) el.destroy()
      })
      this.activeWildlifeCard = null
    }

    // Freeze the screen
    this.animalNotificationFrozen = true
    this.cardFreezeTimestamp = (this.time && this.time.now) ? this.time.now : Date.now()
    this.player.setVelocity(0, 0)
    this.monsterList.forEach(m => {
      if (m.body && m.body.active) m.body.setVelocity(0, 0)
      m.chasing = false
    })

    const { width, height } = this.scale

    const card = this.add.graphics().setScrollFactor(0).setDepth(400)
    card.fillStyle(0x0a1420, 0.97)
    card.fillRoundedRect(width / 2 - 180, height / 2 - 95, 360, 190, 16)
    card.lineStyle(3, 0xFFD700, 1)
    card.strokeRoundedRect(width / 2 - 180, height / 2 - 95, 360, 190, 16)

    const title = this.add.text(width / 2, height / 2 - 68, '🐾 SPECIES RESCUED!', {
      fontSize: '15px', fontFamily: 'Arial Black', color: '#FFD700'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(401)

    const name = this.add.text(width / 2, height / 2 - 38, species, {
      fontSize: '20px', fontFamily: 'Arial Black', color: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(401)

    const factText = this.add.text(width / 2, height / 2 + 2, fact, {
      fontSize: '11px', fontFamily: 'Arial', color: '#aaccdd',
      wordWrap: { width: 320 }, align: 'center'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(401)

    const count = this.wildlifeJournal ? this.wildlifeJournal.length : 1
    const total = this.wildlifeList ? this.wildlifeList.length : 8
    const counter = this.add.text(width / 2, height / 2 + 45, `Journal: ${count} / ${total} species`, {
      fontSize: '11px', fontFamily: 'Arial Black', color: '#00d4ff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(401)

    const resumeHint = this.add.text(width / 2, height / 2 + 72, '👉 Move in any direction (W,A,S,D / Arrows) to resume', {
      fontSize: '10px', fontFamily: 'Arial Black', color: '#ffdd77'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(401)

    const elements = [card, title, name, factText, counter, resumeHint]
    this.activeWildlifeCard = elements
    elements.forEach(el => { el.setAlpha(1) })
  }

  dismissWildlifeCard() {
    if (!this.animalNotificationFrozen && !this.activeWildlifeCard) return
    this.animalNotificationFrozen = false
    if (this.activeWildlifeCard) {
      this.activeWildlifeCard.forEach(el => {
        if (el && el.destroy) el.destroy()
      })
      this.activeWildlifeCard = null
    }
  }

  drawWorld() {
    const rows = this.mapRows
    const cols = this.mapCols

    // Linear texture filtering can smear a tile's edge pixels into
    // its neighbour, showing up as a thin seam line along every grid
    // edge. Forcing nearest-neighbour filtering on these tile
    // textures keeps every edge crisp and fully opaque right up to
    // the border.
    const tileKeys = [
      'snow_ground', 'dark_snow', 'ice', 'frozen_water', 'snow_cliff',
      'snow_rock', 'ice_wall', 'snow_bank', 'frozen_log',
      'pine_large', 'pine_small', 'dead_tree', 'snow_stump', 'icicle', 'snow_pile'
    ]
    tileKeys.forEach(key => {
      const tex = this.textures.get(key)
      if (tex) tex.setFilter(Phaser.Textures.FilterMode.NEAREST)
    })

    // seeded so tile variety is stable across reloads
    let seed = 55211
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296
      return seed / 4294967296
    }

    // Every PNG in this set is a fully opaque, self-contained tile —
    // background snow and the object (tree/rock/log/etc.) are baked
    // into the same square, with no transparency at all. That means
    // exactly ONE image belongs on each grid cell — never a ground
    // tile with a second image layered on top, since two opaque
    // images of slightly different sizes stacked on the same cell is
    // what caused the misaligned/overlapping look.
    //
    // A few tiles (the trees and the log) render a little taller
    // than one cell so their canopy can rise upward for a natural
    // look, anchored at the bottom of their OWN cell only — never
    // shifted sideways — so they never bleed into a neighbouring
    // column.
    const risesAbove = new Set(['pine_large', 'pine_small', 'ice_wall'])

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const t = this.mapData[row][col]
        const isEdge =
          row === 0 || row === rows - 1 ||
          col === 0 || col === cols - 1

        let key

        if (isEdge) {
          key = 'snow_cliff'
        } else if (t === 1) {
          // forest region
          const roll = rand()
          key = roll < 0.45 ? 'pine_large' : roll < 0.75 ? 'pine_small' : 'dead_tree'
        } else if (t === 2) {
          // cliff/rock region
          key = 'ice_wall'
        } else if (t === 3) {
          // the one confined frozen-water lake
          key = 'frozen_water'
        } else if (t === 4) {
          // frozen log obstacle
          key = 'frozen_log'
        } else if (t === 6) {
          // the clustered snow-pile patch
          key = rand() < 0.8 ? 'snow_pile' : 'snow_bank'
        } else if (t === 7) {
          // icicle obstacle
          key = 'icicle'
        } else if (t === 8) {
          // dead tree obstacle
          key = 'dead_tree'
        } else {
          // plain open ground — walkable snow floor variation only
          const roll = rand()
          key = roll < 0.80 ? 'snow_ground' : 'dark_snow'
        }

        const cellCenterX = col * this.TILE + this.TILE / 2
        const cellCenterY = row * this.TILE + this.TILE / 2
        const cellBottomY = row * this.TILE + this.TILE

        // Even at an exact TILE x TILE size, sub-pixel rounding and
        // texture-edge filtering can leave a hairline gap between two
        // "perfectly" adjacent tiles. Rounding positions to whole
        // pixels and overscanning each flat tile by ~2px (so
        // neighbours overlap a hair instead of just touching) hides
        // that seam completely.
        const bleed = 2

        const img = this.add.image(0, 0, key)

        if (risesAbove.has(key)) {
          // anchored to the bottom edge of THIS cell only — grows
          // upward, stays centred on its own column
          img.setOrigin(0.5, 1)
          img.setPosition(Math.round(cellCenterX), Math.round(cellBottomY))
          img.setDisplaySize(this.TILE + bleed, this.TILE * 1.35)
        } else {
          // fills its own cell exactly, edge to edge, with a slight
          // overscan so there's no visible seam
          img.setOrigin(0.5, 0.5)
          img.setPosition(Math.round(cellCenterX), Math.round(cellCenterY))
          img.setDisplaySize(this.TILE + bleed, this.TILE + bleed)
        }
      }
    }

    // ============================================================
    // Gentle ambient snow sparkle for atmosphere (purely cosmetic,
    // drawn last so it sits on top of everything).
    // ============================================================
    for (let i = 0; i < 150; i++) {
      const x = Phaser.Math.Between(20, this.worldW - 20)
      const y = Phaser.Math.Between(20, this.worldH - 20)
      const sparkle = this.add.circle(
        x, y,
        Phaser.Math.Between(1, 2),
        0xffffff,
        Phaser.Math.FloatBetween(0.25, 0.6)
      )
      sparkle.setDepth(0)
    }
  }

  isWall(col, row) {
    if (row < 0 || row >= this.mapRows || col < 0 || col >= this.mapCols) return true
    if (!this.mapData || !this.mapData[row]) return true
    const t = this.mapData[row][col]
    return t === 1 || t === 2 || t === 4 || t === 6 || t === 7 || t === 8
  }

  hasLineOfSight(x1, y1, x2, y2) {
    const dist = Phaser.Math.Distance.Between(x1, y1, x2, y2)
    const steps = Math.max(2, Math.ceil(dist / 20))
    for (let i = 1; i < steps; i++) {
      const tx = Phaser.Math.Linear(x1, x2, i / steps)
      const ty = Phaser.Math.Linear(y1, y2, i / steps)
      const col = Math.floor(tx / this.TILE)
      const row = Math.floor(ty / this.TILE)
      if (this.isWall(col, row)) return false
    }
    return true
  }

  spawnEggs() {
    // Every sapling is tied to one of the 5 real flashcards.
    // Duplicate species are allowed, but the flashcard is only unlocked once.
    const positions = [
      { col: 3,  row: 1,  type: 'normal',  card: 'card_arctic_willow',    sprite: 'sapling_arctic_willow' },
      { col: 11, row: 1,  type: 'fire',    card: 'card_himalayan_yew',    sprite: 'sapling_himalayan_yew' },
      { col: 20, row: 3,  type: 'normal',  card: 'card_ice_grass',        sprite: 'sapling_ice_grass' },
      { col: 4,  row: 8,  type: 'thunder', card: 'card_polar_bellflower', sprite: 'sapling_polar_bellflower' },
      { col: 13, row: 8,  type: 'normal',  card: 'card_snow_lotus',       sprite: 'sapling_snow_lotus' },
      { col: 17, row: 10, type: 'fire',    card: 'card_arctic_willow',    sprite: 'sapling_arctic_willow' },
      { col: 32, row: 10, type: 'normal',  card: 'card_himalayan_yew',    sprite: 'sapling_himalayan_yew' },
      { col: 3,  row: 13, type: 'thunder', card: 'card_ice_grass',        sprite: 'sapling_ice_grass' },
      { col: 24, row: 15, type: 'normal',  card: 'card_polar_bellflower', sprite: 'sapling_polar_bellflower' },
      { col: 20, row: 20, type: 'fire',    card: 'card_snow_lotus',       sprite: 'sapling_snow_lotus' },
      { col: 6,  row: 22, type: 'thunder', card: 'card_arctic_willow',    sprite: 'sapling_arctic_willow' },
      { col: 3,  row: 24, type: 'normal',  card: 'card_himalayan_yew',    sprite: 'sapling_himalayan_yew' },
      { col: 45, row: 25, type: 'golden',  card: 'card_ice_grass',        sprite: 'sapling_ice_grass' },
      { col: 45, row: 35, type: 'golden',  card: 'card_polar_bellflower', sprite: 'sapling_polar_bellflower' },
    ]

    positions.forEach(e => {
      const x = e.col * this.TILE + this.TILE / 2
      const y = e.row * this.TILE + this.TILE / 2
      if (this.isWall(e.col, e.row)) return

      let glow = null

      const sapling = this.add.image(x, y, e.sprite)
        .setOrigin(0.5)
        .setDisplaySize(this.TILE * 0.75, this.TILE * 0.75)
        .setDepth(7)

      if (e.type === 'golden') {
        sapling.setTint(0xFFD700)
      }

      if (e.type !== 'normal') {
        const glowColor =
          e.type === 'fire' ? 0xFF4500 :
          e.type === 'thunder' ? 0x00BFFF :
          0xFFD700

        glow = this.add.circle(x, y, 18, glowColor, 0.2).setDepth(6)

        this.tweens.add({
          targets: glow,
          scaleX: 2,
          scaleY: 2,
          alpha: 0,
          duration: 1000,
          repeat: -1,
          yoyo: true
        })
      }

      this.tweens.add({
        targets: sapling,
        y: y - 4,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })

      this.eggList.push({
        graphic: sapling,
        glow,
        x,
        y,
        type: e.type,
        card: e.card,
        sprite: e.sprite,
        collected: false
      })
    })

    this.totalSaplings = this.eggList.length
  }
  spawnWildlife() {
const positions = [
  { col: 5,  row: 1,  species: 'Emperor Penguin',    fact: 'Can dive deeper than any other bird — over 500 meters.',        type: 'penguin' },
  { col: 20, row: 1,  species: 'Adelie Penguin',     fact: 'Travels up to 8,000 km per year hunting for food.',             type: 'penguin' },
  { col: 5,  row: 5,  species: 'King Penguin',       fact: 'Takes over a year to raise a single chick.',                    type: 'penguin' },
  { col: 20, row: 5,  species: 'Chinstrap Penguin',  fact: 'Named for the thin black line under its chin.',                 type: 'penguin' },
  { col: 5,  row: 8,  species: 'Gentoo Penguin',     fact: 'The fastest swimming penguin species alive.',                   type: 'penguin' },
  { col: 34, row: 8,  species: 'Rockhopper Penguin', fact: 'Known for hopping between rocks instead of waddling.',          type: 'penguin', trapped: 'snare' },
  { col: 5,  row: 10, species: 'Polar Bear',         fact: 'Sea ice loss is shrinking their hunting grounds every year.',   type: 'bear' },
  { col: 20, row: 10, species: 'Polar Bear Cub',     fact: 'Cubs stay with their mother for over two years.',               type: 'bear' },

  // extra wildlife, spread further across the map
  { col: 30, row: 5,  species: 'Macaroni Penguin',   fact: 'Recognized instantly by its spiky yellow head feathers.',       type: 'penguin' },
  { col: 44, row: 8,  species: 'Chinstrap Colony',   fact: 'Chinstrap penguins can form colonies of over a million birds.', type: 'penguin' },
  { col: 9,  row: 15, species: 'Polar Bear',         fact: 'An adult male can weigh over 450 kilograms.',                   type: 'bear', trapped: 'snare' },
  { col: 27, row: 20, species: 'Gentoo Penguin',     fact: 'Builds nests from pebbles it carefully collects one by one.',   type: 'penguin' },
  { col: 38, row: 17, species: 'Emperor Penguin',    fact: 'Huddles in groups of thousands to survive -60°C winds.',        type: 'penguin', trapped: 'cage' },
  { col: 15, row: 22, species: 'Polar Bear Cub',     fact: 'Born blind and weighing under half a kilogram.',                type: 'bear' },
  { col: 6,  row: 38, species: 'King Penguin',       fact: 'The second-largest penguin species after the Emperor.',         type: 'penguin', trapped: 'snare' },
  { col: 38, row: 35, species: 'Polar Bear',         fact: 'Can smell a seal through nearly a meter of ice.',               type: 'bear', trapped: 'cage' },
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

      const shelter = this.findNearestShelterTile(p.col, p.row)

      // 🪤 Trap rescue UI (only created for animals that start trapped)
      let trapIcon = null, alertIcon = null, dangerText = null, promptRescue = null, rescueBar = null
      if (p.trapped) {
        trapIcon = this.add.text(x, y + (p.type === 'bear' ? 30 : 22), '🪤', { fontSize: '16px' })
          .setOrigin(0.5).setDepth(9).setVisible(false)

        alertIcon = this.add.text(x, y - (p.type === 'bear' ? 80 : 68), '❗', { fontSize: '15px' })
          .setOrigin(0.5).setDepth(11).setVisible(false)

        dangerText = this.add.text(x, y - (p.type === 'bear' ? 66 : 56), '', {
          fontSize: '11px', fontFamily: 'Arial Black',
          color: '#ff5555', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(11).setVisible(false)

        promptRescue = this.add.text(x, y - (p.type === 'bear' ? 52 : 42), 'Hold E to rescue', {
          fontSize: '9px', fontFamily: 'Arial Black',
          color: '#66ff99', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(11).setVisible(false)

        rescueBar = this.add.graphics().setDepth(11)

        // 👣 A short trail of animal tracks leading toward the trap,
        // so the player can discover it by following prints instead
        // of just walking into the discovery radius blind.
        var trapTrail = this.buildAnimalTrail(p.col, p.row, p.type)

        // 🧑‍🌾 Cage traps are guarded by a hunter stationed right next to them
        if (p.trapped === 'cage') {
          const offsets = [[1, 0], [-1, 0], [0, 1], [0, -1]]
          const spot = offsets
            .map(([dc, dr]) => ({ col: p.col + dc, row: p.row + dr }))
            .find(({ col, row }) => !this.isWall(col, row))
          if (spot) {
            this.createHunterAt(spot.col * this.TILE + this.TILE / 2, spot.row * this.TILE + this.TILE / 2)
          }
        }
      }

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
        shelterCol: shelter ? shelter.col : null,
        shelterRow: shelter ? shelter.row : null,
        collected: this.wildlifeJournal.includes(p.species),

        // 🪤 Trap / rescue state
        trapped: !!p.trapped,
        trapType: p.trapped || null,
        discovered: false,
        dangerTimer: 0,
        assignedHunter: null,
        rescueProgress: 0,
        rescued: false,
        escorting: false,
        lost: false,
        done: false,
        shelterTarget: null,
        trapIcon, alertIcon, dangerText, promptRescue, rescueBar,
        trailSprites: trapTrail || []
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

      // extra hunters, spread further across the map
      { col: 30, row: 3 },
      { col: 44, row: 6 },
      { col: 9, row: 17 },
      { col: 27, row: 17 },
      { col: 38, row: 20 },
      { col: 44, row: 24 },
      { col: 6, row: 35 },
      { col: 27, row: 35 },
      { col: 38, row: 38 },
      { col: 20, row: 43 },
    ]

    positions.forEach(m => {
      if (this.isWall(m.col, m.row)) return
      const x = m.col * this.TILE + this.TILE / 2
      const y = m.row * this.TILE + this.TILE / 2
      this.createHunterAt(x, y)
    })
  }

  createHunterAt(x, y) {
    // Sprite instead of drawn graphic
    const sprite = this.add.sprite(x, y, 'hunter_front')
    sprite.setDisplaySize(58, 74)
    sprite.setOrigin(0.5, 0.6)
    sprite.setDepth(10)

    // Shadow beneath hunter
    const shadow = this.add.ellipse(x, y + 28, 36, 12, 0x000000, 0.35)
    shadow.setDepth(9)

    const body = this.physics.add.image(x, y, null).setVisible(false)
    body.body.setSize(30, 32)
    body.setCollideWorldBounds(true)
    body.setVelocity(60, 0)

    const hpBar = this.add.graphics()
    this.drawHPBar(hpBar, x, y - 48, 2, 2)

    const alert = this.add.text(x, y - 60, '❗', { fontSize: '16px' })
      .setOrigin(0.5).setVisible(false)

    const hunter = {
      graphic: sprite, shadow, body, hpBar, alert,
      hp: 2, maxHp: 2, alive: true,
      chasing: false, patrolTimer: 0, frozen: false,
      alwaysChase: false, hacked: false,
      spawnX: x, spawnY: y,
      dir: 'front', walkTween: null,
      state: null, investigateTarget: null,
      lastFootX: x, lastFootY: y
    }
    this.monsterList.push(hunter)
    return hunter
  }

  spawnShields() {
    const shieldSpots = [
      { col: 12, row: 8 },
      { col: 30, row: 15 },
      { col: 22, row: 32 },
      { col: 38, row: 28 }
    ]

    this.shieldList = []

    shieldSpots.forEach(s => {
      if (this.isWall(s.col, s.row)) return
      const x = s.col * this.TILE + this.TILE / 2
      const y = s.row * this.TILE + this.TILE / 2

      const bg = this.add.circle(x, y, 18, 0x00e5ff, 0.25)
      const ring = this.add.circle(x, y, 18).setStrokeStyle(2, 0x00ffff, 0.75)

      const icon = this.add.text(x, y - 2, '🛡️', {
        fontSize: '20px'
      }).setOrigin(0.5)

      const label = this.add.text(x, y + 22, 'SHIELD (10s)', {
        fontSize: '9px',
        fontFamily: 'Arial Black',
        color: '#00ffff',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5)

      this.tweens.add({
        targets: [icon, bg, ring],
        y: '-=4',
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })

      this.shieldList.push({
        x,
        y,
        col: s.col,
        row: s.row,
        bg,
        ring,
        icon,
        label,
        collected: false
      })
    })
  }

  activateShield(duration = 10) {
    this.shieldActive = true
    this.stealthMode = true
    this.shieldTimeRemaining = duration

    // Make player translucent / invisible
    if (this.player && this.player.active) {
      this.player.setAlpha(0.45)
    }

    if (!this.playerShieldGfx) {
      this.playerShieldGfx = this.add.graphics().setDepth(25)
    }

    if (this.shieldTimerEvent) {
      this.shieldTimerEvent.remove(false)
      this.shieldTimerEvent = null
    }

    this.showFloatingText(
      this.player.x,
      this.player.y - 35,
      `🛡️ SHIELD ACTIVE! Invisible (${duration}s)`,
      '#00ffff'
    )
  }

  deactivateShield() {
    this.shieldActive = false
    this.stealthMode = false
    this.shieldTimeRemaining = 0
    if (this.shieldTimerEvent) {
      this.shieldTimerEvent.remove(false)
      this.shieldTimerEvent = null
    }
    if (this.player && this.player.active) {
      this.player.setAlpha(1.0)
    }
    if (this.playerShieldGfx) {
      this.playerShieldGfx.clear()
    }
    this.showFloatingText(
      this.player.x,
      this.player.y - 35,
      '🛡️ Shield expired',
      '#aaaaaa'
    )
  }

  drawMonster(m, x, y, frozen) {
    // m here is the whole monster object now, not just graphic
    m.graphic.setPosition(x, y)
    if (m.shadow) m.shadow.setPosition(x, y + 28)
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

  // ===========================================================
  // ❄️ WARMTH SYSTEM
  // ===========================================================

  spawnCampfires() {
    const positions = [
      { col: 8, row: 4 },
      { col: 24, row: 24 },
      { col: 40, row: 40 },
      { col: 16, row: 30 }
    ]

    positions.forEach(p => {
      if (this.isWall(p.col, p.row)) return
      const x = p.col * this.TILE + this.TILE / 2
      const y = p.row * this.TILE + this.TILE / 2
      const radius = 110

      const rangeRing = this.add.circle(x, y, radius, 0xFF6600, 0.06)
        .setStrokeStyle(1, 0xFF9944, 0.35)
        .setDepth(5)

      const glow = this.add.circle(x, y, 26, 0xFF6600, 0.35).setDepth(6)
      this.tweens.add({
        targets: glow, scaleX: 1.6, scaleY: 1.6, alpha: 0.1,
        duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      })

      const flame = this.add.text(x, y, '🔥', { fontSize: '26px' })
        .setOrigin(0.5).setDepth(8)
      this.tweens.add({
        targets: flame, scaleX: 1.15, scaleY: 0.9,
        duration: 260, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      })

      const logs = this.add.ellipse(x, y + 10, 34, 12, 0x4a2c14, 0.9).setDepth(7)

      this.campfireList.push({ x, y, radius, rangeRing, glow, flame, logs })
    })
  }

  // 🪤 Hidden alarm traps — stepping on one alerts nearby hunters
  spawnAlarmTraps() {
    const positions = [
      { col: 12, row: 5 },
      { col: 33, row: 13 },
      { col: 20, row: 33 },
      { col: 42, row: 20 }
    ]

    this.trapList = []

    positions.forEach(p => {
      if (this.isWall(p.col, p.row)) return
      const x = p.col * this.TILE + this.TILE / 2
      const y = p.row * this.TILE + this.TILE / 2

      const icon = this.add.text(x, y, '🪤', { fontSize: '15px' })
        .setOrigin(0.5).setDepth(9).setAlpha(0.85)

      this.trapList.push({ x, y, icon, triggered: false })
    })
  }

  updateAlarmTraps() {
    this.trapList.forEach(t => {
      if (t.triggered) return
      t.icon.setAlpha(this.blizzardActive ? 0.45 : 0.85)

      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, t.x, t.y) < 24) {
        t.triggered = true
        t.icon.setVisible(false)
        this.showBanner('🚨 ALERT! Hunters are coming!', '#ff3355')
        this.cameras.main.shake(250, 0.01)

        this.monsterList.forEach(m => {
          if (!m.alive || !m.body) return
          const d = Phaser.Math.Distance.Between(m.body.x, m.body.y, t.x, t.y)
          if (d < 420) m.alertedUntil = this.time.now + 10000
        })
      }
    })
  }

  // Finds the nearest walkable tile that sits next to a tree/cliff tile,
  // so wildlife has somewhere to actually huddle during a blizzard.
  findNearestShelterTile(col, row) {
    for (let radius = 1; radius <= 6; radius++) {
      for (let dr = -radius; dr <= radius; dr++) {
        for (let dc = -radius; dc <= radius; dc++) {
          if (Math.max(Math.abs(dc), Math.abs(dr)) !== radius) continue
          const c = col + dc
          const r = row + dr
          if (this.isWall(c, r)) continue

          const adj = [[1, 0], [-1, 0], [0, 1], [0, -1]]
          for (const [adc, adr] of adj) {
            if (this.isWall(c + adc, r + adr)) {
              return { col: c, row: r }
            }
          }
        }
      }
    }
    return null
  }

  createWarmthHUD() {
    const { width } = this.scale
    const x = width - 190
    const y = 86

    this.warmthHUDX = x
    this.warmthHUDY = y
    this.warmthBarW = 150
    this.warmthBarH = 14

    this.warmthIcon = this.add.text(x - 22, y, '❄️', { fontSize: '16px' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(250)

    this.warmthBarBg = this.add.graphics().setScrollFactor(0).setDepth(250)
    this.warmthBarBg.fillStyle(0x001a2e, 0.85)
    this.warmthBarBg.fillRoundedRect(x - 4, y - this.warmthBarH / 2, this.warmthBarW + 8, this.warmthBarH, 6)

    this.warmthBarFill = this.add.graphics().setScrollFactor(0).setDepth(251)

    this.warmthText = this.add.text(x + this.warmthBarW / 2, y + 16, '', {
      fontSize: '11px', fontFamily: 'Arial Black',
      color: '#aee6ff', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(251)

    this.updateWarmthHUD()
  }

  updateWarmthHUD() {
    if (!this.warmthBarFill) return
    const pct = Phaser.Math.Clamp(this.warmth / this.maxWarmth, 0, 1)

    const color =
      pct > 0.6 ? 0x00BFFF :
      pct > 0.3 ? 0xFFD700 :
      0xff3355

    this.warmthBarFill.clear()
    this.warmthBarFill.fillStyle(color, 1)
    this.warmthBarFill.fillRoundedRect(
      this.warmthHUDX,
      this.warmthHUDY - this.warmthBarH / 2,
      this.warmthBarW * pct,
      this.warmthBarH,
      5
    )

    let label = `WARMTH: ${Math.round(this.warmth)}%`
    if (this.warmth <= 0) label = '🥶 FROSTBITE!'
    else if (this.nearCampfire) label = '🔥 WARMING UP'
    else if (this.isSheltered) label = `WARMTH: ${Math.round(this.warmth)}% (sheltered)`

    this.warmthText.setText(label)
    this.warmthText.setColor(this.warmth <= 0 ? '#ff5577' : '#aee6ff')
  }

  updateWarmth(delta) {
    if (!this.player || !this.player.active) return
    const dt = delta / 1000

    // Sheltered = standing next to a tree/cliff tile (wind-blocked)
    const pc = Math.floor(this.player.x / this.TILE)
    const pr = Math.floor(this.player.y / this.TILE)
    this.isSheltered = false
    for (let dr = -1; dr <= 1 && !this.isSheltered; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dc === 0 && dr === 0) continue
        if (this.mapData[pr + dr] && this.isWall(pc + dc, pr + dr)) {
          this.isSheltered = true
          break
        }
      }
    }

    this.nearCampfire = this.campfireList.some(f =>
      Phaser.Math.Distance.Between(this.player.x, this.player.y, f.x, f.y) < f.radius
    )

    if (this.nearCampfire) {
      this.warmth = Math.min(this.maxWarmth, this.warmth + this.CAMPFIRE_REGEN_PER_SEC * dt)
    } else if (this.isRescuing) {
      // Holding a rescue steady shouldn't also be a race against frostbite —
      // warmth just holds still while you're actively freeing an animal.
    } else {
      const baseDecay = this.isSheltered ? this.SHELTER_DECAY_PER_SEC : this.OPEN_DECAY_PER_SEC
      const blizzardMult = this.blizzardActive ? this.BLIZZARD_DECAY_MULT : 1
      this.warmth = Math.max(0, this.warmth - baseDecay * blizzardMult * dt)
    }

    if (this.warmth <= 0 && this.time.now - this.lastFrostbiteTick > 2500) {
      this.lastFrostbiteTick = this.time.now
      this.playerHP--
      this.player.setTint(0x66ccff)
      this.showFloatingText(this.player.x, this.player.y - 30, '🥶 Frostbite! -1 Heart', '#66ccff')
      this.time.delayedCall(300, () => {
        if (this.player && this.player.active) this.player.clearTint()
      })
      if (this.playerHP <= 0) {
        this.playerHP = 0
        this.updateWarmthHUD()
        this.endGame(false)
        return
      }
    }

    this.updateWarmthHUD()
  }

  // ===========================================================
  // 🌨️ DYNAMIC BLIZZARD EVENTS
  // ===========================================================

  showBanner(msg, color) {
    const { width } = this.scale
    const banner = this.add.text(width / 2, 70, msg, {
      fontSize: '18px', fontFamily: 'Arial Black',
      color, stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(260).setAlpha(0)

    this.tweens.add({
      targets: banner, alpha: 1, duration: 300,
      yoyo: true, hold: 2200,
      onComplete: () => banner.destroy()
    })
  }

  scheduleNextBlizzard() {
    if (this.gameEnding) return
    this.blizzardTimer = this.time.delayedCall(
      Phaser.Math.Between(25000, 40000),
      () => this.triggerBlizzardWarning()
    )
  }

  triggerBlizzardWarning() {
    if (this.gameEnding) return
    this.blizzardWarningActive = true
    this.showBanner('🌨️ Blizzard incoming...', '#aee6ff')
    this.time.delayedCall(3000, () => this.startBlizzard())
  }

  startBlizzard() {
    if (this.gameEnding) return
    this.blizzardWarningActive = false
    this.blizzardActive = true
    this.showBanner('❄️ BLIZZARD!', '#ffffff')

    const { width, height } = this.scale

    this.blizzardOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0xdfefff, 0.12)
      .setScrollFactor(0).setDepth(180)
    this.tweens.add({
      targets: this.blizzardOverlay, alpha: 0.22,
      duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    })

    this.blizzardFlakes = []
    for (let i = 0; i < 90; i++) {
      const x = Phaser.Math.Between(0, width)
      const y = Phaser.Math.Between(-height, height)
      const flake = this.add.circle(x, y, Phaser.Math.FloatBetween(1.5, 3.5), 0xffffff, 0.8)
        .setScrollFactor(0).setDepth(181)

      const tween = this.tweens.add({
        targets: flake,
        y: height + 20,
        x: flake.x - Phaser.Math.Between(60, 140),
        duration: Phaser.Math.Between(700, 1400),
        repeat: -1,
        onRepeat: () => {
          flake.setPosition(Phaser.Math.Between(0, width), Phaser.Math.Between(-50, -10))
        }
      })

      this.blizzardFlakes.push({ flake, tween })
    }

    this.blizzardTimer = this.time.delayedCall(
      Phaser.Math.Between(14000, 20000),
      () => this.endBlizzard()
    )
  }

  endBlizzard() {
    this.blizzardActive = false
    this.clearBlizzardVisuals()
    if (!this.gameEnding) {
      this.showBanner('☀️ The blizzard has passed', '#aee6ff')
      this.scheduleNextBlizzard()
    }
  }

  clearBlizzardVisuals() {
    if (this.blizzardOverlay) {
      this.tweens.killTweensOf(this.blizzardOverlay)
      this.blizzardOverlay.destroy()
      this.blizzardOverlay = null
    }
    this.blizzardFlakes.forEach(f => {
      if (f.tween) f.tween.stop()
      if (f.flake) f.flake.destroy()
    })
    this.blizzardFlakes = []
  }

  // ===========================================================
  // 👣 FOOTPRINTS (player, hunters, animals — a tracking clue,
  // not decoration: trails hint at trapped animals; fresh boot
  // prints tell you a hunter came through).
  // ===========================================================

  layFootprint(x, y, color, size) {
    const lifespan = this.blizzardActive ? 3000 : 5000
    // Two small offset ellipses — heel + ball of foot — reads as a
    // print at this scale without depending on any emoji glyph.
    const fp = this.add.graphics().setDepth(4).setAlpha(0.6)
    fp.fillStyle(color, 1)
    fp.fillEllipse(x, y, size, size * 1.5)
    fp.fillEllipse(x - size * 0.35, y - size * 1.1, size * 0.7, size * 0.9)

    this.tweens.add({
      targets: fp, alpha: 0, duration: lifespan,
      onComplete: () => {
        fp.destroy()
        const i = this.footprints.indexOf(fp)
        if (i >= 0) this.footprints.splice(i, 1)
      }
    })

    this.footprints.push(fp)
  }

  maybePlayerFootprint() {
    if (this.playerLastFootX === null) {
      this.playerLastFootX = this.player.x
      this.playerLastFootY = this.player.y
      return
    }
    const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.playerLastFootX, this.playerLastFootY)
    if (d >= 26) {
      this.layFootprint(this.player.x, this.player.y + 16, 0xdfefff, 6)
      this.playerLastFootX = this.player.x
      this.playerLastFootY = this.player.y
    }
  }

  maybeLayHunterFootprint(m) {
    if (m.lastFootX === undefined) { m.lastFootX = m.body.x; m.lastFootY = m.body.y; return }
    const d = Phaser.Math.Distance.Between(m.body.x, m.body.y, m.lastFootX, m.lastFootY)
    if (d >= 26) {
      this.layFootprint(m.body.x, m.body.y + 14, 0x4a3626, 7)
      m.lastFootX = m.body.x
      m.lastFootY = m.body.y
    }
  }

  maybeLayAnimalFootprint(w) {
    if (w.lastFootX === undefined) { w.lastFootX = w.x; w.lastFootY = w.y; return }
    const d = Phaser.Math.Distance.Between(w.x, w.y, w.lastFootX, w.lastFootY)
    if (d >= 22) {
      const dot = w.type === 'bear' ? '●' : '•'
      this.layFootprint(w.x, w.y + (w.type === 'bear' ? 24 : 18), dot, w.type === 'bear' ? '13px' : '11px')
      w.lastFootX = w.x
      w.lastFootY = w.y
    }
  }

  // A short, static trail of tracks leading toward a trapped animal —
  // gives the player something to actually follow and discover, instead
  // of just stumbling onto the danger banner.
  buildAnimalTrail(col, row, type) {
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]
    const dir = dirs[Phaser.Math.Between(0, dirs.length - 1)]
    const dot = type === 'bear' ? '●' : '•'
    const size = type === 'bear' ? '13px' : '11px'
    const trail = []
    let c = col, r = row

    for (let i = 1; i <= 6; i++) {
      c += dir[0]; r += dir[1]
      if (this.isWall(c, r)) break
      const x = c * this.TILE + this.TILE / 2
      const y = r * this.TILE + this.TILE / 2
      const sprite = this.add.text(x, y, dot, { fontSize: size })
        .setOrigin(0.5).setDepth(4).setAlpha(0.5)
      trail.push(sprite)
    }

    return trail
  }

  // A static trail of boot prints leading toward a hunter camp — same idea
  // as the animal trail, just for camps instead of traps.
  buildBootTrail(col, row, alpha) {
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]
    const dir = dirs[Phaser.Math.Between(0, dirs.length - 1)]
    let c = col, r = row
    for (let i = 1; i <= 6; i++) {
      c += dir[0]; r += dir[1]
      if (this.isWall(c, r)) break
      const x = c * this.TILE + this.TILE / 2
      const y = r * this.TILE + this.TILE / 2
      const print = this.add.graphics().setDepth(4).setAlpha(alpha)
      print.fillStyle(0x4a3626, 1)
      print.fillEllipse(x, y, 7, 10.5)
      print.fillEllipse(x - 2.5, y - 7.7, 4.9, 6.3)
    }
  }

  // ===========================================================
  // 🏕️ HUNTER CAMPS — pure environmental discovery. No quest,
  // no restriction: find one, light the dead fire, get a small
  // reward and a real warmth source. The footprints do the work
  // of pointing the player toward it.
  // ===========================================================

  // Drawn instead of an emoji glyph — 🏕️ is a compound emoji that a lot of
  // canvas/font setups silently fail to render, so build it as a shape.
  // Deliberately bigger than a tile (48px) — it's a landmark, not a prop.
  drawTent(x, y) {
    const g = this.add.graphics().setDepth(8)

    // Ground shadow
    g.fillStyle(0x000000, 0.25)
    g.fillEllipse(x, y + 17, 64, 18)

    // Tent body
    g.fillStyle(0x8a6a4a, 1)
    g.beginPath()
    g.moveTo(x, y - 42)
    g.lineTo(x - 32, y + 16)
    g.lineTo(x + 32, y + 16)
    g.closePath()
    g.fillPath()

    // Entrance flap
    g.fillStyle(0x4a3626, 1)
    g.beginPath()
    g.moveTo(x, y - 22)
    g.lineTo(x - 13, y + 16)
    g.lineTo(x + 13, y + 16)
    g.closePath()
    g.fillPath()

    // Outline + ridge seam
    g.lineStyle(3, 0x3a2c1e, 0.9)
    g.strokeTriangle(x, y - 42, x - 32, y + 16, x + 32, y + 16)
    g.lineBetween(x, y - 42, x, y - 22)

    return g
  }

  spawnHunterCamps() {
    const camps = [
      { col: 19, row: 6,  variant: 'abandoned' },
      { col: 44, row: 14, variant: 'active' },
      { col: 6,  row: 44, variant: 'old' },
      { col: 33, row: 44, variant: 'large' }
    ]

    this.hunterCamps = []

    camps.forEach(c => {
      if (this.isWall(c.col, c.row)) return
      const x = c.col * this.TILE + this.TILE / 2
      const y = c.row * this.TILE + this.TILE / 2

      // Tent(s) — larger camps get a small cluster instead of one
      const tentOffsets = [[0, -32], [-58, -4], [58, -4]]
      const tentCount = c.variant === 'large' ? 3 : 1
      for (let i = 0; i < tentCount; i++) {
        const [ox, oy] = tentOffsets[i]
        this.drawTent(x + ox, y + oy)
      }

      // Dead campfire — cold ash and unlit logs, no flame yet
      const logs = this.add.ellipse(x, y + 14, 34, 12, 0x3a3a3a, 0.9).setDepth(7)
      const ash = this.add.circle(x, y + 14, 15, 0x555555, 0.45).setDepth(6)

      // Supplies
      const crate = this.add.text(x + 34, y + 10, '📦', { fontSize: '18px' }).setOrigin(0.5).setDepth(8)

      if (c.variant === 'old') {
        // Partially buried under drifted snow
        crate.setAlpha(0.55)
        this.add.ellipse(x + 34, y + 14, 22, 10, 0xffffff, 0.55).setDepth(9)
      }

      // Footprints leading to the camp — fresher and more visible for
      // a recently-used camp, barely-there for an old one
      const trailAlpha = c.variant === 'old' ? 0.2 : c.variant === 'active' ? 0.6 : 0.4
      const trailCount = c.variant === 'large' ? 3 : 1
      for (let i = 0; i < trailCount; i++) {
        this.buildBootTrail(c.col, c.row, trailAlpha)
      }

      // A recently-used camp still has a hunter lingering nearby
      if (c.variant === 'active') {
        const offsets = [[1, 0], [-1, 0], [0, 1], [0, -1]]
        const spot = offsets
          .map(([dc, dr]) => ({ col: c.col + dc, row: c.row + dr }))
          .find(({ col, row }) => !this.isWall(col, row))
        if (spot) {
          this.createHunterAt(spot.col * this.TILE + this.TILE / 2, spot.row * this.TILE + this.TILE / 2)
        }
      }

      const prompt = this.add.text(x, y - 42, '[E] Light Campfire', {
        fontSize: '11px', fontFamily: 'Arial Black',
        color: '#ffcc66', stroke: '#000000', strokeThickness: 3
      }).setOrigin(0.5).setDepth(11).setVisible(false)

      this.hunterCamps.push({
        x, y, lit: false, variant: c.variant,
        logs, ash, crate, prompt,
        radius: 110
      })
    })
  }

  updateHunterCamps() {
    this.hunterCamps.forEach(camp => {
      if (camp.lit) return
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, camp.x, camp.y)
      const canLight = dist < 55
      camp.prompt.setVisible(canLight)

      if (canLight && Phaser.Input.Keyboard.JustDown(this.collectKey)) {
        this.lightHunterCamp(camp)
      }
    })
  }

  lightHunterCamp(camp) {
    camp.lit = true
    camp.prompt.destroy()
    camp.ash.destroy()
    camp.logs.setFillStyle(0x4a2c14, 0.9)

    const glow = this.add.circle(camp.x, camp.y + 14, 26, 0xFF6600, 0.35).setDepth(6)
    this.tweens.add({
      targets: glow, scaleX: 1.6, scaleY: 1.6, alpha: 0.1,
      duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    })

    const flame = this.add.text(camp.x, camp.y + 14, '🔥', { fontSize: '24px' }).setOrigin(0.5).setDepth(8)
    this.tweens.add({
      targets: flame, scaleX: 1.15, scaleY: 0.9,
      duration: 260, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    })

    // A lit camp is a real warmth source from here on
    this.campfireList.push({ x: camp.x, y: camp.y + 14, radius: camp.radius, glow, flame, logs: camp.logs })

    this.score += 100
    this.showBanner('🔥 HUNTER CAMP DISCOVERED', '#ffcc66')
    this.time.delayedCall(2600, () => {
      this.showBanner('Evidence of illegal hunting activity was found here.', '#dddddd')
    })
  }

  // ===========================================================
  // 🪤 HUNTER TRAPS + RESCUE EVENTS
  // ===========================================================

  hideWildlifeUI(w) {
    if (w.trapIcon) w.trapIcon.setVisible(false)
    if (w.alertIcon) w.alertIcon.setVisible(false)
    if (w.dangerText) w.dangerText.setVisible(false)
    if (w.promptRescue) w.promptRescue.setVisible(false)
    if (w.rescueBar) w.rescueBar.clear()
    if (w.prompt) w.prompt.setVisible(false)
    if (w.trailSprites) w.trailSprites.forEach(s => s.destroy())
    if (w.trailSprites) w.trailSprites = []
  }

  updateRescueBar(w) {
    if (!w.rescueBar) return
    w.rescueBar.clear()
    if (!w.rescueProgress) return

    const barW = 40
    const barX = w.x - barW / 2
    const barY = w.y - (w.type === 'bear' ? 96 : 84)

    w.rescueBar.fillStyle(0x001a0e, 0.8)
    w.rescueBar.fillRoundedRect(barX, barY, barW, 7, 3)
    w.rescueBar.fillStyle(0x66ff99, 1)
    w.rescueBar.fillRoundedRect(barX, barY, barW * w.rescueProgress, 7, 3)
  }

  completeRescue(w) {
    w.trapped = false
    w.rescued = true
    w.discovered = true
    this.wildlifeJournal.push(w.species)
    this.score += 150
    this.showFloatingText(w.x, w.y - 30, '❤️ RESCUED!', '#66ff99')
    this.hideWildlifeUI(w)

    if (w.assignedHunter) {
      w.assignedHunter.state = null
      w.assignedHunter.investigateTarget = null
      w.assignedHunter = null
    }

    let nearestFire = null, nearestDist = Infinity
    this.campfireList.forEach(f => {
      const d = Phaser.Math.Distance.Between(w.x, w.y, f.x, f.y)
      if (d < nearestDist) { nearestDist = d; nearestFire = f }
    })

    if (nearestFire) {
      w.shelterTarget = nearestFire
      w.escorting = true
    } else {
      w.done = true
    }
  }

  loseTrappedAnimal(w, reason) {
    w.trapped = false
    w.lost = true
    this.forestHealth = Math.max(0, (this.forestHealth || 100) - 10)

    const msg = reason === 'hunter'
      ? `💔 ${w.species} was taken!`
      : `💔 ${w.species} didn't make it...`

    this.showFloatingText(w.x, w.y - 30, msg, '#ff4444')
    this.hideWildlifeUI(w)
    w.graphic.setAlpha(0.2)

    if (w.assignedHunter) {
      w.assignedHunter.state = null
      w.assignedHunter.investigateTarget = null
      w.assignedHunter = null
    }
  }

  updateTrappedAnimal(w, delta) {
    // ── Freed and walking itself to the nearest campfire shelter ──
    if (w.escorting) {
      const target = w.shelterTarget
      if (!target) { w.done = true; return }

      const dist = Phaser.Math.Distance.Between(w.x, w.y, target.x, target.y)
      if (dist < 40) {
        w.escorting = false
        w.done = true
        this.showBanner(`❤️ ${w.species} is SAFE!`, '#66ff99')
        w.graphic.setAlpha(0.35)
        return
      }

      const angle = Phaser.Math.Angle.Between(w.x, w.y, target.x, target.y)
      const spd = (w.type === 'bear' ? 0.9 : 1.3)
      w.x += Math.cos(angle) * spd
      w.y += Math.sin(angle) * spd
      w.graphic.setPosition(w.x, w.y)
      w.shadow.setPosition(w.x, w.y + (w.type === 'bear' ? 28 : 22))
      this.maybeLayAnimalFootprint(w)

      const horizontal = Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))
      const dir = horizontal
        ? (Math.cos(angle) > 0 ? 'right' : 'left')
        : (Math.sin(angle) > 0 ? 'front' : 'back')
      w.graphic.setTexture(w.type + '_' + dir)
      return
    }

    if (!w.trapped) return

    const distToPlayer = Phaser.Math.Distance.Between(this.player.x, this.player.y, w.x, w.y)

    // ── Discovery: nothing happens until the player gets close ──
    if (!w.discovered) {
      if (distToPlayer < 220) {
        w.discovered = true
        w.dangerTimer = w.trapType === 'cage' ? 30000 : 24000
        this.showBanner(`⚠️ ${w.species} is trapped!`, '#ffcc55')
        if (w.trapIcon) w.trapIcon.setVisible(true)
        if (w.trailSprites) { w.trailSprites.forEach(s => s.destroy()); w.trailSprites = [] }
      } else {
        return
      }
    }

    // ── Danger timer ──
    w.dangerTimer -= delta
    if (w.dangerTimer <= 0) {
      this.loseTrappedAnimal(w, 'timeout')
      return
    }
    if (w.dangerText) {
      w.dangerText.setVisible(true)
      w.dangerText.setPosition(w.x, w.y - (w.type === 'bear' ? 66 : 56))
      w.dangerText.setText(`⏱️ ${Math.ceil(w.dangerTimer / 1000)}s`)
    }
    if (w.alertIcon) {
      w.alertIcon.setVisible(true)
      w.alertIcon.setPosition(w.x, w.y - (w.type === 'bear' ? 80 : 68))
    }
    if (w.trapIcon) w.trapIcon.setAlpha(this.blizzardActive ? 0.45 : 1)

    // ── Assign the nearest free hunter to investigate ──
    if (w.assignedHunter && !w.assignedHunter.alive) w.assignedHunter = null
    if (!w.assignedHunter) {
      let nearest = null, nearestDist = 320
      this.monsterList.forEach(m => {
        if (!m.alive || !m.body || m.state === 'investigate') return
        const d = Phaser.Math.Distance.Between(m.body.x, m.body.y, w.x, w.y)
        if (d < nearestDist) { nearestDist = d; nearest = m }
      })
      if (nearest) {
        nearest.state = 'investigate'
        nearest.investigateTarget = w
        w.assignedHunter = nearest
      }
    }

    // ── Rescue interaction: hold E while close ──
    const canRescue = distToPlayer < 60
    if (w.promptRescue) {
      w.promptRescue.setVisible(canRescue)
      w.promptRescue.setPosition(w.x, w.y - (w.type === 'bear' ? 52 : 42))
    }

    if (canRescue && this.collectKey.isDown) {
      w.rescueProgress = Math.min(1, (w.rescueProgress || 0) + delta / 2000)
      this.isRescuing = true
    } else {
      w.rescueProgress = Math.max(0, (w.rescueProgress || 0) - delta / 1000)
    }
    this.updateRescueBar(w)

    if (w.rescueProgress >= 1) {
      this.completeRescue(w)
    }
  }

  useWeapon() {
    if (this.isAttacking) return

    this.isAttacking = true

    // Safe reset. Even if a power does nothing, attack will unlock.
    this.time.delayedCall(500, () => {
      this.isAttacking = false
    })

    const range = this.evolutionStage >= 3 ? 165 :
      this.evolutionStage >= 2 ? 125 : 95

    const attackColorMap = {
      fire: 0xff2200,
      lightning: 0xffdd00,
      bomb: 0x111111,
      ice: 0x00bfff,
      wind: 0x88ffee,
      boomerang: 0xc8a25a,
      normal: this.birdColor || 0xffffff
    }

    const attackColor = attackColorMap[this.currentWeapon] || this.birdColor || 0xffffff

    const makeRing = (color, startRadius, finalScale, duration = 350) => {
      const ring = this.add.graphics()
      ring.setPosition(this.player.x, this.player.y)
      ring.lineStyle(3, color, 0.65)
      ring.strokeCircle(0, 0, startRadius)

      this.tweens.add({
        targets: ring,
        scaleX: finalScale,
        scaleY: finalScale,
        alpha: 0,
        duration,
        onComplete: () => ring.destroy()
      })

      return ring
    }

    switch (this.currentWeapon) {
      case 'fire': {
        makeRing(attackColor, 10, range / 16, 300)

        const flame = this.add.graphics()
        flame.setPosition(this.player.x, this.player.y)
        flame.fillStyle(0xff6600, 0.35)
        flame.fillCircle(0, 0, 22)

        this.tweens.add({
          targets: flame,
          scaleX: 4,
          scaleY: 4,
          alpha: 0,
          duration: 350,
          onComplete: () => flame.destroy()
        })

        this.hitMonstersInRange(
          this.player.x,
          this.player.y,
          range,
          1,
          0xff4500
        )

        this.showFloatingText(
          this.player.x,
          this.player.y - 30,
          '🔥 Fire Burst!',
          '#ff8844'
        )

        break
      }

      case 'bomb': {
        makeRing(attackColor, 12, range / 18, 320)

        const boom = this.add.graphics()
        boom.setPosition(this.player.x, this.player.y)
        boom.fillStyle(0x111111, 0.35)
        boom.fillCircle(0, 0, 24)

        this.tweens.add({
          targets: boom,
          scaleX: 5,
          scaleY: 5,
          alpha: 0,
          duration: 420,
          onComplete: () => boom.destroy()
        })

        this.hitMonstersInRange(
          this.player.x,
          this.player.y,
          range * 1.05,
          2,
          attackColor
        )

        this.cameras.main.shake(180, 0.006)

        this.showFloatingText(
          this.player.x,
          this.player.y - 30,
          '💣 Bomb Blast!',
          '#ff9955'
        )

        break
      }

      case 'ice': {
        makeRing(0x00bfff, 10, range / 10, 400)

        let frozeAnyone = false

        this.monsterList.forEach(m => {
          if (!m.alive || !m.body || !m.body.active) return

          const dist = Phaser.Math.Distance.Between(
            this.player.x,
            this.player.y,
            m.body.x,
            m.body.y
          )

          if (dist < range) {
            frozeAnyone = true
            this.freezeKillMonster(m)
          }
        })

        if (!frozeAnyone) {
          this.showFloatingText(this.player.x, this.player.y - 30, 'Miss!', '#88ccff')
        }

        break
      }

      case 'lightning': {
        makeRing(attackColor, 10, range / 16, 280)
        const targets = this.monsterList
          .filter(m => {
            if (!m.alive || !m.body || !m.body.active) return false

            const dist = Phaser.Math.Distance.Between(
              this.player.x,
              this.player.y,
              m.body.x,
              m.body.y
            )

            return dist <= range * 1.7
          })
          .sort((a, b) =>
            Phaser.Math.Distance.Between(this.player.x, this.player.y, a.body.x, a.body.y) -
            Phaser.Math.Distance.Between(this.player.x, this.player.y, b.body.x, b.body.y)
          )
          .slice(0, 3)

        if (targets.length === 0) {
          this.showFloatingText(this.player.x, this.player.y - 30, 'Miss!', '#888888')
          break
        }

        const lightning = this.add.graphics()
        lightning.lineStyle(4, 0xffdd00, 1)

        let lastX = this.player.x
        let lastY = this.player.y

        targets.forEach(m => {
          if (!m.alive || !m.body || !m.body.active) return

          lightning.beginPath()
          lightning.moveTo(lastX, lastY)

          const midX = (lastX + m.body.x) / 2 + Phaser.Math.Between(-18, 18)
          const midY = (lastY + m.body.y) / 2 + Phaser.Math.Between(-18, 18)

          lightning.lineTo(midX, midY)
          lightning.lineTo(m.body.x, m.body.y)
          lightning.strokePath()

          lastX = m.body.x
          lastY = m.body.y

          const dealt = this.shieldActive ? Math.max(3, m.hp) : 1
          m.hp -= dealt
          m.body.setVelocity(0, 0)

          if (m.hp <= 0) {
            this.killMonster(m, this.currentWeapon)
            return
          }

          this.drawHPBar(m.hpBar, m.body.x, m.body.y - 48, m.hp, m.maxHp)
          this.showFloatingText(
            m.body.x,
            m.body.y - 20,
            this.shieldActive ? '🗡️ Stealth Zap!' : '⚡ ZAP!',
            this.shieldActive ? '#00ffff' : '#FFD700'
          )
        })

        this.tweens.add({
          targets: lightning,
          alpha: 0,
          duration: 260,
          onComplete: () => lightning.destroy()
        })

        this.showFloatingText(
          this.player.x,
          this.player.y - 30,
          '⚡ Electric Chain!',
          '#FFD700'
        )

        break
      }

      case 'wind': {
        makeRing(0x88ffee, 10, range / 9, 380)

        let hitAnyone = false

        this.monsterList.forEach(m => {
          if (!m.alive || !m.body || !m.body.active) return

          const dist = Phaser.Math.Distance.Between(
            this.player.x,
            this.player.y,
            m.body.x,
            m.body.y
          )

          if (dist < range * 1.2) {
            hitAnyone = true

            const angle = Phaser.Math.Angle.Between(
              this.player.x,
              this.player.y,
              m.body.x,
              m.body.y
            )

            const dealt = this.shieldActive ? Math.max(3, m.hp) : 1
            m.hp -= dealt

            m.body.setVelocity(
              Math.cos(angle) * 180,
              Math.sin(angle) * 180
            )

            if (m.hp <= 0) {
              this.killMonster(m, this.currentWeapon)
              return
            }

            this.drawHPBar(m.hpBar, m.body.x, m.body.y - 48, m.hp, m.maxHp)
            this.showFloatingText(
              m.body.x,
              m.body.y - 20,
              this.shieldActive ? '🗡️ Stealth Gust!' : '🌪 Pushed!',
              this.shieldActive ? '#00ffff' : '#88ffee'
            )
          }
        })

        if (!hitAnyone) {
          this.showFloatingText(this.player.x, this.player.y - 30, 'Miss!', '#88ffee')
        } else {
          this.showFloatingText(this.player.x, this.player.y - 30, '🌪 Wind Force!', '#88ffee')
        }

        break
      }

      case 'boomerang': {
        makeRing(0xc8a25a, 10, range / 10, 250)
        this.hitMonstersInRange(this.player.x, this.player.y, range, 1, 0xc8a25a)

        // Spawn spinning boomerang projectile arcing out
        const b = this.add.text(this.player.x, this.player.y, '🪃', { fontSize: '24px' }).setOrigin(0.5).setDepth(20)
        let targetAngle = 0
        let closestDist = 9999
        this.monsterList.forEach(m => {
          if (m.alive && m.body) {
            const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, m.body.x, m.body.y)
            if (d < range * 1.5 && d < closestDist) {
              closestDist = d
              targetAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, m.body.x, m.body.y)
            }
          }
        })
        const throwDist = Math.min(range, closestDist < 9999 ? closestDist : range)
        const targetX = this.player.x + Math.cos(targetAngle) * throwDist
        const targetY = this.player.y + Math.sin(targetAngle) * throwDist

        this.tweens.add({
          targets: b,
          x: targetX,
          y: targetY,
          angle: 720,
          duration: 260,
          ease: 'Sine.easeOut',
          onComplete: () => {
            this.tweens.add({
              targets: b,
              x: this.player.x,
              y: this.player.y,
              angle: 1440,
              duration: 260,
              ease: 'Sine.easeIn',
              onComplete: () => b.destroy()
            })
          }
        })

        this.time.delayedCall(300, () => {
          makeRing(0xc8a25a, 10, range / 10, 250)
          this.hitMonstersInRange(this.player.x, this.player.y, range, 1, 0xc8a25a)
        })

        this.showFloatingText(this.player.x, this.player.y - 30, '🪃 Boomerang!', '#C8A25A')
        break
      }

      case 'normal':
      default: {
        makeRing(this.birdColor || 0xffffff, 10, range / 10, 350)
        this.hitMonstersInRange(this.player.x, this.player.y, range, 1, this.birdColor || 0xffffff)
        break
      }
    }
  }

  hitMonstersInRange(x, y, range, damage, color) {
    let hit = false

    this.monsterList.forEach(m => {
      if (!m.alive || !m.body || !m.body.active) return

      const dist = Phaser.Math.Distance.Between(x, y, m.body.x, m.body.y)

      if (dist < range) {
        hit = true

        const dealt = this.shieldActive ? Math.max(damage * 3, m.hp) : damage
        m.hp -= dealt
        m.body.setVelocity(0, 0)

        if (m.hpBar) {
          this.drawHPBar(m.hpBar, m.body.x, m.body.y - 48, m.hp, m.maxHp)
        }

        if (m.graphic) {
          m.graphic.setAlpha(0.3)
          this.time.delayedCall(150, () => {
            if (m.graphic) m.graphic.setAlpha(1)
          })
        }

        // Hit particles
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2
          const burst = this.add.graphics()
          burst.fillStyle(color, 1)
          burst.fillCircle(m.body.x, m.body.y, 4)

          this.tweens.add({
            targets: burst,
            x: m.body.x + Math.cos(angle) * Phaser.Math.Between(15, 40),
            y: m.body.y + Math.sin(angle) * Phaser.Math.Between(15, 40),
            alpha: 0,
            scaleX: 0.2,
            scaleY: 0.2,
            duration: Phaser.Math.Between(200, 500),
            onComplete: () => burst.destroy()
          })
        }

        // Safe kill
        if (m.hp <= 0) {
          this.killMonster(m, this.currentWeapon)
          return
        }

        // Safe floating text
        this.showFloatingText(
          m.body.x,
          m.body.y - 20,
          this.shieldActive ? '🗡️ Stealth Hit!' : '⚔️ Hit!',
          this.shieldActive ? '#00ffff' : '#ffaaaa'
        )
      }
    })

    if (!hit && this.currentWeapon === 'normal') {
      this.showFloatingText(this.player.x, this.player.y - 30, 'Miss!', '#888888')
    }
  }

  killMonster(m, deathType = this.currentWeapon) {
    if (!m || !m.alive) return

    m.alive = false

    const x = m.body ? m.body.x : (m.graphic ? m.graphic.x : 0)
    const y = m.body ? m.body.y : (m.graphic ? m.graphic.y : 0)

    // Stop hunter immediately
    if (m.walkTween) {
      m.walkTween.stop()
      m.walkTween = null
    }

    if (m.body) {
      m.body.setVelocity(0, 0)
      if (m.body.body) {
        m.body.body.enable = false
      }
    }

    // Remove active UI
    if (m.hpBar) {
      m.hpBar.destroy()
      m.hpBar = null
    }

    if (m.alert) {
      m.alert.destroy()
      m.alert = null
    }

    // Different death effect depending on chosen bird power
    this.playMonsterDeathEffect(x, y, deathType)

    // Tint/behavior before disappearing
    if (m.graphic) {
      if (deathType === 'fire') {
        m.graphic.setTint(0xff5500)
      } else if (deathType === 'bomb') {
        m.graphic.setTint(0x333333)
      } else if (deathType === 'lightning') {
        m.graphic.setTint(0xffff66)
      } else if (deathType === 'wind' || deathType === 'boomerang') {
        m.graphic.setTint(0x88ffee)
      }
    }

    // Mini skull appears right before disappearance
    this.time.delayedCall(350, () => {
      this.showDeathSkull(x, y)
    })

    // Hunter disappears after effect
    const fadeTargets = []
    if (m.graphic) fadeTargets.push(m.graphic)
    if (m.shadow) fadeTargets.push(m.shadow)

    if (fadeTargets.length > 0) {
      this.tweens.add({
        targets: fadeTargets,
        alpha: 0,
        duration: 650,
        delay: deathType === 'lightning' ? 120 : 0,
        onComplete: () => {
          if (m.graphic) { m.graphic.destroy(); m.graphic = null }
          if (m.shadow) { m.shadow.destroy(); m.shadow = null }
          if (m.body) { m.body.destroy(); m.body = null }
        }
      })
    } else {
      if (m.body) { m.body.destroy(); m.body = null }
    }

    this.score += 200

    this.showFloatingText(x, y - 24, '+200', '#ffffff')
  }

  showDeathSkull(x, y) {
    const skull = this.add.text(x, y - 28, '☠️', {
      fontSize: '22px',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(50)

    this.tweens.add({
      targets: skull,
      y: y - 55,
      alpha: 0,
      scaleX: 1.4,
      scaleY: 1.4,
      duration: 650,
      onComplete: () => skull.destroy()
    })
  }

  playMonsterDeathEffect(x, y, deathType) {
    if (deathType === 'fire') {
      // Ember: burning effect
      for (let i = 0; i < 14; i++) {
        const flame = this.add.graphics()
        flame.setPosition(
          x + Phaser.Math.Between(-16, 16),
          y + Phaser.Math.Between(-10, 18)
        )

        const color = Phaser.Math.Between(0, 1) === 0 ? 0xff4500 : 0xffaa00
        flame.fillStyle(color, 0.9)
        flame.fillCircle(0, 0, Phaser.Math.Between(4, 8))

        this.tweens.add({
          targets: flame,
          y: flame.y - Phaser.Math.Between(25, 45),
          alpha: 0,
          scaleX: 0.2,
          scaleY: 0.2,
          duration: Phaser.Math.Between(350, 650),
          onComplete: () => flame.destroy()
        })
      }

      return
    }

    if (deathType === 'bomb') {
      // Shade: bomb blast + smoke
      const blast = this.add.graphics()
      blast.setPosition(x, y)
      blast.fillStyle(0xff6600, 0.55)
      blast.fillCircle(0, 0, 18)

      this.tweens.add({
        targets: blast,
        scaleX: 4,
        scaleY: 4,
        alpha: 0,
        duration: 380,
        onComplete: () => blast.destroy()
      })

      for (let i = 0; i < 18; i++) {
        const smoke = this.add.graphics()
        smoke.setPosition(x, y)

        smoke.fillStyle(0x555555, 0.75)
        smoke.fillCircle(0, 0, Phaser.Math.Between(7, 13))

        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2)
        const dist = Phaser.Math.Between(25, 65)

        this.tweens.add({
          targets: smoke,
          x: x + Math.cos(angle) * dist,
          y: y + Math.sin(angle) * dist,
          alpha: 0,
          scaleX: 1.8,
          scaleY: 1.8,
          duration: Phaser.Math.Between(500, 850),
          onComplete: () => smoke.destroy()
        })
      }

      this.cameras.main.shake(180, 0.008)
      return
    }

    if (deathType === 'lightning') {
      // Volt: lightning strike appears over hunter before death
      const flash = this.add.graphics()
      flash.setPosition(x, y)
      flash.fillStyle(0xffffaa, 0.45)
      flash.fillCircle(0, 0, 34)

      this.tweens.add({
        targets: flash,
        scaleX: 2.2,
        scaleY: 2.2,
        alpha: 0,
        duration: 250,
        onComplete: () => flash.destroy()
      })

      if (this.textures.exists('lightning_strike')) {
        const strike = this.add.image(x, y - 35, 'lightning_strike')
          .setDepth(60)
          .setOrigin(0.5, 0.5)
          .setDisplaySize(70, 110)
          .setAlpha(0.95)

        this.tweens.add({
          targets: strike,
          alpha: 0,
          scaleX: 1.15,
          scaleY: 1.15,
          duration: 400,
          delay: 120,
          onComplete: () => strike.destroy()
        })
      }

      for (let i = 0; i < 8; i++) {
        const spark = this.add.graphics()
        spark.setPosition(x, y)
        spark.lineStyle(3, 0xffdd00, 1)

        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2)
        const len = Phaser.Math.Between(18, 34)

        spark.beginPath()
        spark.moveTo(0, 0)
        spark.lineTo(Math.cos(angle) * len, Math.sin(angle) * len)
        spark.strokePath()

        this.tweens.add({
          targets: spark,
          alpha: 0,
          scaleX: 1.4,
          scaleY: 1.4,
          duration: 260,
          onComplete: () => spark.destroy()
        })
      }

      this.cameras.main.shake(180, 0.006)
      return
    }

    if (deathType === 'wind' || deathType === 'boomerang') {
      // Gale: wind swirl
      const swirl = this.add.graphics()
      swirl.setPosition(x, y)
      swirl.lineStyle(4, 0x88ffee, 0.9)

      swirl.strokeCircle(0, 0, 12)
      swirl.strokeCircle(0, 0, 22)
      swirl.strokeCircle(0, 0, 32)

      this.tweens.add({
        targets: swirl,
        angle: 240,
        scaleX: 1.8,
        scaleY: 1.8,
        alpha: 0,
        duration: 500,
        onComplete: () => swirl.destroy()
      })

      return
    }

    // Default small smoke
    const smoke = this.add.graphics()
    smoke.setPosition(x, y)
    smoke.fillStyle(0x777777, 0.7)
    smoke.fillCircle(0, 0, 18)

    this.tweens.add({
      targets: smoke,
      scaleX: 2.5,
      scaleY: 2.5,
      alpha: 0,
      duration: 450,
      onComplete: () => smoke.destroy()
    })
  }

  freezeKillMonster(m) {
    if (!m || !m.alive || !m.body) return

    m.alive = false
    m.frozen = true

    const x = m.body.x
    const y = m.body.y

    if (m.walkTween) {
      m.walkTween.stop()
      m.walkTween = null
    }

    if (m.body) {
      m.body.setVelocity(0, 0)
      if (m.body.body) {
        m.body.body.enable = false
      }
    }

    if (m.graphic) {
      m.graphic.setTint(0x88ccff)
      m.graphic.setAlpha(0.85)
    }

    if (m.hpBar) {
      m.hpBar.destroy()
      m.hpBar = null
    }

    if (m.alert) {
      m.alert.destroy()
      m.alert = null
    }

    const ice = this.add.graphics()
    ice.setDepth(20)

    ice.setPosition(x, y)
    ice.fillStyle(0x99ddff, 0.25)
    ice.fillCircle(0, 0, 30)

    ice.lineStyle(4, 0x99eeff, 0.95)
    ice.strokeCircle(0, 0, 28)

    ice.lineStyle(2, 0xffffff, 0.8)
    ice.strokeCircle(0, 0, 20)

    ice.fillStyle(0xdffaff, 0.9)

    const spikes = [
      [0, -36], [26, -24], [36, 0], [24, 26],
      [0, 36], [-24, 26], [-36, 0], [-26, -24]
    ]

    spikes.forEach(([sx, sy]) => {
      ice.fillCircle(sx, sy, 4)
    })

    this.tweens.add({
      targets: ice,
      alpha: 0.65,
      duration: 700,
      yoyo: true,
      repeat: -1
    })

    m.iceGraphic = ice

    this.time.delayedCall(350, () => {
      this.showDeathSkull(x, y)
    })

    this.score += 200
    this.showFloatingText(
      x,
      y - 24,
      '❄️ Frozen Captured! +200',
      '#99eeff'
    )
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
      if (m.iceGraphic) { m.iceGraphic.destroy(); m.iceGraphic = null }
    })
    this.tweens.killAll()
    this.time.removeAllEvents()
    this.clearBlizzardVisuals()
    this.footprints.forEach(fp => fp.destroy())
    this.footprints = []
    this.physics.pause()
    this.input.keyboard.enabled = false
    this.dismissWildlifeCard()
    if (this.shieldActive) this.deactivateShield()
    if (this.playerShieldGfx) {
      this.playerShieldGfx.destroy()
      this.playerShieldGfx = null
    }
    if (this.terminal) this.terminal.destroy()
    this.saveScore()
    this.scene.stop('UIScene')

    // Build report data
    const reportData = {
      playerName: this.playerName,
      chosenBird: this.chosenBird,
      totalScore: this.score,
      saplingsCollected: this.eggsCollected,
      animalsRescued: (this.wildlifeJournal || []).length,
      monstersKilled: this.monsterList.filter(m => !m.alive).length,
      co2Absorbed: this.eggsCollected * 22,
      timeTaken: 200 - (this.timeLeft || 0),
      flashCards: [...(this.collectedFlashCards || [])],
      escaped: escaped
    }

    // OPEN FLASHCARD SCENE (report is shown afterwards, from goToReport())
    this.scene.launch('FlashcardScene2', {
      flashCards: reportData.flashCards,
      reportData: reportData
    })

    // Pause GameScene2 AFTER launching flashcards
    this.scene.pause('GameScene2')
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

  update(time, delta) {
    if (this.gameEnding) return

    // Check if player pressed any movement key to unfreeze animal notification
    const moveInput = (this.wasd && (this.wasd.left.isDown || this.wasd.right.isDown ||
                      this.wasd.up.isDown || this.wasd.down.isDown)) ||
                      (this.cursors && (this.cursors.left.isDown || this.cursors.right.isDown ||
                      this.cursors.up.isDown || this.cursors.down.isDown))

    if (this.animalNotificationFrozen) {
      const now = (this.time && this.time.now) ? this.time.now : Date.now()
      const elapsed = now - (this.cardFreezeTimestamp || 0)
      if (moveInput && elapsed > 250) {
        this.dismissWildlifeCard()
      } else {
        this.player.setVelocity(0, 0)
        this.monsterList.forEach(m => {
          if (m.body && m.body.active) m.body.setVelocity(0, 0)
        })
        return
      }
    }

    const frameDelta = (delta !== undefined && delta !== null) ? delta : (this.game && this.game.loop ? this.game.loop.delta : 16.6)
    const dt = (frameDelta > 0 && frameDelta < 500) ? (frameDelta / 1000) : (1 / 60)

    // ── Shield duration countdown (strictly temporary 10s) ──────
    if (this.shieldActive) {
      this.shieldTimeRemaining = Math.max(0, this.shieldTimeRemaining - dt)
      if (this.shieldTimeRemaining <= 0) {
        this.deactivateShield()
      }
    }

    this.updateWarmth(frameDelta)
    this.isRescuing = false
    this.maybePlayerFootprint()

    const speed = (this.evolutionStage >= 2 ? 190 : 140) * (this.warmth <= 0 ? 0.8 : 1)
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

    const nextX = this.player.x + (vx * 0.05)
    const nextY = this.player.y + (vy * 0.05)
    const hw = 14
    const leftTile = Math.floor((nextX - hw) / this.TILE)
    const rightTile = Math.floor((nextX + hw) / this.TILE)
    const topTile = Math.floor((nextY - hw) / this.TILE)
    const bottomTile = Math.floor((nextY + hw) / this.TILE)
    const curRow = Math.floor(this.player.y / this.TILE)
    const curCol = Math.floor(this.player.x / this.TILE)

    // Check all 3 vertical points along the left side
    if (vx < 0 && (this.isWall(leftTile, curRow) || this.isWall(leftTile, topTile) || this.isWall(leftTile, bottomTile))) {
      vx = 0
      this.player.x = Math.max(this.player.x, (leftTile + 1) * this.TILE + hw)
    }
    // Check all 3 vertical points along the right side
    if (vx > 0 && (this.isWall(rightTile, curRow) || this.isWall(rightTile, topTile) || this.isWall(rightTile, bottomTile))) {
      vx = 0
      this.player.x = Math.min(this.player.x, rightTile * this.TILE - hw)
    }
    // Check all 3 horizontal points along the top side
    if (vy < 0 && (this.isWall(curCol, topTile) || this.isWall(leftTile, topTile) || this.isWall(rightTile, topTile))) {
      vy = 0
      this.player.y = Math.max(this.player.y, (topTile + 1) * this.TILE + hw)
    }
    // Check all 3 horizontal points along the bottom side
    if (vy > 0 && (this.isWall(curCol, bottomTile) || this.isWall(leftTile, bottomTile) || this.isWall(rightTile, bottomTile))) {
      vy = 0
      this.player.y = Math.min(this.player.y, bottomTile * this.TILE - hw)
    }

    // Prevent diagonal corner-cutting into wall vertices
    if (vx !== 0 && vy !== 0) {
      const checkX = vx < 0 ? (this.player.x - hw + vx * 0.05) : (this.player.x + hw + vx * 0.05)
      const checkY = vy < 0 ? (this.player.y - hw + vy * 0.05) : (this.player.y + hw + vy * 0.05)
      const cCol = Math.floor(checkX / this.TILE)
      const cRow = Math.floor(checkY / this.TILE)
      if (this.isWall(cCol, cRow)) {
        const dx = Math.abs(checkX - (cCol * this.TILE + (vx > 0 ? 0 : this.TILE)))
        const dy = Math.abs(checkY - (cRow * this.TILE + (vy > 0 ? 0 : this.TILE)))
        if (dx > dy) vx = 0
        else vy = 0
      }
    }

    // Safety net: if player is ever inside a wall tile, smoothly push out to nearest open tile
    const checkCurC = Math.floor(this.player.x / this.TILE)
    const checkCurR = Math.floor(this.player.y / this.TILE)
    if (this.isWall(checkCurC, checkCurR)) {
      const neighbors = [
        { c: checkCurC, r: checkCurR - 1 }, { c: checkCurC, r: checkCurR + 1 },
        { c: checkCurC - 1, r: checkCurR }, { c: checkCurC + 1, r: checkCurR }
      ]
      const openTile = neighbors.find(n => !this.isWall(n.c, n.r))
      if (openTile) {
        this.player.setPosition(
          openTile.c * this.TILE + this.TILE / 2,
          openTile.r * this.TILE + this.TILE / 2
        )
      }
    }

    this.player.setVelocity(vx, vy)

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) this.useWeapon()

    // ── Hunter AI ──────────────────────────────────────────────
    this.monsterList.forEach(m => {
      if (!m.alive || !m.body || !m.body.active) return

      if (m.frozen) {
        this.drawMonster(m, m.body.x, m.body.y, true)
        this.drawHPBar(m.hpBar, m.body.x, m.body.y - 48, m.hp, m.maxHp)
        return
      }

      const mc = Math.floor(m.body.x / this.TILE)
      const mr = Math.floor(m.body.y / this.TILE)
      if (this.isWall(mc, mr)) {
        m.body.setPosition(m.spawnX, m.spawnY)
        m.body.setVelocity(0, 0); m.patrolTimer = 0
        this.drawMonster(m, m.body.x, m.body.y, false)
        this.drawHPBar(m.hpBar, m.body.x, m.body.y - 48, m.hp, m.maxHp)
        return
      }

      const distToPlayer = Phaser.Math.Distance.Between(this.player.x, this.player.y, m.body.x, m.body.y)
      const alerted = m.alertedUntil && this.time.now < m.alertedUntil
      const chaseRange = (m.alwaysChase || alerted) ? 9999 : (this.stealthMode || this.shieldActive) ? 0 : (this.evolutionStage >= 2 ? 110 : 140) * (this.blizzardActive ? 0.7 : 1)

      // Solid obstacles block enemy vision for tactical sneak evasion
      const hasLOS = this.hasLineOfSight(m.body.x, m.body.y, this.player.x, this.player.y)
      const canDetectPlayer = alerted || m.alwaysChase || (distToPlayer < chaseRange && hasLOS)

      // 🪤 Investigating a trapped animal takes priority over patrolling,
      // unless the player wanders close enough to draw the hunter's attention.
      if (m.state === 'investigate' && !canDetectPlayer) {
        const target = m.investigateTarget
        if (!target || target.rescued || target.lost) {
          m.state = null
          m.investigateTarget = null
        } else {
          m.alert.setVisible(true)
          m.alert.setPosition(m.body.x, m.body.y - 60)
          const angle = Phaser.Math.Angle.Between(m.body.x, m.body.y, target.x, target.y)
          const ms = 65
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
          m.graphic.setDisplaySize(58, 74)

          if (Phaser.Math.Distance.Between(m.body.x, m.body.y, target.x, target.y) < 34) {
            this.loseTrappedAnimal(target, 'hunter')
            m.state = null
            m.investigateTarget = null
          }

          this.maybeLayHunterFootprint(m)
          this.drawMonster(m, m.body.x, m.body.y, false)
          this.drawHPBar(m.hpBar, m.body.x, m.body.y - 48, m.hp, m.maxHp)
          return
        }
      }

      if (canDetectPlayer) {
        m.state = null
        m.investigateTarget = null
        m.chasing = true
        m.alert.setVisible(true)
        m.alert.setPosition(m.body.x, m.body.y - 60)
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
        m.graphic.setDisplaySize(58, 74)

        if (!this.shieldActive && distToPlayer < 36 && !this.playerHitCooldown) {
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
        m.graphic.setDisplaySize(58, 74)
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
          if (e.glow) {
            this.tweens.killTweensOf(e.glow)
            e.glow.destroy()
            e.glow = null
          }
        }
      }
    }

    this.maybeLayHunterFootprint(m)
    this.drawMonster(m, m.body.x, m.body.y, false)
    this.drawHPBar(m.hpBar, m.body.x, m.body.y - 48, m.hp, m.maxHp)
  })

  // ── Sapling collection ────────────────────────────────────────
  this.eggList.forEach(e => {
    if (e.collected || !e.graphic) return
    if (Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y) < 34) {
      e.collected = true
      e.graphic.destroy()
      e.graphic = null
      if (e.glow) {
        this.tweens.killTweensOf(e.glow)
        e.glow.destroy()
        e.glow = null
      }
      this.eggsCollected++
      // The sapling determines the flashcard, but the card is only
      // recorded here — it is NOT shown during gameplay anymore.
      // FlashcardScene2 opens once, after the game ends (see endGame()).
      if (e.card && !this.collectedFlashCards.includes(e.card)) {
        this.collectedFlashCards.push(e.card)
      }
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

  // ── Alarm traps ──────────────────────────────────────────────
  this.updateAlarmTraps()

  // ── Hunter camps ─────────────────────────────────────────────
  this.updateHunterCamps()

  // ── Wildlife wander + flee + collection ────────────────────────
  if (this.wildlifeList) {

  this.wildlifeList.forEach(w => {
      // 🪤 Trapped / rescued / escorting animals run on their own logic
      // and skip the normal wander-and-collect behaviour entirely.
      if (w.lost || w.done) return
      if (w.trapped || w.escorting) {
        this.updateTrappedAnimal(w, delta)
        return
      }

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

      // ❄️ Cold tint while huddling in a blizzard (fleeing overrides it)
      if (this.blizzardActive && !w.fleeing) {
        w.graphic.setTint(0x99ccff)
      } else {
        w.graphic.clearTint()
      }

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
        } else if (this.blizzardActive && w.shelterCol != null) {
          // Blizzard AI: head for the nearest sheltered tile and huddle there
          const curCol = Math.round((w.x - this.TILE / 2) / this.TILE)
          const curRow = Math.round((w.y - this.TILE / 2) / this.TILE)
          if (curCol !== w.shelterCol || curRow !== w.shelterRow) {
            if (Math.abs(w.shelterCol - curCol) >= Math.abs(w.shelterRow - curRow)) {
              dc = Math.sign(w.shelterCol - curCol)
            } else {
              dr = Math.sign(w.shelterRow - curRow)
            }
          }
          // already at shelter — dc/dr stay 0, animal huddles in place
        } else if (this.blizzardActive) {
          // no shelter nearby — just hunker down where it is
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
      if (w.moving) this.maybeLayAnimalFootprint(w)
    })
  }

  // ── Shield pickup ─────────────────────────────────────────────
  if (this.shieldList) {
    this.shieldList.forEach(s => {
      if (s.collected) return
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, s.x, s.y
      )
      if (dist < 32) {
        s.collected = true
        if (s.bg) s.bg.destroy()
        if (s.ring) s.ring.destroy()
        if (s.icon) s.icon.destroy()
        if (s.label) s.label.destroy()
        this.activateShield(10)
      }
    })
  }

  // ── Shield protective aura update ─────────────────────────────
  if (this.shieldActive && this.playerShieldGfx && this.player && this.player.active) {
    this.playerShieldGfx.clear()
    const pulse = 0.5 + Math.sin(Date.now() / 250) * 0.25
    this.playerShieldGfx.lineStyle(2, 0x00e5ff, pulse)
    this.playerShieldGfx.strokeCircle(this.player.x, this.player.y, 24)
    this.playerShieldGfx.fillStyle(0x00e5ff, 0.12 * pulse)
    this.playerShieldGfx.fillCircle(this.player.x, this.player.y, 24)
  }

  // ── Portal check ────────────────────────────────────────────
  const px = this.portalCol * this.TILE + this.TILE / 2
  const py = this.portalRow * this.TILE + this.TILE / 2
  if (Phaser.Math.Distance.Between(this.player.x, this.player.y, px, py) < 38) this.endGame(true)
  if (this.timeLeft < 0) this.endGame(false)

  this.portalAngle += 0.035
  this.drawPortal()

  this.bobTimer += 1
  const baseSize = this.playerBaseSize || 52
  if (this.isMoving) {
    this.player.setDisplaySize(
      this.bobTimer > 8 ? baseSize + 3 : baseSize - 2,
      this.bobTimer > 8 ? baseSize - 3 : baseSize + 3
    )
    if (this.bobTimer > 15) this.bobTimer = 0
  } else {
    this.player.setDisplaySize(baseSize, baseSize)
  }
}
}
