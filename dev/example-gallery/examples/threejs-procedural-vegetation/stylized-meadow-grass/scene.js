import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import {
  createStylizedGrassField,
  stylizedMeadowGrassAssetPaths,
} from "/skills/threejs-procedural-vegetation/examples/stylized-meadow-grass/grass-system.js";

const GROUND_SIZE = 40;
const TREE_LAYOUT = [
  { position: [13, 0, -13], rotationY: 0.0, scale: 1.0 },
  { position: [-13, 0, -13], rotationY: 2.1, scale: 0.9 },
  { position: [-13, 0, 13], rotationY: 4.0, scale: 1.1 },
  { position: [13, 0, 13], rotationY: 1.0, scale: 0.95 },
];

function firstMeshGeometry(root) {
  let geometry = null;
  root.traverse((child) => {
    if (!geometry && child.isMesh) {
      geometry = child.geometry;
    }
  });
  return geometry;
}

function cloneRenderable(root) {
  const clone = root.clone(true);
  clone.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  return clone;
}

async function loadTexture(url, {
  colorSpace = THREE.SRGBColorSpace,
  repeat = [1, 1],
} = {}) {
  const loader = new THREE.TextureLoader();
  const texture = await loader.loadAsync(url);
  texture.colorSpace = colorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat[0], repeat[1]);
  texture.anisotropy = 8;
  return texture;
}

async function loadImageData(url) {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = url;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(image, 0, 0);
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

function sampleImageData(imageData, u, v) {
  const x = Math.min(
    imageData.width - 1,
    Math.max(0, Math.floor(u * imageData.width)),
  );
  const y = Math.min(
    imageData.height - 1,
    Math.max(0, Math.floor(v * imageData.height)),
  );
  return imageData.data[(y * imageData.width + x) * 4] / 255;
}

function createImagePathSampler(imageData) {
  return (x, z) => sampleImageData(
    imageData,
    x / GROUND_SIZE + 0.5,
    z / GROUND_SIZE + 0.5,
  );
}

function createGroundMaterial({ grassMap, dirtMap, normalMap, roughnessMap, pathMap }) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uGrassMap: { value: grassMap },
      uDirtMap: { value: dirtMap },
      uNormalMap: { value: normalMap },
      uRoughnessMap: { value: roughnessMap },
      uPathMap: { value: pathMap },
      uPathDepth: { value: 0.25 },
      uDirtBump: { value: 0.15 },
    },
    vertexShader: `
      varying vec2 vWorldXZ;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorldXZ = world.xz;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform sampler2D uGrassMap;
      uniform sampler2D uDirtMap;
      uniform sampler2D uNormalMap;
      uniform sampler2D uRoughnessMap;
      uniform sampler2D uPathMap;
      varying vec2 vWorldXZ;

      void main() {
        vec2 fieldUv = vWorldXZ / ${GROUND_SIZE.toFixed(1)} + 0.5;
        vec2 tileUv = fieldUv * 8.0;
        float path = texture2D(uPathMap, fieldUv).r;
        float edge = smoothstep(0.28, 0.82, path);
        vec3 grass = texture2D(uGrassMap, tileUv).rgb;
        vec3 dirt = texture2D(uDirtMap, tileUv).rgb;
        float shade = texture2D(uRoughnessMap, tileUv).r * 0.16 +
          texture2D(uNormalMap, tileUv).g * 0.08;
        vec3 color = mix(grass, dirt * 1.08, edge) * (0.92 + shade);
        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
}

function addSky(scene, texture) {
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide,
    fog: false,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(280, 48, 24), material);
  scene.add(sky);
  return sky;
}

function createSoftShadowMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uShadow0: { value: new THREE.Vector4(1.8, 10.2, 11.5, 6.4) },
      uShadow1: { value: new THREE.Vector4(8.2, 8.4, 7.2, 5.2) },
      uShadow2: { value: new THREE.Vector4(-4.8, 8.0, 5.2, 4.8) },
    },
    vertexShader: `
      varying vec2 vWorldXZ;

      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorldXZ = world.xz;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform vec4 uShadow0;
      uniform vec4 uShadow1;
      uniform vec4 uShadow2;
      varying vec2 vWorldXZ;

      float ellipseShadow(vec2 position, vec4 shadow) {
        vec2 d = (position - shadow.xy) / max(shadow.zw, vec2(0.001));
        return smoothstep(1.0, 0.12, dot(d, d));
      }

      void main() {
        float shadow =
          max(ellipseShadow(vWorldXZ, uShadow0),
          max(ellipseShadow(vWorldXZ, uShadow1), ellipseShadow(vWorldXZ, uShadow2)));
        gl_FragColor = vec4(0.08, 0.13, 0.035, shadow * 0.26);
      }
    `,
  });
}

function addTrees(scene, { trunkScene, leavesScene, leavesAlpha }) {
  const leafMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a6b27,
    alphaMap: leavesAlpha,
    alphaTest: 0.1,
    side: THREE.DoubleSide,
    roughness: 0.8,
  });
  leavesAlpha.colorSpace = THREE.NoColorSpace;
  leavesAlpha.flipY = false;
  leavesAlpha.needsUpdate = true;

  const placed = [];
  for (const item of TREE_LAYOUT) {
    const group = new THREE.Group();
    group.position.fromArray(item.position);
    group.rotation.y = item.rotationY;
    group.scale.setScalar(item.scale);

    const trunk = cloneRenderable(trunkScene);
    trunk.scale.setScalar(12);
    group.add(trunk);

    const bushSpecs = [
      [-0.47, 7.59, 0.48, 0.0, 0.85],
      [-3.87, 6.79, -4.47, 1.3, 0.76],
      [-2.08, 10.5, 0.18, 2.5, 0.9],
    ];
    for (const [x, y, z, yaw, scale] of bushSpecs) {
      const bush = cloneRenderable(leavesScene);
      bush.traverse((child) => {
        if (child.isMesh) child.material = leafMaterial;
      });
      bush.position.set(x, y, z);
      bush.rotation.y = yaw;
      bush.scale.setScalar(scale);
      group.add(bush);
    }

    scene.add(group);
    placed.push(group);
  }
  return { placed, leafMaterial };
}

export default {
  initialTime: 9.5,
  renderer: {
    options: { antialias: true },
    toneMapping: 6,
    exposure: 1,
    clearColor: 0x8ab7ed,
  },
  camera: {
    fov: 50,
    near: 0.1,
    far: 800,
    position: [1.98, 4.46, 22.31],
  },
  controls: {
    target: [0, 0, 0],
    minDistance: 3,
    maxDistance: 70,
    maxPolarAngle: Math.PI * 0.49,
    enablePan: true,
  },
  async setup({ scene, resolveAsset }) {
    scene.fog = new THREE.FogExp2(0xd9e0d7, 0.0075);
    scene.add(new THREE.HemisphereLight(0xdbe9ff, 0x40552a, 1.15));
    const sun = new THREE.DirectionalLight(0xfff1cf, 3.0);
    sun.position.set(18, 16, 10);
    sun.castShadow = true;
    scene.add(sun);

    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/node_modules/three/examples/jsm/libs/draco/gltf/");
    loader.setDRACOLoader(dracoLoader);
    const [
      bladeGltf,
      trunkGltf,
      leavesGltf,
      grassMap,
      dirtMap,
      normalMap,
      roughnessMap,
      pathTexture,
      pathData,
      skyTexture,
      leavesAlpha,
    ] = await Promise.all([
      loader.loadAsync(stylizedMeadowGrassAssetPaths.blades),
      loader.loadAsync(resolveAsset("assets/tree-tronk-transformed.glb")),
      loader.loadAsync(resolveAsset("assets/tree-leaves-mesh.glb")),
      loadTexture(resolveAsset("assets/grass_texture/grass_05_basecolor_1k.webp"), { repeat: [8, 8] })
        .catch(() => loadTexture(resolveAsset("assets/ground_texture/ground_07_4k/ground_07__basecolor_1k.webp"), { repeat: [8, 8] })),
      loadTexture(resolveAsset("assets/ground_texture/ground_07_4k/ground_07__basecolor_1k.webp"), { repeat: [8, 8] }),
      loadTexture(resolveAsset("assets/ground_texture/ground_07_4k/ground_07__normal_gl_1k.webp"), {
        colorSpace: THREE.NoColorSpace,
        repeat: [8, 8],
      }),
      loadTexture(resolveAsset("assets/ground_texture/ground_07_4k/ground_07__roughness_1k.webp"), {
        colorSpace: THREE.NoColorSpace,
        repeat: [8, 8],
      }),
      loadTexture(stylizedMeadowGrassAssetPaths.pathMask, { colorSpace: THREE.NoColorSpace }),
      loadImageData(stylizedMeadowGrassAssetPaths.pathMask),
      loadTexture(resolveAsset("assets/skybox/sky_88_2k.png")),
      loadTexture(resolveAsset("assets/leaves-alpha-map.png"), { colorSpace: THREE.NoColorSpace }),
    ]);

    const groundMaterial = createGroundMaterial({
      grassMap,
      dirtMap,
      normalMap,
      roughnessMap,
      pathMap: pathTexture,
    });
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE, 256, 256),
      groundMaterial,
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const sky = addSky(scene, skyTexture);
    const trees = addTrees(scene, {
      trunkScene: trunkGltf.scene,
      leavesScene: leavesGltf.scene,
      leavesAlpha,
    });

    const grassGeometry = firstMeshGeometry(bladeGltf.scene);
    const grass = createStylizedGrassField({
      count: 5000,
      area: GROUND_SIZE,
      seed: 815,
      bladeGeometry: grassGeometry,
      scale: 1.3,
      pathSampler: createImagePathSampler(pathData),
      sunDirection: sun.position.clone().normalize(),
      groundColorMap: grassMap,
    });
    grass.material.uniforms.uShadowStrength.value = 0.34;
    grass.material.uniforms.uShadow0.value.set(1.8, 10.2, 11.5, 6.4);
    grass.material.uniforms.uShadow1.value.set(8.2, 8.4, 7.2, 5.2);
    grass.material.uniforms.uShadow2.value.set(-4.8, 8.0, 5.2, 4.8);
    scene.add(grass.object);

    const softShadowMaterial = createSoftShadowMaterial();
    const softShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE, 1, 1),
      softShadowMaterial,
    );
    softShadow.rotation.x = -Math.PI / 2;
    softShadow.position.y = 0.018;
    softShadow.renderOrder = 2;
    scene.add(softShadow);

    return {
      setDebugMode(mode) {
        grass.setDebugMode(mode);
      },
      update({ elapsed }) {
        grass.update({ elapsed });
      },
      metrics() {
        return {
          blades: "5000",
          assets: "GLB blades, image path mask",
        };
      },
      dispose() {
        grass.dispose();
        ground.geometry.dispose();
        groundMaterial.dispose();
        softShadow.geometry.dispose();
        softShadowMaterial.dispose();
        sky.geometry.dispose();
        sky.material.dispose();
        trees.leafMaterial.dispose();
        for (const group of trees.placed) scene.remove(group);
        for (const texture of [
          grassMap,
          dirtMap,
          normalMap,
          roughnessMap,
          pathTexture,
          skyTexture,
          leavesAlpha,
        ]) {
          texture.dispose();
        }
        dracoLoader.dispose();
      },
    };
  },
};
