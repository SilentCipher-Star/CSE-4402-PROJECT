import Phaser from 'phaser'

export class StoryScene extends Phaser.Scene {
  constructor() { super('StoryScene') }

  init(data) {
    this.playerName = data.playerName
    this.chosenBird = data.chosenBird
  }

  create() {
    const { width, height } = this.scale
    this.currentPanel = 0

    this.panels = [
      {
        bg: 0x1a0a00,
        title: 'A peaceful morning...',
        text: 'Deep in the forest, the birds lived happily.\nTheir eggs were their most precious treasure —\neach one holding the power of nature itself.',
        drawScene: (g) => {
          g.fillStyle(0xFF8C42, 1)
          g.fillRect(0, 0, width, height * 0.6)
          g.fillStyle(0xFFD700, 1)
          g.fillCircle(width * 0.75, height * 0.15, 50)
          g.fillStyle(0xFFFF88, 0.4)
          g.fillCircle(width * 0.75, height * 0.15, 70)
          g.fillStyle(0x2d5a1b, 1)
          g.fillRect(0, height * 0.58, width, height * 0.42)
          this.drawTrees(g, width, height)
          g.fillStyle(0x8B5E3C, 1)
          g.fillEllipse(width * 0.3, height * 0.68, 120, 40)
          const eggColors = [0xffffff, 0xFF4500, 0xFFD700, 0x00BFFF]
          eggColors.forEach((c, i) => {
            g.fillStyle(c, 1)
            g.fillEllipse(width * 0.22 + i * 22, height * 0.65, 16, 20)
          })
          g.fillStyle(0xFF4500, 1)
          g.fillCircle(width * 0.3, height * 0.58, 22)
          g.fillStyle(0xffffff, 1)
          g.fillCircle(width * 0.36, height * 0.56, 7)
          g.fillStyle(0x000000, 1)
          g.fillCircle(width * 0.37, height * 0.56, 3)
          g.fillStyle(0xFFAA00, 1)
          g.fillTriangle(
            width*0.38, height*0.58,
            width*0.44, height*0.58,
            width*0.38, height*0.61
          )
        }
      },
      {
        bg: 0x0a0a1a,
        title: 'Then darkness came...',
        text: 'One stormy night, shadowy monsters\ncrept through the forest.\nThey stole every last egg and vanished\ninto the depths of the woods.',
        drawScene: (g) => {
          g.fillStyle(0x050510, 1)
          g.fillRect(0, 0, width, height * 0.6)
          g.lineStyle(3, 0xFFFFAA, 0.8)
          g.beginPath()
          g.moveTo(width * 0.6, 0)
          g.lineTo(width * 0.55, height * 0.2)
          g.lineTo(width * 0.62, height * 0.25)
          g.lineTo(width * 0.57, height * 0.45)
          g.strokePath()
          g.lineStyle(1, 0x4444ff, 0.3)
          for (let i = 0; i < 30; i++) {
            const rx = Phaser.Math.Between(0, width)
            const ry = Phaser.Math.Between(0, height)
            g.lineBetween(rx, ry, rx + 5, ry + 15)
          }
          g.fillStyle(0x1a3a0a, 1)
          g.fillRect(0, height * 0.58, width, height * 0.42)
          this.drawTrees(g, width, height)
          g.fillStyle(0x8B5E3C, 1)
          g.fillEllipse(width * 0.3, height * 0.68, 120, 40)
          g.fillStyle(0xFF4500, 1)
          g.fillCircle(width * 0.3, height * 0.58, 22)
          g.fillStyle(0xffffff, 1)
          g.fillCircle(width * 0.36, height * 0.56, 7)
          g.fillStyle(0x000000, 1)
          g.fillCircle(width * 0.37, height * 0.57, 3)
          g.fillStyle(0x4444ff, 0.8)
          g.fillEllipse(width * 0.38, height * 0.61, 4, 7)
          for (let i = 0; i < 3; i++) {
            const mx = width * 0.55 + i * 80
            g.fillStyle(0x440000, 0.8)
            g.fillCircle(mx, height * 0.6, 18)
            g.fillStyle(0xff2222, 1)
            g.fillCircle(mx - 6, height * 0.57, 4)
            g.fillCircle(mx + 6, height * 0.57, 4)
          }
        }
      },
      {
        bg: 0x0a1a0a,
        title: 'They left a trail...',
        text: 'But the monsters were careless.\nAs they fled, they dropped clues —\nbroken shells, strange footprints,\nand a trail of glowing feathers.',
        drawScene: (g) => {
          g.fillStyle(0x1a2a0a, 1)
          g.fillRect(0, 0, width, height)
          g.fillStyle(0xFFD700, 0.05)
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
          for (let i = 0; i < 6; i++) {
            g.fillStyle(0x553300, 0.7)
            g.fillEllipse(
              width * 0.15 + i * 95,
              height * 0.7 + (i % 2) * 15,
              18, 10
            )
          }
          const shellColors = [0xffffff, 0xFF4500, 0xFFD700]
          shellColors.forEach((c, i) => {
            g.fillStyle(c, 0.6)
            g.fillEllipse(width * 0.25 + i * 120, height * 0.65, 14, 8)
          })
          for (let i = 0; i < 4; i++) {
            g.fillStyle(0xFFAA00, 0.7)
            g.fillEllipse(width * 0.2 + i * 130, height * 0.68, 8, 20)
          }
          g.fillStyle(0xFF4500, 1)
          g.fillCircle(width * 0.1, height * 0.62, 22)
          g.fillStyle(0xffffff, 1)
          g.fillCircle(width * 0.16, height * 0.60, 7)
          g.fillStyle(0x000000, 1)
          g.fillCircle(width * 0.18, height * 0.60, 3)
          g.fillStyle(0xFFAA00, 1)
          g.fillTriangle(
            width*0.18, height*0.62,
            width*0.24, height*0.62,
            width*0.18, height*0.65
          )
        }
      },
      {
        bg: 0x1a0a1a,
        title: 'The journey begins!',
        text: `And so ${this.playerName || 'the brave bird'} set out alone\ninto the deep dark forest.\nFind the eggs. Defeat the monsters.\nBring them home.`,
        drawScene: (g) => {
          g.fillStyle(0x0a0a2a, 1)
          g.fillRect(0, 0, width, height)
          for (let i = 0; i < 40; i++) {
            g.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.3, 1))
            g.fillCircle(
              Phaser.Math.Between(0, width),
              Phaser.Math.Between(0, height * 0.5),
              Phaser.Math.FloatBetween(1, 3)
            )
          }
          g.fillStyle(0xFFFFCC, 1)
          g.fillCircle(width * 0.8, height * 0.15, 40)
          g.fillStyle(0x0a0a2a, 1)
          g.fillCircle(width * 0.83, height * 0.12, 34)
          g.fillStyle(0x0a1a0a, 1)
          g.fillRect(0, height * 0.55, width, height * 0.45)
          for (let i = 0; i < 12; i++) {
            const tx = i * (width / 11)
            const th = Phaser.Math.Between(80, 150)
            g.fillTriangle(
              tx, height * 0.55,
              tx - 35, height * 0.55 + th,
              tx + 35, height * 0.55 + th
            )
          }
          // Hero bird
          g.fillStyle(0xFF4500, 1)
          g.fillCircle(width * 0.5, height * 0.45, 36)
          g.fillStyle(0xFFAA00, 0.3)
          g.fillCircle(width * 0.5, height * 0.45, 52)
          g.fillStyle(0xffffff, 1)
          g.fillCircle(width * 0.56, height * 0.42, 11)
          g.fillStyle(0x000000, 1)
          g.fillCircle(width * 0.58, height * 0.42, 5)
          g.fillStyle(0xFFAA00, 1)
          g.fillTriangle(
            width*0.58, height*0.46,
            width*0.66, height*0.46,
            width*0.58, height*0.50
          )
          // Sparkles — circles instead of stars
          const sparkleColors = [0xFFD700, 0xFF4500, 0xffffff, 0x00BFFF, 0x00FF88]
          sparkleColors.forEach((c, i) => {
            const angle = (i / sparkleColors.length) * Math.PI * 2
            g.fillStyle(c, 0.9)
            g.fillCircle(
              width*0.5 + Math.cos(angle)*65,
              height*0.45 + Math.sin(angle)*65,
              7
            )
            // Small dot around each sparkle
            g.fillStyle(c, 0.4)
            g.fillCircle(
              width*0.5 + Math.cos(angle)*85,
              height*0.45 + Math.sin(angle)*85,
              4
            )
          })
        }
      }
    ]

    // Background
    this.bgRect = this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0)

    // Scene graphics
    this.sceneGraphic = this.add.graphics()

    // Text area background
    this.textBg = this.add.rectangle(
      0, height * 0.72,
      width, height * 0.28,
      0x000000, 0.75
    ).setOrigin(0)

    // Title
    this.titleText = this.add.text(width / 2, height * 0.74, '', {
      fontSize: '24px',
      fontFamily: 'Arial Black',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5, 0)

    // Story text
    this.storyText = this.add.text(width / 2, height * 0.81, '', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 8,
      stroke: '#000000',
      strokeThickness: 2,
      wordWrap: { width: width * 0.85 }
    }).setOrigin(0.5, 0)

    // Progress dots
    this.dots = []
    for (let i = 0; i < this.panels.length; i++) {
      const dot = this.add.circle(
        width / 2 - (this.panels.length - 1) * 14 + i * 28,
        height * 0.975,
        5, 0x444444
      )
      this.dots.push(dot)
    }

    // Next button
    this.nextBtn = this.add.text(width - 24, height - 20, 'NEXT  ▶', {
      fontSize: '16px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      backgroundColor: '#1a5c1a',
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

    // Skip button
    const skipBtn = this.add.text(24, height - 20, 'SKIP  ✕', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#888888',
      padding: { x: 10, y: 8 }
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

    // Show first panel
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
    panel.drawScene(this.sceneGraphic)
    this.titleText.setText(panel.title)
    this.storyText.setText('')

    // Typewriter effect
    let charIndex = 0
    const fullText = panel.text
    if (this.typeTimer) this.typeTimer.remove()
    this.typeTimer = this.time.addEvent({
      delay: 28,
      callback: () => {
        charIndex++
        this.storyText.setText(fullText.substring(0, charIndex))
      },
      repeat: fullText.length - 1
    })

    // Update dots
    this.dots.forEach((dot, i) => {
      dot.setFillStyle(i === index ? 0xFFD700 : 0x444444)
      dot.setScale(i === index ? 1.5 : 1)
    })

    // Update button
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
        chosenBird:  this.chosenBird
      })
    })
  }
}