import * as THREE from 'three';

export class EnemyAI {
  constructor(gameManager, playerId = 1) {
    this.playerId = playerId;
    this.gameManager = gameManager;
    
    // Find starting Town Center spawned by GameManager
    const tc = this.gameManager.entityManager.buildings.find(b => b.playerId === this.playerId && b.type === 'townCenter');
    this.baseX = tc ? tc.position.x : 48;
    this.baseZ = tc ? tc.position.z : 48;
    
    this.enemyBaseTC = tc;
    this.enemyBaseBarracks = null;
    
    this.waveTimer = 0;
    
    // Set wave attack frequency based on AI Difficulty
    const difficulty = this.gameManager.aiDifficulty || 'normal';
    if (difficulty === 'easy') {
      this.waveInterval = 240.0; // Attack every 4 mins (Easy)
    } else if (difficulty === 'normal') {
      this.waveInterval = 150.0; // Attack every 2.5 mins (Standard)
    } else if (difficulty === 'moderate') {
      this.waveInterval = 120.0; // Attack every 2 mins (Moderate)
    } else if (difficulty === 'hard') {
      this.waveInterval = 85.0;  // Attack every 1.4 mins (Hard)
    } else if (difficulty === 'hardest') {
      this.waveInterval = 65.0;  // Attack every 1.1 mins (Hardest)
    } else if (difficulty === 'extreme') {
      this.waveInterval = 45.0;  // Attack every 45s (Extreme)
    } else {
      this.waveInterval = 150.0;
    }
    
    this.waveCount = 0;
    
    this.ageTimer = 0; // Tracks age progression
    
    this.initBase();
  }

  initBase() {
    const em = this.gameManager.entityManager;
    
    // Create Enemy Barracks near their Town Center
    this.enemyBaseBarracks = em.createBuilding('barracks', this.playerId, this.baseX - 6, this.baseZ - 2, true);
    this.gameManager.gridAddBuilding(this.enemyBaseBarracks);
    
    // Patrol starting guards around their base
    const guard1 = em.createUnit('swordsman', this.playerId, this.baseX - 2, this.baseZ + 3);
    const guard2 = em.createUnit('swordsman', this.playerId, this.baseX + 3, this.baseZ - 2);
    
    guard1.commandMove(new THREE.Vector3(this.baseX - 3, 0, this.baseZ + 2));
    guard2.commandMove(new THREE.Vector3(this.baseX + 2, 0, this.baseZ - 3));
  }

  update(deltaTime) {
    if (!this.enemyBaseTC || this.enemyBaseTC.hp <= 0) return;
    
    // 1. Coordinated Age Progression (scaled by AI Difficulty)
    this.ageTimer += deltaTime;
    const enemyState = this.gameManager.players[this.playerId];
    
    const difficulty = this.gameManager.aiDifficulty || 'normal';
    let feudalTime = 80.0;
    let castleTime = 190.0;
    let imperialTime = 310.0;
    
    if (difficulty === 'easy') {
      feudalTime = 120.0;
      castleTime = 280.0;
      imperialTime = 450.0;
    } else if (difficulty === 'normal') {
      feudalTime = 80.0;
      castleTime = 190.0;
      imperialTime = 310.0;
    } else if (difficulty === 'moderate') {
      feudalTime = 60.0;
      castleTime = 150.0;
      imperialTime = 260.0;
    } else if (difficulty === 'hard') {
      feudalTime = 45.0;
      castleTime = 110.0;
      imperialTime = 190.0;
    } else if (difficulty === 'hardest') {
      feudalTime = 35.0;
      castleTime = 90.0;
      imperialTime = 150.0;
    } else if (difficulty === 'extreme') {
      feudalTime = 25.0;
      castleTime = 65.0;
      imperialTime = 110.0;
    }
    
    if (enemyState.age === 'dark' && this.ageTimer >= feudalTime) {
      enemyState.age = 'feudal';
      this.gameManager.upgradePlayerAge(this.playerId);
      this.gameManager.hud.addChatMessage(this.playerId === 1 ? "Lord_Kahn_Enemy" : "Kaiser_Karl", `${this.playerId === 1 ? "Faksi merah" : "Faksi ungu"} telah naik ke Zaman Feodal! Bersiaplah!`, 'enemy');
    } 
    else if (enemyState.age === 'feudal' && this.ageTimer >= castleTime) {
      enemyState.age = 'castle';
      this.gameManager.upgradePlayerAge(this.playerId);
      this.gameManager.hud.addChatMessage(this.playerId === 1 ? "Lord_Kahn_Enemy" : "Kaiser_Karl", `${this.playerId === 1 ? "Faksi merah" : "Faksi ungu"} telah naik ke Zaman Kastil! Baju zirah baja diaktifkan.`, 'enemy');
    } 
    else if (enemyState.age === 'castle' && this.ageTimer >= imperialTime) {
      enemyState.age = 'imperial';
      this.gameManager.upgradePlayerAge(this.playerId);
      this.gameManager.hud.addChatMessage(this.playerId === 1 ? "Lord_Kahn_Enemy" : "Kaiser_Karl", `${this.playerId === 1 ? "Faksi merah" : "Faksi ungu"} telah mencapai Zaman Imperial! Senjata emas kami akan membumihanguskan kalian!`, 'enemy');
    }

    // 2. Coordinated AI Economy loop every 3 seconds
    if (this.economyTimer === undefined) this.economyTimer = 0;
    this.economyTimer += deltaTime;
    if (this.economyTimer >= 3.0) {
      this.economyTimer = 0;
      this.manageEconomy();
    }

    // 3. Garrison Defense check for villagers under attack (moderate/hard/hardest/extreme difficulties)
    if (difficulty !== 'easy' && difficulty !== 'normal' && this.enemyBaseTC) {
      if (this.underAttackTimer === undefined) this.underAttackTimer = 0;
      
      const enemiesNearBase = this.gameManager.entityManager.units.some(u => 
        u.hp > 0 && u.state !== 'DEAD' && this.gameManager.isEnemy(this.playerId, u.playerId) && 
        u.position.distanceTo(this.enemyBaseTC.position) < 18.0
      );
      
      if (enemiesNearBase) {
        this.underAttackTimer = 10.0;
        const villagers = this.gameManager.entityManager.units.filter(u => 
          u.playerId === this.playerId && u.type === 'villager' && u.state !== 'DEAD' && u.state !== 'GARRISONED' &&
          u.position.distanceTo(this.enemyBaseTC.position) < 20.0
        );
        villagers.forEach(v => {
          v.commandGarrison(this.enemyBaseTC);
        });
      } else {
        if (this.underAttackTimer > 0) {
          this.underAttackTimer -= deltaTime;
          if (this.underAttackTimer <= 0) {
            this.enemyBaseTC.ungarrisonAll();
          }
        }
      }
    }

    // 4. Spawn Raid Waves
    this.waveTimer += deltaTime;
    if (this.waveTimer >= this.waveInterval) {
      this.waveTimer = 0;
      this.spawnAttackWave();
    }
  }

  manageEconomy() {
    const em = this.gameManager.entityManager;
    const enemyState = this.gameManager.players[this.playerId];
    const difficulty = this.gameManager.aiDifficulty || 'normal';
    const resources = enemyState.resources;

    // Extreme/Insane difficulty cheat: resources never dry up
    if (difficulty === 'extreme') {
      if (resources.wood < 300) resources.wood = 1000;
      if (resources.food < 300) resources.food = 1000;
      if (resources.gold < 300) resources.gold = 1000;
      if (resources.stone < 300) resources.stone = 1000;
    }

    const villagers = em.units.filter(u => u.playerId === this.playerId && u.type === 'villager' && u.state !== 'DEAD');
    const villagerCount = villagers.length;
    const pop = enemyState.population;
    const limit = enemyState.populationLimit;
    const maxCap = this.gameManager.maxPopulationCap;

    // A0. Dock and Navy Builder on water maps (moderate/hard/hardest/extreme)
    const isWaterMap = ['river', 'islands', 'coastal'].includes(this.gameManager.terrain.mapType);
    if (isWaterMap && difficulty !== 'easy' && difficulty !== 'normal') {
      const hasDock = em.buildings.some(b => b.playerId === this.playerId && b.type === 'dock' && b.hp > 0);
      if (!hasDock && resources.wood >= 150) {
        const builder = villagers.find(v => v.state === 'IDLE' || v.state === 'HARVESTING');
        if (builder) {
          const spot = this.findDockBuildSpot();
          if (spot) {
            resources.wood -= 150;
            const dk = em.createBuilding('dock', this.playerId, spot.x, spot.z, false);
            this.gameManager.gridAddBuilding(dk);
            builder.commandBuild(dk);
          }
        }
      }
      
      // Train fishing ships and warships at the dock
      const dock = em.buildings.find(b => b.playerId === this.playerId && b.type === 'dock' && b.isCompleted);
      if (dock && dock.queue.length < 2) {
        const fishingShipsCount = em.units.filter(u => u.playerId === this.playerId && u.type === 'fishingShip' && u.state !== 'DEAD').length;
        let shipToTrain = null;
        if (fishingShipsCount < 3 && resources.wood >= 75) {
          shipToTrain = 'fishingShip';
        } else if (resources.wood >= 90 && resources.gold >= 30) {
          const rand = Math.random();
          if (enemyState.age === 'imperial' && rand < 0.25) {
            shipToTrain = 'cannonGalleon';
          } else if (rand < 0.5) {
            shipToTrain = 'fireShip';
          } else if (rand < 0.75) {
            shipToTrain = 'demolitionShip';
          } else {
            shipToTrain = 'galley';
          }
        }
        
        if (shipToTrain) {
          const cost = this.gameManager.getUnitCost(shipToTrain);
          if (this.gameManager.hasResources(this.playerId, cost) && pop < limit) {
            dock.queueUnit(shipToTrain);
          }
        }
      }
    }

    // A. Rebuild Barracks if destroyed
    const hasBarracks = em.buildings.some(b => b.playerId === this.playerId && b.type === 'barracks' && b.hp > 0);
    if (!hasBarracks && resources.wood >= 120 && resources.stone >= 50) {
      const builder = villagers.find(v => v.state === 'IDLE' || v.state === 'HARVESTING');
      if (builder) {
        const spot = this.findClearBuildSpot(this.baseX, this.baseZ, 'barracks');
        if (spot) {
          resources.wood -= 120;
          resources.stone -= 50;
          const b = em.createBuilding('barracks', this.playerId, spot.x, spot.z, false);
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
          const nearestDropoff = this.gameManager.findNearestDropoff(v.targetEntity.position, this.playerId, resGroup);
          const dist = nearestDropoff ? v.targetEntity.position.distanceTo(nearestDropoff.position) : Infinity;
          
          if (dist > 16) {
            const camps = em.buildings.filter(b => b.playerId === this.playerId && b.type === campType);
            const hasCampNearby = camps.some(c => c.position.distanceTo(v.targetEntity.position) < 12);
            
            if (!hasCampNearby) {
              const spot = this.findClearBuildSpot(v.targetEntity.position.x, v.targetEntity.position.z, campType);
              if (spot) {
                resources.wood -= 100;
                const camp = em.createBuilding(campType, this.playerId, spot.x, spot.z, false);
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
          const h = em.createBuilding('house', this.playerId, spot.x, spot.z, false);
          this.gameManager.gridAddBuilding(h);
          builder.commandBuild(h);
          this.gameManager.addPopulationLimit(this.playerId, 5);
        }
      }
    }

    // C2. Build Watchtower for Defense
    const towerCount = em.buildings.filter(b => b.playerId === this.playerId && b.type === 'watchTower').length;
    if (towerCount < 3 && enemyState.age !== 'dark' && resources.wood >= 150 && resources.stone >= 150) {
      const builder = villagers.find(v => v.state === 'IDLE' || v.state === 'HARVESTING');
      if (builder) {
        const rx = this.baseX + (Math.random() - 0.5) * 16;
        const rz = this.baseZ + (Math.random() - 0.5) * 16;
        const spot = this.findClearBuildSpot(rx, rz, 'watchTower');
        if (spot) {
          resources.wood -= 100;
          resources.stone -= 125;
          const wt = em.createBuilding('watchTower', this.playerId, spot.x, spot.z, false);
          this.gameManager.gridAddBuilding(wt);
          builder.commandBuild(wt);
        }
      }
    }

    // D2. Build Blacksmith
    const hasBlacksmith = em.buildings.some(b => b.playerId === this.playerId && b.type === 'blacksmith' && b.hp > 0);
    if (!hasBlacksmith && enemyState.age !== 'dark' && resources.wood >= 150) {
      const builder = villagers.find(v => v.state === 'IDLE' || v.state === 'HARVESTING');
      if (builder) {
        const spot = this.findClearBuildSpot(this.baseX, this.baseZ, 'blacksmith');
        if (spot) {
          resources.wood -= 150;
          const bs = em.createBuilding('blacksmith', this.playerId, spot.x, spot.z, false);
          this.gameManager.gridAddBuilding(bs);
          builder.commandBuild(bs);
        }
      }
    }

    // D2a. Build Stable
    const hasStable = em.buildings.some(b => b.playerId === this.playerId && b.type === 'stable' && b.hp > 0);
    if (!hasStable && enemyState.age !== 'dark' && resources.wood >= 175) {
      const builder = villagers.find(v => v.state === 'IDLE' || v.state === 'HARVESTING');
      if (builder) {
        const spot = this.findClearBuildSpot(this.baseX, this.baseZ, 'stable');
        if (spot) {
          resources.wood -= 175;
          const b = em.createBuilding('stable', this.playerId, spot.x, spot.z, false);
          this.gameManager.gridAddBuilding(b);
          builder.commandBuild(b);
        }
      }
    }

    // D2b. Build Archery Range
    const hasArcheryRange = em.buildings.some(b => b.playerId === this.playerId && b.type === 'archeryRange' && b.hp > 0);
    if (!hasArcheryRange && enemyState.age !== 'dark' && resources.wood >= 175) {
      const builder = villagers.find(v => v.state === 'IDLE' || v.state === 'HARVESTING');
      if (builder) {
        const spot = this.findClearBuildSpot(this.baseX, this.baseZ, 'archeryRange');
        if (spot) {
          resources.wood -= 175;
          const b = em.createBuilding('archeryRange', this.playerId, spot.x, spot.z, false);
          this.gameManager.gridAddBuilding(b);
          builder.commandBuild(b);
        }
      }
    }

    // D3. Build University
    const hasUniversity = em.buildings.some(b => b.playerId === this.playerId && b.type === 'university' && b.hp > 0);
    if (!hasUniversity && enemyState.age !== 'dark' && resources.wood >= 200 && resources.gold >= 100) {
      const builder = villagers.find(v => v.state === 'IDLE' || v.state === 'HARVESTING');
      if (builder) {
        const spot = this.findClearBuildSpot(this.baseX, this.baseZ, 'university');
        if (spot) {
          resources.wood -= 200;
          resources.gold -= 100;
          const univ = em.createBuilding('university', this.playerId, spot.x, spot.z, false);
          this.gameManager.gridAddBuilding(univ);
          builder.commandBuild(univ);
        }
      }
    }

    // D3a. Build Monastery
    const hasMonastery = em.buildings.some(b => b.playerId === this.playerId && b.type === 'monastery' && b.hp > 0);
    if (!hasMonastery && (enemyState.age === 'castle' || enemyState.age === 'imperial') && resources.wood >= 175) {
      const builder = villagers.find(v => v.state === 'IDLE' || v.state === 'HARVESTING');
      if (builder) {
        const spot = this.findClearBuildSpot(this.baseX, this.baseZ, 'monastery');
        if (spot) {
          resources.wood -= 175;
          const b = em.createBuilding('monastery', this.playerId, spot.x, spot.z, false);
          this.gameManager.gridAddBuilding(b);
          builder.commandBuild(b);
        }
      }
    }

    // D3b. Build Bombard Tower for Defense in Imperial Age
    const bombardTowerCount = em.buildings.filter(b => b.playerId === this.playerId && b.type === 'bombardTower').length;
    if (bombardTowerCount < 2 && enemyState.age === 'imperial' && resources.stone >= 250 && resources.gold >= 100) {
      const builder = villagers.find(v => v.state === 'IDLE' || v.state === 'HARVESTING');
      if (builder) {
        const rx = this.baseX + (Math.random() - 0.5) * 20;
        const rz = this.baseZ + (Math.random() - 0.5) * 20;
        const spot = this.findClearBuildSpot(rx, rz, 'bombardTower');
        if (spot) {
          resources.stone -= 250;
          resources.gold -= 100;
          const bt = em.createBuilding('bombardTower', this.playerId, spot.x, spot.z, false);
          this.gameManager.gridAddBuilding(bt);
          builder.commandBuild(bt);
        }
      }
    }

    // D4. Build Siege Workshop
    const hasWorkshop = em.buildings.some(b => b.playerId === this.playerId && b.type === 'siegeWorkshop' && b.hp > 0);
    if (!hasWorkshop && enemyState.age !== 'dark' && resources.wood >= 200 && resources.gold >= 100) {
      const builder = villagers.find(v => v.state === 'IDLE' || v.state === 'HARVESTING');
      if (builder) {
        const spot = this.findClearBuildSpot(this.baseX, this.baseZ, 'siegeWorkshop');
        if (spot) {
          resources.wood -= 200;
          resources.gold -= 100;
          const ws = em.createBuilding('siegeWorkshop', this.playerId, spot.x, spot.z, false);
          this.gameManager.gridAddBuilding(ws);
          builder.commandBuild(ws);
        }
      }
    }

    // D5. Build Castle
    const hasCastle = em.buildings.some(b => b.playerId === this.playerId && b.type === 'castle' && b.hp > 0);
    if (!hasCastle && (enemyState.age === 'castle' || enemyState.age === 'imperial') && resources.wood >= 200 && resources.stone >= 650) {
      const builder = villagers.find(v => v.state === 'IDLE' || v.state === 'HARVESTING');
      if (builder) {
        const spot = this.findClearBuildSpot(this.baseX, this.baseZ, 'castle');
        if (spot) {
          resources.wood -= 200;
          resources.stone -= 650;
          const castle = em.createBuilding('castle', this.playerId, spot.x, spot.z, false);
          this.gameManager.gridAddBuilding(castle);
          builder.commandBuild(castle);
        }
      }
    }

    // D6. AI Research Upgrades
    const myBuildings = em.buildings.filter(b => b.playerId === this.playerId && b.isCompleted);
    myBuildings.forEach(b => {
      if (b.queue.length > 0) return; // Busy
      
      if (b.type === 'blacksmith') {
        const attackLvl = enemyState.upgrades.attack || 0;
        const armorLvl = enemyState.upgrades.armor || 0;
        const arrowLvl = enemyState.upgrades.arrow || 0;
        
        let typeToUpgrade = null;
        let currentLvl = 0;
        if (attackLvl < 3 && attackLvl <= armorLvl && attackLvl <= arrowLvl) {
          typeToUpgrade = 'attack';
          currentLvl = attackLvl;
        } else if (armorLvl < 3 && armorLvl <= arrowLvl) {
          typeToUpgrade = 'armor';
          currentLvl = armorLvl;
        } else if (arrowLvl < 3) {
          typeToUpgrade = 'arrow';
          currentLvl = arrowLvl;
        }
        
        if (typeToUpgrade) {
          const cost = this.gameManager.getUpgradeCost(typeToUpgrade, currentLvl);
          if (this.gameManager.hasResources(this.playerId, cost)) {
            b.queueUpgrade(typeToUpgrade);
          }
        }
      }
      else if (b.type === 'university') {
        const palisadeLvl = enemyState.upgrades.palisadeWallUpgrade || 0;
        const stoneLvl = enemyState.upgrades.stoneWallUpgrade || 0;
        const towerLvl = enemyState.upgrades.watchTowerUpgrade || 0;
        
        let typeToUpgrade = null;
        let currentLvl = 0;
        
        if (towerLvl < 2 && towerLvl <= palisadeLvl) {
          typeToUpgrade = 'watchTowerUpgrade';
          currentLvl = towerLvl;
        } else if (stoneLvl < 2 && stoneLvl <= palisadeLvl) {
          typeToUpgrade = 'stoneWallUpgrade';
          currentLvl = stoneLvl;
        } else if (palisadeLvl < 2) {
          typeToUpgrade = 'palisadeWallUpgrade';
          currentLvl = palisadeLvl;
        }
        
        if (typeToUpgrade) {
          const cost = this.gameManager.getUpgradeCost(typeToUpgrade, currentLvl);
          if (this.gameManager.hasResources(this.playerId, cost)) {
            b.queueUpgrade(typeToUpgrade);
          }
        }
      }
      else if (b.type === 'siegeWorkshop') {
        const ramLvl = enemyState.upgrades.batteringRamUpgrade || 0;
        const mangonelLvl = enemyState.upgrades.mangonelUpgrade || 0;
        const scorpionLvl = enemyState.upgrades.scorpionUpgrade || 0;
        const cannonLvl = enemyState.upgrades.bombardCannonUpgrade || 0;
        
        let typeToUpgrade = null;
        let currentLvl = 0;
        
        if (ramLvl < 2 && ramLvl <= mangonelLvl) {
          typeToUpgrade = 'batteringRamUpgrade';
          currentLvl = ramLvl;
        } else if (mangonelLvl < 2) {
          typeToUpgrade = 'mangonelUpgrade';
          currentLvl = mangonelLvl;
        } else if (scorpionLvl < 1) {
          typeToUpgrade = 'scorpionUpgrade';
          currentLvl = scorpionLvl;
        } else if (cannonLvl < 1 && enemyState.age === 'imperial') {
          typeToUpgrade = 'bombardCannonUpgrade';
          currentLvl = cannonLvl;
        }
        
        if (typeToUpgrade) {
          const cost = this.gameManager.getUpgradeCost(typeToUpgrade, currentLvl);
          if (this.gameManager.hasResources(this.playerId, cost)) {
            b.queueUpgrade(typeToUpgrade);
          }
        }
      }
      else if (b.type === 'barracks') {
        const sUpgrade = enemyState.upgrades.swordsmanUpgrade || 0;
        const spUpgrade = enemyState.upgrades.spearmanUpgrade || 0;
        
        let typeToUpgrade = null;
        let currentLvl = 0;
        
        if (sUpgrade < 2 && sUpgrade <= spUpgrade) {
          typeToUpgrade = 'swordsmanUpgrade';
          currentLvl = sUpgrade;
        } else if (spUpgrade < 2) {
          typeToUpgrade = 'spearmanUpgrade';
          currentLvl = spUpgrade;
        }
        
        if (typeToUpgrade) {
          const cost = this.gameManager.getUpgradeCost(typeToUpgrade, currentLvl);
          if (this.gameManager.hasResources(this.playerId, cost)) {
            b.queueUpgrade(typeToUpgrade);
          }
        }
      }
      else if (b.type === 'stable') {
        const scUpgrade = enemyState.upgrades.scoutUpgrade || 0;
        const kUpgrade = enemyState.upgrades.knightUpgrade || 0;
        const cUpgrade = enemyState.upgrades.camelUpgrade || 0;
        
        let typeToUpgrade = null;
        let currentLvl = 0;
        
        if (kUpgrade < 2 && kUpgrade <= scUpgrade && kUpgrade <= cUpgrade) {
          typeToUpgrade = 'knightUpgrade';
          currentLvl = kUpgrade;
        } else if (cUpgrade < 2 && cUpgrade <= scUpgrade) {
          typeToUpgrade = 'camelUpgrade';
          currentLvl = cUpgrade;
        } else if (scUpgrade < 2) {
          typeToUpgrade = 'scoutUpgrade';
          currentLvl = scUpgrade;
        }
        
        if (typeToUpgrade) {
          const cost = this.gameManager.getUpgradeCost(typeToUpgrade, currentLvl);
          if (this.gameManager.hasResources(this.playerId, cost)) {
            b.queueUpgrade(typeToUpgrade);
          }
        }
      }
      else if (b.type === 'archeryRange') {
        const aUpgrade = enemyState.upgrades.archerUpgrade || 0;
        const skUpgrade = enemyState.upgrades.skirmisherUpgrade || 0;
        const caUpgrade = enemyState.upgrades.cavalryArcherUpgrade || 0;
        
        let typeToUpgrade = null;
        let currentLvl = 0;
        
        if (aUpgrade < 2 && aUpgrade <= skUpgrade && aUpgrade <= caUpgrade) {
          typeToUpgrade = 'archerUpgrade';
          currentLvl = aUpgrade;
        } else if (skUpgrade < 1 && skUpgrade <= caUpgrade) {
          typeToUpgrade = 'skirmisherUpgrade';
          currentLvl = skUpgrade;
        } else if (caUpgrade < 1) {
          typeToUpgrade = 'cavalryArcherUpgrade';
          currentLvl = caUpgrade;
        }
        
        if (typeToUpgrade) {
          const cost = this.gameManager.getUpgradeCost(typeToUpgrade, currentLvl);
          if (this.gameManager.hasResources(this.playerId, cost)) {
            b.queueUpgrade(typeToUpgrade);
          }
        }
      }
      else if (b.type === 'monastery') {
        const sanctity = enemyState.upgrades.sanctity || 0;
        const fervor = enemyState.upgrades.fervor || 0;
        const blockPrinting = enemyState.upgrades.blockPrinting || 0;
        
        let typeToUpgrade = null;
        if (sanctity < 1) {
          typeToUpgrade = 'sanctity';
        } else if (fervor < 1) {
          typeToUpgrade = 'fervor';
        } else if (blockPrinting < 1) {
          typeToUpgrade = 'blockPrinting';
        }
        
        if (typeToUpgrade) {
          const cost = this.gameManager.getUpgradeCost(typeToUpgrade, 0);
          if (this.gameManager.hasResources(this.playerId, cost)) {
            b.queueUpgrade(typeToUpgrade);
          }
        }
      }
    });

    // D7. Train Siege Units at Siege Workshop
    const workshop = em.buildings.find(b => b.playerId === this.playerId && b.type === 'siegeWorkshop' && b.isCompleted);
    if (workshop && workshop.queue.length < 2) {
      let unitToTrain = null;
      const rand = Math.random();
      if (enemyState.age === 'imperial' && rand < 0.25) {
        unitToTrain = 'bombardCannon';
      } else if (rand < 0.5) {
        unitToTrain = 'mangonel';
      } else if (rand < 0.75) {
        unitToTrain = 'scorpion';
      } else if (rand < 0.9) {
        unitToTrain = 'batteringRam';
      } else {
        unitToTrain = 'siegeTower';
      }
      
      const cost = this.gameManager.getUnitCost(unitToTrain);
      if (this.gameManager.hasResources(this.playerId, cost) && pop < limit) {
        workshop.queueUnit(unitToTrain);
      }
    }

    // D8. Train Trebuchet / Petard at Castle
    const cstl = em.buildings.find(b => b.playerId === this.playerId && b.type === 'castle' && b.isCompleted);
    if (cstl && cstl.queue.length < 2) {
      const unitToTrain = Math.random() < 0.5 ? 'trebuchet' : 'petard';
      const cost = this.gameManager.getUnitCost(unitToTrain);
      if (this.gameManager.hasResources(this.playerId, cost) && pop < limit) {
        cstl.queueUnit(unitToTrain);
      }
    }

    // D. Train Villagers at Town Center
    let maxVillagers = 12;
    if (difficulty === 'easy') maxVillagers = 6;
    else if (difficulty === 'normal') maxVillagers = 12;
    else if (difficulty === 'moderate') maxVillagers = 16;
    else if (difficulty === 'hard') maxVillagers = 22;
    else if (difficulty === 'hardest') maxVillagers = 32;
    else if (difficulty === 'extreme') maxVillagers = 45;

    if (villagerCount < maxVillagers && this.enemyBaseTC && this.enemyBaseTC.queue.length === 0) {
      const cost = this.gameManager.getUnitCost('villager');
      if (this.gameManager.hasResources(this.playerId, cost) && pop < limit) {
        this.enemyBaseTC.queueUnit('villager');
      }
    }

    // E1. Train Soldiers at Barracks (Infantry)
    const barracks = em.buildings.find(b => b.playerId === this.playerId && b.type === 'barracks' && b.isCompleted);
    if (barracks && barracks.queue.length < 2) {
      const enemyAge = enemyState.age;
      let unitToTrain = 'swordsman';
      if (enemyAge !== 'dark') {
        const rand = Math.random();
        if (enemyAge === 'feudal') {
          unitToTrain = rand < 0.5 ? 'spearman' : 'swordsman';
        } else {
          if (rand < 0.35) unitToTrain = 'spearman';
          else if (rand < 0.7) unitToTrain = 'swordsman';
          else unitToTrain = 'footKnight';
        }
      }
      const cost = this.gameManager.getUnitCost(unitToTrain);
      if (this.gameManager.hasResources(this.playerId, cost) && pop < limit) {
        barracks.queueUnit(unitToTrain);
      }
    }

    // E2. Train Soldiers at Stable (Cavalry)
    const stable = em.buildings.find(b => b.playerId === this.playerId && b.type === 'stable' && b.isCompleted);
    if (stable && stable.queue.length < 2) {
      const enemyAge = enemyState.age;
      let unitToTrain = 'scoutCavalry';
      if (enemyAge === 'castle' || enemyAge === 'imperial') {
        const rand = Math.random();
        if (rand < 0.4) unitToTrain = 'knight';
        else if (rand < 0.7) unitToTrain = 'camelRider';
        else unitToTrain = 'scoutCavalry';
      }
      const cost = this.gameManager.getUnitCost(unitToTrain);
      if (this.gameManager.hasResources(this.playerId, cost) && pop < limit) {
        stable.queueUnit(unitToTrain);
      }
    }

    // E3. Train Soldiers at Archery Range (Archers)
    const archeryRange = em.buildings.find(b => b.playerId === this.playerId && b.type === 'archeryRange' && b.isCompleted);
    if (archeryRange && archeryRange.queue.length < 2) {
      const enemyAge = enemyState.age;
      let unitToTrain = 'archer';
      if (enemyAge === 'castle' || enemyAge === 'imperial') {
        const rand = Math.random();
        if (rand < 0.4) unitToTrain = 'archer';
        else if (rand < 0.7) unitToTrain = 'skirmisher';
        else unitToTrain = 'cavalryArcher';
      } else if (enemyAge === 'feudal') {
        unitToTrain = Math.random() < 0.5 ? 'archer' : 'skirmisher';
      }
      const cost = this.gameManager.getUnitCost(unitToTrain);
      if (this.gameManager.hasResources(this.playerId, cost) && pop < limit) {
        archeryRange.queueUnit(unitToTrain);
      }
    }

    // E4. Train Monks at Monastery
    const monastery = em.buildings.find(b => b.playerId === this.playerId && b.type === 'monastery' && b.isCompleted);
    if (monastery && monastery.queue.length < 1) {
      const monkCount = em.units.filter(u => u.playerId === this.playerId && u.type === 'monk' && u.state !== 'DEAD').length;
      if (monkCount < 2) {
        const cost = this.gameManager.getUnitCost('monk');
        if (this.gameManager.hasResources(this.playerId, cost) && pop < limit) {
          monastery.queueUnit('monk');
        }
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
    const difficulty = this.gameManager.aiDifficulty || 'normal';
    
    // Easy AI: 50% chance to skip or abort raid
    if (difficulty === 'easy' && Math.random() < 0.5) {
      if (this.gameManager.hud) {
        this.gameManager.hud.showNotification("Easy AI canceled raid wave preparation.");
      }
      return;
    }

    this.waveCount++;
    const em = this.gameManager.entityManager;
    
    // 1. Gather all active completed military units for Player 1 (Enemy)
    const militaryTypes = [
      'swordsman', 'archer', 'knight', 'footKnight', 'heavyCavalry', 'horseArcher',
      'batteringRam', 'mangonel', 'scorpion', 'bombardCannon', 'siegeTower', 'trebuchet', 'petard',
      'spearman', 'skirmisher', 'scoutCavalry', 'camelRider', 'cavalryArcher', 'monk'
    ];
    let army = em.units.filter(u => u.playerId === this.playerId && militaryTypes.includes(u.type) && u.state !== 'DEAD');
    
    // Scale target wave size by AI difficulty
    let count = Math.min(8, 1 + Math.floor(this.waveCount * 1.2));
    if (difficulty === 'easy') {
      count = Math.max(1, Math.round(count * 0.5));
    } else if (difficulty === 'moderate') {
      count = Math.round(count * 1.1);
    } else if (difficulty === 'hard') {
      count = Math.round(count * 1.5);
    } else if (difficulty === 'hardest') {
      count = Math.round(count * 2.0);
    } else if (difficulty === 'extreme') {
      count = Math.round(count * 2.5);
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
      const e1 = em.createUnit('swordsman', this.playerId, spawnX, spawnZ);
      const e2 = em.createUnit('swordsman', this.playerId, spawnX + 1, spawnZ + 1);
      this.gameManager.players[this.playerId].population += 2;
      army.push(e1, e2);
    }
    
    // Target Selection: alternate targets between Player (Blue) and Ally (Green)
    let targetPlayerId = 0;
    if (this.gameManager.gameMode === 'multi' && Math.random() > 0.5) {
      targetPlayerId = 2; // Target Ally
    }

    const targetTC = em.buildings.find(b => b.playerId === targetPlayerId && b.type === 'townCenter');
    const targetPoint = targetTC ? targetTC.position.clone() : new THREE.Vector3(-48, 0, -48);
    const factionName = targetPlayerId === 0 ? "Anda (Player)" : "Sekutu Anda (Ally)";

    // Define formation used for this raid wave
    const waveFormations = ['line', 'column', 'box', 'flank', 'deathball'];
    const selectedFormation = waveFormations[Math.floor(Math.random() * waveFormations.length)];
    const formationNameIndo = {
      line: "Baris (Line)",
      column: "Kolom (Column)",
      box: "Box / Kotak",
      flank: "Flank (Mengapit)",
      deathball: "Deathball (Gumpalan)"
    }[selectedFormation];

    if (this.gameManager.hud) {
      this.gameManager.hud.showNotification(`⚠️ Raid Wave ${this.waveCount} faksi merah menyerang base ${factionName}! Formasi: ${formationNameIndo}`);
      
      const chatMsgs = {
        easy: "Kami datang berkunjung saja...",
        normal: `Serang base ${targetPlayerId === 0 ? 'biru' : 'hijau'} dengan formasi ${selectedFormation}!`,
        moderate: `Ayo bergerak bersama! Formasi ${selectedFormation} siap menghantam TC mereka!`,
        hard: `Gunakan taktik ${formationNameIndo}! Hancurkan pertahanan mereka!`,
        hardest: `Taktik multi-arah diaktifkan! Kepung base ${targetPlayerId === 0 ? 'biru' : 'hijau'}!`,
        extreme: `MAMPUKAH KALIAN MENAHAN TSUNAMI PASUKAN KAMI DENGAN TAKTIK ${selectedFormation.toUpperCase()}?!`
      };
      this.gameManager.hud.addChatMessage(this.playerId === 1 ? "Lord_Kahn_Enemy" : "Kaiser_Karl", chatMsgs[difficulty] || chatMsgs.normal, 'enemy');
    }

    // Naval Assault handling (spawns supporting warships near player TC)
    const isWaterMap = ['river', 'islands', 'coastal'].includes(this.gameManager.terrain.mapType);
    if (isWaterMap && difficulty !== 'easy' && difficulty !== 'normal') {
      const shipTypes = ['galley', 'fireShip', 'cannonGalleon'];
      const shipType = shipTypes[Math.floor(Math.random() * shipTypes.length)];
      const wx = targetPoint.x + (Math.random() - 0.5) * 15;
      const wz = targetPoint.z + (Math.random() - 0.5) * 15;
      const height = this.gameManager.terrain.getGroundHeight(wx, wz);
      if (height < -0.5) {
        em.createUnit(shipType, this.playerId, wx, wz);
        this.gameManager.players[this.playerId].population++;
      }
    }

    // Coordinated target routing based on strategy (Rush, Turtle Bust, Multi-Prong)
    const isMultiProng = (difficulty === 'hardest' || difficulty === 'extreme') && army.length >= 6;
    
    if (isMultiProng) {
      const size1 = Math.ceil(army.length * 0.4);
      const size2 = Math.ceil(army.length * 0.3);
      
      const group1 = army.slice(0, size1);
      const group2 = army.slice(size1, size1 + size2);
      const group3 = army.slice(size1 + size2);
      
      // Group 1: Front attack Town Center directly
      group1.forEach(s => {
        s.commandAttack(targetTC || { position: targetPoint });
      });

      // Group 2: Flank/Back attack Town Center (offset target point)
      const offsetPoint = targetPoint.clone().add(new THREE.Vector3((Math.random() - 0.5) * 40 + 20, 0, (Math.random() - 0.5) * 40 + 20));
      group2.forEach(s => {
        s.commandAttack({
          position: offsetPoint,
          hp: 1,
          takeDamage: (amount) => { if (targetTC) targetTC.takeDamage(amount); }
        });
      });

      // Group 3: Eco Raid targets villagers directly if possible
      const playerVillager = em.units.find(u => u.playerId === targetPlayerId && u.type === 'villager' && u.state !== 'DEAD');
      group3.forEach(s => {
        s.commandAttack(playerVillager || targetTC || { position: targetPoint });
      });
      
    } else {
      // Standard target selection (direct Town Center siege or Feudal rush)
      const isFeudalRush = (this.gameManager.players[this.playerId].age === 'feudal' && this.waveCount <= 2 && (difficulty === 'hard' || difficulty === 'hardest' || difficulty === 'extreme'));
      
      let finalTarget = targetTC || { position: targetPoint };
      if (isFeudalRush) {
        const playerVillager = em.units.find(u => u.playerId === targetPlayerId && u.type === 'villager' && u.state !== 'DEAD');
        if (playerVillager) finalTarget = playerVillager;
      }
      
      army.forEach(soldier => {
        soldier.commandAttack(finalTarget);
      });
    }

    // Play raid alert sound
    this.gameManager.soundManager.playClickSound('hit');
  }

  findDockBuildSpot() {
    for (let radius = 10; radius < 60; radius += 3) {
      for (let angle = 0; angle < Math.PI * 2; angle += 0.4) {
        const x = Math.round(this.baseX + Math.cos(angle) * radius);
        const z = Math.round(this.baseZ + Math.sin(angle) * radius);
        if (this.gameManager.checkBuildPosition(x, z, 'dock')) {
          return { x, z };
        }
      }
    }
    return null;
  }
}
