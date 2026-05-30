import * as THREE from 'three';

export const CIVILIZATIONS = {
  inggris: {
    name: 'Inggris',
    icon: '🏰',
    bonuses: ['Jarak serang Archer +1', 'Kecepatan tebang kayu +20%'],
    limitations: ['Kecepatan gerak Infantri -10%'],
    modifiers: { archerRange: 1.0, gatherWood: 1.2, speedInfantry: 0.9, hpCavalry: 1.0, hpInfantry: 1.0, buildSpeed: 1.0 }
  },
  prancis: {
    name: 'Prancis',
    icon: '⚔️',
    bonuses: ['HP Kavaleri +20%', 'Harga Barracks -25%'],
    limitations: ['Harga melatih Villager +15%'],
    modifiers: { hpCavalry: 1.2, costBarracks: 0.75, costVillager: 1.15, gatherWood: 1.0, speedInfantry: 1.0, buildSpeed: 1.0 }
  },
  mongol: {
    name: 'Mongol',
    icon: '🐎',
    bonuses: ['Kecepatan gerak Kavaleri +15%', 'Kecepatan kumpul Food +20%'],
    limitations: ['HP Bangunan -15%'],
    modifiers: { speedCavalry: 1.15, gatherFood: 1.2, hpBuilding: 0.85, gatherWood: 1.0, speedInfantry: 1.0, buildSpeed: 1.0 }
  },
  jepang: {
    name: 'Jepang',
    icon: '⛩️',
    bonuses: ['Kecepatan serang Infantri +15%', 'Harga dropoff kayu -50%'],
    limitations: ['HP Kavaleri -15%'],
    modifiers: { attackSpeedInfantry: 1.15, costWoodDropoff: 0.5, hpCavalry: 0.85, gatherWood: 1.0, speedInfantry: 1.0, buildSpeed: 1.0 }
  },
  tiongkok: {
    name: 'Tiongkok',
    icon: '🐉',
    bonuses: ['Mulai game dengan +2 Villagers', 'Biaya riset teknologi -15%'],
    limitations: ['Sumber daya awal dikurangi (-50 Food)'],
    modifiers: { startVillagers: 2, techCost: 0.85, startFood: -50, gatherWood: 1.0, speedInfantry: 1.0, buildSpeed: 1.0 }
  },
  saracen: {
    name: 'Saracen',
    icon: '🐫',
    bonuses: ['Bonus serang Camel +3', 'Nilai jual beli market stabil (trade +20%)'],
    limitations: ['Kecepatan kumpul kayu -10%'],
    modifiers: { camelAttack: 3, tradeRate: 1.2, gatherWood: 0.9, speedInfantry: 1.0, buildSpeed: 1.0 }
  },
  spanyol: {
    name: 'Spanyol',
    icon: '🇪🇸',
    bonuses: ['Kecepatan mendirikan bangunan +30%', 'Damage unit senjata api +15%'],
    limitations: ['Waktu latih semua unit +10%'],
    modifiers: { buildSpeed: 1.3, gunpowderDamage: 1.15, trainTime: 1.1, gatherWood: 1.0, speedInfantry: 1.0 }
  },
  viking: {
    name: 'Viking',
    icon: '⛵',
    bonuses: ['HP Infantri +15%', 'Harga kapal & bangunan air -20%'],
    limitations: ['Tidak bisa melatih Kavaleri berat'],
    modifiers: { hpInfantry: 1.15, costDock: 0.8, gatherWood: 1.0, speedInfantry: 1.0, buildSpeed: 1.0 }
  },
  bizantium: {
    name: 'Bizantium',
    icon: '🛡️',
    bonuses: ['HP Bangunan +25%', 'Harga unit penangkal (Spearman) -25%'],
    limitations: ['Biaya naik zaman +15%'],
    modifiers: { hpBuilding: 1.25, costSpearman: 0.75, ageUpCost: 1.15, gatherWood: 1.0, speedInfantry: 1.0, buildSpeed: 1.0 }
  },
  persia: {
    name: 'Persia',
    icon: '🐘',
    bonuses: ['Pusat kota melatih Villager +15% cepat', 'Mulai dengan +50 Wood & Food'],
    limitations: ['Biaya riset teknologi +15%'],
    modifiers: { trainSpeedVillager: 1.15, startWood: 50, startFood: 50, techCost: 1.15, gatherWood: 1.0, speedInfantry: 1.0, buildSpeed: 1.0 }
  },
  aztec: {
    name: 'Aztec',
    icon: '🐆',
    bonuses: ['Melatih unit militer +15% cepat', 'Kargo resource Villager +2'],
    limitations: ['Tidak bisa melatih Kavaleri'],
    modifiers: { trainSpeedMilitary: 1.15, cargoSize: 2, gatherWood: 1.0, speedInfantry: 1.0, buildSpeed: 1.0 }
  },
  maya: {
    name: 'Maya',
    icon: '🏹',
    bonuses: ['Harga Archer -10% di Feudal, -20% di Castle', 'Sumber daya alam bertahan +15% lama'],
    limitations: ['Attack unit infantri -10%'],
    modifiers: { costArcher: 0.8, resourceDurability: 1.15, damageInfantry: 0.9, gatherWood: 1.0, speedInfantry: 1.0, buildSpeed: 1.0 }
  },
  hun: {
    name: 'Hun',
    icon: '⛺',
    bonuses: ['Tidak perlu mendirikan rumah (Pop 100 langsung)', 'Harga Archer berkuda -15%'],
    limitations: ['HP Dinding & Gerbang pertahanan -25%'],
    modifiers: { noHouses: true, costHorseArcher: 0.85, hpWall: 0.75, gatherWood: 1.0, speedInfantry: 1.0, buildSpeed: 1.0 }
  },
  turki: {
    name: 'Turki',
    icon: '💣',
    bonuses: ['HP unit bubuk mesiu +25%', 'Riset kimia (chemistry) gratis'],
    limitations: ['Kecepatan kumpul batu (stone) -15%'],
    modifiers: { hpGunpowder: 1.25, freeChemistry: true, gatherStone: 0.85, gatherWood: 1.0, speedInfantry: 1.0, buildSpeed: 1.0 }
  },
  kelt: {
    name: 'Kelt',
    icon: '☘️',
    bonuses: ['Kecepatan gerak Infantri +15%', 'Kecepatan tembak senjata kepung +20%'],
    limitations: ['Akurasi Archer berkurang -10%'],
    modifiers: { speedInfantry: 1.15, fireRateSiege: 1.2, accuracyArcher: 0.9, gatherWood: 1.0, buildSpeed: 1.0 }
  },
  goth: {
    name: 'Goth',
    icon: '🧟',
    bonuses: ['Harga unit infantri -30%', 'Kecepatan melatih infantri +20%'],
    limitations: ['Tidak bisa membuat dinding batu'],
    modifiers: { costInfantry: 0.7, trainSpeedInfantry: 1.2, noStoneWalls: true, gatherWood: 1.0, speedInfantry: 1.0, buildSpeed: 1.0 }
  },
  teuton: {
    name: 'Teuton',
    icon: '🛡️',
    bonuses: ['Infantri memiliki armor pertahanan +2', 'Teknologi pertanian gratis'],
    limitations: ['Kecepatan gerak senjata kepung -15%'],
    modifiers: { armorInfantry: 2, freeFarms: true, speedSiege: 0.85, gatherWood: 1.0, speedInfantry: 1.0, buildSpeed: 1.0 }
  }
};

export class ModelFactory {
  constructor() {
    this.materials = {};
    this.initSharedMaterials();
  }

  initSharedMaterials() {
    // Standard materials used across models
    this.materials.trunk = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9, flatShading: true });
    this.materials.leaves1 = new THREE.MeshStandardMaterial({ color: 0x2e5c1e, roughness: 0.8, flatShading: true });
    this.materials.leaves2 = new THREE.MeshStandardMaterial({ color: 0x3d7a29, roughness: 0.8, flatShading: true });
    this.materials.rock = new THREE.MeshStandardMaterial({ color: 0x7a7a7a, roughness: 0.8, flatShading: true });
    this.materials.goldCrystal = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.15,
      flatShading: true
    });
    
    // Team materials
    this.materials.playerBlue = new THREE.MeshStandardMaterial({ color: 0x1a5fb4, roughness: 0.5, flatShading: true });
    this.materials.enemyRed = new THREE.MeshStandardMaterial({ color: 0xc01c28, roughness: 0.5, flatShading: true });
    this.materials.allyGreen = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.5, flatShading: true });
    this.materials.neutralGrey = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.6, flatShading: true });
    
    // Unit skin/leather
    this.materials.skin = new THREE.MeshStandardMaterial({ color: 0xffcc99, roughness: 0.6, flatShading: true });
    this.materials.clothes = new THREE.MeshStandardMaterial({ color: 0x865c36, roughness: 0.8, flatShading: true });
    this.materials.iron = new THREE.MeshStandardMaterial({ color: 0xa0a0a0, metalness: 0.8, roughness: 0.3, flatShading: true });
    this.materials.goldMetal = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.15, flatShading: true });
    
    // Age textures/materials configurations
    this.materials.woodDark = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.85, flatShading: true });
    this.materials.woodFeudal = new THREE.MeshStandardMaterial({ color: 0xa07040, roughness: 0.8, flatShading: true });
    this.materials.stoneCastle = new THREE.MeshStandardMaterial({ color: 0x909090, roughness: 0.75, flatShading: true });
    this.materials.marbleImperial = new THREE.MeshStandardMaterial({ color: 0xeaeaea, roughness: 0.4, metalness: 0.1, flatShading: true });
    
    this.materials.roofDark = new THREE.MeshStandardMaterial({ color: 0xe08b2b, roughness: 0.9, flatShading: true }); // thatched
    this.materials.roofFeudal = new THREE.MeshStandardMaterial({ color: 0xc85a32, roughness: 0.8, flatShading: true }); // tile
    this.materials.roofCastle = new THREE.MeshStandardMaterial({ color: 0x4f6472, roughness: 0.8, flatShading: true }); // slate
    
    // VFX/Indicators
    this.materials.blueprint = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.4,
      wireframe: true
    });
  }

  getTeamMaterial(playerId) {
    if (playerId === 0) return this.materials.playerBlue;
    if (playerId === 1) return this.materials.enemyRed;
    if (playerId === 2) return this.materials.allyGreen;
    return this.materials.neutralGrey;
  }

  // -------------------------------------------------------------
  // RESOURCE MODELS
  // -------------------------------------------------------------
  createResourceMesh(type, healthRatio = 1.0) {
    const group = new THREE.Group();
    group.castShadow = true;
    group.receiveShadow = true;

    if (type === 'wood') {
      // Create stylized pine tree
      const trunkGeom = new THREE.CylinderGeometry(0.15, 0.25, 1.2, 5);
      const trunk = new THREE.Mesh(trunkGeom, this.materials.trunk);
      trunk.position.y = 0.6;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      group.add(trunk);

      // 3 layers of foliage (cones)
      const foliageHeights = [1.2, 1.0, 0.8];
      const foliageRadii = [0.8, 0.65, 0.5];
      const foliageOffsets = [1.4, 2.1, 2.7];
      
      for (let i = 0; i < 3; i++) {
        const leafGeom = new THREE.ConeGeometry(foliageRadii[i], foliageHeights[i], 5);
        const leafMat = i % 2 === 0 ? this.materials.leaves1 : this.materials.leaves2;
        const leaves = new THREE.Mesh(leafGeom, leafMat);
        leaves.position.y = foliageOffsets[i];
        // randomize rotation slightly for organic look
        leaves.rotation.y = i * 0.45;
        leaves.castShadow = true;
        leaves.receiveShadow = true;
        group.add(leaves);
      }
    } 
    else if (type === 'gold') {
      // Central grey rock base
      const baseGeom = new THREE.DodecahedronGeometry(0.8);
      const base = new THREE.Mesh(baseGeom, this.materials.rock);
      base.position.y = 0.4;
      base.scale.set(1.2, 0.7, 1.2);
      base.castShadow = true;
      base.receiveShadow = true;
      group.add(base);

      // Gold crystals popping out
      const crystalPositions = [
        { pos: [0.4, 0.6, 0.3], rot: [0.5, 0.2, 0.3], scale: [0.25, 0.5, 0.25] },
        { pos: [-0.4, 0.5, -0.3], rot: [-0.6, 0.5, -0.4], scale: [0.2, 0.45, 0.2] },
        { pos: [0.1, 0.8, -0.4], rot: [-0.2, 0.8, 0.8], scale: [0.25, 0.5, 0.25] },
        { pos: [-0.3, 0.6, 0.4], rot: [0.4, -0.5, -0.7], scale: [0.18, 0.4, 0.18] },
        { pos: [0.5, 0.3, -0.2], rot: [0.8, 0.1, 0.5], scale: [0.22, 0.4, 0.22] }
      ];

      crystalPositions.forEach(cfg => {
        const cryGeom = new THREE.OctahedronGeometry(1);
        const cry = new THREE.Mesh(cryGeom, this.materials.goldCrystal);
        cry.position.set(...cfg.pos);
        cry.rotation.set(...cfg.rot);
        cry.scale.set(...cfg.scale);
        cry.castShadow = true;
        group.add(cry);
      });
    } 
    else if (type === 'stone') {
      // Cluster of grey rocks
      const rockConfigs = [
        { pos: [0, 0.4, 0], scale: [0.75, 0.55, 0.75], rot: [0.2, 0.5, 0.1] },
        { pos: [0.4, 0.25, 0.3], scale: [0.45, 0.35, 0.45], rot: [-0.4, 0.2, 0.8] },
        { pos: [-0.4, 0.3, -0.2], scale: [0.5, 0.4, 0.55], rot: [0.6, -0.3, 0.2] },
        { pos: [0.1, 0.2, -0.5], scale: [0.4, 0.3, 0.4], rot: [0.1, 0.9, -0.4] }
      ];

      rockConfigs.forEach(cfg => {
        const rockGeom = new THREE.DodecahedronGeometry(1);
        const rock = new THREE.Mesh(rockGeom, this.materials.rock);
        rock.position.set(...cfg.pos);
        rock.scale.set(...cfg.scale);
        rock.rotation.set(...cfg.rot);
        rock.castShadow = true;
        rock.receiveShadow = true;
        group.add(rock);
      });
    }

    return group;
  }

  // -------------------------------------------------------------
  // UNIT MODELS
  // -------------------------------------------------------------
  createUnitMesh(type, playerId, age = 'dark') {
    const group = new THREE.Group();
    const teamMat = this.getTeamMaterial(playerId);
    
    // Root anchor for unit rotation & animation scaling
    const bodyGroup = new THREE.Group();
    bodyGroup.name = "bodyGroup";
    group.add(bodyGroup);

    // Legs/Feet
    const footGeom = new THREE.BoxGeometry(0.18, 0.12, 0.25);
    const leftFoot = new THREE.Mesh(footGeom, this.materials.clothes);
    leftFoot.name = "leftFoot";
    leftFoot.position.set(-0.2, 0.06, 0);
    leftFoot.castShadow = true;
    bodyGroup.add(leftFoot);

    const rightFoot = leftFoot.clone();
    rightFoot.name = "rightFoot";
    rightFoot.position.x = 0.2;
    bodyGroup.add(rightFoot);

    // Torso (Main Body)
    const torsoGeom = new THREE.CylinderGeometry(0.28, 0.22, 0.7, 6);
    const torso = new THREE.Mesh(torsoGeom, teamMat);
    torso.position.y = 0.48;
    torso.castShadow = true;
    torso.receiveShadow = true;
    bodyGroup.add(torso);

    // Head
    const headGeom = new THREE.SphereGeometry(0.2, 8, 8);
    const head = new THREE.Mesh(headGeom, this.materials.skin);
    head.position.y = 0.95;
    head.castShadow = true;
    bodyGroup.add(head);

    if (type === 'villager') {
      // Brown belt
      const beltGeom = new THREE.CylinderGeometry(0.29, 0.29, 0.08, 6);
      const belt = new THREE.Mesh(beltGeom, this.materials.clothes);
      belt.position.y = 0.35;
      bodyGroup.add(belt);

      // Tool holding hand (Right arm)
      const armGroup = new THREE.Group();
      armGroup.name = "rightArm";
      armGroup.position.set(0.35, 0.55, 0);
      
      const armGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 4);
      const arm = new THREE.Mesh(armGeom, this.materials.clothes);
      arm.position.y = -0.15;
      armGroup.add(arm);

      // The Tool (Axe/Pickaxe combo)
      const toolGroup = new THREE.Group();
      toolGroup.name = "tool";
      toolGroup.position.set(0, -0.3, 0.1);
      toolGroup.rotation.x = Math.PI / 2; // point forward
      
      // Handle (shaft)
      const shaftGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 4);
      const shaft = new THREE.Mesh(shaftGeom, this.materials.woodDark);
      shaft.rotation.x = Math.PI / 2;
      toolGroup.add(shaft);
      
      // Iron axe head (Golden tool in Imperial Age!)
      const headGeom = new THREE.BoxGeometry(0.12, 0.25, 0.35);
      const toolMat = age === 'imperial' ? this.materials.goldMetal : this.materials.iron;
      const axeHead = new THREE.Mesh(headGeom, toolMat);
      axeHead.position.set(0, 0, 0.3);
      toolGroup.add(axeHead);

      armGroup.add(toolGroup);
      bodyGroup.add(armGroup);
    } 
    else if (type === 'priest') {
      // Robes lower trim
      const robeTrimGeom = new THREE.CylinderGeometry(0.34, 0.38, 0.2, 6);
      const robeTrim = new THREE.Mesh(robeTrimGeom, this.materials.woodDark);
      robeTrim.position.y = 0.12;
      robeTrim.castShadow = true;
      bodyGroup.add(robeTrim);

      // Priest Hood/Cowl
      const hoodGeom = new THREE.SphereGeometry(0.24, 8, 8);
      const hood = new THREE.Mesh(hoodGeom, this.materials.clothes);
      hood.position.set(0, 0.98, -0.05);
      bodyGroup.add(hood);

      // Right arm with Staff
      const armGroup = new THREE.Group();
      armGroup.name = "rightArm";
      armGroup.position.set(0.35, 0.55, 0);
      
      const armGeom = new THREE.CylinderGeometry(0.07, 0.07, 0.4, 4);
      const arm = new THREE.Mesh(armGeom, this.materials.clothes);
      arm.position.y = -0.15;
      armGroup.add(arm);

      // Staff (Religious Relic)
      const staffGroup = new THREE.Group();
      staffGroup.name = "tool";
      staffGroup.position.set(0, -0.2, 0.1);
      staffGroup.rotation.x = Math.PI / 2.2; // point forward-up
      
      // Handle (shaft)
      const shaftGeom = new THREE.CylinderGeometry(0.03, 0.03, 1.2, 4);
      const shaft = new THREE.Mesh(shaftGeom, this.materials.woodDark);
      shaft.rotation.x = Math.PI / 2;
      staffGroup.add(shaft);
      
      // Holy Relic / Cross
      const crossVertGeom = new THREE.BoxGeometry(0.06, 0.35, 0.06);
      const relicMat = age === 'imperial' ? this.materials.goldMetal : this.materials.goldCrystal;
      const crossVert = new THREE.Mesh(crossVertGeom, relicMat);
      crossVert.position.set(0, 0, 0.65);
      staffGroup.add(crossVert);

      const crossHorizGeom = new THREE.BoxGeometry(0.22, 0.06, 0.06);
      const crossHoriz = new THREE.Mesh(crossHorizGeom, relicMat);
      crossHoriz.position.set(0, 0, 0.72);
      staffGroup.add(crossHoriz);

      armGroup.add(staffGroup);
      bodyGroup.add(armGroup);
    }
    else if (type === 'trader') {
      // Small trade barrow cart pushed in front of trader
      const cartGroup = new THREE.Group();
      cartGroup.name = "cart";
      cartGroup.position.set(0, 0.2, 0.55);
      
      // Wood box container
      const boxGeom = new THREE.BoxGeometry(0.55, 0.35, 0.65);
      const box = new THREE.Mesh(boxGeom, this.materials.woodDark);
      box.castShadow = true;
      cartGroup.add(box);
      
      // Gold crystals/bags representing cargo
      const cargoGeom = new THREE.BoxGeometry(0.42, 0.25, 0.25);
      const cargo = new THREE.Mesh(cargoGeom, this.materials.goldCrystal);
      cargo.position.set(0, 0.18, 0.1);
      cartGroup.add(cargo);

      const cargo2Geom = new THREE.BoxGeometry(0.38, 0.2, 0.2);
      const cargo2 = new THREE.Mesh(cargo2Geom, this.materials.clothes); // sacks
      cargo2.position.set(0, 0.16, -0.15);
      cartGroup.add(cargo2);

      // Cart Wheels (2 cylinders)
      const wheelGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.08, 8);
      wheelGeom.rotateZ(Math.PI / 2);
      const wheelL = new THREE.Mesh(wheelGeom, this.materials.rock);
      wheelL.position.set(-0.33, -0.1, 0);
      cartGroup.add(wheelL);

      const wheelR = wheelL.clone();
      wheelR.position.x = 0.33;
      cartGroup.add(wheelR);

      // Flag banner
      const flagPoleGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.6, 4);
      const flagPole = new THREE.Mesh(flagPoleGeom, this.materials.woodDark);
      flagPole.position.set(0.24, 0.15, -0.22);
      cartGroup.add(flagPole);

      const flagGeom = new THREE.BoxGeometry(0.25, 0.16, 0.02);
      const flag = new THREE.Mesh(flagGeom, teamMat);
      flag.position.set(0.24, 0.42, -0.1);
      cartGroup.add(flag);

      bodyGroup.add(cartGroup);

      // Pushing arm gestures
      const armGroup = new THREE.Group();
      armGroup.name = "rightArm";
      armGroup.position.set(0.35, 0.5, 0);
      
      const armGeom = new THREE.CylinderGeometry(0.07, 0.07, 0.4, 4);
      const arm = new THREE.Mesh(armGeom, this.materials.clothes);
      arm.position.set(0, -0.1, 0.2);
      arm.rotation.x = Math.PI / 3;
      armGroup.add(arm);
      bodyGroup.add(armGroup);
    } 
    else if (type === 'swordsman') {
      // Chestplate (Metal/Iron - gets shiny gold in Imperial Age!)
      const armorGeom = new THREE.CylinderGeometry(0.3, 0.25, 0.45, 6);
      const armorMat = age === 'imperial' ? this.materials.goldMetal : (age === 'castle' ? this.materials.iron : this.materials.clothes);
      const armor = new THREE.Mesh(armorGeom, armorMat);
      armor.position.y = 0.55;
      armor.castShadow = true;
      bodyGroup.add(armor);

      // Metal Helmet
      if (age !== 'dark') {
        const helmGeom = new THREE.CylinderGeometry(0.22, 0.22, 0.15, 6);
        const helm = new THREE.Mesh(helmGeom, age === 'imperial' ? this.materials.goldMetal : this.materials.iron);
        helm.position.y = 1.05;
        helm.castShadow = true;
        bodyGroup.add(helm);

        // Helmet Crest (Plume)
        const plumeGeom = new THREE.BoxGeometry(0.06, 0.18, 0.3);
        const plume = new THREE.Mesh(plumeGeom, teamMat);
        plume.position.set(0, 1.18, -0.05);
        bodyGroup.add(plume);
      }

      // Right Arm with Sword
      const rightArm = new THREE.Group();
      rightArm.name = "rightArm";
      rightArm.position.set(0.38, 0.55, 0);

      const armGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 4);
      const armMat = age === 'dark' ? this.materials.clothes : this.materials.iron;
      const arm = new THREE.Mesh(armGeom, armMat);
      arm.position.y = -0.15;
      rightArm.add(arm);

      // Sword Group
      const sword = new THREE.Group();
      sword.name = "weapon";
      sword.position.set(0, -0.35, 0.05);
      sword.rotation.x = Math.PI / 2.2; // hold forward-up

      // Guard
      const guardGeom = new THREE.BoxGeometry(0.25, 0.05, 0.07);
      const guard = new THREE.Mesh(guardGeom, this.materials.woodDark);
      sword.add(guard);

      // Blade (Swordsman gets a bigger sword in higher ages!)
      const bladeLength = age === 'imperial' ? 1.35 : (age === 'castle' ? 1.15 : 0.95);
      const bladeGeom = new THREE.BoxGeometry(0.08, 0.03, bladeLength);
      const bladeMat = age === 'imperial' ? this.materials.goldMetal : this.materials.iron;
      const blade = new THREE.Mesh(bladeGeom, bladeMat);
      blade.position.z = bladeLength / 2;
      blade.castShadow = true;
      sword.add(blade);

      rightArm.add(sword);
      bodyGroup.add(rightArm);

      // Left Arm with Shield (if not Dark Age)
      if (age !== 'dark') {
        const leftArm = new THREE.Group();
        leftArm.name = "leftArm";
        leftArm.position.set(-0.38, 0.55, 0);
        
        const lArm = new THREE.Mesh(armGeom, this.materials.iron);
        lArm.position.y = -0.15;
        leftArm.add(lArm);

        // Round Shield for Feudal, Heater Shield for Castle/Imperial
        let shieldGeom;
        if (age === 'feudal') {
          shieldGeom = new THREE.CylinderGeometry(0.38, 0.38, 0.05, 8);
          shieldGeom.rotateZ(Math.PI / 2);
        } else {
          // Shield shape approximated by box
          shieldGeom = new THREE.BoxGeometry(0.1, 0.7, 0.5);
        }
        
        const shield = new THREE.Mesh(shieldGeom, teamMat);
        shield.position.set(-0.15, -0.15, 0.1);
        shield.castShadow = true;
        
        // Metallic center boss
        const bossGeom = new THREE.SphereGeometry(0.12, 6, 6);
        const boss = new THREE.Mesh(bossGeom, age === 'imperial' ? this.materials.goldMetal : this.materials.iron);
        boss.position.x = -0.03; // protrude outwards
        shield.add(boss);

        leftArm.add(shield);
        bodyGroup.add(leftArm);
      }
    }

    return group;
  }

  // -------------------------------------------------------------
  // BUILDING MODELS
  // -------------------------------------------------------------
  createBuildingMesh(type, playerId, age = 'dark') {
    const group = new THREE.Group();
    const teamMat = this.getTeamMaterial(playerId);

    // Select materials based on Age
    let woodMat, wallMat, roofMat, foundationMat;
    if (age === 'dark') {
      woodMat = this.materials.woodDark;
      wallMat = this.materials.woodDark;
      roofMat = this.materials.roofDark;
      foundationMat = this.materials.rock;
    } else if (age === 'feudal') {
      woodMat = this.materials.woodFeudal;
      wallMat = this.materials.woodFeudal;
      roofMat = this.materials.roofFeudal;
      foundationMat = this.materials.rock;
    } else if (age === 'castle') {
      woodMat = this.materials.woodFeudal;
      wallMat = this.materials.stoneCastle;
      roofMat = this.materials.roofCastle;
      foundationMat = this.materials.stoneCastle;
    } else { // imperial
      woodMat = this.materials.marbleImperial;
      wallMat = this.materials.marbleImperial;
      roofMat = this.materials.goldMetal;
      foundationMat = this.materials.marbleImperial;
    }

    if (type === 'townCenter') {
      // Large stone foundation
      const foundationGeom = new THREE.BoxGeometry(4.2, 0.4, 4.2);
      const foundation = new THREE.Mesh(foundationGeom, foundationMat);
      foundation.position.y = 0.2;
      foundation.receiveShadow = true;
      foundation.castShadow = true;
      group.add(foundation);

      // Main building block
      const houseGeom = new THREE.BoxGeometry(3.0, 1.6, 3.0);
      const house = new THREE.Mesh(houseGeom, wallMat);
      house.position.y = 1.2;
      house.castShadow = true;
      house.receiveShadow = true;
      group.add(house);

      // Roof (Cone / Pyramid)
      const roofGeom = new THREE.ConeGeometry(2.4, 1.8, 4);
      roofGeom.rotateY(Math.PI / 4); // align corners with box
      const roof = new THREE.Mesh(roofGeom, roofMat);
      roof.position.y = 2.9;
      roof.castShadow = true;
      group.add(roof);

      // Stone Chimney (Marble chimney for Imperial Age!)
      const chimneyGeom = new THREE.BoxGeometry(0.5, 1.5, 0.5);
      const chimney = new THREE.Mesh(chimneyGeom, foundationMat);
      chimney.position.set(0.9, 2.2, 0.9);
      chimney.castShadow = true;
      group.add(chimney);

      // Flagpole
      const poleGeom = new THREE.CylinderGeometry(0.06, 0.06, 3.5, 4);
      const pole = new THREE.Mesh(poleGeom, woodMat);
      pole.position.set(-1.1, 2.0, -1.1);
      pole.castShadow = true;
      group.add(pole);

      // Flag banner (waving look)
      const flagGeom = new THREE.BoxGeometry(0.8, 0.45, 0.05);
      const flag = new THREE.Mesh(flagGeom, teamMat);
      flag.position.set(-0.7, 3.3, -1.1);
      flag.castShadow = true;
      group.add(flag);
      
      // Campfire decorative details
      const fireBaseGeom = new THREE.RingGeometry(0.3, 0.45, 8);
      fireBaseGeom.rotateX(-Math.PI/2);
      const fireRocks = new THREE.Mesh(fireBaseGeom, foundationMat);
      fireRocks.position.set(1.4, 0.41, -1.4);
      group.add(fireRocks);

      const embersGeom = new THREE.ConeGeometry(0.2, 0.4, 4);
      const embers = new THREE.Mesh(embersGeom, new THREE.MeshBasicMaterial({ color: 0xff4500 }));
      embers.position.set(1.4, 0.6, -1.4);
      group.add(embers);
    } 
    else if (type === 'barracks') {
      // Dirt arena floor
      const arenaGeom = new THREE.BoxGeometry(3.5, 0.2, 3.5);
      const arena = new THREE.Mesh(arenaGeom, this.materials.clothes); // brown
      arena.position.y = 0.1;
      arena.receiveShadow = true;
      group.add(arena);

      // Wooden/Stone Training Hall (back of the area)
      const hallGeom = new THREE.BoxGeometry(2.4, 1.4, 1.8);
      const hall = new THREE.Mesh(hallGeom, wallMat);
      hall.position.set(0, 0.8, -0.6);
      hall.castShadow = true;
      hall.receiveShadow = true;
      group.add(hall);

      // Sloped Roof
      const roofGeom = new THREE.BoxGeometry(2.6, 0.2, 2.2);
      const roof = new THREE.Mesh(roofGeom, roofMat);
      roof.position.set(0, 1.6, -0.6);
      roof.rotation.x = 0.25; // tilt forward
      roof.castShadow = true;
      group.add(roof);

      // Waving Military banner/pole
      const poleGeom = new THREE.CylinderGeometry(0.05, 0.05, 2.2, 4);
      const pole = new THREE.Mesh(poleGeom, woodMat);
      pole.position.set(1.2, 1.1, 1.2);
      pole.castShadow = true;
      group.add(pole);

      const bannerGeom = new THREE.BoxGeometry(0.05, 0.8, 0.4);
      const banner = new THREE.Mesh(bannerGeom, teamMat);
      banner.position.set(1.2, 1.7, 1.0);
      banner.castShadow = true;
      group.add(banner);

      // Archery/Sword Practice Target
      const dummyPoleGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 4);
      const dPole = new THREE.Mesh(dummyPoleGeom, woodMat);
      dPole.position.set(-1.0, 0.5, 0.8);
      group.add(dPole);

      const targetGeom = new THREE.BoxGeometry(0.4, 0.4, 0.1);
      const target = new THREE.Mesh(targetGeom, teamMat);
      target.position.set(-1.0, 0.8, 0.8);
      target.rotation.y = Math.PI / 4;
      target.castShadow = true;
      group.add(target);
    } 
    else if (type === 'house') {
      // Small cottage base
      const baseGeom = new THREE.BoxGeometry(1.8, 1.0, 1.8);
      const base = new THREE.Mesh(baseGeom, wallMat);
      base.position.y = 0.5;
      base.castShadow = true;
      base.receiveShadow = true;
      group.add(base);

      // Roof
      const roofGeom = new THREE.ConeGeometry(1.5, 1.0, 4);
      roofGeom.rotateY(Math.PI / 4);
      const roof = new THREE.Mesh(roofGeom, roofMat);
      roof.position.y = 1.5;
      roof.castShadow = true;
      group.add(roof);

      // Tiny team flag on roof
      const flagGeom = new THREE.BoxGeometry(0.2, 0.15, 0.02);
      const flag = new THREE.Mesh(flagGeom, teamMat);
      flag.position.set(0, 2.1, 0);
      group.add(flag);
      
      const smallPoleGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 4);
      const sPole = new THREE.Mesh(smallPoleGeom, woodMat);
      sPole.position.set(0, 1.9, 0);
      group.add(sPole);
    }
    else if (type === 'temple') {
      // Stone foundation
      const foundationGeom = new THREE.BoxGeometry(3.2, 0.3, 3.2);
      const foundation = new THREE.Mesh(foundationGeom, foundationMat);
      foundation.position.y = 0.15;
      foundation.receiveShadow = true;
      foundation.castShadow = true;
      group.add(foundation);

      // Main hall block
      const hallGeom = new THREE.BoxGeometry(2.2, 1.8, 2.2);
      const hall = new THREE.Mesh(hallGeom, wallMat);
      hall.position.y = 1.05;
      hall.castShadow = true;
      hall.receiveShadow = true;
      group.add(hall);

      // Steeples / Spire
      const spireGeom = new THREE.ConeGeometry(1.4, 2.6, 6);
      const spire = new THREE.Mesh(spireGeom, roofMat);
      spire.position.y = 3.25;
      spire.castShadow = true;
      group.add(spire);

      // Golden Cross / Relic on top
      const crossVertGeom = new THREE.BoxGeometry(0.06, 0.6, 0.06);
      const relicMat = age === 'imperial' ? this.materials.goldMetal : this.materials.goldCrystal;
      const crossVert = new THREE.Mesh(crossVertGeom, relicMat);
      crossVert.position.set(0, 4.85, 0);
      crossVert.castShadow = true;
      group.add(crossVert);

      const crossHorizGeom = new THREE.BoxGeometry(0.4, 0.06, 0.06);
      const crossHoriz = new THREE.Mesh(crossHorizGeom, relicMat);
      crossHoriz.position.set(0, 4.95, 0);
      crossHoriz.castShadow = true;
      group.add(crossHoriz);

      // Entrance pillars
      const pillarGeom = new THREE.CylinderGeometry(0.12, 0.12, 1.4, 5);
      const p1 = new THREE.Mesh(pillarGeom, foundationMat);
      p1.position.set(0.9, 0.85, 1.2);
      p1.castShadow = true;
      group.add(p1);

      const p2 = p1.clone();
      p2.position.x = -0.9;
      group.add(p2);
    }
    else if (type === 'market') {
      // Dirt/Stone marketplace base
      const baseGeom = new THREE.BoxGeometry(3.2, 0.15, 3.2);
      const baseMat = this.materials.clothes; // brown dirt
      const base = new THREE.Mesh(baseGeom, baseMat);
      base.position.y = 0.08;
      base.receiveShadow = true;
      group.add(base);

      // 4 Wooden columns
      const postGeom = new THREE.CylinderGeometry(0.08, 0.08, 1.4, 4);
      const postMat = woodMat;
      
      const postPositions = [
        [-1.2, 0.7, -1.2],
        [1.2, 0.7, -1.2],
        [-1.2, 0.7, 1.2],
        [1.2, 0.7, 1.2]
      ];
      postPositions.forEach(pos => {
        const post = new THREE.Mesh(postGeom, postMat);
        post.position.set(...pos);
        post.castShadow = true;
        group.add(post);
      });

      // Striped/Colorful Canopy Roof (using team material)
      const canopyGeom = new THREE.BoxGeometry(3.0, 0.25, 2.8);
      const canopy = new THREE.Mesh(canopyGeom, teamMat);
      canopy.position.set(0, 1.45, 0);
      canopy.castShadow = true;
      group.add(canopy);

      // Decorative Crates & Barrels under canopy
      const crateGeom = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      const crateMat = this.materials.woodDark;
      const crate1 = new THREE.Mesh(crateGeom, crateMat);
      crate1.position.set(-0.5, 0.35, -0.4);
      crate1.rotation.y = 0.2;
      crate1.castShadow = true;
      group.add(crate1);

      const crate2 = new THREE.Mesh(crateGeom, crateMat);
      crate2.position.set(-0.6, 0.35, 0.3);
      crate2.rotation.y = -0.45;
      crate2.castShadow = true;
      group.add(crate2);

      const barrelGeom = new THREE.CylinderGeometry(0.24, 0.28, 0.65, 6);
      const barrel = new THREE.Mesh(barrelGeom, this.materials.clothes);
      barrel.position.set(0.6, 0.42, 0.1);
      barrel.castShadow = true;
      group.add(barrel);
    }

    return group;
  }
}
