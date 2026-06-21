import { WeatherVolumeCloudEffect } from
  "/skills/threejs-volumetric-clouds/examples/weather-volume-clouds/cloud-effect.js";

export default {
  initialTime: 17.2,
  renderer: {
    options: { antialias: false },
    exposure: 1,
    clearColor: 0x7289a7,
  },
  camera: {
    fov: 47,
    near: 0.1,
    far: 900,
    position: [0, 3, 18],
  },
  controls: {
    target: [0, 5.2, -42],
    minDistance: 24,
    maxDistance: 90,
    maxPolarAngle: Math.PI * 0.58,
    enablePan: true,
  },

  setup({ renderer, camera }) {
    const effect = new WeatherVolumeCloudEffect(renderer, camera);
    return {
      resize({ bufferWidth, bufferHeight }) {
        effect.resize(bufferWidth, bufferHeight);
      },
      setDebugMode(mode) {
        effect.setDebugMode(mode);
      },
      update({ elapsed }) {
        effect.update(elapsed);
      },
      render() {
        effect.render();
      },
      metrics() {
        return effect.metrics();
      },
      dispose() {
        effect.dispose();
      },
    };
  },
};
