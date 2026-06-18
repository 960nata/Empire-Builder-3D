import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export class Renderer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = null;
    this.camera = null;
    this.webGLRenderer = null;
    
    // Camera state
    this.cameraTarget = new THREE.Vector3(0, 0, 0);
    this.cameraDistance = 45;
    this.cameraAngle = Math.PI / 4; // 45 degrees pitch
    this.cameraRotation = Math.PI / 4; // 45 degrees yaw (isometric style)
    
    // Movement velocity
    this.velocity = new THREE.Vector3();
    this.moveSpeed = 0.5;
    this.friction = 0.85;
    
    // Edge scroll settings
    this.edgeScrollEnabled = true;
    this.edgeScrollZone = 30; // pixels from edge to trigger scroll
    this.edgeScrollSpeed = 0.35;
    this.mouseScreenPos = { x: 0, y: 0 };
    
    this.keys = {
      w: false, a: false, s: false, d: false,
      ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false
    };

    // Touch gesture state for mobile
    this.touchState = {
      active: false,
      startDist: 0,
      startAngle: 0,
      lastPinchDist: 0,
      lastPinchAngle: 0,
      panStart: { x: 0, y: 0 },
      isPanning: false
    };

    this.init();
    this.setupLights();
    this.setupControls();
    
    // Bind resize event
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  init() {
    // Create Scene
    this.scene = new THREE.Scene();

    // Rich deep-sky atmosphere — exponential fog gives natural depth falloff
    this.scene.background = new THREE.Color(0x0a0e16);
    this.scene.fog = new THREE.FogExp2(0x0a0e16, 0.0028);

    // Create Camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.5,
      1200
    );
    this.updateCameraPosition();

    // Renderer — HDR-ready, high pixel ratio for crisp retina output
    this.webGLRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.webGLRenderer.setSize(window.innerWidth, window.innerHeight);
    this.webGLRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
    this.webGLRenderer.shadowMap.enabled = true;
    this.webGLRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.webGLRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.webGLRenderer.toneMappingExposure = 1.18;
    this.webGLRenderer.outputColorSpace = THREE.SRGBColorSpace;

    this.container.appendChild(this.webGLRenderer.domElement);

    // ─── Post-processing: Bloom ───────────────────────────────────────
    this.composer = new EffectComposer(this.webGLRenderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.55,  // strength — punchy glow without washing out
      0.45,  // radius  — tight bloom keeps details sharp
      0.78   // threshold — fires on bright speculars & emissives
    );
    this.composer.addPass(this.bloomPass);
    this.composer.addPass(new OutputPass());
  }

  updateFogForMapSize(mapSize) {
    if (this.scene && this.scene.fog) {
      // FogExp2: higher density = thicker fog. Scale with map so larger maps stay clear.
      this.scene.fog.density = Math.max(0.0012, 0.0028 - mapSize * 0.000006);
    }
  }

  setupLights() {
    // Ambient — warm candlelight base fill
    const ambientLight = new THREE.AmbientLight(0xffe8c8, 0.30);
    this.scene.add(ambientLight);

    // Primary sun — rich amber-gold late-afternoon angle
    this.sunLight = new THREE.DirectionalLight(0xffcc77, 2.1);
    this.sunLight.position.set(40, 75, 20);
    this.sunLight.castShadow = true;

    // 4096×4096 shadow map — ultra-crisp shadows on all units and buildings
    this.sunLight.shadow.mapSize.width  = 4096;
    this.sunLight.shadow.mapSize.height = 4096;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far  = 280;
    const d = 80;
    this.sunLight.shadow.camera.left   = -d;
    this.sunLight.shadow.camera.right  =  d;
    this.sunLight.shadow.camera.top    =  d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias       = -0.0002;
    this.sunLight.shadow.normalBias =  0.02;
    this.scene.add(this.sunLight);

    // Hemisphere — vivid cinematic sky gradient: deep indigo sky / rich forest floor
    this.hemiLight = new THREE.HemisphereLight(0x90b8e8, 0x223318, 0.75);
    this.hemiLight.position.set(0, 60, 0);
    this.scene.add(this.hemiLight);

    // Cool fill light — simulates skylight bounce from the side
    const fillLight = new THREE.DirectionalLight(0xa0c8f0, 0.55);
    fillLight.position.set(-50, 35, -30);
    this.scene.add(fillLight);

    // Warm rim/backlight — gives depth pop to unit silhouettes
    const rimLight = new THREE.DirectionalLight(0xff9955, 0.35);
    rimLight.position.set(0, 12, 50);
    this.scene.add(rimLight);
  }

  spawnClouds() {
    this.clouds = [];

    // Two cloud materials — sunlit bright tops and softer grey undersides
    const cloudMatTop = new THREE.MeshStandardMaterial({
      color: 0xfff8f0,
      emissive: 0xffe0a0,
      emissiveIntensity: 0.08, // subtle warm glow — triggers bloom on highlights
      roughness: 0.98,
      metalness: 0.0,
      transparent: true,
      opacity: 0.82,
      flatShading: true
    });
    const cloudMatBottom = new THREE.MeshStandardMaterial({
      color: 0xc8d4e0,
      roughness: 1.0,
      metalness: 0.0,
      transparent: true,
      opacity: 0.65,
      flatShading: true
    });

    const halfMap = (this.gameManager && this.gameManager.terrain) ? this.gameManager.terrain.mapSize / 2 : 175;
    const cloudCount = 20;

    for (let i = 0; i < cloudCount; i++) {
      const cloudGroup = new THREE.Group();
      const sphereCount = 5 + Math.floor(Math.random() * 5);

      for (let j = 0; j < sphereCount; j++) {
        const radius = 1.8 + Math.random() * 3.0;
        const sphereGeom = new THREE.SphereGeometry(radius, 8, 6);
        // Top spheres get bright sunlit material, bottom get grey underside
        const mat = j < Math.ceil(sphereCount * 0.6) ? cloudMatTop : cloudMatBottom;
        const sphere = new THREE.Mesh(sphereGeom, mat);
        sphere.position.set(
          (Math.random() - 0.5) * 6.0,
          (Math.random() - 0.5) * 2.2 + (j < Math.ceil(sphereCount * 0.6) ? 0.5 : -0.5),
          (Math.random() - 0.5) * 6.0
        );
        sphere.scale.set(1.3, 0.65, 1.3);
        sphere.castShadow = false;
        cloudGroup.add(sphere);
      }

      const x = (Math.random() - 0.5) * halfMap * 2.0;
      const y = 13 + Math.random() * 7;
      const z = (Math.random() - 0.5) * halfMap * 2.0;
      cloudGroup.position.set(x, y, z);
      cloudGroup.userData = {
        speed: 0.6 + Math.random() * 1.8,
        directionX: 1.0,
        directionZ: 0.15 + (Math.random() - 0.5) * 0.5,
        driftScale: 0.04 + Math.random() * 0.06,
        driftOffset: Math.random() * Math.PI * 2
      };

      this.scene.add(cloudGroup);
      this.clouds.push(cloudGroup);
    }
  }

  setupControls() {
    // Key listeners for WASD / Arrows panning
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      if (key in this.keys) this.keys[key] = true;
      if (e.key in this.keys) this.keys[e.key] = true;
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      if (key in this.keys) this.keys[key] = false;
      if (e.key in this.keys) this.keys[e.key] = false;
    });

    // Track mouse position for edge scrolling
    window.addEventListener('mousemove', (e) => {
      this.mouseScreenPos.x = e.clientX;
      this.mouseScreenPos.y = e.clientY;
    });

    // Zoom control with mouse wheel (reduced sensitivity for smoother zoom)
    window.addEventListener('wheel', (e) => {
      this.cameraDistance = Math.max(15, Math.min(120, this.cameraDistance + e.deltaY * 0.015));
      this.updateCameraPosition();
    }, { passive: true });

    // ===== CAMERA ROTATION: MIDDLE-CLICK DRAG (or SHIFT + RIGHT-CLICK DRAG) =====
    // Right-click is now FREE for unit commands in Input.js
    let isRotating = false;
    let rotateStart = { x: 0, y: 0 };
    
    window.addEventListener('mousedown', (e) => {
      // Middle click (button 1) = rotate camera
      if (e.button === 1) {
        isRotating = true;
        rotateStart.x = e.clientX;
        rotateStart.y = e.clientY;
        e.preventDefault();
      }
      // Shift + Right click = rotate camera (alternative for users without middle click)
      if (e.button === 2 && e.shiftKey) {
        isRotating = true;
        rotateStart.x = e.clientX;
        rotateStart.y = e.clientY;
        e.preventDefault();
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (isRotating) {
        const deltaX = e.clientX - rotateStart.x;
        const deltaY = e.clientY - rotateStart.y;
        
        // Reduced rotation sensitivity from 0.005 to 0.002
        this.cameraRotation -= deltaX * 0.002;
        this.cameraAngle = Math.max(0.2, Math.min(Math.PI / 2.2, this.cameraAngle + deltaY * 0.002));
        
        rotateStart.x = e.clientX;
        rotateStart.y = e.clientY;
        
        this.updateCameraPosition();
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 1 || (e.button === 2 && e.shiftKey)) {
        isRotating = false;
      }
    });

    // Disable right-click context menu in game area
    window.addEventListener('contextmenu', (e) => e.preventDefault());

    // ===== MOBILE TOUCH GESTURES =====
    this.setupTouchGestures();
  }

  setupTouchGestures() {
    const container = this.container;
    if (!container) return;

    // Two-finger gesture tracking
    container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        // Start pinch/rotate gesture
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        
        const dx = t2.clientX - t1.clientX;
        const dy = t2.clientY - t1.clientY;
        
        this.touchState.active = true;
        this.touchState.startDist = Math.sqrt(dx * dx + dy * dy);
        this.touchState.lastPinchDist = this.touchState.startDist;
        this.touchState.startAngle = Math.atan2(dy, dx);
        this.touchState.lastPinchAngle = this.touchState.startAngle;
      }
      else if (e.touches.length === 1) {
        // Ignore if touch starts on UI element or mobile buttons
        if (e.target.closest('#hud') || e.target.closest('.mobile-action-buttons') || e.target.closest('.ui-element')) {
          this.touchState.isPanning = false;
          return;
        }
        // Single finger — track for potential panning on terrain
        this.touchState.panStart.x = e.touches[0].clientX;
        this.touchState.panStart.y = e.touches[0].clientY;
        this.touchState.isPanning = true;
      }
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2 && this.touchState.active) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        
        const dx = t2.clientX - t1.clientX;
        const dy = t2.clientY - t1.clientY;
        const currentDist = Math.sqrt(dx * dx + dy * dy);
        const currentAngle = Math.atan2(dy, dx);
        
        // Pinch to zoom (reduced sensitivity from 0.15 to 0.06)
        const pinchDelta = currentDist - this.touchState.lastPinchDist;
        this.cameraDistance = Math.max(15, Math.min(120, this.cameraDistance - pinchDelta * 0.06));
        
        // Two-finger rotate (reduced sensitivity from 0.8 to 0.25)
        let angleDelta = currentAngle - this.touchState.lastPinchAngle;
        // Normalize angle delta
        if (angleDelta > Math.PI) angleDelta -= Math.PI * 2;
        if (angleDelta < -Math.PI) angleDelta += Math.PI * 2;
        this.cameraRotation -= angleDelta * 0.25;
        
        this.touchState.lastPinchDist = currentDist;
        this.touchState.lastPinchAngle = currentAngle;
        
        this.updateCameraPosition();
      }
      else if (e.touches.length === 1 && this.touchState.isPanning) {
        const touch = e.touches[0];
        const dx = touch.clientX - this.touchState.panStart.x;
        const dy = touch.clientY - this.touchState.panStart.y;
        
        // Convert screen drag delta to 3D camera pan vector
        // Panning speed scales proportionally with zoom distance
        const factor = this.cameraDistance * 0.0018;
        const forward = new THREE.Vector3(-Math.sin(this.cameraRotation), 0, -Math.cos(this.cameraRotation)).normalize();
        const right = new THREE.Vector3(Math.cos(this.cameraRotation), 0, -Math.sin(this.cameraRotation)).normalize();
        
        const moveVector = right.clone().multiplyScalar(-dx * factor).add(forward.clone().multiplyScalar(-dy * factor));
        
        this.cameraTarget.add(moveVector);
        
        // Clamp camera target to map boundaries
        const halfMap = (this.gameManager && this.gameManager.terrain) ? this.gameManager.terrain.mapSize / 2 : 175;
        const limit = Math.max(10, halfMap - 10);
        this.cameraTarget.x = Math.max(-limit, Math.min(limit, this.cameraTarget.x));
        this.cameraTarget.z = Math.max(-limit, Math.min(limit, this.cameraTarget.z));
        
        this.updateCameraPosition();
        
        this.touchState.panStart.x = touch.clientX;
        this.touchState.panStart.y = touch.clientY;
      }
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      if (e.touches.length < 2) {
        this.touchState.active = false;
      }
      this.touchState.isPanning = false;
    }, { passive: true });
  }

  updateCameraPosition() {
    // Calculate new position relative to target
    const x = this.cameraTarget.x + this.cameraDistance * Math.sin(this.cameraRotation) * Math.cos(this.cameraAngle);
    const y = this.cameraTarget.y + this.cameraDistance * Math.sin(this.cameraAngle);
    const z = this.cameraTarget.z + this.cameraDistance * Math.cos(this.cameraRotation) * Math.cos(this.cameraAngle);
    
    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.cameraTarget);

    // Keep the sun light shadow box centered near camera target
    if (this.sunLight) {
      this.sunLight.position.set(
        this.cameraTarget.x + 40,
        this.cameraTarget.y + 60,
        this.cameraTarget.z + 20
      );
      this.sunLight.target.position.copy(this.cameraTarget);
      this.sunLight.target.updateMatrixWorld();
    }
  }

  update(deltaTime) {
    // Lazy spawn clouds once scene/gameManager is ready
    if (!this.clouds && this.gameManager && this.gameManager.terrain) {
      this.spawnClouds();
    }
    
    // Drift clouds
    if (this.clouds && this.gameManager && this.gameManager.terrain) {
      const halfMap = this.gameManager.terrain.mapSize / 2;
      const boundary = halfMap * 1.5;
      
      for (let i = 0; i < this.clouds.length; i++) {
        const cloud = this.clouds[i];
        const ud = cloud.userData;
        
        cloud.position.x += ud.directionX * ud.speed * deltaTime;
        cloud.position.z += ud.directionZ * ud.speed * deltaTime;
        cloud.position.y += Math.sin(performance.now() * 0.0008 * ud.driftScale + ud.driftOffset) * 0.003;
        
        if (cloud.position.x > boundary) {
          cloud.position.x = -boundary;
          cloud.position.z = (Math.random() - 0.5) * halfMap * 1.8;
          cloud.position.y = 14 + Math.random() * 5;
        }
      }
    }

    // Determine movement direction relative to camera rotation
    const forward = new THREE.Vector3(-Math.sin(this.cameraRotation), 0, -Math.cos(this.cameraRotation)).normalize();
    const right = new THREE.Vector3(Math.cos(this.cameraRotation), 0, -Math.sin(this.cameraRotation)).normalize();
    
    const moveDir = new THREE.Vector3();
    
    if (this.keys.w || this.keys.arrowup) moveDir.add(forward);
    if (this.keys.s || this.keys.arrowdown) moveDir.add(forward.clone().negate());
    if (this.keys.a || this.keys.arrowleft) moveDir.add(right.clone().negate());
    if (this.keys.d || this.keys.arrowright) moveDir.add(right);
    
    // Edge scrolling — pan camera when mouse is near screen edges
    if (this.edgeScrollEnabled && !document.pointerLockElement) {
      const mx = this.mouseScreenPos.x;
      const my = this.mouseScreenPos.y;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const zone = this.edgeScrollZone;
      
      if (mx < zone && mx > 0) moveDir.add(right.clone().negate().multiplyScalar(this.edgeScrollSpeed));
      if (mx > w - zone && mx < w) moveDir.add(right.clone().multiplyScalar(this.edgeScrollSpeed));
      if (my < zone && my > 0) moveDir.add(forward.clone().multiplyScalar(this.edgeScrollSpeed));
      if (my > h - zone && my < h) moveDir.add(forward.clone().negate().multiplyScalar(this.edgeScrollSpeed));
    }
    
    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();
      // Apply movement speed
      const targetSpeed = this.moveSpeed * (this.cameraDistance / 45); // Move faster when zoomed out
      this.velocity.addScaledVector(moveDir, targetSpeed);
    }
    
    // Apply friction/inertia
    this.velocity.multiplyScalar(this.friction);
    
    if (this.velocity.lengthSq() > 0.0001) {
      this.cameraTarget.add(this.velocity);
      // Clamp target to map boundaries
      const halfMap = (this.gameManager && this.gameManager.terrain) ? this.gameManager.terrain.mapSize / 2 : 175;
      const limit = Math.max(10, halfMap - 10);
      this.cameraTarget.x = Math.max(-limit, Math.min(limit, this.cameraTarget.x));
      this.cameraTarget.z = Math.max(-limit, Math.min(limit, this.cameraTarget.z));
      
      this.updateCameraPosition();
    }
  }

  render() {
    this.composer.render();
  }

  onWindowResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.webGLRenderer.setSize(w, h);
    this.composer.setSize(w, h);
    if (this.bloomPass) this.bloomPass.setSize(w, h);
  }
}
