# Empire Builder 3D | Web RTS Game Engine

An interactive, optimized, and fully featured 3D Real-Time Strategy (RTS) game engine running natively in the browser. Inspired by classic games like *Age of Empires*, it supports up to 1000 units on screen smoothly.

## 🚀 Key Features

- **4 Age Progression System**: Dark Age, Feudal Age, Castle Age, and Imperial Age, featuring visual and stat upgrades for buildings and units.
- **17 Factions / Civilizations**: Each kingdom comes with tailored stat bonuses, training rates, gather speeds, building HP scaling, and unique modifiers (e.g., Saracens trade bonus, Byzantine HP boost).
- **Advanced State Machines**:
  - **Priests**: Automated healing scan + target conversions ("Wololo...").
  - **Traders**: Automated physically-looping trade routes between Markets/Town Centers.
- **Natural Map Variations**: Procedurally generated terrains including River Valley, Islands (with bridges), Coastal cliffs, and desert Oasis.
- **Lightweight Custom Water Shader**: Custom cyan-foam low-poly cold water animations.
- **Spatial Hashing Optimization**: Upgraded neighbor lookup grid ($O(N)$ efficiency) supporting large battle scalability without device overheating.
- **Simulated Collaborative Multiplayer**: Virtual matchmaking lobby, in-game chat commands parser, and reactive voice chat wave visualizers.
- **Mobile-Friendly Controls**: Virtual joysticks, camera rotation/zoom controls, and touch tap-gestures.

## 🛠️ Tech Stack

- **Core**: HTML5, Vanilla CSS3 (Glassmorphism design system)
- **3D Graphics Engine**: Three.js / WebGL
- **Build Tool**: Vite

## 📥 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Locally**:
   ```bash
   npm run dev
   ```

3. **Production Build**:
   ```bash
   npm run build
   ```
