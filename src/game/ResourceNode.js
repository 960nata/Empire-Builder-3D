import * as THREE from 'three';

export class ResourceNode {
  constructor(gameManager, type, x, y, z) {
    this.gameManager = gameManager;
    this.type = type; // 'wood', 'gold', 'stone'
    this.position = new THREE.Vector3(x, y, z);
    this._time = 0; // local animation clock
    
    // Set starting amounts
    if (this.type === 'wood') {
      this.amount = 150;
      this.maxAmount = 150;
    } else if (this.type === 'gold') {
      this.amount = 400;
      this.maxAmount = 400;
    } else if (this.type === 'stone') {
      this.amount = 300;
      this.maxAmount = 300;
    } else if (this.type === 'sheep') {
      this.amount = 120;
      this.maxAmount = 120;
    } else if (this.type === 'fish') {
      this.amount = 200;
      this.maxAmount = 200;
    }
    
    this.id = 'resource_' + Math.random().toString(36).substr(2, 9);
    this.mesh = this.gameManager.modelFactory.createResourceMesh(type, this.amount / this.maxAmount);
    this.mesh.position.copy(this.position);
    
    // Set up standard interaction tagging
    this.mesh.userData = { entity: this };

    // Pre-calculate per-fish swim parameters for animated fish schools
    if (this.type === 'fish') {
      this._fishParams = [];
      const children = [];
      this.mesh.traverse(child => { if (child.isMesh) children.push(child); });
      children.forEach((child, i) => {
        this._fishParams.push({
          mesh:        child,
          orbitRadius: 0.45 + i * 0.22,         // staggered orbit rings
          orbitSpeed:  0.55 + i * 0.18,          // different swim speeds
          orbitOffset: (i / children.length) * Math.PI * 2, // spread around circle
          bobAmp:      0.06 + i * 0.04,          // vertical bobbing amplitude
          bobSpeed:    1.2  + i * 0.35,          // bobbing frequency
          bobOffset:   i * 1.1,                   // phase stagger
          // store base (initial) world position offset relative to group
          baseX:       child.position.x,
          baseZ:       child.position.z,
        });
      });
    }
    
    this.gameManager.renderer.scene.add(this.mesh);
  }

  // Per-frame animation tick
  update(deltaTime) {
    if (this.type !== 'fish' || !this._fishParams) return;
    this._time += deltaTime;
    const t = this._time;

    for (const p of this._fishParams) {
      const angle = t * p.orbitSpeed + p.orbitOffset;
      // Circular orbit in XZ plane relative to resource node group
      p.mesh.position.x = p.baseX + Math.cos(angle) * p.orbitRadius;
      p.mesh.position.z = p.baseZ + Math.sin(angle) * p.orbitRadius;
      // Vertical float
      p.mesh.position.y = Math.sin(t * p.bobSpeed + p.bobOffset) * p.bobAmp;
      // Face direction of travel (tangent to orbit = angle + PI/2)
      p.mesh.rotation.y = -angle - Math.PI / 2;
    }
  }

  setSelected(isSelected) {
    this.selected = isSelected;
  }

  gather(gatherRate) {
    const toGather = Math.min(this.amount, gatherRate);
    this.amount -= toGather;
    
    // Visual feedback: Shrink mesh slightly as it gets depleted
    const scaleFactor = 0.4 + 0.6 * (this.amount / this.maxAmount);
    
    if (this.type === 'wood') {
      this.mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
    } else {
      this.mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }
    
    if (this.amount <= 0) {
      this.destroy();
    }
    
    return toGather;
  }

  destroy() {
    this.gameManager.renderer.scene.remove(this.mesh);
    // Cleanup geometry and materials
    this.mesh.traverse(child => {
      if (child.isMesh) {
        child.geometry.dispose();
        child.material.dispose();
      }
    });
    
    this.gameManager.entityManager.removeResource(this);
    this.gameManager.gridRemove(Math.round(this.position.x), Math.round(this.position.z));
  }
}
