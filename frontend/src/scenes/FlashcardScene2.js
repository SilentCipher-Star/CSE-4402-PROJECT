import Phaser from 'phaser'

export class FlashcardScene2 extends Phaser.Scene {
  constructor() {
    super('FlashcardScene2')
  }

  preload() {
    const cards = [
      'card_arctic_willow',
      'card_himalayan_yew',
      'card_ice_grass',
      'card_polar_bellflower',
      'card_snow_lotus'
    ]

    cards.forEach(key => {
      if (!this.textures.exists(key)) {
        this.load.image(
          key,
          `resource/flashcards/${key}.png`
        )
      }
    })
  }

  create(data) {
    // ---------------------------------------------------------
    // RECEIVE DATA FROM GAME SCENE 2
    // ---------------------------------------------------------

    this.flashCards = Array.isArray(data?.flashCards)
      ? [...data.flashCards]
      : []

    this.reportData = data?.reportData || {}

    this.currentIndex = 0
    this.closing = false

    this.input.keyboard.enabled = true
    if (this.game.canvas && this.game.canvas.focus) {
      this.game.canvas.focus()
    }

    const { width, height } = this.scale

    // ---------------------------------------------------------
    // NO CARDS COLLECTED
    // ---------------------------------------------------------

    if (this.flashCards.length === 0) {
      this.time.delayedCall(1, () => {
        this.goToReport()
      })
      return
    }

    // ---------------------------------------------------------
    // BACKGROUND
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
    // PANEL
    // ---------------------------------------------------------

    this.panelW = Math.min(
      760,
      width - 40
    )

    this.panelH = Math.min(
      700,
      height - 40
    )

    const panelX = width / 2
    const panelY = height / 2

    this.panel = this.add.graphics()
      .setScrollFactor(0)
      .setDepth(1)

    this.panel.fillStyle(
      0x0a1420,
      1
    )

    this.panel.fillRoundedRect(
      panelX - this.panelW / 2,
      panelY - this.panelH / 2,
      this.panelW,
      this.panelH,
      22
    )

    this.panel.lineStyle(
      3,
      0x00BFFF,
      1
    )

    this.panel.strokeRoundedRect(
      panelX - this.panelW / 2,
      panelY - this.panelH / 2,
      this.panelW,
      this.panelH,
      22
    )

    // ---------------------------------------------------------
    // TITLE
    // ---------------------------------------------------------

    this.title = this.add.text(
      panelX,
      panelY - this.panelH / 2 + 34,
      '❄️ SPECIES FLASHCARDS',
      {
        fontSize: '25px',
        fontFamily: 'Arial Black',
        color: '#00BFFF'
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
        fontSize: '15px',
        fontFamily: 'Arial',
        color: '#b8d4d9'
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
      panelY + 5,
      ''
    )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2)

    this.cardImage.setVisible(false)

    // ---------------------------------------------------------
    // BUTTONS
    // ---------------------------------------------------------

    this.previousButton = this.makeButton(
      panelX - 155,
      panelY + this.panelH / 2 - 48,
      '← PREVIOUS',
      () => {
        this.showCard(
          this.currentIndex - 1
        )
      }
    )

    this.nextButton = this.makeButton(
      panelX + 155,
      panelY + this.panelH / 2 - 48,
      'NEXT →',
      () => {
        this.showCard(
          this.currentIndex + 1
        )
      }
    )

    // ---------------------------------------------------------
    // KEYBOARD CONTROLS
    // ---------------------------------------------------------

    this.input.keyboard.on(
      'keydown-LEFT',
      () => {
        if (!this.closing) {
          this.showCard(
            this.currentIndex - 1
          )
        }
      }
    )

    this.input.keyboard.on(
      'keydown-RIGHT',
      () => {
        if (!this.closing) {
          this.showCard(
            this.currentIndex + 1
          )
        }
      }
    )

    this.input.keyboard.on(
      'keydown-ENTER',
      () => {
        if (!this.closing) {
          if (this.currentIndex === this.flashCards.length - 1) {
            this.goToReport()
          } else {
            this.showCard(this.currentIndex + 1)
          }
        }
      }
    )

    this.input.keyboard.on(
      'keydown-SPACE',
      () => {
        if (!this.closing) {
          if (this.currentIndex === this.flashCards.length - 1) {
            this.goToReport()
          } else {
            this.showCard(this.currentIndex + 1)
          }
        }
      }
    )

    this.input.keyboard.once(
      'keydown-ESC',
      () => {
        this.goToReport()
      }
    )

    // ---------------------------------------------------------
    // SHOW FIRST CARD
    // ---------------------------------------------------------

    this.showCard(0)
  }

  // ===========================================================
  // CREATE BUTTON
  // ===========================================================

  makeButton(x, y, label, callback) {
    const button = this.add.text(
      x,
      y,
      `  ${label}  `,
      {
        fontSize: '15px',
        fontFamily: 'Arial Black',
        color: '#04140c',
        backgroundColor: '#00BFFF',
        padding: {
          x: 16,
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

    button.on(
      'pointerover',
      () => {
        button.setStyle({
          backgroundColor: '#66d9ff'
        })
      }
    )

    button.on(
      'pointerout',
      () => {
        button.setStyle({
          backgroundColor: '#00BFFF'
        })
      }
    )

    button.on(
      'pointerdown',
      callback
    )

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

    const cardKey =
      this.flashCards[this.currentIndex]

    this.counter.setText(
      `Card ${this.currentIndex + 1} of ${this.flashCards.length}`
    )

    // ---------------------------------------------------------
    // CARD EXISTS
    // ---------------------------------------------------------

    if (this.textures.exists(cardKey)) {

      if (this.missingText) {
        this.missingText.destroy()
        this.missingText = null
      }

      this.cardImage.setTexture(cardKey)
      this.cardImage.setVisible(true)

      const maxW =
        this.panelW - 70

      const maxH =
        this.panelH - 130

      const scale = Math.min(
        maxW / this.cardImage.width,
        maxH / this.cardImage.height
      )

      this.cardImage.setScale(scale)

    } else {

      // -------------------------------------------------------
      // CARD MISSING
      // -------------------------------------------------------

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
          color: '#ff6677',
          align: 'center'
        }
      )
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(3)
    }

    // ---------------------------------------------------------
    // PREVIOUS BUTTON
    // ---------------------------------------------------------

    this.previousButton.setVisible(
      this.currentIndex > 0
    )

    // ---------------------------------------------------------
    // NEXT / REPORT BUTTON
    // ---------------------------------------------------------

    const lastCard =
      this.currentIndex ===
      this.flashCards.length - 1

    this.nextButton.removeAllListeners(
      'pointerdown'
    )

    if (lastCard) {

      this.nextButton.setText(
        '  VIEW REPORT →  '
      )

      this.nextButton.setStyle({
        backgroundColor: '#00BFFF'
      })

      this.nextButton.on(
        'pointerdown',
        () => {
          this.goToReport()
        }
      )

    } else {

      this.nextButton.setText(
        '  NEXT →  '
      )

      this.nextButton.setStyle({
        backgroundColor: '#00BFFF'
      })

      this.nextButton.on(
        'pointerdown',
        () => {
          this.showCard(
            this.currentIndex + 1
          )
        }
      )
    }
  }

  // ===========================================================
  // FLASHCARDS → EXISTING GAME2 REPORT
  // ===========================================================

  goToReport() {
    if (this.closing) return

    this.closing = true

    console.log('FLASHCARD2: Going to report')

    const gameScene =
      this.scene.get('GameScene2')

    if (!gameScene) {
      console.error(
        'FLASHCARD2 ERROR: GameScene2 not found'
      )
      return
    }

    console.log(
      'FLASHCARD2: GameScene2 found:',
      gameScene
    )

    // ---------------------------------------------------------
    // FIRST: STOP THIS FLASHCARD SCENE
    // ---------------------------------------------------------

    this.scene.stop('FlashcardScene2')

    // ---------------------------------------------------------
    // SECOND: RESUME GAME SCENE 2
    // ---------------------------------------------------------

    if (gameScene.scene.isPaused()) {
      console.log(
        'FLASHCARD2: Resuming GameScene2'
      )

      gameScene.scene.resume()
    }

    // ---------------------------------------------------------
    // THIRD: SHOW EXISTING REPORT
    // ---------------------------------------------------------

    if (
      typeof gameScene.showConservationReport ===
      'function'
    ) {
      console.log(
        'FLASHCARD2: Showing conservation report'
      )

      gameScene.showConservationReport(
        this.reportData.escaped
      )
    } else {
      console.error(
        'FLASHCARD2 ERROR: showConservationReport() does not exist on GameScene2'
      )
    }
  }
}
