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
  }

  create() {
    const { width, height } = this.scale

    // Sky
    this.add.rectangle(0, 0, width, height, 0x87CEEB).setOrigin(0)

    // Clouds
    const cloudPositions = [
      {x:100,y:60},{x:300,y:40},{x:550,y:70},
      {x:800,y:45},{x:1050,y:65},{x:1200,y:50}
    ]
    cloudPositions.forEach(c => {
      this.add.ellipse(c.x, c.y, 100, 35, 0xffffff, 0.9)
      this.add.ellipse(c.x + 25, c.y - 12, 75, 32, 0xffffff, 0.9)
      this.add.ellipse(c.x - 25, c.y - 6, 60, 26, 0xffffff, 0.9)
    })

    // Ground
    this.add.rectangle(0, height - 100, width, 100, 0x5a8a2a).setOrigin(0)
    this.add.rectangle(0, height - 75,  width, 25,  0x4a7a1a).setOrigin(0)
    this.add.rectangle(0, height - 50,  width, 50,  0x8B5E3C).setOrigin(0)

    // Trees on ground
    const treeX = [60, 120, 180, 400, 460,
                   820, 880, 940, 1100, 1160, 1220]
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
      fontSize: '42px',
      fontFamily: 'Arial Black',
      color: '#3B1F00',
      stroke: '#8B6914',
      strokeThickness: 3
    }).setOrigin(0.5)

    // Choose bird label
    this.add.text(width/2, 175, 'Choose your bird', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#1a3a00'
    }).setOrigin(0.5)

    // Bird cards
    const birds = [
      { name:'Ember', desc:'Fire burst'     },
      { name:'Frost', desc:'Freeze enemies' },
      { name:'Volt',  desc:'Lightning'      },
      { name:'Shade', desc:'Shadow dash'    },
      { name:'Gale',  desc:'Wind force'     },
    ]

    this.selectedBird = 'Ember'
    this.birdBoxes = []

    const totalW   = birds.length * 170
    const startX   = width/2 - totalW/2 + 85

    birds.forEach((bird, i) => {
      const x = startX + i * 170
      const y = 270

      const box = this.add.rectangle(x, y, 150, 70, 0xC8A25A)
        .setStrokeStyle(3, 0x8B6914)
        .setInteractive()

      this.add.text(x, y - 10, bird.name, {
        fontSize: '18px', fontFamily: 'Arial Black', color: '#3B1F00'
      }).setOrigin(0.5)

      this.add.text(x, y + 16, bird.desc, {
        fontSize: '12px', fontFamily: 'Arial', color: '#5a3a10'
      }).setOrigin(0.5)

      box.on('pointerover', () => {
        if (this.selectedBird !== bird.name) box.setFillStyle(0xB89040)
        this.input.setDefaultCursor('pointer')
      })
      box.on('pointerout', () => {
        if (this.selectedBird !== bird.name) box.setFillStyle(0xC8A25A)
        this.input.setDefaultCursor('default')
      })
      box.on('pointerdown', () => {
        this.selectedBird = bird.name
        this.birdBoxes.forEach(b => b.setFillStyle(0xC8A25A))
        box.setFillStyle(0x8B6014)
      })

      this.birdBoxes.push(box)
      if (i === 0) box.setFillStyle(0x8B6014)
    })

    // Name label
    this.add.text(width/2, 360, 'Your Name', {
      fontSize: '14px', fontFamily: 'Arial', color: '#1a3a00'
    }).setOrigin(0.5)

    // HTML name input
    this.nameInput = document.createElement('input')
    this.nameInput.type = 'text'
    this.nameInput.placeholder = 'Enter name...'
    this.nameInput.maxLength = 12
    this.nameInput.style.cssText = `
      position: absolute;
      left: 50%; top: 54%;
      transform: translateX(-50%);
      background: #fffbe6;
      border: 2px solid #8B6914;
      border-radius: 4px;
      color: #3B1F00;
      font-size: 16px;
      padding: 8px 18px;
      text-align: center;
      outline: none;
      width: 200px;
      font-family: Arial;
      z-index: 10;
    `
    document.body.appendChild(this.nameInput)

    // PLAY button
    const playBtn = this.add.rectangle(width/2, 500, 260, 70, 0xC8A25A)
      .setStrokeStyle(4, 0x8B6914)
      .setInteractive()

    const playText = this.add.text(width/2, 500, 'PLAY', {
      fontSize: '30px', fontFamily: 'Arial Black',
      color: '#3B1F00', stroke: '#8B6914', strokeThickness: 2
    }).setOrigin(0.5)

    playBtn.on('pointerover', () => {
      playBtn.setFillStyle(0x8B6014)
      playText.setStyle({ color: '#fffbe6' })
      this.input.setDefaultCursor('pointer')
    })
    playBtn.on('pointerout', () => {
      playBtn.setFillStyle(0xC8A25A)
      playText.setStyle({ color: '#3B1F00' })
      this.input.setDefaultCursor('default')
    })
    playBtn.on('pointerdown', () => {
      const name = this.nameInput.value.trim() || 'Adventurer'
      document.body.removeChild(this.nameInput)
      this.scene.start('GameScene', {
        playerName: name,
        chosenBird: this.selectedBird
      })
    })

    // Pulse play button
    this.tweens.add({
      targets: [playBtn, playText],
      scaleX: 1.03, scaleY: 1.03,
      duration: 900, yoyo: true, repeat: -1
    })

    // Controls hint
    this.add.text(width/2, 570,
      'WASD = Move   SPACE = Attack   Reach the portal to escape!', {
      fontSize: '12px', fontFamily: 'Arial', color: '#2a5a0a'
    }).setOrigin(0.5)
  }
}