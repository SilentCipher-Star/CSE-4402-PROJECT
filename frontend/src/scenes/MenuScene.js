import Phaser from 'phaser'

export class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene') }

  preload() {
    // --- Player & Environment Assets ---
    this.load.image('bird_right', 'resource/player/Angry_bird_right.png')
    this.load.image('bird_left',  'resource/player/Angry_bird_left.png')
    this.load.image('bird_back',  'resource/player/Angry_bird_back.png')
    this.load.image('menu_bg',    'resource/tiles/menu_bg.png')
    
    // --- Map Tiles ---
    this.load.image('grass01', 'resource/tiles/grass01.png')
    this.load.image('tree',    'resource/tiles/tree.png')
    this.load.image('wall',    'resource/tiles/wall.png')
    this.load.image('water',   'resource/tiles/water00.png')
    this.load.image('sand',    'resource/tiles/sand.png')
    this.load.image('earth',   'resource/tiles/earth.png')

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

    // 1. Background Image
    this.add.image(0, 0, 'menu_bg').setOrigin(0).setDisplaySize(width, height)

    // 2. Titles 
    this.add.image(width / 2, height * 0.12, 'title_board').setScale(0.5)
    this.add.image(width / 2, height * 0.23, 'choose_bird').setScale(0.4)

    // 3. Interactive Bird Cards (Perfectly Centered & No Default Selection)
    const birds = ['Ember', 'Frost', 'Volt', 'Shade', 'Gale']
    
    this.selectedBird = null // FIXED: No bird is selected when the game starts!
    this.birdBoxes = []
    
    const cardScale = 0.14; 
    const spacing = 180; // Perfect spacing for a 1280px wide screen
    const totalWidth = spacing * (birds.length - 1);
    const startX = (width / 2) - (totalWidth / 2);
    const baseY = height * 0.42

    birds.forEach((bird, i) => {
      const x = startX + i * spacing
      const cardKey = `card_${bird.toLowerCase()}`
      
      const card = this.add.image(x, baseY, cardKey)
        .setScale(cardScale)
        .setInteractive()

      const updateCardState = () => {
         if (this.selectedBird === null) {
             // NO SELECTION YET: All birds are bright and aligned
             card.clearTint();
             card.setScale(cardScale);
             card.setY(baseY);
         } else if (this.selectedBird === bird) {
             // THIS BIRD IS CHOSEN: Lift it up and keep it bright
             card.clearTint();
             card.setScale(cardScale * 1.05);
             card.setY(baseY - 15);
         } else {
             // A DIFFERENT BIRD IS CHOSEN: Darken this one
             card.setTint(0x555555); 
             card.setScale(cardScale);
             card.setY(baseY);
         }
      }

      // Initialize state
      updateCardState();

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

      card.updateState = updateCardState;
      this.birdBoxes.push(card)
    })

    // 4. Name Label
    this.add.image(width / 2, height * 0.62, 'name_label').setScale(0.3)

    // 5. HTML Name Input
    this.nameInput = document.createElement('input')
    this.nameInput.type = 'text'
    this.nameInput.placeholder = 'Enter name...'
    this.nameInput.maxLength = 12
    this.nameInput.style.cssText = `
      position: absolute; left: 50%; top: 69%; 
      transform: translate(-50%, -50%);
      background: #fcf6dc; 
      border: 4px solid #a87b32; /* Thicker, softer brown border */
      border-radius: 12px; /* Rounded, pill-like corners */
      box-shadow: 0px 5px 0px rgba(100, 60, 20, 0.9); /* Chunky 3D bottom shadow */
      color: #3B1F00;
      font-size: 18px;
      font-weight: bold;
      padding: 10px 18px;
      text-align: center; 
      outline: none;
      width: 220px; 
      font-family: 'Arial Black', Arial, sans-serif;
      z-index: 10;
    `
    
    this.nameInput.addEventListener('focus', () => this.input.keyboard.disableGlobalCapture())
    this.nameInput.addEventListener('blur', () => this.input.keyboard.enableGlobalCapture())
    document.body.appendChild(this.nameInput)

    // 6. Custom PLAY Button PNG
    const playBtnScale = 0.12; 
    const playBtn = this.add.image(width / 2, height * 0.82, 'play_button')
      .setScale(playBtnScale)
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
      document.body.removeChild(this.nameInput)
      this.scene.start('StoryScene', { playerName: name, chosenBird: this.selectedBird })
    })

    // Pulsing Animation
    this.tweens.add({
      targets: playBtn,
      scaleX: playBtnScale * 1.15, 
      scaleY: playBtnScale * 1.15,
      duration: 600, 
      yoyo: true, 
      repeat: -1
    })

    // 7. Visual Controls Hints
// 7. Visual Controls Hints (Properly scaled to 0.25!)
    this.add.image(width * 0.25, height * 0.94, 'wasd_hint').setScale(0.25)
    this.add.image(width * 0.50, height * 0.94, 'space_hint').setScale(0.25)
    this.add.image(width * 0.75, height * 0.94, 'portal_hint').setScale(0.25)
  }
}