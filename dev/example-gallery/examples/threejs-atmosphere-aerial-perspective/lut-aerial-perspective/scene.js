import {
  AerialPerspectiveEffect,
  DitheringEffect,
  EffectComposer,
  EffectPass,
  Ellipsoid,
  Geodetic,
  LensFlareEffect,
  PrecomputedTexturesLoader,
  RenderPass,
  SkyLightProbe,
  SkyMaterial,
  SunDirectionalLight,
  ToneMappingEffect,
  ToneMappingMode,
  getMoonDirectionECEF,
  getSunDirectionECEF,
  radians,
} from "/skills/threejs-atmosphere-aerial-perspective/examples/lut-aerial-perspective/atmosphere-effect.js";

const moduleStartTime = performance.now();
const referenceDate = new Date("2000-06-01T10:00:00Z");
const geodetic = new Geodetic(0, radians(67), 1000);
const position = geodetic.toECEF();
const up = Ellipsoid.WGS84.getSurfaceNormal(position);

export default {
  renderer: {
    options: {
      antialias: true,
      depth: false,
      logarithmicDepthBuffer: true,
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
    const sunDirection = new THREE.Vector3();
    const moonDirection = new THREE.Vector3();

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
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const skyMaterial = new SkyMaterial();
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), skyMaterial);
    sky.frustumCulled = false;
    scene.add(sky);

    const skyLight = new SkyLightProbe();
    skyLight.position.copy(position);
    scene.add(skyLight);

    const sunLight = new SunDirectionalLight({ distance: 300 });
    sunLight.target.position.copy(position);
    sunLight.castShadow = true;
    sunLight.shadow.camera.top = 300;
    sunLight.shadow.camera.bottom = -300;
    sunLight.shadow.camera.left = -300;
    sunLight.shadow.camera.right = 300;
    sunLight.shadow.camera.near = 0;
    sunLight.shadow.camera.far = 600;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.normalBias = 1;
    scene.add(sunLight, sunLight.target);

    const group = new THREE.Group();
    Ellipsoid.WGS84.getEastNorthUpFrame(position).decompose(
      group.position,
      group.quaternion,
      group.scale,
    );

    const torusKnot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(200, 60, 256, 64),
      new THREE.MeshPhysicalMaterial({
        color: "white",
        roughness: 0.5,
        ior: 1.45,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
      }),
    );
    torusKnot.castShadow = true;
    torusKnot.receiveShadow = true;
    group.add(torusKnot);
    scene.add(group);

    const aerialPerspective = new AerialPerspectiveEffect(camera);
    const composer = new EffectComposer(renderer, {
      frameBufferType: THREE.HalfFloatType,
      multisampling: 8,
    });
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new EffectPass(camera, aerialPerspective));
    composer.addPass(
      new EffectPass(
        camera,
        new LensFlareEffect(),
        new ToneMappingEffect({ mode: ToneMappingMode.AGX }),
        new DitheringEffect(),
      ),
    );

    const textures = await new Promise((resolve, reject) => {
      new PrecomputedTexturesLoader()
        .setTypeFromRenderer(renderer)
        .load(
          "/skills/threejs-atmosphere-aerial-perspective/assets/lut-aerial-perspective",
          resolve,
          undefined,
          reject,
        );
    });

    Object.assign(skyMaterial, textures);
    sunLight.transmittanceTexture = textures.transmittanceTexture;
    skyLight.irradianceTexture = textures.irradianceTexture;
    Object.assign(aerialPerspective, textures);

    function updateAtmosphere(elapsed) {
      const date = +referenceDate + ((elapsed * 5e6) % 864e5);
      getSunDirectionECEF(date, sunDirection);
      getMoonDirectionECEF(date, moonDirection);

      skyMaterial.sunDirection.copy(sunDirection);
      skyMaterial.moonDirection.copy(moonDirection);
      sunLight.sunDirection.copy(sunDirection);
      skyLight.sunDirection.copy(sunDirection);
      aerialPerspective.sunDirection.copy(sunDirection);

      sunLight.update();
      skyLight.update();
    }

    updateAtmosphere(0);

    return {
      setDebugMode(modeName) {
        aerialPerspective.transmittance =
          modeName === "final" || modeName === "transmittance";
        aerialPerspective.inscatter =
          modeName === "final" || modeName === "inscatter";
        aerialPerspective.sun =
          modeName === "final" || modeName === "sun-disc";
        aerialPerspective.sky = modeName !== "no-aerial-perspective";
      },
      resize({ width, height }) {
        composer.setSize(width, height);
      },
      update() {
        updateAtmosphere((performance.now() - moduleStartTime) * 0.001);
      },
      render() {
        composer.render();
      },
      metrics() {
        return {
          tier: "SkyMaterial + SunDirectionalLight + AerialPerspectiveEffect",
        };
      },
      dispose() {
        composer.dispose();
        sky.geometry.dispose();
        skyMaterial.dispose();
        torusKnot.geometry.dispose();
        torusKnot.material.dispose();
      },
    };
  },
};
