import Phaser from 'phaser'
import { Terminal } from '../ui/Terminal.js'
export class GameScene extends Phaser.Scene {
  constructor() { super('GameScene') }
  init(data) {
    this.monstersKilled = 0
    this.animalsRescued = 0
    this.saplingScore = 0
    this.collectedFlashCards = []
    this.playerName = data.playerName || 'Adventurer'
    this.chosenBird = data.chosenBird || 'Ember'
    this.score = 0
    this.eggsCollected = 0
    this.animalsSaved = 0
    this.evolutionStage = 1
    this.goldenEggs = 0
    this.isAttacking = false
    this.playerDir = 'right'
    this.timeLeft = 180
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
    this.frozenMonsters = new Set()
    this.playerHP = 5
    this.maxHP = 5
    this.HEART_REVIVE_COST = 100
    this.firstHitNotified = false
    this.emergencyReviving = false
    this.animalNotificationFrozen = false
    this.cardFreezeTimestamp = 0
    this.shieldActive = false
    this.shieldTimeRemaining = 0
    this.shieldTimerEvent = null
    this.playerShieldGfx = null
    this.terminalOpen = false
    this.stealthMode = false
    this.gameEnding = false
    this.weaponList = []
    this.isPaused = false
    this.pauseMenuContainer = null
  }

  preload() {
    if (!this.textures.exists('heart')) {
      this.load.image('heart', 'resource/heart.png')
    }
  }

  create() {
    this.TILE = 48
    this.mapData = this.parseMap()

    const birdSpriteMap = {
      Ember: 'ember',
      Frost: 'frost',
      Volt: 'volt',
      Shade: 'shade',
      Gale: 'gale'
    }

    this.playerSpriteKey = birdSpriteMap[this.chosenBird] || 'ember'

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
    this.drawWorld()
    this.weaponList = []
    this.eggList = []
    this.spawnEggs()
    this.monsterList = []
    this.spawnMonsters()
    this.animalList = []
    this.spawnAnimals()
    this.heartShrines = []
    this.spawnHeartShrines()
    this.shieldList = []
    this.spawnShields()

    this.portalGfx = this.add.graphics()
    this.portalAngle = 0
    this.portalCol = 1
    this.portalRow = 47
    this.drawPortal()
    this.player = this.physics.add.sprite(
      1 * this.TILE + this.TILE / 2,
      1 * this.TILE + this.TILE / 2,
      `${this.playerSpriteKey}_right`
    )
    const playerSize = (this.chosenBird === 'Ember') ? this.TILE : (this.TILE + 8)
    this.player.setDisplaySize(playerSize, playerSize)
    this.player.setCollideWorldBounds(true)
    this.player.body.setSize(28, 28)
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)
    this.input.keyboard.enabled = true
    this.input.keyboard.enableGlobalCapture()
    this.input.on('pointerdown', () => {
      this.input.keyboard.focus()
    })
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    })
    this.cursors = this.input.keyboard.createCursorKeys()
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    )
    this.collectKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.E
    )
    this.reviveKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.H
    )
    this.reviveKey.on('down', () => this.reviveHeart())
    this.input.keyboard.on('keydown-H', () => this.reviveHeart())

    this.escKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    )
    this.escKey.on('down', () => this.togglePauseMenu())

    // 💖 Eye-catching top notification banner for Heart Shrine
    const notifW = 540
    const notifH = 38
    const notifX = this.scale.width / 2
    const notifY = 72

    this.heartNotificationContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(600).setVisible(false)
    const notifBg = this.add.graphics()
    notifBg.fillStyle(0x061e12, 0.92)
    notifBg.fillRoundedRect(notifX - notifW / 2, notifY - notifH / 2, notifW, notifH, 10)
    notifBg.lineStyle(2, 0x00ff88, 0.9)
    notifBg.strokeRoundedRect(notifX - notifW / 2, notifY - notifH / 2, notifW, notifH, 10)

    const notifText = this.add.text(
      notifX, notifY,
      '💖 HEART SHRINE REACHED! Press [H] to Revive (+1 Heart / -100 Score)',
      {
        fontSize: '13px',
        fontFamily: 'Arial Black',
        color: '#aaffaa',
        stroke: '#000000',
        strokeThickness: 3
      }
    ).setOrigin(0.5)

    this.heartNotificationContainer.add([notifBg, notifText])

    this.activeWildlifeCard = null
    this.time.addEvent({
      delay: 1000,
      callback: () => { if (!this.animalNotificationFrozen && !this.isPaused && this.timeLeft > 0) this.timeLeft-- },
      repeat: 180
    })
    this.scene.launch('UIScene', { gameScene: this })
    // Terminal setup
    this.terminal = new Terminal(this)
    this.input.keyboard.on('keydown-TILDE', () => {
      this.terminal.toggle()
    })
    this.input.keyboard.on('keydown-BACKTICK', () => {
      this.terminal.toggle()
    })
    this.events.once('shutdown', () => {
      if (this.terminal) {
        this.terminal.destroy()
        this.terminal = null
      }
      if (this.pauseMenuContainer) {
        this.pauseMenuContainer.destroy()
        this.pauseMenuContainer = null
      }
      if (this.heartNotificationContainer) {
        this.heartNotificationContainer.destroy()
        this.heartNotificationContainer = null
      }
    })
  }
  parseMap() {
    const rows = 50
    const cols = 50

    // 1 = tree, 5 = sand/path, 6 = stump
    const raw = Array.from({ length: rows }, () => Array(cols).fill(1))

    const inBounds = (c, r) =>
      c > 0 && c < cols - 1 && r > 0 && r < rows - 1

    const carveCell = (c, r, tile = 5) => {
      if (inBounds(c, r)) raw[r][c] = tile
    }

    const carveLine = (from, to, tile = 5) => {
      const [c1, r1] = from
      const [c2, r2] = to

      if (c1 !== c2) {
        const step = c2 > c1 ? 1 : -1
        for (let c = c1; c !== c2 + step; c += step) {
          carveCell(c, r1, tile)
        }
      }

      if (r1 !== r2) {
        const step = r2 > r1 ? 1 : -1
        for (let r = r1; r !== r2 + step; r += step) {
          carveCell(c2, r, tile)
        }
      }
    }

    const carvePath = (points, tile = 5) => {
      for (let i = 0; i < points.length - 1; i++) {
        carveLine(points[i], points[i + 1], tile)
      }
    }

    const placeStump = (c, r) => {
      if (inBounds(c, r) && raw[r][c] === 1) raw[r][c] = 6
    }

    const placeStumpCluster = (spots) => {
      spots.forEach(([c, r]) => placeStump(c, r))
    }

    // ONE-TILE MAIN LANE
    // This route touches the important item/monster positions.
    carvePath([
      [1, 1], [6, 1],
      [6, 3], [3, 3],
      [3, 6], [5, 6],
      [5, 9], [11, 9],
      [11, 12], [19, 12],
      [19, 15], [15, 15],
      [21, 15], [29, 15],
      [29, 18], [37, 18],
      [37, 21], [33, 21],
      [33, 24], [28, 24],
      [28, 26], [25, 26],
      [25, 28], [21, 28],
      [21, 30], [18, 30],
      [18, 32], [15, 32],
      [15, 34], [11, 34],
      [11, 37], [8, 37],
      [8, 40], [5, 40],
      [5, 43], [3, 43],
      [3, 47], [1, 47]
    ])

    // Bottom final route / golden sapling route
    carvePath([
      [3, 47], [10, 47],
      [10, 44], [16, 44],
      [16, 47], [23, 47],
      [23, 44], [30, 44],
      [30, 47], [37, 47],
      [37, 44], [44, 44],
      [44, 47]
    ])

    // ZONE 1: North-East Bandit Outpost & Labyrinth (Heavy enemy den with Heart 1)
    carvePath([[21, 15], [21, 10], [30, 10], [30, 5], [42, 5], [42, 10], [45, 10], [45, 14], [37, 14], [37, 18]])
    carvePath([[34, 5], [34, 10], [40, 10]])
    carvePath([[38, 8], [42, 8]])
    carvePath([[26, 10], [26, 6], [30, 6]])
    carveCell(40, 8)
    carveCell(40, 7)
    carveCell(41, 8)

    // ZONE 2: Central Sunken Marshlands & Labyrinth (Heavy enemy den with Heart 2)
    carvePath([[37, 18], [44, 18], [44, 24], [38, 24]])
    carvePath([[33, 24], [43, 24], [43, 33], [34, 33], [34, 28], [28, 28]])
    carvePath([[38, 24], [38, 33]])
    carvePath([[40, 28], [43, 28]])
    carvePath([[30, 24], [30, 30], [35, 30]])
    carveCell(41, 28)
    carveCell(42, 28)
    carveCell(41, 29)

    // ZONE 3: South-Central Shadow Grotto & Ravine (Heavy enemy den with Heart 3)
    carvePath([[25, 28], [30, 33], [25, 37], [18, 37]])
    carvePath([[15, 34], [15, 39], [25, 39], [25, 43], [30, 43], [30, 47]])
    carvePath([[20, 39], [20, 44], [25, 44]])
    carvePath([[23, 41], [27, 41]])
    carvePath([[18, 37], [18, 41], [23, 41]])
    carveCell(25, 41)
    carveCell(26, 41)
    carveCell(25, 42)

    // Other narrow branches & shortcuts
    carvePath([[11, 9], [15, 9]])
    carvePath([[7, 7], [15, 7], [15, 9]])
    carvePath([[15, 34], [15, 39], [12, 39]])
    carvePath([[5, 40], [2, 40], [2, 44]])

    // Force important positions to stay sand, but only ONE tile each
    const importantSpots = [
      [1, 1], [3, 3], [5, 6], [5, 9], [11, 9],
      [19, 12], [15, 15], [29, 15], [37, 18],
      [33, 21], [28, 26], [25, 28], [21, 30],
      [18, 32], [15, 34], [44, 47],

      // Heart spots in enemy dens
      [40, 8], [41, 28], [25, 41],

      // shields & weapons
      [7, 7], [30, 18], [12, 38], [15, 9], [21, 15], [37, 18],

      // portal
      [1, 47]
    ]

    importantSpots.forEach(([c, r]) => carveCell(c, r))

    // Stumps replace the "wide empty path" feeling.
    // They are inside forest spaces, not on the lane.
    placeStumpCluster([
      [8, 2], [10, 2], [13, 2], [17, 4], [19, 4],
      [4, 5], [7, 5], [9, 6], [13, 7], [17, 8],
      [8, 10], [13, 11], [16, 13], [22, 13], [27, 14],
      [31, 16], [35, 17], [39, 19], [42, 20],
      [30, 22], [36, 23], [43, 25], [39, 27],
      [27, 29], [23, 31], [19, 33], [13, 36],
      [9, 38], [6, 42], [4, 45], [12, 45],
      [19, 46], [27, 46], [34, 45], [40, 46]
    ])

    // Extra tree blocks near open-looking areas, so the lane stays narrow
    const extraTrees = [
      [4, 2], [5, 2], [8, 1], [8, 3],
      [4, 8], [6, 8], [10, 8], [12, 8],
      [18, 14], [20, 14], [22, 16], [28, 16],
      [36, 19], [38, 19], [36, 22], [32, 23],
      [24, 27], [26, 27], [20, 29], [22, 29],
      [17, 31], [19, 31], [14, 33], [16, 33],
      [10, 36], [12, 36], [7, 39], [9, 39],
      [4, 41], [6, 41], [2, 46], [4, 46]
    ]

    extraTrees.forEach(([c, r]) => {
      if (inBounds(c, r) && raw[r][c] === 5) raw[r][c] = 1
    })

    return raw
  }
  drawWorld() {
    for (let row = 0; row < this.mapRows; row++) {
      for (let col = 0; col < this.mapCols; col++) {
        const t = this.mapData[row][col]
        const x = col * this.TILE
        const y = row * this.TILE
        let key = 'grass'
        if (t === 1) key = 'tree'
        if (t === 2) key = 'water'
        if (t === 3) key = 'wall'
        if (t === 4) key = 'earth'
        if (t === 5) key = 'sand'
        if (t === 6) key = 'stump'
        this.add.image(x, y, key)
          .setOrigin(0)
          .setDisplaySize(this.TILE, this.TILE)
      }
    }
  }
  isWall(col, row) {
    if (row < 0 || row >= this.mapRows) return true
    if (col < 0 || col >= this.mapCols) return true
    const t = this.mapData[row][col]
    return t === 1 || t === 2 || t === 6
  }
  spawnEggs() {
    const positions = [

      { col: 3, row: 3, type: 'fire' },
      { col: 5, row: 6, type: 'normal' },
      { col: 5, row: 9, type: 'thunder' },
      { col: 11, row: 9, type: 'normal' },
      { col: 19, row: 12, type: 'fire' },
      { col: 15, row: 15, type: 'normal' },
      { col: 29, row: 15, type: 'thunder' },
      { col: 37, row: 18, type: 'normal' },
      { col: 33, row: 21, type: 'fire' },
      { col: 28, row: 26, type: 'normal' },
      { col: 25, row: 28, type: 'golden' },
      { col: 21, row: 30, type: 'thunder' },
      { col: 18, row: 32, type: 'normal' },
      { col: 15, row: 34, type: 'fire' },
      { col: 44, row: 47, type: 'golden' },
    ]

    positions.forEach(e => {
      const x = e.col * this.TILE + this.TILE / 2
      const y = e.row * this.TILE + this.TILE / 2
      if (this.isWall(e.col, e.row)) return

      let saplingKey = 'sapling_1'
      let glow = null

      if (e.type === 'normal') saplingKey = 'sapling_1'
      if (e.type === 'fire') saplingKey = 'sapling_2'
      if (e.type === 'thunder') saplingKey = 'sapling_3'
      if (e.type === 'golden') saplingKey = 'sapling_3'

      const sapling = this.add.image(x, y, saplingKey)
        .setOrigin(0.5)
        .setDisplaySize(this.TILE * 0.65, this.TILE * 0.65)

      // Glow for special saplings
      if (e.type !== 'normal') {
        const glowColor =
          e.type === 'fire' ? 0xFF4500 :
            e.type === 'thunder' ? 0xFFD700 :
              0xFFD700

        glow = this.add.circle(x, y, 18, glowColor, 0.2)

        this.tweens.add({
          targets: glow,
          scaleX: 2,
          scaleY: 2,
          alpha: 0,
          duration: 1000,
          repeat: -1
        })
      }

      // Gentle bounce animation
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
        collected: false
      })
    })
  }
  spawnMonsters() {
    const positions = [
      // Main patrol hunters
      { col: 6, row: 1 },
      { col: 5, row: 9 },
      { col: 11, row: 9 },
      { col: 19, row: 12 },
      { col: 29, row: 15 },
      { col: 37, row: 18 },
      { col: 33, row: 21 },
      { col: 25, row: 28 },
      { col: 18, row: 32 },

      // Den 1: North-East Outpost (Guarding Heart at 40, 8)
      { col: 38, row: 6 },
      { col: 42, row: 8 },
      { col: 40, row: 10 },

      // Den 2: Central Marshlands (Guarding Heart at 41, 28)
      { col: 38, row: 26 },
      { col: 43, row: 26 },
      { col: 41, row: 31 },

      // Den 3: South-Central Shadow Grotto (Guarding Heart at 25, 41)
      { col: 20, row: 39 },
      { col: 25, row: 43 },
      { col: 26, row: 40 },
    ]

    positions.forEach((m) => {
      if (this.isWall(m.col, m.row)) return

      const x = m.col * this.TILE + this.TILE / 2
      const y = m.row * this.TILE + this.TILE / 2

      const body = this.physics.add.sprite(x, y, 'hunter_right')
        .setDisplaySize(this.TILE * 1.25, this.TILE * 1.25)
        .setDepth(10)

      body.body.setSize(28, 32)
      body.setCollideWorldBounds(true)
      body.setVelocity(60, 0)

      const hpBar = this.add.graphics()
      this.drawHPBar(hpBar, x, y - 28, 2, 2)

      const alert = this.add.text(x, y - 40, '❗', {
        fontSize: '16px'
      }).setOrigin(0.5).setVisible(false)

      this.monsterList.push({

        body,
        hpBar,
        alert,

        hp: 2,
        maxHp: 2,
        alive: true,
        chasing: false,
        patrolTimer: 0,
        frozen: false,
        alwaysChase: false,
        hacked: false,
        spawnX: x,
        spawnY: y
      })
    })
  }

  spawnAnimals() {
    const animals = [
      { col: 4, row: 4, type: 'deer', species: 'Spotted Deer', fact: 'Spotted deer form close-knit herds and alert other forest wildlife to predators.' },
      { col: 13, row: 9, type: 'deer', species: 'Hog Deer', fact: 'Hog deer run through brush with heads held low, vital for forest undergrowth seed dispersal.' },
      { col: 20, row: 12, type: 'deer', species: 'Sambar Deer', fact: 'Sambar deer are the largest deer species in tropical Asia and strong swimmers.' },
      { col: 34, row: 21, type: 'deer', species: 'Barking Deer', fact: 'Also called Muntjacs, their distinctive bark warns the canopy of approaching danger.' },
      { col: 18, row: 32, type: 'deer', species: 'Spotted Deer', fact: 'Their spotted coats remain into adulthood, providing dappled woodland camouflage.' },
      { col: 10, row: 37, type: 'deer', species: 'Musk Deer', fact: 'Solitary forest dwellers that play a crucial role in sub-alpine plant pollination.' },

      { col: 27, row: 15, type: 'rhino', species: 'Javan Rhinoceros', fact: 'One of the rarest large mammals on Earth, with fewer than 80 individuals surviving.' },
      { col: 36, row: 18, type: 'rhino', species: 'Indian Rhinoceros', fact: 'Also known as the Greater One-Horned Rhino, their armor-like skin shields them in dense brush.' },
      { col: 29, row: 24, type: 'rhino', species: 'Sumatran Rhinoceros', fact: 'The smallest and hairiest living rhino species, critically endangered by habitat fragmentation.' },
      { col: 24, row: 28, type: 'rhino', species: 'Black Rhinoceros', fact: 'Browsers with prehensile upper lips that shape thorny thicket ecosystems.' },
      { col: 42, row: 44, type: 'rhino', species: 'White Rhinoceros', fact: 'Megaherbivores whose heavy grazing creates natural firebreaks across grasslands.' }
    ]

    animals.forEach(a => {
      if (this.isWall(a.col, a.row)) return

      const x = a.col * this.TILE + this.TILE / 2
      const y = a.row * this.TILE + this.TILE / 2

      const startKey = a.type === 'deer' ? 'deer_front_1' : 'rhino_front_1'

      const body = this.physics.add.sprite(x, y, startKey)
        .setOrigin(0.5)
        .setDepth(9)

      if (a.type === 'deer') {
        body.setDisplaySize(this.TILE * 1.05, this.TILE * 1.05)
        body.body.setSize(34, 34)
      } else {
        body.setDisplaySize(this.TILE * 1.3, this.TILE * 1.3)
        body.body.setSize(38, 34)
      }

      body.setCollideWorldBounds(true)

      const cage = this.add.graphics()
      cage.setDepth(8)
      cage.lineStyle(2, 0xffcc66, 0.75)
      cage.strokeCircle(x, y, 25)

      const prompt = this.add.text(x, y - (a.type === 'rhino' ? 44 : 36), 'Press E', {
        fontSize: '10px',
        fontFamily: 'Arial Black',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5).setDepth(15).setVisible(false)

      this.animalList.push({
        type: a.type,
        species: a.species,
        fact: a.fact,
        body,
        cage,
        prompt,
        rescued: false,
        leaving: false,
        roamTimer: 0,
        frameTimer: 0,
        frameIndex: 1,
        dir: 'front'
      })
    })
  }
  setAnimalTexture(animal, vx, vy, delta = 16) {
    if (!animal || !animal.body || !animal.body.active) return

    const speed = Math.abs(vx) + Math.abs(vy)

    // Decide direction from movement
    if (speed > 2) {
      if (Math.abs(vx) > Math.abs(vy)) {
        animal.dir = vx >= 0 ? 'right' : 'left'
      } else {
        animal.dir = vy >= 0 ? 'front' : 'back'
      }
    }

    // Standing still = first frame only
    if (speed <= 2) {
      animal.frameIndex = 1
      animal.frameTimer = 0
    } else {
      animal.frameTimer = (animal.frameTimer || 0) + delta

      // Lower number = faster leg movement
      if (animal.frameTimer > 140) {
        animal.frameTimer = 0
        animal.frameIndex = animal.frameIndex === 1 ? 2 : 1
      }
    }

    let key = ''

    // Deer rule:
    // front/back have 2 frames.
    // left/right have only 1 frame.
    if (animal.type === 'deer') {
      if (animal.dir === 'left') {
        key = 'deer_left_1'
      } else if (animal.dir === 'right') {
        key = 'deer_right_1'
      } else {
        key = `deer_${animal.dir}_${animal.frameIndex}`
      }
    }

    // Rhino has 2 frames for every direction.
    if (animal.type === 'rhino') {
      key = `rhino_${animal.dir}_${animal.frameIndex}`
    }

    if (this.textures.exists(key)) {
      animal.body.setTexture(key)
    }
  }


  animateAnimalWalk(animal) {
    if (!animal || !animal.body || !animal.body.active) return

    const vx = animal.body.body.velocity.x
    const vy = animal.body.body.velocity.y
    const speed = Math.abs(vx) + Math.abs(vy)

    const baseSize = animal.type === 'rhino'
      ? this.TILE * 1.3
      : this.TILE * 1.05

    if (speed <= 2) {
      animal.walkTimer = 0
      animal.body.setAngle(0)
      animal.body.setDisplaySize(baseSize, baseSize)
      return
    }

    animal.walkTimer = (animal.walkTimer || 0) + 0.22

    const step = Math.sin(animal.walkTimer)
    const bounce = Math.abs(step)

    // Deer left/right has only 1 PNG, so wobble makes it feel alive.
    // Rhino also gets a tiny body bounce so it does not look like sliding.
    animal.body.setAngle(step * 2.5)
    animal.body.setDisplaySize(
      baseSize + bounce * 2,
      baseSize - bounce * 2
    )
  }
  updateAnimals(delta) {
    if (!this.animalList) return

    this.animalList.forEach(animal => {
      if (!animal.body || !animal.body.active) return

      if (animal.leaving) {
        this.setAnimalTexture(
          animal,
          animal.body.body.velocity.x,
          animal.body.body.velocity.y,
          delta
        )
        this.animateAnimalWalk(animal)
        return
      }

      if (animal.rescued) return

      // Keep cage around animal
      if (animal.cage) {
        animal.cage.clear()
        animal.cage.lineStyle(2, 0xffcc66, 0.75)
        animal.cage.strokeCircle(animal.body.x, animal.body.y, 25)
      }

      animal.roamTimer++

      if (animal.roamTimer > 60) {
        animal.roamTimer = 0

        const col = Math.floor(animal.body.x / this.TILE)
        const row = Math.floor(animal.body.y / this.TILE)

        const possibleDirs = [
          { vx: 45, vy: 0, dc: 1, dr: 0 },
          { vx: -45, vy: 0, dc: -1, dr: 0 },
          { vx: 0, vy: 45, dc: 0, dr: 1 },
          { vx: 0, vy: -45, dc: 0, dr: -1 },
        ]

        const safeDirs = possibleDirs.filter(d =>
          !this.isWall(col + d.dc, row + d.dr)
        )

        const dir = safeDirs[Phaser.Math.Between(0, safeDirs.length - 1)]

        animal.body.setVelocity(dir.vx, dir.vy)
        this.setAnimalTexture(animal, dir.vx, dir.vy)
      }
    })
  }

  checkAnimalRescue() {
    if (!this.animalList) return

    this.animalList.forEach(animal => {
      if (animal.rescued || animal.leaving) {
        if (animal.prompt && animal.prompt.visible) animal.prompt.setVisible(false)
        return
      }
      if (!animal.body || !animal.body.active) {
        if (animal.prompt && animal.prompt.visible) animal.prompt.setVisible(false)
        return
      }

      const dist = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        animal.body.x,
        animal.body.y
      )

      const canSave = dist < 55

      if (animal.prompt) {
        animal.prompt.setVisible(canSave)
        animal.prompt.setPosition(
          animal.body.x,
          animal.body.y - (animal.type === 'rhino' ? 44 : 36)
        )
      }

      if (canSave && Phaser.Input.Keyboard.JustDown(this.collectKey)) {
        this.releaseAnimal(animal)
      }
    })
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
    this.cardFreezeTimestamp = this.time ? this.time.now : Date.now()
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

    const total = this.animalList ? this.animalList.length : 11
    const counter = this.add.text(width / 2, height / 2 + 45, `Journal: ${this.animalsSaved} / ${total} species`, {
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

  releaseAnimal(animal) {
    if (!animal || animal.rescued || animal.leaving) return

    animal.rescued = true
    animal.leaving = true

    if (animal.prompt) {
      animal.prompt.destroy()
      animal.prompt = null
    }

    this.animalsSaved++
    this.animalsRescued = this.animalsSaved
    const rescueScore = animal.type === 'rhino' ? 200 : 100
    this.score += rescueScore

    if (animal.cage) {
      animal.cage.destroy()
      animal.cage = null
    }

    const speciesName = animal.species || (animal.type === 'rhino' ? 'Javan Rhinoceros' : 'Spotted Deer')
    const factText = animal.fact || ''

    this.showWildlifeCard(speciesName, factText)

    this.showFloatingText(
      animal.body.x,
      animal.body.y - 30,
      `🐾 ${speciesName} Saved! +${rescueScore}`,
      '#aaffaa'
    )

    // Animal walks away from player and leaves scene
    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      animal.body.x,
      animal.body.y
    )

    const leaveSpeed = animal.type === 'rhino' ? 120 : 150

    animal.body.setVelocity(
      Math.cos(angle) * leaveSpeed,
      Math.sin(angle) * leaveSpeed
    )

    animal.body.setDepth(12)

    this.setAnimalTexture(
      animal,
      animal.body.body.velocity.x,
      animal.body.body.velocity.y
    )

    this.tweens.add({
      targets: animal.body,
      alpha: 0,
      duration: 1600,
      delay: 700,
      onComplete: () => {
        if (animal.body) {
          animal.body.destroy()
          animal.body = null
        }
      }
    })
  }
  setHunterDirection(m, vx, vy) {
    if (!m || !m.body || !m.body.active) return

    if (Math.abs(vx) > Math.abs(vy)) {
      if (vx > 0) {
        m.body.setTexture('hunter_right')
      } else if (vx < 0) {
        m.body.setTexture('hunter_left')
      }
    } else {
      if (vy > 0) {
        m.body.setTexture('hunter_front')
      } else if (vy < 0) {
        m.body.setTexture('hunter_back')
      }
    }

    if (m.frozen) {
      m.body.setTint(0x88ccff)
    } else {
      m.body.clearTint()
    }
  }
  animateHunterWalk(m, delta) {
    if (!m || !m.body || !m.body.active) return

    const baseSize = this.TILE * 1.25
    const velocityX = m.body.body.velocity.x
    const velocityY = m.body.body.velocity.y
    const speed = Math.abs(velocityX) + Math.abs(velocityY)

    if (m.frozen || (m.stunnedUntil && this.time.now < m.stunnedUntil) || speed < 5) {
      m.walkTimer = 0
      m.body.setAngle(0)
      m.body.setDisplaySize(baseSize, baseSize)
      return
    }

    m.walkTimer = (m.walkTimer || 0) + delta * 0.018

    const step = Math.sin(m.walkTimer)
    const bounce = Math.abs(step)

    m.body.setAngle(step * 3)
    m.body.setDisplaySize(
      baseSize + bounce * 3,
      baseSize - bounce * 2
    )
  }
  spawnShields() {
    const candidateShieldSpots = [
      { col: 5, row: 6 },
      { col: 30, row: 18 },
      { col: 11, row: 37 },
      { col: 5, row: 9 },
      { col: 21, row: 15 },
      { col: 37, row: 18 },
      { col: 33, row: 21 },
      { col: 18, row: 30 },
      { col: 8, row: 37 },
      { col: 5, row: 40 },
      { col: 23, row: 47 },
      { col: 11, row: 34 },
      { col: 44, row: 24 },
      { col: 30, row: 10 },
      { col: 29, row: 15 },
      { col: 25, row: 26 },
      { col: 15, row: 32 }
    ]

    const chosenHeartKeys = new Set(this.chosenHeartLocations || [])
    const validSpots = candidateShieldSpots.filter(s => !this.isWall(s.col, s.row) && !chosenHeartKeys.has(`${s.col},${s.row}`))
    Phaser.Utils.Array.Shuffle(validSpots)
    const selectedSpots = validSpots.slice(0, 3)

    this.shieldList = []

    selectedSpots.forEach(s => {
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
      this.playerShieldGfx = this.add.graphics().setDepth(15)
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
      '🛡️ Shield Expired',
      '#88bbcc'
    )
  }

  drawHPBar(g, x, y, hp, maxHp) {
    g.clear()
    g.fillStyle(0x440000, 1)
    g.fillRect(-16, 0, 32, 5)
    g.fillStyle(hp > 1 ? 0xff4444 : 0xff0000, 1)
    g.fillRect(-16, 0, (hp / maxHp) * 32, 5)
    g.setPosition(x, y)
  }
  drawPortal() {
    this.portalGfx.clear()
    const x = this.portalCol * this.TILE + this.TILE / 2
    const y = this.portalRow * this.TILE + this.TILE / 2
    const a = this.portalAngle
    this.portalGfx.lineStyle(5, 0x7F77DD, 0.25)
    this.portalGfx.strokeCircle(x, y, 30)
    this.portalGfx.lineStyle(3, 0xAA99FF, 0.5)
    this.portalGfx.strokeCircle(x, y, 22)
    for (let i = 0; i < 4; i++) {
      const angle = a + (i * Math.PI / 2)
      this.portalGfx.fillStyle(0xffffff, 0.9)
      this.portalGfx.fillCircle(
        x + Math.cos(angle) * 22,
        y + Math.sin(angle) * 22, 3
      )
    }
    this.portalGfx.fillStyle(0x7F77DD, 0.5)
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

      this.showFloatingText(
        this.player.x, this.player.y - 40,
        '🔥 STAGE 3 — OVERPOWERED! +1 Heart', '#FF6B2B'
      )
    } else if (this.goldenEggs >= 1 && this.evolutionStage < 2) {
      this.evolutionStage = 2
      this.showFloatingText(
        this.player.x, this.player.y - 40,
        '✨ EVOLVED TO STAGE 2!', '#FFD700'
      )
    }
  }

  spawnHeartShrines() {
    const candidateShrineSpots = [
      { col: 40, row: 8, name: 'North Outpost Heart' },
      { col: 41, row: 28, name: 'Central Marsh Heart' },
      { col: 25, row: 41, name: 'Shadow Grotto Heart' },
      { col: 19, row: 12, name: 'North Trail Heart' },
      { col: 34, row: 10, name: 'Highlands Heart' },
      { col: 38, row: 30, name: 'Deep Marsh Heart' },
      { col: 20, row: 42, name: 'South Ravine Heart' },
      { col: 15, row: 34, name: 'West Ravine Heart' },
      { col: 28, row: 24, name: 'Central Glade Heart' }
    ]

    const validSpots = candidateShrineSpots.filter(s => !this.isWall(s.col, s.row))
    Phaser.Utils.Array.Shuffle(validSpots)
    const selectedSpots = validSpots.slice(0, 3)

    this.chosenHeartLocations = selectedSpots.map(s => `${s.col},${s.row}`)
    this.heartShrines = []

    selectedSpots.forEach((s, idx) => {
      const x = s.col * this.TILE + this.TILE / 2
      const y = s.row * this.TILE + this.TILE / 2

      // Green glow pulse under the heart
      const glow = this.add.circle(x, y, 26, 0x00ff88, 0.35)
      glow.setStrokeStyle(2, 0x55ffaa, 0.85)
      glow.setDepth(4)

      this.tweens.add({
        targets: glow,
        scaleX: 1.35,
        scaleY: 1.35,
        alpha: 0.18,
        duration: 850,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })

      const shrineObj = { id: idx, col: s.col, row: s.row, x, y, glow, heartImg: null, prompt: null, used: false }

      const createHeartImage = () => {
        if (shrineObj.used) return
        const heartImg = this.add.image(x, y, 'heart')
        heartImg.setDisplaySize(36, 36)
        heartImg.setDepth(6)

        const baseScaleX = heartImg.scaleX || (36 / 2048)
        const baseScaleY = heartImg.scaleY || (36 / 2048)

        this.tweens.add({
          targets: heartImg,
          scaleX: baseScaleX * 1.15,
          scaleY: baseScaleY * 1.15,
          duration: 850,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        })
        shrineObj.heartImg = heartImg
      }

      if (this.textures.exists('heart')) {
        createHeartImage()
      } else {
        this.load.image('heart', 'resource/heart.png')
        this.load.once('filecomplete-image-heart', createHeartImage)
        if (!this.load.isLoading()) this.load.start()
      }

      this.heartShrines.push(shrineObj)
    })
  }

  getNearestHeartShrine(maxDist = 65) {
    if (!this.heartShrines || this.heartShrines.length === 0) return null
    let nearest = null
    let minDist = maxDist

    this.heartShrines.forEach(s => {
      if (s.used) return
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, s.x, s.y)
      if (d < minDist) {
        minDist = d
        nearest = s
      }
    })
    return nearest
  }

  reviveHeart() {
    if (this.gameEnding || this.animalNotificationFrozen || this.isPaused) return

    const targetShrine = this.getNearestHeartShrine(65)

    if (!targetShrine) {
      this.showFloatingText(
        this.player.x,
        this.player.y - 35,
        '⚠️ Reach a Heart in monster dens to revive!',
        '#ffaa44'
      )
      return
    }

    if (this.playerHP >= this.maxHP) {
      this.showFloatingText(this.player.x, this.player.y - 35, '❤️ Hearts Already Full!', '#ffdd44')
      return
    }

    if (this.score < this.HEART_REVIVE_COST) {
      this.showFloatingText(
        this.player.x,
        this.player.y - 35,
        `⚠️ Need ${this.HEART_REVIVE_COST} Score to Revive Heart! (${this.score}/${this.HEART_REVIVE_COST})`,
        '#ff4444'
      )
      return
    }

    // Deduct score & add 1 heart
    this.score -= this.HEART_REVIVE_COST
    this.playerHP = Math.min(this.playerHP + 1, this.maxHP)

    // MAKE THE HEART DISAPPEAR
    targetShrine.used = true
    const toDestroy = [targetShrine.heartImg, targetShrine.glow, targetShrine.prompt].filter(Boolean)
    this.tweens.add({
      targets: toDestroy,
      alpha: 0,
      scaleX: 0.1,
      scaleY: 0.1,
      duration: 350,
      ease: 'Back.easeIn',
      onComplete: () => {
        toDestroy.forEach(el => {
          if (el && el.destroy) el.destroy()
        })
      }
    })
    this.heartShrines = this.heartShrines.filter(s => s !== targetShrine)

    if (this.heartNotificationContainer) {
      this.heartNotificationContainer.setVisible(false)
    }

    // Clear emergency state if active
    if (this.emergencyReviveTimer) {
      this.emergencyReviveTimer.remove(false)
      this.emergencyReviveTimer = null
    }
    if (this.emergencyCard) {
      this.emergencyCard.destroy()
      this.emergencyCard = null
    }
    this.emergencyReviving = false

    // Flash camera & screen floating text
    this.cameras.main.flash(280, 255, 60, 100)
    this.showFloatingText(
      this.player.x,
      this.player.y - 45,
      `+1 ❤️ Revived! (-${this.HEART_REVIVE_COST} Score)`,
      '#00ff88'
    )

    // Temporary invulnerability shield for 1.5s
    this.playerHitCooldown = true
    this.tweens.add({
      targets: this.player,
      alpha: 0.35,
      duration: 120,
      yoyo: true,
      repeat: 6,
      onComplete: () => {
        if (this.player && this.player.active) {
          this.player.setAlpha(this.shieldActive ? 0.45 : 1)
          this.playerHitCooldown = false
        }
      }
    })

    // Minimal floating heart effect
    if (this.textures.exists('heart')) {
      for (let i = 0; i < 3; i++) {
        const pHeart = this.add.image(this.player.x - 12 + i * 12, this.player.y - 12, 'heart')
        pHeart.setDisplaySize(16, 16)
        pHeart.setDepth(30)
        this.tweens.add({
          targets: pHeart,
          y: this.player.y - 32,
          alpha: 0,
          duration: 600,
          ease: 'Sine.easeOut',
          onComplete: () => pHeart.destroy()
        })
      }
    }
  }

  triggerEmergencyRevive() {
    if (this.emergencyReviving || this.gameEnding) return
    this.emergencyReviving = true
    this.playerHP = 0

    // Push nearby hunters away
    this.monsterList.forEach(m => {
      if (m.active && m.body) {
        const dx = m.body.x - this.player.x
        const dy = m.body.y - this.player.y
        const dist = Math.hypot(dx, dy) || 1
        m.body.setVelocity((dx / dist) * 160, (dy / dist) * 160)
        m.chasing = false
      }
    })

    const { width, height } = this.scale
    const cx = width / 2
    const cy = height / 2

    const container = this.add.container(0, 0).setScrollFactor(0).setDepth(9999)

    const overlay = this.add.graphics()
    overlay.fillStyle(0x000000, 0.68)
    overlay.fillRect(0, 0, width, height)
    container.add(overlay)

    const card = this.add.graphics()
    card.fillStyle(0x1a0505, 0.95)
    card.fillRoundedRect(cx - 190, cy - 80, 380, 160, 12)
    card.lineStyle(3, 0xff3344, 1)
    card.strokeRoundedRect(cx - 190, cy - 80, 380, 160, 12)
    container.add(card)

    if (this.textures.exists('heart')) {
      const heartIcon = this.add.image(cx, cy - 42, 'heart').setDisplaySize(32, 32)
      container.add(heartIcon)
    }

    const title = this.add.text(cx, cy - 8, '💔 FATAL HIT!', {
      fontSize: '20px',
      fontFamily: 'Arial Black',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5)
    container.add(title)

    let countdown = 3
    const subtitle = this.add.text(
      cx,
      cy + 22,
      `Press [H] or Click to Revive! (-${this.HEART_REVIVE_COST} Score)\n[ Auto Game-Over in ${countdown}s ]`,
      {
        fontSize: '13px',
        fontFamily: 'Arial',
        color: '#ffddaa',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 3
      }
    ).setOrigin(0.5)
    container.add(subtitle)

    overlay.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, width, height),
      Phaser.Geom.Rectangle.Contains
    )
    overlay.on('pointerdown', () => {
      this.reviveHeart()
    })

    this.emergencyCard = container

    this.emergencyReviveTimer = this.time.addEvent({
      delay: 1000,
      repeat: 3,
      callback: () => {
        countdown--
        if (countdown > 0) {
          subtitle.setText(
            `Press [H] or Click to Revive! (-${this.HEART_REVIVE_COST} Score)\n[ Auto Game-Over in ${countdown}s ]`
          )
        } else {
          if (this.playerHP <= 0) {
            if (this.emergencyCard) {
              this.emergencyCard.destroy()
              this.emergencyCard = null
            }
            this.emergencyReviving = false
            this.endGame(false)
          }
        }
      }
    })
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
      normal: this.birdColor
    }

    const attackColor = attackColorMap[this.currentWeapon] || this.birdColor

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
          m.stunnedUntil = this.time.now + 450
          m.body.setVelocity(0, 0)

          if (m.hp <= 0) {
            this.killMonster(m, this.currentWeapon)
            return
          }

          this.drawHPBar(m.hpBar, m.body.x, m.body.y - 28, m.hp, m.maxHp)
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
            m.stunnedUntil = this.time.now + 550

            m.body.setVelocity(
              Math.cos(angle) * 180,
              Math.sin(angle) * 180
            )

            if (m.hp <= 0) {
              this.killMonster(m, this.currentWeapon)
              return
            }

            this.drawHPBar(m.hpBar, m.body.x, m.body.y - 28, m.hp, m.maxHp)
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
        makeRing(this.birdColor, 10, range / 10, 350)
        this.hitMonstersInRange(this.player.x, this.player.y, range, 1, this.birdColor)
        break
      }
    }
  }


  hitMonstersInRange(x, y, range, damage, color) {
    let hit = false

    this.monsterList.forEach(m => {

      if (!m.alive || !m.body || !m.body.active) return

      const dist = Phaser.Math.Distance.Between(
        x,
        y,
        m.body.x,
        m.body.y
      )

      if (dist < range) {

        hit = true

        const dealt = this.shieldActive ? Math.max(damage * 3, m.hp) : damage
        m.hp -= dealt
        m.stunnedUntil = this.time.now + 350
        m.body.setVelocity(0, 0)

        if (m.hpBar) {
          this.drawHPBar(
            m.hpBar,
            m.body.x,
            m.body.y - 28,
            m.hp,
            m.maxHp
          )
        }

        if (m.body) {
          m.body.setAlpha(0.3)

          this.time.delayedCall(150, () => {
            if (m.body) {
              m.body.setAlpha(1)
            }
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
        if (m.body) {
          this.showFloatingText(
            m.body.x,
            m.body.y - 20,
            this.shieldActive ? '🗡️ Stealth Kill!' : '⚔️ Hit!',
            this.shieldActive ? '#00ffff' : '#ffaaaa'
          )
        }
      }
    })

    if (!hit && this.currentWeapon === 'normal') {
      this.showFloatingText(
        this.player.x,
        this.player.y - 30,
        'Miss!',
        '#888888'
      )
    }
  }

  killMonster(m, deathType = this.currentWeapon) {
    if (!m || !m.alive || !m.body) return

    m.alive = false

    const x = m.body.x
    const y = m.body.y

    // Stop hunter immediately
    m.body.setVelocity(0, 0)
    m.body.setAngle(0)

    if (m.body.body) {
      m.body.body.enable = false
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
    if (deathType === 'fire') {
      m.body.setTint(0xff5500)
    } else if (deathType === 'bomb') {
      m.body.setTint(0x333333)
    } else if (deathType === 'lightning') {
      m.body.setTint(0xffff66)
    } else if (deathType === 'wind' || deathType === 'boomerang') {
      m.body.setTint(0x88ffee)
    }

    // Mini skull appears right before disappearance
    this.time.delayedCall(350, () => {
      this.showDeathSkull(x, y)
    })

    // Hunter disappears after effect
    this.tweens.add({
      targets: m.body,
      alpha: 0,
      duration: 650,
      delay: deathType === 'lightning' ? 120 : 0,
      onComplete: () => {
        if (m.body) {
          m.body.destroy()
          m.body = null
        }
      }
    })

    this.score += 200

    this.showFloatingText(
      x,
      y - 24,
      '+200',
      '#ffffff'
    )
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
      // Volt: lightning PNG appears over hunter before death

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

      // optional small sparks
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

    m.body.setVelocity(0, 0)
    m.body.setTint(0x88ccff)
    m.body.setAngle(0)
    m.body.setAlpha(0.85)

    if (m.body.body) {
      m.body.body.enable = false
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
      this.showDeathSkull(x, y);
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: this.playerName, chosenBird: this.chosenBird })
      }).catch(() => null)
      if (!pr || !pr.ok) return
      const player = await pr.json().catch(() => null)
      if (!player || !player.id) return
      await fetch('http://localhost:8080/api/score/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: player.id, levelNumber: 1,
          score: this.score, eggsSaved: this.eggsCollected,
          timeSeconds: 180 - this.timeLeft
        })
      }).catch(() => null)
    } catch (e) {
      console.log('Score not saved — backend offline')
    }
  }

  getCo2Absorbed() {
    return Math.floor(this.saplingScore / 10)
  }


  endGame(escaped) {
    if (this.gameEnding) return
    this.gameEnding = true

    this.physics.pause()
    if (this.player && this.player.setVelocity) {
      this.player.setVelocity(0, 0)
    }

    if (this.terminal) {
      this.terminal.destroy()
      this.terminal = null
    }

    if (this.emergencyCard) {
      this.emergencyCard.destroy()
      this.emergencyCard = null
    }
    if (this.emergencyReviveTimer) {
      this.emergencyReviveTimer.remove(false)
      this.emergencyReviveTimer = null
    }
    if (this.activeWildlifeCard) {
      this.activeWildlifeCard.destroy()
      this.activeWildlifeCard = null
    }
    this.animalNotificationFrozen = false
    if (this.shieldActive) this.deactivateShield()
    if (this.playerShieldGfx) {
      this.playerShieldGfx.destroy()
      this.playerShieldGfx = null
    }

    if (this.heartNotificationContainer) {
      this.heartNotificationContainer.destroy()
      this.heartNotificationContainer = null
    }
    if (this.pauseMenuContainer) {
      this.pauseMenuContainer.destroy()
      this.pauseMenuContainer = null
    }

    this.saveScore()
    this.scene.stop('UIScene')

    const reportData = {
      playerName: this.playerName,
      chosenBird: this.chosenBird,
      evolutionStage: this.evolutionStage || 1,

      totalScore: this.score,
      saplingsCollected: this.eggsCollected,

      // IMPORTANT: use animalsSaved because that is what your animal rescue system increases
      animalsRescued: this.animalsSaved || 0,

      // IMPORTANT: use monstersKilled because your killMonster() should increase this
      monstersKilled: this.monstersKilled || 0,

      co2Absorbed: this.getCo2Absorbed ? this.getCo2Absorbed() : 0,

      timeTaken: 180 - this.timeLeft,

      // IMPORTANT: ReportScene expects flashCards
      flashCards: this.collectedFlashCards || [],

      escaped
    }

    this.time.delayedCall(300, () => {
      this.scene.launch('ReportScene', reportData)
      this.scene.pause('GameScene')
    })
  }

  togglePauseMenu() {
    if (this.gameEnding) return
    if (this.scene.isActive('FlashCardScene')) return
    if (this.terminalOpen) return

    if (this.isPaused) {
      this.resumeGame()
    } else {
      this.pauseGame()
    }
  }

  pauseGame() {
    if (this.isPaused || this.gameEnding) return
    this.isPaused = true
    this.physics.pause()
    if (this.player && this.player.setVelocity) {
      this.player.setVelocity(0, 0)
    }
    if (this.monsterList) {
      this.monsterList.forEach(m => {
        if (m.body && m.body.setVelocity) m.body.setVelocity(0, 0)
      })
    }

    const { width, height } = this.scale
    const cx = width / 2
    const cy = height / 2

    const container = this.add.container(0, 0).setScrollFactor(0).setDepth(99999)

    // Full-screen dark overlay
    const backdrop = this.add.graphics()
    backdrop.fillStyle(0x000000, 0.75)
    backdrop.fillRect(0, 0, width, height)
    backdrop.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, width, height),
      Phaser.Geom.Rectangle.Contains
    )
    container.add(backdrop)

    // Modal card
    const modalW = 380
    const modalH = 320
    const modalBox = this.add.graphics()
    modalBox.fillStyle(0x0a1610, 0.95)
    modalBox.fillRoundedRect(cx - modalW / 2, cy - modalH / 2, modalW, modalH, 16)
    modalBox.lineStyle(3, 0x44aa66, 0.9)
    modalBox.strokeRoundedRect(cx - modalW / 2, cy - modalH / 2, modalW, modalH, 16)
    container.add(modalBox)

    // Title
    const title = this.add.text(cx, cy - 110, '⏸️ GAME PAUSED', {
      fontSize: '24px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5)
    container.add(title)

    const sub = this.add.text(cx, cy - 75, `Level 1: Forest of Lumina • ${this.playerName} (${this.chosenBird})`, {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#88ddaa'
    }).setOrigin(0.5)
    container.add(sub)

    // Helper to make stylish pause menu buttons
    const makePauseBtn = (x, y, text, colorHex, borderHex, callback) => {
      const btnW = 260
      const btnH = 46
      const btnBg = this.add.graphics()
      btnBg.fillStyle(colorHex, 0.9)
      btnBg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 10)
      btnBg.lineStyle(2, borderHex, 1)
      btnBg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 10)

      const btnLabel = this.add.text(0, 0, text, {
        fontSize: '15px',
        fontFamily: 'Arial Black',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5)

      const btn = this.add.container(x, y, [btnBg, btnLabel])
      btn.setSize(btnW, btnH)
      btn.setInteractive({ useHandCursor: true })

      btn.on('pointerover', () => {
        btn.setScale(1.04)
        btnBg.clear()
        btnBg.fillStyle(colorHex, 1)
        btnBg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 10)
        btnBg.lineStyle(2, 0xffffff, 1)
        btnBg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 10)
      })

      btn.on('pointerout', () => {
        btn.setScale(1)
        btnBg.clear()
        btnBg.fillStyle(colorHex, 0.9)
        btnBg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 10)
        btnBg.lineStyle(2, borderHex, 1)
        btnBg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 10)
      })

      btn.on('pointerdown', callback)
      container.add(btn)
      return btn
    }

    // 1. Resume button
    makePauseBtn(cx, cy - 25, '▶  RESUME', 0x1e6f43, 0x44dd88, () => {
      this.resumeGame()
    })

    // 2. Play Again button
    makePauseBtn(cx, cy + 35, '🔄  PLAY AGAIN', 0xb86214, 0xffaa44, () => {
      this.playAgain()
    })

    // 3. Go to Main button
    makePauseBtn(cx, cy + 95, '🏠  GO TO MAIN', 0x8a2020, 0xff5555, () => {
      this.goToMain()
    })

    this.pauseMenuContainer = container
    this.scene.bringToTop()
  }

  resumeGame() {
    if (!this.isPaused) return
    this.isPaused = false
    if (this.pauseMenuContainer) {
      this.pauseMenuContainer.destroy()
      this.pauseMenuContainer = null
    }
    this.physics.resume()
    if (this.scene.isActive('UIScene')) {
      this.scene.bringToTop('UIScene')
    }
  }

  playAgain() {
    this.isPaused = false
    if (this.pauseMenuContainer) {
      this.pauseMenuContainer.destroy()
      this.pauseMenuContainer = null
    }
    if (this.heartNotificationContainer) {
      this.heartNotificationContainer.destroy()
      this.heartNotificationContainer = null
    }
    this.scene.stop('UIScene')
    this.scene.start('GameScene', {
      playerName: this.playerName,
      chosenBird: this.chosenBird
    })
  }

  goToMain() {
    this.isPaused = false
    if (this.pauseMenuContainer) {
      this.pauseMenuContainer.destroy()
      this.pauseMenuContainer = null
    }
    if (this.heartNotificationContainer) {
      this.heartNotificationContainer.destroy()
      this.heartNotificationContainer = null
    }
    this.scene.stop('UIScene')
    this.scene.start('MenuScene')
  }

  update(time, delta) {
    if (this.gameEnding) return
    if (this.isPaused) {
      if (this.player && this.player.setVelocity) this.player.setVelocity(0, 0)
      return
    }

    // Check if player pressed any movement key to unfreeze animal notification
    const moveInput = this.wasd.left.isDown || this.wasd.right.isDown ||
                      this.wasd.up.isDown || this.wasd.down.isDown ||
                      this.cursors.left.isDown || this.cursors.right.isDown ||
                      this.cursors.up.isDown || this.cursors.down.isDown

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

    // ── Shield duration countdown (strictly temporary 10s) ──────
    if (this.shieldActive) {
      const dt = (delta && delta > 0 && delta < 500) ? (delta / 1000) : (1 / 60)
      this.shieldTimeRemaining = Math.max(0, this.shieldTimeRemaining - dt)
      if (this.shieldTimeRemaining <= 0) {
        this.deactivateShield()
      }
    }

    const speed = this.evolutionStage >= 2 ? 190 : 140
    let vx = 0, vy = 0
    this.isMoving = false

    if (this.terminalOpen) {
      this.player.setVelocity(0, 0)
      this.monsterList.forEach(m => {
        if (m.alive && m.body && m.body.active) m.body.setVelocity(0, 0)
      })
      this.portalAngle += 0.035
      this.drawPortal()
      return
    }

    if (this.wasd.left.isDown || this.cursors.left.isDown) {
      vx = -speed
      this.playerDir = 'left'
      this.player.setTexture(`${this.playerSpriteKey}_left`)
      this.isMoving = true
    } else if (this.wasd.right.isDown || this.cursors.right.isDown) {
      vx = speed
      this.playerDir = 'right'
      this.player.setTexture(`${this.playerSpriteKey}_right`)
      this.isMoving = true
    }

    if (this.wasd.up.isDown || this.cursors.up.isDown) {
      vy = -speed
      this.playerDir = 'up'
      this.player.setTexture(`${this.playerSpriteKey}_back`)
      this.isMoving = true
    } else if (this.wasd.down.isDown || this.cursors.down.isDown) {
      vy = speed
      this.playerDir = 'down'
      this.player.setTexture(`${this.playerSpriteKey}_front`)
      this.isMoving = true
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

    if (vx < 0 && this.isWall(leftTile, curRow)) {
      vx = 0
      this.player.x = Math.max(this.player.x, (leftTile + 1) * this.TILE + hw)
    }
    if (vx > 0 && this.isWall(rightTile, curRow)) {
      vx = 0
      this.player.x = Math.min(this.player.x, rightTile * this.TILE - hw)
    }
    if (vy < 0 && this.isWall(curCol, topTile)) {
      vy = 0
      this.player.y = Math.max(this.player.y, (topTile + 1) * this.TILE + hw)
    }
    if (vy > 0 && this.isWall(curCol, bottomTile)) {
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

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.useWeapon()
    }

    // Monster AI
    this.monsterList.forEach(m => {
      if (!m.alive || !m.body || !m.body.active) return
      if (m.stunnedUntil && this.time.now < m.stunnedUntil) {
        m.body.setVelocity(0, 0)
        m.body.setAngle(0)
        m.body.setTint(0xffaaaa)
        this.drawHPBar(m.hpBar, m.body.x, m.body.y - 28, m.hp, m.maxHp)
        return
      }

      if (m.stunnedUntil && this.time.now >= m.stunnedUntil) {
        m.stunnedUntil = null
        m.body.clearTint()
      }

      if (m.frozen) {
        m.body.setVelocity(0, 0)
        m.body.setTint(0x88ccff)
        this.drawHPBar(m.hpBar, m.body.x, m.body.y - 28, m.hp, m.maxHp)
        return
      }

      // If stuck in a wall — teleport home immediately
      const curMc = Math.floor(m.body.x / this.TILE)
      const curMr = Math.floor(m.body.y / this.TILE)
      if (this.isWall(curMc, curMr)) {
        m.body.setPosition(m.spawnX, m.spawnY)
        m.body.setVelocity(0, 0)
        m.patrolTimer = 0

        this.drawHPBar(m.hpBar, m.body.x, m.body.y - 28, m.hp, m.maxHp)
        return
      }

      const distToPlayer = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, m.body.x, m.body.y
      )

      const chaseRange = (this.shieldActive || this.stealthMode) ? 0 :
        (m.alwaysChase ? 9999 :
          (this.evolutionStage >= 2 ? 190 : 240))
      const attackRange = 30

      if (!this.shieldActive && !this.stealthMode && distToPlayer < chaseRange) {
        m.chasing = true
        m.alert.setVisible(true)
        m.alert.setPosition(m.body.x, m.body.y - 42)

        const angle = Phaser.Math.Angle.Between(
          m.body.x, m.body.y, this.player.x, this.player.y
        )
        const ms = 100
        const mvx = Math.cos(angle) * ms
        const mvy = Math.sin(angle) * ms
        const nextCol = Math.floor((m.body.x + mvx * 0.05) / this.TILE)
        const nextRow = Math.floor((m.body.y + mvy * 0.05) / this.TILE)
        const mc = Math.floor(m.body.x / this.TILE)
        const mr = Math.floor(m.body.y / this.TILE)

        const finalVx = this.isWall(nextCol, mr) ? 0 : mvx
        const finalVy = this.isWall(mc, nextRow) ? 0 : mvy

        m.body.setVelocity(finalVx, finalVy)
        this.setHunterDirection(m, finalVx, finalVy)

        if (!this.shieldActive && distToPlayer < attackRange && !this.playerHitCooldown && !this.isAttacking) {
          this.playerHitCooldown = true
          this.playerHP--
          this.cameras.main.shake(200, 0.008)
          this.player.setTint(0xff0000)
          this.showFloatingText(this.player.x, this.player.y - 30, '💔 -1 Heart', '#ff0000')

          if (!this.firstHitNotified) {
            this.firstHitNotified = true
            this.showFloatingText(this.player.x, this.player.y - 52, '💡 Find Hearts in monster dens to Revive (-100)', '#ffeb3b')
          }

          this.time.delayedCall(400, () => {
            this.player.clearTint()

            this.playerHitCooldown = false
          })

          if (this.playerHP <= 0) {
            this.playerHP = 0
            const nearbyHeart = this.getNearestHeartShrine(90)
            if (nearbyHeart && this.score >= this.HEART_REVIVE_COST && !this.emergencyReviving) {
              this.triggerEmergencyRevive(nearbyHeart)
            } else {
              this.endGame(false)
            }
          }
        }

      } else {
        m.chasing = false
        m.alert.setVisible(false)
        m.patrolTimer = (m.patrolTimer || 0) + 1

        if (m.patrolTimer > 120) {
          m.patrolTimer = 0
          const mc = Math.floor(m.body.x / this.TILE)
          const mr = Math.floor(m.body.y / this.TILE)
          const allDirs = [
            { vx: 55, vy: 0, dc: 1, dr: 0 },
            { vx: -55, vy: 0, dc: -1, dr: 0 },
            { vx: 0, vy: 55, dc: 0, dr: 1 },
            { vx: 0, vy: -55, dc: 0, dr: -1 },
          ]
          const safeDirs = allDirs.filter(d =>
            !this.isWall(mc + d.dc, mr + d.dr)
          )
          const dirs = safeDirs.length > 0 ? safeDirs : allDirs
          const d = dirs[Phaser.Math.Between(0, dirs.length - 1)]
          m.body.setVelocity(d.vx, d.vy)
          this.setHunterDirection(m, d.vx, d.vy)
        }
      }

      this.animateHunterWalk(m, delta)
      this.drawHPBar(m.hpBar, m.body.x, m.body.y - 28, m.hp, m.maxHp)
    })

    this.updateAnimals(delta)
    this.checkAnimalRescue()

    // Egg collection
    this.eggList.forEach(e => {
      if (e.collected) return
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, e.x, e.y
      )
      if (dist < 34) {
        e.collected = true

        if (e.graphic) {
          e.graphic.destroy()
        }

        if (e.glow) {
          this.tweens.killTweensOf(e.glow)
          e.glow.destroy()
          e.glow = null
        }

        this.eggsCollected++
        const flashCardMap = {
          normal: 'flashCard_1',
          fire: 'flashCard_2',
          thunder: 'flashCard_3',
          golden: 'flashCard_3'
        }

        const unlockedCard = flashCardMap[e.type]
        if (unlockedCard && !this.collectedFlashCards.includes(unlockedCard)) {
          this.collectedFlashCards.push(unlockedCard)
        }

        if (e.type === 'golden') {
          this.goldenEggs++
          this.score += 500
          this.saplingScore += 500
          this.checkEvolution()
          this.showFloatingText(this.player.x, this.player.y - 30, '🌟 RARE SAPLING! +500', '#FFD700')
        } else if (e.type === 'fire') {
          this.score += 200
          this.saplingScore += 200
          this.showFloatingText(this.player.x, this.player.y - 30, '🔥 FIRE SAPLING! +200', '#FF4500')
        } else if (e.type === 'thunder') {
          this.score += 300
          this.saplingScore += 300
          this.showFloatingText(this.player.x, this.player.y - 30, '⚡ ANCIENT SAPLING! +300', '#FFD700')
        } else {
          this.score += 100
          this.saplingScore += 100
          this.showFloatingText(this.player.x, this.player.y - 30, '🌱 +100', '#ffffff')
        }
      }
    })

    // Shield pickup
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

    // Shield protective aura update
    if (this.shieldActive && this.playerShieldGfx && this.player && this.player.active) {
      this.playerShieldGfx.clear()
      const pulse = 0.5 + Math.sin(Date.now() / 250) * 0.25
      this.playerShieldGfx.lineStyle(2, 0x00e5ff, pulse)
      this.playerShieldGfx.strokeCircle(this.player.x, this.player.y, 24)
      this.playerShieldGfx.fillStyle(0x00e5ff, 0.12 * pulse)
      this.playerShieldGfx.fillCircle(this.player.x, this.player.y, 24)
    }

    // Heart Shrine top notification when nearby
    const nearbyShrine = this.getNearestHeartShrine(75)
    if (nearbyShrine && !nearbyShrine.used && !this.gameEnding && !this.isPaused) {
      if (this.heartNotificationContainer && !this.heartNotificationContainer.visible) {
        this.heartNotificationContainer.setVisible(true)
      }
    } else {
      if (this.heartNotificationContainer && this.heartNotificationContainer.visible) {
        this.heartNotificationContainer.setVisible(false)
      }
    }

    // Portal check
    const px = this.portalCol * this.TILE + this.TILE / 2
    const py = this.portalRow * this.TILE + this.TILE / 2
    if (Phaser.Math.Distance.Between(
      this.player.x, this.player.y, px, py) < 38) {
      this.endGame(true)
    }

    if (this.timeLeft < 0) this.endGame(false)

    this.portalAngle += 0.035
    this.drawPortal()

    // Bird bounce
    this.bobTimer += 1
    const baseSize = (this.chosenBird === 'Ember') ? this.TILE : (this.TILE + 8)
    if (this.isMoving) {
      if (this.bobTimer > 8) {
        this.player.setDisplaySize(baseSize + 5, baseSize - 5)
      } else {
        this.player.setDisplaySize(baseSize - 2, baseSize + 5)
      }
      if (this.bobTimer > 15) this.bobTimer = 0
    } else {
      this.player.setDisplaySize(baseSize, baseSize)
    }
  }
}
