import * as THREE from 'three';

export class AllyAI {
  constructor(gameManager) {
    this.gameManager = gameManager;
    
    // Find starting assets spawned by GameManager
    const tc = this.gameManager.entityManager.buildings.find(b => b.playerId === 2 && b.type === 'townCenter');
    this.baseX = tc ? tc.position.x : -48;
    this.baseZ = tc ? tc.position.z : 48;
    
    this.allyBaseTC = tc;
    this.allyBaseBarracks = null;
    
    this.trainTimer = 0;
    this.trainInterval = 18.0; // Train a soldier every 18s
    
    this.chatTimer = 0;
    this.chatInterval = 45.0; // Send friendly banter every 45s
    
    this.initBase();
  }

  initBase() {
    const em = this.gameManager.entityManager;
    
    // Spawn a Barracks for Ally near their Town Center
    this.allyBaseBarracks = em.createBuilding('barracks', 2, this.baseX + 5, this.baseZ - 2, true);
    this.gameManager.gridAddBuilding(this.allyBaseBarracks);
    
    // Create starting patrols
    em.createUnit('swordsman', 2, this.baseX + 2, this.baseZ - 4);
    em.createUnit('swordsman', 2, this.baseX - 2, this.baseZ - 3);
  }

  update(deltaTime) {
    if (!this.allyBaseTC || this.allyBaseTC.hp <= 0) return;

    // Advance Age alongside player
    const playerAge = this.gameManager.players[0].age;
    const allyAge = this.gameManager.players[2].age;
    if (playerAge !== allyAge) {
      this.gameManager.players[2].age = playerAge;
      // Trigger age upgrade logic for ally
      this.gameManager.upgradePlayerAge(2);
    }

    // Coordinated AI Economy loop every 3 seconds
    if (this.economyTimer === undefined) this.economyTimer = 0;
    this.economyTimer += deltaTime;
    if (this.economyTimer >= 3.0) {
      this.economyTimer = 0;
      this.manageEconomy();
    }

    // Garrison Defense check for villagers under attack (moderate/hard/hardest/extreme difficulties)
    const difficulty = this.gameManager.aiDifficulty || 'normal';
    if (difficulty !== 'easy' && difficulty !== 'normal' && this.allyBaseTC) {
      if (this.underAttackTimer === undefined) this.underAttackTimer = 0;
      
      const enemiesNearBase = this.gameManager.entityManager.units.some(u => 
        u.hp > 0 && u.state !== 'DEAD' && this.gameManager.isEnemy(2, u.playerId) && 
        u.position.distanceTo(this.allyBaseTC.position) < 18.0
      );
      
      if (enemiesNearBase) {
        this.underAttackTimer = 10.0;
        const villagers = this.gameManager.entityManager.units.filter(u => 
          u.playerId === 2 && u.type === 'villager' && u.state !== 'DEAD' && u.state !== 'GARRISONED' &&
          u.position.distanceTo(this.allyBaseTC.position) < 20.0
        );
        villagers.forEach(v => {
          v.commandGarrison(this.allyBaseTC);
        });
      } else {
        if (this.underAttackTimer > 0) {
          this.underAttackTimer -= deltaTime;
          if (this.underAttackTimer <= 0) {
            this.allyBaseTC.ungarrisonAll();
          }
        }
      }
    }

    // 2. Periodic chat banter
    this.chatTimer += deltaTime;
    if (this.chatTimer >= this.chatInterval) {
      this.chatTimer = 0;
      this.sendBanter();
    }
  }

  manageEconomy() {
    const em = this.gameManager.entityManager;
    const allyState = this.gameManager.players[2];
    const difficulty = this.gameManager.aiDifficulty || 'normal';
    const resources = allyState.resources;

    // Extreme/Insane difficulty cheat: resources never dry up
    if (difficulty === 'extreme') {
      if (resources.wood < 300) resources.wood = 1000;
      if (resources.food < 300) resources.food = 1000;
      if (resources.gold < 300) resources.gold = 1000;
      if (resources.stone < 300) resources.stone = 1000;
    }

    const villagers = em.units.filter(u => u.playerId === 2 && u.type === 'villager' && u.state !== 'DEAD');
    const villagerCount = villagers.length;
    const pop = allyState.population;
    const limit = allyState.populationLimit;
    const maxCap = this.gameManager.maxPopulationCap;

    // A0. Dock and Navy Builder on water maps (moderate/hard/hardest/extreme)
    const isWaterMap = ['river', 'islands', 'coastal'].includes(this.gameManager.terrain.mapType);
    if (isWaterMap && difficulty !== 'easy' && difficulty !== 'normal') {
      const hasDock = em.buildings.some(b => b.playerId === 2 && b.type === 'dock' && b.hp > 0);
      if (!hasDock && resources.wood >= 150) {
        const builder = villagers.find(v => v.state === 'IDLE' || v.state === 'HARVESTING');
        if (builder) {
          const spot = this.findDockBuildSpot();
          if (spot) {
            resources.wood -= 150;
            const dk = em.createBuilding('dock', 2, spot.x, spot.z, false);
            this.gameManager.gridAddBuilding(dk);
            builder.commandBuild(dk);
          }
        }
      }
      
      // Train fishing ships and warships at the dock
      const dock = em.buildings.find(b => b.playerId === 2 && b.type === 'dock' && b.isCompleted);
      if (dock && dock.queue.length < 2) {
        const fishingShipsCount = em.units.filter(u => u.playerId === 2 && u.type === 'fishingShip' && u.state !== 'DEAD').length;
        let shipToTrain = null;
        if (fishingShipsCount < 3 && resources.wood >= 75) {
          shipToTrain = 'fishingShip';
        } else if (resources.wood >= 90 && resources.gold >= 30) {
          const rand = Math.random();
          if (allyState.age === 'imperial' && rand < 0.25) {
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
          if (this.gameManager.hasResources(2, cost) && pop < limit) {
            dock.queueUnit(shipToTrain);
          }
        }
      }
    }

    // A. Rebuild Barracks if destroyed
    const hasBarracks = em.buildings.some(b => b.playerId === 2 && b.type === 'barracks' && b.hp > 0);
    if (!hasBarracks && resources.wood >= 120 && resources.stone >= 50) {
      const builder = villagers.find(v => v.state === 'IDLE' || v.state === 'HARVESTING');
      if (builder) {
        const spot = this.findClearBuildSpot(this.baseX, this.baseZ, 'barracks');
        if (spot) {
          resources.wood -= 120;
          resources.stone -= 50;
          const b = em.createBuilding('barracks', 2, spot.x, spot.z, false);
          this.gameManager.gridAddBuilding(b);
          builder.commandBuild(b);
          this.allyBaseBarracks = b;
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
          const nearestDropoff = this.gameManager.findNearestDropoff(v.targetEntity.position, 2, resGroup);
          const dist = nearestDropoff ? v.targetEntity.position.distanceTo(nearestDropoff.position) : Infinity;
          
          if (dist > 16) {
            const camps = em.buildings.filter(b => b.playerId === 2 && b.type === campType);
            const hasCampNearby = camps.some(c => c.position.distanceTo(v.targetEntity.position) < 12);
            
            if (!hasCampNearby) {
              const spot = this.findClearBuildSpot(v.targetEntity.position.x, v.targetEntity.position.z, campType);
              if (spot) {
                resources.wood -= 100;
                const camp = em.createBuilding(campType, 2, spot.x, spot.z, false);
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
          const h = em.createBuilding('house', 2, spot.x, spot.z, false);
          this.gameManager.gridAddBuilding(h);
          builder.commandBuild(h);
          this.gameManager.addPopulationLimit(2, 5);
        }
      }
    }

    // C2. Build Watchtower for Defense
    const towerCount = em.buildings.filter(b => b.playerId === 2 && b.type === 'watchTower').length;
    if (towerCount < 3 && allyState.age !== 'dark' && resources.wood >= 150 && resources.stone >= 150) {
      const builder = villagers.find(v => v.state === 'IDLE' || v.state === 'HARVESTING');
      if (builder) {
        const rx = this.baseX + (Math.random() - 0.5) * 16;
        const rz = this.baseZ + (Math.random() - 0.5) * 16;
        const spot = this.findClearBuildSpot(rx, rz, 'watchTower');
        if (spot) {
          resources.wood -= 100;
          resources.stone -= 125;
          const wt = em.createBuilding('watchTower', 2, spot.x, spot.z, false);
          this.gameManager.gridAddBuilding(wt);
          builder.commandBuild(wt);
        }
      }
    }

    // D2. Build Blacksmith
    const hasBlacksmith = em.buildings.some(b => b.playerId === 2 && b.type === 'blacksmith' && b.hp > 0);
    if (!hasBlacksmith && allyState.age !== 'dark' && resources.wood >= 150) {
      const builder = villagers.find(v => v.state === 'IDLE' || v.state === 'HARVESTING');
      if (builder) {
        const spot = this.findClearBuildSpot(this.baseX, this.baseZ, 'blacksmith');
        if (spot) {
          resources.wood -= 150;
          const bs = em.createBuilding('blacksmith', 2, spot.x, spot.z, false);
          this.gameManager.gridAddBuilding(bs);
          builder.commandBuild(bs);
        }
      }
    }

    // D2a. Build Stable
    const hasStable = em.buildings.some(b => b.playerId === 2 && b.type === 'stable' && b.hp > 0);
    if (!hasStable && allyState.age !== 'dark' && resources.wood >= 175) {
      const builder = villagers.find(v => v.state === 'IDLE' || v.state === 'HARVESTING');
      if (builder) {
        const spot = this.findClearBuildSpot(this.baseX, this.baseZ, 'stable');
        if (spot) {
          resources.wood -= 175;
          const b = em.createBuilding('stable', 2, spot.x, spot.z, false);
          this.gameManager.gridAddBuilding(b);
          builder.commandBuild(b);
        }
      }
    }

    // D2b. Build Archery Range
    const hasArcheryRange = em.buildings.some(b => b.playerId === 2 && b.type === 'archeryRange' && b.hp > 0);
    if (!hasArcheryRange && allyState.age !== 'dark' && resources.wood >= 175) {
      const builder = villagers.find(v => v.state === 'IDLE' || v.state === 'HARVESTING');
      if (builder) {
        const spot = this.findClearBuildSpot(this.baseX, this.baseZ, 'archeryRange');
        if (spot) {
          resources.wood -= 175;
          const b = em.createBuilding('archeryRange', 2, spot.x, spot.z, false);
          this.gameManager.gridAddBuilding(b);
          builder.commandBuild(b);
        }
      }
    }

    // D3. Build University
    const hasUniversity = em.buildings.some(b => b.playerId === 2 && b.type === 'university' && b.hp > 0);
    if (!hasUniversity && allyState.age !== 'dark' && resources.wood >= 200 && resources.gold >= 100) {
      const builder = villagers.find(v => v.state === 'IDLE' || v.state === 'HARVESTING');
      if (builder) {
        const spot = this.findClearBuildSpot(this.baseX, this.baseZ, 'university');
        if (spot) {
          resources.wood -= 200;
          resources.gold -= 100;
          const univ = em.createBuilding('university', 2, spot.x, spot.z, false);
          this.gameManager.gridAddBuilding(univ);
          builder.commandBuild(univ);
        }
      }
    }

    // D3a. Build Monastery
    const hasMonastery = em.buildings.some(b => b.playerId === 2 && b.type === 'monastery' && b.hp > 0);
    if (!hasMonastery && (allyState.age === 'castle' || allyState.age === 'imperial') && resources.wood >= 175) {
      const builder = villagers.find(v => v.state === 'IDLE' || v.state === 'HARVESTING');
      if (builder) {
        const spot = this.findClearBuildSpot(this.baseX, this.baseZ, 'monastery');
        if (spot) {
          resources.wood -= 175;
          const b = em.createBuilding('monastery', 2, spot.x, spot.z, false);
          this.gameManager.gridAddBuilding(b);
          builder.commandBuild(b);
        }
      }
    }

    // D3b. Build Bombard Tower for Defense in Imperial Age
    const bombardTowerCount = em.buildings.filter(b => b.playerId === 2 && b.type === 'bombardTower').length;
    if (bombardTowerCount < 2 && allyState.age === 'imperial' && resources.stone >= 250 && resources.gold >= 100) {
      const builder = villagers.find(v => v.state === 'IDLE' || v.state === 'HARVESTING');
      if (builder) {
        const rx = this.baseX + (Math.random() - 0.5) * 20;
        const rz = this.baseZ + (Math.random() - 0.5) * 20;
        const spot = this.findClearBuildSpot(rx, rz, 'bombardTower');
        if (spot) {
          resources.stone -= 250;
          resources.gold -= 100;
          const bt = em.createBuilding('bombardTower', 2, spot.x, spot.z, false);
          this.gameManager.gridAddBuilding(bt);
          builder.commandBuild(bt);
        }
      }
    }

    // D4. Build Siege Workshop
    const hasWorkshop = em.buildings.some(b => b.playerId === 2 && b.type === 'siegeWorkshop' && b.hp > 0);
    if (!hasWorkshop && allyState.age !== 'dark' && resources.wood >= 200 && resources.gold >= 100) {
      const builder = villagers.find(v => v.state === 'IDLE' || v.state === 'HARVESTING');
      if (builder) {
        const spot = this.findClearBuildSpot(this.baseX, this.baseZ, 'siegeWorkshop');
        if (spot) {
          resources.wood -= 200;
          resources.gold -= 100;
          const ws = em.createBuilding('siegeWorkshop', 2, spot.x, spot.z, false);
          this.gameManager.gridAddBuilding(ws);
          builder.commandBuild(ws);
        }
      }
    }

    // D5. Build Castle
    const hasCastle = em.buildings.some(b => b.playerId === 2 && b.type === 'castle' && b.hp > 0);
    if (!hasCastle && (allyState.age === 'castle' || allyState.age === 'imperial') && resources.wood >= 200 && resources.stone >= 650) {
      const builder = villagers.find(v => v.state === 'IDLE' || v.state === 'HARVESTING');
      if (builder) {
        const spot = this.findClearBuildSpot(this.baseX, this.baseZ, 'castle');
        if (spot) {
          resources.wood -= 200;
          resources.stone -= 650;
          const castle = em.createBuilding('castle', 2, spot.x, spot.z, false);
          this.gameManager.gridAddBuilding(castle);
          builder.commandBuild(castle);
        }
      }
    }

    // D6. AI Research Upgrades
    const myBuildings = em.buildings.filter(b => b.playerId === 2 && b.isCompleted);
    myBuildings.forEach(b => {
      if (b.queue.length > 0) return; // Busy
      
      if (b.type === 'blacksmith') {
        const attackLvl = allyState.upgrades.attack || 0;
        const armorLvl = allyState.upgrades.armor || 0;
        const arrowLvl = allyState.upgrades.arrow || 0;
        
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
          if (this.gameManager.hasResources(2, cost)) {
            b.queueUpgrade(typeToUpgrade);
          }
        }
      }
      else if (b.type === 'university') {
        const palisadeLvl = allyState.upgrades.palisadeWallUpgrade || 0;
        const stoneLvl = allyState.upgrades.stoneWallUpgrade || 0;
        const towerLvl = allyState.upgrades.watchTowerUpgrade || 0;
        
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
          if (this.gameManager.hasResources(2, cost)) {
            b.queueUpgrade(typeToUpgrade);
          }
        }
      }
      else if (b.type === 'siegeWorkshop') {
        const ramLvl = allyState.upgrades.batteringRamUpgrade || 0;
        const mangonelLvl = allyState.upgrades.mangonelUpgrade || 0;
        const scorpionLvl = allyState.upgrades.scorpionUpgrade || 0;
        const cannonLvl = allyState.upgrades.bombardCannonUpgrade || 0;
        
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
        } else if (cannonLvl < 1 && allyState.age === 'imperial') {
          typeToUpgrade = 'bombardCannonUpgrade';
          currentLvl = cannonLvl;
        }
        
        if (typeToUpgrade) {
          const cost = this.gameManager.getUpgradeCost(typeToUpgrade, currentLvl);
          if (this.gameManager.hasResources(2, cost)) {
            b.queueUpgrade(typeToUpgrade);
          }
        }
      }
      else if (b.type === 'barracks') {
        const sUpgrade = allyState.upgrades.swordsmanUpgrade || 0;
        const spUpgrade = allyState.upgrades.spearmanUpgrade || 0;
        
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
          if (this.gameManager.hasResources(2, cost)) {
            b.queueUpgrade(typeToUpgrade);
          }
        }
      }
      else if (b.type === 'stable') {
        const scUpgrade = allyState.upgrades.scoutUpgrade || 0;
        const kUpgrade = allyState.upgrades.knightUpgrade || 0;
        const cUpgrade = allyState.upgrades.camelUpgrade || 0;
        
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
          if (this.gameManager.hasResources(2, cost)) {
            b.queueUpgrade(typeToUpgrade);
          }
        }
      }
      else if (b.type === 'archeryRange') {
        const aUpgrade = allyState.upgrades.archerUpgrade || 0;
        const skUpgrade = allyState.upgrades.skirmisherUpgrade || 0;
        const caUpgrade = allyState.upgrades.cavalryArcherUpgrade || 0;
        
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
          if (this.gameManager.hasResources(2, cost)) {
            b.queueUpgrade(typeToUpgrade);
          }
        }
      }
      else if (b.type === 'monastery') {
        const sanctity = allyState.upgrades.sanctity || 0;
        const fervor = allyState.upgrades.fervor || 0;
        const blockPrinting = allyState.upgrades.blockPrinting || 0;
        
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
          if (this.gameManager.hasResources(2, cost)) {
            b.queueUpgrade(typeToUpgrade);
          }
        }
      }
    });

    // D7. Train Siege Units at Siege Workshop
    const workshop = em.buildings.find(b => b.playerId === 2 && b.type === 'siegeWorkshop' && b.isCompleted);
    if (workshop && workshop.queue.length < 2) {
      let unitToTrain = null;
      const rand = Math.random();
      if (allyState.age === 'imperial' && rand < 0.25) {
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
      if (this.gameManager.hasResources(2, cost) && pop < limit) {
        workshop.queueUnit(unitToTrain);
      }
    }

    // D8. Train Trebuchet / Petard at Castle
    const cstl = em.buildings.find(b => b.playerId === 2 && b.type === 'castle' && b.isCompleted);
    if (cstl && cstl.queue.length < 2) {
      const unitToTrain = Math.random() < 0.5 ? 'trebuchet' : 'petard';
      const cost = this.gameManager.getUnitCost(unitToTrain);
      if (this.gameManager.hasResources(2, cost) && pop < limit) {
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

    if (villagerCount < maxVillagers && this.allyBaseTC && this.allyBaseTC.queue.length === 0) {
      const cost = this.gameManager.getUnitCost('villager');
      if (this.gameManager.hasResources(2, cost) && pop < limit) {
        this.allyBaseTC.queueUnit('villager');
      }
    }

    // E1. Train Soldiers at Barracks (Infantry)
    const barracks = em.buildings.find(b => b.playerId === 2 && b.type === 'barracks' && b.isCompleted);
    if (barracks && barracks.queue.length < 2) {
      const allyAge = allyState.age;
      let unitToTrain = 'swordsman';
      if (allyAge !== 'dark') {
        const rand = Math.random();
        if (allyAge === 'feudal') {
          unitToTrain = rand < 0.5 ? 'spearman' : 'swordsman';
        } else {
          if (rand < 0.35) unitToTrain = 'spearman';
          else if (rand < 0.7) unitToTrain = 'swordsman';
          else unitToTrain = 'footKnight';
        }
      }
      const cost = this.gameManager.getUnitCost(unitToTrain);
      if (this.gameManager.hasResources(2, cost) && pop < limit) {
        barracks.queueUnit(unitToTrain);
      }
    }

    // E2. Train Soldiers at Stable (Cavalry)
    const stable = em.buildings.find(b => b.playerId === 2 && b.type === 'stable' && b.isCompleted);
    if (stable && stable.queue.length < 2) {
      const allyAge = allyState.age;
      let unitToTrain = 'scoutCavalry';
      if (allyAge === 'castle' || allyAge === 'imperial') {
        const rand = Math.random();
        if (rand < 0.4) unitToTrain = 'knight';
        else if (rand < 0.7) unitToTrain = 'camelRider';
        else unitToTrain = 'scoutCavalry';
      }
      const cost = this.gameManager.getUnitCost(unitToTrain);
      if (this.gameManager.hasResources(2, cost) && pop < limit) {
        stable.queueUnit(unitToTrain);
      }
    }

    // E3. Train Soldiers at Archery Range (Archers)
    const archeryRange = em.buildings.find(b => b.playerId === 2 && b.type === 'archeryRange' && b.isCompleted);
    if (archeryRange && archeryRange.queue.length < 2) {
      const allyAge = allyState.age;
      let unitToTrain = 'archer';
      if (allyAge === 'castle' || allyAge === 'imperial') {
        const rand = Math.random();
        if (rand < 0.4) unitToTrain = 'archer';
        else if (rand < 0.7) unitToTrain = 'skirmisher';
        else unitToTrain = 'cavalryArcher';
      } else if (allyAge === 'feudal') {
        unitToTrain = Math.random() < 0.5 ? 'archer' : 'skirmisher';
      }
      const cost = this.gameManager.getUnitCost(unitToTrain);
      if (this.gameManager.hasResources(2, cost) && pop < limit) {
        archeryRange.queueUnit(unitToTrain);
      }
    }

    // E4. Train Monks at Monastery
    const monastery = em.buildings.find(b => b.playerId === 2 && b.type === 'monastery' && b.isCompleted);
    if (monastery && monastery.queue.length < 1) {
      const monkCount = em.units.filter(u => u.playerId === 2 && u.type === 'monk' && u.state !== 'DEAD').length;
      if (monkCount < 2) {
        const cost = this.gameManager.getUnitCost('monk');
        if (this.gameManager.hasResources(2, cost) && pop < limit) {
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

  sendBanter() {
    const quotes = [
      "Lagi fokus ngumpulin kayu nih gan. Kabarin kalo butuh bantuan!",
      "Faksi merah di pojok kanan atas kayanya lagi numpuk pasukan tuh. Waspada!",
      "Zaman kita makin mantap cuy. Terusin kumpul resource!",
      "Dagang sama Nomad (Grey) lumayan untung nih, gold aman."
    ];
    const randQuote = quotes[Math.floor(Math.random() * quotes.length)];
    if (this.gameManager.hud) {
      this.gameManager.hud.addChatMessage("GajahMada_35", randQuote, 'ally');
    }
  }

  // -------------------------------------------------------------
  // COMMAND HANDLERS (TRIGGERS FROM PLAYER CHAT)
  // -------------------------------------------------------------
  handlePlayerCommand(commandText) {
    const text = commandText.toLowerCase().trim();
    
    if (text.includes('serang') || text.includes('attack')) {
      this.commandAttackEnemy();
    } 
    else if (text.includes('bantu') || text.includes('help') || text.includes('tolo')) {
      this.commandDefendPlayer();
    }
    else if (text.includes('butuh kayu') || text.includes('minta kayu') || text.includes('wood')) {
      this.donateResource('wood');
    }
    else if (text.includes('butuh makanan') || text.includes('minta makanan') || text.includes('minta food') || text.includes('food')) {
      this.donateResource('food');
    }
    else if (text.includes('butuh emas') || text.includes('minta emas') || text.includes('gold')) {
      this.donateResource('gold');
    }
  }

  commandAttackEnemy() {
    const em = this.gameManager.entityManager;
    const militaryTypes = [
      'swordsman', 'archer', 'knight', 'footKnight', 'heavyCavalry', 'horseArcher',
      'batteringRam', 'mangonel', 'scorpion', 'bombardCannon', 'siegeTower', 'trebuchet', 'petard',
      'spearman', 'skirmisher', 'scoutCavalry', 'camelRider', 'cavalryArcher', 'monk'
    ];
    const allySoldiers = em.units.filter(u => u.playerId === 2 && militaryTypes.includes(u.type));
    
    if (allySoldiers.length === 0) {
      this.gameManager.hud.addChatMessage("GajahMada_35", "Aduh cuy, pasukan gw lagi abis nih. Tunggu gw latih bentar!", 'ally');
      return;
    }

    this.gameManager.hud.addChatMessage("GajahMada_35", `Siap cuy! Gw kumpulin ${allySoldiers.length} prajurit langsung serbu faksi merah sekarang!`, 'ally');
    
    // Target Enemy Town Center
    const enemyTC = em.buildings.find(b => b.playerId === 1 && b.type === 'townCenter');
    const targetPoint = enemyTC ? enemyTC.position : new THREE.Vector3(48, 0, 48);

    allySoldiers.forEach(soldier => {
      soldier.commandAttack({
        position: targetPoint,
        hp: 1,
        takeDamage: (amount) => {
          if (enemyTC) enemyTC.takeDamage(amount);
        }
      });
      soldier.state = 'CHASING';
      if (enemyTC) soldier.targetEntity = enemyTC;
    });
  }

  commandDefendPlayer() {
    const em = this.gameManager.entityManager;
    const militaryTypes = [
      'swordsman', 'archer', 'knight', 'footKnight', 'heavyCavalry', 'horseArcher',
      'batteringRam', 'mangonel', 'scorpion', 'bombardCannon', 'siegeTower', 'trebuchet', 'petard',
      'spearman', 'skirmisher', 'scoutCavalry', 'camelRider', 'cavalryArcher', 'monk'
    ];
    const allySoldiers = em.units.filter(u => u.playerId === 2 && militaryTypes.includes(u.type));
    
    if (allySoldiers.length === 0) {
      this.gameManager.hud.addChatMessage("GajahMada_35", "Belum ada prajurit ready gan. Wait ya!", 'ally');
      return;
    }

    const count = Math.min(3, allySoldiers.length);
    this.gameManager.hud.addChatMessage("GajahMada_35", `Pasukan bantuan (${count} prajurit) meluncur ke base lu gan! Jagain TC lu.`, 'ally');
    
    const playerTC = em.buildings.find(b => b.playerId === 0 && b.type === 'townCenter');
    const targetPos = playerTC ? playerTC.position : new THREE.Vector3(-48, 0, -48);

    for (let i = 0; i < count; i++) {
      const offset = (Math.random() - 0.5) * 4;
      allySoldiers[i].commandMove(new THREE.Vector3(targetPos.x + offset, 0, targetPos.z + offset));
    }
  }

  donateResource(type) {
    const allyRes = this.gameManager.players[2].resources;
    
    if (allyRes[type] < 120) {
      this.gameManager.hud.addChatMessage("GajahMada_35", `Sorry cuy, stok ${type} gw juga lagi tiris nih!`, 'ally');
      return;
    }

    // Deduct from ally, add to player
    allyRes[type] -= 100;
    this.gameManager.players[0].resources[type] += 100;
    
    this.gameManager.hud.updateResourcesUI();
    this.gameManager.hud.addChatMessage("GajahMada_35", `Nih gw kirim 100 ${type.toUpperCase()}! Semoga berkah rajanya.`, 'ally');
    this.gameManager.hud.showResourceFloatingText(new THREE.Vector3(-48, 4, -48), `+100 ${type.toUpperCase()}`, type);
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
