import Phaser from 'phaser'

export class UIScene extends Phaser.Scene {
  constructor() { super('UIScene') }

  init(data) { this.gameScene = data.gameScene }

  preload() {
    if (!this.textures.exists('heart')) {
      this.load.image('heart', 'resource/ui/heart.png')
    }
  }

  create() {
    const { width, height } = this.scale

    // Top bar
    // Top HUD bar
    const bar = this.add.graphics()
    bar.fillStyle(0x071407, 0.82)
    bar.fillRect(0, 0, width, 58)
    bar.lineStyle(2, 0x88cc66, 0.45)
    bar.lineBetween(0, 58, width, 58)

    // Score
    this.scoreText = this.add.text(16, 8, 'Score: 0', {
      fontSize: '17px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    })

    // Hearts
    this.heartsText = this.add.text(16, 32, '❤️❤️❤️❤️❤️', {
      fontSize: '17px',
      stroke: '#000000',
      strokeThickness: 3
    })

    this.heartSprites = []
    if (this.textures.exists('heart')) {
      for (let i = 0; i < 5; i++) {
        const spr = this.add.image(24 + i * 21, 40, 'heart')
        spr.setDisplaySize(18, 18)
        spr.setDepth(10)
        this.heartSprites.push(spr)
      }
      this.heartsText.setVisible(false)
    } else {
      this.heartsText.setVisible(true)
    }

    // Shield status HUD (centered under timer)
    this.shieldHudText = this.add.text(width / 2, 40, '', {
      fontSize: '11px',
      fontFamily: 'Arial Black',
      color: '#00ffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0).setVisible(false)

    // Saplings
    this.eggText = this.add.text(220, 17, '🌱 0', {
      fontSize: '18px',
      fontFamily: 'Arial Black',
      color: '#aaff77',
      stroke: '#000000',
      strokeThickness: 3
    })

    this.animalText = this.add.text(285, 17, '🐾 0', {
      fontSize: '18px',
      fontFamily: 'Arial Black',
      color: '#aaffaa',
      stroke: '#000000',
      strokeThickness: 3
    })
    // Stage
    this.evoText = this.add.text(390, 17, '⭐ Stage 1', {
      fontSize: '18px',
      fontFamily: 'Arial Black',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 3
    })

    // Timer, centered
    this.timerText = this.add.text(width / 2, 17, '⏱ 180s', {
      fontSize: '19px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0)

    // Weapon
    this.weaponText = this.add.text(width - 18, 8, '🔫 Normal', {
      fontSize: '15px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'right'
    }).setOrigin(1, 0)

    // Bird + player name
    this.infoText = this.add.text(width - 18, 32, '', {
      fontSize: '13px',
      fontFamily: 'Arial Black',
      color: '#aaffaa',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'right'
    }).setOrigin(1, 0)

    // Bottom hint bar
    const bot = this.add.graphics()
    bot.fillStyle(0x000000, 0.5)
    bot.fillRect(0, height - 14, width, 14)
    this.add.text(width / 2, height - 12,
      'Hearts in monster dens: press H (-100)   •   Collect 🛡️ Shield for 10s Invisibility   •   Rescue animals & escape', {
      fontSize: '9px', fontFamily: 'Arial', color: '#d8ffd0'
    }).setOrigin(0.5, 0)

    // Golden egg bar
    this.goldenBar = this.add.graphics()

    // Minimap
    this.MM_X = width - 170
    this.MM_Y = height - 24
    this.MM_W = 160
    this.MM_H = 120
    this.MM_BORDER = 6
    const mmBg = this.add.graphics()
    mmBg.fillStyle(0x000000, 0.7)
    mmBg.fillRoundedRect(
      this.MM_X - this.MM_BORDER,
      this.MM_Y - this.MM_H - this.MM_BORDER,
      this.MM_W + this.MM_BORDER * 2,
      this.MM_H + this.MM_BORDER * 2, 6
    )
    mmBg.lineStyle(1, 0x445544, 1)
    mmBg.strokeRoundedRect(
      this.MM_X - this.MM_BORDER,
      this.MM_Y - this.MM_H - this.MM_BORDER,
      this.MM_W + this.MM_BORDER * 2,
      this.MM_H + this.MM_BORDER * 2, 6
    )
    this.add.text(this.MM_X, this.MM_Y - this.MM_H - 8, 'MAP', {
      fontSize: '8px', fontFamily: 'Arial Black',
      color: '#445544', letterSpacing: 2
    })

    this.mmGraphic = this.add.graphics()
  }

  drawHearts() {
    const gs = this.gameScene
    if (!gs) return

    const hp = gs.playerHP !== undefined ? gs.playerHP : 0
    const maxHp = gs.maxHP || 5

    if (this.heartSprites && this.heartSprites.length > 0) {
      this.heartsText.setVisible(false)
      for (let i = 0; i < this.heartSprites.length; i++) {
        const spr = this.heartSprites[i]
        if (i < hp) {
          spr.setAlpha(1.0)
          spr.clearTint()
        } else {
          spr.setAlpha(0.28)
          spr.setTint(0x222222)
        }
      }
    } else {
      this.heartsText.setVisible(true)
      let str = ''
      for (let i = 0; i < maxHp; i++) {
        str += i < hp ? '❤️' : '🖤'
      }
      this.heartsText.setText(str)
      this.heartsText.setAlpha(1)
    }
  }

  drawMinimap() {
    const g = this.mmGraphic
    const gs = this.gameScene
    if (!gs || !gs.mapData || !g) return

    g.clear()

    const rows = gs.mapRows || gs.mapData.length
    const cols = gs.mapCols || (gs.mapData[0] ? gs.mapData[0].length : 50)
    const cellW = this.MM_W / cols
    const cellH = this.MM_H / rows
    const ox = this.MM_X
    const oy = this.MM_Y - this.MM_H

    // Tiles
    for (let row = 0; row < rows; row++) {
      if (!gs.mapData[row]) continue
      for (let col = 0; col < cols; col++) {
        const t = gs.mapData[row][col]
        let color = 0x2d5a1b
        if (t === 1) color = 0x1a3a0a
        if (t === 2) color = 0x1a3a6e
        if (t === 3) color = 0x888888
        if (t === 4) color = 0x4a3000
        if (t === 5) color = 0xc8a96e
        g.fillStyle(color, 1)
        g.fillRect(
          ox + col * cellW,
          oy + row * cellH,
          Math.max(cellW, 1),
          Math.max(cellH, 1)
        )
      }
    }

    // Eggs
    if (gs.eggList) {
      gs.eggList.forEach(e => {
        if (e.collected) return
        const ex = ox + (e.x / (cols * gs.TILE)) * this.MM_W
        const ey = oy + (e.y / (rows * gs.TILE)) * this.MM_H
        const eggColors = {
          normal: 0xffffff, fire: 0xFF4500,
          thunder: 0xFFD700, golden: 0xFFD700
        }
        g.fillStyle(eggColors[e.type] || 0xffffff, 1)
        g.fillCircle(ex, ey, 2)
      })
    }

    // Weapons
    if (gs.weaponList) {
      gs.weaponList.forEach(w => {
        if (w.collected) return
        const wx = ox + (w.x / (cols * gs.TILE)) * this.MM_W
        const wy = oy + (w.y / (rows * gs.TILE)) * this.MM_H
        const wColors = {
          bomb: 0xFF6600, ice: 0x00BFFF,
          lightning: 0xFFD700, boomerang: 0xC8A25A
        }
        g.fillStyle(wColors[w.type] || 0xffffff, 1)
        g.fillRect(wx - 2, wy - 2, 4, 4)
      })
    }

    // Shields
    if (gs.shieldList) {
      gs.shieldList.forEach(s => {
        if (s.collected) return
        const sx = ox + (s.x / (cols * gs.TILE)) * this.MM_W
        const sy = oy + (s.y / (rows * gs.TILE)) * this.MM_H
        g.fillStyle(0x00ffff, 1)
        g.fillRect(sx - 2, sy - 2, 4, 4)
      })
    }

    // Portal
    if (gs.portalCol !== undefined && gs.portalRow !== undefined) {
      const portalX = ox + ((gs.portalCol * gs.TILE + gs.TILE / 2) / (cols * gs.TILE)) * this.MM_W
      const portalY = oy + ((gs.portalRow * gs.TILE + gs.TILE / 2) / (rows * gs.TILE)) * this.MM_H
      g.fillStyle(0xAA99FF, 1)
      g.fillCircle(portalX, portalY, 3)
      g.lineStyle(1, 0xAA99FF, 0.5)
      g.strokeCircle(portalX, portalY, 5)
    }

    // Monsters
    if (gs.monsterList) {
      gs.monsterList.forEach(m => {
        if (!m || !m.alive || !m.body || !m.body.active || m.body.x === undefined) return
        const mx = ox + (m.body.x / (cols * gs.TILE)) * this.MM_W
        const my = oy + (m.body.y / (rows * gs.TILE)) * this.MM_H
        g.fillStyle(m.chasing ? 0xff0000 : 0xcc2222, 1)
        g.fillCircle(mx, my, m.chasing ? 3 : 2)
      })
    }

    // Player
    if (gs.player) {
      const px = ox + (gs.player.x / (cols * gs.TILE)) * this.MM_W
      const py = oy + (gs.player.y / (rows * gs.TILE)) * this.MM_H
      g.fillStyle(0x000000, 0.5)
      g.fillCircle(px, py, 5)
      g.fillStyle(0xffffff, 1)
      g.fillCircle(px, py, 4)
      const dirOffsets = {
        right: [4, 0], left: [-4, 0], up: [0, -4], down: [0, 4]
      }
      const [dx, dy] = dirOffsets[gs.playerDir || 'right']
      g.fillStyle(gs.birdColor || 0xFF4500, 1)
      g.fillCircle(px + dx, py + dy, 2)
    }

    // Camera viewport
    const cam = (gs.cameras && gs.cameras.main) ? gs.cameras.main : null
    if (cam) {
      const vx = ox + (cam.scrollX / (cols * gs.TILE)) * this.MM_W
      const vy = oy + (cam.scrollY / (rows * gs.TILE)) * this.MM_H
      const vw = (cam.width / (cols * gs.TILE)) * this.MM_W
      const vh = (cam.height / (rows * gs.TILE)) * this.MM_H
      g.lineStyle(1, 0xffffff, 0.25)
      g.strokeRect(vx, vy, vw, vh)
    }
  }

  update() {
    if (!this.gameScene) return

    this.scoreText.setText('Score: ' + this.gameScene.score)
    this.eggText.setText('🌱 ' + this.gameScene.eggsCollected)
    const animalCount = (this.gameScene.animalsSaved !== undefined)
      ? this.gameScene.animalsSaved
      : (this.gameScene.wildlifeJournal ? this.gameScene.wildlifeJournal.length : 0)
    this.animalText.setText('🐾 ' + animalCount)

    const stages = { 1: '⭐ Stage 1', 2: '✨ Stage 2', 3: '🔥 EVOLVED' }
    this.evoText.setText(stages[this.gameScene.evolutionStage] || '⭐ Stage 1')

    const t = Math.max(0, this.gameScene.timeLeft)
    this.timerText.setText('⏱ ' + t + 's')
    this.timerText.setStyle({
      color: t <= 30 ? '#ff4444' : '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    })

    const wLabels = {
      normal: '🔫 Normal',
      fire: '🔥 Fire',
      ice: '❄️ Ice',
      lightning: '⚡ Electric',
      bomb: '💣 Bomb',
      boomerang: '🪃 Boomerang',
      wind: '🌪 Wind'
    }
    this.weaponText.setText(
      wLabels[this.gameScene.currentWeapon] || '🔫 Normal'
    )

    this.infoText.setText(
      this.gameScene.chosenBird + ' | ' + this.gameScene.playerName
    )

    // Golden egg bar
    this.goldenBar.clear()
    const ge = Math.min(this.gameScene.goldenEggs, 3)
    if (ge > 0 && this.gameScene.evolutionStage < 3) {
      this.goldenBar.fillStyle(0x333300, 0.7)
      this.goldenBar.fillRect(395, 36, 80, 6)
      this.goldenBar.fillStyle(0xFFD700, 1)
      this.goldenBar.fillRect(395, 36, (ge / 3) * 80, 6)
    }

    // Shield status HUD
    if (this.shieldHudText && this.gameScene) {
      if (this.gameScene.shieldActive && this.gameScene.shieldTimeRemaining > 0) {
        this.shieldHudText.setVisible(true)
        this.shieldHudText.setText(`🛡️ INVISIBLE SHIELD: ${this.gameScene.shieldTimeRemaining}s`)
      } else {
        this.shieldHudText.setVisible(false)
      }
    }


    // Hearts + minimap
    this.drawHearts()
    this.drawMinimap()
  }
}
