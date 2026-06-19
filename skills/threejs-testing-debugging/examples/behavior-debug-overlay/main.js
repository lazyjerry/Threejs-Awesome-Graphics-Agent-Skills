import * as THREE from "three";
import { createLabRuntime } from "../lab-runtime.js";

const host = document.querySelector("#app");
const stateLabel = document.querySelector(".state");
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
host.append(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x091018);
scene.add(new THREE.GridHelper(20, 20, 0x416077, 0x20313f));

const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
camera.position.set(8, 9, 12);
camera.lookAt(0, 0, 0);

const agent = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.35, 0.8, 5, 10),
  new THREE.MeshBasicMaterial({ color: 0x70f0b1 }),
);
agent.position.y = 0.8;
scene.add(agent);

const waypoints = [
  new THREE.Vector3(-4, 0.05, -3),
  new THREE.Vector3(4, 0.05, -2),
  new THREE.Vector3(3, 0.05, 4),
  new THREE.Vector3(-3, 0.05, 3),
];
const pathGeometry = new THREE.BufferGeometry().setFromPoints([...waypoints, waypoints[0]]);
scene.add(new THREE.Line(pathGeometry, new THREE.LineBasicMaterial({ color: 0x44aaff })));

const velocityArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), agent.position, 2, 0xffd166);
const sightArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), agent.position, 4, 0xff6688);
scene.add(velocityArrow, sightArrow);

const runtime = createLabRuntime({ host, renderer, camera, scene });
let waypoint = 0;
const desired = new THREE.Vector3();
const facingTarget = new THREE.Vector3();
const sightDirection = new THREE.Vector3();
const yAxis = new THREE.Vector3(0, 1, 0);

runtime.start((time) => {
  const target = waypoints[waypoint];
  desired.copy(target).sub(agent.position);
  if (desired.length() < 0.15) waypoint = (waypoint + 1) % waypoints.length;
  desired.normalize();
  agent.position.addScaledVector(desired, 0.025);
  facingTarget.copy(agent.position).add(desired);
  agent.lookAt(facingTarget);
  velocityArrow.position.copy(agent.position);
  velocityArrow.setDirection(desired);
  sightArrow.position.copy(agent.position);
  sightDirection.copy(desired).applyAxisAngle(yAxis, Math.sin(time) * 0.3);
  sightArrow.setDirection(sightDirection);
  stateLabel.textContent = waypoint === 0 ? "replan" : "patrol";
  renderer.render(scene, camera);
});
