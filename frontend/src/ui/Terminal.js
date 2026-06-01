export class Terminal {
  constructor(scene) {
    this.scene = scene
    this.isOpen = false
    this.history = []
    this.historyIndex = -1
    this.commandLog = []

    this.commands = {
      help:    () => this.cmdHelp(),
      scan:    () => this.cmdScan(),
      status:  () => this.cmdStatus(),
      stealth: (args) => this.cmdStealth(args),
      hack:    (args) => this.cmdHack(args),
      weather: (args) => this.cmdWeather(args),
      evolve:  () => this.cmdEvolve(),
      locate:  () => this.cmdLocate(),
      clear:   () => this.cmdClear(),
      heal:    () => this.cmdHeal(),
      fact: () => this.cmdFact(),
    }

    this.build()
  }

  build() {
    const { width, height } = this.scene.scale

    // Dark overlay
    this.overlay = this.scene.add.graphics()
    this.overlay.fillStyle(0x000000, 0.85)
    this.overlay.fillRect(0, height - 280, width, 280)
    this.overlay.setScrollFactor(0).setDepth(100).setVisible(false)

    // Green border top
    this.border = this.scene.add.graphics()
    this.border.lineStyle(2, 0x00ff00, 0.8)
    this.border.lineBetween(0, height - 280, width, height - 280)
    this.border.setScrollFactor(0).setDepth(101).setVisible(false)

    // Terminal title
    this.titleText = this.scene.add.text(12, height - 274, '[ BIRD OS v1.0 — Press ~ to close ]', {
      fontSize: '11px', fontFamily: 'Courier New',
      color: '#00ff00'
    }).setScrollFactor(0).setDepth(102).setVisible(false)

    // Output log (5 lines)
    this.logTexts = []
    for (let i = 0; i < 6; i++) {
      const t = this.scene.add.text(12, height - 252 + i * 26, '', {
        fontSize: '13px', fontFamily: 'Courier New',
        color: '#aaffaa'
      }).setScrollFactor(0).setDepth(102).setVisible(false)
      this.logTexts.push(t)
    }

    // Prompt line
    this.promptLabel = this.scene.add.text(12, height - 40, 'bird@forest:~$', {
      fontSize: '14px', fontFamily: 'Courier New',
      color: '#00ff00'
    }).setScrollFactor(0).setDepth(102).setVisible(false)

    // HTML input
    this.input = document.createElement('input')
    this.input.type = 'text'
    this.input.autocomplete = 'off'
    this.input.spellcheck = false
    this.input.style.cssText = `
      position: fixed;
      bottom: 12px;
      left: 130px;
      width: calc(100vw - 160px);
      background: transparent;
      border: none;
      outline: none;
      color: #00ff00;
      font-size: 14px;
      font-family: 'Courier New', monospace;
      caret-color: #00ff00;
      z-index: 1000;
      display: none;
    `
    document.body.appendChild(this.input)

    // Blinking cursor
    this.cursor = this.scene.add.text(130, height - 40, '█', {
      fontSize: '14px', fontFamily: 'Courier New',
      color: '#00ff00'
    }).setScrollFactor(0).setDepth(102).setVisible(false)
    this.scene.tweens.add({
      targets: this.cursor, alpha: 0,
      duration: 500, yoyo: true, repeat: -1
    })

    // Input listener
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = this.input.value.trim()
        if (cmd) {
          this.history.unshift(cmd)
          this.historyIndex = -1
          this.execute(cmd)
        }
        this.input.value = ''
      }
      if (e.key === 'ArrowUp') {
        this.historyIndex = Math.min(this.historyIndex + 1, this.history.length - 1)
        this.input.value = this.history[this.historyIndex] || ''
        e.preventDefault()
      }
      if (e.key === 'ArrowDown') {
        this.historyIndex = Math.max(this.historyIndex - 1, -1)
        this.input.value = this.history[this.historyIndex] || ''
        e.preventDefault()
      }
    })
  }

  toggle() {
    this.isOpen ? this.close() : this.open()
  }

  open() {
    this.isOpen = true
    this.overlay.setVisible(true)
    this.border.setVisible(true)
    this.titleText.setVisible(true)
    this.logTexts.forEach(t => t.setVisible(true))
    this.promptLabel.setVisible(true)
    this.cursor.setVisible(true)
    this.input.style.display = 'block'
    this.input.focus()
    this.scene.input.keyboard.disableGlobalCapture()
    // Stop bird movement while terminal is open
    this.scene.terminalOpen = true
    this.print('Terminal ready. Type [help] for commands.', '#00ff00')
  }

  close() {
    this.isOpen = false
    this.overlay.setVisible(false)
    this.border.setVisible(false)
    this.titleText.setVisible(false)
    this.logTexts.forEach(t => t.setVisible(false))
    this.promptLabel.setVisible(false)
    this.cursor.setVisible(false)
    this.input.style.display = 'none'
    this.input.value = ''
    this.scene.terminalOpen = false
    this.scene.input.keyboard.enableGlobalCapture()
  }

  print(msg, color = '#aaffaa') {
    this.commandLog.push({ msg, color })
    if (this.commandLog.length > 6) this.commandLog.shift()
    this.commandLog.forEach((entry, i) => {
      if (this.logTexts[i]) {
        this.logTexts[i].setText(entry.msg)
        this.logTexts[i].setStyle({ color: entry.color })
      }
    })
  }

  execute(raw) {
    const parts = raw.toLowerCase().trim().split(' ')
    const cmd   = parts[0]
    const args  = parts.slice(1)

    this.print('$ ' + raw, '#ffffff')

    if (this.commands[cmd]) {
      this.commands[cmd](args)
    } else {
      this.print(`Command not found: "${cmd}". Type [help].`, '#ff4444')
    }
  }

  // ── COMMANDS ──────────────────────────────────────────────────

  cmdHelp() {
    this.print('Commands: help, scan, status, stealth [on/off],', '#FFD700')
    this.print('          hack [id], weather [storm/clear], evolve,', '#FFD700')
    this.print('          locate, heal, clear', '#FFD700')
  }

  cmdScan() {
    const gs = this.scene
    this.print('Scanning world...', '#00BFFF')
    // Flash all eggs on minimap and show floating markers
    gs.eggList.forEach(e => {
      if (e.collected) return
      const marker = gs.add.text(e.x, e.y - 30, '🥚', {
        fontSize: '16px'
      }).setScrollFactor(1)
      gs.tweens.add({
        targets: marker, y: e.y - 50, alpha: 0,
        duration: 2000, onComplete: () => marker.destroy()
      })
    })
    const eggCount = gs.eggList.filter(e => !e.collected).length
    const monCount = gs.monsterList.filter(m => m.alive).length
    this.print(`Found ${eggCount} eggs, ${monCount} monsters remaining.`, '#aaffaa')
  }

  cmdStatus() {
    const gs = this.scene
    this.print(`HP: ${gs.playerHP}/${gs.maxHP}  Score: ${gs.score}  Eggs: ${gs.eggsCollected}`, '#aaffaa')
    this.print(`Evolution: Stage ${gs.evolutionStage}  Weapon: ${gs.currentWeapon}  Time: ${gs.timeLeft}s`, '#aaffaa')
  }

  cmdStealth(args) {
    const gs = this.scene
    const on = args[0] !== 'off'
    gs.stealthMode = on
    if (on) {
      gs.player.setAlpha(0.3)
      this.print('Stealth ON — monsters cannot detect you.', '#BF5FFF')
      // Auto disable after 8 seconds
      gs.time.delayedCall(8000, () => {
        gs.stealthMode = false
        gs.player.setAlpha(1)
        this.print('Stealth expired.', '#888888')
      })
    } else {
      gs.player.setAlpha(1)
      this.print('Stealth OFF.', '#888888')
    }
  }

  cmdHack(args) {
    const gs = this.scene
    const id = parseInt(args[0])
    const alive = gs.monsterList.filter(m => m.alive)

    if (isNaN(id) || id < 1 || id > alive.length) {
      this.print(`Usage: hack [1-${alive.length}]  (${alive.length} monsters alive)`, '#ff4444')
      return
    }

    const m = alive[id - 1]
    this.print(`Hacking monster #${id}...`, '#00BFFF')

    // Monster turns green and starts attacking others
    m.hacked = true
    m.graphic.setAlpha(0.6)
    gs.showFloatingText(m.body.x, m.body.y - 30, '💻 HACKED', '#00ff00')

    gs.time.delayedCall(5000, () => {
      if (m.alive) {
        m.hacked = false
        m.graphic.setAlpha(1)
      }
      this.print(`Monster #${id} hack expired.`, '#888888')
    })

    this.print(`Monster #${id} under your control for 5s.`, '#00ff00')
  }

  cmdWeather(args) {
    const gs = this.scene
    const type = args[0] || 'storm'

    if (type === 'clear') {
      gs.weatherEffect = false
      this.print('Weather cleared.', '#aaffaa')
      return
    }

    gs.weatherEffect = type
    this.print(`Weather changed: ${type.toUpperCase()}`, '#00BFFF')

    if (type === 'storm') {
      // All monsters become aggressive
      gs.monsterList.forEach(m => {
        if (m.alive) m.alwaysChase = true
      })
      this.print('Monsters are now always aggressive!', '#ff4444')
      // Create rain particles
      for (let i = 0; i < 20; i++) {
        const rx = Phaser.Math.Between(0, gs.scale.width)
        const ry = Phaser.Math.Between(0, gs.scale.height)
        const rain = gs.add.graphics()
        rain.lineStyle(1, 0x4444ff, 0.5)
        rain.lineBetween(rx, ry, rx + 3, ry + 12)
        rain.setScrollFactor(0).setDepth(50)
        gs.tweens.add({
          targets: rain, y: gs.scale.height,
          duration: Phaser.Math.Between(600, 1200),
          repeat: -1
        })
        gs.time.delayedCall(10000, () => rain.destroy())
      }
    }
  }

  cmdEvolve() {
    const gs = this.scene
    if (gs.goldenEggs === 0) {
      this.print('Need at least 1 Golden Egg to evolve.', '#ff4444')
      return
    }
    if (gs.evolutionStage >= 3) {
      this.print('Already at max evolution — Stage 3.', '#FFD700')
      return
    }
    this.print('Forcing evolution...', '#FFD700')
    gs.goldenEggs = Math.max(gs.goldenEggs, gs.evolutionStage)
    gs.checkEvolution()
    this.print(`Evolved to Stage ${gs.evolutionStage}!`, '#FFD700')
  }

  cmdLocate() {
    const gs = this.scene
    const px = gs.portalCol * gs.TILE + gs.TILE / 2
    const py = gs.portalRow * gs.TILE + gs.TILE / 2
    // Draw a pulsing arrow pointing toward portal
    const arrow = gs.add.text(gs.player.x, gs.player.y - 50, '🚪 Portal →', {
      fontSize: '14px', fontFamily: 'Arial Black', color: '#AA99FF'
    }).setOrigin(0.5)
    gs.tweens.add({
      targets: arrow, alpha: 0, y: gs.player.y - 90,
      duration: 2000, onComplete: () => arrow.destroy()
    })
    const dist = Math.round(
      Phaser.Math.Distance.Between(gs.player.x, gs.player.y, px, py) / gs.TILE
    )
    this.print(`Portal is ${dist} tiles away. Check minimap.`, '#AA99FF')
  }

  cmdHeal() {
    const gs = this.scene
    if (gs.score < 200) {
      this.print('Need 200 points to heal. (costs 200pts)', '#ff4444')
      return
    }
    if (gs.playerHP >= gs.maxHP) {
      this.print('Already at full health.', '#aaffaa')
      return
    }
    gs.score -= 200
    gs.playerHP = Math.min(gs.playerHP + 1, gs.maxHP)
    gs.player.setTint(0x00ff88)
    gs.time.delayedCall(400, () => {
      gs.player.clearTint()
      if (gs.evolutionStage === 2) gs.player.setTint(0xaaffaa)
      if (gs.evolutionStage === 3) gs.player.setTint(0xFFD700)
    })
    this.print(`Healed +1 heart. Score: ${gs.score}`, '#00ff88')
  }
  cmdFact() {
  const facts = [
    '🌍 15 billion trees are cut down every year globally. (UN Environment Programme)',
    '🐦 1 in 8 bird species worldwide is threatened with extinction. (IUCN 2024)',
    '🌿 The Sundarbans mangrove — shared by Bangladesh and India — is shrinking by 200 sq km per year.',
    '🌳 A single mature tree absorbs approximately 22kg of CO2 per year.',
    '🦅 Over 1,400 bird species face extinction primarily due to habitat destruction.',
    '🌲 Tropical forests are home to over 50% of all species on Earth.',
    '💧 Forests regulate 75% of the world\'s freshwater supply.',
    '🔥 An area of forest the size of a football field is lost every second.',
    '🌱 90% of tropical tree species depend on birds and animals for seed dispersal.',
    '🇧🇩 Bangladesh has lost 40% of its Sundarbans mangrove cover in the last 40 years.',
  ]
  const fact = facts[Math.floor(Math.random() * facts.length)]
  this.print(fact, '#00ff88')
  this.print('Type [fact] again for another. Type [learn] for species info.', '#444444')
}
  cmdClear() {
    this.commandLog = []
    this.logTexts.forEach(t => t.setText(''))
  }

  destroy() {
    document.body.removeChild(this.input)
  }
}