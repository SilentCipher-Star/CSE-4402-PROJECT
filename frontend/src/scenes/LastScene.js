import Phaser from 'phaser'

export class LastScene extends Phaser.Scene {
  constructor() {
    super('LastScene')
  }

  preload() {
    this.load.image('last_page', 'resource/last_page.png')
    this.load.image('flower_player', 'resource/flower_player.png')
    this.load.image('menu_btn', 'resource/menu.png')
    this.load.audio('select_sound', 'resource/audio/select_sound.mp3')
    this.load.audio('last_scene_music', 'resource/audio/last_scene.mp3')
  }

  init(data) {
    this.playerName = data?.playerName || 'Adventurer'
    this.chosenBird = data?.chosenBird || 'Ember'
    this.score = data?.score || 0
  }

  create() {
    const { width, height } = this.scale

    // Stop any residual menu or level BGM
    try {
      const oldBgm = this.sound.get('menu_bg_music')
      if (oldBgm && oldBgm.isPlaying) oldBgm.stop()
    } catch (e) {}

    // Play Last Scene music (last_scene.mp3)
    try {
      let lastMusic = this.sound.get('last_scene_music')
      if (!lastMusic) {
        lastMusic = this.sound.add('last_scene_music', { loop: true, volume: 0.65 })
        lastMusic.play()
      } else if (!lastMusic.isPlaying) {
        lastMusic.play({ loop: true, volume: 0.65 })
      }
    } catch (e) {
      console.warn('LastScene audio play notice:', e)
    }

    if (this.game.canvas && this.game.canvas.focus) {
      this.game.canvas.focus()
    }
    this.input.enabled = true
    this.input.keyboard.enabled = true
    this.input.setDefaultCursor('default')

    this.cameras.main.fadeIn(800, 0, 0, 0)

    // Full screen background image of last_page.png
    const bg = this.add.image(width / 2, height / 2, 'last_page')
    bg.setDisplaySize(width, height)
    bg.setDepth(1)

    // Flower Player character positioned right after the "ALL LEVELS CLEAR" writing (enlarged)
    const charSize = Math.round(Math.min(width, height) * 0.50) // ~360px on 720p
    const flowerX = width / 2
    const flowerY = Math.round(height * 0.51)

    // Soft warm sun aura behind flower_player
    const aura = this.add.circle(flowerX, flowerY, Math.round(charSize * 0.38), 0xfffae0, 0.25)
      .setDepth(2)

    const flowerPlayer = this.add.image(flowerX, flowerY, 'flower_player')
      .setOrigin(0.5)
      .setDisplaySize(charSize, charSize)
      .setDepth(3)

    // Gentle pulsing animation - enough to notice
    const baseScaleX = flowerPlayer.scaleX
    const baseScaleY = flowerPlayer.scaleY

    this.tweens.add({
      targets: flowerPlayer,
      scaleX: baseScaleX * 1.08,
      scaleY: baseScaleY * 1.08,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    this.tweens.add({
      targets: aura,
      scaleX: 1.14,
      scaleY: 1.14,
      alpha: 0.12,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Return to main menu button (using menu.png scaled smaller)
    const btnWidth = Math.round(width * 0.098) // ~125px on 1280 (scaled down as requested)
    const btnHeight = Math.round(btnWidth * (768 / 1365))
    const btnX = width / 2
    const btnY = Math.round(height * 0.84) // Balanced position over the lower meadow

    const menuBtn = this.add.image(btnX, btnY, 'menu_btn')
      .setOrigin(0.5)
      .setDisplaySize(btnWidth, btnHeight)
      .setDepth(5)
      .setInteractive({ useHandCursor: true })

    // Noticeable pulsing animation for the menu button
    const baseMenuScaleX = menuBtn.scaleX
    const baseMenuScaleY = menuBtn.scaleY

    this.tweens.add({
      targets: menuBtn,
      scaleX: baseMenuScaleX * 1.08,
      scaleY: baseMenuScaleY * 1.08,
      duration: 750,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    menuBtn.on('pointerover', () => {
      menuBtn.setTint(0xfffae0)
      this.input.setDefaultCursor('pointer')
    })

    menuBtn.on('pointerout', () => {
      menuBtn.clearTint()
      this.input.setDefaultCursor('default')
    })

    let hasNavigated = false
    const returnToMenu = () => {
      if (hasNavigated) return
      hasNavigated = true
      if (this.sound && this.sound.play) {
        this.sound.play('select_sound', { volume: 0.85 })
      }
      try {
        const lastMusic = this.sound.get('last_scene_music')
        if (lastMusic && lastMusic.isPlaying) {
          lastMusic.stop()
        }
      } catch (e) {}
      this.input.setDefaultCursor('default')
      this.cameras.main.fadeOut(500, 0, 0, 0)
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene', {
          playerName: this.playerName,
          chosenBird: this.chosenBird,
          score: this.score
        })
      })
    }

    menuBtn.on('pointerdown', returnToMenu)

    if (this.input.keyboard) {
      this.input.keyboard.once('keydown-ENTER', returnToMenu)
      this.input.keyboard.once('keydown-SPACE', returnToMenu)
      this.input.keyboard.once('keydown-ESC', returnToMenu)
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      try {
        const lastMusic = this.sound.get('last_scene_music')
        if (lastMusic && lastMusic.isPlaying) {
          lastMusic.stop()
        }
      } catch (e) {}
    })
  }
}

