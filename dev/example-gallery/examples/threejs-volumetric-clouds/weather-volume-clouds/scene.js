import {
  AerialPerspectiveEffect,
  CLOUD_SHAPE_DETAIL_TEXTURE_SIZE,
  CLOUD_SHAPE_TEXTURE_SIZE,
  CloudsEffect,
  DitheringEffect,
  EffectComposer,
  EffectPass,
  Ellipsoid,
  Geodetic,
  LensFlareEffect,
  NormalPass,
  PrecomputedTexturesLoader,
  RenderPass,
  STBNLoader,
  ToneMappingEffect,
  ToneMappingMode,
  createData3DTextureLoaderClass,
  getSunDirectionECEF,
  parseUint8Array,
  radians,
} from "/skills/threejs-volumetric-clouds/examples/weather-volume-clouds/cloud-effect.js";

const date = new Date("2000-06-01T10:00:00Z");
const geodetic = new Geodetic(0, radians(67), 500);
const position = geodetic.toECEF();
const up = Ellipsoid.WGS84.getSurfaceNormal(position);

export default {
  renderer: {
    options: {
      antialias: false,
      depth: false,
      logarithmicDepthBuffer: false,
    },
    toneMapping: 0,
    exposure: 10,
    clearColor: 0x000000,
  },
  camera: {
    fov: 75,
    near: 10,
    far: 1e6,
  },
  controls: {
    minDistance: 1e3,
    maxDistance: 2.5e5,
    enablePan: true,
  },

  async setup({ THREE, renderer, scene, camera, controls }) {
    camera.position.copy(position);
    camera.up.copy(up);
    camera.updateProjectionMatrix();

    if (controls) {
      controls.enableDamping = true;
      controls.minDistance = 1e3;
      controls.maxDistance = 2.5e5;
      controls.target.copy(position);
      controls.update();
    }

    renderer.toneMapping = THREE.NoToneMapping;
    renderer.toneMappingExposure = 10;

    const group = new THREE.Group();
    Ellipsoid.WGS84.getEastNorthUpFrame(position).decompose(
      group.position,
      group.quaternion,
      group.scale,
    );
    scene.add(group);

    const torusKnotGeometry = new THREE.TorusKnotGeometry(200, 60, 256, 64);
    torusKnotGeometry.computeVertexNormals();
    const torusKnot = new THREE.Mesh(
      torusKnotGeometry,
      new THREE.MeshBasicMaterial({ color: "white" }),
    );
    group.add(torusKnot);

    const aerialPerspective = new AerialPerspectiveEffect(camera);
    aerialPerspective.sky = true;
    aerialPerspective.sunIrradiance = true;
    aerialPerspective.skyIrradiance = true;

    const normalPass = new NormalPass(scene, camera);
    aerialPerspective.normalBuffer = normalPass.texture;

    const clouds = new CloudsEffect(camera);
    clouds.coverage = 0.4;
    clouds.localWeatherVelocity.set(0.001, 0);

    clouds.events.addEventListener("change", (event) => {
      if (event.property === "atmosphereOverlay") {
        aerialPerspective.overlay = clouds.atmosphereOverlay;
      } else if (event.property === "atmosphereShadow") {
        aerialPerspective.shadow = clouds.atmosphereShadow;
      } else if (event.property === "atmosphereShadowLength") {
        aerialPerspective.shadowLength = clouds.atmosphereShadowLength;
      }
    });

    const sunDirection = new THREE.Vector3();
    getSunDirectionECEF(date, sunDirection);
    aerialPerspective.sunDirection.copy(sunDirection);
    clouds.sunDirection.copy(sunDirection);

    const composer = new EffectComposer(renderer, {
      frameBufferType: THREE.HalfFloatType,
      multisampling: 0,
    });
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(normalPass);
    composer.addPass(new EffectPass(camera, clouds, aerialPerspective));
    composer.addPass(
      new EffectPass(
        camera,
        new LensFlareEffect(),
        new ToneMappingEffect({ mode: ToneMappingMode.AGX }),
        new DitheringEffect(),
      ),
    );

    const [
      precomputedTextures,
      localWeatherTexture,
      shapeTexture,
      shapeDetailTexture,
      turbulenceTexture,
      stbnTexture,
    ] = await Promise.all([
      loadPrecomputedAtmosphere(renderer),
      loadLocalWeather(THREE),
      loadShapeTexture(THREE),
      loadShapeDetailTexture(THREE),
      loadTurbulence(THREE),
      loadSTBNTexture(),
    ]);

    Object.assign(aerialPerspective, precomputedTextures);
    Object.assign(clouds, precomputedTextures);
    clouds.localWeatherTexture = localWeatherTexture;
    clouds.shapeTexture = shapeTexture;
    clouds.shapeDetailTexture = shapeDetailTexture;
    clouds.turbulenceTexture = turbulenceTexture;
    aerialPerspective.stbnTexture = stbnTexture;
    clouds.stbnTexture = stbnTexture;

    function applyDebugMode(modeName) {
      clouds.coverage = modeName === "atmosphere-only" ? 0 : 0.4;
      clouds.temporalUpscale = modeName !== "native-resolution";
      clouds.shapeDetail = modeName !== "no-detail";
      clouds.turbulence = modeName !== "no-turbulence";
      aerialPerspective.sky = modeName !== "clouds-only";
      aerialPerspective.sunIrradiance = modeName !== "clouds-only";
      aerialPerspective.skyIrradiance = modeName !== "clouds-only";
      aerialPerspective.transmittance = modeName !== "clouds-only";
      aerialPerspective.inscatter = modeName !== "clouds-only";
    }

    applyDebugMode("final");

    return {
      setDebugMode(modeName) {
        applyDebugMode(modeName);
      },
      resize({ width, height }) {
        composer.setSize(width, height);
      },
      render() {
        composer.render();
      },
      metrics() {
        const scale = clouds.temporalUpscale ? "temporal upscale" : "native";
        return {
          tier:
            `${CLOUD_SHAPE_TEXTURE_SIZE}^3 shape / ` +
            `${CLOUD_SHAPE_DETAIL_TEXTURE_SIZE}^3 detail / ${scale}`,
        };
      },
      dispose() {
        composer.dispose();
        torusKnot.geometry.dispose();
        torusKnot.material.dispose();
        localWeatherTexture.dispose();
        shapeTexture.dispose();
        shapeDetailTexture.dispose();
        turbulenceTexture.dispose();
        stbnTexture.dispose();
        for (const texture of Object.values(precomputedTextures)) {
          texture.dispose();
        }
      },
    };
  },
};

function loadPrecomputedAtmosphere(renderer) {
  return new Promise((resolve, reject) => {
    new PrecomputedTexturesLoader().load(
      "/skills/threejs-volumetric-clouds/assets/weather-volume-clouds/atmosphere",
      resolve,
      undefined,
      reject,
    );
  });
}

function loadLocalWeather(THREE) {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(
      "/skills/threejs-volumetric-clouds/assets/weather-volume-clouds/local_weather.png",
      (texture) => {
        texture.minFilter = THREE.LinearMipMapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.colorSpace = THREE.NoColorSpace;
        texture.needsUpdate = true;
        resolve(texture);
      },
      undefined,
      reject,
    );
  });
}

function loadShapeTexture(THREE) {
  return new Promise((resolve, reject) => {
    const Loader = createData3DTextureLoaderClass(parseUint8Array, {
      width: CLOUD_SHAPE_TEXTURE_SIZE,
      height: CLOUD_SHAPE_TEXTURE_SIZE,
      depth: CLOUD_SHAPE_TEXTURE_SIZE,
    });
    new Loader().load(
      "/skills/threejs-volumetric-clouds/assets/weather-volume-clouds/shape.bin",
      (texture) => {
        texture.format = THREE.RedFormat;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.wrapR = THREE.RepeatWrapping;
        texture.colorSpace = THREE.NoColorSpace;
        texture.needsUpdate = true;
        resolve(texture);
      },
      undefined,
      reject,
    );
  });
}

function loadShapeDetailTexture(THREE) {
  return new Promise((resolve, reject) => {
    const Loader = createData3DTextureLoaderClass(parseUint8Array, {
      width: CLOUD_SHAPE_DETAIL_TEXTURE_SIZE,
      height: CLOUD_SHAPE_DETAIL_TEXTURE_SIZE,
      depth: CLOUD_SHAPE_DETAIL_TEXTURE_SIZE,
    });
    new Loader().load(
      "/skills/threejs-volumetric-clouds/assets/weather-volume-clouds/shape_detail.bin",
      (texture) => {
        texture.format = THREE.RedFormat;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.wrapR = THREE.RepeatWrapping;
        texture.colorSpace = THREE.NoColorSpace;
        texture.needsUpdate = true;
        resolve(texture);
      },
      undefined,
      reject,
    );
  });
}

function loadTurbulence(THREE) {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(
      "/skills/threejs-volumetric-clouds/assets/weather-volume-clouds/turbulence.png",
      (texture) => {
        texture.minFilter = THREE.LinearMipMapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.colorSpace = THREE.NoColorSpace;
        texture.needsUpdate = true;
        resolve(texture);
      },
      undefined,
      reject,
    );
  });
}

function loadSTBNTexture() {
  return new Promise((resolve, reject) => {
    new STBNLoader().load(
      "/skills/threejs-volumetric-clouds/assets/weather-volume-clouds/stbn.bin",
      resolve,
      undefined,
      reject,
    );
  });
}
