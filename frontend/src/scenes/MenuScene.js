import Phaser from 'phaser'

export class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene') }

  preload() {
    // --- Player & Environment Assets ---
    // Player sprites - Ember
    this.load.image('ember_right', 'resource/player/ember_right.png')
    this.load.image('ember_left', 'resource/player/ember_left.png')
    this.load.image('ember_back', 'resource/player/ember_back.png')
    this.load.image('ember_front', 'resource/player/ember_front.png')

    // Player sprites - Frost
    this.load.image('frost_right', 'resource/player/frost_right.png')
    this.load.image('frost_left', 'resource/player/frost_left.png')
    this.load.image('frost_back', 'resource/player/frost_back.png')
    this.load.image('frost_front', 'resource/player/frost_front.png')

    // Player sprites - Volt
    this.load.image('volt_right', 'resource/player/volt_right.png')
    this.load.image('volt_left', 'resource/player/volt_left.png')
    this.load.image('volt_back', 'resource/player/volt_back.png')
    this.load.image('volt_front', 'resource/player/volt_front.png')

    // Player sprites - Shade
    this.load.image('shade_right', 'resource/player/shade_right.png')
    this.load.image('shade_left', 'resource/player/shade_left.png')
    this.load.image('shade_back', 'resource/player/shade_back.png')
    this.load.image('shade_front', 'resource/player/shade_front.png')

    // Player sprites - Gale
    this.load.image('gale_right', 'resource/player/gale_right.png')
    this.load.image('gale_left', 'resource/player/gale_left.png')
    this.load.image('gale_back', 'resource/player/gale_back.png')
    this.load.image('gale_front', 'resource/player/gale_front.png')
    this.load.image('menu_bg', 'resource/tiles/menu_bg.png')

    // --- Map Tiles ---
    this.load.image('grass', 'resource/tiles/grass01.png')
    this.load.image('grass01', 'resource/tiles/grass01.png')
    this.load.image('tree', 'resource/tiles/tree.png')
    this.load.image('stump', 'resource/tiles/stump.png')
    this.load.image('wall', 'resource/tiles/wall.png')
    this.load.image('water', 'resource/tiles/water00.png')
    this.load.image('sand', 'resource/tiles/sand.png')
    this.load.image('earth', 'resource/tiles/earth.png')

    //-----HunterLevel_1-----
    this.load.image('hunter_front', 'resource/Hunter_Level1/hunter_front.png')
    this.load.image('hunter_back', 'resource/Hunter_Level1/hunter_back.png')
    this.load.image('hunter_left', 'resource/Hunter_Level1/hunter_left.png')
    this.load.image('hunter_right', 'resource/Hunter_Level1/hunter_right.png')
    this.load.image('dumy_monster', 'resource/dumy_monster.png')
    this.load.image('play2_btn', 'resource/play2.png')
    this.load.image('fight_play_btn', 'resource/play.png')

    //-----sapling----
    this.load.image('sapling_1', 'resource/saplings/sapling_1.png')
    this.load.image('sapling_2', 'resource/saplings/sapling_2.png')
    this.load.image('sapling_3', 'resource/saplings/sapling_3.png')

    //------FlashCard------
    this.load.image('flashCard_1', 'resource/flashcards/flashcard_1.png')
    this.load.image('flashCard_2', 'resource/flashcards/flashcard_2.png')
    this.load.image('flashCard_3', 'resource/flashcards/flashcard_3.png')

    // ----- Animals -----
    this.load.image('deer_front_1', 'resource/animals/Deer/deer_front_1.png')
    this.load.image('deer_front_2', 'resource/animals/Deer/deer_front_2.png')
    this.load.image('deer_back_1', 'resource/animals/Deer/deer_back_1.png')
    this.load.image('deer_back_2', 'resource/animals/Deer/deer_back_2.png')
    this.load.image('deer_left_1', 'resource/animals/Deer/deer_left_1.png')
    this.load.image('deer_right_1', 'resource/animals/Deer/deer_right_1.png')

    this.load.image('rhino_front_1', 'resource/animals/rhino/rhino_front_1.png')
    this.load.image('rhino_front_2', 'resource/animals/rhino/rhino_front_2.png')
    this.load.image('rhino_back_1', 'resource/animals/rhino/rhino_back_1.png')
    this.load.image('rhino_back_2', 'resource/animals/rhino/rhino_back_2.png')
    this.load.image('rhino_left_1', 'resource/animals/rhino/rhino_left_1.png')
    this.load.image('rhino_left_2', 'resource/animals/rhino/rhino_left_2.png')
    this.load.image('rhino_right_1', 'resource/animals/rhino/rhino_right_1.png')
    this.load.image('rhino_right_2', 'resource/animals/rhino/rhino_right_2.png')

    // --- Custom UI Elements ---
    this.load.image('lightning_strike', 'resource/effects/lightning_strike.png')
    this.load.image('title_board', 'resource/ui/title_board.png')
    this.load.image('choose_bird', 'resource/ui/choose_bird.png')
    this.load.image('card_ember', 'resource/ui/card_ember.png')
    this.load.image('card_frost', 'resource/ui/card_frost.png')
    this.load.image('card_gale', 'resource/ui/card_gale.png')
    this.load.image('card_shade', 'resource/ui/card_shade.png')
    this.load.image('card_volt', 'resource/ui/card_volt.png')
    this.load.image('play_button', 'resource/ui/play_button.png')
    this.load.image('name_label', 'resource/ui/name_label.png')
    this.load.image('wasd_hint', 'resource/ui/w_a_s_d_move_controls.png')
    this.load.image('space_hint', 'resource/ui/space_attack.png')
    this.load.image('portal_hint', 'resource/ui/reach_the_portal_to_escape.png')
    this.load.image('heart', 'resource/heart.png')
    this.load.audio('select_sound', 'resource/audio/select_sound.mp3')
    this.load.audio('menu_bg_music', 'resource/audio/menu_bg_scenes.mp3')
    this.load.audio('showcase_sound', 'resource/audio/showcase.mp3')
  }

  create() {
    const { width, height } = this.scale
    const fitWidth = (image, displayWidth) => {
      image.setDisplaySize(displayWidth, displayWidth * (image.height / image.width))
      return image
    }

    // Play Background Scenes / Menu music if not already playing
    const menuMuted = localStorage.getItem('menuBgmMuted') === 'true'
    try {
      let bgm = this.sound.get('menu_bg_music')
      if (!menuMuted) {
        if (!bgm) {
          bgm = this.sound.add('menu_bg_music', { loop: true, volume: 0.38 })
          bgm.play()
        } else if (!bgm.isPlaying) {
          bgm.play({ loop: true, volume: 0.38 })
        }
      } else {
        // Muted: make sure BGM is stopped
        if (bgm && bgm.isPlaying) bgm.stop()
      }
    } catch (e) {
      console.warn('Menu BGM play notice:', e)
    }

    // ── Mute/Unmute toggle button (top-left) ──────────────────────
    const isMuted = () => localStorage.getItem('menuBgmMuted') === 'true'

    const muteBtn = this.add.text(18, 14, isMuted() ? '🔇' : '🔊', {
      fontSize: '26px',
      backgroundColor: 'rgba(0,0,0,0.45)',
      padding: { x: 8, y: 4 },
      borderRadius: 8
    })
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(9999)
      .setInteractive({ useHandCursor: true })

    muteBtn.on('pointerover', () => {
      muteBtn.setAlpha(0.75)
      this.input.setDefaultCursor('pointer')
    })
    muteBtn.on('pointerout', () => {
      muteBtn.setAlpha(1)
      this.input.setDefaultCursor('default')
    })
    muteBtn.on('pointerdown', () => {
      try { this.sound.play('select_sound', { volume: 0.6 }) } catch (_e) {}
      const nowMuted = !isMuted()
      localStorage.setItem('menuBgmMuted', String(nowMuted))
      muteBtn.setText(nowMuted ? '🔇' : '🔊')

      try {
        const bgm = this.sound.get('menu_bg_music')
        if (nowMuted) {
          if (bgm && bgm.isPlaying) bgm.stop()
        } else {
          if (!bgm) {
            const newBgm = this.sound.add('menu_bg_music', { loop: true, volume: 0.38 })
            newBgm.play()
          } else if (!bgm.isPlaying) {
            bgm.play({ loop: true, volume: 0.38 })
          }
        }
      } catch (_e) {}

      // Pop animation
      this.tweens.add({
        targets: muteBtn,
        scaleX: 1.35,
        scaleY: 1.35,
        duration: 100,
        yoyo: true,
        ease: 'Sine.easeOut'
      })
    })

    // 1. Background Image
    this.add.image(0, 0, 'menu_bg').setOrigin(0).setDisplaySize(width, height)

    // ── Top-Right Trial Showcase Button (play2.png) ───────────
    const trialBtnWidth = 66
    const trialBtnX = width - 68
    const trialBtnY = 46

    const trialBtn = fitWidth(this.add.image(trialBtnX, trialBtnY, 'play2_btn'), trialBtnWidth)
      .setInteractive({ useHandCursor: true })

    const trialText = this.add.text(trialBtnX, trialBtnY + 38, 'BATTLE TRIAL', {
      fontSize: '11px',
      fontFamily: 'Arial Black',
      color: '#ffd700',
      stroke: '#1c0d03',
      strokeThickness: 3
    }).setOrigin(0.5)

    const baseScale = trialBtn.scaleX
    trialBtn.on('pointerover', () => {
      trialBtn.setScale(baseScale * 1.1)
      trialText.setColor('#ffffff')
      this.input.setDefaultCursor('pointer')
    })
    trialBtn.on('pointerout', () => {
      trialBtn.setScale(baseScale)
      trialText.setColor('#ffd700')
      this.input.setDefaultCursor('default')
    })
    trialBtn.on('pointerdown', () => {
      try {
        if (this.sound && this.sound.play) this.sound.play('showcase_sound', { volume: 0.9 })
      } catch (e) {}
      try {
        const bgm = this.sound.get('menu_bg_music')
        if (bgm && bgm.isPlaying) bgm.stop()
      } catch (e) {}
      this.cleanupNameInput()
      this.scene.start('ShowcaseScene', { chosenBird: this.selectedBird || 'Ember' })
    })

    this.tweens.add({
      targets: trialBtn,
      scaleX: baseScale * 1.06,
      scaleY: baseScale * 1.06,
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // 2. Titles 
    fitWidth(this.add.image(width / 2, height * 0.105, 'title_board'), 520)
    fitWidth(this.add.image(width / 2, height * 0.235, 'choose_bird'), 360)

    // 3. Interactive Bird Cards (Perfectly Centered & No Default Selection)
    const birds = ['Ember', 'Frost', 'Volt', 'Shade', 'Gale']
    
    this.selectedBird = null // FIXED: No bird is selected when the game starts!
    this.birdBoxes = []
    
    const cardScale = 0.125
    const spacing = 170
    const totalWidth = spacing * (birds.length - 1)
    const startX = (width / 2) - (totalWidth / 2)
    const baseY = height * 0.44

    birds.forEach((bird, i) => {
      const x = startX + i * spacing
      const cardKey = `card_${bird.toLowerCase()}`
      
      const card = this.add.image(x, baseY, cardKey)
        .setScale(cardScale)
        .setInteractive()

      const updateCardState = () => {
         if (this.selectedBird === null) {
             // NO SELECTION YET: All birds are bright and aligned
             card.clearTint()
             card.setScale(cardScale)
             card.setY(baseY)
         } else if (this.selectedBird === bird) {
             // THIS BIRD IS CHOSEN: Lift it up and keep it bright
             card.clearTint()
             card.setScale(cardScale * 1.05)
             card.setY(baseY - 15)
         } else {
             // A DIFFERENT BIRD IS CHOSEN: Darken this one
             card.setTint(0x555555)
             card.setScale(cardScale)
             card.setY(baseY)
         }
      }

      // Initialize state
      updateCardState()

      card.on('pointerover', () => {
        this.input.setDefaultCursor('pointer')
        if (this.selectedBird === null) {
            // Fun hover bump before a choice is made
            card.setScale(cardScale * 1.03) 
        } else if (this.selectedBird !== bird) {
            // Lighten slightly if hovering over a darkened bird
            card.setTint(0x999999) 
        }
      })
      
      card.on('pointerout', () => {
        this.input.setDefaultCursor('default')
        updateCardState() 
      })
      
      card.on('pointerdown', () => {
        if (this.sound && this.sound.play) this.sound.play('select_sound', { volume: 0.7 })
        this.selectedBird = bird
        this.birdBoxes.forEach(b => b.updateState()) // Update all cards
      })

      card.updateState = updateCardState
      this.birdBoxes.push(card)
    })

    // 4. Name Label
    fitWidth(this.add.image(width / 2, height * 0.64, 'name_label'), 390)

    // 5. HTML Name Input
    const inputGameX = width / 2
    const inputGameY = height * 0.715

    this.nameInput = document.createElement('input')
    this.nameInput.type = 'text'
    this.nameInput.placeholder = 'Enter name...'
    this.nameInput.maxLength = 12
    this.nameInput.style.cssText = `
      position: absolute;
      transform: translate(-50%, -50%);
      background: #fcf6dc; 
      border: 3px solid #a87b32;
      border-radius: 10px;
      box-shadow: 0px 4px 0px rgba(100, 60, 20, 0.9);
      color: #3B1F00;
      font-size: 15px;
      font-weight: bold;
      padding: 7px 14px;
      text-align: center; 
      outline: none;
      width: 190px; 
      font-family: 'Arial Black', Arial, sans-serif;
      z-index: 10;
    `

    this.updateNameInputPosition = () => {
      const canvasBounds = this.game.canvas.getBoundingClientRect()
      const scaleX = canvasBounds.width / width
      const scaleY = canvasBounds.height / height
      this.nameInput.style.left = `${canvasBounds.left + inputGameX * scaleX}px`
      this.nameInput.style.top = `${canvasBounds.top + inputGameY * scaleY}px`
    }

    this.cleanupNameInput = () => {
      window.removeEventListener('resize', this.updateNameInputPosition)
      if (this.nameInput?.parentNode) {
        this.nameInput.parentNode.removeChild(this.nameInput)
      }
      this.nameInput = null
    }
    
    this.nameInput.addEventListener('focus', () => this.input.keyboard.disableGlobalCapture())
    this.nameInput.addEventListener('blur', () => this.input.keyboard.enableGlobalCapture())
    document.body.appendChild(this.nameInput)
    this.updateNameInputPosition()
    window.addEventListener('resize', this.updateNameInputPosition)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanupNameInput)

    // 6. Custom PLAY Button PNG
    const playBtnWidth = 170
    const playBtn = fitWidth(this.add.image(width / 2, height * 0.875, 'play_button'), playBtnWidth)
      .setInteractive()

    playBtn.on('pointerover', () => {
      playBtn.setTint(0xdddddd)
      this.input.setDefaultCursor('pointer')
    })
    playBtn.on('pointerout', () => {
      playBtn.clearTint()
      this.input.setDefaultCursor('default')
    })
    playBtn.on('pointerdown', () => {
      // Check if they actually picked a bird!
      if (!this.selectedBird) {
          alert("Please choose a bird first!");
          return;
      }
        
      if (this.sound && this.sound.play) this.sound.play('select_sound', { volume: 0.85 })
      const name = this.nameInput.value.trim() || 'Adventurer'
      this.cleanupNameInput()
      this.scene.start('StoryScene', { playerName: name, chosenBird: this.selectedBird })
    })

    // Pulsing Animation
    this.tweens.add({
      targets: playBtn,
      displayWidth: playBtnWidth * 1.06,
      displayHeight: playBtn.height * (playBtnWidth / playBtn.width) * 1.06,
      duration: 600, 
      yoyo: true, 
      repeat: -1
    })

    // 7. Visual Controls Hints
    fitWidth(this.add.image(width * 0.25, height * 0.955, 'wasd_hint'), 210)
    fitWidth(this.add.image(width * 0.50, height * 0.955, 'space_hint'), 210)
    fitWidth(this.add.image(width * 0.75, height * 0.955, 'portal_hint'), 210)
  }
}
