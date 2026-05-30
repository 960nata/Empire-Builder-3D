import { Unit } from './Unit';
import { Building } from './Building';

export class EntityManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.units = [];
    this.buildings = [];
    this.resources = [];
    this.spatialGrid = {};
    this.cellSize = 6.0;
  }

  createUnit(type, playerId, x, z) {
    const unit = new Unit(this.gameManager, type, playerId, x, z);
    this.units.push(unit);
    return unit;
  }

  addUnit(unit) {
    this.units.push(unit);
  }

  removeUnit(unit) {
    const idx = this.units.indexOf(unit);
    if (idx !== -1) {
      this.units.splice(idx, 1);
    }
  }

  createBuilding(type, playerId, x, z, startCompleted = false) {
    const b = new Building(this.gameManager, type, playerId, x, z, startCompleted);
    this.buildings.push(b);
    return b;
  }

  addBuilding(building) {
    this.buildings.push(building);
  }

  removeBuilding(building) {
    const idx = this.buildings.indexOf(building);
    if (idx !== -1) {
      this.buildings.splice(idx, 1);
    }
  }

  addResource(resource) {
    this.resources.push(resource);
    // Mark terrain grid cell as blocked by this resource
    this.gameManager.gridAdd(Math.round(resource.position.x), Math.round(resource.position.z), 'resource');
  }

  removeResource(resource) {
    const idx = this.resources.indexOf(resource);
    if (idx !== -1) {
      this.resources.splice(idx, 1);
    }
  }

  getClickableMeshes() {
    const meshes = [];
    this.units.forEach(u => meshes.push(u.mesh));
    this.buildings.forEach(b => meshes.push(b.mesh));
    this.resources.forEach(r => meshes.push(r.mesh));
    return meshes;
  }

  update(deltaTime) {
    // Rebuild spatial grid
    this.updateSpatialGrid();

    // Tick all units
    // Loop backwards so we can safely delete dead units
    for (let i = this.units.length - 1; i >= 0; i--) {
      this.units[i].update(deltaTime);
    }
    
    // Tick all buildings
    for (let i = this.buildings.length - 1; i >= 0; i--) {
      this.buildings[i].update(deltaTime);
    }
  }

  updateSpatialGrid() {
    this.spatialGrid = {};
    for (let i = 0; i < this.units.length; i++) {
      const u = this.units[i];
      if (!u.mesh) continue;
      const gx = Math.floor(u.position.x / this.cellSize);
      const gz = Math.floor(u.position.z / this.cellSize);
      const key = `${gx},${gz}`;
      if (!this.spatialGrid[key]) {
        this.spatialGrid[key] = [];
      }
      this.spatialGrid[key].push(u);
    }
  }

  clearAll() {
    this.units.forEach(u => this.gameManager.renderer.scene.remove(u.mesh));
    this.buildings.forEach(b => this.gameManager.renderer.scene.remove(b.mesh));
    this.resources.forEach(r => this.gameManager.renderer.scene.remove(r.mesh));
    this.units = [];
    this.buildings = [];
    this.resources = [];
    this.spatialGrid = {};
  }
}
