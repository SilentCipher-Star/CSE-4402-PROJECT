import Phaser from 'phaser'

export class FlashCardScene extends Phaser.Scene {
  constructor() {
    super('FlashCardScene')
  }

  init(data) {
    this.cards = data.cards || []
    this.reportData = data.reportData || null
    this.cardIndex = 0
  }

  create() {
    const { width, height } = this.scale

    this.input.keyboard.enableGlobalCapture()
    if (document.activeElement) {
      document.activeElement.blur()
    }
    const overlay = this.add.graphics()
    overlay.fillStyle(0x000000, 0.72)
    overlay.fillRect(0, 0, width, height)

    const panel = this.add.graphics()
    panel.fillStyle(0x102719, 0.96)
    panel.fillRoundedRect(width * 0.18, height * 0.08, width * 0.64, height * 0.82, 18)
    panel.lineStyle(4, 0x66ff99, 1)
    panel.strokeRoundedRect(width * 0.18, height * 0.08, width * 0.64, height * 0.82, 18)

    this.add.text(width / 2, 55, '🌱 Saved Sapling Flash Cards', {
      fontSize: '28px',
      fontFamily: 'Arial Black',
      color: '#aaffcc',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5)

    if (this.cards.length === 0) {
      this.add.text(width / 2, height / 2, 'No flash cards unlocked yet.', {
        fontSize: '24px',
        color: '#ffffff'
      }).setOrigin(0.5)
    } else {
      this.cardImage = this.add.image(width / 2, height / 2, this.cards[this.cardIndex])
      this.fitCard()

      this.counterText = this.add.text(width / 2, height - 95, '', {
        fontSize: '19px',
        fontFamily: 'Arial Black',
        color: '#ffffff'
      }).setOrigin(0.5)

      this.refreshCard()
    }

    this.add.text(width / 2, height - 58, '← / →  Change Card     ESC  Back', {
      fontSize: '17px',
      fontFamily: 'Arial Black',
      color: '#d7ffe1'
    }).setOrigin(0.5)

    this.cursors = this.input.keyboard.createCursorKeys()
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
  }

  update() {
    if (this.cards.length > 0) {
      if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
        this.cardIndex = (this.cardIndex + 1) % this.cards.length
        this.refreshCard()
      }

      if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
        this.cardIndex = (this.cardIndex - 1 + this.cards.length) % this.cards.length
        this.refreshCard()
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.scene.stop('FlashCardScene')
      this.scene.resume('ReportScene')
    }
  }

  fitCard() {
    const { width, height } = this.scale
    const maxW = width * 0.48
    const maxH = height * 0.58

    const scaleX = maxW / this.cardImage.width
    const scaleY = maxH / this.cardImage.height
    const scale = Math.min(scaleX, scaleY)

    this.cardImage.setScale(scale)
  }

  refreshCard() {
    this.cardImage.setTexture(this.cards[this.cardIndex])
    this.fitCard()

    this.counterText.setText(`Card ${this.cardIndex + 1} / ${this.cards.length}`)
  }
}