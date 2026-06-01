import * as THREE from 'three';

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
    
    // Deep slate-black void background and linear fog fading to black at map edges
    this.scene.background = new THREE.Color(0x05070a);
    this.scene.fog = new THREE.Fog(0x05070a, 70, 150);

    // Create Camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    this.updateCameraPosition();

    // Create Renderer with enhanced quality
    this.webGLRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.webGLRenderer.setSize(window.innerWidth, window.innerHeight);
    this.webGLRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.webGLRenderer.shadowMap.enabled = true;
    this.webGLRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.webGLRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.webGLRenderer.toneMappingExposure = 1.05;
    
    this.container.appendChild(this.webGLRenderer.domElement);
  }

  updateFogForMapSize(mapSize) {
    if (this.scene && this.scene.fog) {
      this.scene.fog.near = Math.max(70, mapSize * 0.25);
      this.scene.fog.far = Math.max(150, mapSize * 0.65);
    }
  }

  setupLights() {
    // Ambient light: Soft warm fill
    const ambientLight = new THREE.AmbientLight(0xfff5e6, 0.25);
    this.scene.add(ambientLight);

    // Sun light (Directional Light) — warm golden hour feel
    this.sunLight = new THREE.DirectionalLight(0xfff2db, 1.65);
    this.sunLight.position.set(40, 75, 20);
    this.sunLight.castShadow = true;
    
    // Enhanced shadow mapping
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 250;
    
    const d = 75; // Larger shadow shadow coverage
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0003;
    this.sunLight.shadow.normalBias = 0.02;

    this.scene.add(this.sunLight);
    
    // Hemisphere light — sky blue top, deep forest green ground for beautiful PBR fill
    this.hemiLight = new THREE.HemisphereLight(0xdce8f5, 0x2b3826, 0.55);
    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);
    
    // Secondary backlight to bounce light and highlight unit silhouettes
    const backLight = new THREE.DirectionalLight(0xc4d8f0, 0.45);
    backLight.position.set(-40, 30, -40);
    this.scene.add(backLight);
    
    // Rim light for extra visual pop
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
    rimLight.position.set(0, 10, 45);
    this.scene.add(rimLight);
  }

  spawnClouds() {
    this.clouds = [];
    const cloudCount = 12;
    
    const cloudMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.95,
      metalness: 0.0,
      transparent: true,
      opacity: 0.75,
      flatShading: true
    });

    const halfMap = (this.gameManager && this.gameManager.terrain) ? this.gameManager.terrain.mapSize / 2 : 175;
    
    for (let i = 0; i < cloudCount; i++) {
      const cloudGroup = new THREE.Group();
      
      const sphereCount = 4 + Math.floor(Math.random() * 4);
      for (let j = 0; j < sphereCount; j++) {
        const radius = 2.0 + Math.random() * 2.5;
        const sphereGeom = new THREE.SphereGeometry(radius, 7, 7);
        const sphere = new THREE.Mesh(sphereGeom, cloudMaterial);
        
        sphere.position.set(
          (Math.random() - 0.5) * 4.5,
          (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 4.5
        );
        sphere.scale.set(1.2, 0.7, 1.2);
        sphere.castShadow = true;
        cloudGroup.add(sphere);
      }
      
      const x = (Math.random() - 0.5) * halfMap * 1.8;
      const y = 14 + Math.random() * 5;
      const z = (Math.random() - 0.5) * halfMap * 1.8;
      
      cloudGroup.position.set(x, y, z);
      
      cloudGroup.userData = {
        speed: 0.8 + Math.random() * 1.5,
        directionX: 1.0,
        directionZ: 0.2 + (Math.random() - 0.5) * 0.4,
        driftScale: 0.05 + Math.random() * 0.05
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
        // Single finger — track for potential panning on terrain
        this.touchState.panStart.x = e.touches[0].clientX;
        this.touchState.panStart.y = e.touches[0].clientY;
        this.touchState.isPanning = false;
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
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      if (e.touches.length < 2) {
        this.touchState.active = false;
      }
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
        cloud.position.y += Math.sin(performance.now() * 0.001 * ud.driftScale) * 0.002;
        
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
    this.webGLRenderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.webGLRenderer.setSize(window.innerWidth, window.innerHeight);
  }
}
