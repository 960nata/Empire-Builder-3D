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

    // Replace procedural wood trees with low-poly forest GLBs
    if (this.type === 'wood') {
      const mf = this.gameManager.modelFactory;
      const r = Math.random();
      if (r < 0.55) {
        this._swapToGLBTree(() => mf.loadTreePineGLB());
      } else if (r < 0.90) {
        this._swapToGLBTree(() => mf.loadTreeOakGLB());
      } else {
        this._passable = true; // shrubs: units walk through, not an obstacle
        this._swapToGLBTree(() => mf.loadGrassShrubGLB());
      }
    }

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

  async _swapToGLBTree(loader) {
    try {
      // inner = cloned GLB with rotation.x=-π/2 (uprights Z-up forest-pack trees)
      // Wrap it in a separate Group for Y-spin so Euler order doesn't cause tilting.
      // Without wrapper: Euler XYZ(-π/2, θ, 0) = Ry(θ)*Rx(-π/2) which tilts trees
      // at most angles. With wrapper: outer.Ry * inner.Rx(-π/2) — always upright.
      const inner = await loader();
      if (!this.mesh) return;
      const scene = this.gameManager.renderer.scene;

      // Fix materials on inner (preserve foliage alpha, DoubleSide, no castShadow on alpha)
      inner.visible = true;
      inner.traverse(child => {
        child.visible = true;
        if (!child.isMesh || !child.material) return;
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        let hasAlpha = false;
        mats.forEach(mat => {
          if (!mat) return;
          mat.side = THREE.DoubleSide;
          mat.needsUpdate = true;
          if (mat.transparent || (mat.alphaTest ?? 0) > 0) hasAlpha = true;
        });
        if (hasAlpha) child.castShadow = false;
      });

      // Wrapper handles position + Y spin only — inner handles X upright
      const wrapper = new THREE.Group();
      wrapper.rotation.y = Math.random() * Math.PI * 2;
      wrapper.position.set(this.position.x, this.position.y, this.position.z);
      wrapper.userData = { entity: this };
      wrapper.add(inner);

      // Snap bottom flush to terrain (inner's baked Y offset handles most of it)
      wrapper.updateWorldMatrix(true, true);
      const box = new THREE.Box3().setFromObject(wrapper);
      if (isFinite(box.min.y)) wrapper.position.y += (this.position.y - box.min.y);

      scene.remove(this.mesh);
      scene.add(wrapper);
      this.mesh = wrapper;
    } catch (err) {
      console.warn('[ResourceNode._swapToGLBTree]', err);
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
