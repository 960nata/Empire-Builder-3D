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
    
    this.keys = {
      w: false, a: false, s: false, d: false,
      ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false
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
    
    // Soft, premium looking background color & fog (dusty blue-grey/sky blue)
    this.scene.background = new THREE.Color(0xaaccff);
    this.scene.fog = new THREE.FogExp2(0xaaccff, 0.008);

    // Create Camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    this.updateCameraPosition();

    // Create Renderer
    this.webGLRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.webGLRenderer.setSize(window.innerWidth, window.innerHeight);
    this.webGLRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.webGLRenderer.shadowMap.enabled = true;
    this.webGLRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.webGLRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.webGLRenderer.toneMappingExposure = 1.0;
    
    this.container.appendChild(this.webGLRenderer.domElement);
  }

  setupLights() {
    // Ambient light: Soft fill light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    // Sun light (Directional Light)
    this.sunLight = new THREE.DirectionalLight(0xfffaed, 1.2); // Warm light
    this.sunLight.position.set(40, 60, 20);
    this.sunLight.castShadow = true;
    
    // Set shadow mapping parameters
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 250;
    
    const d = 60; // Shadow camera coverage area
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;

    this.scene.add(this.sunLight);
    
    // Hemisphere light for natural sky/ground reflection
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3);
    hemiLight.position.set(0, 50, 0);
    this.scene.add(hemiLight);
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

    // Zoom control with mouse wheel
    window.addEventListener('wheel', (e) => {
      this.cameraDistance = Math.max(15, Math.min(120, this.cameraDistance + e.deltaY * 0.04));
      this.updateCameraPosition();
    }, { passive: true });

    // Rotate and Pan using Right Click / Middle Click Drag
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    
    window.addEventListener('mousedown', (e) => {
      if (e.button === 2) { // Right click drag to rotate camera
        isDragging = true;
        dragStart.x = e.clientX;
        dragStart.y = e.clientY;
        e.preventDefault();
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        
        this.cameraRotation -= deltaX * 0.005;
        this.cameraAngle = Math.max(0.2, Math.min(Math.PI / 2.2, this.cameraAngle + deltaY * 0.005));
        
        dragStart.x = e.clientX;
        dragStart.y = e.clientY;
        
        this.updateCameraPosition();
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 2) {
        isDragging = false;
      }
    });

    // Disable right-click context menu in game area
    window.addEventListener('contextmenu', (e) => e.preventDefault());
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
    // Determine movement direction relative to camera rotation
    const forward = new THREE.Vector3(-Math.sin(this.cameraRotation), 0, -Math.cos(this.cameraRotation)).normalize();
    const right = new THREE.Vector3(Math.cos(this.cameraRotation), 0, -Math.sin(this.cameraRotation)).normalize();
    
    const moveDir = new THREE.Vector3();
    
    if (this.keys.w || this.keys.arrowup) moveDir.add(forward);
    if (this.keys.s || this.keys.arrowdown) moveDir.add(forward.clone().negate());
    if (this.keys.a || this.keys.arrowleft) moveDir.add(right.clone().negate());
    if (this.keys.d || this.keys.arrowright) moveDir.add(right);
    
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
      this.cameraTarget.x = Math.max(-100, Math.min(100, this.cameraTarget.x));
      this.cameraTarget.z = Math.max(-100, Math.min(100, this.cameraTarget.z));
      
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
