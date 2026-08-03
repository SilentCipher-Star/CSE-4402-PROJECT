import Phaser from 'phaser'

export class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene') }

  preload() {
    this.load.image('ember_right',  'resource/player/ember_right.png')
    this.load.image('ember_left',   'resource/player/ember_left.png')
    this.load.image('ember_back',   'resource/player/ember_back.png')
    this.load.image('ember_front',  'resource/player/ember_front.png')
    this.load.image('frost_right',  'resource/player/frost_right.png')
    this.load.image('frost_left',   'resource/player/frost_left.png')
    this.load.image('frost_back',   'resource/player/frost_back.png')
    this.load.image('frost_front',  'resource/player/frost_front.png')
    this.load.image('volt_right',   'resource/player/volt_right.png')
    this.load.image('volt_left',    'resource/player/volt_left.png')
    this.load.image('volt_back',    'resource/player/volt_back.png')
    this.load.image('volt_front',   'resource/player/volt_front.png')
    this.load.image('shade_right',  'resource/player/shade_right.png')
    this.load.image('shade_left',   'resource/player/shade_left.png')
    this.load.image('shade_back',   'resource/player/shade_back.png')
    this.load.image('shade_front',  'resource/player/shade_front.png')
    this.load.image('gale_right',   'resource/player/gale_right.png')
    this.load.image('gale_left',    'resource/player/gale_left.png')
    this.load.image('gale_back',    'resource/player/gale_back.png')
    this.load.image('gale_front',   'resource/player/gale_front.png')
    this.load.image('grass',        'resource/tiles/grass01.png')
    this.load.image('tree',         'resource/tiles/tree.png')
    this.load.image('wall',         'resource/tiles/wall.png')
    this.load.image('water',        'resource/tiles/water00.png')
    this.load.image('sand',         'resource/tiles/sand.png')
    this.load.image('earth',        'resource/tiles/earth.png')
    this.load.image('menu_bg',      'resource/tiles/menu_bg.png')
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

    this.speciesData = {
      Ember: {
        realName:    'Scarlet Macaw',
        scientific:  'Ara macao',
        status:      'Vulnerable',
        statusColor: '#FF8C00',
        fact:        'Can live up to 75 years in the wild'
      },
      Frost: {
        realName:    'Snowy Owl',
        scientific:  'Bubo scandiacus',
        status:      'Vulnerable',
        statusColor: '#00BFFF',
        fact:        'Habitat shrinking due to Arctic climate change'
      },
      Volt: {
        realName:    'Philippine Eagle',
        scientific:  'Pithecophaga jefferyi',
        status:      'Critically Endangered',
        statusColor: '#ff4444',
        fact:        'Only ~800 individuals remain on Earth'
      },
      Shade: {
        realName:    'Forest Owlet',
        scientific:  'Heteroglaux blewitti',
        status:      'Endangered',
        statusColor: '#FF8C00',
        fact:        'Thought extinct for 113 years until 1997'
      },
      Gale: {
        realName:    'Bristlefront',
        scientific:  'Merulaxis stresemanni',
        status:      'Critically Endangered',
        statusColor: '#ff4444',
        fact:        'Possibly fewer than 15 individuals exist'
      },
    }

    // ── Background ───────────────────────────────────────────
    this.add.image(0, 0, 'menu_bg')
      .setOrigin(0)
      .setDisplaySize(width, height)

    // ── Title ────────────────────────────────────────────────
    this.add.image(width / 2, height * 0.10, 'title_board').setScale(0.36)

    // ── Choose your bird — clear gap below title ─────────────
    this.add.image(width / 2, height * 0.23, 'choose_bird').setScale(0.22)

    // ── Bird cards ───────────────────────────────────────────
    const birds     = ['Ember', 'Frost', 'Volt', 'Shade', 'Gale']
    const cardScale = 0.10
    const spacing   = 175
    const startX    = width / 2 - spacing * 2
    const baseY     = height * 0.43

    this.selectedBird = null
    this.birdBoxes    = []

    birds.forEach((bird, i) => {
      const x       = startX + i * spacing
      const cardKey = `card_${bird.toLowerCase()}`

      const card = this.add.image(x, baseY, cardKey)
        .setScale(cardScale)
        .setInteractive()

      const nameLabel = this.add.text(x, baseY + 62, this.speciesData[bird].realName, {
        fontSize: '9px', fontFamily: 'Arial Black',
        color: '#FFD700', stroke: '#000000', strokeThickness: 3
      }).setOrigin(0.5)

      const statusLabel = this.add.text(x, baseY + 73, this.speciesData[bird].status, {
        fontSize: '8px', fontFamily: 'Arial',
        color: this.speciesData[bird].statusColor,
        stroke: '#000000', strokeThickness: 2
      }).setOrigin(0.5)

      const updateCardState = () => {
        if (this.selectedBird === null) {
          card.clearTint()
          card.setScale(cardScale)
          card.setY(baseY)
          nameLabel.setY(baseY + 62)
          statusLabel.setY(baseY + 73)
        } else if (this.selectedBird === bird) {
          card.clearTint()
          card.setScale(cardScale * 1.08)
          card.setY(baseY - 8)
          nameLabel.setY(baseY + 54)
          statusLabel.setY(baseY + 65)
        } else {
          card.setTint(0x555555)
          card.setScale(cardScale)
          card.setY(baseY)
          nameLabel.setY(baseY + 62)
          statusLabel.setY(baseY + 73)
        }
      }

      updateCardState()

      card.on('pointerover', () => {
        this.input.setDefaultCursor('pointer')
        if (this.selectedBird === null) card.setScale(cardScale * 1.04)
        else if (this.selectedBird !== bird) card.setTint(0x999999)
      })
      card.on('pointerout', () => {
        this.input.setDefaultCursor('default')
        updateCardState()
      })
      card.on('pointerdown', () => {
        this.selectedBird = bird
        this.birdBoxes.forEach(b => b.updateState())
        this.updateInfoPanel(bird)
      })

      card.updateState = updateCardState
      this.birdBoxes.push(card)
    })

    // ── Species info panel ───────────────────────────────────
    this.infoPanelBg    = this.add.graphics()
    this.infoNameText   = this.add.text(width / 2, height * 0.622, '', {
      fontSize: '12px', fontFamily: 'Arial Black',
      color: '#FFD700', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5)
    this.infoSciText    = this.add.text(width / 2, height * 0.644, '', {
      fontSize: '9px', fontFamily: 'Arial',
      color: '#aaaaaa', stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5)
    this.infoStatusText = this.add.text(width / 2, height * 0.662, '', {
      fontSize: '10px', fontFamily: 'Arial Black',
      color: '#ff4444', stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5)
    this.infoFactText   = this.add.text(width / 2, height * 0.680, '', {
      fontSize: '9px', fontFamily: 'Arial',
      color: '#cccccc', stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5)

    this.updateInfoPanel = (bird) => {
      if (!bird) {
        this.infoPanelBg.clear()
        this.infoNameText.setText('')
        this.infoSciText.setText('')
        this.infoStatusText.setText('')
        this.infoFactText.setText('')
        return
      }
      const d = this.speciesData[bird]
      this.infoPanelBg.clear()
      this.infoPanelBg.fillStyle(0x000000, 0.70)
      this.infoPanelBg.fillRoundedRect(width/2 - 250, height * 0.610, 500, 82, 8)
      this.infoPanelBg.lineStyle(1, 0x446644, 1)
      this.infoPanelBg.strokeRoundedRect(width/2 - 250, height * 0.610, 500, 82, 8)
      this.infoNameText.setText('🐦 ' + d.realName)
      this.infoSciText.setText(d.scientific)
      this.infoStatusText.setText('⚠ ' + d.status).setStyle({ color: d.statusColor })
      this.infoFactText.setText('📌 ' + d.fact)
    }

    // ── Your Name label ──────────────────────────────────────
    this.add.image(width / 2, height * 0.740, 'name_label').setScale(0.24)

    // ── HTML name input ──────────────────────────────────────
    this.nameInput = document.createElement('input')
    this.nameInput.type        = 'text'
    this.nameInput.placeholder = 'Enter name...'
    this.nameInput.maxLength   = 12
    this.nameInput.style.cssText = `
      position: absolute;
      left: 50%;
      top: 80%;
      transform: translate(-50%, -50%);
      background: #fcf6dc;
      border: 4px solid #a87b32;
      border-radius: 12px;
      box-shadow: 0px 5px 0px rgba(100,60,20,0.9);
      color: #3B1F00;
      font-size: 15px;
      font-weight: bold;
      padding: 7px 16px;
      text-align: center;
      outline: none;
      width: 190px;
      font-family: 'Arial Black', Arial, sans-serif;
      z-index: 10;
    `
    this.nameInput.addEventListener('focus', () => {
      this.input.keyboard.disableGlobalCapture()
    })
    this.nameInput.addEventListener('blur', () => {
      this.input.keyboard.enableGlobalCapture()
    })
    document.body.appendChild(this.nameInput)

    // ── PLAY button ──────────────────────────────────────────
    const playBtnScale = 0.095
    const playBtn = this.add.image(width / 2, height * 0.880, 'play_button')
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
      if (!this.selectedBird) {
        alert('Please choose a bird first!')
        return
      }
      const name = this.nameInput.value.trim() || 'Adventurer'
      document.body.removeChild(this.nameInput)
      this.scene.start('StoryScene', {
        playerName: name,
        chosenBird: this.selectedBird
      })
    })

    this.tweens.add({
      targets:  playBtn,
      scaleX:   playBtnScale * 1.1,
      scaleY:   playBtnScale * 1.1,
      duration: 600,
      yoyo:     true,
      repeat:   -1
    })

    // ── Control hints ────────────────────────────────────────
    this.add.image(width * 0.22, height * 0.965, 'wasd_hint').setScale(0.20)
    this.add.image(width * 0.50, height * 0.965, 'space_hint').setScale(0.20)
    this.add.image(width * 0.78, height * 0.965, 'portal_hint').setScale(0.20)
  }
}
