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

    // Zone 4 (cave, the darker zone with the exit portal) wildlife
    const pack3Cave = ['urchin_1', 'stingray_2', 'jellyfish_1', 'squid_2']
    pack3Cave.forEach(name => this.load.image(name, `resource/level3/Pack3/${name}.png`))

    // Zone 3 (kelp, the remaining zone) wildlife
    const pack3Kelp = ['blowfish_1', 'eel_1', 'manta_ray_1', 'fish_school_2', 'starfish_1']
    pack3Kelp.forEach(name => this.load.image(name, `resource/level3/Pack3/${name}.png`))
  }

  init(data) {
    this.playerName = data?.playerName || 'Adventurer'
    this.chosenBird = data?.chosenBird || 'Ember'
    this.score = data?.score || 0
    this.facing = 1
    this.setupFailed = false

    // wildlife journal — same pattern as GameScene2
    this.wildlifeJournal = data?.wildlifeJournal || []

    // 🫧 Oxygen system — same shape as Level 2's warmth: drains over
    // time, refills near a source (air pockets instead of campfires),
    // and drains faster the deeper you are — real diving logic, not
    // just a flat timer.
    this.oxygen = 100
    this.maxOxygen = 100
    this.playerHP = 3
    this.maxHP = 3
    this.lastDrowningTick = 0
    this.nearAirPocket = false
    this.OXYGEN_BASE_DRAIN_PER_SEC = 1.8
    this.OXYGEN_DEPTH_DRAIN_BONUS = 1.6
    this.OXYGEN_REGEN_PER_SEC = 16

    // 🕸️ Net hazard — brushing an uncut net snags you briefly
    this.snareTimer = 0
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
      // reef <-> ruins (shared vertical edge, x = 1600)
      // reef trigger spans x:1520-1600 · ruins trigger spans x:1600-1680
      { fromZone: 'reef',  trigger: { x: 1560, y: 450, w: 80, h: 220 }, toZone: 'ruins', entry: { x: 1800, y: 450 }, orientation: 'vertical' },
      { fromZone: 'ruins', trigger: { x: 1640, y: 450, w: 80, h: 220 }, toZone: 'reef',  entry: { x: 1400, y: 450 }, orientation: 'vertical' },

      // reef <-> kelp (shared horizontal edge, y = 900)
      // reef trigger spans y:820-900 · kelp trigger spans y:900-980
      { fromZone: 'reef', trigger: { x: 800, y: 860, w: 220, h: 80 }, toZone: 'kelp', entry: { x: 800, y: 1100 }, orientation: 'horizontal' },
      { fromZone: 'kelp', trigger: { x: 800, y: 940, w: 220, h: 80 }, toZone: 'reef', entry: { x: 800, y: 700 }, orientation: 'horizontal' },

      // ruins <-> cave (shared horizontal edge, y = 900, right half)
      { fromZone: 'ruins', trigger: { x: 2400, y: 860, w: 220, h: 80 }, toZone: 'cave',  entry: { x: 2400, y: 1100 }, orientation: 'horizontal' },
      { fromZone: 'cave',  trigger: { x: 2400, y: 940, w: 220, h: 80 }, toZone: 'ruins', entry: { x: 2400, y: 700 }, orientation: 'horizontal' },

      // kelp <-> cave (shared vertical edge, x = 1600, bottom half)
      { fromZone: 'kelp', trigger: { x: 1560, y: 1350, w: 80, h: 220 }, toZone: 'cave', entry: { x: 1800, y: 1350 }, orientation: 'vertical' },
      { fromZone: 'cave', trigger: { x: 1640, y: 1350, w: 80, h: 220 }, toZone: 'kelp', entry: { x: 1400, y: 1350 }, orientation: 'vertical' },
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
    if (this.transitioning) return
    this.transitioning = true
    this.player.body.setVelocity(0, 0)
    this.player.body.enable = false

    this.cameras.main.fadeOut(350, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.currentZone = toZone
      this.player.setPosition(ex, ey)
      this.applyZoneBounds(toZone)
      this.cameras.main.centerOn(ex, ey)
      this.tunnelCooldownUntil = this.time.now + 800

      this.cameras.main.fadeIn(350, 0, 0, 0)
      this.cameras.main.once('camerafadeincomplete', () => {
        this.player.body.enable = true
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
    // Bottom of the cave zone, clear of the cave's platforms
    // (which sit around y = H+500 to H+640) and away from both
    // tunnel entries into this zone.
    const x = 1600 + 800
    const y = 900 + 750

    const g = this.add.graphics().setDepth(6)
    g.fillStyle(0x66ffcc, 0.22); g.fillCircle(0, 0, 60)
    g.fillStyle(0xaaffee, 0.45); g.fillCircle(0, 0, 38)
    g.fillStyle(0xffffff, 0.9); g.fillCircle(0, 0, 14)
    g.lineStyle(3, 0xffffff, 0.6)
    for (let i = 0; i < 3; i++) g.strokeCircle(0, 0, 20 + i * 14)
    g.setPosition(x, y)

    this.tweens.add({ targets: g, angle: 360, duration: 7000, repeat: -1, ease: 'Linear' })
    this.tweens.add({ targets: g, scaleX: 1.08, scaleY: 1.08, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })

    this.add.text(x, y - 90, '✨ Portal', {
      fontSize: '14px', fontFamily: 'Arial Black', color: '#aaffee',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(6)

    this.exitPortal = { x, y, radius: 60 }
  }

  checkExitPortal() {
    if (this.transitioning || this.currentZone !== 'cave') return
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
    if (this.transitioning) return
    this.transitioning = true
    this.player.body.setVelocity(0, 0)
    this.player.body.enable = false

    this.cameras.main.fadeOut(600, 255, 255, 255)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      const { width, height } = this.scale
      this.add.rectangle(width / 2, height / 2, width, height, 0x001a12, 1).setScrollFactor(0).setDepth(999)
      this.add.text(width / 2, height / 2 - 10, '🌊 You escaped the depths!', {
        fontSize: '22px', fontFamily: 'Arial Black', color: '#aaffee'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(1000)
      this.add.text(width / 2, height / 2 + 26, 'Level 3 — Stage 1 complete', {
        fontSize: '13px', fontFamily: 'Arial', color: '#dddddd'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(1000)

      // Hold on the banner briefly, then hand off to the main menu —
      // same data shape the rest of this project passes between scenes.
      this.time.delayedCall(2200, () => {
        this.scene.start('MenuScene', {
          playerName: this.playerName,
          chosenBird: this.chosenBird,
          score: this.score
        })
      })
    })
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
      // coral
      [120, 780, 'coral_1', 1.0],
      [1400, 200, 'coral_2', 0.9],
      [80, 150, 'coral_cluster', 1.1],

      // kelp
      [200, 300, 'kelp_1', 1.0],
      [1300, 700, 'kelp_2', 0.9],
      [60, 500, 'kelp_cluster', 1.1],

      // rocks
      [500, 780, 'rock_1', 1.0],
      [1200, 780, 'rock_2', 1.0],
      [1420, 480, 'rock_cluster', 1.05],

      // small plant
      [750, 200, 'seaweed_1', 0.9],
    ]

    objects.forEach(([x, y, key, scale]) => {
      this.add.image(x, y, key).setScale(scale).setDepth(12)
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
      const sprite = this.add.image(p.x, p.y, p.key)
        .setScale(scaleByKey[p.key] || 0.5)
        .setDepth(25)

      const shadow = this.add.ellipse(p.x, p.y + 24, 40, 14, 0x000000, 0.22).setDepth(24)

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
        collected: this.wildlifeJournal.includes(p.species)
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
      { x: 300, y: 250, key: 'crab_1', species: 'Reef Crab', fact: 'Sidesteps quickly across the sea floor to escape danger.' },
      { x: 1250, y: 300, key: 'dolphin_2', species: 'Bottlenose Dolphin', fact: 'Uses echolocation clicks to find fish hidden in the coral.' },
      { x: 600, y: 150, key: 'fish_1', species: 'Reef Fish', fact: 'Sticks close to the coral it calls home its whole life.' },
      { x: 950, y: 350, key: 'fish_2', species: 'Blue Tang', fact: 'Can shift the shade of its blue to signal mood to others.' },
      { x: 400, y: 550, key: 'fish_3', species: 'Butterflyfish', fact: 'Mates for life and is almost always seen swimming in pairs.' },
      { x: 1100, y: 550, key: 'fish_school_1', species: 'Sardine School', fact: 'Swims in massive schools to confuse and overwhelm predators.' },
      { x: 700, y: 700, key: 'turtle_1', species: 'Green Sea Turtle', fact: 'Can hold its breath underwater for several hours while resting.' },
      { x: 1350, y: 150, key: 'whale_1', species: 'Humpback Whale', fact: 'Sings long, complex songs that can travel for miles underwater.' },
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
      { x: W + 150, y: 200, key: 'fish_4', species: 'Regal Fish', fact: 'Drifts through half-sunken columns looking for hidden crevices.' },
      { x: W + 1450, y: 250, key: 'fish_5', species: 'Emerald Fish', fact: 'Its shimmering scales help it blend into shafts of light.' },
      { x: W + 500, y: 700, key: 'fish_school_3', species: 'Copper School', fact: 'Moves as one to make it harder for predators to single one out.' },
      { x: W + 1300, y: 300, key: 'fish_school_4', species: 'Violet School', fact: 'Prefers the shadows cast by old stone archways.' },
      { x: W + 350, y: 750, key: 'seahorse_1', species: 'Ruins Seahorse', fact: 'Anchors itself to coral or stone with its curled tail.' },
      { x: W + 950, y: 200, key: 'turtle_2', species: 'Loggerhead Turtle', fact: 'Has one of the most powerful bites of any sea turtle.' },
    ]

    this.spawnWildlifeGroup('ruins', scaleByKey, positions)
  }

  // ================================================================
  // ZONE 3 (KELP) — the remaining zone, mixed leftover wildlife
  // ================================================================

  spawnKelpWildlife() {
    const scaleByKey = {
      blowfish_1: 0.45, eel_1: 0.5, manta_ray_1: 0.65,
      fish_school_2: 0.55, starfish_1: 0.35, turtle_1: 0.55
    }

    const H = 900

    const positions = [
      { x: 250, y: H + 250, key: 'blowfish_1', species: 'Pufferfish', fact: 'Inflates into a spiky ball when it feels threatened.' },
      { x: 1300, y: H + 300, key: 'eel_1', species: 'Moray Eel', fact: 'Hides in kelp and rocky crevices, mouth agape to breathe.' },
      { x: 700, y: H + 150, key: 'manta_ray_1', species: 'Manta Ray', fact: 'Glides through open water by flapping wing-like fins.' },
      { x: 1100, y: H + 750, key: 'fish_school_2', species: 'Golden School', fact: 'Weaves between kelp stalks to stay hidden from predators.' },
      { x: 450, y: H + 800, key: 'starfish_1', species: 'Sea Star', fact: 'Can regrow an entire lost arm over several months.' },
      { x: 900, y: H + 850, key: 'turtle_1', species: 'Green Sea Turtle', fact: 'Often grazes on the kelp itself as part of its diet.' },
    ]

    this.spawnWildlifeGroup('kelp', scaleByKey, positions)
  }

  // ================================================================
  // ZONE 4 (CAVE) — the darkest zone, where the exit portal is
  // ================================================================

  spawnCaveWildlife() {
    const scaleByKey = {
      urchin_1: 0.4, stingray_2: 0.6, jellyfish_1: 0.5, squid_2: 0.5
    }

    const W = 1600
    const H = 900

    const positions = [
      { x: W + 150, y: H + 150, key: 'urchin_1', species: 'Sea Urchin', fact: 'Its spines deter almost every predator in the cave.' },
      { x: W + 450, y: H + 100, key: 'stingray_2', species: 'Stingray', fact: 'Glides just above the cave floor, half-buried in silt.' },
      { x: W + 1050, y: H + 150, key: 'jellyfish_1', species: 'Cave Jellyfish', fact: 'Pulses gently, drifting wherever the current carries it.' },
      { x: W + 1450, y: H + 300, key: 'squid_2', species: 'Deep Squid', fact: 'Can shoot a cloud of ink to vanish from danger in an instant.' },
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
        if (w.wanderTimer > 90) {
          w.wanderTimer = 0
          const zone = this.ZONES[w.zoneKey] || this.ZONES.reef
          w.targetX = Phaser.Math.Clamp(
            w.spawnX + Phaser.Math.Between(-220, 220),
            zone.x + margin, zone.x + zone.w - margin
          )
          w.targetY = Phaser.Math.Clamp(
            w.spawnY + Phaser.Math.Between(-160, 160),
            zone.y + margin, zone.y + zone.h - margin
          )
          w.moving = true
        }
      }

      if (w.moving) {
        const speed = 0.6
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
      w.shadow.setPosition(w.x, w.y + 24)
    })
  }

  showWildlifeCard(species, fact) {
    const { width, height } = this.scale

    const card = this.add.graphics().setScrollFactor(0).setDepth(400)
    card.fillStyle(0x0a1420, 0.97)
    card.fillRoundedRect(width / 2 - 180, height / 2 - 90, 360, 180, 16)
    card.lineStyle(3, 0x00ffcc, 1)
    card.strokeRoundedRect(width / 2 - 180, height / 2 - 90, 360, 180, 16)

    const title = this.add.text(width / 2, height / 2 - 60, '🐠 SPECIES COLLECTED!', {
      fontSize: '15px', fontFamily: 'Arial Black', color: '#00ffcc'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(401)

    const name = this.add.text(width / 2, height / 2 - 30, species, {
      fontSize: '18px', fontFamily: 'Arial Black', color: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(401)

    const factText = this.add.text(width / 2, height / 2 + 10, fact, {
      fontSize: '11px', fontFamily: 'Arial', color: '#aaccdd',
      wordWrap: { width: 320 }, align: 'center'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(401)

    const count = this.wildlifeJournal.length
    const total = this.totalWildlifeSpecies || 8
    const counter = this.add.text(width / 2, height / 2 + 60, `Journal: ${count} / ${total} species`, {
      fontSize: '11px', fontFamily: 'Arial Black', color: '#00d4ff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(401)

    const elements = [card, title, name, factText, counter]
    elements.forEach(el => el.setAlpha(0))

    this.tweens.add({ targets: elements, alpha: 1, duration: 250 })
    this.time.delayedCall(2600, () => {
      this.tweens.add({
        targets: elements, alpha: 0, duration: 300,
        onComplete: () => elements.forEach(el => el.destroy())
      })
    })
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
    const nx = 1000
    const ny = 220

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
      W + 1000, 420, 120, 95, 'seahorse_1',
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
      950, H + 300, 130, 100, 'manta_ray_1',
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
      W + 800, H + 300, 120, 95, 'stingray_2',
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
      { x: 500, y: 80 },          // reef, near the surface
      { x: W + 1400, y: 80 },     // ruins, near the surface
      { x: 300, y: H + 80 },      // kelp
      { x: W + 1500, y: H + 80 }, // cave
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

    this.updateOxygenHUD()
  }

  updateOxygenHUD() {
    if (!this.oxygenBarFill) return
    const pct = Phaser.Math.Clamp(this.oxygen / this.maxOxygen, 0, 1)

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
        this.handleBlackout()
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

    const addPlatform = (x, y, w, h) => {
      const g = this.add.graphics().setDepth(10)
      g.fillStyle(0x2f5c4f, 1)
      g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8)
      g.fillStyle(0x5aa98e, 1)
      g.fillRoundedRect(x - w / 2, y - h / 2, w, 6, 6)

      const zone = this.add.zone(x, y, w, h)
      this.physics.add.existing(zone, true)
      this.platforms.add(zone)
    }

    const W = this.zoneWidth
    const H = this.zoneHeight

    // reef (top-left)
    addPlatform(220, 640, 220, 30)
    addPlatform(560, 520, 180, 26)
    addPlatform(900, 660, 240, 30)

    // ruins (top-right)
    addPlatform(W + 300, 600, 220, 28)
    addPlatform(W + 700, 500, 200, 26)
    addPlatform(W + 1150, 660, 260, 30)

    // kelp forest (bottom-left)
    addPlatform(300, H + 560, 200, 26)
    addPlatform(700, H + 460, 220, 28)
    addPlatform(1150, H + 600, 200, 26)

    // deep cave (bottom-right)
    addPlatform(W + 250, H + 600, 220, 28)
    addPlatform(W + 650, H + 500, 200, 26)
    addPlatform(W + 1100, H + 640, 240, 30)
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
    const startX = this.zoneWidth / 2
    const startY = this.zoneHeight / 2
    const textureKey = this.buildDiverTexture()

    this.player = this.physics.add.sprite(startX, startY, textureKey)
    this.player.setDepth(30)
    this.player.body.setCircle(18, 14, 14)
    this.player.body.setCollideWorldBounds(true)
    this.player.body.setMaxVelocity(240, 260)
  }

  // ================================================================
  // UPDATE
  // ================================================================

  update() {
    if (this.setupFailed || !this.player || !this.player.body) return
    if (this.transitioning) return

    const delta = this.game.loop.delta

    this.checkTunnels()
    this.checkExitPortal()
    if (this.transitioning) return

    this.updateWildlife()
    this.updateNets()
    this.updateMiniMap()
    this.updateOxygen(delta)

    const movedInput =
      this.wasd.left.isDown || this.wasd.right.isDown || this.wasd.up.isDown || this.wasd.down.isDown ||
      this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown || this.cursors.down.isDown
    this.updateSnare(delta, movedInput)

    // 🕸️ Snagged in a net: still movable, just badly slowed — not a
    // hard freeze, so "wriggling free" (mashing movement) feels active
    const snareFactor = this.snareTimer > 0 ? 0.3 : 1

    const horizontalSpeed = 200 * snareFactor
    const swimThrust = 640 * snareFactor
    const diveAssist = 360 * snareFactor
    const maxRiseSpeed = 220

    let vx = 0

    if (this.wasd.left.isDown || this.cursors.left.isDown) {
      vx = -horizontalSpeed
      this.facing = -1
    } else if (this.wasd.right.isDown || this.cursors.right.isDown) {
      vx = horizontalSpeed
      this.facing = 1
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
    } else if (this.wasd.down.isDown || this.cursors.down.isDown) {
      this.player.body.setAccelerationY(diveAssist)
    } else {
      this.player.body.setAccelerationY(0)
    }

    if (this.player.body.velocity.y < -maxRiseSpeed) {
      this.player.body.setVelocityY(-maxRiseSpeed)
    }

    this.player.setFlipX(this.facing < 0)

    const vy = this.player.body.velocity.y
    const targetTilt = Phaser.Math.Clamp(vy / 260, -1, 1) * 0.22
    this.player.rotation = Phaser.Math.Linear(this.player.rotation, targetTilt, 0.12)
  }
}
