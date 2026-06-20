// Inspect the node hierarchy of the forest tree pack
import { NodeIO } from '@gltf-transform/core';
import { KHRMaterialsSpecular } from '@gltf-transform/extensions';

const io = new NodeIO().registerExtensions([KHRMaterialsSpecular]);
const doc  = await io.read('public/models/low_poly_forest_tree_pack.glb');
const root = doc.getRoot();

console.log('\n=== NODES WITH MESHES ===');
for (const node of root.listNodes()) {
  const mesh = node.getMesh();
  if (!mesh) continue;
  const t = node.getTranslation().map(v => v.toFixed(2)).join(', ');
  const p = node.getParentNode();
  console.log(`  mesh="${mesh.getName().substring(0,40)}" node="${node.getName()}" parent="${p?.getName()||'scene'}" t=[${t}]`);
}

console.log('\n=== SCENE CHILDREN (top level) ===');
for (const scene of root.listScenes()) {
  for (const child of scene.listChildren()) {
    console.log(`  scene-child: "${child.getName()}" hasMesh=${!!child.getMesh()}`);
    for (const gc of child.listChildren()) {
      const m = gc.getMesh();
      console.log(`    child: "${gc.getName()}" mesh="${m?.getName()||'none'}"`);
    }
  }
}
