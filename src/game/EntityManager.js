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
    // Passable resources (shrubs) don't block pathfinding — units walk through them
    if (!resource._passable) {
      this.gameManager.gridAdd(Math.round(resource.position.x), Math.round(resource.position.z), 'resource');
    }
  }

  removeResource(resource) {
    const idx = this.resources.indexOf(resource);
    if (idx !== -1) {
      this.resources.splice(idx, 1);
    }
  }

  getClickableMeshes() {
    const meshes = [];
    this.units.forEach(u => {
      if (u.mesh && u.mesh.visible) meshes.push(u.mesh);
    });
    this.buildings.forEach(b => {
      if (b.mesh && b.mesh.visible) meshes.push(b.mesh);
    });
    this.resources.forEach(r => {
      if (r.mesh && r.mesh.visible) meshes.push(r.mesh);
    });
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

    // Tick animated resources (fish swimming, etc.)
    for (let i = this.resources.length - 1; i >= 0; i--) {
      if (typeof this.resources[i].update === 'function') {
        this.resources[i].update(deltaTime);
      }
    }
  }

  updateSpatialGrid() {
    // Clear existing keys in-place to avoid allocating a new object every frame
    const grid = this.spatialGrid;
    for (const key in grid) {
      grid[key].length = 0;
    }
    for (let i = 0; i < this.units.length; i++) {
      const u = this.units[i];
      if (!u.mesh) continue;
      const key = `${Math.floor(u.position.x / this.cellSize)},${Math.floor(u.position.z / this.cellSize)}`;
      if (grid[key]) {
        grid[key].push(u);
      } else {
        grid[key] = [u];
      }
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
