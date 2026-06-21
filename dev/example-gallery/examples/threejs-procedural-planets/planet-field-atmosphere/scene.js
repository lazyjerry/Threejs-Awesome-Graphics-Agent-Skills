import { createPlanetFieldAtmosphere } from
  "/skills/threejs-procedural-planets/examples/planet-field-atmosphere/planet-system.js";

export default {
  renderer: {
    options: { antialias: true },
    exposure: 1.15,
  },
  camera: {
    fov: 42,
    near: 0.01,
    far: 100,
    position: [2.65, 1.25, 2.85],
  },
  controls: {
    target: [0, 0, 0],
    minDistance: 1.45,
    maxDistance: 6,
    enablePan: true,
  },
  setup({ scene, camera }) {
    return createPlanetFieldAtmosphere({ scene, camera });
  },
};
