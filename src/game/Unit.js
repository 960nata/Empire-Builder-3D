import * as THREE from 'three';
import { CIVILIZATIONS } from './ModelFactory';
import { ResourceNode } from './ResourceNode';

function getBaseResourceType(type) {
  if (['sheep', 'fish', 'farm'].includes(type)) return 'food';
  return type;
}

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
    } else if (this.type === 'footKnight') {
      this.hp = Math.round(100 * (civModifiers.hpInfantry || 1.0));
      this.maxHp = this.hp;
      this.speed = 2.6 * (civModifiers.speedInfantry || 1.0);
      this.attackPower = 15;
      this.attackCooldown = 0.9;
      this.attackRange = 1.1;
    } else if (this.type === 'archer') {
      this.hp = Math.round(45 * (civModifiers.hpInfantry || 1.0));
      this.maxHp = this.hp;
      this.speed = 3.0 * (civModifiers.speedInfantry || 1.0);
      this.attackPower = 6;
      this.attackCooldown = 1.0;
      const rangeBonus = civModifiers.archerRange || 0;
      this.attackRange = 5.5 + rangeBonus;
    } else if (this.type === 'knight') {
      this.hp = Math.round(120 * (civModifiers.hpCavalry || 1.0));
      this.maxHp = this.hp;
      this.speed = 4.8 * (civModifiers.speedCavalry || 1.0);
      this.attackPower = 14;
      this.attackCooldown = 1.0;
      this.attackRange = 1.3;
    } else if (this.type === 'heavyCavalry') {
      this.hp = Math.round(180 * (civModifiers.hpCavalry || 1.0));
      this.maxHp = this.hp;
      this.speed = 4.2 * (civModifiers.speedCavalry || 1.0);
      this.attackPower = 18;
      this.attackCooldown = 1.1;
      this.attackRange = 1.4;
    } else if (this.type === 'horseArcher') {
      this.hp = Math.round(80 * (civModifiers.hpCavalry || 1.0));
      this.maxHp = this.hp;
      this.speed = 4.9 * (civModifiers.speedCavalry || 1.0);
      this.attackPower = 7;
      this.attackCooldown = 1.1;
      const rangeBonus = civModifiers.archerRange || 0;
      this.attackRange = 5.0 + rangeBonus;
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
    } else if (this.type === 'fishingShip') {
      this.hp = 120;
      this.maxHp = 120;
      this.speed = 3.5;
      this.attackPower = 0;
      this.attackCooldown = 1.2;
      this.attackRange = 1.0;
    } else if (this.type === 'sheep') {
      this.hp = 20;
      this.maxHp = 20;
      this.speed = 1.8;
      this.attackPower = 0;
      this.attackCooldown = 1.0;
      this.attackRange = 1.0;
    }
    
    this.armor = 0;
    
    // Apply Civilization modifiers
    if (this.type === 'swordsman' || this.type === 'footKnight') {
      const hpMult = civModifiers.hpInfantry || 1.0;
      const speedMult = civModifiers.speedInfantry || 1.0;
      const dmgMult = civModifiers.damageInfantry || 1.0;
      
      this.maxHp = Math.round(this.maxHp * hpMult);
      this.hp = this.maxHp;
      this.speed = this.speed * speedMult;
      this.attackPower = Math.round(this.attackPower * dmgMult);
    } else if (this.type === 'archer' || this.type === 'horseArcher') {
      const dmgMult = civModifiers.damageInfantry || 1.0;
      this.attackPower = Math.round(this.attackPower * dmgMult);
    }
    
    this.id = 'unit_' + Math.random().toString(36).substr(2, 9);
    
    // Position & movement
    const y = this.gameManager.terrain ? this.gameManager.terrain.getGroundHeight(x, z) : 0;
    this.position = new THREE.Vector3(x, y, z);
    this.targetPosition = new THREE.Vector3(x, y, z);
    
    // State machine
    // States: IDLE, MOVING, HARVESTING, RETURNING, BUILDING, CHASING, ATTACKING, DEAD, HEALING, CONVERTING, TRADING_LOAD, TRADING_RETURN
    this.state = 'IDLE';
    this.targetEntity = null;
    this.targetAction = null; // Used during movement to define what to do upon arrival
    
    // Harvesting / Trading inventory
    const cargoBonus = civModifiers.cargoSize || 0;
    let inventoryMax = 15 + cargoBonus;
    if (this.type === 'fishingShip') {
      inventoryMax = 30;
    } else if (this.type === 'sheep') {
      inventoryMax = 0;
    }
    this.inventory = { type: null, amount: 0, max: inventoryMax };
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
    this.recalculateStats();
  }

  recalculateStats() {
    const player = this.gameManager.players[this.playerId];
    if (!player) return;
    const age = player.age || 'dark';
    const civModifiers = this.civModifiers || {};
    
    let baseHp = 50;
    let baseSpeed = 3.5;
    let baseAttack = 2;
    let baseRange = 1.0;
    let baseArmor = 0;
    
    if (this.type === 'villager') {
      baseHp = 50;
      baseSpeed = 3.5;
      baseAttack = 2;
      baseRange = 1.0;
    } else if (this.type === 'swordsman') {
      if (age === 'dark') {
        baseHp = 90;
        baseAttack = 12;
      } else if (age === 'feudal') {
        baseHp = 110;
        baseAttack = 16;
      } else if (age === 'castle') {
        baseHp = 140;
        baseAttack = 22;
      } else {
        baseHp = 180;
        baseAttack = 32;
      }
      baseSpeed = 2.8;
      baseRange = 1.1;
    } else if (this.type === 'footKnight') {
      if (age === 'dark') {
        baseHp = 100;
        baseAttack = 15;
      } else if (age === 'feudal') {
        baseHp = 120;
        baseAttack = 18;
      } else if (age === 'castle') {
        baseHp = 160;
        baseAttack = 25;
      } else {
        baseHp = 210;
        baseAttack = 35;
      }
      baseSpeed = 2.6;
      baseRange = 1.1;
    } else if (this.type === 'archer') {
      if (age === 'dark') {
        baseHp = 45;
        baseAttack = 6;
        baseRange = 5.5;
      } else if (age === 'feudal') {
        baseHp = 50;
        baseAttack = 8;
        baseRange = 5.5;
      } else if (age === 'castle') {
        baseHp = 65;
        baseAttack = 11;
        baseRange = 6.0;
      } else {
        baseHp = 80;
        baseAttack = 15;
        baseRange = 6.5;
      }
      baseSpeed = 3.0;
    } else if (this.type === 'knight') {
      if (age === 'dark') {
        baseHp = 120;
        baseAttack = 14;
      } else if (age === 'feudal') {
        baseHp = 135;
        baseAttack = 17;
      } else if (age === 'castle') {
        baseHp = 170;
        baseAttack = 23;
      } else {
        baseHp = 220;
        baseAttack = 32;
      }
      baseSpeed = 4.8;
      baseRange = 1.3;
    } else if (this.type === 'heavyCavalry') {
      if (age === 'dark') {
        baseHp = 180;
        baseAttack = 18;
      } else if (age === 'feudal') {
        baseHp = 200;
        baseAttack = 21;
      } else if (age === 'castle') {
        baseHp = 250;
        baseAttack = 28;
      } else {
        baseHp = 320;
        baseAttack = 38;
      }
      baseSpeed = 4.2;
      baseRange = 1.4;
    } else if (this.type === 'horseArcher') {
      if (age === 'dark') {
        baseHp = 80;
        baseAttack = 7;
        baseRange = 5.0;
      } else if (age === 'feudal') {
        baseHp = 95;
        baseAttack = 9;
        baseRange = 5.0;
      } else if (age === 'castle') {
        baseHp = 120;
        baseAttack = 13;
        baseRange = 5.5;
      } else {
        baseHp = 150;
        baseAttack = 17;
        baseRange = 6.0;
      }
      baseSpeed = 4.9;
    } else if (this.type === 'priest') {
      baseHp = 60;
      baseSpeed = 2.5;
      baseAttack = 0;
      baseRange = 3.5;
    } else if (this.type === 'trader') {
      baseHp = 80;
      baseSpeed = 3.2;
      baseAttack = 0;
      baseRange = 1.0;
    } else if (this.type === 'fishingShip') {
      baseHp = 120;
      baseSpeed = 3.5;
      baseAttack = 0;
      baseRange = 1.0;
    } else if (this.type === 'sheep') {
      baseHp = 20;
      baseSpeed = 1.8;
      baseAttack = 0;
      baseRange = 1.0;
    }
    
    if (this.type === 'swordsman' || this.type === 'footKnight') {
      const hpMult = civModifiers.hpInfantry || 1.0;
      const speedMult = civModifiers.speedInfantry || 1.0;
      const dmgMult = civModifiers.damageInfantry || 1.0;
      baseHp = Math.round(baseHp * hpMult);
      baseSpeed = baseSpeed * speedMult;
      baseAttack = Math.round(baseAttack * dmgMult);
    } else if (this.type === 'knight' || this.type === 'heavyCavalry' || this.type === 'horseArcher') {
      const hpMult = civModifiers.hpCavalry || 1.0;
      const speedMult = civModifiers.speedCavalry || 1.0;
      baseHp = Math.round(baseHp * hpMult);
      baseSpeed = baseSpeed * speedMult;
    }
    if (this.type === 'archer' || this.type === 'horseArcher') {
      const dmgMult = civModifiers.damageInfantry || 1.0;
      const rangeBonus = civModifiers.archerRange || 0;
      baseAttack = Math.round(baseAttack * dmgMult);
      baseRange = baseRange + rangeBonus;
    }
    
    const upgrades = player.upgrades || { attack: 0, armor: 0, arrow: 0 };
    
    if (['swordsman', 'footKnight', 'knight', 'heavyCavalry'].includes(this.type)) {
      baseAttack += (upgrades.attack || 0) * 2;
    }
    if (['archer', 'horseArcher'].includes(this.type)) {
      baseAttack += (upgrades.arrow || 0) * 2;
      baseRange += (upgrades.arrow || 0) * 1.0;
    }
    if (['swordsman', 'footKnight', 'archer', 'knight', 'heavyCavalry', 'horseArcher'].includes(this.type)) {
      baseArmor += (upgrades.armor || 0) * 1;
    }
    
    const hpRatio = (this.hp !== undefined && this.maxHp !== undefined) ? (this.hp / this.maxHp) : 1.0;
    this.maxHp = baseHp;
    this.hp = Math.round(this.maxHp * hpRatio);
    this.speed = baseSpeed;
    this.attackPower = baseAttack;
    this.attackRange = baseRange;
    this.armor = baseArmor;
  }

  startPathfinding(targetX, targetZ) {
    const isWaterUnit = this.type === 'fishingShip';
    this.path = this.gameManager.findPath(this.position.x, this.position.z, targetX, targetZ, isWaterUnit);
    this.pathIndex = 0;
    
    if (this.path && this.path.length > 0) {
      this.targetPosition.copy(this.path[0]);
    } else {
      this.targetPosition.set(targetX, this.gameManager.terrain.getGroundHeight(targetX, targetZ), targetZ);
    }
  }

  initMesh() {
    this.age = this.gameManager.players[this.playerId].age || 'dark';
    this.civ = this.gameManager.players[this.playerId].civ || 'inggris';
    this.mesh = this.gameManager.modelFactory.createUnitMesh(this.type, this.playerId, this.civ, this.age);
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
    this.startPathfinding(targetPos.x, targetPos.z);
  }

  commandGather(resourceNode) {
    if (this.state === 'DEAD') return;
    this.targetEntity = resourceNode;
    this.targetAction = 'gather';
    this.state = 'MOVING';
    
    // Set target position near resource node
    this.setTargetNearPosition(resourceNode.position, resourceNode);
    this.startPathfinding(this.targetPosition.x, this.targetPosition.z);
  }

  commandBuild(building) {
    if (this.state === 'DEAD') return;
    this.targetEntity = building;
    this.targetAction = 'build';
    this.state = 'MOVING';
    
    this.setTargetNearPosition(building.position, building);
    this.startPathfinding(this.targetPosition.x, this.targetPosition.z);
  }

  commandAttack(enemy) {
    if (this.state === 'DEAD') return;
    this.targetEntity = enemy;
    this.state = 'CHASING';
    this.targetPosition.copy(enemy.position);
    this.startPathfinding(enemy.position.x, enemy.position.z);
  }

  commandGarrison(castle) {
    if (this.state === 'DEAD') return;
    this.targetEntity = castle;
    this.targetAction = 'garrison';
    this.state = 'MOVING';
    this.setTargetNearPosition(castle.position, castle);
    this.startPathfinding(this.targetPosition.x, this.targetPosition.z);
  }

  commandHeal(friendly) {
    if (this.state === 'DEAD') return;
    this.targetEntity = friendly;
    this.targetAction = 'heal';
    this.state = 'MOVING';
    this.setTargetNearPosition(friendly.position, friendly);
    this.startPathfinding(this.targetPosition.x, this.targetPosition.z);
  }

  commandConvert(enemy) {
    if (this.state === 'DEAD') return;
    this.targetEntity = enemy;
    this.targetAction = 'convert';
    this.state = 'MOVING';
    this.setTargetNearPosition(enemy.position, enemy);
    this.startPathfinding(this.targetPosition.x, this.targetPosition.z);
  }

  commandTrade(market) {
    if (this.state === 'DEAD') return;
    this.targetEntity = market;
    this.targetAction = 'trade';
    this.state = 'MOVING';
    this.setTargetNearPosition(market.position, market);
    this.startPathfinding(this.targetPosition.x, this.targetPosition.z);
  }

  setTargetNearPosition(pos, targetEntity = null) {
    // Offset slightly so units don't cluster directly at the center
    const angle = Math.random() * Math.PI * 2;
    let offsetDist = 1.0;
    if (targetEntity) {
      const size = targetEntity.gridSize || 1;
      offsetDist = (size / 2) + 0.55;
    }
    this.targetPosition.set(
      pos.x + Math.cos(angle) * offsetDist,
      0,
      pos.z + Math.sin(angle) * offsetDist
    );
    this.targetPosition.y = this.gameManager.terrain ? this.gameManager.terrain.getGroundHeight(this.targetPosition.x, this.targetPosition.z) : 0;
  }

  // -------------------------------------------------------------
  // UPDATE LOOP
  // -------------------------------------------------------------
  update(deltaTime) {
    if (this.state === 'DEAD' || this.state === 'GARRISONED') return;

    this.animTime += deltaTime;
    
    // Sheep tracking logic for villagers
    if (this.state === 'MOVING' && this.targetAction === 'gather' && this.targetEntity && this.targetEntity.type === 'sheep' && this.targetEntity.hp !== undefined) {
      const dist = this.targetPosition.distanceTo(this.targetEntity.position);
      if (dist > 1.5) {
        this.setTargetNearPosition(this.targetEntity.position, this.targetEntity);
      }
    }
    
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
    
    // Military unit auto-scanning behavior
    const isMilitary = ['swordsman', 'footKnight', 'archer', 'knight', 'heavyCavalry', 'horseArcher'].includes(this.type);
    if (isMilitary && this.state === 'IDLE') {
      if (this.militaryScanTimer === undefined) this.militaryScanTimer = 0;
      this.militaryScanTimer += deltaTime;
      if (this.militaryScanTimer >= 1.0) {
        this.militaryScanTimer = 0;
        
        const scanRange = ['archer', 'horseArcher'].includes(this.type) ? 14.0 : 10.0;
        let nearestEnemy = null;
        let minDistance = Infinity;
        
        const units = this.gameManager.entityManager.units;
        for (let i = 0; i < units.length; i++) {
          const u = units[i];
          if (u.hp <= 0 || u.state === 'DEAD') continue;
          
          let isEnemy = false;
          if (this.playerId === 0 || this.playerId === 2) {
            isEnemy = (u.playerId === 1);
          } else if (this.playerId === 1) {
            isEnemy = (u.playerId === 0 || u.playerId === 2);
          }
          
          if (isEnemy) {
            const dist = this.position.distanceTo(u.position);
            if (dist <= scanRange && dist < minDistance) {
              minDistance = dist;
              nearestEnemy = u;
            }
          }
        }
        
        if (nearestEnemy) {
          this.commandAttack(nearestEnemy);
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

    // Gallop sound for knight and cavalry when moving
    if ((this.type === 'knight' || this.type === 'heavyCavalry' || this.type === 'horseArcher') && (this.state === 'MOVING' || this.state === 'CHASING' || this.state === 'RETURNING')) {
      if (this.gallopSoundTimer === undefined) this.gallopSoundTimer = 0;
      this.gallopSoundTimer += deltaTime;
      if (this.gallopSoundTimer >= 0.42) {
        this.gallopSoundTimer = 0;
        if (this.playerId === 0 && Math.random() < 0.7) {
          this.gameManager.soundManager.playClickSound('gallop');
        }
      }
    }
    
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
        else if (['food', 'sheep', 'fish', 'farm'].includes(this.targetEntity.type)) gatherRateMult = this.civModifiers.gatherFood || 1.0;
        else if (this.targetEntity.type === 'stone') gatherRateMult = this.civModifiers.gatherStone || 1.0;
        else if (this.targetEntity.type === 'gold') gatherRateMult = this.civModifiers.gatherGold || 1.0;

        // Apply AI Difficulty gather multiplier
        if (this.playerId === 1) { // Enemy Red AI
          const difficulty = this.gameManager.aiDifficulty || 'normal';
          if (difficulty === 'easy') {
            gatherRateMult *= 0.6; // 40% slower gathering
          } else if (difficulty === 'hard') {
            gatherRateMult *= 1.5; // 50% faster gathering
          }
        }

        const gathered = this.targetEntity.gather(this.harvestRate * gatherRateMult);
        if (gathered > 0) {
          // Initialize inventory type if empty
          let resourceType = this.targetEntity.type;
          if (['sheep', 'fish', 'farm'].includes(resourceType)) {
            resourceType = 'food';
          }
          if (this.inventory.type !== resourceType) {
            this.inventory.type = resourceType;
            this.inventory.amount = 0;
          }
          
          this.inventory.amount = Math.min(this.inventory.max, this.inventory.amount + gathered);
          
          // Audio feedback
          if (this.playerId === 0 && Math.random() < 0.3) {
            this.gameManager.soundManager.playHarvestSound(this.targetEntity.type);
          }

          // Spawn particle effects based on resource type
          let particleColor = 0x966f33; // wood brown
          if (this.targetEntity.type === 'wood') {
            particleColor = Math.random() < 0.45 ? 0x2e8b57 : 0x8b5a2b; // leaves (green) or bark (brown)
          } else if (this.targetEntity.type === 'gold') {
            particleColor = 0xffd700; // gold
          } else if (this.targetEntity.type === 'stone') {
            particleColor = 0x888888; // stone
          } else if (this.targetEntity.type === 'food') {
            particleColor = 0xcc2222; // red berry particle
          } else if (this.targetEntity.type === 'fish') {
            particleColor = 0x3a86c8; // blue fish water splash
          } else if (this.targetEntity.type === 'sheep') {
            particleColor = 0xeeeeee; // white wool splash
          } else if (this.targetEntity.type === 'farm') {
            particleColor = 0x556b2f; // dark green crop splash
          }
          this.gameManager.spawnParticles(this.targetEntity.position, particleColor, 6, 0.08);
          
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
        if (this.targetEntity && this.targetEntity.type === 'farm') {
          this.commandGather(this.targetEntity);
        } else {
          this.findAlternativeBuilding();
        }
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

        // Spawn building dust particles
        this.gameManager.spawnParticles(this.targetEntity.position, 0xdfd5c0, 4, 0.1);
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
        this.setTargetNearPosition(this.targetEntity.position, this.targetEntity);
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
          this.setTargetNearPosition(closestHQ.position, closestHQ);
          this.startPathfinding(this.targetPosition.x, this.targetPosition.z);
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
        this.path = null;
        return;
      }
      
      const target = this.targetEntity.position;
      const endPos = (this.path && this.path.length > 0) ? this.path[this.path.length - 1] : null;
      if (!endPos || endPos.distanceTo(target) > 2.0) {
        this.startPathfinding(target.x, target.z);
      }
      
      let dist = this.position.distanceTo(this.targetEntity.position);
      if (this.targetEntity.gridSize !== undefined) {
        dist = Math.max(0, dist - (this.targetEntity.gridSize / 2));
      }
      if (dist <= this.attackRange) {
        this.state = 'ATTACKING';
        this.attackTimer = this.attackCooldown; // attack immediately
        this.path = null;
      }
    }
    else if (this.state === 'ATTACKING') {
      if (!this.targetEntity || this.targetEntity.hp <= 0) {
        this.state = 'IDLE';
        this.targetEntity = null;
        return;
      }
      
      let dist = this.position.distanceTo(this.targetEntity.position);
      if (this.targetEntity.gridSize !== undefined) {
        dist = Math.max(0, dist - (this.targetEntity.gridSize / 2));
      }
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
        
        // Audio & visual project triggers
        if (this.type === 'archer' || this.type === 'horseArcher') {
          this.gameManager.spawnArrow(this.position, this.targetEntity.position);
          this.gameManager.soundManager.playClickSound('arrow');
        } else {
          this.gameManager.soundManager.playClickSound('hit');
        }

        // Particle splash at target
        let impactColor = 0xbb1111;
        if (this.targetEntity.type && ['townCenter', 'barracks', 'house', 'temple', 'market'].includes(this.targetEntity.type)) {
          impactColor = 0xbfb4a0; // building debris
        }
        this.gameManager.spawnParticles(this.targetEntity.position, impactColor, 6, 0.09);
      }
    }
  }

  handleMovement(deltaTime) {
    const isMovingState = (this.state === 'MOVING' || this.state === 'CHASING' || this.state === 'RETURNING');
    if (!isMovingState) return;
    
    if (this.path && this.path.length > 0) {
      if (this.pathIndex === undefined) this.pathIndex = 0;
      const wp = this.path[this.pathIndex];
      if (wp) {
        this.targetPosition.copy(wp);
        const distToWp = new THREE.Vector3(this.targetPosition.x, this.position.y, this.targetPosition.z).distanceTo(this.position);
        if (distToWp < 0.8) {
          this.pathIndex++;
          if (this.pathIndex >= this.path.length) {
            this.path = null;
            this.pathIndex = 0;
          }
        }
      }
    }
    
    const distToTarget = new THREE.Vector3(this.targetPosition.x, this.position.y, this.targetPosition.z).distanceTo(this.position);
    
    // Check arrival
    if (!this.path && distToTarget < 0.25) {
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

    // Obstacle avoidance for buildings/walls with tangential steering
    const buildings = this.gameManager.entityManager.buildings;
    let bRepulseCount = 0;
    const bRepulsion = new THREE.Vector3();

    buildings.forEach(b => {
      // Friendly completed gates don't block friendly units
      const isGate = b.type === 'palisadeGate' || b.type === 'stoneGate';
      if (isGate && b.playerId === this.playerId && b.isCompleted) {
        return; 
      }
      
      const dist = this.position.distanceTo(b.position);
      // Bounding collision radius: building gridSize/2 + unit radius 0.35 + safety buffer 0.1
      const collRadius = (b.gridSize / 2) + 0.45;
      
      if (dist < collRadius) {
        // Direct push vector away from center
        const pushVec = new THREE.Vector3().subVectors(this.position, b.position);
        pushVec.y = 0;
        pushVec.normalize();
        
        const force = (collRadius - dist) * 2.8;
        bRepulsion.addScaledVector(pushVec, force);
        
        // Tangential steering to slide around
        const desiredDir = new THREE.Vector3().subVectors(this.targetPosition, this.position);
        desiredDir.y = 0;
        desiredDir.normalize();
        
        const perp = new THREE.Vector3(-pushVec.z, 0, pushVec.x);
        if (perp.dot(desiredDir) < 0) {
          perp.negate();
        }
        bRepulsion.addScaledVector(perp, force * 1.5);
        bRepulseCount++;
      }
    });

    // Obstacle avoidance for Resource Nodes (trees, gold, stone)
    const resources = this.gameManager.entityManager.resources;
    resources.forEach(r => {
      // Pemanen tidak terdorong oleh target panen aktifnya
      if (r === this.targetEntity && this.state === 'HARVESTING') return;
      
      const dist = this.position.distanceTo(r.position);
      // Bounding collision radius: wood/sheep = 0.65, gold/stone = 0.95
      const collRadius = (r.type === 'wood' || r.type === 'sheep') ? 0.65 : 0.95;
      
      if (dist < collRadius) {
        const pushVec = new THREE.Vector3().subVectors(this.position, r.position);
        pushVec.y = 0;
        pushVec.normalize();
        
        const force = (collRadius - dist) * 2.2;
        bRepulsion.addScaledVector(pushVec, force);
        
        const desiredDir = new THREE.Vector3().subVectors(this.targetPosition, this.position);
        desiredDir.y = 0;
        desiredDir.normalize();
        
        const perp = new THREE.Vector3(-pushVec.z, 0, pushVec.x);
        if (perp.dot(desiredDir) < 0) {
          perp.negate();
        }
        bRepulsion.addScaledVector(perp, force * 1.2);
        bRepulseCount++;
      }
    });

    if (bRepulseCount > 0) {
      bRepulsion.divideScalar(bRepulseCount);
      moveVec.add(bRepulsion).normalize();
    }
    
    // Move with water shore sliding collision (water level is <-0.5)
    const formationSpeedMult = this._formationSpeedMult || 1.0;
    const effectiveSpeed = this.speed * formationSpeedMult;
    const nextPos = this.position.clone().addScaledVector(moveVec, effectiveSpeed * deltaTime);
    const nextHeight = this.gameManager.terrain.getGroundHeight(nextPos.x, nextPos.z);
    
    const isWaterUnit = this.type === 'fishingShip';
    const isPassable = (height) => isWaterUnit ? (height < -0.5) : (height >= -0.5);

    if (isPassable(nextHeight)) {
      this.position.copy(nextPos);
    } else {
      // It's impassable terrain! Let's try to slide along the shore by testing x and z movements independently
      const testX = this.position.clone();
      testX.x = nextPos.x;
      const heightX = this.gameManager.terrain.getGroundHeight(testX.x, testX.z);
      if (isPassable(heightX)) {
        this.position.x = nextPos.x;
      } else {
        const testZ = this.position.clone();
        testZ.z = nextPos.z;
        const heightZ = this.gameManager.terrain.getGroundHeight(testZ.x, testZ.z);
        if (isPassable(heightZ)) {
          this.position.z = nextPos.z;
        } else {
          // If both are impassable, the unit stops moving to avoid crossing/getting stuck
          this.state = 'IDLE';
        }
      }
    }
    
    // Rotate mesh smoothly towards moving direction
    const angle = Math.atan2(moveVec.x, moveVec.z);
    // Interpolate rotation for smooth turning
    let diff = angle - this.mesh.rotation.y;
    // Normalize to -PI to PI
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    this.mesh.rotation.y += diff * 0.15;
  }

  onArrived() {
    // Reset formation speed when arriving
    this._formationSpeedMult = 1.0;
    if (this.state === 'MOVING') {
      if (this.targetAction === 'gather') {
        if (this.targetEntity && this.targetEntity.type === 'sheep' && this.targetEntity.hp !== undefined) {
          // Slaughter the sheep!
          const sheep = this.targetEntity;
          const sx = sheep.position.x;
          const sz = sheep.position.z;
          sheep.die();
          
          // Command the villager to harvest the newly spawned carcass
          const carcass = this.gameManager.entityManager.resources.find(r => 
            r.type === 'sheep' && Math.abs(r.position.x - sx) < 0.5 && Math.abs(r.position.z - sz) < 0.5
          );
          if (carcass) {
            this.commandGather(carcass);
          } else {
            this.state = 'IDLE';
            this.targetEntity = null;
          }
          return;
        }
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
      } else if (this.targetAction === 'garrison') {
        if (this.targetEntity && this.targetEntity.type === 'castle' && this.targetEntity.isCompleted) {
          const success = this.targetEntity.garrisonUnit(this);
          if (!success) {
            this.state = 'IDLE';
            this.targetEntity = null;
          }
        } else {
          this.state = 'IDLE';
          this.targetEntity = null;
        }
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
          const depType = this.inventory.type;
          const depAmt = this.inventory.amount;
          this.gameManager.depositResources(this.playerId, depType, depAmt);
          this.inventory.amount = 0;
          this.inventory.type = null;
          
          // Spawn text effect
          this.gameManager.hud.showResourceFloatingText(this.position, `+${depAmt} ${depType.toUpperCase()}`, depType);
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
    // Find nearest dropoff point (Town Center or Dock if resource is food)
    const nearestTC = this.gameManager.findNearestDropoff(this.position, this.playerId, this.inventory.type);
    
    if (nearestTC) {
      this.state = 'RETURNING';
      this.setTargetNearPosition(nearestTC.position, nearestTC);
      this.startPathfinding(this.targetPosition.x, this.targetPosition.z);
    } else {
      this.state = 'IDLE';
      this.gameManager.hud.showNotification("Need Town Center or Dock to drop off resources!");
    }
  }

  findAlternativeResource() {
    // Search nearby resources of same type
    let closestNode = null;
    let closestDist = Infinity;
    const currentTargetType = this.targetEntity ? this.targetEntity.type : null;
    const typeToFind = this.inventory.type || getBaseResourceType(currentTargetType);
    
    if (!typeToFind) {
      this.state = 'IDLE';
      this.targetEntity = null;
      return;
    }

    const resources = this.gameManager.entityManager.resources;
    resources.forEach(node => {
      const nodeBaseType = getBaseResourceType(node.type);
      if (nodeBaseType !== typeToFind) return;
      
      // A fishing ship can only harvest fish. Land units cannot harvest fish.
      if (this.type === 'fishingShip' && node.type !== 'fish') return;
      if (this.type !== 'fishingShip' && node.type === 'fish') return;

      const d = this.position.distanceTo(node.position);
      if (d < closestDist) {
        closestDist = d;
        closestNode = node;
      }
    });

    // If type to find is food, we can also search for friendly completed farms that have food left (land units only)
    if (typeToFind === 'food' && this.type !== 'fishingShip') {
      const buildings = this.gameManager.entityManager.buildings;
      buildings.forEach(b => {
        if (b.type === 'farm' && b.playerId === this.playerId && b.isCompleted && b.amount > 0) {
          const d = this.position.distanceTo(b.position);
          if (d < closestDist) {
            closestDist = d;
            closestNode = b;
          }
        }
      });
    }

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
    const armor = this.armor || 0;
    const finalDamage = Math.max(1, amount - armor);
    this.hp = Math.max(0, this.hp - finalDamage);
    
    // Spawn floating numbers
    this.gameManager.hud.showFloatingText(this.position, `-${finalDamage}`, 0xff0000);
    
    if (this.hp <= 0) {
      this.die();
    }
  }

  die() {
    this.state = 'DEAD';
    this.setSelected(false);
    
    // Spawning carcass
    if (this.type === 'sheep') {
      const ry = this.gameManager.terrain.getGroundHeight(this.position.x, this.position.z);
      const node = new ResourceNode(this.gameManager, 'sheep', this.position.x, ry, this.position.z);
      this.gameManager.entityManager.addResource(node);
    }
    
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

    const isMoving = (this.state === 'MOVING' || this.state === 'CHASING' || this.state === 'RETURNING');
    
    // -------------------------------------------------------------
    // KNIGHT (HORSE AND RIDER) ANIMATIONS
    // -------------------------------------------------------------
    if (this.type === 'knight') {
      const legFL = bodyGroup.getObjectByName("legFL");
      const legFR = bodyGroup.getObjectByName("legFR");
      const legBL = bodyGroup.getObjectByName("legBL");
      const legBR = bodyGroup.getObjectByName("legBR");
      const horse = bodyGroup.getObjectByName("horse");
      const rider = bodyGroup.getObjectByName("rider");
      const rightArm = bodyGroup.getObjectByName("rightArm");

      if (isMoving) {
        // Trot leg swing (diagonal pairs move together)
        const swing = Math.sin(this.animTime * 16) * 0.45;
        if (legFL) legFL.rotation.x = swing;
        if (legBR) legBR.rotation.x = swing;
        if (legFR) legFR.rotation.x = -swing;
        if (legBL) legBL.rotation.x = -swing;
        
        // Horse and rider bobbing up and down
        const bob = Math.abs(Math.sin(this.animTime * 16)) * 0.08;
        if (horse) horse.position.y = 0.75 + bob;
        if (rider) rider.position.y = 1.1 + bob;
      } else {
        // Reset legs and gentle breathing
        if (legFL) legFL.rotation.x = 0;
        if (legFR) legFR.rotation.x = 0;
        if (legBL) legBL.rotation.x = 0;
        if (legBR) legBR.rotation.x = 0;
        
        const breathe = Math.sin(this.animTime * 2.0) * 0.01;
        if (horse) horse.position.y = 0.75 + breathe;
        if (rider) rider.position.y = 1.1 + breathe;
      }

      // Knight Lance attack thrusting animation
      if (this.swingProgress > 0) {
        this.swingProgress -= deltaTime * 3.5;
        if (rightArm) {
          rightArm.rotation.x = -Math.PI / 3 + Math.sin(Math.max(0, this.swingProgress) * Math.PI) * 0.7;
        }
      } else {
        if (rightArm) {
          rightArm.rotation.x = -Math.PI / 3; // resting lance position
        }
      }
    }
    // -------------------------------------------------------------
    // HEAVY CAVALRY (ARMORED HORSE & MACE RIDER) ANIMATIONS
    // -------------------------------------------------------------
    else if (this.type === 'heavyCavalry') {
      const legFL = bodyGroup.getObjectByName("legFL");
      const legFR = bodyGroup.getObjectByName("legFR");
      const legBL = bodyGroup.getObjectByName("legBL");
      const legBR = bodyGroup.getObjectByName("legBR");
      const horse = bodyGroup.getObjectByName("horse");
      const rider = bodyGroup.getObjectByName("rider");
      const rightArm = bodyGroup.getObjectByName("rightArm");

      if (isMoving) {
        // Heavy horse gallop/trot animation
        const swing = Math.sin(this.animTime * 18) * 0.5;
        if (legFL) legFL.rotation.x = swing;
        if (legBR) legBR.rotation.x = swing;
        if (legFR) legFR.rotation.x = -swing;
        if (legBL) legBL.rotation.x = -swing;
        
        const bob = Math.abs(Math.sin(this.animTime * 18)) * 0.1;
        if (horse) horse.position.y = 0.75 + bob;
        if (rider) rider.position.y = 1.1 + bob;
      } else {
        if (legFL) legFL.rotation.x = 0;
        if (legFR) legFR.rotation.x = 0;
        if (legBL) legBL.rotation.x = 0;
        if (legBR) legBR.rotation.x = 0;
        
        const breathe = Math.sin(this.animTime * 2.0) * 0.015;
        if (horse) horse.position.y = 0.75 + breathe;
        if (rider) rider.position.y = 1.1 + breathe;
      }

      // War mace swing animation (crushing blow)
      if (this.swingProgress > 0) {
        this.swingProgress -= deltaTime * 3.0;
        if (rightArm) {
          rightArm.rotation.x = -Math.PI / 3 - Math.sin(Math.max(0, this.swingProgress) * Math.PI) * 1.5;
        }
      } else {
        if (rightArm) {
          rightArm.rotation.x = -Math.PI / 3;
        }
      }
    }
    // -------------------------------------------------------------
    // HORSE ARCHER ANIMATIONS
    // -------------------------------------------------------------
    else if (this.type === 'horseArcher') {
      const legFL = bodyGroup.getObjectByName("legFL");
      const legFR = bodyGroup.getObjectByName("legFR");
      const legBL = bodyGroup.getObjectByName("legBL");
      const legBR = bodyGroup.getObjectByName("legBR");
      const horse = bodyGroup.getObjectByName("horse");
      const rider = bodyGroup.getObjectByName("rider");
      const leftArm = bodyGroup.getObjectByName("leftArm");
      const rightArm = bodyGroup.getObjectByName("rightArm");
      const bowstring = bodyGroup.getObjectByName("bowstring");
      const weapon = bodyGroup.getObjectByName("weapon");

      if (isMoving) {
        // Fast light horse gallop
        const swing = Math.sin(this.animTime * 22) * 0.55;
        if (legFL) legFL.rotation.x = swing;
        if (legBR) legBR.rotation.x = swing;
        if (legFR) legFR.rotation.x = -swing;
        if (legBL) legBL.rotation.x = -swing;
        
        const bob = Math.abs(Math.sin(this.animTime * 22)) * 0.09;
        if (horse) horse.position.y = 0.72 + bob;
        if (rider) rider.position.y = 1.05 + bob;
      } else {
        if (legFL) legFL.rotation.x = 0;
        if (legFR) legFR.rotation.x = 0;
        if (legBL) legBL.rotation.x = 0;
        if (legBR) legBR.rotation.x = 0;
        
        const breathe = Math.sin(this.animTime * 2.5) * 0.01;
        if (horse) horse.position.y = 0.72 + breathe;
        if (rider) rider.position.y = 1.05 + breathe;
      }

      // Drawing animation
      if (this.state === 'ATTACKING' && this.targetEntity) {
        const drawPercent = Math.min(1.0, this.attackTimer / this.attackCooldown);
        
        if (leftArm) {
          leftArm.rotation.x = -Math.PI / 2;
          leftArm.rotation.y = -0.2;
        }
        
        if (rightArm) {
          rightArm.rotation.x = -Math.PI / 2.2;
          rightArm.position.z = -0.15 - drawPercent * 0.22;
          rightArm.position.x = 0.32 - drawPercent * 0.08;
        }
        
        if (bowstring) {
          bowstring.scale.z = 1.0 + drawPercent * 0.8;
          bowstring.position.z = -drawPercent * 0.28;
        }

        if (weapon) {
          weapon.visible = true;
          weapon.position.z = 0.05 - drawPercent * 0.22;
        }
      } else {
        if (leftArm) {
          leftArm.rotation.x = 0;
          leftArm.rotation.y = 0;
        }
        if (rightArm) {
          rightArm.rotation.x = 0;
          rightArm.position.set(0.32, 0.35, 0);
        }
        if (bowstring) {
          bowstring.scale.z = 1.0;
          bowstring.position.set(0.5 * Math.cos(Math.PI * 0.85 / 2), 0, 0);
          bowstring.position.z = 0;
        }
        if (weapon) {
          weapon.visible = false;
          weapon.position.set(0, -0.25, 0.05);
        }
      }
    }
    // -------------------------------------------------------------
    // FOOT KNIGHT (SWORD & SHIELD) ANIMATIONS
    // -------------------------------------------------------------
    else if (this.type === 'footKnight') {
      const leftFoot = bodyGroup.getObjectByName("leftFoot");
      const rightFoot = bodyGroup.getObjectByName("rightFoot");
      const rightArm = bodyGroup.getObjectByName("rightArm");

      if (isMoving) {
        const bob = Math.sin(this.animTime * 14) * 0.12;
        bodyGroup.position.y = bob;
        if (leftFoot && rightFoot) {
          leftFoot.position.z = Math.sin(this.animTime * 14) * 0.22;
          rightFoot.position.z = -Math.sin(this.animTime * 14) * 0.22;
        }
      } else {
        bodyGroup.position.y = Math.sin(this.animTime * 2.5) * 0.02;
        if (leftFoot && rightFoot) {
          leftFoot.position.z = 0;
          rightFoot.position.z = 0;
        }
      }

      // Broadsword slash swing animation
      if (this.swingProgress > 0) {
        this.swingProgress -= deltaTime * 3.5;
        if (rightArm) {
          rightArm.rotation.x = -Math.PI / 4 - Math.sin(Math.max(0, this.swingProgress) * Math.PI) * 1.4;
          rightArm.rotation.y = Math.sin(Math.max(0, this.swingProgress) * Math.PI) * 0.5;
        }
      } else {
        if (rightArm) {
          rightArm.rotation.x = -Math.PI / 4;
          rightArm.rotation.y = 0;
        }
      }
    }
    // -------------------------------------------------------------
    // ARCHER DRAW/FIRE ANIMATIONS
    // -------------------------------------------------------------
    else if (this.type === 'archer') {
      const leftFoot = bodyGroup.getObjectByName("leftFoot");
      const rightFoot = bodyGroup.getObjectByName("rightFoot");
      const leftArm = bodyGroup.getObjectByName("leftArm");
      const rightArm = bodyGroup.getObjectByName("rightArm");
      const bowstring = bodyGroup.getObjectByName("bowstring");
      const weapon = bodyGroup.getObjectByName("weapon"); // arrow in hand

      // Standard foot movement
      if (isMoving) {
        const bob = Math.sin(this.animTime * 14) * 0.12;
        bodyGroup.position.y = bob;
        if (leftFoot && rightFoot) {
          leftFoot.position.z = Math.sin(this.animTime * 14) * 0.22;
          rightFoot.position.z = -Math.sin(this.animTime * 14) * 0.22;
        }
      } else {
        bodyGroup.position.y = Math.sin(this.animTime * 2.5) * 0.02;
        if (leftFoot && rightFoot) {
          leftFoot.position.z = 0;
          rightFoot.position.z = 0;
        }
      }

      // Drawing animation
      if (this.state === 'ATTACKING' && this.targetEntity) {
        const drawPercent = Math.min(1.0, this.attackTimer / this.attackCooldown);
        
        // Raise bow arm forward
        if (leftArm) leftArm.rotation.x = -Math.PI / 2;
        
        // Draw arm pulls back
        if (rightArm) {
          rightArm.rotation.x = -Math.PI / 2.2;
          rightArm.position.z = -0.15 - drawPercent * 0.22;
          rightArm.position.x = 0.35 - drawPercent * 0.08;
        }
        
        // Stretch bowstring
        if (bowstring) {
          bowstring.scale.z = 1.0 + drawPercent * 0.8;
          bowstring.position.z = -drawPercent * 0.28;
        }

        // Tension arrow in bow
        if (weapon) {
          weapon.visible = true;
          weapon.position.z = 0.05 - drawPercent * 0.22;
        }
      } else {
        // Return arms to side, hide arrow when idle
        if (leftArm) leftArm.rotation.x = 0;
        if (rightArm) {
          rightArm.rotation.x = 0;
          rightArm.position.set(0.35, 0.55, 0);
        }
        if (bowstring) {
          bowstring.scale.z = 1.0;
          bowstring.position.set(0.55 * Math.cos(Math.PI * 0.85 / 2), 0, 0);
        }
        if (weapon) {
          weapon.visible = false;
          weapon.position.set(0, -0.3, 0.05);
        }
      }
    }
    // -------------------------------------------------------------
    // STANDARD UNITS (VILLAGER, SWORDSMAN, PRIEST, TRADER) ANIMATIONS
    // -------------------------------------------------------------
    else {
      const leftFoot = bodyGroup.getObjectByName("leftFoot");
      const rightFoot = bodyGroup.getObjectByName("rightFoot");
      const rightArm = bodyGroup.getObjectByName("rightArm");

      if (isMoving) {
        const bob = Math.sin(this.animTime * 14) * 0.12;
        bodyGroup.position.y = bob;
        if (leftFoot && rightFoot) {
          leftFoot.position.z = Math.sin(this.animTime * 14) * 0.22;
          rightFoot.position.z = -Math.sin(this.animTime * 14) * 0.22;
        }
      } else {
        bodyGroup.position.y = Math.sin(this.animTime * 2.5) * 0.02;
        if (leftFoot && rightFoot) {
          leftFoot.position.z = 0;
          rightFoot.position.z = 0;
        }
      }

      // Swing tools/weapons
      if (this.swingProgress > 0) {
        this.swingProgress -= deltaTime * 3.5;
        if (rightArm) {
          rightArm.rotation.x = -Math.sin(Math.max(0, this.swingProgress) * Math.PI) * 1.1;
        }
      } else {
        if (rightArm) {
          rightArm.rotation.x = 0;
        }
      }
    }
  }
}
