import Phaser from 'phaser'

export class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene') }

  preload() {
    this.load.image('bird_right', 'resource/player/Angry_bird_right.png')
    this.load.image('bird_left',  'resource/player/Angry_bird_left.png')
    this.load.image('bird_back',  'resource/player/Angry_bird_back.png')
    this.load.image('grass',  'resource/tiles/grass01.png')
    this.load.image('tree',   'resource/tiles/tree.png')
    this.load.image('wall',   'resource/tiles/wall.png')
    this.load.image('water',  'resource/tiles/water00.png')
    this.load.image('sand',   'resource/tiles/sand.png')
    this.load.image('earth',  'resource/tiles/earth.png')
    //background
    this.load.image('menu_bg', 'resource/tiles/menu_bg.png')

    // UI Cards
    this.load.image('card_ember', '/resource/ui/card_ember.png')
    this.load.image('card_frost', '/resource/ui/card_frost.png')
    this.load.image('card_volt',  '/resource/ui/card_volt.png')
    this.load.image('card_shade', '/resource/ui/card_shade.png')
    this.load.image('card_gale',  '/resource/ui/card_gale.png')

    //UI elements
    this.load.image('title_board', '/resource/ui/title_board.png')
    this.load.image('choose_bird_text', '/resource/ui/choose_bird.png')
    this.load.image('play_button', '/resource/ui/play_button.png')
    this.load.image('name_label', '/resource/ui/name_label.png')
    this.load.image('wasd_controls', '/resource/ui/w_a_s_d_move_controls.png')
    this.load.image('space_attack', '/resource/ui/space_attack.png')
    this.load.image('reach_portal', '/resource/ui/reach_the_portal_to_escape.png')
  }

  create() {
    const { width, height } = this.scale

    // 1. Background Image
    this.add.image(0, 0, 'menu_bg').setOrigin(0).setDisplaySize(width, height)

    // 2. Title Plank
   this.add.image(width/2, 90, 'title_board').setScale(0.45)

    // 3. Choose bird label
    this.add.image(width/2, 180, 'choose_bird_text').setScale(0.25)

<<<<<<< HEAD
    // Trees
    const treeX = [60, 120, 180, 400, 460, 820, 880, 940, 1100, 1160, 1220]
    treeX.forEach(x => {
      this.add.rectangle(x, height - 75, 12, 35, 0x5C3A1E).setOrigin(0.5, 1)
      this.add.triangle(x, height - 108, -28,0, 28,0, 0,-36, 0x2d8a2d)
      this.add.triangle(x, height - 132, -22,0, 22,0, 0,-28, 0x3aaa3a)
      this.add.triangle(x, height - 152, -15,0, 15,0, 0,-22, 0x4acc4a)
    })

    // Title plank
    this.add.rectangle(width/2, 100, 500, 80, 0xC8A25A)
      .setStrokeStyle(5, 0x8B6914)
    this.add.text(width/2, 100, 'BIRD ADVENTURE', {
      fontSize: '42px', fontFamily: 'Arial Black',
      color: '#3B1F00', stroke: '#8B6914', strokeThickness: 3
    }).setOrigin(0.5)

    this.add.text(width/2, 175, 'Choose your bird', {
      fontSize: '16px', fontFamily: 'Arial', color: '#1a3a00'
    }).setOrigin(0.5)

    // Bird cards
    const birds = [
  { name:'Scarlet Macaw',    desc:'Vulnerable — Fire burst'              },
  { name:'Snowy Owl',        desc:'Vulnerable — Freeze enemies'          },
  { name:'Philippine Eagle', desc:'Critical — Lightning strike'          },
  { name:'Forest Owlet',     desc:'Endangered — Shadow dash'             },
  { name:'Bristlefront',     desc:'Critical — Wind force'                },
]
=======
    // 4. Bird Cards Setup
    const birds = [
      { name: 'Ember', key: 'card_ember' },
      { name: 'Frost', key: 'card_frost' },
      { name: 'Volt',  key: 'card_volt' },
      { name: 'Shade', key: 'card_shade' },
      { name: 'Gale',  key: 'card_gale' },
    ]
>>>>>>> 6fe7974 (Updated main menu UI, added custom play button and controls)

    this.selectedBird = null;
    this.birdCards = [] // Fixed array name

<<<<<<< HEAD
    const totalW = birds.length * 170
    const startX = width/2 - totalW/2 + 85
=======
    // Layout Math
    const baseScale = 0.14;       
    const selectedScale = 0.17;   
    const cardSpacing = 180;      
    const totalW = (birds.length - 1) * cardSpacing
    const startX = width / 2 - totalW / 2
    
    // Shifted down to 320 for breathing room
    const yPos = 320;
>>>>>>> 6fe7974 (Updated main menu UI, added custom play button and controls)

    // 5. Draw the Cards
    birds.forEach((bird, i) => {
      const x = startX + i * cardSpacing

      const card = this.add.image(x, yPos, bird.key)
        .setScale(baseScale)
        .setInteractive()
      
      // INITIAL SETUP: Every card starts fully bright and normal size!
      card.setAlpha(1.0)
      card.setTint(0xffffff)
      card.birdName = bird.name

      // --- HOVER EFFECTS ---
      card.on('pointerover', () => {
        this.input.setDefaultCursor('pointer')
        if (this.selectedBird !== bird.name) {
            card.setScale(baseScale + 0.015)
        }
      })

      card.on('pointerout', () => {
        this.input.setDefaultCursor('default')
        if (this.selectedBird !== bird.name) {
            card.setScale(baseScale)
        }
      })

      // --- CLICK EFFECTS ---
      card.on('pointerdown', () => {
        this.selectedBird = bird.name
        
        // Update size AND brightness for every card based on what was clicked
        this.birdCards.forEach(c => {
            if (c.birdName === bird.name) {
                // The chosen bird gets big and stays bright
                c.setScale(selectedScale)
                c.setAlpha(1.0)
                c.setTint(0xffffff)
            } else {
                // The unchosen birds shrink to normal and get dimmed
                c.setScale(baseScale)
                c.setAlpha(0.6)
                c.setTint(0x888888)
            }
        })
      })

      // Push to array so we can update them all later
      this.birdCards.push(card)

      
    }) // <-- PROPERLY CLOSED THE LOOP HERE!

    // 6. Name Label
    this.add.image(width/2, 490, 'name_label').setScale(0.18)

    // 7. Name Input Box (The Visual Background)
    // 7. HTML Name Input (Pure CSS - Beautiful & Game-Ready!)
    this.nameInput = document.createElement('input')
    this.nameInput.type = 'text'
    this.nameInput.placeholder = 'Enter name...' 
    this.nameInput.maxLength = 12
    
    // Upgraded CSS for a chunky, stylized game UI look
    this.nameInput.style.cssText = `
      position: absolute;
      left: 50%; 
      top: 76%; 
      transform: translate(-50%, -50%); 
      background: #FFF8E7; /* Soft cream/parchment color */
      border: 4px solid #8B6914; /* Thick golden-brown border */
      border-radius: 12px; /* Smooth rounded corners */
      box-shadow: 0px 6px 0px rgba(0, 0, 0, 0.4); /* Chunky 3D drop shadow */
      color: #3B1F00; /* Dark brown text */
      font-size: 24px; /* Much bigger font! */
      font-weight: 900;
      text-align: center;
      outline: none;
      width: 260px; /* Wider box */
      height: 50px; /* Taller box */
      font-family: 'Arial Black', Impact, sans-serif;
      z-index: 10;
      transition: all 0.1s ease-in-out; /* Smooth animation for clicking */
    `
    
    // Add interactive "Press Down" effects AND fix the keyboard conflict!
    this.nameInput.addEventListener('focus', () => {
        this.nameInput.style.borderColor = '#C8A25A'; 
        this.nameInput.style.transform = 'translate(-50%, -46%)'; 
        this.nameInput.style.boxShadow = '0px 2px 0px rgba(0, 0, 0, 0.4)'; 
        this.input.keyboard.disableGlobalCapture(); // Teammate's fix
    });
    
    this.nameInput.addEventListener('blur', () => {
        this.nameInput.style.borderColor = '#8B6914'; 
        this.nameInput.style.transform = 'translate(-50%, -50%)'; 
        this.nameInput.style.boxShadow = '0px 6px 0px rgba(0, 0, 0, 0.4)';
        this.input.keyboard.enableGlobalCapture(); // Teammate's fix
    });

    document.body.appendChild(this.nameInput)

    // 8. PLAY Button (Your Custom UI)
    const playBaseScale = 0.15; 
    
    const playBtn = this.add.image(width/2, 605, 'play_button')
      .setScale(playBaseScale)
      .setInteractive()

    // --- HOVER EFFECTS ---
    playBtn.on('pointerover', () => {
      this.input.setDefaultCursor('pointer')
      playBtn.setTint(0xdddddd) // Slightly darkens the button when hovered
    })
    
    playBtn.on('pointerout', () => {
      this.input.setDefaultCursor('default')
      playBtn.clearTint() // Removes the dark hover tint
    })
    
    // --- CLICK EFFECT ---
    playBtn.on('pointerdown', () => {
      if (!this.selectedBird) {
        alert("Please choose a bird first!");
        return;
      }

      const name = this.nameInput.value.trim() || 'Adventurer'
      document.body.removeChild(this.nameInput)
      this.scene.start('StoryScene', {
        playerName: name,
        chosenBird: this.selectedBird
      })
    })

<<<<<<< HEAD
    // Pulse
=======
    // --- PULSE ANIMATION ---
>>>>>>> 6fe7974 (Updated main menu UI, added custom play button and controls)
    this.tweens.add({
      targets: playBtn,
      scaleX: playBaseScale + 0.01, // Gently expands larger than its base scale
      scaleY: playBaseScale + 0.01,
      duration: 900, 
      yoyo: true, 
      repeat: -1
    })

<<<<<<< HEAD
    // Controls hint
    this.add.text(width/2, 570,
      'WASD = Move   SPACE = Attack   ~ = Terminal   Rescue saplings   Reach the replanting zone!', {
      fontSize: '12px', fontFamily: 'Arial', color: '#2a5a0a'
    }).setOrigin(0.5)
=======
    // 9. Controls hint
    const controlsScale = 0.13; // Applies the exact same size to all three images
    const controlsY = 695;      // Keeps them all perfectly aligned on the same horizontal line
    
    // 1. WASD (Shifted to the left)
    this.add.image(width/2 - 250, controlsY, 'wasd_controls').setScale(controlsScale)

    // 2. SPACE = Attack (Perfectly centered under the Play button)
    this.add.image(width/2, controlsY, 'space_attack').setScale(controlsScale)

    // 3. Reach Portal (Shifted to the right)
    this.add.image(width/2 + 250, controlsY, 'reach_portal').setScale(controlsScale)
>>>>>>> 6fe7974 (Updated main menu UI, added custom play button and controls)
  }
}
