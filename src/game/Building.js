import * as THREE from 'three';
import { CIVILIZATIONS } from './ModelFactory';

export class Building {
  constructor(gameManager, type, playerId, x, z, startCompleted = false) {
    this.gameManager = gameManager;
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
    } else if (this.type === 'blacksmith') {
      this.hp = startCompleted ? 400 : 40;
      this.maxHp = 400;
      this.gridSize = 3;
    } else if (this.type === 'castle') {
      this.hp = startCompleted ? 3000 : 300;
      this.maxHp = 3000;
      this.gridSize = 4;
      this.garrisonedUnits = [];
      this.maxGarrison = 100;
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
    this.mesh = this.gameManager.modelFactory.createBuildingMesh(this.type, this.playerId, this.civ, this.age);
    this.mesh.position.copy(this.position);
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
      this.amount = 250;
      this.maxAmount = 250;
      if (this.mesh) {
        this.mesh.scale.set(1.0, 1.0, 1.0);
      }
    }
    
    if (this.type === 'house') {
      // Increase population limit
      this.gameManager.addPopulationLimit(this.playerId, 5);
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
      this.gameManager.depositResources(this.playerId, 'gold', cost.gold || 0);
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
    
    // Recalculate stats for all existing units of this player
    const units = this.gameManager.entityManager.units;
    units.forEach(u => {
      if (u.playerId === this.playerId && u.state !== 'DEAD' && typeof u.recalculateStats === 'function') {
        u.recalculateStats();
      }
    });
    
    if (this.playerId === 0) {
      let displayName = upgradeType.charAt(0).toUpperCase() + upgradeType.slice(1);
      if (upgradeType === 'attack') displayName = 'Melee Attack';
      if (upgradeType === 'armor') displayName = 'Armor';
      if (upgradeType === 'arrow') displayName = 'Arrow Range & Attack';
      
      this.gameManager.hud.showNotification(`${displayName} Upgrade Completed (Level ${newLevel})! ⚔️`);
      this.gameManager.soundManager.playClickSound('complete');
      this.gameManager.hud.updateSelectionUI();
    }
  }

  garrisonUnit(unit) {
    if (this.garrisonedUnits === undefined) {
      this.garrisonedUnits = [];
    }
    if (this.garrisonedUnits.length >= (this.maxGarrison || 100)) {
      if (unit.playerId === 0) {
        this.gameManager.hud.showNotification("Castle is full (Max 100 garrisoned units)!");
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
      this.gameManager.hud.showNotification(`Garrisoned ${unit.type} in Castle! (${this.garrisonedUnits.length}/100)`);
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
      this.gameManager.hud.showNotification(`Ungarrisoned all ${count} units from Castle!`);
      if (this.selected) {
        this.gameManager.hud.updateSelectionUI();
      }
    }
    this.gameManager.soundManager.playClickSound('complete');
  }

  update(deltaTime) {
    if (!this.isCompleted) return;

    // Defensive attack logic for Town Center, Watchtower, and Castle
    if (this.type === 'townCenter' || this.type === 'watchTower' || this.type === 'castle') {
      if (this.attackCooldown === undefined) this.attackCooldown = 0;
      if (this.attackCooldown > 0) {
        this.attackCooldown -= deltaTime;
      }
      
      if (this.attackCooldown <= 0) {
        const arrowLevel = (this.gameManager.players[this.playerId].upgrades?.arrow || 0);
        
        let range = 14;
        if (this.type === 'watchTower') range = 18;
        else if (this.type === 'castle') range = 22;
        range += arrowLevel * 2;
        
        let targetUnit = null;
        let minDist = Infinity;
        
        const units = this.gameManager.entityManager.units;
        for (let i = 0; i < units.length; i++) {
          const u = units[i];
          if (u.hp <= 0 || u.state === 'DEAD' || u.state === 'GARRISONED') continue;
          
          let isEnemy = false;
          if (this.playerId === 0 || this.playerId === 2) {
            isEnemy = (u.playerId === 1);
          } else if (this.playerId === 1) {
            isEnemy = (u.playerId === 0 || u.playerId === 2);
          }
          
          if (isEnemy) {
            const dist = this.position.distanceTo(u.position);
            if (dist <= range && dist < minDist) {
              minDist = dist;
              targetUnit = u;
            }
          }
        }
        
        if (targetUnit) {
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
                let isEnemy = false;
                if (this.playerId === 0 || this.playerId === 2) {
                  isEnemy = (u.playerId === 1);
                } else if (this.playerId === 1) {
                  isEnemy = (u.playerId === 0 || u.playerId === 2);
                }
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
                arrowTarget.takeDamage(damage);
                this.gameManager.spawnParticles(arrowTarget.position, 0xbb1111, 4, 0.08);
              } else {
                setTimeout(() => {
                  if (!this.gameManager.gameActive) return;
                  if (arrowTarget.hp <= 0 || arrowTarget.state === 'DEAD') return;
                  this.gameManager.spawnArrow(fromPos, arrowTarget.position);
                  this.gameManager.soundManager.playClickSound('arrow');
                  const baseDmg = (this.type === 'castle' ? 20 : 10);
                  const damage = baseDmg + arrowLevel * 3;
                  arrowTarget.takeDamage(damage);
                  this.gameManager.spawnParticles(arrowTarget.position, 0xbb1111, 4, 0.08);
                }, a * 120);
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
    
    if (unitType === 'fishingShip') {
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

  takeDamage(amount) {
    if (this.hp <= 0) return;
    this.hp = Math.max(0, this.hp - amount);
    
    // Floating damage numbers
    this.gameManager.hud.showFloatingText(this.position, `-${amount}`, 0xff5500);
    
    if (this.hp <= 0) {
      this.destroy();
    }
  }

  destroy() {
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
    if (this.type !== 'farm') return 0;
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
        this.amount = 250;
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
}
