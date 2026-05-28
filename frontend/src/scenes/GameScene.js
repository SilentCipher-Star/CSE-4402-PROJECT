
import Phaser from 'phaser'

export class GameScene extends Phaser.Scene {
  constructor() { super('GameScene') }

  init(data) {
    this.playerName     = data.playerName  || 'Adventurer'
    this.chosenBird     = data.chosenBird  || 'Ember'
    this.score          = 0
    this.eggsCollected  = 0
    this.evolutionStage = 1
    this.goldenEggs     = 0
    this.isAttacking    = false
    this.playerDir      = 'right'
    this.timeLeft       = 180
    this.bobTimer       = 0
    this.isMoving       = false
    this.currentWeapon  = 'normal'
    this.playerHitCooldown = false
    this.frozenMonsters = new Set()
    this.playerHP = 3
    this.maxHP    = 3
  }

  create() {
    this.TILE = 48

    this.mapData = this.parseMap()
    this.mapRows = this.mapData.length
    this.mapCols = this.mapData[0].length
    this.worldW  = this.mapCols * this.TILE
    this.worldH  = this.mapRows * this.TILE

    const birdColors = {
      Ember: 0xFF4500, Frost: 0x00BFFF,
      Volt:  0xFFD700, Shade: 0xBF5FFF, Gale: 0x00FF88
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
    this.portalCol = 18
    this.portalRow = 20
    this.drawPortal()

    this.player = this.physics.add.sprite(
      1 * this.TILE + this.TILE/2,
      1 * this.TILE + this.TILE/2,
      'bird_right'
    )
    this.player.setDisplaySize(this.TILE + 8, this.TILE + 8)
    this.player.setCollideWorldBounds(true)
    this.player.body.setSize(28, 28)

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)

    this.wasd = this.input.keyboard.addKeys({
      up:    Phaser.Input.Keyboard.KeyCodes.W,
      down:  Phaser.Input.Keyboard.KeyCodes.S,
      left:  Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    })
    this.cursors  = this.input.keyboard.createCursorKeys()
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    )

    this.time.addEvent({
      delay: 1000,
      callback: () => { if (this.timeLeft > 0) this.timeLeft-- },
      repeat: 179
    })

    this.scene.launch('UIScene', { gameScene: this })
  }

  parseMap() {
    const raw = [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,5,5,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,5,5,5,5,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,5,5,5,5,5,5,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,5,5,5,5,5,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,5,5,5,5,5,5,5,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,5,5,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,5,5,5,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,5,5,5,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,5,5,5,5,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,5,5,5,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ]
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
    return t === 1 || t === 2
  }

  spawnEggs() {
    const positions = [
      { col:1,  row:3,  type:'normal'  },
      { col:4,  row:4,  type:'fire'    },
      { col:6,  row:6,  type:'normal'  },
      { col:10, row:7,  type:'thunder' },
      { col:12, row:10, type:'normal'  },
      { col:16, row:13, type:'golden'  },
      { col:23, row:13, type:'fire'    },
      { col:21, row:17, type:'normal'  },
      { col:18, row:20, type:'thunder' },
    ]
    const eggColors = {
      normal:0xffffff, fire:0xFF4500,
      thunder:0xFFD700, golden:0xFFD700
    }
    positions.forEach(e => {
      const x = e.col * this.TILE + this.TILE/2
      const y = e.row * this.TILE + this.TILE/2
      if (this.isWall(e.col, e.row)) return
      const g = this.add.graphics()
      g.fillStyle(eggColors[e.type], 1)
      g.fillEllipse(x, y, 20, 26)
      g.fillStyle(0xffffff, 0.4)
      g.fillEllipse(x - 4, y - 6, 7, 9)
      if (e.type !== 'normal') {
        const glow = this.add.circle(x, y, 20, eggColors[e.type], 0.25)
        this.tweens.add({
          targets: glow, scaleX:2, scaleY:2, alpha:0,
          duration:1000, repeat:-1
        })
      }
      this.tweens.add({
        targets: g, y: '-=7', duration:850,
        yoyo:true, repeat:-1, ease:'Sine.easeInOut'
      })
      this.eggList.push({ graphic:g, x, y, type:e.type, collected:false })
    })
  }

  spawnMonsters() {
    const positions = [
      { col:4,  row:4  },
      { col:12, row:8  },
      { col:16, row:14 },
      { col:21, row:18 },
      { col:15, row:24 },
    ]
    positions.forEach((m, i) => {
      if (this.isWall(m.col, m.row)) return
      const x = m.col * this.TILE + this.TILE/2
      const y = m.row * this.TILE + this.TILE/2
      const g = this.add.graphics()
      this.drawMonster(g, x, y)
      const body = this.physics.add.image(x, y, null).setVisible(false)
      body.body.setSize(28, 28)
      body.setCollideWorldBounds(true)
      body.setVelocity(60, 0)
      const hpBar = this.add.graphics()
      this.drawHPBar(hpBar, x, y - 28, 2, 2)
      const alert = this.add.text(x, y - 40, '❗', {
        fontSize:'16px'
      }).setOrigin(0.5).setVisible(false)
      this.monsterList.push({
        graphic:g, body, hpBar, alert,
        hp:2, maxHp:2, alive:true,
        chasing:false, patrolTimer:0, frozen:false
      })
    })
  }

  spawnWeapons() {
    const weapons = [
      { col:6,  row:6,  type:'bomb',      label:'💣', color:0xFF6600, desc:'Area explosion' },
      { col:12, row:10, type:'ice',        label:'❄️', color:0x00BFFF, desc:'Freeze enemies' },
      { col:16, row:13, type:'lightning',  label:'⚡', color:0xFFD700, desc:'Chain 3 enemies' },
      { col:21, row:17, type:'boomerang',  label:'🪃', color:0xC8A25A, desc:'Double hit'     },
    ]
    weapons.forEach(w => {
      if (this.isWall(w.col, w.row)) return
      const x = w.col * this.TILE + this.TILE/2
      const y = w.row * this.TILE + this.TILE/2

      // Weapon icon
      const bg = this.add.circle(x, y, 20, w.color, 0.9)
      const label = this.add.text(x, y, w.label, {
        fontSize:'20px'
      }).setOrigin(0.5)
      const desc = this.add.text(x, y + 28, w.desc, {
        fontSize:'9px', fontFamily:'Arial',
        color:'#ffffff',
        stroke:'#000000', strokeThickness:2
      }).setOrigin(0.5)

      // Pulse
      this.tweens.add({
        targets: bg,
        scaleX:1.3, scaleY:1.3, alpha:0.5,
        duration:600, yoyo:true, repeat:-1
      })

      this.weaponList.push({
        bg, label, desc, x, y,
        type:w.type, collected:false
      })
    })
  }

  drawMonster(g, x, y, frozen) {
    g.clear()
    const bodyColor = frozen ? 0x88CCFF : 0x8B0000
    const highlightColor = frozen ? 0xAAEEFF : 0xcc2222
    g.fillStyle(0x000000, 0.2)
    g.fillEllipse(x, y + 18, 34, 10)
    g.fillStyle(bodyColor, 1)
    g.fillCircle(x, y, 17)
    g.fillStyle(highlightColor, 0.5)
    g.fillCircle(x - 5, y - 6, 9)
    g.fillStyle(frozen ? 0xffffff : 0xff4444, 1)
    g.fillCircle(x - 6, y - 3, 5)
    g.fillCircle(x + 6, y - 3, 5)
    g.fillStyle(0x000000, 1)
    g.fillCircle(x - 5, y - 3, 2)
    g.fillCircle(x + 7, y - 3, 2)
    g.lineStyle(2, 0x000000, 1)
    g.beginPath()
    g.moveTo(x - 9, y - 9)
    g.lineTo(x - 3, y - 6)
    g.strokePath()
    g.beginPath()
    g.moveTo(x + 9, y - 9)
    g.lineTo(x + 3, y - 6)
    g.strokePath()
    g.lineStyle(2, frozen ? 0x00BFFF : 0xff0000, 1)
    g.beginPath()
    g.arc(x, y + 5, 6, 0.2, Math.PI - 0.2)
    g.strokePath()
  }

  drawHPBar(g, x, y, hp, maxHp) {
    g.clear()
    g.fillStyle(0x440000, 1)
    g.fillRect(x - 16, y, 32, 5)
    g.fillStyle(hp > 1 ? 0xff4444 : 0xff0000, 1)
    g.fillRect(x - 16, y, (hp/maxHp)*32, 5)
  }

  drawPortal() {
    this.portalGfx.clear()
    const x = this.portalCol * this.TILE + this.TILE/2
    const y = this.portalRow * this.TILE + this.TILE/2
    const a = this.portalAngle
    this.portalGfx.lineStyle(5, 0x7F77DD, 0.25)
    this.portalGfx.strokeCircle(x, y, 30)
    this.portalGfx.lineStyle(3, 0xAA99FF, 0.5)
    this.portalGfx.strokeCircle(x, y, 22)
    for (let i = 0; i < 4; i++) {
      const angle = a + (i * Math.PI/2)
      this.portalGfx.fillStyle(0xffffff, 0.9)
      this.portalGfx.fillCircle(
        x + Math.cos(angle)*22,
        y + Math.sin(angle)*22, 3
      )
    }
    this.portalGfx.fillStyle(0x7F77DD, 0.5)
    this.portalGfx.fillCircle(x, y, 13)
    this.portalGfx.fillStyle(0xffffff, 0.4)
    this.portalGfx.fillCircle(x, y, 6)
  }

  showFloatingText(worldX, worldY, msg, color) {
    const t = this.add.text(worldX, worldY, msg, {
      fontSize:'14px', fontFamily:'Arial Black', color
    }).setOrigin(0.5)
    this.tweens.add({
      targets:t, y:worldY - 55, alpha:0,
      duration:1100, onComplete:()=>t.destroy()
    })
  }

  checkEvolution() {
  if (this.goldenEggs >= 3 && this.evolutionStage < 3) {
    this.evolutionStage = 3
    this.maxHP = 4
    this.playerHP = Math.min(this.playerHP + 1, 4) // bonus heart on evolve
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

    switch(this.currentWeapon) {

      case 'normal': {
        // Shockwave — hits all in range
        const sw = this.add.graphics()
        sw.lineStyle(3, this.birdColor, 0.9)
        sw.strokeCircle(this.player.x, this.player.y, 10)
        this.tweens.add({
          targets:sw, scaleX:range/10, scaleY:range/10, alpha:0,
          duration:350, onComplete:()=>sw.destroy()
        })
        this.hitMonstersInRange(this.player.x, this.player.y, range, 1, this.birdColor)
        break
      }

      case 'bomb': {
        // Big explosion — huge range, 2 damage
        const boom = this.add.graphics()
        boom.fillStyle(0xFF6600, 0.7)
        boom.fillCircle(this.player.x, this.player.y, 20)
        this.tweens.add({
          targets:boom, scaleX:8, scaleY:8, alpha:0,
          duration:500, onComplete:()=>boom.destroy()
        })
        // Shockwave ring
        const ring = this.add.graphics()
        ring.lineStyle(4, 0xFF6600, 1)
        ring.strokeCircle(this.player.x, this.player.y, 10)
        this.tweens.add({
          targets:ring, scaleX:15, scaleY:15, alpha:0,
          duration:500, onComplete:()=>ring.destroy()
        })
        this.hitMonstersInRange(this.player.x, this.player.y, range * 1.8, 2, 0xFF6600)
        // Screen shake
        this.cameras.main.shake(300, 0.01)
        break
      }

      case 'ice': {
        // Freeze all in range
        const iceRing = this.add.graphics()
        iceRing.lineStyle(3, 0x00BFFF, 0.9)
        iceRing.strokeCircle(this.player.x, this.player.y, 10)
        this.tweens.add({
          targets:iceRing, scaleX:range/10, scaleY:range/10, alpha:0,
          duration:400, onComplete:()=>iceRing.destroy()
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
        // Chain to 3 closest monsters
        const sorted = this.monsterList
          .filter(m => m.alive && m.body && m.body.active)
          .sort((a, b) =>
            Phaser.Math.Distance.Between(this.player.x, this.player.y, a.body.x, a.body.y) -
            Phaser.Math.Distance.Between(this.player.x, this.player.y, b.body.x, b.body.y)
          )
          .slice(0, 3)

        // Draw lightning arcs
        const lightning = this.add.graphics()
        lightning.lineStyle(3, 0xFFD700, 1)
        let lastX = this.player.x
        let lastY = this.player.y
        sorted.forEach(m => {
          // Jagged lightning line
          lightning.beginPath()
          lightning.moveTo(lastX, lastY)
          const midX = (lastX + m.body.x)/2 + Phaser.Math.Between(-20,20)
          const midY = (lastY + m.body.y)/2 + Phaser.Math.Between(-20,20)
          lightning.lineTo(midX, midY)
          lightning.lineTo(m.body.x, m.body.y)
          lightning.strokePath()
          lastX = m.body.x
          lastY = m.body.y
          m.hp--
          this.drawHPBar(m.hpBar, m.body.x, m.body.y-28, m.hp, m.maxHp)
          this.showFloatingText(m.body.x, m.body.y-20, '⚡ ZAP!', '#FFD700')
          if (m.hp <= 0) this.killMonster(m)
        })
        this.tweens.add({
          targets:lightning, alpha:0, duration:300,
          onComplete:()=>lightning.destroy()
        })
        if (sorted.length === 0) {
          this.showFloatingText(this.player.x, this.player.y-30, 'Miss!', '#888888')
        }
        break
      }

      case 'boomerang': {
        // Hits once going out, once coming back
        const bSw = this.add.graphics()
        bSw.lineStyle(3, 0xC8A25A, 0.9)
        bSw.strokeCircle(this.player.x, this.player.y, 10)
        this.tweens.add({
          targets:bSw, scaleX:range/10, scaleY:range/10, alpha:0,
          duration:250, onComplete:()=>bSw.destroy()
        })
        this.hitMonstersInRange(this.player.x, this.player.y, range, 1, 0xC8A25A)

        // Second hit after delay
        this.time.delayedCall(400, () => {
          const bSw2 = this.add.graphics()
          bSw2.lineStyle(3, 0xC8A25A, 0.9)
          bSw2.strokeCircle(this.player.x, this.player.y, 10)
          this.tweens.add({
            targets:bSw2, scaleX:range/10, scaleY:range/10, alpha:0,
            duration:250, onComplete:()=>bSw2.destroy()
          })
          this.hitMonstersInRange(this.player.x, this.player.y, range, 1, 0xC8A25A)
          this.showFloatingText(this.player.x, this.player.y-30, '🪃 Boomerang!', '#C8A25A')
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
        this.drawHPBar(m.hpBar, m.body.x, m.body.y-28, m.hp, m.maxHp)

        // Hit flash
        m.graphic.setAlpha(0.3)
        this.time.delayedCall(150, () => {
          if (m.graphic) m.graphic.setAlpha(1)
        })

        // Burst particles
        for (let i = 0; i < 8; i++) {
          const angle = (i/8) * Math.PI * 2
          const burst = this.add.graphics()
          burst.fillStyle(color, 1)
          burst.fillCircle(m.body.x, m.body.y, 4)
          this.tweens.add({
            targets:burst,
            x: m.body.x + Math.cos(angle) * Phaser.Math.Between(15,40),
            y: m.body.y + Math.sin(angle) * Phaser.Math.Between(15,40),
            alpha:0, scaleX:0.2, scaleY:0.2,
            duration: Phaser.Math.Between(200,500),
            onComplete:()=>burst.destroy()
          })
        }

        if (m.hp <= 0) {
          this.killMonster(m)
        } else {
          this.showFloatingText(m.body.x, m.body.y-20, '⚔️ Hit!', '#ffaaaa')
        }
      }
    })
    if (!hit && this.currentWeapon === 'normal') {
      this.showFloatingText(this.player.x, this.player.y-30, 'Miss!', '#888888')
    }
  }

  killMonster(m) {
    m.alive = false
    for (let i = 0; i < 10; i++) {
      const angle = (i/10) * Math.PI * 2
      const burst = this.add.graphics()
      burst.fillStyle(0xff2200, 1)
      burst.fillCircle(m.body.x, m.body.y, 5)
      this.tweens.add({
        targets:burst,
        x: m.body.x + Math.cos(angle) * Phaser.Math.Between(20,50),
        y: m.body.y + Math.sin(angle) * Phaser.Math.Between(20,50),
        alpha:0, scaleX:0.2, scaleY:0.2,
        duration: Phaser.Math.Between(300,600),
        onComplete:()=>burst.destroy()
      })
    }
    m.graphic.destroy()
    m.hpBar.destroy()
    m.alert.destroy()
    m.body.destroy()
    this.score += 200
    this.showFloatingText(m.body.x, m.body.y, '💥 +200', '#ff4444')
  }

  async saveScore() {
    try {
      const pr = await fetch('http://localhost:8080/api/player/create', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ name:this.playerName, chosenBird:this.chosenBird })
      })
      const player = await pr.json()
      await fetch('http://localhost:8080/api/score/save', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          playerId:player.id, levelNumber:1,
          score:this.score, eggsSaved:this.eggsCollected,
          timeSeconds:180 - this.timeLeft
        })
      })
    } catch(e) {
      console.log('Score not saved — backend offline')
    }
  }

  endGame(escaped) {
    this.saveScore()
    this.scene.stop('UIScene')
    this.time.delayedCall(400, () => this.scene.start('MenuScene'))
  }

  update() {
    const speed = this.evolutionStage >= 2 ? 190 : 140
    let vx = 0, vy = 0
    this.isMoving = false

    if (this.wasd.left.isDown || this.cursors.left.isDown) {
      vx = -speed; this.playerDir = 'left'
      this.player.setTexture('bird_left'); this.isMoving = true
    } else if (this.wasd.right.isDown || this.cursors.right.isDown) {
      vx = speed; this.playerDir = 'right'
      this.player.setTexture('bird_right'); this.isMoving = true
    }
    if (this.wasd.up.isDown || this.cursors.up.isDown) {
      vy = -speed; this.playerDir = 'up'
      this.player.setTexture('bird_back'); this.isMoving = true
    } else if (this.wasd.down.isDown || this.cursors.down.isDown) {
      vy = speed; this.playerDir = 'down'
      this.player.setTexture('bird_right'); this.isMoving = true
    }

    const nextX = this.player.x + (vx * 0.05)
    const nextY = this.player.y + (vy * 0.05)
    const hw = 16
    const leftTile   = Math.floor((nextX - hw) / this.TILE)
    const rightTile  = Math.floor((nextX + hw) / this.TILE)
    const topTile    = Math.floor((nextY - hw) / this.TILE)
    const bottomTile = Math.floor((nextY + hw) / this.TILE)
    const curRow = Math.floor(this.player.y / this.TILE)
    const curCol = Math.floor(this.player.x / this.TILE)

    if (vx < 0 && this.isWall(leftTile,  curRow))   vx = 0
    if (vx > 0 && this.isWall(rightTile, curRow))   vx = 0
    if (vy < 0 && this.isWall(curCol, topTile))      vy = 0
    if (vy > 0 && this.isWall(curCol, bottomTile))   vy = 0

    this.player.setVelocity(vx, vy)

    // SPACE = use weapon
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.useWeapon()
    }

    // Monster AI
    this.monsterList.forEach(m => {
      if (!m.alive || !m.body || !m.body.active) return
      if (m.frozen) {
        this.drawMonster(m.graphic, m.body.x, m.body.y, true)
        this.drawHPBar(m.hpBar, m.body.x, m.body.y-28, m.hp, m.maxHp)
        return
      }

      const distToPlayer = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, m.body.x, m.body.y
      )
      const chaseRange  = this.evolutionStage >= 2 ? 160 : 200
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
        const nextCol = Math.floor((m.body.x + mvx*0.05) / this.TILE)
        const nextRow = Math.floor((m.body.y + mvy*0.05) / this.TILE)
        const mc = Math.floor(m.body.x / this.TILE)
        const mr = Math.floor(m.body.y / this.TILE)
        m.body.setVelocity(
          this.isWall(nextCol, mr) ? 0 : mvx,
          this.isWall(mc, nextRow) ? 0 : mvy
        )
      if (distToPlayer < attackRange && !this.playerHitCooldown) {
  this.playerHitCooldown = true
  this.playerHP--

  // Screen shake on hit
  this.cameras.main.shake(200, 0.008)

  // Flash red
  this.player.setTint(0xff0000)

  this.showFloatingText(
    this.player.x, this.player.y - 30,
    '💔 -1 Heart', '#ff0000'
  )

  this.time.delayedCall(400, () => {
    this.player.clearTint()
    if (this.evolutionStage === 2) this.player.setTint(0xaaffaa)
    if (this.evolutionStage === 3) this.player.setTint(0xFFD700)
    this.playerHitCooldown = false
  })

  // Check death
  if (this.playerHP <= 0) {
    this.endGame(false)
  }
}
      } else {
        m.chasing = false
        m.alert.setVisible(false)
        m.patrolTimer = (m.patrolTimer || 0) + 1
        if (m.patrolTimer > 120) {
          m.patrolTimer = 0
          const dirs = [{vx:55,vy:0},{vx:-55,vy:0},{vx:0,vy:55},{vx:0,vy:-55}]
          const d = dirs[Phaser.Math.Between(0,3)]
          m.body.setVelocity(d.vx, d.vy)
        }
        const mc = Math.floor(m.body.x / this.TILE)
        const mr = Math.floor(m.body.y / this.TILE)
        if (this.isWall(mc, mr)) {
          m.body.setVelocity(-m.body.body.velocity.x, -m.body.body.velocity.y)
        }
      }

      this.drawMonster(m.graphic, m.body.x, m.body.y, false)
      this.drawHPBar(m.hpBar, m.body.x, m.body.y-28, m.hp, m.maxHp)
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
          this.showFloatingText(this.player.x, this.player.y-30, '🌟 GOLDEN EGG! +500', '#FFD700')
        } else if (e.type === 'fire') {
          this.score += 200
          this.showFloatingText(this.player.x, this.player.y-30, '🔥 FIRE EGG! +200', '#FF4500')
        } else if (e.type === 'thunder') {
          this.score += 300
          this.showFloatingText(this.player.x, this.player.y-30, '⚡ THUNDER EGG! +300', '#FFD700')
        } else {
          this.score += 100
          this.showFloatingText(this.player.x, this.player.y-30, '🥚 +100', '#ffffff')
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
          bomb:'💣 BOMB equipped!',
          ice:'❄️ ICE equipped!',
          lightning:'⚡ LIGHTNING equipped!',
          boomerang:'🪃 BOOMERANG equipped!'
        }
        this.showFloatingText(
          this.player.x, this.player.y-30,
          labels[w.type], '#ffffff'
        )
      }
    })

    // Portal check
    const px = this.portalCol * this.TILE + this.TILE/2
    const py = this.portalRow * this.TILE + this.TILE/2
    if (Phaser.Math.Distance.Between(
      this.player.x, this.player.y, px, py) < 38) {
      this.endGame(true)
    }

    if (this.timeLeft <= 0) this.endGame(false)

    this.portalAngle += 0.035
    this.drawPortal()

    // Bird bounce
    this.bobTimer += 1
    if (this.isMoving) {
      if (this.bobTimer > 8) {
        this.player.setDisplaySize((this.TILE+8)+5, (this.TILE+8)-5)
      } else {
        this.player.setDisplaySize((this.TILE+8)-2, (this.TILE+8)+5)
      }
      if (this.bobTimer > 15) this.bobTimer = 0
    } else {
      this.player.setDisplaySize(this.TILE+8, this.TILE+8)
    }
  }
}
