import * as THREE from 'three';
import { CIVILIZATIONS } from './ModelFactory';

export class Unit {
  constructor(gameManager, type, playerId, x, z) {
    this.gameManager = gameManager;
    this.type = type; // 'villager', 'swordsman', 'priest', 'trader'
    this.playerId = playerId; // 0: Player, 1: Enemy, 2: Ally, 3: Neutral
    
    const playerCiv = this.gameManager.players[this.playerId].civ || 'inggris';
    const civModifiers = (CIVILIZATIONS && CIVILIZATIONS[playerCiv]) 
      ? CIVILIZATIONS[playerCiv].modifiers 
      : { speedInfantry: 1.0, hpInfantry: 1.0, gatherWood: 1.0, gatherFood: 1.0, gatherStone: 1.0, cargoSize: 0, buildSpeed: 1.0 };

    this.civModifiers = civModifiers;

    // Stats
    if (this.type === 'villager') {
      this.hp = 50;
      this.maxHp = 50;
      this.speed = 3.5;
      this.attackPower = 2;
      this.attackCooldown = 1.2; // seconds
      this.attackRange = 1.0;
    } else if (this.type === 'swordsman') {
      this.hp = Math.round(90 * (civModifiers.hpInfantry || 1.0));
      this.maxHp = this.hp;
      this.speed = 2.8 * (civModifiers.speedInfantry || 1.0);
      this.attackPower = 12;
      this.attackCooldown = 0.8;
      this.attackRange = 1.1;
    } else if (this.type === 'priest') {
      this.hp = 60;
      this.maxHp = 60;
      this.speed = 2.5;
      this.attackPower = 0;
      this.attackCooldown = 1.5;
      this.attackRange = 3.5; // healing range
      this.conversionCooldown = 0;
      this.scanTimer = 0;
    } else if (this.type === 'trader') {
      this.hp = 80;
      this.maxHp = 80;
      this.speed = 3.2;
      this.attackPower = 0;
      this.attackCooldown = 1.0;
      this.attackRange = 1.0;
    }
    
    // Apply Civilization modifiers
    if (this.type === 'swordsman') {
      const hpMult = civModifiers.hpInfantry || 1.0;
      const speedMult = civModifiers.speedInfantry || 1.0;
      const dmgMult = civModifiers.damageInfantry || 1.0;
      
      this.maxHp = Math.round(this.maxHp * hpMult);
      this.hp = this.maxHp;
      this.speed = this.speed * speedMult;
      this.attackPower = Math.round(this.attackPower * dmgMult);
    }
    
    this.id = 'unit_' + Math.random().toString(36).substr(2, 9);
    
    // Position & movement
    const y = this.gameManager.terrain.getGroundHeight(x, z);
    this.position = new THREE.Vector3(x, y, z);
    this.targetPosition = new THREE.Vector3(x, y, z);
    
    // State machine
    // States: IDLE, MOVING, HARVESTING, RETURNING, BUILDING, CHASING, ATTACKING, DEAD, HEALING, CONVERTING, TRADING_LOAD, TRADING_RETURN
    this.state = 'IDLE';
    this.targetEntity = null;
    this.targetAction = null; // Used during movement to define what to do upon arrival
    
    // Harvesting / Trading inventory
    const cargoBonus = civModifiers.cargoSize || 0;
    this.inventory = { type: null, amount: 0, max: 15 + cargoBonus };
    this.harvestTimer = 0;
    this.harvestRate = 5; // how many resources gathered per tick
    
    // Combat / Ability
    this.attackTimer = 0;
    this.conversionTimer = 0;
    this.conversionCooldown = 0;
    
    // Building
    this.buildTimer = 0;
    
    // Selection ring
    this.selectionRing = null;
    this.selected = false;
    
    // Animations
    this.animTime = Math.random() * 10;
    this.swingProgress = 0;
    
    this.initMesh();
  }

  initMesh() {
    this.age = this.gameManager.players[this.playerId].age || 'dark';
    this.mesh = this.gameManager.modelFactory.createUnitMesh(this.type, this.playerId, this.age);
    this.mesh.position.copy(this.position);
    this.mesh.userData = { entity: this };
    
    // Setup selection ring (initially invisible)
    const ringGeom = new THREE.RingGeometry(0.5, 0.6, 16);
    ringGeom.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00ffcc,
      side: THREE.DoubleSide,
      visible: false
    });
    this.selectionRing = new THREE.Mesh(ringGeom, ringMat);
    this.selectionRing.position.y = 0.02; // just above ground
    this.mesh.add(this.selectionRing);
    
    this.sceneMeshRef = this.gameManager.renderer.scene.add(this.mesh);
  }

  setSelected(isSelected) {
    this.selected = isSelected;
    this.selectionRing.material.visible = isSelected;
  }

  // -------------------------------------------------------------
  // COMMAND ACTIONS
  // -------------------------------------------------------------
  commandMove(targetPos) {
    if (this.state === 'DEAD') return;
    this.state = 'MOVING';
    this.targetPosition.copy(targetPos);
    this.targetPosition.y = this.gameManager.terrain.getGroundHeight(targetPos.x, targetPos.z);
    this.targetEntity = null;
    this.targetAction = null;
  }

  commandGather(resourceNode) {
    if (this.state === 'DEAD') return;
    this.targetEntity = resourceNode;
    this.targetAction = 'gather';
    this.state = 'MOVING';
    
    // Set target position near resource node
    this.setTargetNearPosition(resourceNode.position);
  }

  commandBuild(building) {
    if (this.state === 'DEAD') return;
    this.targetEntity = building;
    this.targetAction = 'build';
    this.state = 'MOVING';
    
    this.setTargetNearPosition(building.position);
  }

  commandAttack(enemy) {
    if (this.state === 'DEAD') return;
    this.targetEntity = enemy;
    this.state = 'CHASING';
    this.targetPosition.copy(enemy.position);
  }

  commandHeal(friendly) {
    if (this.state === 'DEAD') return;
    this.targetEntity = friendly;
    this.targetAction = 'heal';
    this.state = 'MOVING';
    this.setTargetNearPosition(friendly.position);
  }

  commandConvert(enemy) {
    if (this.state === 'DEAD') return;
    this.targetEntity = enemy;
    this.targetAction = 'convert';
    this.state = 'MOVING';
    this.setTargetNearPosition(enemy.position);
  }

  commandTrade(market) {
    if (this.state === 'DEAD') return;
    this.targetEntity = market;
    this.targetAction = 'trade';
    this.state = 'MOVING';
    this.setTargetNearPosition(market.position);
  }

  setTargetNearPosition(pos) {
    // Offset slightly so units don't cluster directly at the center
    const angle = Math.random() * Math.PI * 2;
    const offsetDist = 1.0;
    this.targetPosition.set(
      pos.x + Math.cos(angle) * offsetDist,
      0,
      pos.z + Math.sin(angle) * offsetDist
    );
    this.targetPosition.y = this.gameManager.terrain.getGroundHeight(this.targetPosition.x, this.targetPosition.z);
  }

  // -------------------------------------------------------------
  // UPDATE LOOP
  // -------------------------------------------------------------
  update(deltaTime) {
    if (this.state === 'DEAD') return;

    this.animTime += deltaTime;
    
    // Priest specific timers
    if (this.type === 'priest') {
      if (this.conversionCooldown > 0) {
        this.conversionCooldown -= deltaTime;
      }
      if (this.state === 'IDLE') {
        this.scanTimer += deltaTime;
        if (this.scanTimer >= 1.5) {
          this.scanTimer = 0;
          const friendlyInjured = this.gameManager.entityManager.units.find(u => 
            u.playerId === this.playerId && u.hp < u.maxHp && u.state !== 'DEAD' && this.position.distanceTo(u.position) < 8.0
          );
          if (friendlyInjured) {
            this.commandHeal(friendlyInjured);
          }
        }
      }
    }
    
    // State machine tick
    this.tickStateMachine(deltaTime);
    
    // Perform movement if required
    this.handleMovement(deltaTime);
    
    // Update mesh height to match ground
    this.position.y = this.gameManager.terrain.getGroundHeight(this.position.x, this.position.z);
    this.mesh.position.copy(this.position);
    
    // Run procedural limb animation
    this.animateLimbs(deltaTime);
  }

  tickStateMachine(deltaTime) {
    if (this.state === 'HARVESTING') {
      // Check if node is still valid
      if (!this.targetEntity || this.targetEntity.amount <= 0) {
        this.findAlternativeResource();
        return;
      }
      
      // Face the resource
      this.faceTarget(this.targetEntity.position);
      
      this.harvestTimer += deltaTime;
      if (this.harvestTimer >= this.attackCooldown) {
        this.harvestTimer = 0;
        this.swingProgress = 1.0; // trigger chop anim
        
        // Apply Civ gather rate modifiers
        let gatherRateMult = 1.0;
        if (this.targetEntity.type === 'wood') gatherRateMult = this.civModifiers.gatherWood || 1.0;
        else if (this.targetEntity.type === 'food') gatherRateMult = this.civModifiers.gatherFood || 1.0;
        else if (this.targetEntity.type === 'stone') gatherRateMult = this.civModifiers.gatherStone || 1.0;
        else if (this.targetEntity.type === 'gold') gatherRateMult = this.civModifiers.gatherGold || 1.0;

        const gathered = this.targetEntity.gather(this.harvestRate * gatherRateMult);
        if (gathered > 0) {
          // Initialize inventory type if empty
          if (this.inventory.type !== this.targetEntity.type) {
            this.inventory.type = this.targetEntity.type;
            this.inventory.amount = 0;
          }
          
          this.inventory.amount = Math.min(this.inventory.max, this.inventory.amount + gathered);
          
          // Audio feedback
          if (this.playerId === 0 && Math.random() < 0.3) {
            this.gameManager.soundManager.playHarvestSound(this.targetEntity.type);
          }
          
          // Inventory full? Go back to Town Center
          if (this.inventory.amount >= this.inventory.max) {
            this.returnResourcesToHQ();
          }
        }
      }
    } 
    else if (this.state === 'BUILDING') {
      // Check if building is completed
      if (!this.targetEntity || this.targetEntity.isCompleted) {
        this.findAlternativeBuilding();
        return;
      }

      this.faceTarget(this.targetEntity.position);
      this.buildTimer += deltaTime;
      
      if (this.buildTimer >= 1.0) { // Build action every 1 second
        this.buildTimer = 0;
        this.swingProgress = 1.0;
        
        const buildSpeed = this.civModifiers.buildSpeed || 1.0;
        this.targetEntity.addBuildProgress(10 * buildSpeed); // build progress increments
        
        if (this.playerId === 0 && Math.random() < 0.25) {
          this.gameManager.soundManager.playClickSound('build');
        }
      }
    }
    else if (this.state === 'HEALING') {
      if (!this.targetEntity || this.targetEntity.hp <= 0 || this.targetEntity.hp >= this.targetEntity.maxHp || this.targetEntity.state === 'DEAD') {
        this.state = 'IDLE';
        this.targetEntity = null;
        return;
      }
      
      const dist = this.position.distanceTo(this.targetEntity.position);
      if (dist > this.attackRange + 0.5) {
        this.state = 'MOVING';
        this.targetAction = 'heal';
        this.setTargetNearPosition(this.targetEntity.position);
        return;
      }

      this.faceTarget(this.targetEntity.position);
      this.harvestTimer += deltaTime;
      if (this.harvestTimer >= 1.0) {
        this.harvestTimer = 0;
        this.swingProgress = 1.0;
        
        this.targetEntity.hp = Math.min(this.targetEntity.maxHp, this.targetEntity.hp + 8);
        this.gameManager.hud.showFloatingText(this.targetEntity.position, "+8 HP", 0x2ecc71);
        
        if (this.playerId === 0 && Math.random() < 0.25) {
          this.gameManager.soundManager.playClickSound('spawn');
        }
      }
    }
    else if (this.state === 'CONVERTING') {
      if (!this.targetEntity || this.targetEntity.hp <= 0 || this.targetEntity.state === 'DEAD' || this.targetEntity.playerId === this.playerId) {
        this.state = 'IDLE';
        this.targetEntity = null;
        return;
      }

      const dist = this.position.distanceTo(this.targetEntity.position);
      if (dist > this.attackRange + 1.5) {
        this.state = 'CHASING';
        this.targetPosition.copy(this.targetEntity.position);
        return;
      }

      this.faceTarget(this.targetEntity.position);
      
      if (this.conversionCooldown > 0) {
        if (this.playerId === 0) {
          this.gameManager.hud.showNotification(`Priest is recovering faith! Cooldown: ${Math.round(this.conversionCooldown)}s`);
        }
        this.state = 'IDLE';
        this.targetEntity = null;
        return;
      }

      this.conversionTimer = (this.conversionTimer || 0) + deltaTime;
      
      this.harvestTimer = (this.harvestTimer || 0) + deltaTime;
      if (this.harvestTimer >= 1.5) {
        this.harvestTimer = 0;
        this.gameManager.hud.showFloatingText(this.position, "Wololo... 🌀", 0x9b59b6);
        this.gameManager.soundManager.playClickSound('select');
      }

      if (this.conversionTimer >= 5.5) {
        this.conversionTimer = 0;
        
        // CONVERT SUCCESS!
        const oldPlayerId = this.targetEntity.playerId;
        this.targetEntity.playerId = this.playerId;
        
        // Re-initialize mesh with new colors
        const scene = this.gameManager.renderer.scene;
        scene.remove(this.targetEntity.mesh);
        this.targetEntity.mesh.traverse(child => {
          if (child.isMesh) {
            child.geometry.dispose();
            if (child.material) child.material.dispose();
          }
        });
        this.targetEntity.initMesh();

        // Update population counts
        this.gameManager.players[oldPlayerId].population--;
        this.gameManager.players[this.playerId].population++;
        
        this.gameManager.hud.showFloatingText(this.targetEntity.position, "WOLOLO! Converted 🌀", 0x9b59b6);
        this.gameManager.soundManager.playClickSound('complete');

        // Post chat message in HUD
        if (this.gameManager.hud) {
          const names = { 0: 'Anda (Player)', 1: 'Musuh (Red)', 2: 'Sekutu (Green)', 3: 'Netral (Grey)' };
          this.gameManager.hud.addChatMessage("Sistem", `Unit faksi ${names[oldPlayerId]} dibelotkan oleh faksi ${names[this.playerId]}!`, 'sys');
        }

        this.conversionCooldown = 15.0; // 15 seconds faith recharge
        this.state = 'IDLE';
        this.targetEntity = null;
      }
    }
    else if (this.state === 'TRADING_LOAD') {
      if (!this.targetEntity || this.targetEntity.hp <= 0) {
        this.state = 'IDLE';
        this.targetEntity = null;
        return;
      }
      this.faceTarget(this.targetEntity.position);
      this.harvestTimer += deltaTime;
      if (this.harvestTimer >= 2.0) { // 2s load time
        this.harvestTimer = 0;
        this.gameManager.hud.showFloatingText(this.position, "Loaded Cargo 📦", 0xffd700);
        
        // Return to closest player market or TC
        const playerBuildings = this.gameManager.entityManager.buildings.filter(b => 
          b.playerId === this.playerId && (b.type === 'townCenter' || b.type === 'market') && b.isCompleted
        );
        let closestHQ = null;
        let closestDist = Infinity;
        playerBuildings.forEach(b => {
          const d = this.position.distanceTo(b.position);
          if (d < closestDist) {
            closestDist = d;
            closestHQ = b;
          }
        });

        if (closestHQ) {
          this.tradeHQ = closestHQ;
          this.state = 'RETURNING';
          this.setTargetNearPosition(closestHQ.position);
        } else {
          this.state = 'IDLE';
          this.gameManager.hud.showNotification("Need Market or Town Center to drop off cargo!");
        }
      }
    }
    else if (this.state === 'CHASING') {
      if (!this.targetEntity || this.targetEntity.hp <= 0) {
        this.state = 'IDLE';
        this.targetEntity = null;
        return;
      }
      
      // Update target pos to follow enemy
      this.targetPosition.copy(this.targetEntity.position);
      
      const dist = this.position.distanceTo(this.targetEntity.position);
      if (dist <= this.attackRange) {
        this.state = 'ATTACKING';
        this.attackTimer = this.attackCooldown; // attack immediately
      }
    }
    else if (this.state === 'ATTACKING') {
      if (!this.targetEntity || this.targetEntity.hp <= 0) {
        this.state = 'IDLE';
        this.targetEntity = null;
        return;
      }
      
      const dist = this.position.distanceTo(this.targetEntity.position);
      if (dist > this.attackRange + 0.3) { // add tolerance
        this.state = 'CHASING';
        return;
      }
      
      this.faceTarget(this.targetEntity.position);
      this.attackTimer += deltaTime;
      
      if (this.attackTimer >= this.attackCooldown) {
        this.attackTimer = 0;
        this.swingProgress = 1.0;
        
        // Damage target
        this.targetEntity.takeDamage(this.attackPower);
        
        // Audio
        this.gameManager.soundManager.playClickSound('hit');
      }
    }
  }

  handleMovement(deltaTime) {
    const isMovingState = (this.state === 'MOVING' || this.state === 'CHASING' || this.state === 'RETURNING');
    if (!isMovingState) return;
    
    const distToTarget = new THREE.Vector3(this.targetPosition.x, this.position.y, this.targetPosition.z).distanceTo(this.position);
    
    // Check arrival
    if (distToTarget < 0.25) {
      this.onArrived();
      return;
    }
    
    // Movement Vector
    const moveVec = new THREE.Vector3().subVectors(this.targetPosition, this.position);
    moveVec.y = 0;
    moveVec.normalize();
    
    // Simple steering behaviors: separate from other units
    const repulsion = new THREE.Vector3();
    const neighboringUnits = [];
    
    const grid = this.gameManager.entityManager.spatialGrid;
    if (grid) {
      const cellSize = 6;
      const gx = Math.floor(this.position.x / cellSize);
      const gz = Math.floor(this.position.z / cellSize);
      
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          const key = `${gx + dx},${gz + dz}`;
          if (grid[key]) {
            neighboringUnits.push(...grid[key]);
          }
        }
      }
    } else {
      neighboringUnits.push(...this.gameManager.entityManager.units);
    }
    
    let repulseCount = 0;
    
    neighboringUnits.forEach(u => {
      if (u === this) return;
      const d = this.position.distanceTo(u.position);
      if (d < 0.65) {
        const diff = new THREE.Vector3().subVectors(this.position, u.position);
        diff.y = 0;
        diff.normalize().multiplyScalar((0.65 - d) * 1.5);
        repulsion.add(diff);
        repulseCount++;
      }
    });
    
    if (repulseCount > 0) {
      repulsion.divideScalar(repulseCount);
      moveVec.add(repulsion).normalize();
    }
    
    // Move
    this.position.addScaledVector(moveVec, this.speed * deltaTime);
    
    // Rotate mesh smoothly towards moving direction
    const angle = Math.atan2(moveVec.x, moveVec.z);
    // Interpolate rotation for smooth turning
    let diff = angle - this.mesh.rotation.y;
    // Normalize to -PI to PI
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    this.mesh.rotation.y += diff * 0.15;
  }

  onArrived() {
    if (this.state === 'MOVING') {
      if (this.targetAction === 'gather') {
        this.state = 'HARVESTING';
      } else if (this.targetAction === 'build') {
        this.state = 'BUILDING';
        this.buildTimer = 0;
      } else if (this.targetAction === 'heal') {
        this.state = 'HEALING';
        this.harvestTimer = 0;
      } else if (this.targetAction === 'convert') {
        this.state = 'CONVERTING';
        this.harvestTimer = 0;
        this.conversionTimer = 0;
      } else if (this.targetAction === 'trade') {
        this.state = 'TRADING_LOAD';
        this.harvestTimer = 0;
      } else {
        this.state = 'IDLE';
      }
    } 
    else if (this.state === 'RETURNING') {
      if (this.type === 'trader') {
        const goldAmt = Math.round(25 * (this.civModifiers.tradeRate || 1.0));
        this.gameManager.depositResources(this.playerId, 'gold', goldAmt);
        
        this.gameManager.hud.showFloatingText(this.position, `+${goldAmt} Gold 🪙`, 0xffd700);
        this.gameManager.soundManager.playClickSound('complete');

        // Go back to the trade target
        if (this.targetEntity && this.targetEntity.hp > 0) {
          this.commandTrade(this.targetEntity);
        } else {
          this.state = 'IDLE';
          this.targetEntity = null;
        }
      } else {
        // Deposit resources
        if (this.inventory.amount > 0) {
          this.gameManager.depositResources(this.playerId, this.inventory.type, this.inventory.amount);
          this.inventory.amount = 0;
          this.inventory.type = null;
          
          // Spawn text effect
          this.gameManager.hud.showResourceFloatingText(this.position, `+15`, this.inventory.type);
        }
        
        // Head back to gather more if resource is still there
        if (this.targetEntity && this.targetEntity.amount > 0) {
          this.commandGather(this.targetEntity);
        } else {
          this.state = 'IDLE';
          this.targetEntity = null;
        }
      }
    }
    else if (this.state === 'CHASING') {
      this.state = 'ATTACKING';
      this.attackTimer = this.attackCooldown;
    }
  }

  returnResourcesToHQ() {
    // Find nearest dropoff point (Town Center)
    const nearestTC = this.gameManager.findNearestDropoff(this.position, this.playerId);
    
    if (nearestTC) {
      this.state = 'RETURNING';
      this.setTargetNearPosition(nearestTC.position);
    } else {
      this.state = 'IDLE';
      this.gameManager.hud.showNotification("Need Town Center to drop off resources!");
    }
  }

  findAlternativeResource() {
    // Search nearby resources of same type
    const resources = this.gameManager.entityManager.resources;
    let closestNode = null;
    let closestDist = Infinity;
    const typeToFind = this.inventory.type || (this.targetEntity ? this.targetEntity.type : null);
    
    if (!typeToFind) {
      this.state = 'IDLE';
      this.targetEntity = null;
      return;
    }

    resources.forEach(node => {
      if (node.type !== typeToFind) return;
      const d = this.position.distanceTo(node.position);
      if (d < closestDist) {
        closestDist = d;
        closestNode = node;
      }
    });

    if (closestNode && closestDist < 18) { // Search radius 18
      this.commandGather(closestNode);
    } else {
      // Try returning whatever we have gathered
      if (this.inventory.amount > 0) {
        this.returnResourcesToHQ();
      } else {
        this.state = 'IDLE';
        this.targetEntity = null;
      }
    }
  }

  findAlternativeBuilding() {
    // Look for nearby player blueprints to build
    const buildings = this.gameManager.entityManager.buildings;
    let closestBuilding = null;
    let closestDist = Infinity;

    buildings.forEach(b => {
      if (b.playerId !== this.playerId || b.isCompleted) return;
      const d = this.position.distanceTo(b.position);
      if (d < closestDist) {
        closestDist = d;
        closestBuilding = b;
      }
    });

    if (closestBuilding && closestDist < 15) {
      this.commandBuild(closestBuilding);
    } else {
      this.state = 'IDLE';
      this.targetEntity = null;
    }
  }

  takeDamage(amount) {
    if (this.state === 'DEAD') return;
    this.hp = Math.max(0, this.hp - amount);
    
    // Spawn floating numbers
    this.gameManager.hud.showFloatingText(this.position, `-${amount}`, 0xff0000);
    
    if (this.hp <= 0) {
      this.die();
    }
  }

  die() {
    this.state = 'DEAD';
    this.setSelected(false);
    
    // Fall over animation
    const animateDeath = () => {
      this.mesh.rotation.z += 0.1;
      this.mesh.position.y -= 0.05;
      if (this.mesh.position.y > -0.5) {
        requestAnimationFrame(animateDeath);
      } else {
        this.gameManager.renderer.scene.remove(this.mesh);
        // clean resources
        this.mesh.traverse(child => {
          if (child.isMesh) {
            child.geometry.dispose();
            child.material.dispose();
          }
        });
      }
    };
    animateDeath();
    
    this.gameManager.entityManager.removeUnit(this);
    
    // Check if player selected this unit
    const idx = this.gameManager.selectedEntities.indexOf(this);
    if (idx !== -1) {
      this.gameManager.selectedEntities.splice(idx, 1);
      this.gameManager.hud.updateSelectionUI();
    }
  }

  faceTarget(targetPos) {
    const angle = Math.atan2(targetPos.x - this.position.x, targetPos.z - this.position.z);
    this.mesh.rotation.y = angle;
  }

  // -------------------------------------------------------------
  // ANIMATION
  // -------------------------------------------------------------
  animateLimbs(deltaTime) {
    const bodyGroup = this.mesh.getObjectByName("bodyGroup");
    if (!bodyGroup) return;

    const leftFoot = bodyGroup.getObjectByName("leftFoot");
    const rightFoot = bodyGroup.getObjectByName("rightFoot");
    const rightArm = bodyGroup.getObjectByName("rightArm");
    
    const isMoving = (this.state === 'MOVING' || this.state === 'CHASING' || this.state === 'RETURNING');
    
    // Walk bobbing animation
    if (isMoving) {
      const bob = Math.sin(this.animTime * 14) * 0.12;
      bodyGroup.position.y = bob;
      
      // Alternate feet swing
      if (leftFoot && rightFoot) {
        leftFoot.position.z = Math.sin(this.animTime * 14) * 0.22;
        rightFoot.position.z = -Math.sin(this.animTime * 14) * 0.22;
      }
    } else {
      // Idle breathe
      bodyGroup.position.y = Math.sin(this.animTime * 2.5) * 0.02;
      if (leftFoot && rightFoot) {
        leftFoot.position.z = 0;
        rightFoot.position.z = 0;
      }
    }
    
    // Working swing animation (gathering, building, attacking)
    if (this.swingProgress > 0) {
      this.swingProgress -= deltaTime * 3.5; // return arm back
      if (rightArm) {
        // Swing arm downwards
        rightArm.rotation.x = -Math.sin(Math.max(0, this.swingProgress) * Math.PI) * 1.1;
      }
    } else {
      if (rightArm) {
        rightArm.rotation.x = 0;
      }
    }
  }
}
