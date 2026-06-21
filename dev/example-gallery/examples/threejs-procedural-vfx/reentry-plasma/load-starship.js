import * as THREE from "three/webgpu";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
const ENGINE_NAME_HINT = /(?:engine|nozzle|raptor)/i;
async function loadStarship(url) {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(url);
  const model = gltf.scene;
  model.traverse((child) => {
    if ("castShadow" in child) {
      child.castShadow = false;
      child.receiveShadow = false;
    }
  });
  const initialBox = new THREE.Box3().setFromObject(model);
  const initialSize = initialBox.getSize(new THREE.Vector3());
  const axisLengths = [initialSize.x, initialSize.y, initialSize.z];
  const axisIndices = [0, 1, 2].sort((a, b) => axisLengths[b] - axisLengths[a]);
  const axisVectors = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)];
  const forwardAxis = axisVectors[axisIndices[0]].clone();
  const upAxis = axisVectors[axisIndices[1]].clone();
  const enginePositions = collectEnginePositions(model);
  if (enginePositions.length > 0) {
    const center2 = initialBox.getCenter(new THREE.Vector3());
    const centerDot = center2.dot(forwardAxis);
    const engineAvg = enginePositions.reduce((sum, pos) => sum + pos.dot(forwardAxis), 0) / enginePositions.length;
    if (engineAvg > centerDot) {
      forwardAxis.multiplyScalar(-1);
    }
  }
  const correction = computeCorrection(forwardAxis, upAxis);
  model.applyQuaternion(correction);
  model.updateMatrixWorld(true);
  const correctedBox = new THREE.Box3().setFromObject(model);
  const correctedSize = correctedBox.getSize(new THREE.Vector3());
  const targetLength = 12;
  const scale = targetLength / (correctedSize.z || 1);
  model.scale.setScalar(scale);
  model.updateMatrixWorld(true);
  const scaledBox = new THREE.Box3().setFromObject(model);
  const center = scaledBox.getCenter(new THREE.Vector3());
  model.position.sub(center);
  model.rotateY(-Math.PI / 2);
  model.updateMatrixWorld(true);
  const finalBox = new THREE.Box3().setFromObject(model);
  const finalSize = finalBox.getSize(new THREE.Vector3());
  const mounts = collectEnginePositions(model);
  const engineMounts = mounts.length > 0 ? mounts : createFallbackEngineMounts(finalBox, finalSize);
  const plasmaAnchors = collectPlasmaAnchors(model, finalBox);
  return {
    object: model,
    engineMounts,
    length: finalSize.z,
    plasmaHeadPoint: plasmaAnchors.head,
    plasmaTailPoint: plasmaAnchors.tail
  };
}
function collectPlasmaAnchors(model, fallbackBox) {
  const head = new THREE.Vector3(0, 0, fallbackBox.max.z);
  const tail = new THREE.Vector3(0, 0, fallbackBox.min.z);
  let maxZ = -Infinity;
  let minZ = Infinity;
  forEachShipVertex(model, (vertex) => {
    if (vertex.z > maxZ) {
      maxZ = vertex.z;
      head.copy(vertex);
    }
    if (vertex.z < minZ) {
      minZ = vertex.z;
      tail.copy(vertex);
    }
  });
  const span = Math.max(1e-4, maxZ - minZ);
  const capWidth = Math.max(span * 0.03, 0.02);
  const headCap = [];
  const tailCap = [];
  forEachShipVertex(model, (vertex) => {
    if (vertex.z >= maxZ - capWidth) {
      headCap.push(vertex.clone());
    }
    if (vertex.z <= minZ + capWidth) {
      tailCap.push(vertex.clone());
    }
  });
  head.copy(refineCapAnchor(headCap, head));
  tail.copy(refineCapAnchor(tailCap, tail));
  return { head, tail };
}
function refineCapAnchor(points, fallback) {
  if (points.length === 0) return fallback.clone();
  const xs = points.map((point) => point.x).sort((a, b) => a - b);
  const ys = points.map((point) => point.y).sort((a, b) => a - b);
  const mid = Math.floor(points.length / 2);
  const medianX = xs[mid];
  const medianY = ys[mid];
  const sortedByRadial = points.map((point) => ({
    point,
    radial: Math.hypot(point.x - medianX, point.y - medianY)
  })).sort((a, b) => a.radial - b.radial);
  const keepCount = Math.max(1, Math.floor(sortedByRadial.length * 0.5));
  const refined = new THREE.Vector3();
  for (let index = 0; index < keepCount; index += 1) {
    refined.add(sortedByRadial[index].point);
  }
  return refined.multiplyScalar(1 / keepCount);
}
function forEachShipVertex(model, callback) {
  const localVertex = new THREE.Vector3();
  const worldVertex = new THREE.Vector3();
  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const geometry = child.geometry;
    if (!geometry) return;
    const position = geometry.getAttribute("position");
    if (!position) return;
    for (let index = 0; index < position.count; index += 1) {
      localVertex.fromBufferAttribute(position, index);
      worldVertex.copy(localVertex).applyMatrix4(child.matrixWorld);
      callback(worldVertex);
    }
  });
}
function collectEnginePositions(model) {
  const positions = [];
  model.traverse((child) => {
    if (!ENGINE_NAME_HINT.test(child.name)) return;
    const position = new THREE.Vector3();
    child.getWorldPosition(position);
    positions.push(position);
  });
  return positions;
}
function createFallbackEngineMounts(box, size) {
  const mounts = [];
  const radius = Math.max(size.x, size.y) * 0.12;
  const z = box.min.z + size.z * 0.04;
  for (let i = 0; i < 3; i += 1) {
    const angle = Math.PI * 2 * i / 3;
    mounts.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, z));
  }
  return mounts;
}
function computeCorrection(forward, up) {
  const canonicalForward = new THREE.Vector3(0, 0, 1);
  const canonicalUp = new THREE.Vector3(0, 1, 0);
  const qForward = new THREE.Quaternion().setFromUnitVectors(forward.clone().normalize(), canonicalForward);
  const rotatedUp = up.clone().normalize().applyQuaternion(qForward);
  const projectedUp = rotatedUp.sub(canonicalForward.clone().multiplyScalar(rotatedUp.dot(canonicalForward))).normalize();
  if (projectedUp.lengthSq() < 1e-4) {
    return qForward;
  }
  const dot = THREE.MathUtils.clamp(projectedUp.dot(canonicalUp), -1, 1);
  const angle = Math.acos(dot);
  const cross = new THREE.Vector3().crossVectors(projectedUp, canonicalUp);
  const sign = cross.dot(canonicalForward) < 0 ? -1 : 1;
  const qUp = new THREE.Quaternion().setFromAxisAngle(canonicalForward, angle * sign);
  return qUp.multiply(qForward);
}
export {
  loadStarship
};
