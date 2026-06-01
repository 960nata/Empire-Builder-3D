import * as THREE from 'three';

export class EnemyAI {
  constructor(gameManager) {
    this.gameManager = gameManager;
    
    // Find starting Town Center spawned by GameManager
    const tc = this.gameManager.entityManager.buildings.find(b => b.playerId === 1 && b.type === 'townCenter');
    this.baseX = tc ? tc.position.x : 48;
    this.baseZ = tc ? tc.position.z : 48;
    
    this.enemyBaseTC = tc;
    this.enemyBaseBarracks = null;
    
    this.waveTimer = 0;
    
    // Set wave attack frequency based on AI Difficulty
    const difficulty = this.gameManager.aiDifficulty || 'normal';
    if (difficulty === 'easy') {
      this.waveInterval = 240.0; // Attack every 4 mins (Easy)
    } else if (difficulty === 'hard') {
      this.waveInterval = 90.0;  // Attack every 1.5 mins (Hard)
    } else {
      this.waveInterval = 150.0; // Attack every 2.5 mins (Normal)
    }
    
    this.waveCount = 0;
    
    this.ageTimer = 0; // Tracks age progression
    
    this.initBase();
  }

  initBase() {
    const em = this.gameManager.entityManager;
    
    // Create Enemy Barracks near their Town Center
    this.enemyBaseBarracks = em.createBuilding('barracks', 1, this.baseX - 6, this.baseZ - 2, true);
    this.gameManager.gridAddBuilding(this.enemyBaseBarracks);
    
    // Patrol starting guards around their base
    const guard1 = em.createUnit('swordsman', 1, this.baseX - 2, this.baseZ + 3);
    const guard2 = em.createUnit('swordsman', 1, this.baseX + 3, this.baseZ - 2);
    
    guard1.commandMove(new THREE.Vector3(this.baseX - 3, 0, this.baseZ + 2));
    guard2.commandMove(new THREE.Vector3(this.baseX + 2, 0, this.baseZ - 3));
  }

  update(deltaTime) {
    if (!this.enemyBaseTC || this.enemyBaseTC.hp <= 0) return;
    
    // 1. Coordinated Age Progression (scaled by AI Difficulty)
    this.ageTimer += deltaTime;
    const enemyState = this.gameManager.players[1];
    
    const difficulty = this.gameManager.aiDifficulty || 'normal';
    let feudalTime = 60.0;
    let castleTime = 150.0;
    let imperialTime = 260.0;
    
    if (difficulty === 'easy') {
      feudalTime = 100.0;
      castleTime = 240.0;
      imperialTime = 380.0;
    } else if (difficulty === 'hard') {
      feudalTime = 40.0;
      castleTime = 100.0;
      imperialTime = 180.0;
    }
    
    if (enemyState.age === 'dark' && this.ageTimer >= feudalTime) {
      enemyState.age = 'feudal';
      this.gameManager.upgradePlayerAge(1);
      this.gameManager.hud.addChatMessage("Lord_Kahn_Enemy", "Faksi merah telah naik ke Zaman Feodal! Bersiaplah!", 'enemy');
    } 
    else if (enemyState.age === 'feudal' && this.ageTimer >= castleTime) {
      enemyState.age = 'castle';
      this.gameManager.upgradePlayerAge(1);
      this.gameManager.hud.addChatMessage("Lord_Kahn_Enemy", "Faksi merah telah naik ke Zaman Kastil! Baju zirah baja diaktifkan.", 'enemy');
    } 
    else if (enemyState.age === 'castle' && this.ageTimer >= imperialTime) {
      enemyState.age = 'imperial';
      this.gameManager.upgradePlayerAge(1);
      this.gameManager.hud.addChatMessage("Lord_Kahn_Enemy", "Faksi merah telah mencapai Zaman Imperial! Senjata emas kami akan membumihanguskan kalian!", 'enemy');
    }

    // 2. Coordinated AI Economy loop every 3 seconds
    if (this.economyTimer === undefined) this.economyTimer = 0;
    this.economyTimer += deltaTime;
    if (this.economyTimer >= 3.0) {
      this.economyTimer = 0;
      this.manageEconomy();
    }

    // 3. Spawn Raid Waves
    this.waveTimer += deltaTime;
    if (this.waveTimer >= this.waveInterval) {
      this.waveTimer = 0;
      this.spawnAttackWave();
    }
  }

  manageEconomy() {
    const em = this.gameManager.entityManager;
    const enemyState = this.gameManager.players[1];
    const villagers = em.units.filter(u => u.playerId === 1 && u.type === 'villager' && u.state !== 'DEAD');
    const villagerCount = villagers.length;
    const resources = enemyState.resources;
    const pop = enemyState.population;
    const limit = enemyState.populationLimit;
    const maxCap = this.gameManager.maxPopulationCap;

    // A. Rebuild Barracks if destroyed
    const hasBarracks = em.buildings.some(b => b.playerId === 1 && b.type === 'barracks' && b.hp > 0);
    if (!hasBarracks && resources.wood >= 120 && resources.stone >= 50) {
      const builder = villagers.find(v => v.state === 'IDLE' || v.state === 'HARVESTING');
      if (builder) {
        const spot = this.findClearBuildSpot(this.baseX, this.baseZ, 'barracks');
        if (spot) {
          resources.wood -= 120;
          resources.stone -= 50;
          const b = em.createBuilding('barracks', 1, spot.x, spot.z, false);
          this.gameManager.gridAddBuilding(b);
          builder.commandBuild(b);
          this.enemyBaseBarracks = b;
        }
      }
    }

    // B. Task idle villagers to gather resources based on economy demand
    villagers.forEach(v => {
      if (v.state === 'IDLE') {
        let targetType = 'wood';
        if (resources.food < 250) targetType = 'food';
        else if (resources.wood < 200) targetType = 'wood';
        else if (resources.gold < 150) targetType = 'gold';
        else if (resources.stone < 100) targetType = 'stone';
        else {
          const rand = Math.random();
          if (rand < 0.35) targetType = 'food';
          else if (rand < 0.70) targetType = 'wood';
          else if (rand < 0.90) targetType = 'gold';
          else targetType = 'stone';
        }

        let node = this.findNearestResourceNode(v.position, targetType);
        if (!node) {
          const types = ['food', 'wood', 'gold', 'stone'];
          for (const t of types) {
            if (t === targetType) continue;
            node = this.findNearestResourceNode(v.position, t);
            if (node) break;
          }
        }
        if (!node) {
          node = this.findNearestAnyResourceNode(v.position);
        }
        if (node) {
          v.commandGather(node);
        }
      }
    });

    // Camp Builder (construct specialized dropoff camps near far resources)
    if (resources.wood >= 150) {
      const activeHarvesters = villagers.filter(v => v.state === 'HARVESTING' && v.targetEntity);
      for (const v of activeHarvesters) {
        const rType = v.targetEntity.type;
        let campType = null;
        let resGroup = null;
        if (rType === 'wood') {
          campType = 'lumberCamp';
          resGroup = 'wood';
        } else if (rType === 'gold' || rType === 'stone') {
          campType = 'miningCamp';
          resGroup = rType;
        } else if (['sheep', 'fish', 'farm', 'food'].includes(rType)) {
          campType = 'mill';
          resGroup = 'food';
        }
        
        if (campType) {
          const nearestDropoff = this.gameManager.findNearestDropoff(v.targetEntity.position, 1, resGroup);
          const dist = nearestDropoff ? v.targetEntity.position.distanceTo(nearestDropoff.position) : Infinity;
          
          if (dist > 16) {
            const camps = em.buildings.filter(b => b.playerId === 1 && b.type === campType);
            const hasCampNearby = camps.some(c => c.position.distanceTo(v.targetEntity.position) < 12);
            
            if (!hasCampNearby) {
              const spot = this.findClearBuildSpot(v.targetEntity.position.x, v.targetEntity.position.z, campType);
              if (spot) {
                resources.wood -= 100;
                const camp = em.createBuilding(campType, 1, spot.x, spot.z, false);
                this.gameManager.gridAddBuilding(camp);
                v.commandBuild(camp);
                break; // only place one camp per cycle
              }
            }
          }
        }
      }
    }

    // C. House Builder (construct when population limit is near)
    if (pop >= limit - 2 && limit < maxCap && resources.wood >= 50) {
      const builder = villagers.find(v => v.state === 'IDLE' || v.state === 'HARVESTING');
      if (builder) {
        const spot = this.findClearBuildSpot(this.baseX, this.baseZ, 'house');
        if (spot) {
          resources.wood -= 50;
          const h = em.createBuilding('house', 1, spot.x, spot.z, false);
          this.gameManager.gridAddBuilding(h);
          builder.commandBuild(h);
          this.gameManager.addPopulationLimit(1, 5);
        }
      }
    }

    // C2. Build Watchtower for Defense
    const towerCount = em.buildings.filter(b => b.playerId === 1 && b.type === 'watchTower').length;
    if (towerCount < 3 && enemyState.age !== 'dark' && resources.wood >= 150 && resources.stone >= 150) {
      const builder = villagers.find(v => v.state === 'IDLE' || v.state === 'HARVESTING');
      if (builder) {
        const rx = this.baseX + (Math.random() - 0.5) * 16;
        const rz = this.baseZ + (Math.random() - 0.5) * 16;
        const spot = this.findClearBuildSpot(rx, rz, 'watchTower');
        if (spot) {
          resources.wood -= 100;
          resources.stone -= 125;
          const wt = em.createBuilding('watchTower', 1, spot.x, spot.z, false);
          this.gameManager.gridAddBuilding(wt);
          builder.commandBuild(wt);
        }
      }
    }

    // D. Train Villagers at Town Center
    const maxVillagers = this.gameManager.aiDifficulty === 'easy' ? 6 : (this.gameManager.aiDifficulty === 'hard' ? 18 : 12);
    if (villagerCount < maxVillagers && this.enemyBaseTC && this.enemyBaseTC.queue.length === 0) {
      const cost = this.gameManager.getUnitCost('villager');
      if (this.gameManager.hasResources(1, cost) && pop < limit) {
        this.enemyBaseTC.queueUnit('villager');
      }
    }

    // E. Train Soldiers at Barracks using AI gathered resources
    const barracks = em.buildings.find(b => b.playerId === 1 && b.type === 'barracks' && b.isCompleted);
    if (barracks && barracks.queue.length < 3) {
      const enemyAge = enemyState.age;
      let unitToTrain = 'swordsman';
      
      if (enemyAge === 'feudal') {
        unitToTrain = Math.random() < 0.4 ? 'archer' : 'swordsman';
      } else if (enemyAge === 'castle' || enemyAge === 'imperial') {
        const rand = Math.random();
        if (rand < 0.25) unitToTrain = 'archer';
        else if (rand < 0.55) unitToTrain = 'knight';
        else if (rand < 0.75) unitToTrain = 'footKnight';
        else if (rand < 0.90) unitToTrain = 'horseArcher';
        else unitToTrain = 'swordsman';
      }
      
      const cost = this.gameManager.getUnitCost(unitToTrain);
      if (this.gameManager.hasResources(1, cost) && pop < limit) {
        barracks.queueUnit(unitToTrain);
      }
    }
  }

  findNearestResourceNode(pos, resourceType) {
    const resources = this.gameManager.entityManager.resources;
    let closestNode = null;
    let closestDist = Infinity;
    
    resources.forEach(r => {
      if (r.amount <= 0) return;
      
      let type = r.type;
      if (['sheep', 'fish', 'farm'].includes(type)) type = 'food';
      
      if (type !== resourceType) return;
      
      const dist = r.position.distanceTo(pos);
      if (dist < closestDist) {
        closestDist = dist;
        closestNode = r;
      }
    });
    return closestNode;
  }

  findNearestAnyResourceNode(pos) {
    const resources = this.gameManager.entityManager.resources;
    let closestNode = null;
    let closestDist = Infinity;
    
    resources.forEach(r => {
      if (r.amount <= 0) return;
      const dist = r.position.distanceTo(pos);
      if (dist < closestDist) {
        closestDist = dist;
        closestNode = r;
      }
    });
    return closestNode;
  }

  findClearBuildSpot(centerX, centerZ, buildingType) {
    const radius = 8;
    for (let attempts = 0; attempts < 30; attempts++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 5 + Math.random() * radius;
      const x = Math.round(centerX + Math.cos(angle) * dist);
      const z = Math.round(centerZ + Math.sin(angle) * dist);
      
      if (this.gameManager.checkBuildPosition(x, z, buildingType)) {
        return { x, z };
      }
    }
    return null;
  }

  spawnAttackWave() {
    this.waveCount++;
    const em = this.gameManager.entityManager;
    
    // 1. Gather all active completed military units for Player 1 (Enemy)
    const militaryTypes = ['swordsman', 'archer', 'knight', 'footKnight', 'heavyCavalry', 'horseArcher'];
    let army = em.units.filter(u => u.playerId === 1 && militaryTypes.includes(u.type) && u.state !== 'DEAD');
    
    // Scale target wave size by AI difficulty
    let count = Math.min(8, 1 + Math.floor(this.waveCount * 1.2));
    const difficulty = this.gameManager.aiDifficulty || 'normal';
    if (difficulty === 'easy') {
      count = Math.max(1, Math.round(count * 0.6));
    } else if (difficulty === 'hard') {
      count = Math.round(count * 1.5);
    }
    
    const waveSize = Math.max(2, Math.round(count));
    
    // Take up to waveSize trained units
    if (army.length > waveSize) {
      army = army.slice(0, waveSize);
    }
    
    // Emergency spawn if the AI's barracks was blocked or resources dried up, ensuring a raid still occurs
    if (army.length === 0) {
      const spawnX = this.enemyBaseBarracks ? this.enemyBaseBarracks.position.x : this.baseX;
      const spawnZ = this.enemyBaseBarracks ? this.enemyBaseBarracks.position.z - 2 : this.baseZ;
      const e1 = em.createUnit('swordsman', 1, spawnX, spawnZ);
      const e2 = em.createUnit('swordsman', 1, spawnX + 1, spawnZ + 1);
      this.gameManager.players[1].population += 2;
      army.push(e1, e2);
    }
    
    // Target Selection: alternate targets between Player (Blue) and Ally (Green)
    let targetPlayerId = 0;
    if (this.gameManager.gameMode === 'multi' && Math.random() > 0.5) {
      targetPlayerId = 2; // Target Ally
    }

    const targetTC = em.buildings.find(b => b.playerId === targetPlayerId && b.type === 'townCenter');
    const targetPoint = targetTC ? targetTC.position : new THREE.Vector3(-48, 0, -48);
    const factionName = targetPlayerId === 0 ? "Anda (Player)" : "Sekutu Anda (Ally)";

    if (this.gameManager.hud) {
      this.gameManager.hud.showNotification(`⚠️ Raid Wave ${this.waveCount} faksi merah menyerang base ${factionName}!`);
      this.gameManager.hud.addChatMessage("Lord_Kahn_Enemy", `Serang base ${targetPlayerId === 0 ? 'biru' : 'hijau'}! Hancurkan TC mereka!`, 'enemy');
    }

    // Command actual trained units to attack target
    army.forEach(soldier => {
      soldier.commandAttack({
        position: targetPoint,
        hp: 1, // Dummy target mapping
        takeDamage: (amount) => {
          if (targetTC) targetTC.takeDamage(amount);
        }
      });
      
      soldier.state = 'CHASING';
      if (targetTC) {
        soldier.targetEntity = targetTC;
      }
    });

    // Play raid alert sound
    this.gameManager.soundManager.playClickSound('hit');
  }
}
