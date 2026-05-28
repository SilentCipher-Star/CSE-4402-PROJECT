# 🐦 Bird Adventure

A top-down 2D adventure game built with **Phaser.js** (frontend) and **Spring Boot** (backend).
Choose your bird, explore a dense forest world, collect eggs, evolve into an overpowered bird,
defeat monsters with unique weapons, and escape through the portal!

---

## 🎮 Story

Deep in the forest, the birds lived peacefully — their eggs were their most precious treasure.
One stormy night, shadowy monsters crept through the forest and stole every last egg.
But the monsters were careless. They left behind broken shells, footprints, and glowing feathers.
And so the brave bird set out alone into the deep dark forest.
**Find the eggs. Defeat the monsters. Bring them home.**

---

## 🕹️ How to Play

- **WASD** — Move your bird through the forest
- **SPACE** — Attack with your current weapon
- **Walk over weapons** — Pick them up automatically
- **Collect eggs** — Earn points and evolve your bird
- **Reach the glowing portal** — Escape to complete the level
- **Avoid monsters** — They patrol and chase you on sight

---

## ✅ Features Implemented

### 🎨 Frontend — Phaser.js + Vite

- **Story cutscene** — 4-panel comic intro with typewriter effect, skip button, and fade transitions
- **Character select menu** — 5 playable birds with wooden plank UI, sky background and pixel trees
- **Top-down tile world** — Dense forest map with real pixel art sprites (grass, trees, sand paths)
- **Camera system** — Smooth follow camera with world bounds
- **Massive explorable map** — 50×80 tile world, only sand paths are walkable
- **Bird animations** — Squash and stretch while moving, idle bob when standing still
- **Directional sprites** — Bird changes sprite based on movement direction

#### 🐦 5 Playable Birds
| Bird | Ability |
|---|---|
| 🔥 Ember | Fire burst |
| ❄️ Frost | Freeze enemies |
| ⚡ Volt | Chain lightning |
| 🌑 Shade | Shadow dash |
| 🌿 Gale | Wind force |

#### 🥚 Egg System — 4 Types
| Egg | Points |
|---|---|
| 🥚 Normal | +100 |
| 🔥 Fire Egg | +200 |
| ⚡ Thunder Egg | +300 |
| 🌟 Golden Egg | +500 + triggers evolution |

#### 📈 Evolution System — 3 Stages
- **Stage 1** — Normal bird, standard speed and range
- **Stage 2** — Faster movement, bigger attack range (unlocked with 1 Golden Egg)
- **Stage 3** — Overpowered, bonus heart, golden aura (unlocked with 3 Golden Eggs)

#### ⚔️ 5 Weapons — All triggered with SPACE
| Weapon | Effect |
|---|---|
| 🔫 Normal | Shockwave hits all enemies in range |
| 💣 Bomb | Huge area explosion + screen shake + 2 damage |
| ❄️ Ice | Freezes all enemies in range for 3 seconds |
| ⚡ Lightning | Chains between 3 closest enemies |
| 🪃 Boomerang | Hits twice — out and back |

#### 👹 Monster AI
- Patrol mode when player is out of range
- Chase mode with ❗ alert when player is detected
- Wall-aware movement
- HP bars above each monster
- Hit flash on damage
- Death particle burst on kill
- Damage player on contact — triggers screen shake and HP loss

#### ❤️ HP Hearts System
- Bird starts with 3 hearts (4 hearts at Stage 3)
- Lose 1 heart per monster contact
- Hearts flash rapidly when at 1 HP
- Screen shake on every hit
- Game over when hearts reach 0

#### 🗺️ Live Minimap
- Bottom left corner — always visible
- Shows full world layout with tile colours
- White dot = player position with direction indicator
- Red dots = monsters (bright red when chasing)
- Coloured dots = eggs and weapon pickups
- Purple dot = exit portal
- White rectangle = current camera viewport

#### 🖥️ HUD
- Score, egg count, evolution stage
- Countdown timer (turns red at 30s)
- Current weapon display
- Hearts display
- Golden egg progress bar

### ☕ Backend — Spring Boot + H2 Database

- REST API for player and score management
- Player profile saved on game start (name + chosen bird)
- Score saved after every level (score, eggs saved, time taken)
- Top 10 leaderboard endpoint
- Evolution stage tracking per player
- H2 in-memory database — no setup required
- CORS enabled for frontend communication

#### API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/player/create` | Register player |
| GET | `/api/player/{id}` | Get player data |
| PUT | `/api/player/{id}/evolve` | Update evolution stage |
| POST | `/api/score/save` | Save level score |
| GET | `/api/leaderboard` | Top 10 scores |

---

## 🚧 Coming Soon

- 🏆 Win / Lose screen with score breakdown and play again
- 🔊 Sound effects — egg collect, attack, monster death, portal hum, music
- 🗺️ Level 2 — new map (Volcano / Cave theme), faster monsters
- 👹 Boss monster — unique enemy with special attack pattern
- 🌍 Multiple worlds — Forest → Volcano → Storm Sky
- 📊 In-game leaderboard screen
- 💾 Persistent scores with MySQL

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Game Engine | Phaser.js v4 |
| Build Tool | Vite |
| Backend | Spring Boot 4 |
| Database | H2 (in-memory) |
| Frontend Language | JavaScript |
| Backend Language | Java 21 |

---

## 🚀 How to Run

### Prerequisites
- Java 21+
- Node.js 20.19+

### Backend
```bash
cd backend
./mvnw spring-boot:run
```
Runs on `http://localhost:8080`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`

---

## 📸 Screenshots
*Coming soon*

---

> Built as a Visual Programming course project — 2nd year Computer Science
