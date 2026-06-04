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
    this.blueprintPreviewMeshes = [];
    this.wallDragStart = null;
    
    // Track if shift is held (for camera rotate via right-click)
    this.shiftHeld = false;

    // Control group double press tracking
    this.lastGroupPressed = null;
    this.lastGroupPressTime = 0;
    this.lastTouchTime = 0;
    
    this.setupListeners();
  }

  setupListeners() {
    // Track shift key for distinguishing right-click rotate vs command
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Shift') this.shiftHeld = true;
      
      // Don't capture inputs if chat input is focused
      const chatInput = document.getElementById('chat-input-field');
      if (chatInput && document.activeElement === chatInput) return;
      
      // F key cycles formation
      if (e.key === 'f' || e.key === 'F') {
        const newFormation = this.gameManager.cycleFormation();
        this.gameManager.hud.showNotification(`Formation: ${this.gameManager.getFormationName(newFormation)}`);
        this.gameManager.hud.updateSelectionUI();
      }

      // Control Groups 1-9
      if (e.key >= '1' && e.key <= '9') {
        const groupNum = parseInt(e.key);
        const isCtrl = e.ctrlKey || e.metaKey;
        if (isCtrl) {
          // Assign selected player entities to control group
          const playerEntities = this.gameManager.selectedEntities.filter(ent => ent.playerId === 0);
          this.gameManager.controlGroups[groupNum] = [...playerEntities];
          this.gameManager.hud.showNotification(`Group ${groupNum} assigned: ${playerEntities.length} units`);
        } else {
          // Select control group entities
          const activeEntities = (this.gameManager.controlGroups[groupNum] || []).filter(ent => {
            const units = this.gameManager.entityManager.units;
            const buildings = this.gameManager.entityManager.buildings;
            return units.includes(ent) || buildings.includes(ent);
          });
          this.gameManager.controlGroups[groupNum] = activeEntities;

          if (activeEntities.length > 0) {
            const now = performance.now();
            if (this.lastGroupPressed === groupNum && now - this.lastGroupPressTime < 300) {
              // Double click = jump camera to average position
              let sumX = 0, sumZ = 0, count = 0;
              activeEntities.forEach(ent => {
                if (ent.position) {
                  sumX += ent.position.x;
                  sumZ += ent.position.z;
                  count++;
                }
              });
              if (count > 0) {
                const avgX = sumX / count;
                const avgZ = sumZ / count;
                this.gameManager.renderer.cameraTarget.set(avgX, 0, avgZ);
                this.gameManager.hud.showNotification(`Camera focused on Group ${groupNum}`);
              }
            } else {
              // Single click = select entities
              this.gameManager.selectEntities(activeEntities);
            }
            this.lastGroupPressed = groupNum;
            this.lastGroupPressTime = now;
          }
        }
      }
    });
    window.addEventListener('keyup', (e) => {
      if (e.key === 'Shift') this.shiftHeld = false;
    });
    
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
        this.lastTouchTime = performance.now();
        const touch = e.touches[0];
        const rect = joystickBase.getBoundingClientRect();
        this.joystickCenter.x = rect.left + rect.width / 2;
        this.joystickCenter.y = rect.top + rect.height / 2;
        this.joystickActive = true;
        e.preventDefault();
      }, { passive: false });
      
      window.addEventListener('touchmove', (e) => {
        this.lastTouchTime = performance.now();
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
        this.lastTouchTime = performance.now();
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
    const btnSelectMode = document.getElementById('mbtn-select-mode');
    if (btnSelectMode) {
      btnSelectMode.addEventListener('click', () => {
        this.mobileMultiselect = !this.mobileMultiselect;
        btnSelectMode.textContent = this.mobileMultiselect ? '☑ Multi' : '☐ Multi';
        btnSelectMode.classList.toggle('active', this.mobileMultiselect);
      });
    }

    // Mobile formation cycle button
    const btnFormation = document.getElementById('mbtn-formation');
    if (btnFormation) {
      btnFormation.addEventListener('click', () => {
        const newFormation = this.gameManager.cycleFormation();
        const name = this.gameManager.getFormationName(newFormation);
        btnFormation.textContent = name;
        btnFormation.classList.add('active');
        setTimeout(() => btnFormation.classList.remove('active'), 300);
        this.gameManager.hud.showNotification(`Formation: ${name}`);
        this.gameManager.hud.updateSelectionUI();
      });
    }

    // Touch: tap = select, double-tap = command, long-press = context action
    const canvasContainer = document.getElementById('game-canvas-container');
    this.lastTapTime = 0;
    this.tapTimeout = null;
    this.longPressTimeout = null;
    
    if (canvasContainer) {
      this.touchStartPos = { x: 0, y: 0 };
      this.touchHasMoved = false;

      canvasContainer.addEventListener('touchstart', (e) => {
        this.lastTouchTime = performance.now();
        // Ignore if tapping on UI elements or using joystick
        if (this.blueprintBuilding || e.target.closest('.joystick-base') || e.target.closest('.mobile-action-buttons')) return;
        // Ignore two-finger gestures (handled by Renderer)
        if (e.touches.length > 1) return;
        
        const touch = e.touches[0];
        this.touchStartPos.x = touch.clientX;
        this.touchStartPos.y = touch.clientY;
        this.touchHasMoved = false;
        
        // Translate client position to NDC coordinates for raycasting
        this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
        
        // Long press detection (for context menu / alternate actions)
        if (this.longPressTimeout) clearTimeout(this.longPressTimeout);
        this.longPressTimeout = setTimeout(() => {
          if (!this.touchHasMoved) {
            this.performRightClickCommand();
            this.longPressTimeout = null;
          }
        }, 500);
      }, { passive: true });
      
      canvasContainer.addEventListener('touchmove', (e) => {
        this.lastTouchTime = performance.now();
        if (e.touches.length === 1) {
          const touch = e.touches[0];
          const dist = Math.hypot(touch.clientX - this.touchStartPos.x, touch.clientY - this.touchStartPos.y);
          if (dist > 8) {
            this.touchHasMoved = true;
            if (this.longPressTimeout) {
              clearTimeout(this.longPressTimeout);
              this.longPressTimeout = null;
            }
            if (this.tapTimeout) {
              clearTimeout(this.tapTimeout);
              this.tapTimeout = null;
            }
          }
        }
      }, { passive: true });
      
      canvasContainer.addEventListener('touchend', (e) => {
        this.lastTouchTime = performance.now();
        if (this.longPressTimeout) {
          clearTimeout(this.longPressTimeout);
          this.longPressTimeout = null;
        }
        
        if (!this.touchHasMoved) {
          const now = performance.now();
          const delay = now - this.lastTapTime;
          const touch = e.changedTouches[0];
          if (touch) {
            this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
          }
          
          if (delay < 300) {
            if (this.tapTimeout) {
              clearTimeout(this.tapTimeout);
              this.tapTimeout = null;
            }
            // Double tap = command (right-click equivalent)
            this.performRightClickCommand();
            this.lastTapTime = 0;
          } else {
            this.lastTapTime = now;
            this.tapTimeout = setTimeout(() => {
              if (this.mobileMultiselect) {
                this.performSingleSelectionToggle();
              } else {
                this.performSingleSelection();
              }
              this.tapTimeout = null;
            }, 300);
          }
        }
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
    if (e.sourceCapabilities?.firesTouchEvents || (performance.now() - this.lastTouchTime < 1000)) {
      return;
    }
    // Ignore if clicked on UI
    if (e.target.closest('#hud') || e.target.closest('.ui-element')) {
      return;
    }

    if (e.button === 0 && !e.ctrlKey) { // Left click
      if (this.blueprintBuilding) {
        const type = this.blueprintBuilding.type;
        if (type === 'palisadeWall' || type === 'stoneWall') {
          const terrainHit = this.raycastToTerrain();
          if (terrainHit) {
            const snapX = Math.round(terrainHit.point.x);
            const snapZ = Math.round(terrainHit.point.z);
            this.wallDragStart = new THREE.Vector3(snapX, 0, snapZ);
            this.blueprintPreviewMeshes = [];
          }
        } else {
          this.placeBlueprint();
        }
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
    if (e.sourceCapabilities?.firesTouchEvents || (performance.now() - this.lastTouchTime < 1000)) {
      return;
    }
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
        const snapX = Math.round(terrainHit.point.x);
        const snapZ = Math.round(terrainHit.point.z);
        
        if (this.wallDragStart) {
          // Hide single blueprint mesh
          this.blueprintMesh.visible = false;
          
          // Clear old line preview meshes
          this.clearPreviewMeshes();
          
          // Get line of cells
          const cells = this.getLineCells(
            Math.round(this.wallDragStart.x),
            Math.round(this.wallDragStart.z),
            snapX,
            snapZ
          );
          
          // Spawn preview mesh for each cell along the line
          const factory = this.gameManager.modelFactory;
          for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            let angle = 0;
            if (i < cells.length - 1) {
              angle = Math.atan2(cells[i+1].x - cell.x, cells[i+1].z - cell.z);
            } else if (i > 0) {
              angle = Math.atan2(cell.x - cells[i-1].x, cell.z - cells[i-1].z);
            }
            
            const preview = factory.createBuildingMesh(this.blueprintBuilding.type, 0);
            preview.position.set(cell.x, 0, cell.z);
            preview.rotation.y = angle;
            
            const isValid = this.gameManager.checkBuildPosition(cell.x, cell.z, this.blueprintBuilding.type);
            preview.traverse(child => {
              if (child.isMesh) {
                child.material = new THREE.MeshBasicMaterial({
                  color: isValid ? 0x00ff00 : 0xff0000,
                  transparent: true,
                  opacity: 0.5
                });
              }
            });
            this.renderer.scene.add(preview);
            this.blueprintPreviewMeshes.push(preview);
          }
        } else {
          this.blueprintMesh.visible = true;
          this.blueprintMesh.position.set(snapX, 0, snapZ);
          
          const isValid = this.gameManager.checkBuildPosition(snapX, snapZ, this.blueprintBuilding.type);
          this.blueprintMesh.children.forEach(child => {
            if (child.material) {
              child.material.color.setHex(isValid ? 0x00ff00 : 0xff0000);
            }
          });
        }
      }
    }
  }

  onMouseUp(e) {
    if (e.sourceCapabilities?.firesTouchEvents || (performance.now() - this.lastTouchTime < 1000)) {
      return;
    }
    if (e.button === 0 && !e.ctrlKey && this.isSelecting) {
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
    } else if (e.button === 0 && !e.ctrlKey && this.blueprintBuilding && this.wallDragStart) {
      // Placing drag walls on mouse up!
      const terrainHit = this.raycastToTerrain();
      if (terrainHit) {
        const snapX = Math.round(terrainHit.point.x);
        const snapZ = Math.round(terrainHit.point.z);
        
        const cells = this.getLineCells(
          Math.round(this.wallDragStart.x),
          Math.round(this.wallDragStart.z),
          snapX,
          snapZ
        );

        let placedAny = false;
        for (let i = 0; i < cells.length; i++) {
          const cell = cells[i];
          let angle = 0;
          if (i < cells.length - 1) {
            angle = Math.atan2(cells[i+1].x - cell.x, cells[i+1].z - cell.z);
          } else if (i > 0) {
            angle = Math.atan2(cell.x - cells[i-1].x, cell.z - cells[i-1].z);
          }

          const cost = this.gameManager.getBuildingCost(this.blueprintBuilding.type);
          if (this.gameManager.hasResources(0, cost)) {
            if (this.gameManager.checkBuildPosition(cell.x, cell.z, this.blueprintBuilding.type)) {
              const placed = this.gameManager.placeBuilding(cell.x, cell.z, this.blueprintBuilding.type, angle);
              if (placed) placedAny = true;
            }
          }
        }

        if (!placedAny) {
          this.gameManager.hud.showNotification("Cannot build walls here! Terrain blocked or resources insufficient.");
        }
      }
      this.clearPreviewMeshes();
      this.cancelBuildPlacement();
      this.wallDragStart = null;
    } else if ((e.button === 2 || (e.button === 0 && e.ctrlKey)) && !this.shiftHeld) {
      // Right click or Ctrl+click = COMMAND ONLY
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
    this.clearPreviewMeshes();
    this.blueprintBuilding = null;
    this.wallDragStart = null;
  }

  clearPreviewMeshes() {
    if (this.blueprintPreviewMeshes) {
      this.blueprintPreviewMeshes.forEach(mesh => {
        this.renderer.scene.remove(mesh);
        mesh.traverse(child => {
          if (child.isMesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose());
            } else if (child.material) {
              child.material.dispose();
            }
          }
        });
      });
      this.blueprintPreviewMeshes = [];
    }
  }

  getLineCells(x1, z1, x2, z2) {
    const cells = [];
    const dx = Math.abs(x2 - x1);
    const dz = Math.abs(z2 - z1);
    const sx = (x1 < x2) ? 1 : -1;
    const sz = (z1 < z2) ? 1 : -1;
    let err = dx - dz;

    let x = x1;
    let z = z1;
    
    const maxSegments = 120;
    let count = 0;

    while (count < maxSegments) {
      cells.push({ x, z });
      if (x === x2 && z === z2) break;
      const e2 = 2 * err;
      if (e2 > -dz) {
        err -= dz;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        z += sz;
      }
      count++;
    }
    return cells;
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
      const UNIT_TYPES = ['villager', 'swordsman', 'archer', 'knight', 'priest', 'trader', 'footKnight', 'heavyCavalry', 'horseArcher', 'fishingShip', 'sheep'];
      
      let bestEntity = null;
      let playerUnitFound = false;
      let anyUnitFound = false;

      // Scan all intersections along the ray
      for (let i = 0; i < intersects.length; i++) {
        let hitObj = intersects[i].object;
        while (hitObj && !hitObj.userData.entity) {
          hitObj = hitObj.parent;
        }
        
        if (hitObj && hitObj.userData.entity) {
          const entity = hitObj.userData.entity;
          const isUnit = UNIT_TYPES.includes(entity.type);
          
          if (isUnit) {
            if (entity.playerId === 0) {
              // Priority 1: Player unit
              bestEntity = entity;
              playerUnitFound = true;
              break; // Stop immediately, this is the best selection
            } else if (!playerUnitFound && !anyUnitFound) {
              // Priority 2: Enemy or Ally unit
              bestEntity = entity;
              anyUnitFound = true;
            }
          } else {
            // Priority 3: Static building or resource
            if (!bestEntity) {
              bestEntity = entity;
            }
          }
        }
      }
      
      if (bestEntity) {
        this.gameManager.selectEntity(bestEntity);
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
      const isResource = ['wood', 'gold', 'stone', 'food', 'sheep', 'fish'].includes(targetEntity.type);
      const isBuilding = ['townCenter', 'barracks', 'house', 'temple', 'market', 'dock', 'farm', 'palisadeWall', 'palisadeGate', 'stoneWall', 'stoneGate', 'watchTower', 'university', 'siegeWorkshop', 'blacksmith', 'castle'].includes(targetEntity.type);

      if (isResource) color = 0xffd700; // Gold
      else if (targetEntity.playerId === 1) color = 0xff0000; // Enemy attack
      else if (isBuilding && targetEntity.playerId === 0 && !targetEntity.isCompleted) color = 0x00ff00; // Repair/Build
      
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
