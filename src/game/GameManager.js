import * as THREE from 'three';
import { Renderer } from '../engine/Renderer';
import { Input } from '../engine/Input';
import { Terrain } from '../engine/Terrain';
import { EntityManager } from './EntityManager';
import { ModelFactory, CIVILIZATIONS } from './ModelFactory';
import { SoundManager } from './SoundManager';
import { SVGIcons } from '../ui/SVGIcons';
import { EnemyAI } from './EnemyAI';
import { AllyAI } from './AllyAI';
import { NeutralAI } from './NeutralAI';
import { HUD } from '../ui/HUD';
import { ResourceNode } from './ResourceNode';

export class GameManager {
  constructor() {
    this.renderer = null;
    this.input = null;
    this.terrain = null;
    this.entityManager = null;
    this.modelFactory = null;
    this.soundManager = null;
    this.enemyAI = null;
    this.allyAI = null;
    this.neutralAI = null;
    this.hud = null;

    // Lobby Configurations
    this.selectedCiv = 'inggris';
    this.selectedMap = 'river';
    this.gameMode = 'multi';
    this.graphicsQuality = 'high';
    this.startingResourcesOption = 'standard';
    this.maxPopulationCap = 100;
    this.aiDifficulty = 'normal';
    this.gameSpeedMultiplier = 1.0;

    // Game stats & Player states (4 Factions: 0: Player, 1: Enemy, 2: Ally, 3: Neutral)
    this.players = {
      0: { // Player
        resources: { wood: 200, food: 150, gold: 100, stone: 50 },
        population: 0,
        populationLimit: 10,
        age: 'dark',
        civ: 'inggris',
        upgrades: { attack: 0, armor: 0, arrow: 0 }
      },
      1: { // Enemy (Red AI)
        resources: { wood: 1000, food: 1000, gold: 1000, stone: 1000 },
        population: 0,
        populationLimit: 100,
        age: 'dark',
        civ: 'mongol',
        upgrades: { attack: 0, armor: 0, arrow: 0 }
      },
      2: { // Ally (Green AI)
        resources: { wood: 400, food: 400, gold: 200, stone: 100 },
        population: 0,
        populationLimit: 20,
        age: 'dark',
        civ: 'jepang',
        upgrades: { attack: 0, armor: 0, arrow: 0 }
      },
      3: { // Neutral (Grey)
        resources: { wood: 500, food: 500, gold: 500, stone: 500 },
        population: 0,
        populationLimit: 50,
        age: 'dark',
        civ: 'bizantium',
        upgrades: { attack: 0, armor: 0, arrow: 0 }
      }
    };

    // Selection
    this.selectedEntities = [];

    // Grid collision map (x,z key -> true/false/type)
    this.gridMap = {};
    
    // Formation system
    this.currentFormation = 'box'; // 'box', 'line', 'column', 'spread'
    
    // Time tracking
    this.clock = new THREE.Clock();
    this.gameActive = false; // Set to true after lobby start
  }

  start() {
    // 1. Initialise Utilities
    this.modelFactory = new ModelFactory();
    this.soundManager = new SoundManager();

    // 2. Setup Lobby Event Listeners
    const selectCiv = document.getElementById('select-civ');
    const selectMap = document.getElementById('select-map');
    const selectMode = document.getElementById('select-mode');
    const selectGraphics = document.getElementById('select-graphics');
    const btnLaunch = document.getElementById('btn-launch');

    if (selectCiv) {
      selectCiv.addEventListener('change', (e) => {
        this.updateCivDetails(e.target.value);
        // Sync badge
        const badge = document.getElementById('slot-self-civ');
        if (badge) {
          badge.textContent = CIVILIZATIONS[e.target.value].name;
        }
        // Update encyclopedia
        this.updateEncyclopedia(e.target.value);
      });
      // Initial trigger
      this.updateCivDetails(selectCiv.value);
      this.updateEncyclopedia(selectCiv.value);
    }

    if (selectMode) {
      selectMode.addEventListener('change', (e) => {
        const multiPanel = document.getElementById('lobby-multiplayer-panel');
        if (multiPanel) {
          multiPanel.style.display = e.target.value === 'multi' ? 'block' : 'none';
        }
      });
      // Run initial check
      const multiPanel = document.getElementById('lobby-multiplayer-panel');
      if (multiPanel) {
        multiPanel.style.display = selectMode.value === 'multi' ? 'block' : 'none';
      }
    }

    // Setup Tab Buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const tabId = btn.getAttribute('data-tab');
        const targetContent = document.getElementById(tabId);
        if (targetContent) {
          targetContent.classList.add('active');
        }

        // Play click sound
        this.soundManager.playClickSound('select');

        // Sync encyclopedia if active
        if (tabId === 'tab-encyclopedia' && selectCiv) {
          this.updateEncyclopedia(selectCiv.value);
        }
      });
    });

    // Setup Mouse Parallax
    const lobbyScreen = document.getElementById('lobby-screen');
    const layerStars = document.getElementById('layer-stars');
    const layerCastle = document.getElementById('layer-castle');
    const layerMist = document.getElementById('layer-mist');
    const layerEmbers = document.getElementById('layer-embers');

    if (lobbyScreen) {
      lobbyScreen.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth) - 0.5;
        const y = (e.clientY / window.innerHeight) - 0.5;

        if (layerStars) layerStars.style.transform = `translate(${x * -10}px, ${y * -10}px)`;
        if (layerCastle) layerCastle.style.transform = `translate(${x * -25}px, ${y * -15}px)`;
        if (layerMist) layerMist.style.transform = `translate(${x * -40}px, ${y * -25}px) scale(1.1)`;
        if (layerEmbers) layerEmbers.style.transform = `translate(${x * -60}px, ${y * -40}px)`;
      });
    }

    // Run simulated multiplayer connection steps
    this.runSimulatedMatchmaking();

    if (btnLaunch) {
      btnLaunch.addEventListener('click', () => {
        this.launchGame();
      });
    }
  }

  updateCivDetails(civKey) {
    const detailsEl = document.getElementById('civ-details');
    if (!detailsEl) return;
    
    const civ = CIVILIZATIONS[civKey];
    if (!civ) return;
    
    let html = `<strong>${SVGIcons.getIcon(civKey)} Bangsa ${civ.name}</strong>`;
    html += `<span class="bonus">✓ Kelebihan:</span><ul style="padding-left:15px; margin: 4px 0 8px 0; list-style-type: square;">`;
    civ.bonuses.forEach(b => html += `<li>${b}</li>`);
    html += `</ul>`;
    html += `<span class="limit">✗ Limitasi:</span><ul style="padding-left:15px; margin: 4px 0 0 0; list-style-type: square;">`;
    civ.limitations.forEach(l => html += `<li>${l}</li>`);
    html += `</ul>`;
    
    detailsEl.innerHTML = html;
  }

  updateEncyclopedia(civKey) {
    const titleEl = document.getElementById('encyclopedia-title');
    const descEl = document.getElementById('encyclopedia-description');
    const unitEl = document.getElementById('encyclopedia-unit');
    const bonusEl = document.getElementById('encyclopedia-bonus');
    const focusEl = document.getElementById('encyclopedia-focus');
    
    const civ = CIVILIZATIONS[civKey];
    if (!civ) return;

    if (titleEl) titleEl.innerHTML = `${SVGIcons.getIcon(civKey)} Kekaisaran ${civ.name}`;

    let desc = "";
    if (civKey === 'inggris') {
      desc = "Mewakili kekuatan pemanah ulung dari pulau Britania Raya. Memiliki keuntungan jangkauan tembakan terjauh untuk unit busur dan kecepatan pengelolaan hutan.";
    } else if (civKey === 'prancis') {
      desc = "Kavaleri berat yang tak tertandingi dengan baju zirah tebal. Mereka dapat membangun sarana militer lebih hemat dan melancarkan kavaleri serbu.";
    } else if (civKey === 'mongol') {
      desc = "Bangsa pengembara dari padang rumput Asia. Ahli dalam taktik tabrak-lari (hit-and-run) menggunakan pemanah berkuda yang sangat lincah.";
    } else if (civKey === 'jepang') {
      desc = "Klan Samurai yang disiplin dan terlatih dalam pertempuran jarak dekat. Kecepatan serangan infantri mereka mematikan di medan pertempuran.";
    } else if (civKey === 'tiongkok') {
      desc = "Kekaisaran Timur yang maju secara administrasi dan teknologi. Mulai dengan jumlah rakyat (villager) lebih banyak untuk booming ekonomi cepat.";
    } else if (civKey === 'saracen') {
      desc = "Pasukan gurun pasir yang andal dalam perdagangan lintas negara. Menggunakan kavaleri unta untuk menetralisir kavaleri kuda musuh.";
    } else if (civKey === 'spanyol') {
      desc = "Penjelajah dunia baru yang perkasa dengan konstruksi cepat dan pasukan bersenjata api (mesiu) yang mematikan.";
    } else if (civKey === 'viking') {
      desc = "Perompak laut utara yang tangguh. Pasukan infantri memiliki ketahanan fisik (HP) luar biasa dan didukung armada laut yang ekonomis.";
    } else if (civKey === 'bizantium') {
      desc = "Pewaris takhta Romawi Timur dengan pertahanan benteng yang sangat kokoh dan biaya perekrutan unit penangkal yang sangat terjangkau.";
    } else if (civKey === 'persia') {
      desc = "Kekuatan dinasti kuno dengan pusat kota yang efisien dan andalan gajah perang raksasa untuk menghancurkan pertahanan musuh.";
    } else if (civKey === 'aztec') {
      desc = "Prajurit elang dan macan tutul yang militan. Mampu melatih prajurit dengan sangat cepat untuk strategi serbuan infantri massal.";
    } else if (civKey === 'maya') {
      desc = "Peradaban Mesoamerika kuno dengan pemanah bulu yang murah dan efisiensi pemanfaatan sumber daya alam yang bertahan lebih lama.";
    } else if (civKey === 'hun') {
      desc = "Pasukan berkuda nomaden yang tangguh dan tidak membutuhkan rumah tinggal. Siap menerjang wilayah musuh secara instan tanpa batas populasi.";
    } else if (civKey === 'turki') {
      desc = "Pelopor penggunaan artileri mesiu berat abad pertengahan. Pasukan penembak mesiu mereka memiliki daya tahan tinggi dan riset kimia gratis.";
    } else if (civKey === 'kelt') {
      desc = "Prajurit dataran tinggi yang bergerak sangat cepat serta mahir dalam merakit dan mengoperasikan mesin kepung (siege) yang merusak.";
    } else if (civKey === 'goth') {
      desc = "Suku barbar yang membanjiri peradaban dengan infantri murah. Mampu melatih infantri dengan kecepatan luar biasa namun tidak dapat membuat tembok batu.";
    } else if (civKey === 'teuton') {
      desc = "Ksatria Teutonik Jerman dengan pertahanan armor infantri yang sangat tebal serta keahlian pertanian yang unggul.";
    } else {
      desc = `Peradaban ${civ.name} dengan kelebihan unik dan unit-unit tempur khas siap memenangkan pertempuran real-time di medan perang.`;
    }
    
    if (descEl) descEl.textContent = desc;

    const statsData = {
      inggris: { unit: 'Longbowman', bonus: 'Tebang Kayu +20%', focus: 'Bertahan (Defensive)' },
      prancis: { unit: 'Throwing Axeman', bonus: 'HP Kavaleri +20%', focus: 'Serbu (Aggressive)' },
      mongol: { unit: 'Mangudai', bonus: 'Speed Kavaleri +15%', focus: 'Mobilitas (Hit & Run)' },
      jepang: { unit: 'Samurai', bonus: 'Atk Speed Infantri +15%', focus: 'Infantri (Melee)' },
      tiongkok: { unit: 'Chu Ko Nu', bonus: 'Starter +2 Rakyat', focus: 'Ekonomi (Booming)' },
      saracen: { unit: 'Mameluke', bonus: 'Trade Rate +20%', focus: 'Kavaleri Unta & Emas' },
      spanyol: { unit: 'Conquistador', bonus: 'Bangun Cepat +30%', focus: 'Konstruksi & Mesiu' },
      viking: { unit: 'Berserker', bonus: 'HP Infantri +15%', focus: 'Infantri & Pelabuhan' },
      bizantium: { unit: 'Cataphract', bonus: 'HP Struktur +25%', focus: 'Defensif & Benteng' },
      persia: { unit: 'War Elephant', bonus: 'Starter +50 Wood/Food', focus: 'Booming & Gajah' },
      aztec: { unit: 'Jaguar Warrior', bonus: 'Latih Militer +15%', focus: 'Infantri Swarm' },
      maya: { unit: 'Plumed Archer', bonus: 'Diskon Archer s/d -20%', focus: 'Jarak Jauh & Hemat' },
      hun: { unit: 'Tarkhan', bonus: 'Pop 100 Tanpa Rumah', focus: 'Kavaleri & Agresif' },
      turki: { unit: 'Janissary', bonus: 'HP Unit Mesiu +25%', focus: 'Senjata Api & Artileri' },
      kelt: { unit: 'Woad Raider', bonus: 'Speed Infantri +15%', focus: 'Infantri & Pengepungan' },
      goth: { unit: 'Huskarl', bonus: 'Harga Infantri -30%', focus: 'Harga Murah' },
      teuton: { unit: 'Teutonic Knight', bonus: 'Armor Infantri +2', focus: 'Pertahanan Infantri' }
    };

    const cStats = statsData[civKey] || { unit: 'Villager', bonus: 'Umum', focus: 'Keseimbangan' };
    
    if (unitEl) unitEl.textContent = cStats.unit;
    if (bonusEl) bonusEl.textContent = cStats.bonus;
    if (focusEl) focusEl.textContent = cStats.focus;
  }

  runSimulatedMatchmaking() {
    const log = document.getElementById('lobby-chat-log');
    const allyStatus = document.getElementById('slot-ally-status');
    if (!log) return;

    const addSysLog = (text) => {
      const el = document.createElement('div');
      el.className = 'msg sys';
      el.textContent = `System: ${text}`;
      log.appendChild(el);
      log.scrollTop = log.scrollHeight;
    };

    const addChatLog = (user, msg) => {
      const el = document.createElement('div');
      el.className = 'msg chat';
      el.innerHTML = `<strong>${user}</strong>: ${msg}`;
      log.appendChild(el);
      log.scrollTop = log.scrollHeight;
    };

    setTimeout(() => {
      addSysLog("Pemain GajahMada_35 bergabung ke lobi.");
      if (allyStatus) {
        allyStatus.className = "ready-badge";
        allyStatus.textContent = "Ready";
      }
    }, 1000);

    setTimeout(() => {
      addChatLog("GajahMada_35", "Oi cuy! Salam kenal, siap bantuin lawan faksi merah ya!");
    }, 2000);

    setTimeout(() => {
      addChatLog("Lord_Kahn_Enemy", "Hahaha, siap-siap aja diserbu sama kavaleri Mongol gw!");
    }, 3500);

    setTimeout(() => {
      addChatLog("Nomad_Grey", "Ane netral ya gan, mau fokus dagang emas aja di pojok map.");
    }, 5000);
  }

  launchGame() {
    const selectCiv = document.getElementById('select-civ');
    const selectMap = document.getElementById('select-map');
    const selectMode = document.getElementById('select-mode');
    const selectGraphics = document.getElementById('select-graphics');
    const selectResources = document.getElementById('select-resources');
    const selectPopLimit = document.getElementById('select-pop-limit');
    const selectAIDifficulty = document.getElementById('select-ai-difficulty');
    const selectGameSpeed = document.getElementById('select-game-speed');

    this.selectedCiv = selectCiv ? selectCiv.value : 'inggris';
    this.selectedMap = selectMap ? selectMap.value : 'river';
    this.gameMode = selectMode ? selectMode.value : 'multi';
    this.graphicsQuality = selectGraphics ? selectGraphics.value : 'high';

    // Advanced configs
    this.startingResourcesOption = selectResources ? selectResources.value : 'standard';
    this.maxPopulationCap = selectPopLimit ? parseInt(selectPopLimit.value, 10) : 100;
    this.aiDifficulty = selectAIDifficulty ? selectAIDifficulty.value : 'normal';
    this.gameSpeedMultiplier = selectGameSpeed ? parseFloat(selectGameSpeed.value) : 1.0;

    // Hide Lobby Overlay
    const lobbyScreen = document.getElementById('lobby-screen');
    if (lobbyScreen) {
      lobbyScreen.style.display = 'none';
    }

    // Determine starting resources base values
    let baseResources = { wood: 500, food: 500, gold: 300, stone: 150 };
    if (this.startingResourcesOption === 'low') {
      baseResources = { wood: 200, food: 150, gold: 100, stone: 50 };
    } else if (this.startingResourcesOption === 'high') {
      baseResources = { wood: 1500, food: 1500, gold: 1000, stone: 500 };
    } else if (this.startingResourcesOption === 'deathmatch') {
      baseResources = { wood: 10000, food: 10000, gold: 10000, stone: 10000 };
    }

    // Apply Civ starter modifiers and starting resources to Player (0)
    const civModifiers = CIVILIZATIONS[this.selectedCiv].modifiers;
    this.players[0].civ = this.selectedCiv;
    this.players[0].resources.wood = baseResources.wood + (civModifiers.startWood || 0);
    this.players[0].resources.food = baseResources.food + (civModifiers.startFood || 0);
    this.players[0].resources.gold = baseResources.gold;
    this.players[0].resources.stone = baseResources.stone;

    if (civModifiers.noHouses) {
      this.players[0].populationLimit = this.maxPopulationCap;
    } else {
      this.players[0].populationLimit = 10;
    }

    // Apply starting resources to Enemy (1)
    const enemyCivModifiers = CIVILIZATIONS[this.players[1].civ]?.modifiers || {};
    this.players[1].resources.wood = baseResources.wood * 1.5 + (enemyCivModifiers.startWood || 0);
    this.players[1].resources.food = baseResources.food * 1.5 + (enemyCivModifiers.startFood || 0);
    this.players[1].resources.gold = baseResources.gold * 1.5;
    this.players[1].resources.stone = baseResources.stone * 1.5;

    // Apply starting resources to Ally (2)
    if (this.gameMode === 'multi') {
      const allyCivModifiers = CIVILIZATIONS[this.players[2].civ]?.modifiers || {};
      this.players[2].resources.wood = baseResources.wood + (allyCivModifiers.startWood || 0);
      this.players[2].resources.food = baseResources.food + (allyCivModifiers.startFood || 0);
      this.players[2].resources.gold = baseResources.gold;
      this.players[2].resources.stone = baseResources.stone;
    }

    // Apply starting resources to Neutral (3)
    this.players[3].resources.wood = baseResources.wood;
    this.players[3].resources.food = baseResources.food;
    this.players[3].resources.gold = baseResources.gold;
    this.players[3].resources.stone = baseResources.stone;

    // Setup ThreeJS Engine
    this.renderer = new Renderer('game-canvas-container');
    
    // Configure Graphics Quality Settings
    if (this.graphicsQuality === 'low') {
      this.renderer.webGLRenderer.shadowMap.enabled = false;
      this.renderer.webGLRenderer.setPixelRatio(1.0); // Keep lightweight to save battery/heat
      if (this.renderer.sunLight) {
        this.renderer.sunLight.castShadow = false;
      }
    }

    // Setup HUD UI
    this.hud = new HUD(this);
    
    // Setup Entities & Terrain
    this.entityManager = new EntityManager(this);
    // Custom map size (large like AoE)
    this.terrain = new Terrain(this.renderer.scene, this, 350);
    
    // Setup Controls Input
    this.input = new Input(this.renderer, this);
    
    // Setup Map Assets
    this.spawnInitialAssets();

    // Setup AI factions
    this.enemyAI = new EnemyAI(this);
    
    if (this.gameMode === 'multi') {
      this.allyAI = new AllyAI(this);
    }
    this.neutralAI = new NeutralAI(this);

    // Start Game Loops
    this.clock.getDelta(); // reset clock
    this.gameActive = true;
    this.animate();
    
    // Set up graphic resolution visual feedback
    this.hud.updateResourcesUI();
    this.hud.showNotification(`🌲 Battle launched! You are playing as ${CIVILIZATIONS[this.selectedCiv].name}. Advancing to the next age requires Town Center.`);
  }

  spawnInitialAssets() {
    const mapSize = this.terrain.mapSize;
    const spawnDist = Math.round(mapSize * 0.32); // Spawns near quadrants
    
    // Player spawn (Bottom-Left: -x, -z)
    const px = -spawnDist;
    const pz = -spawnDist;
    const tc0 = this.entityManager.createBuilding('townCenter', 0, px, pz, true);
    this.gridAddBuilding(tc0);
    this.players[0].population = 3;
    this.entityManager.createUnit('villager', 0, px + 4, pz + 3);
    this.entityManager.createUnit('villager', 0, px + 3, pz + 6);
    this.entityManager.createUnit('villager', 0, px - 3, pz + 4);
    this.spawnStarterResources(px, pz);

    // Enemy spawn (Top-Right: +x, +z)
    const ex = spawnDist;
    const ez = spawnDist;
    const tc1 = this.entityManager.createBuilding('townCenter', 1, ex, ez, true);
    this.gridAddBuilding(tc1);
    this.players[1].population = 3;
    this.entityManager.createUnit('villager', 1, ex - 4, ez - 3);
    this.entityManager.createUnit('villager', 1, ex - 3, ez - 6);
    this.entityManager.createUnit('villager', 1, ex + 3, ez - 4);
    this.spawnStarterResources(ex, ez);

    // Ally spawn (Top-Left: -x, +z)
    if (this.gameMode === 'multi') {
      const ax = -spawnDist;
      const az = spawnDist;
      const tc2 = this.entityManager.createBuilding('townCenter', 2, ax, az, true);
      this.gridAddBuilding(tc2);
      this.players[2].population = 3;
      this.entityManager.createUnit('villager', 2, ax + 4, az - 3);
      this.entityManager.createUnit('villager', 2, ax + 3, az - 6);
      this.entityManager.createUnit('villager', 2, ax - 3, az - 4);
      this.spawnStarterResources(ax, az);
    }

    // Neutral spawn (Bottom-Right: +x, -z)
    const nx = spawnDist;
    const nz = -spawnDist;
    const tc3 = this.entityManager.createBuilding('townCenter', 3, nx, nz, true);
    this.gridAddBuilding(tc3);
    this.players[3].population = 2;
    this.entityManager.createUnit('villager', 3, nx - 4, nz + 3);
    this.entityManager.createUnit('villager', 3, nx - 3, nz + 4);
    this.spawnStarterResources(nx, nz);
  }

  spawnStarterResources(cx, cz) {
    // Spawns starter forests, gold deposits and stone quarries immediately adjacent to the TC
    const starterGroups = [
      { type: 'wood', count: 12, offset: { x: -9, z: 9 }, radius: 4 },
      { type: 'gold', count: 4, offset: { x: 10, z: 10 }, radius: 2.5 },
      { type: 'stone', count: 3, offset: { x: 10, z: -10 }, radius: 2.5 }
    ];

    starterGroups.forEach(group => {
      for (let i = 0; i < group.count; i++) {
        const angle = (i / group.count) * Math.PI * 2 + Math.random() * 0.4;
        const dist = Math.random() * group.radius;
        const rx = Math.round(cx + group.offset.x + Math.cos(angle) * dist);
        const rz = Math.round(cz + group.offset.z + Math.sin(angle) * dist);
        
        if (this.isCellBlocked(rx, rz)) continue;
        
        const ry = this.terrain.getGroundHeight(rx, rz);
        if (ry < -0.5) continue; // Skip water
        
        const node = new ResourceNode(this, group.type, rx, ry, rz);
        this.entityManager.addResource(node);
      }
    });
  }

  // -------------------------------------------------------------
  // RESOURCE MANAGEMENT
  // -------------------------------------------------------------
  getUnitCost(type) {
    if (type === 'villager') {
      return { food: 50 };
    } else if (type === 'swordsman') {
      return { food: 60, gold: 20 };
    } else if (type === 'footKnight') {
      return { food: 75, gold: 35 };
    } else if (type === 'archer') {
      return { food: 40, wood: 25 };
    } else if (type === 'knight') {
      return { food: 70, gold: 40 };
    } else if (type === 'heavyCavalry') {
      return { food: 90, gold: 60 };
    } else if (type === 'horseArcher') {
      return { food: 50, wood: 50 };
    } else if (type === 'priest') {
      return { gold: 100 };
    } else if (type === 'trader') {
      return { wood: 60, gold: 60 };
    } else if (type === 'fishingShip') {
      return { wood: 75 };
    }
    return {};
  }

  getUpgradeCost(type, currentLevel) {
    const multiplier = currentLevel + 1;
    return {
      food: multiplier * 100,
      gold: multiplier * 50
    };
  }

  getBuildingCost(type) {
    if (type === 'house') {
      return { wood: 50 };
    } else if (type === 'barracks') {
      return { wood: 120, stone: 50 };
    } else if (type === 'temple') {
      return { wood: 120, gold: 100 };
    } else if (type === 'market') {
      return { wood: 100 };
    } else if (type === 'dock') {
      const playerCiv = this.players[0].civ || 'inggris';
      const civ = CIVILIZATIONS[playerCiv];
      const discount = (civ && civ.modifiers && civ.modifiers.costDock) ? civ.modifiers.costDock : 1.0;
      return { wood: Math.round(150 * discount) };
    } else if (type === 'farm') {
      return { wood: 60 };
    } else if (type === 'mill' || type === 'lumberCamp' || type === 'miningCamp') {
      return { wood: 100 };
    } else if (type === 'palisadeWall') {
      return { wood: 5 };
    } else if (type === 'palisadeGate') {
      return { wood: 30 };
    } else if (type === 'stoneWall') {
      return { stone: 5 };
    } else if (type === 'stoneGate') {
      return { stone: 30 };
    } else if (type === 'watchTower') {
      return { wood: 100, stone: 125 };
    } else if (type === 'blacksmith') {
      return { wood: 150 };
    } else if (type === 'castle') {
      return { wood: 200, stone: 650 };
    }
    return {};
  }

  hasResources(playerId, cost) {
    const res = this.players[playerId].resources;
    for (const key in cost) {
      if (!res[key] || res[key] < cost[key]) {
        return false;
      }
    }
    return true;
  }

  deductResources(playerId, cost) {
    const res = this.players[playerId].resources;
    for (const key in cost) {
      res[key] -= cost[key];
    }
    if (playerId === 0) {
      this.hud.updateResourcesUI();
    }
  }

  depositResources(playerId, type, amount) {
    if (!type) return;
    this.players[playerId].resources[type] += amount;
    if (playerId === 0) {
      this.hud.updateResourcesUI();
    }
  }

  addPopulationLimit(playerId, amount) {
    this.players[playerId].populationLimit = Math.max(0, Math.min(this.maxPopulationCap, this.players[playerId].populationLimit + amount));
    if (playerId === 0) {
      this.hud.updateResourcesUI();
    }
  }

  // -------------------------------------------------------------
  // GRID COLLISION MAP
  // -------------------------------------------------------------
  gridAdd(x, z, type) {
    this.gridMap[`${x},${z}`] = type;
  }

  gridRemove(x, z) {
    delete this.gridMap[`${x},${z}`];
  }

  isCellBlocked(x, z) {
    return this.gridMap[`${x},${z}`] !== undefined;
  }

  findPath(startX, startZ, endX, endZ, isWaterUnit = false) {
    // A* Pathfinding implementation with a step size of 2 units (highly optimized)
    const step = 2;
    
    const startNode = {
      x: Math.round(startX / step) * step,
      z: Math.round(startZ / step) * step,
      g: 0,
      h: Math.abs(endX - startX) + Math.abs(endZ - startZ),
      parent: null
    };
    
    const endNode = {
      x: Math.round(endX / step) * step,
      z: Math.round(endZ / step) * step
    };

    const openSet = [startNode];
    const closedSet = new Set();
    const getHash = (x, z) => `${x},${z}`;

    let bestNode = startNode;
    let iterations = 0;
    const maxIterations = 350; // Cap search steps to keep frame rate perfect

    const isPassable = (x, z) => {
      // Map boundaries check
      const halfMap = this.terrain.mapSize / 2;
      if (Math.abs(x) > halfMap - 2 || Math.abs(z) > halfMap - 2) return false;

      // Ground height / water check
      const height = this.terrain.getGroundHeight(x, z);
      if (isWaterUnit) {
        if (height >= -0.5) return false; // Water units (fishing ship) only move in water
      } else {
        if (height < -0.5) return false; // Land units cannot cross water
      }

      // Check grid map collisions (buildings, resources) in 3x3 footprint
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          if (this.isCellBlocked(x + dx, z + dz)) {
            return false;
          }
        }
      }
      return true;
    };

    // If destination is blocked, search spirally for a nearby passable coordinate
    if (!isPassable(endNode.x, endNode.z)) {
      let foundAlternative = false;
      for (let r = 2; r <= 8; r += 2) {
        for (let dx = -r; dx <= r; dx += 2) {
          for (let dz = -r; dz <= r; dz += 2) {
            if (Math.abs(dx) !== r && Math.abs(dz) !== r) continue;
            const ax = endNode.x + dx;
            const az = endNode.z + dz;
            if (isPassable(ax, az)) {
              endNode.x = ax;
              endNode.z = az;
              foundAlternative = true;
              break;
            }
          }
          if (foundAlternative) break;
        }
        if (foundAlternative) break;
      }
    }

    while (openSet.length > 0 && iterations < maxIterations) {
      iterations++;
      // Sort openSet by f-cost (g + h)
      openSet.sort((a, b) => (a.g + a.h) - (b.g + b.h));
      const current = openSet.shift();

      if (current.x === endNode.x && current.z === endNode.z) {
        const path = [];
        let curr = current;
        while (curr !== null) {
          path.push(new THREE.Vector3(curr.x, this.terrain.getGroundHeight(curr.x, curr.z), curr.z));
          curr = curr.parent;
        }
        return path.reverse();
      }

      closedSet.add(getHash(current.x, current.z));

      if (current.h < bestNode.h) {
        bestNode = current;
      }

      // 8-directional movement neighbors
      const neighbors = [
        { x: step, z: 0 }, { x: -step, z: 0 }, { x: 0, z: step }, { x: 0, z: -step },
        { x: step, z: step }, { x: -step, z: step }, { x: step, z: -step }, { x: -step, z: -step }
      ];

      for (const dir of neighbors) {
        const nx = current.x + dir.x;
        const nz = current.z + dir.z;
        const hash = getHash(nx, nz);

        if (closedSet.has(hash)) continue;
        if (!isPassable(nx, nz)) continue;

        const isDiagonal = (dir.x !== 0 && dir.z !== 0);
        const gCost = current.g + (isDiagonal ? step * 1.414 : step);
        const hCost = Math.abs(endNode.x - nx) + Math.abs(endNode.z - nz);

        let existing = openSet.find(node => node.x === nx && node.z === nz);
        if (!existing) {
          openSet.push({ x: nx, z: nz, g: gCost, h: hCost, parent: current });
        } else if (gCost < existing.g) {
          existing.g = gCost;
          existing.parent = current;
        }
      }
    }

    // Fallback: build path to the closest node reached
    const path = [];
    let curr = bestNode;
    while (curr !== null) {
      path.push(new THREE.Vector3(curr.x, this.terrain.getGroundHeight(curr.x, curr.z), curr.z));
      curr = curr.parent;
    }
    return path.reverse();
  }

  gridAddBuilding(building) {
    const startX = Math.round(building.position.x - building.gridSize / 2);
    const startZ = Math.round(building.position.z - building.gridSize / 2);
    
    for (let dx = 0; dx < building.gridSize; dx++) {
      for (let dz = 0; dz < building.gridSize; dz++) {
        this.gridAdd(startX + dx, startZ + dz, 'building');
      }
    }
  }

  gridRemoveBuilding(building) {
    const startX = Math.round(building.position.x - building.gridSize / 2);
    const startZ = Math.round(building.position.z - building.gridSize / 2);
    
    for (let dx = 0; dx < building.gridSize; dx++) {
      for (let dz = 0; dz < building.gridSize; dz++) {
        this.gridRemove(startX + dx, startZ + dz);
      }
    }
  }

  checkBuildPosition(x, z, buildingType) {
    let size = 2;
    if (buildingType === 'townCenter') size = 4;
    else if (buildingType === 'barracks' || buildingType === 'temple' || buildingType === 'market' || buildingType === 'dock') size = 3;
    else if (buildingType === 'palisadeWall' || buildingType === 'stoneWall' || buildingType === 'watchTower') size = 1;
    else if (buildingType === 'palisadeGate' || buildingType === 'stoneGate' || buildingType === 'mill' || buildingType === 'lumberCamp' || buildingType === 'miningCamp') size = 2;
    
    const startX = Math.round(x - size / 2);
    const startZ = Math.round(z - size / 2);
    
    // Check if within map boundaries
    const halfMap = this.terrain.mapSize / 2;
    if (startX < -halfMap + 2 || startX + size > halfMap - 2 ||
        startZ < -halfMap + 2 || startZ + size > halfMap - 2) {
      return false;
    }

    let hasLand = false;
    let hasWater = false;

    // Check cells
    for (let dx = 0; dx < size; dx++) {
      for (let dz = 0; dz < size; dz++) {
        const curX = startX + dx;
        const curZ = startZ + dz;
        
        const height = this.terrain.getGroundHeight(curX, curZ);
        
        if (buildingType === 'dock') {
          if (height >= -0.4) hasLand = true;
          if (height < -0.4) hasWater = true;
        } else {
          // Terrain steepness check (no building in water/slopes for normal buildings)
          if (height < -0.4) {
            return false;
          }
        }
        
        if (this.isCellBlocked(curX, curZ)) {
          return false;
        }
      }
    }

    if (buildingType === 'dock') {
      if (!hasLand || !hasWater) {
        return false;
      }
    }
    return true;
  }

  placeBuilding(x, z, buildingType) {
    // Check Age and Civilization restrictions
    const playerCiv = this.players[0].civ || 'inggris';
    const civ = CIVILIZATIONS[playerCiv];
    const civModifiers = (civ && civ.modifiers) ? civ.modifiers : {};
    const currentAge = this.players[0].age || 'dark';

    // 1. Goth stone wall restriction
    if (civModifiers.noStoneWalls && (buildingType === 'stoneWall' || buildingType === 'stoneGate')) {
      this.hud.showNotification("Goth faksi tidak bisa membangun tembok batu!");
      return false;
    }

    // 2. Age Restrictions
    if (currentAge === 'dark' && ['palisadeGate', 'stoneWall', 'stoneGate'].includes(buildingType)) {
      this.hud.showNotification("Butuh Zaman Feodal ke atas untuk membangun struktur ini!");
      return false;
    }

    const cost = this.getBuildingCost(buildingType);
    
    if (!this.hasResources(0, cost)) {
      this.hud.showNotification("Sumber daya tidak cukup!");
      return false;
    }
    
    if (!this.checkBuildPosition(x, z, buildingType)) {
      return false;
    }
    
    // Deduct cost
    this.deductResources(0, cost);
    
    // Spawn blueprint building
    const b = this.entityManager.createBuilding(buildingType, 0, x, z, false);
    this.gridAddBuilding(b);
    
    // If we have selected villagers, automatically command them to build it
    const selectedVillagers = this.selectedEntities.filter(e => e.type === 'villager' && e.playerId === 0);
    if (selectedVillagers.length > 0) {
      selectedVillagers.forEach(v => v.commandBuild(b));
    }
    
    this.soundManager.playClickSound('build');
    return true;
  }

  // -------------------------------------------------------------
  // SELECTION
  // -------------------------------------------------------------
  selectEntity(entity) {
    this.deselectAll();
    this.selectedEntities = [entity];
    entity.setSelected(true);
    this.hud.updateSelectionUI();
    this.soundManager.playClickSound('select');
  }

  selectEntities(entities) {
    this.deselectAll();
    this.selectedEntities = entities;
    this.selectedEntities.forEach(e => e.setSelected(true));
    this.hud.updateSelectionUI();
    this.soundManager.playClickSound('select');
  }

  deselectAll() {
    this.selectedEntities.forEach(e => e.setSelected(false));
    this.selectedEntities = [];
    this.hud.updateSelectionUI();
  }

  getClickableObjects() {
    return this.entityManager.getClickableMeshes();
  }

  // -------------------------------------------------------------
  // COMMAND SYSTEM
  // -------------------------------------------------------------
  
  cycleFormation() {
    const formations = ['box', 'line', 'column', 'spread'];
    const idx = formations.indexOf(this.currentFormation);
    this.currentFormation = formations[(idx + 1) % formations.length];
    return this.currentFormation;
  }

  getFormationName(key) {
    const names = { box: '■ Box', line: '═ Line', column: '║ Column', spread: '◇ Spread' };
    return names[key] || key;
  }

  calculateFormationOffsets(count, formation, heading) {
    const spacing = 1.6;
    const offsets = [];
    
    if (count <= 1) {
      offsets.push({ dx: 0, dz: 0 });
      return offsets;
    }

    // heading angle from group centroid to target (radians)
    const cosH = Math.cos(heading);
    const sinH = Math.sin(heading);

    if (formation === 'box') {
      const cols = Math.ceil(Math.sqrt(count));
      for (let i = 0; i < count; i++) {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const rows = Math.ceil(count / cols);
        // local offsets (x = sideways, z = depth behind target)
        const lx = (c - (cols - 1) / 2) * spacing;
        const lz = (r - (rows - 1) / 2) * spacing;
        // rotate to face heading
        offsets.push({
          dx: lx * cosH - lz * sinH,
          dz: lx * sinH + lz * cosH
        });
      }
    } else if (formation === 'line') {
      // Single row perpendicular to heading
      for (let i = 0; i < count; i++) {
        const lx = (i - (count - 1) / 2) * spacing;
        const lz = 0;
        offsets.push({
          dx: lx * cosH - lz * sinH,
          dz: lx * sinH + lz * cosH
        });
      }
    } else if (formation === 'column') {
      // Single column along the heading direction
      for (let i = 0; i < count; i++) {
        const lx = 0;
        const lz = (i - (count - 1) / 2) * spacing;
        offsets.push({
          dx: lx * cosH - lz * sinH,
          dz: lx * sinH + lz * cosH
        });
      }
    } else if (formation === 'spread') {
      // Spread evenly in a circle
      const radius = Math.max(spacing, count * spacing / (2 * Math.PI));
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        offsets.push({
          dx: Math.cos(angle) * radius,
          dz: Math.sin(angle) * radius
        });
      }
    }
    
    return offsets;
  }

  dispatchCommand(units, targetEntity, groundPoint) {
    const commandableUnits = units.filter(u => u.playerId === 0 && typeof u.commandMove === 'function');
    const count = commandableUnits.length;
    
    // Calculate group centroid for heading computation
    let centroidX = 0, centroidZ = 0;
    commandableUnits.forEach(u => {
      centroidX += u.position.x;
      centroidZ += u.position.z;
    });
    if (count > 0) {
      centroidX /= count;
      centroidZ /= count;
    }

    // Determine heading towards target
    let heading = 0;
    if (groundPoint) {
      heading = Math.atan2(groundPoint.x - centroidX, groundPoint.z - centroidZ);
    } else if (targetEntity) {
      heading = Math.atan2(targetEntity.position.x - centroidX, targetEntity.position.z - centroidZ);
    }

    const formationOffsets = this.calculateFormationOffsets(count, this.currentFormation, heading);

    // Compute maximum distance for speed normalization
    let maxDist = 0;
    const unitDistances = [];
    commandableUnits.forEach((unit, idx) => {
      const off = formationOffsets[idx] || { dx: 0, dz: 0 };
      let targetX, targetZ;
      if (groundPoint) {
        targetX = groundPoint.x + off.dx;
        targetZ = groundPoint.z + off.dz;
      } else if (targetEntity) {
        targetX = targetEntity.position.x + off.dx;
        targetZ = targetEntity.position.z + off.dz;
      } else {
        targetX = unit.position.x;
        targetZ = unit.position.z;
      }
      const dist = Math.sqrt(
        (targetX - unit.position.x) ** 2 +
        (targetZ - unit.position.z) ** 2
      );
      unitDistances.push(dist);
      if (dist > maxDist) maxDist = dist;
    });

    commandableUnits.forEach((unit, idx) => {
      // Sheep movement commands support
      if (unit.type === 'sheep') {
        if (groundPoint) {
          unit.commandMove(groundPoint);
        } else if (targetEntity) {
          unit.commandMove(targetEntity.position);
        }
        return;
      }

      if (targetEntity) {
        const isResource = ['wood', 'gold', 'stone', 'food', 'sheep', 'fish'].includes(targetEntity.type);
        const isBuilding = ['townCenter', 'barracks', 'house', 'temple', 'market', 'dock', 'farm', 'watchTower', 'blacksmith', 'palisadeWall', 'palisadeGate', 'stoneWall', 'stoneGate', 'castle'].includes(targetEntity.type);
        const isUnit = ['villager', 'swordsman', 'archer', 'knight', 'priest', 'trader', 'footKnight', 'heavyCavalry', 'horseArcher', 'fishingShip', 'sheep'].includes(targetEntity.type);

        if (targetEntity.type === 'sheep' && targetEntity.hp !== undefined) {
          // Live sheep target (gather/slaughter for villager, move for others)
          if (unit.type === 'villager') {
            unit.commandGather(targetEntity);
          } else {
            unit.commandMove(targetEntity.position);
          }
        }
        else if (isResource) {
          if (unit.type === 'villager') {
            unit.commandGather(targetEntity);
          } else if (unit.type === 'fishingShip' && targetEntity.type === 'fish') {
            unit.commandGather(targetEntity);
          } else {
            unit.commandMove(targetEntity.position);
          }
        } 
        else if (isBuilding) {
          if (targetEntity.playerId === 1) {
            unit.commandAttack(targetEntity);
          } else {
            if (!targetEntity.isCompleted) {
              if (unit.type === 'villager') {
                unit.commandBuild(targetEntity);
              } else {
                unit.commandMove(targetEntity.position);
              }
            } else {
              if (targetEntity.type === 'castle') {
                if (unit.type !== 'sheep' && unit.type !== 'fishingShip') {
                  unit.commandGarrison(targetEntity);
                } else {
                  unit.commandMove(targetEntity.position);
                }
              } else if (unit.type === 'villager' && targetEntity.type === 'farm' && targetEntity.amount > 0) {
                unit.commandGather(targetEntity);
              } else {
                unit.commandMove(targetEntity.position);
              }
            }
          }
        } 
        else if (isUnit) {
          if (targetEntity.playerId === 1) {
            unit.commandAttack(targetEntity);
          } else {
            unit.commandMove(targetEntity.position);
          }
        }
      } 
      else if (groundPoint) {
        if (count > 1) {
          const off = formationOffsets[idx] || { dx: 0, dz: 0 };
          const formationPoint = new THREE.Vector3(
            groundPoint.x + off.dx,
            groundPoint.y,
            groundPoint.z + off.dz
          );
          unit.commandMove(formationPoint);
          
          // Speed normalization: slow down closer units so they arrive together
          if (maxDist > 0 && unitDistances[idx] > 0) {
            const ratio = unitDistances[idx] / maxDist;
            unit._formationSpeedMult = Math.max(0.4, ratio);
          } else {
            unit._formationSpeedMult = 1.0;
          }
        } else {
          unit._formationSpeedMult = 1.0;
          unit.commandMove(groundPoint);
        }
      }
    });
  }

  // -------------------------------------------------------------
  // SYSTEM LOOPS
  // -------------------------------------------------------------
  animate() {
    if (!this.gameActive) return;
    
    requestAnimationFrame(this.animate.bind(this));
    
    const baseDeltaTime = Math.min(0.1, this.clock.getDelta()); // clamp spike deltas
    const deltaTime = baseDeltaTime * this.gameSpeedMultiplier;
    
    // Update camera controls (independent of game speed)
    this.renderer.update(baseDeltaTime);
    
    // Update water shader waves
    if (this.terrain) {
      this.terrain.update(deltaTime);
    }
    
    // Update game objects
    this.entityManager.update(deltaTime);
    
    // Periodic check for neutral sheep takeover
    this.checkSheepTakeover(deltaTime);

    // Update AI factions
    if (this.enemyAI) {
      this.enemyAI.update(deltaTime);
    }
    if (this.allyAI) {
      this.allyAI.update(deltaTime);
    }
    if (this.neutralAI) {
      this.neutralAI.update(deltaTime);
    }
    
    // Render 3D Canvas
    this.renderer.render();
  }

  findNearestDropoff(position, playerId, resourceType = null) {
    const buildings = this.entityManager.buildings;
    let closestDropoff = null;
    let closestDist = Infinity;
    
    buildings.forEach(b => {
      if (b.playerId !== playerId || !b.isCompleted) return;
      
      let isValidDropoff = false;
      
      if (b.type === 'townCenter') {
        isValidDropoff = true;
      } else if (b.type === 'mill' && resourceType === 'food') {
        isValidDropoff = true;
      } else if (b.type === 'lumberCamp' && resourceType === 'wood') {
        isValidDropoff = true;
      } else if (b.type === 'miningCamp' && (resourceType === 'stone' || resourceType === 'gold')) {
        isValidDropoff = true;
      } else if (b.type === 'dock' && resourceType === 'food') {
        isValidDropoff = true;
      }
      
      if (!isValidDropoff) return;
      
      const dist = position.distanceTo(b.position);
      if (dist < closestDist) {
        closestDist = dist;
        closestDropoff = b;
      }
    });
    
    return closestDropoff;
  }

  // -------------------------------------------------------------
  // WIN / LOSE CONDITIONS
  // -------------------------------------------------------------
  onTownCenterDestroyed(playerId) {
    if (playerId === 0) {
      // Player lost
      this.gameOver(false);
    } else {
      // Enemy lost, player wins!
      this.gameOver(true);
    }
  }

  gameOver(isVictory) {
    this.gameActive = false;
    
    if (isVictory) {
      this.soundManager.playVictoryTheme();
      this.hud.showGameOverScreen(true);
    } else {
      this.soundManager.playDefeatTheme();
      this.hud.showGameOverScreen(false);
    }
  }

  restartGame() {
    this.gameActive = false;
    this.entityManager.clearAll();
    this.gridMap = {};
    
    // Clear canvas child nodes
    const container = document.getElementById('game-canvas-container');
    if (container) {
      container.innerHTML = '';
    }
    
    // Hide game-over overlay BEFORE clearing HUD contents
    if (this.hud) {
      this.hud.hideGameOverScreen();
    }

    // Clear HUD overlay DOM contents
    const hudContainer = document.getElementById('hud');
    if (hudContainer) {
      hudContainer.innerHTML = '';
    }

    // Reset player stats
    this.players[0] = {
      resources: { wood: 200, food: 150, gold: 100, stone: 50 },
      population: 0,
      populationLimit: 10,
      age: 'dark',
      civ: 'inggris',
      upgrades: { attack: 0, armor: 0, arrow: 0 }
    };
    
    this.players[1] = {
      resources: { wood: 1000, food: 1000, gold: 1000, stone: 1000 },
      population: 0,
      populationLimit: 100,
      age: 'dark',
      civ: 'mongol',
      upgrades: { attack: 0, armor: 0, arrow: 0 }
    };

    this.players[2] = {
      resources: { wood: 400, food: 400, gold: 200, stone: 100 },
      population: 0,
      populationLimit: 20,
      age: 'dark',
      civ: 'jepang',
      upgrades: { attack: 0, armor: 0, arrow: 0 }
    };

    this.players[3] = {
      resources: { wood: 500, food: 500, gold: 500, stone: 500 },
      population: 0,
      populationLimit: 50,
      age: 'dark',
      civ: 'bizantium',
      upgrades: { attack: 0, armor: 0, arrow: 0 }
    };
    
    this.selectedEntities = [];

    // Show Lobby Screen again
    const lobbyScreen = document.getElementById('lobby-screen');
    if (lobbyScreen) {
      lobbyScreen.style.display = 'flex';
      // Reset simulated chat
      const log = document.getElementById('lobby-chat-log');
      if (log) log.innerHTML = '<div class="msg sys">System: Re-connected to matchmaking server.</div>';
      this.runSimulatedMatchmaking();
    }
  }

  // -------------------------------------------------------------
  // AGE ADVANCEMENT SYSTEM
  // -------------------------------------------------------------
  upgradePlayerAge(playerId) {
    const player = this.players[playerId];
    const currentAge = player.age;
    let nextAge = null;
    let cost = {};

    const civModifiers = CIVILIZATIONS[player.civ].modifiers;
    const ageUpCostModifier = civModifiers.ageUpCost || 1.0; // Bizantium modifier

    if (currentAge === 'dark') {
      nextAge = 'feudal';
      cost = { food: Math.round(500 * ageUpCostModifier) };
    } else if (currentAge === 'feudal') {
      nextAge = 'castle';
      cost = { food: Math.round(800 * ageUpCostModifier), gold: Math.round(200 * ageUpCostModifier) };
    } else if (currentAge === 'castle') {
      nextAge = 'imperial';
      cost = { food: Math.round(1000 * ageUpCostModifier), gold: Math.round(800 * ageUpCostModifier) };
    }

    if (!nextAge) return;

    if (!this.hasResources(playerId, cost)) {
      if (playerId === 0) {
        this.hud.showNotification(`Not enough resources! Needs ${cost.food} Food${cost.gold ? ' & ' + cost.gold + ' Gold' : ''} to Age Up.`);
      }
      return;
    }

    // Deduct resources
    this.deductResources(playerId, cost);
    player.age = nextAge;

    // Visual & stat upgrades for all player's buildings
    const buildings = this.entityManager.buildings.filter(b => b.playerId === playerId);
    buildings.forEach(b => {
      const isCompleted = b.isCompleted;
      const progress = b.buildProgress;

      // Clean old mesh
      this.renderer.scene.remove(b.mesh);
      b.mesh.traverse(child => {
        if (child.isMesh) {
          child.geometry.dispose();
          child.material.dispose();
        }
      });

      // Regenerate with new age parameters
      b.initMesh();

      // HP stats scaling with Age
      if (b.type === 'townCenter') {
        b.maxHp = nextAge === 'feudal' ? 1200 : (nextAge === 'castle' ? 2000 : 3500);
      } else if (b.type === 'barracks') {
        b.maxHp = nextAge === 'feudal' ? 800 : (nextAge === 'castle' ? 1400 : 2500);
      } else if (b.type === 'house') {
        b.maxHp = nextAge === 'feudal' ? 400 : (nextAge === 'castle' ? 700 : 1200);
      } else if (b.type === 'temple') {
        b.maxHp = nextAge === 'feudal' ? 600 : (nextAge === 'castle' ? 1000 : 1800);
      } else if (b.type === 'market') {
        b.maxHp = nextAge === 'feudal' ? 700 : (nextAge === 'castle' ? 1200 : 2000);
      }

      b.isCompleted = isCompleted;
      b.buildProgress = progress;
      if (isCompleted) {
        b.hp = b.maxHp;
      } else {
        b.hp = Math.round((progress / 100) * b.maxHp);
      }
    });

    // Visual & stat upgrades for all player's units
    const units = this.entityManager.units.filter(u => u.playerId === playerId);
    units.forEach(u => {
      // Clean old mesh
      this.renderer.scene.remove(u.mesh);
      u.mesh.traverse(child => {
        if (child.isMesh) {
          child.geometry.dispose();
          child.material.dispose();
        }
      });

      // Regenerate with new age parameters
      u.initMesh();

      // Scale unit parameters with Age
      if (u.type === 'swordsman') {
        if (nextAge === 'feudal') {
          u.maxHp = 110;
          u.attackPower = 16;
        } else if (nextAge === 'castle') {
          u.maxHp = 140;
          u.attackPower = 22;
        } else { // imperial
          u.maxHp = 180;
          u.attackPower = 32;
        }
        u.hp = u.maxHp;
      } else if (u.type === 'archer') {
        if (nextAge === 'feudal') {
          u.maxHp = 50;
          u.attackPower = 8;
        } else if (nextAge === 'castle') {
          u.maxHp = 65;
          u.attackPower = 11;
          u.attackRange = 6.0;
        } else { // imperial
          u.maxHp = 80;
          u.attackPower = 15;
          u.attackRange = 6.5;
        }
        u.hp = u.maxHp;
      } else if (u.type === 'knight') {
        if (nextAge === 'feudal') {
          u.maxHp = 135;
          u.attackPower = 17;
        } else if (nextAge === 'castle') {
          u.maxHp = 170;
          u.attackPower = 23;
        } else { // imperial
          u.maxHp = 220;
          u.attackPower = 32;
        }
        u.hp = u.maxHp;
      } else if (u.type === 'footKnight') {
        if (nextAge === 'feudal') {
          u.maxHp = 120;
          u.attackPower = 18;
        } else if (nextAge === 'castle') {
          u.maxHp = 160;
          u.attackPower = 25;
        } else { // imperial
          u.maxHp = 210;
          u.attackPower = 35;
        }
        u.hp = u.maxHp;
      } else if (u.type === 'heavyCavalry') {
        if (nextAge === 'feudal') {
          u.maxHp = 200;
          u.attackPower = 21;
        } else if (nextAge === 'castle') {
          u.maxHp = 250;
          u.attackPower = 28;
        } else { // imperial
          u.maxHp = 320;
          u.attackPower = 38;
        }
        u.hp = u.maxHp;
      } else if (u.type === 'horseArcher') {
        if (nextAge === 'feudal') {
          u.maxHp = 95;
          u.attackPower = 9;
          u.attackRange = 5.0;
        } else if (nextAge === 'castle') {
          u.maxHp = 120;
          u.attackPower = 13;
          u.attackRange = 5.5;
        } else { // imperial
          u.maxHp = 150;
          u.attackPower = 17;
          u.attackRange = 6.0;
        }
        u.hp = u.maxHp;
      }
      if (typeof u.recalculateStats === 'function') {
        u.recalculateStats();
      }
    });

    // Play click and alert effects
    this.soundManager.playClickSound('complete');

    if (playerId === 0) {
      this.hud.updateResourcesUI();
      this.hud.updateSelectionUI();
      this.hud.showNotification(`🚀 Advanced to ${nextAge.toUpperCase()} AGE! Unlocked visual building upgrades and enhanced troop stats.`);
      
      const tc = buildings.find(b => b.type === 'townCenter');
      const textPos = tc ? tc.position.clone() : new THREE.Vector3(0, 5, 0);
      this.hud.showFloatingText(textPos, `${nextAge.toUpperCase()} AGE!`, 0x00ffff);
    }
  }

  // -------------------------------------------------------------
  // DYNAMIC ACTION VFX & PROJECTILES
  // -------------------------------------------------------------
  spawnParticles(position, color, count = 6, size = 0.12) {
    const particleGroup = new THREE.Group();
    const geom = new THREE.DodecahedronGeometry(size);
    const mat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.9 });
    
    const particles = [];
    for (let i = 0; i < count; i++) {
      const p = new THREE.Mesh(geom, mat);
      p.position.copy(position);
      // Offset slightly to chest height
      p.position.y += 0.4 + Math.random() * 0.3;
      
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.0 + Math.random() * 3.0;
      p.userData = {
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed * 0.5,
          4.0 + Math.random() * 4.0, // strong upward pop
          Math.sin(angle) * speed * 0.5
        ),
        gravity: -9.8
      };
      particleGroup.add(p);
      particles.push(p);
    }
    
    this.renderer.scene.add(particleGroup);
    
    const startTime = performance.now();
    
    const animate = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      if (elapsed > 0.6 || !this.gameActive) {
        this.renderer.scene.remove(particleGroup);
        geom.dispose();
        mat.dispose();
        return;
      }
      
      const dt = 0.016; // approx 60fps frame delta
      particles.forEach(p => {
        p.position.addScaledVector(p.userData.velocity, dt);
        p.userData.velocity.y += p.userData.gravity * dt;
        p.material.opacity = 1.0 - (elapsed / 0.6);
        p.scale.multiplyScalar(0.96);
      });
      
      requestAnimationFrame(animate);
    };
    animate();
  }

  spawnArrow(fromPos, toPos) {
    const arrowGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4);
    arrowGeom.rotateX(Math.PI / 2);
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0x966f33 });
    const arrow = new THREE.Mesh(arrowGeom, arrowMat);
    
    const startPos = fromPos.clone();
    startPos.y += 0.8; // archer hand level
    arrow.position.copy(startPos);
    
    const target = toPos.clone();
    target.y += 0.5; // hit chest area
    
    arrow.lookAt(target.x, target.y, target.z);
    this.renderer.scene.add(arrow);
    
    const speed = 25.0; // units per second
    const duration = startPos.distanceTo(target) / speed;
    const startTime = performance.now();
    
    const animate = () => {
      if (!this.gameActive) {
        this.renderer.scene.remove(arrow);
        arrowGeom.dispose();
        arrowMat.dispose();
        return;
      }
      
      const elapsed = (performance.now() - startTime) / 1000;
      const t = Math.min(1.0, elapsed / duration);
      
      const currentPos = new THREE.Vector3().lerpVectors(startPos, target, t);
      const arcHeight = Math.sin(t * Math.PI) * 1.5; // parabolic path
      currentPos.y += arcHeight;
      
      arrow.position.copy(currentPos);
      
      const nextT = Math.min(1.0, t + 0.05);
      const nextPos = new THREE.Vector3().lerpVectors(startPos, target, nextT);
      nextPos.y += Math.sin(nextT * Math.PI) * 1.5;
      arrow.lookAt(nextPos);
      
      if (t < 1.0) {
        requestAnimationFrame(animate);
      } else {
        this.renderer.scene.remove(arrow);
        arrowGeom.dispose();
        arrowMat.dispose();
      }
    };
    animate();
  }

  checkSheepTakeover(deltaTime) {
    if (this.sheepTakeoverTimer === undefined) this.sheepTakeoverTimer = 0;
    this.sheepTakeoverTimer += deltaTime;
    if (this.sheepTakeoverTimer < 0.3) return;
    this.sheepTakeoverTimer = 0;

    const neutralSheep = this.entityManager.units.filter(u => u.type === 'sheep' && u.playerId === 3);
    if (neutralSheep.length === 0) return;

    const friendlyUnits = this.entityManager.units.filter(u => (u.playerId === 0 || u.playerId === 2) && u.type !== 'sheep' && u.state !== 'DEAD');
    if (friendlyUnits.length === 0) return;

    neutralSheep.forEach(sheep => {
      for (const friendly of friendlyUnits) {
        if (sheep.position.distanceTo(friendly.position) < 3.0) {
          const newPlayerId = friendly.playerId;
          sheep.playerId = newPlayerId;
          
          this.renderer.scene.remove(sheep.mesh);
          sheep.mesh.traverse(child => {
            if (child.isMesh) {
              child.geometry.dispose();
              if (child.material) child.material.dispose();
            }
          });
          sheep.initMesh();
          
          if (newPlayerId === 0) {
            this.hud.showNotification("You tamed a neutral sheep! 🐑");
            this.soundManager.playClickSound('complete');
          }
          break;
        }
      }
    });
  }
}
