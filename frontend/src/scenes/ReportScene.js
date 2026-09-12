import Phaser from 'phaser'

export class ReportScene extends Phaser.Scene {
  constructor() {
    super('ReportScene')
  }

  create(data) {
    const { width, height } = this.scale

    this.cameras.main.setBackgroundColor('rgba(0,0,0,0)')

    const d = data || (this.sys && this.sys.settings && this.sys.settings.data) || {}
    const reportData = {
      playerName: d.playerName || 'Player',
      chosenBird: d.chosenBird || 'Ember',
      evolutionStage: d.evolutionStage || 1,
      totalScore: d.totalScore || 0,
      saplingsCollected: d.saplingsCollected || 0,
      animalsRescued: d.animalsRescued || 0,
      monstersKilled: d.monstersKilled || 0,
      co2Absorbed: d.co2Absorbed || 0,
      timeTaken: d.timeTaken || 0,
      flashCards: d.flashCards || [],
      escaped: d.escaped
    }

    // Dark tint only. The paused game stays visible behind this.
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.58)
      .setOrigin(0)

    // Smaller centered report panel, not full screen.
    const panelW = Math.min(width * 0.66, 920)
    const panelH = Math.min(height * 0.78, 640)
    const panelX = (width - panelW) / 2
    const panelY = (height - panelH) / 2

    const panel = this.add.graphics()

    panel.fillStyle(0x0f2b1d, 0.94)
    panel.fillRoundedRect(panelX, panelY, panelW, panelH, 22)

    panel.lineStyle(4, 0x66ff99, 1)
    panel.strokeRoundedRect(panelX, panelY, panelW, panelH, 22)

    panel.lineStyle(2, 0x9cffb4, 0.35)
    panel.strokeRoundedRect(panelX + 10, panelY + 10, panelW - 20, panelH - 20, 18)

    // Title
    this.add.text(width / 2, panelY + panelH * 0.075, '🌿 FOREST CONSERVATION REPORT', {
      fontSize: '28px',
      fontFamily: 'Georgia',
      color: '#baffc9',
      stroke: '#052b12',
      strokeThickness: 4
    }).setOrigin(0.5)

    const statusText = reportData.escaped
      ? '✅ Replanting zone reached!'
      : '⚠️ Mission ended before full restoration'

    this.add.text(width / 2, panelY + panelH * 0.13, statusText, {
      fontSize: '16px',
      fontFamily: 'Arial Black',
      color: reportData.escaped ? '#c8ff7a' : '#ffcc66',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5)

    const divider = this.add.graphics()
    divider.lineStyle(2, 0x66ff99, 0.55)
    divider.lineBetween(
      panelX + 55,
      panelY + panelH * 0.17,
      panelX + panelW - 55,
      panelY + panelH * 0.17
    )

    const rows = [
      {
        icon: '🌱',
        label: 'Saplings Collected',
        value: `${reportData.saplingsCollected}`,
        color: '#b7ff63'
      },
      {
        icon: '🐾',
        label: 'Animals Rescued',
        value: `${reportData.animalsRescued}`,
        color: '#7dffd1'
      },
      {
        icon: '🏹',
        label: 'Hunters Defeated',
        value: `${reportData.monstersKilled}`,
        color: '#ff9b6b'
      },
      {
        icon: '🌬️',
        label: 'CO₂ Absorbed',
        value: `${reportData.co2Absorbed} kg CO₂ / yr`,
        color: '#73eaff'
      },
      {
        icon: '⭐',
        label: 'Total Score',
        value: `${reportData.totalScore}`,
        color: '#ffe066'
      },
      {
        icon: '⏱️',
        label: 'Time Taken',
        value: `${reportData.timeTaken}s`,
        color: '#ffffff'
      },
      {
        icon: '🃏',
        label: 'Sapling Flash Cards',
        value: reportData.flashCards.length > 0 ? 'VIEW' : 'NONE',
        color: reportData.flashCards.length > 0 ? '#aaffaa' : '#aaaaaa',
        flashCardRow: true
      }
    ]

    const rowX = panelX + 55
    const rowW = panelW - 110
    const rowH = panelH * 0.065
    const startY = panelY + panelH * 0.21

    rows.forEach((row, index) => {
      const y = startY + index * rowH

      const rowColor = index % 2 === 0 ? 0x183c27 : 0x224f35

      const rowBg = this.add.rectangle(
        rowX + rowW / 2,
        y + rowH / 2,
        rowW,
        rowH * 0.82,
        rowColor,
        0.96
      ).setStrokeStyle(1, 0x91ffb5, 0.18)

      if (row.flashCardRow && reportData.flashCards.length > 0) {
        rowBg.setInteractive({ useHandCursor: true })

        rowBg.on('pointerover', () => {
          rowBg.setFillStyle(0x2d6b45, 1)
        })

        rowBg.on('pointerout', () => {
          rowBg.setFillStyle(rowColor, 0.96)
        })

        rowBg.on('pointerdown', () => {
          this.scene.launch('FlashCardScene', {
            cards: reportData.flashCards,
            reportData
          })

          this.scene.pause('ReportScene')
        })
      }

      this.add.text(rowX + 18, y + rowH / 2, `${row.icon}  ${row.label}`, {
        fontSize: '17px',
        fontFamily: 'Arial Black',
        color: '#eaffef',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0, 0.5)

      this.add.text(rowX + rowW - 18, y + rowH / 2, row.value, {
        fontSize: '19px',
        fontFamily: 'Arial Black',
        color: row.color,
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(1, 0.5)
    })

    // Grade box gets its own row. Buttons are below it.
    const grade = this.getGrade(reportData)

    const gradeBoxX = rowX
    const gradeBoxW = rowW
    const gradeBoxH = panelH * 0.085
    const gradeBoxY = panelY + panelH * 0.72

    const gradeBox = this.add.graphics()
    gradeBox.fillStyle(0x0b1c12, 0.95)
    gradeBox.lineStyle(3, 0x66ff99, 0.9)
    gradeBox.fillRoundedRect(gradeBoxX, gradeBoxY, gradeBoxW, gradeBoxH, 10)
    gradeBox.strokeRoundedRect(gradeBoxX, gradeBoxY, gradeBoxW, gradeBoxH, 10)

    this.add.text(gradeBoxX + 25, gradeBoxY + gradeBoxH / 2, 'Conservation Grade', {
      fontSize: '18px',
      fontFamily: 'Arial Black',
      color: '#d9ffe2',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0, 0.5)

    this.add.text(gradeBoxX + gradeBoxW - 35, gradeBoxY + gradeBoxH / 2, grade, {
      fontSize: '36px',
      fontFamily: 'Arial Black',
      color: '#ffe066',
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(1, 0.5)

    // Buttons below grade box, not overlapping it.
    const btnY = panelY + panelH * 0.88
    const nextBtnLabel = reportData.escaped ? 'NEXT LEVEL' : 'RETRY LEVEL'
    this.makeButton(panelX + panelW * 0.36, btnY, nextBtnLabel, () => {
      if (this.isLeaving) return
      this.isLeaving = true

      this.scene.stop('GameScene')

      if (reportData.escaped && (this.scene.get('GameScene2') || (this.scene.manager && this.scene.manager.keys && this.scene.manager.keys.GameScene2))) {
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
    })

    this.makeButton(panelX + panelW * 0.64, btnY, 'MENU (ESC)', () => {
      this.goToMenu()
    })

    this.isLeaving = false
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)

    this.input.keyboard.on('keydown-ESC', () => {
      if (!this.scene.isActive('FlashCardScene')) {
        this.goToMenu()
      }
    })

    this.events.on('resume', () => {
      if (this.game.canvas) {
        this.game.canvas.focus()
      }
      if (this.escKey) {
        this.escKey.reset()
      }
    })
  }

  goToMenu() {
    if (this.isLeaving) return
    this.isLeaving = true
    this.scene.stop('GameScene')
    this.scene.start('MenuScene')
  }

  update() {}

  getGrade(data) {
    const score = data.totalScore || 0
    const saplings = data.saplingsCollected || 0
    const animals = data.animalsRescued || 0
    const monsters = data.monstersKilled || 0

    const performance = score + saplings * 80 + animals * 120 + monsters * 70

    if (performance >= 3000) return 'S'
    if (performance >= 2200) return 'A'
    if (performance >= 1500) return 'B'
    if (performance >= 800) return 'C'
    return 'D'
  }

  makeButton(x, y, label, onClick) {
    const buttonW = 185
    const buttonH = 42

    const box = this.add.rectangle(x, y, buttonW, buttonH, 0x1d5c36)
      .setStrokeStyle(3, 0x92ffb5)
      .setInteractive({ useHandCursor: true })

    const text = this.add.text(x, y, label, {
      fontSize: '16px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5)

    box.on('pointerover', () => {
      box.setFillStyle(0x2e8a52)
      text.setScale(1.05)
    })

    box.on('pointerout', () => {
      box.setFillStyle(0x1d5c36)
      text.setScale(1)
    })

    box.on('pointerdown', onClick)
  }

  showMessage(x, y, message) {
    if (this.messageText) {
      this.messageText.destroy()
    }

    this.messageText = this.add.text(x, y, message, {
      fontSize: '18px',
      fontFamily: 'Arial Black',
      color: '#ffcc66',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5)

    this.time.delayedCall(1600, () => {
      if (this.messageText) {
        this.messageText.destroy()
        this.messageText = null
      }
    })
  }
}