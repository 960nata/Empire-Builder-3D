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
    this.age = this.gameManager.players[this.playerId].age || 'dark';
    this.mesh = this.gameManager.modelFactory.createBuildingMesh(this.type, this.playerId, this.age);
    this.mesh.position.copy(this.position);
    this.mesh.userData = { entity: this };
    
    // Apply blueprint look if not completed
    if (!this.isCompleted) {
      this.mesh.traverse(child => {
        if (child.isMesh) {
          // Keep structure but make semi-transparent greyish-blue
          child.userData.originalMat = child.material;
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
  // UNIT TRAINING
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

  cancelQueue(index) {
    if (index >= this.queue.length) return;
    const unitType = this.queue[index];
    const cost = this.gameManager.getUnitCost(unitType);
    
    // Refund resource, decrease pop, remove from queue
    this.gameManager.depositResources(this.playerId, 'food', cost.food || 0);
    this.gameManager.depositResources(this.playerId, 'wood', cost.wood || 0);
    this.gameManager.depositResources(this.playerId, 'gold', cost.gold || 0);
    this.gameManager.players[this.playerId].population--;
    
    this.queue.splice(index, 1);
    
    if (index === 0) {
      this.trainingTimer = 0;
    }
    
    if (this.selected && this.playerId === 0) {
      this.gameManager.hud.updateSelectionUI();
    }
  }

  // -------------------------------------------------------------
  // UPDATE LOOP
  // -------------------------------------------------------------
  update(deltaTime) {
    if (!this.isCompleted) return;
    
    // Handle training queue
    if (this.queue.length > 0) {
      const nextUnit = this.queue[0];
      
      // Apply Civilization training speed modifiers (Persian villagers, Aztec soldiers)
      let speedMult = 1.0;
      if (this.civModifiers) {
        if (nextUnit === 'villager') {
          speedMult = this.civModifiers.trainSpeedVillager || 1.0;
        } else if (nextUnit === 'swordsman' || nextUnit === 'priest') {
          speedMult = this.civModifiers.trainSpeedMilitary || 1.0;
        }
      }
      
      const baseTime = (this.type === 'temple' || this.type === 'market') ? 10.0 : (this.type === 'townCenter' ? 8.0 : 12.0);
      this.trainingTime = baseTime / speedMult;
      
      this.trainingTimer += deltaTime;
      
      // Update UI queue bar if selected
      if (this.selected && this.playerId === 0) {
        const progressPercent = Math.min(100, (this.trainingTimer / this.trainingTime) * 100);
        this.gameManager.hud.updateQueueProgress(progressPercent);
      }
      
      if (this.trainingTimer >= this.trainingTime) {
        this.spawnTrainedUnit();
      }
    }
  }

  spawnTrainedUnit() {
    const unitType = this.queue.shift();
    this.trainingTimer = 0;
    
    // Spawn just outside the building footprint (offset slightly)
    const spawnX = this.position.x;
    const spawnZ = this.position.z + this.gridSize / 2 + 0.8;
    
    const unit = this.gameManager.entityManager.createUnit(unitType, this.playerId, spawnX, spawnZ);
    
    // Order to move to rally point
    unit.commandMove(this.rallyPoint);
    
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
}
