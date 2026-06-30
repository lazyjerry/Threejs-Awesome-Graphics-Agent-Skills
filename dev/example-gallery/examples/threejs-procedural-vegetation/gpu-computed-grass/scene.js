import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import {
  createGpuComputedGrassSystem,
  createGpuGrassTerrainMaterial,
} from "/skills/threejs-procedural-vegetation/examples/gpu-computed-grass/gpu-grass-system.js";

const TERRAIN = {
  amplitude: 2.5,
  frequency: 0.1,
  seed: 0.0,
  color: "#1a3310",
};

function createSky(scene) {
  const skyGeometry = new THREE.SphereGeometry(120, 48, 24);
  const skyMaterial = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      uTop: { value: new THREE.Color(0x7aa1c7) },
      uBottom: { value: new THREE.Color(0x101823) },
    },
    vertexShader: `
      varying vec3 vWorld;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = normalize(world.xyz);
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: `
      uniform vec3 uTop;
      uniform vec3 uBottom;
      varying vec3 vWorld;
      void main() {
        float h = smoothstep(-0.2, 0.82, vWorld.y);
        gl_FragColor = vec4(mix(uBottom, uTop, h), 1.0);
      }
    `,
  });
  const sky = new THREE.Mesh(skyGeometry, skyMaterial);
  scene.add(sky);
  return sky;
}

export default {
  initialTime: 8.0,
  renderer: {
    options: { antialias: true },
    toneMapping: 7,
    exposure: 1.0,
    clearColor: 0x0a0e16,
  },
  camera: {
    fov: 45,
    near: 0.1,
    far: 120,
    position: [0, 3.7, 7.4],
  },
  controls: {
    target: [0, 1.0, 0],
    minDistance: 4,
    maxDistance: 18,
    minPolarAngle: Math.PI / 5,
    maxPolarAngle: Math.PI / 2.15,
    enablePan: true,
  },
  async setup({ renderer, scene, camera }) {
    const hemi = new THREE.HemisphereLight(0xddeeff, 0x26380f, 1.0);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff2d4, 2.0);
    sun.position.set(-8, 14, 9);
    scene.add(sun);

    const terrainMaterial = createGpuGrassTerrainMaterial(TERRAIN);
    const terrain = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20, 128, 128),
      terrainMaterial,
    );
    terrain.rotation.x = -Math.PI / 2;
    scene.add(terrain);

    const sky = createSky(scene);

    const grass = createGpuComputedGrassSystem(renderer, {
      gridSize: 256,
      patchSize: 20,
      lightDirection: sun.position.clone().multiplyScalar(-1).normalize(),
      lightColor: sun.color.clone(),
      lightIntensity: sun.intensity,
      terrain: TERRAIN,
    });
    scene.add(grass.object);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(1280, 720), 0.28, 0.28, 0.35);
    composer.addPass(bloom);

    return {
      setDebugMode(mode) {
        grass.setDebugMode(mode);
      },
      update({ elapsed }) {
        grass.update({ elapsed });
      },
      resize({ width, height, dpr }) {
        composer.setPixelRatio(dpr);
        composer.setSize(width, height);
      },
      render({ state }) {
        if (state.debugMode === "final") composer.render();
        else renderer.render(scene, camera);
      },
      metrics() {
        return {
          blades: "65536",
          compute: "3 MRT channels",
        };
      },
      dispose() {
        grass.dispose();
        composer.dispose();
        terrain.geometry.dispose();
        terrainMaterial.dispose();
        sky.geometry.dispose();
        sky.material.dispose();
      },
    };
  },
};
