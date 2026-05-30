import * as THREE from 'three';
import { Renderer } from '../engine/Renderer';
import { Input } from '../engine/Input';
import { Terrain } from '../engine/Terrain';
import { EntityManager } from './EntityManager';
import { ModelFactory, CIVILIZATIONS } from './ModelFactory';
import { SoundManager } from './SoundManager';
import { EnemyAI } from './EnemyAI';
import { AllyAI } from './AllyAI';
import { NeutralAI } from './NeutralAI';
import { HUD } from '../ui/HUD';

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

    // Game stats & Player states (4 Factions: 0: Player, 1: Enemy, 2: Ally, 3: Neutral)
    this.players = {
      0: { // Player
        resources: { wood: 200, food: 150, gold: 100, stone: 50 },
        population: 0,
        populationLimit: 10,
        age: 'dark',
        civ: 'inggris'
      },
      1: { // Enemy (Red AI)
        resources: { wood: 1000, food: 1000, gold: 1000, stone: 1000 },
        population: 0,
        populationLimit: 100,
        age: 'dark',
        civ: 'mongol'
      },
      2: { // Ally (Green AI)
        resources: { wood: 400, food: 400, gold: 200, stone: 100 },
        population: 0,
        populationLimit: 20,
        age: 'dark',
        civ: 'jepang'
      },
      3: { // Neutral (Grey)
        resources: { wood: 500, food: 500, gold: 500, stone: 500 },
        population: 0,
        populationLimit: 50,
        age: 'dark',
        civ: 'bizantium'
      }
    };

    // Selection
    this.selectedEntities = [];

    // Grid collision map (x,z key -> true/false/type)
    this.gridMap = {};
    
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
      });
      // Initial trigger
      this.updateCivDetails(selectCiv.value);
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
    
    let html = `<strong>${civ.icon} Bangsa ${civ.name}</strong>`;
    html += `<span class="bonus">✓ Kelebihan:</span><ul style="padding-left:15px; margin: 4px 0 8px 0; list-style-type: square;">`;
    civ.bonuses.forEach(b => html += `<li>${b}</li>`);
    html += `</ul>`;
    html += `<span class="limit">✗ Limitasi:</span><ul style="padding-left:15px; margin: 4px 0 0 0; list-style-type: square;">`;
    civ.limitations.forEach(l => html += `<li>${l}</li>`);
    html += `</ul>`;
    
    detailsEl.innerHTML = html;
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

    this.selectedCiv = selectCiv ? selectCiv.value : 'inggris';
    this.selectedMap = selectMap ? selectMap.value : 'river';
    this.gameMode = selectMode ? selectMode.value : 'multi';
    this.graphicsQuality = selectGraphics ? selectGraphics.value : 'high';

    // Hide Lobby Overlay
    const lobbyScreen = document.getElementById('lobby-screen');
    if (lobbyScreen) {
      lobbyScreen.style.display = 'none';
    }

    // Apply Civ starter modifiers to Player
    const civModifiers = CIVILIZATIONS[this.selectedCiv].modifiers;
    this.players[0].civ = this.selectedCiv;
    this.players[0].resources.wood = 200 + (civModifiers.startWood || 0);
    this.players[0].resources.food = 150 + (civModifiers.startFood || 0);
    if (civModifiers.noHouses) {
      this.players[0].populationLimit = 100;
    }

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
    this.terrain = new Terrain(this.renderer.scene, this, 160);
    
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
    this.entityManager.createUnit('villager', 0, px + 3, pz + 2);
    this.entityManager.createUnit('villager', 0, px + 2, pz + 4);
    this.entityManager.createUnit('villager', 0, px - 2, pz + 3);

    // Enemy spawn (Top-Right: +x, +z)
    const ex = spawnDist;
    const ez = spawnDist;
    const tc1 = this.entityManager.createBuilding('townCenter', 1, ex, ez, true);
    this.gridAddBuilding(tc1);
    this.players[1].population = 3;
    this.entityManager.createUnit('villager', 1, ex - 3, ez - 2);
    this.entityManager.createUnit('villager', 1, ex - 2, ez - 4);
    this.entityManager.createUnit('villager', 1, ex + 2, ez - 3);

    // Ally spawn (Top-Left: -x, +z)
    if (this.gameMode === 'multi') {
      const ax = -spawnDist;
      const az = spawnDist;
      const tc2 = this.entityManager.createBuilding('townCenter', 2, ax, az, true);
      this.gridAddBuilding(tc2);
      this.players[2].population = 3;
      this.entityManager.createUnit('villager', 2, ax + 3, az - 2);
      this.entityManager.createUnit('villager', 2, ax + 2, az - 4);
      this.entityManager.createUnit('villager', 2, ax - 2, az - 3);
    }

    // Neutral spawn (Bottom-Right: +x, -z)
    const nx = spawnDist;
    const nz = -spawnDist;
    const tc3 = this.entityManager.createBuilding('townCenter', 3, nx, nz, true);
    this.gridAddBuilding(tc3);
    this.players[3].population = 2;
    this.entityManager.createUnit('villager', 3, nx - 3, nz + 2);
    this.entityManager.createUnit('villager', 3, nx - 2, nz + 3);
  }

  // -------------------------------------------------------------
  // RESOURCE MANAGEMENT
  // -------------------------------------------------------------
  getUnitCost(type) {
    if (type === 'villager') {
      return { food: 50 };
    } else if (type === 'swordsman') {
      return { food: 60, gold: 20 };
    } else if (type === 'priest') {
      return { gold: 100 };
    } else if (type === 'trader') {
      return { wood: 60, gold: 60 };
    }
    return {};
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
    this.players[playerId].populationLimit += amount;
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
    else if (buildingType === 'barracks' || buildingType === 'temple' || buildingType === 'market') size = 3;
    
    const startX = Math.round(x - size / 2);
    const startZ = Math.round(z - size / 2);
    
    // Check if within map boundaries
    const halfMap = this.terrain.mapSize / 2;
    if (startX < -halfMap + 2 || startX + size > halfMap - 2 ||
        startZ < -halfMap + 2 || startZ + size > halfMap - 2) {
      return false;
    }

    // Check cells
    for (let dx = 0; dx < size; dx++) {
      for (let dz = 0; dz < size; dz++) {
        const curX = startX + dx;
        const curZ = startZ + dz;
        
        // Terrain steepness check (no building in water/slopes)
        const height = this.terrain.getGroundHeight(curX, curZ);
        if (height < -0.4) {
          return false;
        }
        
        if (this.isCellBlocked(curX, curZ)) {
          return false;
        }
      }
    }
    return true;
  }

  placeBuilding(x, z, buildingType) {
    const cost = this.getBuildingCost(buildingType);
    
    if (!this.hasResources(0, cost)) {
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
  dispatchCommand(units, targetEntity, groundPoint) {
    units.forEach(unit => {
      if (unit.playerId !== 0) return; // Command only player units
      
      if (targetEntity) {
        if (targetEntity.type === 'resource') {
          // Send villager to gather, swordsman to guard it/move
          if (unit.type === 'villager') {
            unit.commandGather(targetEntity);
          } else {
            unit.commandMove(targetEntity.position);
          }
        } 
        else if (targetEntity.type === 'building') {
          if (targetEntity.playerId === 1) {
            // Attack enemy building
            unit.commandAttack(targetEntity);
          } else {
            // Friendly building
            if (!targetEntity.isCompleted) {
              // Villager builds it, swordsman guards
              if (unit.type === 'villager') {
                unit.commandBuild(targetEntity);
              } else {
                unit.commandMove(targetEntity.position);
              }
            } else {
              // Completed building, just move near it
              unit.commandMove(targetEntity.position);
            }
          }
        } 
        else if (targetEntity.type === 'villager' || targetEntity.type === 'swordsman') {
          if (targetEntity.playerId === 1) {
            // Attack enemy unit
            unit.commandAttack(targetEntity);
          } else {
            // Guard/move to friendly unit
            unit.commandMove(targetEntity.position);
          }
        }
      } 
      else if (groundPoint) {
        // Move to empty terrain point
        unit.commandMove(groundPoint);
      }
    });
  }

  // -------------------------------------------------------------
  // SYSTEM LOOPS
  // -------------------------------------------------------------
  animate() {
    if (!this.gameActive) return;
    
    requestAnimationFrame(this.animate.bind(this));
    
    const deltaTime = Math.min(0.1, this.clock.getDelta()); // clamp spike deltas
    
    // Update camera controls
    this.renderer.update(deltaTime);
    
    // Update water shader waves
    if (this.terrain) {
      this.terrain.update(deltaTime);
    }
    
    // Update game objects
    this.entityManager.update(deltaTime);

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

  // -------------------------------------------------------------
  // DROPOFF SEARCH
  // -------------------------------------------------------------
  findNearestDropoff(position, playerId) {
    const buildings = this.entityManager.buildings;
    let closestDropoff = null;
    let closestDist = Infinity;
    
    buildings.forEach(b => {
      if (b.playerId !== playerId || b.type !== 'townCenter' || !b.isCompleted) return;
      
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
      civ: 'inggris'
    };
    
    this.players[1] = {
      resources: { wood: 1000, food: 1000, gold: 1000, stone: 1000 },
      population: 0,
      populationLimit: 100,
      age: 'dark',
      civ: 'mongol'
    };

    this.players[2] = {
      resources: { wood: 400, food: 400, gold: 200, stone: 100 },
      population: 0,
      populationLimit: 20,
      age: 'dark',
      civ: 'jepang'
    };

    this.players[3] = {
      resources: { wood: 500, food: 500, gold: 500, stone: 500 },
      population: 0,
      populationLimit: 50,
      age: 'dark',
      civ: 'bizantium'
    };
    
    this.selectedEntities = [];
    
    if (this.hud) {
      this.hud.hideGameOverScreen();
    }

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
}
