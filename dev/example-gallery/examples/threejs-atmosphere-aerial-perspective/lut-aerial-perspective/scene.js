import {
  createAtmosphereAerialPerspectiveMaterial,
  setAtmosphereDebugMode,
  updateAtmosphereCamera,
} from "/skills/threejs-atmosphere-aerial-perspective/examples/lut-aerial-perspective/atmosphere-effect.js";
import {
  disposeTextures,
  loadAtmosphereTextures,
} from "/dev/example-gallery/support/texture-loaders.js";

export default {
  renderer: {
    options: { antialias: true },
    toneMapping: 0,
    exposure: 1,
    clearColor: 0x000000,
  },
  camera: {
    fov: 75,
    near: 0.01,
    far: 1000,
    position: [0, 0.55, 1.75],
  },
  controls: {
    target: [0, 0.3, 0],
    minDistance: 0.7,
    maxDistance: 8,
    maxPolarAngle: Math.PI * 0.49,
    enablePan: true,
  },

  async setup({ THREE, renderer, scene, camera, controls }) {
    const atmosphereTextures = await loadAtmosphereTextures(
      "/dev/example-gallery/assets/geospatial/atmosphere",
    );
    const sunDirection = new THREE.Vector3(-0.58, 0.66, -0.48).normalize();

    const groundY = 0;
    const minimumGroundClearance = 0.08;

    function clampCameraAboveGround() {
      const minimumY = groundY + minimumGroundClearance;
      let changed = false;

      if (controls?.target && controls.target.y < minimumY) {
        const lift = minimumY - controls.target.y;
        controls.target.y += lift;
        camera.position.y += lift;
        changed = true;
      }

      if (camera.position.y < minimumY) {
        camera.position.y = minimumY;
        changed = true;
      }

      if (changed) {
        controls?.update?.();
      }
    }

    function hash2(x, z) {
      const n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453123;
      return n - Math.floor(n);
    }

    function smoothstep(edge0, edge1, value) {
      const t = Math.min(Math.max((value - edge0) / (edge1 - edge0), 0), 1);
      return t * t * (3 - 2 * t);
    }

    function valueNoise(x, z) {
      const ix = Math.floor(x);
      const iz = Math.floor(z);
      const fx = x - ix;
      const fz = z - iz;
      const ux = fx * fx * (3 - 2 * fx);
      const uz = fz * fz * (3 - 2 * fz);
      const a = hash2(ix, iz);
      const b = hash2(ix + 1, iz);
      const c = hash2(ix, iz + 1);
      const d = hash2(ix + 1, iz + 1);
      const x1 = a + (b - a) * ux;
      const x2 = c + (d - c) * ux;
      return x1 + (x2 - x1) * uz;
    }

    function terrainHeight(x, z) {
      const low = (valueNoise(x * 0.045, z * 0.045) - 0.5) * 0.055;
      const mid = (valueNoise(x * 0.16 + 19.4, z * 0.16 - 8.2) - 0.5) * 0.018;
      const cityFlatten = 1 - smoothstep(6.0, 14.0, Math.hypot(x, z));
      return groundY + (low + mid) * (1 - cityFlatten * 0.72);
    }

    function createTerrainSurface() {
      const size = 220;
      const segments = 144;
      const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
      const positions = geometry.attributes.position;

      for (let index = 0; index < positions.count; index += 1) {
        const x = positions.getX(index);
        const z = positions.getY(index);
        positions.setZ(index, terrainHeight(x, z));
      }

      geometry.computeVertexNormals();
      geometry.rotateX(-Math.PI / 2);

      const material = new THREE.MeshStandardMaterial({
        color: 0x252d34,
        roughness: 0.92,
        metalness: 0.02,
      });
      const terrain = new THREE.Mesh(geometry, material);
      terrain.name = "Procedural city terrain surface";
      terrain.receiveShadow = true;
      return terrain;
    }

    function createRoad(width, length, position, rotationY = 0) {
      const road = new THREE.Mesh(
        new THREE.BoxGeometry(width, 0.012, length),
        roadMaterial,
      );
      road.position.set(position[0], groundY + 0.012, position[1]);
      road.rotation.y = rotationY;
      road.receiveShadow = true;
      return road;
    }

    function createLineMark(width, length, position, rotationY = 0) {
      const marker = new THREE.Mesh(
        new THREE.BoxGeometry(width, 0.004, length),
        laneMaterial,
      );
      marker.position.set(position[0], groundY + 0.021, position[1]);
      marker.rotation.y = rotationY;
      marker.receiveShadow = true;
      return marker;
    }

    function createProceduralCityTerrain() {
      const city = new THREE.Group();
      city.name = "Procedural city terrain";

      city.add(createTerrainSurface());

      const roadExtent = 22;
      const roadSpacing = 1.45;
      const roadWidth = 0.17;
      const roadCoords = [];
      for (let coord = -8.7; coord <= 8.71; coord += roadSpacing) {
        const snapped = Math.round(coord * 1000) / 1000;
        roadCoords.push(snapped);
        city.add(createRoad(roadWidth, roadExtent, [snapped, 0]));
        city.add(createRoad(roadWidth, roadExtent, [0, snapped], Math.PI / 2));
      }

      roadCoords.forEach((coord, roadIndex) => {
        if (roadIndex % 2 !== 0) return;
        for (let offset = -9.5; offset <= 9.5; offset += 0.62) {
          city.add(createLineMark(0.018, 0.22, [coord, offset]));
          city.add(createLineMark(0.018, 0.22, [offset, coord], Math.PI / 2));
        }
      });

      const plaza = new THREE.Mesh(
        new THREE.CircleGeometry(0.72, 48),
        new THREE.MeshStandardMaterial({
          color: 0x30402d,
          roughness: 0.95,
          metalness: 0,
        }),
      );
      plaza.rotation.x = -Math.PI / 2;
      plaza.position.y = groundY + 0.024;
      plaza.receiveShadow = true;
      city.add(plaza);

      const buildingMaterials = [
        new THREE.MeshStandardMaterial({ color: 0x465160, roughness: 0.72, metalness: 0.05 }),
        new THREE.MeshStandardMaterial({ color: 0x3a4655, roughness: 0.78, metalness: 0.04 }),
        new THREE.MeshStandardMaterial({ color: 0x515763, roughness: 0.68, metalness: 0.07 }),
        new THREE.MeshStandardMaterial({ color: 0x343f4c, roughness: 0.82, metalness: 0.03 }),
      ];
      const roofMaterial = new THREE.MeshStandardMaterial({
        color: 0x1d242d,
        roughness: 0.86,
        metalness: 0.04,
      });

      const blockSize = roadSpacing - roadWidth - 0.16;
      let buildingIndex = 0;

      for (let xi = 0; xi < roadCoords.length - 1; xi += 1) {
        for (let zi = 0; zi < roadCoords.length - 1; zi += 1) {
          const centerX = (roadCoords[xi] + roadCoords[xi + 1]) * 0.5;
          const centerZ = (roadCoords[zi] + roadCoords[zi + 1]) * 0.5;
          const distanceFromCenter = Math.hypot(centerX, centerZ);

          if (Math.abs(centerX) < 1.0 && Math.abs(centerZ) < 1.0) continue;
          if (hash2(xi * 4.7, zi * 3.1) < 0.18) continue;

          const lots = hash2(xi + 2.5, zi - 1.5) > 0.65 ? 2 : 1;
          for (let lot = 0; lot < lots; lot += 1) {
            const sideOffset = lots === 1 ? 0 : (lot - 0.5) * blockSize * 0.42;
            const splitAlongX = hash2(xi, zi) > 0.5;
            const jitterX = (hash2(xi * 11.3 + lot, zi * 8.9) - 0.5) * 0.16;
            const jitterZ = (hash2(xi * 5.4, zi * 12.7 + lot) - 0.5) * 0.16;
            const width = blockSize * (lots === 1 ? 0.45 + hash2(xi, zi + 8) * 0.22 : 0.34);
            const depth = blockSize * (lots === 1 ? 0.45 + hash2(xi + 7, zi) * 0.22 : 0.34);
            const downtown = 1 - smoothstep(2.0, 8.5, distanceFromCenter);
            const height = 0.08 + hash2(xi * 2.1 + lot, zi * 5.7) * 0.24 + downtown * (0.18 + hash2(xi * 9.2, zi * 6.6 + lot) * 0.58);
            const px = centerX + jitterX + (splitAlongX ? sideOffset : 0);
            const pz = centerZ + jitterZ + (splitAlongX ? 0 : sideOffset);

            const building = new THREE.Mesh(
              new THREE.BoxGeometry(width, height, depth),
              buildingMaterials[buildingIndex % buildingMaterials.length],
            );
            building.position.set(px, groundY + 0.024 + height * 0.5, pz);
            building.castShadow = true;
            building.receiveShadow = true;
            city.add(building);

            const roof = new THREE.Mesh(
              new THREE.BoxGeometry(width * 0.82, 0.018, depth * 0.82),
              roofMaterial,
            );
            roof.position.set(px, groundY + 0.042 + height, pz);
            roof.castShadow = true;
            roof.receiveShadow = true;
            city.add(roof);

            buildingIndex += 1;
          }
        }
      }

      const landmarkMaterial = new THREE.MeshStandardMaterial({
        color: 0x596778,
        roughness: 0.56,
        metalness: 0.12,
      });
      [
        [-3.15, -4.05, 0.42, 1.08, 0.42],
        [4.15, -2.95, 0.34, 0.92, 0.52],
        [-4.35, 3.35, 0.58, 0.74, 0.34],
      ].forEach(([x, z, width, height, depth]) => {
        const tower = new THREE.Mesh(
          new THREE.BoxGeometry(width, height, depth),
          landmarkMaterial,
        );
        tower.position.set(x, groundY + 0.024 + height * 0.5, z);
        tower.castShadow = true;
        tower.receiveShadow = true;
        city.add(tower);
      });

      return city;
    }

    const roadMaterial = new THREE.MeshStandardMaterial({
      color: 0x161b22,
      roughness: 0.96,
      metalness: 0,
    });
    const laneMaterial = new THREE.MeshStandardMaterial({
      color: 0x6f7780,
      roughness: 0.7,
      metalness: 0,
    });
    const cityTerrain = createProceduralCityTerrain();
    scene.add(cityTerrain);

    const sun = new THREE.DirectionalLight(0xffe3bd, 0.9);
    sun.position.copy(sunDirection).multiplyScalar(20);
    sun.target.position.set(0, 0.28, 0);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -11;
    sun.shadow.camera.right = 11;
    sun.shadow.camera.top = 11;
    sun.shadow.camera.bottom = -11;
    sun.shadow.camera.near = 0.1;
    sun.shadow.camera.far = 50;
    sun.shadow.normalBias = 0.002;
    scene.add(sun, sun.target);
    scene.add(new THREE.HemisphereLight(0xcadfff, 0x172030, 0.32));

    const sceneTarget = new THREE.WebGLRenderTarget(1, 1, {
      type: THREE.HalfFloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: true,
    });
    sceneTarget.depthTexture = new THREE.DepthTexture(
      1,
      1,
      THREE.UnsignedIntType,
    );

    const atmosphereMaterial =
      createAtmosphereAerialPerspectiveMaterial({
        ...atmosphereTextures,
        sunDirection,
        planetCenter: new THREE.Vector3(0, -6360, 0),
      });
    const postScene = new THREE.Scene();
    const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      atmosphereMaterial,
    );
    postScene.add(quad);

    return {
      resize({ bufferWidth, bufferHeight }) {
        sceneTarget.setSize(bufferWidth, bufferHeight);
      },
      setDebugMode(mode) {
        setAtmosphereDebugMode(atmosphereMaterial, mode);
      },
      update({ elapsed }) {
        const angle = Math.sin(elapsed * 0.02) * 0.03;
        sunDirection.set(-0.58, 0.66 + angle, -0.48).normalize();
        atmosphereMaterial.uniforms.uSunDirection.value.copy(sunDirection);
        sun.position.copy(sunDirection).multiplyScalar(20);
        clampCameraAboveGround();
      },
      render() {
        clampCameraAboveGround();
        renderer.setRenderTarget(sceneTarget);
        renderer.clear();
        renderer.render(scene, camera);
        updateAtmosphereCamera(atmosphereMaterial, camera, {
          sceneColor: sceneTarget.texture,
          sceneDepth: sceneTarget.depthTexture,
        });
        renderer.setRenderTarget(null);
        renderer.render(postScene, postCamera);
      },
      metrics() {
        return {
          tier: "256×128×32 scattering LUT / procedural city terrain / full-resolution aerial",
        };
      },
      dispose() {
        const geometries = new Set();
        const materials = new Set();
        cityTerrain.traverse((object) => {
          if (object.geometry) geometries.add(object.geometry);
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => materials.add(material));
            } else {
              materials.add(object.material);
            }
          }
        });
        scene.remove(cityTerrain);
        geometries.forEach((geometry) => geometry.dispose());
        materials.forEach((material) => material.dispose());
        sun.dispose();
        sceneTarget.dispose();
        quad.geometry.dispose();
        atmosphereMaterial.dispose();
        disposeTextures(atmosphereTextures);
      },
    };
  },
};
