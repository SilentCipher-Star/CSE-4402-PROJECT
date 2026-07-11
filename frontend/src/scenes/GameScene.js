import Phaser from 'phaser'
import { Terminal } from '../ui/Terminal.js'
export class GameScene extends Phaser.Scene {
  constructor() { super('GameScene') }
  init(data) {
    this.playerName = data.playerName || 'Adventurer'
    this.chosenBird = data.chosenBird || 'Ember'
    this.score = 0
    this.eggsCollected = 0
    this.evolutionStage = 1
    this.goldenEggs = 0
    this.isAttacking = false
    this.playerDir = 'right'
    this.timeLeft = 180
    this.bobTimer = 0
    this.isMoving = false
    this.currentWeapon = 'normal'
    this.playerHitCooldown = false
    this.frozenMonsters = new Set()
    this.playerHP = 3
    this.maxHP = 3
    this.terminalOpen = false
    this.stealthMode = false
    this.gameEnding = false
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
    this.eggList = []
    this.spawnEggs()
    this.monsterList = []
    this.spawnMonsters()
    this.weaponList = []
    this.spawnWeapons()
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
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    )
    this.time.addEvent({
      delay: 1000,
      callback: () => { if (this.timeLeft > 0) this.timeLeft-- },
      repeat: 180  // FIX 1: was 179, needs 180 repeats to count down from 180 to 0
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

    // Optional narrow branches, still ONE tile wide
    carvePath([[11, 9], [15, 9]])
    carvePath([[7, 7], [15, 7], [15, 9]])
    carvePath([[21, 15], [21, 10], [30, 10], [30, 6], [42, 6]])
    carvePath([[37, 18], [44, 18], [44, 24], [38, 24]])
    carvePath([[33, 24], [40, 24], [40, 30], [35, 30]])
    carvePath([[25, 28], [30, 33], [25, 37], [18, 37]])
    carvePath([[15, 34], [15, 39], [12, 39]])
    carvePath([[5, 40], [2, 40], [2, 44]])

    // Force important positions to stay sand, but only ONE tile each
    const importantSpots = [
      [1, 1], [3, 3], [5, 6], [5, 9], [11, 9],
      [19, 12], [15, 15], [29, 15], [37, 18],
      [33, 21], [28, 26], [25, 28], [21, 30],
      [18, 32], [15, 34], [44, 47],

      // weapons
      [7, 7], [15, 9], [21, 15], [37, 18],

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
      { col: 1, row: 1, type: 'normal' },
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

        const glow = this.add.circle(x, y, 18, glowColor, 0.2)

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
        x,
        y,
        type: e.type,
        collected: false
      })
    })
  }
  spawnMonsters() {
    const positions = [
      { col: 6, row: 1 },
      { col: 5, row: 9 },
      { col: 11, row: 9 },
      { col: 19, row: 12 },
      { col: 29, row: 15 },
      { col: 37, row: 18 },
      { col: 33, row: 21 },
      { col: 25, row: 28 },
      { col: 18, row: 32 },
    ]
    positions.forEach((m, i) => {
      if (this.isWall(m.col, m.row)) return
      const x = m.col * this.TILE + this.TILE / 2
      const y = m.row * this.TILE + this.TILE / 2
      const g = this.add.graphics()
      this.drawMonster(g, x, y)
      const body = this.physics.add.image(x, y, null).setVisible(false)
      body.body.setSize(28, 28)
      body.setCollideWorldBounds(true)
      body.setVelocity(60, 0)
      const hpBar = this.add.graphics()
      this.drawHPBar(hpBar, x, y - 28, 2, 2)
      const alert = this.add.text(x, y - 40, '❗', {
        fontSize: '16px'
      }).setOrigin(0.5).setVisible(false)
      this.monsterList.push({
        graphic: g, body, hpBar, alert,
        hp: 2, maxHp: 2, alive: true,
        chasing: false, patrolTimer: 0, frozen: false,
        alwaysChase: false, hacked: false,
        spawnX: x, spawnY: y
      })
    })
  }
  spawnWeapons() {
    const weapons = [
      { col: 7, row: 7, type: 'bomb', label: '💣', color: 0xFF6600, desc: 'Area explosion' },
      { col: 15, row: 9, type: 'ice', label: '❄️', color: 0x00BFFF, desc: 'Freeze enemies' },
      { col: 21, row: 15, type: 'lightning', label: '⚡', color: 0xFFD700, desc: 'Chain 3 enemies' },
      { col: 37, row: 18, type: 'boomerang', label: '🪃', color: 0xC8A25A, desc: 'Double hit' },
    ]
    weapons.forEach(w => {
      if (this.isWall(w.col, w.row)) return
      const x = w.col * this.TILE + this.TILE / 2
      const y = w.row * this.TILE + this.TILE / 2
      const bg = this.add.circle(x, y, 20, w.color, 0.9)
      const label = this.add.text(x, y, w.label, {
        fontSize: '20px'
      }).setOrigin(0.5)
      const desc = this.add.text(x, y + 28, w.desc, {
        fontSize: '9px', fontFamily: 'Arial',
        color: '#ffffff', stroke: '#000000', strokeThickness: 2
      }).setOrigin(0.5)
      this.tweens.add({
        targets: bg, scaleX: 1.3, scaleY: 1.3, alpha: 0.5,
        duration: 600, yoyo: true, repeat: -1
      })
      this.weaponList.push({
        bg, label, desc, x, y,
        type: w.type, collected: false
      })
    })
  }
  drawMonster(g, x, y, frozen) {
    g.clear()
    const bodyColor = frozen ? 0x88CCFF : 0x8B0000
    const highlightColor = frozen ? 0xAAEEFF : 0xcc2222
    // Draw at 0,0 — position set via g.setPosition()
    g.fillStyle(0x000000, 0.2)
    g.fillEllipse(0, 18, 34, 10)
    g.fillStyle(bodyColor, 1)
    g.fillCircle(0, 0, 17)
    g.fillStyle(highlightColor, 0.5)
    g.fillCircle(-5, -6, 9)
    g.fillStyle(frozen ? 0xffffff : 0xff4444, 1)
    g.fillCircle(-6, -3, 5)
    g.fillCircle(6, -3, 5)
    g.fillStyle(0x000000, 1)
    g.fillCircle(-5, -3, 2)
    g.fillCircle(7, -3, 2)
    g.lineStyle(2, 0x000000, 1)
    g.beginPath()
    g.moveTo(-9, -9)
    g.lineTo(-3, -6)
    g.strokePath()
    g.beginPath()
    g.moveTo(9, -9)
    g.lineTo(3, -6)
    g.strokePath()
    g.lineStyle(2, frozen ? 0x00BFFF : 0xff0000, 1)
    g.beginPath()
    g.arc(0, 5, 6, 0.2, Math.PI - 0.2)
    g.strokePath()
    // Move the graphic to world position
    g.setPosition(x, y)
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
      this.maxHP = 4
      this.playerHP = Math.min(this.playerHP + 1, 4)
      this.player.setTint(0xFFD700)
      this.showFloatingText(
        this.player.x, this.player.y - 40,
        '🔥 STAGE 3 — OVERPOWERED! +1 Heart', '#FF6B2B'
      )
    } else if (this.goldenEggs >= 1 && this.evolutionStage < 2) {
      this.evolutionStage = 2
      this.player.setTint(0xaaffaa)
      this.showFloatingText(
        this.player.x, this.player.y - 40,
        '✨ EVOLVED TO STAGE 2!', '#FFD700'
      )
    }
  }
  useWeapon() {
    if (this.isAttacking) return
    this.isAttacking = true
    const range = this.evolutionStage >= 3 ? 150 :
      this.evolutionStage >= 2 ? 110 : 75
    switch (this.currentWeapon) {
      case 'normal': {
        const sw = this.add.graphics()
        sw.lineStyle(3, this.birdColor, 0.9)
        sw.strokeCircle(this.player.x, this.player.y, 10)
        this.tweens.add({
          targets: sw, scaleX: range / 10, scaleY: range / 10, alpha: 0,
          duration: 350, onComplete: () => sw.destroy()
        })
        this.hitMonstersInRange(this.player.x, this.player.y, range, 1, this.birdColor)
        break
      }
      case 'bomb': {
        const boom = this.add.graphics()
        boom.fillStyle(0xFF6600, 0.7)
        boom.fillCircle(this.player.x, this.player.y, 20)
        this.tweens.add({
          targets: boom, scaleX: 8, scaleY: 8, alpha: 0,
          duration: 500, onComplete: () => boom.destroy()
        })
        const ring = this.add.graphics()
        ring.lineStyle(4, 0xFF6600, 1)
        ring.strokeCircle(this.player.x, this.player.y, 10)
        this.tweens.add({
          targets: ring, scaleX: 15, scaleY: 15, alpha: 0,
          duration: 500, onComplete: () => ring.destroy()
        })
        this.hitMonstersInRange(this.player.x, this.player.y, range * 1.8, 2, 0xFF6600)
        this.cameras.main.shake(300, 0.01)
        break
      }
      case 'ice': {
        const iceRing = this.add.graphics()
        iceRing.lineStyle(3, 0x00BFFF, 0.9)
        iceRing.strokeCircle(this.player.x, this.player.y, 10)
        this.tweens.add({
          targets: iceRing, scaleX: range / 10, scaleY: range / 10, alpha: 0,
          duration: 400, onComplete: () => iceRing.destroy()
        })
        this.monsterList.forEach(m => {
          if (!m.alive || !m.body || !m.body.active) return
          const dist = Phaser.Math.Distance.Between(
            this.player.x, this.player.y, m.body.x, m.body.y
          )
          if (dist < range) {
            m.frozen = true
            m.body.setVelocity(0, 0)
            this.drawMonster(m.graphic, m.body.x, m.body.y, true)
            this.showFloatingText(m.body.x, m.body.y - 20, '❄️ FROZEN!', '#00BFFF')
            this.time.delayedCall(3000, () => {
              if (m.alive) {
                m.frozen = false
                this.drawMonster(m.graphic, m.body.x, m.body.y, false)
              }
            })
          }
        })
        break
      }
      case 'lightning': {
        const sorted = this.monsterList
          .filter(m => m.alive && m.body && m.body.active)
          .sort((a, b) =>
            Phaser.Math.Distance.Between(this.player.x, this.player.y, a.body.x, a.body.y) -
            Phaser.Math.Distance.Between(this.player.x, this.player.y, b.body.x, b.body.y)
          ).slice(0, 3)
        const lightning = this.add.graphics()
        lightning.lineStyle(3, 0xFFD700, 1)
        let lastX = this.player.x, lastY = this.player.y
        sorted.forEach(m => {
          lightning.beginPath()
          lightning.moveTo(lastX, lastY)
          const midX = (lastX + m.body.x) / 2 + Phaser.Math.Between(-20, 20)
          const midY = (lastY + m.body.y) / 2 + Phaser.Math.Between(-20, 20)
          lightning.lineTo(midX, midY)
          lightning.lineTo(m.body.x, m.body.y)
          lightning.strokePath()
          lastX = m.body.x; lastY = m.body.y
          m.hp--
          this.drawHPBar(m.hpBar, m.body.x, m.body.y - 28, m.hp, m.maxHp)
          this.showFloatingText(m.body.x, m.body.y - 20, '⚡ ZAP!', '#FFD700')
          if (m.hp <= 0) this.killMonster(m)
        })
        this.tweens.add({
          targets: lightning, alpha: 0, duration: 300,
          onComplete: () => lightning.destroy()
        })
        if (sorted.length === 0)
          this.showFloatingText(this.player.x, this.player.y - 30, 'Miss!', '#888888')
        break
      }
      case 'boomerang': {
        const bSw = this.add.graphics()
        bSw.lineStyle(3, 0xC8A25A, 0.9)
        bSw.strokeCircle(this.player.x, this.player.y, 10)
        this.tweens.add({
          targets: bSw, scaleX: range / 10, scaleY: range / 10, alpha: 0,
          duration: 250, onComplete: () => bSw.destroy()
        })
        this.hitMonstersInRange(this.player.x, this.player.y, range, 1, 0xC8A25A)
        this.time.delayedCall(400, () => {
          const bSw2 = this.add.graphics()
          bSw2.lineStyle(3, 0xC8A25A, 0.9)
          bSw2.strokeCircle(this.player.x, this.player.y, 10)
          this.tweens.add({
            targets: bSw2, scaleX: range / 10, scaleY: range / 10, alpha: 0,
            duration: 250, onComplete: () => bSw2.destroy()
          })
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

      const dist = Phaser.Math.Distance.Between(
        x,
        y,
        m.body.x,
        m.body.y
      )

      if (dist < range) {

        hit = true

        m.hp -= damage

        if (m.hpBar) {
          this.drawHPBar(
            m.hpBar,
            m.body.x,
            m.body.y - 28,
            m.hp,
            m.maxHp
          )
        }

        if (m.graphic) {
          m.graphic.setAlpha(0.3)

          this.time.delayedCall(150, () => {
            if (m.graphic) {
              m.graphic.setAlpha(1)
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
          this.killMonster(m)
          return
        }

        // Safe floating text
        if (m.body) {
          this.showFloatingText(
            m.body.x,
            m.body.y - 20,
            '⚔️ Hit!',
            '#ffaaaa'
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

  killMonster(m) {
    if (!m || !m.alive) return

    m.alive = false

    // Save coords BEFORE destroy
    const dx = m.body ? m.body.x : 0
    const dy = m.body ? m.body.y : 0

    // Explosion particles
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2

      const burst = this.add.graphics()

      burst.fillStyle(0xff2200, 1)
      burst.fillCircle(dx, dy, 5)

      this.tweens.add({
        targets: burst,
        x: dx + Math.cos(angle) * Phaser.Math.Between(20, 50),
        y: dy + Math.sin(angle) * Phaser.Math.Between(20, 50),
        alpha: 0,
        scaleX: 0.2,
        scaleY: 0.2,
        duration: Phaser.Math.Between(300, 600),
        onComplete: () => burst.destroy()
      })
    }

    // Safe destroys
    if (m.graphic) m.graphic.destroy()
    if (m.hpBar) m.hpBar.destroy()
    if (m.alert) m.alert.destroy()

    if (m.body) {
      m.body.destroy()
      m.body = null
    }

    this.score += 200

    this.showFloatingText(
      dx,
      dy,
      '💥 +200',
      '#ff4444'
    )
  }


  async saveScore() {
    try {
      const pr = await fetch('http://localhost:8080/api/player/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: this.playerName, chosenBird: this.chosenBird })
      })
      const player = await pr.json()
      await fetch('http://localhost:8080/api/score/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: player.id, levelNumber: 1,
          score: this.score, eggsSaved: this.eggsCollected,
          timeSeconds: 180 - this.timeLeft
        })
      })
    } catch (e) {
      console.log('Score not saved — backend offline')
    }
  }
  endGame(escaped) {
    if (this.gameEnding) return
    this.gameEnding = true
    if (this.terminal) this.terminal.destroy()
    this.saveScore()
    this.scene.stop('UIScene')
    this.time.delayedCall(400, () => this.scene.start('MenuScene'))
  }
  update() {
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
    const hw = 16
    const leftTile = Math.floor((nextX - hw) / this.TILE)
    const rightTile = Math.floor((nextX + hw) / this.TILE)
    const topTile = Math.floor((nextY - hw) / this.TILE)
    const bottomTile = Math.floor((nextY + hw) / this.TILE)
    const curRow = Math.floor(this.player.y / this.TILE)
    const curCol = Math.floor(this.player.x / this.TILE)

    if (vx < 0 && this.isWall(leftTile, curRow)) vx = 0
    if (vx > 0 && this.isWall(rightTile, curRow)) vx = 0
    if (vy < 0 && this.isWall(curCol, topTile)) vy = 0
    if (vy > 0 && this.isWall(curCol, bottomTile)) vy = 0

    this.player.setVelocity(vx, vy)

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.useWeapon()
    }

    // Monster AI
    this.monsterList.forEach(m => {
      if (!m.alive || !m.body || !m.body.active) return

      if (m.frozen) {
        this.drawMonster(m.graphic, m.body.x, m.body.y, true)
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
        this.drawMonster(m.graphic, m.body.x, m.body.y, false)
        this.drawHPBar(m.hpBar, m.body.x, m.body.y - 28, m.hp, m.maxHp)
        return
      }

      const distToPlayer = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, m.body.x, m.body.y
      )

      const chaseRange = m.alwaysChase ? 9999 :
        this.stealthMode ? 0 :
          this.evolutionStage >= 2 ? 160 : 200
      const attackRange = 36

      if (distToPlayer < chaseRange) {
        m.chasing = true
        m.alert.setVisible(true)
        m.alert.setPosition(m.body.x, m.body.y - 42)

        const angle = Phaser.Math.Angle.Between(
          m.body.x, m.body.y, this.player.x, this.player.y
        )
        const ms = 85
        const mvx = Math.cos(angle) * ms
        const mvy = Math.sin(angle) * ms
        const nextCol = Math.floor((m.body.x + mvx * 0.05) / this.TILE)
        const nextRow = Math.floor((m.body.y + mvy * 0.05) / this.TILE)
        const mc = Math.floor(m.body.x / this.TILE)
        const mr = Math.floor(m.body.y / this.TILE)

        m.body.setVelocity(
          this.isWall(nextCol, mr) ? 0 : mvx,
          this.isWall(mc, nextRow) ? 0 : mvy
        )

        if (distToPlayer < attackRange && !this.playerHitCooldown) {
          this.playerHitCooldown = true
          this.playerHP--
          this.cameras.main.shake(200, 0.008)
          this.player.setTint(0xff0000)
          this.showFloatingText(this.player.x, this.player.y - 30, '💔 -1 Heart', '#ff0000')
          this.time.delayedCall(400, () => {
            this.player.clearTint()
            if (this.evolutionStage === 2) this.player.setTint(0xaaffaa)
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
        }
      }

      this.drawMonster(m.graphic, m.body.x, m.body.y, false)
      this.drawHPBar(m.hpBar, m.body.x, m.body.y - 28, m.hp, m.maxHp)
    })

    // Egg collection
    this.eggList.forEach(e => {
      if (e.collected) return
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, e.x, e.y
      )
      if (dist < 34) {
        e.collected = true
        e.graphic.destroy()
        this.eggsCollected++
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
          this.showFloatingText(this.player.x, this.player.y - 30, '🌱 +100', '#ffffff')
        }
      }
    })

    // Weapon pickup
    this.weaponList.forEach(w => {
      if (w.collected) return
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, w.x, w.y
      )
      if (dist < 32) {
        w.collected = true
        w.bg.destroy()
        w.label.destroy()
        w.desc.destroy()
        this.currentWeapon = w.type
        const labels = {
          bomb: '💣 BOMB equipped!', ice: '❄️ ICE equipped!',
          lightning: '⚡ LIGHTNING equipped!', boomerang: '🪃 BOOMERANG equipped!'
        }
        this.showFloatingText(this.player.x, this.player.y - 30, labels[w.type], '#ffffff')
      }
    })

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
    if (this.isMoving) {
      if (this.bobTimer > 8) {
        this.player.setDisplaySize((this.TILE + 8) + 5, (this.TILE + 8) - 5)
      } else {
        this.player.setDisplaySize((this.TILE + 8) - 2, (this.TILE + 8) + 5)
      }
      if (this.bobTimer > 15) this.bobTimer = 0
    } else {
      this.player.setDisplaySize(this.TILE + 8, this.TILE + 8)
    }
  }
}
