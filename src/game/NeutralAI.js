import * as THREE from 'three';

export class NeutralAI {
  constructor(gameManager) {
    this.gameManager = gameManager;
    
    // Find starting assets spawned by GameManager
    const tc = this.gameManager.entityManager.buildings.find(b => b.playerId === 3 && b.type === 'townCenter');
    this.baseX = tc ? tc.position.x : 48;
    this.baseZ = tc ? tc.position.z : -48;
    
    this.neutralBaseTC = tc;
    this.hostile = false; // Peaceful by default
    
    this.patrolTimer = 0;
    this.initBase();
  }

  initBase() {
    const em = this.gameManager.entityManager;
    
    // Spawn small decorations (like standard walls or crates representing trade marketplace)
    // Neutral has standard townCenter which we'll call "Marketplace Tower"
    if (this.neutralBaseTC) {
      this.neutralBaseTC.mesh.name = "Marketplace Tower";
    }
    
    // Patrol starting villagers around base
    const villagers = em.units.filter(u => u.playerId === 3);
    villagers.forEach((v, index) => {
      const angle = (index * Math.PI) / 2;
      v.commandMove(new THREE.Vector3(this.baseX + Math.cos(angle) * 3, 0, this.baseZ + Math.sin(angle) * 3));
    });
  }

  update(deltaTime) {
    if (!this.neutralBaseTC || this.neutralBaseTC.hp <= 0) return;

    // Check if neutral has been attacked (its TC or units HP dropped below max)
    if (!this.hostile) {
      const attackedUnit = this.gameManager.entityManager.units.some(u => u.playerId === 3 && u.hp < u.maxHp);
      const attackedBuilding = this.gameManager.entityManager.buildings.some(b => b.playerId === 3 && b.hp < b.maxHp);
      
      if (attackedUnit || attackedBuilding) {
        this.turnHostile();
      }
    }

    // Passive patrol updates
    this.patrolTimer += deltaTime;
    if (this.patrolTimer >= 15.0) {
      this.patrolTimer = 0;
      this.patrolVillagers();
    }
  }

  patrolVillagers() {
    const em = this.gameManager.entityManager;
    const villagers = em.units.filter(u => u.playerId === 3);
    
    villagers.forEach(v => {
      // If idle, send to a random spot near the outpost
      if (v.state === 'IDLE') {
        const offset = (Math.random() - 0.5) * 8;
        const targetPos = new THREE.Vector3(this.baseX + offset, 0, this.baseZ + offset);
        if (this.hostile) {
          // If hostile, target players instead
          const playerTC = this.gameManager.findNearestDropoff(v.position, 0);
          if (playerTC) v.commandAttack(playerTC);
        } else {
          v.commandMove(targetPos);
        }
      }
    });
  }

  turnHostile() {
    this.hostile = true;
    if (this.gameManager.hud) {
      this.gameManager.hud.addChatMessage("Nomad_Grey", "Kalian telah melanggar wilayah kami! Bersiaplah menghadapi pembalasan!", 'neutral');
      this.gameManager.hud.showNotification("⚠️ Warning: Faksi Netral (Grey) sekarang memusuhi Anda!");
    }
    
    // Command their villagers to attack player units
    const em = this.gameManager.entityManager;
    const villagers = em.units.filter(u => u.playerId === 3);
    const playerTC = em.buildings.find(b => b.playerId === 0 && b.type === 'townCenter');
    
    villagers.forEach(v => {
      if (playerTC) v.commandAttack(playerTC);
    });
  }

  // -------------------------------------------------------------
  // RESOURCE TRADING (TRIGGERS FROM PLAYER CHAT)
  // -------------------------------------------------------------
  handlePlayerTrade(commandText) {
    if (this.hostile) {
      this.gameManager.hud.addChatMessage("Nomad_Grey", "Kami tidak melayani transaksi dengan musuh!", 'neutral');
      return;
    }

    const text = commandText.toLowerCase().trim();
    const playerResources = this.gameManager.players[0].resources;
    
    // Trade formulas: spend 50 Gold, get 100 Wood/Food/Stone
    let tradeSuccess = false;
    let resourceGained = '';
    
    if (text.includes('beli kayu') || text.includes('buy wood')) {
      if (playerResources.gold >= 50) {
        playerResources.gold -= 50;
        playerResources.wood += 100;
        tradeSuccess = true;
        resourceGained = 'wood';
      }
    } 
    else if (text.includes('beli makanan') || text.includes('beli food') || text.includes('buy food')) {
      if (playerResources.gold >= 50) {
        playerResources.gold -= 50;
        playerResources.food += 100;
        tradeSuccess = true;
        resourceGained = 'food';
      }
    } 
    else if (text.includes('beli batu') || text.includes('beli stone') || text.includes('buy stone')) {
      if (playerResources.gold >= 50) {
        playerResources.gold -= 50;
        playerResources.stone += 100;
        tradeSuccess = true;
        resourceGained = 'stone';
      }
    }

    if (tradeSuccess) {
      this.gameManager.hud.updateResourcesUI();
      this.gameManager.hud.addChatMessage("Nomad_Grey", `Transaksi Berhasil! 50 Gold ditukar dengan 100 ${resourceGained.toUpperCase()}.`, 'neutral');
      this.gameManager.hud.showResourceFloatingText(new THREE.Vector3(this.baseX, 4, this.baseZ), `+100 ${resourceGained.toUpperCase()}`, resourceGained);
      this.gameManager.hud.showResourceFloatingText(new THREE.Vector3(-48, 4, -48), `-50 GOLD`, 'gold');
    } else if (text.includes('beli') || text.includes('buy') || text.includes('trade')) {
      this.gameManager.hud.addChatMessage("Nomad_Grey", "Gagal bertransaksi. Pastikan Anda memiliki minimal 50 Emas (Gold)!", 'neutral');
    }
  }
}
