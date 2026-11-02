# Break Out

A 2D stealth infiltration platformer built with **Phaser 3** and **Vite**. Navigate multi-level sectors, climb ladder networks, evade patrolling AI guards, collect mission stars, and reach the extraction flag to escape.

---

## How to Play

### Controls
| Action | Primary Key | Alternate Key |
|---|---|---|
| **Move Left** | `A` | `Left Arrow` |
| **Move Right** | `D` | `Right Arrow` |
| **Jump** | `Space` | `W` / `Up Arrow` |
| **Climb Up** | `W` | `Up Arrow` |
| **Climb Down** | `S` | `Down Arrow` |
| **Level Menu / Back** | `ESC` | — |
| **Quick Level Select** | `1` – `5` (on level menu) | — |

### Objectives
1. **Infiltrate the Sector**: Enter the sector and navigate corridor networks and ladder shafts.
2. **Collect Stars (★)**: Gather all mission stars scattered across each level for complete sector clearance.
3. **Avoid Patrol Guards**: Each level features an autonomous guard with pathfinding and climbing capabilities. Jump over guards or take alternate routes to prevent capture (`BUSTED!`).
4. **Beware of Hazards**: Steer clear of sharp thorn patches located on floors and platforms (`TRAPPED!`).
5. **Secure the Flag**: Reach the extraction point flag to complete the mission and unlock the next sector.

---

## Sectors

| Sector | Name | Map | Enemy Unit | Difficulty |
|---|---|---|---|---|
| **Level 1** | Corridor Escape | `map.tmj` | Enemy 1 (Patrol Infiltrator) | Normal |
| **Level 2** | Underground Vault | `map2.tmj` | Enemy 2 (Vault Enforcer) | Hard |
| **Level 3** | Rooftop Run | `map3.tmj` | Enemy 3 (High-Alert Scout) | Expert |
| **Level 4** | Shadow Fortress | `map4.tmj` | Enemy 4 (Fortress Sentinel) | Master |
| **Level 5** | Final Breakout | `map.tmj` | Classified | Insane *(Coming Soon)* |

---

## Features

- **Dynamic Waypoint AI**: Enemies employ Dijkstra graph pathfinding, corridor tracking, vertical shaft climbing, and direct chase behaviors.
- **Audio & Sound System**: Custom audio manager with persistent volume controls in the Options panel:
  - Background OST (Main Menu & Level Select)
  - Gameplay OST (Active infiltration)
  - SFX for button clicks, powerup star collections, victory flag capture, and game over.
- **Hazard System**: Animated thorn traps with dedicated game over screens distinguishing between hazard deaths and guard captures.
- **Minimalist Cyber UI**: Solid drop shadows, high-contrast HUD, interactive Options settings panel, animated bubble tooltips, and responsive modals.

---

## Development

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- npm or pnpm

### Getting Started
```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

