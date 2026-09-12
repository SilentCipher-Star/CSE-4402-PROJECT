import Phaser from 'phaser'

export class ShowcaseScene extends Phaser.Scene {
  constructor() {
    super('ShowcaseScene')
  }

  init(data) {
    this.selectedBird = data?.chosenBird || 'Ember'
    this.isAttacking = false
    this.isLeaving = false
  }

  preload() {
    if (!this.textures.exists('dumy_monster')) {
      this.load.image('dumy_monster', 'resource/dumy_monster.png')
    }
    if (!this.textures.exists('fight_play_btn')) {
      this.load.image('fight_play_btn', 'resource/play.png')
    }
    if (!this.textures.exists('lightning_strike')) {
      this.load.image('lightning_strike', 'resource/effects/lightning_strike.png')
    }
  }

  create() {
    const { width, height } = this.scale

    this.birds = [
      {
        id: 'Ember',
        name: 'Ember',
        title: 'Scarlet Macaw',
        weapon: 'fire',
        icon: '🔥',
        color: 0xff2200,
        hexColor: '#ff4500',
        sprite: 'ember_right',
        targetSize: 90,
        powerName: 'Fire Burst',
        powerDesc: 'Ignites an expanding flame nova that incinerates enemies in an explosive area of effect.',
        stats: 'Weapon: Fire  |  Range: 125  |  Style: AoE Incineration'
      },
      {
        id: 'Frost',
        name: 'Frost',
        title: 'Snowy Owl',
        weapon: 'ice',
        icon: '❄️',
        color: 0x00bfff,
        hexColor: '#00bfff',
        sprite: 'frost_right',
        powerName: 'Glacial Freeze',
        powerDesc: 'Emits a sub-zero cryo-shockwave that encases targets in solid ice blocks with crystalline frost spikes.',
        stats: 'Weapon: Ice  |  Range: 125  |  Style: Freeze & Capture'
      },
      {
        id: 'Volt',
        name: 'Volt',
        title: 'Philippine Eagle',
        weapon: 'lightning',
        icon: '⚡',
        color: 0xffdd00,
        hexColor: '#ffd700',
        sprite: 'volt_right',
        powerName: 'Electric Chain',
        powerDesc: 'Discharges rapid-fire lightning bolts that streak directly toward targets with overhead thunderbolts and electric arcs.',
        stats: 'Weapon: Lightning  |  Range: 210  |  Style: Chain Zap'
      },
      {
        id: 'Shade',
        name: 'Shade',
        title: 'Forest Owlet',
        weapon: 'bomb',
        icon: '💣',
        color: 0x111111,
        hexColor: '#d66eff',
        sprite: 'shade_right',
        powerName: 'Bomb Blast',
        powerDesc: 'Detonates a heavy concussive explosion causing massive kinetic impact, smoke clouds, and screen tremors.',
        stats: 'Weapon: Bomb  |  Range: 130  |  Style: Concussion Blast'
      },
      {
        id: 'Gale',
        name: 'Gale',
        title: 'Bristlefront',
        weapon: 'boomerang',
        icon: '🪃',
        color: 0xc8a25a,
        hexColor: '#00ff88',
        sprite: 'gale_right',
        powerName: 'Boomerang & Wind Force',
        powerDesc: 'Hurls a curved aerodynamic boomerang that strikes on throw, followed by a second return strike with wind swirl knockback.',
        stats: 'Weapon: Boomerang  |  Range: 125  |  Style: Double Strike & Wind'
      }
    ]

    // 1. Background & Dark Warm Slate Overlay
    this.add.image(0, 0, 'menu_bg')
      .setOrigin(0)
      .setDisplaySize(width, height)

    this.add.rectangle(0, 0, width, height, 0x0c0a10, 0.88)
      .setOrigin(0)

    // 2. Top Header Bar (Obsidian Slate & Antique Gold)
    const headerH = 58
    const headerBg = this.add.graphics()
    headerBg.fillStyle(0x151017, 0.97)
    headerBg.fillRect(0, 0, width, headerH)
    headerBg.lineStyle(2.5, 0xd4a034, 0.85)
    headerBg.lineBetween(0, headerH, width, headerH)

    this.add.text(width / 2, 20, '⚔️  BIRD COMBAT DOJO & STRENGTH TRIAL  ⚔️', {
      fontSize: '20px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      stroke: '#1a0f05',
      strokeThickness: 4
    }).setOrigin(0.5)

    this.add.text(width / 2, 42, "Demonstrating each player's attack power using the exact weapon graphics system from GameScene 1!", {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#e0cb9f'
    }).setOrigin(0.5)

    // Top-Right Close Button
    const closeBtnBg = this.add.circle(width - 40, 29, 19, 0x241214, 0.95)
      .setStrokeStyle(2, 0xd4a034)
      .setInteractive({ useHandCursor: true })

    const closeBtnText = this.add.text(width - 40, 29, '✖', {
      fontSize: '16px',
      fontFamily: 'Arial Black',
      color: '#ffffff'
    }).setOrigin(0.5)

    closeBtnBg.on('pointerover', () => {
      closeBtnBg.setFillStyle(0xa01818, 1)
      closeBtnText.setScale(1.15)
      this.input.setDefaultCursor('pointer')
    })
    closeBtnBg.on('pointerout', () => {
      closeBtnBg.setFillStyle(0x241214, 0.95)
      closeBtnText.setScale(1)
      this.input.setDefaultCursor('default')
    })
    closeBtnBg.on('pointerdown', () => this.returnToMenu())

    // 3. Bird Selection Tabs (Clean & Spacious)
    this.tabButtons = []
    const tabY = 88
    const tabW = 210
    const tabH = 42
    const totalTabW = tabW * this.birds.length + (this.birds.length - 1) * 14
    const startTabX = (width - totalTabW) / 2 + tabW / 2

    this.birds.forEach((b, idx) => {
      const x = startTabX + idx * (tabW + 14)
      const tab = this.createTabButton(x, tabY, tabW, tabH, b, idx + 1)
      this.tabButtons.push(tab)
    })

    // 4. Main Combat Arena Container
    const arenaX = 70
    const arenaY = 126
    const arenaW = width - 140
    const arenaH = 490

    const arenaBox = this.add.graphics()
    arenaBox.fillStyle(0x120d14, 0.94)
    arenaBox.fillRoundedRect(arenaX, arenaY, arenaW, arenaH, 16)
    arenaBox.lineStyle(2.5, 0xc49332, 0.85)
    arenaBox.strokeRoundedRect(arenaX, arenaY, arenaW, arenaH, 16)
    arenaBox.lineStyle(1, 0xffd97d, 0.2)
    arenaBox.strokeRoundedRect(arenaX + 3, arenaY + 3, arenaW - 6, arenaH - 6, 14)

    // 5. Ability Info Card (Upper Arena)
    const infoY = arenaY + 16
    const infoW = arenaW - 50
    const infoH = 88
    const infoX = arenaX + 25

    this.infoBox = this.add.graphics()
    this.drawInfoBox(infoX, infoY, infoW, infoH, 0xd4a034)

    this.infoTitle = this.add.text(infoX + 18, infoY + 14, '', {
      fontSize: '17px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    })

    this.infoDesc = this.add.text(infoX + 18, infoY + 38, '', {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#f2e8d0',
      wordWrap: { width: infoW - 36 },
      lineSpacing: 3
    })

    this.infoStats = this.add.text(infoX + 18, infoY + 64, '', {
      fontSize: '11px',
      fontFamily: 'Arial Black',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 2
    })

    // 6. Combat Stage & Platform
    this.floorY = arenaY + 320

    const platform = this.add.graphics()
    platform.fillStyle(0x1e151a, 1)
    platform.fillRoundedRect(arenaX + 40, this.floorY, arenaW - 80, 44, 10)
    platform.lineStyle(2, 0x946b33, 0.85)
    platform.strokeRoundedRect(arenaX + 40, this.floorY, arenaW - 80, 44, 10)
    platform.lineStyle(1, 0xe0b462, 0.35)
    platform.lineBetween(arenaX + 50, this.floorY + 2, arenaX + arenaW - 50, this.floorY + 2)

    // Center VS Medallion
    const vsX = width / 2
    const vsY = this.floorY - 45
    this.add.circle(vsX, vsY, 26, 0x171014, 0.96)
      .setStrokeStyle(2.5, 0xffd700)
    this.add.text(vsX, vsY, 'VS', {
      fontSize: '18px',
      fontFamily: 'Arial Black',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5)

    // 7. Left: Hero Bird Combatant
    this.birdSpawnX = arenaX + arenaW * 0.25
    this.birdSpawnY = this.floorY - 48

    this.birdShadow = this.add.ellipse(this.birdSpawnX, this.floorY + 8, 70, 18, 0x000000, 0.45)
    this.birdAura = this.add.graphics()
    this.drawBirdAura(0xff4500)

    this.birdSprite = this.add.image(this.birdSpawnX, this.birdSpawnY, 'ember_right')
    this.applyUniformScale(this.birdSprite, 115)
    const initialBird = this.birds.find(b => b.id === this.selectedBird) || this.birds[0]
    this.applyUniformScale(this.birdSprite, initialBird.targetSize || 115)

    this.tweens.add({
      targets: this.birdSprite,
      y: this.birdSpawnY - 12,
      duration: 850,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    this.birdLabel = this.add.text(this.birdSpawnX, this.floorY + 22, 'EMBER', {
      fontSize: '12px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5)

    // 8. Right: Target Dummy (Hunter)
    this.enemySpawnX = arenaX + arenaW * 0.75
    this.enemySpawnY = this.floorY - 50

    this.enemyShadow = this.add.ellipse(this.enemySpawnX, this.floorY + 8, 70, 18, 0x000000, 0.45)
    this.enemy = null
    this.spawnEnemy()

    // 9. Bottom Action Controls (play.png Fight Button)
    const btnY = arenaY + arenaH - 42
    const btnSize = 68
    this.attackBtnImage = this.add.image(width / 2, btnY, 'fight_play_btn')
    this.applyUniformScale(this.attackBtnImage, btnSize)
    this.attackBtnImage.setInteractive({ useHandCursor: true })

    const atkBaseScale = this.attackBtnImage.scaleX
    this.attackBtnImage.on('pointerover', () => {
      this.attackBtnImage.setScale(atkBaseScale * 1.12)
      this.input.setDefaultCursor('pointer')
    })
    this.attackBtnImage.on('pointerout', () => {
      this.attackBtnImage.setScale(atkBaseScale)
      this.input.setDefaultCursor('default')
    })
    this.attackBtnImage.on('pointerdown', () => this.triggerAttack())

    this.tweens.add({
      targets: this.attackBtnImage,
      scaleX: atkBaseScale * 1.07,
      scaleY: atkBaseScale * 1.07,
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // 10. Bottom Footer Navigation Legend
    this.add.text(width / 2, height - 16, 'SPACE: Execute Attack   |   Keys 1 - 5: Switch Bird   |   ESC: Return to Main Menu', {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#cbb790'
    }).setOrigin(0.5)

    // Keyboard bindings
    this.input.keyboard.on('keydown-SPACE', () => this.triggerAttack())
    this.input.keyboard.on('keydown-ESC', () => this.returnToMenu())
    this.input.keyboard.on('keydown-ONE', () => this.selectBird('Ember'))
    this.input.keyboard.on('keydown-TWO', () => this.selectBird('Frost'))
    this.input.keyboard.on('keydown-THREE', () => this.selectBird('Volt'))
    this.input.keyboard.on('keydown-FOUR', () => this.selectBird('Shade'))
    this.input.keyboard.on('keydown-FIVE', () => this.selectBird('Gale'))

    this.selectBird(this.selectedBird)
  }

  applyUniformScale(sprite, targetMaxSize) {
    const tex = this.textures.get(sprite.texture.key).getSourceImage()
    const w = tex.width || 100
    const h = tex.height || 100
    const scale = targetMaxSize / Math.max(w, h)
    sprite.setScale(scale)
  }

  createTabButton(x, y, w, h, bird, keyNum) {
    const container = this.add.container(x, y)

    const bg = this.add.graphics()
    const drawTab = (selected = false, hovered = false) => {
      bg.clear()
      if (selected) {
        bg.fillStyle(0x2a1712, 1)
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8)
        bg.lineStyle(2.5, bird.hexColor ? Phaser.Display.Color.HexStringToColor(bird.hexColor).color : bird.color, 1)
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8)
      } else if (hovered) {
        bg.fillStyle(0x221714, 0.95)
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8)
        bg.lineStyle(2, 0x9e7336, 0.85)
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8)
      } else {
        bg.fillStyle(0x161114, 0.9)
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8)
        bg.lineStyle(1.5, 0x453123, 0.75)
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8)
      }
    }
    drawTab(false, false)

    const hitArea = this.add.rectangle(0, 0, w, h, 0x000000, 0)
      .setInteractive({ useHandCursor: true })

    const text = this.add.text(0, 0, `${bird.icon} [${keyNum}] ${bird.name}`, {
      fontSize: '13px',
      fontFamily: 'Arial Black',
      color: '#d6cbba'
    }).setOrigin(0.5)

    hitArea.on('pointerover', () => {
      if (this.selectedBird !== bird.id) {
        drawTab(false, true)
        text.setColor('#fff2d4')
      }
      this.input.setDefaultCursor('pointer')
    })

    hitArea.on('pointerout', () => {
      if (this.selectedBird !== bird.id) {
        drawTab(false, false)
        text.setColor('#d6cbba')
      }
      this.input.setDefaultCursor('default')
    })

    hitArea.on('pointerdown', () => this.selectBird(bird.id))

    container.add([bg, hitArea, text])
    container.birdId = bird.id
    container.drawTab = drawTab
    container.text = text

    return container
  }

  selectBird(birdId) {
    this.selectedBird = birdId
    const data = this.birds.find(b => b.id === birdId) || this.birds[0]

    this.tabButtons.forEach(tab => {
      if (tab.birdId === birdId) {
        tab.drawTab(true, false)
        tab.text.setColor(data.hexColor)
      } else {
        tab.drawTab(false, false)
        tab.text.setColor('#d6cbba')
      }
    })

    this.birdSprite.setTexture(data.sprite)
    this.applyUniformScale(this.birdSprite, 115)
    this.applyUniformScale(this.birdSprite, data.targetSize || 115)
    this.birdLabel.setText(data.name.toUpperCase()).setColor(data.hexColor)
    this.drawBirdAura(data.hexColor ? Phaser.Display.Color.HexStringToColor(data.hexColor).color : data.color)

    const infoX = 70 + 25
    const infoY = 126 + 16
    const infoW = (this.scale.width - 140) - 50
    const infoH = 88
    this.drawInfoBox(infoX, infoY, infoW, infoH, data.hexColor ? Phaser.Display.Color.HexStringToColor(data.hexColor).color : data.color)

    this.infoTitle.setText(`${data.icon}  ${data.name.toUpperCase()}  •  ${data.title}  —  ${data.powerName}`).setColor(data.hexColor)
    this.infoDesc.setText(data.powerDesc)
    this.infoStats.setText(data.stats)

  }

  drawInfoBox(x, y, w, h, borderColor) {
    this.infoBox.clear()
    this.infoBox.fillStyle(0x1a1216, 0.96)
    this.infoBox.fillRoundedRect(x, y, w, h, 10)
    this.infoBox.lineStyle(2, borderColor, 0.85)
    this.infoBox.strokeRoundedRect(x, y, w, h, 10)
  }

  drawBirdAura(color) {
    this.birdAura.clear()
    this.birdAura.fillStyle(color, 0.22)
    this.birdAura.fillEllipse(this.birdSpawnX, this.floorY + 8, 85, 24)
  }

  spawnEnemy() {
    if (this.enemy) {
      if (this.enemy.sprite) this.enemy.sprite.destroy()
      if (this.enemy.hpBar) this.enemy.hpBar.destroy()
      if (this.enemy.label) this.enemy.label.destroy()
      if (this.enemy.hpText) this.enemy.hpText.destroy()
      if (this.enemy.iceGraphic) this.enemy.iceGraphic.destroy()
      this.enemy = null
    }

    const enemyTextureKey = this.textures.exists('dumy_monster') ? 'dumy_monster' : 'hunter_left'
    const sprite = this.add.sprite(this.enemySpawnX, this.enemySpawnY, enemyTextureKey)
    this.applyUniformScale(sprite, 115)

    this.tweens.add({
      targets: sprite,
      y: this.enemySpawnY - 6,
      duration: 880,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    const hpBar = this.add.graphics()
    this.drawHPBar(hpBar, this.enemySpawnX, this.enemySpawnY - 92, 200, 200)

    const label = this.add.text(this.enemySpawnX, this.enemySpawnY - 108, '🎯 TARGET DUMMY (MONSTER)', {
      fontSize: '11px',
      fontFamily: 'Arial Black',
      color: '#ffb0a0',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5)

    const hpText = this.add.text(this.enemySpawnX, this.enemySpawnY - 76, '200 / 200 HP', {
      fontSize: '10px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2.5
    }).setOrigin(0.5)

    this.enemy = {
      sprite,
      hpBar,
      label,
      hpText,
      hp: 200,
      maxHp: 200,
      alive: true,
      iceGraphic: null
    }
  }

  drawHPBar(gfx, x, y, hp, maxHp) {
    gfx.clear()
    const w = 84
    const h = 8

    gfx.fillStyle(0x000000, 0.85)
    gfx.fillRect(x - w / 2, y, w, h)

    const ratio = Math.max(0, hp / maxHp)
    const color = ratio > 0.5 ? 0x22ee44 : (ratio > 0.25 ? 0xffbb00 : 0xff2222)
    gfx.fillStyle(color, 1)
    gfx.fillRect(x - w / 2 + 1, y + 1, (w - 2) * ratio, h - 2)

    gfx.lineStyle(1.5, 0xd4a034, 0.8)
    gfx.strokeRect(x - w / 2, y, w, h)
  }

  makeRing(color, startRadius, finalScale, duration = 350) {
    const ring = this.add.graphics()
    ring.setPosition(this.birdSprite.x, this.birdSprite.y)
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

  showFloatingText(worldX, worldY, msg, color) {
    const t = this.add.text(worldX, worldY, msg, {
      fontSize: '14px', fontFamily: 'Arial Black', color
    }).setOrigin(0.5)
    this.tweens.add({
      targets: t, y: worldY - 55, alpha: 0,
      duration: 1100, onComplete: () => t.destroy()
    })
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

  triggerAttack() {
    if (this.isAttacking) return
    if (!this.enemy || !this.enemy.alive) {
      this.spawnEnemy()
      this.time.delayedCall(160, () => this.executeWeaponAttack())
      return
    }
    this.executeWeaponAttack()
  }

  executeWeaponAttack() {
    this.isAttacking = true

    this.time.delayedCall(500, () => {
      this.isAttacking = false
    })

    const bird = this.birds.find(b => b.id === this.selectedBird) || this.birds[0]
    const weapon = bird.weapon
    const range = 125

    const attackColorMap = {
      fire: 0xff2200,
      lightning: 0xffdd00,
      bomb: 0x111111,
      ice: 0x00bfff,
      wind: 0x88ffee,
      boomerang: 0xc8a25a
    }
    const attackColor = attackColorMap[weapon] || bird.color

    switch (weapon) {
      case 'fire': {
        this.makeRing(attackColor, 10, range / 16, 300)

        const flame = this.add.graphics()
        flame.setPosition(this.birdSprite.x, this.birdSprite.y)
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

        this.showFloatingText(
          this.birdSprite.x,
          this.birdSprite.y - 30,
          '🔥 Fire Burst!',
          '#ff8844'
        )

        this.hitEnemyDummy(0xff4500, () => {
          this.killEnemyDummy('fire')
        })
        break
      }

      case 'bomb': {
        this.makeRing(attackColor, 12, range / 18, 320)

        const boom = this.add.graphics()
        boom.setPosition(this.birdSprite.x, this.birdSprite.y)
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

        this.cameras.main.shake(180, 0.006)

        this.showFloatingText(
          this.birdSprite.x,
          this.birdSprite.y - 30,
          '💣 Bomb Blast!',
          '#ff9955'
        )

        this.hitEnemyDummy(attackColor, () => {
          this.killEnemyDummy('bomb')
        })
        break
      }

      case 'ice': {
        this.makeRing(0x00bfff, 10, range / 10, 400)
        this.freezeKillEnemyDummy()
        break
      }

      case 'lightning': {
        this.makeRing(attackColor, 10, range / 16, 280)

        if (!this.enemy || !this.enemy.alive) break

        const targetX = this.enemy.sprite.x
        const targetY = this.enemy.sprite.y

        const lightning = this.add.graphics()
        lightning.lineStyle(4, 0xffdd00, 1)

        const lastX = this.birdSprite.x
        const lastY = this.birdSprite.y

        lightning.beginPath()
        lightning.moveTo(lastX, lastY)

        const midX = (lastX + targetX) / 2 + Phaser.Math.Between(-18, 18)
        const midY = (lastY + targetY) / 2 + Phaser.Math.Between(-18, 18)

        lightning.lineTo(midX, midY)
        lightning.lineTo(targetX, targetY)
        lightning.strokePath()

        this.tweens.add({
          targets: lightning,
          alpha: 0,
          duration: 260,
          onComplete: () => lightning.destroy()
        })

        this.showFloatingText(
          this.birdSprite.x,
          this.birdSprite.y - 30,
          '⚡ Electric Chain!',
          '#FFD700'
        )

        this.showFloatingText(targetX, targetY - 20, '⚡ ZAP!', '#FFD700')

        this.killEnemyDummy('lightning')
        break
      }

      case 'boomerang': {
        const startX = this.birdSprite.x
        const startY = this.birdSprite.y
        const targetX = this.enemy.sprite.x
        const targetY = this.enemy.sprite.y

        this.makeRing(0x88ffee, 10, range / 10, 250)
        this.showFloatingText(startX, startY - 32, '🪃 Boomerang Throw!', '#ffd700')

        // Create visible spinning aerodynamic Boomerang
        const bContainer = this.add.container(startX, startY)
        bContainer.setDepth(20)

        // Draw curved chevron boomerang
        const bGfx = this.add.graphics()
        // Outer wood/golden aerodynamic body
        bGfx.fillStyle(0xd4a034, 1)
        bGfx.beginPath()
        bGfx.moveTo(-24, 12)
        bGfx.lineTo(0, -14)
        bGfx.lineTo(24, 12)
        bGfx.lineTo(18, 15)
        bGfx.lineTo(0, -5)
        bGfx.lineTo(-18, 15)
        bGfx.closePath()
        bGfx.fillPath()

        // Mahogany border
        bGfx.lineStyle(2.5, 0x4a2406, 1)
        bGfx.strokePath()

        // Glowing wind runes on wings
        bGfx.lineStyle(2, 0x55ffff, 0.95)
        bGfx.lineBetween(-16, 7, -8, -1)
        bGfx.lineBetween(16, 7, 8, -1)

        // Center wind vortex icon
        const bText = this.add.text(0, 0, '🪃', { fontSize: '20px' }).setOrigin(0.5)

        bContainer.add([bGfx, bText])

        // Flight Out: Arced bezier curve toward monster
        const flightTime = 340
        const midY_out = (startY + targetY) / 2 - 45

        let lastTrailTime = 0
        const dropTrail = (px, py) => {
          const trail = this.add.circle(px, py, 5, 0x77eeff, 0.6)
          this.tweens.add({
            targets: trail,
            scale: 0.2,
            alpha: 0,
            duration: 200,
            onComplete: () => trail.destroy()
          })
        }

        const tweenData = { t: 0 }
        this.tweens.add({
          targets: tweenData,
          t: 1,
          duration: flightTime,
          ease: 'Sine.easeOut',
          onUpdate: () => {
            const t = tweenData.t
            const bx = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * ((startX + targetX) / 2) + t * t * targetX
            const by = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * midY_out + t * t * targetY
            bContainer.setPosition(bx, by)
            bContainer.rotation += 0.35

            if (this.time.now - lastTrailTime > 35) {
              lastTrailTime = this.time.now
              dropTrail(bx, by)
            }
          },
          onComplete: () => {
            if (!this.enemy || !this.enemy.alive) {
              bContainer.destroy()
              return
            }

            // --- FIRST HIT ON MONSTER ---
            this.hitEnemyDummy(0xc8a25a, null)
            this.enemy.hp = 100
            this.drawHPBar(this.enemy.hpBar, this.enemySpawnX, this.enemySpawnY - 92, 100, 200)
            if (this.enemy.hpText) this.enemy.hpText.setText('100 / 200 HP').setColor('#ffbb00')
            this.showFloatingText(targetX, targetY - 24, '💥 100 DMG (First Hit!)', '#ffea75')
            this.makeRing(0x88ffee, 15, 6, 200)

            this.tweens.add({
              targets: this.enemy.sprite,
              x: this.enemySpawnX + 22,
              duration: 90,
              yoyo: true
            })

            // --- RETURN FLIGHT: Monster back to Gale ---
            const midY_back = (startY + targetY) / 2 + 45
            const returnTweenData = { t: 0 }

            this.tweens.add({
              targets: returnTweenData,
              t: 1,
              duration: flightTime,
              ease: 'Sine.easeInOut',
              onUpdate: () => {
                const t = returnTweenData.t
                const bx = (1 - t) * (1 - t) * targetX + 2 * (1 - t) * t * ((startX + targetX) / 2) + t * t * startX
                const by = (1 - t) * (1 - t) * targetY + 2 * (1 - t) * t * midY_back + t * t * startY
                bContainer.setPosition(bx, by)
                bContainer.rotation += 0.40

                if (this.time.now - lastTrailTime > 35) {
                  lastTrailTime = this.time.now
                  dropTrail(bx, by)
                }

                // Trigger final elimination just as it departs target
                if (t >= 0.15 && this.enemy && this.enemy.alive) {
                  this.showFloatingText(targetX, targetY - 48, '🌪️ Return Strike! +200', '#00ffcc')
                  this.killEnemyDummy('boomerang')
                }
              },
              onComplete: () => {
                bContainer.destroy()
                this.makeRing(0x88ffee, 10, 3, 200)
                this.showFloatingText(startX, startY - 28, '✨ Caught!', '#ffd700')
              }
            })
          }
        })
        break
      }
    }
  }

  hitEnemyDummy(color, onFinish) {
    if (!this.enemy || !this.enemy.alive || !this.enemy.sprite) return

    const m = this.enemy

    m.sprite.setAlpha(0.3)
    this.time.delayedCall(150, () => {
      if (m.sprite) m.sprite.setAlpha(1)
    })

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const burst = this.add.graphics()
      burst.fillStyle(color, 1)
      burst.fillCircle(m.sprite.x, m.sprite.y, 4)

      this.tweens.add({
        targets: burst,
        x: m.sprite.x + Math.cos(angle) * Phaser.Math.Between(15, 40),
        y: m.sprite.y + Math.sin(angle) * Phaser.Math.Between(15, 40),
        alpha: 0,
        scaleX: 0.2,
        scaleY: 0.2,
        duration: Phaser.Math.Between(200, 500),
        onComplete: () => burst.destroy()
      })
    }

    if (onFinish) {
      this.time.delayedCall(160, onFinish)
    }
  }

  killEnemyDummy(deathType) {
    if (!this.enemy || !this.enemy.alive || !this.enemy.sprite) return

    const m = this.enemy
    m.alive = false
    m.hp = 0

    const x = m.sprite.x
    const y = m.sprite.y

    this.drawHPBar(m.hpBar, x, y - 92, 0, 200)
    if (m.hpText) m.hpText.setText('0 / 200 HP').setColor('#ff4444')

    if (deathType === 'fire') {
      m.sprite.setTint(0xff5500)
    } else if (deathType === 'bomb') {
      m.sprite.setTint(0x333333)
    } else if (deathType === 'lightning') {
      m.sprite.setTint(0xffff66)
    } else if (deathType === 'wind' || deathType === 'boomerang') {
      m.sprite.setTint(0x88ffee)
    }

    this.playMonsterDeathEffect(x, y, deathType)

    this.time.delayedCall(350, () => {
      this.showDeathSkull(x, y)
    })

    this.showFloatingText(x, y - 24, '+200', '#ffffff')

    this.tweens.add({
      targets: m.sprite,
      alpha: 0,
      duration: 650,
      delay: deathType === 'lightning' ? 120 : 0,
      onComplete: () => {
        this.time.delayedCall(1400, () => {
          if (!this.enemy || !this.enemy.alive) {
            this.spawnEnemy()
          }
        })
      }
    })
  }

  playMonsterDeathEffect(x, y, deathType) {
    if (deathType === 'fire') {
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
  }

  freezeKillEnemyDummy() {
    if (!this.enemy || !this.enemy.alive || !this.enemy.sprite) return

    const m = this.enemy
    m.alive = false
    m.hp = 0

    const x = m.sprite.x
    const y = m.sprite.y

    this.drawHPBar(m.hpBar, x, y - 92, 0, 200)
    if (m.hpText) m.hpText.setText('0 / 200 HP').setColor('#ff4444')

    m.sprite.setTint(0x88ccff)
    m.sprite.setAlpha(0.85)

    const ice = this.add.graphics()
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

    this.showFloatingText(x, y - 24, '❄️ Frozen Captured! +200', '#99eeff')

    this.time.delayedCall(1200, () => {
      this.tweens.add({
        targets: [m.sprite, ice],
        alpha: 0,
        duration: 650,
        onComplete: () => {
          if (ice) ice.destroy()
          this.time.delayedCall(1400, () => {
            if (!this.enemy || !this.enemy.alive) {
              this.spawnEnemy()
            }
          })
        }
      })
    })
  }

  createActionButton(x, y, w, h, label, fill, stroke, onClick) {
    const box = this.add.rectangle(x, y, w, h, fill)
      .setStrokeStyle(2.5, stroke)
      .setInteractive({ useHandCursor: true })

    const text = this.add.text(x, y, label, {
      fontSize: '13px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5)

    box.on('pointerover', () => {
      box.setFillStyle(fill + 0x221010)
      text.setScale(1.05)
      this.input.setDefaultCursor('pointer')
    })
    box.on('pointerout', () => {
      box.setFillStyle(fill)
      text.setScale(1)
      this.input.setDefaultCursor('default')
    })
    box.on('pointerdown', onClick)

    return { box, text }
  }

  returnToMenu() {
    if (this.isLeaving) return
    this.isLeaving = true

    this.scene.stop('ShowcaseScene')
    this.scene.start('MenuScene')
  }
}
