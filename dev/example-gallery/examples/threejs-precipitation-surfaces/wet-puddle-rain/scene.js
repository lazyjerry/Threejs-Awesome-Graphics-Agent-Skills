import * as THREE from "three";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import {
  createPuddleMaterial,
  createRainDrops,
  createSplashSystem,
  createThunderLight,
  loadWetPuddleRainTextures,
  rainPuddleDebugModes,
  wetPuddleRainAssetPaths,
} from "/skills/threejs-precipitation-surfaces/examples/wet-puddle-rain/rain-puddle-system.js";

async function loadTrashMaterial(resolveAsset) {
  const loader = new THREE.TextureLoader();
  const load = async (name, srgb = false) => {
    const texture = await loader.loadAsync(resolveAsset(`assets/trash/${name}`));
    if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  };
  const maps = {
    map: await load("shmpulh_4K_Albedo.jpg", true),
    alphaMap: await load("shmpulh_4K_Opacity.jpg"),
    normalMap: await load("shmpulh_4K_Normal.jpg"),
    roughnessMap: await load("shmpulh_4K_Roughness.jpg"),
    aoMap: await load("shmpulh_4K_AO.jpg"),
  };
  const material = new THREE.MeshStandardMaterial({
    ...maps,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    depthWrite: false,
    transparent: true,
    blending: THREE.AdditiveBlending,
  });
  material.userData.maps = maps;
  return material;
}

export default {
  initialTime: 4.85,
  renderer: {
    options: { antialias: false },
    toneMapping: 7,
    exposure: 1.0,
    clearColor: 0x050508,
  },
  camera: {
    fov: 50,
    near: 0.01,
    far: 60,
    position: [0.713725247365501, 0.3394033648663526, 0.32126638003592926],
  },
  controls: {
    target: [0, 0, 0],
    minDistance: 0.25,
    maxDistance: 4,
    maxPolarAngle: Math.PI * 0.49,
    enablePan: true,
  },
  async setup({ renderer, scene, camera, resolveAsset }) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const hdr = await new RGBELoader().loadAsync(
      resolveAsset("assets/cyberpunk.hdr"),
    );
    hdr.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = hdr;
    scene.background = hdr;

    const thunder = createThunderLight();
    scene.add(thunder.mesh);

    const rainProgress = { value: 0 };
    const maps = await loadWetPuddleRainTextures({
      paths: wetPuddleRainAssetPaths.road,
      anisotropy: renderer.capabilities.getMaxAnisotropy(),
    });
    const puddleMaterial = createPuddleMaterial({ maps, rainProgress });

    const floorGroup = new THREE.Group();
    floorGroup.rotation.x = -Math.PI / 2;
    scene.add(floorGroup);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), puddleMaterial);
    floor.geometry.setAttribute("uv1", floor.geometry.attributes.uv);
    floorGroup.add(floor);

    const trashMaterial = await loadTrashMaterial(resolveAsset);
    const trash = new THREE.Mesh(new THREE.CircleGeometry(0.5, 96), trashMaterial);
    trash.rotation.z = THREE.MathUtils.degToRad(30);
    trash.position.z = 0.002;
    trash.renderOrder = 1;
    floorGroup.add(trash);

    floorGroup.updateMatrixWorld(true);

    const drops = createRainDrops({
      count: 1000,
      rainProgress,
    });
    scene.add(drops.mesh);

    const splashTexture = await new THREE.TextureLoader().loadAsync(
      wetPuddleRainAssetPaths.splashFlipbook,
    );
    splashTexture.colorSpace = THREE.SRGBColorSpace;
    const splashes = await createSplashSystem({
      targetGroup: floorGroup,
      texture: splashTexture,
      count: 1000,
      rainProgress,
    });
    scene.add(splashes.mesh);

    let debugMode = "final";

    return {
      setDebugMode(mode) {
        debugMode = mode;
        const value = rainPuddleDebugModes.get(mode) ?? 0;
        puddleMaterial.userData.rainUniforms.uDebugMode.value = value;
        drops.setDebugMode(mode);
        splashes.setDebugMode(mode);
      },
      update({ delta, elapsed }) {
        rainProgress.value = Math.min(1, elapsed / 5);
        puddleMaterial.userData.rainUniforms.uTime.value += delta;
        drops.update({ camera, delta });
        splashes.update({ camera, delta });
        thunder.update({ elapsed, active: rainProgress.value > 0.98 && debugMode === "final" });
      },
      metrics() {
        return {
          rain: rainProgress.value.toFixed(2),
          drops: "1000",
          splashes: "1000",
        };
      },
      dispose() {
        drops.dispose();
        splashes.dispose();
        thunder.dispose();
        floor.geometry.dispose();
        puddleMaterial.dispose();
        trash.geometry.dispose();
        trashMaterial.dispose();
        splashTexture.dispose();
        for (const texture of Object.values(maps)) texture.dispose();
        for (const texture of Object.values(trashMaterial.userData.maps)) {
          texture.dispose();
        }
        hdr.dispose();
        pmrem.dispose();
      },
    };
  },
};
