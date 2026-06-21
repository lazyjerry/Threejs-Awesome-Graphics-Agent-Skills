import * as THREE from "three/webgpu";
import { MeshBasicNodeMaterial } from "three/webgpu";
import {
  cameraPosition,
  color,
  dot,
  float,
  mix,
  mx_noise_float,
  normalWorld,
  positionLocal,
  positionWorld,
  smoothstep,
  time,
  vec3,
  uniform
} from "three/tsl";
const TWO_PI = 2 * Math.PI;
const LOCAL_FORWARD_AXIS = new THREE.Vector3(0, 0, 1);
const LOCAL_UP_AXIS = new THREE.Vector3(0, 1, 0);
const LOCAL_RIGHT_AXIS = new THREE.Vector3(1, 0, 0);
const TEMP_FALL = new THREE.Vector3();
const TEMP_WAKE_UP = new THREE.Vector3();
const TEMP_WAKE_RIGHT = new THREE.Vector3();
const TEMP_WAKE_MATRIX = new THREE.Matrix4();
const TEMP_SUPPORT = new THREE.Vector3();
const TEMP_WORLD_VERTEX = new THREE.Vector3();
const TEMP_LOCAL_VERTEX = new THREE.Vector3();
function collectShellSupportPoints(shipTemplate) {
  const points = [];
  shipTemplate.updateMatrixWorld(true);
  const rootInverse = shipTemplate.matrixWorld.clone().invert();
  shipTemplate.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const position = child.geometry?.getAttribute("position");
    if (!position) return;
    const step = position.count > 9e3 ? 2 : 1;
    for (let index = 0; index < position.count; index += step) {
      TEMP_LOCAL_VERTEX.fromBufferAttribute(position, index);
      TEMP_WORLD_VERTEX.copy(TEMP_LOCAL_VERTEX).applyMatrix4(child.matrixWorld).applyMatrix4(rootInverse);
      points.push(TEMP_WORLD_VERTEX.clone());
    }
  });
  if (points.length === 0) {
    points.push(new THREE.Vector3(0, 0, 0));
  }
  return points;
}
function supportPoint(points, direction, out) {
  let best = points[0];
  let bestDot = best.dot(direction);
  for (let index = 1; index < points.length; index += 1) {
    const candidate = points[index];
    const score = candidate.dot(direction);
    if (score > bestDot) {
      bestDot = score;
      best = candidate;
    }
  }
  out.copy(best);
}
function createFrontShellMaterial(intensityUniform, flowUniform, fallDirectionWorldUniform) {
  const facing = dot(normalWorld, fallDirectionWorldUniform.negate()).clamp(0, 1);
  const facingMask = smoothstep(float(0.18), float(0.96), facing);
  const flowOffset = fallDirectionWorldUniform.mul(time.mul(5.4).add(flowUniform.mul(0.08)));
  const turbulenceCoarse = mx_noise_float(positionWorld.mul(3.6).add(flowOffset)).mul(0.5).add(0.5);
  const turbulenceFine = mx_noise_float(
    positionWorld.mul(11.2).add(flowOffset.mul(1.9)).add(vec3(6.7, -3.1, 1.4))
  ).mul(0.5).add(0.5);
  const turbulence = turbulenceCoarse.mul(0.62).add(turbulenceFine.mul(0.38));
  const filament = turbulenceFine.pow(3.1).mul(0.85).add(turbulence.mul(0.15)).clamp(0, 1);
  const fresnelRaw = dot(cameraPosition.sub(positionWorld).normalize(), normalWorld).abs().oneMinus();
  const fresnel = fresnelRaw.pow(1.12);
  const rimBoost = smoothstep(float(0.18), float(0.98), fresnel);
  const coreHeat = facingMask.mul(float(1).sub(rimBoost.mul(0.42))).clamp(0, 1);
  const envelope = rimBoost.mul(float(1).sub(facingMask.mul(0.22))).clamp(0, 1);
  const shockBand = smoothstep(float(0.68), float(0.98), facing).mul(smoothstep(float(0.22), float(0.92), rimBoost)).mul(filament);
  const alpha = coreHeat.mul(turbulence.mul(0.5).add(0.5)).mul(fresnel.mul(0.7).add(0.3)).add(envelope.mul(filament.mul(0.35).add(0.45))).add(shockBand.mul(0.78)).mul(intensityUniform);
  const material = new MeshBasicNodeMaterial();
  const coreTemperature = facingMask.pow(0.7).mul(turbulence.mul(0.22).add(0.78)).clamp(0, 1);
  const hotCoreColor = mix(color(16742948), color(16776191), coreTemperature.pow(0.68));
  const ionColor = mix(color(16728020), color(8007167), turbulence.mul(0.62).add(rimBoost.mul(0.38)).clamp(0, 1));
  const sheathColor = mix(color(9123327), color(3135231), rimBoost.mul(0.72).add(turbulence.mul(0.28)).clamp(0, 1));
  const shockColor = mix(color(16776191), color(5220607), turbulence.mul(0.55).add(0.2).clamp(0, 1));
  const finalColor = hotCoreColor.mul(coreHeat.mul(1.52).add(0.1)).add(ionColor.mul(envelope.mul(1.46))).add(sheathColor.mul(envelope.mul(1.98))).add(shockColor.mul(shockBand.mul(2.72)));
  material.colorNode = finalColor.mul(alpha.mul(4.3));
  material.opacityNode = alpha.mul(1).clamp(0, 1);
  material.transparent = true;
  material.depthWrite = false;
  material.depthTest = true;
  material.polygonOffset = true;
  material.polygonOffsetFactor = -2;
  material.polygonOffsetUnits = -2;
  material.side = THREE.DoubleSide;
  material.blending = THREE.AdditiveBlending;
  return material;
}
function createFrontShell(shipTemplate, intensityUniform, flowUniform, fallDirectionWorldUniform) {
  const shell = shipTemplate.clone(true);
  const shellMaterial = createFrontShellMaterial(intensityUniform, flowUniform, fallDirectionWorldUniform);
  shell.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.material = shellMaterial;
    child.frustumCulled = false;
    child.renderOrder = 10;
  });
  shell.scale.multiplyScalar(1.005);
  return shell;
}
function capsuleProfilePoint(theta, halfStraight, radius, out) {
  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);
  const yOffset = sinTheta >= 0 ? halfStraight : -halfStraight;
  out.set(cosTheta * radius, sinTheta * radius + yOffset);
}
function createCapsuleWakeGeometry(profileLength, profileRadius, trailLength, expansion, radialSegments, sliceSegments) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const uvs = [];
  const indices = [];
  const halfLength = profileLength * 0.5;
  const halfStraight = Math.max(halfLength - profileRadius, profileRadius * 0.12);
  const point = new THREE.Vector2();
  for (let slice = 0; slice <= sliceSegments; slice += 1) {
    const t = slice / sliceSegments;
    const z = -trailLength * t;
    const spread = 1 + Math.pow(t, 1.24) * expansion;
    const axialSqueeze = 1 + t * 0.1;
    for (let segment = 0; segment <= radialSegments; segment += 1) {
      const theta = segment / radialSegments * TWO_PI;
      capsuleProfilePoint(theta, halfStraight, profileRadius, point);
      const turbulence = 1 + Math.sin(theta * 3.3 + t * 8.7) * 0.1 * t;
      const x = point.x * spread * turbulence;
      const y = point.y * spread * axialSqueeze;
      positions.push(x, y, z);
      uvs.push(segment / radialSegments, t);
    }
  }
  const stride = radialSegments + 1;
  for (let slice = 0; slice < sliceSegments; slice += 1) {
    for (let segment = 0; segment < radialSegments; segment += 1) {
      const a = slice * stride + segment;
      const b = a + stride;
      const c = b + 1;
      const d = a + 1;
      indices.push(a, b, d, b, c, d);
    }
  }
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
function createWakeMaterial(intensityUniform, flowUniform, trailLength, widthScale, heightScale, noiseScale, noiseSpeed, opacityScale) {
  const zNorm = positionLocal.z.negate().div(float(trailLength)).clamp(0, 1);
  const xDist = positionLocal.x.abs().div(float(widthScale));
  const yDist = positionLocal.y.abs().div(float(heightScale));
  const profileDistance = xDist.mul(xDist).add(yDist.mul(yDist)).sqrt();
  const coreMask = smoothstep(float(1.16), float(0.03), profileDistance);
  const edgeBand = smoothstep(float(0.58), float(0.98), profileDistance).mul(smoothstep(float(1.22), float(0.82), profileDistance));
  const frontMask = smoothstep(float(0), float(0.06), zNorm);
  const tailFade = float(1).sub(smoothstep(float(0.72), float(1), zNorm));
  const flowTime = time.mul(noiseSpeed).add(flowUniform.mul(0.14));
  const streakSpace = positionLocal.mul(vec3(noiseScale, noiseScale, noiseScale * 0.18));
  const streakCoordA = streakSpace.add(vec3(0, 0, flowTime.mul(2.1)));
  const streakCoordB = streakSpace.mul(2.1).add(vec3(6.1, -2.7, flowTime.mul(4.1)));
  const wakeNoiseCoarse = mx_noise_float(streakCoordA).mul(0.5).add(0.5);
  const wakeNoiseFine = mx_noise_float(streakCoordB).mul(0.5).add(0.5);
  const wakeNoise = wakeNoiseCoarse.mul(0.62).add(wakeNoiseFine.mul(0.38)).clamp(0, 1);
  const wakeFilaments = wakeNoiseFine.pow(3.4).mul(0.85).add(wakeNoise.mul(0.15)).clamp(0, 1);
  const fresnel = dot(cameraPosition.sub(positionWorld).normalize(), normalWorld).abs().oneMinus().pow(1.3);
  const headHeat = float(1).sub(zNorm.mul(0.92)).clamp(0, 1);
  const tailCool = smoothstep(float(0.12), float(0.95), zNorm);
  const envelope = edgeBand.add(float(1).sub(coreMask).mul(0.38)).mul(float(1).sub(zNorm.mul(0.16))).clamp(0, 1);
  const alpha = coreMask.mul(frontMask).mul(tailFade).mul(wakeFilaments.mul(0.72).add(0.28)).mul(fresnel.mul(1.18).add(0.16)).mul(intensityUniform.mul(0.92).add(0.08)).mul(opacityScale);
  const material = new MeshBasicNodeMaterial();
  const hotCore = mix(color(16726740), color(16776191), headHeat.pow(0.72));
  const coolCore = mix(color(8072703), color(2047743), tailCool);
  const coreColor = mix(hotCore, coolCore, smoothstep(float(0.06), float(0.38), zNorm));
  const envelopeColor = mix(color(3135231), color(2770687), zNorm.pow(0.9));
  const streakColor = mix(color(16776191), color(8115967), zNorm.mul(0.9).clamp(0, 1));
  const colorBlend = coreColor.mul(coreMask.mul(headHeat.mul(0.95).add(0.1))).add(envelopeColor.mul(envelope.mul(1.18))).add(streakColor.mul(wakeFilaments.mul(coreMask).mul(0.85)));
  material.colorNode = colorBlend.mul(alpha.mul(3.45));
  material.opacityNode = alpha.clamp(0, 1);
  material.transparent = true;
  material.depthWrite = false;
  material.depthTest = false;
  material.side = THREE.DoubleSide;
  material.blending = THREE.AdditiveBlending;
  return material;
}
function createReentryPlasma(shipLength, shipTemplate) {
  const length = Math.max(shipLength, 1);
  const group = new THREE.Group();
  const wakeRoot = new THREE.Group();
  const frontShellRoot = new THREE.Group();
  group.add(frontShellRoot);
  frontShellRoot.add(wakeRoot);
  const intensityUniform = uniform(0);
  const flowUniform = uniform(0);
  const fallDirectionWorldUniform = uniform(new THREE.Vector3(0, 0, 1));
  const shellSupportPoints = collectShellSupportPoints(shipTemplate);
  const frontShell = createFrontShell(shipTemplate, intensityUniform, flowUniform, fallDirectionWorldUniform);
  frontShell.frustumCulled = false;
  frontShellRoot.add(frontShell);
  const profileLength = length * 0.74;
  const profileRadius = length * 0.068;
  const trailLength = length * 1.55;
  const coreWakeGeometry = createCapsuleWakeGeometry(profileLength * 0.86, profileRadius * 0.95, trailLength, 1.9, 52, 26);
  const coreWakeMaterial = createWakeMaterial(
    intensityUniform,
    flowUniform,
    trailLength,
    profileRadius * 2.1,
    profileLength * 0.82,
    6.6,
    2.3,
    1
  );
  const coreWakeMesh = new THREE.Mesh(coreWakeGeometry, coreWakeMaterial);
  coreWakeMesh.renderOrder = 8;
  coreWakeMesh.frustumCulled = false;
  wakeRoot.add(coreWakeMesh);
  const hazeTrailLength = trailLength * 1.05;
  const hazeWakeGeometry = createCapsuleWakeGeometry(profileLength, profileRadius * 1.2, hazeTrailLength, 2, 40, 20);
  const hazeWakeMaterial = createWakeMaterial(
    intensityUniform,
    flowUniform,
    hazeTrailLength,
    profileRadius * 2.9,
    profileLength * 1.02,
    4.4,
    1.55,
    0.28
  );
  const hazeWakeMesh = new THREE.Mesh(hazeWakeGeometry, hazeWakeMaterial);
  hazeWakeMesh.renderOrder = 7;
  hazeWakeMesh.frustumCulled = false;
  wakeRoot.add(hazeWakeMesh);
  const lobeTrailLength = trailLength * 0.88;
  const lobeGeometry = createCapsuleWakeGeometry(profileLength * 0.5, profileRadius * 0.5, lobeTrailLength, 1.85, 28, 14);
  const lobeMaterial = createWakeMaterial(
    intensityUniform,
    flowUniform,
    lobeTrailLength,
    profileRadius * 1.1,
    profileLength * 0.42,
    7.2,
    2.8,
    0.34
  );
  const leftLobe = new THREE.Mesh(lobeGeometry, lobeMaterial);
  leftLobe.position.set(-profileRadius * 0.95, profileRadius * 0.15, -profileRadius * 0.08);
  leftLobe.rotation.z = 0.24;
  leftLobe.renderOrder = 6;
  leftLobe.frustumCulled = false;
  wakeRoot.add(leftLobe);
  const rightLobe = new THREE.Mesh(lobeGeometry, lobeMaterial);
  rightLobe.position.set(profileRadius * 0.95, -profileRadius * 0.15, -profileRadius * 0.08);
  rightLobe.rotation.z = -0.24;
  rightLobe.renderOrder = 6;
  rightLobe.frustumCulled = false;
  wakeRoot.add(rightLobe);
  group.visible = false;
  return {
    object: group,
    setFrame: (fallDirectionLocal, fallDirectionWorld) => {
      TEMP_FALL.copy(fallDirectionLocal);
      if (TEMP_FALL.lengthSq() < 1e-8) {
        TEMP_FALL.copy(LOCAL_FORWARD_AXIS);
      } else {
        TEMP_FALL.normalize();
      }
      supportPoint(shellSupportPoints, TEMP_FALL, TEMP_SUPPORT);
      TEMP_WAKE_UP.copy(LOCAL_UP_AXIS).addScaledVector(TEMP_FALL, -LOCAL_UP_AXIS.dot(TEMP_FALL));
      if (TEMP_WAKE_UP.lengthSq() < 1e-8) {
        TEMP_WAKE_UP.copy(LOCAL_RIGHT_AXIS).addScaledVector(TEMP_FALL, -LOCAL_RIGHT_AXIS.dot(TEMP_FALL));
      }
      if (TEMP_WAKE_UP.lengthSq() < 1e-8) {
        TEMP_WAKE_UP.copy(LOCAL_UP_AXIS);
      } else {
        TEMP_WAKE_UP.normalize();
      }
      TEMP_WAKE_RIGHT.crossVectors(TEMP_WAKE_UP, TEMP_FALL);
      if (TEMP_WAKE_RIGHT.lengthSq() < 1e-8) {
        TEMP_WAKE_RIGHT.copy(LOCAL_RIGHT_AXIS);
      } else {
        TEMP_WAKE_RIGHT.normalize();
      }
      TEMP_WAKE_UP.crossVectors(TEMP_FALL, TEMP_WAKE_RIGHT).normalize();
      TEMP_WAKE_MATRIX.makeBasis(TEMP_WAKE_RIGHT, TEMP_WAKE_UP, TEMP_FALL);
      wakeRoot.quaternion.setFromRotationMatrix(TEMP_WAKE_MATRIX);
      wakeRoot.position.copy(TEMP_SUPPORT);
      frontShellRoot.position.set(0, 0, 0);
      frontShellRoot.quaternion.identity();
      if (fallDirectionWorld.lengthSq() > 1e-8) {
        fallDirectionWorldUniform.value.copy(fallDirectionWorld).normalize();
      } else {
        fallDirectionWorldUniform.value.set(0, 0, 1);
      }
    },
    setState: (intensity, flow) => {
      const clamped = THREE.MathUtils.clamp(intensity, 0, 1);
      intensityUniform.value = clamped;
      flowUniform.value = flow;
      group.visible = clamped > 1e-3;
      const stretch = 0.88 + clamped * 0.95;
      wakeRoot.scale.set(1, 1, stretch);
      frontShellRoot.scale.setScalar(1);
    }
  };
}
export {
  createReentryPlasma
};
