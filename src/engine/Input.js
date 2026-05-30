import * as THREE from 'three';

export class Input {
  constructor(rendererInstance, gameManagerInstance) {
    this.renderer = rendererInstance;
    this.gameManager = gameManagerInstance;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    // Selection box DOM element
    this.selectionBoxEl = document.createElement('div');
    this.selectionBoxEl.style.position = 'absolute';
    this.selectionBoxEl.style.border = '1px solid rgba(0, 162, 255, 0.8)';
    this.selectionBoxEl.style.backgroundColor = 'rgba(0, 162, 255, 0.15)';
    this.selectionBoxEl.style.pointerEvents = 'none';
    this.selectionBoxEl.style.display = 'none';
    this.selectionBoxEl.style.zIndex = '99';
    document.body.appendChild(this.selectionBoxEl);
    
    // Drag state
    this.dragStart = { x: 0, y: 0 };
    this.dragCurrent = { x: 0, y: 0 };
    this.isSelecting = false;
    this.dragThreshold = 5; // pixels before starting box select
    
    // Build placement state
    this.blueprintBuilding = null;
    this.blueprintMesh = null;
    
    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('mousedown', this.onMouseDown.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('mouseup', this.onMouseUp.bind(this));
    
    this.setupMobileListeners();
  }

  setupMobileListeners() {
    const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const container = document.getElementById('mobile-controls-container');
    
    // Show mobile controls panel if touch capable
    if (container) {
      if (isMobile || window.innerWidth < 1024) {
        container.style.display = 'block';
      }
    }
    
    this.joystickActive = false;
    this.joystickCenter = { x: 0, y: 0 };
    
    const joystickBase = document.getElementById('mobile-joystick-base');
    const joystickHandle = document.getElementById('mobile-joystick-handle');
    
    if (joystickBase && joystickHandle) {
      joystickBase.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        const rect = joystickBase.getBoundingClientRect();
        this.joystickCenter.x = rect.left + rect.width / 2;
        this.joystickCenter.y = rect.top + rect.height / 2;
        this.joystickActive = true;
        e.preventDefault();
      }, { passive: false });
      
      window.addEventListener('touchmove', (e) => {
        if (!this.joystickActive) return;
        const touch = e.touches[0];
        
        let dx = touch.clientX - this.joystickCenter.x;
        let dy = touch.clientY - this.joystickCenter.y;
        
        // Clamp handle movement to base circle radius of 40px
        const dist = Math.sqrt(dx*dx + dy*dy);
        const radius = 40;
        if (dist > radius) {
          dx = (dx / dist) * radius;
          dy = (dy / dist) * radius;
        }
        
        joystickHandle.style.transform = `translate(${dx}px, ${dy}px)`;
        
        // Map joystick vector components directly to panning keys
        this.gameManager.renderer.keys.w = dy < -10;
        this.gameManager.renderer.keys.s = dy > 10;
        this.gameManager.renderer.keys.a = dx < -10;
        this.gameManager.renderer.keys.d = dx > 10;
        
      }, { passive: true });
      
      window.addEventListener('touchend', (e) => {
        if (this.joystickActive) {
          this.joystickActive = false;
          joystickHandle.style.transform = 'translate(0px, 0px)';
          
          this.gameManager.renderer.keys.w = false;
          this.gameManager.renderer.keys.s = false;
          this.gameManager.renderer.keys.a = false;
          this.gameManager.renderer.keys.d = false;
        }
      });
    }

    // Camera action zoom/rotation touch buttons bindings
    const btnZoomIn = document.getElementById('mbtn-zoom-in');
    const btnZoomOut = document.getElementById('mbtn-zoom-out');
    const btnRotLeft = document.getElementById('mbtn-rot-left');
    const btnRotRight = document.getElementById('mbtn-rot-right');
    const btnSelectMode = document.getElementById('mbtn-select-mode');

    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', () => {
        this.renderer.cameraDistance = Math.max(15, this.renderer.cameraDistance - 8);
        this.renderer.updateCameraPosition();
      });
    }
    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', () => {
        this.renderer.cameraDistance = Math.min(120, this.renderer.cameraDistance + 8);
        this.renderer.updateCameraPosition();
      });
    }
    if (btnRotLeft) {
      btnRotLeft.addEventListener('click', () => {
        this.renderer.cameraRotation -= Math.PI / 8;
        this.renderer.updateCameraPosition();
      });
    }
    if (btnRotRight) {
      btnRotRight.addEventListener('click', () => {
        this.renderer.cameraRotation += Math.PI / 8;
        this.renderer.updateCameraPosition();
      });
    }
    
    this.mobileMultiselect = false;
    if (btnSelectMode) {
      btnSelectMode.addEventListener('click', () => {
        this.mobileMultiselect = !this.mobileMultiselect;
        btnSelectMode.textContent = this.mobileMultiselect ? 'Box Select: ON' : 'Box Select: OFF';
        btnSelectMode.classList.toggle('active', this.mobileMultiselect);
      });
    }

    // Touch double-tap triggers command, single-tap triggers select
    const canvasContainer = document.getElementById('game-canvas-container');
    this.lastTapTime = 0;
    this.tapTimeout = null;
    
    if (canvasContainer) {
      canvasContainer.addEventListener('touchstart', (e) => {
        if (this.blueprintBuilding || e.target.closest('.joystick-base') || e.target.closest('.mobile-action-buttons')) return;
        
        const now = performance.now();
        const delay = now - this.lastTapTime;
        const touch = e.touches[0];
        
        // Translate client position to NDC coordinates for raycasting
        this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
        
        if (delay < 320) {
          if (this.tapTimeout) clearTimeout(this.tapTimeout);
          // Trigger commands (represented by right click action)
          this.performRightClickCommand();
        } else {
          this.tapTimeout = setTimeout(() => {
            if (this.mobileMultiselect) {
              this.performSingleSelectionToggle();
            } else {
              this.performSingleSelection();
            }
          }, 180);
        }
        this.lastTapTime = now;
      }, { passive: true });
    }
  }

  performSingleSelectionToggle() {
    this.raycaster.setFromCamera(this.mouse, this.renderer.camera);
    const clickables = this.gameManager.getClickableObjects();
    const intersects = this.raycaster.intersectObjects(clickables, true);
    
    if (intersects.length > 0) {
      let hitObj = intersects[0].object;
      while (hitObj && !hitObj.userData.entity) {
        hitObj = hitObj.parent;
      }
      if (hitObj && hitObj.userData.entity) {
        const entity = hitObj.userData.entity;
        
        if (entity.playerId === 0) {
          const idx = this.gameManager.selectedEntities.indexOf(entity);
          if (idx !== -1) {
            this.gameManager.selectedEntities.splice(idx, 1);
            entity.setSelected(false);
          } else {
            this.gameManager.selectedEntities.push(entity);
            entity.setSelected(true);
          }
          this.gameManager.hud.updateSelectionUI();
          this.gameManager.soundManager.playClickSound('select');
        }
      }
    }
  }

  onMouseDown(e) {
    // Ignore if clicked on UI
    if (e.target.closest('#hud') || e.target.closest('.ui-element') || e.button === 2) {
      return;
    }

    if (e.button === 0) { // Left click
      // If we are placing a blueprint building
      if (this.blueprintBuilding) {
        this.placeBlueprint();
        return;
      }

      this.isSelecting = true;
      this.dragStart.x = e.clientX;
      this.dragStart.y = e.clientY;
      this.dragCurrent.x = e.clientX;
      this.dragCurrent.y = e.clientY;
    }
  }

  onMouseMove(e) {
    // Update mouse coords for raycasting
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    // Update selection box DOM
    if (this.isSelecting) {
      this.dragCurrent.x = e.clientX;
      this.dragCurrent.y = e.clientY;
      
      const dx = this.dragCurrent.x - this.dragStart.x;
      const dy = this.dragCurrent.y - this.dragStart.y;
      
      if (Math.abs(dx) > this.dragThreshold || Math.abs(dy) > this.dragThreshold) {
        this.selectionBoxEl.style.display = 'block';
        this.selectionBoxEl.style.left = Math.min(this.dragStart.x, this.dragCurrent.x) + 'px';
        this.selectionBoxEl.style.top = Math.min(this.dragStart.y, this.dragCurrent.y) + 'px';
        this.selectionBoxEl.style.width = Math.abs(dx) + 'px';
        this.selectionBoxEl.style.height = Math.abs(dy) + 'px';
      }
    }

    // Update blueprint position
    if (this.blueprintMesh) {
      const terrainHit = this.raycastToTerrain();
      if (terrainHit) {
        // Snap to grid
        const snapX = Math.round(terrainHit.point.x);
        const snapZ = Math.round(terrainHit.point.z);
        this.blueprintMesh.position.set(snapX, 0, snapZ);
        
        // Update color based on check build collision
        const isValid = this.gameManager.checkBuildPosition(snapX, snapZ, this.blueprintBuilding.type);
        this.blueprintMesh.children.forEach(child => {
          if (child.material) {
            child.material.color.setHex(isValid ? 0x00ff00 : 0xff0000);
          }
        });
      }
    }
  }

  onMouseUp(e) {
    if (e.button === 0 && this.isSelecting) {
      this.isSelecting = false;
      this.selectionBoxEl.style.display = 'none';
      
      const dx = e.clientX - this.dragStart.x;
      const dy = e.clientY - this.dragStart.y;
      
      if (Math.abs(dx) <= this.dragThreshold && Math.abs(dy) <= this.dragThreshold) {
        // Single left-click selection
        this.performSingleSelection();
      } else {
        // Box selection
        this.performBoxSelection();
      }
    } else if (e.button === 2) { // Right click command
      this.performRightClickCommand();
    }
  }

  // Set blueprint to build
  startBuildPlacement(buildingType) {
    this.cancelBuildPlacement();
    
    this.blueprintBuilding = { type: buildingType };
    
    // Create a semi-transparent mesh for blueprint
    const factory = this.gameManager.modelFactory;
    this.blueprintMesh = factory.createBuildingMesh(buildingType, 0); // Player ID 0
    
    // Make transparent & green
    this.blueprintMesh.traverse(child => {
      if (child.isMesh) {
        child.material = new THREE.MeshBasicMaterial({
          color: 0x00ff00,
          transparent: true,
          opacity: 0.5,
          wireframe: false
        });
      }
    });
    
    this.renderer.scene.add(this.blueprintMesh);
  }

  cancelBuildPlacement() {
    if (this.blueprintMesh) {
      this.renderer.scene.remove(this.blueprintMesh);
      this.blueprintMesh = null;
    }
    this.blueprintBuilding = null;
  }

  placeBlueprint() {
    if (!this.blueprintMesh) return;
    
    const snapX = Math.round(this.blueprintMesh.position.x);
    const snapZ = Math.round(this.blueprintMesh.position.z);
    
    // Place building in game
    const placed = this.gameManager.placeBuilding(snapX, snapZ, this.blueprintBuilding.type);
    
    if (placed) {
      this.cancelBuildPlacement();
    } else {
      // Show warning in UI
      this.gameManager.hud.showNotification("Cannot build here! Terrain blocked or resources insufficient.");
    }
  }

  raycastToTerrain() {
    this.raycaster.setFromCamera(this.mouse, this.renderer.camera);
    // Raycast only against terrain mesh
    const terrainMesh = this.gameManager.terrain.mesh;
    const intersects = this.raycaster.intersectObject(terrainMesh);
    return intersects.length > 0 ? intersects[0] : null;
  }

  performSingleSelection() {
    this.raycaster.setFromCamera(this.mouse, this.renderer.camera);
    
    // Get all clickable objects (Units, Buildings, Resources)
    const clickables = this.gameManager.getClickableObjects();
    const intersects = this.raycaster.intersectObjects(clickables, true);
    
    if (intersects.length > 0) {
      // Find top-level entity associated with hit mesh
      let hitObj = intersects[0].object;
      while (hitObj && !hitObj.userData.entity) {
        hitObj = hitObj.parent;
      }
      
      if (hitObj && hitObj.userData.entity) {
        const entity = hitObj.userData.entity;
        this.gameManager.selectEntity(entity);
        return;
      }
    }
    
    // Clicked empty ground: deselect all
    this.gameManager.deselectAll();
  }

  performBoxSelection() {
    const x1 = Math.min(this.dragStart.x, this.dragCurrent.x);
    const x2 = Math.max(this.dragStart.x, this.dragCurrent.x);
    const y1 = Math.min(this.dragStart.y, this.dragCurrent.y);
    const y2 = Math.max(this.dragStart.y, this.dragCurrent.y);
    
    const selected = [];
    const units = this.gameManager.entityManager.units;
    
    units.forEach(unit => {
      // Only select player units (playerId === 0)
      if (unit.playerId !== 0) return;
      
      const screenPos = this.toScreenPosition(unit.mesh);
      
      if (screenPos.x >= x1 && screenPos.x <= x2 && screenPos.y >= y1 && screenPos.y <= y2) {
        selected.push(unit);
      }
    });
    
    if (selected.length > 0) {
      this.gameManager.selectEntities(selected);
    } else {
      // If we dragged but caught nothing, check if we clicked on a building/resource at the start point
      this.performSingleSelection();
    }
  }

  performRightClickCommand() {
    // If placing blueprint, right click cancels it
    if (this.blueprintBuilding) {
      this.cancelBuildPlacement();
      return;
    }

    if (this.gameManager.selectedEntities.length === 0) return;

    this.raycaster.setFromCamera(this.mouse, this.renderer.camera);
    
    // Raycast clickables first to see if we clicked on an entity (resource, building, enemy unit)
    const clickables = this.gameManager.getClickableObjects();
    const intersects = this.raycaster.intersectObjects(clickables, true);
    
    let targetEntity = null;
    if (intersects.length > 0) {
      let hitObj = intersects[0].object;
      while (hitObj && !hitObj.userData.entity) {
        hitObj = hitObj.parent;
      }
      if (hitObj && hitObj.userData.entity) {
        targetEntity = hitObj.userData.entity;
      }
    }

    // Raycast to terrain to find destination point
    const terrainHit = this.raycastToTerrain();
    
    if (targetEntity) {
      // Command selected units based on target entity
      this.gameManager.dispatchCommand(this.gameManager.selectedEntities, targetEntity, null);
      
      // Spawn indicator
      let color = 0x00ffcc; // Default command
      if (targetEntity.type === 'resource') color = 0xffd700; // Gold
      else if (targetEntity.playerId === 1) color = 0xff0000; // Enemy attack
      else if (targetEntity.type === 'building' && targetEntity.playerId === 0 && !targetEntity.isCompleted) color = 0x00ff00; // Repair/Build
      
      if (terrainHit) {
        this.spawnClickIndicator(terrainHit.point, color);
      }
    } else if (terrainHit) {
      // Command selected units to move to ground point
      this.gameManager.dispatchCommand(this.gameManager.selectedEntities, null, terrainHit.point);
      this.spawnClickIndicator(terrainHit.point, 0x00ff00);
    }
  }

  // Convert 3D position to 2D screen coordinate
  toScreenPosition(obj) {
    const vector = new THREE.Vector3();
    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    vector.project(this.renderer.camera);
    
    return {
      x: (vector.x * .5 + .5) * window.innerWidth,
      y: (-(vector.y * .5) + .5) * window.innerHeight
    };
  }

  spawnClickIndicator(point, color) {
    const indicatorGeom = new THREE.RingGeometry(0.1, 0.8, 16);
    indicatorGeom.rotateX(-Math.PI / 2);
    const indicatorMat = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const indicatorMesh = new THREE.Mesh(indicatorGeom, indicatorMat);
    indicatorMesh.position.copy(point);
    indicatorMesh.position.y = 0.05; // slightly above ground
    
    this.renderer.scene.add(indicatorMesh);
    
    // Animate out
    let scale = 1.0;
    let opacity = 0.8;
    
    const animate = () => {
      scale += 0.05;
      opacity -= 0.04;
      
      if (opacity <= 0) {
        this.renderer.scene.remove(indicatorMesh);
        indicatorGeom.dispose();
        indicatorMat.dispose();
      } else {
        indicatorMesh.scale.set(scale, scale, scale);
        indicatorMat.opacity = opacity;
        requestAnimationFrame(animate);
      }
    };
    animate();
    
    // Play command sound
    this.gameManager.soundManager.playClickSound(color === 0xff0000 ? 'attack' : 'move');
  }
}
