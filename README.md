# 🐦 Bird Adventure

A top-down 2D adventure game built with **Phaser.js** (frontend) and **Spring Boot** (backend). Choose your bird, explore a dense forest world, collect eggs, evolve into an overpowered bird, defeat monsters, and escape through the portal!

---

## 🎮 Gameplay

- Navigate through a dense forest map using **WASD** keys
- **Collect eggs** scattered across the world to earn points and evolve
- **Fight monsters** using SPACE — they patrol the map and chase you when nearby
- **Pick up weapons** on the map to upgrade your attack
- **Evolve your bird** by collecting Golden Eggs — unlock new abilities and bonus hearts
- **Reach the glowing portal** to escape and complete the level
- Your score is saved to a live backend database

---

## ✅ Features Implemented

### 🎨 Frontend — Phaser.js + Vite
- Top-down tile-based world with real pixel art sprites (grass, trees, sand paths, water)
- Dense forest map — only sand paths are walkable, trees block movement
- Camera that follows the player smoothly across the world
- **5 playable birds** to choose from on the menu screen:
  - 🔥 Ember — Fire burst
  - ❄️ Frost — Freeze enemies
  - ⚡ Volt — Chain lightning
  - 🌑 Shade — Shadow dash
  - 🌿 Gale — Wind force
- **Bird animations** — squash and stretch while moving, idle bob when standing still
- **Egg system** — 4 egg types with unique effects:
  - 🥚 Normal Egg — +100 points
  - 🔥 Fire Egg — +200 points
  - ⚡ Thunder Egg — +300 points
  - 🌟 Golden Egg — +500 points + triggers evolution
- **Evolution system** — 3 stages unlocked by Golden Eggs:
  - Stage 1 — Normal bird
  - Stage 2 — Faster movement + double attack range
  - Stage 3 — Overpowered + bonus heart + golden aura
- **5 weapons** picked up on the map, all triggered with SPACE:
  - 🔫 Normal — Shockwave hits all enemies in range
  - 💣 Bomb — Huge explosion, area damage, screen shake
  - ❄️ Ice — Freezes all enemies in range for 3 seconds
  - ⚡ Lightning — Chains between 3 closest enemies
  - 🪃 Boomerang — Hits twice, out and back
- **Monster AI** — patrol mode + chase mode when player is nearby
  - ❗ alert indicator when chasing
  - Wall-aware pathfinding
  - HP bars above each monster
  - Death particle burst on kill
- **HP hearts system** — bird has 3 hearts (4 at stage 3)
  - Screen shake on damage
  - Hearts flash when at 1 HP
  - Game over when hearts reach 0
- **Live minimap** in bottom left corner showing:
  - Full world layout
  - Player position with direction indicator
  - Monster positions (red = chasing, dark = patrolling)
  - Egg and weapon locations
  - Portal location
  - Camera viewport indicator
- **HUD** — score, eggs, evolution stage, timer, current weapon, hearts, golden egg progress bar
- Exit portal with rotating animation — complete the level by reaching it

### ☕ Backend — Spring Boot + H2 Database
- REST API with full CRUD for players and scores
- Player profile saved on game start (name + chosen bird)
- Score saved after every level (score, eggs saved, time taken)
- Top 10 leaderboard endpoint
- Evolution stage tracking per player
- H2 in-memory database (no setup required)
- CORS enabled for frontend communication

---

## 🚧 Features Coming Soon

- 🏆 **Win / Lose screen** — proper end game screen with score breakdown and play again button
- ❤️ **Sound effects** — egg collect, attack, monster death, portal hum, background music
- 🗺️ **Level 2** — new map with different theme (Volcano / Cave), faster and stronger monsters
- 👹 **Boss monster** — unique enemy at end of each level with special attack pattern
- 🌍 **Multiple worlds** — Forest → Volcano → Storm Sky
- 💾 **Persistent leaderboard screen** — view top scores in game
- 🎯 **More egg types** — cursed egg (risk/reward), mystery egg
- 🔊 **Music** — ambient forest soundtrack per world
- 📱 **Mobile support** — touch controls for mobile browsers

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Game Engine | Phaser.js v4 |
| Build Tool | Vite |
| Backend | Spring Boot 4 |
| Database | H2 (in-memory) |
| Language | JavaScript (frontend) + Java (backend) |

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
Backend runs on `http://localhost:8080`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Game runs on `http://localhost:5173`

---

## 📸 Screenshots

*Coming soon*

---

> Built as a Visual Programming course project — 2nd year Computer Science
