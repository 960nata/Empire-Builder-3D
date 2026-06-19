import * as THREE from 'three';
import { CIVILIZATIONS } from './ModelFactory';

export class Building {
  constructor(gameManager, type, playerId, x, z, startCompleted = false, rotationY = 0) {
    this.gameManager = gameManager;
    this.rotationY = rotationY;
    this.type = type; // 'townCenter', 'barracks', 'house', 'temple', 'market'
    this.playerId = playerId; // 0: Player, 1: Enemy, 2: Ally, 3: Neutral
    this.isCompleted = startCompleted;
    this.buildProgress = startCompleted ? 100 : 0;
    
    this.age = this.gameManager.players[this.playerId].age || 'dark';

    const playerCiv = this.gameManager.players[this.playerId].civ || 'inggris';
    const civModifiers = (CIVILIZATIONS && CIVILIZATIONS[playerCiv]) 
      ? CIVILIZATIONS[playerCiv].modifiers 
      : { hpBuilding: 1.0, costBarracks: 1.0, trainTime: 1.0, trainSpeedVillager: 1.0, trainSpeedMilitary: 1.0 };
    this.civModifiers = civModifiers;

    // Stats
    if (this.type === 'townCenter') {
      this.hp = startCompleted ? 800 : 50;
      this.maxHp = 800;
      this.gridSize = 4;
      this.garrisonedUnits = [];
      this.maxGarrison = 15;
    } else if (this.type === 'barracks') {
      this.hp = startCompleted ? 500 : 30;
      this.maxHp = 500;
      this.gridSize = 3;
    } else if (this.type === 'house') {
      this.hp = startCompleted ? 250 : 20;
      this.maxHp = 250;
      this.gridSize = 2;
    } else if (this.type === 'temple') {
      this.hp = startCompleted ? 400 : 40;
      this.maxHp = 400;
      this.gridSize = 3;
    } else if (this.type === 'market') {
      this.hp = startCompleted ? 400 : 40;
      this.maxHp = 400;
      this.gridSize = 3;
    } else if (this.type === 'dock') {
      this.hp = startCompleted ? 400 : 40;
      this.maxHp = 400;
      this.gridSize = 3;
    } else if (this.type === 'mill') {
      this.hp = startCompleted ? 400 : 40;
      this.maxHp = 400;
      this.gridSize = 2;
    } else if (this.type === 'lumberCamp') {
      this.hp = startCompleted ? 300 : 30;
      this.maxHp = 300;
      this.gridSize = 2;
    } else if (this.type === 'miningCamp') {
      this.hp = startCompleted ? 300 : 30;
      this.maxHp = 300;
      this.gridSize = 2;
    } else if (this.type === 'farm') {
      this.hp = startCompleted ? 150 : 15;
      this.maxHp = 150;
      this.gridSize = 2;
      this.amount = 250;
      this.maxAmount = 250;
    } else if (this.type === 'palisadeWall') {
      this.hp = startCompleted ? 200 : 20;
      this.maxHp = 200;
      this.gridSize = 1;
    } else if (this.type === 'palisadeGate') {
      this.hp = startCompleted ? 400 : 40;
      this.maxHp = 400;
      this.gridSize = 2;
    } else if (this.type === 'stoneWall') {
      this.hp = startCompleted ? 1000 : 100;
      this.maxHp = 1000;
      this.gridSize = 1;
    } else if (this.type === 'stoneGate') {
      this.hp = startCompleted ? 2000 : 200;
      this.maxHp = 2000;
      this.gridSize = 2;
    } else if (this.type === 'watchTower') {
      this.hp = startCompleted ? 350 : 35;
      this.maxHp = 350;
      this.gridSize = 1;
      this.garrisonedUnits = [];
      this.maxGarrison = 5;
    } else if (this.type === 'blacksmith') {
      this.hp = startCompleted ? 400 : 40;
      this.maxHp = 400;
      this.gridSize = 3;
    } else if (this.type === 'university') {
      this.hp = startCompleted ? 600 : 60;
      this.maxHp = 600;
      this.gridSize = 3;
    } else if (this.type === 'siegeWorkshop') {
      this.hp = startCompleted ? 600 : 60;
      this.maxHp = 600;
      this.gridSize = 3;
    } else if (this.type === 'castle') {
      this.hp = startCompleted ? 3000 : 300;
      this.maxHp = 3000;
      this.gridSize = 4;
      this.garrisonedUnits = [];
      this.maxGarrison = 100;
    } else if (this.type === 'stable') {
      this.hp = startCompleted ? 500 : 50;
      this.maxHp = 500;
      this.gridSize = 3;
    } else if (this.type === 'archeryRange') {
      this.hp = startCompleted ? 500 : 50;
      this.maxHp = 500;
      this.gridSize = 3;
    } else if (this.type === 'monastery') {
      this.hp = startCompleted ? 400 : 40;
      this.maxHp = 400;
      this.gridSize = 3;
      this.relicsCount = 0;
    } else if (this.type === 'bombardTower') {
      this.hp = startCompleted ? 800 : 80;
      this.maxHp = 800;
      this.gridSize = 1;
    } else if (this.type === 'outpost') {
      this.hp = startCompleted ? 200 : 20;
      this.maxHp = 200;
      this.gridSize = 1;
    } else if (this.type === 'wonder') {
      this.hp = startCompleted ? 5000 : 500;
      this.maxHp = 5000;
      this.gridSize = 4;
    } else if (this.type === 'fishTrap') {
      this.hp = startCompleted ? 200 : 20;
      this.maxHp = 200;
      this.gridSize = 1;
      this.amount = Infinity; // Infinite fish node!
      this.maxAmount = Infinity;
    }

    // Apply Civilization building HP modifiers (e.g. Bizantium +25% building HP)
    const hpMult = this.civModifiers.hpBuilding || 1.0;
    this.maxHp = Math.round(this.maxHp * hpMult);
    this.hp = startCompleted ? this.maxHp : Math.round(this.hp * hpMult);
    
    this.id = 'building_' + Math.random().toString(36).substr(2, 9);
    
    // Position
    const y = this.gameManager.terrain.getGroundHeight(x, z);
    this.position = new THREE.Vector3(x, y, z);
    
    // Rally Point (where trained units go)
    this.rallyPoint = new THREE.Vector3(x, y, z + this.gridSize / 2 + 1.5);
    
    // Training Queue
    this.queue = [];
    this.trainingTimer = 0;
    this.trainingTime = this.type === 'townCenter' ? 8.0 : 12.0; // Villager vs Swordsman
    
    this.selected = false;
    this.selectionRing = null;
    
    this.initMesh();
  }

  initMesh() {
    this.civ = this.gameManager.players[this.playerId].civ || 'inggris';
    this.age = this.gameManager.players[this.playerId].age || 'dark';
    
    const player = this.gameManager.players[this.playerId];
    let upgradeLvl = 0;
    if (this.type === 'palisadeWall' || this.type === 'palisadeGate') {
      upgradeLvl = player ? (player.upgrades.palisadeWallUpgrade || 0) : 0;
    } else if (this.type === 'stoneWall' || this.type === 'stoneGate') {
      upgradeLvl = player ? (player.upgrades.stoneWallUpgrade || 0) : 0;
    } else if (this.type === 'watchTower') {
      upgradeLvl = player ? (player.upgrades.watchTowerUpgrade || 0) : 0;
    }

    this.mesh = this.gameManager.modelFactory.createBuildingMesh(this.type, this.playerId, this.civ, this.age, upgradeLvl);
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.rotationY || 0;
    this.mesh.userData = { entity: this };
    
    // Save original materials in all cases!
    this.mesh.traverse(child => {
      if (child.isMesh) {
        child.userData.originalMat = child.material;
      }
    });

    // Apply blueprint look if not completed
    if (!this.isCompleted) {
      this.mesh.traverse(child => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x88bbff,
            transparent: true,
            opacity: 0.45,
            wireframe: false,
            flatShading: true
          });
        }
      });
      // Lower building into ground slightly as "just started" look
      this.mesh.position.y = this.position.y - 1.0;
    }
    
    // Setup selection ring
    const ringGeom = new THREE.RingGeometry(this.gridSize * 0.7, this.gridSize * 0.75, 32);
    ringGeom.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      visible: false
    });
    this.selectionRing = new THREE.Mesh(ringGeom, ringMat);
    this.selectionRing.position.y = 0.05;
    this.mesh.add(this.selectionRing);
    
    this.gameManager.renderer.scene.add(this.mesh);

    // GLB swap: procedural shows instantly; 3D model replaces it when download finishes.
    // Works for all civilizations — no civ-specific branching needed.
    if (this.type === 'castle')    this._swapToGLB(() => this.gameManager.modelFactory.loadCastleGLB());
    if (this.type === 'stoneWall') this._swapToGLB(() => this.gameManager.modelFactory.loadStoneWallGLB());
    if (this.type === 'barracks')  this._swapToGLB(() => this.gameManager.modelFactory.loadFortressGLB());

    // Gate animation setup: find the animatable sub-group by name
    if (this.type === 'stoneGate' || this.type === 'palisadeGate') {
      this._gateMovable    = null;
      this._gateOpen       = false;
      this._gateCheckTimer = 0;
      this.mesh.traverse(child => {
        if (child.name === 'portcullis' || child.name === 'gatePanel') {
          this._gateMovable = child;
        }
      });
    }
  }

  async _swapToGLB(loader) {
    try {
      const glbRoot = await loader();
      if (this._destroyed || !this.mesh) return; // razed before GLB arrived

      const scene = this.gameManager.renderer.scene;
      glbRoot.position.copy(this.mesh.position);
      glbRoot.rotation.copy(this.mesh.rotation);
      glbRoot.userData = { entity: this };

      // Move selection ring to new mesh root
      if (this.selectionRing) {
        this.mesh.remove(this.selectionRing);
        glbRoot.add(this.selectionRing);
      }

      scene.remove(this.mesh);
      scene.add(glbRoot);
      this.mesh = glbRoot;

      // Attach animated team flag on top of castle GLB
      if (this.type === 'castle') {
        const factory = this.gameManager.modelFactory;
        const box = new THREE.Box3().setFromObject(glbRoot);
        const topY = box.max.y;

        const poleMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.8, roughness: 0.3 });
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.0, 6), poleMat);
        pole.position.set(0, topY + 1.0, 0);
        glbRoot.add(pole);

        const teamMat = factory.getTeamMaterial(this.playerId);
        const flagColor = teamMat ? teamMat.color.getHex() : 0xcc2222;
        const flagGeom = new THREE.PlaneGeometry(1.0, 0.55, 12, 5);
        const flagMesh = new THREE.Mesh(flagGeom, factory._makeFlagMaterial(flagColor, 0.5));
        flagMesh.position.set(0.5, topY + 2.0, 0);
        glbRoot.add(flagMesh);
      }
    } catch (_) {
      // GLB failed — procedural fallback stays silently
    }
  }

  setSelected(isSelected) {
    this.selected = isSelected;
    this.selectionRing.material.visible = isSelected;
  }

  // -------------------------------------------------------------
  // CONSTRUCTION LOGIC
  // -------------------------------------------------------------
  addBuildProgress(amount) {
    if (this.isCompleted) return;
    
    this.buildProgress = Math.min(100, this.buildProgress + amount);
    // Increase HP as construction proceeds
    this.hp = Math.round((this.buildProgress / 100) * this.maxHp);
    
    // Rise the building up as it builds
    this.mesh.position.y = this.position.y - (1.0 - (this.buildProgress / 100)) * 1.0;
    
    if (this.buildProgress >= 100) {
      this.completeConstruction();
    }
  }

  completeConstruction() {
    this.isCompleted = true;
    this.hp = this.maxHp;
    this.mesh.position.y = this.position.y;
    
    // Restore original materials
    this.mesh.traverse(child => {
      if (child.isMesh && child.userData.originalMat) {
        child.material.dispose();
        child.material = child.userData.originalMat;
      }
    });
    
    // Apply building effect
    if (this.type === 'farm') {
      const player = this.gameManager.players[this.playerId];
      const hc = player ? (player.upgrades.horseCollar || 0) : 0;
      const hp = player ? (player.upgrades.heavyPlow || 0) : 0;
      const cr = player ? (player.upgrades.cropRotation || 0) : 0;
      const extra = hc * 75 + hp * 125 + cr * 175;
      this.amount = 250 + extra;
      this.maxAmount = 250 + extra;
      if (this.mesh) {
        this.mesh.scale.set(1.0, 1.0, 1.0);
      }
    }
    
    if (this.type === 'house') {
      // Increase population limit
      this.gameManager.addPopulationLimit(this.playerId, 5);
    }

    if (this.type === 'wonder') {
      this.gameManager.startWonderCountdown(this.playerId);
    }
    
    // VFX & Audio
    this.gameManager.hud.showNotification(`${this.type.toUpperCase()} constructed!`);
    this.gameManager.soundManager.playClickSound('complete');
    
    // Update selection HUD if selected
    if (this.selected) {
      this.gameManager.hud.updateSelectionUI();
    }
  }

  // -------------------------------------------------------------
  // UNIT TRAINING & UPGRADES
  // -------------------------------------------------------------
  queueUnit(unitType) {
    if (!this.isCompleted) return;
    
    // Check costs
    const cost = this.gameManager.getUnitCost(unitType);
    if (!this.gameManager.hasResources(this.playerId, cost)) {
      if (this.playerId === 0) {
        this.gameManager.hud.showNotification("Not enough resources to train this unit!");
      }
      return;
    }
    
    // Check population cap
    const pop = this.gameManager.players[this.playerId].population;
    const popLimit = this.gameManager.players[this.playerId].populationLimit;
    if (pop >= popLimit) {
      if (this.playerId === 0) {
        this.gameManager.hud.showNotification("Population cap reached! Build houses.");
      }
      return;
    }
    
    // Deduct cost and add to queue
    this.gameManager.deductResources(this.playerId, cost);
    this.gameManager.players[this.playerId].population++;
    this.queue.push(unitType);
    
    if (this.selected && this.playerId === 0) {
      this.gameManager.hud.updateSelectionUI();
    }
    
    this.gameManager.soundManager.playClickSound('select');
  }

  queueUpgrade(upgradeType) {
    if (!this.isCompleted) return;
    
    const player = this.gameManager.players[this.playerId];
    const currentLevel = player.upgrades[upgradeType] || 0;
    
    if (currentLevel >= 3) {
      if (this.playerId === 0) {
        this.gameManager.hud.showNotification("Upgrade is already at maximum level!");
      }
      return;
    }
    
    let queuedCount = 0;
    for (const item of this.queue) {
      if (item === `upgrade_${upgradeType}`) {
        queuedCount++;
      }
    }
    const targetLevel = currentLevel + queuedCount;
    if (targetLevel >= 3) {
      if (this.playerId === 0) {
        this.gameManager.hud.showNotification("Cannot queue more of this upgrade (max level reached)!");
      }
      return;
    }

    const cost = this.gameManager.getUpgradeCost(upgradeType, targetLevel);
    if (!this.gameManager.hasResources(this.playerId, cost)) {
      if (this.playerId === 0) {
        this.gameManager.hud.showNotification("Not enough resources to research this upgrade!");
      }
      return;
    }
    
    this.gameManager.deductResources(this.playerId, cost);
    this.queue.push(`upgrade_${upgradeType}`);
    
    if (this.selected && this.playerId === 0) {
      this.gameManager.hud.updateSelectionUI();
    }
    
    this.gameManager.soundManager.playClickSound('select');
  }

  cancelQueue(index) {
    if (index >= this.queue.length) return;
    const item = this.queue[index];
    
    if (item.startsWith('upgrade_')) {
      const upgradeType = item.replace('upgrade_', '');
      let prevCount = 0;
      for (let i = 0; i < index; i++) {
        if (this.queue[i] === item) {
          prevCount++;
        }
      }
      const player = this.gameManager.players[this.playerId];
      const targetLevel = (player.upgrades[upgradeType] || 0) + prevCount;
      const cost = this.gameManager.getUpgradeCost(upgradeType, targetLevel);
      
      this.gameManager.depositResources(this.playerId, 'food', cost.food || 0);
      this.gameManager.depositResources(this.playerId, 'wood', cost.wood || 0);
      this.gameManager.depositResources(this.playerId, 'gold', cost.gold || 0);
      this.gameManager.depositResources(this.playerId, 'stone', cost.stone || 0);
    } else {
      const cost = this.gameManager.getUnitCost(item);
      this.gameManager.depositResources(this.playerId, 'food', cost.food || 0);
      this.gameManager.depositResources(this.playerId, 'wood', cost.wood || 0);
      this.gameManager.depositResources(this.playerId, 'gold', cost.gold || 0);
      this.gameManager.players[this.playerId].population--;
    }
    
    this.queue.splice(index, 1);
    
    if (index === 0) {
      this.trainingTimer = 0;
    }
    
    if (this.selected && this.playerId === 0) {
      this.gameManager.hud.updateSelectionUI();
    }
  }

  completeUpgrade() {
    const item = this.queue.shift();
    this.trainingTimer = 0;
    
    const upgradeType = item.replace('upgrade_', '');
    const player = this.gameManager.players[this.playerId];
    player.upgrades[upgradeType] = (player.upgrades[upgradeType] || 0) + 1;
    const newLevel = player.upgrades[upgradeType];
    
    const isUnitUpgrade = [
      'swordsmanUpgrade', 'archerUpgrade', 'knightUpgrade', 
      'footKnightUpgrade', 'heavyCavalryUpgrade', 'horseArcherUpgrade',
      'batteringRamUpgrade', 'mangonelUpgrade', 'scorpionUpgrade', 'bombardCannonUpgrade'
    ].includes(upgradeType);
    
    const isWallOrTowerUpgrade = [
      'palisadeWallUpgrade', 'stoneWallUpgrade', 'watchTowerUpgrade'
    ].includes(upgradeType);

    if (isUnitUpgrade) {
      const units = this.gameManager.entityManager.units;
      units.forEach(u => {
        if (u.playerId === this.playerId && u.state !== 'DEAD') {
          if (typeof u.recalculateStats === 'function') u.recalculateStats();
          if (typeof u.rebuildMesh === 'function') u.rebuildMesh();
        }
      });
    } else if (isWallOrTowerUpgrade) {
      const buildings = this.gameManager.entityManager.buildings;
      buildings.forEach(b => {
        if (b.playerId === this.playerId && b.isCompleted) {
          const typeMatch = 
            (upgradeType === 'palisadeWallUpgrade' && (b.type === 'palisadeWall' || b.type === 'palisadeGate')) ||
            (upgradeType === 'stoneWallUpgrade' && (b.type === 'stoneWall' || b.type === 'stoneGate')) ||
            (upgradeType === 'watchTowerUpgrade' && b.type === 'watchTower');
            
          if (typeMatch) {
            const oldMax = b.maxHp;
            if (b.type === 'palisadeWall') b.maxHp += 150;
            else if (b.type === 'palisadeGate') b.maxHp += 200;
            else if (b.type === 'stoneWall') b.maxHp += 500;
            else if (b.type === 'stoneGate') b.maxHp += 800;
            else if (b.type === 'watchTower') b.maxHp += 200;
            
            b.hp = Math.round(b.hp * (b.maxHp / oldMax));
            b.rebuildMesh();
          }
        }
      });
    } else {
      // Recalculate stats for standard upgrades
      const units = this.gameManager.entityManager.units;
      units.forEach(u => {
        if (u.playerId === this.playerId && u.state !== 'DEAD' && typeof u.recalculateStats === 'function') {
          u.recalculateStats();
        }
      });
    }
    
    if (this.playerId === 0) {
      let displayName = upgradeType.charAt(0).toUpperCase() + upgradeType.slice(1);
      if (upgradeType === 'attack') displayName = 'Melee Attack';
      if (upgradeType === 'armor') displayName = 'Armor';
      if (upgradeType === 'arrow') displayName = 'Arrow Range & Attack';
      else if (upgradeType === 'swordsmanUpgrade') displayName = newLevel === 1 ? 'Men-at-Arms' : 'Longswordsman';
      else if (upgradeType === 'archerUpgrade') displayName = newLevel === 1 ? 'Crossbowman' : 'Arbalest';
      else if (upgradeType === 'knightUpgrade') displayName = newLevel === 1 ? 'Cavalier' : 'Paladin';
      else if (upgradeType === 'footKnightUpgrade') displayName = newLevel === 1 ? 'Champion Foot Knight' : 'Elite Foot Knight';
      else if (upgradeType === 'heavyCavalryUpgrade') displayName = newLevel === 1 ? 'Cataphract' : 'Elite Heavy Cavalry';
      else if (upgradeType === 'horseArcherUpgrade') displayName = newLevel === 1 ? 'Heavy Cavalry Archer' : 'Elite Horse Archer';
      else if (upgradeType === 'palisadeWallUpgrade') displayName = newLevel === 1 ? 'Reinforced Palisade' : 'Fortified Palisade';
      else if (upgradeType === 'stoneWallUpgrade') displayName = newLevel === 1 ? 'Fortified Wall' : 'Bastion Wall';
      else if (upgradeType === 'watchTowerUpgrade') displayName = newLevel === 1 ? 'Guard Tower' : 'Keep';
      else if (upgradeType === 'batteringRamUpgrade') displayName = newLevel === 1 ? 'Capped Ram' : 'Siege Ram';
      else if (upgradeType === 'mangonelUpgrade') displayName = newLevel === 1 ? 'Onager' : 'Siege Onager';
      else if (upgradeType === 'scorpionUpgrade') displayName = 'Heavy Scorpion';
      else if (upgradeType === 'bombardCannonUpgrade') displayName = 'Houfnice';
      
      this.gameManager.hud.showNotification(`${displayName} Upgrade Completed! ⚔️`);
      this.gameManager.soundManager.playClickSound('complete');
      this.gameManager.hud.updateSelectionUI();
    }
  }

  rebuildMesh() {
    if (this.mesh) {
      this.gameManager.renderer.scene.remove(this.mesh);
      this.mesh.traverse(child => {
        if (child.isMesh) {
          child.geometry.dispose();
          if (child.material && typeof child.material.dispose === 'function') {
            child.material.dispose();
          }
        }
      });
    }
    this.initMesh();
    this.setSelected(this.selected);
  }

  getDisplayName() {
    const player = this.gameManager.players[this.playerId];
    const level = player ? (player.upgrades[this.type + 'Upgrade'] || 0) : 0;
    
    if (this.type === 'palisadeWall') {
      if (level === 1) return 'Reinforced Palisade';
      if (level >= 2) return 'Fortified Palisade';
      return 'Palisade Wall';
    }
    if (this.type === 'palisadeGate') {
      if (level === 1) return 'Reinforced Palisade Gate';
      if (level >= 2) return 'Fortified Palisade Gate';
      return 'Palisade Gate';
    }
    if (this.type === 'stoneWall') {
      if (level === 1) return 'Fortified Wall';
      if (level >= 2) return 'Bastion Wall';
      return 'Stone Wall';
    }
    if (this.type === 'stoneGate') {
      if (level === 1) return 'Fortified Gate';
      if (level >= 2) return 'Bastion Gate';
      return 'Stone Gate';
    }
    if (this.type === 'watchTower') {
      if (level === 1) return 'Guard Tower';
      if (level >= 2) return 'Keep';
      return 'Watchtower';
    }
    if (this.type === 'barracks') return 'Military Barracks';
    if (this.type === 'university') return 'University';
    if (this.type === 'siegeWorkshop') return 'Siege Workshop';
    if (this.type === 'stable') return 'Stable';
    if (this.type === 'archeryRange') return 'Archery Range';
    if (this.type === 'monastery') return 'Monastery';
    if (this.type === 'bombardTower') return 'Bombard Tower';
    
    return this.type.charAt(0).toUpperCase() + this.type.slice(1);
  }

  garrisonUnit(unit) {
    if (this.garrisonedUnits === undefined) {
      this.garrisonedUnits = [];
    }
    const maxG = this.maxGarrison || 100;
    if (this.garrisonedUnits.length >= maxG) {
      if (unit.playerId === 0) {
        this.gameManager.hud.showNotification(`${this.getDisplayName()} is full (Max ${maxG} garrisoned units)!`);
      }
      return false;
    }
    
    this.garrisonedUnits.push(unit);
    
    unit.state = 'GARRISONED';
    unit.mesh.visible = false;
    unit.setSelected(false);
    
    const idx = this.gameManager.selectedEntities.indexOf(unit);
    if (idx !== -1) {
      this.gameManager.selectedEntities.splice(idx, 1);
      this.gameManager.hud.updateSelectionUI();
    }
    
    if (this.playerId === 0) {
      this.gameManager.hud.showNotification(`Garrisoned ${unit.type} in ${this.getDisplayName()}! (${this.garrisonedUnits.length}/${maxG})`);
      if (this.selected) {
        this.gameManager.hud.updateSelectionUI();
      }
    }
    
    return true;
  }

  ungarrisonAll() {
    if (!this.garrisonedUnits || this.garrisonedUnits.length === 0) return;
    
    const count = this.garrisonedUnits.length;
    this.garrisonedUnits.forEach(unit => {
      unit.state = 'IDLE';
      unit.mesh.visible = true;
      
      const angle = Math.random() * Math.PI * 2;
      const dist = (this.gridSize / 2) + 1.0;
      unit.position.set(
        this.position.x + Math.cos(angle) * dist,
        this.gameManager.terrain.getGroundHeight(this.position.x + Math.cos(angle) * dist, this.position.z + Math.sin(angle) * dist),
        this.position.z + Math.sin(angle) * dist
      );
      unit.targetPosition.copy(unit.position);
      unit.mesh.position.copy(unit.position);
    });
    
    this.garrisonedUnits = [];
    
    if (this.playerId === 0) {
      this.gameManager.hud.showNotification(`Ungarrisoned all ${count} units from ${this.getDisplayName()}!`);
      if (this.selected) {
        this.gameManager.hud.updateSelectionUI();
      }
    }
    this.gameManager.soundManager.playClickSound('complete');
  }

  // ─── Gate open/close animation ───────────────────────────────────────────
  _checkGateProximity() {
    const units = this.gameManager.entityManager.units;
    const radius = this.type === 'stoneGate' ? 4.5 : 3.5;
    for (let i = 0; i < units.length; i++) {
      const u = units[i];
      if (u.state === 'DEAD' || u.state === 'GARRISONED') continue;
      if (!this.gameManager.isEnemy(this.playerId, u.playerId)) {
        if (this.position.distanceTo(u.position) <= radius) {
          this._gateOpen = true;
          return;
        }
      }
    }
    this._gateOpen = false;
  }

  _animateGate(dt) {
    if (!this._gateMovable) return;
    const openY = this.type === 'stoneGate' ? 1.78 : 1.35;
    const targetY = this._gateOpen ? openY : 0;
    const curr    = this._gateMovable.position.y;
    const diff    = targetY - curr;
    if (Math.abs(diff) < 0.003) { this._gateMovable.position.y = targetY; return; }
    // 4 units/sec rise/fall speed
    this._gateMovable.position.y += Math.sign(diff) * Math.min(Math.abs(diff), 4.0 * dt);
  }

  update(deltaTime) {
    if (!this.isCompleted) return;

    // Gate proximity + smooth slide animation (both gate types)
    if (this._gateMovable) {
      this._gateCheckTimer += deltaTime;
      if (this._gateCheckTimer >= 0.35) {
        this._gateCheckTimer = 0;
        this._checkGateProximity();
      }
      this._animateGate(deltaTime);
    }

    // Defensive attack logic for Town Center, Watchtower, and Castle
    if (this.type === 'townCenter' || this.type === 'watchTower' || this.type === 'castle' || this.type === 'bombardTower') {
      if (this.attackCooldown === undefined) this.attackCooldown = 0;
      if (this.attackCooldown > 0) {
        this.attackCooldown -= deltaTime;
      }
      
      if (this.attackCooldown <= 0) {
        const arrowLevel = (this.gameManager.players[this.playerId].upgrades?.arrow || 0);
        
        let range = 14;
        if (this.type === 'watchTower') range = 18;
        else if (this.type === 'castle') range = 22;
        else if (this.type === 'bombardTower') range = 20;
        range += arrowLevel * 2;
        
        let targetUnit = null;
        let minDist = Infinity;
        
        const units = this.gameManager.entityManager.units;
        for (let i = 0; i < units.length; i++) {
          const u = units[i];
          if (u.hp <= 0 || u.state === 'DEAD' || u.state === 'GARRISONED') continue;
          
          const isEnemy = this.gameManager.isEnemy(this.playerId, u.playerId);
          
          if (isEnemy) {
            const dist = this.position.distanceTo(u.position);
            if (dist <= range && dist < minDist) {
              minDist = dist;
              targetUnit = u;
            }
          }
        }
        
        if (targetUnit) {
          if (this.type === 'bombardTower') {
            this.attackCooldown = 3.0;
            const fromPos = this.position.clone();
            fromPos.y += 3.5;
            this.gameManager.spawnProjectile(fromPos, targetUnit.position, 'cannonball');
            this.gameManager.soundManager.playClickSound('hit');
            
            const damage = 120;
            targetUnit.takeDamage(damage, this.playerId);
            this.gameManager.spawnParticles(targetUnit.position, 0xff5500, 8, 0.12);
            
            const rangeRadius = 2.0;
            const targetPos = targetUnit.position;
            units.forEach(u => {
              if (u.hp > 0 && this.gameManager.isEnemy(this.playerId, u.playerId) && u.position.distanceTo(targetPos) <= rangeRadius && u !== targetUnit) {
                u.takeDamage(Math.round(damage * 0.5), this.playerId);
              }
            });
          } else {
            this.attackCooldown = (this.type === 'castle' ? 1.2 : 1.5);
            
            let arrowCount = 1;
            if (this.type === 'castle') {
              const garrisonedCount = (this.garrisonedUnits ? this.garrisonedUnits.length : 0);
              arrowCount = 1 + Math.floor(garrisonedCount / 4);
              if (arrowCount > 15) arrowCount = 15;
            }
            
            for (let a = 0; a < arrowCount; a++) {
              let arrowTarget = targetUnit;
              if (a > 0) {
                const nearbyEnemies = [];
                for (let i = 0; i < units.length; i++) {
                  const u = units[i];
                  if (u.hp <= 0 || u.state === 'DEAD' || u.state === 'GARRISONED') continue;
                  const isEnemy = this.gameManager.isEnemy(this.playerId, u.playerId);
                  if (isEnemy && this.position.distanceTo(u.position) <= range) {
                    nearbyEnemies.push(u);
                  }
                }
                if (nearbyEnemies.length > 0) {
                  arrowTarget = nearbyEnemies[Math.floor(Math.random() * nearbyEnemies.length)];
                }
              }
              
              if (arrowTarget) {
                const fromPos = this.position.clone();
                if (this.type === 'watchTower') {
                  fromPos.y += 3.5;
                } else if (this.type === 'townCenter') {
                  fromPos.y += 2.5;
                } else if (this.type === 'castle') {
                  fromPos.y += 4.5;
                }
                
                if (a === 0) {
                  this.gameManager.spawnArrow(fromPos, arrowTarget.position);
                  this.gameManager.soundManager.playClickSound('arrow');
                  const baseDmg = (this.type === 'castle' ? 20 : 10);
                  const damage = baseDmg + arrowLevel * 3;
                  arrowTarget.takeDamage(damage, this.playerId);
                  this.gameManager.spawnParticles(arrowTarget.position, 0xbb1111, 4, 0.08);
                } else {
                  setTimeout(() => {
                    if (!this.gameManager.gameActive) return;
                    if (arrowTarget.hp <= 0 || arrowTarget.state === 'DEAD') return;
                    this.gameManager.spawnArrow(fromPos, arrowTarget.position);
                    this.gameManager.soundManager.playClickSound('arrow');
                    const baseDmg = (this.type === 'castle' ? 20 : 10);
                    const damage = baseDmg + arrowLevel * 3;
                    arrowTarget.takeDamage(damage, this.playerId);
                    this.gameManager.spawnParticles(arrowTarget.position, 0xbb1111, 4, 0.08);
                  }, a * 120);
                }
              }
            }
          }
        }
      }
    }
    
    // Windmill sails animation
    if (this.type === 'mill' && this.mesh) {
      const sails = this.mesh.getObjectByName("sails");
      if (sails) {
        sails.rotation.z += 1.0 * deltaTime; // rotate 1 radian per second
      }
    }
    
    // Handle training queue
    if (this.queue.length > 0) {
      const nextUnit = this.queue[0];
      const isUpgrade = nextUnit.startsWith('upgrade_');
      let baseTime = 12.0;
      let speedMult = 1.0;

      if (isUpgrade) {
        baseTime = 10.0;
      } else {
        // Apply Civilization training speed modifiers (Persian villagers, Aztec soldiers)
        if (this.civModifiers) {
          if (nextUnit === 'villager') {
            speedMult = this.civModifiers.trainSpeedVillager || 1.0;
          } else if (['swordsman', 'priest', 'archer', 'knight', 'footKnight', 'heavyCavalry', 'horseArcher'].includes(nextUnit)) {
            speedMult = this.civModifiers.trainSpeedMilitary || 1.0;
          }
        }
        baseTime = (this.type === 'temple' || this.type === 'market') ? 10.0 : (this.type === 'townCenter' ? 8.0 : 12.0);
      }
      
      this.trainingTime = baseTime / speedMult;
      this.trainingTimer += deltaTime;
      
      // Update UI queue bar if selected
      if (this.selected && this.playerId === 0) {
        const progressPercent = Math.min(100, (this.trainingTimer / this.trainingTime) * 100);
        this.gameManager.hud.updateQueueProgress(progressPercent);
      }
      
      if (this.trainingTimer >= this.trainingTime) {
        if (isUpgrade) {
          this.completeUpgrade();
        } else {
          this.spawnTrainedUnit();
        }
      }
    }
  }

  spawnTrainedUnit() {
    const unitType = this.queue.shift();
    this.trainingTimer = 0;
    
    // Spawn just outside the building footprint (offset slightly)
    let spawnX = this.position.x;
    let spawnZ = this.position.z + this.gridSize / 2 + 0.8;
    
    if (['fishingShip', 'transportShip', 'galley', 'fireShip', 'demolitionShip', 'cannonGalleon'].includes(unitType)) {
      let foundWater = false;
      const offsets = [
        [0, 2], [2, 0], [0, -2], [-2, 0],
        [2, 2], [2, -2], [-2, 2], [-2, -2]
      ];
      for (const [ox, oz] of offsets) {
        const tx = this.position.x + ox;
        const tz = this.position.z + oz;
        if (this.gameManager.terrain.getGroundHeight(tx, tz) < -0.5) {
          spawnX = tx;
          spawnZ = tz;
          foundWater = true;
          break;
        }
      }
      if (!foundWater) {
        spawnX = this.position.x;
        spawnZ = this.position.z;
      }
    }
    
    const unit = this.gameManager.entityManager.createUnit(unitType, this.playerId, spawnX, spawnZ);
    
    // Order to move to rally point
    if (unitType === 'fishingShip') {
      let rallyX = this.rallyPoint.x;
      let rallyZ = this.rallyPoint.z;
      if (this.gameManager.terrain.getGroundHeight(rallyX, rallyZ) >= -0.5) {
        rallyX = spawnX;
        rallyZ = spawnZ;
      }
      unit.commandMove(new THREE.Vector3(rallyX, 0, rallyZ));
    } else {
      unit.commandMove(this.rallyPoint);
    }
    
    if (this.playerId === 0) {
      this.gameManager.hud.showNotification(`${unitType.toUpperCase()} trained!`);
      this.gameManager.soundManager.playClickSound('spawn');
    }
    
    // Refresh selection panel if player clicked this TC/Barracks
    if (this.selected && this.playerId === 0) {
      this.gameManager.hud.updateSelectionUI();
    }
  }

  takeDamage(amount, attackerPlayerId = null) {
    if (this.hp <= 0) return;
    this.hp = Math.max(0, this.hp - amount);
    
    // Floating damage numbers
    this.gameManager.hud.showFloatingText(this.position, `-${amount}`, 0xff5500);
    
    // Attack warning trigger for player
    if (this.playerId === 0) {
      const now = performance.now();
      if (!this.gameManager.lastAttackNotificationTime) this.gameManager.lastAttackNotificationTime = 0;
      if (now - this.gameManager.lastAttackNotificationTime > 12000) {
        this.gameManager.lastAttackNotificationTime = now;
        this.gameManager.hud.showNotification(`⚠️ Kota/Bangunan Anda sedang diserang!`, this.position);
        this.gameManager.soundManager.playClickSound('select');
      }
    }
    
    if (this.hp <= 0) {
      if (attackerPlayerId !== null && this.gameManager.players[attackerPlayerId]) {
        this.gameManager.players[attackerPlayerId].kills = (this.gameManager.players[attackerPlayerId].kills || 0) + 1;
      }
      this.destroy();
    }
  }

  destroy() {
    this._destroyed = true;
    if (this.garrisonedUnits && this.garrisonedUnits.length > 0) {
      this.ungarrisonAll();
    }
    this.gameManager.renderer.scene.remove(this.mesh);
    this.mesh.traverse(child => {
      if (child.isMesh) {
        child.geometry.dispose();
        child.material.dispose();
      }
    });
    
    // Remove from population cap if house
    if (this.type === 'house' && this.isCompleted) {
      this.gameManager.addPopulationLimit(this.playerId, -5);
    }

    if (this.type === 'wonder' && this.isCompleted) {
      this.gameManager.cancelWonderCountdown(this.playerId);
    }
    
    // Refund training queue
    while (this.queue.length > 0) {
      this.cancelQueue(0);
    }
    
    this.gameManager.entityManager.removeBuilding(this);
    this.gameManager.gridRemoveBuilding(this);
    
    // Trigger win/loss conditions
    if (this.type === 'townCenter') {
      this.gameManager.onTownCenterDestroyed(this.playerId);
    }
    
    // Deselect if selected
    if (this.selected) {
      this.gameManager.deselectAll();
    }
  }

  gather(gatherRate) {
    if (this.type !== 'farm' && this.type !== 'fishTrap') return 0;
    if (this.type === 'fishTrap') return gatherRate; // Infinite fish trap node!
    
    const toGather = Math.min(this.amount, gatherRate);
    this.amount -= toGather;
    
    const scaleFactor = 0.3 + 0.7 * (this.amount / this.maxAmount);
    if (this.mesh) {
      const crops = this.mesh.getObjectByName("crops");
      if (crops) {
        crops.scale.y = scaleFactor;
      } else {
        this.mesh.scale.set(1.0, scaleFactor, 1.0);
      }
    }
    
    if (this.amount <= 0) {
      this.amount = 0;
      
      const reseedCost = { wood: 60 };
      if (this.gameManager.hasResources(this.playerId, reseedCost)) {
        this.gameManager.deductResources(this.playerId, reseedCost);
        const player = this.gameManager.players[this.playerId];
        const hc = player ? (player.upgrades.horseCollar || 0) : 0;
        const hp = player ? (player.upgrades.heavyPlow || 0) : 0;
        const cr = player ? (player.upgrades.cropRotation || 0) : 0;
        this.amount = 250 + hc * 75 + hp * 125 + cr * 175;
        this.isCompleted = true;
        this.buildProgress = 100;
        this.hp = this.maxHp;
        
        if (this.mesh) {
          const crops = this.mesh.getObjectByName("crops");
          if (crops) {
            crops.scale.y = 1.0;
          } else {
            this.mesh.scale.set(1.0, 1.0, 1.0);
          }
          
          this.mesh.traverse(child => {
            if (child.isMesh && child.userData.originalMat) {
              child.material = child.userData.originalMat;
            }
          });
        }
        
        if (this.playerId === 0) {
          this.gameManager.soundManager.playClickSound('complete');
          this.gameManager.hud.showNotification("Farm automatically reseeded! (60 Wood)");
          this.gameManager.hud.showFloatingText(this.position, "-60 Wood 🪵", 0xd48030);
        }
      } else {
        this.isCompleted = false;
        this.buildProgress = 0;
        this.hp = 10;
        
        if (this.mesh) {
          this.mesh.traverse(child => {
            if (child.isMesh && child.userData.originalMat) {
              child.material = new THREE.MeshStandardMaterial({
                color: 0x5a4a3a,
                transparent: true,
                opacity: 0.6
              });
            }
          });
        }
        
        if (this.playerId === 0) {
          this.gameManager.soundManager.playClickSound('complete');
          this.gameManager.hud.showNotification("A Farm has been depleted and cannot be reseeded (needs 60 Wood)!");
        }
      }
    }
    return toGather;
  }

  ringBell() {
    if (this.type !== 'townCenter') return;
    const villagers = this.gameManager.entityManager.units.filter(u => 
      u.playerId === this.playerId && u.type === 'villager' && u.state !== 'DEAD' && u.state !== 'GARRISONED' &&
      u.position.distanceTo(this.position) < 30.0
    );
    let count = 0;
    for (const v of villagers) {
      if (this.garrisonedUnits.length >= this.maxGarrison) break;
      v.commandGarrison(this);
      count++;
    }
    this.gameManager.soundManager.playClickSound('bell');
    if (this.playerId === 0 && this.gameManager.hud) {
      this.gameManager.hud.showNotification(`Lonceng kota dibunyikan! ${count} villager berlindung.`);
    }
  }
}
