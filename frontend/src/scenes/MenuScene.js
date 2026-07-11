import Phaser from 'phaser'

export class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene') }

  preload() {
    // --- Player & Environment Assets ---
    // Player sprites - Ember
    this.load.image('ember_right', 'resource/player/ember_right.png')
    this.load.image('ember_left',  'resource/player/ember_left.png')
    this.load.image('ember_back',  'resource/player/ember_back.png')
    this.load.image('ember_front', 'resource/player/ember_front.png')

    // Player sprites - Frost
    this.load.image('frost_right', 'resource/player/frost_right.png')
    this.load.image('frost_left',  'resource/player/frost_left.png')
    this.load.image('frost_back',  'resource/player/frost_back.png')
    this.load.image('frost_front', 'resource/player/frost_front.png')

    // Player sprites - Volt
    this.load.image('volt_right', 'resource/player/volt_right.png')
    this.load.image('volt_left',  'resource/player/volt_left.png')
    this.load.image('volt_back',  'resource/player/volt_back.png')
    this.load.image('volt_front', 'resource/player/volt_front.png')

    // Player sprites - Shade
    this.load.image('shade_right', 'resource/player/shade_right.png')
    this.load.image('shade_left',  'resource/player/shade_left.png')
    this.load.image('shade_back',  'resource/player/shade_back.png')
    this.load.image('shade_front', 'resource/player/shade_front.png')

    // Player sprites - Gale
    this.load.image('gale_right', 'resource/player/gale_right.png')
    this.load.image('gale_left',  'resource/player/gale_left.png')
    this.load.image('gale_back',  'resource/player/gale_back.png')
    this.load.image('gale_front', 'resource/player/gale_front.png')
    this.load.image('menu_bg',    'resource/tiles/menu_bg.png')
    
    // --- Map Tiles ---
    this.load.image('grass01', 'resource/tiles/grass01.png')
    this.load.image('tree',    'resource/tiles/tree.png')
    this.load.image('stump',  'resource/tiles/stump.png')
    this.load.image('wall',    'resource/tiles/wall.png')
    this.load.image('water',   'resource/tiles/water00.png')
    this.load.image('sand',    'resource/tiles/sand.png')
    this.load.image('earth',   'resource/tiles/earth.png')

    //-----sapling----
    this.load.image('sapling_1', 'resource/saplings/sapling_1.png')
    this.load.image('sapling_2', 'resource/saplings/sapling_2.png')
    this.load.image('sapling_3', 'resource/saplings/sapling_3.png')

    // --- Custom UI Elements ---
    this.load.image('title_board',  'resource/ui/title_board.png')
    this.load.image('choose_bird',  'resource/ui/choose_bird.png')
    this.load.image('card_ember',   'resource/ui/card_ember.png')
    this.load.image('card_frost',   'resource/ui/card_frost.png')
    this.load.image('card_gale',    'resource/ui/card_gale.png')
    this.load.image('card_shade',   'resource/ui/card_shade.png')
    this.load.image('card_volt',    'resource/ui/card_volt.png')
    this.load.image('play_button',  'resource/ui/play_button.png')
    this.load.image('name_label',   'resource/ui/name_label.png')
    this.load.image('wasd_hint',    'resource/ui/w_a_s_d_move_controls.png')
    this.load.image('space_hint',   'resource/ui/space_attack.png')
    this.load.image('portal_hint',  'resource/ui/reach_the_portal_to_escape.png')
  }

  create() {
    const { width, height } = this.scale
    const fitWidth = (image, displayWidth) => {
      image.setDisplaySize(displayWidth, displayWidth * (image.height / image.width))
      return image
    }

    // 1. Background Image
    this.add.image(0, 0, 'menu_bg').setOrigin(0).setDisplaySize(width, height)

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
