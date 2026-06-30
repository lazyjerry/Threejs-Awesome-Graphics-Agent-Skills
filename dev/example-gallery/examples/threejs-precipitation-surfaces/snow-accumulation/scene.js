import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import {
  createFrozenLake,
  createLakeUniforms,
  createSharedWeatherUniforms,
  createSnow,
  createSnowyGroundMaterial,
  snowDebugModes,
} from "/skills/threejs-precipitation-surfaces/examples/snow-accumulation/snow-system.js";

async function loadAsphaltTextures(resolveAsset, renderer) {
  const loader = new THREE.TextureLoader();
  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
  const make = async (name, srgb = false) => {
    const texture = await loader.loadAsync(resolveAsset(`assets/asphalt/${name}`));
    if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    texture.anisotropy = maxAnisotropy;
    return texture;
  };
  return {
    map: await make("Asphalt025C_1K-JPG_Color.jpg", true),
    aoMap: await make("Asphalt025C_1K-JPG_AmbientOcclusion.jpg"),
    roughnessMap: await make("Asphalt025C_1K-JPG_Roughness.jpg"),
    normalMap: await make("Asphalt025C_1K-JPG_NormalGL.jpg"),
    displacementMap: await make("Asphalt025C_1K-JPG_Displacement.jpg"),
  };
}

export default {
  initialTime: 12.0,
  renderer: {
    options: { antialias: true },
    toneMapping: 7,
    exposure: 0.5,
    clearColor: 0x0a0e16,
  },
  camera: {
    fov: 18,
    near: 0.1,
    far: 500,
    position: [6, 20, 32],
  },
  controls: {
    target: [0, 0, 0],
    minDistance: 2,
    maxDistance: 70,
    maxPolarAngle: Math.PI * 0.495,
    enablePan: true,
  },
  async setup({ renderer, scene, camera, resolveAsset }) {
    scene.background = new THREE.Color(0x0a0e16);
    scene.fog = new THREE.FogExp2(0x0a0e16, 0.007);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.35;

    const keyLight = new THREE.DirectionalLight(0xfff1dd, 3.0);
    keyLight.position.set(8, 12, 6);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x4a6cff, 0.6);
    fillLight.position.set(-9, 5, -4);
    scene.add(fillLight);

    const rimLight = new THREE.SpotLight(0xffd9a0, 120, 50, Math.PI * 0.25, 0.4, 1.2);
    rimLight.position.set(-6, 8, -10);
    rimLight.target.position.set(0, 0, 0);
    scene.add(rimLight, rimLight.target);
    scene.add(new THREE.AmbientLight(0x223044, 0.4));

    const shared = createSharedWeatherUniforms({
      wind: new THREE.Vector3(1.2, 0, 0.5),
    });
    const lakeUniforms = createLakeUniforms();
    const maps = await loadAsphaltTextures(resolveAsset, renderer);
    const groundMaterial = createSnowyGroundMaterial({
      maps,
      sharedUniforms: shared,
      lakeUniforms,
    });
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20, 256, 256),
      groundMaterial,
    );
    ground.geometry.setAttribute("uv1", ground.geometry.attributes.uv);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const snow = createSnow({ camera, sharedUniforms: shared, maxCount: 30000 });
    scene.add(snow.mesh);

    const lake = createFrozenLake({
      lakeUniforms,
      sharedUniforms: shared,
      sunDir: keyLight.position,
      sunColor: keyLight.color,
    });
    scene.add(lake.mesh);

    let debugMode = "final";

    return {
      setDebugMode(mode) {
        debugMode = mode;
        groundMaterial.userData.snowUniforms.uDebugMode.value =
          snowDebugModes.get(mode) ?? 0;
        snow.setDebugMode(mode);
        lakeUniforms.uLakeEnabled.value = mode === "lake" ? 1 : 0;
        lake.applyShape();
      },
      update({ delta, elapsed }) {
        shared.uTime.value = elapsed;
        snow.update();
        lake.update(camera.position);
        if (debugMode !== "lake" && lakeUniforms.uLakeEnabled.value !== 0) {
          lakeUniforms.uLakeEnabled.value = 0;
          lake.applyShape();
        }
      },
      metrics() {
        return {
          flakes: String(snow.mesh.geometry.instanceCount),
          snowCoverage: groundMaterial.userData.snowUniforms.uSnowCoverage.value.toFixed(2),
        };
      },
      dispose() {
        snow.dispose();
        lake.dispose();
        ground.geometry.dispose();
        groundMaterial.dispose();
        for (const texture of Object.values(maps)) texture.dispose();
        env.dispose();
        pmrem.dispose();
      },
    };
  },
};
