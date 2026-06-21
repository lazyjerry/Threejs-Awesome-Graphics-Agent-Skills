import { bloom } from "three/addons/tsl/display/BloomNode.js";
import { pass } from "three/tsl";
import { createReentryPlasma } from
  "/skills/threejs-procedural-vfx/examples/reentry-plasma/reentry-plasma.js";
import { loadStarship } from "./load-starship.js";

export default {
  backend: "webgpu",
  initialTime: 4.3,
  renderer: {
    options: { antialias: true },
    exposure: 1,
    clearColor: 0x010207,
  },
  camera: {
    fov: 46,
    near: 0.1,
    far: 400,
    position: [24, 10, 34],
  },
  controls: {
    target: [0, 0, 0],
    minDistance: 18,
    maxDistance: 90,
    enablePan: true,
  },

  async setup({ THREE, renderer, scene, camera }) {
    const starship = await loadStarship(
      "/source_materials/visual-baselines/assets/starship.glb",
    );
    const ship = starship.object;
    const shipRoot = new THREE.Group();
    shipRoot.rotation.set(-0.32, -0.9, -0.58);
    shipRoot.add(ship);
    scene.add(shipRoot);

    const plasma = createReentryPlasma(starship.length, ship);
    shipRoot.add(plasma.object);

    const localFall = new THREE.Vector3(0.16, -0.08, 1).normalize();
    const worldFall = localFall.clone().applyQuaternion(shipRoot.quaternion);
    plasma.setFrame(localFall, worldFall);
    plasma.setState(1, 28);

    const starGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(3600 * 3);
    let state = 0x1977ca1;
    const random = () => {
      state = Math.imul(state ^ (state >>> 15), 1 | state);
      state ^= state + Math.imul(state ^ (state >>> 7), 61 | state);
      return ((state ^ (state >>> 14)) >>> 0) / 4294967296;
    };
    for (let index = 0; index < positions.length; index += 3) {
      const direction = new THREE.Vector3(
        random() * 2 - 1,
        random() * 2 - 1,
        random() * 2 - 1,
      ).normalize().multiplyScalar(120 + random() * 80);
      positions[index] = direction.x;
      positions[index + 1] = direction.y;
      positions[index + 2] = direction.z;
    }
    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    const stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({
        color: 0xc8e3ff,
        size: 0.12,
        sizeAttenuation: true,
        toneMapped: false,
      }),
    );
    scene.add(stars);

    scene.add(new THREE.HemisphereLight(0x9ebcff, 0x090812, 0.5));
    const rim = new THREE.DirectionalLight(0x9cb8ff, 2.5);
    rim.position.set(-14, 20, 18);
    scene.add(rim);

    const scenePass = pass(scene, camera);
    const sceneColor = scenePass.getTextureNode("output");
    const bloomPass = bloom(sceneColor);
    bloomPass.threshold.value = 0.92;
    bloomPass.strength.value = 0.42;
    bloomPass.radius.value = 0.52;
    const post = new THREE.RenderPipeline(renderer);
    post.outputNode = sceneColor.add(bloomPass);

    return {
      update({ elapsed }) {
        plasma.setFrame(localFall, worldFall);
        plasma.setState(1, elapsed * 6.5);
      },
      render() {
        post.render();
      },
      metrics() {
        return { tier: "source plasma / WebGPU TSL / bloom" };
      },
      dispose() {
        starGeometry.dispose();
      },
    };
  },
};
