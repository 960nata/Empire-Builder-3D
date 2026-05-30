import * as THREE from 'three';

export class ResourceNode {
  constructor(gameManager, type, x, y, z) {
    this.gameManager = gameManager;
    this.type = type; // 'wood', 'gold', 'stone'
    this.position = new THREE.Vector3(x, y, z);
    
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
    }
    
    this.id = 'resource_' + Math.random().toString(36).substr(2, 9);
    this.mesh = this.gameManager.modelFactory.createResourceMesh(type, this.amount / this.maxAmount);
    this.mesh.position.copy(this.position);
    
    // Set up standard interaction tagging
    this.mesh.userData = { entity: this };
    
    this.gameManager.renderer.scene.add(this.mesh);
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
