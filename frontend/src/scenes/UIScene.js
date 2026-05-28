import Phaser from 'phaser'

export class UIScene extends Phaser.Scene {
  constructor() { super('UIScene') }

  init(data) { this.gameScene = data.gameScene }

  create() {
    const { width, height } = this.scale

    // Top bar
    const bar = this.add.graphics()
    bar.fillStyle(0x000000, 0.65)
    bar.fillRect(0, 0, width, 48)

    this.scoreText = this.add.text(12, 12, 'Score: 0', {
      fontSize: '16px', fontFamily: 'Arial Black', color: '#ffffff'
    })

    this.eggText = this.add.text(175, 12, '🥚 0', {
      fontSize: '15px', fontFamily: 'Arial Black', color: '#aaffaa'
    })

    this.evoText = this.add.text(245, 12, '⭐ Stage 1', {
      fontSize: '15px', fontFamily: 'Arial Black', color: '#FFD700'
    })

    this.timerText = this.add.text(width / 2, 12, '⏱ 180s', {
      fontSize: '17px', fontFamily: 'Arial Black', color: '#ffffff'
    }).setOrigin(0.5, 0)

    this.weaponText = this.add.text(width - 12, 12, '🔫 Normal', {
      fontSize: '13px', fontFamily: 'Arial Black', color: '#ffffff'
    }).setOrigin(1, 0)

    this.infoText = this.add.text(width - 12, 30, '', {
      fontSize: '11px', fontFamily: 'Arial', color: '#aaffaa'
    }).setOrigin(1, 0)

    // Hearts display
    this.heartsText = this.add.text(12, 32, '❤️❤️❤️', {
      fontSize: '14px'
    })

    // Bottom hint bar
    const bot = this.add.graphics()
    bot.fillStyle(0x000000, 0.5)
    bot.fillRect(0, height - 14, width, 14)
    this.add.text(width / 2, height - 12,
      'WASD = Move   SPACE = Attack   Walk over weapons to pick up   Reach the portal!', {
      fontSize: '9px', fontFamily: 'Arial', color: '#445544'
    }).setOrigin(0.5, 0)

    // Golden egg bar
    this.goldenBar = this.add.graphics()

    // Minimap
    this.MM_X      = 10
    this.MM_Y      = height - 14 - 10
    this.MM_W      = 160
    this.MM_H      = 120
    this.MM_BORDER = 2

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

    const hp    = gs.playerHP  || 0
    const maxHp = gs.maxHP     || 3
    let str = ''

    for (let i = 0; i < maxHp; i++) {
      str += i < hp ? '❤️' : '🖤'
    }

    this.heartsText.setText(str)

    // Flash hearts red when low
    if (hp === 1) {
      this.heartsText.setAlpha(
        0.5 + Math.sin(Date.now() / 150) * 0.5
      )
    } else {
      this.heartsText.setAlpha(1)
    }
  }

  drawMinimap() {
    const g  = this.mmGraphic
    const gs = this.gameScene
    if (!gs || !gs.mapData) return

    g.clear()

    const rows  = gs.mapRows
    const cols  = gs.mapCols
    const cellW = this.MM_W / cols
    const cellH = this.MM_H / rows
    const ox    = this.MM_X
    const oy    = this.MM_Y - this.MM_H

    // Tiles
    for (let row = 0; row < rows; row++) {
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
    gs.eggList.forEach(e => {
      if (e.collected) return
      const ex = ox + (e.x / (gs.mapCols * gs.TILE)) * this.MM_W
      const ey = oy + (e.y / (gs.mapRows * gs.TILE)) * this.MM_H
      const eggColors = {
        normal:0xffffff, fire:0xFF4500,
        thunder:0xFFD700, golden:0xFFD700
      }
      g.fillStyle(eggColors[e.type] || 0xffffff, 1)
      g.fillCircle(ex, ey, 2)
    })

    // Weapons
    gs.weaponList.forEach(w => {
      if (w.collected) return
      const wx = ox + (w.x / (gs.mapCols * gs.TILE)) * this.MM_W
      const wy = oy + (w.y / (gs.mapRows * gs.TILE)) * this.MM_H
      const wColors = {
        bomb:0xFF6600, ice:0x00BFFF,
        lightning:0xFFD700, boomerang:0xC8A25A
      }
      g.fillStyle(wColors[w.type] || 0xffffff, 1)
      g.fillRect(wx - 2, wy - 2, 4, 4)
    })

    // Portal
    const portalX = ox + ((gs.portalCol * gs.TILE + gs.TILE/2) / (gs.mapCols * gs.TILE)) * this.MM_W
    const portalY = oy + ((gs.portalRow * gs.TILE + gs.TILE/2) / (gs.mapRows * gs.TILE)) * this.MM_H
    g.fillStyle(0xAA99FF, 1)
    g.fillCircle(portalX, portalY, 3)
    g.lineStyle(1, 0xAA99FF, 0.5)
    g.strokeCircle(portalX, portalY, 5)

    // Monsters
    gs.monsterList.forEach(m => {
      if (!m.alive || !m.body || !m.body.active) return
      const mx = ox + (m.body.x / (gs.mapCols * gs.TILE)) * this.MM_W
      const my = oy + (m.body.y / (gs.mapRows * gs.TILE)) * this.MM_H
      g.fillStyle(m.chasing ? 0xff0000 : 0xcc2222, 1)
      g.fillCircle(mx, my, m.chasing ? 3 : 2)
    })

    // Player
    if (gs.player) {
      const px = ox + (gs.player.x / (gs.mapCols * gs.TILE)) * this.MM_W
      const py = oy + (gs.player.y / (gs.mapRows * gs.TILE)) * this.MM_H
      g.fillStyle(0x000000, 0.5)
      g.fillCircle(px, py, 5)
      g.fillStyle(0xffffff, 1)
      g.fillCircle(px, py, 4)
      const dirOffsets = {
        right:[4,0], left:[-4,0], up:[0,-4], down:[0,4]
      }
      const [dx, dy] = dirOffsets[gs.playerDir || 'right']
      g.fillStyle(gs.birdColor || 0xFF4500, 1)
      g.fillCircle(px + dx, py + dy, 2)
    }

    // Camera viewport
    const cam = gs.cameras.main
    const vx  = ox + (cam.scrollX / (gs.mapCols * gs.TILE)) * this.MM_W
    const vy  = oy + (cam.scrollY / (gs.mapRows * gs.TILE)) * this.MM_H
    const vw  = (cam.width  / (gs.mapCols * gs.TILE)) * this.MM_W
    const vh  = (cam.height / (gs.mapRows * gs.TILE)) * this.MM_H
    g.lineStyle(1, 0xffffff, 0.25)
    g.strokeRect(vx, vy, vw, vh)
  }

  update() {
    if (!this.gameScene) return

    this.scoreText.setText('Score: ' + this.gameScene.score)
    this.eggText.setText('🥚 ' + this.gameScene.eggsCollected)

    const stages = { 1:'⭐ Stage 1', 2:'✨ Stage 2', 3:'🔥 EVOLVED' }
    this.evoText.setText(stages[this.gameScene.evolutionStage] || '⭐ Stage 1')

    const t = this.gameScene.timeLeft
    this.timerText.setText('⏱ ' + t + 's')
    this.timerText.setStyle({ color: t <= 30 ? '#ff4444' : '#ffffff' })

    const wLabels = {
      normal:'🔫 Normal', bomb:'💣 Bomb',
      ice:'❄️ Ice', lightning:'⚡ Lightning',
      boomerang:'🪃 Boomerang'
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
      this.goldenBar.fillRect(395, 36, (ge/3)*80, 6)
    }

    // Hearts + minimap
    this.drawHearts()
    this.drawMinimap()
  }
}