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
    const villagers = em.units.filter(u => u.playerId === 2 && u.type === 'villager' && u.state !== 'DEAD');
    const villagerCount = villagers.length;
    const resources = allyState.resources;
    const pop = allyState.population;
    const limit = allyState.populationLimit;
    const maxCap = this.gameManager.maxPopulationCap;

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

    // D. Train Villagers at Town Center
    const maxVillagers = 12; // Ally standard
    if (villagerCount < maxVillagers && this.allyBaseTC && this.allyBaseTC.queue.length === 0) {
      const cost = this.gameManager.getUnitCost('villager');
      if (this.gameManager.hasResources(2, cost) && pop < limit) {
        this.allyBaseTC.queueUnit('villager');
      }
    }

    // E. Train Soldiers at Barracks using Ally gathered resources
    const barracks = em.buildings.find(b => b.playerId === 2 && b.type === 'barracks' && b.isCompleted);
    if (barracks && barracks.queue.length < 3) {
      const allyAge = allyState.age;
      let unitToTrain = 'swordsman';
      
      if (allyAge === 'feudal') {
        unitToTrain = Math.random() < 0.4 ? 'archer' : 'swordsman';
      } else if (allyAge === 'castle' || allyAge === 'imperial') {
        const rand = Math.random();
        if (rand < 0.25) unitToTrain = 'archer';
        else if (rand < 0.55) unitToTrain = 'knight';
        else if (rand < 0.75) unitToTrain = 'footKnight';
        else if (rand < 0.90) unitToTrain = 'horseArcher';
        else unitToTrain = 'swordsman';
      }
      
      const cost = this.gameManager.getUnitCost(unitToTrain);
      if (this.gameManager.hasResources(2, cost) && pop < limit) {
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
    const allySoldiers = em.units.filter(u => u.playerId === 2 && ['swordsman', 'archer', 'knight', 'footKnight', 'heavyCavalry', 'horseArcher'].includes(u.type));
    
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
    const allySoldiers = em.units.filter(u => u.playerId === 2 && ['swordsman', 'archer', 'knight', 'footKnight', 'heavyCavalry', 'horseArcher'].includes(u.type));
    
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
}
