import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
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
  },
  roma: {
    name: 'Roma',
    icon: '🏛️',
    bonuses: ['HP Watchtower +20%', 'Armor Infantri +1 di setiap Age'],
    limitations: ['Harga melatih Archer berkuda +20%'],
    modifiers: { hpBuilding: 1.2, armorInfantry: 1, costHorseArcher: 1.2, gatherWood: 1.0, speedInfantry: 1.0, buildSpeed: 1.0 }
  }
};

export class ModelFactory {
  constructor() {
    this.materials = {};
    this.initSharedMaterials();
    
    // External Asset Loading Infrastructure
    this.gltfLoader = new GLTFLoader();
    this.loadedModels = {}; // Cache to prevent reloading same file
  }

  // Load external 3D models (.glb / .gltf)
  // Usage: this.loadExternalModel('/assets/models/samurai.glb').then(model => scene.add(model))
  async loadExternalModel(url) {
    if (this.loadedModels[url]) {
      return this.loadedModels[url].clone();
    }
    
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (gltf) => {
          const model = gltf.scene;
          
          // Enable shadows for all meshes in the model
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          
          this.loadedModels[url] = model;
          resolve(model.clone());
        },
        undefined, // progress callback
        (error) => {
          console.error(`Failed to load 3D model from ${url}`, error);
          reject(error);
        }
      );
    });
  }

  createProceduralTexture(type) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    
    // Use 256x256 for detailed natural textures
    if (['bark', 'leaves', 'oakLeaves', 'sakura'].includes(type)) {
      canvas.width = 256;
      canvas.height = 256;
    }
    const ctx = canvas.getContext('2d');
    
    if (type === 'bark') {
      // Wood bark pattern: vertical fibrous textures
      ctx.fillStyle = '#4a2f1b'; // Base dark brown
      ctx.fillRect(0, 0, 256, 256);
      
      // Draw vertical cracks/crevices
      for (let i = 0; i < 80; i++) {
        const x = Math.random() * 256;
        const w = 2 + Math.random() * 6;
        ctx.fillStyle = Math.random() < 0.5 ? '#26170d' : '#5c3a21';
        ctx.fillRect(x, 0, w, 256);
      }
      
      // Draw vertical grain wavy lines
      ctx.strokeStyle = '#6e4628';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 15; i++) {
        let x = Math.random() * 256;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        for (let y = 0; y < 256; y += 20) {
          x += (Math.random() - 0.5) * 8;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      
      // Add subtle noise/roughness
      for (let i = 0; i < 2000; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const colVal = Math.random() * 30 - 15;
        ctx.fillStyle = `rgba(${74 + colVal}, ${47 + colVal}, ${27 + colVal}, 0.2)`;
        ctx.fillRect(x, y, 2, 2);
      }
    } else if (type === 'leaves') {
      // Pine needles: Transparent background, center brown twig with needles branching out
      ctx.clearRect(0, 0, 256, 256);
      
      // Center twig
      ctx.strokeStyle = '#3d2516';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(128, 256);
      ctx.quadraticCurveTo(120, 128, 128, 0);
      ctx.stroke();
      
      // Draw hundreds of fine pine needles radiating upwards
      for (let i = 0; i < 450; i++) {
        const y = 10 + Math.random() * 236;
        const x = 128 + (Math.random() - 0.5) * 15; // start near center branch
        
        // Needle angles point upwards/outwards
        const leftSide = Math.random() < 0.5;
        const angle = leftSide 
          ? (Math.PI - 0.2 - Math.random() * 1.1) // Left needles
          : (0.2 + Math.random() * 1.1);         // Right needles
          
        const length = 20 + Math.random() * 30;
        const tx = x + Math.cos(angle) * length;
        const ty = y - Math.sin(angle) * length;
        
        ctx.strokeStyle = ['#0c2c0c', '#154515', '#1b5a1b', '#2e7c2e'][Math.floor(Math.random() * 4)];
        ctx.lineWidth = 1.0 + Math.random() * 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
      }
    } else if (type === 'oakLeaves') {
      // Oak leaves: Transparent background, branch with organic leaf shapes
      ctx.clearRect(0, 0, 256, 256);
      
      // Center stem
      ctx.strokeStyle = '#2d1c10';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(128, 256);
      ctx.lineTo(128, 20);
      ctx.stroke();
      
      // Draw overlapping detailed leaves
      for (let i = 0; i < 90; i++) {
        const lx = 40 + Math.random() * 176;
        const ly = 20 + Math.random() * 216;
        const size = 18 + Math.random() * 22;
        
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate((Math.random() - 0.5) * Math.PI * 1.5);
        
        // Draw leaf body
        ctx.beginPath();
        ctx.ellipse(0, 0, size, size * 0.55, 0, 0, Math.PI * 2);
        
        // Green color gradient
        const gr = ctx.createRadialGradient(0, 0, 2, 0, 0, size);
        const col1 = ['#163c16', '#1d4f1d', '#256525'][Math.floor(Math.random() * 3)];
        const col2 = ['#296f29', '#378d37', '#4fb04f'][Math.floor(Math.random() * 3)];
        gr.addColorStop(0, col1);
        gr.addColorStop(1, col2);
        
        ctx.fillStyle = gr;
        ctx.fill();
        
        // Dark outline
        ctx.strokeStyle = '#0a1d0a';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        
        // Center vein
        ctx.beginPath();
        ctx.moveTo(-size, 0);
        ctx.lineTo(size, 0);
        ctx.strokeStyle = '#82ca82';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
      }
    } else if (type === 'sakura') {
      // Sakura (Cherry Blossom): Transparent background, multiple pink flower clusters
      ctx.clearRect(0, 0, 256, 256);
      
      // Subtle twigs
      ctx.strokeStyle = '#422c1d';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(128, 256);
      ctx.quadraticCurveTo(100, 150, 140, 50);
      ctx.stroke();
      
      // Draw 140 beautiful blossoms
      for (let i = 0; i < 140; i++) {
        const sx = 40 + Math.random() * 176;
        const sy = 20 + Math.random() * 216;
        const size = 7 + Math.random() * 11;
        
        ctx.save();
        ctx.translate(sx, sy);
        
        const petals = 5;
        // Diverse soft pinks and whites
        const color = Math.random() < 0.65 ? '#ffa6c9' : (Math.random() < 0.6 ? '#ffb7c5' : '#fff0f5');
        ctx.fillStyle = color;
        ctx.strokeStyle = '#e0536c';
        ctx.lineWidth = 0.4;
        
        // Draw 5 petals
        for (let p = 0; p < petals; p++) {
          ctx.rotate((Math.PI * 2) / petals);
          ctx.beginPath();
          ctx.ellipse(size * 0.55, 0, size * 0.55, size * 0.38, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        
        // Flower center (pistil/stamen detail)
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = '#ff3366';
        ctx.fill();
        
        ctx.restore();
      }
    } else if (type === 'stone') {
      // Stone gray cracked pattern
      ctx.fillStyle = '#6e6e6e';
      ctx.fillRect(0, 0, 128, 128);
      ctx.strokeStyle = '#4e4e4e';
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * 128, Math.random() * 128);
        ctx.lineTo(Math.random() * 128, Math.random() * 128);
        ctx.stroke();
      }
    } else if (type === 'gold') {
      // Golden shimmering metal texture
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(0, 0, 128, 128);
      ctx.fillStyle = '#fffae6';
      for (let i = 0; i < 15; i++) {
        ctx.fillRect(Math.random() * 128, Math.random() * 128, 12 + Math.random() * 16, 12 + Math.random() * 16);
      }
    } else if (type === 'chainmail') {
      // Gray steel chainmail pattern
      ctx.fillStyle = '#7f8c8d';
      ctx.fillRect(0, 0, 128, 128);
      ctx.strokeStyle = '#34495e';
      ctx.lineWidth = 1.5;
      for (let y = 0; y < 128; y += 8) {
        for (let x = (y % 16 === 0 ? 0 : 4); x < 128; x += 8) {
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    } else if (type === 'fabric') {
      // Fabric weave texture
      ctx.fillStyle = '#bcaaa4';
      ctx.fillRect(0, 0, 128, 128);
      ctx.fillStyle = '#8d6e63';
      for (let i = 0; i < 128; i += 4) {
        ctx.fillRect(i, 0, 1.5, 128);
        ctx.fillRect(0, i, 128, 1.5);
      }
    } else if (type === 'skin') {
      // Textured organic skin tone
      ctx.fillStyle = '#e0ac69';
      ctx.fillRect(0, 0, 128, 128);
      for (let i = 0; i < 300; i++) {
        ctx.fillStyle = Math.random() < 0.5 ? '#eebc79' : '#d09c59';
        ctx.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  initSharedMaterials() {
    // Generate realistic procedural canvas textures
    const barkTex = this.createProceduralTexture('bark');
    const leavesTex = this.createProceduralTexture('leaves');
    const oakLeavesTex = this.createProceduralTexture('oakLeaves');
    const sakuraTex = this.createProceduralTexture('sakura');
    const stoneTex = this.createProceduralTexture('stone');
    const goldTex = this.createProceduralTexture('gold');
    const chainmailTex = this.createProceduralTexture('chainmail');
    const fabricTex = this.createProceduralTexture('fabric');
    const skinTex = this.createProceduralTexture('skin');

    // Enhanced PBR materials with bumpMapping, transparency and double-sided rendering for foliage
    this.materials.trunk = new THREE.MeshStandardMaterial({ 
      map: barkTex, 
      bumpMap: barkTex, 
      bumpScale: 0.04,
      roughness: 0.85, 
      metalness: 0.04 
    });
    
    this.materials.leaves1 = new THREE.MeshStandardMaterial({ 
      map: leavesTex, 
      roughness: 0.65, 
      metalness: 0.02,
      transparent: true,
      alphaTest: 0.45,
      side: THREE.DoubleSide,
      shadowSide: THREE.DoubleSide
    });
    this.materials.leaves2 = new THREE.MeshStandardMaterial({ 
      map: leavesTex, 
      roughness: 0.65, 
      metalness: 0.02, 
      color: 0xdddddd,
      transparent: true,
      alphaTest: 0.45,
      side: THREE.DoubleSide,
      shadowSide: THREE.DoubleSide
    });
    this.materials.leaves3 = new THREE.MeshStandardMaterial({ 
      map: leavesTex, 
      roughness: 0.70, 
      metalness: 0.02, 
      color: 0xbbbbbb,
      transparent: true,
      alphaTest: 0.45,
      side: THREE.DoubleSide,
      shadowSide: THREE.DoubleSide
    });
    this.materials.darkLeaves = new THREE.MeshStandardMaterial({ 
      map: leavesTex, 
      roughness: 0.75, 
      metalness: 0.02, 
      color: 0x888888,
      transparent: true,
      alphaTest: 0.45,
      side: THREE.DoubleSide,
      shadowSide: THREE.DoubleSide
    });
    
    this.materials.oakLeaves = new THREE.MeshStandardMaterial({ 
      map: oakLeavesTex, 
      roughness: 0.75, 
      metalness: 0.02,
      transparent: true,
      alphaTest: 0.45,
      side: THREE.DoubleSide,
      shadowSide: THREE.DoubleSide
    });
    
    this.materials.sakuraLeaves = new THREE.MeshStandardMaterial({ 
      map: sakuraTex, 
      roughness: 0.6, 
      metalness: 0.02, 
      transparent: true, 
      alphaTest: 0.45,
      side: THREE.DoubleSide,
      shadowSide: THREE.DoubleSide,
      emissive: 0xffb7c5,
      emissiveIntensity: 0.12
    });
    this.materials.solidSakura = new THREE.MeshStandardMaterial({ color: 0xffa6c9, roughness: 0.8, metalness: 0.0 });
    
    this.materials.rock = new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.8, metalness: 0.05 });
    this.materials.darkRock = new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.85, metalness: 0.05, color: 0x777777 });
    this.materials.moss = new THREE.MeshStandardMaterial({ color: 0x3d5c32, roughness: 0.85, metalness: 0.0 });
    this.materials.goldCrystal = new THREE.MeshStandardMaterial({
      map: goldTex,
      metalness: 0.95,
      roughness: 0.1,
      emissive: 0xffa000,
      emissiveIntensity: 0.25
    });
    
    // Team materials with richer palette and smooth finish
    this.materials.playerBlue = new THREE.MeshStandardMaterial({ color: 0x1a5fb4, roughness: 0.45, metalness: 0.1 });
    this.materials.enemyRed = new THREE.MeshStandardMaterial({ color: 0xc01c28, roughness: 0.45, metalness: 0.1 });
    this.materials.allyGreen = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.45, metalness: 0.1 });
    this.materials.neutralGrey = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.55, metalness: 0.05 });
    
    // Unit skin/leather/cloth with warm tones
    this.materials.skin = new THREE.MeshStandardMaterial({ map: skinTex, roughness: 0.6, metalness: 0.0 });
    this.materials.clothes = new THREE.MeshStandardMaterial({ map: fabricTex, color: 0x7a4f2f, roughness: 0.75, metalness: 0.0 });
    this.materials.clothesDark = new THREE.MeshStandardMaterial({ map: fabricTex, color: 0x5a3a1f, roughness: 0.8, metalness: 0.0 });
    this.materials.iron = new THREE.MeshStandardMaterial({ map: chainmailTex, metalness: 0.85, roughness: 0.25 });
    this.materials.goldMetal = new THREE.MeshStandardMaterial({ 
      color: 0xffd700, metalness: 0.95, roughness: 0.1,
      emissive: 0xffa000, emissiveIntensity: 0.15
    });
    
    // Age-based building materials with improved colors
    this.materials.woodDark = new THREE.MeshStandardMaterial({ color: 0x7a4a25, roughness: 0.88, metalness: 0.0 });
    this.materials.woodFeudal = new THREE.MeshStandardMaterial({ color: 0x9a6a40, roughness: 0.82, metalness: 0.0 });
    this.materials.stoneCastle = new THREE.MeshStandardMaterial({ color: 0x8a8a8a, roughness: 0.72, metalness: 0.05 });
    this.materials.marbleImperial = new THREE.MeshStandardMaterial({ color: 0xeaeaea, roughness: 0.35, metalness: 0.15 });
    
    this.materials.roofDark = new THREE.MeshStandardMaterial({ color: 0xd48030, roughness: 0.85, metalness: 0.0 }); 
    this.materials.roofFeudal = new THREE.MeshStandardMaterial({ color: 0xc05030, roughness: 0.75, metalness: 0.0 }); 
    this.materials.roofCastle = new THREE.MeshStandardMaterial({ color: 0x3d5060, roughness: 0.72, metalness: 0.08 }); 
    
    // Additional decorative materials
    this.materials.fire = new THREE.MeshBasicMaterial({ color: 0xff4500, emissive: 0xff4500 });
    this.materials.fireGlow = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    this.materials.thatch = new THREE.MeshStandardMaterial({ color: 0xc4a855, roughness: 0.95, metalness: 0.0 });
    this.materials.dirt = new THREE.MeshStandardMaterial({ color: 0x5c3d20, roughness: 0.95, metalness: 0.0 });
    this.materials.glass = new THREE.MeshStandardMaterial({ color: 0x2a4060, roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.5 });
    
    // VFX/Indicators
    this.materials.blueprint = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.4,
      wireframe: true
    });

    // Regional style colors & materials
    this.materials.eastAsianRoof = new THREE.MeshStandardMaterial({ color: 0x223040, roughness: 0.5, metalness: 0.1 });
    this.materials.eastAsianWall = new THREE.MeshStandardMaterial({ color: 0xfaf5e8, roughness: 0.8, metalness: 0.0 });
    this.materials.eastAsianWood = new THREE.MeshStandardMaterial({ color: 0xa62626, roughness: 0.7, metalness: 0.05 });
    
    this.materials.middleEasternWall = new THREE.MeshStandardMaterial({ color: 0xdfcbaf, roughness: 0.85, metalness: 0.0 });
    this.materials.middleEasternDome = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.2, metalness: 0.75, emissive: 0x0284c7, emissiveIntensity: 0.1 });
    this.materials.middleEasternRoof = new THREE.MeshStandardMaterial({ color: 0xcbb79b, roughness: 0.85, metalness: 0.0 });
    
    this.materials.mesoamericanWall = new THREE.MeshStandardMaterial({ color: 0x7c7267, roughness: 0.9, metalness: 0.05 });
    this.materials.mesoamericanTrim = new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.8, metalness: 0.0 });
    this.materials.mesoamericanRoof = new THREE.MeshStandardMaterial({ color: 0x5a5045, roughness: 0.9, metalness: 0.0 });
    
    this.materials.mediterraneanWall = new THREE.MeshStandardMaterial({ color: 0xf5ebd0, roughness: 0.78, metalness: 0.0 });
    this.materials.mediterraneanRoof = new THREE.MeshStandardMaterial({ color: 0xe06a3b, roughness: 0.6, metalness: 0.1 });
    
    this.materials.nordicWall = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9, metalness: 0.0 });
    this.materials.nordicRoof = new THREE.MeshStandardMaterial({ color: 0xc4a855, roughness: 0.95, metalness: 0.0 });

    // ── CIV-SPECIFIC ACCENT MATERIALS (shared across units) ──
    this.materials.jade = new THREE.MeshStandardMaterial({ color: 0x00a86b, roughness: 0.3, metalness: 0.4, emissive: 0x004d2e, emissiveIntensity: 0.1 });
    this.materials.obsidian = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.15, metalness: 0.6 });
    this.materials.bronze = new THREE.MeshStandardMaterial({ color: 0xcd7f32, roughness: 0.3, metalness: 0.7 });
    this.materials.copper = new THREE.MeshStandardMaterial({ color: 0xb87333, roughness: 0.35, metalness: 0.6 });
    this.materials.azure = new THREE.MeshStandardMaterial({ color: 0x007fff, roughness: 0.2, metalness: 0.5, emissive: 0x003366, emissiveIntensity: 0.08 });
    this.materials.crimsonCloth = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.7, metalness: 0.0 });
    this.materials.whiteCloth = new THREE.MeshStandardMaterial({ color: 0xf0ead6, roughness: 0.75, metalness: 0.0 });
    this.materials.darkLeather = new THREE.MeshStandardMaterial({ color: 0x2d1b0e, roughness: 0.85, metalness: 0.0 });
    this.materials.furBrown = new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.95, metalness: 0.0 });
    this.materials.furGrey = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.95, metalness: 0.0 });
    this.materials.silkPurple = new THREE.MeshStandardMaterial({ color: 0x7b2d8e, roughness: 0.4, metalness: 0.15 });
    this.materials.silkRed = new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.4, metalness: 0.1 });
    this.materials.turquoise = new THREE.MeshStandardMaterial({ color: 0x40e0d0, roughness: 0.3, metalness: 0.5, emissive: 0x1a6b5a, emissiveIntensity: 0.08 });
    this.materials.warpaint = new THREE.MeshStandardMaterial({ color: 0x2233aa, roughness: 0.5, metalness: 0.0 });
    this.materials.boneWhite = new THREE.MeshStandardMaterial({ color: 0xf5f0e0, roughness: 0.7, metalness: 0.05 });
    this.materials.featherRed = new THREE.MeshStandardMaterial({ color: 0xcc3333, roughness: 0.65, metalness: 0.0 });
    this.materials.featherGreen = new THREE.MeshStandardMaterial({ color: 0x22aa44, roughness: 0.65, metalness: 0.0 });
    this.materials.chainmailDark = new THREE.MeshStandardMaterial({ color: 0x555566, roughness: 0.3, metalness: 0.8 });

    // Cache shared geometries for efficiency
    this._cachedGeoms = {
      capeGeom: new THREE.BoxGeometry(0.4, 0.55, 0.06),
      beltGeom: new THREE.CylinderGeometry(0.29, 0.29, 0.08, 6),
      pouchGeom: new THREE.BoxGeometry(0.1, 0.12, 0.08),
      hornGeom: new THREE.ConeGeometry(0.04, 0.22, 4),
      plumeGeom: new THREE.BoxGeometry(0.06, 0.22, 0.2),
      featherGeom: new THREE.BoxGeometry(0.03, 0.3, 0.08),
      bandGeom: new THREE.CylinderGeometry(0.14, 0.14, 0.06, 6),
      earFlapGeom: new THREE.BoxGeometry(0.05, 0.22, 0.12),
      crescentGeom: new THREE.TorusGeometry(0.08, 0.02, 6, 8, Math.PI),
      topknotGeom: new THREE.CylinderGeometry(0.06, 0.04, 0.18, 5),
      chainGeom: new THREE.TorusGeometry(0.15, 0.012, 4, 8),
      pendantGeom: new THREE.OctahedronGeometry(0.04),
    };
  }

  // ── CIVILIZATION UNIT VISUAL CONFIG ──
  // Returns unique appearance settings per civilization
  getCivUnitConfig(civ) {
    const configs = {
      inggris: {
        helmetStyle: 'bascinet', helmetMat: 'iron', helmetTopMat: 'iron',
        plumeMat: null, cape: true, capeMat: 'crimsonCloth',
        beltAccent: 'goldMetal', shieldEmblem: 'cross',
        armorAccent: null, facePaint: false,
        hornCount: 0, crestType: null,
        accessories: ['belt_pouch']
      },
      prancis: {
        helmetStyle: 'greatHelm', helmetMat: 'iron', helmetTopMat: 'iron',
        plumeMat: 'azure', cape: true, capeMat: 'azure',
        beltAccent: 'goldMetal', shieldEmblem: 'fleurDeLis',
        armorAccent: 'azure', facePaint: false,
        hornCount: 0, crestType: 'tallPlume',
        accessories: ['belt_pouch', 'shoulder_drape']
      },
      mongol: {
        helmetStyle: 'furHat', helmetMat: 'furBrown', helmetTopMat: null,
        plumeMat: null, cape: false, capeMat: null,
        beltAccent: 'darkLeather', shieldEmblem: null,
        armorAccent: null, facePaint: false,
        hornCount: 0, crestType: null,
        accessories: ['ear_flaps', 'quiver_belt']
      },
      jepang: {
        helmetStyle: 'kabuto', helmetMat: 'iron', helmetTopMat: 'iron',
        plumeMat: 'goldMetal', cape: false, capeMat: null,
        beltAccent: 'silkRed', shieldEmblem: null,
        armorAccent: 'silkRed', facePaint: false,
        hornCount: 2, crestType: 'goldenHorns',
        accessories: ['neck_guard', 'sashimono']
      },
      tiongkok: {
        helmetStyle: 'lamellar', helmetMat: 'iron', helmetTopMat: 'bronze',
        plumeMat: 'silkRed', cape: true, capeMat: 'silkRed',
        beltAccent: 'jade', shieldEmblem: null,
        armorAccent: 'jade', facePaint: false,
        hornCount: 0, crestType: 'topknot',
        accessories: ['jade_pendant', 'shoulder_guard']
      },
      saracen: {
        helmetStyle: 'turban', helmetMat: 'whiteCloth', helmetTopMat: null,
        plumeMat: null, cape: true, capeMat: 'whiteCloth',
        beltAccent: 'goldMetal', shieldEmblem: 'crescent',
        armorAccent: 'goldMetal', facePaint: false,
        hornCount: 0, crestType: 'crescent',
        accessories: ['sash', 'crescent_top']
      },
      spanyol: {
        helmetStyle: 'morion', helmetMat: 'iron', helmetTopMat: 'iron',
        plumeMat: 'crimsonCloth', cape: true, capeMat: 'crimsonCloth',
        beltAccent: 'goldMetal', shieldEmblem: 'cross',
        armorAccent: 'goldMetal', facePaint: false,
        hornCount: 0, crestType: 'tallPlume',
        accessories: ['belt_pouch', 'cross_pendant']
      },
      viking: {
        helmetStyle: 'vikingHelm', helmetMat: 'iron', helmetTopMat: 'iron',
        plumeMat: null, cape: true, capeMat: 'furGrey',
        beltAccent: 'bronze', shieldEmblem: 'rune',
        armorAccent: null, facePaint: true, facePaintMat: 'warpaint',
        hornCount: 2, crestType: 'vikingHorns',
        accessories: ['fur_collar', 'arm_bands']
      },
      bizantium: {
        helmetStyle: 'ridgeHelm', helmetMat: 'iron', helmetTopMat: 'goldMetal',
        plumeMat: 'silkPurple', cape: true, capeMat: 'silkPurple',
        beltAccent: 'goldMetal', shieldEmblem: 'cross',
        armorAccent: 'silkPurple', facePaint: false,
        hornCount: 0, crestType: 'ridgePlume',
        accessories: ['shoulder_drape', 'gold_chain']
      },
      persia: {
        helmetStyle: 'pointedHelm', helmetMat: 'iron', helmetTopMat: 'goldMetal',
        plumeMat: 'turquoise', cape: true, capeMat: 'turquoise',
        beltAccent: 'goldMetal', shieldEmblem: null,
        armorAccent: 'turquoise', facePaint: false,
        hornCount: 0, crestType: 'spike',
        accessories: ['silk_sash', 'arm_guards']
      },
      aztec: {
        helmetStyle: 'eagleWarrior', helmetMat: 'boneWhite', helmetTopMat: null,
        plumeMat: 'featherGreen', cape: false, capeMat: null,
        beltAccent: 'obsidian', shieldEmblem: null,
        armorAccent: 'obsidian', facePaint: true, facePaintMat: 'crimsonCloth',
        hornCount: 0, crestType: 'featherCrown',
        accessories: ['feather_back', 'arm_feathers', 'obsidian_pendant']
      },
      maya: {
        helmetStyle: 'jadeCrown', helmetMat: 'jade', helmetTopMat: null,
        plumeMat: 'featherGreen', cape: false, capeMat: null,
        beltAccent: 'jade', shieldEmblem: null,
        armorAccent: 'jade', facePaint: true, facePaintMat: 'azure',
        hornCount: 0, crestType: 'quetzalPlume',
        accessories: ['jade_earrings', 'feather_back']
      },
      hun: {
        helmetStyle: 'hunCap', helmetMat: 'darkLeather', helmetTopMat: null,
        plumeMat: null, cape: false, capeMat: null,
        beltAccent: 'bronze', shieldEmblem: null,
        armorAccent: null, facePaint: true, facePaintMat: 'crimsonCloth',
        hornCount: 0, crestType: null,
        accessories: ['ear_flaps', 'bone_necklace']
      },
      turki: {
        helmetStyle: 'spikedHelm', helmetMat: 'iron', helmetTopMat: 'goldMetal',
        plumeMat: 'crimsonCloth', cape: true, capeMat: 'crimsonCloth',
        beltAccent: 'goldMetal', shieldEmblem: 'crescent',
        armorAccent: 'goldMetal', facePaint: false,
        hornCount: 0, crestType: 'spike',
        accessories: ['sash', 'chainmail_skirt']
      },
      kelt: {
        helmetStyle: 'celticHelm', helmetMat: 'bronze', helmetTopMat: 'bronze',
        plumeMat: null, cape: true, capeMat: 'featherGreen',
        beltAccent: 'bronze', shieldEmblem: 'spiral',
        armorAccent: 'bronze', facePaint: true, facePaintMat: 'warpaint',
        hornCount: 0, crestType: 'wingFlare',
        accessories: ['torque_necklace', 'arm_bands']
      },
      goth: {
        helmetStyle: 'spangenhelm', helmetMat: 'iron', helmetTopMat: 'iron',
        plumeMat: null, cape: true, capeMat: 'darkLeather',
        beltAccent: 'iron', shieldEmblem: null,
        armorAccent: null, facePaint: false,
        hornCount: 0, crestType: null,
        accessories: ['skull_belt', 'fur_collar']
      },
      teuton: {
        helmetStyle: 'crusaderHelm', helmetMat: 'iron', helmetTopMat: 'iron',
        plumeMat: 'whiteCloth', cape: true, capeMat: 'whiteCloth',
        beltAccent: 'iron', shieldEmblem: 'teutonCross',
        armorAccent: 'whiteCloth', facePaint: false,
        hornCount: 0, crestType: 'crossCrest',
        accessories: ['cross_pendant', 'chainmail_skirt']
      },
      roma: {
        helmetStyle: 'romanGalea', helmetMat: 'bronze', helmetTopMat: 'bronze',
        plumeMat: 'crimsonCloth', cape: true, capeMat: 'crimsonCloth',
        beltAccent: 'goldMetal', shieldEmblem: 'laurel',
        armorAccent: 'crimsonCloth', facePaint: false,
        hornCount: 0, crestType: 'transverseCrest',
        accessories: ['pteruges', 'laurel_wreath']
      }
    };
    return configs[civ] || configs.inggris;
  }

  // ── ADD CIVILIZATION-SPECIFIC HEADGEAR ──
  addCivHeadgear(bodyGroup, civ, type, age, teamMat) {
    const config = this.getCivUnitConfig(civ);
    const isMilitary = ['swordsman', 'footKnight', 'knight', 'heavyCavalry', 'horseArcher', 'archer', 'spearman', 'skirmisher', 'scoutCavalry', 'camelRider', 'cavalryArcher'].includes(type);
    if (!isMilitary && type !== 'villager') return;

    const helmetMat = this.materials[config.helmetMat] || this.materials.iron;
    const helmetTopMat = config.helmetTopMat ? (this.materials[config.helmetTopMat] || this.materials.iron) : helmetMat;

    // ── HELMET SHAPES PER STYLE ──
    switch (config.helmetStyle) {
      case 'romanGalea': {
        // Roman Galea helmet — bronze dome, cheek guards, red transverse crest
        const dome = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8, 0, Math.PI * 2, 0, Math.PI / 1.5), helmetMat);
        dome.position.y = 0.98; dome.castShadow = true;
        bodyGroup.add(dome);
        
        const brow = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.04, 0.06), helmetMat);
        brow.position.set(0, 0.96, 0.16);
        bodyGroup.add(brow);
        
        const cheekL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.08), helmetMat);
        cheekL.position.set(-0.21, 0.88, 0.06); cheekL.rotation.y = 0.2;
        const cheekR = cheekL.clone(); cheekR.position.set(0.21, 0.88, 0.06); cheekR.rotation.y = -0.2;
        bodyGroup.add(cheekL, cheekR);
        
        const crestBase = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.26), helmetTopMat);
        crestBase.position.set(0, 1.18, -0.02);
        bodyGroup.add(crestBase);
        
        const plume = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 0.28), this.materials.crimsonCloth);
        plume.position.set(0, 1.28, -0.02);
        bodyGroup.add(plume);
        break;
      }
      case 'kabuto': {
        // Japanese Kabuto — dome, golden horns, neck guard
        const dome = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8, 0, Math.PI * 2, 0, Math.PI / 1.5), helmetMat);
        dome.position.y = 0.98; dome.castShadow = true;
        bodyGroup.add(dome);
        // Golden horns
        const h1 = new THREE.Mesh(this._cachedGeoms.hornGeom, this.materials.goldMetal);
        h1.rotation.z = Math.PI / 4; h1.position.set(-0.1, 1.15, 0.18);
        const h2 = h1.clone(); h2.rotation.z = -Math.PI / 4; h2.position.set(0.1, 1.15, 0.18);
        bodyGroup.add(h1, h2);
        // Neck guard (shikoro)
        const shikoro = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.18, 8, 1, true, -Math.PI / 2, Math.PI), this.materials.silkRed);
        shikoro.position.y = 0.9; shikoro.castShadow = true;
        bodyGroup.add(shikoro);
        break;
      }
      case 'furHat': {
        // Mongol fur hat with ear flaps
        const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.15, 8), this.materials.furBrown);
        hat.position.y = 1.1; hat.castShadow = true;
        const topDome = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), teamMat);
        topDome.position.y = 1.17;
        bodyGroup.add(hat, topDome);
        const fL = new THREE.Mesh(this._cachedGeoms.earFlapGeom, this.materials.furBrown);
        fL.position.set(-0.2, 1.0, 0);
        const fR = fL.clone(); fR.position.set(0.2, 1.0, 0);
        bodyGroup.add(fL, fR);
        break;
      }
      case 'vikingHelm': {
        // Viking rounded helm with horns
        const helm = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8, 0, Math.PI * 2, 0, Math.PI / 1.5), helmetMat);
        helm.position.y = 0.98; helm.castShadow = true;
        bodyGroup.add(helm);
        // Nose guard
        const noseGuard = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.06), helmetMat);
        noseGuard.position.set(0, 0.92, 0.2);
        bodyGroup.add(noseGuard);
        // Horns curving outward
        const horn1 = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.28, 5), this.materials.boneWhite);
        horn1.rotation.z = Math.PI / 3; horn1.position.set(-0.25, 1.1, 0.05);
        const horn2 = horn1.clone(); horn2.rotation.z = -Math.PI / 3; horn2.position.set(0.25, 1.1, 0.05);
        bodyGroup.add(horn1, horn2);
        break;
      }
      case 'turban': {
        // Saracen turban — layered cloth wrap
        const wrap1 = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), this.materials.whiteCloth);
        wrap1.position.y = 1.0; wrap1.scale.set(1, 0.8, 1); wrap1.castShadow = true;
        bodyGroup.add(wrap1);
        // Cloth tail drape
        const tail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.06), this.materials.whiteCloth);
        tail.position.set(0.12, 0.85, -0.15); tail.rotation.z = -0.2;
        bodyGroup.add(tail);
        // Golden crescent ornament
        const cres = new THREE.Mesh(this._cachedGeoms.crescentGeom, this.materials.goldMetal);
        cres.position.set(0, 1.2, 0.15); cres.rotation.x = -0.3;
        bodyGroup.add(cres);
        break;
      }
      case 'eagleWarrior': {
        // Aztec Eagle Warrior helmet — open beak visor
        const skull = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8, 0, Math.PI * 2, 0, Math.PI / 1.5), this.materials.boneWhite);
        skull.position.y = 0.98; skull.castShadow = true;
        bodyGroup.add(skull);
        // Beak
        const beak = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 4), this.materials.boneWhite);
        beak.position.set(0, 0.95, 0.25); beak.rotation.x = Math.PI / 2;
        bodyGroup.add(beak);
        // Feather crest (tall colorful)
        for (let i = 0; i < 5; i++) {
          const featherMat = i % 2 === 0 ? this.materials.featherGreen : this.materials.featherRed;
          const f = new THREE.Mesh(this._cachedGeoms.featherGeom, featherMat);
          f.position.set((i - 2) * 0.06, 1.2 + Math.abs(i - 2) * 0.04, -0.05);
          f.rotation.z = (i - 2) * 0.08;
          bodyGroup.add(f);
        }
        break;
      }
      case 'jadeCrown': {
        // Mayan jade crown with quetzal feathers
        const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.12, 8), this.materials.jade);
        crown.position.y = 1.05; crown.castShadow = true;
        bodyGroup.add(crown);
        // Jade ear discs
        const discGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.02, 6);
        const discL = new THREE.Mesh(discGeom, this.materials.jade);
        discL.position.set(-0.22, 0.95, 0); discL.rotation.z = Math.PI / 2;
        const discR = discL.clone(); discR.position.set(0.22, 0.95, 0);
        bodyGroup.add(discL, discR);
        // Quetzal plume rising from back
        for (let i = 0; i < 4; i++) {
          const f = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.35, 0.06), this.materials.featherGreen);
          f.position.set((i - 1.5) * 0.05, 1.2, -0.12);
          f.rotation.z = (i - 1.5) * 0.06;
          bodyGroup.add(f);
        }
        break;
      }
      case 'greatHelm': {
        // French great helm — flat-topped with slit visor
        const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.35, 8), helmetMat);
        helm.position.y = 1.0; helm.castShadow = true;
        bodyGroup.add(helm);
        const top = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.04, 8), helmetMat);
        top.position.y = 1.18;
        bodyGroup.add(top);
        // Visor slit
        const slit = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.03), this.materials.clothesDark);
        slit.position.set(0, 0.98, 0.21);
        bodyGroup.add(slit);
        // Tall azure plume
        const plume = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.35, 0.18), this.materials.azure);
        plume.position.set(0, 1.38, -0.04);
        bodyGroup.add(plume);
        break;
      }
      case 'lamellar': {
        // Chinese lamellar helm — tiered plates with topknot
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.23, 0.22, 8), helmetMat);
        base.position.y = 1.0; base.castShadow = true;
        bodyGroup.add(base);
        const topRing = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.21, 0.08, 8), this.materials.bronze);
        topRing.position.y = 1.13;
        bodyGroup.add(topRing);
        // Topknot / plume holder
        const tk = new THREE.Mesh(this._cachedGeoms.topknotGeom, this.materials.silkRed);
        tk.position.set(0, 1.22, 0);
        bodyGroup.add(tk);
        // Neck curtain
        const curtain = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.18, 0.06), helmetMat);
        curtain.position.set(0, 0.88, -0.15);
        bodyGroup.add(curtain);
        break;
      }
      case 'morion': {
        // Spanish morion — peaked crest helmet
        const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8, 0, Math.PI * 2, 0, Math.PI / 1.5), helmetMat);
        bowl.position.y = 0.98; bowl.castShadow = true;
        bodyGroup.add(bowl);
        // High comb/ridge
        const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.2, 0.3), helmetMat);
        ridge.position.set(0, 1.15, 0);
        bodyGroup.add(ridge);
        // Wide brim
        const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 8), helmetMat);
        brim.position.y = 0.92;
        bodyGroup.add(brim);
        // Red plume
        const plume = new THREE.Mesh(this._cachedGeoms.featherGeom, this.materials.crimsonCloth);
        plume.position.set(0.15, 1.2, 0); plume.rotation.z = -0.3;
        bodyGroup.add(plume);
        break;
      }
      case 'pointedHelm': {
        // Persian pointed conical helm
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.35, 8), helmetMat);
        cone.position.y = 1.1; cone.castShadow = true;
        bodyGroup.add(cone);
        // Gold band at base
        const band = new THREE.Mesh(this._cachedGeoms.bandGeom, this.materials.goldMetal);
        band.position.y = 0.95; band.scale.set(1.55, 1, 1.55);
        bodyGroup.add(band);
        // Chainmail aventail
        const aventail = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.15, 8, 1, true, -Math.PI / 2, Math.PI), this.materials.chainmailDark);
        aventail.position.y = 0.88;
        bodyGroup.add(aventail);
        // Turquoise gem at top
        const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.04), this.materials.turquoise);
        gem.position.set(0, 1.28, 0.08);
        bodyGroup.add(gem);
        break;
      }
      case 'ridgeHelm': {
        // Byzantine ridge helm — gold ridge, purple plume
        const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.22, 0.28, 8), helmetMat);
        helm.position.y = 0.98; helm.castShadow = true;
        bodyGroup.add(helm);
        const ridgeTop = new THREE.Mesh(new THREE.SphereGeometry(0.21, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), helmetTopMat);
        ridgeTop.position.y = 1.12;
        bodyGroup.add(ridgeTop);
        // Gold ridge
        const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.3), this.materials.goldMetal);
        ridge.position.set(0, 1.18, 0);
        bodyGroup.add(ridge);
        // Purple plume
        const plume = new THREE.Mesh(this._cachedGeoms.plumeGeom, this.materials.silkPurple);
        plume.position.set(0, 1.22, -0.04);
        bodyGroup.add(plume);
        break;
      }
      case 'hunCap': {
        // Hunnic leather cap — simple with bone decorations
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), this.materials.darkLeather);
        cap.position.y = 0.98; cap.castShadow = true;
        bodyGroup.add(cap);
        // Ear flaps
        const fL = new THREE.Mesh(this._cachedGeoms.earFlapGeom, this.materials.darkLeather);
        fL.position.set(-0.2, 0.95, 0);
        const fR = fL.clone(); fR.position.set(0.2, 0.95, 0);
        bodyGroup.add(fL, fR);
        // Bone spike on top
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.15, 4), this.materials.boneWhite);
        spike.position.y = 1.15;
        bodyGroup.add(spike);
        break;
      }
      case 'spikedHelm': {
        // Turkish spiked iron helm with chainmail
        const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.3, 8), helmetMat);
        helm.position.y = 1.0; helm.castShadow = true;
        bodyGroup.add(helm);
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.2, 6), this.materials.goldMetal);
        spike.position.y = 1.22;
        bodyGroup.add(spike);
        // Chainmail curtain
        const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.15, 8, 1, true, -Math.PI / 2, Math.PI), this.materials.chainmailDark);
        chain.position.y = 0.86;
        bodyGroup.add(chain);
        break;
      }
      case 'celticHelm': {
        // Celtic bronze helm with wing flares
        const helm = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8, 0, Math.PI * 2, 0, Math.PI / 1.5), this.materials.bronze);
        helm.position.y = 0.98; helm.castShadow = true;
        bodyGroup.add(helm);
        // Wing flares
        const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.18, 0.12), this.materials.bronze);
        wingL.position.set(-0.22, 1.08, -0.05); wingL.rotation.z = 0.4;
        const wingR = wingL.clone(); wingR.position.set(0.22, 1.08, -0.05); wingR.rotation.z = -0.4;
        bodyGroup.add(wingL, wingR);
        // Nose guard
        const nose = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.14, 0.04), this.materials.bronze);
        nose.position.set(0, 0.92, 0.2);
        bodyGroup.add(nose);
        break;
      }
      case 'spangenhelm': {
        // Gothic spangenhelm — segmented iron with nose piece
        const helm = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 6, 0, Math.PI * 2, 0, Math.PI / 1.5), helmetMat);
        helm.position.y = 0.98; helm.castShadow = true;
        bodyGroup.add(helm);
        // Metal bands (spangs)
        for (let i = 0; i < 4; i++) {
          const band = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.28, 0.02), helmetMat);
          band.position.set(0, 1.02, 0);
          band.rotation.y = (i / 4) * Math.PI;
          bodyGroup.add(band);
        }
        // Nose guard
        const nose = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.16, 0.04), helmetMat);
        nose.position.set(0, 0.93, 0.2);
        bodyGroup.add(nose);
        break;
      }
      case 'crusaderHelm': {
        // Teutonic great helm — flat-top with cross emblem
        const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.23, 0.35, 8), helmetMat);
        helm.position.y = 1.0; helm.castShadow = true;
        bodyGroup.add(helm);
        const top = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.03, 8), helmetMat);
        top.position.y = 1.18;
        bodyGroup.add(top);
        // Cross visor slit
        const slitH = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.025, 0.03), this.materials.clothesDark);
        slitH.position.set(0, 0.98, 0.22);
        const slitV = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.08, 0.03), this.materials.clothesDark);
        slitV.position.set(0, 0.98, 0.22);
        bodyGroup.add(slitH, slitV);
        // Black cross on front
        const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.15, 0.01), this.materials.clothesDark);
        crossV.position.set(0, 1.08, 0.23);
        const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.01), this.materials.clothesDark);
        crossH.position.set(0, 1.1, 0.23);
        bodyGroup.add(crossV, crossH);
        break;
      }
      default: { // 'bascinet' fallback
        const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.22, 0.3, 8), helmetMat);
        helm.position.y = 1.0; helm.castShadow = true;
        bodyGroup.add(helm);
        const helmTop = new THREE.Mesh(new THREE.SphereGeometry(0.21, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), helmetTopMat);
        helmTop.position.y = 1.15; helmTop.castShadow = true;
        bodyGroup.add(helmTop);
        break;
      }
    }

    // ── FACE PAINT (for warrior civs) ──
    if (config.facePaint && config.facePaintMat && type !== 'villager') {
      const paintMat = this.materials[config.facePaintMat] || this.materials.warpaint;
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.01), paintMat);
      stripe.position.set(0, 0.92, 0.2);
      bodyGroup.add(stripe);
    }
  }

  // ── ADD CIVILIZATION-SPECIFIC BODY DETAILS ──
  addCivBodyDetails(bodyGroup, civ, type, age, teamMat) {
    const config = this.getCivUnitConfig(civ);
    const isMilitary = ['swordsman', 'footKnight', 'knight', 'heavyCavalry', 'horseArcher', 'archer', 'spearman', 'skirmisher', 'scoutCavalry', 'camelRider', 'cavalryArcher'].includes(type);

    // ── CAPE ──
    if (config.cape && isMilitary) {
      const capeMat = this.materials[config.capeMat] || teamMat;
      const cape = new THREE.Mesh(this._cachedGeoms.capeGeom, capeMat);
      cape.position.set(0, 0.5, -0.22);
      cape.castShadow = true;
      bodyGroup.add(cape);
    }

    // ── BELT WITH ACCENT ──
    if (config.beltAccent) {
      const beltMat = this.materials[config.beltAccent] || this.materials.clothes;
      const belt = new THREE.Mesh(this._cachedGeoms.beltGeom, beltMat);
      belt.position.y = 0.32;
      bodyGroup.add(belt);
    }

    // ── ACCESSORIES ──
    (config.accessories || []).forEach(acc => {
      switch (acc) {
        case 'pteruges': {
          const ptMat = this.materials.darkLeather;
          for (let i = 0; i < 6; i++) {
            const strip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.02), ptMat);
            const angle = (i / 6) * Math.PI * 2;
            strip.position.set(0.24 * Math.cos(angle), 0.2, 0.24 * Math.sin(angle));
            strip.rotation.y = -angle;
            bodyGroup.add(strip);
          }
          break;
        }
        case 'laurel_wreath': {
          const wreath = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.025, 4, 12), this.materials.featherGreen || this.materials.woodDark);
          wreath.position.y = 0.98;
          wreath.rotation.x = Math.PI / 2;
          bodyGroup.add(wreath);
          break;
        }
        case 'belt_pouch': {
          const pouch = new THREE.Mesh(this._cachedGeoms.pouchGeom, this.materials.darkLeather);
          pouch.position.set(0.25, 0.3, 0.1);
          bodyGroup.add(pouch);
          break;
        }
        case 'shoulder_drape': {
          const drape = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.4), this.materials[config.armorAccent] || teamMat);
          drape.position.set(0, 0.78, 0);
          drape.rotation.z = 0.3;
          bodyGroup.add(drape);
          break;
        }
        case 'shoulder_guard': {
          const guardMat = this.materials[config.armorAccent] || this.materials.iron;
          const gL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.16), guardMat);
          gL.position.set(-0.35, 0.75, 0); gL.castShadow = true;
          const gR = gL.clone(); gR.position.set(0.35, 0.75, 0);
          bodyGroup.add(gL, gR);
          break;
        }
        case 'neck_guard': {
          const ng = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.12, 8, 1, true, -Math.PI / 2, Math.PI), this.materials.silkRed);
          ng.position.y = 0.88; ng.castShadow = true;
          bodyGroup.add(ng);
          break;
        }
        case 'sashimono': {
          // Japanese back banner
          if (isMilitary) {
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.8, 4), this.materials.woodDark);
            pole.position.set(0, 0.8, -0.2);
            bodyGroup.add(pole);
            const banner = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.35, 0.02), teamMat);
            banner.position.set(0, 1.15, -0.2);
            bodyGroup.add(banner);
          }
          break;
        }
        case 'fur_collar': {
          const collar = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.06, 5, 8), this.materials.furGrey);
          collar.position.y = 0.82; collar.rotation.x = Math.PI / 2;
          bodyGroup.add(collar);
          break;
        }
        case 'arm_bands': {
          const bandMat = this.materials[config.beltAccent] || this.materials.bronze;
          const bL = new THREE.Mesh(this._cachedGeoms.bandGeom, bandMat);
          bL.position.set(-0.35, 0.5, 0); bL.scale.set(0.6, 1, 0.6);
          const bR = bL.clone(); bR.position.set(0.35, 0.5, 0);
          bodyGroup.add(bL, bR);
          break;
        }
        case 'sash': {
          const sashMat = this.materials[config.beltAccent] || this.materials.goldMetal;
          const sash = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.6, 0.04), sashMat);
          sash.position.set(0.15, 0.45, 0.12); sash.rotation.z = 0.4;
          bodyGroup.add(sash);
          break;
        }
        case 'silk_sash': {
          const silk = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.04), this.materials.turquoise);
          silk.position.set(-0.15, 0.45, 0.12); silk.rotation.z = -0.3;
          bodyGroup.add(silk);
          break;
        }
        case 'crescent_top': {
          const cres = new THREE.Mesh(this._cachedGeoms.crescentGeom, this.materials.goldMetal);
          cres.position.set(0, 1.22, 0.15); cres.rotation.x = -0.3;
          bodyGroup.add(cres);
          break;
        }
        case 'cross_pendant': {
          const cv = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.12, 0.03), this.materials.goldMetal);
          cv.position.set(0, 0.6, 0.2);
          const ch = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.03), this.materials.goldMetal);
          ch.position.set(0, 0.64, 0.2);
          bodyGroup.add(cv, ch);
          break;
        }
        case 'jade_pendant': {
          const pendant = new THREE.Mesh(this._cachedGeoms.pendantGeom, this.materials.jade);
          pendant.position.set(0, 0.7, 0.18);
          bodyGroup.add(pendant);
          break;
        }
        case 'jade_earrings': {
          const eL = new THREE.Mesh(new THREE.SphereGeometry(0.03, 4, 4), this.materials.jade);
          eL.position.set(-0.22, 0.9, 0);
          const eR = eL.clone(); eR.position.set(0.22, 0.9, 0);
          bodyGroup.add(eL, eR);
          break;
        }
        case 'obsidian_pendant': {
          const obs = new THREE.Mesh(this._cachedGeoms.pendantGeom, this.materials.obsidian);
          obs.position.set(0, 0.68, 0.18);
          bodyGroup.add(obs);
          break;
        }
        case 'feather_back': {
          if (isMilitary) {
            for (let i = 0; i < 3; i++) {
              const fMat = i % 2 === 0 ? this.materials.featherGreen : this.materials.featherRed;
              const f = new THREE.Mesh(this._cachedGeoms.featherGeom, fMat);
              f.position.set((i - 1) * 0.06, 0.85, -0.2);
              f.rotation.z = (i - 1) * 0.1;
              bodyGroup.add(f);
            }
          }
          break;
        }
        case 'arm_feathers': {
          const fL = new THREE.Mesh(this._cachedGeoms.featherGeom, this.materials.featherGreen);
          fL.position.set(-0.38, 0.6, 0); fL.rotation.z = 0.5;
          const fR = fL.clone(); fR.position.set(0.38, 0.6, 0); fR.rotation.z = -0.5;
          bodyGroup.add(fL, fR);
          break;
        }
        case 'quiver_belt': {
          const qBelt = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.4, 0.04), this.materials.darkLeather);
          qBelt.position.set(0.18, 0.4, -0.12); qBelt.rotation.z = 0.2;
          bodyGroup.add(qBelt);
          break;
        }
        case 'ear_flaps': {
          // Already handled in furHat/hunCap helmets
          break;
        }
        case 'bone_necklace': {
          const chain = new THREE.Mesh(this._cachedGeoms.chainGeom, this.materials.boneWhite);
          chain.position.y = 0.78; chain.rotation.x = Math.PI / 2;
          bodyGroup.add(chain);
          break;
        }
        case 'torque_necklace': {
          const torque = new THREE.Mesh(this._cachedGeoms.chainGeom, this.materials.bronze);
          torque.position.y = 0.8; torque.rotation.x = Math.PI / 2; torque.scale.set(0.9, 0.9, 0.9);
          bodyGroup.add(torque);
          break;
        }
        case 'gold_chain': {
          const gc = new THREE.Mesh(this._cachedGeoms.chainGeom, this.materials.goldMetal);
          gc.position.y = 0.78; gc.rotation.x = Math.PI / 2; gc.scale.set(0.85, 0.85, 0.85);
          bodyGroup.add(gc);
          break;
        }
        case 'skull_belt': {
          const skull = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 4), this.materials.boneWhite);
          skull.position.set(0.22, 0.32, 0.12);
          bodyGroup.add(skull);
          break;
        }
        case 'chainmail_skirt': {
          const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.18, 8), this.materials.chainmailDark);
          skirt.position.y = 0.18;
          bodyGroup.add(skirt);
          break;
        }
        case 'arm_guards': {
          const guardMat = this.materials[config.armorAccent] || this.materials.iron;
          const gL = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.18, 5), guardMat);
          gL.position.set(-0.35, 0.45, 0);
          const gR = gL.clone(); gR.position.set(0.35, 0.45, 0);
          bodyGroup.add(gL, gR);
          break;
        }
      }
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
      const lod = new THREE.LOD();
      const treeType = Math.random();

      // --- HELPER TO CREATE CROSSED PLANES ---
      const createCrossPlanes = (width, height, py, material) => {
        const subGroup = new THREE.Group();
        const geom = new THREE.PlaneGeometry(width, height);
        
        const plane1 = new THREE.Mesh(geom, material);
        plane1.position.y = height / 2;
        plane1.castShadow = true;
        
        const plane2 = plane1.clone();
        plane2.rotation.y = Math.PI / 2;
        
        subGroup.add(plane1, plane2);
        subGroup.position.y = py - height / 2;
        return subGroup;
      };

      // -----------------------------------------------------------
      // HIGH LOD (0 - 35)
      // -----------------------------------------------------------
      const highMesh = new THREE.Group();
      if (treeType < 0.33) {
        // Pine High LOD
        const trunkGeom = new THREE.CylinderGeometry(0.12, 0.28, 1.6, 10);
        const trunk = new THREE.Mesh(trunkGeom, this.materials.trunk);
        trunk.position.y = 0.8;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        highMesh.add(trunk);

        // 3 Layers of crossed planes for bushy coniferous feel
        highMesh.add(createCrossPlanes(2.0, 1.6, 1.8, this.materials.darkLeaves));
        highMesh.add(createCrossPlanes(1.5, 1.3, 2.6, this.materials.leaves1));
        highMesh.add(createCrossPlanes(1.0, 1.0, 3.3, this.materials.leaves2));
      } else if (treeType < 0.66) {
        // Oak High LOD
        const trunkGeom = new THREE.CylinderGeometry(0.2, 0.35, 1.3, 10);
        const trunk = new THREE.Mesh(trunkGeom, this.materials.trunk);
        trunk.position.y = 0.65;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        highMesh.add(trunk);

        // Multi-cluster foliage for round dense look
        const c1 = createCrossPlanes(2.5, 2.5, 2.2, this.materials.oakLeaves);
        const c2 = createCrossPlanes(1.6, 1.6, 1.8, this.materials.oakLeaves);
        c2.position.set(0.5, 1.8 - 0.8, 0.3);
        const c3 = createCrossPlanes(1.5, 1.5, 1.9, this.materials.oakLeaves);
        c3.position.set(-0.5, 1.9 - 0.75, -0.4);
        highMesh.add(c1, c2, c3);
      } else {
        // Sakura High LOD
        const trunkGeom = new THREE.CylinderGeometry(0.15, 0.25, 1.4, 10);
        const trunk = new THREE.Mesh(trunkGeom, this.materials.trunk);
        trunk.position.y = 0.7;
        trunk.rotation.z = 0.1;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        highMesh.add(trunk);

        // Sakura branches (simple high-detail)
        const branchGeom = new THREE.CylinderGeometry(0.08, 0.12, 1.0, 6);
        const branch1 = new THREE.Mesh(branchGeom, this.materials.trunk);
        branch1.position.set(0.35, 1.1, 0);
        branch1.rotation.z = -0.55;
        branch1.castShadow = true;
        const branch2 = new THREE.Mesh(branchGeom, this.materials.trunk);
        branch2.position.set(-0.35, 1.2, 0.2);
        branch2.rotation.z = 0.65;
        branch2.rotation.x = -0.3;
        branch2.castShadow = true;
        highMesh.add(branch1, branch2);

        // Pink cherry blossom clusters
        const c1 = createCrossPlanes(2.2, 2.2, 2.0, this.materials.sakuraLeaves);
        const c2 = createCrossPlanes(1.6, 1.6, 1.6, this.materials.sakuraLeaves);
        c2.position.set(0.5, 1.6 - 0.8, 0.2);
        const c3 = createCrossPlanes(1.5, 1.5, 1.7, this.materials.sakuraLeaves);
        c3.position.set(-0.5, 1.7 - 0.75, -0.4);
        highMesh.add(c1, c2, c3);
      }

      // -----------------------------------------------------------
      // MEDIUM LOD (35 - 80)
      // -----------------------------------------------------------
      const medMesh = new THREE.Group();
      if (treeType < 0.33) {
        // Pine Med LOD
        const trunkGeom = new THREE.CylinderGeometry(0.12, 0.28, 1.6, 6);
        const trunk = new THREE.Mesh(trunkGeom, this.materials.trunk);
        trunk.position.y = 0.8;
        trunk.castShadow = true;
        medMesh.add(trunk);

        // 2 Layers of crossed planes
        medMesh.add(createCrossPlanes(1.8, 1.5, 2.0, this.materials.leaves1));
        medMesh.add(createCrossPlanes(1.2, 1.2, 2.8, this.materials.leaves2));
      } else if (treeType < 0.66) {
        // Oak Med LOD
        const trunkGeom = new THREE.CylinderGeometry(0.2, 0.35, 1.3, 6);
        const trunk = new THREE.Mesh(trunkGeom, this.materials.trunk);
        trunk.position.y = 0.65;
        trunk.castShadow = true;
        medMesh.add(trunk);

        // 2 clusters
        const c1 = createCrossPlanes(2.4, 2.4, 2.1, this.materials.oakLeaves);
        const c2 = createCrossPlanes(1.5, 1.5, 1.7, this.materials.oakLeaves);
        c2.position.set(0.4, 1.7 - 0.75, -0.3);
        medMesh.add(c1, c2);
      } else {
        // Sakura Med LOD
        const trunkGeom = new THREE.CylinderGeometry(0.15, 0.25, 1.4, 6);
        const trunk = new THREE.Mesh(trunkGeom, this.materials.trunk);
        trunk.position.y = 0.7;
        trunk.castShadow = true;
        medMesh.add(trunk);

        // 2 clusters
        const c1 = createCrossPlanes(2.0, 2.0, 1.9, this.materials.sakuraLeaves);
        const c2 = createCrossPlanes(1.4, 1.4, 1.5, this.materials.sakuraLeaves);
        c2.position.set(0.4, 1.5 - 0.7, 0.2);
        medMesh.add(c1, c2);
      }

      // -----------------------------------------------------------
      // LOW LOD (80+)
      // -----------------------------------------------------------
      const lowMesh = new THREE.Group();
      if (treeType < 0.33) {
        // Pine Low LOD - Flat cylinder and solid green cone (highly optimized, no alpha testing)
        const trunkGeom = new THREE.CylinderGeometry(0.12, 0.28, 1.6, 4);
        const trunk = new THREE.Mesh(trunkGeom, this.materials.trunk);
        trunk.position.y = 0.8;
        trunk.castShadow = true;
        lowMesh.add(trunk);

        const leafGeom = new THREE.ConeGeometry(0.85, 2.2, 4);
        const leaves = new THREE.Mesh(leafGeom, this.materials.moss);
        leaves.position.y = 2.1;
        leaves.castShadow = true;
        lowMesh.add(leaves);
      } else if (treeType < 0.66) {
        // Oak Low LOD - Flat cylinder and solid green dodecahedron
        const trunkGeom = new THREE.CylinderGeometry(0.2, 0.35, 1.3, 4);
        const trunk = new THREE.Mesh(trunkGeom, this.materials.trunk);
        trunk.position.y = 0.65;
        trunk.castShadow = true;
        lowMesh.add(trunk);

        const leafGeom = new THREE.DodecahedronGeometry(1.2, 0);
        const leaves = new THREE.Mesh(leafGeom, this.materials.moss);
        leaves.position.y = 1.95;
        leaves.castShadow = true;
        lowMesh.add(leaves);
      } else {
        // Sakura Low LOD - Flat cylinder and solid pink dodecahedron
        const trunkGeom = new THREE.CylinderGeometry(0.15, 0.25, 1.4, 4);
        const trunk = new THREE.Mesh(trunkGeom, this.materials.trunk);
        trunk.position.y = 0.7;
        trunk.castShadow = true;
        lowMesh.add(trunk);

        const leafGeom = new THREE.DodecahedronGeometry(1.15, 0);
        const leaves = new THREE.Mesh(leafGeom, this.materials.solidSakura);
        leaves.position.y = 1.85;
        leaves.castShadow = true;
        lowMesh.add(leaves);
      }

      lod.addLevel(highMesh, 0);
      lod.addLevel(medMesh, 35);
      lod.addLevel(lowMesh, 80);
      
      lod.castShadow = true;
      lod.receiveShadow = true;

      return lod;
    } 
    else if (type === 'gold') {
      // Rich gold mine with detailed rock base and glowing crystals
      
      // Base rock cluster (larger, more detailed)
      const baseGeom = new THREE.DodecahedronGeometry(0.9);
      const base = new THREE.Mesh(baseGeom, this.materials.rock);
      base.position.y = 0.35;
      base.scale.set(1.3, 0.65, 1.3);
      base.castShadow = true;
      base.receiveShadow = true;
      group.add(base);
      
      // Secondary rock mound
      const base2Geom = new THREE.DodecahedronGeometry(0.6);
      const base2 = new THREE.Mesh(base2Geom, this.materials.darkRock);
      base2.position.set(0.4, 0.2, -0.3);
      base2.scale.set(1.0, 0.5, 1.0);
      base2.castShadow = true;
      group.add(base2);

      // Gold crystals — more of them, varied sizes, with emissive glow
      const crystalConfigs = [
        { pos: [0.45, 0.55, 0.3], rot: [0.5, 0.2, 0.3], scale: [0.28, 0.55, 0.28] },
        { pos: [-0.45, 0.45, -0.3], rot: [-0.6, 0.5, -0.4], scale: [0.22, 0.5, 0.22] },
        { pos: [0.1, 0.75, -0.4], rot: [-0.2, 0.8, 0.8], scale: [0.28, 0.6, 0.28] },
        { pos: [-0.3, 0.55, 0.45], rot: [0.4, -0.5, -0.7], scale: [0.2, 0.45, 0.2] },
        { pos: [0.55, 0.3, -0.2], rot: [0.8, 0.1, 0.5], scale: [0.24, 0.45, 0.24] },
        { pos: [-0.15, 0.85, 0.1], rot: [0.3, 0.6, 0.2], scale: [0.18, 0.5, 0.18] },
        { pos: [0.3, 0.4, 0.5], rot: [-0.4, 0.3, 0.6], scale: [0.15, 0.35, 0.15] }
      ];

      crystalConfigs.forEach(cfg => {
        const cryGeom = new THREE.OctahedronGeometry(1);
        const cry = new THREE.Mesh(cryGeom, this.materials.goldCrystal);
        cry.position.set(...cfg.pos);
        cry.rotation.set(...cfg.rot);
        cry.scale.set(...cfg.scale);
        cry.castShadow = true;
        group.add(cry);
      });
      
      // Gold dust / small flecks scattered on rock
      for (let f = 0; f < 4; f++) {
        const fleckGeom = new THREE.SphereGeometry(0.06, 4, 4);
        const fleck = new THREE.Mesh(fleckGeom, this.materials.goldCrystal);
        fleck.position.set(
          (Math.random() - 0.5) * 1.2,
          0.35 + Math.random() * 0.15,
          (Math.random() - 0.5) * 1.2
        );
        group.add(fleck);
      }
    } 
    else if (type === 'stone') {
      // Layered stone quarry with moss patches
      const rockConfigs = [
        { pos: [0, 0.4, 0], scale: [0.85, 0.6, 0.85], rot: [0.2, 0.5, 0.1], mat: this.materials.rock },
        { pos: [0.45, 0.25, 0.35], scale: [0.5, 0.38, 0.5], rot: [-0.4, 0.2, 0.8], mat: this.materials.darkRock },
        { pos: [-0.45, 0.3, -0.25], scale: [0.55, 0.42, 0.6], rot: [0.6, -0.3, 0.2], mat: this.materials.rock },
        { pos: [0.15, 0.2, -0.55], scale: [0.45, 0.32, 0.45], rot: [0.1, 0.9, -0.4], mat: this.materials.darkRock },
        { pos: [-0.3, 0.15, 0.5], scale: [0.35, 0.28, 0.38], rot: [0.3, -0.6, 0.5], mat: this.materials.rock }
      ];

      rockConfigs.forEach(cfg => {
        const rockGeom = new THREE.DodecahedronGeometry(1);
        const rock = new THREE.Mesh(rockGeom, cfg.mat);
        rock.position.set(...cfg.pos);
        rock.scale.set(...cfg.scale);
        rock.rotation.set(...cfg.rot);
        rock.castShadow = true;
        rock.receiveShadow = true;
        group.add(rock);
      });
      
      // Moss patches on top of stones
      for (let m = 0; m < 2; m++) {
        const mossGeom = new THREE.SphereGeometry(0.25, 4, 4);
        const moss = new THREE.Mesh(mossGeom, this.materials.moss);
        moss.position.set(
          (Math.random() - 0.5) * 0.6,
          0.45 + Math.random() * 0.1,
          (Math.random() - 0.5) * 0.6
        );
        moss.scale.set(1.2, 0.3, 1.2);
        group.add(moss);
      }
    }
    else if (type === 'sheep') {
      // Slain/dead sheep carcass lying flat on ground
      const bodyGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.75, 6);
      const woolMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.95 });
      const body = new THREE.Mesh(bodyGeom, woolMat);
      body.position.set(0, 0.15, 0);
      body.rotation.z = Math.PI / 2; // lie flat
      body.castShadow = true;
      group.add(body);

      const headGeom = new THREE.SphereGeometry(0.14, 5, 5);
      const skinMat = this.materials.clothesDark;
      const head = new THREE.Mesh(headGeom, skinMat);
      head.position.set(0.38, 0.12, 0.1);
      group.add(head);
    }
    else if (type === 'fish') {
      // School of fish swimming (cones pointing in circular directions)
      const fishGeom = new THREE.ConeGeometry(0.12, 0.35, 4);
      const fishColors = [
        0xff6a00, // Vibrant orange clownfish
        0xffdf00, // Golden yellow tang
        0x00dfff, // Neon blue damsel
        0xff3366  // Pink damsel
      ];
      const offsets = [
        { pos: [-0.3, -0.6, 0.2], rot: [Math.PI / 2, 0.5, 0] },
        { pos: [0.3, -0.5, -0.3], rot: [Math.PI / 2, -1.2, 0] },
        { pos: [-0.1, -0.7, -0.4], rot: [Math.PI / 2, 2.1, 0] }
      ];
      offsets.forEach((cfg, idx) => {
        const fishColor = fishColors[idx % fishColors.length];
        const fishMat = new THREE.MeshStandardMaterial({ 
          color: fishColor, 
          metalness: 0.8, 
          roughness: 0.2,
          emissive: fishColor,
          emissiveIntensity: 0.25 // slight glow underwater
        });
        const fish = new THREE.Mesh(fishGeom, fishMat);
        fish.position.set(...cfg.pos);
        fish.rotation.set(...cfg.rot);
        group.add(fish);
      });
    }

    return group;
  }

  // -------------------------------------------------------------
  // UNIT MODELS
  // -------------------------------------------------------------
  createUnitMesh(type, playerId, civ = 'inggris', age = 'dark', upgradeLvl = 0, carryingRelic = false) {
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

    // --- CIVILIZATION-SPECIFIC HEADGEAR ---
    this.addCivHeadgear(bodyGroup, civ, type, age, teamMat);
    this.addCivBodyDetails(bodyGroup, civ, type, age, teamMat);

    // Pauldrons & Knee armor details for Military Units (AoE style)
    const isMilitary = ['swordsman', 'footKnight', 'knight', 'heavyCavalry', 'horseArcher', 'archer', 'spearman', 'skirmisher', 'scoutCavalry', 'camelRider', 'cavalryArcher'].includes(type);
    if (isMilitary) {
      const armorMat = age === 'imperial' ? this.materials.goldMetal : this.materials.iron;
      const pauldronGeom = new THREE.SphereGeometry(0.12, 6, 6, 0, Math.PI * 2, 0, Math.PI / 2);
      
      const pauldronL = new THREE.Mesh(pauldronGeom, armorMat);
      pauldronL.position.set(-0.35, 0.72, 0);
      pauldronL.rotation.z = Math.PI / 4;
      pauldronL.castShadow = true;
      bodyGroup.add(pauldronL);

      const pauldronR = new THREE.Mesh(pauldronGeom, armorMat);
      pauldronR.position.set(0.35, 0.72, 0);
      pauldronR.rotation.z = -Math.PI / 4;
      pauldronR.castShadow = true;
      bodyGroup.add(pauldronR);

      const poleynGeom = new THREE.SphereGeometry(0.08, 6, 6);
      const poleynL = new THREE.Mesh(poleynGeom, armorMat);
      poleynL.position.set(-0.2, 0.22, 0.1);
      poleynL.castShadow = true;
      bodyGroup.add(poleynL);

      const poleynR = new THREE.Mesh(poleynGeom, armorMat);
      poleynR.position.set(0.2, 0.22, 0.1);
      poleynR.castShadow = true;
      bodyGroup.add(poleynR);
    }

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

    // -------------------------------------------------------
    // ARCHER MODEL
    // -------------------------------------------------------
    else if (type === 'archer') {
      // Light leather armor vest
      const vestGeom = new THREE.CylinderGeometry(0.26, 0.22, 0.55, 6);
      const vestMat = age === 'imperial' ? this.materials.goldMetal : (age === 'castle' ? this.materials.iron : this.materials.clothesDark);
      const vest = new THREE.Mesh(vestGeom, vestMat);
      vest.position.y = 0.5;
      vest.castShadow = true;
      bodyGroup.add(vest);

      // Leather hood/cap
      if (age !== 'dark') {
        const capGeom = new THREE.SphereGeometry(0.22, 6, 6, 0, Math.PI * 2, 0, Math.PI / 2);
        const cap = new THREE.Mesh(capGeom, this.materials.clothesDark);
        cap.position.y = 0.95;
        bodyGroup.add(cap);
      }

      // ---- LEFT ARM with BOW ----
      const leftArm = new THREE.Group();
      leftArm.name = "leftArm";
      leftArm.position.set(-0.35, 0.55, 0);

      const lArmGeom = new THREE.CylinderGeometry(0.07, 0.07, 0.38, 4);
      const lArm = new THREE.Mesh(lArmGeom, this.materials.skin);
      lArm.position.y = -0.12;
      leftArm.add(lArm);

      // Bow body — bent arc using a Torus segment
      const bowGroup = new THREE.Group();
      bowGroup.name = "bow";
      bowGroup.position.set(-0.1, -0.3, 0.15);
      bowGroup.rotation.z = Math.PI / 2;

      const bowRadius = 0.55;
      const bowTube = 0.035;
      const bowGeom = new THREE.TorusGeometry(bowRadius, bowTube, 6, 12, Math.PI * 0.85);
      const bowMat = age === 'imperial' ? this.materials.goldMetal : this.materials.woodDark;
      const bowMesh = new THREE.Mesh(bowGeom, bowMat);
      bowMesh.castShadow = true;
      bowGroup.add(bowMesh);

      // Bowstring — thin cylinder spanning the tips
      const stringLen = 2 * bowRadius * Math.sin(Math.PI * 0.85 / 2);
      const stringGeom = new THREE.CylinderGeometry(0.008, 0.008, stringLen, 3);
      const stringMat = new THREE.MeshStandardMaterial({ color: 0xddccaa, roughness: 0.6 });
      const bowstring = new THREE.Mesh(stringGeom, stringMat);
      bowstring.name = "bowstring";
      bowstring.position.set(bowRadius * Math.cos(Math.PI * 0.85 / 2), 0, 0);
      bowstring.rotation.z = Math.PI * 0.075;
      bowGroup.add(bowstring);

      leftArm.add(bowGroup);
      bodyGroup.add(leftArm);

      // ---- RIGHT ARM (draw arm) ----
      const rightArm = new THREE.Group();
      rightArm.name = "rightArm";
      rightArm.position.set(0.35, 0.55, 0);

      const rArmGeom = new THREE.CylinderGeometry(0.07, 0.07, 0.38, 4);
      const rArm = new THREE.Mesh(rArmGeom, this.materials.skin);
      rArm.position.y = -0.12;
      rightArm.add(rArm);

      // Arrow in hand
      const arrowGroup = new THREE.Group();
      arrowGroup.name = "weapon";
      arrowGroup.position.set(0, -0.3, 0.05);
      arrowGroup.rotation.x = Math.PI / 2;

      const shaftGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.75, 3);
      const shaftMat = new THREE.MeshStandardMaterial({ color: 0xc4a050 });
      const shaft = new THREE.Mesh(shaftGeom, shaftMat);
      shaft.rotation.x = Math.PI / 2;
      arrowGroup.add(shaft);

      // Arrowhead
      const tipGeom = new THREE.ConeGeometry(0.04, 0.12, 4);
      const tipMat = age === 'imperial' ? this.materials.goldMetal : this.materials.iron;
      const tip = new THREE.Mesh(tipGeom, tipMat);
      tip.position.z = 0.42;
      tip.rotation.x = Math.PI / 2;
      arrowGroup.add(tip);

      // Fletching feathers
      const fletchGeom = new THREE.BoxGeometry(0.06, 0.002, 0.1);
      const fletchMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
      for (let f = 0; f < 3; f++) {
        const fletch = new THREE.Mesh(fletchGeom, fletchMat);
        fletch.position.z = -0.3;
        fletch.rotation.z = (f / 3) * Math.PI * 2;
        arrowGroup.add(fletch);
      }

      rightArm.add(arrowGroup);
      bodyGroup.add(rightArm);

      // ---- QUIVER on back with 3 arrows ----
      const quiverGroup = new THREE.Group();
      quiverGroup.position.set(0.05, 0.5, -0.25);
      quiverGroup.rotation.x = 0.15;

      const quiverGeom = new THREE.CylinderGeometry(0.1, 0.08, 0.55, 6);
      const quiver = new THREE.Mesh(quiverGeom, this.materials.clothesDark);
      quiver.castShadow = true;
      quiverGroup.add(quiver);

      // Arrows sticking out top
      for (let a = 0; a < 3; a++) {
        const qArrowGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.35, 3);
        const qArrow = new THREE.Mesh(qArrowGeom, shaftMat);
        qArrow.position.set((a - 1) * 0.04, 0.38, 0);
        qArrow.castShadow = true;
        quiverGroup.add(qArrow);

        const qTipGeom = new THREE.ConeGeometry(0.025, 0.06, 4);
        const qTip = new THREE.Mesh(qTipGeom, this.materials.iron);
        qTip.position.set((a - 1) * 0.04, 0.58, 0);
        quiverGroup.add(qTip);
      }

      // Quiver strap across chest
      const strapGeom = new THREE.BoxGeometry(0.04, 0.6, 0.04);
      const strap = new THREE.Mesh(strapGeom, this.materials.clothesDark);
      strap.position.set(-0.12, 0.1, 0.1);
      strap.rotation.z = 0.4;
      quiverGroup.add(strap);

      bodyGroup.add(quiverGroup);

      // Team colored armband
      const bandGeom = new THREE.CylinderGeometry(0.14, 0.14, 0.06, 6);
      const band = new THREE.Mesh(bandGeom, teamMat);
      band.position.set(0.35, 0.65, 0);
      bodyGroup.add(band);
    }
    // -------------------------------------------------------
    // KNIGHT MODEL (Mounted on Horse)
    // -------------------------------------------------------
    else if (type === 'knight') {
      // === HORSE BODY ===
      const horseGroup = new THREE.Group();
      horseGroup.name = "horse";

      // Horse barrel body
      const barrelGeom = new THREE.CylinderGeometry(0.45, 0.4, 1.6, 8);
      barrelGeom.rotateZ(Math.PI / 2);
      const horseMat = new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 0.7, metalness: 0.0 });
      const barrel = new THREE.Mesh(barrelGeom, horseMat);
      barrel.position.set(0, 0.75, 0);
      barrel.castShadow = true;
      barrel.receiveShadow = true;
      horseGroup.add(barrel);

      // Saddle blanket
      const blanketGeom = new THREE.BoxGeometry(0.6, 0.08, 0.95);
      const blanket = new THREE.Mesh(blanketGeom, teamMat);
      blanket.position.set(0, 1.0, 0);
      blanket.castShadow = true;
      horseGroup.add(blanket);

      // Horse neck
      const neckGeom = new THREE.CylinderGeometry(0.2, 0.3, 0.7, 6);
      const neck = new THREE.Mesh(neckGeom, horseMat);
      neck.position.set(0, 1.1, 0.7);
      neck.rotation.x = -0.6;
      neck.castShadow = true;
      horseGroup.add(neck);

      // Horse head
      const headGeom2 = new THREE.BoxGeometry(0.28, 0.25, 0.5);
      const horseHead = new THREE.Mesh(headGeom2, horseMat);
      horseHead.position.set(0, 1.35, 1.05);
      horseHead.rotation.x = -0.2;
      horseHead.castShadow = true;
      horseGroup.add(horseHead);

      // Horse ears
      const earGeom = new THREE.ConeGeometry(0.06, 0.15, 4);
      const earL = new THREE.Mesh(earGeom, horseMat);
      earL.position.set(-0.1, 1.52, 1.0);
      horseGroup.add(earL);
      const earR = earL.clone();
      earR.position.x = 0.1;
      horseGroup.add(earR);

      // Horse muzzle / snout
      const snoutGeom = new THREE.BoxGeometry(0.2, 0.18, 0.2);
      const snout = new THREE.Mesh(snoutGeom, new THREE.MeshStandardMaterial({ color: 0x4a2a10, roughness: 0.8 }));
      snout.position.set(0, 1.28, 1.32);
      horseGroup.add(snout);

      // Tail
      const tailGeom = new THREE.CylinderGeometry(0.04, 0.02, 0.6, 4);
      const tailMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
      const tail = new THREE.Mesh(tailGeom, tailMat);
      tail.position.set(0, 0.8, -0.9);
      tail.rotation.x = 0.5;
      tail.castShadow = true;
      horseGroup.add(tail);

      // === HORSE LEGS (4 legs, named for animation) ===
      const legGeom = new THREE.CylinderGeometry(0.08, 0.06, 0.65, 5);
      const hoofGeom = new THREE.CylinderGeometry(0.09, 0.09, 0.08, 5);
      const hoofMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.6 });

      const legPositions = [
        { name: "legFL", pos: [-0.22, 0.35, 0.5] },
        { name: "legFR", pos: [0.22, 0.35, 0.5] },
        { name: "legBL", pos: [-0.22, 0.35, -0.5] },
        { name: "legBR", pos: [0.22, 0.35, -0.5] }
      ];

      legPositions.forEach(cfg => {
        const legGroup = new THREE.Group();
        legGroup.name = cfg.name;
        legGroup.position.set(...cfg.pos);

        const leg = new THREE.Mesh(legGeom, horseMat);
        leg.position.y = -0.05;
        leg.castShadow = true;
        legGroup.add(leg);

        const hoof = new THREE.Mesh(hoofGeom, hoofMat);
        hoof.position.y = -0.35;
        legGroup.add(hoof);

        horseGroup.add(legGroup);
      });

      bodyGroup.add(horseGroup);

      // === KNIGHT RIDER on top of horse ===
      const riderGroup = new THREE.Group();
      riderGroup.name = "rider";
      riderGroup.position.set(0, 1.1, 0);

      // Rider torso (armored)
      const rTorsoGeom = new THREE.CylinderGeometry(0.28, 0.22, 0.6, 6);
      const armorMat = age === 'imperial' ? this.materials.goldMetal : (age === 'castle' ? this.materials.iron : teamMat);
      const rTorso = new THREE.Mesh(rTorsoGeom, armorMat);
      rTorso.position.y = 0.3;
      rTorso.castShadow = true;
      riderGroup.add(rTorso);

      // Rider head
      const rHeadGeom = new THREE.SphereGeometry(0.18, 8, 8);
      const rHead = new THREE.Mesh(rHeadGeom, this.materials.skin);
      rHead.position.y = 0.75;
      rHead.castShadow = true;
      riderGroup.add(rHead);

      // Helmet with visor
      const helmGeom = new THREE.CylinderGeometry(0.2, 0.22, 0.18, 6);
      const helmMat = age === 'imperial' ? this.materials.goldMetal : this.materials.iron;
      const helm = new THREE.Mesh(helmGeom, helmMat);
      helm.position.y = 0.88;
      helm.castShadow = true;
      riderGroup.add(helm);

      // Helmet plume (team color)
      const plumeGeom = new THREE.BoxGeometry(0.06, 0.2, 0.28);
      const plume = new THREE.Mesh(plumeGeom, teamMat);
      plume.position.set(0, 1.02, -0.04);
      riderGroup.add(plume);

      // ---- RIGHT ARM with LANCE ----
      const rRightArm = new THREE.Group();
      rRightArm.name = "rightArm";
      rRightArm.position.set(0.35, 0.35, 0);

      const rArmGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.35, 4);
      const rArmMesh = new THREE.Mesh(rArmGeom, armorMat);
      rArmMesh.position.y = -0.1;
      rRightArm.add(rArmMesh);

      // Lance
      const lanceGroup = new THREE.Group();
      lanceGroup.name = "weapon";
      lanceGroup.position.set(0, -0.2, 0.1);
      lanceGroup.rotation.x = Math.PI / 2.5;

      const lanceShaftGeom = new THREE.CylinderGeometry(0.035, 0.03, 2.2, 5);
      const lanceShaft = new THREE.Mesh(lanceShaftGeom, this.materials.woodDark);
      lanceShaft.rotation.x = Math.PI / 2;
      lanceShaft.castShadow = true;
      lanceGroup.add(lanceShaft);

      // Lance tip
      const lanceTipGeom = new THREE.ConeGeometry(0.07, 0.25, 5);
      const lanceTip = new THREE.Mesh(lanceTipGeom, helmMat);
      lanceTip.position.z = 1.2;
      lanceTip.rotation.x = Math.PI / 2;
      lanceTip.castShadow = true;
      lanceGroup.add(lanceTip);

      // Pennant on lance
      const pennantGeom = new THREE.BoxGeometry(0.22, 0.02, 0.14);
      const pennant = new THREE.Mesh(pennantGeom, teamMat);
      pennant.position.z = 0.95;
      lanceGroup.add(pennant);

      rRightArm.add(lanceGroup);
      riderGroup.add(rRightArm);

      // ---- LEFT ARM with SHIELD ----
      const rLeftArm = new THREE.Group();
      rLeftArm.name = "leftArm";
      rLeftArm.position.set(-0.35, 0.35, 0);

      const lArmGeom2 = new THREE.CylinderGeometry(0.08, 0.08, 0.35, 4);
      const lArmMesh = new THREE.Mesh(lArmGeom2, armorMat);
      lArmMesh.position.y = -0.1;
      rLeftArm.add(lArmMesh);

      // Kite shield
      const shieldGeom = new THREE.BoxGeometry(0.08, 0.65, 0.45);
      const shield = new THREE.Mesh(shieldGeom, teamMat);
      shield.position.set(-0.12, -0.1, 0.05);
      shield.castShadow = true;

      // Shield boss
      const sBossGeom = new THREE.SphereGeometry(0.1, 6, 6);
      const sBoss = new THREE.Mesh(sBossGeom, helmMat);
      sBoss.position.x = -0.04;
      shield.add(sBoss);

      // Shield cross emblem
      const emblemVGeom = new THREE.BoxGeometry(0.09, 0.4, 0.04);
      const emblem = new THREE.Mesh(emblemVGeom, this.materials.goldMetal);
      emblem.position.x = -0.045;
      shield.add(emblem);
      const emblemHGeom = new THREE.BoxGeometry(0.09, 0.04, 0.25);
      const emblemH = new THREE.Mesh(emblemHGeom, this.materials.goldMetal);
      emblemH.position.set(-0.045, 0.05, 0);
      shield.add(emblemH);

      rLeftArm.add(shield);
      riderGroup.add(rLeftArm);

      bodyGroup.add(riderGroup);

      // Remove default feet for knight (horse has legs)
      const existLeftFoot = bodyGroup.getObjectByName("leftFoot");
      const existRightFoot = bodyGroup.getObjectByName("rightFoot");
      if (existLeftFoot) bodyGroup.remove(existLeftFoot);
      if (existRightFoot) bodyGroup.remove(existRightFoot);
    }
    // -------------------------------------------------------
    // FOOT KNIGHT MODEL (Sword & Shield Infantry)
    // -------------------------------------------------------
    else if (type === 'footKnight') {
      const armorMat = age === 'imperial' ? this.materials.goldMetal : this.materials.iron;
      const plateGeom = new THREE.CylinderGeometry(0.30, 0.24, 0.72, 6);
      const breastplate = new THREE.Mesh(plateGeom, armorMat);
      breastplate.position.y = 0.48;
      breastplate.castShadow = true;
      bodyGroup.add(breastplate);

      // Heavy Iron/Gold Helmet
      const helmGeom = new THREE.CylinderGeometry(0.22, 0.23, 0.28, 6);
      const helm = new THREE.Mesh(helmGeom, armorMat);
      helm.position.y = 0.95;
      helm.castShadow = true;
      bodyGroup.add(helm);

      // Visor slot (narrow dark band)
      const visorGeom = new THREE.BoxGeometry(0.24, 0.05, 0.24);
      const visor = new THREE.Mesh(visorGeom, this.materials.clothesDark);
      visor.position.set(0, 0.98, 0.12);
      bodyGroup.add(visor);

      // Helmet plume (team colored)
      const plumeGeom = new THREE.BoxGeometry(0.05, 0.22, 0.2);
      const plume = new THREE.Mesh(plumeGeom, teamMat);
      plume.position.set(0, 1.15, -0.05);
      bodyGroup.add(plume);

      // ---- RIGHT ARM with BROADSWORD ----
      const rightArm = new THREE.Group();
      rightArm.name = "rightArm";
      rightArm.position.set(0.35, 0.55, 0);

      const armGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 4);
      const arm = new THREE.Mesh(armGeom, armorMat);
      arm.position.y = -0.15;
      arm.castShadow = true;
      rightArm.add(arm);

      // Heavy Broadsword
      const swordGroup = new THREE.Group();
      swordGroup.name = "weapon";
      swordGroup.position.set(0, -0.32, 0.08);
      swordGroup.rotation.x = Math.PI / 2.2;

      // Handle
      const hiltGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.25, 4);
      const hilt = new THREE.Mesh(hiltGeom, this.materials.woodDark);
      hilt.rotation.x = Math.PI / 2;
      swordGroup.add(hilt);

      // Guard
      const guardGeom = new THREE.BoxGeometry(0.22, 0.03, 0.03);
      const guard = new THREE.Mesh(guardGeom, armorMat);
      guard.position.z = 0.12;
      swordGroup.add(guard);

      // Blade
      const bladeGeom = new THREE.BoxGeometry(0.05, 0.015, 0.85);
      const blade = new THREE.Mesh(bladeGeom, this.materials.iron);
      blade.position.z = 0.55;
      blade.castShadow = true;
      swordGroup.add(blade);

      rightArm.add(swordGroup);
      bodyGroup.add(rightArm);

      // ---- LEFT ARM with LARGE HEATER SHIELD ----
      const leftArm = new THREE.Group();
      leftArm.name = "leftArm";
      leftArm.position.set(-0.35, 0.55, 0);

      const lArm = new THREE.Mesh(armGeom.clone(), armorMat);
      lArm.position.y = -0.15;
      leftArm.add(lArm);

      // Large Heater Shield
      const shieldGeom = new THREE.BoxGeometry(0.06, 0.75, 0.48);
      const shield = new THREE.Mesh(shieldGeom, teamMat);
      shield.position.set(-0.15, -0.12, 0.15);
      shield.rotation.y = 0.25;
      shield.castShadow = true;

      // Shield boss/rim
      const rimGeom = new THREE.BoxGeometry(0.07, 0.77, 0.03);
      const rim = new THREE.Mesh(rimGeom, armorMat);
      rim.position.set(0.01, 0, 0.24);
      shield.add(rim);

      const crossGeom = new THREE.BoxGeometry(0.08, 0.35, 0.02);
      const cross = new THREE.Mesh(crossGeom, armorMat);
      cross.position.set(0.01, 0.08, 0);
      shield.add(cross);

      leftArm.add(shield);
      bodyGroup.add(leftArm);
    }
    // -------------------------------------------------------
    // HEAVY CAVALRY MODEL (Armored Horse + Spiked Mace Rider)
    // -------------------------------------------------------
    else if (type === 'heavyCavalry') {
      const armorMat = age === 'imperial' ? this.materials.goldMetal : this.materials.iron;

      // === ARMORED HORSE ===
      const horseGroup = new THREE.Group();
      horseGroup.name = "horse";

      // Horse body
      const barrelGeom = new THREE.CylinderGeometry(0.48, 0.44, 1.65, 8);
      barrelGeom.rotateZ(Math.PI / 2);
      const horseMat = new THREE.MeshStandardMaterial({ color: 0x4e2700, roughness: 0.75 });
      const barrel = new THREE.Mesh(barrelGeom, horseMat);
      barrel.position.set(0, 0.75, 0);
      barrel.castShadow = true;
      barrel.receiveShadow = true;
      horseGroup.add(barrel);

      // Heavy chainmail barding blanket covering horse sides
      const bardingGeom = new THREE.BoxGeometry(0.68, 0.65, 1.25);
      const barding = new THREE.Mesh(bardingGeom, this.materials.iron);
      barding.position.set(0, 0.52, 0.05);
      barding.castShadow = true;
      horseGroup.add(barding);

      // Team colored saddle cloth
      const blanketGeom = new THREE.BoxGeometry(0.65, 0.08, 1.0);
      const blanket = new THREE.Mesh(blanketGeom, teamMat);
      blanket.position.set(0, 1.0, 0.02);
      horseGroup.add(blanket);

      // Horse neck
      const neckGeom = new THREE.CylinderGeometry(0.2, 0.3, 0.75, 6);
      const neck = new THREE.Mesh(neckGeom, horseMat);
      neck.position.set(0, 1.12, 0.72);
      neck.rotation.x = -0.6;
      neck.castShadow = true;
      horseGroup.add(neck);

      // Horse head
      const headGeom2 = new THREE.BoxGeometry(0.3, 0.28, 0.52);
      const horseHead = new THREE.Mesh(headGeom2, horseMat);
      horseHead.position.set(0, 1.38, 1.08);
      horseHead.rotation.x = -0.2;
      horseHead.castShadow = true;
      horseGroup.add(horseHead);

      // Steel plate chamfron (face protection plate) for horse head
      const facePlateGeom = new THREE.BoxGeometry(0.24, 0.08, 0.44);
      const facePlate = new THREE.Mesh(facePlateGeom, armorMat);
      facePlate.position.set(0, 1.48, 1.22);
      facePlate.rotation.x = -0.2;
      facePlate.castShadow = true;
      horseGroup.add(facePlate);

      // Snout
      const snoutGeom = new THREE.BoxGeometry(0.2, 0.18, 0.2);
      const snout = new THREE.Mesh(snoutGeom, new THREE.MeshStandardMaterial({ color: 0x221100, roughness: 0.8 }));
      snout.position.set(0, 1.30, 1.34);
      horseGroup.add(snout);

      // Tail
      const tailGeom = new THREE.CylinderGeometry(0.04, 0.02, 0.65, 4);
      const tailMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
      const tail = new THREE.Mesh(tailGeom, tailMat);
      tail.position.set(0, 0.8, -0.92);
      tail.rotation.x = 0.5;
      tail.castShadow = true;
      horseGroup.add(tail);

      // Leg positions
      const legGeom = new THREE.CylinderGeometry(0.09, 0.07, 0.65, 5);
      const hoofGeom = new THREE.CylinderGeometry(0.1, 0.1, 0.08, 5);
      const hoofMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6 });

      const legPositions = [
        { name: "legFL", pos: [-0.24, 0.35, 0.5] },
        { name: "legFR", pos: [0.24, 0.35, 0.5] },
        { name: "legBL", pos: [-0.24, 0.35, -0.5] },
        { name: "legBR", pos: [0.24, 0.35, -0.5] }
      ];

      legPositions.forEach(cfg => {
        const legGroup = new THREE.Group();
        legGroup.name = cfg.name;
        legGroup.position.set(...cfg.pos);

        const leg = new THREE.Mesh(legGeom, horseMat);
        leg.position.y = -0.05;
        leg.castShadow = true;
        legGroup.add(leg);

        // Steel leg guard on horse leg
        const guardPlateGeom = new THREE.CylinderGeometry(0.1, 0.08, 0.35, 5);
        const guardPlate = new THREE.Mesh(guardPlateGeom, armorMat);
        guardPlate.position.y = -0.05;
        legGroup.add(guardPlate);

        const hoof = new THREE.Mesh(hoofGeom, hoofMat);
        hoof.position.y = -0.35;
        legGroup.add(hoof);

        horseGroup.add(legGroup);
      });

      bodyGroup.add(horseGroup);

      // === HEAVY KNIGHT RIDER ===
      const riderGroup = new THREE.Group();
      riderGroup.name = "rider";
      riderGroup.position.set(0, 1.1, 0);

      const rTorsoGeom = new THREE.CylinderGeometry(0.3, 0.24, 0.62, 6);
      const rTorso = new THREE.Mesh(rTorsoGeom, armorMat);
      rTorso.position.y = 0.3;
      rTorso.castShadow = true;
      riderGroup.add(rTorso);

      const rHeadGeom = new THREE.SphereGeometry(0.18, 8, 8);
      const rHead = new THREE.Mesh(rHeadGeom, this.materials.skin);
      rHead.position.y = 0.75;
      riderGroup.add(rHead);

      // Closed Visor Helmet
      const helmGeom = new THREE.CylinderGeometry(0.2, 0.22, 0.22, 6);
      const helm = new THREE.Mesh(helmGeom, armorMat);
      helm.position.y = 0.88;
      helm.castShadow = true;
      riderGroup.add(helm);

      const visorGeom2 = new THREE.BoxGeometry(0.22, 0.05, 0.2);
      const visor2 = new THREE.Mesh(visorGeom2, this.materials.clothesDark);
      visor2.position.set(0, 0.9, 0.1);
      riderGroup.add(visor2);

      const plumeGeom = new THREE.BoxGeometry(0.06, 0.25, 0.28);
      const plume = new THREE.Mesh(plumeGeom, teamMat);
      plume.position.set(0, 1.05, -0.05);
      riderGroup.add(plume);

      // ---- RIGHT ARM with SPIKED MACE (weapon) ----
      const rRightArm = new THREE.Group();
      rRightArm.name = "rightArm";
      rRightArm.position.set(0.36, 0.35, 0);

      const rArmGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.35, 4);
      const rArmMesh = new THREE.Mesh(rArmGeom, armorMat);
      rArmMesh.position.y = -0.1;
      rRightArm.add(rArmMesh);

      // Spiked Mace (War Mace)
      const maceGroup = new THREE.Group();
      maceGroup.name = "weapon";
      maceGroup.position.set(0, -0.2, 0.1);
      maceGroup.rotation.x = Math.PI / 2.5;

      const shaftGeom = new THREE.CylinderGeometry(0.024, 0.024, 0.8, 5);
      const shaft = new THREE.Mesh(shaftGeom, this.materials.woodDark);
      shaft.rotation.x = Math.PI / 2;
      shaft.castShadow = true;
      maceGroup.add(shaft);

      const maceHeadGeom = new THREE.DodecahedronGeometry(0.18);
      const maceHead = new THREE.Mesh(maceHeadGeom, armorMat);
      maceHead.position.z = 0.42;
      maceHead.castShadow = true;
      maceGroup.add(maceHead);

      rRightArm.add(maceGroup);
      riderGroup.add(rRightArm);

      // ---- LEFT ARM with KITE SHIELD ----
      const rLeftArm = new THREE.Group();
      rLeftArm.name = "leftArm";
      rLeftArm.position.set(-0.36, 0.35, 0);

      const lArmMesh = new THREE.Mesh(rArmGeom.clone(), armorMat);
      lArmMesh.position.y = -0.1;
      rLeftArm.add(lArmMesh);

      const shieldGeom = new THREE.BoxGeometry(0.08, 0.65, 0.45);
      const shield = new THREE.Mesh(shieldGeom, teamMat);
      shield.position.set(-0.12, -0.1, 0.05);
      shield.rotation.y = 0.1;
      shield.castShadow = true;

      const sBossGeom = new THREE.SphereGeometry(0.1, 6, 6);
      const sBoss = new THREE.Mesh(sBossGeom, armorMat);
      sBoss.position.set(-0.045, 0, 0);
      shield.add(sBoss);

      rLeftArm.add(shield);
      riderGroup.add(rLeftArm);

      bodyGroup.add(riderGroup);

      // Remove default feet
      const existLeftFoot = bodyGroup.getObjectByName("leftFoot");
      const existRightFoot = bodyGroup.getObjectByName("rightFoot");
      if (existLeftFoot) bodyGroup.remove(existLeftFoot);
      if (existRightFoot) bodyGroup.remove(existRightFoot);
    }
    // -------------------------------------------------------
    // HORSE ARCHER MODEL (Cavalry Archer)
    // -------------------------------------------------------
    else if (type === 'horseArcher') {
      // === LIGHT HORSE ===
      const horseGroup = new THREE.Group();
      horseGroup.name = "horse";

      // Horse body
      const barrelGeom = new THREE.CylinderGeometry(0.42, 0.38, 1.55, 8);
      barrelGeom.rotateZ(Math.PI / 2);
      const horseMat = new THREE.MeshStandardMaterial({ color: 0xc4a070, roughness: 0.8 });
      const barrel = new THREE.Mesh(barrelGeom, horseMat);
      barrel.position.set(0, 0.72, 0);
      barrel.castShadow = true;
      barrel.receiveShadow = true;
      horseGroup.add(barrel);

      // Saddle blanket (team colored)
      const blanketGeom = new THREE.BoxGeometry(0.58, 0.08, 0.85);
      const blanket = new THREE.Mesh(blanketGeom, teamMat);
      blanket.position.set(0, 0.94, 0);
      horseGroup.add(blanket);

      // Horse neck
      const neckGeom = new THREE.CylinderGeometry(0.18, 0.28, 0.7, 6);
      const neck = new THREE.Mesh(neckGeom, horseMat);
      neck.position.set(0, 1.08, 0.65);
      neck.rotation.x = -0.6;
      neck.castShadow = true;
      horseGroup.add(neck);

      // Horse head
      const headGeom2 = new THREE.BoxGeometry(0.26, 0.24, 0.48);
      const horseHead = new THREE.Mesh(headGeom2, horseMat);
      horseHead.position.set(0, 1.32, 1.0);
      horseHead.rotation.x = -0.2;
      horseHead.castShadow = true;
      horseGroup.add(horseHead);

      // Snout
      const snoutGeom = new THREE.BoxGeometry(0.18, 0.16, 0.18);
      const snout = new THREE.Mesh(snoutGeom, new THREE.MeshStandardMaterial({ color: 0x3d2a1a, roughness: 0.8 }));
      snout.position.set(0, 1.25, 1.25);
      horseGroup.add(snout);

      // Tail
      const tailGeom = new THREE.CylinderGeometry(0.03, 0.015, 0.6, 4);
      const tailMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
      const tail = new THREE.Mesh(tailGeom, tailMat);
      tail.position.set(0, 0.78, -0.88);
      tail.rotation.x = 0.5;
      tail.castShadow = true;
      horseGroup.add(tail);

      // Leg positions
      const legGeom = new THREE.CylinderGeometry(0.08, 0.06, 0.65, 5);
      const hoofGeom = new THREE.CylinderGeometry(0.09, 0.09, 0.08, 5);
      const hoofMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.6 });

      const legPositions = [
        { name: "legFL", pos: [-0.20, 0.32, 0.48] },
        { name: "legFR", pos: [0.20, 0.32, 0.48] },
        { name: "legBL", pos: [-0.20, 0.32, -0.48] },
        { name: "legBR", pos: [0.20, 0.32, -0.48] }
      ];

      legPositions.forEach(cfg => {
        const legGroup = new THREE.Group();
        legGroup.name = cfg.name;
        legGroup.position.set(...cfg.pos);

        const leg = new THREE.Mesh(legGeom, horseMat);
        leg.position.y = -0.05;
        leg.castShadow = true;
        legGroup.add(leg);

        const hoof = new THREE.Mesh(hoofGeom, hoofMat);
        hoof.position.y = -0.35;
        legGroup.add(hoof);

        horseGroup.add(legGroup);
      });

      bodyGroup.add(horseGroup);

      // === MOUNTED ARCHER RIDER ===
      const riderGroup = new THREE.Group();
      riderGroup.name = "rider";
      riderGroup.position.set(0, 1.05, 0);

      // Light leather armor vest
      const vestGeom = new THREE.CylinderGeometry(0.24, 0.2, 0.55, 6);
      const vestMat = age === 'imperial' ? this.materials.goldMetal : (age === 'castle' ? this.materials.iron : this.materials.clothesDark);
      const vest = new THREE.Mesh(vestGeom, vestMat);
      vest.position.y = 0.3;
      vest.castShadow = true;
      riderGroup.add(vest);

      // Head
      const rHeadGeom = new THREE.SphereGeometry(0.18, 8, 8);
      const rHead = new THREE.Mesh(rHeadGeom, this.materials.skin);
      rHead.position.y = 0.72;
      riderGroup.add(rHead);

      // Hood/cap
      const capGeom = new THREE.SphereGeometry(0.2, 6, 6, 0, Math.PI * 2, 0, Math.PI / 2);
      const cap = new THREE.Mesh(capGeom, this.materials.clothesDark);
      cap.position.y = 0.72;
      riderGroup.add(cap);

      // ---- LEFT ARM with BOW ----
      const leftArm = new THREE.Group();
      leftArm.name = "leftArm";
      leftArm.position.set(-0.32, 0.35, 0);

      const lArmGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.35, 4);
      const lArm = new THREE.Mesh(lArmGeom, this.materials.skin);
      lArm.position.y = -0.1;
      leftArm.add(lArm);

      // Bow body
      const bowGroup = new THREE.Group();
      bowGroup.name = "bow";
      bowGroup.position.set(-0.1, -0.25, 0.12);
      bowGroup.rotation.z = Math.PI / 2.2;

      const bowRadius = 0.5;
      const bowTube = 0.03;
      const bowGeom = new THREE.TorusGeometry(bowRadius, bowTube, 6, 12, Math.PI * 0.85);
      const bowMat = age === 'imperial' ? this.materials.goldMetal : this.materials.woodDark;
      const bowMesh = new THREE.Mesh(bowGeom, bowMat);
      bowMesh.castShadow = true;
      bowGroup.add(bowMesh);

      // Bowstring
      const stringLen = 2 * bowRadius * Math.sin(Math.PI * 0.85 / 2);
      const stringGeom = new THREE.CylinderGeometry(0.006, 0.006, stringLen, 3);
      const stringMat = new THREE.MeshStandardMaterial({ color: 0xddccaa, roughness: 0.6 });
      const bowstring = new THREE.Mesh(stringGeom, stringMat);
      bowstring.name = "bowstring";
      bowstring.position.set(bowRadius * Math.cos(Math.PI * 0.85 / 2), 0, 0);
      bowstring.rotation.z = Math.PI * 0.075;
      bowGroup.add(bowstring);

      leftArm.add(bowGroup);
      riderGroup.add(leftArm);

      // ---- RIGHT ARM ----
      const rightArm = new THREE.Group();
      rightArm.name = "rightArm";
      rightArm.position.set(0.32, 0.35, 0);

      const rArm = new THREE.Mesh(lArmGeom.clone(), this.materials.skin);
      rArm.position.y = -0.1;
      rightArm.add(rArm);

      // Arrow in hand
      const arrowGroup = new THREE.Group();
      arrowGroup.name = "weapon";
      arrowGroup.position.set(0, -0.25, 0.05);
      arrowGroup.rotation.x = Math.PI / 2;

      const shaftGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.7, 3);
      const shaftMat = new THREE.MeshStandardMaterial({ color: 0xc4a050 });
      const shaft = new THREE.Mesh(shaftGeom, shaftMat);
      shaft.rotation.x = Math.PI / 2;
      arrowGroup.add(shaft);

      const tipGeom = new THREE.ConeGeometry(0.03, 0.1, 4);
      const tipMat = age === 'imperial' ? this.materials.goldMetal : this.materials.iron;
      const tip = new THREE.Mesh(tipGeom, tipMat);
      tip.position.z = 0.38;
      tip.rotation.x = Math.PI / 2;
      arrowGroup.add(tip);

      const fletchGeom = new THREE.BoxGeometry(0.05, 0.002, 0.08);
      const fletchMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
      for (let f = 0; f < 3; f++) {
        const fletch = new THREE.Mesh(fletchGeom, fletchMat);
        fletch.position.z = -0.28;
        fletch.rotation.z = (f / 3) * Math.PI * 2;
        arrowGroup.add(fletch);
      }

      rightArm.add(arrowGroup);
      riderGroup.add(rightArm);

      // ---- QUIVER on back with 3 arrows ----
      const quiverGroup = new THREE.Group();
      quiverGroup.position.set(0.05, 0.3, -0.22);
      quiverGroup.rotation.x = 0.15;

      const quiverGeom = new THREE.CylinderGeometry(0.09, 0.07, 0.5, 6);
      const quiver = new THREE.Mesh(quiverGeom, this.materials.clothesDark);
      quiver.castShadow = true;
      quiverGroup.add(quiver);

      for (let a = 0; a < 3; a++) {
        const qArrowGeom = new THREE.CylinderGeometry(0.01, 0.01, 0.3, 3);
        const qArrow = new THREE.Mesh(qArrowGeom, shaftMat);
        qArrow.position.set((a - 1) * 0.035, 0.35, 0);
        qArrow.castShadow = true;
        quiverGroup.add(qArrow);

        const qTipGeom = new THREE.ConeGeometry(0.02, 0.05, 4);
        const qTip = new THREE.Mesh(qTipGeom, this.materials.iron);
        qTip.position.set((a - 1) * 0.035, 0.53, 0);
        quiverGroup.add(qTip);
      }

      // Quiver strap
      const strapGeom = new THREE.BoxGeometry(0.03, 0.55, 0.03);
      const strap = new THREE.Mesh(strapGeom, this.materials.clothesDark);
      strap.position.set(-0.1, 0.05, 0.08);
      strap.rotation.z = 0.4;
      quiverGroup.add(strap);

      riderGroup.add(quiverGroup);
      bodyGroup.add(riderGroup);

      // Remove default feet
      const existLeftFoot = bodyGroup.getObjectByName("leftFoot");
      const existRightFoot = bodyGroup.getObjectByName("rightFoot");
      if (existLeftFoot) bodyGroup.remove(existLeftFoot);
      if (existRightFoot) bodyGroup.remove(existRightFoot);
    }
    // -------------------------------------------------------
    // FISHING SHIP MODEL
    // -------------------------------------------------------
    else if (type === 'fishingShip') {
      // Remove default human elements
      const existLeftFoot = bodyGroup.getObjectByName("leftFoot");
      const existRightFoot = bodyGroup.getObjectByName("rightFoot");
      if (existLeftFoot) bodyGroup.remove(existLeftFoot);
      if (existRightFoot) bodyGroup.remove(existRightFoot);

      const torsoMesh = bodyGroup.children.find(c => c.geometry && c.geometry.type === 'CylinderGeometry');
      const headMesh = bodyGroup.children.find(c => c.geometry && c.geometry.type === 'SphereGeometry');
      if (torsoMesh) bodyGroup.remove(torsoMesh);
      if (headMesh) bodyGroup.remove(headMesh);

      // Construct Boat Hull
      const hullGroup = new THREE.Group();
      hullGroup.name = "boat";

      // Main base hull
      const mainHullGeom = new THREE.BoxGeometry(0.72, 0.45, 1.4);
      const hull = new THREE.Mesh(mainHullGeom, this.materials.woodDark);
      hull.position.y = 0.22;
      hull.castShadow = true;
      hullGroup.add(hull);

      // Pointy bow (front)
      const bowGeom = new THREE.ConeGeometry(0.36, 0.55, 4);
      const bow = new THREE.Mesh(bowGeom, this.materials.woodDark);
      bow.position.set(0, 0.22, 0.95);
      bow.rotation.x = Math.PI / 2;
      bow.rotation.y = Math.PI / 4;
      bow.castShadow = true;
      hullGroup.add(bow);

      // Mast
      const mastGeom = new THREE.CylinderGeometry(0.04, 0.04, 1.35, 4);
      const mast = new THREE.Mesh(mastGeom, this.materials.woodDark);
      mast.position.set(0, 0.9, 0.1);
      mast.castShadow = true;
      hullGroup.add(mast);

      // Sail (team-colored triangular shape)
      const sailGeom = new THREE.BoxGeometry(0.02, 0.9, 0.55);
      const sail = new THREE.Mesh(sailGeom, teamMat);
      sail.position.set(0, 1.25, 0.25);
      sail.rotation.y = 0.2;
      sail.castShadow = true;
      hullGroup.add(sail);

      // Fishing nets/rods hanging at back
      const netGeom = new THREE.BoxGeometry(0.55, 0.15, 0.28);
      const net = new THREE.Mesh(netGeom, this.materials.clothesDark);
      net.position.set(0, 0.35, -0.65);
      net.castShadow = true;
      hullGroup.add(net);

      bodyGroup.add(hullGroup);
    }
    else if (type === 'transportShip') {
      const existLeftFoot = bodyGroup.getObjectByName("leftFoot");
      const existRightFoot = bodyGroup.getObjectByName("rightFoot");
      if (existLeftFoot) bodyGroup.remove(existLeftFoot);
      if (existRightFoot) bodyGroup.remove(existRightFoot);

      const torsoMesh = bodyGroup.children.find(c => c.geometry && c.geometry.type === 'CylinderGeometry');
      const headMesh = bodyGroup.children.find(c => c.geometry && c.geometry.type === 'SphereGeometry');
      if (torsoMesh) bodyGroup.remove(torsoMesh);
      if (headMesh) bodyGroup.remove(headMesh);

      const hullGroup = new THREE.Group();
      hullGroup.name = "boat";

      const mainHull = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 1.8), this.materials.woodDark);
      mainHull.position.y = 0.22;
      mainHull.castShadow = true;
      hullGroup.add(mainHull);

      const bow = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.65, 4), this.materials.woodDark);
      bow.position.set(0, 0.22, 1.25);
      bow.rotation.x = Math.PI / 2;
      bow.rotation.y = Math.PI / 4;
      bow.castShadow = true;
      hullGroup.add(bow);

      const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.9), teamMat);
      cabin.position.set(0, 0.6, -0.2);
      cabin.castShadow = true;
      hullGroup.add(cabin);

      bodyGroup.add(hullGroup);
    }
    else if (type === 'galley') {
      const existLeftFoot = bodyGroup.getObjectByName("leftFoot");
      const existRightFoot = bodyGroup.getObjectByName("rightFoot");
      if (existLeftFoot) bodyGroup.remove(existLeftFoot);
      if (existRightFoot) bodyGroup.remove(existRightFoot);

      const torsoMesh = bodyGroup.children.find(c => c.geometry && c.geometry.type === 'CylinderGeometry');
      const headMesh = bodyGroup.children.find(c => c.geometry && c.geometry.type === 'SphereGeometry');
      if (torsoMesh) bodyGroup.remove(torsoMesh);
      if (headMesh) bodyGroup.remove(headMesh);

      const hullGroup = new THREE.Group();
      hullGroup.name = "boat";

      const mainHull = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.45, 1.6), this.materials.woodDark);
      mainHull.position.y = 0.22;
      mainHull.castShadow = true;
      hullGroup.add(mainHull);

      const bow = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.6, 4), this.materials.woodDark);
      bow.position.set(0, 0.22, 1.1);
      bow.rotation.x = Math.PI / 2;
      bow.rotation.y = Math.PI / 4;
      bow.castShadow = true;
      hullGroup.add(bow);

      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.45, 4), this.materials.woodDark);
      mast.position.set(0, 0.95, 0.1);
      hullGroup.add(mast);

      const sail = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.9, 0.7), teamMat);
      sail.position.set(0, 1.3, 0.2);
      sail.rotation.y = 0.15;
      hullGroup.add(sail);

      const oarGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.6, 4);
      for (let i = 0; i < 3; i++) {
        const oarL = new THREE.Mesh(oarGeom, this.materials.woodDark);
        oarL.position.set(-0.55, 0.2, -0.3 + i * 0.35);
        oarL.rotation.z = Math.PI / 3;
        const oarR = new THREE.Mesh(oarGeom, this.materials.woodDark);
        oarR.position.set(0.55, 0.2, -0.3 + i * 0.35);
        oarR.rotation.z = -Math.PI / 3;
        hullGroup.add(oarL, oarR);
      }

      bodyGroup.add(hullGroup);
    }
    else if (type === 'fireShip') {
      const existLeftFoot = bodyGroup.getObjectByName("leftFoot");
      const existRightFoot = bodyGroup.getObjectByName("rightFoot");
      if (existLeftFoot) bodyGroup.remove(existLeftFoot);
      if (existRightFoot) bodyGroup.remove(existRightFoot);

      const torsoMesh = bodyGroup.children.find(c => c.geometry && c.geometry.type === 'CylinderGeometry');
      const headMesh = bodyGroup.children.find(c => c.geometry && c.geometry.type === 'SphereGeometry');
      if (torsoMesh) bodyGroup.remove(torsoMesh);
      if (headMesh) bodyGroup.remove(headMesh);

      const hullGroup = new THREE.Group();
      hullGroup.name = "boat";

      const mainHull = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 1.5), this.materials.woodDark);
      mainHull.position.y = 0.25;
      mainHull.castShadow = true;
      hullGroup.add(mainHull);

      const bow = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.6, 4), this.materials.woodDark);
      bow.position.set(0, 0.25, 1.05);
      bow.rotation.x = Math.PI / 2;
      bow.rotation.y = Math.PI / 4;
      bow.castShadow = true;
      hullGroup.add(bow);

      const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 6), this.materials.bronze || this.materials.goldMetal);
      nozzle.position.set(0, 0.3, 1.4);
      nozzle.rotation.x = Math.PI / 2;
      hullGroup.add(nozzle);

      const flame = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), this.materials.fire);
      flame.position.set(0, 0.3, 1.65);
      hullGroup.add(flame);

      bodyGroup.add(hullGroup);
    }
    else if (type === 'demolitionShip') {
      const existLeftFoot = bodyGroup.getObjectByName("leftFoot");
      const existRightFoot = bodyGroup.getObjectByName("rightFoot");
      if (existLeftFoot) bodyGroup.remove(existLeftFoot);
      if (existRightFoot) bodyGroup.remove(existRightFoot);

      const torsoMesh = bodyGroup.children.find(c => c.geometry && c.geometry.type === 'CylinderGeometry');
      const headMesh = bodyGroup.children.find(c => c.geometry && c.geometry.type === 'SphereGeometry');
      if (torsoMesh) bodyGroup.remove(torsoMesh);
      if (headMesh) bodyGroup.remove(headMesh);

      const hullGroup = new THREE.Group();
      hullGroup.name = "boat";

      const mainHull = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 1.3), this.materials.woodDark);
      mainHull.position.y = 0.22;
      mainHull.castShadow = true;
      hullGroup.add(mainHull);

      const bow = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.5, 4), this.materials.woodDark);
      bow.position.set(0, 0.22, 0.9);
      bow.rotation.x = Math.PI / 2;
      bow.rotation.y = Math.PI / 4;
      bow.castShadow = true;
      hullGroup.add(bow);

      const barrelGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.35, 6);
      const b1 = new THREE.Mesh(barrelGeom, this.materials.clothesDark);
      b1.position.set(-0.15, 0.45, 0);
      const b2 = b1.clone();
      b2.position.x = 0.15;
      const b3 = b1.clone();
      b3.position.set(0, 0.45, -0.35);
      hullGroup.add(b1, b2, b3);

      const fuse = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 4), this.materials.fire);
      fuse.position.set(0, 0.65, -0.15);
      hullGroup.add(fuse);

      bodyGroup.add(hullGroup);
    }
    else if (type === 'cannonGalleon') {
      const existLeftFoot = bodyGroup.getObjectByName("leftFoot");
      const existRightFoot = bodyGroup.getObjectByName("rightFoot");
      if (existLeftFoot) bodyGroup.remove(existLeftFoot);
      if (existRightFoot) bodyGroup.remove(existRightFoot);

      const torsoMesh = bodyGroup.children.find(c => c.geometry && c.geometry.type === 'CylinderGeometry');
      const headMesh = bodyGroup.children.find(c => c.geometry && c.geometry.type === 'SphereGeometry');
      if (torsoMesh) bodyGroup.remove(torsoMesh);
      if (headMesh) bodyGroup.remove(headMesh);

      const hullGroup = new THREE.Group();
      hullGroup.name = "boat";

      const mainHull = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.55, 1.8), this.materials.woodDark);
      mainHull.position.y = 0.27;
      mainHull.castShadow = true;
      hullGroup.add(mainHull);

      const bow = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.75, 4), this.materials.woodDark);
      bow.position.set(0, 0.27, 1.27);
      bow.rotation.x = Math.PI / 2;
      bow.rotation.y = Math.PI / 4;
      bow.castShadow = true;
      hullGroup.add(bow);

      const carriage = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.6), this.materials.woodDark);
      carriage.position.set(0, 0.6, 0.15);
      hullGroup.add(carriage);

      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.8, 8), this.materials.iron);
      barrel.position.set(0, 0.75, 0.35);
      barrel.rotation.x = Math.PI / 2.15;
      hullGroup.add(barrel);

      const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.7, 4), this.materials.woodDark);
      flagPole.position.set(0, 0.6, -0.85);
      hullGroup.add(flagPole);

      const flag = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.18, 0.02), teamMat);
      flag.position.set(0.15, 0.9, -0.85);
      hullGroup.add(flag);

      bodyGroup.add(hullGroup);
    }
    else if (type === 'spearman') {
      const armorGeom = new THREE.CylinderGeometry(0.28, 0.24, 0.45, 6);
      const armorMat = age === 'imperial' ? this.materials.goldMetal : (age === 'castle' ? this.materials.iron : this.materials.clothesDark);
      const armor = new THREE.Mesh(armorGeom, armorMat);
      armor.position.y = 0.55;
      armor.castShadow = true;
      bodyGroup.add(armor);

      if (upgradeLvl > 0) {
        const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.15, 6), this.materials.iron);
        helm.position.y = 1.05;
        bodyGroup.add(helm);
      }

      const rightArm = new THREE.Group();
      rightArm.name = "rightArm";
      rightArm.position.set(0.38, 0.55, 0);

      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.4, 4), this.materials.skin);
      arm.position.y = -0.15;
      rightArm.add(arm);

      const spear = new THREE.Group();
      spear.name = "weapon";
      spear.position.set(0, -0.3, 0.1);
      spear.rotation.x = Math.PI / 2.2;

      const shaftLen = upgradeLvl === 2 ? 1.8 : (upgradeLvl === 1 ? 1.6 : 1.4);
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, shaftLen, 4), this.materials.woodDark);
      shaft.rotation.x = Math.PI / 2;
      spear.add(shaft);

      let headGeom;
      if (upgradeLvl === 2) {
        headGeom = new THREE.BoxGeometry(0.2, 0.35, 0.05);
      } else {
        headGeom = new THREE.ConeGeometry(0.06, 0.25, 4);
      }
      const head = new THREE.Mesh(headGeom, this.materials.iron);
      head.position.z = shaftLen / 2;
      head.rotation.x = Math.PI / 2;
      spear.add(head);

      rightArm.add(spear);
      bodyGroup.add(rightArm);
    }
    else if (type === 'skirmisher') {
      const armor = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.22, 0.45, 6), this.materials.clothes);
      armor.position.y = 0.55;
      bodyGroup.add(armor);

      const rightArm = new THREE.Group();
      rightArm.name = "rightArm";
      rightArm.position.set(0.38, 0.55, 0);

      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.4, 4), this.materials.skin);
      arm.position.y = -0.15;
      rightArm.add(arm);

      const javelin = new THREE.Group();
      javelin.name = "weapon";
      javelin.position.set(0, -0.2, 0.1);
      javelin.rotation.x = Math.PI / 2.3;

      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.9, 4), this.materials.woodDark);
      shaft.rotation.x = Math.PI / 2;
      javelin.add(shaft);

      const head = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.15, 4), this.materials.iron);
      head.position.z = 0.45;
      head.rotation.x = Math.PI / 2;
      javelin.add(head);

      rightArm.add(javelin);
      bodyGroup.add(rightArm);

      const leftArm = new THREE.Group();
      leftArm.name = "leftArm";
      leftArm.position.set(-0.38, 0.55, 0);

      const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.4, 4), this.materials.skin);
      lArm.position.y = -0.15;
      leftArm.add(lArm);

      const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.04, 8), teamMat);
      shield.position.set(-0.1, -0.15, 0.05);
      shield.rotation.z = Math.PI / 2;
      leftArm.add(shield);

      bodyGroup.add(leftArm);
    }
    else if (type === 'scoutCavalry') {
      const horseGroup = new THREE.Group();
      horseGroup.name = "horse";

      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.35, 1.4, 8), this.materials.woodDark);
      barrel.position.set(0, 0.72, 0);
      barrel.rotation.z = Math.PI / 2;
      barrel.castShadow = true;
      horseGroup.add(barrel);

      const blanket = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.8), teamMat);
      blanket.position.set(0, 0.95, 0);
      horseGroup.add(blanket);

      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.25, 0.65, 6), this.materials.woodDark);
      neck.position.set(0, 1.05, 0.6);
      neck.rotation.x = -0.6;
      horseGroup.add(neck);

      const horseHead = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.45), this.materials.woodDark);
      horseHead.position.set(0, 1.28, 0.92);
      horseHead.rotation.x = -0.2;
      horseGroup.add(horseHead);

      const legGeom = new THREE.CylinderGeometry(0.06, 0.05, 0.62, 5);
      const legPositions = [
        { name: "legFL", pos: [-0.2, 0.31, 0.4] },
        { name: "legFR", pos: [0.2, 0.31, 0.4] },
        { name: "legBL", pos: [-0.2, 0.31, -0.4] },
        { name: "legBR", pos: [0.2, 0.31, -0.4] }
      ];
      legPositions.forEach(cfg => {
        const legGroup = new THREE.Group();
        legGroup.name = cfg.name;
        legGroup.position.set(...cfg.pos);
        const leg = new THREE.Mesh(legGeom, this.materials.woodDark);
        leg.position.y = -0.05;
        legGroup.add(leg);
        horseGroup.add(legGroup);
      });

      bodyGroup.add(horseGroup);

      const riderGroup = new THREE.Group();
      riderGroup.name = "rider";
      riderGroup.position.set(0, 1.05, 0);

      const rTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.55, 6), this.materials.clothes);
      rTorso.position.y = 0.28;
      riderGroup.add(rTorso);

      const rHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), this.materials.skin);
      rHead.position.y = 0.68;
      riderGroup.add(rHead);

      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 6, 0, Math.PI * 2, 0, Math.PI / 2), teamMat);
      cap.position.y = 0.68;
      riderGroup.add(cap);

      const rightArm = new THREE.Group();
      rightArm.name = "rightArm";
      rightArm.position.set(0.3, 0.35, 0);
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.32, 4), this.materials.skin);
      arm.position.y = -0.1;
      rightArm.add(arm);

      const sword = new THREE.Group();
      sword.name = "weapon";
      sword.position.set(0, -0.22, 0.05);
      sword.rotation.x = Math.PI / 2.3;
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 0.65), this.materials.iron);
      blade.position.z = 0.32;
      sword.add(blade);
      rightArm.add(sword);
      riderGroup.add(rightArm);

      bodyGroup.add(riderGroup);

      const existLeftFoot = bodyGroup.getObjectByName("leftFoot");
      const existRightFoot = bodyGroup.getObjectByName("rightFoot");
      if (existLeftFoot) bodyGroup.remove(existLeftFoot);
      if (existRightFoot) bodyGroup.remove(existRightFoot);
    }
    else if (type === 'camelRider') {
      const camelGroup = new THREE.Group();
      camelGroup.name = "horse";

      const camelMat = new THREE.MeshStandardMaterial({ color: 0xc6a07a, roughness: 0.8 });
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.38, 1.5, 8), camelMat);
      barrel.position.set(0, 0.85, 0);
      barrel.rotation.z = Math.PI / 2;
      barrel.castShadow = true;
      camelGroup.add(barrel);

      const hump = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.45, 6), camelMat);
      hump.position.set(0, 1.25, -0.15);
      hump.rotation.y = Math.PI / 6;
      hump.castShadow = true;
      camelGroup.add(hump);

      const blanket = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.9), teamMat);
      blanket.position.set(0, 1.08, 0);
      camelGroup.add(blanket);

      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 0.9, 6), camelMat);
      neck.position.set(0, 1.25, 0.65);
      neck.rotation.x = -0.4;
      camelGroup.add(neck);

      const camelHead = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.48), camelMat);
      camelHead.position.set(0, 1.58, 0.95);
      camelHead.rotation.x = -0.15;
      camelGroup.add(camelHead);

      const legGeom = new THREE.CylinderGeometry(0.06, 0.05, 0.8, 5);
      const legPositions = [
        { name: "legFL", pos: [-0.2, 0.4, 0.45] },
        { name: "legFR", pos: [0.2, 0.4, 0.45] },
        { name: "legBL", pos: [-0.2, 0.4, -0.45] },
        { name: "legBR", pos: [0.2, 0.4, -0.45] }
      ];
      legPositions.forEach(cfg => {
        const legGroup = new THREE.Group();
        legGroup.name = cfg.name;
        legGroup.position.set(...cfg.pos);
        const leg = new THREE.Mesh(legGeom, camelMat);
        leg.position.y = -0.05;
        legGroup.add(leg);
        camelGroup.add(legGroup);
      });

      bodyGroup.add(camelGroup);

      const riderGroup = new THREE.Group();
      riderGroup.name = "rider";
      riderGroup.position.set(0, 1.15, 0);

      const rTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.55, 6), this.materials.clothesDark);
      rTorso.position.y = 0.28;
      riderGroup.add(rTorso);

      const rHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), this.materials.skin);
      rHead.position.y = 0.68;
      riderGroup.add(rHead);

      const turban = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.12, 8), teamMat);
      turban.position.y = 0.75;
      riderGroup.add(turban);

      const rightArm = new THREE.Group();
      rightArm.name = "rightArm";
      rightArm.position.set(0.3, 0.35, 0);
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.32, 4), this.materials.skin);
      arm.position.y = -0.1;
      rightArm.add(arm);

      const scimitar = new THREE.Group();
      scimitar.name = "weapon";
      scimitar.position.set(0, -0.22, 0.05);
      scimitar.rotation.x = Math.PI / 2.3;
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.75), this.materials.iron);
      blade.position.z = 0.35;
      blade.rotation.y = 0.25;
      scimitar.add(blade);
      rightArm.add(scimitar);
      riderGroup.add(rightArm);

      bodyGroup.add(riderGroup);

      const existLeftFoot = bodyGroup.getObjectByName("leftFoot");
      const existRightFoot = bodyGroup.getObjectByName("rightFoot");
      if (existLeftFoot) bodyGroup.remove(existLeftFoot);
      if (existRightFoot) bodyGroup.remove(existRightFoot);
    }
    else if (type === 'cavalryArcher') {
      const horseGroup = new THREE.Group();
      horseGroup.name = "horse";

      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.36, 1.4, 8), this.materials.woodDark);
      barrel.position.set(0, 0.72, 0);
      barrel.rotation.z = Math.PI / 2;
      barrel.castShadow = true;
      horseGroup.add(barrel);

      const blanket = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.06, 0.85), teamMat);
      blanket.position.set(0, 0.96, 0);
      horseGroup.add(blanket);

      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 0.65, 6), this.materials.woodDark);
      neck.position.set(0, 1.05, 0.6);
      neck.rotation.x = -0.6;
      horseGroup.add(neck);

      const horseHead = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.22, 0.46), this.materials.woodDark);
      horseHead.position.set(0, 1.28, 0.92);
      horseHead.rotation.x = -0.2;
      horseGroup.add(horseHead);

      const legGeom = new THREE.CylinderGeometry(0.06, 0.05, 0.62, 5);
      const legPositions = [
        { name: "legFL", pos: [-0.2, 0.31, 0.4] },
        { name: "legFR", pos: [0.2, 0.31, 0.4] },
        { name: "legBL", pos: [-0.2, 0.31, -0.4] },
        { name: "legBR", pos: [0.2, 0.31, -0.4] }
      ];
      legPositions.forEach(cfg => {
        const legGroup = new THREE.Group();
        legGroup.name = cfg.name;
        legGroup.position.set(...cfg.pos);
        const leg = new THREE.Mesh(legGeom, this.materials.woodDark);
        leg.position.y = -0.05;
        legGroup.add(leg);
        horseGroup.add(legGroup);
      });

      bodyGroup.add(horseGroup);

      const riderGroup = new THREE.Group();
      riderGroup.name = "rider";
      riderGroup.position.set(0, 1.05, 0);

      const rTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.55, 6), this.materials.clothes);
      rTorso.position.y = 0.28;
      riderGroup.add(rTorso);

      const rHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), this.materials.skin);
      rHead.position.y = 0.68;
      riderGroup.add(rHead);

      const hat = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.25, 6), teamMat);
      hat.position.y = 0.85;
      riderGroup.add(hat);

      const leftArm = new THREE.Group();
      leftArm.name = "leftArm";
      leftArm.position.set(-0.3, 0.35, 0);
      const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.32, 4), this.materials.skin);
      lArm.position.y = -0.1;
      leftArm.add(lArm);

      const bowGroup = new THREE.Group();
      bowGroup.name = "bow";
      bowGroup.position.set(-0.08, -0.22, 0.12);
      bowGroup.rotation.z = Math.PI / 2;
      const bowMesh = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.025, 6, 12, Math.PI * 0.85), this.materials.woodDark);
      bowGroup.add(bowMesh);
      leftArm.add(bowGroup);
      riderGroup.add(leftArm);

      const rightArm = new THREE.Group();
      rightArm.name = "rightArm";
      rightArm.position.set(0.3, 0.35, 0);
      const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.32, 4), this.materials.skin);
      rArm.position.y = -0.1;
      rightArm.add(rArm);

      const arrow = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.015, 0.6), this.materials.woodDark);
      arrow.position.set(0, -0.2, 0.05);
      arrow.rotation.x = Math.PI / 2;
      rightArm.add(arrow);
      riderGroup.add(rightArm);

      bodyGroup.add(riderGroup);

      const existLeftFoot = bodyGroup.getObjectByName("leftFoot");
      const existRightFoot = bodyGroup.getObjectByName("rightFoot");
      if (existLeftFoot) bodyGroup.remove(existLeftFoot);
      if (existRightFoot) bodyGroup.remove(existRightFoot);
    }
    else if (type === 'monk') {
      const robeTrim = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.38, 0.25, 6), this.materials.clothesDark);
      robeTrim.position.y = 0.15;
      robeTrim.castShadow = true;
      bodyGroup.add(robeTrim);

      const hood = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), this.materials.clothes);
      hood.position.set(0, 0.98, -0.05);
      bodyGroup.add(hood);

      const rightArm = new THREE.Group();
      rightArm.name = "rightArm";
      rightArm.position.set(0.35, 0.55, 0);
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.4, 4), this.materials.clothes);
      arm.position.y = -0.15;
      rightArm.add(arm);

      if (carryingRelic) {
        const relicGroup = new THREE.Group();
        relicGroup.name = "weapon";
        relicGroup.position.set(-0.25, -0.22, 0.22);
        
        const relicBox = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.32), this.materials.goldMetal);
        relicBox.castShadow = true;
        relicGroup.add(relicBox);
        
        const relicLid = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.18, 4), this.materials.goldCrystal);
        relicLid.position.y = 0.22;
        relicGroup.add(relicLid);
        
        rightArm.add(relicGroup);
      } else {
        const staff = new THREE.Group();
        staff.name = "tool";
        staff.position.set(0, -0.2, 0.1);
        staff.rotation.x = Math.PI / 2.2;
        
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.3, 4), this.materials.woodDark);
        shaft.rotation.x = Math.PI / 2;
        staff.add(shaft);

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.05), this.materials.goldMetal);
        head.position.z = 0.7;
        staff.add(head);

        const vert = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.18, 0.05), this.materials.goldMetal);
        vert.position.z = 0.7;
        vert.rotation.y = Math.PI / 2;
        staff.add(vert);

        rightArm.add(staff);
      }

      bodyGroup.add(rightArm);
    }
    // -------------------------------------------------------
    // SHEEP MODEL (Neutral/Tamed)
    // -------------------------------------------------------
    else if (type === 'sheep') {
      // Remove default human elements
      const existLeftFoot = bodyGroup.getObjectByName("leftFoot");
      const existRightFoot = bodyGroup.getObjectByName("rightFoot");
      if (existLeftFoot) bodyGroup.remove(existLeftFoot);
      if (existRightFoot) bodyGroup.remove(existRightFoot);

      const torsoMesh = bodyGroup.children.find(c => c.geometry && c.geometry.type === 'CylinderGeometry');
      const headMesh = bodyGroup.children.find(c => c.geometry && c.geometry.type === 'SphereGeometry');
      if (torsoMesh) bodyGroup.remove(torsoMesh);
      if (headMesh) bodyGroup.remove(headMesh);

      const sheepGroup = new THREE.Group();
      sheepGroup.name = "sheep";

      // Fluffy white body
      const bodyGeom = new THREE.SphereGeometry(0.35, 8, 8);
      const woolMat = new THREE.MeshStandardMaterial({ color: 0xf3f3f3, roughness: 0.9 });
      const body = new THREE.Mesh(bodyGeom, woolMat);
      body.position.y = 0.38;
      body.scale.set(1.0, 1.0, 1.35);
      body.castShadow = true;
      sheepGroup.add(body);

      // Black Head
      const headGeom = new THREE.BoxGeometry(0.18, 0.18, 0.22);
      const skinMat = this.materials.clothesDark;
      const face = new THREE.Mesh(headGeom, skinMat);
      face.position.set(0, 0.48, 0.65);
      face.castShadow = true;
      sheepGroup.add(face);

      // Fluffy wool cap on head
      const capGeom = new THREE.SphereGeometry(0.12, 6, 6);
      const cap = new THREE.Mesh(capGeom, woolMat);
      cap.position.set(0, 0.58, 0.62);
      sheepGroup.add(cap);

      // Four small black legs
      const legGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.32, 4);
      const legMat = skinMat;
      const legPositions = [
        [-0.15, 0.16, 0.32],
        [0.15, 0.16, 0.32],
        [-0.15, 0.16, -0.32],
        [0.15, 0.16, -0.32]
      ];
      legPositions.forEach((pos, idx) => {
        const leg = new THREE.Mesh(legGeom, legMat);
        leg.name = `leg${idx}`;
        leg.position.set(...pos);
        leg.castShadow = true;
        sheepGroup.add(leg);
      });

      bodyGroup.add(sheepGroup);
    }
    else if (type === 'batteringRam') {
      const ramBody = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 1.6), this.materials.woodDark);
      ramBody.position.y = 0.5;
      ramBody.castShadow = true;
      bodyGroup.add(ramBody);
      
      const roof = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.2, 1.7), this.materials.woodFeudal);
      roof.position.set(0, 0.95, 0);
      roof.rotation.x = 0.1;
      bodyGroup.add(roof);
      
      const wheelGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.15, 8);
      wheelGeom.rotateZ(Math.PI / 2);
      const wheelPositions = [[-0.6, 0.2, -0.5], [0.6, 0.2, -0.5], [-0.6, 0.2, 0.5], [0.6, 0.2, 0.5]];
      wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeom, this.materials.woodDark);
        wheel.position.set(...pos);
        bodyGroup.add(wheel);
      });
      
      const ramHeadMat = upgradeLvl >= 2 ? this.materials.goldMetal : (upgradeLvl === 1 ? this.materials.iron : this.materials.woodDark);
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8), this.materials.woodDark);
      shaft.rotation.x = Math.PI / 2;
      shaft.position.set(0, 0.4, 0.2);
      bodyGroup.add(shaft);
      
      const head = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.4, 8), ramHeadMat);
      head.rotation.x = Math.PI / 2;
      head.position.set(0, 0.4, 1.2);
      bodyGroup.add(head);
    }
    else if (type === 'mangonel') {
      const frameMat = this.materials.woodDark;
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.15, 1.4), frameMat);
      base.position.y = 0.3;
      bodyGroup.add(base);
      
      const wheelGeom = new THREE.CylinderGeometry(0.25, 0.25, 0.12, 8);
      wheelGeom.rotateZ(Math.PI / 2);
      const wheelPositions = [[-0.5, 0.25, -0.4], [0.5, 0.25, -0.4], [-0.5, 0.25, 0.4], [0.5, 0.25, 0.4]];
      wheelPositions.forEach(pos => {
        const w = new THREE.Mesh(wheelGeom, this.materials.woodDark);
        w.position.set(...pos);
        bodyGroup.add(w);
      });
      
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.9, 0.15), frameMat);
      post.position.set(0, 0.7, -0.2);
      bodyGroup.add(post);
      
      const armGroup = new THREE.Group();
      armGroup.position.set(0, 0.4, -0.2);
      armGroup.rotation.x = -Math.PI / 6;
      
      const armShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2), frameMat);
      armShaft.position.y = 0.5;
      armGroup.add(armShaft);
      
      const basket = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.3), upgradeLvl >= 1 ? this.materials.iron : frameMat);
      basket.position.y = 1.1;
      armGroup.add(basket);
      
      const projectileBall = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), this.materials.stone);
      projectileBall.position.set(0, 1.2, 0);
      armGroup.add(projectileBall);
      
      bodyGroup.add(armGroup);
    }
    else if (type === 'scorpion') {
      const frameMat = this.materials.woodDark;
      const carriage = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 1.2), frameMat);
      carriage.position.y = 0.4;
      bodyGroup.add(carriage);
      
      const wheelGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 8);
      wheelGeom.rotateZ(Math.PI / 2);
      [[-0.45, 0.2, -0.3], [0.45, 0.2, -0.3], [-0.45, 0.2, 0.3], [0.45, 0.2, 0.3]].forEach(pos => {
        const w = new THREE.Mesh(wheelGeom, frameMat);
        w.position.set(...pos);
        bodyGroup.add(w);
      });
      
      const metalMat = upgradeLvl >= 1 ? this.materials.goldMetal : this.materials.iron;
      const bowBar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.12), upgradeLvl >= 1 ? metalMat : frameMat);
      bowBar.position.set(0, 0.55, 0.5);
      bodyGroup.add(bowBar);
      
      const track = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 1.1), frameMat);
      track.position.set(0, 0.5, 0.0);
      bodyGroup.add(track);
    }
    else if (type === 'bombardCannon') {
      const frameMat = this.materials.woodDark;
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.2, 1.1), frameMat);
      frame.position.y = 0.35;
      bodyGroup.add(frame);
      
      const wheelGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.15, 8);
      wheelGeom.rotateZ(Math.PI / 2);
      [[-0.45, 0.35, 0.0], [0.45, 0.35, 0.0]].forEach(pos => {
        const w = new THREE.Mesh(wheelGeom, frameMat);
        w.position.set(...pos);
        bodyGroup.add(w);
      });
      
      const barrelMat = upgradeLvl >= 1 ? this.materials.goldMetal : this.materials.iron;
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 1.2, 8), barrelMat);
      barrel.rotation.x = Math.PI / 5;
      barrel.position.set(0, 0.6, 0.15);
      bodyGroup.add(barrel);
    }
    else if (type === 'siegeTower') {
      const frameMat = this.materials.woodDark;
      const tower = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.2, 1.0), frameMat);
      tower.position.y = 1.1;
      tower.castShadow = true;
      bodyGroup.add(tower);
      
      const roof = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.15, 1.1), this.materials.woodFeudal);
      roof.position.y = 2.25;
      bodyGroup.add(roof);
      
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.08), this.materials.woodFeudal);
      door.position.set(0, 1.4, 0.52);
      bodyGroup.add(door);
      
      const wheelGeom = new THREE.CylinderGeometry(0.22, 0.22, 0.12, 8);
      wheelGeom.rotateZ(Math.PI / 2);
      [[-0.55, 0.22, -0.3], [0.55, 0.22, -0.3], [-0.55, 0.22, 0.3], [0.55, 0.22, 0.3]].forEach(pos => {
        const w = new THREE.Mesh(wheelGeom, frameMat);
        w.position.set(...pos);
        bodyGroup.add(w);
      });
    }
    else if (type === 'trebuchet') {
      const frameMat = this.materials.woodDark;
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 1.8), frameMat);
      base.position.y = 0.1;
      bodyGroup.add(base);
      
      const postL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.8, 0.12), frameMat);
      postL.position.set(-0.4, 0.9, 0);
      postL.rotation.z = -0.15;
      
      const postR = postL.clone();
      postR.position.x = 0.4;
      postR.rotation.z = 0.15;
      bodyGroup.add(postL, postR);
      
      const beamGroup = new THREE.Group();
      beamGroup.position.set(0, 1.6, 0);
      beamGroup.rotation.x = -Math.PI / 6;
      
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 2.4), frameMat);
      shaft.position.y = -0.3;
      beamGroup.add(shaft);
      
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 0.8), this.materials.woodFeudal);
      box.position.y = -1.2;
      beamGroup.add(box);
      
      const sling = new THREE.Mesh(new THREE.SphereGeometry(0.15, 6, 6), this.materials.clothes);
      sling.position.set(0, 0.9, 0.1);
      beamGroup.add(sling);
      
      bodyGroup.add(beamGroup);
    }
    else if (type === 'petard') {
      const torsoGeom = new THREE.CylinderGeometry(0.28, 0.22, 0.7, 6);
      const torso = new THREE.Mesh(torsoGeom, teamMat);
      torso.position.y = 0.48;
      bodyGroup.add(torso);
      
      const headGeom = new THREE.SphereGeometry(0.2, 8, 8);
      const head = new THREE.Mesh(headGeom, this.materials.skin);
      head.position.y = 0.95;
      bodyGroup.add(head);
      
      const barrelGroup = new THREE.Group();
      barrelGroup.position.set(0, 0.48, 0.45);
      
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.65, 8), this.materials.woodFeudal);
      barrel.rotation.x = Math.PI / 2;
      barrelGroup.add(barrel);
      
      const band1 = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.05, 8), this.materials.iron);
      band1.rotation.x = Math.PI / 2;
      band1.position.z = -0.2;
      const band2 = band1.clone();
      band2.position.z = 0.2;
      barrelGroup.add(band1, band2);
      
      bodyGroup.add(barrelGroup);
      
      const armGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.4, 4);
      const lArm = new THREE.Mesh(armGeom, this.materials.clothes);
      lArm.position.set(-0.35, 0.55, 0.2);
      lArm.rotation.x = Math.PI / 3;
      lArm.rotation.y = 0.5;
      
      const rArm = lArm.clone();
      rArm.position.x = 0.35;
      rArm.rotation.y = -0.5;
      bodyGroup.add(lArm, rArm);
    }
    
    return group;
  }

  getArchitectureStyle(civ) {
    if (!civ) return 'western';
    const c = civ.toLowerCase();
    if (['jepang', 'tiongkok'].includes(c)) {
      return 'eastAsian';
    } else if (['saracen', 'turki', 'persia'].includes(c)) {
      return 'middleEastern';
    } else if (['aztec', 'maya'].includes(c)) {
      return 'mesoamerican';
    } else if (['spanyol', 'bizantium', 'roma'].includes(c)) {
      return 'mediterranean';
    } else if (['viking', 'kelt', 'goth', 'teuton', 'hun', 'mongol'].includes(c)) {
      return 'nordic';
    }
    return 'western';
  }

  // -------------------------------------------------------------
  // BUILDING MODELS
  // -------------------------------------------------------------
  createBuildingMesh(type, playerId, civ = 'inggris', age = 'dark', upgradeLvl = 0) {
    const group = new THREE.Group();
    const teamMat = this.getTeamMaterial(playerId);
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
      if (civ === 'mongol') {
        // --- MONGOL YURT TOWN CENTER ---
        // Large central yurt with wooden supports
        const yurtGeom = new THREE.CylinderGeometry(2.2, 2.4, 1.4, 12);
        const yurt = new THREE.Mesh(yurtGeom, this.materials.clothes); // leather/canvas
        yurt.position.y = 0.7;
        yurt.castShadow = true;
        yurt.receiveShadow = true;
        group.add(yurt);
        
        // Yurt roof
        const roofGeom = new THREE.ConeGeometry(2.5, 1.2, 12);
        const roof = new THREE.Mesh(roofGeom, this.materials.clothesDark);
        roof.position.y = 2.0;
        roof.castShadow = true;
        group.add(roof);
        
        // Wooden frame/entrance
        const frameGeom = new THREE.BoxGeometry(0.8, 1.2, 0.2);
        const frame = new THREE.Mesh(frameGeom, woodMat);
        frame.position.set(0, 0.6, 2.3);
        group.add(frame);
        
      } else if (civ === 'jepang') {
        // --- JAPANESE PAGODA TOWN CENTER ---
        const foundation = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.6, 3.8), foundationMat);
        foundation.position.y = 0.3;
        foundation.receiveShadow = true;
        group.add(foundation);
        
        // Main wooden structure
        const house = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.5, 2.8), woodMat);
        house.position.y = 1.35;
        house.castShadow = true;
        group.add(house);
        
        // Pagoda curved roof 1 (lower)
        const roof1Geom = new THREE.ConeGeometry(2.8, 1.0, 4);
        roof1Geom.rotateY(Math.PI / 4);
        const roof1 = new THREE.Mesh(roof1Geom, this.materials.enemyRed); // Red/dark roof
        roof1.position.y = 2.6;
        roof1.scale.set(1, 0.6, 1);
        roof1.castShadow = true;
        group.add(roof1);
        
        // Upper floor
        const upperFloor = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.0, 1.8), woodMat);
        upperFloor.position.y = 3.2;
        group.add(upperFloor);
        
        // Pagoda curved roof 2 (upper)
        const roof2Geom = new THREE.ConeGeometry(2.0, 1.0, 4);
        roof2Geom.rotateY(Math.PI / 4);
        const roof2 = new THREE.Mesh(roof2Geom, this.materials.enemyRed);
        roof2.position.y = 4.2;
        roof2.scale.set(1, 0.7, 1);
        roof2.castShadow = true;
        group.add(roof2);

        // Small Torii Gate out front
        const toriiMat = this.materials.enemyRed;
        const pillar1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.5), toriiMat);
        pillar1.position.set(-0.8, 0.75, 2.5);
        const pillar2 = pillar1.clone();
        pillar2.position.set(0.8, 0.75, 2.5);
        const crossbar = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.15, 0.15), toriiMat);
        crossbar.position.set(0, 1.4, 2.5);
        group.add(pillar1, pillar2, crossbar);

      } else {
        // --- ENGLISH / BYZANTINE / GENERIC STONE CASTLE ---
        const foundation = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.4, 4.2), foundationMat);
        foundation.position.y = 0.2;
        foundation.receiveShadow = true;
        group.add(foundation);

        const house = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.6, 3.0), wallMat);
        house.position.y = 1.2;
        house.castShadow = true;
        group.add(house);
        
        // Front door
        const door = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.0, 0.1), this.materials.woodDark);
        door.position.set(0, 0.7, 1.51);
        group.add(door);

        if (civ === 'bizantium') {
          // Byzantine Dome Roof
          const domeGeom = new THREE.SphereGeometry(1.6, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
          const dome = new THREE.Mesh(domeGeom, this.materials.allyGreen); // Copper/Greenish dome
          dome.position.y = 2.0;
          dome.castShadow = true;
          group.add(dome);
        } else {
          // English Castle Battlements and peaked roof
          const roofGeom = new THREE.ConeGeometry(2.4, 1.8, 4);
          roofGeom.rotateY(Math.PI / 4);
          const roof = new THREE.Mesh(roofGeom, roofMat);
          roof.position.y = 2.9;
          roof.castShadow = true;
          group.add(roof);
          
          // Watchtower
          const tower = new THREE.Mesh(new THREE.BoxGeometry(1.0, 3.0, 1.0), wallMat);
          tower.position.set(1.5, 1.5, -1.5);
          tower.castShadow = true;
          group.add(tower);
          
          const towerRoof = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.0, 4).rotateY(Math.PI/4), roofMat);
          towerRoof.position.set(1.5, 3.5, -1.5);
          group.add(towerRoof);
        }
      }
      
      // Team flag for all
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.5), woodMat);
      pole.position.set(0, civ==='jepang'?5.0:(civ==='bizantium'?4.0:4.2), 0);
      const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.5), teamMat);
      flag.position.set(0.4, civ==='jepang'?5.5:(civ==='bizantium'?4.5:4.7), 0);
      group.add(pole, flag);

      // Stone Chimney (Marble chimney for Imperial Age!)
      const chimneyGeom = new THREE.BoxGeometry(0.5, 1.5, 0.5);
      const chimney = new THREE.Mesh(chimneyGeom, foundationMat);
      chimney.position.set(0.9, 2.2, 0.9);
      chimney.castShadow = true;
      group.add(chimney);

      // Chimney smoke particle effect (static spheres of different scales simulating smoke)
      const smokeScales = [0.22, 0.28, 0.35];
      const smokeOffsets = [
        [0.9, 3.1, 0.9],
        [0.95, 3.4, 0.95],
        [1.0, 3.8, 1.0]
      ];
      const smokeMat = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        roughness: 0.95,
        transparent: true,
        opacity: 0.5
      });
      smokeScales.forEach((sc, idx) => {
        const smGeom = new THREE.SphereGeometry(sc, 5, 5);
        const sm = new THREE.Mesh(smGeom, smokeMat);
        sm.position.set(...smokeOffsets[idx]);
        group.add(sm);
      });


      // Campfire decorative details
      const fireBaseGeom = new THREE.RingGeometry(0.3, 0.45, 8);
      fireBaseGeom.rotateX(-Math.PI/2);
      const fireRocks = new THREE.Mesh(fireBaseGeom, foundationMat);
      fireRocks.position.set(1.4, 0.41, -1.4);
      group.add(fireRocks);

      // Campfire glowing logs
      const embersGeom = new THREE.ConeGeometry(0.2, 0.4, 4);
      const embersMat = new THREE.MeshStandardMaterial({
        color: 0xff4500,
        emissive: 0xff3300,
        emissiveIntensity: 1.5,
        roughness: 0.2
      });
      const embers = new THREE.Mesh(embersGeom, embersMat);
      embers.position.set(1.4, 0.52, -1.4);
      group.add(embers);
    } 
    else if (type === 'barracks') {
      // Dirt arena floor
      const arenaGeom = new THREE.BoxGeometry(3.5, 0.2, 3.5);
      const arena = new THREE.Mesh(arenaGeom, this.materials.clothes); // brown
      arena.position.y = 0.1;
      arena.receiveShadow = true;
      group.add(arena);

      // Custom style training hall
      const style = this.getArchitectureStyle(civ);
      if (style === 'eastAsian') {
        const hall = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.3, 1.8), this.materials.eastAsianWall);
        hall.position.set(0, 0.75, -0.6);
        hall.castShadow = true;
        group.add(hall);

        const pMat = this.materials.eastAsianWood;
        const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.3), pMat);
        p1.position.set(-1.15, 0.75, 0.2);
        const p2 = p1.clone();
        p2.position.x = 1.15;
        group.add(p1, p2);

        const roof = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.15, 2.2), this.materials.eastAsianRoof);
        roof.position.set(0, 1.45, -0.5);
        roof.rotation.x = 0.15;
        roof.castShadow = true;
        group.add(roof);

        const targetPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8), woodMat);
        targetPole.position.set(-1.0, 0.5, 0.8);
        const target = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.1), teamMat);
        target.position.set(-1.0, 0.8, 0.8);
        target.rotation.y = Math.PI / 4;
        group.add(targetPole, target);

        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2), woodMat);
        pole.position.set(1.2, 1.1, 1.2);
        const banner = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.8, 0.4), teamMat);
        banner.position.set(1.2, 1.7, 1.0);
        group.add(pole, banner);

      } else if (style === 'middleEastern') {
        const hall = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 1.8), this.materials.middleEasternWall);
        hall.position.set(0, 0.8, -0.6);
        hall.castShadow = true;
        group.add(hall);

        const roof = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.15, 1.9), this.materials.middleEasternRoof);
        roof.position.set(0, 1.55, -0.6);
        roof.castShadow = true;
        group.add(roof);

        const dome = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2), this.materials.middleEasternDome);
        dome.position.set(-0.7, 1.6, -0.6);
        group.add(dome);

        const awning = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 0.8), teamMat);
        awning.position.set(0, 1.2, 0.4);
        awning.rotation.x = 0.3;
        group.add(awning);

        const targetPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8), woodMat);
        targetPole.position.set(-1.0, 0.5, 0.8);
        const target = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.1), teamMat);
        target.position.set(-1.0, 0.8, 0.8);
        target.rotation.y = Math.PI / 4;
        group.add(targetPole, target);

        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2), woodMat);
        pole.position.set(1.2, 1.1, 1.2);
        const banner = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.8, 0.4), teamMat);
        banner.position.set(1.2, 1.7, 1.0);
        group.add(pole, banner);

      } else if (style === 'mesoamerican') {
        const hall = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.3, 1.8), this.materials.mesoamericanWall);
        hall.position.set(0, 0.75, -0.6);
        hall.castShadow = true;
        group.add(hall);

        const trim = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.15, 1.9), this.materials.mesoamericanTrim);
        trim.position.set(0, 1.4, -0.6);
        group.add(trim);

        const targetPole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7), this.materials.mesoamericanWall);
        targetPole.position.set(-1.0, 0.45, 0.8);
        const target = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.12), teamMat);
        target.position.set(-1.0, 0.8, 0.8);
        target.rotation.y = Math.PI / 4;
        group.add(targetPole, target);

        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2), woodMat);
        pole.position.set(1.2, 1.1, 1.2);
        const banner = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.9, 0.35), teamMat);
        banner.position.set(1.2, 1.65, 1.0);
        group.add(pole, banner);

      } else if (style === 'mediterranean') {
        const hall = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 1.8), this.materials.mediterraneanWall);
        hall.position.set(0, 0.8, -0.6);
        hall.castShadow = true;
        group.add(hall);

        const roof = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.2, 2.2), this.materials.mediterraneanRoof);
        roof.position.set(0, 1.6, -0.6);
        roof.rotation.x = 0.25;
        roof.castShadow = true;
        group.add(roof);

        const targetPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8), woodMat);
        targetPole.position.set(-1.0, 0.5, 0.8);
        const target = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.1), teamMat);
        target.position.set(-1.0, 0.8, 0.8);
        target.rotation.y = Math.PI / 4;
        group.add(targetPole, target);

        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2), woodMat);
        pole.position.set(1.2, 1.1, 1.2);
        const banner = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.8, 0.4), teamMat);
        banner.position.set(1.2, 1.7, 1.0);
        group.add(pole, banner);

      } else if (style === 'nordic') {
        const hall = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.3, 1.8), this.materials.nordicWall);
        hall.position.set(0, 0.75, -0.6);
        hall.castShadow = true;
        group.add(hall);

        const roof = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.2, 2.2), this.materials.nordicRoof);
        roof.position.set(0, 1.55, -0.6);
        roof.rotation.x = 0.25;
        roof.castShadow = true;
        group.add(roof);

        const shieldMat = this.materials.woodDark;
        const sh1 = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.04, 8), shieldMat);
        sh1.rotation.z = Math.PI / 2;
        sh1.position.set(-1.21, 0.8, -0.5);
        
        const sh2 = sh1.clone();
        sh2.position.set(1.21, 0.8, -0.5);
        group.add(sh1, sh2);

        const targetPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8), woodMat);
        targetPole.position.set(-1.0, 0.5, 0.8);
        const target = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.1), teamMat);
        target.position.set(-1.0, 0.8, 0.8);
        target.rotation.y = Math.PI / 4;
        group.add(targetPole, target);

        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2), woodMat);
        pole.position.set(1.2, 1.1, 1.2);
        const banner = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.8, 0.4), teamMat);
        banner.position.set(1.2, 1.7, 1.0);
        group.add(pole, banner);

      } else {
        const hallGeom = new THREE.BoxGeometry(2.4, 1.4, 1.8);
        const hall = new THREE.Mesh(hallGeom, wallMat);
        hall.position.set(0, 0.8, -0.6);
        hall.castShadow = true;
        hall.receiveShadow = true;
        group.add(hall);

        const roofGeom = new THREE.BoxGeometry(2.6, 0.2, 2.2);
        const roof = new THREE.Mesh(roofGeom, roofMat);
        roof.position.set(0, 1.6, -0.6);
        roof.rotation.x = 0.25;
        roof.castShadow = true;
        group.add(roof);

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
    } 
    else if (type === 'blacksmith') {
      // Base dirt floor
      const baseGeom = new THREE.BoxGeometry(3.5, 0.2, 3.5);
      const base = new THREE.Mesh(baseGeom, this.materials.dirt);
      base.position.y = 0.1;
      base.receiveShadow = true;
      group.add(base);

      // Brick furnace (back center)
      const furnaceGeom = new THREE.BoxGeometry(1.4, 1.8, 1.4);
      const furnace = new THREE.Mesh(furnaceGeom, this.materials.rock);
      furnace.position.set(0, 0.9, -0.8);
      furnace.castShadow = true;
      group.add(furnace);

      // Furnace opening/chimney with fire/glow
      const fireGeom = new THREE.BoxGeometry(0.8, 0.4, 0.6);
      const fire = new THREE.Mesh(fireGeom, this.materials.fire);
      fire.position.set(0, 0.4, -0.4);
      group.add(fire);

      // Anvil (center-front)
      const anvilBase = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.5), this.materials.woodDark);
      anvilBase.position.set(0.6, 0.35, 0.6);
      anvilBase.castShadow = true;
      group.add(anvilBase);

      const anvilHorn = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.4, 4), this.materials.iron);
      anvilHorn.rotation.z = Math.PI / 2;
      anvilHorn.position.set(0.2, 0.7, 0.6);
      group.add(anvilHorn);

      const anvilBlock = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.4), this.materials.iron);
      anvilBlock.position.set(0.6, 0.75, 0.6);
      anvilBlock.castShadow = true;
      group.add(anvilBlock);

      // regional styles for the roof/wall overlay
      const style = this.getArchitectureStyle(civ);
      
      // Roof and Pillars
      if (style === 'eastAsian') {
        // Red pillars
        const pMat = this.materials.eastAsianWood;
        const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8), pMat);
        p1.position.set(-1.4, 1.0, -1.4);
        const p2 = p1.clone(); p2.position.set(1.4, 1.0, -1.4);
        const p3 = p1.clone(); p3.position.set(-1.4, 1.0, 1.4);
        const p4 = p1.clone(); p4.position.set(1.4, 1.0, 1.4);
        group.add(p1, p2, p3, p4);

        // Pagoda roof
        const roof = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.15, 3.8), this.materials.eastAsianRoof);
        roof.position.set(0, 2.0, 0);
        roof.castShadow = true;
        group.add(roof);

        // torii roof tip
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.6, 4), this.materials.eastAsianRoof);
        tip.position.set(0, 2.4, 0);
        group.add(tip);

      } else if (style === 'middleEastern') {
        // Sandstone columns
        const pMat = this.materials.middleEasternWall;
        const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.8, 0.2), pMat);
        p1.position.set(-1.4, 1.0, -1.4);
        const p2 = p1.clone(); p2.position.set(1.4, 1.0, -1.4);
        const p3 = p1.clone(); p3.position.set(-1.4, 1.0, 1.4);
        const p4 = p1.clone(); p4.position.set(1.4, 1.0, 1.4);
        group.add(p1, p2, p3, p4);

        // Sandstone flat roof
        const roof = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.2, 3.6), this.materials.middleEasternRoof);
        roof.position.set(0, 2.0, 0);
        roof.castShadow = true;
        group.add(roof);

        // Small dome
        const dome = new THREE.Mesh(new THREE.SphereGeometry(0.6, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), this.materials.middleEasternDome);
        dome.position.set(0, 2.1, 0);
        group.add(dome);

      } else if (style === 'mesoamerican') {
        // Heavy stone pillars
        const pMat = this.materials.mesoamericanWall;
        const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.6, 0.3), pMat);
        p1.position.set(-1.4, 0.9, -1.4);
        const p2 = p1.clone(); p2.position.set(1.4, 0.9, -1.4);
        const p3 = p1.clone(); p3.position.set(-1.4, 0.9, 1.4);
        const p4 = p1.clone(); p4.position.set(1.4, 0.9, 1.4);
        group.add(p1, p2, p3, p4);

        // Stone roof slab
        const roof = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.25, 3.8), this.materials.mesoamericanRoof);
        roof.position.set(0, 1.8, 0);
        roof.castShadow = true;
        group.add(roof);

        // Decorative stone trim
        const trim = new THREE.Mesh(new THREE.BoxGeometry(3.9, 0.1, 3.9), this.materials.mesoamericanTrim);
        trim.position.set(0, 1.9, 0);
        group.add(trim);

      } else if (style === 'mediterranean') {
        // Stucco columns
        const pMat = this.materials.mediterraneanWall;
        const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8), pMat);
        p1.position.set(-1.4, 1.0, -1.4);
        const p2 = p1.clone(); p2.position.set(1.4, 1.0, -1.4);
        const p3 = p1.clone(); p3.position.set(-1.4, 1.0, 1.4);
        const p4 = p1.clone(); p4.position.set(1.4, 1.0, 1.4);
        group.add(p1, p2, p3, p4);

        // Tiled pitched roof
        const roof = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.15, 3.8), this.materials.mediterraneanRoof);
        roof.position.set(0, 2.0, 0);
        roof.rotation.x = 0.15;
        roof.castShadow = true;
        group.add(roof);

      } else if (style === 'nordic') {
        // Wood posts
        const pMat = this.materials.woodDark;
        const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.8), pMat);
        p1.position.set(-1.4, 1.0, -1.4);
        const p2 = p1.clone(); p2.position.set(1.4, 1.0, -1.4);
        const p3 = p1.clone(); p3.position.set(-1.4, 1.0, 1.4);
        const p4 = p1.clone(); p4.position.set(1.4, 1.0, 1.4);
        group.add(p1, p2, p3, p4);

        // Thatched/wooden shingle roof
        const roof = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.2, 3.8), this.materials.thatch);
        roof.position.set(0, 1.95, 0);
        roof.rotation.x = 0.2;
        roof.castShadow = true;
        group.add(roof);

      } else { // western (default)
        // Dark wood pillars
        const pMat = woodMat;
        const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8), pMat);
        p1.position.set(-1.4, 1.0, -1.4);
        const p2 = p1.clone(); p2.position.set(1.4, 1.0, -1.4);
        const p3 = p1.clone(); p3.position.set(-1.4, 1.0, 1.4);
        const p4 = p1.clone(); p4.position.set(1.4, 1.0, 1.4);
        group.add(p1, p2, p3, p4);

        // Slate roof
        const roof = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.15, 3.8), roofMat);
        roof.position.set(0, 2.0, 0);
        roof.rotation.x = 0.15;
        roof.castShadow = true;
        group.add(roof);
      }
    } 
    else if (type === 'house') {
      const style = this.getArchitectureStyle(civ);
      if (style === 'eastAsian') {
        const base = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.0, 1.8), this.materials.eastAsianWall);
        base.position.y = 0.5;
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);

        const colGeom = new THREE.CylinderGeometry(0.06, 0.06, 1.0, 4);
        const colMat = this.materials.eastAsianWood;
        const positions = [
          [-0.91, 0.5, -0.91],
          [0.91, 0.5, -0.91],
          [-0.91, 0.5, 0.91],
          [0.91, 0.5, 0.91]
        ];
        positions.forEach(pos => {
          const col = new THREE.Mesh(colGeom, colMat);
          col.position.set(...pos);
          col.castShadow = true;
          group.add(col);
        });

        const door = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.75, 0.08), woodMat);
        door.position.set(0, 0.375, 0.91);
        door.castShadow = true;
        group.add(door);

        const roof1 = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.15, 2.1), this.materials.eastAsianRoof);
        roof1.position.y = 1.0;
        roof1.castShadow = true;
        group.add(roof1);

        const roof2Geom = new THREE.ConeGeometry(1.4, 0.8, 4);
        roof2Geom.rotateY(Math.PI / 4);
        const roof2 = new THREE.Mesh(roof2Geom, this.materials.eastAsianRoof);
        roof2.position.y = 1.45;
        roof2.scale.set(1.1, 1.0, 1.1);
        roof2.castShadow = true;
        group.add(roof2);

        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4), woodMat);
        pole.position.set(0, 2.05, 0);
        const flag = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.02), teamMat);
        flag.position.set(0.1, 2.15, 0);
        group.add(pole, flag);

      } else if (style === 'middleEastern') {
        const base = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.1, 1.8), this.materials.middleEasternWall);
        base.position.y = 0.55;
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);

        const door = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.06, 8, 1, false, 0, Math.PI), woodMat);
        door.rotation.x = Math.PI / 2;
        door.position.set(0, 0.35, 0.91);
        group.add(door);

        const doorBase = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.06), woodMat);
        doorBase.position.set(0, 0.175, 0.91);
        group.add(doorBase);

        const win = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.4, 0.25), this.materials.glass);
        win.position.set(0.91, 0.65, 0);
        group.add(win);

        const flatRoof = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.1, 1.9), this.materials.middleEasternRoof);
        flatRoof.position.y = 1.15;
        flatRoof.castShadow = true;
        group.add(flatRoof);

        const domeGeom = new THREE.SphereGeometry(0.6, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2);
        const dome = new THREE.Mesh(domeGeom, this.materials.middleEasternDome);
        dome.position.y = 1.18;
        dome.castShadow = true;
        group.add(dome);

        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45), woodMat);
        pole.position.set(0.7, 1.35, 0.7);
        const flag = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.02), teamMat);
        flag.position.set(0.79, 1.45, 0.7);
        group.add(pole, flag);

      } else if (style === 'mesoamerican') {
        const tier1 = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.4, 2.0), this.materials.mesoamericanWall);
        tier1.position.y = 0.2;
        tier1.castShadow = true;
        tier1.receiveShadow = true;
        group.add(tier1);

        const tier2 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.6, 1.5), this.materials.mesoamericanWall);
        tier2.position.y = 0.7;
        tier2.castShadow = true;
        group.add(tier2);

        const trim = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 1.6), this.materials.mesoamericanTrim);
        trim.position.y = 1.0;
        group.add(trim);

        const roofGeom = new THREE.ConeGeometry(1.4, 0.7, 4);
        roofGeom.rotateY(Math.PI / 4);
        const roof = new THREE.Mesh(roofGeom, this.materials.thatch);
        roof.position.y = 1.4;
        roof.castShadow = true;
        group.add(roof);

        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4), woodMat);
        pole.position.set(0, 1.9, 0);
        const flag = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.02), teamMat);
        flag.position.set(0.1, 2.0, 0);
        group.add(pole, flag);

      } else if (style === 'mediterranean') {
        const base = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.0, 1.8), this.materials.mediterraneanWall);
        base.position.y = 0.5;
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);

        const door = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.65, 0.08), woodMat);
        door.position.set(0, 0.325, 0.91);
        door.castShadow = true;
        group.add(door);

        const roofGeom = new THREE.ConeGeometry(1.45, 0.75, 4);
        roofGeom.rotateY(Math.PI / 4);
        const roof = new THREE.Mesh(roofGeom, this.materials.mediterraneanRoof);
        roof.position.y = 1.35;
        roof.scale.set(1.15, 1.0, 1.15);
        roof.castShadow = true;
        group.add(roof);

        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4), woodMat);
        pole.position.set(0, 1.9, 0);
        const flag = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.02), teamMat);
        flag.position.set(0.1, 2.0, 0);
        group.add(pole, flag);

      } else if (style === 'nordic') {
        const base = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 1.8), this.materials.nordicWall);
        base.position.y = 0.45;
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);

        const door = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.6, 0.08), this.materials.woodDark);
        door.position.set(0, 0.3, 0.91);
        group.add(door);

        const roofGeom = new THREE.ConeGeometry(1.65, 1.15, 4);
        roofGeom.rotateY(Math.PI / 4);
        const roof = new THREE.Mesh(roofGeom, this.materials.nordicRoof);
        roof.position.y = 1.45;
        roof.castShadow = true;
        group.add(roof);

        const horn1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.45), this.materials.woodDark);
        horn1.position.set(0.12, 2.1, 0.12);
        horn1.rotation.z = -0.6;
        const horn2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.45), this.materials.woodDark);
        horn2.position.set(-0.12, 2.1, -0.12);
        horn2.rotation.z = 0.6;
        group.add(horn1, horn2);

        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45), woodMat);
        pole.position.set(0.6, 1.6, -0.6);
        const flag = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.02), teamMat);
        flag.position.set(0.7, 1.75, -0.6);
        group.add(pole, flag);

      } else {
        const baseGeom = new THREE.BoxGeometry(1.8, 1.0, 1.8);
        const base = new THREE.Mesh(baseGeom, wallMat);
        base.position.y = 0.5;
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);

        const doorGeom = new THREE.BoxGeometry(0.4, 0.65, 0.08);
        const door = new THREE.Mesh(doorGeom, this.materials.clothesDark);
        door.position.set(0, 0.325, 0.91);
        door.castShadow = true;
        group.add(door);

        const windowMat = new THREE.MeshStandardMaterial({
          color: 0xffd700,
          emissive: 0xff8800,
          emissiveIntensity: 0.6,
          roughness: 0.1
        });
        const windowGeom = new THREE.BoxGeometry(0.08, 0.3, 0.3);
        const windowL = new THREE.Mesh(windowGeom, windowMat);
        windowL.position.set(-0.91, 0.6, 0);
        group.add(windowL);

        const windowR = windowL.clone();
        windowR.position.x = 0.91;
        group.add(windowR);

        const roofGeom = new THREE.ConeGeometry(1.5, 1.0, 4);
        roofGeom.rotateY(Math.PI / 4);
        const roof = new THREE.Mesh(roofGeom, roofMat);
        roof.position.y = 1.5;
        roof.castShadow = true;
        group.add(roof);

        const flagGeom = new THREE.BoxGeometry(0.2, 0.15, 0.02);
        const flag = new THREE.Mesh(flagGeom, teamMat);
        flag.position.set(0, 2.1, 0);
        group.add(flag);
        
        const smallPoleGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 4);
        const sPole = new THREE.Mesh(smallPoleGeom, woodMat);
        sPole.position.set(0, 1.9, 0);
        group.add(sPole);
      }
    }
    else if (type === 'temple') {
      const style = this.getArchitectureStyle(civ);
      
      const foundationGeom = new THREE.BoxGeometry(3.2, 0.3, 3.2);
      const foundation = new THREE.Mesh(foundationGeom, foundationMat);
      foundation.position.y = 0.15;
      foundation.receiveShadow = true;
      foundation.castShadow = true;
      group.add(foundation);

      if (style === 'eastAsian') {
        const t1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.1, 2.4), this.materials.eastAsianWall);
        t1.position.y = 0.85;
        t1.castShadow = true;
        group.add(t1);

        const r1 = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.12, 2.8), this.materials.eastAsianRoof);
        r1.position.y = 1.45;
        r1.castShadow = true;
        group.add(r1);

        const t2 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 1.8), this.materials.eastAsianWall);
        t2.position.y = 1.95;
        t2.castShadow = true;
        group.add(t2);

        const r2 = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.12, 2.1), this.materials.eastAsianRoof);
        r2.position.y = 2.45;
        r2.castShadow = true;
        group.add(r2);

        const t3 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 1.2), this.materials.eastAsianWall);
        t3.position.y = 2.95;
        group.add(t3);

        const r3Geom = new THREE.ConeGeometry(1.4, 0.9, 4);
        r3Geom.rotateY(Math.PI / 4);
        const r3 = new THREE.Mesh(r3Geom, this.materials.eastAsianRoof);
        r3.position.y = 3.65;
        group.add(r3);

        const finial = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8), this.materials.goldMetal);
        finial.position.y = 4.4;
        group.add(finial);

      } else if (style === 'middleEastern') {
        const hall = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.5, 2.4), this.materials.middleEasternWall);
        hall.position.y = 1.05;
        hall.castShadow = true;
        hall.receiveShadow = true;
        group.add(hall);

        const domeGeom = new THREE.SphereGeometry(1.1, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
        const dome = new THREE.Mesh(domeGeom, this.materials.middleEasternDome);
        dome.position.y = 1.8;
        dome.castShadow = true;
        group.add(dome);

        const minaret = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 3.6, 8), this.materials.middleEasternWall);
        minaret.position.set(1.2, 1.95, -1.2);
        minaret.castShadow = true;
        group.add(minaret);

        const minaretDome = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8, 0, Math.PI*2, 0, Math.PI/2), this.materials.middleEasternDome);
        minaretDome.position.set(1.2, 3.75, -1.2);
        group.add(minaretDome);

      } else if (style === 'mesoamerican') {
        const tier2 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 2.4), this.materials.mesoamericanWall);
        tier2.position.y = 0.6;
        tier2.castShadow = true;
        group.add(tier2);

        const tier3 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 1.6), this.materials.mesoamericanWall);
        tier3.position.y = 1.2;
        tier3.castShadow = true;
        group.add(tier3);

        const sanctuary = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.8, 1.0), this.materials.mesoamericanWall);
        sanctuary.position.y = 1.9;
        group.add(sanctuary);

        const flatRoof = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.12, 1.15), this.materials.mesoamericanTrim);
        flatRoof.position.y = 2.36;
        group.add(flatRoof);

        const brazier = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.15), this.materials.mesoamericanTrim);
        brazier.position.set(0, 2.5, 0);
        const embers = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.25), this.materials.fire);
        embers.position.set(0, 2.65, 0);
        group.add(brazier, embers);

      } else if (style === 'mediterranean') {
        const hall = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.6, 2.4), this.materials.mediterraneanWall);
        hall.position.y = 1.1;
        hall.castShadow = true;
        group.add(hall);

        const domeGeom = new THREE.SphereGeometry(1.0, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
        const dome = new THREE.Mesh(domeGeom, this.materials.mediterraneanRoof);
        dome.position.y = 1.9;
        dome.castShadow = true;
        group.add(dome);

        const colGeom = new THREE.CylinderGeometry(0.08, 0.08, 1.4);
        const colMat = this.materials.marbleImperial;
        const positions = [
          [-0.8, 0.85, 1.3],
          [0.8, 0.85, 1.3],
          [-0.3, 0.85, 1.3],
          [0.3, 0.85, 1.3]
        ];
        positions.forEach(pos => {
          const col = new THREE.Mesh(colGeom, colMat);
          col.position.set(...pos);
          col.castShadow = true;
          group.add(col);
        });

      } else if (style === 'nordic') {
        const baseHall = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.2, 2.2), this.materials.nordicWall);
        baseHall.position.y = 0.9;
        baseHall.castShadow = true;
        group.add(baseHall);

        const roof1 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.15, 2.5), this.materials.nordicRoof);
        roof1.position.y = 1.5;
        roof1.castShadow = true;
        group.add(roof1);

        const midHall = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.0, 1.5), this.materials.nordicWall);
        midHall.position.y = 2.0;
        group.add(midHall);

        const roof2 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.15, 1.8), this.materials.nordicRoof);
        roof2.position.y = 2.5;
        group.add(roof2);

        const spireGeom = new THREE.ConeGeometry(0.9, 1.8, 4);
        spireGeom.rotateY(Math.PI / 4);
        const spire = new THREE.Mesh(spireGeom, this.materials.nordicRoof);
        spire.position.y = 3.4;
        spire.castShadow = true;
        group.add(spire);

        const cross = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.06), this.materials.woodDark);
        cross.position.y = 4.45;
        const crossBar = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.06, 0.06), this.materials.woodDark);
        crossBar.position.set(0, 4.55, 0);
        group.add(cross, crossBar);

      } else {
        const hallGeom = new THREE.BoxGeometry(2.2, 1.8, 2.2);
        const hall = new THREE.Mesh(hallGeom, wallMat);
        hall.position.y = 1.05;
        hall.castShadow = true;
        hall.receiveShadow = true;
        group.add(hall);

        const spireGeom = new THREE.ConeGeometry(1.4, 2.6, 6);
        const spire = new THREE.Mesh(spireGeom, roofMat);
        spire.position.y = 3.25;
        spire.castShadow = true;
        group.add(spire);

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

        const pillarGeom = new THREE.CylinderGeometry(0.12, 0.12, 1.4, 5);
        const p1 = new THREE.Mesh(pillarGeom, foundationMat);
        p1.position.set(0.9, 0.85, 1.2);
        p1.castShadow = true;
        group.add(p1);

        const p2 = p1.clone();
        p2.position.x = -0.9;
        group.add(p2);
      }
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
    else if (type === 'dock') {
      // Platform deck extending out (size 3)
      const deckGeom = new THREE.BoxGeometry(2.2, 0.2, 3.0);
      const deck = new THREE.Mesh(deckGeom, woodMat);
      deck.position.set(0, 0.5, 0);
      deck.castShadow = true;
      deck.receiveShadow = true;
      group.add(deck);

      // Wooden piles supporting the deck (4 posts going down)
      const postGeom = new THREE.CylinderGeometry(0.08, 0.08, 1.4, 4);
      const postMat = this.materials.woodDark;
      const positions = [
        [-0.9, -0.2, -1.3],
        [0.9, -0.2, -1.3],
        [-0.9, -0.2, 1.3],
        [0.9, -0.2, 1.3]
      ];
      positions.forEach(pos => {
        const post = new THREE.Mesh(postGeom, postMat);
        post.position.set(...pos);
        post.castShadow = true;
        group.add(post);
      });

      // Small shack on the land side of the dock
      const shackGeom = new THREE.BoxGeometry(1.0, 1.0, 1.0);
      const shack = new THREE.Mesh(shackGeom, wallMat);
      shack.position.set(0, 1.1, -0.8);
      shack.castShadow = true;
      group.add(shack);

      // Roof for the shack (cone)
      const roofGeom = new THREE.ConeGeometry(0.8, 0.7, 4);
      const roof = new THREE.Mesh(roofGeom, roofMat);
      roof.position.set(0, 1.85, -0.8);
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      group.add(roof);

      // Mooring post detail
      const bollardGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.4, 4);
      const bollard = new THREE.Mesh(bollardGeom, this.materials.woodDark);
      bollard.position.set(0.8, 0.7, 0.8);
      bollard.castShadow = true;
      group.add(bollard);
    }
    else if (type === 'farm') {
      // Flat soil base
      const dirtGeom = new THREE.BoxGeometry(2.0, 0.08, 2.0);
      const dirtMat = this.materials.clothesDark; // dark brown soil
      const dirt = new THREE.Mesh(dirtGeom, dirtMat);
      dirt.position.y = 0.04;
      dirt.receiveShadow = true;
      group.add(dirt);

      // Growing crops group that can be animated/scaled on y-axis
      const cropsGroup = new THREE.Group();
      cropsGroup.name = "crops";
      group.add(cropsGroup);

      const plantMat = new THREE.MeshStandardMaterial({ color: 0x4f8f2b, roughness: 0.85 });
      const cropRowGeom = new THREE.BoxGeometry(0.16, 0.35, 1.8);
      
      // 4 crop rows
      const xOffsets = [-0.6, -0.2, 0.2, 0.6];
      xOffsets.forEach(ox => {
        const row = new THREE.Mesh(cropRowGeom, plantMat);
        row.position.set(ox, 0.2, 0);
        row.castShadow = true;
        cropsGroup.add(row);
      });

      // Simple fence boundary posts
      const fencePostGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 4);
      const fenceMat = this.materials.woodDark;
      const cornerOffsets = [
        [-0.95, 0.2, -0.95],
        [0.95, 0.2, -0.95],
        [-0.95, 0.2, 0.95],
        [0.95, 0.2, 0.95]
      ];
      cornerOffsets.forEach(pos => {
        const post = new THREE.Mesh(fencePostGeom, fenceMat);
        post.position.set(...pos);
        group.add(post);
      });
    }
    else if (type === 'mill') {
      // Octagonal tapered tower base
      const baseGeom = new THREE.CylinderGeometry(0.8, 1.2, 2.4, 8);
      const baseMat = wallMat;
      const base = new THREE.Mesh(baseGeom, baseMat);
      base.position.y = 1.2;
      base.castShadow = true;
      base.receiveShadow = true;
      group.add(base);

      // Conical roof
      const roofGeom = new THREE.ConeGeometry(1.4, 1.0, 8);
      const roof = new THREE.Mesh(roofGeom, roofMat);
      roof.position.y = 2.9;
      roof.castShadow = true;
      group.add(roof);

      // Door
      const doorGeom = new THREE.BoxGeometry(0.5, 0.9, 0.1);
      const door = new THREE.Mesh(doorGeom, this.materials.woodDark);
      door.position.set(0, 0.45, 1.15);
      door.castShadow = true;
      group.add(door);

      // Axle / rotor hub pointing out the front (Z axis)
      const axleGeom = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 6);
      axleGeom.rotateX(Math.PI / 2);
      const axle = new THREE.Mesh(axleGeom, this.materials.woodDark);
      axle.position.set(0, 2.3, 1.0);
      axle.castShadow = true;
      group.add(axle);

      // Sails Group (so we can rotate it dynamically in Building.js)
      const sailsGroup = new THREE.Group();
      sailsGroup.name = "sails";
      sailsGroup.position.set(0, 2.3, 1.3);
      group.add(sailsGroup);

      // 4 blades
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const bladeGroup = new THREE.Group();
        bladeGroup.rotation.z = angle;
        sailsGroup.add(bladeGroup);

        // Blade pole
        const poleGeom = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 4);
        poleGeom.translate(0, 0.9, 0);
        const pole = new THREE.Mesh(poleGeom, this.materials.woodDark);
        pole.castShadow = true;
        bladeGroup.add(pole);

        // Fabric sail panel
        const sailGeom = new THREE.BoxGeometry(0.35, 1.2, 0.02);
        sailGeom.translate(0.18, 1.0, 0.02);
        const sail = new THREE.Mesh(sailGeom, this.materials.clothes); // standard clothes/fabric material
        sail.castShadow = true;
        bladeGroup.add(sail);
      }

      // Decorative grain sack
      const sackGeom = new THREE.SphereGeometry(0.25, 6, 6);
      sackGeom.scale(1.0, 1.3, 1.0);
      const sack = new THREE.Mesh(sackGeom, this.materials.thatch);
      sack.position.set(0.7, 0.25, 0.9);
      sack.castShadow = true;
      group.add(sack);
    }
    else if (type === 'lumberCamp') {
      // Wood deck platform
      const platGeom = new THREE.BoxGeometry(2.0, 0.1, 2.0);
      const platform = new THREE.Mesh(platGeom, this.materials.woodDark);
      platform.position.y = 0.05;
      platform.receiveShadow = true;
      group.add(platform);

      // Stack of logs (pyramid arrangement)
      const logMat = this.materials.trunk;
      const logGeom = new THREE.CylinderGeometry(0.15, 0.15, 1.6, 8);
      logGeom.rotateZ(Math.PI / 2); // lie horizontal along X-axis

      const logOffsets = [
        [-0.4, 0.2, -0.2],
        [0.0, 0.2, -0.2],
        [0.4, 0.2, -0.2],
        [-0.2, 0.45, -0.2],
        [0.2, 0.45, -0.2],
        [0.0, 0.7, -0.2]
      ];
      logOffsets.forEach(pos => {
        const logMesh = new THREE.Mesh(logGeom, logMat);
        logMesh.position.set(...pos);
        logMesh.castShadow = true;
        logMesh.receiveShadow = true;
        group.add(logMesh);
      });

      // Wooden posts (4 shelter columns)
      const postGeom = new THREE.CylinderGeometry(0.06, 0.06, 1.3, 4);
      const postOffsets = [
        [-0.9, 0.7, -0.9],
        [0.9, 0.7, -0.9],
        [-0.9, 0.7, 0.9],
        [0.9, 0.7, 0.9]
      ];
      postOffsets.forEach(pos => {
        const post = new THREE.Mesh(postGeom, this.materials.woodDark);
        post.position.set(...pos);
        post.castShadow = true;
        group.add(post);
      });

      // Slanted roof
      const roofGeom = new THREE.BoxGeometry(2.2, 0.1, 2.2);
      const roof = new THREE.Mesh(roofGeom, roofMat);
      roof.position.set(0, 1.4, 0);
      roof.rotation.x = 0.15;
      roof.castShadow = true;
      group.add(roof);

      // Camp banner
      const bannerPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.0), this.materials.woodDark);
      bannerPole.position.set(-0.8, 1.2, 0.8);
      const banner = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.5), teamMat);
      banner.position.set(-0.8, 1.5, 0.8);
      banner.rotation.y = Math.PI / 4;
      group.add(bannerPole, banner);
    }
    else if (type === 'miningCamp') {
      // Stone foundation
      const platGeom = new THREE.BoxGeometry(2.0, 0.1, 2.0);
      const platform = new THREE.Mesh(platGeom, this.materials.rock);
      platform.position.y = 0.05;
      platform.receiveShadow = true;
      group.add(platform);

      // Stone ore pile (gray sphere)
      const stoneMat = this.materials.rock;
      const stonePileGeom = new THREE.SphereGeometry(0.35, 6, 6);
      stonePileGeom.scale(1.0, 0.6, 1.0);
      const stonePile = new THREE.Mesh(stonePileGeom, stoneMat);
      stonePile.position.set(-0.4, 0.15, -0.4);
      stonePile.castShadow = true;
      group.add(stonePile);

      // Gold ore pile (shiny gold)
      const goldMat = this.materials.goldCrystal;
      const goldPileGeom = new THREE.SphereGeometry(0.3, 6, 6);
      goldPileGeom.scale(1.0, 0.7, 1.0);
      const goldPile = new THREE.Mesh(goldPileGeom, goldMat);
      goldPile.position.set(0.4, 0.15, -0.4);
      goldPile.castShadow = true;
      group.add(goldPile);

      // Chest
      const chestGeom = new THREE.BoxGeometry(0.6, 0.5, 0.4);
      const chest = new THREE.Mesh(chestGeom, this.materials.woodDark);
      chest.position.set(0, 0.3, 0.5);
      chest.castShadow = true;
      group.add(chest);

      // Barrel
      const barrelGeom = new THREE.CylinderGeometry(0.22, 0.22, 0.6, 8);
      const barrel = new THREE.Mesh(barrelGeom, this.materials.woodFeudal);
      barrel.position.set(0.65, 0.35, 0.5);
      barrel.castShadow = true;
      group.add(barrel);

      // Pickaxe detail leaning on chest
      const handleGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 4);
      const headGeom = new THREE.BoxGeometry(0.3, 0.03, 0.05);

      const pickGroup = new THREE.Group();
      pickGroup.position.set(-0.25, 0.35, 0.3);
      pickGroup.rotation.set(0.2, 0.1, -0.3);

      const pickHandle = new THREE.Mesh(handleGeom, this.materials.woodFeudal);
      const pickHead = new THREE.Mesh(headGeom, this.materials.iron);
      pickHead.position.y = 0.4;
      pickGroup.add(pickHandle, pickHead);
      group.add(pickGroup);

      // Shelter posts (2 posts at the back)
      const postGeom = new THREE.CylinderGeometry(0.05, 0.05, 1.4, 4);
      const post1 = new THREE.Mesh(postGeom, this.materials.woodDark);
      post1.position.set(-0.9, 0.7, -0.9);
      const post2 = new THREE.Mesh(postGeom, this.materials.woodDark);
      post2.position.set(0.9, 0.7, -0.9);
      group.add(post1, post2);

      // Shelter roof
      const roofGeom = new THREE.BoxGeometry(2.2, 0.08, 1.2);
      const roof = new THREE.Mesh(roofGeom, roofMat);
      roof.position.set(0, 1.4, -0.4);
      roof.rotation.x = 0.25;
      roof.castShadow = true;
      group.add(roof);
    }
    else if (type === 'palisadeWall') {
      // Single thick vertical log with sharpened top
      const logGeom = new THREE.CylinderGeometry(0.16, 0.2, 1.6, 6);
      const log = new THREE.Mesh(logGeom, this.materials.woodDark);
      log.position.set(0, 0.8, 0);
      log.castShadow = true;
      log.receiveShadow = true;
      group.add(log);

      // A sharpened top tip (cone)
      const tipGeom = new THREE.ConeGeometry(0.16, 0.35, 6);
      const tip = new THREE.Mesh(tipGeom, this.materials.woodDark);
      tip.position.set(0, 1.775, 0);
      tip.castShadow = true;
      group.add(tip);

      // Horizontal bindings (ropes/wood bars to look like a wall section)
      const ropeGeom = new THREE.BoxGeometry(0.8, 0.08, 0.12);
      const rope1 = new THREE.Mesh(ropeGeom, this.materials.clothes);
      rope1.position.set(0, 0.5, 0);
      rope1.castShadow = true;
      group.add(rope1);

      const rope2 = new THREE.Mesh(ropeGeom, this.materials.clothes);
      rope2.position.set(0, 1.2, 0);
      rope2.castShadow = true;
      group.add(rope2);

      if (upgradeLvl >= 1) {
        const braceGeom = new THREE.BoxGeometry(0.08, 1.5, 0.08);
        const brace1 = new THREE.Mesh(braceGeom, this.materials.iron || this.materials.clothesDark);
        brace1.position.set(0, 0.8, 0);
        brace1.rotation.z = Math.PI / 4;
        group.add(brace1);
      }
      if (upgradeLvl >= 2) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.6, 4), this.materials.iron || this.materials.clothesDark);
        spike.position.set(0, 2.1, 0);
        group.add(spike);
      }
    }
    else if (type === 'palisadeGate') {
      // Two main side posts (thick logs)
      const postGeom = new THREE.CylinderGeometry(0.2, 0.24, 2.2, 6);
      const leftPost = new THREE.Mesh(postGeom, this.materials.woodDark);
      leftPost.position.set(-0.85, 1.1, 0);
      leftPost.castShadow = true;
      leftPost.receiveShadow = true;
      group.add(leftPost);

      const rightPost = new THREE.Mesh(postGeom, this.materials.woodDark);
      rightPost.position.set(0.85, 1.1, 0);
      rightPost.castShadow = true;
      rightPost.receiveShadow = true;
      group.add(rightPost);

      // Sharpened tips for posts
      const tipGeom = new THREE.ConeGeometry(0.2, 0.4, 6);
      const leftTip = new THREE.Mesh(tipGeom, this.materials.woodDark);
      leftTip.position.set(-0.85, 2.4, 0);
      leftTip.castShadow = true;
      group.add(leftTip);

      const rightTip = new THREE.Mesh(tipGeom, this.materials.woodDark);
      rightTip.position.set(0.85, 2.4, 0);
      rightTip.castShadow = true;
      group.add(rightTip);

      // Middle gate door panels (low barricade)
      const doorGeom = new THREE.BoxGeometry(1.4, 1.2, 0.1);
      const door = new THREE.Mesh(doorGeom, this.materials.woodFeudal);
      door.position.set(0, 0.6, 0);
      door.castShadow = true;
      door.receiveShadow = true;
      group.add(door);

      // Diagonal wooden bracing on gate door
      const braceGeom = new THREE.BoxGeometry(0.12, 1.7, 0.14);
      const brace = new THREE.Mesh(braceGeom, this.materials.woodDark);
      brace.position.set(0, 0.6, 0.02);
      brace.rotation.z = Math.PI / 4;
      brace.castShadow = true;
      group.add(brace);

      if (upgradeLvl >= 1) {
        const stud = new THREE.Mesh(new THREE.SphereGeometry(0.08, 4, 4), this.materials.iron);
        stud.position.set(-0.4, 0.8, 0.07);
        const stud2 = stud.clone(); stud2.position.x = 0.4;
        group.add(stud, stud2);
      }
      if (upgradeLvl >= 2) {
        const archGeom = new THREE.BoxGeometry(2.0, 0.15, 0.35);
        const arch = new THREE.Mesh(archGeom, this.materials.woodDark);
        arch.position.set(0, 2.3, 0);
        group.add(arch);
      }
    }
    else if (type === 'stoneWall') {
      // Thick stone block (size 1)
      const stoneGeom = new THREE.BoxGeometry(1.0, 1.4, 0.8);
      const wall = new THREE.Mesh(stoneGeom, this.materials.stoneCastle);
      wall.position.set(0, 0.7, 0);
      wall.castShadow = true;
      wall.receiveShadow = true;
      group.add(wall);

      // Battlements/crenellations on top
      const battGeom = new THREE.BoxGeometry(0.3, 0.35, 0.8);
      const battLeft = new THREE.Mesh(battGeom, this.materials.stoneCastle);
      battLeft.position.set(-0.35, 1.575, 0);
      battLeft.castShadow = true;
      group.add(battLeft);

      const battRight = new THREE.Mesh(battGeom, this.materials.stoneCastle);
      battRight.position.set(0.35, 1.575, 0);
      battRight.castShadow = true;
      group.add(battRight);

      if (upgradeLvl >= 1) {
        const trim = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.1, 0.85), this.materials.iron);
        trim.position.set(0, 1.4, 0);
        group.add(trim);
      }
      if (upgradeLvl >= 2) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.8), this.materials.woodDark);
        pole.position.set(0, 1.9, 0);
        const flag = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.18, 0.02), teamMat);
        flag.position.set(0.12, 2.1, 0);
        group.add(pole, flag);
      }
    }
    else if (type === 'stoneGate') {
      // Two stone guard towers on the sides
      const towerGeom = new THREE.CylinderGeometry(0.4, 0.45, 2.5, 8);
      const leftTower = new THREE.Mesh(towerGeom, this.materials.stoneCastle);
      leftTower.position.set(-0.9, 1.25, 0);
      leftTower.castShadow = true;
      leftTower.receiveShadow = true;
      group.add(leftTower);

      const rightTower = new THREE.Mesh(towerGeom, this.materials.stoneCastle);
      rightTower.position.set(0.9, 1.25, 0);
      rightTower.castShadow = true;
      rightTower.receiveShadow = true;
      group.add(rightTower);

      // Conical roofs on towers
      const roofGeom = new THREE.ConeGeometry(0.55, 0.8, 8);
      const leftRoof = new THREE.Mesh(roofGeom, this.materials.roofCastle);
      leftRoof.position.set(-0.9, 2.9, 0);
      leftRoof.castShadow = true;
      group.add(leftRoof);

      const rightRoof = new THREE.Mesh(roofGeom, this.materials.roofCastle);
      rightRoof.position.set(0.9, 2.9, 0);
      rightRoof.castShadow = true;
      group.add(rightRoof);

      // Portcullis grid in middle (iron bars)
      const barsGroup = new THREE.Group();
      const barGeom = new THREE.CylinderGeometry(0.025, 0.025, 1.7, 4);
      const ironMat = this.materials.iron;

      // Vertical bars
      const barOffsets = [-0.35, -0.18, 0, 0.18, 0.35];
      barOffsets.forEach(ox => {
        const bar = new THREE.Mesh(barGeom, ironMat);
        bar.position.set(ox, 0.85, 0);
        bar.castShadow = true;
        barsGroup.add(bar);
      });

      // Horizontal support bars
      const hBarGeom = new THREE.BoxGeometry(0.9, 0.04, 0.04);
      const hBar1 = new THREE.Mesh(hBarGeom, ironMat);
      hBar1.position.set(0, 0.4, 0);
      hBar1.castShadow = true;
      barsGroup.add(hBar1);

      const hBar2 = new THREE.Mesh(hBarGeom, ironMat);
      hBar2.position.set(0, 1.3, 0);
      hBar2.castShadow = true;
      barsGroup.add(hBar2);

      group.add(barsGroup);

      if (upgradeLvl >= 1) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.5, 4), this.materials.iron);
        spike.position.set(-0.9, 3.4, 0);
        const spike2 = spike.clone(); spike2.position.x = 0.9;
        group.add(spike, spike2);
      }
      if (upgradeLvl >= 2) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2), this.materials.iron);
        pole.position.set(0, 2.6, 0);
        const flag = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.02), teamMat);
        flag.position.set(0.2, 3.0, 0);
        group.add(pole, flag);
      }
    }
    else if (type === 'watchTower') {
      const style = this.getArchitectureStyle(civ);
      
      // Foundation
      const baseSlab = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 1.2), foundationMat);
      baseSlab.position.y = 0.1;
      baseSlab.receiveShadow = true;
      group.add(baseSlab);

      if (upgradeLvl >= 1) {
        const riser = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.8, 1.3), foundationMat);
        riser.position.y = -0.3;
        group.add(riser);
      }
      if (upgradeLvl >= 2) {
        const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.15, 8, 1, true), this.materials.goldMetal || this.materials.iron);
        ring.position.y = 2.2;
        group.add(ring);
      }

      if (style === 'eastAsian') {
        const postGeom = new THREE.CylinderGeometry(0.06, 0.06, 3.2, 4);
        const postMat = this.materials.eastAsianWood;
        const positions = [
          [-0.45, 1.6, -0.45],
          [0.45, 1.6, -0.45],
          [-0.45, 1.6, 0.45],
          [0.45, 1.6, 0.45]
        ];
        positions.forEach(pos => {
          const post = new THREE.Mesh(postGeom, postMat);
          post.position.set(...pos);
          post.castShadow = true;
          group.add(post);
        });

        const deck = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.1, 1.3), this.materials.eastAsianRoof);
        deck.position.y = 2.4;
        group.add(deck);

        const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), this.materials.eastAsianWall);
        cabin.position.y = 2.85;
        group.add(cabin);

        const roofGeom = new THREE.ConeGeometry(1.3, 0.7, 4);
        roofGeom.rotateY(Math.PI / 4);
        const roof = new THREE.Mesh(roofGeom, this.materials.eastAsianRoof);
        roof.position.y = 3.6;
        roof.castShadow = true;
        group.add(roof);

        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.8), postMat);
        pole.position.set(0.5, 3.3, 0.5);
        const flag = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.35, 0.18), teamMat);
        flag.position.set(0.5, 3.5, 0.41);
        group.add(pole, flag);

      } else if (style === 'middleEastern') {
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 3.0, 8), this.materials.middleEasternWall);
        tower.position.y = 1.5;
        tower.castShadow = true;
        tower.receiveShadow = true;
        group.add(tower);

        const balcony = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.2, 8), this.materials.middleEasternRoof);
        balcony.position.y = 2.9;
        group.add(balcony);

        const room = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.7, 8), this.materials.middleEasternWall);
        room.position.y = 3.25;
        group.add(room);

        const domeGeom = new THREE.SphereGeometry(0.52, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2);
        const dome = new THREE.Mesh(domeGeom, this.materials.middleEasternDome);
        dome.position.y = 3.6;
        dome.scale.set(1, 1.2, 1);
        dome.castShadow = true;
        group.add(dome);

      } else if (style === 'mesoamerican') {
        const tier1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.5, 1.2), this.materials.mesoamericanWall);
        tier1.position.y = 0.75;
        tier1.castShadow = true;
        tier1.receiveShadow = true;
        group.add(tier1);

        const tier2 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.5, 0.9), this.materials.mesoamericanWall);
        tier2.position.y = 2.25;
        tier2.castShadow = true;
        group.add(tier2);

        const topTrim = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.25, 0.95), this.materials.mesoamericanTrim);
        topTrim.position.y = 3.0;
        group.add(topTrim);

        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.12, 0.2), this.materials.mesoamericanTrim);
        pot.position.y = 3.2;
        const fire = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.2), this.materials.fire);
        fire.position.y = 3.32;
        group.add(pot, fire);

      } else if (style === 'mediterranean') {
        const tower = new THREE.Mesh(new THREE.BoxGeometry(1.0, 3.0, 1.0), this.materials.mediterraneanWall);
        tower.position.y = 1.5;
        tower.castShadow = true;
        tower.receiveShadow = true;
        group.add(tower);

        const roofGeom = new THREE.ConeGeometry(0.9, 0.9, 4);
        roofGeom.rotateY(Math.PI / 4);
        const roof = new THREE.Mesh(roofGeom, this.materials.mediterraneanRoof);
        roof.position.y = 3.45;
        roof.castShadow = true;
        group.add(roof);

        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6), woodMat);
        pole.position.set(0, 3.9, 0);
        const flag = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.02), teamMat);
        flag.position.set(0.1, 4.0, 0);
        group.add(pole, flag);

      } else if (style === 'nordic') {
        const postGeom = new THREE.CylinderGeometry(0.08, 0.08, 3.2, 4);
        const postMat = this.materials.nordicWall;
        const positions = [
          [-0.45, 1.6, -0.45],
          [0.45, 1.6, -0.45],
          [-0.45, 1.6, 0.45],
          [0.45, 1.6, 0.45]
        ];
        positions.forEach(pos => {
          const post = new THREE.Mesh(postGeom, postMat);
          post.position.set(...pos);
          post.castShadow = true;
          group.add(post);
        });

        const tieGeom = new THREE.BoxGeometry(1.0, 0.08, 0.08);
        const tie1 = new THREE.Mesh(tieGeom, postMat);
        tie1.position.set(0, 1.2, 0.45);
        const tie2 = new THREE.Mesh(tieGeom, postMat);
        tie2.position.set(0, 2.2, -0.45);
        group.add(tie1, tie2);

        const deck = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 1.2), this.materials.woodDark);
        deck.position.y = 2.4;
        group.add(deck);

        const railing = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.45, 1.15), this.materials.woodDark);
        railing.position.y = 2.65;
        group.add(railing);

        const roofGeom = new THREE.ConeGeometry(1.3, 0.9, 4);
        roofGeom.rotateY(Math.PI / 4);
        const roof = new THREE.Mesh(roofGeom, this.materials.nordicRoof);
        roof.position.y = 3.55;
        roof.castShadow = true;
        group.add(roof);

        const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 8), this.materials.woodDark);
        sh.rotation.x = Math.PI / 2;
        sh.position.set(0, 2.65, 0.59);
        group.add(sh);

      } else {
        const tower = new THREE.Mesh(new THREE.BoxGeometry(1.0, 3.0, 1.0), wallMat);
        tower.position.y = 1.5;
        tower.castShadow = true;
        tower.receiveShadow = true;
        group.add(tower);

        const roofGeom = new THREE.ConeGeometry(0.9, 0.9, 4);
        roofGeom.rotateY(Math.PI / 4);
        const roof = new THREE.Mesh(roofGeom, roofMat);
        roof.position.y = 3.45;
        roof.castShadow = true;
        group.add(roof);

        const trim = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.25, 1.15), wallMat);
        trim.position.y = 2.95;
        group.add(trim);

        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6), woodMat);
        pole.position.set(0, 3.9, 0);
        const flag = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.02), teamMat);
        flag.position.set(0.1, 4.0, 0);
        group.add(pole, flag);
      }
    }
    else if (type === 'castle') {
      const base = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.4, 4.5), foundationMat);
      base.position.y = 0.2;
      base.receiveShadow = true;
      group.add(base);

      const keep = new THREE.Mesh(new THREE.BoxGeometry(3.0, 3.5, 3.0), wallMat);
      keep.position.y = 2.15;
      keep.castShadow = true;
      keep.receiveShadow = true;
      group.add(keep);

      const towerGeom = new THREE.CylinderGeometry(0.6, 0.6, 4.5, 8);
      const towerOffsets = [
        [-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]
      ];
      towerOffsets.forEach(([tx, tz]) => {
        const tower = new THREE.Mesh(towerGeom, wallMat);
        tower.position.set(tx, 2.25, tz);
        tower.castShadow = true;
        tower.receiveShadow = true;
        group.add(tower);

        const roofCone = new THREE.ConeGeometry(0.75, 1.0, 8);
        const roof = new THREE.Mesh(roofCone, roofMat);
        roof.position.set(tx, 5.0, tz);
        roof.castShadow = true;
        group.add(roof);
      });

      const gate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.6, 0.3), woodMat);
      gate.position.set(0, 0.8, 1.6);
      gate.castShadow = true;
      group.add(gate);

      const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.0), this.materials.iron || woodMat);
      flagPole.position.set(0, 4.9, 0);
      group.add(flagPole);

      const flag = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.05), teamMat);
      flag.position.set(0.4, 5.7, 0);
      group.add(flag);
    }
    else if (type === 'university') {
      const base = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.2, 2.8), foundationMat);
      base.position.y = 0.1;
      base.receiveShadow = true;
      group.add(base);
      
      const mainBuilding = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.4, 2.2), wallMat);
      mainBuilding.position.y = 0.8;
      mainBuilding.castShadow = true;
      mainBuilding.receiveShadow = true;
      group.add(mainBuilding);
      
      const domeGeom = new THREE.SphereGeometry(0.8, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
      const dome = new THREE.Mesh(domeGeom, roofMat);
      dome.position.y = 1.5;
      dome.castShadow = true;
      group.add(dome);
      
      const porch = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.9, 0.5), wallMat);
      porch.position.set(0, 0.55, 1.25);
      porch.castShadow = true;
      group.add(porch);
      
      const pillarGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.8, 4);
      const p1 = new THREE.Mesh(pillarGeom, woodMat);
      p1.position.set(-0.4, 0.5, 1.4);
      const p2 = p1.clone(); p2.position.x = 0.4;
      group.add(p1, p2);
    }
    else if (type === 'siegeWorkshop') {
      const base = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.2, 2.8), this.materials.rock);
      base.position.y = 0.1;
      base.receiveShadow = true;
      group.add(base);
      
      const postGeom = new THREE.BoxGeometry(0.18, 1.4, 0.18);
      const posts = [[-1.2, 0.8, -1.2], [1.2, 0.8, -1.2], [-1.2, 0.8, 1.2], [1.2, 0.8, 1.2]];
      posts.forEach(([px, py, pz]) => {
        const post = new THREE.Mesh(postGeom, woodMat);
        post.position.set(px, py, pz);
        post.castShadow = true;
        group.add(post);
      });
      
      const roof = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.2, 2.7), roofMat);
      roof.position.set(0, 1.6, 0);
      roof.castShadow = true;
      group.add(roof);
      
      const miniWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.08, 6), woodMat);
      miniWheel.rotation.z = Math.PI / 2;
      miniWheel.position.set(0.6, 0.3, 0.5);
      group.add(miniWheel);
      
      const anvil = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.2, 0.15), this.materials.iron);
      anvil.position.set(-0.6, 0.2, 0.4);
      group.add(anvil);
    }
    else if (type === 'stable') {
      const base = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.15, 2.8), this.materials.dirt);
      base.position.y = 0.075;
      base.receiveShadow = true;
      group.add(base);

      const pillarGeom = new THREE.CylinderGeometry(0.08, 0.08, 1.4, 4);
      const positions = [[-1.2, 0.8, -1.2], [1.2, 0.8, -1.2], [-1.2, 0.8, 1.2], [1.2, 0.8, 1.2]];
      positions.forEach(([px, py, pz]) => {
        const post = new THREE.Mesh(pillarGeom, woodMat);
        post.position.set(px, py, pz);
        post.castShadow = true;
        group.add(post);
      });

      const roof = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.15, 2.9), roofMat);
      roof.position.set(0, 1.5, 0);
      roof.rotation.x = 0.1;
      roof.castShadow = true;
      group.add(roof);

      const fenceL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, 2.4), woodMat);
      fenceL.position.set(-1.1, 0.45, 0);
      const fenceR = fenceL.clone();
      fenceR.position.x = 1.1;
      group.add(fenceL, fenceR);

      const hay = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.55, 5), this.materials.thatch);
      hay.position.set(-0.6, 0.4, -0.6);
      group.add(hay);
    }
    else if (type === 'archeryRange') {
      const base = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.15, 2.8), this.materials.dirt);
      base.position.y = 0.075;
      group.add(base);

      const wall = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.2, 0.25), wallMat);
      wall.position.set(0, 0.7, -1.1);
      wall.castShadow = true;
      group.add(wall);

      const roof = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.12, 1.2), roofMat);
      roof.position.set(0, 1.35, -0.65);
      roof.rotation.x = -0.15;
      roof.castShadow = true;
      group.add(roof);

      const targetMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.6 });
      const targetRingMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
      const standMat = woodMat;

      [-0.7, 0.7].forEach(offset => {
        const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.7), standMat);
        stand.position.set(offset, 0.45, 0.5);
        stand.castShadow = true;
        group.add(stand);

        const outer = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.06, 8), targetRingMat);
        outer.position.set(offset, 0.8, 0.5);
        outer.rotation.x = Math.PI / 2.2;
        outer.castShadow = true;
        
        const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.07, 8), targetMat);
        inner.position.y = 0.01;
        outer.add(inner);

        group.add(outer);
      });
    }
    else if (type === 'monastery') {
      const base = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.2, 2.8), foundationMat);
      base.position.y = 0.1;
      group.add(base);

      const hall = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.0, 2.4), wallMat);
      hall.position.set(0, 1.1, -0.1);
      hall.castShadow = true;
      group.add(hall);

      const roof = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.4, 4), roofMat);
      roof.position.set(0, 2.7, -0.1);
      roof.rotation.y = Math.PI / 4;
      roof.scale.set(1.4, 1.0, 2.2);
      roof.castShadow = true;
      group.add(roof);

      const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.25, 1.2, 4), wallMat);
      spire.position.set(0, 3.4, 0.7);
      group.add(spire);

      const crossVert = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.45, 0.05), this.materials.goldMetal);
      crossVert.position.set(0, 4.1, 0.7);
      group.add(crossVert);

      const crossHoriz = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.05), this.materials.goldMetal);
      crossHoriz.position.set(0, 4.25, 0.7);
      group.add(crossHoriz);
    }
    else if (type === 'bombardTower') {
      const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.0, 1.0, 8), wallMat);
      b1.position.y = 0.5;
      b1.castShadow = true;
      group.add(b1);

      const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.85, 1.2, 8), wallMat);
      b2.position.y = 1.6;
      b2.castShadow = true;
      group.add(b2);

      const b3 = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.72, 0.5, 8), wallMat);
      b3.position.y = 2.45;
      b3.castShadow = true;
      group.add(b3);

      const dome = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.8, 0.15, 8), roofMat);
      dome.position.y = 2.75;
      group.add(dome);

      const cannon = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.75, 8), this.materials.iron);
      cannon.position.set(0, 1.9, 0.7);
      cannon.rotation.x = Math.PI / 2.05;
      cannon.castShadow = true;
      group.add(cannon);
    }

    return group;
  }
}
