import Phaser from 'phaser'

export class FlashCardScene extends Phaser.Scene {
  constructor() {
    super('FlashCardScene')
  }

  init(data) {
    this.cards = data.cards || []
    this.reportData = data.reportData || null
    this.cardIndex = 0
    this.isClosing = false
  }

  create() {
    const { width, height } = this.scale

    this.input.keyboard.enableGlobalCapture()
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
      document.activeElement.blur()
    }
    if (this.game.canvas) {
      this.game.canvas.focus()
    }

    // Overlay backdrop - clicking outside the panel closes the flashcard viewer
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.72)
      .setOrigin(0)
      .setInteractive()
    overlay.on('pointerdown', () => this.closeScene())

    // Card panel container bounds
    const panelX = width * 0.18
    const panelY = height * 0.08
    const panelW = width * 0.64
    const panelH = height * 0.82

    const panel = this.add.graphics()
    panel.fillStyle(0x102719, 0.96)
    panel.fillRoundedRect(panelX, panelY, panelW, panelH, 18)
    panel.lineStyle(4, 0x66ff99, 1)
    panel.strokeRoundedRect(panelX, panelY, panelW, panelH, 18)

    // Panel hit area prevents clicks inside the panel from triggering the overlay's close
    this.add.rectangle(panelX + panelW / 2, panelY + panelH / 2, panelW, panelH, 0x000000, 0)
      .setInteractive()

    // Title
    this.add.text(width / 2, panelY + 36, '🌱 Saved Sapling Flash Cards', {
      fontSize: '26px',
      fontFamily: 'Arial Black',
      color: '#aaffcc',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5)

    // Close '✖' button in top-right corner of the panel
    const closeBtn = this.add.text(panelX + panelW - 30, panelY + 30, '✖', {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#91ffb5'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    closeBtn.on('pointerover', () => {
      closeBtn.setColor('#ff6b6b')
      closeBtn.setScale(1.2)
    })
    closeBtn.on('pointerout', () => {
      closeBtn.setColor('#91ffb5')
      closeBtn.setScale(1)
    })
    closeBtn.on('pointerdown', () => this.closeScene())

    if (this.cards.length === 0) {
      this.add.text(width / 2, height / 2, 'No flash cards unlocked yet.', {
        fontSize: '24px',
        fontFamily: 'Arial Black',
        color: '#ffffff'
      }).setOrigin(0.5)
    } else {
      this.cardImage = this.add.image(width / 2, height / 2 - 8, this.cards[this.cardIndex])
      this.fitCard()

      this.counterText = this.add.text(width / 2, panelY + panelH - 85, '', {
        fontSize: '18px',
        fontFamily: 'Arial Black',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5)

      this.refreshCard()

      // Arrow navigation buttons if more than 1 card
      if (this.cards.length > 1) {
        this.makeArrowButton(panelX + 45, height / 2 - 8, '◀', () => this.prevCard())
        this.makeArrowButton(panelX + panelW - 45, height / 2 - 8, '▶', () => this.nextCard())
      }
    }

    // Clickable Back Button at bottom
    const backBtnY = panelY + panelH - 42
    this.makeBackButton(width / 2, backBtnY, '← BACK (ESC)', () => this.closeScene())

    if (this.cards.length > 1) {
      this.add.text(width / 2, panelY + panelH - 108, 'Use  ← / →  or click arrows to change card', {
        fontSize: '13px',
        fontFamily: 'Arial',
        color: '#a3d9b5'
      }).setOrigin(0.5)
    }

    this.cursors = this.input.keyboard.createCursorKeys()
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)

    this.input.keyboard.on('keydown-ESC', () => this.closeScene())
    this.input.keyboard.on('keydown-LEFT', () => this.prevCard())
    this.input.keyboard.on('keydown-RIGHT', () => this.nextCard())
  }

  update() {}

  makeBackButton(x, y, label, onClick) {
    const btnW = 190
    const btnH = 38

    const box = this.add.rectangle(x, y, btnW, btnH, 0x1d5c36)
      .setStrokeStyle(2, 0x92ffb5)
      .setInteractive({ useHandCursor: true })

    const text = this.add.text(x, y, label, {
      fontSize: '15px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
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
    text.setInteractive({ useHandCursor: true })
    text.on('pointerdown', onClick)
  }

  makeArrowButton(x, y, label, onClick) {
    const circle = this.add.circle(x, y, 24, 0x183c27, 0.9)
      .setStrokeStyle(2, 0x66ff99)
      .setInteractive({ useHandCursor: true })

    const text = this.add.text(x, y, label, {
      fontSize: '20px',
      fontFamily: 'Arial Black',
      color: '#c8ff7a'
    }).setOrigin(0.5)

    circle.on('pointerover', () => {
      circle.setFillStyle(0x2d6b45, 1)
      text.setScale(1.15)
    })
    circle.on('pointerout', () => {
      circle.setFillStyle(0x183c27, 0.9)
      text.setScale(1)
    })
    circle.on('pointerdown', onClick)
    text.setInteractive({ useHandCursor: true })
    text.on('pointerdown', onClick)
  }

  prevCard() {
    if (this.cards.length <= 1) return
    this.cardIndex = (this.cardIndex - 1 + this.cards.length) % this.cards.length
    this.refreshCard()
  }

  nextCard() {
    if (this.cards.length <= 1) return
    this.cardIndex = (this.cardIndex + 1) % this.cards.length
    this.refreshCard()
  }

  closeScene() {
    if (this.isClosing) return
    this.isClosing = true
    this.scene.stop('FlashCardScene')
    this.scene.resume('ReportScene')
  }

  fitCard() {
    const { width, height } = this.scale
    const maxW = width * 0.48
    const maxH = height * 0.54

    const scaleX = maxW / this.cardImage.width
    const scaleY = maxH / this.cardImage.height
    const scale = Math.min(scaleX, scaleY)

    this.cardImage.setScale(scale)
  }

  refreshCard() {
    if (!this.cardImage || this.cards.length === 0) return
    this.cardImage.setTexture(this.cards[this.cardIndex])
    this.fitCard()

    if (this.counterText) {
      this.counterText.setText(`Card ${this.cardIndex + 1} / ${this.cards.length}`)
    }
  }
}