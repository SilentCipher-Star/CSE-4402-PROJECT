import Phaser from 'phaser'

export class ReportScene extends Phaser.Scene {
  constructor() {
    super('ReportScene')
  }

  preload() {
    this.load.audio('select_sound', 'resource/audio/select_sound.mp3')
  }

  create(data) {
    if (this.game.canvas && this.game.canvas.focus) {
      this.game.canvas.focus()
    }
    this.input.enabled = true
    this.input.keyboard.enabled = true
    this.input.setDefaultCursor('default')

    const { width, height } = this.scale

    const d = data || (this.sys && this.sys.settings && this.sys.settings.data) || {}
    const reportData = {
      playerName: d.playerName || 'Adventurer',
      chosenBird: d.chosenBird || 'Ember',
      evolutionStage: d.evolutionStage || 1,
      totalScore: d.totalScore || 0,
      saplingsCollected: d.saplingsCollected || 0,
      totalSaplings: d.totalSaplings && d.totalSaplings > 0 ? d.totalSaplings : 10,
      animalsRescued: d.animalsRescued || 0,
      monstersKilled: d.monstersKilled || 0,
      totalMonsters: d.totalMonsters && d.totalMonsters > 0 ? d.totalMonsters : 8,
      forestHealth: d.forestHealth !== undefined ? d.forestHealth : 100,
      co2Absorbed: d.co2Absorbed !== undefined ? d.co2Absorbed : (d.saplingsCollected || 0) * 20,
      timeTaken: d.timeTaken || 0,
      flashCards: Array.isArray(d.flashCards) ? [...d.flashCards] : [],
      escaped: Boolean(d.escaped)
    }

    const escaped = reportData.escaped
    const saplings = reportData.saplingsCollected
    const total = reportData.totalSaplings
    const co2 = reportData.co2Absorbed
    const monsters = reportData.monstersKilled
    const totalMonsters = reportData.totalMonsters
    const health = Math.max(0, Math.min(100, Math.round(reportData.forestHealth)))
    const timeTaken = reportData.timeTaken

    // ── Grade Calculation (Level 2 pattern) ──────────────────────
    const grade =
      saplings >= Math.round(total * 0.85) ? 'S' :
      saplings >= Math.round(total * 0.70) ? 'A' :
      saplings >= Math.round(total * 0.50) ? 'B' :
      saplings >= Math.round(total * 0.30) ? 'C' : 'D'

    const gradeColorInt =
      grade === 'S' ? 0xFFD700 :
      grade === 'A' ? 0x00ff88 :
      grade === 'B' ? 0x66ff99 :
      grade === 'C' ? 0xFF8C00 : 0xff3355

    const gradeColor =
      grade === 'S' ? '#FFD700' :
      grade === 'A' ? '#00ff88' :
      grade === 'B' ? '#66ff99' :
      grade === 'C' ? '#FF8C00' : '#ff3355'

    // ── LEVEL 1 UNIQUE FOREST SPECIES SPOTLIGHT ──────────────────
    // Distinct species facts tailored specifically to the Forest ecosystem
    const forestSpeciesFacts = {
      Shade: {
        name: 'Forest Owlet (Athene blewitti)',
        fact: 'Thought extinct for 113 years, the diurnal Forest Owlet was rediscovered in 1997 surviving in fragmented central Indian teak forests.'
      },
      Ember: {
        name: 'Scarlet Macaw (Ara macao)',
        fact: 'Nicknamed "flying foresters", Scarlet Macaws disperse giant canopy seeds across tens of kilometers, naturally regenerating old-growth rainforests.'
      },
      Volt: {
        name: 'Philippine Eagle (Pithecophaga jefferyi)',
        fact: 'With a 7-foot wingspan, this critically endangered apex forest eagle requires over 4,000 hectares of virgin canopy to raise a single chick.'
      },
      Frost: {
        name: 'Spotted Owlet (Athene brama)',
        fact: 'This small woodland owlet thrives in native tree cavities, protecting agricultural margins by naturally regulating forest rodent populations.'
      },
      Gale: {
        name: "Stresemann's Bristlefront (Merulaxis stresemanni)",
        fact: 'One of the world’s rarest ground-dwelling forest birds, fewer than 15 Bristlefronts cling to survival in fragmented Atlantic coastal forests.'
      },
      Deer: {
        name: 'Spotted & Hog Deer (Cervidae)',
        fact: 'Vital woodland herbivores that clear underbrush paths, fertilize native flora, and raise alarm calls against illegal poachers.'
      },
      Rhino: {
        name: 'Javan Rhinoceros (Rhinoceros sondaicus)',
        fact: 'With fewer than 80 living individuals, the Javan Rhino is one of Earth’s rarest mammals, reliant on pristine rainforest sanctuaries.'
      }
    }

    const chosenBirdKey = reportData.chosenBird
      ? (reportData.chosenBird.charAt(0).toUpperCase() + reportData.chosenBird.slice(1).toLowerCase())
      : 'Ember'
    
    // Select spotlight: prioritize rescued forest mammals if saved, or chosen bird
    let spotlight = forestSpeciesFacts[chosenBirdKey] || forestSpeciesFacts.Ember
    if (reportData.animalsRescued >= 2 && Math.random() < 0.5) {
      spotlight = Math.random() < 0.5 ? forestSpeciesFacts.Deer : forestSpeciesFacts.Rhino
    }

    // ── Dark Overlay ─────────────────────────────────────────────
    const overlay = this.add.graphics().setScrollFactor(0).setDepth(500)
    overlay.fillStyle(0x000000, 0.93)
    overlay.fillRect(0, 0, width, height)

    // ── Main Card (Forest Nature color coordination) ──────────────
    const cardW = 640
    const cardH = 680
    const cardX = width / 2 - cardW / 2
    const cardY = (height - cardH) / 2

    const card = this.add.graphics().setScrollFactor(0).setDepth(501)
    card.fillStyle(0x0a1c12, 1) // Deep forest green
    card.fillRoundedRect(cardX, cardY, cardW, cardH, 20)
    card.lineStyle(2, escaped ? 0x1e6e3c : 0x6e1e1e, 1)
    card.strokeRoundedRect(cardX, cardY, cardW, cardH, 20)

    // ── Header Banner ────────────────────────────────────────────
    const headerH = 88
    const headerBg = this.add.graphics().setScrollFactor(0).setDepth(502)
    headerBg.fillStyle(escaped ? 0x0d331d : 0x330d0d, 1)
    headerBg.fillRoundedRect(cardX, cardY, cardW, headerH, { tl: 20, tr: 20, bl: 0, br: 0 })

    headerBg.fillStyle(escaped ? 0x00ff88 : 0xff3355, 1)
    headerBg.fillRect(cardX, cardY + headerH - 2, cardW, 3)

    this.add.text(cardX + 28, cardY + 22, escaped ? '🌿 FOREST CONSERVATION REPORT' : '💀 EXPEDITION FAILED', {
      fontSize: '20px',
      fontFamily: 'Arial Black',
      color: escaped ? '#00ff88' : '#ff3355',
      stroke: '#000000',
      strokeThickness: 3
    }).setScrollFactor(0).setDepth(503)

    this.add.text(cardX + 28, cardY + 54, escaped
      ? 'Saplings delivered to the forest replanting zone'
      : 'The forest hunters won this expedition', {
      fontSize: '12px',
      fontFamily: 'Arial Black',
      color: '#b0d8c0'
    }).setScrollFactor(0).setDepth(503)

    // ── Grade Badge (Top Right of Header, completely contained) ───
    const gradeX = cardX + cardW - 66
    const gradeY = cardY + 40
    const gradeGlow = this.add.graphics().setScrollFactor(0).setDepth(502)
    gradeGlow.fillStyle(gradeColorInt, 0.18)
    gradeGlow.fillCircle(gradeX, gradeY, 34)
    gradeGlow.fillStyle(0x0a1c12, 1)
    gradeGlow.fillCircle(gradeX, gradeY, 28)
    gradeGlow.lineStyle(2.5, gradeColorInt, 1)
    gradeGlow.strokeCircle(gradeX, gradeY, 28)

    this.add.text(gradeX, gradeY, grade, {
      fontSize: '24px',
      fontFamily: 'Arial Black',
      color: gradeColor
    }).setOrigin(0.5).setScrollFactor(0).setDepth(503)

    this.add.text(gradeX, gradeY + 34, 'GRADE', {
      fontSize: '10px',
      fontFamily: 'Arial Black',
      color: '#66cc88'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(503)

    // ── Stat Rows with Visual Progress Bars ──────────────────────
    const stats = [
      {
        icon: '🌱',
        label: 'SAPLINGS RESCUED',
        value: `${saplings}/${total}`,
        bar: total > 0 ? saplings / total : 0,
        barColor: 0x00ff88,
        chip: 0x12381f
      },
      {
        icon: '🏹',
        label: 'HUNTERS DEFEATED',
        value: `${monsters}/${totalMonsters}`,
        bar: Math.min(monsters / Math.max(1, totalMonsters), 1),
        barColor: 0xff6644,
        chip: 0x381e0f
      },
      {
        icon: '🌲',
        label: 'FOREST HEALTH',
        value: `${health}%`,
        bar: health / 100,
        barColor: health > 60 ? 0x00ff88 : health > 30 ? 0xFF8C00 : 0xff3355,
        chip: 0x163327
      },
      {
        icon: '💨',
        label: 'CO₂ ABSORBED/YR',
        value: `${co2} kg`,
        bar: Math.min(co2 / 300, 1),
        barColor: 0x38ef7d,
        chip: 0x11332c
      },
      {
        icon: '⏱️',
        label: 'TIME TAKEN',
        value: `${timeTaken}s`,
        bar: Math.max(0, 1 - timeTaken / 180),
        barColor: 0xFFD700,
        chip: 0x332b11
      }
    ]

    const startY = cardY + headerH + 14
    const rowH = 50
    const rowGap = 6

    stats.forEach((st, i) => {
      const ry = startY + i * (rowH + rowGap)

      const rowBg = this.add.graphics().setScrollFactor(0).setDepth(502)
      rowBg.fillStyle(0x0f2418, 1)
      rowBg.fillRoundedRect(cardX + 16, ry, cardW - 32, rowH, 10)

      const chipBg = this.add.graphics().setScrollFactor(0).setDepth(503)
      chipBg.fillStyle(st.chip, 1)
      chipBg.fillRoundedRect(cardX + 26, ry + 7, 36, 36, 8)

      this.add.text(cardX + 44, ry + 25, st.icon, {
        fontSize: '18px'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(504)

      this.add.text(cardX + 76, ry + 9, st.label, {
        fontSize: '11px',
        fontFamily: 'Arial Black',
        color: '#e6f5ec',
        stroke: '#000000',
        strokeThickness: 2
      }).setScrollFactor(0).setDepth(503)

      this.add.text(cardX + cardW - 28, ry + 7, st.value, {
        fontSize: '16px',
        fontFamily: 'Arial Black',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(1, 0).setScrollFactor(0).setDepth(503)

      const barX = cardX + 76
      const barY = ry + 30
      const barW = cardW - 104
      const barH = 7

      const barTrack = this.add.graphics().setScrollFactor(0).setDepth(503)
      barTrack.fillStyle(0x08170e, 1)
      barTrack.fillRoundedRect(barX, barY, barW, barH, 3)

      const barRatio = (typeof st.bar === 'number' && !isNaN(st.bar))
        ? Math.max(0, Math.min(1, st.bar))
        : 0
      const fillW = Math.max(6, Math.round(barW * barRatio))
      const barFill = this.add.graphics().setScrollFactor(0).setDepth(504)
      barFill.fillStyle(st.barColor, 1)
      barFill.fillRoundedRect(barX, barY, fillW, barH, 3)
      barFill.fillStyle(st.barColor, 0.6)
      barFill.fillCircle(barX + fillW, barY + barH / 2, 5)
    })

    // ── CO2 Equivalence Banner ───────────────────────────────────
    const eqY = startY + stats.length * (rowH + rowGap) + 4
    const eqBg = this.add.graphics().setScrollFactor(0).setDepth(502)
    eqBg.fillStyle(0x0d281a, 1)
    eqBg.fillRoundedRect(cardX + 16, eqY, cardW - 32, 34, 10)
    eqBg.lineStyle(1, 0x1e6e3c, 0.7)
    eqBg.strokeRoundedRect(cardX + 16, eqY, cardW - 32, 34, 10)

    const carsEquivalent = Math.max(1, Math.round(co2 / 140))
    this.add.text(width / 2, eqY + 17,
      `🚗  Equal to removing ${carsEquivalent} car${carsEquivalent > 1 ? 's' : ''} from the road for a year`, {
      fontSize: '12px',
      fontFamily: 'Arial Black',
      color: '#b3ffd9',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setScrollFactor(0).setDepth(503)

    // ── Species Spotlight (Forest / Rainforest Biome) ────────────
    const spotY = eqY + 40
    const spotH = 70
    const spotBg = this.add.graphics().setScrollFactor(0).setDepth(502)
    spotBg.fillStyle(0x162612, 1)
    spotBg.fillRoundedRect(cardX + 16, spotY, cardW - 32, spotH, 10)
    spotBg.lineStyle(1.5, 0xFFD700, 0.5)
    spotBg.strokeRoundedRect(cardX + 16, spotY, cardW - 32, spotH, 10)

    this.add.text(cardX + 26, spotY + 12, `🐦  SPECIES SPOTLIGHT — ${spotlight.name.toUpperCase()}`, {
      fontSize: '11px',
      fontFamily: 'Arial Black',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 2
    }).setScrollFactor(0).setDepth(503)

    this.add.text(width / 2, spotY + 41, spotlight.fact, {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      wordWrap: { width: cardW - 52 },
      align: 'center',
      lineSpacing: 3
    }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(503)

    // ── Re-view Flashcards Button (if collected) ─────────────────
    if (reportData.flashCards && reportData.flashCards.length > 0) {
      const fcBtnY = spotY + 76
      const fcBtn = this.add.text(width / 2, fcBtnY, `🃏 Review Collected Flashcards (${reportData.flashCards.length})`, {
        fontSize: '12px',
        fontFamily: 'Arial Black',
        color: '#66ff99',
        backgroundColor: '#123320',
        padding: { x: 16, y: 5 }
      })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(504)
        .setInteractive({ useHandCursor: true })

      fcBtn.on('pointerover', () => {
        fcBtn.setStyle({ backgroundColor: '#1d4d31', color: '#aaffcc' })
      })
      fcBtn.on('pointerout', () => {
        fcBtn.setStyle({ backgroundColor: '#123320', color: '#66ff99' })
      })
      fcBtn.on('pointerdown', () => {
        if (this.sound && this.sound.play) {
          this.sound.play('select_sound', { volume: 0.75 })
        }
        this.scene.launch('FlashCardScene', {
          flashCards: reportData.flashCards,
          cards: reportData.flashCards,
          reportData: reportData,
          fromReport: true
        })
        this.scene.pause('ReportScene')
      })
    }

    // ── Action Buttons (Clean proportions and spacing) ────────────
    const btnY = cardY + cardH - 54
    const btnH = 44

    let hasExited = false
    const returnToMenu = () => {
      if (hasExited) return
      hasExited = true
      if (this.sound && this.sound.play) {
        this.sound.play('select_sound', { volume: 0.85 })
      }
      this.input.setDefaultCursor('default')
      this.scene.stop('GameScene')
      this.scene.stop('ReportScene')
      this.scene.start('MenuScene')
    }

    const proceedNextOrRetry = () => {
      if (hasExited) return
      hasExited = true
      if (this.sound && this.sound.play) {
        this.sound.play('select_sound', { volume: 0.85 })
      }
      this.input.setDefaultCursor('default')
      this.scene.stop('GameScene')
      this.scene.stop('ReportScene')

      if (escaped) {
        this.scene.start('GameScene2', {
          playerName: reportData.playerName,
          chosenBird: reportData.chosenBird,
          score: reportData.totalScore,
          previousScore: reportData.totalScore,
          evolutionStage: reportData.evolutionStage || 1,
          playerHP: 5,
          maxHP: 5
        })
      } else {
        this.scene.start('GameScene', {
          playerName: reportData.playerName,
          chosenBird: reportData.chosenBird
        })
      }
    }

    if (escaped) {
      // Primary NEXT LEVEL button
      const nextBtnW = 210
      const nextBtnX = width / 2 - 85
      const nextBtnBox = this.add.rectangle(nextBtnX, btnY + btnH / 2, nextBtnW, btnH, 0x00e676)
        .setOrigin(0.5).setScrollFactor(0).setDepth(504).setInteractive({ useHandCursor: true })

      const nextBtnText = this.add.text(nextBtnX, btnY + btnH / 2, 'NEXT LEVEL (ENTER) →', {
        fontSize: '13px',
        fontFamily: 'Arial Black',
        color: '#041c0e'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(505).setInteractive({ useHandCursor: true })

      const onNextHover = () => {
        nextBtnBox.setFillStyle(0x66ff99)
        nextBtnText.setScale(1.03)
      }
      const onNextOut = () => {
        nextBtnBox.setFillStyle(0x00e676)
        nextBtnText.setScale(1.0)
      }
      nextBtnBox.on('pointerover', onNextHover)
      nextBtnText.on('pointerover', onNextHover)
      nextBtnBox.on('pointerout', onNextOut)
      nextBtnText.on('pointerout', onNextOut)
      nextBtnBox.on('pointerdown', proceedNextOrRetry)
      nextBtnText.on('pointerdown', proceedNextOrRetry)

      // Secondary MENU button
      const menuBtnW = 140
      const menuBtnX = width / 2 + 105
      const menuBtnBox = this.add.rectangle(menuBtnX, btnY + btnH / 2, menuBtnW, btnH, 0x142b1e)
        .setOrigin(0.5).setScrollFactor(0).setDepth(504).setInteractive({ useHandCursor: true })

      const menuBtnText = this.add.text(menuBtnX, btnY + btnH / 2, 'MENU (ESC)', {
        fontSize: '12px',
        fontFamily: 'Arial Black',
        color: '#a3d9b5'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(505).setInteractive({ useHandCursor: true })

      const onMenuHover = () => {
        menuBtnBox.setFillStyle(0x1e3e2c)
        menuBtnText.setScale(1.03)
      }
      const onMenuOut = () => {
        menuBtnBox.setFillStyle(0x142b1e)
        menuBtnText.setScale(1.0)
      }
      menuBtnBox.on('pointerover', onMenuHover)
      menuBtnText.on('pointerover', onMenuHover)
      menuBtnBox.on('pointerout', onMenuOut)
      menuBtnText.on('pointerout', onMenuOut)
      menuBtnBox.on('pointerdown', returnToMenu)
      menuBtnText.on('pointerdown', returnToMenu)

    } else {
      // Primary PLAY AGAIN button
      const retryBtnW = 210
      const retryBtnX = width / 2 - 85
      const retryBtnBox = this.add.rectangle(retryBtnX, btnY + btnH / 2, retryBtnW, btnH, 0xff3355)
        .setOrigin(0.5).setScrollFactor(0).setDepth(504).setInteractive({ useHandCursor: true })

      const retryBtnText = this.add.text(retryBtnX, btnY + btnH / 2, 'PLAY AGAIN (ENTER)', {
        fontSize: '13px',
        fontFamily: 'Arial Black',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5).setScrollFactor(0).setDepth(505).setInteractive({ useHandCursor: true })

      const onRetryHover = () => {
        retryBtnBox.setFillStyle(0xff5577)
        retryBtnText.setScale(1.03)
      }
      const onRetryOut = () => {
        retryBtnBox.setFillStyle(0xff3355)
        retryBtnText.setScale(1.0)
      }
      retryBtnBox.on('pointerover', onRetryHover)
      retryBtnText.on('pointerover', onRetryHover)
      retryBtnBox.on('pointerout', onRetryOut)
      retryBtnText.on('pointerout', onRetryOut)
      retryBtnBox.on('pointerdown', proceedNextOrRetry)
      retryBtnText.on('pointerdown', proceedNextOrRetry)

      // Secondary MENU button
      const menuBtnW = 140
      const menuBtnX = width / 2 + 105
      const menuBtnBox = this.add.rectangle(menuBtnX, btnY + btnH / 2, menuBtnW, btnH, 0x2b1414)
        .setOrigin(0.5).setScrollFactor(0).setDepth(504).setInteractive({ useHandCursor: true })

      const menuBtnText = this.add.text(menuBtnX, btnY + btnH / 2, 'MENU (ESC)', {
        fontSize: '12px',
        fontFamily: 'Arial Black',
        color: '#d9a3a3'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(505).setInteractive({ useHandCursor: true })

      const onMenuHover = () => {
        menuBtnBox.setFillStyle(0x3e1e1e)
        menuBtnText.setScale(1.03)
      }
      const onMenuOut = () => {
        menuBtnBox.setFillStyle(0x2b1414)
        menuBtnText.setScale(1.0)
      }
      menuBtnBox.on('pointerover', onMenuHover)
      menuBtnText.on('pointerover', onMenuHover)
      menuBtnBox.on('pointerout', onMenuOut)
      menuBtnText.on('pointerout', onMenuOut)
      menuBtnBox.on('pointerdown', returnToMenu)
      menuBtnText.on('pointerdown', returnToMenu)
    }

    // ── Keyboard Shortcuts ───────────────────────────────────────

    this.input.keyboard.on('keydown-ENTER', () => {
      if (!this.scene.isActive('FlashCardScene')) {
        proceedNextOrRetry()
      }
    })

    this.input.keyboard.on('keydown-ESC', () => {
      if (!this.scene.isActive('FlashCardScene')) {
        returnToMenu()
      }
    })

    this.events.on('resume', () => {
      if (this.game.canvas && this.game.canvas.focus) {
        this.game.canvas.focus()
      }
    })
  }

  update() {}
}