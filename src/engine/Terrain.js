import * as THREE from 'three';
import { ResourceNode } from '../game/ResourceNode';

export class Terrain {
  constructor(sceneInstance, gameManagerInstance, mapSize = 160) {
    this.scene = sceneInstance;
    this.gameManager = gameManagerInstance;
    this.mapSize = mapSize;
    this.mesh = null;
    this.waterMesh = null;
    this.waterMaterial = null;
    
    // Read map layout selection from GameManager
    this.mapType = this.gameManager.selectedMap || 'river';
    
    this.initGround();
    this.initWaterShader();
    this.spawnResources();
  }

  initGround() {
    // Large grid subdivision to support detailed elevations
    // Use 128x128 grid for high quality, or 64x64 for low graphics (battery saving)
    const segments = this.gameManager.graphicsQuality === 'low' ? 64 : 128;
    const geometry = new THREE.PlaneGeometry(this.mapSize, this.mapSize, segments, segments);
    geometry.rotateX(-Math.PI / 2); // Lay flat
    
    const position = geometry.attributes.position;
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const z = position.getZ(i);
      
      const height = this.calculateGroundHeight(x, z);
      position.setY(i, height);
    }
    geometry.computeVertexNormals();

    // Procedural color mapping based on terrain heights and locations
    const count = geometry.attributes.position.count;
    const colors = [];
    
    const grassColor = new THREE.Color(0x387e3b); // Forest green
    const grassHighlight = new THREE.Color(0x4cae4f); // Rich grass green
    const darkGrass = new THREE.Color(0x245226); // Deep shadow green
    
    const sandColor = new THREE.Color(0xdfcfa5); // Warm desert/beach sand
    const sandDark = new THREE.Color(0xc7b587); // Deep sand dunes
    
    const mudColor = new THREE.Color(0x5c4033); // Riverbed/swamp brown
    const rockColor = new THREE.Color(0x7f8c8d); // Stone peaks
    
    for (let i = 0; i < count; i++) {
      const x = geometry.attributes.position.getX(i);
      const z = geometry.attributes.position.getZ(i);
      const y = geometry.attributes.position.getY(i);
      
      let finalColor = grassColor.clone();
      
      // Checkerboard/Noise pattern mix for retro faceted look
      const gridX = Math.floor(x + this.mapSize / 2) % 2 === 0;
      const gridZ = Math.floor(z + this.mapSize / 2) % 2 === 0;
      const checker = (gridX && gridZ) || (!gridX && !gridZ);
      const noise = Math.sin(x * 0.4) * Math.cos(z * 0.4);
      
      if (this.mapType === 'oasis') {
        // Desert sand textures
        finalColor = sandColor.clone();
        if (checker) finalColor.lerp(sandDark, 0.15 + noise * 0.1);
        
        // Add green grass turf around the center Oasis pool (radius < 22)
        const distFromCenter = Math.sqrt(x*x + z*z);
        if (distFromCenter < 22 && y > -0.5) {
          finalColor.lerp(grassColor, 0.85);
        } else if (y < -0.4) {
          finalColor.lerp(mudColor, 0.6); // damp sand near water
        }
      } 
      else {
        // Temperate grass textures
        if (checker) {
          finalColor.lerp(grassHighlight, 0.2 + noise * 0.08);
        } else {
          finalColor.lerp(darkGrass, 0.15 - noise * 0.08);
        }
        
        // Beach sand coloring at shore level (-0.8 to 0.4)
        if (y < 0.2 && y >= -0.8) {
          const factor = (0.2 - y) / 1.0;
          finalColor.lerp(sandColor, factor * 0.8);
        }
        // Riverbed mud at deep water level (y < -0.8)
        else if (y < -0.8) {
          finalColor.lerp(mudColor, 0.75);
        }
        
        // Rocky mountains at very high hills
        if (y > 2.2) {
          finalColor.lerp(rockColor, 0.5);
        }
      }
      
      colors.push(finalColor.r, finalColor.g, finalColor.b);
    }
    
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.82,
      metalness: 0.06,
      flatShading: true // Faceted low poly structure
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.receiveShadow = this.gameManager.graphicsQuality === 'high';
    this.scene.add(this.mesh);
    
    // Add light green helper grids for grid alignment
    if (this.gameManager.graphicsQuality === 'high') {
      const gridHelper = new THREE.GridHelper(this.mapSize, this.mapSize, 0x1a401a, 0x224c22);
      gridHelper.position.y = 0.02;
      this.scene.add(gridHelper);
    }
  }

  initWaterShader() {
    // Water geometry matching map size
    const waterGeom = new THREE.PlaneGeometry(this.mapSize * 1.5, this.mapSize * 1.5, 64, 64);
    
    // Optimized custom shader material creating "colder" wave animations
    this.waterMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColorBase: { value: new THREE.Color(0x0a2e5c) }, // Colder deep slate blue
        uColorShallow: { value: new THREE.Color(0x00a8cc) } // Clear glacier cyan
      },
      vertexShader: `
        uniform float uTime;
        varying vec3 vPosition;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 pos = position;
          
          // Optimized sine-based low-poly wave calculations on vertex step
          float w1 = sin(pos.x * 0.08 + uTime * 1.4) * cos(pos.y * 0.08 + uTime * 1.4) * 0.22;
          float w2 = sin(pos.x * 0.18 - uTime * 0.8) * cos(pos.y * 0.18 + uTime * 0.8) * 0.08;
          pos.z += w1 + w2;
          
          vPosition = pos;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColorBase;
        uniform vec3 uColorShallow;
        varying vec3 vPosition;
        varying vec2 vUv;
        void main() {
          // Dynamic wave highlight calculation
          float waveHighlight = sin(vPosition.x * 0.7 + uTime * 1.6) * cos(vPosition.y * 0.7 + uTime * 1.6);
          
          // Blend colors from deep slate blue to glacier cyan
          vec3 color = mix(uColorBase, uColorShallow, clamp(waveHighlight * 0.5 + 0.5, 0.0, 1.0));
          
          // Soft foam peaks matching high amplitudes
          if (waveHighlight > 0.82) {
            float foamFactor = (waveHighlight - 0.82) * 5.5;
            color = mix(color, vec3(0.95, 1.0, 1.0), clamp(foamFactor, 0.0, 1.0));
          }
          
          gl_FragColor = vec4(color, 0.86);
        }
      `,
      transparent: true,
      depthWrite: true,
      flatShading: true
    });

    this.waterMesh = new THREE.Mesh(waterGeom, this.waterMaterial);
    this.waterMesh.rotateX(-Math.PI / 2);
    this.waterMesh.position.y = -1.2; // Fixed sea level
    this.scene.add(this.waterMesh);
  }

  update(deltaTime) {
    if (this.waterMaterial) {
      this.waterMaterial.uniforms.uTime.value += deltaTime;
    }
  }

  calculateGroundHeight(x, z) {
    const halfMap = this.mapSize / 2;
    
    // Fade height values at absolute boundaries to blend into water
    const distanceFromCenter = Math.max(Math.abs(x), Math.abs(z));
    
    // Standard noise base for natural elevations
    const baseHills = Math.sin(x * 0.12) * Math.cos(z * 0.12) * 0.5 + 
                     Math.sin(x * 0.04) * Math.cos(z * 0.04) * 1.2;

    if (this.mapType === 'river') {
      // River runs down the center of the map (z-axis, at x = 0)
      // Dip heights around x = 0
      const distToRiver = Math.abs(x);
      
      if (distToRiver < 14) {
        // Crossings at z = -35 and z = 35 (walkable shallows)
        const nearCrossing1 = Math.abs(z - 35) < 6;
        const nearCrossing2 = Math.abs(z + 35) < 6;
        
        if (nearCrossing1 || nearCrossing2) {
          // Shallow crossing level
          return -0.4 + baseHills * 0.1;
        }
        
        // Deep river channel
        const depthFactor = (14 - distToRiver) / 14;
        return baseHills * 0.2 - Math.pow(depthFactor, 2) * 3.5;
      }
      
      // Standard hills on sides
      return baseHills + 0.3;
    } 
    else if (this.mapType === 'islands') {
      // 4 Main circular islands in 4 corners of quadrants
      const spawnDist = Math.round(this.mapSize * 0.32);
      const islands = [
        { cx: -spawnDist, cz: -spawnDist }, // Player
        { cx: -spawnDist, cz: spawnDist },  // Ally
        { cx: spawnDist, cz: spawnDist },   // Enemy
        { cx: spawnDist, cz: -spawnDist }   // Neutral
      ];
      
      let highestIslandHeight = -4.0;
      let isOnIsland = false;
      
      islands.forEach(isl => {
        const dx = x - isl.cx;
        const dz = z - isl.cz;
        const dist = Math.sqrt(dx*dx + dz*dz);
        
        if (dist < 32) {
          isOnIsland = true;
          // Island slopes up towards center
          const factor = (32 - dist) / 32;
          const h = baseHills * 0.5 + Math.pow(factor, 0.8) * 3.0;
          if (h > highestIslandHeight) highestIslandHeight = h;
        }
      });

      // Walkable shallow channels connecting adjacent islands (1 to 2, 2 to 3, 3 to 4, 4 to 1)
      const checkLandBridge = (x1, z1, x2, z2) => {
        // Distance to line segment
        const l2 = Math.pow(x1-x2, 2) + Math.pow(z1-z2, 2);
        if (l2 === 0) return Infinity;
        let t = ((x - x1) * (x2 - x1) + (z - z1) * (z2 - z1)) / l2;
        t = Math.max(0, Math.min(1, t));
        const projX = x1 + t * (x2 - x1);
        const projZ = z1 + t * (z2 - z1);
        return Math.sqrt(Math.pow(x - projX, 2) + Math.pow(z - projZ, 2));
      };

      const bridges = [
        checkLandBridge(-spawnDist, -spawnDist, -spawnDist, spawnDist), // Player to Ally
        checkLandBridge(-spawnDist, spawnDist, spawnDist, spawnDist),  // Ally to Enemy
        checkLandBridge(spawnDist, spawnDist, spawnDist, -spawnDist),   // Enemy to Neutral
        checkLandBridge(spawnDist, -spawnDist, -spawnDist, -spawnDist)  // Neutral to Player
      ];

      let bridgeMinDist = Math.min(...bridges);
      if (bridgeMinDist < 4.5) {
        // Inside land bridge: shallow walkable gravel
        const bridgeHeight = -0.3 + baseHills * 0.1;
        return isOnIsland ? Math.max(highestIslandHeight, bridgeHeight) : bridgeHeight;
      }

      if (isOnIsland) return highestIslandHeight;
      
      // Deep sea channels
      return -4.0 + Math.sin(x*0.1) * 0.1;
    } 
    else if (this.mapType === 'coastal') {
      // Shoreline: land on left (-x), sea on right (+x)
      // Transition shoreline at x = 12
      if (x > 12) {
        // Ocean bed sloping down
        const factor = Math.min(1.0, (x - 12) / (halfMap - 12));
        return baseHills * 0.2 - Math.pow(factor, 2) * 5.0;
      } else {
        // Slope up to rolling green hills
        const factor = Math.max(0, (12 - x) / (halfMap + 12));
        return baseHills + factor * 2.5;
      }
    } 
    else if (this.mapType === 'oasis') {
      // Central oasis pool at center (x=0, z=0)
      const distFromCenter = Math.sqrt(x*x + z*z);
      if (distFromCenter < 14) {
        // Deep oasis pond
        const factor = (14 - distFromCenter) / 14;
        return -2.5 + baseHills * 0.1;
      } else if (distFromCenter < 24) {
        // Soft mud banks & green turf surround
        const factor = (24 - distFromCenter) / 10;
        return baseHills * 0.3 + (1.0 - factor) * 0.5;
      }
      
      // Soft rolling desert sand dunes
      return Math.sin(x * 0.08) * Math.cos(z * 0.08) * 0.6;
    }

    return baseHills;
  }

  getGroundHeight(x, z) {
    return this.calculateGroundHeight(x, z);
  }

  spawnResources() {
    const spawnCluster = (centerX, centerZ, count, type, radius) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * radius;
        const x = Math.round(centerX + Math.cos(angle) * r);
        const z = Math.round(centerZ + Math.sin(angle) * r);
        
        // Boundaries
        if (Math.abs(x) > this.mapSize * 0.44 || Math.abs(z) > this.mapSize * 0.44) continue;
        
        // Collision avoidances
        if (this.gameManager.isCellBlocked(x, z)) continue;

        // Ground check
        const height = this.getGroundHeight(x, z);
        if (height < -0.5) continue; // No spawns in water

        // Add
        const node = new ResourceNode(this.gameManager, type, x, height, z);
        this.gameManager.entityManager.addResource(node);
      }
    };

    const spawnDist = Math.round(this.mapSize * 0.32);

    if (this.mapType === 'oasis') {
      // Massive resource concentrations around the central green Oasis (contestable!)
      const radius = 24;
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 10) {
        const ox = Math.round(Math.cos(angle) * radius);
        const oz = Math.round(Math.sin(angle) * radius);
        
        const typeRand = Math.random();
        let type = 'wood'; // Mostly palm trees
        if (typeRand > 0.72) type = 'gold';
        else if (typeRand > 0.88) type = 'stone';

        const h = this.getGroundHeight(ox, oz);
        if (h >= -0.5 && !this.gameManager.isCellBlocked(ox, oz)) {
          const node = new ResourceNode(this.gameManager, type, ox, h, oz);
          this.gameManager.entityManager.addResource(node);
        }
      }
      
      // Scatter sparse cacti (wood) and small stone dunes in other desert areas
      spawnCluster(-spawnDist, -spawnDist + 10, 5, 'wood', 5);
      spawnCluster(-spawnDist + 10, -spawnDist, 3, 'gold', 3);
      spawnCluster(-spawnDist, -spawnDist - 10, 3, 'stone', 4);

      spawnCluster(spawnDist, spawnDist - 10, 5, 'wood', 5);
      spawnCluster(spawnDist - 10, spawnDist, 3, 'gold', 3);
      
      spawnCluster(-spawnDist, spawnDist - 10, 5, 'wood', 5);
      spawnCluster(spawnDist, -spawnDist + 10, 5, 'wood', 5);
    } 
    else if (this.mapType === 'islands') {
      // Equal resource deposits on each corner island for balanced gameplay
      const islandCenters = [
        { cx: -spawnDist, cz: -spawnDist }, // Player
        { cx: -spawnDist, cz: spawnDist },  // Ally
        { cx: spawnDist, cz: spawnDist },   // Enemy
        { cx: spawnDist, cz: -spawnDist }   // Neutral
      ];

      islandCenters.forEach(isl => {
        // Wood, Gold, Stone clusters on each island
        spawnCluster(isl.cx - 8, isl.cz + 8, 8, 'wood', 4);
        spawnCluster(isl.cx + 8, isl.cz - 8, 3, 'gold', 2);
        spawnCluster(isl.cx - 8, isl.cz - 8, 3, 'stone', 2);
        spawnCluster(isl.cx + 6, isl.cz + 6, 2, 'wood', 3);
      });
    } 
    else if (this.mapType === 'coastal') {
      // Inland forest clusters (left side of map)
      spawnCluster(-spawnDist, -spawnDist + 8, 12, 'wood', 6);
      spawnCluster(-spawnDist, spawnDist - 8, 12, 'wood', 6);
      spawnCluster(-spawnDist - 10, 0, 15, 'wood', 8);

      // Gold and stone deposits scattered on land
      spawnCluster(-spawnDist + 10, -spawnDist - 6, 4, 'gold', 3);
      spawnCluster(-spawnDist + 10, spawnDist + 6, 4, 'gold', 3);
      spawnCluster(-spawnDist + 15, 0, 4, 'stone', 3);

      // Beach treasures (highly valuable gold mines along the coastline)
      spawnCluster(8, -15, 4, 'gold', 2);
      spawnCluster(8, 15, 4, 'gold', 2);
      spawnCluster(6, 0, 3, 'stone', 2);
    } 
    else { // River Valley
      // Cluster resources relative to river banks (river at x=0)
      // Left bank (Player & Ally)
      spawnCluster(-25, -25, 12, 'wood', 6);
      spawnCluster(-25, 25, 12, 'wood', 6);
      spawnCluster(-18, -12, 5, 'gold', 3);
      spawnCluster(-20, 10, 4, 'stone', 3);

      // Right bank (Enemy & Neutral)
      spawnCluster(25, 25, 12, 'wood', 6);
      spawnCluster(25, -25, 12, 'wood', 6);
      spawnCluster(18, 12, 5, 'gold', 3);
      spawnCluster(20, -10, 4, 'stone', 3);

      // Central contestable deposits at river crossing borders
      spawnCluster(-6, -30, 4, 'gold', 2);
      spawnCluster(6, -30, 4, 'gold', 2);
      spawnCluster(-6, 30, 4, 'stone', 2);
      spawnCluster(6, 30, 4, 'stone', 2);
    }
  }
}
