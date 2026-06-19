import * as THREE from "three";
import { createLabRuntime } from "../lab-runtime.js";

const host = document.querySelector("#app");
const enable = document.querySelector("#enable");
const play = document.querySelector("#play");
const volume = document.querySelector("#volume");
const status = document.querySelector(".status");
const renderer = new THREE.WebGLRenderer({ antialias: true });
host.append(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x120f1b);
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.z = 5;
const listener = new THREE.AudioListener();
camera.add(listener);

const orb = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.1, 3),
  new THREE.MeshBasicMaterial({ color: 0xa78bfa, wireframe: true }),
);
scene.add(orb);

const runtime = createLabRuntime({ host, renderer, camera, scene });
const context = listener.context;
const effectsGain = context.createGain();
effectsGain.gain.value = Number(volume.value);
effectsGain.connect(listener.getInput());
const restingScale = new THREE.Vector3(1, 1, 1);

runtime.listen(enable, "click", async () => {
  await context.resume();
  play.disabled = context.state !== "running";
  status.textContent = context.state === "running" ? "Audio enabled." : "Audio still unavailable.";
});
runtime.listen(volume, "input", () => {
  effectsGain.gain.setTargetAtTime(Number(volume.value), context.currentTime, 0.015);
});
runtime.listen(play, "click", () => {
  const oscillator = context.createOscillator();
  const envelope = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(440, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(720, context.currentTime + 0.12);
  envelope.gain.setValueAtTime(0.0001, context.currentTime);
  envelope.gain.exponentialRampToValueAtTime(0.5, context.currentTime + 0.01);
  envelope.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18);
  oscillator.connect(envelope).connect(effectsGain);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.2);
  status.textContent = "Feedback cue played with visual pulse.";
  orb.scale.setScalar(1.3);
});
runtime.listen(document, "visibilitychange", () => {
  if (document.hidden && context.state === "running") {
    context.suspend();
    status.textContent = "Audio paused while hidden; enable it again to resume.";
  }
});
runtime.listen(window, "pagehide", () => {
  effectsGain.disconnect();
  context.suspend();
}, { once: true });

runtime.start((time) => {
  orb.rotation.set(time * 0.2, time * 0.35, 0);
  orb.scale.lerp(restingScale, 0.08);
  renderer.render(scene, camera);
});
