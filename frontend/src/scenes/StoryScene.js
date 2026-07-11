import Phaser from 'phaser'

export class StoryScene extends Phaser.Scene {
  constructor() { super('StoryScene') }

  preload() {
    this.load.image('story_bg_1', 'resource/story/story_bg_1.png')
    this.load.image('story_bg_2', 'resource/story/story_bg_2.png')
    this.load.image('story_bg_3', 'resource/story/story_bg_3.png')
    this.load.image('story_bg_4', 'resource/story/story_bg_4.png')
  }

  init(data) {
    this.playerName = data.playerName
    this.chosenBird = data.chosenBird
  }

  create() {
    const { width, height } = this.scale
    this.currentPanel = 0

    this.panels = [
      {
        bg: 0x0a1a0a,
        image: 'story_bg_1',
        title: 'A forest full of life...',
        text: 'The forest was alive with rare birds and ancient trees.\nYoung saplings grew across the forest floor —\neach one a new life in a fragile ecosystem.\n15 billion trees are lost every year. This is their story.',
        drawScene: (g) => {
          // Sky — warm sunrise
          g.fillStyle(0xFF8C42, 1)
          g.fillRect(0, 0, width, height * 0.6)
          g.fillStyle(0xFFD700, 1)
          g.fillCircle(width * 0.75, height * 0.15, 50)
          g.fillStyle(0xFFFF88, 0.4)
          g.fillCircle(width * 0.75, height * 0.15, 70)
          // Ground
          g.fillStyle(0x2d5a1b, 1)
          g.fillRect(0, height * 0.58, width, height * 0.42)
          this.drawTrees(g, width, height)
          // Saplings on ground — small green sprouts
          const saplingColors = [0x44ff44, 0xff4500, 0xFFD700, 0x00BFFF]
          saplingColors.forEach((c, i) => {
            const sx = width * 0.18 + i * 80
            const sy = height * 0.63
            g.fillStyle(0x5C3A1E, 1)
            g.fillRect(sx - 2, sy, 4, 12)
            g.fillStyle(c, 1)
            g.fillTriangle(sx, sy - 18, sx - 10, sy + 2, sx + 10, sy + 2)
            g.fillStyle(c, 0.5)
            g.fillTriangle(sx, sy - 28, sx - 7, sy - 10, sx + 7, sy - 10)
          })
          // Happy guardian bird
          g.fillStyle(0xFF4500, 1)
          g.fillCircle(width * 0.72, height * 0.58, 22)
          g.fillStyle(0xffffff, 1)
          g.fillCircle(width * 0.78, height * 0.56, 7)
          g.fillStyle(0x000000, 1)
          g.fillCircle(width * 0.79, height * 0.56, 3)
          g.fillStyle(0xFFAA00, 1)
          g.fillTriangle(width*0.8, height*0.58, width*0.86, height*0.58, width*0.8, height*0.61)
        }
      },
      {
        bg: 0x0a0a1a,
        image: 'story_bg_2',
        title: 'Then the machines came...',
        text: 'Deforestation machines entered the forest.\nThey uprooted saplings and destroyed everything in their path.\nEvery second, a forest the size of a football field is lost.\nThe birds had nowhere left to go.',
        drawScene: (g) => {
          // Dark stormy sky
          g.fillStyle(0x050510, 1)
          g.fillRect(0, 0, width, height * 0.6)
          // Lightning
          g.lineStyle(3, 0xFFFFAA, 0.8)
          g.beginPath()
          g.moveTo(width * 0.6, 0)
          g.lineTo(width * 0.55, height * 0.2)
          g.lineTo(width * 0.62, height * 0.25)
          g.lineTo(width * 0.57, height * 0.45)
          g.strokePath()
          // Rain
          g.lineStyle(1, 0x4444ff, 0.3)
          for (let i = 0; i < 30; i++) {
            const rx = Phaser.Math.Between(0, width)
            const ry = Phaser.Math.Between(0, height)
            g.lineBetween(rx, ry, rx + 5, ry + 15)
          }
          g.fillStyle(0x1a3a0a, 1)
          g.fillRect(0, height * 0.58, width, height * 0.42)
          this.drawTrees(g, width, height)
          // Deforestation machines — blocky rectangles with wheels
          for (let i = 0; i < 2; i++) {
            const mx = width * 0.5 + i * 200
            const my = height * 0.62
            // Machine body
            g.fillStyle(0xCC8800, 1)
            g.fillRect(mx - 30, my - 20, 60, 25)
            g.fillStyle(0x886600, 1)
            g.fillRect(mx - 20, my - 32, 35, 16)
            // Wheels
            g.fillStyle(0x333333, 1)
            g.fillCircle(mx - 18, my + 6, 10)
            g.fillCircle(mx + 18, my + 6, 10)
            // Smoke
            g.fillStyle(0x444444, 0.6)
            g.fillCircle(mx, my - 40, 8)
            g.fillCircle(mx + 5, my - 52, 11)
            g.fillCircle(mx - 3, my - 64, 7)
          }
          // Sad bird watching
          g.fillStyle(0xFF4500, 1)
          g.fillCircle(width * 0.15, height * 0.60, 22)
          g.fillStyle(0xffffff, 1)
          g.fillCircle(width * 0.21, height * 0.58, 7)
          g.fillStyle(0x000000, 1)
          g.fillCircle(width * 0.22, height * 0.59, 3)
          // Tear
          g.fillStyle(0x4444ff, 0.8)
          g.fillEllipse(width * 0.23, height * 0.63, 4, 7)
        }
      },
      {
        bg: 0x0a1a0a,
        image: 'story_bg_3',
        title: 'But saplings survived...',
        text: 'The machines were careless — some saplings survived.\nBirds are nature\'s planters. As they move through the forest,\nthey spread seeds that grow into new trees.\n90% of tropical trees depend on birds to survive.',
        drawScene: (g) => {
          // Dawn light
          g.fillStyle(0x1a2a0a, 1)
          g.fillRect(0, 0, width, height)
          g.fillStyle(0xFFD700, 0.06)
          for (let i = 0; i < 5; i++) {
            g.fillTriangle(
              width * 0.5, 0,
              width * 0.3 + i * 60, height,
              width * 0.35 + i * 60, height
            )
          }
          this.drawTrees(g, width, height)
          g.fillStyle(0x2d5a1b, 1)
          g.fillRect(0, height * 0.6, width, height * 0.4)
          // Machine tracks / tire marks
          for (let i = 0; i < 5; i++) {
            g.fillStyle(0x553300, 0.8)
            g.fillRect(width * 0.15 + i * 110, height * 0.67, 40, 8)
            g.fillRect(width * 0.15 + i * 110, height * 0.72, 40, 8)
          }
          // Surviving saplings — glowing green
          const positions = [0.2, 0.38, 0.55, 0.72]
          positions.forEach((xp, i) => {
            const sx = width * xp
            const sy = height * 0.63
            g.fillStyle(0x5C3A1E, 1)
            g.fillRect(sx - 2, sy, 4, 12)
            g.fillStyle(0x44ff44, 1)
            g.fillTriangle(sx, sy - 18, sx - 10, sy + 2, sx + 10, sy + 2)
            g.fillStyle(0x44ff44, 0.3)
            g.fillCircle(sx, sy - 10, 16)
          })
          // Determined bird with seed dropping
          g.fillStyle(0xFF4500, 1)
          g.fillCircle(width * 0.1, height * 0.60, 22)
          g.fillStyle(0xffffff, 1)
          g.fillCircle(width * 0.16, height * 0.58, 7)
          g.fillStyle(0x000000, 1)
          g.fillCircle(width * 0.18, height * 0.58, 3)
          g.fillStyle(0xFFAA00, 1)
          g.fillTriangle(width*0.18, height*0.60, width*0.24, height*0.60, width*0.18, height*0.63)
          // Seed falling from bird
          g.fillStyle(0x44ff44, 0.9)
          g.fillCircle(width * 0.13, height * 0.66, 4)
          g.fillCircle(width * 0.11, height * 0.70, 3)
        }
      },
      {
          bg: 0x1a0a1a,
          image: 'story_bg_4',
          title: 'The mission begins!',
          text: `You are ${this.playerName || 'a guardian bird'} — a critically endangered species.\nRescue the saplings. Fight back the machines.\nReach the replanting zone before time runs out.\nThe forest is counting on you.`,
          drawScene: (g) => {
          // Epic night sky
          g.fillStyle(0x0a0a2a, 1)
          g.fillRect(0, 0, width, height)
          // Stars
          for (let i = 0; i < 40; i++) {
            g.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.3, 1))
            g.fillCircle(
              Phaser.Math.Between(0, width),
              Phaser.Math.Between(0, height * 0.5),
              Phaser.Math.FloatBetween(1, 3)
            )
          }
          // Moon
          g.fillStyle(0xFFFFCC, 1)
          g.fillCircle(width * 0.8, height * 0.15, 40)
          g.fillStyle(0x0a0a2a, 1)
          g.fillCircle(width * 0.83, height * 0.12, 34)
          // Forest silhouette
          g.fillStyle(0x0a1a0a, 1)
          g.fillRect(0, height * 0.55, width, height * 0.45)
          for (let i = 0; i < 12; i++) {
            const tx = i * (width / 11)
            const th = Phaser.Math.Between(80, 150)
            g.fillTriangle(tx, height*0.55, tx-35, height*0.55+th, tx+35, height*0.55+th)
          }
          // Small glowing saplings in foreground
          [0.15, 0.35, 0.62, 0.82].forEach(xp => {
            const sx = width * xp
            g.fillStyle(0x44ff44, 0.8)
            g.fillCircle(sx, height * 0.58, 6)
            g.fillStyle(0x44ff44, 0.2)
            g.fillCircle(sx, height * 0.58, 14)
          })
          // Hero bird — large center
          g.fillStyle(0xFF4500, 1)
          g.fillCircle(width * 0.5, height * 0.43, 36)
          g.fillStyle(0xFFAA00, 0.3)
          g.fillCircle(width * 0.5, height * 0.43, 52)
          g.fillStyle(0xffffff, 1)
          g.fillCircle(width * 0.56, height * 0.40, 11)
          g.fillStyle(0x000000, 1)
          g.fillCircle(width * 0.58, height * 0.40, 5)
          g.fillStyle(0xFFAA00, 1)
          g.fillTriangle(
            width*0.58, height*0.44,
            width*0.66, height*0.44,
            width*0.58, height*0.48
          )
          // Sparkles
          const sparkleColors = [0xFFD700, 0x44ff44, 0xffffff, 0x00BFFF, 0x44ff44]
          sparkleColors.forEach((c, i) => {
            const angle = (i / sparkleColors.length) * Math.PI * 2
            g.fillStyle(c, 0.9)
            g.fillCircle(width*0.5 + Math.cos(angle)*65, height*0.43 + Math.sin(angle)*65, 7)
            g.fillStyle(c, 0.3)
            g.fillCircle(width*0.5 + Math.cos(angle)*85, height*0.43 + Math.sin(angle)*85, 4)
          })
        }
      }
    ]

    this.bgRect = this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0)
    this.sceneImage = this.add.image(width / 2, height / 2, 'story_bg_1')
      .setDisplaySize(width, height)
      .setVisible(false)
    this.sceneGraphic = this.add.graphics()
    this.textBg = this.add.rectangle(0, height * 0.72, width, height * 0.28, 0x000000, 0.75).setOrigin(0)

    this.titleText = this.add.text(width / 2, height * 0.74, '', {
      fontSize: '24px', fontFamily: 'Arial Black',
      color: '#FFD700', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5, 0)

    this.storyText = this.add.text(width / 2, height * 0.81, '', {
      fontSize: '15px', fontFamily: 'Arial',
      color: '#ffffff', align: 'center',
      lineSpacing: 7, stroke: '#000000', strokeThickness: 2,
      wordWrap: { width: width * 0.85 }
    }).setOrigin(0.5, 0)

    this.dots = []
    for (let i = 0; i < this.panels.length; i++) {
      const dot = this.add.circle(
        width / 2 - (this.panels.length - 1) * 14 + i * 28,
        height * 0.975, 5, 0x444444
      )
      this.dots.push(dot)
    }

    this.nextBtn = this.add.text(width - 24, height - 20, 'NEXT  ▶', {
      fontSize: '16px', fontFamily: 'Arial Black',
      color: '#ffffff', backgroundColor: '#1a5c1a',
      padding: { x: 18, y: 10 }
    }).setOrigin(1, 1).setInteractive()

    this.nextBtn.on('pointerover', () => {
      this.nextBtn.setStyle({ backgroundColor: '#2d8a2d' })
      this.input.setDefaultCursor('pointer')
    })
    this.nextBtn.on('pointerout', () => {
      this.nextBtn.setStyle({ backgroundColor: '#1a5c1a' })
      this.input.setDefaultCursor('default')
    })
    this.nextBtn.on('pointerdown', () => this.nextPanel())

    const skipBtn = this.add.text(24, height - 20, 'SKIP  ✕', {
      fontSize: '14px', fontFamily: 'Arial',
      color: '#888888', padding: { x: 10, y: 8 }
    }).setOrigin(0, 1).setInteractive()

    skipBtn.on('pointerover', () => {
      skipBtn.setStyle({ color: '#ffffff' })
      this.input.setDefaultCursor('pointer')
    })
    skipBtn.on('pointerout', () => {
      skipBtn.setStyle({ color: '#888888' })
      this.input.setDefaultCursor('default')
    })
    skipBtn.on('pointerdown', () => this.startGame())

    this.showPanel(0)
  }

  drawTrees(g, width, height) {
    const treePos = [0.05, 0.15, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95]
    treePos.forEach(xp => {
      const tx = width * xp
      g.fillStyle(0x1a4a0a, 1)
      g.fillTriangle(tx, height*0.35, tx-25, height*0.58, tx+25, height*0.58)
      g.fillStyle(0x2d6a1a, 1)
      g.fillTriangle(tx, height*0.25, tx-20, height*0.45, tx+20, height*0.45)
      g.fillStyle(0x4a8a2a, 1)
      g.fillTriangle(tx, height*0.18, tx-14, height*0.35, tx+14, height*0.35)
      g.fillStyle(0x5C3A1E, 1)
      g.fillRect(tx - 5, height*0.56, 10, 20)
    })
  }

  showPanel(index) {
    const panel = this.panels[index]
    this.cameras.main.fadeIn(400)
    this.bgRect.setFillStyle(panel.bg)
    this.sceneGraphic.clear()
    if (panel.image) {
      this.sceneImage.setTexture(panel.image).setVisible(true)
    } else {
      this.sceneImage.setVisible(false)
      panel.drawScene(this.sceneGraphic)
    }
    this.titleText.setText(panel.title)
    this.storyText.setText('')

    let charIndex = 0
    const fullText = panel.text
    if (this.typeTimer) this.typeTimer.remove()
    this.typeTimer = this.time.addEvent({
      delay: 25,
      callback: () => {
        charIndex++
        this.storyText.setText(fullText.substring(0, charIndex))
      },
      repeat: fullText.length - 1
    })

    this.dots.forEach((dot, i) => {
      dot.setFillStyle(i === index ? 0xFFD700 : 0x444444)
      dot.setScale(i === index ? 1.5 : 1)
    })

    const isLast = index === this.panels.length - 1
    this.nextBtn.setText(isLast ? '  START GAME  ▶' : 'NEXT  ▶')
    this.nextBtn.setStyle({
      backgroundColor: isLast ? '#8B1A00' : '#1a5c1a',
      color: '#ffffff'
    })
  }

  nextPanel() {
    if (this.currentPanel < this.panels.length - 1) {
      this.currentPanel++
      this.cameras.main.fadeOut(200)
      this.time.delayedCall(220, () => this.showPanel(this.currentPanel))
    } else {
      this.startGame()
    }
  }

  startGame() {
    if (this.typeTimer) this.typeTimer.remove()
    this.cameras.main.fadeOut(600)
    this.time.delayedCall(650, () => {
      this.scene.start('GameScene', {
        playerName: this.playerName,
        chosenBird: this.chosenBird
      })
    })
  }
}
