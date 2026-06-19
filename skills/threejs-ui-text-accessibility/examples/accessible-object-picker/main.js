import * as THREE from "three";
import { createLabRuntime } from "../lab-runtime.js";

const host = document.querySelector("#app");
const output = document.querySelector("#selection");
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
host.append(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111827);
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(0, 2.5, 8);
camera.lookAt(0, 0, 0);

const objects = new Map();
const definitions = [
  ["red", new THREE.BoxGeometry(1.4, 1.4, 1.4), 0xef4444, -2],
  ["green", new THREE.SphereGeometry(0.85, 28, 18), 0x22c55e, 0],
  ["blue", new THREE.ConeGeometry(0.9, 1.8, 24), 0x3b82f6, 2],
];
for (const [id, geometry, color, x] of definitions) {
  const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color }));
  mesh.position.x = x;
  mesh.userData.id = id;
  scene.add(mesh);
  objects.set(id, mesh);
}

const runtime = createLabRuntime({ host, renderer, camera, scene });
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let selected = null;

function select(id) {
  selected = id;
  for (const [key, mesh] of objects) mesh.scale.setScalar(key === id ? 1.2 : 1);
  for (const button of document.querySelectorAll("button[data-id]")) {
    button.setAttribute("aria-pressed", String(button.dataset.id === id));
  }
  output.textContent = id ? `${id[0].toUpperCase()}${id.slice(1)} object selected.` : "Nothing selected.";
}

for (const button of document.querySelectorAll("button[data-id]")) {
  runtime.listen(button, "click", () => select(button.dataset.id));
}
runtime.listen(renderer.domElement, "pointerdown", (event) => {
  const bounds = renderer.domElement.getBoundingClientRect();
  pointer.set(
    ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
    -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
  );
  raycaster.setFromCamera(pointer, camera);
  select(raycaster.intersectObjects([...objects.values()])[0]?.object.userData.id ?? null);
});

runtime.start((time) => {
  for (const mesh of objects.values()) mesh.rotation.y = time * 0.35;
  renderer.render(scene, camera);
});
