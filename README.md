# 🐦 Avian: The silent Groove

A top-down 2D conservation adventure built with **Phaser.js** (frontend) and **Spring Boot** (backend).
Choose your bird, journey through three biomes — forest, frozen tundra, and the deep ocean —
rescue stolen saplings and trapped wildlife, evolve into an overpowered bird, defeat hunters,
and escape through the portal!

#Project Made by :- 

Nazifa Anjum - 230041155

Anika Tahsin Rahman - 230041160

---

## 🎮 Story

Deep in the forest, the birds lived peacefully — the saplings were their most precious treasure.
One stormy night, shadowy hunters crept through the forest and stole every last sapling,
leaving traps and caged animals in their wake.
And so the brave bird set out alone — from the forest, across the tundra, and down into the abyss.
**Find the saplings. Free the animals. Bring them home.**

---

## 🕹️ How to Play

- **WASD / Arrow Keys** — Move your bird
- **SPACE** — Attack with your current weapon (sonar pulse in Level 3)
- **E** — Interact: rescue caged / trapped animals, cut fishing nets, light campfires
- **H** — Revive a heart at a Heart Shrine (-100 score)
- **ESC** — Pause menu (resume / play again / main menu)
- **Walk over pickups** — Collect weapons, shields, and saplings automatically
- **Reach the glowing portal** — Complete the level

---

## ✅ Features Implemented

### 🎨 Frontend — Phaser.js + Vite

- **Story cutscene** — 4-panel comic intro with typewriter effect, skip button, and fade transitions
- **Character select menu** — 5 playable birds with wooden plank UI, sky background and pixel trees
- **Three handcrafted levels** — Forest of Lumina, Tundra Frontier, and Abyssal Depths
- **Camera system** — Smooth follow camera with world bounds; per-zone camera locking in Level 3
- **Bird animations** — Squash and stretch while moving, idle bob when standing still
- **Directional sprites** — Bird changes sprite based on movement direction
- **Species flashcards** — real facts about every sapling and animal you rescue
- **Conservation Report** — after every level: stats, CO₂ absorbed per year, grade S–D, species spotlight
- **Pause menu** — ESC to resume, play again, or return to main menu

#### 🐦 5 Playable Birds
| Bird | Ability |
|---|---|
| 🔥 Ember | Fire burst |
| ❄️ Frost | Freeze enemies |
| ⚡ Volt | Chain lightning |
| 🌑 Shade | Bomb blast |
| 🌿 Gale | Boomerang (double hit) |

---

### 🌱 Level 1 — Forest of Lumina

- **16 saplings from 8 real endangered tree species** — Pennantia, Bois, Wollemi, Chestnut, Dragon, Baobab, Torreya, and Monkey Puzzle; each species is tied to a collectible flashcard
- **Caged wildlife rescue** — deer and rhino species held in cages; press E to free them, each unlocks a journal fact card
- **16 patrolling hunters** with wall-aware chase AI, HP bars, hit flash, and death effects
- **Heart Shrines** hidden inside monster dens — press H to revive a heart (-100 score)
- **Emergency revive** — a fatal hit near a shrine gives you a 3-second last chance to press H
- **Shield pickup** — 10 seconds of invisibility plus stealth-kill attacks
- **Live minimap** — player, hunters, pickups, and exit portal

#### 🥚 Sapling System — 4 Types
| Sapling | Points |
|---|---|
| 🌱 Normal | +100 |
| 🔥 Fire | +200 |
| ⚡ Thunder | +300 |
| 🌟 Golden | +500 + triggers evolution |

#### 📈 Evolution System — 3 Stages
- **Stage 1** — Normal bird, standard speed and range
- **Stage 2** — Faster movement, bigger attack range (unlocked with 1 Golden Sapling)
- **Stage 3** — Overpowered, bonus heart, golden aura (unlocked with 3 Golden Saplings)

#### ⚔️ 5 Weapons — All triggered with SPACE
| Weapon | Effect |
|---|---|
| 🔫 Normal | Shockwave hits all enemies in range |
| 💣 Bomb | Huge area explosion + screen shake + 2 damage |
| ❄️ Ice | Instant freeze-kill on enemies in range |
| ⚡ Lightning | Chains between 3 closest enemies |
| 🪃 Boomerang | Hits twice — out and back |

---

### ❄️ Level 2 — Tundra Frontier

- **Warmth system** — drains constantly in the open, drains slower when sheltered beside trees and cliffs, and burns 2.5× faster during blizzards; campfires and lit hunter camps refill it; zero warmth = frostbite damage
- **Dynamic blizzard events** — warning banner, heavy snow, and a darkened screen
- **Wildlife rescue** — penguins and polar bears wander the tundra; trapped animals must be freed (hold E) before a countdown expires while a hunter closes in
- **Footprints** — follow animal tracks and hunter boot prints in the snow to discover traps and camps
- **Hidden alarm traps** — stepping on one alerts every hunter in the area
- **Abandoned hunter camps** — discover them and light the dead fire for warmth + score

---

### 🌊 Level 3 — Abyssal Depths

- **Four underwater zones** — Coral Reef, Sunken Ruins, Kelp Forest, and Abyssal Cave — connected by fade-transition tunnels
- **Oxygen system** — drains constantly, and drains faster the deeper you swim; air pockets refill it; running out blacks you out and washes you up at the nearest air pocket
- **Bioluminescent sonar pulse (SPACE)** — reveals air pockets, trapped animals, and the exit portal; stuns jellyfish and electric eels; shatters nets you're snagged in
- **Hazards** — toxic jellyfish (sting burns extra oxygen) and electric eels; both can be stunned with sonar
- **Ghost fishing nets** — one per zone holds a real animal (sea turtle, seahorse, manta ray, stingray); hold E to cut it free and learn a bycatch fact
- **Combined zone minimap** — always shows which room you're in and where the exit portal sits

---

### ☕ Backend — Spring Boot + H2 Database

- REST API for player and score management
- Player profile saved on game start (name + chosen bird)
- Score saved after every level (score, saplings saved, time taken)
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

- 👹 Boss monster — unique enemy with special attack pattern
- 📊 In-game leaderboard screen
- 💾 Persistent scores with MySQL

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Game Engine | Phaser 3 |
| Build Tool | Vite |
| Backend | Spring Boot |
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

## 📸 Video Demonstration link
https://drive.google.com/file/d/1mRyLTxhnfxos527GFmwAGt1-eqsBBkKX/view

---

> Built as a Visual Programming course project — 2nd year Computer Science
