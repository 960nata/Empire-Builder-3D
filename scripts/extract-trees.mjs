/**
 * Extracts individual tree/shrub/rock GLBs from low_poly_forest_tree_pack.glb
 * Pairs trunk + branches for each tree type, snaps bottom to Y=0.
 */
import { NodeIO, Document } from '@gltf-transform/core';
import { KHRMaterialsSpecular } from '@gltf-transform/extensions';
import { prune, dedup } from '@gltf-transform/functions';

const io = new NodeIO().registerExtensions([KHRMaterialsSpecular]);
const src = await io.read('public/models/low_poly_forest_tree_pack.glb');

// ─── helpers ───────────────────────────────────────────────────────────────

/** Deep-clone a node into a fresh Document, keeping shared materials/textures. */
function cloneNodeIntoDoc(srcDoc, nodeNames) {
  const out = new Document();
  const scene = out.createScene('Scene');
  const root  = out.getRoot();

  // Build a material map: srcMat → outMat
  const buf = out.createBuffer(); // required: all accessors need a buffer
  const matMap = new Map();
  const texMap = new Map();

  function ensureTex(srcTex) {
    if (!srcTex) return null;
    if (texMap.has(srcTex)) return texMap.get(srcTex);
    const t = out.createTexture(srcTex.getName())
      .setMimeType(srcTex.getMimeType())
      .setImage(srcTex.getImage())
      .setURI(srcTex.getURI());
    texMap.set(srcTex, t);
    return t;
  }

  function ensureMat(srcMat) {
    if (!srcMat) return null;
    if (matMap.has(srcMat)) return matMap.get(srcMat);
    const m = out.createMaterial(srcMat.getName())
      .setAlphaMode(srcMat.getAlphaMode())
      .setAlphaCutoff(srcMat.getAlphaCutoff())
      .setDoubleSided(srcMat.getDoubleSided())
      .setBaseColorFactor(srcMat.getBaseColorFactor())
      .setMetallicFactor(srcMat.getMetallicFactor())
      .setRoughnessFactor(srcMat.getRoughnessFactor());
    if (srcMat.getBaseColorTexture()) m.setBaseColorTexture(ensureTex(srcMat.getBaseColorTexture()));
    if (srcMat.getNormalTexture())     m.setNormalTexture(ensureTex(srcMat.getNormalTexture()));
    if (srcMat.getMetallicRoughnessTexture())
      m.setMetallicRoughnessTexture(ensureTex(srcMat.getMetallicRoughnessTexture()));
    if (srcMat.getOcclusionTexture())  m.setOcclusionTexture(ensureTex(srcMat.getOcclusionTexture()));
    matMap.set(srcMat, m);
    return m;
  }

  function copyAccessor(srcAcc) {
    if (!srcAcc) return null;
    // v4: component type is inferred from TypedArray type — no setComponentType needed
    const a = out.createAccessor()
      .setType(srcAcc.getType())
      .setNormalized(srcAcc.getNormalized())
      .setArray(srcAcc.getArray().slice())
      .setBuffer(buf);
    return a;
  }

  const srcRoot = srcDoc.getRoot();
  const matchedNodes = srcRoot.listNodes()
    .filter(n => nodeNames.some(patt => n.getName().startsWith(patt)));

  for (const srcNode of matchedNodes) {
    const srcMesh = srcNode.getMesh();
    if (!srcMesh) continue;

    // Clone mesh primitives
    const outMesh = out.createMesh(srcMesh.getName());
    for (const srcPrim of srcMesh.listPrimitives()) {
      const prim = out.createPrimitive();
      prim.setMode(srcPrim.getMode());
      if (srcPrim.getIndices()) prim.setIndices(copyAccessor(srcPrim.getIndices()));
      for (const semantic of srcPrim.listSemantics()) {
        prim.setAttribute(semantic, copyAccessor(srcPrim.getAttribute(semantic)));
      }
      prim.setMaterial(ensureMat(srcPrim.getMaterial()));
      outMesh.addPrimitive(prim);
    }

    const outNode = out.createNode(srcNode.getName())
      .setMesh(outMesh)
      .setTranslation([0, 0, 0])
      .setScale([1, 1, 1]);
    scene.addChild(outNode);
  }

  return out;
}

/** Compute Y bounding box of a document (sum of all vertex Y values). */
async function getDocBboxMinY(doc) {
  let minY = Infinity;
  for (const mesh of doc.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const pos = prim.getAttribute('POSITION');
      if (!pos) continue;
      for (let i = 0; i < pos.getCount(); i++) {
        const y = pos.getElement(i, [])[1];
        if (y < minY) minY = y;
      }
    }
  }
  return isFinite(minY) ? minY : 0;
}

/** Center X/Z and snap bottom Y = 0 for all geometry in the doc */
async function snapToGroundInPlace(doc) {
  // First pass: compute full bbox
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (const mesh of doc.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const pos = prim.getAttribute('POSITION');
      if (!pos) continue;
      for (let i = 0; i < pos.getCount(); i++) {
        const v = pos.getElement(i, []);
        if (v[0] < minX) minX = v[0];
        if (v[0] > maxX) maxX = v[0];
        if (v[1] < minY) minY = v[1];
        if (v[2] < minZ) minZ = v[2];
        if (v[2] > maxZ) maxZ = v[2];
      }
    }
  }

  const cx = (minX + maxX) / 2;
  const cz = (minZ + maxZ) / 2;

  // Second pass: center X/Z, snap Y
  for (const mesh of doc.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const pos = prim.getAttribute('POSITION');
      if (!pos) continue;
      const arr = pos.getArray().slice();
      for (let i = 0; i < arr.length; i += 3) {
        arr[i]   -= cx;    // center X
        arr[i+1] -= minY;  // snap Y to 0
        arr[i+2] -= cz;    // center Z
      }
      pos.setArray(arr);
    }
  }
}

// ─── Extract each type ─────────────────────────────────────────────────────

const extractions = [
  // [outputFile, ...nodeNamePrefixes]
  ['public/models/tree-pine.glb',   'Tree_Trunk_01_',   'Tree_Branches_01_'],
  ['public/models/tree-oak.glb',    'Tree_Trunk_02_',   'Tree_Branches_02_'],
  ['public/models/tree-shrub.glb',  'Background_Tree_Atlas_Background'],  // flat atlas billboard (bush/shrub)
  ['public/models/tree-rock.glb',   'Rocks_Rocks_0'],                     // single rock
];

for (const [outPath, ...prefixes] of extractions) {
  console.log(`Extracting → ${outPath} [${prefixes.join(', ')}]`);
  const outDoc = cloneNodeIntoDoc(src, prefixes);
  await snapToGroundInPlace(outDoc);
  await outDoc.transform(dedup(), prune());
  await io.write(outPath, outDoc);
  console.log(`  ✓ written`);
}

console.log('\nDone! Run compress separately if needed.');
