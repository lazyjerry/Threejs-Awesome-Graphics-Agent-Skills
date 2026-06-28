import * as THREE from "three";
import {
  InteractiveWaterHeightfield,
  createCausticLightMaterial,
  createInteractiveWaterSurfaceMaterial,
  createInteractiveWaterSurfaceMesh,
  poolWaterDebugModes,
} from "/skills/threejs-water-optics/examples/interactive-pool-volume/water-volume-system.js";

async function createTileTexture(url) {
  const texture = await new THREE.TextureLoader().loadAsync(url);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.6, 2.6);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function addPoolShell(scene, tileMaterial, width, depth, poolDepth) {
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.08, depth),
    tileMaterial,
  );
  floor.position.y = -poolDepth;
  scene.add(floor);

  const wallSpecs = [
    [0, -poolDepth * 0.5, -depth * 0.5, width, poolDepth, 0.12],
    [0, -poolDepth * 0.5, depth * 0.5, width, poolDepth, 0.12],
    [-width * 0.5, -poolDepth * 0.5, 0, 0.12, poolDepth, depth],
    [width * 0.5, -poolDepth * 0.5, 0, 0.12, poolDepth, depth],
  ];
  for (const [x, y, z, sx, sy, sz] of wallSpecs) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), tileMaterial);
    wall.position.set(x, y, z);
    scene.add(wall);
  }

  const rimMaterial = new THREE.MeshStandardMaterial({
    color: 0xd6d2c8,
    roughness: 0.72,
  });
  const rimSpecs = [
    [0, 0.06, -depth * 0.5 - 0.22, width + 0.56, 0.18, 0.36],
    [0, 0.06, depth * 0.5 + 0.22, width + 0.56, 0.18, 0.36],
    [-width * 0.5 - 0.22, 0.06, 0, 0.36, 0.18, depth + 0.56],
    [width * 0.5 + 0.22, 0.06, 0, 0.36, 0.18, depth + 0.56],
  ];
  for (const [x, y, z, sx, sy, sz] of rimSpecs) {
    const rim = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), rimMaterial);
    rim.position.set(x, y, z);
    scene.add(rim);
  }

  return { floor, rimMaterial };
}

export default {
  initialTime: 5.8,
  renderer: {
    options: { antialias: true },
    toneMapping: 6,
    exposure: 1.05,
    clearColor: 0x06111d,
  },
  camera: {
    fov: 44,
    near: 0.05,
    far: 80,
    position: [5.1, 3.15, 6.9],
  },
  controls: {
    target: [0, -0.55, 0],
    minDistance: 4,
    maxDistance: 16,
    maxPolarAngle: Math.PI * 0.49,
    enablePan: true,
  },
  async setup({ renderer, scene, camera, canvas, controls, resolveAsset }) {
    const width = 7.2;
    const depth = 7.2;
    const poolDepth = 1.35;
    scene.background = new THREE.Color(0x06111d);
    scene.fog = new THREE.FogExp2(0x153247, 0.055);
    scene.add(new THREE.HemisphereLight(0xdceeff, 0x183b48, 1.7));
    const sun = new THREE.DirectionalLight(0xfff2c4, 2.6);
    sun.position.set(-5, 8, 4);
    scene.add(sun);

    const tileTexture = await createTileTexture(resolveAsset("assets/tiles.jpg"));
    const tileMaterial = new THREE.MeshStandardMaterial({
      color: 0xb7eff7,
      map: tileTexture,
      roughness: 0.82,
      metalness: 0,
    });
    addPoolShell(scene, tileMaterial, width, depth, poolDepth);

    const simulation = new InteractiveWaterHeightfield(renderer, {
      resolution: 256,
      damping: 0.995,
      waveSpeed: 2.0,
    });

    const sceneTarget = new THREE.WebGLRenderTarget(1, 1, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: true,
    });
    const waterMaterial = createInteractiveWaterSurfaceMaterial({
      waterTexture: simulation.texture,
      sceneColor: sceneTarget.texture,
      width,
      depth,
      heightScale: 0.62,
      sunDirection: sun.position.clone().normalize(),
    });
    const water = createInteractiveWaterSurfaceMesh({
      width,
      depth,
      segments: 180,
      material: waterMaterial,
    });
    water.renderOrder = 4;
    scene.add(water);

    const causticMaterial = createCausticLightMaterial({
      waterTexture: simulation.texture,
      texelSize: new THREE.Vector2(1 / 256, 1 / 256),
    });
    const caustics = new THREE.Mesh(
      new THREE.PlaneGeometry(width, depth, 1, 1),
      causticMaterial,
    );
    caustics.rotation.x = -Math.PI / 2;
    caustics.position.y = -poolDepth + 0.045;
    caustics.renderOrder = 3;
    scene.add(caustics);

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.62, 48, 32),
      new THREE.MeshStandardMaterial({
        color: 0x7fd4ee,
        roughness: 0.28,
        metalness: 0.0,
      }),
    );
    sphere.position.set(-0.6, -0.55, 0.35);
    scene.add(sphere);

    const inactiveSphere = sphere.position.clone();
    inactiveSphere.y = poolDepth + 1.6;
    simulation.moveSphere(inactiveSphere, sphere.position, 0.62, {
      width,
      depth,
      displacementScale: 0.35,
    });
    for (let index = 0; index < 96; index += 1) {
      simulation.stepSimulation();
    }
    simulation.updateNormals();

    let previousSphere = sphere.position.clone();
    let debugMode = "final";
    let userControlledSphere = true;
    let draggingSphere = false;
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const dragPlane = new THREE.Plane();
    const dragHit = new THREE.Vector3();
    const dragOffset = new THREE.Vector3();

    function setPointer(event) {
      const rect = canvas.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
    }

    function clampSphere() {
      const inset = 0.84;
      sphere.position.x = THREE.MathUtils.clamp(
        sphere.position.x,
        -width * 0.5 + inset,
        width * 0.5 - inset,
      );
      sphere.position.z = THREE.MathUtils.clamp(
        sphere.position.z,
        -depth * 0.5 + inset,
        depth * 0.5 - inset,
      );
      sphere.position.y = THREE.MathUtils.clamp(
        sphere.position.y,
        -poolDepth + 0.52,
        0.48,
      );
    }

    function onPointerDown(event) {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      setPointer(event);
      const hit = raycaster.intersectObject(sphere, false)[0];
      if (!hit) return;
      event.preventDefault();
      userControlledSphere = true;
      draggingSphere = true;
      canvas.setPointerCapture(event.pointerId);
      if (controls) controls.enabled = false;
      const normal = new THREE.Vector3(0, 0, -1)
        .applyQuaternion(camera.quaternion)
        .normalize();
      dragPlane.setFromNormalAndCoplanarPoint(normal, sphere.position);
      dragOffset.copy(sphere.position).sub(hit.point);
    }

    function onPointerMove(event) {
      if (!draggingSphere) return;
      event.preventDefault();
      setPointer(event);
      if (raycaster.ray.intersectPlane(dragPlane, dragHit)) {
        sphere.position.copy(dragHit).add(dragOffset);
        clampSphere();
      }
    }

    function stopDrag(event) {
      if (!draggingSphere) return;
      draggingSphere = false;
      if (controls) controls.enabled = true;
      if (event?.pointerId != null && canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
    }

    canvas.style.touchAction = "none";
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", stopDrag);
    canvas.addEventListener("pointercancel", stopDrag);

    return {
      resize({ bufferWidth, bufferHeight }) {
        sceneTarget.setSize(bufferWidth, bufferHeight);
        waterMaterial.uniforms.uResolution.value.set(
          bufferWidth,
          bufferHeight,
        );
      },
      setDebugMode(mode) {
        debugMode = mode;
        const debugValue = poolWaterDebugModes.get(mode) ?? 0;
        waterMaterial.uniforms.uDebugMode.value = debugValue;
        causticMaterial.uniforms.uDebugMode.value = debugValue;
      },
      update({ elapsed, delta }) {
        if (!userControlledSphere) {
          sphere.position.set(
            Math.sin(elapsed * 0.72) * 1.25,
            -0.12 + Math.sin(elapsed * 1.15) * 0.18,
            Math.cos(elapsed * 0.58) * 1.05,
          );
        }
        if (delta > 0) {
          simulation.moveSphere(previousSphere, sphere.position, 0.62, {
            width,
            depth,
            displacementScale: 0.35,
          });
          simulation.stepSimulation(3);
          simulation.updateNormals();
        }
        previousSphere.copy(sphere.position);
        waterMaterial.uniforms.uWater.value = simulation.texture;
        causticMaterial.uniforms.uWater.value = simulation.texture;
        waterMaterial.uniforms.uDebugMode.value =
          poolWaterDebugModes.get(debugMode) ?? 0;
        causticMaterial.uniforms.uDebugMode.value =
          poolWaterDebugModes.get(debugMode) ?? 0;
      },
      render() {
        water.visible = false;
        renderer.setRenderTarget(sceneTarget);
        renderer.render(scene, camera);
        renderer.setRenderTarget(null);
        water.visible = true;
        renderer.render(scene, camera);
      },
      metrics() {
        return {
          state: "256² RGBA height/velocity/normal",
          simulationSteps: "3/frame",
        };
      },
      dispose() {
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerup", stopDrag);
        canvas.removeEventListener("pointercancel", stopDrag);
        simulation.dispose();
        sceneTarget.dispose();
        water.geometry.dispose();
        waterMaterial.dispose();
        caustics.geometry.dispose();
        causticMaterial.dispose();
        sphere.geometry.dispose();
        sphere.material.dispose();
        tileTexture.dispose();
        tileMaterial.dispose();
      },
    };
  },
};
