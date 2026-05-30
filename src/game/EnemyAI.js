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
    this.waveInterval = 30.0; // Attack every 30 seconds
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
    
    // 1. Coordinated Age Progression (Feudal at 60s, Castle at 150s, Imperial at 260s)
    this.ageTimer += deltaTime;
    const enemyState = this.gameManager.players[1];
    
    if (enemyState.age === 'dark' && this.ageTimer >= 60.0) {
      enemyState.age = 'feudal';
      this.gameManager.upgradePlayerAge(1);
      this.gameManager.hud.addChatMessage("Lord_Kahn_Enemy", "Faksi merah telah naik ke Zaman Feodal! Bersiaplah!", 'enemy');
    } 
    else if (enemyState.age === 'feudal' && this.ageTimer >= 150.0) {
      enemyState.age = 'castle';
      this.gameManager.upgradePlayerAge(1);
      this.gameManager.hud.addChatMessage("Lord_Kahn_Enemy", "Faksi merah telah naik ke Zaman Kastil! Baju zirah baja diaktifkan.", 'enemy');
    } 
    else if (enemyState.age === 'castle' && this.ageTimer >= 260.0) {
      enemyState.age = 'imperial';
      this.gameManager.upgradePlayerAge(1);
      this.gameManager.hud.addChatMessage("Lord_Kahn_Enemy", "Faksi merah telah mencapai Zaman Imperial! Senjata emas kami akan membumihanguskan kalian!", 'enemy');
    }

    // 2. Spawn Raid Waves
    this.waveTimer += deltaTime;
    if (this.waveTimer >= this.waveInterval) {
      this.waveTimer = 0;
      this.spawnAttackWave();
    }
  }

  spawnAttackWave() {
    this.waveCount++;
    const em = this.gameManager.entityManager;
    
    // Wave size scales over time
    const count = Math.min(8, 1 + Math.floor(this.waveCount * 1.2));
    
    // Target Selection: alternate targets between Player (Blue) and Ally (Green) base to coordinate multi-threat attacks
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

    const spawnX = this.enemyBaseBarracks.position.x;
    const spawnZ = this.enemyBaseBarracks.position.z - 2;
    const enemyAge = this.gameManager.players[1].age;

    for (let i = 0; i < count; i++) {
      const offsetX = (Math.random() - 0.5) * 3;
      const offsetZ = (Math.random() - 0.5) * 3;
      
      const soldier = em.createUnit('swordsman', 1, spawnX + offsetX, spawnZ + offsetZ);
      this.gameManager.players[1].population++;

      // Set age property on spawned units so they receive matching visual geometry
      soldier.initMesh(); // Rebuild mesh with appropriate materials
      
      // Order raid wave to attack base
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
    }

    // Play raid alert sound
    this.gameManager.soundManager.playClickSound('hit');
  }
}
