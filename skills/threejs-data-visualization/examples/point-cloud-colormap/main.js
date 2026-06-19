import * as THREE from "three";
import { createLabRuntime } from "../lab-runtime.js";

const host = document.querySelector("#app");
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
host.append(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07111f);
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(8, 6, 11);
camera.lookAt(0, 0, 0);

let seed = 123456789;
function random() {
  seed = (1664525 * seed + 1013904223) >>> 0;
  return seed / 4294967296;
}

const count = 20_000;
const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);
const low = new THREE.Color(0x2b4fff);
const middle = new THREE.Color(0x27d7a1);
const high = new THREE.Color(0xffe45c);
const color = new THREE.Color();

for (let index = 0; index < count; index += 1) {
  const x = (random() - 0.5) * 12;
  const z = (random() - 0.5) * 12;
  const y = Math.sin(x * 0.8) * Math.cos(z * 0.7) + (random() - 0.5) * 0.15;
  positions.set([x, y, z], index * 3);
  const t = (y + 1.15) / 2.3;
  color.copy(t < 0.5 ? low : middle).lerp(t < 0.5 ? middle : high, t < 0.5 ? t * 2 : (t - 0.5) * 2);
  colors.set(color.toArray(), index * 3);
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
geometry.computeBoundingSphere();
const points = new THREE.Points(
  geometry,
  new THREE.PointsMaterial({ size: 0.045, vertexColors: true }),
);
scene.add(points);
scene.add(new THREE.AxesHelper(2));

const runtime = createLabRuntime({ host, renderer, camera, scene });
runtime.start((time) => {
  points.rotation.y = time * 0.08;
  renderer.render(scene, camera);
});
