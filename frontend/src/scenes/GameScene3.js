import Phaser from 'phaser'

// ================================================================
// LEVEL 3 — STAGE 1  (rebuild #2)
//
// Two freezes in a row came from exotic Phaser usage I hadn't
// actually run: a physics Container with a circular body, and a
// CanvasTexture built by hand with raw 2D-context compositing.
// Both are valid Phaser features in principle, but neither is
// something this codebase had already proven to work — so when
// either broke, it broke silently and killed the whole scene
// before the player, camera, or controls even existed.
//
// This rebuild does two things differently:
//   1. Everything risky now uses ONLY patterns already proven to
//      work elsewhere in this project — physics.add.sprite() for
//      the player (exactly how GameScene1/2 build their player and
//      hunters), and fillGradientStyle() for the seam blend
//      (already used in both scenes' UI, so it's known-good here).
//      No Containers, no hand-built canvas textures, no bitmap
//      masks.
//   2. create() is wrapped in try/catch. If anything in here DOES
//      throw again, you'll get a visible red error banner in the
//      scene with the actual error message, instead of a silent
//      freeze — so if this still breaks, screenshot the banner
//      instead of the frozen screen and I'll know exactly what
//      broke on the first try.
// ================================================================

export class GameScene3 extends Phaser.Scene {
  constructor() { super('GameScene3') }

  preload() {
    // Player bird sprites for all directions
    const birds = ['ember', 'frost', 'volt', 'shade', 'gale']
    const dirs = ['front', 'back', 'left', 'right']
    birds.forEach(b => {
      dirs.forEach(d => {
        const key = `${b}_${d}`
        if (!this.textures.exists(key)) {
          this.load.image(key, `resource/player/${key}.png`)
        }
      })
    })

    this.load.image('underwater_reef', 'resource/level3/backgrounds/underwater_reef.png')
    this.load.image('underwater_ruins', 'resource/level3/backgrounds/underwater_ruins.png')
    this.load.image('underwater_kelp', 'resource/level3/backgrounds/underwater_kelp.png')
    this.load.image('underwater_cave', 'resource/level3/backgrounds/underwater_cave.png')

    // Zone 1 (reef) environment decor — Pack1, all of it
    const pack1 = [
      'coral_1', 'coral_2', 'coral_cluster',
      'kelp_1', 'kelp_2', 'kelp_cluster',
      'rock_1', 'rock_2', 'rock_cluster',
      'seaweed_1'
    ]
    pack1.forEach(name => this.load.image(name, `resource/level3/Pack1/${name}.png`))

    // Zone 1 (reef) wildlife — Pack3, ONLY these 8 for now
    const pack3Reef = [
      'crab_1', 'dolphin_2', 'fish_1', 'fish_2', 'fish_3',
      'fish_school_1', 'turtle_1', 'whale_1'
    ]
    pack3Reef.forEach(name => this.load.image(name, `resource/level3/Pack3/${name}.png`))

    // Zone 2 (ruins) wildlife
    const pack3Ruins = [
      'fish_4', 'fish_5', 'fish_school_3', 'fish_school_4', 'seahorse_1', 'turtle_2'
    ]
    pack3Ruins.forEach(name => this.load.image(name, `resource/level3/Pack3/${name}.png`))

    // Zone 4 (cave, the darker zone with the exit portal) wildlife & hazards
    const pack3Cave = ['urchin_1', 'stingray_2', 'jellyfish_1', 'jellyfish_2', 'squid_2']
    pack3Cave.forEach(name => this.load.image(name, `resource/level3/Pack3/${name}.png`))

    // Zone 3 (kelp, the remaining zone) wildlife & hazards
    const pack3Kelp = ['blowfish_1', 'eel_1', 'manta_ray_1', 'fish_school_2', 'starfish_1']
    pack3Kelp.forEach(name => this.load.image(name, `resource/level3/Pack3/${name}.png`))

    this.load.audio('select_sound', 'resource/audio/select_sound.mp3')
    this.load.audio('portal_sound', 'resource/audio/portal.mp3')
    this.load.audio('final_portal_sound', 'resource/audio/reaching_final_portal.mp3')
    this.load.audio('game_over_sound', 'resource/audio/game_over.mp3')
    this.load.audio('electrofied_poisoned_sound', 'resource/audio/electrofied_poisoned.mp3')
    this.load.audio('esc_sound', 'resource/audio/esc.mp3')
    this.load.audio('last_scene_music', 'resource/audio/last_scene.mp3')
    this.load.audio('horror_sound', 'resource/audio/horror_sound.mp3')
    this.load.audio('notification_popup', 'resource/audio/notification_popup.mp3')
  }

  init(data) {
    this.playerName = data?.playerName || 'Adventurer'
    this.chosenBird = (data?.chosenBird || 'Ember').toLowerCase()
    this.score = data?.score || 0
    this.facing = 1
    this.setupFailed = false
    this.portalAudio = null
    this.hazardHitAudio = null
    this.finalPortalAudio = null
    this.gameOverAudio = null

    // wildlife journal — same pattern as GameScene2
    this.wildlifeJournal = data?.wildlifeJournal || []

    // 📖 Level 1 Freeze-and-Resume Notification System
    this.speciesCardFrozen = false
    this.cardFreezeTimestamp = 0
    this.activeWildlifeCard = null

    // ⚔️ Hazards, Health & Run Tracking
    this.invulnerableUntil = 0
    this.netsFreed = 0
    this.levelStartTime = Date.now()
    this.reportShown = false
    this.hazardList = []

    // 🫧 Oxygen system — drains over time, refills near air pockets
    this.oxygen = 100
    this.maxOxygen = 100
    this.playerHP = 3
    this.maxHP = 3
    this.lastDrowningTick = 0
    this.nearAirPocket = false
    this.OXYGEN_BASE_DRAIN_PER_SEC = 1.6
    this.OXYGEN_DEPTH_DRAIN_BONUS = 1.4
    this.OXYGEN_REGEN_PER_SEC = 18

    // 🕸️ Net hazard — brushing an uncut net snags you briefly
    this.snareTimer = 0

    // 📡 Bioluminescent Sonar Pulse System
    this.sonarCooldown = 0
    this.SONAR_COOLDOWN_MS = 3400
  }

  create() {
    try {
      this.buildScene()
    } catch (err) {
      // Something broke — show it instead of freezing silently.
      console.error('GameScene3 create() failed:', err)
      this.setupFailed = true
      this.showSetupError(err)
    }
  }

  buildScene() {
    // Light gravity for the hybrid swim feel — sinks slowly on its
    // own, holding "up" fights it to rise.
    this.physics.world.gravity.y = 220
    this.cameras.main.setBackgroundColor('#04263d')

    this.defineZonesAndTunnels()
    this.drawBackgrounds()
    this.drawReefEnvironment()
    this.createBubbles()
    this.createAirPockets()
    this.createOxygenHUD()
    this.createPlatforms()
    this.drawTunnels()
    this.createExitPortal()
    this.createMiniMap()
    this.spawnReefWildlife()
    this.createReefNets()
    this.spawnRuinsWildlife()
    this.createRuinsNets()
    this.spawnKelpWildlife()
    this.createKelpNets()
    this.spawnCaveWildlife()
    this.createCaveNets()
    this.createHazards()
    this.createPlayer()

    this.physics.add.collider(this.player, this.platforms)

    // Camera + physics bounds are locked to ONE zone at a time —
    // the player never sees two zones on screen together, so
    // there's no seam to hide in the first place.
    this.currentZone = 'reef'
    this.applyZoneBounds('reef')
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08)

    this.transitioning = false

    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    })
    this.cursors = this.input.keyboard.createCursorKeys()
    this.collectKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

    this.isPaused = false
    this.pauseMenuElements = null

    this.input.keyboard.addCapture(Phaser.Input.Keyboard.KeyCodes.ESC)
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
    this.escKey.on('down', () => this.togglePauseMenu())
    this.input.keyboard.on('keydown-ESC', () => this.togglePauseMenu())

    this.onEscKeyDown = (e) => {
      if (e.key === 'Escape' || e.code === 'Escape' || e.keyCode === 27) {
        if (!this.reportShown && !this.speciesCardFrozen) {
          e.preventDefault()
          this.togglePauseMenu()
        }
      }
    }
    window.addEventListener('keydown', this.onEscKeyDown)

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.cleanupPauseAndListeners()
      if (this.portalAudio && this.portalAudio.isPlaying) {
        this.portalAudio.stop()
      }
    })
  }

  showSetupError(err) {
    const { width, height } = this.scale
    this.add.rectangle(width / 2, height / 2, width, height, 0x220000, 0.9).setScrollFactor(0).setDepth(999)
    this.add.text(width / 2, height / 2 - 20, '⚠️ Level 3 failed to load', {
      fontSize: '18px', fontFamily: 'Arial Black', color: '#ff6666'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1000)
    this.add.text(width / 2, height / 2 + 20, String(err?.message || err), {
      fontSize: '13px', fontFamily: 'Arial', color: '#ffcccc',
      align: 'center', wordWrap: { width: width - 80 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1000)
  }

  // ================================================================
  // ZONES + TUNNELS
  //
  // Each zone is its own self-contained room — camera and physics
  // bounds get locked to just that zone's rect while you're in it.
  // Tunnels are the only way between zones: touch one, the screen
  // fades to black, you're repositioned into the connected zone,
  // and it fades back in. The player never sees two zones' art in
  // the same frame, so there's no seam to blend in the first place.
  // ================================================================

  defineZonesAndTunnels() {
    const W = 1600
    const H = 900

    this.ZONES = {
      reef:  { x: 0, y: 0, w: W, h: H, bg: 'underwater_reef' },
      ruins: { x: W, y: 0, w: W, h: H, bg: 'underwater_ruins' },
      kelp:  { x: 0, y: H, w: W, h: H, bg: 'underwater_kelp' },
      cave:  { x: W, y: H, w: W, h: H, bg: 'underwater_cave' },
    }

    this.zoneWidth = W
    this.zoneHeight = H
    this.worldW = W * 2
    this.worldH = H * 2

    this.tunnels = [
      // reef <-> ruins (shared vertical edge, x = 1600, mid-east edge)
      { fromZone: 'reef',  trigger: { x: 1570, y: 550, w: 60, h: 180 }, toZone: 'ruins', entry: { x: 1760, y: 550 }, orientation: 'vertical' },
      { fromZone: 'ruins', trigger: { x: 1630, y: 550, w: 60, h: 180 }, toZone: 'reef',  entry: { x: 1440, y: 550 }, orientation: 'vertical' },

      // reef <-> kelp (shared horizontal edge, y = 900, far bottom-right at x = 1420, away from spawn at x = 220)
      { fromZone: 'reef', trigger: { x: 1420, y: 875, w: 180, h: 50 }, toZone: 'kelp', entry: { x: 1420, y: 1060 }, orientation: 'horizontal' },
      { fromZone: 'kelp', trigger: { x: 1420, y: 925, w: 180, h: 50 }, toZone: 'reef', entry: { x: 1420, y: 760 }, orientation: 'horizontal' },

      // ruins <-> cave (shared horizontal edge, y = 900, far bottom-right of ruins at x = 3020)
      { fromZone: 'ruins', trigger: { x: 3020, y: 875, w: 180, h: 50 }, toZone: 'cave',  entry: { x: 3020, y: 1060 }, orientation: 'horizontal' },
      { fromZone: 'cave',  trigger: { x: 3020, y: 925, w: 180, h: 50 }, toZone: 'ruins', entry: { x: 3020, y: 760 }, orientation: 'horizontal' },

      // kelp <-> cave (shared vertical edge, x = 1600, bottom-right of kelp at y = 1520)
      { fromZone: 'kelp', trigger: { x: 1570, y: 1520, w: 60, h: 180 }, toZone: 'cave', entry: { x: 1760, y: 1520 }, orientation: 'vertical' },
      { fromZone: 'cave', trigger: { x: 1630, y: 1520, w: 60, h: 180 }, toZone: 'kelp', entry: { x: 1440, y: 1520 }, orientation: 'vertical' },
    ]
  }

  applyZoneBounds(zoneKey) {
    const z = this.ZONES[zoneKey]
    this.physics.world.setBounds(z.x, z.y, z.w, z.h)
    this.cameras.main.setBounds(z.x, z.y, z.w, z.h)
  }

  drawTunnels() {
    this.tunnels.forEach(t => this.drawTunnelMouth(t.trigger.x, t.trigger.y, t.orientation))
  }

  drawTunnelMouth(x, y, orientation) {
    const w = orientation === 'vertical' ? 70 : 180
    const h = orientation === 'vertical' ? 180 : 70

    const g = this.add.graphics().setDepth(6)
    g.fillStyle(0x02121c, 1)
    g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 26)
    g.fillStyle(0x0a2a3a, 0.6)
    g.fillRoundedRect(x - w / 2 + 8, y - h / 2 + 8, w - 16, h - 16, 20)
    g.lineStyle(4, 0x5aa98e, 0.8)
    g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 26)

    const ring = this.add.circle(x, y, Math.max(w, h) / 2, 0x5aa98e, 0)
      .setStrokeStyle(2, 0x8fe3ff, 0.5).setDepth(6)
    this.tweens.add({
      targets: ring, scaleX: 1.15, scaleY: 1.15, alpha: 0,
      duration: 1400, repeat: -1, ease: 'Sine.easeOut'
    })
  }

  checkTunnels() {
    if (this.transitioning) return
    if (this.time.now < (this.tunnelCooldownUntil || 0)) return
    for (const t of this.tunnels) {
      if (t.fromZone !== this.currentZone) continue
      const trg = t.trigger
      if (
        this.player.x > trg.x - trg.w / 2 && this.player.x < trg.x + trg.w / 2 &&
        this.player.y > trg.y - trg.h / 2 && this.player.y < trg.y + trg.h / 2
      ) {
        this.transitionToZone(t.toZone, t.entry.x, t.entry.y)
        return
      }
    }
  }

  transitionToZone(toZone, ex, ey) {
    if (this.transitioning || this.reportShown) return
    this.transitioning = true
    if (this.player && this.player.body) {
      this.player.body.setVelocity(0, 0)
      this.player.body.enable = false
    }

    if (this.sound) {
      try {
        if (this.portalAudio && this.portalAudio.isPlaying) {
          this.portalAudio.stop()
        }
        this.portalAudio = this.sound.add('portal_sound', { volume: 0.85 })
        this.portalAudio.play()
      } catch (e) {
        if (this.sound.play) {
          this.sound.play('portal_sound', { volume: 0.85 })
        }
      }
    }

    this.cameras.main.stopFollow()
    this.cameras.main.fadeOut(250, 0, 0, 0)

    this.time.delayedCall(260, () => {
      if (this.reportShown) return
      this.currentZone = toZone
      if (this.player && this.player.body) {
        this.player.setPosition(ex, ey)
      }
      this.applyZoneBounds(toZone)
      this.cameras.main.centerOn(ex, ey)
      if (this.player) {
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08)
      }
      this.tunnelCooldownUntil = this.time.now + 1600

      this.cameras.main.fadeIn(250, 0, 0, 0)
      this.time.delayedCall(270, () => {
        if (this.player && this.player.body) {
          this.player.body.enable = true
        }
        this.transitioning = false
      })
    })
  }

  // ================================================================
  // EXIT PORTAL — the deep cave is where Level 3 (Stage 1) ends.
  // Visually distinct from a tunnel mouth on purpose: bright,
  // swirling, unmistakably "the way out" rather than "the way
  // through".
  // ================================================================

  createExitPortal() {
    // Bottom-right sanctum of the cave zone, resting gracefully above the ancient seabed dais
    const x = 1600 + 1400
    const y = 900 + 680

    const g = this.add.graphics().setDepth(6)
    g.fillStyle(0x66ffcc, 0.22); g.fillCircle(0, 0, 60)
    g.fillStyle(0xaaffee, 0.45); g.fillCircle(0, 0, 38)
    g.fillStyle(0xffffff, 0.9); g.fillCircle(0, 0, 14)
    g.lineStyle(3, 0xffffff, 0.6)
    for (let i = 0; i < 3; i++) g.strokeCircle(0, 0, 20 + i * 14)
    g.setPosition(x, y)

    this.tweens.add({ targets: g, angle: 360, duration: 7000, repeat: -1, ease: 'Linear' })
    this.tweens.add({ targets: g, scaleX: 1.08, scaleY: 1.08, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })

    this.add.text(x, y - 90, '✨ Exit Portal', {
      fontSize: '14px', fontFamily: 'Arial Black', color: '#aaffee',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(6)

    this.exitPortal = { x, y, radius: 75 }
  }

  checkExitPortal() {
    if (this.reportShown || this.transitioning || this.currentZone !== 'cave' || !this.exitPortal) return
    const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.exitPortal.x, this.exitPortal.y)
    if (d < this.exitPortal.radius) this.triggerExit()
  }

  // ================================================================
  // MINI MAP — one combined 2x2 overview of all four zones, bottom
  // right, always visible. Since the camera only ever shows one zone
  // at a time, this is what gives the player the "big picture": which
  // room they're in, how the four connect, and roughly where the
  // exit portal sits. A separate map per zone would mean swapping the
  // whole thing out on every tunnel crossing for less information —
  // not worth it while each zone is still just one open room.
  // ================================================================

  createMiniMap() {
    const { width, height } = this.scale
    const panelW = 160
    const panelH = 110
    const margin = 16

    this.miniMapX = width - margin - panelW
    this.miniMapY = height - margin - panelH

    const panel = this.add.graphics().setScrollFactor(0).setDepth(500)
    panel.fillStyle(0x061018, 0.85)
    panel.fillRoundedRect(this.miniMapX, this.miniMapY, panelW, panelH, 10)
    panel.lineStyle(2, 0x5aa98e, 0.9)
    panel.strokeRoundedRect(this.miniMapX, this.miniMapY, panelW, panelH, 10)

    this.add.text(this.miniMapX + panelW / 2, this.miniMapY + 12, 'MAP', {
      fontSize: '10px', fontFamily: 'Arial Black', color: '#8fe3ff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(501)

    const gridX = this.miniMapX + 14
    const gridY = this.miniMapY + 26
    const cellW = 62
    const cellH = 34
    const gap = 6

    this.miniMapCells = {
      reef: { x: gridX, y: gridY, w: cellW, h: cellH },
      ruins: { x: gridX + cellW + gap, y: gridY, w: cellW, h: cellH },
      kelp: { x: gridX, y: gridY + cellH + gap, w: cellW, h: cellH },
      cave: { x: gridX + cellW + gap, y: gridY + cellH + gap, w: cellW, h: cellH },
    }

    // faint connector lines hinting the tunnels between adjacent zones
    const connector = this.add.graphics().setScrollFactor(0).setDepth(501)
    connector.lineStyle(2, 0x5aa98e, 0.5)
    connector.lineBetween(gridX + cellW, gridY + cellH / 2, gridX + cellW + gap, gridY + cellH / 2)
    connector.lineBetween(gridX + cellW, gridY + cellH + gap + cellH / 2, gridX + cellW + gap, gridY + cellH + gap + cellH / 2)
    connector.lineBetween(gridX + cellW / 2, gridY + cellH, gridX + cellW / 2, gridY + cellH + gap)
    connector.lineBetween(gridX + cellW + gap + cellW / 2, gridY + cellH, gridX + cellW + gap + cellW / 2, gridY + cellH + gap)

    this.miniMapCellGfx = {}
    Object.keys(this.miniMapCells).forEach(key => {
      this.miniMapCellGfx[key] = this.add.graphics().setScrollFactor(0).setDepth(501)
    })

    // static portal marker, positioned proportionally inside the cave cell
    if (this.exitPortal) {
      const caveCell = this.miniMapCells.cave
      const z = this.ZONES.cave
      const px = caveCell.x + ((this.exitPortal.x - z.x) / z.w) * caveCell.w
      const py = caveCell.y + ((this.exitPortal.y - z.y) / z.h) * caveCell.h
      this.add.circle(px, py, 3, 0xffffff, 1).setScrollFactor(0).setDepth(503)
    }

    this.playerDot = this.add.circle(0, 0, 3, 0xffdd55, 1).setScrollFactor(0).setDepth(504)
  }

  updateMiniMap() {
    if (!this.miniMapCells || !this.currentZone || !this.player) return

    Object.entries(this.miniMapCells).forEach(([key, c]) => {
      const g = this.miniMapCellGfx[key]
      const isCurrent = key === this.currentZone
      g.clear()
      g.fillStyle(isCurrent ? 0x2f6b5c : 0x142229, 1)
      g.fillRoundedRect(c.x, c.y, c.w, c.h, 4)
      g.lineStyle(isCurrent ? 2 : 1, isCurrent ? 0x8fe3ff : 0x3a5a52, isCurrent ? 1 : 0.6)
      g.strokeRoundedRect(c.x, c.y, c.w, c.h, 4)
    })

    const cell = this.miniMapCells[this.currentZone]
    const zone = this.ZONES[this.currentZone]
    if (cell && zone) {
      const relX = Phaser.Math.Clamp((this.player.x - zone.x) / zone.w, 0, 1)
      const relY = Phaser.Math.Clamp((this.player.y - zone.y) / zone.h, 0, 1)
      this.playerDot.setPosition(cell.x + relX * cell.w, cell.y + relY * cell.h)
    }
  }

  triggerExit() {
    if (this.reportShown) return
    this.reportShown = true
    this.cleanupPauseAndListeners()
    this.transitioning = false
    this.physics.pause()
    if (this.portalAudio && this.portalAudio.isPlaying) {
      this.portalAudio.stop()
    }
    if (this.hazardHitAudio && this.hazardHitAudio.isPlaying) {
      this.hazardHitAudio.stop()
    }
    if (this.player && this.player.body) {
      this.player.body.setVelocity(0, 0)
      this.player.body.enable = false
    }

    if (this.sound) {
      try {
        this.finalPortalAudio = this.sound.add('final_portal_sound', { volume: 0.9 })
        this.finalPortalAudio.play()
      } catch (e) {
        if (this.sound.play) this.sound.play('final_portal_sound', { volume: 0.9 })
      }
    }

    this.playPortalGlam(() => {
      this.showConservationReport(true)
    })
  }

  triggerDefeat() {
    if (this.reportShown) return
    this.reportShown = true
    this.cleanupPauseAndListeners()
    this.transitioning = false

    this.physics.pause()
    if (this.portalAudio && this.portalAudio.isPlaying) {
      this.portalAudio.stop()
    }
    if (this.hazardHitAudio && this.hazardHitAudio.isPlaying) {
      this.hazardHitAudio.stop()
    }
    if (this.player && this.player.body) {
      this.player.body.setVelocity(0, 0)
      this.player.body.enable = false
    }

    if (this.sound) {
      try {
        this.gameOverAudio = this.sound.add('game_over_sound', { volume: 0.9 })
        this.gameOverAudio.play()
      } catch (e) {
        if (this.sound.play) this.sound.play('game_over_sound', { volume: 0.9 })
      }
    }

    if (this.cameras && this.cameras.main) {
      this.cameras.main.stopFollow()
      this.cameras.main.resetFX()
      this.cameras.main.flash(500, 180, 20, 20)
      this.cameras.main.shake(300, 0.02)
    }
    this.showConservationReport(false)
  }

  playPortalGlam(onComplete) {
    const { width, height } = this.scale
    const duration = 6430 // Length of reaching_final_portal.mp3 (6.43s)

    // Full-screen radiant glam overlay
    const glam = this.add.rectangle(width / 2, height / 2, width, height, 0xffffff, 0)
      .setScrollFactor(0)
      .setDepth(999998)

    // Radiant colored aura (celestial abyss cyan bloom)
    const bloom = this.add.graphics()
      .setScrollFactor(0)
      .setDepth(999999)
    bloom.fillStyle(0x00ffcc, 0.3)
    bloom.fillCircle(width / 2, height / 2, Math.max(width, height) * 0.7)

    // Radiant expanding rings
    const rings = []
    for (let i = 0; i < 3; i++) {
      const ring = this.add.circle(width / 2, height / 2, 40 + i * 35, 0xffffff, 0)
        .setStrokeStyle(4, 0x00ffcc, 0.8)
        .setScrollFactor(0)
        .setDepth(1000000)
      rings.push(ring)
      this.tweens.add({
        targets: ring,
        scaleX: 3.5,
        scaleY: 3.5,
        alpha: 0,
        delay: i * 350,
        duration: 1800,
        repeat: -1,
        ease: 'Cubic.easeOut'
      })
    }

    if (this.cameras && this.cameras.main) {
      this.cameras.main.flash(600, 255, 255, 255)
    }

    // Glam brightness tween across the duration of the audio
    this.tweens.add({
      targets: glam,
      fillAlpha: { from: 0.1, to: 0.85 },
      duration: 500,
      onComplete: () => {
        this.tweens.add({
          targets: glam,
          fillAlpha: 0.95,
          duration: 900,
          yoyo: true,
          repeat: 5,
          ease: 'Sine.easeInOut'
        })
      }
    })

    this.time.delayedCall(duration, () => {
      this.tweens.killTweensOf([glam, bloom, ...rings])
      glam.destroy()
      bloom.destroy()
      rings.forEach(r => r.destroy())
      if (onComplete) onComplete()
    })
  }

  showConservationReport(escaped) {
    if (this.reportContainer) return
    this.reportShown = true
    this.physics.pause()
    if (this.player && this.player.body) {
      this.player.body.setVelocity(0, 0)
    }
    this.dismissWildlifeCard()

    const { width, height } = this.scale

    const nets = this.netsFreed || 0
    const totalNets = 4
    const journalCount = this.wildlifeJournal.length
    const totalSpecies = this.totalWildlifeSpecies || 8
    const blueCarbon = Math.round((nets * 75) + (journalCount * 30) + (escaped ? 150 : 30))
    const hearts = Math.max(0, this.playerHP)
    const timeTaken = Math.max(1, Math.round((Date.now() - (this.levelStartTime || Date.now())) / 1000))

    const grade = !escaped ? 'D' :
      (nets >= 4 && journalCount >= 6) ? 'S' :
      (nets >= 3) ? 'A' :
      (nets >= 2) ? 'B' : 'C'

    const gradeColorInt =
      grade === 'S' ? 0xFFD700 :
      grade === 'A' ? 0x00ff88 :
      grade === 'B' ? 0x00d4ff :
      grade === 'C' ? 0xFF8C00 : 0xff3355

    const gradeColor =
      grade === 'S' ? '#FFD700' :
      grade === 'A' ? '#00ff88' :
      grade === 'B' ? '#00d4ff' :
      grade === 'C' ? '#FF8C00' : '#ff3355'

    const marineSpeciesFacts = [
      {
        name: 'Blue Whale (Balaenoptera musculus)',
        fact: 'A single Blue Whale sequesters ~33 tons of carbon over its lifetime; their iron-rich plumes nourish phytoplankton that generate over 50% of Earth’s atmospheric oxygen.'
      },
      {
        name: 'Green Sea Turtle (Chelonia mydas)',
        fact: 'By grazing on ocean seagrass beds, Sea Turtles maintain underwater meadows that store twice as much blue carbon per hectare as terrestrial rainforests.'
      },
      {
        name: 'Giant Manta Ray (Mobula birostris)',
        fact: 'Possessing the highest brain-to-body ratio among fish, Manta Rays transfer essential nutrients between shallow coral reefs and deep pelagic trenches.'
      },
      {
        name: 'Bioluminescent Anglerfish (Melanocetus johnsonii)',
        fact: 'Survives in crushing midnight abyss at over 2,000 meters, using symbiotic glowing bacteria to illuminate and lure prey in complete darkness.'
      },
      {
        name: 'Pelagic Dolphin (Delphinidae)',
        fact: 'Uses complex echolocation acoustic clicks and whistles to herd fish schools, acting as vital apex regulators of open-ocean food webs.'
      }
    ]
    const spotlight = marineSpeciesFacts[Math.floor(Math.random() * marineSpeciesFacts.length)]

    // ── Dark overlay ────────────────────────────────────────────
    const overlay = this.add.graphics().setScrollFactor(0).setDepth(1000)
    overlay.fillStyle(0x000000, 0.94)
    overlay.fillRect(0, 0, width, height)

    // ── Main card — deep ocean cyan-navy ─────────────────────────
    const cardW = 640
    const cardH = Math.min(680, height - 30)
    const cardX = width / 2 - cardW / 2
    const cardY = Math.max(15, (height - cardH) / 2)

    const card = this.add.graphics().setScrollFactor(0).setDepth(1001)
    card.fillStyle(0x081522, 1)
    card.fillRoundedRect(cardX, cardY, cardW, cardH, 20)
    card.lineStyle(2, escaped ? 0x00d4ff : 0x5e1e1e, 1)
    card.strokeRoundedRect(cardX, cardY, cardW, cardH, 20)

    // ── Header banner ────────────────────────────────────────────
    const headerH = 80
    const headerBg = this.add.graphics().setScrollFactor(0).setDepth(1001)
    headerBg.fillStyle(escaped ? 0x073244 : 0x3a0d0d, 1)
    headerBg.fillRoundedRect(cardX, cardY, cardW, headerH, { tl: 20, tr: 20, bl: 0, br: 0 })

    headerBg.fillStyle(escaped ? 0x00ffcc : 0xff3355, 1)
    headerBg.fillRect(cardX, cardY + headerH - 2, cardW, 3)

    this.add.text(cardX + 28, cardY + 16, escaped ? '🌊 OCEAN CONSERVATION REPORT' : '💀 YOU LOST', {
      fontSize: '22px', fontFamily: 'Arial Black',
      color: escaped ? '#00ffcc' : '#ff3355'
    }).setScrollFactor(0).setDepth(1002)

    this.add.text(cardX + 28, cardY + 48, escaped
      ? 'Marine species protected & escaped the abyssal depths'
      : 'Depleted oxygen or succumbed to deep-sea hazards. Try again!', {
      fontSize: '11px', fontFamily: 'Arial',
      color: '#7aaac4'
    }).setScrollFactor(0).setDepth(1002)

    // ── Grade badge ───────────────────────────────────────────────
    const gradeX = cardX + cardW - 66
    const gradeY = cardY + 40
    const gradeGlow = this.add.graphics().setScrollFactor(0).setDepth(1001)
    gradeGlow.fillStyle(gradeColorInt, 0.15)
    gradeGlow.fillCircle(gradeX, gradeY, 34)
    gradeGlow.fillStyle(0x081522, 1)
    gradeGlow.fillCircle(gradeX, gradeY, 28)
    gradeGlow.lineStyle(2.5, gradeColorInt, 1)
    gradeGlow.strokeCircle(gradeX, gradeY, 28)

    this.add.text(gradeX, gradeY, grade, {
      fontSize: '24px', fontFamily: 'Arial Black', color: gradeColor
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1003)

    this.add.text(gradeX, gradeY + 36, 'GRADE', {
      fontSize: '9px', fontFamily: 'Arial Black', color: '#4a6a80'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1002)

    // ── Stat rows ────────────────────────────────────────────────
    const oceanHealth = Math.max(0, Math.min(100, Math.round(
      (nets / totalNets * 40) + (journalCount / totalSpecies * 40) + ((hearts / 3) * 20)
    )))

    const stats = [
      { icon: '🎣', label: 'NETTED ANIMALS FREED', value: `${nets}/${totalNets}`, bar: nets / totalNets, barColor: 0x00ff88, chip: 0x0d3320 },
      { icon: '🐠', label: 'SPECIES JOURNALED', value: `${journalCount}/${totalSpecies}`, bar: journalCount / totalSpecies, barColor: 0x00d4ff, chip: 0x0d2838 },
      { icon: '🌊', label: 'OCEAN HEALTH', value: `${oceanHealth}%`, bar: oceanHealth / 100, barColor: oceanHealth > 60 ? 0x00ff88 : oceanHealth > 30 ? 0xFF8C00 : 0xff3355, chip: 0x0d3330 },
      { icon: '💨', label: 'CO₂ ABSORBED/YR', value: `${blueCarbon} kg`, bar: Math.min(blueCarbon / 450, 1), barColor: 0x00ffcc, chip: 0x0d2838 },
      { icon: '⏱️', label: 'TIME TAKEN', value: `${timeTaken}s`, bar: Math.max(0, 1 - timeTaken / 180), barColor: 0xFFD700, chip: 0x332a0d },
    ]

    const startY = cardY + headerH + 12
    const rowH = 46
    const rowGap = 6

    stats.forEach((st, i) => {
      const ry = startY + i * (rowH + rowGap)

      const rowBg = this.add.graphics().setScrollFactor(0).setDepth(1001)
      rowBg.fillStyle(0x0e1d2c, 1)
      rowBg.fillRoundedRect(cardX + 16, ry, cardW - 32, rowH, 10)

      const chipBg = this.add.graphics().setScrollFactor(0).setDepth(1002)
      chipBg.fillStyle(st.chip, 1)
      chipBg.fillRoundedRect(cardX + 26, ry + 6, 34, 34, 8)
      this.add.text(cardX + 43, ry + 23, st.icon, {
        fontSize: '16px'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(1003)

      this.add.text(cardX + 72, ry + 8, st.label, {
        fontSize: '10px', fontFamily: 'Arial Black', color: '#e0f4ff'
      }).setScrollFactor(0).setDepth(1002)

      this.add.text(cardX + cardW - 30, ry + 7, st.value, {
        fontSize: '14px', fontFamily: 'Arial Black', color: '#ffffff'
      }).setOrigin(1, 0).setScrollFactor(0).setDepth(1002)

      const barX = cardX + 72
      const barY = ry + 28
      const barW = cardW - 118
      const barH = 5

      const barTrack = this.add.graphics().setScrollFactor(0).setDepth(1002)
      barTrack.fillStyle(0x06101a, 1)
      barTrack.fillRoundedRect(barX, barY, barW, barH, 2)

      const fillW = Math.max(6, barW * Math.min(st.bar, 1))
      const barFill = this.add.graphics().setScrollFactor(0).setDepth(1003)
      barFill.fillStyle(st.barColor, 1)
      barFill.fillRoundedRect(barX, barY, fillW, barH, 2)
      barFill.fillStyle(st.barColor, 0.5)
      barFill.fillCircle(barX + fillW, barY + barH / 2, 4)
    })

    // ── Blue Carbon equivalence banner ───────────────────────────
    const eqY = startY + stats.length * (rowH + rowGap) + 4
    const eqBg = this.add.graphics().setScrollFactor(0).setDepth(1001)
    eqBg.fillStyle(0x0a2233, 1)
    eqBg.fillRoundedRect(cardX + 16, eqY, cardW - 32, 32, 8)
    eqBg.lineStyle(1, 0x00aacc, 0.6)
    eqBg.strokeRoundedRect(cardX + 16, eqY, cardW - 32, 32, 8)
    this.add.text(width / 2, eqY + 16,
      `🌱  Equal to protecting ${Math.max(1, Math.round(blueCarbon / 80))} hectares of coastal seagrass & kelp beds`, {
      fontSize: '11px', fontFamily: 'Arial', color: '#8fe3f0'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1002)

    // ── Marine species spotlight ──────────────────────────────────
    const spotY = eqY + 38
    const spotH = 64
    const spotBg = this.add.graphics().setScrollFactor(0).setDepth(1002)
    spotBg.fillStyle(0x0a241b, 1)
    spotBg.fillRoundedRect(cardX + 16, spotY, cardW - 32, spotH, 8)
    spotBg.lineStyle(1.5, 0x00ffcc, 0.6)
    spotBg.strokeRoundedRect(cardX + 16, spotY, cardW - 32, spotH, 8)

    this.add.text(cardX + 26, spotY + 11, `🌊  MARINE SPOTLIGHT — ${spotlight.name.toUpperCase()}`, {
      fontSize: '11px', fontFamily: 'Arial Black', color: '#00ffcc', stroke: '#000000', strokeThickness: 2
    }).setScrollFactor(0).setDepth(1003)

    this.add.text(width / 2, spotY + 38, spotlight.fact, {
      fontSize: '11px', fontFamily: 'Arial', color: '#ffffff', stroke: '#000000', strokeThickness: 2,
      wordWrap: { width: cardW - 56 }, align: 'center', lineSpacing: 2
    }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(1003)

    // ── Buttons ───────────────────────────────────────────────────
    const btnY = cardY + cardH - 52

    const stopAllSounds = () => {
      [this.portalAudio, this.hazardHitAudio, this.finalPortalAudio, this.gameOverAudio].forEach(a => {
        if (a && a.isPlaying) a.stop()
      })
      try {
        const escSnd = this.sound.get('esc_sound')
        if (escSnd && escSnd.isPlaying) escSnd.stop()
      } catch (e) {}
    }

    const doRestart = () => {
      stopAllSounds()
      if (this.sound && this.sound.play) {
        this.sound.play('select_sound', { volume: 0.85 })
      }
      this.input.setDefaultCursor('default')
      this.scene.restart({
        playerName: this.playerName,
        chosenBird: this.chosenBird,
        score: this.score
      })
    }

    const doMenu = () => {
      stopAllSounds()
      if (this.sound && this.sound.play) {
        this.sound.play('select_sound', { volume: 0.85 })
      }
      this.input.setDefaultCursor('default')
      this.scene.start('MenuScene', {
        playerName: this.playerName,
        chosenBird: this.chosenBird,
        score: this.score
      })
    }

    const doLastScene = () => {
      stopAllSounds()
      if (this.sound && this.sound.play) {
        this.sound.play('select_sound', { volume: 0.85 })
      }
      this.input.setDefaultCursor('default')
      this.cameras.main.fadeOut(400, 0, 0, 0)
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('LastScene', {
          playerName: this.playerName,
          chosenBird: this.chosenBird,
          score: this.score
        })
      })
    }

    if (escaped) {
      // Victory: PLAY AGAIN and NEXT (to last page) side-by-side
      const playAgainBtn = this.add.text(width / 2 - 115, btnY, '  PLAY AGAIN (R)  ', {
        fontSize: '14px', fontFamily: 'Arial Black',
        color: '#061622', backgroundColor: '#00e5ff',
        padding: { x: 18, y: 11 }
      }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(1004).setInteractive({ useHandCursor: true })

      const nextBtn = this.add.text(width / 2 + 115, btnY, '  NEXT (ENTER) →  ', {
        fontSize: '14px', fontFamily: 'Arial Black',
        color: '#04141c', backgroundColor: '#00ffcc',
        padding: { x: 18, y: 11 }
      }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(1004).setInteractive({ useHandCursor: true })

      this.tweens.add({
        targets: [playAgainBtn, nextBtn], scaleX: 1.04, scaleY: 1.04,
        duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      })

      playAgainBtn.on('pointerover', () => {
        playAgainBtn.setStyle({ backgroundColor: '#80f2ff' })
        this.input.setDefaultCursor('pointer')
      })
      playAgainBtn.on('pointerout', () => {
        playAgainBtn.setStyle({ backgroundColor: '#00e5ff' })
        this.input.setDefaultCursor('default')
      })
      playAgainBtn.on('pointerdown', doRestart)

      nextBtn.on('pointerover', () => {
        nextBtn.setStyle({ backgroundColor: '#80ffea' })
        this.input.setDefaultCursor('pointer')
      })
      nextBtn.on('pointerout', () => {
        nextBtn.setStyle({ backgroundColor: '#00ffcc' })
        this.input.setDefaultCursor('default')
      })
      nextBtn.on('pointerdown', doLastScene)

      if (this.input && this.input.keyboard) {
        this.input.keyboard.enabled = true
        this.input.keyboard.once('keydown-R', doRestart)
        this.input.keyboard.once('keydown-ENTER', doLastScene)
        this.input.keyboard.once('keydown-SPACE', doLastScene)
        this.input.keyboard.once('keydown-ESC', doMenu)
      }

      this.reportContainer = [overlay, card, headerBg, gradeGlow, playAgainBtn, nextBtn]
    } else {
      // Defeat: YOU LOST screen with PLAY AGAIN and MENU
      const playAgainBtn = this.add.text(width / 2 - 100, btnY, '  PLAY AGAIN (ENTER)  ', {
        fontSize: '14px', fontFamily: 'Arial Black',
        color: '#ffffff', backgroundColor: '#ff3355',
        padding: { x: 18, y: 11 }
      }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(1004).setInteractive({ useHandCursor: true })

      const menuBtn = this.add.text(width / 2 + 100, btnY, '  MENU (ESC)  ', {
        fontSize: '14px', fontFamily: 'Arial Black',
        color: '#ffffff', backgroundColor: '#1d3e56',
        padding: { x: 18, y: 11 }
      }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(1004).setInteractive({ useHandCursor: true })

      this.tweens.add({
        targets: playAgainBtn, scaleX: 1.04, scaleY: 1.04,
        duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      })

      playAgainBtn.on('pointerover', () => {
        playAgainBtn.setStyle({ backgroundColor: '#ff7799' })
        this.input.setDefaultCursor('pointer')
      })
      playAgainBtn.on('pointerout', () => {
        playAgainBtn.setStyle({ backgroundColor: '#ff3355' })
        this.input.setDefaultCursor('default')
      })
      playAgainBtn.on('pointerdown', doRestart)

      menuBtn.on('pointerover', () => {
        menuBtn.setStyle({ backgroundColor: '#2d5e82' })
        this.input.setDefaultCursor('pointer')
      })
      menuBtn.on('pointerout', () => {
        menuBtn.setStyle({ backgroundColor: '#1d3e56' })
        this.input.setDefaultCursor('default')
      })
      menuBtn.on('pointerdown', doMenu)

      if (this.input && this.input.keyboard) {
        this.input.keyboard.enabled = true
        this.input.keyboard.once('keydown-R', doRestart)
        this.input.keyboard.once('keydown-ENTER', doRestart)
        this.input.keyboard.once('keydown-SPACE', doRestart)
        this.input.keyboard.once('keydown-ESC', doMenu)
      }

      this.reportContainer = [overlay, card, headerBg, gradeGlow, playAgainBtn, menuBtn]
    }
  }

  // ================================================================
  // BACKGROUNDS — each zone's image sits at its normal position;
  // the camera simply never scrolls far enough to see two at once.
  // ================================================================

  drawBackgrounds() {
    Object.values(this.ZONES).forEach(z => {
      this.add.image(z.x + z.w / 2, z.y + z.h / 2, z.bg)
        .setDisplaySize(z.w, z.h).setDepth(0)
    })
  }

  // ================================================================
  // ZONE 1 (REEF) — ENVIRONMENT DECOR
  //
  // Hand-placed, not scattered randomly — Pack1 pieces only, kept
  // clear of the platforms, tunnel mouths, and player spawn point.
  // setScale() only (never setDisplaySize with equal w/h) so nothing
  // gets stretched — every asset keeps its own native aspect ratio.
  // ================================================================

  drawReefEnvironment() {
    const objects = [
      // Corals on seabed & shelves (origin 0.5, 1 rests cleanly on top)
      [140, 850, 'coral_1', 0.95],
      [1120, 850, 'coral_cluster', 1.0],
      [1260, 314, 'coral_2', 0.85],     // Resting on eastern shelf top
      [80, 850, 'coral_cluster', 0.9],

      // Kelp anchored to seabed and platforms
      [440, 850, 'kelp_1', 0.95],
      [680, 850, 'kelp_cluster', 1.0],
      [380, 394, 'seaweed_1', 0.85],     // Growing on starting platform top
      [1320, 314, 'kelp_2', 0.8],        // Growing on eastern shelf top

      // Rocks resting on seabed and platforms
      [60, 850, 'rock_1', 0.95],
      [580, 850, 'rock_2', 0.95],
      [880, 850, 'rock_cluster', 0.9],
      [140, 394, 'rock_1', 0.75],        // Resting on starting platform top
      [420, 654, 'rock_2', 0.8],         // Resting on lower canyon shelf top
    ]

    objects.forEach(([x, y, key, scale]) => {
      this.add.image(x, y, key).setScale(scale).setOrigin(0.5, 1).setDepth(12)
    })
  }

  // ================================================================
  // ZONE 1 (REEF) — WILDLIFE
  //
  // Same game logic as GameScene2's wildlife: wanders on its own,
  // shows "Press E" when the player is close, collecting adds it to
  // the journal (once — duplicates guarded), fades once collected,
  // and pops the species card. No physics bodies needed for these —
  // position is tracked manually (w.x/w.y) and applied each frame,
  // exactly like GameScene2 already does successfully.
  // ================================================================

  // Shared spawn helper — used by all four zones so the same wander/
  // collect logic in updateWildlife() works everywhere. `zoneKey` is
  // stored per-entity so wandering stays clamped to the zone it
  // actually lives in (previously hardcoded to reef only).
  spawnWildlifeGroup(zoneKey, scaleByKey, positions) {
    if (!this.wildlifeList) this.wildlifeList = []

    positions.forEach(p => {
      const scale = scaleByKey[p.key] || 0.5
      const sprite = this.add.image(p.x, p.y, p.key)
        .setScale(scale)
        .setDepth(25)

      const standOffset = p.standOffset || 22
      const shadowY = p.isBenthic ? p.y + standOffset : p.y + 24
      const shadow = this.add.ellipse(p.x, shadowY, 36, 12, 0x000000, 0.28).setDepth(24)

      const prompt = this.add.text(p.x, p.y - 44, 'Press E', {
        fontSize: '10px', fontFamily: 'Arial Black',
        color: '#FFD700', stroke: '#000000', strokeThickness: 3
      }).setOrigin(0.5).setDepth(26).setVisible(false)

      this.wildlifeList.push({
        graphic: sprite, shadow, prompt,
        zoneKey,
        x: p.x, y: p.y,
        spawnX: p.x, spawnY: p.y,
        targetX: p.x, targetY: p.y,
        wanderTimer: Phaser.Math.Between(0, 90),
        moving: false,
        species: p.species,
        fact: p.fact,
        collected: this.wildlifeJournal.includes(p.species),
        isBenthic: !!p.isBenthic,
        platformBounds: p.platformBounds || null,
        standOffset
      })

      if (this.wildlifeJournal.includes(p.species)) {
        sprite.setAlpha(0.4)
      }
    })

    if (!this.allWildlifeSpecies) this.allWildlifeSpecies = new Set()
    positions.forEach(p => this.allWildlifeSpecies.add(p.species))
    this.totalWildlifeSpecies = this.allWildlifeSpecies.size
  }

  spawnReefWildlife() {
    const scaleByKey = {
      crab_1: 0.5, dolphin_2: 0.65, fish_1: 0.45, fish_2: 0.45, fish_3: 0.45,
      fish_school_1: 0.55, turtle_1: 0.55, whale_1: 0.75
    }

    const positions = [
      // Reef Crab stands firmly on the starting shelf (top: 394, y: 370, feet touch 394)
      {
        x: 320, y: 370, key: 'crab_1', species: 'Reef Crab',
        fact: 'Sidesteps quickly across the sea floor to escape danger.',
        isBenthic: true, standOffset: 24, platformBounds: { minX: 120, maxX: 380 }
      },
      // Green Sea Turtle rests atop the eastern shelf (top: 314, y: 278, belly touches 314)
      {
        x: 1240, y: 278, key: 'turtle_1', species: 'Green Sea Turtle',
        fact: 'Can hold its breath underwater for several hours while resting.',
        isBenthic: true, standOffset: 36, platformBounds: { minX: 980, maxX: 1260 }
      },
      // Open-water swimming creatures
      { x: 1050, y: 180, key: 'dolphin_2', species: 'Bottlenose Dolphin', fact: 'Uses echolocation clicks to find fish hidden in the coral.' },
      { x: 600, y: 160, key: 'fish_1', species: 'Reef Fish', fact: 'Sticks close to the coral it calls home its whole life.' },
      { x: 920, y: 500, key: 'fish_2', species: 'Blue Tang', fact: 'Can shift the shade of its blue to signal mood to others.' },
      { x: 450, y: 580, key: 'fish_3', species: 'Butterflyfish', fact: 'Mates for life and is almost always seen swimming in pairs.' },
      { x: 1150, y: 560, key: 'fish_school_1', species: 'Sardine School', fact: 'Swims in massive schools to confuse and overwhelm predators.' },
      { x: 1200, y: 150, key: 'whale_1', species: 'Humpback Whale', fact: 'Sings long, complex songs that can travel for miles underwater.' },
    ]

    this.spawnWildlifeGroup('reef', scaleByKey, positions)
  }

  // ================================================================
  // ZONE 2 (RUINS) — WILDLIFE
  // ================================================================

  spawnRuinsWildlife() {
    const scaleByKey = {
      fish_4: 0.45, fish_5: 0.45, fish_school_3: 0.55, fish_school_4: 0.55,
      seahorse_1: 0.4, turtle_2: 0.55
    }

    const W = 1600

    const positions = [
      // Ruins Seahorse anchored on top of Altar Shelf (top: 314, y: 290)
      {
        x: W + 1160, y: 290, key: 'seahorse_1', species: 'Ruins Seahorse',
        fact: 'Anchors itself to coral or stone with its curled tail.',
        isBenthic: true, standOffset: 24, platformBounds: { minX: W + 1020, maxX: W + 1280 }
      },
      // Loggerhead Turtle resting on Sunken Treasury Shelf (top: 516, y: 488)
      {
        x: W + 1440, y: 488, key: 'turtle_2', species: 'Loggerhead Turtle',
        fact: 'Has one of the most powerful bites of any sea turtle.',
        isBenthic: true, standOffset: 28, platformBounds: { minX: W + 1340, maxX: W + 1520 }
      },
      // Open-water swimming creatures
      { x: W + 240, y: 180, key: 'fish_4', species: 'Regal Fish', fact: 'Drifts through half-sunken columns looking for hidden crevices.' },
      { x: W + 1380, y: 200, key: 'fish_5', species: 'Emerald Fish', fact: 'Its shimmering scales help it blend into shafts of light.' },
      { x: W + 480, y: 500, key: 'fish_school_3', species: 'Copper School', fact: 'Moves as one to make it harder for predators to single one out.' },
      { x: W + 800, y: 680, key: 'fish_school_4', species: 'Violet School', fact: 'Prefers the shadows cast by old stone archways.' },
    ]

    this.spawnWildlifeGroup('ruins', scaleByKey, positions)
  }

  // ================================================================
  // ZONE 3 (KELP) — WILDLIFE
  // ================================================================

  spawnKelpWildlife() {
    const scaleByKey = {
      blowfish_1: 0.45, fish_3: 0.45, manta_ray_1: 0.65,
      fish_school_2: 0.55, starfish_1: 0.35, turtle_1: 0.55
    }

    const H = 900

    const positions = [
      // Sea Star resting on Seafloor Root Shelf (top: H + 654, y: H + 634)
      {
        x: 340, y: H + 634, key: 'starfish_1', species: 'Sea Star',
        fact: 'Can regrow an entire lost arm over several months.',
        isBenthic: true, standOffset: 20, platformBounds: { minX: 180, maxX: 480 }
      },
      // Open-water swimming creatures
      { x: 320, y: H + 260, key: 'blowfish_1', species: 'Pufferfish', fact: 'Inflates into a spiky ball when it feels threatened.' },
      { x: 1350, y: H + 550, key: 'fish_3', species: 'Sunburst Damselfish', fact: 'Defends its kelp territory fearlessly from much larger creatures.' },
      { x: 750, y: H + 200, key: 'manta_ray_1', species: 'Manta Ray', fact: 'Glides through open water by flapping wing-like fins.' },
      { x: 1050, y: H + 460, key: 'fish_school_2', species: 'Golden School', fact: 'Weaves between kelp stalks to stay hidden from predators.' },
      { x: 650, y: H + 680, key: 'turtle_1', species: 'Green Sea Turtle', fact: 'Often grazes on the kelp itself as part of its diet.' },
    ]

    this.spawnWildlifeGroup('kelp', scaleByKey, positions)
  }

  // ================================================================
  // ZONE 4 (CAVE) — WILDLIFE
  // ================================================================

  spawnCaveWildlife() {
    const scaleByKey = {
      urchin_1: 0.4, stingray_2: 0.6, fish_4: 0.45, squid_2: 0.5
    }

    const W = 1600
    const H = 900

    const positions = [
      // Sea Urchin resting atop Central Obsidian Bridge (top: H + 454, y: H + 430)
      {
        x: W + 720, y: H + 430, key: 'urchin_1', species: 'Sea Urchin',
        fact: 'Its spines deter almost every predator in the cave.',
        isBenthic: true, standOffset: 24, platformBounds: { minX: W + 600, maxX: W + 840 }
      },
      // Open-water swimming creatures
      { x: W + 400, y: H + 600, key: 'stingray_2', species: 'Stingray', fact: 'Glides just above the cave floor, half-buried in silt.' },
      { x: W + 1050, y: H + 180, key: 'fish_4', species: 'Abyssal Darter', fact: 'Has adapted large reflective pupils to see prey in pitch-black caves.' },
      { x: W + 1420, y: H + 280, key: 'squid_2', species: 'Deep Squid', fact: 'Can shoot a cloud of ink to vanish from danger in an instant.' },
    ]

    this.spawnWildlifeGroup('cave', scaleByKey, positions)
  }

  updateWildlife() {
    if (!this.wildlifeList || !this.player) return

    const margin = 90

    this.wildlifeList.forEach(w => {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, w.x, w.y)
      const canCollect = dist < 60 && !w.collected

      if (w.prompt) {
        w.prompt.setVisible(canCollect)
        w.prompt.setPosition(w.x, w.y - 44)
      }

      if (canCollect && Phaser.Input.Keyboard.JustDown(this.collectKey)) {
        w.collected = true
        if (!this.wildlifeJournal.includes(w.species)) {
          this.wildlifeJournal.push(w.species)
        }
        w.graphic.setAlpha(0.4)
        if (w.prompt) w.prompt.setVisible(false)
        this.showWildlifeCard(w.species, w.fact)
      }

      if (!w.moving) {
        w.wanderTimer = (w.wanderTimer || 0) + 1
        if (w.wanderTimer > 100) {
          w.wanderTimer = 0
          if (w.isBenthic && w.platformBounds) {
            // Benthic creatures stand and walk horizontally on top of their platform!
            w.targetX = Phaser.Math.Clamp(
              w.spawnX + Phaser.Math.Between(-120, 120),
              w.platformBounds.minX, w.platformBounds.maxX
            )
            w.targetY = w.spawnY // Never sink into or float off the platform
            w.moving = true
          } else {
            const zone = this.ZONES[w.zoneKey] || this.ZONES.reef
            w.targetX = Phaser.Math.Clamp(
              w.spawnX + Phaser.Math.Between(-180, 180),
              zone.x + margin, zone.x + zone.w - margin
            )
            w.targetY = Phaser.Math.Clamp(
              w.spawnY + Phaser.Math.Between(-100, 100),
              zone.y + margin, zone.y + zone.h - margin
            )
            w.moving = true
          }
        }
      }

      if (w.moving) {
        const speed = w.isBenthic ? 0.45 : 0.6
        const dx = w.targetX - w.x
        const dy = w.targetY - w.y
        const d = Math.sqrt(dx * dx + dy * dy)

        if (d < speed) {
          w.x = w.targetX
          w.y = w.targetY
          w.moving = false
        } else {
          w.x += (dx / d) * speed
          w.y += (dy / d) * speed
          w.graphic.setFlipX(dx < 0)
        }
      }

      w.graphic.setPosition(w.x, w.y)
      const shadowY = w.isBenthic ? w.y + w.standOffset : w.y + 24
      w.shadow.setPosition(w.x, shadowY)
    })
  }

  showWildlifeCard(species, fact) {
    try { this.sound.play('notification_popup', { volume: 0.75 }) } catch (e) {}
    if (this.activeWildlifeCard) {
      this.activeWildlifeCard.forEach(el => {
        if (el && el.destroy) el.destroy()
      })
      this.activeWildlifeCard = null
    }

    // 🧊 Freeze the screen and player
    this.speciesCardFrozen = true
    this.cardFreezeTimestamp = (this.time && this.time.now) ? this.time.now : Date.now()
    if (this.player && this.player.body) {
      this.player.body.setVelocity(0, 0)
      this.player.body.setAcceleration(0, 0)
    }

    const { width, height } = this.scale

    const card = this.add.graphics().setScrollFactor(0).setDepth(400)
    card.fillStyle(0x0a1420, 0.97)
    card.fillRoundedRect(width / 2 - 190, height / 2 - 100, 380, 200, 16)
    card.lineStyle(3, 0x00ffcc, 1)
    card.strokeRoundedRect(width / 2 - 190, height / 2 - 100, 380, 200, 16)

    const title = this.add.text(width / 2, height / 2 - 70, '🐠 SPECIES JOURNALED!', {
      fontSize: '15px', fontFamily: 'Arial Black', color: '#00ffcc'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(401)

    const name = this.add.text(width / 2, height / 2 - 40, species, {
      fontSize: '19px', fontFamily: 'Arial Black', color: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(401)

    const factText = this.add.text(width / 2, height / 2 + 2, fact, {
      fontSize: '11px', fontFamily: 'Arial', color: '#aaccdd',
      wordWrap: { width: 340 }, align: 'center'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(401)

    const count = this.wildlifeJournal.length
    const total = this.totalWildlifeSpecies || 8
    const counter = this.add.text(width / 2, height / 2 + 46, `Journal: ${count} / ${total} species`, {
      fontSize: '11px', fontFamily: 'Arial Black', color: '#00d4ff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(401)

    const resumeHint = this.add.text(width / 2, height / 2 + 74, '👉 Move in any direction (W,A,S,D / Arrows) to resume', {
      fontSize: '10px', fontFamily: 'Arial Black', color: '#ffdd77'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(401)

    const elements = [card, title, name, factText, counter, resumeHint]
    this.activeWildlifeCard = elements
    elements.forEach(el => el.setAlpha(1))
  }

  dismissWildlifeCard() {
    if (!this.speciesCardFrozen && !this.activeWildlifeCard) return
    this.speciesCardFrozen = false
    if (this.activeWildlifeCard) {
      this.activeWildlifeCard.forEach(el => {
        if (el && el.destroy) el.destroy()
      })
      this.activeWildlifeCard = null
    }
  }

  // ================================================================
  // ZONE 1 (REEF) — FISHING NETS
  //
  // The human threat for Level 3, chosen deliberately over a boat:
  // a boat is pure background dressing (no interaction needed), a
  // net gives an actual conservation moment — discover it, see an
  // animal caught, hold E to cut it free. No net art asset exists
  // yet, so the mesh is drawn procedurally (a simple crossed-line
  // lattice), same spirit as the drawn HP bars/portal in Level 2.
  //
  // Two nets here are purely environmental storytelling (empty,
  // no rescue) — evidence that nets are a problem in this water
  // even when nothing happens to be caught in them right now. One
  // has a turtle actually trapped and rescuable.
  // ================================================================

  // ================================================================
  // FISHING NETS — the human threat for Level 3, chosen deliberately
  // over a boat: a boat is pure background dressing (no interaction
  // needed), a net gives an actual conservation moment — discover
  // it, see an animal caught, hold E to cut it free. No net art
  // asset exists yet, so the mesh is drawn procedurally (a simple
  // crossed-line lattice), same spirit as the drawn HP bars/portal
  // in Level 2.
  //
  // Same shape in every zone: two empty nets (environmental
  // storytelling — nets are a problem here even with nothing
  // caught right now) plus one net with an actual animal to rescue.
  // ================================================================

  // Diamond/cross-hatch rope pattern — the classic net look — instead
  // of a plain horizontal/vertical grid (which just reads as a flat
  // square). Clipped to a soft rounded footprint via a geometry mask
  // so the silhouette looks like a tangled blob, not a rigid box.
  drawNetMesh(x, y, w, h) {
    const g = this.add.graphics().setDepth(14)

    g.fillStyle(0xd8c9a3, 0.05)
    g.fillEllipse(x, y, w * 1.05, h * 1.05)

    g.lineStyle(2, 0xd8c9a3, 0.55)
    const spacing = 20
    const jitter = () => Phaser.Math.Between(-3, 3)

    for (let d = -w; d <= w; d += spacing) {
      g.lineBetween(
        x + d + jitter(), y - h / 2 + jitter(),
        x + d + h + jitter(), y + h / 2 + jitter()
      )
      g.lineBetween(
        x + d + jitter(), y - h / 2 + jitter(),
        x + d - h + jitter(), y + h / 2 + jitter()
      )
    }

    const maskShape = this.make.graphics({ x: 0, y: 0, add: false })
    maskShape.fillStyle(0xffffff)
    maskShape.fillEllipse(x, y, w, h)
    g.setMask(maskShape.createGeometryMask())

    return g
  }

  createReefNets() {
    this.netList = []

    // purely decorative — no animal, no interaction, just tells the
    // player nets are a hazard in this water
    this.drawNetMesh(150, 700, 90, 70)
    this.drawNetMesh(1450, 650, 100, 80)

    // the one net that actually has something caught in it
    const nx = 1050
    const ny = 240

    const netGfx = this.drawNetMesh(nx, ny, 120, 100)

    const animal = this.add.image(nx, ny, 'turtle_1')
      .setScale(0.5)
      .setDepth(15)
      .setAlpha(0.92)
      .setAngle(12)

    const indicator = this.add.text(nx, ny - 62, '⚠️', { fontSize: '18px' })
      .setOrigin(0.5).setDepth(16)

    const prompt = this.add.text(nx, ny - 42, 'Hold E to cut net', {
      fontSize: '10px', fontFamily: 'Arial Black',
      color: '#FFD700', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(16).setVisible(false)

    this.netList.push({
      x: nx, y: ny,
      netGfx, animal, indicator, prompt,
      rescued: false,
      rescueProgress: 0,
      species: 'Trapped Sea Turtle',
      fact: 'Discarded fishing nets are one of the biggest threats sea turtles face worldwide.'
    })
  }

  // Small helper so each zone's "one trapped animal" net doesn't
  // repeat the same six lines of object construction.
  addTrappedNet(x, y, w, h, textureKey, species, fact) {
    const netGfx = this.drawNetMesh(x, y, w, h)

    const animal = this.add.image(x, y, textureKey)
      .setScale(0.5)
      .setDepth(15)
      .setAlpha(0.92)
      .setAngle(12)

    const indicator = this.add.text(x, y - 62, '⚠️', { fontSize: '18px' })
      .setOrigin(0.5).setDepth(16)

    const prompt = this.add.text(x, y - 42, 'Hold E to cut net', {
      fontSize: '10px', fontFamily: 'Arial Black',
      color: '#FFD700', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(16).setVisible(false)

    this.netList.push({
      x, y, netGfx, animal, indicator, prompt,
      rescued: false, rescueProgress: 0,
      species, fact
    })
  }

  createRuinsNets() {
    const W = 1600

    // purely decorative
    this.drawNetMesh(W + 150, 350, 90, 70)
    this.drawNetMesh(W + 1500, 700, 100, 75)

    // seahorses are frequent fishing-net bycatch in real reef/ruins
    // waters — a fitting trapped animal for this zone
    this.addTrappedNet(
      W + 1160, 440, 120, 95, 'seahorse_1',
      'Trapped Seahorse',
      'Seahorses are one of the most common bycatch casualties of ghost fishing nets.'
    )
  }

  createKelpNets() {
    const H = 900

    // purely decorative
    this.drawNetMesh(200, H + 250, 90, 70)
    this.drawNetMesh(1400, H + 700, 100, 80)

    // manta rays are large, well-documented net-entanglement victims
    this.addTrappedNet(
      750, H + 280, 130, 100, 'manta_ray_1',
      'Trapped Manta Ray',
      'A manta ray\u2019s size and wide fins make it especially prone to entanglement in nets.'
    )
  }

  createCaveNets() {
    const W = 1600
    const H = 900

    // purely decorative
    this.drawNetMesh(W + 150, H + 250, 90, 70)
    this.drawNetMesh(W + 1450, H + 700, 100, 75)

    // stingrays glide along the seafloor, exactly where abandoned
    // nets tend to settle and snag on the bottom
    this.addTrappedNet(
      W + 720, H + 360, 120, 95, 'stingray_2',
      'Trapped Stingray',
      'Bottom-dwelling nets can trap stingrays as they glide along the seafloor.'
    )
  }

  updateNets() {
    this.playerNearNet = false
    if (!this.netList || !this.player || !this.collectKey) return

    this.netList.forEach(n => {
      if (n.rescued) return

      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, n.x, n.y)
      const canRescue = dist < 65
      const activelyRescuing = canRescue && this.collectKey.isDown

      // 🕸️ Hazard: brushing directly against an uncut net snags you —
      // unless you're deliberately in the middle of cutting it free.
      // Tighter radius than the rescue prompt (65px) so swimming past
      // at a normal distance never triggers it by accident.
      if (dist < 30 && this.snareTimer <= 0 && !activelyRescuing) {
        this.snareTimer = 1800
        this.cameras.main.shake(150, 0.006)
        this.showFloatingText(this.player.x, this.player.y - 30, '🕸️ Snagged in the net!', '#ffaa66')
      }

      if (n.prompt) n.prompt.setVisible(canRescue)

      if (canRescue) {
        // hold still near the net — gravity would otherwise pull the
        // player straight down while trying to hold E, making the
        // rescue itself the hard part instead of the choice to do it
        this.playerNearNet = true
      }

      if (activelyRescuing) {
        n.rescueProgress = Math.min(1, (n.rescueProgress || 0) + this.game.loop.delta / 1400)
        if (n.rescueProgress >= 1) this.rescueNetAnimal(n)
      } else {
        n.rescueProgress = Math.max(0, (n.rescueProgress || 0) - this.game.loop.delta / 1000)
      }
    })
  }

  // Decrements the snare timer — wriggling (any movement key) burns
  // it down faster than just waiting it out.
  updateSnare(delta, isWrigglingInput) {
    if (this.snareTimer <= 0) return
    const wriggleBonus = isWrigglingInput ? delta * 1.8 : 0
    const wasSnared = this.snareTimer > 0
    this.snareTimer = Math.max(0, this.snareTimer - delta - wriggleBonus)
    if (wasSnared && this.snareTimer <= 0) {
      this.showFloatingText(this.player.x, this.player.y - 30, '💪 Free!', '#aee6ff')
    }
  }

  rescueNetAnimal(n) {
    if (n.rescued) return
    n.rescued = true
    this.netsFreed = (this.netsFreed || 0) + 1

    if (!this.wildlifeJournal.includes(n.species)) {
      this.wildlifeJournal.push(n.species)
    }

    if (n.indicator) n.indicator.destroy()
    if (n.prompt) n.prompt.destroy()

    this.tweens.add({
      targets: n.netGfx, alpha: 0, duration: 500,
      onComplete: () => n.netGfx.destroy()
    })

    this.tweens.add({
      targets: n.animal, y: n.animal.y - 140, alpha: 0, duration: 1300,
      ease: 'Sine.easeIn',
      onComplete: () => n.animal.destroy()
    })

    this.score = (this.score || 0) + 150
    this.showFloatingText(n.x, n.y - 30, '❤️ Freed from the net! +150', '#88ff99')
    this.showWildlifeCard(n.species, n.fact)
  }

  showFloatingText(x, y, msg, color) {
    const t = this.add.text(x, y, msg, {
      fontSize: '13px', fontFamily: 'Arial Black', color,
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(200)

    this.tweens.add({
      targets: t, y: y - 45, alpha: 0, duration: 1100,
      onComplete: () => t.destroy()
    })
  }

  // ================================================================
  // AMBIENT BUBBLES
  // ================================================================

  createBubbles() {
    for (let i = 0; i < 60; i++) {
      const x = Phaser.Math.Between(20, this.worldW - 20)
      const y = Phaser.Math.Between(20, this.worldH - 20)
      const size = Phaser.Math.FloatBetween(2, 5)

      const bubble = this.add.circle(x, y, size, 0xbfe9ff, Phaser.Math.FloatBetween(0.25, 0.55))
        .setDepth(40)
      bubble.setStrokeStyle(1, 0xffffff, 0.3)

      const drift = Phaser.Math.Between(-25, 25)

      this.tweens.add({
        targets: bubble,
        y: y - Phaser.Math.Between(300, 700),
        x: x + drift,
        alpha: 0,
        duration: Phaser.Math.Between(4000, 9000),
        repeat: -1,
        onRepeat: () => {
          bubble.y = Phaser.Math.Between(20, this.worldH - 20)
          bubble.x = Phaser.Math.Between(20, this.worldW - 20)
          bubble.setAlpha(Phaser.Math.FloatBetween(0.25, 0.55))
        }
      })
    }
  }

  // ================================================================
  // 🫧 OXYGEN SYSTEM — same shape as Level 2's warmth: a meter that
  // drains, refills near a source, and punishes hitting zero. Two
  // differences that make it feel like diving instead of a reskin:
  //   1. Drain rate scales continuously with how deep the player
  //      is (world Y), not just a flat per-second number — the
  //      cave zone is risky because it's physically the deepest
  //      part of the map, not because of a zone flag.
  //   2. Hitting zero doesn't end the run (no death/report screen
  //      exists for Level 3 yet) — it blacks the player out and
  //      surfaces them near the nearest air pocket, oxygen partly
  //      refilled. Real stakes (lost position, a scare) without
  //      needing a full game-over flow this early in the level.
  // ================================================================

  createAirPockets() {
    const W = 1600
    const H = 900

    const spots = [
      // Zone 1: Coral Reef
      { x: 450, y: 90 },           // reef west lagoon
      { x: 1320, y: 110 },         // reef east grotto
      // Zone 2: Sunken Ruins
      { x: W + 450, y: 90 },       // ruins west colonnade
      { x: W + 1300, y: 110 },      // ruins east altar
      // Zone 3: Kelp Forest
      { x: 350, y: H + 90 },       // kelp canopy
      { x: 1250, y: H + 110 },     // kelp deep trench
      // Zone 4: Abyssal Cave
      { x: W + 420, y: H + 100 },  // upper cavern
      { x: W + 1180, y: H + 110 }, // sanctum threshold
    ]

    this.airPockets = spots.map(p => {
      // Brighter and drawn ABOVE the platform/coral decor layer
      // (depth 12) instead of underneath it, so it actually reads as
      // a marker rather than getting buried in the scenery.
      const glow = this.add.circle(p.x, p.y, 70, 0x66ccff, 0.28).setDepth(13)
      const ring = this.add.circle(p.x, p.y, 70).setStrokeStyle(2, 0xaee6ff, 0.6).setDepth(13)
      this.tweens.add({
        targets: [glow, ring], scaleX: 1.15, scaleY: 1.15, alpha: 0.12,
        duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      })

      for (let i = 0; i < 5; i++) {
        const bx = p.x + Phaser.Math.Between(-14, 14)
        const by = p.y + Phaser.Math.Between(-10, 10)
        const bubble = this.add.circle(bx, by, Phaser.Math.FloatBetween(2, 4), 0xdfefff, 0.7).setDepth(14)

        this.tweens.add({
          targets: bubble, y: by - 60, alpha: 0,
          duration: Phaser.Math.Between(1200, 2000), repeat: -1, delay: i * 250,
          onRepeat: () => {
            bubble.y = p.y + Phaser.Math.Between(-10, 10)
            bubble.setAlpha(0.7)
          }
        })
      }

      // The label used to sit 90px ABOVE the pocket, which pushed it
      // outside the zone's own top boundary (every zone is 900px
      // tall and every pocket sits at y=80 from its zone's top edge)
      // — since the camera is locked to exactly one zone's rectangle
      // at a time, that put the label off-screen in all four zones,
      // every time. Placing it BELOW the glow instead keeps it
      // safely inside the zone and always visible.
      this.add.text(p.x, p.y + 90, '💨 Air Pocket', {
        fontSize: '10px', fontFamily: 'Arial Black', color: '#aee6ff',
        stroke: '#000000', strokeThickness: 3
      }).setOrigin(0.5).setDepth(14).setAlpha(0.95)

      return { x: p.x, y: p.y, radius: 130 }
    })
  }

  createOxygenHUD() {
    const { width } = this.scale
    const x = width - 190
    const y = 40

    this.oxygenHUDX = x
    this.oxygenHUDY = y
    this.oxygenBarW = 150
    this.oxygenBarH = 14

    this.add.text(x - 22, y, '🫧', { fontSize: '16px' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(250)

    this.oxygenBarBg = this.add.graphics().setScrollFactor(0).setDepth(250)
    this.oxygenBarBg.fillStyle(0x001a2e, 0.85)
    this.oxygenBarBg.fillRoundedRect(x - 4, y - this.oxygenBarH / 2, this.oxygenBarW + 8, this.oxygenBarH, 6)

    this.oxygenBarFill = this.add.graphics().setScrollFactor(0).setDepth(251)

    this.oxygenText = this.add.text(x + this.oxygenBarW / 2, y + 16, '', {
      fontSize: '11px', fontFamily: 'Arial Black',
      color: '#aee6ff', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(251)

    this.heartsText = this.add.text(x + this.oxygenBarW / 2, y - 20, '❤️ ❤️ ❤️', {
      fontSize: '14px'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(251)

    this.sonarHUDText = this.add.text(x + this.oxygenBarW / 2, y + 36, '📡 [SPACE] SONAR: READY', {
      fontSize: '10px', fontFamily: 'Arial Black',
      color: '#00e5ff', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(251)

    this.updateOxygenHUD()
  }

  updateOxygenHUD() {
    if (!this.oxygenBarFill) return
    const pct = Phaser.Math.Clamp(this.oxygen / this.maxOxygen, 0, 1)

    if (this.heartsText) {
      let heartsStr = ''
      for (let i = 0; i < this.maxHP; i++) {
        heartsStr += i < this.playerHP ? '❤️ ' : '🖤 '
      }
      this.heartsText.setText(heartsStr.trim())
    }

    const color =
      pct > 0.6 ? 0x00BFFF :
      pct > 0.3 ? 0xFFD700 :
      0xff3355

    this.oxygenBarFill.clear()
    this.oxygenBarFill.fillStyle(color, 1)
    this.oxygenBarFill.fillRoundedRect(
      this.oxygenHUDX,
      this.oxygenHUDY - this.oxygenBarH / 2,
      this.oxygenBarW * pct,
      this.oxygenBarH,
      5
    )

    let label = `OXYGEN: ${Math.round(this.oxygen)}%`
    if (this.oxygen <= 0) label = '🫧 DROWNING!'
    else if (this.nearAirPocket) label = '💨 REFILLING'

    this.oxygenText.setText(label)
    this.oxygenText.setColor(this.oxygen <= 0 ? '#ff5577' : '#aee6ff')

    if (this.sonarHUDText) {
      if (this.sonarCooldown > 0) {
        const secLeft = (this.sonarCooldown / 1000).toFixed(1)
        this.sonarHUDText.setText(`📡 SONAR: ${secLeft}s`)
        this.sonarHUDText.setColor('#ffaa44')
      } else {
        this.sonarHUDText.setText('📡 [SPACE] SONAR: READY')
        this.sonarHUDText.setColor('#00e5ff')
      }
    }
  }

  updateOxygen(delta) {
    if (!this.player || !this.player.active) return
    const dt = delta / 1000

    this.nearAirPocket = this.airPockets.some(p =>
      Phaser.Math.Distance.Between(this.player.x, this.player.y, p.x, p.y) < p.radius
    )

    if (this.nearAirPocket) {
      this.oxygen = Math.min(this.maxOxygen, this.oxygen + this.OXYGEN_REGEN_PER_SEC * dt)
    } else {
      // Depth as a continuous resource, not a zone flag — the
      // further down the world you are, the faster oxygen burns.
      const depthFactor = Phaser.Math.Clamp(this.player.y / this.worldH, 0, 1)
      const drain = this.OXYGEN_BASE_DRAIN_PER_SEC + depthFactor * this.OXYGEN_DEPTH_DRAIN_BONUS
      this.oxygen = Math.max(0, this.oxygen - drain * dt)
    }

    if (this.oxygen <= 0 && this.time.now - this.lastDrowningTick > 2500) {
      this.lastDrowningTick = this.time.now
      this.playerHP--
      this.player.setTint(0x2266aa)
      this.showFloatingText(this.player.x, this.player.y - 30, '🫧 Drowning! -1 Heart', '#66ccff')
      this.time.delayedCall(300, () => {
        if (this.player && this.player.active) this.player.clearTint()
      })

      if (this.playerHP <= 0) {
        this.triggerDefeat()
        return
      }
    }

    this.updateOxygenHUD()
  }

  handleBlackout() {
    this.playerHP = this.maxHP
    this.oxygen = this.maxOxygen * 0.4
    this.snareTimer = 0

    let nearest = this.airPockets[0]
    let nearestDist = Infinity
    this.airPockets.forEach(p => {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, p.x, p.y)
      if (d < nearestDist) { nearestDist = d; nearest = p }
    })

    this.cameras.main.flash(400, 20, 40, 70)
    this.player.setPosition(nearest.x, nearest.y + 40)
    this.player.body.setVelocity(0, 0)
    this.showFloatingText(this.player.x, this.player.y - 40, '😵 Blacked out — surfaced near air', '#ffcc66')
  }

  // ================================================================
  // PLATFORMS — placeholder ledges with static collision bodies,
  // hand-placed per zone. Swap the drawn rectangle for real
  // coral/rock/ruin art later without touching the collider.
  // ================================================================

  createPlatforms() {
    this.platforms = this.physics.add.staticGroup()

    const addPlatform = (x, y, w, h, biome = 'reef') => {
      const g = this.add.graphics().setDepth(10)
      let baseColor = 0x184438
      let edgeColor = 0x3ea88b
      let accentColor = 0x6be0c2
      let trimColor = 0xdf7366

      if (biome === 'ruins') {
        baseColor = 0x182933
        edgeColor = 0x3d6478
        accentColor = 0x6e9ab0
        trimColor = 0xd4a853
      } else if (biome === 'kelp') {
        baseColor = 0x122e1f
        edgeColor = 0x276b45
        accentColor = 0x4aa36d
        trimColor = 0x66c788
      } else if (biome === 'cave') {
        baseColor = 0x0f141e
        edgeColor = 0x243245
        accentColor = 0x405575
        trimColor = 0x6894c7
      }

      // 1. Solid foundation block
      g.fillStyle(baseColor, 1)
      g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8)

      // 2. High-contrast top walking surface slab
      const slabH = Math.min(12, Math.floor(h / 3))
      g.fillStyle(edgeColor, 1)
      g.fillRoundedRect(x - w / 2, y - h / 2, w, slabH, 5)

      // 3. Bright top-edge specular highlight
      g.fillStyle(accentColor, 0.95)
      g.fillRoundedRect(x - w / 2 + 2, y - h / 2 + 1, w - 4, 3, 2)

      // 4. Distinct biome surface rim separating the slab from the base
      g.fillStyle(trimColor, 0.85)
      g.fillRoundedRect(x - w / 2 + 6, y - h / 2 + slabH, w - 12, 2, 1)

      const zone = this.add.zone(x, y, w, h)
      this.physics.add.existing(zone, true)
      this.platforms.add(zone)
    }

    const W = this.zoneWidth
    const H = this.zoneHeight

    // ============================================================
    // ZONE 1: CORAL REEF (Top-Left, x: 0..1600, y: 0..900)
    // ============================================================
    // Starting platform directly under player spawn (spawn is at 220, 320)
    addPlatform(260, 420, 380, 52, 'reef')
    // Upper coral barrier (forces detour to reach surface air pocket at 350, 100)
    addPlatform(640, 240, 360, 48, 'reef')
    // Center vertical coral pillar creating chicane swimways
    addPlatform(740, 520, 48, 300, 'reef')
    // Lower canyon floor shelf
    addPlatform(360, 680, 360, 52, 'reef')
    // East grotto upper shelf (shelters trapped turtle at 1050, 240 and air pocket at 1200, 100)
    addPlatform(1120, 340, 380, 52, 'reef')
    // East grotto divider barrier (forces swimming around y: 550 for the Ruins portal at 1570, 550)
    addPlatform(1060, 640, 48, 240, 'reef')
    // South-east seabed terrace
    addPlatform(1340, 720, 320, 52, 'reef')
    // Reef seafloor barrier (leaves x: 1330..1510 open for the Kelp portal at x: 1420, y: 875)
    addPlatform(650, 876, 1300, 52, 'reef')

    // ============================================================
    // ZONE 2: SUNKEN RUINS (Top-Right, x: 1600..3200, y: 0..900)
    // ============================================================
    // Arrival shelf for entering from Reef (entry at 1760, 550)
    addPlatform(W + 200, 640, 340, 52, 'ruins')
    // Grand Colonnade Pillar 1 (hangs from ceiling)
    addPlatform(W + 480, 240, 52, 340, 'ruins')
    // Grand Colonnade Pillar 2 (rises from seabed)
    addPlatform(W + 720, 680, 52, 340, 'ruins')
    // Sunken Hall Archway (creates winding S-curve corridor)
    addPlatform(W + 640, 340, 320, 48, 'ruins')
    // Grand Colonnade Pillar 3 (hangs from ceiling)
    addPlatform(W + 960, 240, 52, 340, 'ruins')
    // Sacred Altar Shelf (trapped seahorse at W + 1120, 440)
    addPlatform(W + 1160, 340, 380, 52, 'ruins')
    // Crypt divider wall
    addPlatform(W + 1160, 680, 52, 280, 'ruins')
    // Sunken Treasury shelf
    addPlatform(W + 1440, 540, 260, 48, 'ruins')
    // Ruins seabed floor (leaves x: W + 1330..W + 1510 open for Cave portal at W + 1420, 875)
    addPlatform(W + 650, 876, 1300, 52, 'ruins')

    // ============================================================
    // ZONE 3: KELP FOREST (Bottom-Left, x: 0..1600, y: 900..1800)
    // ============================================================
    // Kelp canopy shelf (under Reef entry at 1420, 1060)
    addPlatform(1400, H + 260, 360, 48, 'kelp')
    // Hanging Kelp Ridge 1 (descends from upper kelp canopy)
    addPlatform(480, H + 280, 52, 380, 'kelp')
    // Deep kelp seafloor root shelf (starfish rests at 340, H + 654)
    addPlatform(340, H + 680, 380, 52, 'kelp')
    // Middle Kelp Terrace (trapped manta ray hovers at 750, H + 280)
    addPlatform(780, H + 420, 380, 52, 'kelp')
    // Towering Kelp Barrier (rises from floor, forcing high swimway)
    addPlatform(1120, H + 620, 52, 400, 'kelp')
    // Lower Kelp Cavern ledge (leads toward Cave tunnel at 1570, 1520)
    addPlatform(1400, H + 740, 340, 52, 'kelp')

    // ============================================================
    // ZONE 4: ABYSSAL CAVE (Bottom-Right, x: 1600..3200, y: 900..1800)
    // ============================================================
    // Abyssal Stalactite 1 (hangs near Kelp tunnel entry at 1760, 1520)
    addPlatform(W + 360, H + 240, 52, 340, 'cave')
    // Abyssal Stalagmite 1 (rises from floor creating tight chicane)
    addPlatform(W + 580, H + 680, 52, 360, 'cave')
    // Central Obsidian Bridge (trapped stingray at W + 720, H + 360)
    addPlatform(W + 720, H + 480, 320, 52, 'cave')
    // Abyssal Stalactite 2 (separates Ruins entry from deep cavern)
    addPlatform(W + 960, H + 250, 52, 340, 'cave')
    // Upper Chasm Shelf (shelters air pocket at W + 1100, H + 100)
    addPlatform(W + 1080, H + 260, 220, 44, 'cave')
    // Abyssal Upper Stalactite (hangs from ceiling, leaving open water below)
    addPlatform(W + 1180, H + 120, 44, 140, 'cave')
    // Abyssal Lower Stalagmite (rises from floor, leaving 468px gateway above)
    addPlatform(W + 1180, H + 820, 48, 140, 'cave')
    // Sanctum Dais (ancient seabed plinth beneath the open exit portal)
    addPlatform(W + 1400, H + 810, 280, 48, 'cave')
  }

  // ================================================================
  // PLAYER — a real Arcade Sprite (same pattern GameScene1/2 use
  // for the player and hunters), with a texture baked once from
  // Graphics via generateTexture(). No Container, no invisible
  // body needing manual position-sync — just a normal sprite.
  // ================================================================

  buildDiverTexture() {
    const key = 'diver_placeholder'
    if (this.textures.exists(key)) return key

    const g = this.add.graphics()

    // glow
    g.fillStyle(0x8fe3ff, 0.25)
    g.fillCircle(32, 32, 26)

    // fin
    g.fillStyle(0x4fb8d9, 1)
    g.fillTriangle(18, 32, 2, 22, 2, 42)

    // body
    g.fillStyle(0xdff6ff, 1)
    g.fillCircle(32, 32, 15)

    // core
    g.fillStyle(0x8fe3ff, 1)
    g.fillCircle(32, 32, 8)

    g.generateTexture(key, 64, 64)
    g.destroy()
    return key
  }

  createPlayer() {
    const startX = 220
    const startY = 320
    const birdKey = (this.chosenBird || 'ember').toLowerCase()
    const initialTexture = this.textures.exists(`${birdKey}_front`) ? `${birdKey}_front` : 'ember_front'

    this.player = this.physics.add.sprite(startX, startY, initialTexture)
    this.player.setDisplaySize(38, 38)
    this.player.setDepth(30)

    // Bubble radius is 26px (diameter 52px).
    // Because Phaser's setDisplaySize scales the sprite, body.setSize takes source (unscaled) dimensions.
    // We compute source dimensions so that in the world, the physics body is exactly 44px wide and 52px high,
    // perfectly matching the 52px bubble height!
    const sx = this.player.scaleX
    const sy = this.player.scaleY
    const bodyW = 44 / sx
    const bodyH = 52 / sy
    this.player.body.setSize(bodyW, bodyH)
    this.player.body.setOffset(
      (this.player.width - bodyW) / 2,
      (this.player.height - bodyH) / 2
    )
    this.player.body.setCollideWorldBounds(true)
    this.player.body.setMaxVelocity(240, 260)

    // Bubble Graphics: Back glow and front glass reflection sandwiching bird sprite
    this.playerBubbleBack = this.add.graphics().setDepth(29)
    this.playerBubbleFront = this.add.graphics().setDepth(31)
    this.bubbleRadius = 26
  }

  drawPlayerBubble(x, y) {
    if (!this.playerBubbleBack || !this.playerBubbleFront) return
    this.playerBubbleBack.clear()
    this.playerBubbleFront.clear()

    const pulse = 1 + Math.sin((this.time ? this.time.now : Date.now()) / 260) * 0.035
    const r = this.bubbleRadius * pulse

    // --- Back Glow & Translucent Aqua Fill ---
    // Outer aqua halo
    this.playerBubbleBack.fillStyle(0x40e0d0, 0.16)
    this.playerBubbleBack.fillCircle(x, y, r + 5)

    // Inner translucent bubble sphere
    this.playerBubbleBack.fillStyle(0x7fe3ff, 0.26)
    this.playerBubbleBack.fillCircle(x, y, r)

    // --- Front Glassy Rim & Specular Highlights ---
    // Outer glass boundary ring
    this.playerBubbleFront.lineStyle(2.2, 0xdff8ff, 0.85)
    this.playerBubbleFront.strokeCircle(x, y, r)

    // Subtle inner neon aquatic rim
    this.playerBubbleFront.lineStyle(1.2, 0x00ffff, 0.4)
    this.playerBubbleFront.strokeCircle(x, y, r - 1.5)

    // Specular highlight glare (top-left crescent reflection)
    const hlAngle = -Math.PI * 0.72
    const hlx = x + Math.cos(hlAngle) * (r * 0.65)
    const hly = y + Math.sin(hlAngle) * (r * 0.65)
    this.playerBubbleFront.fillStyle(0xffffff, 0.75)
    this.playerBubbleFront.fillEllipse(hlx, hly, r * 0.38, r * 0.18)

    // Secondary smaller highlight dot (bottom-right reflection)
    const brAngle = Math.PI * 0.28
    const brx = x + Math.cos(brAngle) * (r * 0.72)
    const bry = y + Math.sin(brAngle) * (r * 0.72)
    this.playerBubbleFront.fillStyle(0xffffff, 0.4)
    this.playerBubbleFront.fillCircle(brx, bry, r * 0.1)
  }

  spawnTrailBubble(x, y) {
    const size = Phaser.Math.Between(2, 5)
    const b = this.add.circle(x + Phaser.Math.Between(-4, 4), y, size, 0xaaeaff, 0.6).setDepth(28)
    this.tweens.add({
      targets: b,
      y: y - Phaser.Math.Between(18, 32),
      x: b.x + Phaser.Math.Between(-6, 6),
      alpha: 0,
      scale: 1.3,
      duration: Phaser.Math.Between(450, 700),
      ease: 'Sine.easeOut',
      onComplete: () => b.destroy()
    })
  }

  togglePauseMenu() {
    if (this.reportShown || this.setupFailed) return
    if (this.speciesCardFrozen) return

    const now = Date.now()
    if (this.lastPauseToggle && now - this.lastPauseToggle < 250) return
    this.lastPauseToggle = now

    if (this.isPaused) {
      this.resumeGame()
    } else {
      this.pauseGame()
    }
  }

  pauseGame() {
    if (this.isPaused || this.reportShown || this.setupFailed) return
    this.isPaused = true
    try {
      if (this.sound && this.sound.play) {
        this.sound.play('esc_sound', { volume: 0.85 })
      }
    } catch (e) {}
    this.physics.pause()
    if (this.player && this.player.body) {
      this.player.body.setVelocity(0, 0)
      this.player.body.setAcceleration(0, 0)
    }

    const { width, height } = this.scale
    const cx = width / 2
    const cy = height / 2

    this.pauseMenuElements = []

    // Full-screen dark overlay
    const backdrop = this.add.rectangle(cx, cy, width, height, 0x000000, 0.78)
      .setScrollFactor(0)
      .setDepth(100000)
      .setInteractive()

    // Modal card
    const modalW = 400
    const modalH = 320
    const modalBox = this.add.graphics()
      .setScrollFactor(0)
      .setDepth(100001)
    modalBox.fillStyle(0x06141d, 0.96)
    modalBox.fillRoundedRect(cx - modalW / 2, cy - modalH / 2, modalW, modalH, 16)
    modalBox.lineStyle(3, 0x00e1ff, 0.9)
    modalBox.strokeRoundedRect(cx - modalW / 2, cy - modalH / 2, modalW, modalH, 16)

    // Title
    const title = this.add.text(cx, cy - 110, '⏸️ GAME PAUSED', {
      fontSize: '24px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100002)

    const birdName = this.chosenBird.charAt(0).toUpperCase() + this.chosenBird.slice(1)
    const sub = this.add.text(cx, cy - 75, `Level 3: Abyssal Depths • ${this.playerName} (${birdName})`, {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#70e5ff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100002)

    this.pauseMenuElements.push(backdrop, modalBox, title, sub)

    const makePauseBtn = (x, y, text, colorHex, borderHex, hoverHex, callback) => {
      const btnW = 270
      const btnH = 46

      const btnBg = this.add.rectangle(x, y, btnW, btnH, colorHex, 0.92)
        .setStrokeStyle(2, borderHex, 1)
        .setScrollFactor(0)
        .setDepth(100002)
        .setInteractive({ useHandCursor: true })

      const btnLabel = this.add.text(x, y, text, {
        fontSize: '15px',
        fontFamily: 'Arial Black',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5).setScrollFactor(0).setDepth(100003).setInteractive({ useHandCursor: true })

      const onOver = () => {
        btnBg.setFillStyle(hoverHex || borderHex, 1)
        btnBg.setStrokeStyle(2, 0xffffff, 1)
        btnLabel.setScale(1.05)
      }
      const onOut = () => {
        btnBg.setFillStyle(colorHex, 0.92)
        btnBg.setStrokeStyle(2, borderHex, 1)
        btnLabel.setScale(1)
      }

      const onClick = () => {
        if (this.sound && this.sound.play) {
          this.sound.play('select_sound', { volume: 0.85 })
        }
        callback()
      }

      btnBg.on('pointerover', onOver)
      btnBg.on('pointerout', onOut)
      btnBg.on('pointerdown', onClick)

      btnLabel.on('pointerover', onOver)
      btnLabel.on('pointerout', onOut)
      btnLabel.on('pointerdown', onClick)

      this.pauseMenuElements.push(btnBg, btnLabel)
    }

    // 1. Resume button
    makePauseBtn(cx, cy - 25, '▶  RESUME', 0x0a4b63, 0x00e1ff, 0x126c8c, () => {
      this.resumeGame()
    })

    // 2. Play Again / Restart button
    makePauseBtn(cx, cy + 35, '🔄  PLAY AGAIN', 0xb86214, 0xffaa44, 0xd97718, () => {
      this.playAgain()
    })

    // 3. Go to Main button
    makePauseBtn(cx, cy + 95, '🏠  GO TO MAIN', 0x8a2020, 0xff5555, 0xb32b2b, () => {
      this.goToMain()
    })

    this.scene.bringToTop()
  }

  resumeGame() {
    if (!this.isPaused) return
    this.isPaused = false
    try {
      const escSnd = this.sound.get('esc_sound')
      if (escSnd && escSnd.isPlaying) escSnd.stop()
    } catch (e) {}
    if (this.pauseMenuElements && this.pauseMenuElements.length > 0) {
      this.pauseMenuElements.forEach(el => {
        if (el && el.destroy) el.destroy()
      })
      this.pauseMenuElements = null
    }
    this.physics.resume()
  }

  playAgain() {
    this.isPaused = false
    try {
      const escSnd = this.sound.get('esc_sound')
      if (escSnd && escSnd.isPlaying) escSnd.stop()
    } catch (e) {}
    this.cleanupPauseAndListeners()
    this.scene.restart({
      playerName: this.playerName,
      chosenBird: this.chosenBird,
      score: this.score
    })
  }

  goToMain() {
    this.isPaused = false
    try {
      const escSnd = this.sound.get('esc_sound')
      if (escSnd && escSnd.isPlaying) escSnd.stop()
    } catch (e) {}
    this.cleanupPauseAndListeners()
    this.scene.start('MenuScene', {
      playerName: this.playerName,
      chosenBird: this.chosenBird,
      score: this.score
    })
  }

  cleanupPauseAndListeners() {
    try {
      const escSnd = this.sound.get('esc_sound')
      if (escSnd && escSnd.isPlaying) escSnd.stop()
    } catch (e) {}
    if (this.onEscKeyDown) {
      window.removeEventListener('keydown', this.onEscKeyDown)
      this.onEscKeyDown = null
    }
    if (this.pauseMenuElements && this.pauseMenuElements.length > 0) {
      this.pauseMenuElements.forEach(el => {
        if (el && el.destroy) el.destroy()
      })
      this.pauseMenuElements = null
    }
  }

  // ================================================================
  // UPDATE
  // ================================================================

  update() {
    if (this.setupFailed || !this.player || !this.player.body) return
    if (this.reportShown) return
    if (this.isPaused) {
      if (this.player && this.player.body) {
        this.player.body.setVelocity(0, 0)
        this.player.body.setAcceleration(0, 0)
      }
      return
    }

    // Allow exit portal check in cave even if transitioning flag had edge cases
    this.checkExitPortal()
    if (this.reportShown) return

    if (this.transitioning) return

    const delta = this.game.loop.delta

    const movedInput =
      this.wasd.left.isDown || this.wasd.right.isDown || this.wasd.up.isDown || this.wasd.down.isDown ||
      this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown || this.cursors.down.isDown

    // 🧊 Level 1 Freeze-and-Resume on movement
    if (this.speciesCardFrozen) {
      const now = (this.time && this.time.now) ? this.time.now : Date.now()
      const elapsed = now - (this.cardFreezeTimestamp || 0)
      if (movedInput && elapsed > 280) {
        this.dismissWildlifeCard()
      } else {
        this.player.body.setVelocity(0, 0)
        this.player.body.setAcceleration(0, 0)
        return
      }
    }

    this.checkTunnels()
    if (this.transitioning || this.reportShown) return

    this.updateWildlife()
    this.updateHazards(delta)
    this.updateNets()
    this.updateMiniMap()
    this.updateOxygen(delta)

    if (this.sonarCooldown > 0) {
      this.sonarCooldown = Math.max(0, this.sonarCooldown - delta)
    }

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.fireSonarPulse()
    }

    this.updateSnare(delta, movedInput)

    // 🕸️ Snagged in a net: still movable, just badly slowed — not a
    // hard freeze, so "wriggling free" (mashing movement) feels active
    const snareFactor = this.snareTimer > 0 ? 0.3 : 1

    const horizontalSpeed = 200 * snareFactor
    const swimThrust = 640 * snareFactor
    const diveAssist = 360 * snareFactor
    const maxRiseSpeed = 220

    let vx = 0
    const birdKey = (this.chosenBird || 'ember').toLowerCase()

    if (this.wasd.left.isDown || this.cursors.left.isDown) {
      vx = -horizontalSpeed
      this.facing = -1
      if (this.textures.exists(`${birdKey}_left`)) {
        this.player.setTexture(`${birdKey}_left`)
      }
    } else if (this.wasd.right.isDown || this.cursors.right.isDown) {
      vx = horizontalSpeed
      this.facing = 1
      if (this.textures.exists(`${birdKey}_right`)) {
        this.player.setTexture(`${birdKey}_right`)
      }
    }

    this.player.body.setVelocityX(vx)

    if (this.playerNearNet) {
      // frozen in place vertically ONLY while within reach of a net —
      // no gravity sinking, no swim-thrust drifting. Everywhere else
      // in the world, physics behaves exactly as before.
      this.player.body.setAccelerationY(0)
      this.player.body.setVelocityY(0)
    } else if (this.wasd.up.isDown || this.cursors.up.isDown) {
      this.player.body.setAccelerationY(-swimThrust)
      if (this.textures.exists(`${birdKey}_back`)) {
        this.player.setTexture(`${birdKey}_back`)
      }
    } else if (this.wasd.down.isDown || this.cursors.down.isDown) {
      this.player.body.setAccelerationY(diveAssist)
      if (this.textures.exists(`${birdKey}_front`)) {
        this.player.setTexture(`${birdKey}_front`)
      }
    } else {
      this.player.body.setAccelerationY(0)
      if (!this.wasd.left.isDown && !this.wasd.right.isDown && !this.cursors.left.isDown && !this.cursors.right.isDown) {
        if (this.textures.exists(`${birdKey}_front`)) {
          this.player.setTexture(`${birdKey}_front`)
        }
      }
    }

    if (this.player.body.velocity.y < -maxRiseSpeed) {
      this.player.body.setVelocityY(-maxRiseSpeed)
    }

    this.player.setFlipX(false)

    const vy = this.player.body.velocity.y
    const targetTilt = Phaser.Math.Clamp(vy / 260, -1, 1) * 0.18
    this.player.rotation = Phaser.Math.Linear(this.player.rotation, targetTilt, 0.12)

    this.drawPlayerBubble(this.player.x, this.player.y)

    // Trailing swimming bubbles
    if (Math.abs(vx) > 30 || Math.abs(vy) > 30) {
      if (Phaser.Math.Between(0, 100) < 14) {
        this.spawnTrailBubble(this.player.x - (this.facing * 10), this.player.y + 12)
      }
    }
  }

  // ================================================================
  // 📡 BIOLUMINESCENT SONAR PULSE
  // ================================================================

  playSonarSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      if (!this.sonarAudioCtx) this.sonarAudioCtx = new AudioCtx()
      if (this.sonarAudioCtx.state === 'suspended') {
        this.sonarAudioCtx.resume()
      }
      const ctx = this.sonarAudioCtx
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      const now = ctx.currentTime
      osc.frequency.setValueAtTime(740, now)
      osc.frequency.exponentialRampToValueAtTime(1280, now + 0.12)
      osc.frequency.exponentialRampToValueAtTime(380, now + 0.5)

      gain.gain.setValueAtTime(0.001, now)
      gain.gain.linearRampToValueAtTime(0.24, now + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.58)
    } catch (e) {
      // Audio context might be restricted before user interaction; ignore gracefully
    }
  }

  createSonarPingBeacon(x, y, label, colorHex) {
    const beacon = this.add.graphics().setDepth(220)
    beacon.fillStyle(colorHex, 0.35)
    beacon.fillCircle(x, y, 26)
    beacon.lineStyle(2.5, colorHex, 0.95)
    beacon.strokeCircle(x, y, 30)

    const text = this.add.text(x, y - 42, label, {
      fontSize: '11px', fontFamily: 'Arial Black', color: '#ffffff',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(221)

    this.tweens.add({
      targets: beacon,
      scaleX: 1.35,
      scaleY: 1.35,
      alpha: 0.15,
      duration: 600,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        beacon.destroy()
        text.destroy()
      }
    })
  }

  fireSonarPulse() {
    if (this.sonarCooldown > 0) return
    this.sonarCooldown = this.SONAR_COOLDOWN_MS

    this.playSonarSound()

    const px = this.player.x
    const py = this.player.y
    const maxRadius = 560

    // Concentric expanding bioluminescent echolocation rings
    for (let i = 0; i < 3; i++) {
      const ring = this.add.circle(px, py, 18, 0x00ffff, 0)
        .setStrokeStyle(3 - i * 0.7, 0x55ffff, 0.9 - i * 0.2)
        .setDepth(200)

      this.tweens.add({
        targets: ring,
        radius: maxRadius + i * 40,
        alpha: 0,
        duration: 900 + i * 140,
        ease: 'Cubic.easeOut',
        onComplete: () => ring.destroy()
      })
    }

    // Light illumination flash in the dark Abyssal Cave
    if (this.currentZone === 'cave') {
      this.cameras.main.flash(400, 0, 45, 80, true)
    }

    // ⚡ Disentangle immediately if snared in a net!
    if (this.snareTimer > 0) {
      this.snareTimer = 0
      this.showFloatingText(px, py - 35, '⚡ Sonar Pulse shattered net!', '#00ffff')
    }

    // Reveal trapped animals (nets)
    if (this.netList) {
      this.netList.forEach(n => {
        if (n.rescued) return
        const dist = Phaser.Math.Distance.Between(px, py, n.x, n.y)
        if (dist <= maxRadius) {
          this.createSonarPingBeacon(n.x, n.y, `⚠️ ${n.species}`, 0xff6644)
        }
      })
    }

    // Reveal and STUN mobile hazards (jellyfishes & eels)
    if (this.hazardList) {
      this.hazardList.forEach(h => {
        const dist = Phaser.Math.Distance.Between(px, py, h.x, h.y)
        if (dist <= maxRadius) {
          h.stunTimer = 2800
          h.sprite.setTint(0x00ffff)
          const tag = h.type === 'poison' ? `☣️ ${h.name} [STUNNED]` : `⚡ ${h.name} [STUNNED]`
          const col = h.type === 'poison' ? 0x39ff14 : 0xffea00
          this.createSonarPingBeacon(h.x, h.y, tag, col)
        }
      })
    }

    // Reveal air pockets
    if (this.airPockets) {
      this.airPockets.forEach(p => {
        const dist = Phaser.Math.Distance.Between(px, py, p.x, p.y)
        if (dist <= maxRadius) {
          this.createSonarPingBeacon(p.x, p.y, '💨 Air Pocket', 0x44ddff)
        }
      })
    }

    // Reveal exit portal (in Cave zone)
    if (this.currentZone === 'cave' && this.exitPortal) {
      const dist = Phaser.Math.Distance.Between(px, py, this.exitPortal.x, this.exitPortal.y)
      if (dist <= maxRadius) {
        this.createSonarPingBeacon(this.exitPortal.x, this.exitPortal.y, '✨ Exit Portal', 0x66ffcc)
      }
    }
  }

  // ================================================================
  // ☣️ HAZARDS (JELLYFISH & ELECTRIC EEL)
  //
  // Jellyfish 1 & 2 deliver venomous poisonous stings that inflict
  // damage and burn away oxygen.
  // Eel delivers high-voltage electric shocks that paralyze and damage.
  // Both can be avoided or stunned with Sonar Pulse ([SPACE]).
  // ================================================================

  createHazards() {
    this.hazardList = []

    const W = this.zoneWidth
    const H = this.zoneHeight

    const hazardDefs = [
      // Zone 1: Coral Reef (Moon Jellyfish)
      {
        key: 'jellyfish_1', type: 'poison', name: 'Toxic Jellyfish',
        x: 880, y: 380, scale: 0.5,
        movement: 'vertical', minY: 260, maxY: 520, speed: 42,
        auraColor: 0x39ff14
      },
      // Zone 2: Sunken Ruins (Electric Moray)
      {
        key: 'eel_1', type: 'electric', name: 'Electric Eel',
        x: W + 820, y: 560, scale: 0.52,
        movement: 'horizontal', minX: W + 620, maxX: W + 1040, speed: 65,
        auraColor: 0xffea00
      },
      // Zone 3: Kelp Forest (Venomous Sea Wasp Jelly & Electric Moray)
      {
        key: 'jellyfish_2', type: 'poison', name: 'Venomous Box Jelly',
        x: 960, y: H + 340, scale: 0.5,
        movement: 'vertical', minY: H + 200, maxY: H + 480, speed: 45,
        auraColor: 0x00ff88
      },
      {
        key: 'eel_1', type: 'electric', name: 'Electric Eel',
        x: 600, y: H + 680, scale: 0.52,
        movement: 'horizontal', minX: 420, maxX: 880, speed: 60,
        auraColor: 0xffea00
      },
      // Zone 4: Abyssal Cave (Abyssal Jellies & Deep Electric Eel)
      {
        key: 'jellyfish_1', type: 'poison', name: 'Abyssal Toxic Jelly',
        x: W + 680, y: H + 260, scale: 0.5,
        movement: 'vertical', minY: H + 160, maxY: H + 420, speed: 42,
        auraColor: 0x39ff14
      },
      {
        key: 'jellyfish_2', type: 'poison', name: 'Abyssal Box Jelly',
        x: W + 1040, y: H + 520, scale: 0.5,
        movement: 'vertical', minY: H + 380, maxY: H + 680, speed: 48,
        auraColor: 0x00ff88
      },
      {
        key: 'eel_1', type: 'electric', name: 'Abyssal Electric Eel',
        x: W + 860, y: H + 760, scale: 0.52,
        movement: 'horizontal', minX: W + 680, maxX: W + 1100, speed: 70,
        auraColor: 0xffea00
      }
    ]

    hazardDefs.forEach(def => {
      const sprite = this.add.image(def.x, def.y, def.key)
        .setScale(def.scale)
        .setDepth(26)

      // Bioluminescent danger aura
      const aura = this.add.circle(def.x, def.y, 28, def.auraColor, 0.22)
        .setStrokeStyle(2, def.auraColor, 0.75)
        .setDepth(25)

      this.tweens.add({
        targets: aura,
        scaleX: 1.25,
        scaleY: 1.25,
        alpha: 0.12,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })

      this.hazardList.push({
        sprite,
        aura,
        key: def.key,
        type: def.type,
        name: def.name,
        x: def.x,
        y: def.y,
        dir: 1,
        movement: def.movement,
        minX: def.minX,
        maxX: def.maxX,
        minY: def.minY,
        maxY: def.maxY,
        speed: def.speed,
        baseScale: def.scale,
        stunTimer: 0
      })
    })
  }

  updateHazards(delta) {
    if (!this.hazardList || !this.player || !this.player.active) return
    const dt = delta / 1000

    this.hazardList.forEach(h => {
      // Stun handling
      if (h.stunTimer > 0) {
        h.stunTimer = Math.max(0, h.stunTimer - delta)
        if (h.stunTimer <= 0) {
          h.sprite.clearTint()
          h.aura.setVisible(true)
        } else {
          h.sprite.setTint(0x00ffff)
          h.aura.setVisible(false)
          return
        }
      }

      // Patrol movement
      if (h.movement === 'vertical') {
        h.y += h.dir * h.speed * dt
        if (h.y > h.maxY) {
          h.y = h.maxY
          h.dir = -1
        } else if (h.y < h.minY) {
          h.y = h.minY
          h.dir = 1
        }
        // Undulating jellyfish swimming pulse
        const pulse = 1 + 0.12 * Math.sin(this.time.now * 0.005)
        h.sprite.setScale(h.baseScale * (2 - pulse), h.baseScale * pulse)
      } else if (h.movement === 'horizontal') {
        h.x += h.dir * h.speed * dt
        if (h.x > h.maxX) {
          h.x = h.maxX
          h.dir = -1
          h.sprite.setFlipX(true)
        } else if (h.x < h.minX) {
          h.x = h.minX
          h.dir = 1
          h.sprite.setFlipX(false)
        }
        h.sprite.setAngle(Math.sin(this.time.now * 0.006) * 8)
      }

      h.sprite.setPosition(h.x, h.y)
      h.aura.setPosition(h.x, h.y)

      // Collision check with player
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, h.x, h.y)
      if (dist < 44) {
        this.triggerHazardHit(h)
      }
    })
  }

  triggerHazardHit(h) {
    if (this.reportShown || this.transitioning) return
    if (this.time.now < this.invulnerableUntil) return
    this.invulnerableUntil = this.time.now + 1600

    this.playerHP = Math.max(0, this.playerHP - 1)
    this.updateOxygenHUD()

    // Knockback
    const angle = Phaser.Math.Angle.Between(h.x, h.y, this.player.x, this.player.y)
    const pushForce = 340
    this.player.body.setVelocity(Math.cos(angle) * pushForce, Math.sin(angle) * pushForce)

    if (this.sound) {
      try {
        if (this.hazardHitAudio && this.hazardHitAudio.isPlaying) {
          this.hazardHitAudio.stop()
        }
        this.hazardHitAudio = this.sound.add('electrofied_poisoned_sound', { volume: 0.85 })
        this.hazardHitAudio.play()
      } catch (e) {
        if (this.sound.play) this.sound.play('electrofied_poisoned_sound', { volume: 0.85 })
      }
    }

    if (h.type === 'poison') {
      this.cameras.main.flash(350, 40, 200, 50)
      this.playPoisonSound()
      this.oxygen = Math.max(0, this.oxygen - 15)
      this.player.setTint(0x39ff14)
      this.showFloatingText(this.player.x, this.player.y - 35, '☣️ Toxic Sting! -1 Heart', '#39ff14')
    } else {
      this.cameras.main.flash(350, 255, 235, 60)
      this.playElectricSound()
      this.player.setTint(0xffff44)
      this.showFloatingText(this.player.x, this.player.y - 35, '⚡ Electric Shock! -1 Heart', '#ffe600')
    }

    // Invulnerability blink tween
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 110,
      yoyo: true,
      repeat: 7,
      onComplete: () => {
        if (this.player && this.player.active) {
          this.player.setAlpha(1)
          this.player.clearTint()
        }
      }
    })

    if (this.playerHP <= 0) {
      this.triggerDefeat()
    }
  }

  playPoisonSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      if (!this.poisonAudioCtx) this.poisonAudioCtx = new AudioCtx()
      if (this.poisonAudioCtx.state === 'suspended') this.poisonAudioCtx.resume()

      const ctx = this.poisonAudioCtx
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      const now = ctx.currentTime
      osc.frequency.setValueAtTime(420, now)
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.35)

      gain.gain.setValueAtTime(0.001, now)
      gain.gain.linearRampToValueAtTime(0.22, now + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.4)
    } catch (e) {}
  }

  playElectricSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      if (!this.electricAudioCtx) this.electricAudioCtx = new AudioCtx()
      if (this.electricAudioCtx.state === 'suspended') this.electricAudioCtx.resume()

      const ctx = this.electricAudioCtx
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      const now = ctx.currentTime
      osc.frequency.setValueAtTime(260, now)
      osc.frequency.linearRampToValueAtTime(580, now + 0.08)
      osc.frequency.linearRampToValueAtTime(140, now + 0.28)

      gain.gain.setValueAtTime(0.001, now)
      gain.gain.linearRampToValueAtTime(0.25, now + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.35)
    } catch (e) {}
  }
}
