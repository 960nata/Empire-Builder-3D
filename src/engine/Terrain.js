import * as THREE from 'three';
import { ResourceNode } from '../game/ResourceNode';

// ─────────────────────────────────────────────────────────
//  Deterministic 2D noise helpers (CPU side, mirrored in GLSL)
// ─────────────────────────────────────────────────────────
function hash2D(x, z) {
  // Deterministic pseudo-random scalar from 2D input
  let n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return n - Math.floor(n);
}
function noise2D(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z);
  const fx = x - ix, fz = z - iz;
  // Smooth cubic interpolation
  const ux = fx * fx * (3 - 2 * fx);
  const uz = fz * fz * (3 - 2 * fz);
  const a = hash2D(ix,     iz);
  const b = hash2D(ix + 1, iz);
  const c = hash2D(ix,     iz + 1);
  const d = hash2D(ix + 1, iz + 1);
  return (a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz) * 2.0 - 1.0;
}
function fbm(x, z, octaves = 4) {
  let value = 0, amplitude = 0.5, frequency = 1.0, max = 0;
  for (let i = 0; i < octaves; i++) {
    value     += amplitude * noise2D(x * frequency, z * frequency);
    max       += amplitude;
    amplitude *= 0.5;
    frequency *= 2.1;
  }
  return value / max;
}

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function pointToSegmentDistance(px, pz, x1, z1, x2, z2) {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const lenSq = dx * dx + dz * dz;
  if (lenSq === 0) return Math.sqrt((px - x1) * (px - x1) + (pz - z1) * (pz - z1));
  let t = ((px - x1) * dx + (pz - z1) * dz) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * dx;
  const projZ = z1 + t * dz;
  return Math.sqrt((px - projX) * (px - projX) + (pz - projZ) * (pz - projZ));
}

export class Terrain {
  constructor(sceneInstance, gameManagerInstance, mapSize = 350) {
    this.scene = sceneInstance;
    this.gameManager = gameManagerInstance;
    this.gameManager.terrain = this; // Set reference early to resolve initialization race conditions
    this.mapSize = mapSize;
    this.mesh = null;
    this.waterMesh = null;
    this.waterMaterial = null;
    this.seaweedMeshes = []; // tracked for sway animation
    
    // Read map layout selection from GameManager
    this.mapType = this.gameManager.selectedMap || 'river';
    this._mapTypeInt = ['river','islands','coastal','oasis'].indexOf(this.mapType);
    if (this._mapTypeInt < 0) this._mapTypeInt = 0;

    // Pre-calculate base-to-base road segments
    const sd = Math.round(this.mapSize * 0.32);
    this.roadSegments = [];
    if (this.mapType === 'river') {
      // Player to Ally
      this.roadSegments.push({ x1: -sd, z1: -sd, x2: -sd, z2: sd });
      // Ally to Enemy via Northern Bridge
      this.roadSegments.push({ x1: -sd, z1: sd, x2: 0, z2: 35 });
      this.roadSegments.push({ x1: 0, z1: 35, x2: sd, z2: sd });
      // Enemy to Neutral
      this.roadSegments.push({ x1: sd, z1: sd, x2: sd, z2: -sd });
      // Neutral to Player via Southern Bridge
      this.roadSegments.push({ x1: sd, z1: -sd, x2: 0, z2: -35 });
      this.roadSegments.push({ x1: 0, z1: -35, x2: -sd, z2: -sd });
    } else {
      // Ring path for other maps
      this.roadSegments.push({ x1: -sd, z1: -sd, x2: -sd, z2: sd });
      this.roadSegments.push({ x1: -sd, z1: sd, x2: sd, z2: sd });
      this.roadSegments.push({ x1: sd, z1: sd, x2: sd, z2: -sd });
      this.roadSegments.push({ x1: sd, z1: -sd, x2: -sd, z2: -sd });
    }
    
    this.initGround();
    this.initWaterShader();
    this.spawnResources();
    this.spawnScenery();
  }

  getDistanceToRoads(x, z, perturb = true) {
    let px = x;
    let pz = z;
    if (perturb) {
      px += noise2D(x * 0.08, z * 0.08) * 3.5;
      pz += noise2D(x * 0.08 + 10.0, z * 0.08 + 10.0) * 3.5;
    }
    
    let minDist = Infinity;
    for (let i = 0; i < this.roadSegments.length; i++) {
      const seg = this.roadSegments[i];
      const dist = pointToSegmentDistance(px, pz, seg.x1, seg.z1, seg.x2, seg.z2);
      if (dist < minDist) {
        minDist = dist;
      }
    }
    return minDist;
  }

  initGround() {
    const segments = this.gameManager.graphicsQuality === 'low' ? 64 : 128;
    const geometry = new THREE.PlaneGeometry(this.mapSize, this.mapSize, segments, segments);
    geometry.rotateX(-Math.PI / 2);

    const position = geometry.attributes.position;
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const z = position.getZ(i);
      position.setY(i, this.calculateGroundHeight(x, z));
    }
    geometry.computeVertexNormals();

    // ── Slope & Height based vertex colours ──────────────────────────
    const cGrass1  = new THREE.Color(0x3d8c42);  // Mid green
    const cGrass2  = new THREE.Color(0x2d6b31);  // Dark shadow green
    const cGrass3  = new THREE.Color(0x56ab5c);  // Sun-lit grass tip
    const cSand    = new THREE.Color(0xd9c69c);  // Warm beach sand
    const cSandWet = new THREE.Color(0xb0a078);  // Wet shore sand
    const cMud     = new THREE.Color(0x4e3828);  // Riverbed mud
    const cRock    = new THREE.Color(0x6e6b62);  // Granite cliff
    const cRockLt  = new THREE.Color(0x9a968e);  // Lighter rock face
    const cSnow    = new THREE.Color(0xeef2f5);  // Snow cap

    const count = position.count;
    const normals = geometry.attributes.normal;
    const colors  = [];

    for (let i = 0; i < count; i++) {
      const x  = position.getX(i);
      const z  = position.getZ(i);
      const y  = position.getY(i);
      const ny = normals.getY(i);   // 1 = flat, 0 = vertical cliff
      const steepness = 1.0 - Math.max(0, Math.min(1, ny));

      let col = cGrass1.clone();

      if (this.mapType === 'oasis') {
        // Desert base
        col = cSand.clone();
        const micro = fbm(x * 0.35, z * 0.35, 3);
        col.lerp(cSandWet, Math.max(0, micro * 0.25 + 0.1));
        const dc = Math.sqrt(x * x + z * z);
        if (dc < 22 && y > -0.5)  col.lerp(cGrass1, 0.9);
        if (y < -0.5)             col.lerp(cMud, 0.7);
      } else {
        // ── Grass with micro-noise variation (no checkerboard) ──
        const micro = fbm(x * 0.55, z * 0.55, 3) * 0.5 + 0.5; // 0-1
        col = cGrass2.clone().lerp(cGrass3, micro);

        // ── Sandy beach / shore transition ──
        const WATER_LEVEL = -1.2;
        if (y < WATER_LEVEL + 1.5 && y >= WATER_LEVEL) {
          const t = 1.0 - (y - WATER_LEVEL) / 1.5;
          col.lerp(cSand, t * 0.9);
        }
        // ── Wet mud in water (re-colored to tropical sand to eliminate black shading) ──
        if (y < WATER_LEVEL) {
          col = cSand.clone();
          const depthFactor = Math.min(1.0, (WATER_LEVEL - y) / 3.0);
          col.lerp(cSandWet, depthFactor * 0.6);
        }
      }

      // ── Paint traditional dirt/gravel road ──
      if (y > -0.55) {
        const roadDist = this.getDistanceToRoads(x, z, true);
        if (roadDist < 3.8) {
          const cRoad = new THREE.Color(0x8e765d); // Warm dirt color
          const microRoad = fbm(x * 0.45, z * 0.45, 3) * 0.15;
          cRoad.addScalar(microRoad);
          
          const t = 1.0 - smoothstep(1.5, 3.8, roadDist);
          col.lerp(cRoad, t * 0.95);
        }
      }

      // ── Cliff rock on steep slopes ──
      if (steepness > 0.2) {
        const t = Math.min(1.0, (steepness - 0.2) / 0.45);
        const rockMix = cRock.clone().lerp(cRockLt, fbm(x * 0.4, z * 0.4, 2) * 0.5 + 0.5);
        col.lerp(rockMix, t);
      }

      // ── Snow on high flat peaks ──
      if (y > 5.0 && steepness < 0.3) {
        const snowT = Math.min(1, (y - 5.0) / 2.5) * (1.0 - steepness / 0.3);
        col.lerp(cSnow, snowT * 0.95);
      }

      // Fade to black at map edges to make outside dark
      const maxDistFromCenter = Math.max(Math.abs(x), Math.abs(z));
      const edgeStart = this.mapSize * 0.45;
      const edgeEnd = this.mapSize * 0.5;
      if (maxDistFromCenter > edgeStart) {
        const edgeFade = 1.0 - Math.min(1.0, (maxDistFromCenter - edgeStart) / (edgeEnd - edgeStart));
        col.multiplyScalar(edgeFade);
      }

      colors.push(col.r, col.g, col.b);
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.78,  // slightly less rough — picks up more light variation
      metalness: 0.06,
      envMapIntensity: 0.4,
      flatShading: false
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.receiveShadow = true;
    this.scene.add(this.mesh);
  }

  initWaterShader() {
    const waterSegments = this.gameManager.graphicsQuality === 'low' ? 64 : 128;
    const waterGeom = new THREE.PlaneGeometry(this.mapSize * 1.5, this.mapSize * 1.5, waterSegments, waterSegments);

    // ── GLSL noise helper (mirrors CPU fbm for wave damping & depth lookup) ──
    const glslNoise = /* glsl */`
      float hash2(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      float noise2(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p);
        f = f*f*(3.0-2.0*f);
        float a = hash2(i), b = hash2(i+vec2(1,0));
        float c = hash2(i+vec2(0,1)), d = hash2(i+vec2(1,1));
        return mix(mix(a,b,f.x), mix(c,d,f.x), f.y)*2.0-1.0;
      }
      float fbm2(vec2 p) {
        float v=0.,a=0.5,f=1.; float mx=0.;
        for(int i=0;i<4;i++){v+=a*noise2(p*f);mx+=a;a*=0.5;f*=2.1;}
        return v/mx;
      }
      // Approximate terrain height from position (matches CPU calculateGroundHeight)
      float terrainHeight(vec2 xz, int mapType, float mapSize) {
        float bh = fbm2(xz*0.04)*1.4 + fbm2(xz*0.13)*0.45;
        float dist = max(abs(xz.x), abs(xz.y));
        float mf = clamp((dist - mapSize*0.3) / (mapSize*0.2), 0.0, 1.0);
        float mNoise = fbm2(xz*0.25)*0.6 + 0.6;
        float ridges = abs(fbm2(xz*0.1));
        float mh = pow(mf, 1.8) * 16.0 * mNoise + pow(mf, 2.0) * 8.0 * ridges;
        if(mapType==0){ // river
          float dr = abs(xz.x);
          if(dr<14.0){
            bool c1=abs(xz.y-35.0)<6.0, c2=abs(xz.y+35.0)<6.0;
            if(c1||c2) return -0.4+bh*0.1;
            float df=(14.0-dr)/14.0; return bh*0.2-pow(df,2.0)*3.5;
          }
          return bh+0.3+mh;
        }
        if(mapType==2){ // coastal
          if(xz.x>12.0){float f2=min(1.,(xz.x-12.)/(mapSize*.5-12.));return bh*.2-pow(f2,2.)*5.;}
          float f3=max(0.,(12.-xz.x)/(mapSize*.5+12.));return bh+f3*2.5+mh;
        }
        if(mapType==3){ // oasis
          float dc=length(xz);
          if(dc<14.) return -2.5+bh*0.1;
          if(dc<24.) return bh*0.3+(1.-(24.-dc)/10.)*0.5;
          return fbm2(xz*0.08)*0.6+mh;
        }
        return bh+mh; // generic/islands
      }
    `;

    this.waterMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime:         { value: 0 },
        uSunDir:       { value: new THREE.Vector3(0.5, 0.75, 0.25).normalize() },
        uCameraPos:    { value: new THREE.Vector3() },
        uDeepColor:    { value: new THREE.Color(0x011a42) }, // Deep navy blue
        uMidColor:     { value: new THREE.Color(0x0c7da0) }, // Rich teal-blue
        uShallowColor: { value: new THREE.Color(0x14ebd0) }, // Vibrant turquoise / blue-greenish
        uFoamColor:    { value: new THREE.Color(0xecf5f8) },
        uSpecularColor:{ value: new THREE.Color(0xfff8e0) },
        uMapSize:      { value: this.mapSize },
        uMapType:      { value: this._mapTypeInt },
        uWaterLevel:   { value: -1.2 }
      },

      vertexShader: /* glsl */`
        uniform float uTime;
        uniform float uMapSize;
        uniform int   uMapType;
        uniform float uWaterLevel;

        varying vec3  vWorldPos;
        varying vec2  vUv;
        varying float vWaveHeight;
        varying vec3  vNormal;
        varying float vDepth;        // approx water depth at vertex

        ${glslNoise}

        vec3 gerstnerWave(vec2 pos, float amp, float wlen, float spd, vec2 dir, float steep, float damp) {
          float k = 6.28318 / wlen;
          float c = spd * sqrt(9.8 / k);
          float f = k * (dot(dir, pos) - c * uTime);
          float a = steep / k * damp;
          return vec3(dir.x*(a*cos(f)), amp*damp*sin(f), dir.y*(a*cos(f)));
        }

        void main() {
          vUv = uv;
          vec3 pos = position;
          vec2 worldXZ = pos.xy;

          // Terrain height under this water vertex → depth for damping
          float tHeight = terrainHeight(worldXZ, uMapType, uMapSize);
          float rawDepth = uWaterLevel - tHeight;      // > 0 = underwater
          vDepth = max(rawDepth, 0.0);

          // Damp waves in shallow water so shore is calm
          float damp = clamp(vDepth / 1.2, 0.0, 1.0);
          damp = damp * damp; // quadratic damping

          vec3 w1 = gerstnerWave(worldXZ, 0.38, 18.0, 1.2, normalize(vec2(1.0, 0.3)),  0.40, damp);
          vec3 w2 = gerstnerWave(worldXZ, 0.22, 12.0, 0.9, normalize(vec2(-0.5,1.0)),  0.35, damp);
          vec3 w3 = gerstnerWave(worldXZ, 0.13, 7.0,  1.5, normalize(vec2(0.7,-0.6)),  0.30, damp);
          vec3 w4 = gerstnerWave(worldXZ, 0.07, 4.0,  2.0, normalize(vec2(-0.3,-0.8)), 0.25, damp);

          vec3 totalWave = w1 + w2 + w3 + w4;
          pos.x += totalWave.x;
          pos.y += totalWave.z;
          pos.z += totalWave.y;
          vWaveHeight = totalWave.y;

          // Approximate normal from finite differences
          float eps = 0.6;
          vec3 wr = gerstnerWave(worldXZ+vec2(eps,0.),0.38,18.,1.2,normalize(vec2(1.,0.3)),0.4,damp)
                   +gerstnerWave(worldXZ+vec2(eps,0.),0.22,12.,0.9,normalize(vec2(-.5,1.)),0.35,damp)
                   +gerstnerWave(worldXZ+vec2(eps,0.),0.13,7.,1.5,normalize(vec2(.7,-.6)),0.3,damp);
          vec3 wu = gerstnerWave(worldXZ+vec2(0.,eps),0.38,18.,1.2,normalize(vec2(1.,0.3)),0.4,damp)
                   +gerstnerWave(worldXZ+vec2(0.,eps),0.22,12.,0.9,normalize(vec2(-.5,1.)),0.35,damp)
                   +gerstnerWave(worldXZ+vec2(0.,eps),0.13,7.,1.5,normalize(vec2(.7,-.6)),0.3,damp);
          vec3 tang    = vec3(eps, 0., wr.y - totalWave.y);
          vec3 bitang  = vec3(0., eps, wu.y - totalWave.y);
          vNormal  = normalize(cross(bitang, tang));
          vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,

      fragmentShader: /* glsl */`
        uniform float uTime;
        uniform vec3  uSunDir;
        uniform vec3  uCameraPos;
        uniform vec3  uDeepColor;
        uniform vec3  uMidColor;
        uniform vec3  uShallowColor;
        uniform vec3  uFoamColor;
        uniform vec3  uSpecularColor;
        uniform float uMapSize;

        varying vec3  vWorldPos;
        varying vec2  vUv;
        varying float vWaveHeight;
        varying vec3  vNormal;
        varying float vDepth;

        float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
        float noiseF(vec2 p) {
          vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
          return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
                     mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
        }
        float caustic(vec2 uv) {
          return noiseF(uv*3.+uTime*.4)*.5
               + noiseF(uv*6.-uTime*.3)*.25
               + noiseF(uv*12.+uTime*.5)*.125;
        }

        void main() {
          vec3 viewDir = normalize(uCameraPos - vWorldPos);

          // ── Perturbed normal from ripple detail ──
          vec2 rUV = vWorldPos.xz * 0.15;
          float r1 = noiseF(rUV*2.0 + uTime*vec2(0.3,0.2))*2.-1.;
          float r2 = noiseF(rUV*3.5 - uTime*vec2(0.2,0.35))*2.-1.;
          vec3 pNormal = normalize(vNormal + vec3(r1,0.,r2)*0.15);

          // ── Fresnel ──
          float fresnel = pow(1.-max(dot(viewDir,pNormal),0.),3.);
          fresnel = clamp(fresnel, 0.05, 0.88);

          // ── Depth-based colour ──
          // vDepth: metres of water above terrain
          float depthT = clamp(vDepth / 6.0, 0.0, 1.0);  // 0=shore, 1=deep
          vec3 waterColor = uShallowColor;
          waterColor = mix(waterColor, uMidColor,  smoothstep(0.0, 0.4, depthT));
          waterColor = mix(waterColor, uDeepColor, smoothstep(0.3, 1.0, depthT));

          // ── Wave height brightens mid-water ──
          float hf = clamp((vWaveHeight+0.25)*2., 0., 1.);
          waterColor += vec3(0.02,0.05,0.06)*hf*(1.-depthT);

          // ── Sun specular — tight hotspot + wide glint (both exceed threshold → bloom) ──
          vec3 halfV = normalize(uSunDir + viewDir);
          float sp = max(dot(pNormal, halfV), 0.);
          float spHot  = pow(sp, 192.) * 2.2;  // ultra-tight brilliant highlight
          float spWide = pow(sp, 20.)  * 0.25; // broad shimmer across the surface
          waterColor += uSpecularColor * (spHot + spWide);

          // ── Caustics shimmer boost (brighter for bloom pickup) ──
          float cVal = caustic(vWorldPos.xz * 0.06);
          waterColor += vec3(0.04,0.10,0.13) * cVal * (1.-depthT) * 1.8;

          // ── Whitecaps ──
          float foam = smoothstep(0.26, 0.42, vWaveHeight)
                     * smoothstep(0.3, 0.6, noiseF(vWorldPos.xz*.8+uTime*.3));
          waterColor = mix(waterColor, uFoamColor * 1.1, foam * 0.82);

          // ── Shore foam: bright frothy line at depth 0.0 → 0.6 ──
          float shoreFoam = (1.-smoothstep(0.0, 0.6, vDepth))
                          * smoothstep(0.35,0.65, noiseF(vWorldPos.xz*.45+uTime*vec2(.5,.2)));
          waterColor = mix(waterColor, uFoamColor, shoreFoam * 0.78);

          // ── Sky reflection — richer blue sky palette ──
          vec3 sky = mix(vec3(0.10,0.18,0.45), vec3(0.52,0.72,0.95), max(pNormal.y,0.));
          waterColor = mix(waterColor, sky, fresnel * 0.42);

          // ── Alpha: opaque in deep, transparent at shore ──
          // Smooth power curve for gradual transparency near the shore edges
          float alpha = pow(clamp(vDepth / 1.8, 0.0, 1.0), 1.5);
          alpha = mix(alpha, 0.94, smoothstep(0.1, 0.8, depthT)); // deeper water is mostly opaque (94%)
          alpha = mix(alpha, 0.96, foam);                          // foam is fully opaque
          alpha = max(alpha, shoreFoam*0.85);                      // make sure shore foam remains visible

          // Fade water to black at map edges to make outside dark
          float maxDist = max(abs(vWorldPos.x), abs(vWorldPos.z));
          float edgeStart = uMapSize * 0.45;
          float edgeEnd = uMapSize * 0.5;
          if (maxDist > edgeStart) {
            float edgeFade = 1.0 - clamp((maxDist - edgeStart) / (edgeEnd - edgeStart), 0.0, 1.0);
            waterColor *= edgeFade;
            alpha = mix(1.0, alpha, edgeFade); // Fade to opaque black to blend into void background
          }

          gl_FragColor = vec4(waterColor, clamp(alpha,0.,1.));
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    this.waterMesh = new THREE.Mesh(waterGeom, this.waterMaterial);
    this.waterMesh.rotateX(-Math.PI / 2);
    this.waterMesh.position.y = -1.2;
    this.scene.add(this.waterMesh);

    if (this.gameManager.graphicsQuality === 'high') {
      this.initCausticProjector();
    }
  }

  initCausticProjector() {
    // Subtle underwater caustic effect using animated point lights near water surface
    this.causticLights = [];
    const lightCount = 3;
    for (let i = 0; i < lightCount; i++) {
      const light = new THREE.PointLight(0x1ab5c4, 0.3, 25, 2);
      light.position.set(
        Math.cos(i * Math.PI * 2 / lightCount) * 15,
        -0.5,
        Math.sin(i * Math.PI * 2 / lightCount) * 15
      );
      this.scene.add(light);
      this.causticLights.push(light);
    }
  }

  update(deltaTime) {
    if (this.waterMaterial) {
      this.waterMaterial.uniforms.uTime.value += deltaTime;
      if (this.gameManager.renderer && this.gameManager.renderer.camera) {
        this.waterMaterial.uniforms.uCameraPos.value.copy(
          this.gameManager.renderer.camera.position
        );
      }
    }

    // ── Animate caustic lights ──
    if (this.causticLights) {
      const time = this.waterMaterial.uniforms.uTime.value;
      this.causticLights.forEach((light, i) => {
        const angle = time * 0.15 + i * Math.PI * 2 / this.causticLights.length;
        const cameraTarget = this.gameManager.renderer.cameraTarget;
        light.position.x = cameraTarget.x + Math.cos(angle) * 18;
        light.position.z = cameraTarget.z + Math.sin(angle) * 18;
        light.intensity = 0.2 + Math.sin(time * 0.8 + i) * 0.1;
      });
    }

    // ── Animate seaweed sways ──
    if (this.seaweedMeshes && this.seaweedMeshes.length > 0) {
      const t = (this.waterMaterial ? this.waterMaterial.uniforms.uTime.value : 0);
      for (let i = 0; i < this.seaweedMeshes.length; i++) {
        const sw = this.seaweedMeshes[i];
        const sway = Math.sin(t * sw._swaySpeed + sw._swayPhase) * sw._swayAmp;
        sw.rotation.x = sway;
        sw.rotation.z = Math.cos(t * sw._swaySpeed * 0.75 + sw._swayPhase) * sw._swayAmp * 0.7;
      }
    }
  }

  calculateGroundHeight(x, z) {
    const halfMap = this.mapSize / 2;

    // ── Organic fBm-based terrain with large and fine detail ──
    const baseHills = fbm(x * 0.04, z * 0.04, 4) * 1.4   // large rolling hills
                    + fbm(x * 0.13, z * 0.13, 3) * 0.45; // fine bumps

    // ── Border mountain ridges (Jagged & Sharp) ──
    const distanceFromCenter = Math.max(Math.abs(x), Math.abs(z));
    let mountainHeight = 0;
    if (distanceFromCenter > this.mapSize * 0.3) {
      const factor = Math.max(0, Math.min(1,
        (distanceFromCenter - this.mapSize * 0.3) / (this.mapSize * 0.2)));
      const mNoise = fbm(x * 0.25, z * 0.25, 3) * 0.6 + 0.6;
      const ridges = Math.abs(fbm(x * 0.1, z * 0.1, 2));
      mountainHeight = Math.pow(factor, 1.8) * 16.0 * mNoise + Math.pow(factor, 2.0) * 8.0 * ridges;
    }

    if (this.mapType === 'river') {
      const distToRiver = Math.abs(x);
      if (distToRiver < 14) {
        const nearCrossing1 = Math.abs(z - 35) < 6;
        const nearCrossing2 = Math.abs(z + 35) < 6;
        if (nearCrossing1 || nearCrossing2) return -0.4 + baseHills * 0.08;
        const depthFactor = (14 - distToRiver) / 14;
        return baseHills * 0.15 - Math.pow(depthFactor, 2) * 3.8;
      }
      return baseHills + 0.4 + mountainHeight;
    }
    else if (this.mapType === 'islands') {
      const spawnDist = Math.round(this.mapSize * 0.32);
      const islands = [
        { cx: -spawnDist, cz: -spawnDist },
        { cx: -spawnDist, cz:  spawnDist },
        { cx:  spawnDist, cz:  spawnDist },
        { cx:  spawnDist, cz: -spawnDist }
      ];
      let highestIslandHeight = -4.0, isOnIsland = false;
      islands.forEach(isl => {
        const dx = x - isl.cx, dz = z - isl.cz;
        const dist = Math.sqrt(dx*dx + dz*dz);
        if (dist < 32) {
          isOnIsland = true;
          const h = baseHills * 0.5 + Math.pow((32 - dist) / 32, 0.8) * 3.2;
          if (h > highestIslandHeight) highestIslandHeight = h;
        }
      });
      const checkLandBridge = (x1, z1, x2, z2) => {
        const l2 = (x1-x2)**2 + (z1-z2)**2;
        if (l2 === 0) return Infinity;
        const t = Math.max(0, Math.min(1, ((x-x1)*(x2-x1)+(z-z1)*(z2-z1))/l2));
        return Math.sqrt((x - (x1+t*(x2-x1)))**2 + (z - (z1+t*(z2-z1)))**2);
      };
      const bridges = [
        checkLandBridge(-spawnDist,-spawnDist,-spawnDist, spawnDist),
        checkLandBridge(-spawnDist, spawnDist, spawnDist, spawnDist),
        checkLandBridge( spawnDist, spawnDist, spawnDist,-spawnDist),
        checkLandBridge( spawnDist,-spawnDist,-spawnDist,-spawnDist)
      ];
      if (Math.min(...bridges) < 4.5) {
        const bh = -0.3 + baseHills * 0.08;
        return isOnIsland ? Math.max(highestIslandHeight + mountainHeight, bh) : bh;
      }
      if (isOnIsland) return highestIslandHeight + mountainHeight;
      return -4.0 + fbm(x * 0.1, z * 0.1, 2) * 0.2;
    }
    else if (this.mapType === 'coastal') {
      if (x > 12) {
        const f = Math.min(1.0, (x - 12) / (halfMap - 12));
        return baseHills * 0.18 - Math.pow(f, 2) * 5.5;
      } else {
        const f = Math.max(0, (12 - x) / (halfMap + 12));
        return baseHills + f * 2.8 + mountainHeight;
      }
    }
    else if (this.mapType === 'oasis') {
      const dc = Math.sqrt(x*x + z*z);
      if (dc < 14) return -2.5 + baseHills * 0.08;
      if (dc < 24) return baseHills * 0.3 + (1.0 - (24 - dc) / 10) * 0.5;
      return fbm(x * 0.08, z * 0.08, 3) * 0.65 + mountainHeight;
    }

    return baseHills + mountainHeight;
  }

  spawnScenery() {
    const rockGeom    = new THREE.DodecahedronGeometry(1.0, 1);
    
    // Colorful Coral PBR materials for beautiful coral reef colors
    const coralColors = [
      0xff6b8b, // Vibrant coral pink
      0xff8f56, // Soft orange coral
      0xcc66ff, // Purple coral
      0x00e1d9, // Turquoise coral
      0xffd36e  // Golden yellow coral
    ];
    const coralMaterials = coralColors.map(color => new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.88,
      metalness: 0.05,
      emissive: color,
      emissiveIntensity: 0.18 // slight glow underwater to pop
    }));

    const seaweedMat  = new THREE.MeshStandardMaterial({ 
      color: 0x22cf7b, 
      roughness: 0.65, 
      transparent: true, 
      opacity: 0.9, 
      emissive: 0x0fa85f, 
      emissiveIntensity: 0.1 
    }); // brighter, slightly glowing seagrass
    
    // Small underwater pebble mat
    const pebbleMat   = new THREE.MeshStandardMaterial({ color: 0x5a5348, roughness: 0.95, metalness: 0.05 });
    const pebbleGeom  = new THREE.SphereGeometry(0.18, 5, 4);

    const sceneryGroup = new THREE.Group();
    sceneryGroup.name  = 'scenery';
    const mapSize = this.mapSize;

    // ── 1. Underwater corals (varied sizes and types) ──
    for (let i = 0; i < 75; i++) { // slightly increased density for beautiful reefs
      const rx = (Math.random() - 0.5) * mapSize * 0.88;
      const rz = (Math.random() - 0.5) * mapSize * 0.88;
      const ry = this.getGroundHeight(rx, rz);
      if (ry < -0.55 && !this.gameManager.isCellBlocked(Math.round(rx), Math.round(rz))) {
        const coralMat = coralMaterials[Math.floor(Math.random() * coralMaterials.length)];
        let coralMesh;
        const coralType = Math.random();
        
        if (coralType < 0.4) {
          // Brain / Round coral cluster
          coralMesh = new THREE.Mesh(rockGeom, coralMat);
          const s = 0.35 + Math.random() * 0.9;
          coralMesh.scale.set(s, s * 0.75, s);
          coralMesh.position.set(rx, ry + s * 0.12, rz);
          coralMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        } else {
          // Branching coral tree (staghorn coral)
          coralMesh = new THREE.Group();
          coralMesh.position.set(rx, ry, rz);
          
          const baseHeight = 0.5 + Math.random() * 0.5;
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.07, baseHeight, 5), coralMat);
          trunk.position.y = baseHeight / 2;
          coralMesh.add(trunk);
          
          // Branches
          const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, baseHeight * 0.7, 5), coralMat);
          b1.position.set(0.06, baseHeight * 0.7, 0);
          b1.rotation.z = 0.45;
          b1.rotation.y = Math.random() * Math.PI * 2;
          coralMesh.add(b1);

          const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, baseHeight * 0.6, 5), coralMat);
          b2.position.set(-0.06, baseHeight * 0.8, 0);
          b2.rotation.z = -0.45;
          b2.rotation.y = Math.random() * Math.PI * 2;
          coralMesh.add(b2);
          
          const s = 1.0 + Math.random() * 0.6;
          coralMesh.scale.set(s, s, s);
        }
        
        if (coralMesh.isMesh) {
          coralMesh.castShadow = true;
        } else {
          coralMesh.traverse(child => { if (child.isMesh) child.castShadow = true; });
        }
        sceneryGroup.add(coralMesh);
      }
    }

    // ── 2. Pebble scattering near shores ──
    for (let i = 0; i < 120; i++) {
      const rx = (Math.random() - 0.5) * mapSize * 0.85;
      const rz = (Math.random() - 0.5) * mapSize * 0.85;
      const ry = this.getGroundHeight(rx, rz);
      if (ry >= -0.9 && ry < -0.1) {
        const p = new THREE.Mesh(pebbleGeom, pebbleMat);
        p.scale.set(1 + Math.random(), 0.5 + Math.random() * 0.5, 1 + Math.random());
        p.position.set(rx, ry + 0.06, rz);
        p.rotation.y = Math.random() * Math.PI;
        sceneryGroup.add(p);
      }
    }

    // ── 3. Animated seaweed strands (tracked for sway in update) ──
    for (let i = 0; i < 80; i++) {
      const rx = (Math.random() - 0.5) * mapSize * 0.85;
      const rz = (Math.random() - 0.5) * mapSize * 0.85;
      const ry = this.getGroundHeight(rx, rz);
      if (ry < -0.85) {
        // Build a segmented blade of seaweed
        const segments  = 2 + Math.floor(Math.random() * 2);
        const segHeight = 0.6 + Math.random() * 0.6;
        const swayGroup = new THREE.Group();
        swayGroup.position.set(rx, ry, rz);
        swayGroup._swayPhase  = Math.random() * Math.PI * 2;
        swayGroup._swaySpeed  = 0.4 + Math.random() * 0.5;
        swayGroup._swayAmp    = 0.06 + Math.random() * 0.08;
        let parent = swayGroup;
        for (let s = 0; s < segments; s++) {
          const segGeom = new THREE.CylinderGeometry(
            0.035 * (1 - s * 0.25),
            0.06  * (1 - s * 0.2),
            segHeight, 5
          );
          const seg = new THREE.Mesh(segGeom, seaweedMat);
          seg.position.y = segHeight / 2 + (s > 0 ? segHeight / 2 : 0);
          // Slight lean per segment for organic look
          seg.rotation.z = (Math.random() - 0.5) * 0.18;
          parent.add(seg);
          parent = seg;
        }
        sceneryGroup.add(swayGroup);
        this.seaweedMeshes.push(swayGroup);
      }
    }

    this.scene.add(sceneryGroup);
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
        if (Math.abs(x) > this.mapSize * 0.47 || Math.abs(z) > this.mapSize * 0.47) continue;
        
        // Collision avoidances
        if (this.gameManager.isCellBlocked(x, z)) continue;

        // Ground check
        const height = this.getGroundHeight(x, z);
        if (height < -0.5) continue; // No spawns in water

        // Road corridor check - keep roads clear
        if (this.getDistanceToRoads(x, z, false) < 3.2) continue;

        // Add
        const node = new ResourceNode(this.gameManager, type, x, height, z);
        this.gameManager.entityManager.addResource(node);
      }
    };

    const half = this.mapSize / 2;

    // Dynamic resource counting scaling with map size
    // Greatly scale up tree clusters for a lush forest visual
    const treeClustersCount = Math.max(150, Math.round(this.mapSize * this.mapSize * 0.0016));
    const goldClustersCount = Math.max(15, Math.round(this.mapSize * this.mapSize * 0.0001));
    const stoneClustersCount = Math.max(15, Math.round(this.mapSize * this.mapSize * 0.0001));
    const fishCount = Math.max(12, Math.round(this.mapSize * this.mapSize * 0.0001));
    const sheepCount = Math.max(16, Math.round(this.mapSize * this.mapSize * 0.00013));

    // Standard clusters distributed all over the massive terrain for exploration
    // Wood forests scattered - highly optimized via LOD
    for (let c = 0; c < treeClustersCount; c++) {
      const rx = (Math.random() - 0.5) * (this.mapSize * 0.85);
      const rz = (Math.random() - 0.5) * (this.mapSize * 0.85);
      // Skip spawning directly at the center river channel if river valley
      if (this.mapType === 'river' && Math.abs(rx) < 22) continue;
      // Increased trees per cluster (16-30 trees) for denser forests
      spawnCluster(rx, rz, 16 + Math.floor(Math.random() * 15), 'wood', 12);
    }

    // Scattered individual trees to fill in gaps and create dense forests
    const scatteredTreesCount = Math.max(300, Math.round(this.mapSize * this.mapSize * 0.003));
    for (let i = 0; i < scatteredTreesCount; i++) {
      const rx = Math.round((Math.random() - 0.5) * (this.mapSize * 0.88));
      const rz = Math.round((Math.random() - 0.5) * (this.mapSize * 0.88));
      if (this.mapType === 'river' && Math.abs(rx) < 22) continue;
      if (this.gameManager.isCellBlocked(rx, rz)) continue;
      const height = this.getGroundHeight(rx, rz);
      if (height < -0.5) continue;
      
      // Road corridor check
      if (this.getDistanceToRoads(rx, rz, false) < 3.2) continue;
      
      const node = new ResourceNode(this.gameManager, 'wood', rx, height, rz);
      this.gameManager.entityManager.addResource(node);
    }

    // Gold mines scattered
    for (let c = 0; c < goldClustersCount; c++) {
      const rx = (Math.random() - 0.5) * (this.mapSize * 0.75);
      const rz = (Math.random() - 0.5) * (this.mapSize * 0.75);
      if (this.mapType === 'river' && Math.abs(rx) < 18) continue;
      spawnCluster(rx, rz, 4 + Math.floor(Math.random() * 3), 'gold', 4);
    }

    // Stone quarries scattered
    for (let c = 0; c < stoneClustersCount; c++) {
      const rx = (Math.random() - 0.5) * (this.mapSize * 0.75);
      const rz = (Math.random() - 0.5) * (this.mapSize * 0.75);
      if (this.mapType === 'river' && Math.abs(rx) < 18) continue;
      spawnCluster(rx, rz, 3 + Math.floor(Math.random() * 3), 'stone', 4);
    }

    // Fish spawning
    for (let f = 0; f < fishCount; f++) {
      for (let attempt = 0; attempt < 100; attempt++) {
        const rx = Math.round((Math.random() - 0.5) * (this.mapSize * 0.8));
        const rz = Math.round((Math.random() - 0.5) * (this.mapSize * 0.8));
        const height = this.getGroundHeight(rx, rz);
        if (height < -0.6 && !this.gameManager.isCellBlocked(rx, rz)) {
          const node = new ResourceNode(this.gameManager, 'fish', rx, height, rz);
          this.gameManager.entityManager.addResource(node);
          break;
        }
      }
    }

    // Sheep spawning
    for (let s = 0; s < sheepCount; s++) {
      for (let attempt = 0; attempt < 100; attempt++) {
        const rx = Math.round((Math.random() - 0.5) * (this.mapSize * 0.8));
        const rz = Math.round((Math.random() - 0.5) * (this.mapSize * 0.8));
        if (this.mapType === 'river' && Math.abs(rx) < 22) continue;
        
        // Road corridor check
        if (this.getDistanceToRoads(rx, rz, false) < 3.2) continue;
        
        const height = this.getGroundHeight(rx, rz);
        if (height >= -0.3 && !this.gameManager.isCellBlocked(rx, rz)) {
          this.gameManager.entityManager.createUnit('sheep', 3, rx, rz);
          break;
        }
      }
    }
  }
}
