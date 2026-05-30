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

    // 1. Train soldiers
    this.trainTimer += deltaTime;
    if (this.trainTimer >= this.trainInterval) {
      this.trainTimer = 0;
      this.trainSoldier();
    }

    // 2. Periodic chat banter
    this.chatTimer += deltaTime;
    if (this.chatTimer >= this.chatInterval) {
      this.chatTimer = 0;
      this.sendBanter();
    }
  }

  trainSoldier() {
    const em = this.gameManager.entityManager;
    // Check population limits
    const pop = this.gameManager.players[2].population;
    const limit = this.gameManager.players[2].populationLimit;
    
    if (pop >= limit) {
      // Spawn a house
      const h = em.createBuilding('house', 2, this.baseX + (Math.random() - 0.5) * 8, this.baseZ + (Math.random() - 0.5) * 8, true);
      this.gameManager.gridAddBuilding(h);
      this.gameManager.players[2].populationLimit += 5;
      return;
    }

    const spawnX = this.allyBaseBarracks.position.x;
    const spawnZ = this.allyBaseBarracks.position.z - 2;
    const soldier = em.createUnit('swordsman', 2, spawnX, spawnZ);
    this.gameManager.players[2].population++;
    
    // Patrol base area by default
    const offset = (Math.random() - 0.5) * 6;
    soldier.commandMove(new THREE.Vector3(this.baseX + offset, 0, this.baseZ + offset));
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
    const allySoldiers = em.units.filter(u => u.playerId === 2 && u.type === 'swordsman');
    
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
    const allySoldiers = em.units.filter(u => u.playerId === 2 && u.type === 'swordsman');
    
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
