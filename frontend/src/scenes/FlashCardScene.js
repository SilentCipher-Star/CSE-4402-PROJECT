import Phaser from 'phaser'

export class FlashCardScene extends Phaser.Scene {
  constructor() {
    super('FlashCardScene')
  }

  preload() {
    const cards = [
      'flashCard_1',
      'flashCard_2',
      'flashCard_3'
    ]

    cards.forEach(key => {
      if (!this.textures.exists(key)) {
        const fileKey = key.toLowerCase()
        this.load.image(key, `resource/flashcards/${fileKey}.png`)
      }
    })

    this.load.audio('select_sound', 'resource/audio/select_sound.mp3')
  }

  create(data) {
    // ---------------------------------------------------------
    // RECEIVE DATA FROM GAME SCENE
    // ---------------------------------------------------------
    this.flashCards = Array.isArray(data?.flashCards)
      ? [...data.flashCards]
      : (Array.isArray(data?.cards) ? [...data.cards] : [])

    this.reportData = data?.reportData || {}
    this.fromReport = Boolean(data?.fromReport)

    this.currentIndex = 0
    this.closing = false

    this.scene.bringToTop()
    this.input.enabled = true
    this.input.keyboard.enabled = true
    if (this.game.canvas && this.game.canvas.focus) {
      this.game.canvas.focus()
    }
    this.input.on('pointerdown', () => {
      if (this.game.canvas && this.game.canvas.focus) {
        this.game.canvas.focus()
      }
    })

    const { width, height } = this.scale

    // ---------------------------------------------------------
    // NO CARDS COLLECTED
    // ---------------------------------------------------------
    if (this.flashCards.length === 0) {
      this.goToReport()
      return
    }

    // ---------------------------------------------------------
    // BACKGROUND OVERLAY (Level 2 pattern)
    // ---------------------------------------------------------
    this.overlay = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x000000,
      0.90
    )
      .setScrollFactor(0)
      .setDepth(0)
      .setInteractive()

    // ---------------------------------------------------------
    // PANEL CONTAINER (Forest Nature color coordination)
    // Proportioned comfortably within 720p (640px height)
    // ---------------------------------------------------------
    this.panelW = Math.min(760, width - 40)
    this.panelH = Math.min(640, height - 40)

    const panelX = width / 2
    const panelY = height / 2

    this.panel = this.add.graphics()
      .setScrollFactor(0)
      .setDepth(1)

    // Deep forest green base
    this.panel.fillStyle(0x0c1e14, 1)
    this.panel.fillRoundedRect(
      panelX - this.panelW / 2,
      panelY - this.panelH / 2,
      this.panelW,
      this.panelH,
      22
    )

    // Emerald nature border
    this.panel.lineStyle(3, 0x00e676, 1)
    this.panel.strokeRoundedRect(
      panelX - this.panelW / 2,
      panelY - this.panelH / 2,
      this.panelW,
      this.panelH,
      22
    )

    // Subtle inner trim
    this.panel.lineStyle(1, 0x66ff99, 0.25)
    this.panel.strokeRoundedRect(
      panelX - this.panelW / 2 + 6,
      panelY - this.panelH / 2 + 6,
      this.panelW - 12,
      this.panelH - 12,
      18
    )

    // ---------------------------------------------------------
    // TITLE (High contrast, crisp stroke)
    // ---------------------------------------------------------
    this.title = this.add.text(
      panelX,
      panelY - this.panelH / 2 + 34,
      '🌱 SPECIES FLASHCARDS',
      {
        fontSize: '26px',
        fontFamily: 'Arial Black',
        color: '#66ff99',
        stroke: '#000000',
        strokeThickness: 4
      }
    )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2)

    // ---------------------------------------------------------
    // COUNTER
    // ---------------------------------------------------------
    this.counter = this.add.text(
      panelX,
      panelY - this.panelH / 2 + 68,
      '',
      {
        fontSize: '16px',
        fontFamily: 'Arial Black',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
      }
    )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2)

    // ---------------------------------------------------------
    // CARD IMAGE
    // ---------------------------------------------------------
    this.cardImage = this.add.image(
      panelX,
      panelY + 4,
      ''
    )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2)

    this.cardImage.setVisible(false)

    // ---------------------------------------------------------
    // NAVIGATION BUTTONS
    // ---------------------------------------------------------
    this.previousButton = this.makeButton(
      panelX - 155,
      panelY + this.panelH / 2 - 50,
      '← PREVIOUS',
      () => {
        this.showCard(this.currentIndex - 1)
      }
    )

    this.nextButton = this.makeButton(
      panelX + 155,
      panelY + this.panelH / 2 - 50,
      'NEXT →',
      () => {
        this.showCard(this.currentIndex + 1)
      }
    )

    // Controls hint text below buttons
    this.add.text(
      panelX,
      panelY + this.panelH / 2 - 16,
      'Use  ← / →  Arrow Keys or Click Buttons • [ENTER / ESC] to Continue',
      {
        fontSize: '11px',
        fontFamily: 'Arial Black',
        color: '#88cca8',
        stroke: '#000000',
        strokeThickness: 2
      }
    )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(3)

    // ---------------------------------------------------------
    // KEYBOARD CONTROLS
    // ---------------------------------------------------------
    this.input.keyboard.on('keydown-LEFT', () => {
      if (!this.closing) {
        if (this.sound && this.sound.play) {
          this.sound.play('select_sound', { volume: 0.85 })
        }
        this.showCard(this.currentIndex - 1)
      }
    })

    this.input.keyboard.on('keydown-RIGHT', () => {
      if (!this.closing) {
        if (this.sound && this.sound.play) {
          this.sound.play('select_sound', { volume: 0.85 })
        }
        this.showCard(this.currentIndex + 1)
      }
    })

    this.input.keyboard.on('keydown-ENTER', () => {
      if (!this.closing) {
        if (this.sound && this.sound.play) {
          this.sound.play('select_sound', { volume: 0.85 })
        }
        if (this.currentIndex === this.flashCards.length - 1) {
          this.goToReport()
        } else {
          this.showCard(this.currentIndex + 1)
        }
      }
    })

    this.input.keyboard.on('keydown-SPACE', () => {
      if (!this.closing) {
        if (this.sound && this.sound.play) {
          this.sound.play('select_sound', { volume: 0.85 })
        }
        if (this.currentIndex === this.flashCards.length - 1) {
          this.goToReport()
        } else {
          this.showCard(this.currentIndex + 1)
        }
      }
    })

    this.input.keyboard.once('keydown-ESC', () => {
      if (this.sound && this.sound.play) {
        this.sound.play('select_sound', { volume: 0.85 })
      }
      this.goToReport()
    })

    // ---------------------------------------------------------
    // SHOW FIRST CARD
    // ---------------------------------------------------------
    this.showCard(0)
  }

  // ===========================================================
  // CREATE BUTTON (Forest Nature emerald palette)
  // ===========================================================
  makeButton(x, y, label, callback) {
    const button = this.add.text(
      x,
      y,
      `  ${label}  `,
      {
        fontSize: '15px',
        fontFamily: 'Arial Black',
        color: '#041c0e',
        backgroundColor: '#00e676',
        padding: {
          x: 18,
          y: 10
        }
      }
    )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(3)
      .setInteractive({
        useHandCursor: true
      })

    button.on('pointerover', () => {
      button.setStyle({
        backgroundColor: '#66ff99'
      })
      button.setScale(1.03)
    })

    button.on('pointerout', () => {
      button.setStyle({
        backgroundColor: '#00e676'
      })
      button.setScale(1.0)
    })

    button.on('pointerdown', () => {
      if (this.sound && this.sound.play) {
        this.sound.play('select_sound', { volume: 0.85 })
      }
      callback()
    })

    return button
  }

  // ===========================================================
  // SHOW CARD
  // ===========================================================
  showCard(index) {
    if (!this.flashCards.length) return
    if (this.closing) return

    this.currentIndex = Phaser.Math.Clamp(
      index,
      0,
      this.flashCards.length - 1
    )

    const cardKey = this.flashCards[this.currentIndex]

    this.counter.setText(
      `Card ${this.currentIndex + 1} of ${this.flashCards.length}`
    )

    if (this.textures.exists(cardKey)) {
      if (this.missingText) {
        this.missingText.destroy()
        this.missingText = null
      }

      this.cardImage.setTexture(cardKey)
      this.cardImage.setVisible(true)

      const maxW = this.panelW - 80
      const maxH = this.panelH - 165

      const scale = Math.min(
        maxW / this.cardImage.width,
        maxH / this.cardImage.height
      )

      this.cardImage.setScale(scale)
    } else {
      this.cardImage.setVisible(false)

      if (this.missingText) {
        this.missingText.destroy()
      }

      this.missingText = this.add.text(
        this.scale.width / 2,
        this.scale.height / 2,
        `Flashcard image not found:\n${cardKey}`,
        {
          fontSize: '18px',
          fontFamily: 'Arial Black',
          color: '#ff6677',
          align: 'center',
          stroke: '#000000',
          strokeThickness: 3
        }
      )
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(3)
    }

    // Previous button visibility
    this.previousButton.setVisible(this.currentIndex > 0)

    // Next / Report button
    const lastCard = this.currentIndex === this.flashCards.length - 1

    this.nextButton.removeAllListeners('pointerdown')

    if (lastCard) {
      this.nextButton.setText(
        this.fromReport ? '  CLOSE (ESC)  ' : '  VIEW REPORT →  '
      )
      this.nextButton.setStyle({
        backgroundColor: '#00e676'
      })
      this.nextButton.on('pointerdown', () => {
        if (this.sound && this.sound.play) {
          this.sound.play('select_sound', { volume: 0.85 })
        }
        this.goToReport()
      })
    } else {
      this.nextButton.setText('  NEXT →  ')
      this.nextButton.setStyle({
        backgroundColor: '#00e676'
      })
      this.nextButton.on('pointerdown', () => {
        if (this.sound && this.sound.play) {
          this.sound.play('select_sound', { volume: 0.85 })
        }
        this.showCard(this.currentIndex + 1)
      })
    }
  }

  // ===========================================================
  // GO TO REPORT
  // ===========================================================
  goToReport() {
    if (this.closing) return
    this.closing = true

    this.scene.stop('FlashCardScene')

    if (this.fromReport) {
      if (this.scene.isPaused('ReportScene')) {
        this.scene.resume('ReportScene')
      }
    } else {
      this.scene.launch('ReportScene', this.reportData)
    }
  }
}