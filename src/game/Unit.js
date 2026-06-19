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
    } else if (this.type === 'spearman') {
      this.hp = Math.round(45 * (civModifiers.hpInfantry || 1.0));
      this.maxHp = this.hp;
      this.speed = 3.0 * (civModifiers.speedInfantry || 1.0);
      this.attackPower = 3;
      this.attackCooldown = 1.0;
      this.attackRange = 1.0;
    } else if (this.type === 'skirmisher') {
      this.hp = Math.round(30 * (civModifiers.hpInfantry || 1.0));
      this.maxHp = this.hp;
      this.speed = 3.0 * (civModifiers.speedInfantry || 1.0);
      this.attackPower = 2;
      this.attackCooldown = 1.5;
      this.attackRange = 5.0;
    } else if (this.type === 'scoutCavalry') {
      this.hp = Math.round(45 * (civModifiers.hpCavalry || 1.0));
      this.maxHp = this.hp;
      this.speed = 4.8 * (civModifiers.speedCavalry || 1.0);
      this.attackPower = 3;
      this.attackCooldown = 1.0;
      this.attackRange = 1.0;
    } else if (this.type === 'camelRider') {
      this.hp = Math.round(100 * (civModifiers.hpCavalry || 1.0));
      this.maxHp = this.hp;
      this.speed = 4.6 * (civModifiers.speedCavalry || 1.0);
      this.attackPower = 6;
      this.attackCooldown = 1.0;
      this.attackRange = 1.0;
    } else if (this.type === 'cavalryArcher') {
      this.hp = Math.round(50 * (civModifiers.hpCavalry || 1.0));
      this.maxHp = this.hp;
      this.speed = 4.4 * (civModifiers.speedCavalry || 1.0);
      this.attackPower = 6;
      this.attackCooldown = 1.2;
      this.attackRange = 4.0;
    } else if (this.type === 'monk') {
      this.hp = 30;
      this.maxHp = 30;
      this.speed = 2.5;
      this.attackPower = 0;
      this.attackCooldown = 1.5;
      this.attackRange = 4.0; // healing / conversion range
      this.conversionCooldown = 0;
      this.scanTimer = 0;
    } else if (this.type === 'transportShip') {
      this.hp = 150;
      this.maxHp = 150;
      this.speed = 3.6;
      this.attackPower = 0;
      this.attackCooldown = 1.0;
      this.attackRange = 0.0;
      this.garrisonedUnits = [];
    } else if (this.type === 'galley') {
      this.hp = 120;
      this.maxHp = 120;
      this.speed = 3.2;
      this.attackPower = 6;
      this.attackCooldown = 1.5;
      this.attackRange = 5.0;
    } else if (this.type === 'fireShip') {
      this.hp = 100;
      this.maxHp = 100;
      this.speed = 3.3;
      this.attackPower = 2;
      this.attackCooldown = 0.25;
      this.attackRange = 2.0;
    } else if (this.type === 'demolitionShip') {
      this.hp = 50;
      this.maxHp = 50;
      this.speed = 3.8;
      this.attackPower = 0;
      this.attackCooldown = 1.0;
      this.attackRange = 1.0;
    } else if (this.type === 'cannonGalleon') {
      this.hp = 120;
      this.maxHp = 120;
      this.speed = 2.8;
      this.attackPower = 35;
      this.attackCooldown = 2.5;
      this.attackRange = 10.0;
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
    const isInf = ['swordsman', 'footKnight', 'spearman', 'skirmisher'].includes(this.type);
    const isCav = ['knight', 'heavyCavalry', 'horseArcher', 'scoutCavalry', 'camelRider', 'cavalryArcher'].includes(this.type);
    const isRanged = ['archer', 'horseArcher', 'skirmisher', 'cavalryArcher'].includes(this.type);

    if (isInf) {
      const hpMult = civModifiers.hpInfantry || 1.0;
      const speedMult = civModifiers.speedInfantry || 1.0;
      const dmgMult = civModifiers.damageInfantry || 1.0;
      
      this.maxHp = Math.round(this.maxHp * hpMult);
      this.hp = this.maxHp;
      this.speed = this.speed * speedMult;
      this.attackPower = Math.round(this.attackPower * dmgMult);
    } else if (isCav) {
      const hpMult = civModifiers.hpCavalry || 1.0;
      const speedMult = civModifiers.speedCavalry || 1.0;
      
      this.maxHp = Math.round(this.maxHp * hpMult);
      this.hp = this.maxHp;
      this.speed = this.speed * speedMult;
    }
    if (isRanged) {
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
    this._gatherType = 'axe'; // 'axe' | 'pickaxe' | 'sickle'
    
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
    
    const isInfantry = ['swordsman', 'footKnight', 'spearman', 'skirmisher', 'throwingAxeman', 'karambitWarrior', 'samurai', 'woadRaider', 'huskarl', 'teutonicKnight', 'jaguarWarrior', 'berserk', 'eagleWarrior'].includes(this.type);
    const isCavalry = ['knight', 'heavyCavalry', 'horseArcher', 'scoutCavalry', 'camelRider', 'cavalryArcher', 'cataphract', 'mangudai', 'conquistador', 'boyar', 'tarkan', 'warElephant', 'centurion', 'elephantArcher', 'battleElephant', 'steppeLancer', 'missionary'].includes(this.type);
    const isArcher = ['archer', 'horseArcher', 'skirmisher', 'cavalryArcher', 'longbowman', 'mangudai', 'chuKoNu', 'plumedArcher', 'elephantArcher'].includes(this.type);
    const isGunpowder = ['handCannoneer', 'janissary', 'conquistador'].includes(this.type);

    if (this.type === 'villager') {
      baseHp = 50;
      baseSpeed = 3.5;
      baseAttack = 2;
      baseRange = 1.0;
      
      // Loom upgrade
      if (player.upgrades.loom > 0) {
        baseHp += 15;
        baseArmor += 1;
      }
      
      // Carry capacity & Speed upgrades
      let carryMax = 10;
      if (player.upgrades.wheelbarrow > 0) {
        baseSpeed *= 1.10;
        carryMax += 3;
      }
      if (player.upgrades.handCart > 0) {
        baseSpeed *= 1.15;
        carryMax += 5;
      }
      this.inventory.max = carryMax;
      
    } else if (this.type === 'swordsman') {
      if (age === 'dark') {
        baseHp = 90; baseAttack = 12;
      } else if (age === 'feudal') {
        baseHp = 110; baseAttack = 16;
      } else if (age === 'castle') {
        baseHp = 140; baseAttack = 22;
      } else {
        baseHp = 180; baseAttack = 32;
      }
      baseSpeed = 2.8; baseRange = 1.1;
      
    } else if (this.type === 'spearman') {
      const level = player.upgrades.spearmanUpgrade || 0;
      if (level === 0) {
        baseHp = 45; baseAttack = 3;
      } else if (level === 1) {
        baseHp = 55; baseAttack = 4; // Pikeman
      } else {
        baseHp = 60; baseAttack = 6; // Halberdier
      }
      baseSpeed = 3.0; baseRange = 1.0;
      
    } else if (this.type === 'skirmisher') {
      const level = player.upgrades.skirmisherUpgrade || 0;
      if (level === 0) {
        baseHp = 30; baseAttack = 2; baseRange = 5.0; baseArmor = 3;
      } else {
        baseHp = 35; baseAttack = 3; baseRange = 6.0; baseArmor = 4;
      }
      baseSpeed = 3.0;
      
    } else if (this.type === 'scoutCavalry') {
      const level = player.upgrades.scoutUpgrade || 0;
      if (level === 0) {
        baseHp = 45; baseAttack = 3; baseSpeed = 4.8;
      } else if (level === 1) {
        baseHp = 60; baseAttack = 7; baseSpeed = 4.8; // Light Cavalry
      } else {
        baseHp = 75; baseAttack = 7; baseSpeed = 5.0; // Hussar
      }
      baseRange = 1.0;
      
    } else if (this.type === 'camelRider') {
      const level = player.upgrades.camelUpgrade || 0;
      if (level === 0) {
        baseHp = 100; baseAttack = 6;
      } else if (level === 1) {
        baseHp = 120; baseAttack = 7;
      } else {
        baseHp = 140; baseAttack = 9;
      }
      baseSpeed = 4.6; baseRange = 1.0;
      
    } else if (this.type === 'cavalryArcher') {
      const level = player.upgrades.cavalryArcherUpgrade || 0;
      if (level === 0) {
        baseHp = 50; baseAttack = 6;
      } else {
        baseHp = 60; baseAttack = 7;
      }
      baseSpeed = 4.4; baseRange = 4.0;
      
    } else if (this.type === 'monk' || this.type === 'missionary') {
      baseHp = 30;
      if (player.upgrades.sanctity > 0) baseHp += 15;
      baseSpeed = this.type === 'monk' ? 2.5 : 3.8; // missionary is mounted monk
      if (player.upgrades.fervor > 0) baseSpeed *= 1.15;
      baseAttack = 0;
      baseRange = 4.0;
      if (player.upgrades.blockPrinting > 0) baseRange += 3.0;
      
    } else if (this.type === 'transportShip') {
      baseHp = 150; baseSpeed = 3.6; baseAttack = 0; baseRange = 0.0;
      
    } else if (this.type === 'galley') {
      const level = player.upgrades.galleyUpgrade || 0;
      if (level === 0) {
        baseHp = 120; baseAttack = 6; baseRange = 5.0;
      } else if (level === 1) {
        baseHp = 135; baseAttack = 7; baseRange = 6.0;
      } else {
        baseHp = 165; baseAttack = 8; baseRange = 7.0;
      }
      baseSpeed = 3.2;
      
    } else if (this.type === 'fireShip') {
      const level = player.upgrades.fireShipUpgrade || 0;
      if (level === 0) {
        baseHp = 100; baseAttack = 2;
      } else {
        baseHp = 120; baseAttack = 3;
      }
      baseSpeed = 3.3; baseRange = 2.0;
      
    } else if (this.type === 'demolitionShip') {
      baseHp = 50; baseSpeed = 3.8; baseAttack = 0; baseRange = 1.0;
      
    } else if (this.type === 'cannonGalleon') {
      baseHp = 120; baseSpeed = 2.8; baseAttack = 35; baseRange = 10.0;
      
    } else if (this.type === 'footKnight') {
      if (age === 'dark') {
        baseHp = 100; baseAttack = 15;
      } else if (age === 'feudal') {
        baseHp = 120; baseAttack = 18;
      } else if (age === 'castle') {
        baseHp = 160; baseAttack = 25;
      } else {
        baseHp = 210; baseAttack = 35;
      }
      baseSpeed = 2.6; baseRange = 1.1;
      
    } else if (this.type === 'archer') {
      if (age === 'dark') {
        baseHp = 45; baseAttack = 6; baseRange = 5.5;
      } else if (age === 'feudal') {
        baseHp = 50; baseAttack = 8; baseRange = 5.5;
      } else if (age === 'castle') {
        baseHp = 65; baseAttack = 11; baseRange = 6.0;
      } else {
        baseHp = 80; baseAttack = 15; baseRange = 6.5;
      }
      baseSpeed = 3.0;
      
    } else if (this.type === 'knight') {
      if (age === 'dark') {
        baseHp = 120; baseAttack = 14;
      } else if (age === 'feudal') {
        baseHp = 135; baseAttack = 17;
      } else if (age === 'castle') {
        baseHp = 170; baseAttack = 23;
      } else {
        baseHp = 220; baseAttack = 32;
      }
      baseSpeed = 4.8; baseRange = 1.3;
      
    } else if (this.type === 'heavyCavalry') {
      if (age === 'dark') {
        baseHp = 180; baseAttack = 18;
      } else if (age === 'feudal') {
        baseHp = 200; baseAttack = 21;
      } else if (age === 'castle') {
        baseHp = 250; baseAttack = 28;
      } else {
        baseHp = 320; baseAttack = 38;
      }
      baseSpeed = 4.2; baseRange = 1.4;
      
    } else if (this.type === 'horseArcher') {
      if (age === 'dark') {
        baseHp = 80; baseAttack = 7; baseRange = 5.0;
      } else if (age === 'feudal') {
        baseHp = 95; baseAttack = 9; baseRange = 5.0;
      } else if (age === 'castle') {
        baseHp = 120; baseAttack = 13; baseRange = 5.5;
      } else {
        baseHp = 150; baseAttack = 17; baseRange = 6.0;
      }
      baseSpeed = 4.9;
      
    } else if (this.type === 'priest') {
      baseHp = 60; baseSpeed = 2.5; baseAttack = 0; baseRange = 3.5;
      
    } else if (this.type === 'trader') {
      baseHp = 80; baseSpeed = 3.2; baseAttack = 0; baseRange = 1.0;
      
    } else if (this.type === 'fishingShip') {
      baseHp = 120; baseSpeed = 3.5; baseAttack = 0; baseRange = 1.0;
      
    } else if (this.type === 'batteringRam') {
      const ramLevel = player.upgrades.batteringRamUpgrade || 0;
      if (ramLevel === 0) {
        baseHp = 250; baseAttack = 40; this.buildingBonus = 200;
      } else if (ramLevel === 1) {
        baseHp = 350; baseAttack = 60; this.buildingBonus = 350;
      } else {
        baseHp = 500; baseAttack = 80; this.buildingBonus = 500;
      }
      baseSpeed = 1.8; baseRange = 1.2; baseArmor = 50;
      
    } else if (this.type === 'mangonel') {
      const mangonelLevel = player.upgrades.mangonelUpgrade || 0;
      if (mangonelLevel === 0) {
        baseHp = 100; baseAttack = 25; baseRange = 6.5;
      } else if (mangonelLevel === 1) {
        baseHp = 140; baseAttack = 35; baseRange = 7.5;
      } else {
        baseHp = 180; baseAttack = 50; baseRange = 8.5;
      }
      baseSpeed = 2.0; baseArmor = 10;
      
    } else if (this.type === 'scorpion') {
      const scorpionLevel = player.upgrades.scorpionUpgrade || 0;
      if (scorpionLevel === 0) {
        baseHp = 80; baseAttack = 15; baseRange = 7.0;
      } else {
        baseHp = 110; baseAttack = 22; baseRange = 8.0;
      }
      baseSpeed = 2.2; baseArmor = 5;
      
    } else if (this.type === 'bombardCannon') {
      const canonLevel = player.upgrades.bombardCannonUpgrade || 0;
      if (canonLevel === 0) {
        baseHp = 120; baseAttack = 80; baseRange = 10.0;
      } else {
        baseHp = 160; baseAttack = 120; baseRange = 12.0;
      }
      baseSpeed = 1.9; baseArmor = 8;
      
    } else if (this.type === 'siegeTower') {
      baseHp = 300; baseSpeed = 2.3; baseRange = 0; baseAttack = 0; baseArmor = 30;
      
    } else if (this.type === 'trebuchet') {
      baseHp = 200; baseAttack = 150; baseRange = 15.0; baseSpeed = 1.5; baseArmor = 15;
      
    } else if (this.type === 'petard') {
      baseHp = 60; baseAttack = 100; this.buildingBonus = 1000; baseRange = 1.2; baseSpeed = 3.8; baseArmor = 0;
      
    } else if (this.type === 'longbowman') {
      baseHp = 40; baseSpeed = 3.0; baseAttack = 6; baseRange = 6.0;
    } else if (this.type === 'cataphract') {
      baseHp = 110; baseSpeed = 4.3; baseAttack = 9; baseRange = 1.2; baseArmor = 2;
    } else if (this.type === 'throwingAxeman') {
      baseHp = 60; baseSpeed = 3.0; baseAttack = 8; baseRange = 3.0;
    } else if (this.type === 'mangudai') {
      baseHp = 60; baseSpeed = 4.5; baseAttack = 6; baseRange = 4.0;
    } else if (this.type === 'conquistador') {
      baseHp = 55; baseSpeed = 4.2; baseAttack = 16; baseRange = 5.5; baseArmor = 2;
    } else if (this.type === 'karambitWarrior') {
      baseHp = 40; baseSpeed = 3.2; baseAttack = 6; baseRange = 1.0; baseArmor = 1;
    } else if (this.type === 'boyar') {
      baseHp = 120; baseSpeed = 4.0; baseAttack = 12; baseRange = 1.2; baseArmor = 4;
    } else if (this.type === 'samurai') {
      baseHp = 80; baseSpeed = 3.0; baseAttack = 10; baseRange = 1.1; baseArmor = 1;
    } else if (this.type === 'chuKoNu') {
      baseHp = 45; baseSpeed = 3.0; baseAttack = 8; baseRange = 4.5;
    } else if (this.type === 'woadRaider') {
      baseHp = 65; baseSpeed = 3.4; baseAttack = 8; baseRange = 1.0;
    } else if (this.type === 'huskarl') {
      baseHp = 60; baseSpeed = 3.1; baseAttack = 10; baseRange = 1.0; baseArmor = 6;
    } else if (this.type === 'teutonicKnight') {
      baseHp = 100; baseSpeed = 2.4; baseAttack = 14; baseRange = 1.0; baseArmor = 8;
    } else if (this.type === 'tarkan') {
      baseHp = 100; baseSpeed = 4.3; baseAttack = 8; baseRange = 1.2; this.buildingBonus = 15;
    } else if (this.type === 'janissary') {
      baseHp = 44; baseSpeed = 3.0; baseAttack = 17; baseRange = 8.0;
    } else if (this.type === 'warElephant') {
      baseHp = 450; baseSpeed = 2.4; baseAttack = 15; baseRange = 1.3; baseArmor = 3;
    } else if (this.type === 'jaguarWarrior') {
      baseHp = 75; baseSpeed = 3.0; baseAttack = 12; baseRange = 1.0; baseArmor = 2;
    } else if (this.type === 'plumedArcher') {
      baseHp = 50; baseSpeed = 3.3; baseAttack = 5; baseRange = 5.0; baseArmor = 1;
    } else if (this.type === 'centurion') {
      baseHp = 120; baseSpeed = 4.1; baseAttack = 12; baseRange = 1.3; baseArmor = 3;
    } else if (this.type === 'berserk') {
      baseHp = 60; baseSpeed = 3.1; baseAttack = 9; baseRange = 1.0; baseArmor = 1;
    } else if (this.type === 'eagleWarrior') {
      baseHp = 50; baseSpeed = 3.3; baseAttack = 7; baseRange = 1.0; baseArmor = 3;
    } else if (this.type === 'handCannoneer') {
      baseHp = 35; baseSpeed = 3.0; baseAttack = 17; baseRange = 7.0;
    } else if (this.type === 'elephantArcher') {
      baseHp = 230; baseSpeed = 2.6; baseAttack = 6; baseRange = 5.0; baseArmor = 2;
    } else if (this.type === 'battleElephant') {
      baseHp = 250; baseSpeed = 2.6; baseAttack = 12; baseRange = 1.2; baseArmor = 2;
    } else if (this.type === 'steppeLancer') {
      baseHp = 80; baseSpeed = 4.4; baseAttack = 9; baseRange = 1.5;
    }

    if (isInfantry) {
      const hpMult = civModifiers.hpInfantry || 1.0;
      const speedMult = civModifiers.speedInfantry || 1.0;
      const dmgMult = civModifiers.damageInfantry || 1.0;
      baseHp = Math.round(baseHp * hpMult);
      baseSpeed = baseSpeed * speedMult;
      baseAttack = Math.round(baseAttack * dmgMult);
      
      // Apply Squires upgrade (+10% speed)
      if (player.upgrades.squires > 0) {
        baseSpeed *= 1.10;
      }
      // Apply Arson upgrade (+2 building damage)
      if (player.upgrades.arson > 0) {
        this.buildingBonus = (this.buildingBonus || 0) + 2;
      }
      // Apply Teuton armor bonus (+2 armor)
      if (civModifiers.armorInfantry) {
        baseArmor += civModifiers.armorInfantry;
      }
    } else if (isCavalry) {
      const hpMult = civModifiers.hpCavalry || 1.0;
      const speedMult = civModifiers.speedCavalry || 1.0;
      baseHp = Math.round(baseHp * hpMult);
      baseSpeed = baseSpeed * speedMult;
      
      // Apply Husbandry upgrade (+10% speed)
      if (player.upgrades.husbandry > 0) {
        baseSpeed *= 1.10;
      }
      // Apply Bloodlines upgrade (+20 HP)
      if (player.upgrades.bloodlines > 0) {
        baseHp += 20;
      }
    }
    
    if (isArcher) {
      const dmgMult = civModifiers.damageInfantry || 1.0; // archers use same damageInfantry modifier
      const rangeBonus = civModifiers.archerRange || 0;
      baseAttack = Math.round(baseAttack * dmgMult);
      baseRange = baseRange + rangeBonus;
    }
    
    if (isGunpowder) {
      const hpMult = civModifiers.hpGunpowder || 1.0;
      const dmgBonus = civModifiers.gunpowderDamage || 1.0;
      baseHp = Math.round(baseHp * hpMult);
      baseAttack = Math.round(baseAttack * dmgBonus);
    }

    // Wood gather rates
    this.gatherRateWoodMultiplier = 1.0;
    if (player.upgrades.doubleBitAxe > 0) this.gatherRateWoodMultiplier *= 1.20;
    if (player.upgrades.bowSaw > 0) this.gatherRateWoodMultiplier *= 1.20;
    if (player.upgrades.twoManSaw > 0) this.gatherRateWoodMultiplier *= 1.10;

    // Gold gather rates
    this.gatherRateGoldMultiplier = 1.0;
    if (player.upgrades.goldMining > 0) this.gatherRateGoldMultiplier *= 1.15;
    if (player.upgrades.goldShaftMining > 0) this.gatherRateGoldMultiplier *= 1.15;

    // Stone gather rates
    this.gatherRateStoneMultiplier = 1.0;
    if (player.upgrades.stoneMining > 0) this.gatherRateStoneMultiplier *= 1.15;
    if (player.upgrades.stoneShaftMining > 0) this.gatherRateStoneMultiplier *= 1.15;

    // Food gather rates (e.g. Gillnets for fishing ship)
    this.gatherRateFoodMultiplier = 1.0;
    if (player.upgrades.gillnets > 0) this.gatherRateFoodMultiplier *= 1.25;
    
    const upgrades = player.upgrades || { attack: 0, armor: 0, arrow: 0 };
    
    const isMeleeUpgradeUnit = isInfantry && !isArcher; // swordsman, spearman, throwing axeman, etc.
    const isCavalryMeleeUpgradeUnit = isCavalry && !isArcher && this.type !== 'missionary'; // knight, heavy cav, etc.
    
    if (isMeleeUpgradeUnit || isCavalryMeleeUpgradeUnit) {
      baseAttack += (upgrades.attack || 0) * 2;
    }
    if (isArcher || isGunpowder || ['galley', 'cannonGalleon'].includes(this.type)) {
      baseAttack += (upgrades.arrow || 0) * 2;
      baseRange += (upgrades.arrow || 0) * 1.0;
    }
    
    const isCombatUnit = isInfantry || isCavalry || ['galley', 'fireShip', 'cannonGalleon', 'demolitionShip'].includes(this.type);
    if (isCombatUnit) {
      baseArmor += (upgrades.armor || 0) * 1;
    }
    
    // Check for nearby Siege Tower armor boost
    if (['swordsman', 'footKnight', 'archer', 'spearman', 'skirmisher'].includes(this.type)) {
      const units = this.gameManager.entityManager.units;
      const hasSiegeTowerNearby = units.some(u => 
        u.playerId === this.playerId && 
        u.type === 'siegeTower' && 
        u.hp > 0 && 
        u.position.distanceTo(this.position) < 8.0
      );
      if (hasSiegeTowerNearby) {
        baseArmor += 3;
      }
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
    const isWaterUnit = ['fishingShip', 'transportShip', 'galley', 'fireShip', 'demolitionShip', 'cannonGalleon'].includes(this.type);
    this.path = this.gameManager.findPath(this.position.x, this.position.z, targetX, targetZ, isWaterUnit, this.playerId);
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
    const upgradeLvl = this.gameManager.players[this.playerId].upgrades[this.type + 'Upgrade'] || 0;
    this.mesh = this.gameManager.modelFactory.createUnitMesh(this.type, this.playerId, this.civ, this.age, upgradeLvl, this.carryingRelic);
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

    // Unit GLB swap disabled — procedural meshes used for all units (no AnimationMixer overhead)
  }

  async _swapUnitGLB(glbKey, loader) {
    try {
      const glbRoot = await loader();
      if (!this.mesh || this.state === 'DEAD') return;

      const scene    = this.gameManager.renderer.scene;
      const factory  = this.gameManager.modelFactory;
      const yOffset  = glbRoot.position.y; // ground-sit offset from _loadGLB

      glbRoot.position.set(
        this.position.x,
        this.position.y + yOffset,
        this.position.z
      );
      glbRoot.rotation.y = this.mesh.rotation.y;
      glbRoot.userData   = { entity: this };

      if (this.selectionRing) {
        this.mesh.remove(this.selectionRing);
        glbRoot.add(this.selectionRing);
      }

      // Wire up AnimationMixer if the GLB has skeletal animations
      const clips = factory.getGLBAnimations(glbKey);
      if (clips.length > 0) {
        this._glbMixer  = new THREE.AnimationMixer(glbRoot);
        this._glbClips  = {};
        this._glbYOff   = yOffset;

        // Log clip names so we can see what the GLB actually contains
        console.log(`[GLB clips for ${glbKey}]:`, clips.map(c => c.name));

        clips.forEach(clip => {
          const n = clip.name.toLowerCase();
          const action = this._glbMixer.clipAction(clip);
          action.loop = THREE.LoopRepeat;
          if (!this._glbClips.idle && (n.includes('idle') || n.includes('stand') || n.includes('breathe'))) {
            this._glbClips.idle = action;
          } else if (!this._glbClips.walk && (n.includes('walk') || n.includes('run') || n.includes('move'))) {
            this._glbClips.walk = action;
          } else if (!this._glbClips.attack && (n.includes('attack') || n.includes('chop') || n.includes('hit') || n.includes('swing') || n.includes('mine'))) {
            this._glbClips.attack = action;
          } else if (!this._glbClips.death && (n.includes('death') || n.includes('die') || n.includes('dead'))) {
            this._glbClips.death = action;
            action.loop = THREE.LoopOnce;
            action.clampWhenFinished = true;
          }
        });
        // Fallback: if no walk/attack found by name, use first clip for walk.
        // idle stays null → stopAllAction() when idle (stand still, no dancing).
        if (!this._glbClips.walk && clips.length > 0) {
          this._glbClips.walk = this._glbMixer.clipAction(clips[0]);
        }
        if (!this._glbClips.attack) this._glbClips.attack = this._glbClips.walk || this._glbClips.idle;

        this._currentGLBAnim = 'idle';
        // Start idle: stop all (stand still in bind pose) — walk clip plays when moving
        this._glbMixer.stopAllAction();
      }

      scene.remove(this.mesh);
      scene.add(glbRoot);
      this.mesh = glbRoot;
    } catch (err) {
      console.warn(`[Unit._swapUnitGLB] failed for ${glbKey}:`, err);
      // Procedural mesh stays in scene as fallback
    }
  }

  setSelected(isSelected) {
    this.selected = isSelected;
    this.selectionRing.material.visible = isSelected;
  }

  // -------------------------------------------------------------
  // COMMAND ACTIONS
  // -------------------------------------------------------------
  commandStop() {
    if (this.state === 'DEAD') return;
    this.state = 'IDLE';
    this.targetPosition.copy(this.position);
    this.targetEntity = null;
    this.targetAction = null;
    this.path = [];
    if (this.velocity) this.velocity.set(0, 0, 0);
  }

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
    if ((this.type === 'monk' || this.type === 'priest') && resourceNode.type === 'relic') {
      if (this.carryingRelic) {
        if (this.playerId === 0) {
          this.gameManager.hud.showNotification("Monk is already carrying a relic!");
        }
        return;
      }
      this.targetEntity = resourceNode;
      this.targetAction = 'relic';
      this.state = 'MOVING';
      this.setTargetNearPosition(resourceNode.position, resourceNode);
      this.startPathfinding(this.targetPosition.x, this.targetPosition.z);
      return;
    }
    this.targetEntity = resourceNode;
    this.targetAction = 'gather';
    this.state = 'MOVING';
    
    // Set target position near resource node
    this.setTargetNearPosition(resourceNode.position, resourceNode);
    this.startPathfinding(this.targetPosition.x, this.targetPosition.z);
  }

  commandBuild(building) {
    if (this.state === 'DEAD') return;
    if ((this.type === 'monk' || this.type === 'priest') && this.carryingRelic && building.type === 'monastery' && building.playerId === this.playerId && building.isCompleted) {
      this.targetEntity = building;
      this.targetAction = 'depositRelic';
      this.state = 'MOVING';
      this.setTargetNearPosition(building.position, building);
      this.startPathfinding(this.targetPosition.x, this.targetPosition.z);
      return;
    }
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
    const player = this.gameManager.players[this.playerId];
    const isMonkOrPriest = ['priest', 'monk'].includes(enemy.type);
    const isSiegeOrBuilding = ['batteringRam', 'mangonel', 'scorpion', 'bombardCannon', 'siegeTower', 'trebuchet'].includes(enemy.type) || enemy.gridSize !== undefined;
    
    if (isMonkOrPriest && !(player.upgrades.atonement > 0)) {
      if (this.playerId === 0) {
        this.gameManager.hud.showNotification("Butuh teknologi Atonement untuk merekrut Monk musuh!");
      }
      return;
    }
    if (isSiegeOrBuilding && !(player.upgrades.redemption > 0)) {
      if (this.playerId === 0) {
        this.gameManager.hud.showNotification("Butuh teknologi Redemption untuk merekrut mesin perang / bangunan!");
      }
      return;
    }
    
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
  scanPriorityTargets(deltaTime) {
    if (this.playerId === 0 || this.state === 'DEAD') return;
    
    // Auto-scan periodically (every 1.0s)
    if (this._aiScanTimer === undefined) this._aiScanTimer = Math.random(); // offset start phases
    this._aiScanTimer += deltaTime;
    if (this._aiScanTimer < 1.0) return;
    this._aiScanTimer = 0;
    
    const isMilitary = ['swordsman', 'footKnight', 'archer', 'knight', 'heavyCavalry', 'horseArcher', 'spearman', 'skirmisher', 'scoutCavalry', 'camelRider', 'cavalryArcher', 'galley', 'fireShip', 'cannonGalleon', 'mangonel', 'trebuchet', 'scorpion', 'bombardCannon'].includes(this.type);
    if (!isMilitary) return;

    // Scan range
    const scanRange = ['archer', 'horseArcher', 'cavalryArcher', 'mangonel', 'trebuchet', 'bombardCannon'].includes(this.type) ? 16.0 : 12.0;

    let bestTarget = null;
    let bestScore = -Infinity;

    // 1. Scan Units
    const units = this.gameManager.entityManager.units;
    for (let i = 0; i < units.length; i++) {
      const u = units[i];
      if (u.hp <= 0 || u.state === 'DEAD' || u.state === 'GARRISONED') continue;
      if (!this.gameManager.isEnemy(this.playerId, u.playerId)) continue;
      
      const dist = this.position.distanceTo(u.position);
      if (dist > scanRange) continue;

      let score = 0;
      if (u.type === 'villager') {
        score = 100 - dist * 2;
      } else if (['mangonel', 'trebuchet', 'scorpion', 'bombardCannon', 'batteringRam'].includes(u.type)) {
        score = 90 - dist * 2;
      } else if (u.type === 'monk') {
        score = 85 - dist * 2;
      } else {
        score = 70 - dist * 2;
      }

      if (score > bestScore) {
        bestScore = score;
        bestTarget = u;
      }
    }

    // 2. Scan Buildings
    if (bestScore < 60) {
      const buildings = this.gameManager.entityManager.buildings;
      for (let i = 0; i < buildings.length; i++) {
        const b = buildings[i];
        if (b.hp <= 0 || !b.isCompleted) continue;
        if (!this.gameManager.isEnemy(this.playerId, b.playerId)) continue;

        const dist = this.position.distanceTo(b.position);
        if (dist > scanRange) continue;

        let score = 0;
        if (b.type === 'townCenter') {
          score = 55 - dist * 1.5;
        } else if (['mill', 'lumberCamp', 'miningCamp', 'market', 'dock', 'farm', 'house'].includes(b.type)) {
          score = 50 - dist * 1.5;
        } else if (['watchTower', 'bombardTower', 'castle', 'barracks', 'stable', 'archeryRange', 'siegeWorkshop', 'monastery', 'blacksmith', 'university'].includes(b.type)) {
          score = 45 - dist * 1.5;
        } else {
          score = 15 - dist * 1.5;
        }

        if (score > bestScore) {
          bestScore = score;
          bestTarget = b;
        }
      }
    }

    if (bestTarget) {
      const currentTarget = this.targetEntity;
      if (currentTarget && currentTarget.hp > 0) {
        let currentScore = 0;
        if (currentTarget.type === 'villager') currentScore = 100;
        else if (['mangonel', 'trebuchet', 'scorpion', 'bombardCannon', 'batteringRam'].includes(currentTarget.type)) currentScore = 90;
        else if (currentTarget.type === 'monk') currentScore = 85;
        else if (currentTarget.playerId !== undefined) currentScore = 70;
        else if (currentTarget.type === 'townCenter') currentScore = 55;
        else if (['mill', 'lumberCamp', 'miningCamp', 'market', 'dock', 'farm', 'house'].includes(currentTarget.type)) currentScore = 50;
        else currentScore = 40;

        if (bestScore - currentScore > 20) {
          this.commandAttack(bestTarget);
        }
      } else {
        this.commandAttack(bestTarget);
      }
    }
  }

  update(deltaTime) {
    if (this.state === 'DEAD' || this.state === 'GARRISONED') return;

    if (this.playerId !== 0) {
      this.scanPriorityTargets(deltaTime);
    }

    this.animTime += deltaTime;

    // Periodic check to recalculate stats (for Siege Tower armor aura)
    if (this.playerId === 0 || this.playerId === 2) {
      if (this._siegeTowerCheckTimer === undefined) this._siegeTowerCheckTimer = 0;
      this._siegeTowerCheckTimer += deltaTime;
      if (this._siegeTowerCheckTimer > 1.0) {
        this._siegeTowerCheckTimer = 0;
        this.recalculateStats();
      }
    }
    
    // Sheep tracking logic for villagers
    if (this.state === 'MOVING' && this.targetAction === 'gather' && this.targetEntity && this.targetEntity.type === 'sheep' && this.targetEntity.hp !== undefined) {
      const dist = this.targetPosition.distanceTo(this.targetEntity.position);
      if (dist > 1.5) {
        this.setTargetNearPosition(this.targetEntity.position, this.targetEntity);
      }
    }
    
    // Priest/Monk specific timers
    if (this.type === 'priest' || this.type === 'monk' || this.type === 'missionary') {
      if (this.conversionCooldown > 0) {
        this.conversionCooldown -= deltaTime;
      }
      if (this.state === 'IDLE') {
        this.scanTimer += deltaTime;
        if (this.scanTimer >= 1.5) {
          this.scanTimer = 0;
          const scanRange = this.playerId !== 0 ? 16.0 : 8.0;
          const friendlyInjured = this.gameManager.entityManager.units.find(u => 
            u.playerId === this.playerId && u.hp < u.maxHp && u.state !== 'DEAD' && this.position.distanceTo(u.position) < scanRange
          );
          if (friendlyInjured) {
            this.commandHeal(friendlyInjured);
          }
        }
      }
    }

    // Berserk regeneration: +2 HP per second
    if (this.type === 'berserk' && this.hp > 0 && this.hp < this.maxHp) {
      if (this.regenTimer === undefined) this.regenTimer = 0;
      this.regenTimer += deltaTime;
      if (this.regenTimer >= 1.0) {
        this.regenTimer = 0;
        this.hp = Math.min(this.maxHp, this.hp + 2);
        this.gameManager.hud.showFloatingText(this.position, "+2 HP", 0x2ecc71);
      }
    }
    
    // Military unit auto-scanning behavior
    const isMilitary = [
      'swordsman', 'footKnight', 'archer', 'knight', 'heavyCavalry', 'horseArcher', 'spearman', 'skirmisher', 'scoutCavalry', 'camelRider', 'cavalryArcher', 'galley', 'fireShip', 'cannonGalleon', 'demolitionShip',
      'longbowman', 'cataphract', 'throwingAxeman', 'mangudai', 'conquistador', 'karambitWarrior', 'boyar', 'samurai', 'chuKoNu', 'woadRaider', 'huskarl', 'teutonicKnight', 'tarkan', 'janissary', 'warElephant', 'jaguarWarrior', 'plumedArcher', 'centurion', 'berserk',
      'eagleWarrior', 'handCannoneer', 'elephantArcher', 'battleElephant', 'steppeLancer'
    ].includes(this.type);
    if (isMilitary && this.state === 'IDLE') {
      if (this.militaryScanTimer === undefined) this.militaryScanTimer = 0;
      this.militaryScanTimer += deltaTime;
      if (this.militaryScanTimer >= 1.0) {
        this.militaryScanTimer = 0;
        
        const scanRange = ['archer', 'horseArcher', 'longbowman', 'mangudai', 'chuKoNu', 'plumedArcher', 'elephantArcher', 'handCannoneer', 'janissary'].includes(this.type) ? 14.0 : 10.0;
        let nearestEnemy = null;
        let minDistance = Infinity;
        
        const units = this.gameManager.entityManager.units;
        for (let i = 0; i < units.length; i++) {
          const u = units[i];
          if (u.hp <= 0 || u.state === 'DEAD') continue;
          
          const isEnemy = this.gameManager.isEnemy(this.playerId, u.playerId);
          
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
    
    // Procedural limb animation — lightweight, no AnimationMixer overhead
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

        // Switch villager tool mesh to match resource being gathered
        if (this.type === 'villager') {
          const rType = this.targetEntity.type;
          const newTool = (rType === 'stone' || rType === 'gold') ? 'pickaxe'
                        : (rType === 'food' || rType === 'sheep' || rType === 'farm' || rType === 'fish' || rType === 'fishTrap') ? 'sickle'
                        : 'axe';
          if (newTool !== this._gatherType) {
            this._gatherType = newTool;
            const bodyGroup = this.mesh && this.mesh.getObjectByName('bodyGroup');
            const rightArm  = bodyGroup && bodyGroup.getObjectByName('rightArm');
            if (rightArm) {
              const names = ['toolAxe', 'toolPickaxe', 'toolSickle'];
              names.forEach(n => {
                const t = rightArm.getObjectByName(n);
                if (t) t.visible = (n === 'tool' + newTool.charAt(0).toUpperCase() + newTool.slice(1));
              });
            }
          }
        }

        // Apply Civ gather rate modifiers and camp/dock upgrades
        let gatherRateMult = 1.0;
        if (this.targetEntity.type === 'wood') {
          gatherRateMult = (this.civModifiers.gatherWood || 1.0) * (this.gatherRateWoodMultiplier || 1.0);
        } else if (['food', 'sheep', 'fish', 'farm', 'fishTrap'].includes(this.targetEntity.type)) {
          let foodMult = this.civModifiers.gatherFood || 1.0;
          if (this.targetEntity.type === 'fish' || this.targetEntity.type === 'fishTrap') {
            foodMult *= (this.gatherRateFoodMultiplier || 1.0);
          }
          gatherRateMult = foodMult;
        } else if (this.targetEntity.type === 'stone') {
          gatherRateMult = (this.civModifiers.gatherStone || 1.0) * (this.gatherRateStoneMultiplier || 1.0);
        } else if (this.targetEntity.type === 'gold') {
          gatherRateMult = (this.civModifiers.gatherGold || 1.0) * (this.gatherRateGoldMultiplier || 1.0);
        }

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
          if (['sheep', 'fish', 'farm', 'fishTrap'].includes(resourceType)) {
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
          } else if (this.targetEntity.type === 'fish' || this.targetEntity.type === 'fishTrap') {
            particleColor = 0x3a86c8; // blue fish water splash
          } else if (this.targetEntity.type === 'sheep') {
            particleColor = 0xeeeeee; // white wool splash
          } else if (this.targetEntity.type === 'farm') {
            particleColor = 0x556b2f; // dark green crop splash
          }
          this.gameManager.spawnParticles(this.targetEntity.position, particleColor, 6, 0.08);
          
          // Inventory full? Go back to Town Center / Dock
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
        } else if (this.targetEntity && this.targetEntity.type === 'fishTrap') {
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
        
        this.targetEntity.hp = Math.min(this.targetEntity.maxHp, this.targetEntity.hp + 10);
        this.gameManager.hud.showFloatingText(this.targetEntity.position, "+10 HP", 0x2ecc71);
        
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

      const targetConversionTime = (this.targetEntity.type === 'scoutCavalry') ? 10.0 : 5.0;

      if (this.conversionTimer >= targetConversionTime) {
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

        const player = this.gameManager.players[this.playerId];
        const cooldownDuration = (player.upgrades.illumination > 0) ? 7.5 : 15.0;
        this.conversionCooldown = cooldownDuration;
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
        const now = performance.now();
        if (!this._lastChasingPathfindTime || (now - this._lastChasingPathfindTime > 500)) {
          this.startPathfinding(target.x, target.z);
          this._lastChasingPathfindTime = now;
        }
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
        
        let damageToApply = this.attackPower;
        if (this.targetEntity.gridSize !== undefined && this.buildingBonus) {
          damageToApply += this.buildingBonus;
        }
        
        if (this.type === 'archer' || this.type === 'horseArcher' || this.type === 'cavalryArcher' || this.type === 'galley' || this.type === 'cannonGalleon') {
          if (this.type === 'cannonGalleon') {
            this.gameManager.spawnProjectile(this.position, this.targetEntity.position, 'cannonball');
          } else {
            this.gameManager.spawnArrow(this.position, this.targetEntity.position);
          }
          this.gameManager.soundManager.playClickSound(this.type === 'cannonGalleon' ? 'hit' : 'arrow');
          this.targetEntity.takeDamage(damageToApply, this.playerId, this);
        } else if (this.type === 'fireShip') {
          this.gameManager.spawnParticles(this.targetEntity.position, 0xff5500, 4, 0.08);
          if (Math.random() < 0.25) {
            this.gameManager.soundManager.playClickSound('hit');
          }
          this.targetEntity.takeDamage(damageToApply, this.playerId, this);
        } else if (this.type === 'demolitionShip') {
          const dmg = 400;
          const rangeRadius = 4.0;
          this.gameManager.spawnParticles(this.position, 0xff5500, 20, 0.25);
          this.gameManager.soundManager.playClickSound('hit');
          
          const buildings = this.gameManager.entityManager.buildings;
          buildings.forEach(b => {
            if (b.hp > 0 && b.position.distanceTo(this.position) <= rangeRadius) {
              b.takeDamage(dmg, this.playerId);
            }
          });
          
          const units = this.gameManager.entityManager.units;
          units.forEach(u => {
            if (u.hp > 0 && u !== this && u.position.distanceTo(this.position) <= rangeRadius) {
              u.takeDamage(dmg, this.playerId, this);
            }
          });
          
          this.takeDamage(this.maxHp, this.playerId, this); // Self destruct
          this.state = 'DEAD';
          return;
        } else if (this.type === 'mangonel' || this.type === 'trebuchet') {
          this.gameManager.spawnProjectile(this.position, this.targetEntity.position, 'boulder');
          this.gameManager.soundManager.playClickSound('hit');
          this.targetEntity.takeDamage(damageToApply, this.playerId, this);
          
          // Mangonel/Trebuchet Splash Damage: deal damage to all units in range
          const rangeRadius = this.type === 'mangonel' ? 2.5 : 3.5;
          const targetPos = this.targetEntity.position;
          const units = this.gameManager.entityManager.units;
          units.forEach(u => {
            if (u.hp > 0 && this.gameManager.isEnemy(this.playerId, u.playerId) && u.position.distanceTo(targetPos) <= rangeRadius && u !== this.targetEntity) {
              u.takeDamage(Math.round(damageToApply * 0.6), this.playerId, this);
            }
          });
        } else if (this.type === 'scorpion') {
          this.gameManager.spawnProjectile(this.position, this.targetEntity.position, 'bolt');
          this.gameManager.soundManager.playClickSound('arrow');
          this.targetEntity.takeDamage(damageToApply, this.playerId, this);
          
          // Scorpion linear pierce damage
          const targetPos = this.targetEntity.position;
          const units = this.gameManager.entityManager.units;
          units.forEach(u => {
            if (u.hp > 0 && this.gameManager.isEnemy(this.playerId, u.playerId) && u !== this.targetEntity) {
              const lineDist = this.distanceToLine(u.position, this.position, targetPos);
              if (lineDist < 1.0 && u.position.distanceTo(this.position) < this.attackRange) {
                u.takeDamage(Math.round(damageToApply * 0.5), this.playerId, this);
              }
            }
          });
        } else if (this.type === 'bombardCannon') {
          this.gameManager.spawnProjectile(this.position, this.targetEntity.position, 'cannonball');
          this.gameManager.soundManager.playClickSound('hit');
          this.targetEntity.takeDamage(damageToApply, this.playerId, this);
          
          // Cannon splash
          const rangeRadius = 1.5;
          const targetPos = this.targetEntity.position;
          const units = this.gameManager.entityManager.units;
          units.forEach(u => {
            if (u.hp > 0 && this.gameManager.isEnemy(this.playerId, u.playerId) && u.position.distanceTo(targetPos) <= rangeRadius && u !== this.targetEntity) {
              u.takeDamage(Math.round(damageToApply * 0.4), this.playerId, this);
            }
          });
        } else if (this.type === 'petard') {
          this.targetEntity.takeDamage(damageToApply, this.playerId);
          this.gameManager.spawnParticles(this.position, 0xff5500, 15, 0.2);
          this.gameManager.soundManager.playClickSound('hit');
          this.takeDamage(this.maxHp, this.playerId, this); // Self destruct
          this.state = 'DEAD';
          return;
        } else {
          this.gameManager.soundManager.playClickSound('hit');
          this.targetEntity.takeDamage(damageToApply, this.playerId, this);
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
    
    const isWaterUnit = ['fishingShip', 'transportShip', 'galley', 'fireShip', 'demolitionShip', 'cannonGalleon'].includes(this.type);
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
      } else if (this.targetAction === 'relic') {
        if (this.targetEntity && this.targetEntity.type === 'relic') {
          this.carryingRelic = true;
          this.targetEntity.destroy();
          this.rebuildMesh();
          this.state = 'IDLE';
          this.targetEntity = null;
          this.targetAction = null;
          if (this.playerId === 0) {
            this.gameManager.hud.showNotification("Relic picked up! Bring it to a Monastery. 🪙");
            this.gameManager.soundManager.playClickSound('complete');
          }
        }
        return;
      } else if (this.targetAction === 'depositRelic') {
        if (this.targetEntity && this.targetEntity.type === 'monastery' && this.targetEntity.playerId === this.playerId && this.targetEntity.isCompleted) {
          this.carryingRelic = false;
          this.targetEntity.relicsCount = (this.targetEntity.relicsCount || 0) + 1;
          this.rebuildMesh();
          this.state = 'IDLE';
          this.targetEntity = null;
          this.targetAction = null;
          if (this.playerId === 0) {
            this.gameManager.hud.showNotification("Relic deposited in Monastery! Gold generation active (+2 Gold/sec). 🪙");
            this.gameManager.soundManager.playClickSound('complete');
          }
        }
        return;
      } else if (this.targetAction === 'garrison') {
        if (this.targetEntity && (this.targetEntity.type === 'castle' || this.targetEntity.type === 'transportShip') && this.targetEntity.isCompleted) {
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

    // If type to find is food, we search for friendly completed fish traps (fishing ships only)
    if (typeToFind === 'food' && this.type === 'fishingShip') {
      const buildings = this.gameManager.entityManager.buildings;
      buildings.forEach(b => {
        if (b.type === 'fishTrap' && b.playerId === this.playerId && b.isCompleted && b.amount > 0) {
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

  takeDamage(amount, attackerPlayerId = null, attackerUnit = null) {
    if (this.state === 'DEAD') return;

    // Apply combat counters
    let finalAmount = amount;
    if (attackerUnit) {
      const isCavalry = (type) => ['knight', 'heavyCavalry', 'horseArcher', 'scoutCavalry', 'camelRider', 'cavalryArcher'].includes(type);
      
      if (['spearman'].includes(attackerUnit.type) && isCavalry(this.type)) {
        finalAmount *= 3.5;
      }
      else if (['camelRider'].includes(attackerUnit.type) && isCavalry(this.type) && !['camelRider'].includes(this.type)) {
        finalAmount *= 2.0;
      }
      else if (['skirmisher'].includes(attackerUnit.type) && ['archer', 'horseArcher', 'cavalryArcher'].includes(this.type)) {
        finalAmount *= 3.0;
      }
      else if (['scoutCavalry'].includes(attackerUnit.type) && ['priest', 'monk'].includes(this.type)) {
        finalAmount *= 2.5;
      }
    }

    const armor = this.armor || 0;
    const finalDamage = Math.max(1, Math.round(finalAmount) - armor);
    this.hp = Math.max(0, this.hp - finalDamage);
    
    // Spawn floating numbers
    this.gameManager.hud.showFloatingText(this.position, `-${finalDamage}`, 0xff0000);
    
    // Attack warning trigger for player
    if (this.playerId === 0) {
      const now = performance.now();
      if (!this.gameManager.lastAttackNotificationTime) this.gameManager.lastAttackNotificationTime = 0;
      if (now - this.gameManager.lastAttackNotificationTime > 12000) {
        this.gameManager.lastAttackNotificationTime = now;
        this.gameManager.hud.showNotification(`⚠️ Pasukan Anda sedang diserang!`, this.position);
        this.gameManager.soundManager.playClickSound('select');
      }
    }
    
    if (this.hp <= 0) {
      if (attackerPlayerId !== null && this.gameManager.players[attackerPlayerId]) {
        this.gameManager.players[attackerPlayerId].kills = (this.gameManager.players[attackerPlayerId].kills || 0) + 1;
      }
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
      const leftFoot  = bodyGroup.getObjectByName("leftFoot");
      const rightFoot = bodyGroup.getObjectByName("rightFoot");
      const rightArm  = bodyGroup.getObjectByName("rightArm");
      const leftArm   = bodyGroup.getObjectByName("leftArm");

      if (isMoving) {
        const bob = Math.sin(this.animTime * 14) * 0.12;
        bodyGroup.position.y = bob;
        if (leftFoot && rightFoot) {
          leftFoot.position.z  =  Math.sin(this.animTime * 14) * 0.22;
          rightFoot.position.z = -Math.sin(this.animTime * 14) * 0.22;
        }
        // Arms swing opposite to feet while walking
        if (leftArm)  leftArm.rotation.x  =  Math.sin(this.animTime * 14) * 0.35;
        if (rightArm) rightArm.rotation.x = -Math.sin(this.animTime * 14) * 0.35;
      } else {
        bodyGroup.position.y = Math.sin(this.animTime * 2.5) * 0.02;
        if (leftFoot && rightFoot) {
          leftFoot.position.z = 0;
          rightFoot.position.z = 0;
        }
        if (leftArm)  leftArm.rotation.x  = 0;
      }

      // ── Villager-specific animations ──────────────────────────
      if (this.type === 'villager') {
        const gatherType  = this._gatherType || 'axe';
        const isReturning = this.state === 'RETURNING';
        const isHarvesting = this.state === 'HARVESTING';

        // Carry pose: lean forward + arms out when returning with resources
        const carryItem = bodyGroup.getObjectByName("carryItem");
        if (carryItem) {
          const shouldCarry = isReturning && this.inventory && this.inventory.amount > 0;
          carryItem.visible = shouldCarry;
          if (shouldCarry) {
            // Tint bundle colour by resource type
            const bundle = carryItem.getObjectByName("bundleMesh");
            if (bundle) {
              const col = this.inventory.type === 'wood'  ? 0x8b5a2b
                        : this.inventory.type === 'stone' ? 0x888888
                        : this.inventory.type === 'gold'  ? 0xffd700
                        : this.inventory.type === 'food'  ? 0xcc4422
                        : 0x8b5a2b;
              if (bundle.material.color.getHex() !== col) bundle.material.color.setHex(col);
            }
            bodyGroup.rotation.x = 0.18; // lean forward with load
          } else {
            bodyGroup.rotation.x = 0;
          }
        }

        // Tool swing — speed & arc differ per tool
        if (this.swingProgress > 0) {
          if (gatherType === 'pickaxe') {
            // Heavy overhead slam — slow arc, body rocks
            this.swingProgress -= deltaTime * 2.4;
            const p = Math.max(0, this.swingProgress);
            if (rightArm) rightArm.rotation.x = -Math.sin(p * Math.PI) * 1.6;
            bodyGroup.rotation.x = Math.sin(p * Math.PI) * 0.12;
          } else if (gatherType === 'sickle') {
            // Horizontal sweep — arm rotates on Z axis
            this.swingProgress -= deltaTime * 3.8;
            const p = Math.max(0, this.swingProgress);
            if (rightArm) {
              rightArm.rotation.x = -Math.sin(p * Math.PI) * 0.7;
              rightArm.rotation.z = -Math.sin(p * Math.PI) * 0.8;
            }
          } else {
            // Axe chop — fast overhead strike
            this.swingProgress -= deltaTime * 4.2;
            const p = Math.max(0, this.swingProgress);
            if (rightArm) rightArm.rotation.x = -Math.sin(p * Math.PI) * 1.25;
          }
        } else {
          if (rightArm && !isMoving) {
            rightArm.rotation.x = isHarvesting ? -0.3 : 0; // ready stance while harvesting
            if (rightArm.rotation.z !== 0) rightArm.rotation.z *= 0.85; // fade sickle Z
          }
          if (!isMoving) bodyGroup.rotation.x = 0;
        }
      } else {
        // Non-villager standard unit swing
        if (this.swingProgress > 0) {
          this.swingProgress -= deltaTime * 3.5;
          if (rightArm) rightArm.rotation.x = -Math.sin(Math.max(0, this.swingProgress) * Math.PI) * 1.1;
        } else {
          if (rightArm) rightArm.rotation.x = 0;
        }
      }
    }
  }

  rebuildMesh() {
    if (this.mesh) {
      this.gameManager.renderer.scene.remove(this.mesh);
      this.mesh.traverse(child => {
        if (child.isMesh) {
          child.geometry.dispose();
          if (child.material && typeof child.material.dispose === 'function') {
            child.material.dispose();
          }
        }
      });
    }
    this.initMesh();
    this.setSelected(this.selected);
  }

  getDisplayName() {
    const player = this.gameManager.players[this.playerId];
    const level = player ? (player.upgrades[this.type + 'Upgrade'] || 0) : 0;
    
    if (this.type === 'swordsman') {
      if (level === 1) return 'Men-at-Arms';
      if (level >= 2) return 'Longswordsman';
      return 'Swordsman';
    }
    if (this.type === 'spearman') {
      if (level === 1) return 'Pikeman';
      if (level >= 2) return 'Halberdier';
      return 'Spearman';
    }
    if (this.type === 'skirmisher') {
      if (level >= 1) return 'Elite Skirmisher';
      return 'Skirmisher';
    }
    if (this.type === 'scoutCavalry') {
      if (level === 1) return 'Light Cavalry';
      if (level >= 2) return 'Hussar';
      return 'Scout Cavalry';
    }
    if (this.type === 'camelRider') {
      if (level === 1) return 'Heavy Camel';
      if (level >= 2) return 'Imperial Camel';
      return 'Camel Rider';
    }
    if (this.type === 'cavalryArcher') {
      if (level >= 1) return 'Heavy Cavalry Archer';
      return 'Cavalry Archer';
    }
    if (this.type === 'monk') return 'Monk';
    if (this.type === 'transportShip') return 'Transport Ship';
    if (this.type === 'galley') {
      if (level === 1) return 'War Galley';
      if (level >= 2) return 'Galleon';
      return 'Galley';
    }
    if (this.type === 'fireShip') {
      if (level >= 1) return 'Fast Fire Ship';
      return 'Fire Ship';
    }
    if (this.type === 'demolitionShip') return 'Demolition Ship';
    if (this.type === 'cannonGalleon') return 'Cannon Galleon';
    if (this.type === 'archer') {
      if (level === 1) return 'Crossbowman';
      if (level >= 2) return 'Arbalest';
      return 'Archer';
    }
    if (this.type === 'knight') {
      if (level === 1) return 'Cavalier';
      if (level >= 2) return 'Paladin';
      return 'Knight';
    }
    if (this.type === 'footKnight') {
      if (level === 1) return 'Champion Foot Knight';
      if (level >= 2) return 'Elite Foot Knight';
      return 'Foot Knight';
    }
    if (this.type === 'heavyCavalry') {
      if (level === 1) return 'Cataphract';
      if (level >= 2) return 'Elite Heavy Cav';
      return 'Heavy Cavalry';
    }
    if (this.type === 'horseArcher') {
      if (level === 1) return 'Heavy Cavalry Archer';
      if (level >= 2) return 'Elite Cavalry Archer';
      return 'Cavalry Archer';
    }
    if (this.type === 'batteringRam') {
      if (level === 1) return 'Capped Ram';
      if (level >= 2) return 'Siege Ram';
      return 'Battering Ram';
    }
    if (this.type === 'mangonel') {
      if (level === 1) return 'Onager';
      if (level >= 2) return 'Siege Onager';
      return 'Mangonel';
    }
    if (this.type === 'scorpion') {
      if (level >= 1) return 'Heavy Scorpion';
      return 'Scorpion';
    }
    if (this.type === 'bombardCannon') {
      if (level >= 1) return 'Houfnice';
      return 'Bombard Cannon';
    }
    if (this.type === 'siegeTower') return 'Siege Tower';
    if (this.type === 'trebuchet') return 'Trebuchet';
    if (this.type === 'petard') return 'Petard';
    
    return this.type.charAt(0).toUpperCase() + this.type.slice(1);
  }

  garrisonUnit(unit) {
    if (this.garrisonedUnits === undefined) {
      this.garrisonedUnits = [];
    }
    if (this.garrisonedUnits.length >= 10) {
      if (unit.playerId === 0) {
        this.gameManager.hud.showNotification("Transport Ship is full (Max 10 units)!");
      }
      return false;
    }
    
    this.garrisonedUnits.push(unit);
    
    unit.state = 'GARRISONED';
    unit.mesh.visible = false;
    unit.setSelected(false);
    
    const idx = this.gameManager.selectedEntities.indexOf(unit);
    if (idx !== -1) {
      this.gameManager.selectedEntities.splice(idx, 1);
      this.gameManager.hud.updateSelectionUI();
    }
    
    if (this.playerId === 0) {
      this.gameManager.hud.showNotification(`Garrisoned ${unit.type} in Transport Ship! (${this.garrisonedUnits.length}/10)`);
      if (this.selected) {
        this.gameManager.hud.updateSelectionUI();
      }
    }
    
    return true;
  }

  ungarrisonAll() {
    if (!this.garrisonedUnits || this.garrisonedUnits.length === 0) return;
    
    const count = this.garrisonedUnits.length;
    this.garrisonedUnits.forEach(unit => {
      unit.state = 'IDLE';
      unit.mesh.visible = true;
      
      const angle = Math.random() * Math.PI * 2;
      const dist = 1.5;
      const tx = this.position.x + Math.cos(angle) * dist;
      const tz = this.position.z + Math.sin(angle) * dist;
      unit.position.set(
        tx,
        this.gameManager.terrain.getGroundHeight(tx, tz),
        tz
      );
      unit.targetPosition.copy(unit.position);
      unit.mesh.position.copy(unit.position);
    });
    
    this.garrisonedUnits = [];
    
    if (this.playerId === 0) {
      this.gameManager.hud.showNotification(`Ungarrisoned all ${count} units from Transport Ship!`);
      if (this.selected) {
        this.gameManager.hud.updateSelectionUI();
      }
    }
    this.gameManager.soundManager.playClickSound('complete');
  }

  distanceToLine(p, a, b) {
    const ab = new THREE.Vector3().subVectors(b, a);
    const ap = new THREE.Vector3().subVectors(p, a);
    const abLenSq = ab.lengthSq();
    if (abLenSq === 0) return ap.length();
    let t = ap.dot(ab) / abLenSq;
    t = Math.max(0, Math.min(1, t));
    const projection = a.clone().addScaledVector(ab, t);
    return p.distanceTo(projection);
  }
}
